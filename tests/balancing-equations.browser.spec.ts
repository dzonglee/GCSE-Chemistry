import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { balancingJourney as journey } from "../src/content/journeys/balancing-equations";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) {
    await picker.selectOption(String(n - 1));
    return;
  }
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".balancing-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/balancing-equations", { recursive: true });
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
  if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(
        q.writtenEquations
          ? "Your equations"
          : q.rubric
            ? "Your explanation"
            : "Your answer",
        {
          exact: true,
        },
      )
      .fill(q.answer);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}

async function coefficients(page: Page, formulas: string[], values: string[]) {
  for (let i = 0; i < formulas.length; i++)
    await page
      .getByLabel(`Coefficient of ${formulas[i]}`, { exact: true })
      .selectOption(values[i]);
}
test("complete-formula coefficients retain wrong counts and distinguish balanced multiples", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-equations");
  const choice = page.getByLabel("Reaction to balance", { exact: true }),
    box = await choice.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await coefficients(page, ["H₂", "O₂", "H₂O"], ["2", "1", "1"]);
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Coefficient of H₂O", { exact: true }),
  ).toHaveValue("1");
  await coefficients(page, ["H₂", "O₂", "H₂O"], ["2", "1", "2"]);
  await check(page, true);
  await expect(page.locator('[data-balance-element="H"]')).toHaveAttribute(
    "data-left-count",
    "4",
  );
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-right-count",
    "2",
  );
  await capture(
    page,
    `test-results/qa/balancing-equations/balancing-${info.project.name}-ledger.png`,
  );
  await coefficients(page, ["H₂", "O₂", "H₂O"], ["4", "2", "4"]);
  await check(page, true);
  await expect(page.locator(".balancing-workbench .feedback")).toContainText(
    "divide every coefficient by 2",
  );
  await choice.selectOption("aluminium");
  await coefficients(page, ["Al", "O₂", "Al₂O₃"], ["4", "3", "2"]);
  await check(page, true);
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-left-count",
    "6",
  );
});
test("actual three-dimensional complete molecules conserve elements and export the rendered collection", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-equations");
  await task(page, 2);
  await coefficients(page, ["CH₄", "O₂", "CO₂", "H₂O"], ["1", "1", "1", "2"]);
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Coefficient of O₂", { exact: true }),
  ).toHaveValue("1");
  await coefficients(page, ["CH₄", "O₂", "CO₂", "H₂O"], ["1", "2", "1", "2"]);
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate reaction amounts",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", "0");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download reaction as GLB", exact: true })
    .click();
  const download = await pending,
    path = `test-results/qa/balancing-equations/balancing-reaction-${info.project.name}.glb`;
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  const nodes = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  ).nodes as { name?: string }[];
  const totals: Record<string, Record<string, number>> = {
    reactant: {},
    product: {},
  };
  for (const node of nodes) {
    const m = node.name?.match(/^(reactant|product)-.*-atom-\d+-(C|H|O)$/);
    if (m) totals[m[1]][m[2]] = (totals[m[1]][m[2]] ?? 0) + 1;
  }
  expect(totals.reactant).toEqual({ C: 1, H: 4, O: 4 });
  expect(totals.product).toEqual({ C: 1, O: 4, H: 4 });
  await capture(
    page,
    `test-results/qa/balancing-equations/balancing-${info.project.name}-molecules.png`,
  );
  await page.locator(".reaction-amounts-canvas").screenshot({
    path: `test-results/qa/balancing-equations/balancing-reaction-${info.project.name}.png`,
  });
});
test("fractional ethane intermediate conserves counts and requires whole-equation scaling", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-equations");
  await task(page, 2);
  await page
    .getByLabel("Reaction to balance", { exact: true })
    .selectOption("ethane");
  await coefficients(
    page,
    ["C₂H₆", "O₂", "CO₂", "H₂O"],
    ["1", "3.5", "2", "3"],
  );
  await check(page, false);
  await expect(page.locator(".balancing-workbench .feedback")).toContainText(
    "atom counts balance",
  );
  await page.reload();
  await expect(
    page.getByLabel("Coefficient of O₂", { exact: true }),
  ).toHaveValue("3.5");
  await coefficients(page, ["C₂H₆", "O₂", "CO₂", "H₂O"], ["2", "7", "4", "6"]);
  await check(page, true);
  await capture(
    page,
    `test-results/qa/balancing-equations/balancing-${info.project.name}-fraction.png`,
  );
});
test("atom-balanced peroxide cannot replace the specified water product", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-equations");
  await task(page, 3);
  await page
    .getByLabel("Why restore the specified formula?", { exact: true })
    .selectOption("counts");
  await check(page, false);
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-left-count",
    "2",
  );
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-right-count",
    "2",
  );
  await page.reload();
  await expect(
    page.getByLabel("Why restore the specified formula?", { exact: true }),
  ).toHaveValue("counts");
  await page
    .getByLabel("Specified water product formula", { exact: true })
    .selectOption("H2O");
  await page
    .getByLabel("Why restore the specified formula?", { exact: true })
    .selectOption("identity");
  await check(page, true);
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-right-count",
    "1",
  );
  await expect(page.locator(".balancing-workbench .feedback")).toContainText(
    "still unbalanced",
  );
  await capture(
    page,
    `test-results/qa/balancing-equations/balancing-${info.project.name}-identity.png`,
  );
});
test("word-to-symbol construction requires correct formulas as well as conserved counts", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-equations");
  await task(page, 4);
  await page
    .getByLabel("Potassium hydroxide formula", { exact: true })
    .selectOption("KO");
  await page
    .getByLabel("Hydrogen gas formula", { exact: true })
    .selectOption("H2");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Potassium hydroxide formula", { exact: true }),
  ).toHaveValue("KO");
  await page
    .getByLabel("Potassium hydroxide formula", { exact: true })
    .selectOption("KOH");
  await coefficients(page, ["K", "H₂O", "KOH", "H₂"], ["2", "2", "2", "1"]);
  await check(page, true);
  await capture(
    page,
    `test-results/qa/balancing-equations/balancing-${info.project.name}-words.png`,
  );
});
test("all twenty-five practice demands distinguish coefficient construction and complete writing", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-equations");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.writtenEquations
          ? "Save and review equations"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.writtenEquations
        ? "Compare your equations"
        : q.rubric
          ? "Compare your explanation"
          : "That’s right",
    );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "balancing-equations"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "be-v1-p-methane")
      await capture(
        page,
        `test-results/qa/balancing-equations/balancing-${info.project.name}-independent.png`,
      );
  }
});
test("unavailable WebGL retains labelled molecular amounts and wrong oxygen coefficients", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.call(this, type as never, ...(args as []));
    } as typeof original;
  });
  await page.goto("/lessons/balancing-equations");
  await task(page, 2);
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await coefficients(page, ["CH₄", "O₂", "CO₂", "H₂O"], ["1", "1", "1", "2"]);
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Coefficient of O₂", { exact: true }),
  ).toHaveValue("1");
  await expect(page.locator('[data-molecule-formula="H2O"]')).toHaveAttribute(
    "data-molecule-amount",
    "2",
  );
  await capture(
    page,
    `test-results/qa/balancing-equations/balancing-${info.project.name}-fallback.png`,
  );
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/balancing-equations");
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
      if (i === 0) {
        await saved(page);
        await page.reload();
        for (const part of q.parts ?? [])
          await expect(
            page.getByLabel(part.label, { exact: true }),
          ).toHaveValue(JSON.parse(q.answer)[part.id]);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "balancing-equations"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(true);
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
      page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
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
      for (const run of p.work["balancing-equations"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["balancing-equations"].run.submitted = Date.now() - delay - 1000;
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
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
test("incorrect full-equation draft survives targeted ratio recovery", async ({
  page,
}) => {
  await page.goto("/lessons/balancing-equations");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 6);
  for (const [label, value] of [
    ["Coefficient of C₂H₆", "1"],
    ["Coefficient of O₂", "3.5"],
    ["Coefficient of CO₂", "2"],
    ["Coefficient of H₂O", "3"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Scale the complete ratio",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByLabel("Coefficient of O₂", { exact: true }),
  ).toHaveValue("3.5");
  await expect(
    page.getByLabel("Coefficient of C₂H₆", { exact: true }),
  ).toHaveValue("1");
});
