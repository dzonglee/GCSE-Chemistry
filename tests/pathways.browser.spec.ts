import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pathwaysJourney as j } from "../src/content/journeys/pathways-journey";
import { pathwayRecords, type PathwayMode } from "../src/lib/pathways";
import {
  expectedPathwayBoard,
  referencePathwayDrawing,
} from "../src/lib/pathway-board";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/organic-reactions";
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
async function model(page: Page, mode: PathwayMode) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(
    page,
    j.guided.findIndex(
      (q) => q.model?.kind === "pathways" && q.model.mode === mode,
    ) + 1,
  );
  return page.getByRole("region", { name: "Task model", exact: true });
}
async function fill(root: Locator, mode: PathwayMode, id: string) {
  for (const [k, v] of Object.entries(expectedPathwayBoard(mode, id))) {
    if (k === "record") continue;
    const el = root.locator(`[data-field="${k}"]`);
    if (!(await el.count())) {
      expect(["ohH0", "ohH1", "brackets", "countMark"]).toContain(k);
      continue;
    }
    if ((await el.evaluate((el) => el.tagName)) === "SELECT")
      await el.selectOption(v);
    else await el.fill(v);
  }
}
async function answer(page: Page, q: (typeof j.practice)[number]) {
  if (q.pathwayDrawing) {
    const root = page.locator(".pathway-drawing"),
      b = referencePathwayDrawing(q.pathwayDrawing.caseId);
    await root
      .getByLabel("Number of carbon atoms", { exact: true })
      .selectOption(b.n);
    for (const [k, v] of Object.entries(b)) {
      if (k === "n") continue;
      const el = root.locator(`[data-drawing-field="${k}"]`);
      if (await el.count()) await el.selectOption(v);
    }
  } else if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.parts) {
    for (const part of q.parts)
      await page
        .getByRole("textbox", { name: part.label, exact: true })
        .fill(String(part.answer));
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
for (const mode of Object.keys(pathwayRecords) as PathwayMode[])
  test(
    mode +
      ": each individually supplied case retains a wrong proposal through reload and accepts its chemical target",
    async ({ page }) => {
      test.setTimeout(180000);
      let root = await model(page, mode);
      for (const id of Object.keys(pathwayRecords[mode])) {
        const selector = root.locator('[data-field="record"]');
        if (!(await selector.isVisible()))
          await root.locator("details").last().locator("summary").click();
        await selector.selectOption(id);
        await fill(root, mode, id);
        const key =
            mode === "addition"
              ? "bond"
              : mode === "conditions"
                ? "reaction"
                : mode === "infer"
                  ? "reagent"
                  : mode === "ledger"
                    ? "Mr"
                    : mode === "process"
                      ? "ethanol"
                      : "feed",
          el = root.locator(`[data-field="${key}"]`),
          wrong =
            mode === "addition"
              ? "2"
              : mode === "conditions"
                ? "substitution"
                : mode === "infer"
                  ? "hydrogenBromide"
                  : mode === "ledger"
                    ? "999"
                    : mode === "process"
                      ? "999"
                      : "bromine";
        if ((await el.evaluate((el) => el.tagName)) === "SELECT")
          await el.selectOption(wrong);
        else await el.fill(wrong);
        await root.getByRole("button", { name: /^Check/ }).click();
        await expect(root.getByRole("status")).toBeVisible();
        await saved(page);
        await page.reload();
        root = page.getByRole("region", { name: "Task model", exact: true });
        await expect(root.locator(`[data-field="${key}"]`)).toHaveValue(wrong);
        await fill(root, mode, id);
        await root.getByRole("button", { name: /^Check/ }).click();
        await expect(root.getByRole("status")).toContainText(
          pathwayRecords[mode][id].reason,
        );
      }
    },
  );
test("all48 practice tasks retain the original46 and mark numeric/choice/parts answers while drawings and writing stay self-reviewed", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i + 1);
    const q = j.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.pathwayDrawing
          ? "Save and review structure"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric
        ? q.pathwayDrawing
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
              "organic-reactions"
            ].attempts[id].at(-1).correct,
          { key: STORAGE_KEY, id: q.id },
        ),
      ).toBe(false);
    }
    if (q.pathwayDrawing)
      await expect(page.locator(".pathway-review")).toBeVisible();
  }
  await page.screenshot({
    path: `docs/qa/pathways-${info.project.name}-higher-practice.png`,
    scale: "css",
  });
});
test("two cold sets hide model answers until submission and the actual seven-day delayed review remains separate", async ({
  page,
}, info) => {
  test.setTimeout(180000);
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
    for (let i = 0; i < 7; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.checkForms[f][i]);
      await expect(page.locator(".pathway-review")).toHaveCount(0);
      await expect(page.locator(".pathway-canvas")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".pathway-review")).toHaveCount(0);
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
    await expect(page.locator(".pathway-review").first()).toBeVisible();
    for (const el of await page
      .locator(".assessment-results .pathway-drawing select")
      .all())
      await expect(el).toBeDisabled();
    await page.screenshot({
      path: `docs/qa/pathways-${info.project.name}-sealed-review.png`,
      scale: "css",
    });
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
      for (const run of p.work["organic-reactions"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["organic-reactions"].run.submitted = Date.now() - delay - 1000;
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
test("raw unfinished numeric input, same comparison, undo and reset keep the original supplied task", async ({
  page,
}) => {
  let root = await model(page, "process");
  await root.locator('[data-field="ethanol"]').fill("0.");
  await saved(page);
  await page.reload();
  root = page.getByRole("region", { name: "Task model", exact: true });
  await expect(root.locator('[data-field="ethanol"]')).toHaveValue("0.");
  await root.locator("details").last().locator("summary").click();
  await root.locator('[data-field="record"]').selectOption("initial");
  await expect(root.locator('[data-field="ethanol"]')).toHaveValue("0.");
  await root.locator('[data-field="ethanol"]').fill("7");
  await root
    .getByRole("button", { name: "Undo model change", exact: true })
    .click();
  await expect(root.locator('[data-field="ethanol"]')).toHaveValue("0.");
  await root
    .getByRole("button", { name: "Reset model history", exact: true })
    .click();
  await expect(root.locator('[data-field="ethanol"]')).toHaveValue("");
  await expect(root.locator('[data-field="record"]')).toHaveValue("initial");
});
test("actual rotatable hydration asset is downloadable and reset keeps the current proposal", async ({
  page,
}, info) => {
  const root = await model(page, "addition");
  await root.locator("details").last().locator("summary").click();
  await root.locator('[data-field="record"]').selectOption("propeneWater");
  await fill(root, "addition", "propeneWater");
  const canvas = root.locator('.pathway-canvas[data-state="ready"]');
  await expect(canvas).toBeVisible();
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await root.getByRole("button", { name: "Rotate left", exact: true }).click();
  await root.getByRole("button", { name: "Zoom in", exact: true }).click();
  await root.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(root.locator('[data-field="rightNew"]')).toHaveValue("OH");
  const d = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  await (await d).saveAs(`docs/qa/pathways-${info.project.name}-propanol.glb`);
  await canvas.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/qa/pathways-${info.project.name}-3d.png`,
    scale: "css",
  });
});
test("320px long structures retain legible labels and real keyboard panning without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(
    page,
    j.practice.findIndex((q) => q.id === "path-v1-p-pentene-water") + 1,
  );
  await answer(
    page,
    j.practice.find((q) => q.id === "path-v1-p-pentene-water")!,
  );
  const drawing = page.locator(".pathway-drawing"),
    svg = drawing.getByRole("img", { name: /^Your displayed structure\./ });
  const min = await svg.evaluate((el) => {
    const width = el.getBoundingClientRect().width,
      view = (el as SVGSVGElement).viewBox.baseVal.width;
    return (parseFloat(getComputedStyle(el).fontSize) * width) / view;
  });
  expect(min).toBeGreaterThanOrEqual(12.9);
  const scroll = drawing.getByRole("region", {
    name: /^Your displayed structure;/,
  });
  expect(await scroll.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
    true,
  );
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
});
test("WebGL fallback preserves the original source, independent site and actual editable chemical choices", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (/webgl/i.test(type)) return null;
      return get.apply(this, [type, ...args] as never);
    } as typeof get;
  });
  const root = await model(page, "addition");
  await expect(root.getByRole("status")).toContainText("3D is unavailable");
  await root
    .getByText("Inspect the original molecule", { exact: true })
    .click();
  await expect(
    root.getByRole("img", { name: /^Original alkene\./ }),
  ).toBeVisible();
  await fill(root, "addition", "initial");
  await root
    .getByRole("button", { name: "Check this construction", exact: true })
    .click();
  await expect(root.getByRole("status").last()).toContainText("retains");
  await expect(
    root.getByRole("button", { name: "Download 3D asset", exact: true }),
  ).toBeDisabled();
  await page.screenshot({
    path: `docs/qa/pathways-${info.project.name}-fallback.png`,
    scale: "css",
  });
});
test("accessible native controls, blank independent input and separate self-review reference retain keyboard and reflow", async ({
  page,
}) => {
  const root = await model(page, "process");
  expect(
    (await new AxeBuilder({ page }).include("main").analyze()).violations,
  ).toEqual([]);
  await expect(root.locator('[data-field="ethanol"]')).toHaveValue("");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const drawing = page.locator(".pathway-drawing");
  await expect(
    drawing.getByLabel("Number of carbon atoms", { exact: true }),
  ).toHaveValue("");
  await expect(page.locator(".pathway-review")).toHaveCount(0);
  await answer(page, j.practice[0]);
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await expect(page.locator(".pathway-review")).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).include("main").analyze()).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("wrong and unreadable drawings retain their bytes, references stay separate, and clearing touches only the current answer", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const root = page.locator(".pathway-drawing");
  await root
    .getByLabel("Number of carbon atoms", { exact: true })
    .selectOption("2");
  await root.locator('[data-drawing-field="b0"]').selectOption("2");
  await root.locator('[data-drawing-field="h0"]').selectOption("4");
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Compare your structure",
  );
  await expect(page.locator(".pathway-review")).toBeVisible();
  await expect(root.locator('[data-drawing-field="b0"]')).toHaveValue("2");
  await expect(root.locator('[data-drawing-field="h0"]')).toHaveValue("4");
  await root.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/qa/pathways-${info.project.name}-retained-wrong-drawing.png`,
    scale: "css",
  });
  await saved(page);
  const q = j.practice[0],
    sibling = j.practice[1],
    bad = '{"n":"2",broken';
  await page.evaluate(
    ({ key, id, sibling, bad }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["organic-reactions"].drafts[id] = bad;
      p.work["organic-reactions"].drafts[sibling] = "retain another draft";
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, id: q.id, sibling: sibling.id, bad },
  );
  await page.reload();
  await expect(
    page.locator(".pathway-drawing").getByRole("status"),
  ).toContainText("original saved structure cannot be read");
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["organic-reactions"].drafts[
          id
        ],
      { key: STORAGE_KEY, id: q.id },
    ),
  ).toBe(bad);
  await page
    .locator(".pathway-drawing")
    .getByRole("button", {
      name: "Start a new addition construction",
      exact: true,
    })
    .click();
  await expect(
    page
      .locator(".pathway-drawing")
      .getByLabel("Number of carbon atoms", { exact: true }),
  ).toHaveValue("");
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["organic-reactions"].drafts[
          id
        ],
      { key: STORAGE_KEY, id: sibling.id },
    ),
  ).toBe("retain another draft");
  await page.getByRole("button", { name: "Clear answer", exact: true }).click();
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["organic-reactions"].drafts[
          id
        ],
      { key: STORAGE_KEY, id: sibling.id },
    ),
  ).toBe("retain another draft");
});

test("exploring another reaction keeps the original question and reset returns its actual givens before answering", async ({
  page,
}) => {
  const root = await model(page, "addition");
  await root.locator("details").last().locator("summary").click();
  await root.locator('[data-field="record"]').selectOption("propeneWater");
  await fill(root, "addition", "propeneWater");
  await expect(root.locator(".pathway-comparison-note")).toContainText(
    "original reaction",
  );
  await expect(
    page.getByRole("heading", { name: "Add hydrogen", exact: true }),
  ).toBeVisible();
  await root
    .getByRole("button", { name: "Reset model history", exact: true })
    .click();
  await expect(root.locator('[data-field="record"]')).toHaveValue("initial");
  await expect(root.locator('[data-field="site"]')).toHaveValue("");
  await expect(root.locator(".pathway-comparison-note")).toHaveCount(0);
  await fill(root, "addition", "initial");
  await page.getByRole("radio", { name: "C2H6", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("That’s right");
});

test("an extra carbon hydrogen beside OH remains separately visible in the retained wrong structure", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  const root = page.locator(".pathway-drawing");
  await root
    .getByLabel("Number of carbon atoms", { exact: true })
    .selectOption("2");
  for (const [k, v] of Object.entries({
    b0: "1",
    h0: "3",
    h1: "3",
    o1: "1",
    oh1: "1",
  }))
    await root.locator(`[data-drawing-field="${k}"]`).selectOption(v);
  const svg = root.getByRole("img", { name: /^Your displayed structure\./ });
  const rects = await svg.locator("text").evaluateAll((nodes) =>
    nodes
      .filter((n) => n.textContent === "H")
      .map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
      }),
  );
  expect(rects).toHaveLength(7);
  for (let i = 0; i < rects.length; i++)
    for (let k = i + 1; k < rects.length; k++)
      expect(
        rects[i].right <= rects[k].x ||
          rects[k].right <= rects[i].x ||
          rects[i].bottom <= rects[k].y ||
          rects[k].bottom <= rects[i].y,
      ).toBe(true);
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Compare your structure",
  );
  await expect(root.locator('[data-drawing-field="h1"]')).toHaveValue("3");
  await root.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/qa/pathways-${info.project.name}-extra-H-retained.png`,
    scale: "css",
  });
});
