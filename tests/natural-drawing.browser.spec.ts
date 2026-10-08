import { test, expect } from "@playwright/test";
import { naturalJourney as j } from "../src/content/journeys/natural-journey";
import { STORAGE_KEY } from "../src/lib/progress";
import AxeBuilder from "@axe-core/playwright";
const route = "/lessons/natural-polymers";
test("wrong drawn DNA stays separate from its reference and corrupt bytes survive scoped clearing", async ({
  page,
}, info) => {
  const index = j.practice.findIndex((q) => q.naturalDrawing?.mode === "dna"),
    q = j.practice[index],
    sibling = j.practice[0];
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page
    .getByLabel("Choose a practice task", { exact: true })
    .selectOption(String(index));
  const root = page.locator(".natural-drawing");
  for (const [key, value] of Object.entries({
    unit: "rung",
    strands: "4",
    shape: "flatLadder",
    monomer: "glucose",
  }))
    await root.locator(`[data-drawing-field="${key}"]`).selectOption(value);
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Compare your structure",
  );
  await expect(page.locator(".natural-review")).toBeVisible();
  await expect(root.locator('[data-drawing-field="strands"]')).toHaveValue("4");
  await expect(root.locator(".natural-dna-row")).toHaveCount(4);
  expect(
    (await new AxeBuilder({ page }).include("main").analyze()).violations,
  ).toEqual([]);
  await root.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/qa/natural-${info.project.name}-wrong-drawing.png`,
    scale: "css",
  });
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  const bad = '{"record":"two",broken';
  await page.evaluate(
    ({ key, id, sibling, bad }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["natural-polymers"].drafts[id] = bad;
      p.work["natural-polymers"].drafts[sibling] = "retain sibling draft";
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, id: q.id, sibling: sibling.id, bad },
  );
  await page.reload();
  await expect(root.getByRole("status")).toContainText(
    "original saved structure cannot be read",
  );
  await expect(root.locator("pre")).toHaveText(bad);
  await page.getByRole("button", { name: "Clear answer", exact: true }).click();
  await expect(root.locator('[data-drawing-field="unit"]')).toHaveValue("");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["natural-polymers"].drafts[
          id
        ],
      { key: STORAGE_KEY, id: sibling.id },
    ),
  ).toBe("retain sibling draft");
});
