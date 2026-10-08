import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { periodicDevelopmentJourney as journey } from "../src/content/journeys/periodic-development";
import { periodicDevelopmentWriting as added } from "../src/content/journeys/periodic-development-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/periodic-development";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/periodic-development-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/periodic-development-writing/${name}.png`,
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
async function answer(page: Page, q: Question, raw = q.answer) {
  if (q.options)
    await page.getByRole("radio", { name: raw, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(raw);
}
async function choose(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function complete(page: Page, form: Question[]) {
  for (let i = 0; i < form.length; i++) {
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

test("every teaching task opens at 320, 390 and desktop with a full response control", async ({
  browser,
}, info) => {
  test.setTimeout(150000);
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
      if (stage === "warmup")
        await page
          .getByRole("button", { name: "Warm-up", exact: true })
          .click();
      if (stage === "refresher") {
        const q = journey.guided[0];
        await answer(
          page,
          q,
          q.options!.find((o) => o !== q.answer)!,
        );
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await page
          .locator(".question-panel")
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
      }
      if (stage === "practice")
        await page
          .getByRole("button", { name: "Practise", exact: true })
          .click();
      for (let i = 0; i < journey[stage].length; i++) {
        await choose(page, i + 1);
        await opening(page, !!journey[stage][i].model);
        if (journey[stage][i].rubric) {
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue("");
          await expect(
            page.getByText(journey[stage][i].answer, { exact: true }),
          ).toHaveCount(0);
        }
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      if (stage === "practice")
        await shot(page, `${info.project.name}-${width}-practice-opening`);
      await context.close();
    }
});

test("new historical explanations hide criteria, retain wrong chronology and assign no automatic score", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
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
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("");
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await shot(page, `${info.project.name}-historical-explanation-opening`);
  const wrong =
    "Mendeleev measured all electron shells and changed the observations. 1..2";
  await answer(page, added.check[0], wrong);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(wrong);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await opening(page);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("");
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await shot(page, `${info.project.name}-conflicting-evidence-opening`);
  await answer(
    page,
    added.check[1],
    "A close weight proves the metal prediction even for a non-metal.",
  );
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
  await shot(page, `${info.project.name}-isotope-insight-opening`);
  await answer(
    page,
    added.check[2],
    "All isotopes have different proton numbers and fractional neutrons.",
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Responses ready for self-review",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).not.toContainText("0 correct");
  await expect(page.locator(".results-banner")).not.toContainText(
    "count above",
  );
  await expect(page.locator(".results-banner")).toContainText(
    "no automatic score is assigned",
  );
  for (let i = 0; i < 3; i++) {
    const row = page.locator(".results-list > details").nth(i);
    await row.locator(":scope > summary").click();
    await expect(row.locator(".result-self-review")).toHaveText("Self-review");
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
  }
  await expect(page.getByText(wrong, { exact: true })).toBeVisible();
  await expect(page.locator(".results-list")).toContainText("chemical");
  await shot(page, `${info.project.name}-retained-wrong-explanations`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("delayed explanations remain seven-day gated and retain original review forms", async ({
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
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".assessment-session")).toHaveCount(0);
  await expect(
    page.getByText("Review is available from", { exact: false }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work["periodic-development"]
              .section,
          STORAGE_KEY,
        ),
      )
      .toBe("review");
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
        for (const run of p.work["periodic-development"].history)
          run.submitted = Date.now() - delay - 1000;
        p.work["periodic-development"].run.submitted =
          Date.now() - delay - 1000;
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
    if (i < 2) await complete(page, journey.reviewForms[i]);
    else {
      for (let n = 0; n < 2; n++) {
        await opening(page);
        await expect(
          page.getByLabel("Your explanation", { exact: true }),
        ).toHaveValue("");
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
        await shot(
          page,
          `${info.project.name}-${n === 0 ? "history" : "evidence"}-delayed-opening`,
        );
        await answer(page, added.review[n]);
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        if (n === 0)
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
      }
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: "Responses ready for self-review",
          exact: true,
        }),
      ).toBeVisible();
      await shot(page, `${info.project.name}-delayed-submitted`);
    }
    await expect(
      page.getByRole("button", { name: "Try the next form", exact: true }),
    ).toBeDisabled();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("prediction testing preserves incorrect evidence claims, keyboard changes and reversible record history", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await opening(page, true);
  await expect(
    page.getByText("Invented classroom records; ion language is modern.", {
      exact: true,
    }),
  ).toBeVisible();
  const record = page.getByLabel("Discovery record", { exact: true });
  const verdict = page.getByLabel("Evidence conclusion", { exact: true });
  const feedback = page.locator(".historical-test-workbench [role=status]");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(feedback).not.toHaveClass(/correct/);
  await expect(feedback).toContainText("non-metal");
  await verdict.focus();
  await verdict.press("ArrowDown");
  await verdict.press("Enter");
  await expect(verdict).toHaveValue("investigate");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(feedback).toHaveClass(/correct/);
  await expect(
    page.getByRole("region", {
      name: "Observed discovery record",
      exact: true,
    }),
  ).toContainText("Y: a non-metal");
  await record.selectOption("match");
  await expect(verdict).toHaveValue("investigate");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(feedback).not.toHaveClass(/correct/);
  await verdict.selectOption("proof");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(feedback).not.toHaveClass(/correct/);
  await expect(feedback).toContainText("permanently prove");
  await page.reload();
  await expect(record).toHaveValue("match");
  await expect(verdict).toHaveValue("proof");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(verdict).toHaveValue("investigate");
  await verdict.selectOption("support");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(feedback).toHaveClass(/correct/);
  await shot(page, `${info.project.name}-matching-discovery`);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(record).toHaveValue("conflict");
  await expect(verdict).toHaveValue("support");
  await verdict.selectOption("investigate");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await shot(page, `${info.project.name}-conflicting-discovery`);
  const about = page.getByText("About these records", { exact: true });
  await about.press("Enter");
  await expect(
    page.locator(".historical-test-workbench details[open]"),
  ).toContainText("invented classroom candidates");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
