import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { paper2Foundation as paper } from "../src/content/extended-assessments";
import { STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = `/exams/${paper.slug}`;
const workId = `assessment-${paper.slug}`;
const dir = "test-results/qa/extended-paper2-foundation";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function accessible(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, device: string, name: string) {
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
async function start(page: Page) {
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
}
async function jump(page: Page, n: number) {
  const details = page.locator(".assessment-question-jump");
  if (!((await details.getAttribute("open")) !== null))
    await details.locator("summary").click();
  await page
    .getByRole("button", { name: `Question ${n}`, exact: true })
    .click();
}
async function answer(page: Page, q: Question) {
  if (q.rateDrawing) {
    const values = [0, 18, 31, 40, 46, 46, 46];
    for (let i = 0; i < 7; i++) {
      await page
        .getByLabel("Graph marker to edit", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel("Graph element to edit", { exact: true })
        .selectOption("point");
      await page
        .getByLabel(`Your plotted observation ${i + 1} time / s`, {
          exact: true,
        })
        .fill(String(i * 10));
      await page
        .getByLabel(`Your plotted observation ${i + 1} quantity / cm³`, {
          exact: true,
        })
        .fill(String(values[i]));
      await page
        .getByLabel("Graph element to edit", { exact: true })
        .selectOption("curve");
      await page
        .getByLabel(`Your curve knot at ${i * 10} s quantity / cm³`, {
          exact: true,
        })
        .fill(String(values[i]));
    }
  } else if (q.polymerisationDrawing) {
    for (const [label, value] of [
      ["Carbon 1: above attachment", "H"],
      ["Carbon 1: below attachment", "Cl"],
      ["Carbon 2: above attachment", "H"],
      ["Carbon 2: below attachment", "CH3"],
      ["Bond joining the two backbone/reacting carbons", "1"],
      ["Left continuation bond", "1"],
      ["Right continuation bond", "1"],
      ["Polymer brackets", "1"],
      ["Repeat-count notation", "n"],
    ])
      await page.getByLabel(label, { exact: true }).selectOption(value);
  } else if (q.chromatographyDrawing) {
    // Deliberately wrong A1 is retained for comparison with the separate reference.
    for (const [key, value] of Object.entries({
      origin: "15",
      front: "115",
      a1: "30",
      a2: "85",
      b1: "70",
    }))
      await page.locator(`input[data-drawing-field="${key}"]`).fill(value);
    for (const [key, value] of Object.entries({
      stationary: "paper",
      mobile: "water",
      lineMaterial: "pencil",
    }))
      await page
        .locator(`select[data-drawing-field="${key}"]`)
        .selectOption(value);
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
      .fill(q.id === "rr-v1-A-interval" ? "1.2" : q.answer);
}
test("Paper2 renders all thirty responses with concealed criteria, retained constructions and honest automatic/manual results", async ({
  page,
}, info) => {
  test.setTimeout(150000); // Thirty questions, three constructions, reloads and accessibility audits.
  await page.goto("/exams");
  await page
    .getByRole("link", { name: /Paper 2 cumulative practice · Foundation/ })
    .click();
  await expect(page.locator("main")).toContainText("Chemistry only");
  await accessible(page);
  await capture(page, info.project.name, "intro");
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  for (let i = 0; i < paper.questions.length; i++) {
    const q = paper.questions[i];
    const hasSeparatePrompt = !!(
      (q.writtenEquations || q.conciseHeading) &&
      q.title
    );
    await expect(
      page.getByRole("heading", {
        name: hasSeparatePrompt ? q.title : q.prompt,
        exact: true,
      }),
    ).toBeVisible();
    if (hasSeparatePrompt) {
      const prompt = page.locator(".question-panel .written-equation-prompt");
      await expect(prompt).toBeVisible();
      await expect(prompt).toHaveText(q.prompt);
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
    await expect(
      page.getByText("Separate reference", { exact: true }),
    ).toHaveCount(0);
    if (i === 23)
      await page
        .getByRole("button", { name: "Leave unanswered", exact: true })
        .click();
    else {
      await answer(page, q);
      if ([1, 10, 14, 16, 26].includes(i)) {
        await accessible(page);
        await capture(page, info.project.name, `question-${i + 1}`);
      }
      if ([1, 10, 14, 16].includes(i)) {
        await saved(page);
        await page.reload();
        if (i === 1) {
          await page
            .getByLabel("Graph marker to edit", { exact: true })
            .selectOption("6");
          await page
            .getByLabel("Graph element to edit", { exact: true })
            .selectOption("curve");
          await expect(
            page.getByLabel("Your curve knot at 60 s quantity / cm³", {
              exact: true,
            }),
          ).toHaveValue("46");
        }
        if (i === 10)
          await expect(
            page.getByLabel("Repeat-count notation", { exact: true }),
          ).toHaveValue("n");
        if (i === 14)
          await expect(
            page.locator('input[data-drawing-field="a1"]'),
          ).toHaveValue("30");
        if (i === 16)
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue(q.answer);
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
      }
      if (i === 15) {
        await expect(page.locator(".question-panel")).toContainText("relights");
        await expect(page.locator(".question-panel")).toContainText(
          "bleached white",
        );
      }
      if (i === 17)
        await expect(page.locator(".question-panel")).toContainText("39");
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel .recorded-note"),
      ).toContainText("Feedback appears after submission");
    }
    if (i < 29)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await saved(page);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "15 of 16 correct", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).toContainText(
    "13 of 14 responses saved for self-review; 1 left unanswered",
  );
  await expect(page.locator(".result-indicator.self-review")).toHaveCount(14);
  const method = page.locator(".result-row").nth(16);
  await method.locator("summary").click();
  await expect(method).toContainText(paper.questions[16].answer);
  await expect(method.locator(".assessment-review-criteria li")).toHaveText(
    paper.questions[16].rubric!,
  );
  await accessible(page);
  await capture(page, info.project.name, "submitted-ion-method-review");
  await method.locator("summary").click();
  const chroma = page.locator(".result-row").nth(14);
  await chroma.locator("summary").click();
  await expect(chroma).toContainText("Separate reference");
  await expect(chroma).toContainText("30");
  await expect(chroma).toContainText("35");
  await capture(page, info.project.name, "submitted-retained-chromatogram");
  await saved(page);
  const responses = await page.evaluate(
    ({ key, workId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].run.responses,
    { key: STORAGE_KEY, workId },
  );
  expect(
    Object.values(responses).filter((r) => (r as { correct: boolean }).correct),
  ).toHaveLength(15);
  for (const q of paper.questions.filter((q) => q.rubric))
    expect(responses[q.id].correct).toBe(false);
  expect(JSON.parse(responses[paper.questions[14].id].answer).raw.a1).toBe(
    "30",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "15 of 16 correct", exact: true }),
  ).toBeVisible();
});
test("Paper2 and its native lessons preserve exposure in both directions", async ({
  page,
}) => {
  await page.goto("/lessons/measuring-rates");
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
          "rr-v1-A-interval"
        ].fresh,
      { key: STORAGE_KEY, workId },
    ),
  ).toBe(false);
  await page.goto("/lessons/chromatography");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await page.getByRole("button", { name: "Question 4", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("0.5");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work.chromatography.run
          .responses["chromatography-v1-cA-rf"].fresh,
      STORAGE_KEY,
    ),
  ).toBe(false);
});
test("a wrong unrecorded chromatogram survives reload and clear without reference leakage", async ({
  page,
}, info) => {
  await start(page);
  await jump(page, 15);
  await answer(page, paper.questions[14]);
  await saved(page);
  await page.reload();
  await expect(page.locator('input[data-drawing-field="a1"]')).toHaveValue(
    "30",
  );
  await expect(
    page.getByText("Separate reference", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator(
      ".assessment-results,.assessment-review-criteria,.feedback.correct",
    ),
  ).toHaveCount(0);
  await accessible(page);
  await capture(page, info.project.name, "wrong-chromatogram-retained");
  for (const key of ["origin", "front", "a1", "a2", "b1"])
    await page.locator(`input[data-drawing-field="${key}"]`).fill("");
  for (const key of ["stationary", "mobile", "lineMaterial"])
    await page.locator(`select[data-drawing-field="${key}"]`).selectOption("");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".question-panel")).not.toContainText(
    "Feedback appears after submission",
  );
  await saved(page);
  await page.reload();
  await expect(page.locator('input[data-drawing-field="a1"]')).toHaveValue("");
});
test("Paper2 opening fits a complete44px answer inside664px at320 and390", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await start(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    const input = page.getByLabel("Your answer", { exact: true });
    await expect(input).toBeVisible();
    const b = await input.boundingBox();
    expect(b!.height).toBeGreaterThanOrEqual(44);
    expect(b!.y + b!.height).toBeLessThanOrEqual(664);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
