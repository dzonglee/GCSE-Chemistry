import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { naturalJourney as j } from "../src/content/journeys/natural-journey";
import {
  naturalRecords,
  expectedNaturalBoard,
  checkNaturalBoard,
  type NaturalMode,
} from "../src/lib/natural";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/natural-polymers";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(page: Page, index: number) {
  const select = page.getByLabel("Choose a practice task", { exact: true });
  if (await select.count()) await select.selectOption(String(index));
  else
    await page
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
}
async function model(page: Page, mode: NaturalMode) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(
    page,
    j.guided.findIndex(
      (q) => q.model?.kind === "natural-polymers" && q.model.mode === mode,
    ),
  );
  return page.getByRole("region", { name: "Task model", exact: true });
}
async function fill(
  root: Locator,
  mode: NaturalMode,
  record: string,
  drawing = false,
) {
  for (const [k, v] of Object.entries(expectedNaturalBoard(mode, record))) {
    if (k === "record") continue;
    const el = root.locator(`[data-${drawing ? "drawing-" : ""}field="${k}"]`);
    if (!(await el.count())) continue;
    if ((await el.evaluate((e) => e.tagName)) === "SELECT")
      await el.selectOption(v);
    else await el.fill(v);
  }
}
async function answer(page: Page, q: Question) {
  if (q.naturalDrawing)
    await fill(
      page.locator(".natural-drawing"),
      q.naturalDrawing.mode,
      q.naturalDrawing.record,
      true,
    );
  else if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
for (const mode of Object.keys(naturalRecords) as NaturalMode[])
  test(`${mode}: supplied cases retain wrong proposals through reload and accept their own account`, async ({
    page,
  }, info) => {
    let root = await model(page, mode);
    for (const record of Object.keys(naturalRecords[mode])) {
      const picker = root.locator('[data-field="record"]');
      if (!(await picker.isVisible()))
        await root
          .getByText("Investigate another supplied comparison", { exact: true })
          .click();
      await picker.selectOption(record);
      const e = expectedNaturalBoard(mode, record),
        key = (await root
          .locator('[data-field]:not([data-field="record"])')
          .first()
          .getAttribute("data-field"))!,
        el = root.locator(`[data-field="${key}"]`);
      const wrong =
        (await el.evaluate((e) => e.tagName)) === "SELECT"
          ? await el.evaluate(
              (e, target) =>
                Array.from((e as HTMLSelectElement).options).find(
                  (o) => o.value && o.value !== target,
                )!.value,
              e[key],
            )
          : "0.";
      if ((await el.evaluate((e) => e.tagName)) === "SELECT")
        await el.selectOption(wrong);
      else await el.fill(wrong);
      await saved(page);
      await page.reload();
      root = page.getByRole("region", { name: "Task model", exact: true });
      await expect(root.locator(`[data-field="${key}"]`)).toHaveValue(wrong);
      await fill(root, mode, record);
      await root
        .getByRole("button", { name: "Check this proposal", exact: true })
        .click();
      await expect(root.locator(".natural-feedback")).toHaveText(
        checkNaturalBoard(
          mode,
          e,
          j.guided.find(
            (q) =>
              q.model?.kind === "natural-polymers" && q.model.mode === mode,
          )?.model?.kind === "natural-polymers"
            ? (
                j.guided.find(
                  (q) =>
                    q.model?.kind === "natural-polymers" &&
                    q.model.mode === mode,
                )!.model as Extract<
                  NonNullable<(typeof j.guided)[number]["model"]>,
                  { kind: "natural-polymers" }
                >
              ).focus
            : undefined,
        ).message,
      );
    }
    await expect(page.locator(".unreadable-work")).toHaveCount(0);
    await page.screenshot({
      path: `docs/qa/natural-${info.project.name}-${mode}.png`,
      scale: "css",
    });
  });
test("all45 practice demands save correct answers and honest structural/written self-reviews", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.naturalDrawing
          ? "Save and review structure"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric
        ? q.naturalDrawing
          ? "Compare your structure"
          : "Compare your explanation"
        : "That’s right",
    );
    if (q.rubric) {
      await saved(page);
      expect(
        await page.evaluate(
          ({ key, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "natural-polymers"
            ].attempts[id].at(-1).correct,
          { key: STORAGE_KEY, id: q.id },
        ),
      ).toBe(false);
    }
    if (q.naturalDrawing)
      await expect(page.locator(".natural-review")).toBeVisible();
  }
});
test("cold forms hide references until whole-set submission and seven-day review remains separate", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await answer(page, j.practice[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await saved(page);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < 2; f++) {
    for (let i = 0; i < 8; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.checkForms[f][i]);
      await expect(page.locator(".natural-review,.natural-canvas")).toHaveCount(
        0,
      );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".natural-review")).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "7 of 7 correct", exact: true }),
    ).toBeVisible();
    const drawn = j.checkForms[f].findIndex((q) => q.naturalDrawing);
    await page
      .locator(".assessment-results details")
      .nth(drawn)
      .locator("summary")
      .click();
    await expect(page.locator(".natural-review")).toBeVisible();
    for (const el of await page
      .locator(".assessment-results .natural-drawing select")
      .all())
      await expect(el).toBeDisabled();
    await page.screenshot({
      path: `docs/qa/natural-${info.project.name}-sealed.png`,
      scale: "css",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await saved(page);
    if (f === 0)
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
      for (const run of p.work["natural-polymers"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["natural-polymers"].run.submitted = Date.now() - delay - 1000;
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
    await answer(page, j.reviewForms[0][i]);
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
test("DNA first action and explicit Higher inverse focus are accessible and preserve original cases", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 320 : 1280,
    height: info.project.name === "mobile" ? 664 : 720,
  });
  await page.goto(route);
  const first = page.locator('.natural-workbench [data-field="unit"]');
  await expect(first).toBeVisible();
  const box = await first.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  let root = page.getByRole("region", { name: "Task model", exact: true });
  await expect(root.locator('[data-field="unit"]')).toBeVisible();
  await expect(root.locator('[data-field="strands"]')).toHaveCount(0);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  const index = j.guided.findIndex((q) => q.id === "natural-v1-g-core");
  await task(page, index);
  root = page.getByRole("region", { name: "Task model", exact: true });
  await root.locator('[data-field="coreMr"]').fill("0.");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="coreMr"]')).toHaveValue("0.");
  await root
    .getByText("Investigate another supplied comparison", { exact: true })
    .click();
  await root.locator('[data-field="record"]').selectOption("initial");
  await root
    .getByRole("button", { name: "Reset model history", exact: true })
    .click();
  await expect(root.locator('[data-field="coreMr"]')).toHaveValue("");
  await expect(root.getByText(/Given whole monomer Mr:.*89/)).toBeVisible();
});
test("the actual DNA asset rotates by keyboard and exports the selected original excerpt", async ({
  page,
}, info) => {
  const root = await model(page, "dna");
  await root.locator('[data-field="unit"]').selectOption("leftNucleotide");
  const dl = root.getByRole("button", {
    name: "Download 3D asset",
    exact: true,
  });
  await expect(dl).toBeEnabled();
  const host = root.locator(".natural-canvas");
  await host.focus();
  await page.keyboard.press("ArrowRight");
  await expect(host.locator("canvas")).toHaveCount(1);
  const promise = page.waitForEvent("download");
  await dl.click();
  await (await promise).saveAs(`docs/qa/natural-${info.project.name}-dna.glb`);
  await host.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/qa/natural-${info.project.name}-3d.png`,
    scale: "css",
  });
});
test("unavailable WebGL keeps the labelled diagram and scientific controls usable", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  const root = await model(page, "dna");
  await expect(
    root.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await root
    .getByRole("button", { name: "Switch to labelled 2D", exact: true })
    .click();
  await root.locator('[data-field="unit"]').selectOption("rung");
  await expect(root.locator(".natural-dna-row span.chosen")).toHaveCount(2);
  await root
    .getByRole("button", { name: "Check this proposal", exact: true })
    .click();
  await expect(root.locator(".natural-feedback")).toContainText(
    "A complete rung contains two",
  );
  await page.screenshot({
    path: `docs/qa/natural-${info.project.name}-fallback.png`,
    scale: "css",
  });
});
test("chemical diagrams keep readable rendered labels and keyboard scrolling at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const mode of ["repeat", "peptide", "peptideUnit"] as const) {
    const root = await model(page, mode);
    const svg = root.locator(".natural-pan svg");
    const dims = await svg.evaluate((e) => ({
      width: e.getBoundingClientRect().width,
      text: e.querySelector("text")!.getBoundingClientRect().height,
    }));
    expect(dims.width).toBeGreaterThan(320);
    expect(dims.text).toBeGreaterThanOrEqual(14);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const pan = root.locator(".natural-pan").first();
    await pan.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => pan.evaluate((e) => e.scrollLeft))
      .toBeGreaterThan(0);
  }
});
