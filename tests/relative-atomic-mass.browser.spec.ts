import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { relativeAtomicMassJourney as journey } from "../src/content/journeys/relative-atomic-mass";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
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
async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
test("mixture abundance shifts the weighted mean, works with keys and resumes undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/relative-atomic-mass");
  const slider = page.getByRole("slider");
  const box = await slider.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".mixture-workbench [role=status]")).toContainText(
    "equal average",
  );
  await slider.focus();
  for (let i = 0; i < 5; i++) await slider.press("ArrowRight");
  await expect(slider).toHaveValue("75");
  await expect(page.locator(".mixture-formula")).toContainText("35.5");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/relative-atomic-mass-${info.project.name}-mixture.png`,
  );
  await page.reload();
  await expect(slider).toHaveValue("75");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(slider).toHaveValue("70");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(slider).toHaveValue("50");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await slider.focus();
  for (let i = 0; i < 10; i++) await slider.press("ArrowLeft");
  await expect(slider).toHaveValue("25");
  await expect(page.locator(".mixture-formula")).toContainText("36.5");
});
test("independent tables, visible working, rounding and written correction all retain their distinct demands", async ({
  page,
}, info) => {
  await page.goto("/lessons/relative-atomic-mass");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .click();
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 5) {
      await page.getByLabel("Your answer", { exact: true }).fill("24");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText("trailing zero");
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: /Round 31.042/ }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
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
    if (i === 4)
      await capture(
        page,
        `docs/qa/relative-atomic-mass-${info.project.name}-table-rounding.png`,
      );
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "relative-atomic-mass"
          ].attempts["ram-v1-p-explain"]?.at(-1)?.correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
});
test("independent isotope forms defer marks, rotate and retain repeated exposure", async ({
  page,
}) => {
  await page.goto("/lessons/relative-atomic-mass");
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
test("seven-day isotope review is distinct and resumes the chosen form", async ({
  page,
}) => {
  await page.goto("/lessons/relative-atomic-mass");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["relative-atomic-mass"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["relative-atomic-mass"].run.submitted =
        Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  await page.reload();
  await form(page, journey.reviewForms[0]);
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
test("mixture, cold tables, rounded numbers and multi-step working are accessible and reflow", async ({
  page,
}) => {
  for (const [stage, index] of [
    ["Learn", 0],
    ["Practise", 3],
    ["Practise", 5],
    ["Practise", 8],
    ["Check", 0],
  ] as const) {
    await page.goto("/lessons/relative-atomic-mass");
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
