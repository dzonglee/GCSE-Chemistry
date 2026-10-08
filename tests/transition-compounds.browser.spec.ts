import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { transitionMetalsJourney as journey } from "../src/content/journeys/transition-metals";
import { transitionCompounds as added } from "../src/content/journeys/transition-compounds";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/transition-metals";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/transition-compounds", { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/transition-compounds/${name}.png`,
    fullPage: !name.endsWith("opening"),
  });
}
async function opening(page: Page, model = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  const control = page
    .locator(
      model
        ? ".task-workbench select"
        : ".question-panel .answer-option, .question-panel input, .question-panel textarea",
    )
    .first();
  const b = (await control.boundingBox())!;
  expect.soft(b.height).toBeGreaterThanOrEqual(44);
  expect
    .soft(
      b.y + b.height,
      `${await page.locator(".sample-task-panel > h2, .assessment-session .question-panel h2").first().innerText()} at ${page.viewportSize()!.width}px`,
    )
    .toBeLessThanOrEqual(664);
  expect
    .soft(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
}
async function answer(page: Page, q: Question, raw?: string) {
  if (q.options)
    await page
      .getByRole("radio", { name: raw ?? q.answer, exact: true })
      .check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(raw ?? q.answer);
}
async function chooseTask(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function complete(page: Page, form: Question[]) {
  for (let i = 0; i < form.length; i++) {
    await opening(page);
    await answer(page, form[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < form.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
test("cobalt paper predictions retain a wrong colour, reset and undo without calling the compound cobalt metal", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Task 6", exact: true }).click();
  const condition = page.getByLabel("Paper condition", { exact: true }),
    colour = page.getByLabel("Your colour prediction", { exact: true });
  await expect(colour).toHaveValue("unset");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".transition-workbench [role=status]"),
  ).toContainText("blank");
  await condition.selectOption("wet");
  await colour.selectOption("blue");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".transition-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await page.reload();
  await expect(condition).toHaveValue("wet");
  await expect(colour).toHaveValue("blue");
  await colour.selectOption("pink");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".transition-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await expect(
    page.locator(".transition-workbench [role=status]"),
  ).toContainText("not cobalt metal");
  await shot(page, `${info.project.name}-cobalt-guided`);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(colour).toHaveValue("blue");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(condition).toHaveValue("dry");
  await expect(colour).toHaveValue("unset");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("all teaching tasks open at 320, 390 and desktop with full response controls and honest supplied evidence", async ({
  browser,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 1280])
    for (const stage of [
      "warmup",
      "refresher",
      "guided",
      "practice",
    ] as const) {
      const context = await browser.newContext({
        ...devices[
          info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
        ],
        viewport: { width, height: 720 },
      });
      const page = await context.newPage();
      await page.goto(route);
      if (stage === "refresher") {
        await page.getByRole("button", { name: "Task 6", exact: true }).click();
        await answer(
          page,
          added.guided[1],
          added.guided[1].options!.find((o) => o !== added.guided[1].answer),
        );
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await page
          .locator(".question-panel")
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
      } else if (stage === "warmup")
        await page
          .getByRole("button", { name: "Warm-up", exact: true })
          .click();
      else if (stage === "practice")
        await page
          .getByRole("button", { name: "Practise", exact: true })
          .click();
      for (const q of journey[stage]) {
        const n = journey[stage].findIndex((t) => t.id === q.id) + 1;
        await chooseTask(page, n);
        await opening(page, !!q.model);
        if (q.rubric) {
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue("");
          await expect(page.getByText(q.answer, { exact: true })).toHaveCount(
            0,
          );
        }
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      if (stage === "practice")
        await shot(page, `${info.project.name}-${width}-practice-opening`);
      await context.close();
    }
});
test("third independent form hides criteria until submission and retains a mistaken chemical explanation", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const form of journey.checkForms.slice(0, 2)) {
    await complete(page, form);
    await page
      .getByRole("button", { name: "Try the next form", exact: true })
      .click();
  }
  await opening(page);
  await answer(page, added.check[0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await opening(page);
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("");
  await shot(page, `${info.project.name}-independent-opening`);
  const wrong = "Chromium metal is yellow; every ion has charge 6+. 1..2";
  await answer(page, added.check[1], wrong);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(wrong);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await opening(page);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("");
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await answer(
    page,
    added.check[2],
    "Coloured compounds; different ion charges.",
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await page
    .locator(".results-list > details")
    .filter({ hasText: added.check[1].prompt })
    .locator("summary")
    .click();
  await expect(
    page
      .locator(".results-list > details")
      .nth(1)
      .locator(".assessment-review-criteria"),
  ).toContainText("Colour alone");
  await expect(page.getByText(wrong, { exact: true })).toBeVisible();
  await shot(page, `${info.project.name}-submitted-explanation`);
  const physical = page.locator(".results-list > details").nth(2);
  await physical.locator(":scope > summary").click();
  await expect(physical).toContainText(
    "Coloured compounds; different ion charges.",
  );
  await expect(physical.locator(".assessment-review-criteria")).toContainText(
    "physical comparisons",
  );
  await expect(physical.locator(".result-self-review")).toHaveText(
    "Self-review",
  );
  await shot(page, `${info.project.name}-physical-comparison-feedback`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("the third delayed form stays locked until seven days and keeps explanations manual", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          sessionStorage.getItem("gcse-chemistry.pending.v1"),
        ),
      )
      .toBeNull();
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const run of p.work["transition-metals"].history)
          run.submitted = Date.now() - delay - 1000;
        p.work["transition-metals"].run.submitted = Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: i === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (i === 2) {
      await opening(page);
      await answer(page, added.review[0]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
      await opening(page);
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue("");
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      await shot(page, `${info.project.name}-delayed-opening`);
      await answer(page, added.review[1]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
      await opening(page);
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue("");
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      await shot(page, `${info.project.name}-physical-review-opening`);
      await answer(page, added.review[2]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      await expect(page.locator(".assessment-results")).toContainText(
        "self-review",
      );
    } else await complete(page, journey.reviewForms[i]);
    await expect(
      page.getByRole("button", { name: "Try the next form", exact: true }),
    ).toBeDisabled();
  }
});
