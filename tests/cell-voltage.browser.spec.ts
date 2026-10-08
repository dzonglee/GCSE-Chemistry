import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { voltageJourney as journey } from "../src/content/journeys/cell-voltage";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import {
  voltageRecords,
  voltageOptions,
  initialVoltageBoard,
} from "../src/lib/cell-voltage";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".voltage-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function capture(page: Page, path: string) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}

const route = "/lessons/interpreting-cell-voltages";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/interpreting-cell-voltages");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    for (let i = 0; i < 5; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = journey.checkForms[form][i];
      await answer(page, q);
      if (i === 0 && !q.options) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/interpreting-cell-voltages-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "interpreting-cell-voltages"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false); // Conservative exposure includes the opening supplied matrix and shared subtraction.
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("region", { name: "Task model", exact: true }),
      ).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
    ).toBeVisible();
    if (form === 0)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["interpreting-cell-voltages"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["interpreting-cell-voltages"].run.submitted =
        Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.reviewForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});

test("all original practice works while three written explanations remain self-reviewed", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("Compare your explanation");
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "interpreting-cell-voltages"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
  }
});
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
const labels: Record<string, string> = {
  row: "Your selected metal1 row",
  column: "Your selected metal2 column",
  volts: "Your predicted signed reading / V",
  magnitude: "Your predicted magnitude / V",
  moreActive: "Your more reactive electrode",
  red: "Your red positive meter lead",
  black: "Your black COM meter lead",
  electronFrom: "Your discharge electron source",
  electronTo: "Your discharge electron destination",
  firstLevel: "Your first reference reading / V",
  secondLevel: "Your second reference reading / V",
  operation: "Your comparison operation",
  rank1: "Your most reactive metal",
  rank2: "Your second metal",
  rank3: "Your third metal",
  rank4: "Your fourth metal",
  rank5: "Your least reactive metal",
  claim: "Your supported claim",
  reason: "Your supporting reason",
};
for (const [mode, n] of [
  ["read", 1],
  ["lead", 2],
  ["infer", 3],
  ["rank", 4],
  ["evidence", 5],
] as const)
  test(`${mode}: every supplied comparison preserves wrong predictions and independently reaches its required state`, async ({
    page,
  }, info) => {
    await learn(page, n);
    for (const key of Object.keys(voltageRecords[mode])) {
      if (key !== "initial") {
        await page
          .getByText("Choose another supplied case", { exact: true })
          .click();
        await page
          .getByLabel("Supplied voltage comparison", { exact: true })
          .selectOption(key);
        await page
          .getByText("Choose another supplied case", { exact: true })
          .click();
      }
      await check(page, false);
      const b = initialVoltageBoard(mode, key),
        r = voltageRecords[mode][key as never] as Record<string, unknown>;
      for (const field of Object.keys(b)) {
        if (field === "record") continue;
        const value = String(r[field]);
        if (voltageOptions[mode][field])
          await page
            .getByLabel(labels[field], { exact: true })
            .selectOption(value);
        else await page.getByLabel(labels[field], { exact: true }).fill(value);
      }
      await check(page, true);
      if (key === "initial")
        await capture(
          page,
          `docs/qa/interpreting-cell-voltages-${info.project.name}-${mode}.png`,
        );
    }
  });
test("wrong signed input survives reload; invalid fractions stay visible; undo and reset retain canonical state", async ({
  page,
}) => {
  await learn(page, 3);
  const field = page.getByLabel(labels.firstLevel, { exact: true });
  await field.fill("-1.4");
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("-1.4");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("0");
  await field.fill("1/2");
  await expect(field).toHaveValue("1/2");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(field).toHaveValue("0");
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("0");
});
test("reference markers support actual keyboard and pointer movement without supplying the target difference", async ({
  page,
}) => {
  await learn(page, 3);
  const graph = page.getByRole("group", {
    name: "Place your relative comparison markers",
  });
  await graph.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel(labels.firstLevel, { exact: true })).toHaveValue(
    "0.1",
  );
  await page
    .getByLabel("Marker to move", { exact: true })
    .selectOption("secondLevel");
  await graph.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByLabel(labels.secondLevel, { exact: true }),
  ).toHaveValue("-0.1");
  await expect(page.getByLabel(labels.volts, { exact: true })).toHaveValue("0");
  const box = await graph.boundingBox();
  if (!box) throw Error("missing graph");
  await graph.click({ position: { x: box.width * 0.5, y: box.height * 0.58 } });
  await expect(
    page.getByLabel(labels.secondLevel, { exact: true }),
  ).toHaveValue("0.5");
  await page.getByLabel(labels.firstLevel, { exact: true }).fill("9");
  await expect(page.getByLabel(labels.firstLevel, { exact: true })).toHaveValue(
    "9",
  );
  await expect(page.locator(".voltage-reference-line")).toContainText(
    "outside",
  );
});
test("opening task has a complete accessible 44px control within the mobile viewport", async ({
  page,
}, info) => {
  await learn(page, 1);
  const field = page.getByLabel(labels.row, { exact: true }),
    box = await field.boundingBox();
  if (!box) throw Error("missing opening control");
  expect(box.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box.y + box.height).toBeLessThanOrEqual(664);
  await capture(
    page,
    `docs/qa/interpreting-cell-voltages-${info.project.name}-opening.png`,
  );
});
test("same-plate apparatus preserves the separate discharge circuit and exports actual 3D", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 12);
  await page
    .getByRole("button", { name: "Use the model for support", exact: true })
    .click();
  await page.getByLabel(labels.red, { exact: true }).selectOption("metal1");
  await page.getByLabel(labels.black, { exact: true }).selectOption("metal1");
  await page
    .getByLabel(labels.moreActive, { exact: true })
    .selectOption("metal1");
  await page
    .getByLabel(labels.electronFrom, { exact: true })
    .selectOption("metal1");
  await page
    .getByLabel(labels.electronTo, { exact: true })
    .selectOption("metal2");
  await page
    .getByText("Inspect your meter wiring in actual 3D", { exact: true })
    .click();
  await check(page, true);
  const figure = page.locator(".voltage-cell-asset");
  await expect(figure.locator("canvas")).toBeVisible();
  const rotation = page.getByRole("group", {
    name: "Rotate signed-cell measurement apparatus",
    exact: true,
  });
  await rotation.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rotation).toHaveAttribute("data-rotation", "0.1");
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(rotation).toHaveAttribute("data-rotation", "0");
  await expect(
    page.getByRole("button", {
      name: "Download actual 3D apparatus",
      exact: true,
    }),
  ).toBeEnabled();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  await (
    await downloaded
  ).saveAs(
    `docs/qa/interpreting-cell-voltages-${info.project.name}-same-plate.glb`,
  );
  await capture(
    page,
    `docs/qa/interpreting-cell-voltages-${info.project.name}-same-plate.png`,
  );
  const style = await page.addStyleTag({
    content: ".mobile-bar,.skip-link{display:none!important}",
  });
  await figure.screenshot({
    path: `docs/qa/interpreting-cell-voltages-${info.project.name}-enlarged3d.png`,
  });
  await style.evaluate((el) => el.parentNode?.removeChild(el));
});
test("a retained wrong sign returns through its own recovery without losing the answer draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("0.4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: journey.refresher.find((q) => q.id === "cv-v1-r-sign")!.title,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "0.4",
  );
});
test("WebGL failure retains a text wiring interpretation and working numerical predictions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.includes("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await learn(page, 2);
  await page
    .getByText("Inspect your meter wiring in actual 3D", { exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel(labels.red, { exact: true })).toBeEnabled();
  await page.getByLabel(labels.volts, { exact: true }).fill("0.7");
  await expect(page.getByLabel(labels.volts, { exact: true })).toHaveValue(
    "0.7",
  );
  await expect(
    page.getByRole("button", {
      name: "Download actual 3D apparatus",
      exact: true,
    }),
  ).toHaveCount(0);
});
