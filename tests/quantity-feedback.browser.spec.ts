import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { quantityExamples } from "../src/content/quantity-examples";
import { STORAGE_KEY } from "../src/lib/progress";

for (const slug of Object.keys(quantityExamples)) {
  test(`${slug} offers a worked calculation on its first guided task`, async ({
    page,
  }) => {
    await page.goto(`/lessons/${slug}`);
    await expect(
      page.getByText("Try a worked calculation", { exact: true }),
    ).toBeVisible();
  });
}

test("worked predictions and steps leave independent concentration feedback sealed until submission", async ({
  page,
}) => {
  await page.goto("/lessons/molar-concentration");
  const example = page.locator(".quantity-example");
  await example.locator("summary").press("Enter");
  const prediction = example.getByRole("textbox");
  await expect(example.getByText("Step 1 of 3.")).toHaveCount(0);
  await prediction.fill("0.0003");
  await example.getByRole("button", { name: "Check prediction" }).click();
  await expect(example.getByRole("status")).toContainText("Revisit the setup.");
  await prediction.fill("0.30");
  await example.getByRole("button", { name: "Check prediction" }).click();
  await expect(example.getByRole("status")).toContainText("Correct.");
  await example.getByRole("button", { name: "Show first step" }).click();
  const next = example.getByRole("button", { name: "Next step" });
  await next.click();
  await next.click();
  await expect(example.getByText("Step 3 of 3.")).toBeVisible();
  await expect(next).toBeDisabled();
  await example.getByRole("button", { name: "Previous step" }).click();
  await expect(example.getByText("Step 2 of 3.")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await example.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );

  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →" })
    .click();
  await expect(example).toHaveCount(0);
  await page.getByLabel("Final volume / dm³", { exact: true }).fill("180");
  await page
    .getByLabel("Concentration / mol/dm³", { exact: true })
    .fill("0.00035");
  await page.getByRole("button", { name: "Record answer" }).click();
  const targetedFeedback =
    "Revisit Final volume / dm³. Convert final volume before dividing.";
  await expect(page.getByText(targetedFeedback)).toHaveCount(0);

  await page.getByRole("button", { name: "Question 2", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("2.38");
  await page.getByRole("button", { name: "Record answer" }).click();
  await expect(page.getByText("0.25×0.080×119=2.38.")).toHaveCount(0);
  for (let i = 3; i <= 5; i++) {
    await page
      .getByRole("button", { name: `Question ${i}`, exact: true })
      .click();
    await page.getByRole("button", { name: "Leave unanswered" }).click();
  }
  await page.getByRole("button", { name: "Submit whole set" }).click();
  await expect(
    page.getByRole("heading", { name: "1 of 4 correct" }),
  ).toBeFocused();
  await expect(
    page.getByText("1 correct on a fresh, first response."),
  ).toBeVisible();
  const first = page.locator(".result-row").first();
  await first.locator("summary").press("Enter");
  await expect(first.getByText(targetedFeedback)).toBeVisible();
  await expect(first).toContainText("0.00035");
  await expect(first).toContainText("0.350");
  await expect(
    page.locator(".result-row").nth(2).locator("summary"),
  ).toContainText("Not answered");

  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Boolean(
            JSON.parse(localStorage.getItem(key) ?? "{}").work?.[
              "molar-concentration"
            ]?.run?.submitted,
          ),
        STORAGE_KEY,
      ),
    )
    .toBe(true);
  await page.reload();
  await page.locator(".result-row summary").first().click();
  await expect(first.getByText(targetedFeedback)).toBeVisible();
});
