import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { polymerisationJourney as fullJourney } from "../src/content/journeys/polymerisation";
import {
  polymerisationRecords,
  type PolymerisationMode,
} from "../src/lib/polymerisation";
import { expectedPolymerisationBoard } from "../src/lib/polymerisation-board";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import { captureCondensationNative } from "./condensation-native-capture";
const j = {
  ...fullJourney,
  practice: fullJourney.practice.filter((q) => q.id.startsWith("pol-v1-")),
  checkForms: fullJourney.checkForms.slice(0, 2),
  reviewForms: fullJourney.reviewForms.slice(0, 2),
};
const route = "/lessons/polymers";
test.beforeEach(async ({ page }) => {
  await page.goto("/preferences");
  await page.getByLabel("Tier", { exact: true }).selectOption("higher");
  await saved(page);
});
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.count()) await picker.selectOption(String(n - 1));
  else
    await page
      .getByRole("button", { name: `Task ${n}`, exact: true })
      .first()
      .click();
}
async function fill(root: Locator, mode: PolymerisationMode, id: string) {
  for (const [k, v] of Object.entries(expectedPolymerisationBoard(mode, id))) {
    if (k === "record") continue;
    const el = root.locator(`[id$="${k}"]`);
    if ((await el.evaluate((e) => e.tagName)) === "SELECT")
      await el.selectOption(v);
    else await el.fill(v);
  }
}
async function answer(page: Page, q: (typeof j.practice)[number]) {
  if (q.polymerisationDrawing) {
    const root = page.locator(".polymerisation-drawing");
    for (let i = 0; i < 4; i++)
      await root
        .locator(`[id$="s${i}"]`)
        .selectOption(q.polymerisationGiven!.groups[i]);
    const reverse = q.polymerisationGiven!.polymer;
    for (const [k, v] of Object.entries({
      bond: reverse ? "2" : "1",
      left: reverse ? "0" : "1",
      right: reverse ? "0" : "1",
      brackets: reverse ? "0" : "1",
      countMark: reverse ? "none" : "n",
    }))
      await root.locator(`[id$="${k}"]`).selectOption(v);
  } else if (q.polyesterDrawing) {
    const root = page.locator(".polymerisation-drawing");
    for (const [k, v] of Object.entries({
      diolC: String(q.polyesterDrawing.diolC),
      acidSpacerC: String(q.polyesterDrawing.acidSpacerC),
      leftO: "1",
      middleO: "1",
      carbonyl1: "2",
      carbonyl2: "2",
      left: "1",
      right: "1",
      brackets: "1",
      countMark: "n",
    }))
      await root.locator(`[id$="${k}"]`).selectOption(v);
  } else if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
for (const [, mode] of (
  [
    "addition",
    "reverse",
    "segment",
    "inventory",
    "ester",
    "links",
    "polyester",
  ] as PolymerisationMode[]
).entries())
  test(
    mode +
      ": all original comparisons retain wrong proposals on reload and accept their chemical targets",
    async ({ page }, info) => {
      test.setTimeout(180000);
      await page.goto(route);
      await page.getByRole("button", { name: "Learn", exact: true }).click();
      await task(
        page,
        j.guided.findIndex(
          (q) => q.model?.kind === "polymerisation" && q.model.mode === mode,
        ) + 1,
      );
      const root = page.getByRole("region", {
        name: "Task model",
        exact: true,
      });
      for (const id of Object.keys(polymerisationRecords[mode])) {
        const summary = root.locator("details").last().locator("summary");
        if (
          !(await root
            .getByLabel("Supplied comparison", { exact: true })
            .isVisible())
        )
          await summary.click();
        await root
          .getByLabel("Supplied comparison", { exact: true })
          .selectOption(id);
        await fill(root, mode, id);
        const key =
            mode === "addition" || mode === "reverse"
              ? "bond"
              : mode === "segment"
                ? "length"
                : mode === "inventory"
                  ? "Mr"
                  : mode === "ester"
                    ? "small"
                    : mode === "polyester"
                      ? "carbonyl1"
                      : "links",
          input = root.locator(`[id$="${key}"]`),
          wrong =
            mode === "ester"
              ? "none"
              : ["addition", "reverse", "polyester"].includes(mode)
                ? "0"
                : "99";
        if ((await input.evaluate((e) => e.tagName)) === "SELECT")
          await input.selectOption(wrong);
        else await input.fill(wrong);
        await root
          .getByRole("button", { name: "Check model", exact: true })
          .click();
        await expect(root.locator(".feedback.incorrect")).toBeVisible();
        await saved(page);
        await page.reload();
        await expect(input).toHaveValue(wrong);
        await fill(root, mode, id);
        await root
          .getByRole("button", { name: "Check model", exact: true })
          .click();
        await expect(root.locator(".feedback.correct")).toBeVisible();
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await captureCondensationNative(page, () =>
        page
          .screenshot({
            path: `test-results/qa/polymers-${info.project.name}-${mode}.png`,
            fullPage: true,
            scale: "css",
          })
          .then(() => {}),
      );
    },
  );
test("all41 practice tasks, blank independent drawings and teacher references retain honest review", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i + 1);
    const q = j.practice[i];
    if (q.polymerisationDrawing || q.polyesterDrawing) {
      for (const el of await page
        .locator(".polymerisation-drawing select")
        .all()) {
        const key = await el.getAttribute("id");
        expect(await el.inputValue()).toBe(
          key!.endsWith("countMark")
            ? "none"
            : /s[0-3]$/.test(key!)
              ? "none"
              : "0",
        );
      }
      await expect(page.locator(".polymerisation-review")).toHaveCount(0);
    }
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric
          ? q.polymerisationDrawing || q.polyesterDrawing
            ? "Save and review structure"
            : "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page.locator(q.rubric ? ".feedback:not(.correct)" : ".feedback.correct"),
    ).toBeVisible();
    if (q.rubric) {
      await expect(page.locator(".sample-task-answer .feedback")).toContainText(
        q.polymerisationDrawing || q.polyesterDrawing
          ? "Compare your structure"
          : "Compare your explanation",
      );
      await saved(page);
      expect(
        await page.evaluate(
          ({ key, id }) =>
            JSON.parse(localStorage.getItem(key)!).work.polymers.attempts[
              id
            ].at(-1).correct,
          { key: STORAGE_KEY, id: q.id },
        ),
      ).toBe(false);
    }
    if (q.polymerisationDrawing || q.polyesterDrawing) {
      await expect(page.locator(".polymerisation-review")).toBeVisible();
      if (q.polyesterDrawing) {
        await page.locator(".polymerisation-review").scrollIntoViewIfNeeded();
        await captureCondensationNative(page, () =>
          page
            .screenshot({
              path: `test-results/qa/polymers-${info.project.name}-higher-reference.png`,
              scale: "css",
            })
            .then(() => {}),
        );
      }
    }
  }
  await saved(page);
});
test("both cold forms defer all drawing references and retain5 automatic marks plus3 self-reviews; review waits seven days", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto("/preferences");
  await page.getByLabel("Tier", { exact: true }).selectOption("foundation");
  await saved(page);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await answer(page, j.practice[0]);
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
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
      await expect(page.locator(".polymerisation-review")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".polymerisation-review")).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
    ).toBeVisible();
    await page
      .locator(".assessment-results details")
      .first()
      .locator("summary")
      .click();
    await expect(page.locator(".polymerisation-review").first()).toBeVisible();
    for (const el of await page
      .locator(".assessment-results .polymerisation-drawing select")
      .all())
      await expect(el).toBeDisabled();
    await captureCondensationNative(page, () =>
      page
        .screenshot({
          path: `test-results/qa/polymers-${info.project.name}-sealed-review.png`,
          scale: "css",
        })
        .then(() => {}),
    );
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
  const history = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work.polymers.history,
    STORAGE_KEY,
  );
  const submitted = history.at(-1).submitted;
  await page.clock.setFixedTime(submitted + REVIEW_DELAY - 1);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await page.clock.setFixedTime(submitted + REVIEW_DELAY + 1000);
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).work.polymers.history,
      STORAGE_KEY,
    ),
  ).toEqual(history);
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
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});

test("raw numeric strings, repeated selection, Undo and reset preserve the exact original task", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 4);
  const root = page.getByRole("region", { name: "Task model", exact: true }),
    input = root.locator('[id$="Mr"]');
  await input.fill("140");
  await input.fill("1.");
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("1.");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(input).toHaveValue("140");
  await input.fill("1.4e2");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.incorrect")).toBeVisible();
  await root.locator("details").last().locator("summary").click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption("initial");
  await expect(input).toHaveValue("1.4e2");
  await root.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(input).toHaveValue("");
});
test("3D growth reload and Undo retain actual chosen crop and permit a real downloaded GLB", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await fill(root, "addition", "initial");
  const crop = root.getByLabel(
    "Shown 3D chain contributions (not the full polymer)",
    { exact: true },
  );
  await crop.selectOption("4");
  await saved(page);
  await page.reload();
  await expect(crop).toHaveValue("4");
  await expect(
    root.locator('.polymerisation-canvas[data-state="ready"]'),
  ).toBeVisible();
  const d = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  await (
    await d
  ).saveAs(
    `test-results/qa/polymers-${info.project.name}-four-contributions.glb`,
  );
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(crop).toHaveValue("2");
  const d2 = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  await (
    await d2
  ).saveAs(
    `test-results/qa/polymers-${info.project.name}-two-contributions.glb`,
  );
  await root.locator(".polymerisation-canvas").scrollIntoViewIfNeeded();
  await captureCondensationNative(page, () =>
    page
      .screenshot({
        path: `test-results/qa/polymers-${info.project.name}-3d.png`,
        scale: "css",
      })
      .then(() => {}),
  );
});
test("mobile long structures retain readable labels and horizontal keyboard panning without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  for (const n of [3, 6, 7]) {
    await task(page, n);
    const root = page.getByRole("region", { name: "Task model", exact: true }),
      scroll = root.locator(".polymerisation-scroll").first();
    if (n === 6) await fill(root, "polyester", "initial");
    const px = await scroll
      .locator("svg text")
      .first()
      .evaluate(
        (e) =>
          parseFloat(getComputedStyle(e).fontSize) *
          (e as SVGGraphicsElement).getScreenCTM()!.a,
      );
    expect(px).toBeGreaterThanOrEqual(12);
    await scroll.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => scroll.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await task(page, 1);
  const repeat = page
    .getByRole("region", { name: "Task model", exact: true })
    .locator(".polymerisation-displayed")
    .last();
  const fits = await repeat.locator("svg").evaluate((el) => {
    const box = el.getBoundingClientRect(),
      region = el.parentElement!.getBoundingClientRect();
    const text = el.querySelector("text")!;
    return {
      fits: box.width <= region.width + 0.5,
      pixels:
        parseFloat(getComputedStyle(text).fontSize) *
        (text as SVGGraphicsElement).getScreenCTM()!.a,
    };
  });
  expect(fits.fits).toBe(true);
  expect(fits.pixels).toBeGreaterThanOrEqual(12);
});
test("wrong independent attachments remain visible beside the reference and Clear returns every choice to blank", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const root = page.locator(".polymerisation-drawing");
  await root
    .getByLabel("Carbon 2: below attachment", { exact: true })
    .selectOption("Cl");
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await expect(
    root.getByLabel("Carbon 2: below attachment", { exact: true }),
  ).toHaveValue("Cl");
  await expect(page.locator(".polymerisation-review")).toBeVisible();
  await root.scrollIntoViewIfNeeded();
  await captureCondensationNative(page, () =>
    page
      .screenshot({
        path: `test-results/qa/polymers-${info.project.name}-retained-wrong-drawing.png`,
        scale: "css",
      })
      .then(() => {}),
  );
  await root
    .getByRole("button", {
      name: "Clear this polymerisation construction",
      exact: true,
    })
    .click();
  for (const el of await root.locator("select").all()) {
    const id = await el.getAttribute("id");
    await expect(el).toHaveValue(
      id!.endsWith("countMark") || /s[0-3]$/.test(id!) ? "none" : "0",
    );
  }
  await saved(page);
  await page.reload();
  await expect(
    root.getByLabel("Carbon 2: below attachment", { exact: true }),
  ).toHaveValue("none");
  await saved(page);
  await page.evaluate((key) => {
    const p = JSON.parse(localStorage.getItem(key)!);
    p.work.polymers.drafts["pol-v1-p-ethene"] =
      "original malformed drawing bytes";
    p.work.polymers.drafts["pol-v1-p-propene"] = "keep original sibling bytes";
    localStorage.setItem(key, JSON.stringify(p));
  }, STORAGE_KEY);
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Start a new polymerisation construction",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work.polymers.drafts[
          "pol-v1-p-ethene"
        ],
      STORAGE_KEY,
    ),
  ).toBe("original malformed drawing bytes");
  await page
    .getByRole("button", {
      name: "Start a new polymerisation construction",
      exact: true,
    })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work.polymers.drafts[
          "pol-v1-p-propene"
        ],
      STORAGE_KEY,
    ),
  ).toBe("keep original sibling bytes");
});
test("unavailable WebGL preserves readable chemistry and the opening control fits a short mobile viewport", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (/webgl/.test(type)) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await expect(
    root.getByLabel("Carbon 1: above side group", { exact: true }),
  ).toBeVisible();
  const box = await root
    .getByLabel("Carbon 1: above side group", { exact: true })
    .boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await expect(root.locator(".polymerisation-canvas")).toHaveAttribute(
    "data-state",
    "unavailable",
  );
  await root.locator(".polymerisation-scene").scrollIntoViewIfNeeded();
  await captureCondensationNative(page, () =>
    page
      .screenshot({
        path: `test-results/qa/polymers-${info.project.name}-fallback.png`,
        scale: "css",
      })
      .then(() => {}),
  );
});
