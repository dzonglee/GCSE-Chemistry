import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { groupOneJourney as journey } from "../src/content/journeys/group-one";
import type { Question } from "../src/content/types";
import { STORAGE_KEY } from "../src/lib/progress";
async function answer(page: Page, q: Question) {
  if (q.parts) {
    for (const p of q.parts)
      await page.getByLabel(p.label, { exact: true }).fill(String(p.answer));
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/group-one", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    document.querySelectorAll("textarea").forEach((el) => (el.scrollTop = 0));
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
test("reaction evidence changes by metal and reactant, works by keyboard and retains history", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-reactions");
  const metal = page.getByLabel("Comparison metal", { exact: true }),
    partner = page.getByLabel("Comparison reactant", { exact: true });
  const box = await metal.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator("[data-alkali-observation]")).toContainText(
    "gently",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".alkali-workbench [role=status]")).not.toHaveClass(
    /correct/,
  );
  await metal.focus();
  await metal.press("ArrowDown");
  await metal.press("Enter");
  await expect(metal).toHaveValue("sodium");
  await expect(page.locator("[data-alkali-observation]")).toContainText("ball");
  await metal.selectOption("potassium");
  await expect(page.locator("[data-alkali-observation]")).toContainText(
    "depends on conditions",
  );
  await expect(page.locator('[data-shells="2,8,8,1"]')).toBeVisible();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".alkali-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-one/group-one-${info.project.name}-comparison.png`,
  );
  await page.reload();
  await expect(metal).toHaveValue("potassium");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(metal).toHaveValue("sodium");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(metal).toHaveValue("lithium");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await partner.selectOption("chlorine");
  await expect(page.locator("[data-alkali-products]")).toContainText(
    "sodium chloride",
  );
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await partner.selectOption("oxygen");
  await expect(page.locator("[data-alkali-products]")).toContainText(
    "oxygen-containing",
  );
  await expect(page.locator(".alkali-evidence")).toContainText(
    "not assert a universal M₂O",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("water coefficients keep formulae fixed, diagnose a wrong ledger and resume undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-reactions");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await expect(page.locator(".alkali-equation")).toHaveText(
    "1 Na + 1 H₂O → 1 NaOH + 1 H₂",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".alkali-workbench [role=status]")).not.toHaveClass(
    /correct/,
  );
  for (const formula of ["Na", "H₂O", "NaOH"])
    await page
      .getByLabel(`Model coefficient ${formula}`, { exact: true })
      .selectOption("2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".alkali-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await expect(page.locator(".alkali-workbench tbody tr").last()).toHaveText(
    "hydrogen44",
  );
  const boxes = await Promise.all(
    [
      "Na coefficient",
      "H₂O coefficient",
      "NaOH coefficient",
      "H₂ coefficient",
    ].map((label) => page.getByLabel(label, { exact: true }).boundingBox()),
  );
  expect(boxes[0]!.y).toBe(boxes[1]!.y);
  expect(boxes[2]!.y).toBe(boxes[3]!.y);
  expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y);
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-one/group-one-${info.project.name}-water-equation.png`,
  );
  await page.reload();
  await expect(
    page.getByLabel("Model coefficient NaOH", { exact: true }),
  ).toHaveValue("2");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Model coefficient NaOH", { exact: true }),
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Model coefficient Na", { exact: true }),
  ).toHaveValue("1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("Group 1 lithium ion has actual 3D evidence and all independent practice keeps written work honest", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-reactions");
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove electron", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.getByLabel("Electron count", { exact: true })).toHaveText(
    "2",
  );
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await answer(page, journey.guided[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/group-one/group-one-${info.project.name}-lithium-ion.png`,
  );
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
    if (i === 6) {
      await page.getByLabel("Your answer", { exact: true }).fill("63");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.getByRole("status")).not.toContainText("That’s right");
      await page.getByLabel("Your answer", { exact: true }).fill("52.5");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText("That’s right");
    }
    if (i === 7) {
      const q = journey.practice[i];
      await page
        .getByRole("radio", {
          name: q.options!.find((o) => o !== q.answer)!,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: /What makes the outer electron/ }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
    }
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (q.rubric)
      await capture(
        page,
        `test-results/qa/group-one/group-one-${info.project.name}-reactivity-explanation.png`,
      );
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "group-reactions"
          ].attempts["g1-v1-p-explain"]?.at(-1)?.correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
});
test("new Group 1 reserved checks lock answers, defer feedback and resume before submission", async ({
  page,
}) => {
  await page.goto("/lessons/group-reactions");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
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
    if (!i) {
      await page.reload();
      await expect(
        page.getByRole("radio", {
          name: journey.checkForms[0][0].answer,
          exact: true,
        }),
      ).toBeChecked();
    }
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
