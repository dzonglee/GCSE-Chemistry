import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { practicalJourney as j } from "../src/content/journeys/energy-practical";
import {
  energyEquationGuided as g,
  energyEquationPractice as p,
} from "../src/content/journeys/energy-linear-equation";
const route = "/lessons/energy-practical";
const dir = path.join(process.cwd(), "test-results/qa/energy-equation");
async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function ready(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}
async function layout(page: Page, selector: string) {
  await ready(page);
  const box = (await page.locator(selector).first().boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
}
async function shot(page: Page, name: string) {
  fs.mkdirSync(dir, { recursive: true });
  await ready(page);
  await page.screenshot({
    path: path.join(dir, name + ".png"),
    fullPage: true,
    scale: "css",
  });
}

test("equation interpretation and short coefficient responses at fonts-ready320/390/1280 retain wrong work", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await page
      .getByRole("button", { name: "Task 8", exact: true })
      .first()
      .click();
    await layout(page, ".question-panel .answer-option");
    const wrong = g.options![0];
    await page.getByRole("radio", { name: wrong, exact: true }).check();
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "m multiplies x",
    );
    await settled(page);
    await page.reload();
    await expect(
      page.getByRole("radio", { name: wrong, exact: true }),
    ).toBeChecked();
    await shot(page, `${info.project.name}-guided-${width}`);
    await page.getByRole("button", { name: "Practise", exact: true }).click();
    await page
      .getByRole("button", { name: "Task 25", exact: true })
      .first()
      .click();
    await layout(page, ".multipart-answer input");
    await page.getByLabel("m / °C/g", { exact: true }).fill("1..2");
    await page.getByLabel("c / °C", { exact: true }).fill("23.8");
    await page.locator(".sample-check-answer").click();
    await settled(page);
    await page.reload();
    await expect(page.getByLabel("m / °C/g", { exact: true })).toHaveValue(
      "1..2",
    );
    await expect(page.getByLabel("c / °C", { exact: true })).toHaveValue(
      "23.8",
    );
    await shot(page, `${info.project.name}-raw-coefficients-${width}`);
    // Invalid strings remain drafts; a valid wrong response unlocks the recovery route.
    await page.getByLabel("m / °C/g", { exact: true }).fill("0.4");
    await page.locator(".sample-check-answer").click();
    await page
      .getByRole("button", { name: "Revisit the key idea", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Read y=mx+c", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Return to your task →", exact: true })
      .click();
    await expect(page.getByLabel("m / °C/g", { exact: true })).toHaveValue(
      "0.4",
    );
    await page.getByLabel("m / °C/g", { exact: true }).fill("-0.4");
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "right",
    );
    await settled(page);
    expect(j.practice.at(-1)!.id).toBe(p.id);
  }
});
