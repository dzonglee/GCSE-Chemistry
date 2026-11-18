import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("an oxygen worked model reveals one step at a time and stays in guided learning", async ({
  page,
}) => {
  await page.goto("/lessons/electron-shells");
  const model = page.getByRole("region", { name: "Task model", exact: true });
  await expect(model).toBeVisible();
  const example = page.locator(".worked-example");
  await example.locator("summary").press("Enter");
  await expect(
    example.getByText(/Eight electrons occupy the shells/),
  ).toHaveCount(0);
  await example.getByRole("button", { name: "Show first step" }).click();
  await expect(
    example.getByText(/same number of electrons as protons/),
  ).toBeVisible();
  await example.getByRole("button", { name: "Next step" }).click();
  await expect(
    example.getByText(/Subtract those two from the total/),
  ).toBeVisible();
  await expect(
    example.getByText(/same number of electrons as protons/),
  ).toHaveCount(0);
  await example.getByRole("button", { name: "Next step" }).click();
  await expect(example.getByText(/shells as 2,6/)).toBeVisible();
  await expect(model).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).include(".worked-example").analyze())
      .violations,
  ).toEqual([]);

  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await expect(example).toHaveCount(0);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →" })
    .click();
  await expect(example).toHaveCount(0);
  await expect(page.getByText(/shells as 2,6/)).toHaveCount(0);
});
