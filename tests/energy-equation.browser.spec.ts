import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { practicalJourney as j } from "../src/content/journeys/energy-practical";
import {
  energyEquationGuided as g,
  energyEquationPractice as p,
} from "../src/content/journeys/energy-linear-equation";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const route = "/lessons/energy-practical";
const dir = path.join(process.cwd(), "test-results/qa/energy-equation");
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

test("equation interpretation and short coefficient responses at fonts-ready320/390/1280 retain wrong work", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await page
      .getByRole("button", { name: "Task 8", exact: true })
      .first()
      .click();
    await layout(page, ".question-panel .answer-option");
    const wrong = g.options![0];
    await page.getByRole("radio", { name: wrong, exact: true }).check();
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "m multiplies x",
    );
    await settled(page);
    await page.reload();
    await expect(
      page.getByRole("radio", { name: wrong, exact: true }),
    ).toBeChecked();
    await shot(page, `${info.project.name}-guided-${width}`);
    await page.getByRole("button", { name: "Practise", exact: true }).click();
    await page
      .getByRole("button", { name: "Task 25", exact: true })
      .first()
      .click();
    await layout(page, ".multipart-answer input");
    await page.getByLabel("m / °C/g", { exact: true }).fill("1..2");
    await page.getByLabel("c / °C", { exact: true }).fill("23.8");
    await page.locator(".sample-check-answer").click();
    await settled(page);
    await page.reload();
    await expect(page.getByLabel("m / °C/g", { exact: true })).toHaveValue(
      "1..2",
    );
    await expect(page.getByLabel("c / °C", { exact: true })).toHaveValue(
      "23.8",
    );
    await shot(page, `${info.project.name}-raw-coefficients-${width}`);
    // Invalid strings remain drafts; a valid wrong response unlocks the recovery route.
    await page.getByLabel("m / °C/g", { exact: true }).fill("0.4");
    await page.locator(".sample-check-answer").click();
    await page
      .getByRole("button", { name: "Revisit the key idea", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Read y=mx+c", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Return to your task →", exact: true })
      .click();
    await expect(page.getByLabel("m / °C/g", { exact: true })).toHaveValue(
      "0.4",
    );
    await page.getByLabel("m / °C/g", { exact: true }).fill("-0.4");
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "right",
    );
    await settled(page);
    expect(j.practice.at(-1)!.id).toBe(p.id);
  }
});

test("both reserved equation pairs retain invalid drafts, defer marking and require seven days for changed fits", async ({
  browser,
}, info) => {
  test.setTimeout(240000);
  for (const formIndex of [2, 3]) {
    const data = emptyProgress(),
      work = emptyWork(),
      old = Date.now() - REVIEW_DELAY - 1000;
    work.section = "check";
    work.history = (["review", "check"] as const).flatMap((kind) =>
      (kind === "check" ? j.checkForms : j.reviewForms)
        .slice(0, formIndex)
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
    data.work["energy-practical"] = work;
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
      await page
        .getByRole("button", {
          name: "Start understanding check →",
          exact: true,
        })
        .click();
      for (const kind of ["check", "review"] as const) {
        const form = (kind === "check" ? j.checkForms : j.reviewForms)[
          formIndex
        ];
        for (const [index, q] of form.entries()) {
          if (index)
            await page
              .getByRole("button", { name: "Next question →", exact: true })
              .click();
          for (const width of [320, 390, 1280]) {
            await page.setViewportSize({ width, height: 664 });
            await layout(
              page,
              q.parts
                ? ".multipart-answer input"
                : '[aria-label="Your answer"]',
            );
            await expect(
              page.locator(
                ".sample-reference,.results-list,.assessment-review-criteria,.task-workbench",
              ),
            ).toHaveCount(0);
            await shot(
              page,
              `${info.project.name}-${kind}-form-${formIndex}-item-${index}-${width}`,
            );
          }
          if (q.parts) {
            for (const part of q.parts)
              await page
                .getByLabel(part.label, { exact: true })
                .fill(part.id === "m" ? "1..2" : String(part.answer));
          } else
            await page.getByLabel("Your answer", { exact: true }).fill("1..2");
          await page
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          await settled(page);
          await page.reload();
          await expect(
            q.parts
              ? page.getByLabel("m / °C/g", { exact: true })
              : page.getByLabel("Your answer", { exact: true }),
          ).toHaveValue("1..2");
          const responses = await page.evaluate(
            (key) =>
              JSON.parse(localStorage.getItem(key)!).work["energy-practical"]
                .run.responses,
            STORAGE_KEY,
          );
          expect(responses[q.id]).toBeUndefined();
          if (q.parts) {
            for (const part of q.parts)
              await page
                .getByLabel(part.label, { exact: true })
                .fill(kind === "check" ? "0" : String(part.answer));
          } else
            await page
              .getByLabel("Your answer", { exact: true })
              .fill(kind === "check" ? "0" : q.answer);
          await page
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          await expect(page.locator(".results-list")).toHaveCount(0);
        }
        await page
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await settled(page);
        const saved = await page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work["energy-practical"].run,
          STORAGE_KEY,
        );
        expect(saved.ids).toEqual(form.map((q) => q.id));
        for (const q of form)
          expect(saved.responses[q.id]).toMatchObject({
            correct: kind === "review",
            fresh: true,
            helped: false,
          });
        await page
          .locator(".results-list > details")
          .first()
          .locator(":scope > summary")
          .click();
        await expect(page.locator(".results-list")).toContainText(
          String(form[0].parts![1].answer),
        );
        await shot(
          page,
          `${info.project.name}-${kind}-form-${formIndex}-submitted`,
        );
        if (kind === "check") {
          await page
            .getByRole("button", { name: "Review", exact: true })
            .click();
          await expect(
            page.getByRole("button", { name: "Start review →", exact: true }),
          ).toHaveCount(0);
          await settled(page);
          await page.clock.setSystemTime(Date.now() + REVIEW_DELAY + 1000);
          await page.reload();
          await page
            .getByRole("button", { name: "Start review →", exact: true })
            .click();
        }
      }
    } finally {
      await context.close();
    }
  }
});
