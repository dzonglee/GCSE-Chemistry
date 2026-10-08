import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { chromatographyJourney as j } from "../src/content/journeys/chromatography-journey";
import {
  chromatographyCases,
  type ChromatographyMode,
} from "../src/lib/chromatography-cases";
import {
  expectedChroma,
  compatibleChromaCases,
} from "../src/lib/chromatography-domain";
import { referenceChromaDrawing } from "../src/lib/chromatography-drawing";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
// Reproducible actual WebGL checks use software rendering in this cloud runner.
// The separate forced-unavailable case still exercises the fallback.
test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  },
});
const route = "/lessons/chromatography";
async function saved(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(p: Page, index: number) {
  const select = p.getByLabel("Choose a practice task", { exact: true });
  if (await select.count()) await select.selectOption(String(index));
  else
    await p
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
}
async function fill(root: Locator, mode: ChromatographyMode, record: string) {
  for (const [key, value] of Object.entries(expectedChroma(mode, record))) {
    const f = root.locator(`[data-field="${key}"]`);
    if (!(await f.count())) continue;
    if (await f.evaluate((e) => e.tagName === "SELECT"))
      await f.selectOption(value);
    else await f.fill(value);
  }
}
async function answer(p: Page, q: Question) {
  if (q.chromatographyDrawing) {
    const b = referenceChromaDrawing(q.chromatographyDrawing);
    for (const [key, value] of Object.entries(b.raw))
      await p.locator(`input[data-drawing-field="${key}"]`).fill(value);
    for (const [key, value] of Object.entries(b.choices))
      await p
        .locator(`select[data-drawing-field="${key}"]`)
        .selectOption(value);
  } else if (q.rubric)
    await p.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await p.getByRole("radio", { name: q.answer, exact: true }).check();
  else await p.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
for (const mode of Object.keys(chromatographyCases) as ChromatographyMode[])
  test(`${mode}: original records, wrong proposal, reload, explicit reset and asked-only feedback`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    const index = j.guided.findIndex((q) => q.model?.mode === mode),
      q = j.guided[index];
    await task(page, index);
    for (const record of compatibleChromaCases(mode, q.model!.focus)) {
      let r = page.locator(".chroma-workbench");
      await r.locator('[data-field="record"]').selectOption(record);
      const f = r.locator('[data-field]:not([data-field="record"])').first(),
        key = (await f.getAttribute("data-field"))!;
      let wrong = "0.";
      if (await f.evaluate((e) => e.tagName === "SELECT")) {
        wrong = await f.evaluate(
          (e, target) =>
            [...(e as HTMLSelectElement).options].find(
              (o) => o.value && o.value !== target,
            )!.value,
          expectedChroma(mode, record)[key],
        );
        await f.selectOption(wrong);
      } else await f.fill(wrong);
      await saved(page);
      await page.reload();
      r = page.locator(".chroma-workbench");
      await expect(r.locator(`[data-field="${key}"]`)).toHaveValue(wrong);
      await fill(r, mode, record);
      await r.getByRole("button", { name: "Check model", exact: true }).click();
      await expect(r.locator(".chroma-model-feedback")).toContainText(
        "asked fields match",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page
      .locator(".chroma-workbench")
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await expect(page.locator('[data-field="record"]')).toHaveValue(
      q.model!.record,
    );
  });
test("all32 practice tasks including both drawings use actual marking and targeted destinations", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    const q = j.practice[i];
    await task(page, i);
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric
          ? `Save and review ${q.chromatographyDrawing ? "chromatography proposal" : "explanation"}`
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: q.rubric ? "Response saved" : "That’s right" })
        .first(),
    ).toBeVisible();
    if (q.chromatographyDrawing)
      await expect(page.locator(".chroma-drawing-review")).toBeVisible();
    if (q.rubric) {
      await saved(page);
      expect(
        await page.evaluate(
          ({ key, id }) =>
            JSON.parse(localStorage.getItem(key)!).work.chromatography.attempts[
              id
            ].at(-1).correct,
          { key: STORAGE_KEY, id: q.id },
        ),
      ).toBe(false);
    }
  }
});
test("two cold forms and two real delayed forms preserve sealed diagrams and honest self-review", async ({
  page,
}) => {
  test.setTimeout(240000);
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < 2; f++) {
    for (let i = 0; i < 10; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.checkForms[f][i]);
      await expect(
        page.locator(".chroma-workbench,.chroma-scene,.chroma-drawing-review"),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".chroma-drawing-review")).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "8 of 8 correct", exact: true }),
    ).toBeVisible();
    await page
      .locator(".assessment-results details")
      .last()
      .locator("summary")
      .click();
    await expect(page.locator(".chroma-drawing-review")).toBeVisible();
    await expect(
      page.locator(
        ".assessment-results .chroma-drawing input,.assessment-results .chroma-drawing select",
      ),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (f === 0)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
  for (let f = 0; f < 2; f++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Start review →", exact: true }),
    ).toHaveCount(0);
    const next = page.getByRole("button", {
      name: "Try the next form",
      exact: true,
    });
    if (await next.count()) await expect(next).toBeDisabled();
    await saved(page);
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const r of p.work.chromatography.history)
          r.submitted = Date.now() - delay - 1000;
        p.work.chromatography.run.submitted = Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: f === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    for (let i = 0; i < 4; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.reviewForms[f][i]);
      await expect(page.locator(".chroma-drawing-review")).toHaveCount(0);
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
  }
});
test("first scientific control fits short viewport; diagrams retain rendered14px labels and keyboard panning", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 320 : 1280,
    height: info.project.name === "mobile" ? 664 : 720,
  });
  await page.goto(route);
  const first = page.locator('[data-field="solventLevel"]');
  await expect(first).toBeVisible();
  const box = await first.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await first.fill("12");
  await expect(first).toHaveValue("12");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 2);
  const root = page.locator(".chroma-workbench");
  for (let i = 0; i < 10; i++)
    await root
      .getByRole("button", {
        name: "Move ruler zero up 1 millimetre",
        exact: true,
      })
      .click();
  await expect(root).toContainText("10 mm above the paper bottom");
  expect(
    await root.locator("svg text").evaluateAll((es) =>
      es.every((e) => {
        const m = (e as SVGGraphicsElement).getScreenCTM()!;
        return (
          parseFloat(getComputedStyle(e).fontSize) * Math.hypot(m.c, m.d) >= 14
        );
      }),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("matching-lane explanations remain hidden before check; wrong selections wrap on mobile", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 6);
  const root = page.locator(".chroma-workbench");
  await expect(root).not.toContainText("The unknown matches P and Q");
  await root.locator('[data-field="matches"]').selectOption("Q");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".chroma-model-feedback")).toContainText(
    "The unknown matches P and Q",
  );
  await expect(root.locator('[data-field="matches"]')).toHaveValue("Q");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("wrong drawings, blank saves, unfinished positions and corrupt recovery preserve only actual student work", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = j.practice.findIndex(
      (q) => q.chromatographyDrawing?.mode === "chromatogram",
    ),
    q = j.practice[index];
  await task(page, index);
  const root = page.locator(".chroma-drawing").first();
  await page
    .getByRole("button", {
      name: "Save and review chromatography proposal",
      exact: true,
    })
    .click();
  await expect(page.locator(".chroma-drawing-review")).toHaveCount(0);
  await root.locator('[data-drawing-field="a1"]').fill("−50");
  await root.locator('[data-drawing-field="a1"]').fill("7.");
  await page
    .getByRole("button", {
      name: "Save and review chromatography proposal",
      exact: true,
    })
    .click();
  await expect(root.locator('[data-drawing-field="a1"]')).toHaveValue("7.");
  await expect(root).toContainText("last placed position is -50");
  await expect(page.locator(".chroma-drawing-review")).toContainText(
    "Separate reference",
  );
  if (page.viewportSize()!.width <= 600) {
    const region = page.locator(".chroma-drawing-review .chroma-given-scroll");
    const sample = page.locator(".chroma-drawing-review svg circle").first();
    const viewport = await region.boundingBox(),
      point = await sample.boundingBox();
    expect(point!.x).toBeGreaterThanOrEqual(viewport!.x);
    expect(point!.x + point!.width).toBeLessThanOrEqual(
      viewport!.x + viewport!.width,
    );
  }
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-drawing-field="a1"]')).toHaveValue("7.");
  await page.evaluate(
    ({ key, id, sibling }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work.chromatography.drafts[id] = "{exact corrupt bytes";
      p.work.chromatography.drafts[sibling] = "retained sibling";
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, id: q.id, sibling: j.practice[0].id },
  );
  await page.reload();
  await expect(
    page.getByText(
      "The retained drawing cannot be read. Its original bytes are preserved.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Start a new drawing for this task",
      exact: true,
    })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work.chromatography.drafts[id],
      { key: STORAGE_KEY, id: j.practice[0].id },
    ),
  ).toBe("retained sibling");
});
test("actual3D export and view controls preserve a wrong saved proposal; WebGL fallback remains usable", async ({
  page,
}) => {
  await page.goto(route);
  const root = page.locator(".chroma-workbench");
  await root.locator('[data-field="solventLevel"]').fill("24");
  const download = root.getByRole("button", {
    name: "Download 3D asset",
    exact: true,
  });
  await expect(download).toBeEnabled();
  await root.getByRole("button", { name: "Rotate right", exact: true }).click();
  await root.getByRole("button", { name: "Zoom in", exact: true }).click();
  await root.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(root.locator('[data-field="solventLevel"]')).toHaveValue("24");
  const event = page.waitForEvent("download");
  await download.click();
  const asset = await event;
  expect(asset.suggestedFilename()).toBe(
    "chromatography-immersed-current-apparatus.glb",
  );
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="solventLevel"]')).toHaveValue("24");
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.reload();
  await expect(root).toContainText("3D is unavailable.");
  await root.locator('[data-field="solventLevel"]').fill("12");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".chroma-model-feedback")).toContainText(
    "asked fields match",
  );
  await expect(
    root
      .locator("details")
      .filter({ hasText: "Inspect the calibrated 2D apparatus" }),
  ).toHaveAttribute("open", "");
});
