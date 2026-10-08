import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { compositionJourney as journey } from "../src/content/journeys/percentage-composition";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".composition-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function capture(page: Page, path: string) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}

test("mass numerator and complete denominator retain wrong proposals and show actual contribution shares", async ({
  page,
}, info) => {
  await page.goto("/lessons/percentage-composition");
  const select = page.getByLabel("Compound and named element", { exact: true }),
    box = await select.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page
    .getByLabel("Your element mass contribution", { exact: true })
    .selectOption("1");
  await page
    .getByLabel("Your complete compound Mᵣ", { exact: true })
    .selectOption("5");
  await page
    .getByLabel("Your mass percentage", { exact: true })
    .selectOption("20");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your element mass contribution", { exact: true }),
  ).toHaveValue("1");
  for (const [formula, num, den, percent] of [
    ["CaCO3", "40", "100", "40"],
    ["MgO", "24", "40", "60"],
    ["CO2", "32", "44", "72.7"],
  ]) {
    await select.selectOption(formula);
    await page
      .getByLabel("Your element mass contribution", { exact: true })
      .selectOption(num);
    await page
      .getByLabel("Your complete compound Mᵣ", { exact: true })
      .selectOption(den);
    await page
      .getByLabel("Your mass percentage", { exact: true })
      .selectOption(percent);
    await check(page, true);
    const shares = await page
      .locator("[data-composition-share]")
      .evaluateAll((nodes) =>
        nodes.map((n) => Number(n.getAttribute("data-composition-share"))),
      );
    expect(shares.reduce((s, v) => s + v, 0)).toBeCloseTo(1, 10);
    if (formula === "CaCO3")
      await capture(
        page,
        `docs/qa/composition-${info.project.name}-contribution.png`,
      );
    if (formula === "CO2") expect(shares[1]).toBeCloseTo(32 / 44, 10);
  }
});
test("equal atom counts remain distinct from relative mass with truthful strip widths", async ({
  page,
}, info) => {
  await page.goto("/lessons/percentage-composition");
  await task(page, 2);
  await page
    .getByLabel("Basis for percentage by mass", { exact: true })
    .selectOption("count");
  await page
    .getByLabel("Your mass percentage", { exact: true })
    .selectOption("50");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Basis for percentage by mass", { exact: true }),
  ).toHaveValue("count");
  const shares = await page
    .locator('[data-composition-element="Mg"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => Number(n.getAttribute("data-composition-share"))),
    );
  expect(shares).toEqual([0.5, 0.6]);
  await page
    .getByLabel("Basis for percentage by mass", { exact: true })
    .selectOption("mass");
  await page
    .getByLabel("Your mass percentage", { exact: true })
    .selectOption("60");
  await check(page, true);
  await capture(
    page,
    `docs/qa/composition-${info.project.name}-count-mass.png`,
  );
  await page
    .getByLabel("Compare a compound", { exact: true })
    .selectOption("CO2");
  await page
    .getByLabel("Your mass percentage", { exact: true })
    .selectOption("72.7");
  await check(page, true);
});
test("sample scaling changes grams while preserving mass fraction and exports the actual axis", async ({
  page,
}, info) => {
  await page.goto("/lessons/percentage-composition");
  await task(page, 3);
  for (const [mass, calcium] of [
    ["10", "4"],
    ["25", "10"],
    ["50", "20"],
  ]) {
    await page
      .getByLabel("Pure CaCO₃ sample mass", { exact: true })
      .selectOption(mass);
    await page
      .getByLabel("Your calcium mass in g", { exact: true })
      .selectOption(calcium);
    await page
      .getByLabel("Your calcium mass percentage", { exact: true })
      .selectOption("40");
    await check(page, true);
    const svg = page.locator(".composition-sample-axis svg");
    await expect(svg).toHaveAttribute(
      "aria-label",
      new RegExp(`${mass} grams, calcium contribution ${calcium} grams`),
    );
    const rectangles = await svg
      .locator("rect")
      .evaluateAll((nodes) =>
        nodes.map((n) => Number(n.getAttribute("width"))),
      );
    expect(rectangles[1] / rectangles[0]).toBe(0.4);
    const minFont = await svg.locator("text").evaluateAll((nodes) =>
      Math.min(
        ...nodes.map((n) => {
          const e = n as SVGTextElement;
          return Number(e.getAttribute("font-size")) * e.getScreenCTM()!.a;
        }),
      ),
    );
    expect(minFont).toBeGreaterThanOrEqual(12);
  }
  await page
    .getByLabel("Your calcium mass percentage", { exact: true })
    .selectOption("20");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your calcium mass percentage", { exact: true }),
  ).toHaveValue("20");
  await page
    .getByLabel("Your calcium mass percentage", { exact: true })
    .selectOption("40");
  await check(page, true);
  await writeFile(
    `docs/qa/composition-sample-${info.project.name}.svg`,
    await page.locator(".composition-sample-axis svg").evaluate((node) => {
      const copy = node.cloneNode(true) as SVGElement;
      copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return copy.outerHTML;
    }),
  );
  await capture(page, `docs/qa/composition-${info.project.name}-sample.png`);
});
test("compound comparison uses complete mass fractions rather than identical nitrogen counts", async ({
  page,
}, info) => {
  await page.goto("/lessons/percentage-composition");
  await task(page, 4);
  await page
    .getByLabel("Highest mass percentage", { exact: true })
    .selectOption("nitrate");
  await page
    .getByLabel("Reason for comparison", { exact: true })
    .selectOption("count");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Highest mass percentage", { exact: true }),
  ).toHaveValue("nitrate");
  await page
    .getByLabel("Highest mass percentage", { exact: true })
    .selectOption("urea");
  await page
    .getByLabel("Reason for comparison", { exact: true })
    .selectOption("mass");
  await check(page, true);
  const shares = await page
    .locator('[data-composition-element="N"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => Number(n.getAttribute("data-composition-share"))),
    );
  expect(shares).toEqual([28 / 60, 28 / 80, 28 / 132]);
  await capture(
    page,
    `docs/qa/composition-${info.project.name}-comparison.png`,
  );
  await page
    .getByLabel("Element to compare", { exact: true })
    .selectOption("O");
  await page
    .getByLabel("Highest mass percentage", { exact: true })
    .selectOption("nitrate");
  await check(page, true);
});
test("all twenty-two independent demands accept reviewed references while explanations remain self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/percentage-composition");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await task(page, i + 1);
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
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "percentage-composition"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "pc-v1-p-working")
      await capture(
        page,
        `docs/qa/composition-${info.project.name}-independent.png`,
      );
  }
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/percentage-composition");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    for (let i = 0; i < 5; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = journey.checkForms[form][i];
      await answer(page, q);
      if (i === 0) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "percentage-composition"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(true);
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("region", { name: "Task model", exact: true }),
      ).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
    ).toBeVisible();
    if (form === 0)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["percentage-composition"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["percentage-composition"].run.submitted =
        Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
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
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
test("wrong chemical working survives targeted recovery and reload", async ({
  page,
}) => {
  await page.goto("/lessons/percentage-composition");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 4);
  for (const [label, value] of [
    ["O count", "1"],
    ["O mass contribution", "16"],
    ["Complete Mᵣ", "44"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Use the whole compound", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel("O count", { exact: true })).toHaveValue("1");
  await expect(
    page.getByLabel("O mass contribution", { exact: true }),
  ).toHaveValue("16");
  await expect(page.getByLabel("Complete Mᵣ", { exact: true })).toHaveValue(
    "44",
  );
});
test("final rounding rejects unrounded and count-based oxygen percentages", async ({
  page,
}) => {
  await page.goto("/lessons/percentage-composition");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 5);
  for (const wrong of ["72.727", "72.70", "66.7"]) {
    await page.getByLabel("Your answer", { exact: true }).fill(wrong);
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(page.getByRole("status")).not.toContainText("That’s right");
  }
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "66.7",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("72.7");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("That’s right");
});
