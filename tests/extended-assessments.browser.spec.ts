import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { paper1Foundation as paper } from "../src/content/extended-assessments";
import { STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = `/exams/${paper.slug}`;
const workId = `assessment-${paper.slug}`;
const dir = "test-results/qa/extended-paper1-foundation";

async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function screenshot(page: Page, device: string, name: string) {
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(async () => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.screenshot({
    path: `${dir}/${device}-${name}.png`,
    fullPage: true,
  });
  if (device === "desktop" && (await page.locator(".question-panel").count()))
    await page
      .locator(".question-panel")
      .screenshot({ path: `${dir}/${device}-${name}-question.png` });
}
async function accessible(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function answer(page: Page, q: Question) {
  if (q.drawDotCross) {
    for (const part of q.parts!.slice(0, 2))
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
    await page.getByLabel("Ion charge", { exact: true }).selectOption("-1");
    await page.getByLabel("Draw square brackets", { exact: true }).check();
  } else if (q.profileDrawing) {
    for (const [key, value] of Object.entries({
      reactant: "50",
      product: "20",
      peak: "115",
    }))
      await page
        .getByLabel(`Your drawn ${key} level / kJ`, { exact: true })
        .fill(value);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption("reactants-peak");
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption("reactants-products");
  } else if (q.parts) {
    const values: Record<string, string> = JSON.parse(q.answer);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.id === "as-v1-ca-ratio" ? "40000" : q.answer);
}
async function start(page: Page) {
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
}

test("the first extended paper renders all thirty formats, retains responses and reports automatic versus manual evidence honestly", async ({
  page,
}, info) => {
  test.setTimeout(90000); // Thirty question transitions, drawings and three axe audits.
  await page.goto("/exams");
  await page
    .getByRole("link", { name: /Paper 1 cumulative practice · Foundation/ })
    .click();
  await expect(page.locator("main")).toContainText("Chemistry only");
  await accessible(page);
  await screenshot(page, info.project.name, "intro");
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  for (let i = 0; i < paper.questions.length; i++) {
    const q = paper.questions[i];
    await expect(
      page.getByRole("heading", { name: q.prompt, exact: true }),
    ).toBeVisible();
    if (i === 0) {
      await expect(
        page.locator(".assessment-question-jump"),
      ).not.toHaveAttribute("open", "");
      const jump = page.locator(".assessment-question-jump summary");
      await jump.focus();
      await jump.press("Enter");
      const first = page.getByRole("button", {
        name: "Question 1",
        exact: true,
      });
      await expect(first).toBeVisible();
      const box = await first.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      await jump.press("Enter");
      await expect(first).toBeHidden();
    }
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Give me a hint", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.locator(".assessment-results,.assessment-review-criteria"),
    ).toHaveCount(0);
    if (i === paper.questions.length - 1) {
      await page
        .getByRole("button", { name: "Leave unanswered", exact: true })
        .click();
    } else {
      await answer(page, q);
      if (q.rubric) {
        await expect(page.locator(".written-answer")).toContainText(
          "Use the marking points for self-review when feedback appears.",
        );
        await expect(page.locator(".written-answer")).not.toContainText(
          "after saving",
        );
      }
      if ([6, 20, 25].includes(i)) {
        await accessible(page);
        await screenshot(page, info.project.name, `question-${i + 1}`);
      }
      if (i === 20) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your explanation", { exact: true }),
        ).toHaveValue(q.answer);
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel .recorded-note"),
      ).toContainText("Feedback appears after submission");
    }
    if (i < paper.questions.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await saved(page);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "20 of 21 correct", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).toContainText(
    "8 of 9 responses saved for self-review; 1 left unanswered",
  );
  await expect(page.locator(".result-indicator.self-review")).toHaveCount(9);
  const method = page.locator(".result-row").nth(20);
  await method.locator("summary").click();
  await expect(method).toContainText(paper.questions[20].answer);
  await expect(method.locator(".assessment-review-criteria li")).toHaveText(
    paper.questions[20].rubric!,
  );
  await expect(
    page.locator(".result-row").last().locator("summary"),
  ).toContainText("Not answered");
  await saved(page);
  const responses = await page.evaluate(
    ({ key, workId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].run.responses,
    { key: STORAGE_KEY, workId },
  );
  expect(
    Object.values(responses).filter((r) => (r as { correct: boolean }).correct),
  ).toHaveLength(20);
  for (const q of paper.questions.filter((q) => q.rubric))
    expect(responses[q.id].correct).toBe(false);
  await accessible(page);
  await screenshot(page, info.project.name, "submitted-method-review");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "20 of 21 correct", exact: true }),
  ).toBeVisible();
});

test("cumulative and lesson checks share original exposure in both directions", async ({
  page,
}) => {
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await saved(page);
  await start(page);
  await answer(page, paper.questions[0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, workId }) =>
        JSON.parse(localStorage.getItem(key)!).work[workId].run.responses[
          "atom-v2-ca-neutrons"
        ].fresh,
      { key: STORAGE_KEY, workId },
    ),
  ).toBe(false);
  await page.goto("/lessons/titration-practical");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("25.25");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["titration-practical"].run
          .responses["tech-v1-a-titre"].fresh,
      STORAGE_KEY,
    ),
  ).toBe(false);
});

test("an unrecorded constructed profile survives reload without live correctness feedback", async ({
  page,
}, info) => {
  await start(page);
  await page.locator(".assessment-question-jump summary").click();
  await page.getByRole("button", { name: "Question 26", exact: true }).click();
  await page
    .getByLabel("Your drawn reactant level / kJ", { exact: true })
    .fill("50");
  await page
    .getByLabel("Your drawn product level / kJ", { exact: true })
    .fill("20");
  await page
    .getByLabel("Your drawn peak level / kJ", { exact: true })
    .fill("110");
  await page
    .getByLabel("Your drawn activation arrow", { exact: true })
    .selectOption("reactants-peak");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your drawn peak level / kJ", { exact: true }),
  ).toHaveValue("110");
  await expect(
    page.locator(
      ".assessment-results,.assessment-review-criteria,.feedback.correct",
    ),
  ).toHaveCount(0);
  await accessible(page);
  await screenshot(page, info.project.name, "wrong-profile-retained");
});

test("the extended opening presents a complete answer control within664px at320 and390", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await start(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    const input = page.locator(".question-panel input").first();
    await expect(input).toBeVisible();
    const rect = await input.boundingBox();
    expect(rect!.height).toBeGreaterThanOrEqual(44);
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(664);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
