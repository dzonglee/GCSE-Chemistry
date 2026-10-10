import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { nanoparticlesJourney as journey } from "../src/content/journeys/nanoparticles";
import { nanoSizeAdditions as added } from "../src/content/journeys/nano-size-ranges";
import type { Question, LearningStage } from "../src/content/types";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";

const route = "/lessons/particles-and-nanoparticles";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function answer(page: Page, q: Question, raw = q.answer) {
  if (q.parts) {
    const values = JSON.parse(raw);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: raw, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(raw);
}
async function complete(page: Page, form: Question[]) {
  for (const [index, q] of form.entries()) {
    await answer(page, q);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (index < form.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toBeVisible();
  await saved(page);
}
async function startLastCheck(page: Page) {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const form of journey.checkForms.slice(0, -1)) {
    await complete(page, form);
    await page
      .getByRole("button", { name: "Try the next form", exact: true })
      .click();
  }
}
async function due(page: Page) {
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      const work = p.work["particles-and-nanoparticles"];
      for (const run of work.history) run.submitted = Date.now() - delay - 1000;
      if (work.run?.submitted) work.run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
}
async function opening(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  const box = await page
    .locator(".question-panel input, .question-panel textarea")
    .first()
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const fonts = await page
    .locator(".question-panel svg text")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const matrix = (node as SVGGraphicsElement).getScreenCTM()!;
        return (
          parseFloat(getComputedStyle(node).fontSize) *
          Math.hypot(matrix.a, matrix.b)
        );
      }),
    );
  if (fonts.length) expect(Math.min(...fonts)).toBeGreaterThanOrEqual(12);
}

test("size chart keeps wrong and malformed raw ranges through reload, with no automatic repair", async ({
  page,
}) => {
  await page.goto(route);
  await page
    .getByRole("button", { name: `Task ${journey.guided.length}`, exact: true })
    .first()
    .click();
  await expect(page.getByRole("table")).toContainText("Coarse / dust");
  await expect(page.locator("[data-size-range]")).toHaveCount(0);
  await answer(page, added.guided);
  await page.getByLabel("Nano lower limit", { exact: true }).fill("10");
  await expect(page.locator('[data-size-range="nano"] > line')).toHaveAttribute(
    "x1",
    "133.75",
  );
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback")).not.toContainText(
    "That’s right",
  );
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Nano lower limit", { exact: true }),
  ).toHaveValue("10");
  await expect(page.locator('[data-size-range="nano"] > line')).toHaveAttribute(
    "x1",
    "133.75",
  );
  await page.getByLabel("Nano lower limit", { exact: true }).fill("1..2");
  await expect(page.locator('[data-size-range="nano"]')).toHaveCount(0);
  await expect(
    page.getByText(/Not plotted: Nano: 1\.\.2 to 100 nm/),
  ).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Nano lower limit", { exact: true }),
  ).toHaveValue("1..2");
  await answer(page, added.guided);
  await expect(page.locator("[data-size-range]")).toHaveCount(3);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "That’s right",
  );
  await page.getByRole("button", { name: "Clear answer", exact: true }).click();
  await expect(page.locator("[data-size-range]")).toHaveCount(0);
  await expect(
    page.getByLabel("Nano lower limit", { exact: true }),
  ).toHaveValue("");
});

test("all appended teaching responses fit phone and desktop openings with accessible unmarked graphics", async ({
  browser,
}) => {
  test.setTimeout(180000);
  const cases: [LearningStage, number][] = [
    ["refresher", journey.refresher.length - 1],
    ["guided", journey.guided.length - 1],
    ["practice", journey.practice.length - 2],
    ["practice", journey.practice.length - 1],
  ];
  for (const width of [320, 390, 1280])
    for (const [stage, index] of cases) {
      const context = await browser.newContext({
        viewport: { width, height: width === 1280 ? 720 : 664 },
      });
      const page = await context.newPage();
      const progress = emptyProgress(),
        work = emptyWork();
      work.section = stage === "practice" ? "practice" : "explore";
      work.learning = { version: 1, stage, index };
      progress.work["particles-and-nanoparticles"] = work;
      await page.addInitScript(
        ({ key, raw }) => {
          if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
        },
        { key: STORAGE_KEY, raw: JSON.stringify(progress) },
      );
      await page.goto(route);
      await opening(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      if (stage === "practice")
        await expect(page.getByRole("table")).toHaveCount(0);
      await context.close();
    }
});

test("new independent ranges and dust writing seal feedback until submission and retain malformed drafts", async ({
  page,
}) => {
  test.setTimeout(180000);
  await startLastCheck(page);
  await expect(
    page.getByRole("heading", { name: "Particle limits", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".question-panel svg, .question-panel table"),
  ).toHaveCount(0);
  await answer(page, added.check[0]);
  await page.getByLabel("Fine upper limit", { exact: true }).fill("1..2");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Fine upper limit", { exact: true }),
  ).toHaveValue("1..2");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".session-heading")).toContainText(
    "0 / 2 recorded",
  );
  await page.getByLabel("Fine upper limit", { exact: true }).fill("2500");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  const raw = "Fine dust; I multiplied 1..2 and called it a volume comparison.";
  await answer(page, added.check[1], raw);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(raw);
  await expect(
    page.getByText(added.check[1].answer, { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toContainText("1 of 1");
  await saved(page);
  await expect
    .poll(() =>
      page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "particles-and-nanoparticles"
          ].run.responses[id].correct,
        { key: STORAGE_KEY, id: added.check[1].id },
      ),
    )
    .toBe(false);
  const row = page.locator(".results-list > details").last();
  await row.locator(":scope > summary").click();
  await expect(row).toContainText(raw);
  for (const criterion of added.check[1].rubric!)
    await expect(row).toContainText(criterion);
  await expect(row.locator(".result-self-review")).toBeVisible();
});

test("new delayed ranges and size comparisons remain hidden until the seven-day review and whole-set submission", async ({
  page,
}) => {
  test.setTimeout(240000);
  await startLastCheck(page);
  await complete(page, added.check);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  for (let form = 0; form < journey.reviewForms.length; form++) {
    await due(page);
    await page
      .getByRole("button", {
        name: form === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (form < journey.reviewForms.length - 1)
      await complete(page, journey.reviewForms[form]);
    else {
      await expect(
        page.getByRole("heading", { name: "Retrieve ranges", exact: true }),
      ).toBeVisible();
      await expect(
        page.locator(".question-panel svg, .question-panel table"),
      ).toHaveCount(0);
      await answer(page, added.review[0]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
      await expect(
        page.getByText(added.review[1].answer, { exact: true }),
      ).toHaveCount(0);
      await answer(page, added.review[1]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      await expect(page.locator(".results-banner")).toContainText("1 of 1");
      await saved(page);
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "particles-and-nanoparticles"
              ].run.responses[id].correct,
            { key: STORAGE_KEY, id: added.review[1].id },
          ),
        )
        .toBe(false);
    }
  }
});
