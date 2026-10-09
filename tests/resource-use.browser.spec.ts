import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { lcaJourney as j } from "../src/content/journeys/life-cycle-assessment";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
import type { LearningTask } from "../src/content/types";
const slug = "life-cycle-and-recycling",
  route = `/lessons/${slug}`;
const dir = path.join(process.cwd(), "test-results/qa/resource-use");
async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function layout(page: Page, control: ReturnType<Page["locator"]>) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await expect(control).toBeVisible();
  const box = (await control.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
}
async function shot(page: Page, name: string) {
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: path.join(dir, name + ".png"),
    fullPage: true,
    scale: "css",
  });
}
async function answer(page: Page, q: LearningTask, wrong = false) {
  if (q.rubric)
    await page
      .getByLabel("Your explanation", { exact: true })
      .fill(wrong ? "1..2 — natural always means renewable" : q.answer);
  else
    await page
      .getByRole("radio", {
        name: wrong ? q.options!.find((o) => o !== q.answer)! : q.answer,
        exact: true,
      })
      .check();
}

test("guided resource decisions and short recall remain usable at fonts-ready 320/390/1280", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    for (const i of [6, 7, 8]) {
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .first()
        .click();
      const first = j.guided[i].rubric
        ? page.getByLabel("Your explanation", { exact: true })
        : page.locator(".question-panel .answer-option").first();
      await layout(page, first);
      await answer(page, j.guided[i], true);
      await page.locator(".sample-check-answer").click();
      await settled(page);
      await page.reload();
      if (j.guided[i].rubric)
        await expect(first).toHaveValue(
          "1..2 — natural always means renewable",
        );
      else
        await expect(
          page.getByRole("radio", {
            name: j.guided[i].options!.find((o) => o !== j.guided[i].answer)!,
            exact: true,
          }),
        ).toBeChecked();
      await shot(page, `${info.project.name}-guided-${i}-${width}`);
    }
  }
});

test("new reserved forms seal criteria, keep wrong drafts, record helped equivalents and gate delayed transfer", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const p = emptyProgress(),
    w = emptyWork();
  const old = Date.now() - REVIEW_DELAY - 1000;
  w.history = ["check", "review"].flatMap((kind) =>
    (kind === "check" ? j.checkForms : j.reviewForms)
      .slice(0, 2)
      .map((form) => ({
        kind: kind as "check" | "review",
        ids: form.map((q) => q.id),
        index: form.length - 1,
        started: old - 1000,
        submitted: old,
        responses: Object.fromEntries(
          form.map((q) => [
            q.id,
            {
              answer: "old wrong work",
              correct: false,
              helped: false,
              fresh: true,
              at: old,
            },
          ]),
        ),
      })),
  );
  p.work[slug] = w;
  await page.addInitScript(
    ({ key, raw }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    },
    { key: STORAGE_KEY, raw: JSON.stringify(p) },
  );
  await page.goto(route);
  // Actual helped equivalent exposure, rather than manufacturing fresh=false markers.
  await page
    .getByRole("button", { name: "Task 8", exact: true })
    .first()
    .click();
  await answer(page, j.guided[7], true);
  await page.locator(".sample-check-answer").click();
  await settled(page);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    if (!i)
      for (const width of [320, 390, 1280]) {
        await page.setViewportSize({ width, height: 664 });
        await layout(
          page,
          page.getByLabel("Your explanation", { exact: true }),
        );
        await shot(page, `${info.project.name}-independent-${width}`);
      }
    await expect(
      page.locator(
        ".assessment-review-criteria,.sample-reference,.lca-workbench",
      ),
    ).toHaveCount(0);
    await answer(page, j.checkForms[2][i], i === 0);
    await settled(page);
    await page.reload();
    if (!i)
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue("1..2 — natural always means renewable");
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await page
    .locator(".assessment-results details")
    .first()
    .locator("summary")
    .click();
  await expect(
    page.locator(".assessment-review-criteria").first(),
  ).toContainText("future generations");
  await expect(page.locator(".results-list > details").first()).toContainText(
    j.checkForms[2][0].referenceResponse!,
  );
  await settled(page);
  const work = await page.evaluate(
    ({ key, slug }) => JSON.parse(localStorage.getItem(key)!).work[slug],
    { key: STORAGE_KEY, slug },
  );
  expect(work.history).toHaveLength(5);
  expect(work.run.responses[j.checkForms[2][0].id]).toMatchObject({
    answer: "1..2 — natural always means renewable",
    correct: false,
    fresh: true,
  });
  expect(work.run.responses[j.checkForms[2][1].id]).toMatchObject({
    correct: false,
    fresh: false,
  });
  expect(work.run.responses[j.checkForms[2][2].id]).toMatchObject({
    correct: true,
    fresh: true,
  });
  await shot(page, `${info.project.name}-submitted-manual`);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await settled(page);
  await page.evaluate(
    ({ key, slug, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      for (const run of data.work[slug].history)
        run.submitted = Date.now() - delay - 1000;
      data.work[slug].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, slug, delay: REVIEW_DELAY },
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
    await expect(
      page.locator(".assessment-review-criteria,.sample-reference"),
    ).toHaveCount(0);
    await answer(page, j.reviewForms[2][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await settled(page);
  const delayed = await page.evaluate(
    ({ key, slug }) => JSON.parse(localStorage.getItem(key)!).work[slug].run,
    { key: STORAGE_KEY, slug },
  );
  expect(delayed.ids).toEqual(j.reviewForms[2].map((q) => q.id));
  expect(delayed.responses[j.reviewForms[2][0].id]).toMatchObject({
    correct: false,
    fresh: true,
  });
  expect(delayed.responses[j.reviewForms[2][1].id].fresh).toBe(false);
  expect(delayed.responses[j.reviewForms[2][2].id].fresh).toBe(true);
  await shot(page, `${info.project.name}-delayed`);
});

test("every item in both new check and review forms fits native widths and keeps criteria sealed", async ({
  browser,
}) => {
  test.setTimeout(240000);
  for (const kind of ["check", "review"] as const) {
    for (const formIndex of [2, 3]) {
      const form = (kind === "check" ? j.checkForms : j.reviewForms)[formIndex];
      for (const width of [320, 390, 1280]) {
        const data = emptyProgress(),
          work = emptyWork();
        work.section = kind;
        work.run = {
          kind,
          ids: form.map((q) => q.id),
          index: 0,
          started: Date.now(),
          responses: {},
        };
        if (kind === "review")
          work.history = [
            {
              kind: "check",
              ids: j.checkForms[formIndex].map((q) => q.id),
              index: 2,
              started: Date.now() - REVIEW_DELAY - 2000,
              submitted: Date.now() - REVIEW_DELAY - 1000,
              responses: Object.fromEntries(
                j.checkForms[formIndex].map((q) => [
                  q.id,
                  {
                    answer: "old wrong work",
                    correct: false,
                    helped: false,
                    fresh: true,
                    at: Date.now() - REVIEW_DELAY - 1000,
                  },
                ]),
              ),
            },
          ];
        data.work[slug] = work;
        const context = await browser.newContext({
          viewport: { width, height: 664 },
        });
        try {
          const page = await context.newPage();
          await page.addInitScript(
            ({ key, raw }) => {
              if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
            },
            { key: STORAGE_KEY, raw: JSON.stringify(data) },
          );
          await page.goto(route);
          for (let index = 0; index < form.length; index++) {
            if (index)
              await page
                .getByRole("button", { name: "Next question →", exact: true })
                .click();
            const q = form[index];
            const control = q.rubric
              ? page.getByLabel("Your explanation", { exact: true })
              : page.locator(".question-panel .answer-option").first();
            await layout(page, control);
            await expect(
              page.locator(
                ".assessment-review-criteria,.sample-reference,.lca-workbench",
              ),
            ).toHaveCount(0);
            await answer(page, q, true);
            await settled(page);
            await page.reload();
            if (q.rubric)
              await expect(control).toHaveValue(
                "1..2 — natural always means renewable",
              );
            await page
              .getByRole("button", { name: "Record answer", exact: true })
              .click();
          }
          await page
            .getByRole("button", { name: "Submit whole set", exact: true })
            .click();
          await page
            .locator(".results-list > details")
            .first()
            .locator(":scope > summary")
            .click();
          await expect(
            page.locator(".results-list > details").first(),
          ).toContainText(form[0].referenceResponse!);
        } finally {
          await context.close();
        }
      }
    }
  }
});
