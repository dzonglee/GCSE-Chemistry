import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { smallMoleculesPropertiesJourney as journey } from "../src/content/journeys/small-molecules-properties";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await mkdir("test-results/qa/molecular-properties", { recursive: true });
  await page.screenshot({ path, fullPage: true });
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
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
test("boiling preserves intact molecules and retained wrong forces with accessible controls, undo, reload and reset", async ({
  page,
}, info) => {
  await page.goto("/lessons/small-molecules-properties");
  const force = page.getByLabel("Attraction overcome on boiling", {
      exact: true,
    }),
    box = await force.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(
    page.getByRole("button", { name: "Compare gas", exact: true }),
  ).toBeDisabled();
  await force.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await force.selectOption("within");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".molecular-properties [role=status]"),
  ).not.toHaveClass(/correct/);
  await page.getByRole("button", { name: "Compare gas", exact: true }).click();
  await expect(force).toHaveValue("within");
  await expect(page.locator(".molecular-phase-diagram svg")).toHaveAttribute(
    "data-phase",
    "gas",
  );
  await expect(page.locator("[data-intact-molecule]")).toHaveCount(4);
  await expect(page.locator("[data-covalent-bond]")).toHaveCount(4);
  await expect(page.locator(".molecular-inventory")).toHaveAttribute(
    "data-atoms",
    "8",
  );
  const sizes = await page
    .locator(".molecular-phase-diagram svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          parseFloat(getComputedStyle(n).fontSize) *
          (n as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await saved(page);
  await page.reload();
  await expect(force).toHaveValue("within");
  await expect(page.locator(".molecular-phase-diagram svg")).toHaveAttribute(
    "data-phase",
    "gas",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".molecular-phase-diagram svg")).toHaveAttribute(
    "data-phase",
    "liquid",
  );
  await force.selectOption("between");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".molecular-properties [role=status]")).toHaveClass(
    /correct/,
  );
  await audit(page);
  await capture(
    page,
    `test-results/qa/molecular-properties/small-molecules-properties-${info.project.name}-liquid.png`,
  );
  await page.getByRole("button", { name: "Compare gas", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/molecular-properties/small-molecules-properties-${info.project.name}-gas.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(force).toHaveValue("unset");
  await expect(page.locator(".molecular-phase-diagram svg")).toHaveAttribute(
    "data-phase",
    "liquid",
  );
});
test("charge-carrier and signed family comparison require independent causal predictions", async ({
  page,
}, info) => {
  await page.goto("/lessons/small-molecules-properties");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Your conductivity prediction", { exact: true })
    .selectOption("yes");
  await page
    .getByLabel("Your particle explanation", { exact: true })
    .selectOption("electrons");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".molecular-properties [role=status]"),
  ).not.toHaveClass(/correct/);
  await page
    .getByLabel("Your conductivity prediction", { exact: true })
    .selectOption("no");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".molecular-properties [role=status]"),
  ).not.toHaveClass(/correct/);
  await page
    .getByLabel("Your particle explanation", { exact: true })
    .selectOption("neutral");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".molecular-properties [role=status]")).toHaveClass(
    /correct/,
  );
  await audit(page);
  await capture(
    page,
    `test-results/qa/molecular-properties/small-molecules-properties-${info.project.name}-conduction.png`,
  );
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  await expect(page.locator(".particle-facts")).toContainText("-89");
  await page
    .getByLabel("Butane attractions compared with ethane", { exact: true })
    .selectOption("stronger");
  await page
    .getByLabel("Energy needed to separate butane molecules", { exact: true })
    .selectOption("less");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".molecular-properties [role=status]"),
  ).not.toHaveClass(/correct/);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Energy needed to separate butane molecules", {
      exact: true,
    }),
  ).toHaveValue("less");
  await page
    .getByLabel("Energy needed to separate butane molecules", { exact: true })
    .selectOption("more");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".molecular-properties [role=status]")).toHaveClass(
    /correct/,
  );
  const temperatures = await page
    .locator("[data-boiling-temperature]")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        value: Number(node.getAttribute("data-boiling-temperature")),
        x: Number(node.querySelector("circle")!.getAttribute("cx")),
      })),
    );
  expect(temperatures.map((d) => d.value)).toEqual([-89, -42, -1]);
  expect(temperatures[0].x).toBeLessThan(temperatures[1].x);
  expect(temperatures[1].x).toBeLessThan(temperatures[2].x);
  const labelSizes = await page
    .locator(".molecular-phase-diagram svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          parseFloat(getComputedStyle(n).fontSize) *
          (n as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...labelSizes)).toBeGreaterThanOrEqual(12);
  await audit(page);
  await capture(
    page,
    `test-results/qa/molecular-properties/small-molecules-properties-${info.project.name}-trend.png`,
  );
});
test("all fourteen practice demands mark correctly while written work remains self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/small-molecules-properties");
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
    if (q.rubric) {
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "small-molecules-properties"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
      await audit(page);
      await capture(
        page,
        `test-results/qa/molecular-properties/small-molecules-properties-${info.project.name}-explanation.png`,
      );
    }
  }
});
test("four-item reserved checks defer feedback, retain drafts and keep seven-day retrieval separate", async ({
  page,
}) => {
  await page.goto("/lessons/small-molecules-properties");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 4; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    const q = journey.checkForms[0][i];
    await answer(page, q);
    if (i === 1) {
      await saved(page);
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        q.answer,
      );
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["small-molecules-properties"].history[0].submitted =
        Date.now() - delay - 1000;
      p.work["small-molecules-properties"].run.submitted =
        Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < 2; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.reviewForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});
