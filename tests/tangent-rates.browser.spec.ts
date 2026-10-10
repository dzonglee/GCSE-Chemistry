import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tangentJourney as journey } from "../src/content/journeys/tangent-rates";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import {
  tangentRecords,
  tangentOptions,
  tangentNumbers,
  type TangentMode,
} from "../src/lib/tangent-rates";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".tangent-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
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
async function captureProse(page: Page, path: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path, fullPage: true, scale: "css" });
}
async function draw(page: Page, unit: string, coords: readonly number[]) {
  for (let i = 0; i < 2; i++) {
    await page
      .getByLabel("Tangent endpoint to edit", { exact: true })
      .selectOption(String(i));
    await page
      .getByLabel(`Your tangent endpoint ${i + 1} time / s`, { exact: true })
      .fill(String(coords[i * 2]));
    await page
      .getByLabel(`Your tangent endpoint ${i + 1} quantity / ${unit}`, {
        exact: true,
      })
      .fill(String(coords[i * 2 + 1]));
  }
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.tangentDrawing) {
    await draw(
      page,
      q.tangentDrawing.curve.unit,
      q.id.endsWith("A-draw")
        ? [10, 20, 30, 44]
        : q.id.endsWith("p-draw-remaining")
          ? [10, 4, 30, 2]
          : [10, 25, 30, 55],
    );
    return;
  }
  if (q.rubric) {
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
    return;
  }
  if (q.options) {
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
    return;
  }
  await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
const route = "/lessons/rates-from-tangents";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/rates-from-tangents");
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
          "docs/qa/rates-from-tangents-" +
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
                  "rates-from-tangents"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false); // The opening interval model conservatively exposes the shared interval procedure.
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
    if (form === 0) {
      const row = page.locator(".results-list > details").nth(2);
      await row.locator(":scope > summary").click();
      await expect(row).toContainText("Magnitude 30 points/30 s=1 point/s");
      await captureProse(
        page,
        `docs/qa/tangents-prose/${info.project.name}-reserved-calibration.png`,
      );
      await row.locator(":scope > summary").click();
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
    }
  }
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["rates-from-tangents"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["rates-from-tangents"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while written and drawn responses remain self-reviewed", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    if (q.tangentDrawing)
      await capture(
        page,
        `docs/qa/rates-from-tangents-${info.project.name}-${q.id}-practice-tangent.png`,
      );
    await page
      .getByRole("button", {
        name: q.tangentDrawing
          ? "Save and review tangent"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText(
        q.tangentDrawing ? "Compare your tangent" : "Compare your explanation",
      );
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "rates-from-tangents"
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
const modeTasks: Record<TangentMode, number> = {
  construct: 1,
  gradient: 2,
  moles: 3,
  calibration: 4,
  evidence: 5,
};
const endpoints: Record<string, readonly number[]> = {
  initial: [10, 25, 30, 55],
  early: [0, 2.5, 20, 42.5],
  late: [20, 42.5, 35, 57.5],
  mass: [10, 1.2, 30, 2.8],
  consumption: [10, 4, 30, 2],
  flat: [20, 40, 40, 40],
};
const words: Record<string, string> = {
  dx: "Your horizontal difference / s",
  dy: "Your signed vertical difference",
  slope: "Your signed gradient",
  rate: "Your positive chemical rate",
  kind: "Your quantity interpretation",
  unit: "Your final rate unit",
  moles: "Your amount changed / mol",
  seconds: "Your elapsed time / s",
  conversion: "Your amount conversion",
  operation: "Your calibration operation",
  claim: "Your supported claim",
  reason: "Your reason",
};
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
async function predict(page: Page, mode: TangentMode, key: string) {
  const r = (
    tangentRecords[mode] as unknown as Record<string, Record<string, unknown>>
  )[key];
  if (mode === "construct") {
    const c = r.curve as { unit: string },
      coords = endpoints[key];
    await draw(page, c.unit, coords);
    await page
      .getByLabel(`Your signed gradient / ${c.unit}/s`, { exact: true })
      .fill(
        String(
          Number(
            ((coords[3] - coords[1]) / (coords[2] - coords[0])).toFixed(10),
          ),
        ),
      );
    await page
      .getByLabel(words.kind, { exact: true })
      .selectOption(String(r.kind));
    return;
  }
  for (const k of [
    ...tangentNumbers[mode],
    ...Object.keys(tangentOptions[mode]).filter((k) => k !== "record"),
  ]) {
    let label = words[k];
    if (k === "dy") label += " / " + (r.axisUnit ?? "percentage-points");
    if (k === "slope")
      label +=
        " / " + (mode === "gradient" ? r.axisUnit : "percentage-points") + "/s";
    if (k === "rate")
      label +=
        " / " + (mode === "moles" || mode === "calibration" ? "mol/s" : r.unit);
    const value = mode === "moles" && k === "unit" ? "mol/s" : String(r[k]);
    if (tangentOptions[mode][k])
      await page.getByLabel(label, { exact: true }).selectOption(value);
    else await page.getByLabel(label, { exact: true }).fill(value);
  }
}
for (const mode of Object.keys(modeTasks) as TangentMode[])
  test(`${mode}: each supplied case retains predictions and requires its distinct scientific steps`, async ({
    page,
  }, info) => {
    await learn(page, modeTasks[mode]);
    await page
      .getByText("Choose another supplied case", { exact: true })
      .click();
    for (const key of Object.keys(tangentRecords[mode])) {
      await page
        .getByLabel("Supplied tangent case", { exact: true })
        .selectOption(key);
      await predict(page, mode, key);
      await check(page, true);
      if (key === "initial")
        await capture(
          page,
          `docs/qa/rates-from-tangents-${info.project.name}-${mode}.png`,
        );
      if (key === "initial" && ["construct", "calibration"].includes(mode))
        await captureProse(
          page,
          `docs/qa/tangents-prose/${info.project.name}-${mode}.png`,
        );
    }
  });
test("wrong signed triangle is retained after reload and targeted undo; invalid decimal blocks checking", async ({
  page,
}) => {
  await learn(page, 2);
  await predict(page, "gradient", "initial");
  await page
    .getByLabel("Your horizontal difference / s", { exact: true })
    .fill("30");
  await check(page, false);
  await expect(page.locator(".tangent-workbench .feedback")).toContainText(
    "Subtract",
  );
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your horizontal difference / s", { exact: true }),
  ).toHaveValue("30");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your horizontal difference / s", { exact: true }),
  ).toHaveValue("20");
  await page
    .getByLabel("Your horizontal difference / s", { exact: true })
    .fill("1/2");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByLabel("Your horizontal difference / s", { exact: true }),
  ).toHaveValue("1/2");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your horizontal difference / s", { exact: true }),
  ).toHaveValue("0");
});
test("the opening shows a complete 44px coordinate within the unchanged mobile learning viewport", async ({
  page,
}, info) => {
  await learn(page, 1);
  await page.evaluate(() => scrollTo(0, 0));
  const input = page.getByLabel("Your tangent endpoint 1 time / s", {
    exact: true,
  });
  const box = await input.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await capture(
    page,
    `docs/qa/rates-from-tangents-${info.project.name}-opening.png`,
  );
});
test("independent tangent drafts reload including invalid coordinates; clear removes displayed endpoints and locked answers get no premature grade", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 4; i++)
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  await answer(page, journey.checkForms[0][4]);
  await saved(page);
  await page.reload();
  await page
    .getByLabel("Tangent endpoint to edit", { exact: true })
    .selectOption("0");
  const input = page.getByLabel("Your tangent endpoint 1 time / s", {
    exact: true,
  });
  await expect(input).toHaveValue("10");
  await input.fill("1/2");
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("1/2");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Your invalid coordinate is retained" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Clear your tangent construction",
      exact: true,
    })
    .click();
  await expect(input).toHaveValue("");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Your invalid coordinate is retained" }),
  ).toHaveCount(0);
  await answer(page, journey.checkForms[0][4]);
  await capture(
    page,
    `docs/qa/rates-from-tangents-${info.project.name}-independent-drawing.png`,
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(
    page.getByLabel("Tangent endpoint to edit", { exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
});
test("actual tangent markers support keyboard and pointer placement with a canonical two-field history", async ({
  page,
}) => {
  await learn(page, 1);
  const svg = page.getByRole("group", {
    name: "Place your selected tangent endpoint",
    exact: true,
  });
  await svg.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Your tangent endpoint 1 time / s", { exact: true }),
  ).toHaveValue("0.4");
  await saved(page);
  const before = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["rates-from-tangents"]
        .taskModels["tr-v1-g-construct"].length,
    STORAGE_KEY,
  );
  const bounds = await svg.boundingBox();
  await svg.click({
    position: {
      x: (bounds!.width * 260) / 500,
      y: (bounds!.height * 150) / 330,
    },
  });
  await saved(page);
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["rates-from-tangents"]
            .taskModels["tr-v1-g-construct"].length,
        STORAGE_KEY,
      ),
    )
    .toBe(before + 2);
  await page.reload();
  await expect(
    page.getByLabel("Your tangent endpoint 1 time / s", { exact: true }),
  ).not.toHaveValue("0.4");
  await page
    .getByLabel("Your tangent endpoint 1 quantity / cm³", { exact: true })
    .fill("1/2");
  await page
    .getByLabel("Tangent endpoint to edit", { exact: true })
    .selectOption("1");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
});
test("wrong calibration operation and extra percentage conversion remain visible before repair", async ({
  page,
}) => {
  await learn(page, 4);
  await predict(page, "calibration", "initial");
  await page
    .getByLabel("Your positive chemical rate / mol/s", { exact: true })
    .fill("0.00000071");
  await check(page, false);
  await expect(page.locator(".tangent-workbench .feedback")).toContainText(
    "Do not divide",
  );
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your positive chemical rate / mol/s", { exact: true }),
  ).toHaveValue("0.00000071");
  await page
    .getByLabel("Your positive chemical rate / mol/s", { exact: true })
    .fill("0.000071");
  await page
    .getByLabel("Your calibration operation", { exact: true })
    .selectOption("magnitude-divided-by-calibration");
  await check(page, false);
  await page
    .getByLabel("Your calibration operation", { exact: true })
    .selectOption("magnitude-times-calibration");
  await check(page, true);
});
test("wrong shallow-rate answer returns from targeted percentage-point recovery with the original draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex(
    (q) => q.id === "tr-v1-p-shallow-calibration",
  );
  await task(page, index + 1);
  await page.getByLabel("Your answer", { exact: true }).fill("0.0000001775");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: journey.refresher.find((q) => q.id === "tr-v1-r-percent-point")!
        .title!,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "0.0000001775",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "0.0000001775",
  );
});
