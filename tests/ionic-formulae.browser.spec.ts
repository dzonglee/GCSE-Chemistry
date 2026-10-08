import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ionicFormulaeJourney as journey } from "../src/content/journeys/ionic-formulae";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
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
  await page.screenshot({ path, fullPage: true });
}
test("charge balance uses accessible single whole-ion operations and retains a wrong proposed formula", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-formulae");
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveAttribute(
    "autocapitalize",
    "off",
  );
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveAttribute(
    "spellcheck",
    "false",
  );
  const add = page.getByRole("button", {
      name: "Add one sodium ion",
      exact: true,
    }),
    box = await add.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-formula",
    "NaSO4",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".ionic-formula-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await page.reload();
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-charge",
    "-1",
  );
  await add.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-formula",
    "Na2SO4",
  );
  await expect(
    page.locator(".ionic-formula-workbench [role=status]"),
  ).toHaveClass(/correct/);
  await audit(page);
  await capture(
    page,
    `docs/qa/ionic-formulae-${info.project.name}-sulfate.png`,
  );
  await page.reload();
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-formula",
    "Na2SO4",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-formula",
    "NaSO4",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
});
test("hydroxide nitrate and unequal-charge sulfate models keep internal groups fixed and reject neutral multiples", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-formulae");
  for (const [task, name, formula] of [
    [2, "hydroxide", "Mg(OH)2"],
    [3, "nitrate", "Ca(NO3)2"],
  ] as const) {
    await page
      .getByRole("button", { name: `Task ${task}`, exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: `Add one ${name} ion`, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Check model", exact: true })
      .click();
    await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
      "data-formula",
      formula,
    );
    await expect(
      page.locator(".ionic-formula-workbench [role=status]"),
    ).toHaveClass(/correct/);
    await audit(page);
    await capture(
      page,
      `docs/qa/ionic-formulae-${info.project.name}-${name}.png`,
    );
  }
  await page
    .getByRole("button", { name: "Task 4", exact: true })
    .first()
    .click();
  const positive = page.getByRole("button", {
      name: "Add one aluminium ion",
      exact: true,
    }),
    negative = page.getByRole("button", {
      name: "Add one sulfate ion",
      exact: true,
    });
  for (let i = 0; i < 3; i++) await positive.click();
  for (let i = 0; i < 5; i++) await negative.click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-formula",
    "Al4(SO4)6",
  );
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-charge",
    "0",
  );
  await expect(
    page.locator(".ionic-formula-workbench [role=status]"),
  ).toContainText("not the simplest");
  await page.reload();
  await expect(page.locator(".ionic-formula-proposal")).toHaveAttribute(
    "data-formula",
    "Al4(SO4)6",
  );
  for (let i = 0; i < 2; i++)
    await page
      .getByRole("button", { name: "Remove one aluminium ion", exact: true })
      .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Remove one sulfate ion", exact: true })
      .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".ionic-formula-workbench [role=status]"),
  ).toHaveClass(/correct/);
  await expect(
    page.locator(".atomic-data-table tbody tr").filter({ hasText: "O" }),
  ).toContainText("12");
  await audit(page);
  await capture(
    page,
    `docs/qa/ionic-formulae-${info.project.name}-aluminium.png`,
  );
});
test("independent formula input preserves missing brackets and capitals, accepts subscripts and keeps written marking honest", async ({
  page,
}, info) => {
  await page.goto("/lessons/ionic-formulae");
  await page.getByLabel("Your answer", { exact: true }).fill("na2SO4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "na2SO4",
  );
  await expect(page.locator(".question-panel [role=status]")).not.toHaveClass(
    /correct/,
  );
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "na2SO4",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("Na₂SO₄");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).toHaveClass(
    /correct/,
  );
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("MgOH2");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "one oxygen",
  );
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "MgOH2",
  );
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .first()
        .click();
    const q = journey.practice[i];
    if (
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .count()
    )
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
    if (q.options)
      await page.getByRole("radio", { name: q.answer, exact: true }).check();
    else
      await page
        .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
          exact: true,
        })
        .fill(q.answer);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (i === 6 || q.rubric) {
      await audit(page);
      await capture(
        page,
        `docs/qa/ionic-formulae-${info.project.name}-${q.rubric ? "explanation" : "ammonium"}.png`,
      );
    }
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "ionic-formulae"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("cold free-form formulas defer feedback, save drafts and unlock separate retrieval after seven days", async ({
  page,
}) => {
  await page.goto("/lessons/ionic-formulae");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    const q = journey.checkForms[0][i];
    if (q.options)
      await page.getByRole("radio", { name: q.answer, exact: true }).check();
    else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
    if (i === 0) {
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
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["ionic-formulae"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["ionic-formulae"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
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
    const q = journey.reviewForms[0][i];
    if (q.options)
      await page.getByRole("radio", { name: q.answer, exact: true }).check();
    else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
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
