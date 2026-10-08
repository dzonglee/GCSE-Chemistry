import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STORAGE_KEY } from "../src/lib/progress";
import fs from "node:fs";
const text =
  "11 / 44 = 0.5 mol\nThis is my original wrong method; final answer entered separately.";
const workId = "assessment-higher-paper-1";
test("calculation working retains mistakes through reload, recording, submission and restart without an automatic method mark", async ({
  page,
}, info) => {
  await page.goto("/exams/higher-paper-1");
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  await page.getByRole("button", { name: "Question 3", exact: true }).click();
  const detail = page.locator(".assessment-working");
  await detail.locator("summary").click();
  await page
    .getByLabel("Working for this question", { exact: true })
    .fill(text);
  await page.getByLabel("Your answer", { exact: true }).fill("0.25");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.reload();
  await page.locator(".assessment-working summary").click();
  await expect(
    page.getByLabel("Working for this question", { exact: true }),
  ).toHaveValue(text);
  await expect(
    page.locator(".assessment-results,.assessment-review-criteria"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(
    page.getByLabel("Working for this question", { exact: true }),
  ).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  fs.mkdirSync("test-results/qa/assessment-working", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/assessment-working/${info.project.name}-retained-working.png`,
    fullPage: true,
  });
  for (let i = 1; i <= 15; i++)
    if (i !== 3) {
      await page
        .getByRole("button", { name: `Question ${i}`, exact: true })
        .click();
      await page
        .getByRole("button", { name: "Leave unanswered", exact: true })
        .click();
    }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "1 of 15 correct", exact: true }),
  ).toBeVisible();
  const row = page.locator(".result-row").nth(2);
  await row.locator("summary").click();
  await expect(row.locator(".assessment-working-review")).toContainText(text);
  await expect(row).toContainText("Working receives no automatic method mark.");
  await expect(row).toContainText("11 ÷ 44 = 0.25 mol.");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  expect(
    await page.evaluate(
      ({ key, workId }) =>
        JSON.parse(localStorage.getItem(key)!).work[workId].run.responses[
          "higher-paper-0-2"
        ],
      { key: STORAGE_KEY, workId },
    ),
  ).toMatchObject({ answer: "0.25", working: text, correct: true });
  await page.reload();
  await page.locator(".result-row").nth(2).locator("summary").click();
  await expect(page.locator(".assessment-working-review")).toContainText(text);
  await page
    .getByRole("button", { name: "Try this set again", exact: true })
    .click();
  await page.getByRole("button", { name: "Question 3", exact: true }).click();
  await page.locator(".assessment-working summary").click();
  await expect(
    page.getByLabel("Working for this question", { exact: true }),
  ).toHaveValue("");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  const history = await page.evaluate(
    ({ key, workId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].history,
    { key: STORAGE_KEY, workId },
  );
  expect(history[0].responses["higher-paper-0-2"].working).toBe(text);
});
test("method-only work survives leaving a final answer blank and contributes no automatic credit", async ({
  page,
}) => {
  await page.goto("/exams/higher-paper-1");
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  await page.locator(".assessment-working summary").click();
  const working =
    "Signed charge = protons minus electrons. I have not finished.";
  await page
    .getByLabel("Working for this question", { exact: true })
    .fill(working);
  await page
    .getByRole("button", { name: "Leave unanswered", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  expect(
    await page.evaluate(
      ({ key, workId }) =>
        JSON.parse(localStorage.getItem(key)!).work[workId].run.responses[
          "higher-paper-0-0"
        ],
      { key: STORAGE_KEY, workId },
    ),
  ).toMatchObject({ answer: "", working, correct: false, fresh: false });
  await page.reload();
  await page.locator(".assessment-working summary").click();
  await expect(
    page.getByLabel("Working for this question", { exact: true }),
  ).toHaveValue(working);
  await expect(
    page.getByLabel("Working for this question", { exact: true }),
  ).toBeDisabled();
});
