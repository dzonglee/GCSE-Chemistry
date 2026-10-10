import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { purityJourney as j } from "../src/content/journeys/purity-journey";
import { purityCases } from "../src/lib/purity-cases";
import {
  expectedPurity,
  compatiblePurityCases,
  type PurityMode,
} from "../src/lib/purity-domain";
import { referencePurityDrawing } from "../src/lib/purity-drawing";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/purity-and-separation";
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
async function fill(root: Locator, mode: PurityMode, record: string) {
  for (const [k, v] of Object.entries(expectedPurity(mode, record))) {
    const field = root.locator(`[data-field="${k}"]`);
    if (!(await field.count())) continue;
    if ((await field.evaluate((e) => e.tagName)) === "SELECT")
      await field.selectOption(v);
    else await field.fill(v);
  }
}
async function answer(p: Page, q: Question) {
  if (q.purityDrawing) {
    for (const [key, value] of Object.entries(
      referencePurityDrawing(q.purityDrawing),
    )) {
      if (key === "record") continue;
      await p
        .locator(`.purity-drawing [data-drawing-field="${key}"]`)
        .selectOption(value);
    }
  } else if (q.rubric)
    await p.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.parts)
    for (const part of q.parts)
      await p.getByLabel(part.label, { exact: true }).fill(String(part.answer));
  else if (q.options)
    await p.getByRole("radio", { name: q.answer, exact: true }).check();
  else await p.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
for (const mode of Object.keys(purityCases) as PurityMode[])
  test(`${mode}: actual guided cases preserve wrong entries, reload and asked-only checks`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    const index = j.guided.findIndex((q) => q.model?.mode === mode),
      q = j.guided[index];
    await task(page, index);
    for (const record of compatiblePurityCases(mode, q.model!.focus)) {
      let root = page.locator(".purity-workbench");
      await root.locator('[data-field="record"]').selectOption(record);
      const field = root
          .locator('[data-field]:not([data-field="record"])')
          .first(),
        key = (await field.getAttribute("data-field"))!;
      let wrong = "0.";
      if ((await field.evaluate((e) => e.tagName)) === "SELECT") {
        wrong = await field.evaluate(
          (e, target) =>
            [...(e as HTMLSelectElement).options].find(
              (o) => o.value && o.value !== target,
            )!.value,
          expectedPurity(mode, record)[key],
        );
        await field.selectOption(wrong);
      } else await field.fill(wrong);
      await saved(page);
      await page.reload();
      root = page.locator(".purity-workbench");
      await expect(root.locator(`[data-field="${key}"]`)).toHaveValue(wrong);
      await fill(root, mode, record);
      await root
        .getByRole("button", { name: "Check my proposal", exact: true })
        .click();
      await expect(root.locator(".purity-feedback")).toContainText(
        "match this supplied case",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await expect(page.locator(".unreadable-work")).toHaveCount(0);
  });
test("all25 practice questions save correct scalar/ratio answers and honest separation self-reviews", async ({
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
        name: q.purityDrawing
          ? "Save and review separation proposal"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric
        ? q.purityDrawing
          ? "Compare your separation proposal"
          : "Compare your explanation"
        : "That’s right",
    );
    if (q.rubric) {
      await saved(page);
      expect(
        await page.evaluate(
          ({ key, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "purity-and-separation"
            ].attempts[id].at(-1).correct,
          { key: STORAGE_KEY, id: q.id },
        ),
      ).toBe(false);
    }
    if (q.purityDrawing)
      await expect(page.locator(".purity-drawing-review")).toBeVisible();
  }
});
test("both cold forms and both delayed forms hide references until whole-set submission", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
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
      await expect(
        page.locator(".purity-workbench,.purity-scene,.purity-drawing-review"),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".purity-drawing-review")).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "7 of 7 correct", exact: true }),
    ).toBeVisible();
    await page
      .locator(".assessment-results details")
      .last()
      .locator("summary")
      .click();
    await expect(page.locator(".purity-drawing-review")).toBeVisible();
    for (const label of await page
      .locator(".purity-drawing-review [data-material-label]")
      .all()) {
      const bounds = await label.boundingBox();
      expect(bounds!.width).toBeLessThanOrEqual(160);
      expect(
        await label.evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
      ).toBeGreaterThanOrEqual(14);
    }
    const retainedCard = page.locator(".assessment-results details").last();
    const retainedBounds = await retainedCard.boundingBox();
    expect(retainedBounds!.width).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    for (const field of await retainedCard.locator("select").all()) {
      const bounds = await field.boundingBox();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
        page.viewportSize()!.width + 1,
      );
    }
    for (const select of await page
      .locator(".assessment-results .purity-drawing select")
      .all())
      await expect(select).toBeDisabled();
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
    const nextDelayed = page.getByRole("button", {
      name: "Try the next form",
      exact: true,
    });
    if (await nextDelayed.count()) await expect(nextDelayed).toBeDisabled();
    await saved(page);
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const r of p.work["purity-and-separation"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["purity-and-separation"].run.submitted =
          Date.now() - delay - 1000;
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
    for (let i = 0; i < 3; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.reviewForms[f][i]);
      await expect(page.locator(".purity-drawing-review")).toHaveCount(0);
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
test("first temperature action fits short screens, markers use keyboard and labels stay readable", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 320 : 1280,
    height: info.project.name === "mobile" ? 664 : 720,
  });
  await page.goto(route);
  const first = page.getByRole("button", {
    name: "Move start temperature right",
    exact: true,
  });
  await expect(first).toBeVisible();
  const box = await first.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await first.click();
  await expect(
    page.locator('.purity-workbench [data-field="start"]'),
  ).toHaveValue("74");
  const plot = page.getByRole("group", {
    name: "Place the start temperature mark",
    exact: true,
  });
  await plot.focus();
  await plot.press("Home");
  await expect(
    page.locator('.purity-workbench [data-field="start"]'),
  ).toHaveValue("74");
  await plot.press("ArrowRight");
  await expect(
    page.locator('.purity-workbench [data-field="start"]'),
  ).toHaveValue("74.2");
  expect(
    await page
      .locator(".purity-temperature text")
      .evaluateAll((els) =>
        els.every((e) => parseFloat(getComputedStyle(e).fontSize) >= 14),
      ),
  ).toBe(true);
  expect(
    (await new AxeBuilder({ page }).include("main").analyze()).violations,
  ).toEqual([]);
});
test("wrong separation drawings stay separate from references and clear only current corrupt bytes", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = j.practice.findIndex(
      (q) => q.purityDrawing?.mode === "filtration",
    ),
    q = j.practice[index];
  await task(page, index);
  const root = page.locator(".purity-drawing");
  await root.locator('[data-drawing-field="paper"]').selectOption("receiver");
  await root
    .locator('[data-drawing-field="dissolved"]')
    .selectOption("saltMolecules");
  await page
    .getByRole("button", {
      name: "Save and review separation proposal",
      exact: true,
    })
    .click();
  await expect(root.locator('[data-drawing-field="paper"]')).toHaveValue(
    "receiver",
  );
  await expect(page.locator(".purity-drawing-review")).toContainText(
    "Dissolved ions",
  );
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-drawing-field="paper"]')).toHaveValue(
    "receiver",
  );
  await page.evaluate(
    ({ key, id, sibling }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["purity-and-separation"].drafts[id] = "{exact corrupt bytes";
      data.work["purity-and-separation"].drafts[sibling] = "retained sibling";
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, id: q.id, sibling: j.practice[0].id },
  );
  await page.reload();
  await expect(
    page.getByText("This retained drawing could not be read.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["purity-and-separation"]
          .drafts[id],
      { key: STORAGE_KEY, id: q.id },
    ),
  ).toBe("{exact corrupt bytes");
  await page
    .getByRole("button", { name: "Clear only this drawing", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["purity-and-separation"]
          .drafts[id],
      { key: STORAGE_KEY, id: j.practice[0].id },
    ),
  ).toBe("retained sibling");
});
test("current real filtration asset downloads a wrong proposal and stays optional without WebGL", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 5);
  const root = page.locator(".purity-workbench");
  await root.locator('[data-field="residueSalt"]').fill("1");
  const downloadButton = root.getByRole("button", {
    name: "Download 3D asset",
    exact: true,
  });
  await expect(downloadButton).toBeEnabled();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadButton.click(),
  ]);
  expect(download.suggestedFilename()).toBe(
    "filtration-current-mass-proposal.glb",
  );
  await root
    .getByRole("button", { name: "Check my proposal", exact: true })
    .click();
  await expect(root.locator(".purity-feedback")).toContainText(
    "proposal is retained",
  );
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      if (type.includes("webgl")) return null;
      return original.call(this, type as "2d", ...args) as RenderingContext;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.reload();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(root.locator(".purity-canvas")).toBeHidden();
  await root.locator('[data-field="residueSalt"]').fill("0");
  await root
    .getByRole("button", { name: "Check my proposal", exact: true })
    .click();
  await expect(root.locator(".purity-feedback")).toContainText(
    "match this supplied case",
  );
  await expect(downloadButton).toBeDisabled();
});

test("formulation writing survives reload and its new cold and delayed form stays sealed", async ({
  page,
}, info) => {
  test.setTimeout(240000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, j.practice.length - 1);
  const wrong =
    "It is a pure compound because all ingredient amounts are measured.";
  await page.getByLabel("Your explanation", { exact: true }).fill(wrong);
  await page
    .getByRole("button", { name: "Save and review explanation", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(wrong);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/formulation-${info.project.name}-retained-writing.png`,
    fullPage: true,
    scale: "css",
  });
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < j.checkForms.length; f++) {
    if (f)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
    for (let i = 0; i < j.checkForms[f].length; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = j.checkForms[f][i];
      if (f === 2) {
        await page.getByLabel("Your explanation", { exact: true }).fill(wrong);
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your explanation", { exact: true }),
        ).toHaveValue(wrong);
        await expect(page.getByText(q.answer, { exact: true })).toHaveCount(0);
      } else await answer(page, q);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (f === 2)
        await expect(page.getByText(q.answer, { exact: true })).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Responses ready for self-review",
      exact: true,
    }),
  ).toBeVisible();
  for (const d of await page.locator(".assessment-results details").all())
    await d.locator("summary").click();
  await expect(page.getByText(wrong, { exact: true }).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/formulation-${info.project.name}-reserved-review.png`,
    fullPage: true,
    scale: "css",
  });
  for (let f = 0; f < j.reviewForms.length; f++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Start review →", exact: true }),
    ).toHaveCount(0);
    await saved(page);
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const r of p.work["purity-and-separation"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["purity-and-separation"].run.submitted =
          Date.now() - delay - 1000;
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
    for (let i = 0; i < j.reviewForms[f].length; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = j.reviewForms[f][i];
      if (f === 2)
        await page.getByLabel("Your explanation", { exact: true }).fill(wrong);
      else await answer(page, q);
      if (f === 2)
        await expect(page.getByText(q.answer, { exact: true })).toHaveCount(0);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Responses ready for self-review",
      exact: true,
    }),
  ).toBeVisible();
});
