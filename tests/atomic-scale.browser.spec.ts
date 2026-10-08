import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { atomicScaleJourney as journey } from "../src/content/journeys/atomic-scale";
import type { Question } from "../src/content/types";
async function answer(page: Page, q: Question) {
  if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function form(page: Page, questions: Question[]) {
  for (let i = 0; i < questions.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
test("nano conversion shows the learner's proposed exponent, rejects zero and resumes undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/atomic-scale");
  const input = page.getByLabel("Nano prefix: power of ten", { exact: true });
  const box = await input.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(input).toHaveValue("-6");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".scale-workbench [role=status]")).toContainText(
    "one billionth",
  );
  await input.selectOption("-9");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".scale-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await page.getByLabel("Your answer", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "not zero",
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "That’s right",
  );
  await capture(
    page,
    `docs/qa/atomic-scale-${info.project.name}-conversion.png`,
  );
  await page.reload();
  await expect(input).toHaveValue("-9");
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1e-10",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(input).toHaveValue("-6");
});
test("enlargement preserves the real ratio and only the labelled inset magnifies the nucleus", async ({
  page,
}, info) => {
  await page.goto("/lessons/atomic-scale");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await page
    .getByLabel("Enlarged atom radius (m)", { exact: true })
    .selectOption("100");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".scale-workbench [role=status]")).toContainText(
    "5 mm",
  );
  const nucleus = page.locator('[data-scale-nucleus="true"]');
  const mainDiagram = await page
    .locator(".scale-diagrams svg")
    .first()
    .boundingBox();
  expect((mainDiagram!.width / 270) * 11).toBeGreaterThanOrEqual(10);
  const inset = await page.locator(".nucleus-scale-inset").boundingBox();
  expect((inset!.width / 160) * 11).toBeGreaterThanOrEqual(10);
  await expect(nucleus).toHaveAttribute("r", "0.006");
  await expect(page.locator(".scale-figure")).toContainText(
    "Magnified × 10 000",
  );
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/atomic-scale-${info.project.name}-enlargement.png`,
  );
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page
    .getByLabel("Enlarged atom radius (m)", { exact: true })
    .selectOption("10");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".scale-workbench [role=status]")).toContainText(
    "0.5 mm",
  );
  await expect(nucleus).toHaveAttribute("r", "0.006");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Enlarged atom radius (m)", { exact: true }),
  ).toHaveValue("100");
});
test("scale practice distinguishes standard form, changed supplied ratios, dimensions and self-review", async ({
  page,
}, info) => {
  await page.goto("/lessons/atomic-scale");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .click();
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 1) {
      const parts = journey.practice[i].parts!;
      await page.getByLabel(parts[0].label, { exact: true }).fill("25");
      await page.getByLabel(parts[1].label, { exact: true }).fill("-11");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText("Not yet");
    }
    await answer(page, journey.practice[i]);
    await page
      .getByRole("button", {
        name: journey.practice[i].rubric
          ? "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      journey.practice[i].rubric ? "Compare your explanation" : "That’s right",
    );
    if (i === 1)
      await capture(
        page,
        `docs/qa/atomic-scale-${info.project.name}-standard-form.png`,
      );
  }
});
test("reserved scale forms lock and defer answers and repeated forms retain exposure", async ({
  page,
}) => {
  await page.goto("/lessons/atomic-scale");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toBeDisabled();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  for (let i = 1; i < 4; i++) {
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[1]);
  await expect(page.getByText(/^4 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await expect(page.getByText(/^0 correct on a fresh/)).toBeVisible();
});
test("conversion, scale drawing, standard form and written correction are accessible and reflow", async ({
  page,
}) => {
  for (const [stage, index] of [
    ["Learn", 0],
    ["Learn", 1],
    ["Practise", 1],
    ["Practise", 7],
    ["Check", 0],
  ] as const) {
    await page.goto("/lessons/atomic-scale");
    await page.getByRole("button", { name: stage, exact: true }).click();
    if (index)
      await page
        .getByRole("button", { name: `Task ${index + 1}`, exact: true })
        .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
