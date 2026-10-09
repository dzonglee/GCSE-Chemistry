import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { electrolysisJourney as j } from "../src/content/journeys/electrolysis";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const route = "/lessons/electrolysis";
const dir = path.join(process.cwd(), "test-results/qa/electrolysis-writing");
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
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
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
    for (const n of [21, 22]) {
      await page
        .getByRole("button", { name: `Task ${n}`, exact: true })
        .first()
        .click();
      await layout(page, ".written-answer textarea");
      const input = page.getByLabel("Your explanation", { exact: true }),
        raw = "1..2 — cryolite is a catalyst; graphite only wears away";
      await input.fill(raw);
      await settled(page);
      await page.reload();
      await expect(input).toHaveValue(raw);
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
                helped: false,
                fresh: true,
                at: old,
              },
            ]),
          ),
        })),
    );
    data.work.electrolysis = w;
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
              : "1..2 — cryolite is a catalyst; graphite wears away; H2 forms";
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
          "3 of 3 responses saved for self-review",
        );
        await expect(page.locator(".results-banner")).toContainText(
          "no automatic score is assigned",
        );
        const saved = await page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work.electrolysis.history.at(
              -1,
            ),
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
          await expect(row).toContainText(q.answer);
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
