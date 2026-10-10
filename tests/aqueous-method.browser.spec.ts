import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { aqueousProductsJourney as j } from "../src/content/journeys/aqueous-products";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
  exposureIds,
} from "../src/lib/progress";
const route = "/lessons/aqueous-electrolysis-products";
const dir = path.join(process.cwd(), "test-results/qa/aqueous-method");
async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function ready(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}
async function layout(page: Page, selector: string) {
  await ready(page);
  await expect(page.locator(selector).first()).toBeVisible();
  const box = (await page.locator(selector).first().boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const sizes = await page.locator("svg text").evaluateAll((nodes) =>
    nodes.map((node) => {
      const text = node as SVGTextElement,
        transform = text.getScreenCTM();
      return (
        parseFloat(getComputedStyle(text).fontSize) *
        (transform ? Math.hypot(transform.a, transform.b) : 1)
      );
    }),
  );
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
}
async function shot(page: Page, name: string) {
  fs.mkdirSync(dir, { recursive: true });
  await ready(page);
  await page.screenshot({
    path: path.join(dir, name + ".png"),
    fullPage: true,
    scale: "css",
  });
}

test("all explanation practice retains wrong writing and manual criteria", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.getByRole("button", { name: "Practise", exact: true }).click();
    for (const n of [22]) {
      await page
        .getByRole("button", { name: `Task ${n}`, exact: true })
        .first()
        .click();
      await layout(page, ".written-answer textarea");
      if (width > 600)
        await expect
          .poll(() =>
            page.locator(".sample-task-jump-buttons").evaluate((nav) => {
              const active = nav.querySelector('[aria-current="step"]')!;
              const frame = nav.getBoundingClientRect(),
                tab = active.getBoundingClientRect();
              return tab.left >= frame.left && tab.right <= frame.right;
            }),
          )
          .toBe(true);
      const input = page.getByLabel("Your explanation", { exact: true }),
        raw = "1..2 — copper forms at positive electrode; bubbles prove oxygen";
      await input.fill(raw);
      await settled(page);
      await page.reload();
      await expect(input).toHaveValue(raw);
      if (width > 600)
        await expect
          .poll(() =>
            page.locator(".sample-task-jump-buttons").evaluate((nav) => {
              const active = nav.querySelector('[aria-current="step"]')!;
              const frame = nav.getBoundingClientRect(),
                tab = active.getBoundingClientRect();
              return tab.left >= frame.left && tab.right <= frame.right;
            }),
          )
          .toBe(true);
      await page.locator(".sample-check-answer").click();
      await expect(page.locator(".question-panel .feedback")).toContainText(
        "Compare",
      );
      await shot(page, `${info.project.name}-practice-${n}-${width}`);
    }
  }
});
test("both full reserved forms retain raw writing, hide criteria and unlock changed contexts only after seven days", async ({
  browser,
}, info) => {
  test.setTimeout(240000);
  for (const f of [2, 3]) {
    const data = emptyProgress(),
      w = emptyWork(),
      old = Date.now() - REVIEW_DELAY - 2000;
    w.section = "check";
    w.history = (["review", "check"] as const).flatMap((kind) =>
      (kind === "check" ? j.checkForms : j.reviewForms)
        .slice(0, f)
        .map((form) => ({
          kind,
          ids: form.map((q) => q.id),
          index: form.length - 1,
          started: old - 1000,
          submitted: old,
          responses: Object.fromEntries(
            form.map((q) => [
              q.id,
              {
                answer: q.answer,
                correct: !q.rubric,
                helped: true,
                fresh: false,
                at: old,
              },
            ]),
          ),
        })),
    );
    data.work["aqueous-electrolysis-products"] = w;
    for (const run of w.history) for (const id of run.ids) data.seen[id] = old;
    const c = await browser.newContext({
      viewport: { width: 320, height: 664 },
    });
    try {
      const page = await c.newPage();
      await page.addInitScript(
        ({ key, raw }) => {
          if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
        },
        { key: STORAGE_KEY, raw: JSON.stringify(data) },
      );
      await page.goto(route);
      await page
        .getByRole("button", {
          name: "Start understanding check →",
          exact: true,
        })
        .click();
      for (const kind of ["check", "review"] as const) {
        const form = (kind === "check" ? j.checkForms : j.reviewForms)[f];
        for (const [i, q] of form.entries()) {
          if (i)
            await page
              .getByRole("button", { name: "Next question →", exact: true })
              .click();
          for (const width of [320, 390, 1280]) {
            await page.setViewportSize({ width, height: 664 });
            await layout(page, ".written-answer textarea");
            await expect(
              page.locator(
                ".assessment-review-criteria,.sample-reference,.task-workbench,.results-list",
              ),
            ).toHaveCount(0);
            await shot(
              page,
              `${info.project.name}-${kind}-${f}-item-${i}-${width}`,
            );
          }
          const raw =
            kind === "review"
              ? q.answer
              : "1..2 — copper forms at positive electrode; bubbles prove oxygen";
          const input = page.getByLabel("Your explanation", { exact: true });
          await input.fill(raw);
          await settled(page);
          await page.reload();
          await expect(input).toHaveValue(raw);
          await page
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          await settled(page);
          await expect(
            page.locator(".assessment-review-criteria,.results-list"),
          ).toHaveCount(0);
        }
        await page
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await settled(page);
        await expect(page.locator(".results-banner")).toContainText(
          "1 of 1 responses saved for self-review",
        );
        await expect(page.locator(".results-banner")).toContainText(
          "no automatic score is assigned",
        );
        const saved = await page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "aqueous-electrolysis-products"
            ].history.at(-1),
          STORAGE_KEY,
        );
        expect(saved.ids).toEqual(form.map((q) => q.id));
        for (const q of form) {
          expect(saved.responses[q.id].correct).toBe(false);
          expect(saved.responses[q.id].helped).toBe(false);
        }
        for (const [i, q] of form.entries()) {
          const row = page.locator(".results-list > details").nth(i);
          await row.locator(":scope > summary").click();
          await expect(
            row.locator(".assessment-review-criteria"),
          ).toBeVisible();
          await row.locator(".sample-reference > summary").click();
          await expect(row.locator(".sample-reference")).toBeVisible();
          await expect(row.locator(".sample-reference")).toContainText(
            q.answer,
          );
        }
        await shot(page, `${info.project.name}-${kind}-${f}-submitted`);
        if (kind === "check") {
          await page
            .getByRole("button", { name: "Review", exact: true })
            .click();
          await expect(
            page.getByRole("button", { name: "Start review →", exact: true }),
          ).toHaveCount(0);
          await page.clock.setSystemTime(Date.now() + REVIEW_DELAY + 3000);
          await page.reload();
          await page
            .getByRole("button", { name: "Start review →", exact: true })
            .click();
        }
      }
    } finally {
      await c.close();
    }
  }
});

test("guided hypothesis opens with a complete accessible response on native widths", async ({
  page,
}, info) => {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await page
      .getByRole("button", { name: "Task 7", exact: true })
      .first()
      .click();
    await layout(page, ".written-answer textarea");
    await shot(page, `${info.project.name}-guided-${width}`);
  }
});

test("every original sealed aqueous question has a complete first response within664px at320/390/1280", async ({
  browser,
}, info) => {
  test.setTimeout(240000);
  for (const kind of ["check", "review"] as const)
    for (const f of [0, 1]) {
      const data = emptyProgress(),
        work = emptyWork(),
        form = (kind === "check" ? j.checkForms : j.reviewForms)[f],
        old = Date.now() - REVIEW_DELAY - 2000;
      work.section = kind;
      work.run = {
        kind,
        ids: form.map((q) => q.id),
        index: 0,
        started: Date.now(),
        responses: {},
      };
      if (kind === "review") {
        const previous = j.checkForms[f];
        work.history = [
          {
            kind: "check",
            ids: previous.map((q) => q.id),
            index: previous.length - 1,
            started: old - 1000,
            submitted: old,
            responses: Object.fromEntries(
              previous.map((q) => [
                q.id,
                {
                  answer: q.answer,
                  correct: !q.rubric,
                  helped: false,
                  fresh: false,
                  at: old,
                },
              ]),
            ),
          },
        ];
        data.seen = Object.fromEntries(
          exposureIds(previous.map((q) => q.id)).map((id) => [id, old]),
        );
      }
      data.work["aqueous-electrolysis-products"] = work;
      const context = await browser.newContext({
        viewport: { width: 320, height: 664 },
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
        for (const [i] of form.entries()) {
          if (i)
            await page
              .getByRole("button", { name: "Next question →", exact: true })
              .click();
          const selector =
            ".question-panel .answer-option,.question-panel input:not([type=checkbox]),.question-panel textarea,.question-panel select";
          for (const width of [320, 390, 1280]) {
            await page.setViewportSize({ width, height: 664 });
            await expect(page.locator(selector).first()).toBeVisible();
            await layout(page, selector);
            await expect(
              page.locator(
                ".assessment-review-criteria,.results-list,.sample-reference,.task-workbench",
              ),
            ).toHaveCount(0);
            if (!i)
              await shot(
                page,
                `${info.project.name}-original-${kind}-${f}-${width}`,
              );
          }
          // Native layout and sealing are tested independently of answer correctness.
          await page
            .getByRole("button", { name: "Leave unanswered", exact: true })
            .click();
          await settled(page);
        }
        await page
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await settled(page);
        const actual = await page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "aqueous-electrolysis-products"
            ],
          STORAGE_KEY,
        );
        expect(actual.history.at(-1).ids).toEqual(form.map((q) => q.id));
      } finally {
        await context.close();
      }
    }
});
