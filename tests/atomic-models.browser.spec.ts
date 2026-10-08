import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { atomicModelJourney as journey } from "../src/content/journeys/atomic-models";
import type { Question } from "../src/content/types";
async function answer(page: Page, q: Question) {
  if (q.options)
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
  await mkdir("test-results/qa/atomic-models", { recursive: true });
  await page.screenshot({ path, fullPage: true });
}
test("scattering predictions change with the model, work by keyboard and retain undo on reload", async ({
  page,
}, info) => {
  await page.goto("/lessons/atomic-models");
  const change = page.getByRole("button", {
    name: "In a tiny central region",
    exact: true,
  });
  const bounds = await change.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await expect(page.locator(".scattering-prediction")).toContainText(
    "No large deflection",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".scattering-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await change.press("Enter");
  await expect(page.locator(".scattering-prediction")).toContainText(
    "Turns back",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".scattering-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/atomic-models/atomic-models-${info.project.name}-scattering.png`,
  );
  await page.reload();
  await expect(change).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".scattering-prediction")).toContainText(
    "No large deflection",
  );
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await page
    .getByLabel("Alpha-particle approach", { exact: true })
    .selectOption("far");
  await expect(page.locator(".scattering-prediction")).toContainText(
    "Nearly straight",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".scattering-workbench [role=status]"),
  ).toContainText("empty");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page
    .getByLabel("Alpha-particle approach", { exact: true })
    .selectOption("near");
  await expect(page.locator(".scattering-prediction")).toContainText(
    "Deflected away",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Alpha-particle approach", { exact: true }),
  ).toHaveValue("far");
});
test("historical pictures, quantitative practice and written comparison provide distinct feedback", async ({
  page,
}, info) => {
  await page.goto("/lessons/atomic-models");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) {
      const picker = page.getByLabel("Choose a practice task", { exact: true });
      if (await picker.isVisible()) await picker.selectOption(String(i));
      else
        await page
          .getByRole("button", { name: `Task ${i + 1}`, exact: true })
          .click();
    }
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
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
    if (i === 0)
      await capture(
        page,
        `test-results/qa/atomic-models/atomic-models-${info.project.name}-historical-description.png`,
      );
  }
});
test("historical assessment locks answers and defers its feedback until the whole set", async ({
  page,
}) => {
  await page.goto("/lessons/atomic-models");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 4; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.getByRole("radio").first()).toBeDisabled();
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
  ).toBeVisible();
});
test("evidence workbench and historical explanation reflow with accessible controls", async ({
  page,
}) => {
  await page.goto("/lessons/atomic-models");
  for (const stage of ["Learn", "Practise", "Check"]) {
    await page.getByRole("button", { name: stage, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
