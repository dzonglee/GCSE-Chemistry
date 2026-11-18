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

for (const [slug, summary, conclusion] of [
  ["periodic-patterns", "Try a worked example", "Both are Group 7"],
  ["graphite", "Try a worked example", "separation between layers"],
  ["limiting-reactants", "Work through this model", "Capacities 3 and 2"],
  [
    "making-soluble-salts",
    "Work through this model",
    "insoluble excess CuO can be removed",
  ],
  ["reaction-profiles", "Work through this model", "80+40=120 kJ"],
  ["rates-from-tangents", "Try a worked example", "+2.0 cm³/s"],
  [
    "alcohols-and-acids",
    "Try a worked example",
    "The acid’s complete end group is –COOH",
  ],
  ["chromatography", "Work through this model", "10 mm is one valid choice"],
  ["climate-evidence", "Work through this model", "+0.8 °C overall"],
  [
    "materials-and-corrosion",
    "Work through this model",
    "C meets both constraints",
  ],
] as const) {
  test(`${slug} reveals the subject-specific worked conclusion only on demand`, async ({
    page,
  }) => {
    await page.goto(`/lessons/${slug}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    if (slug === "materials-and-corrosion") {
      await page.getByRole("button", { name: "Open the worked model" }).click();
    }
    const worked = page.locator(".worked-example").filter({ hasText: summary });
    await worked.locator("summary").press("Enter");
    await expect(worked.getByText(conclusion, { exact: false })).toHaveCount(0);
    await worked.getByRole("button", { name: "Show first step" }).click();
    await worked.getByRole("button", { name: "Next step" }).click();
    await worked.getByRole("button", { name: "Next step" }).click();
    await expect(worked.getByText(conclusion, { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(worked).toHaveCount(0);
  });
}

test("Foundation polymer learning offers its own worked repeat", async ({
  page,
}) => {
  await page.goto("/lessons/polymers");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const worked = page.locator(".worked-example");
  await worked.getByText("Try a worked example", { exact: true }).click();
  await expect(worked.getByText(/poly\(propene\) chain/)).toBeVisible();
});
