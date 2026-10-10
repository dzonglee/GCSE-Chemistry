import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { alkanesJourney as journey } from "../src/content/journeys/alkanes";
import { alkaneEquationWriting as added } from "../src/content/journeys/alkane-equation-writing";
import { attachmentRequired } from "../src/lib/alkanes";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { LearningTask } from "../src/content/types";
const route = "/lessons/alkanes-and-combustion";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function answer(page: Page, q: LearningTask, raw = q.answer) {
  if (q.alkaneDrawing) {
    const root = page.getByRole("region", {
      name: "Molecular structure construction",
    });
    const n = q.prompt.includes("methane")
      ? 1
      : q.prompt.includes("ethane")
        ? 2
        : q.prompt.includes("propane")
          ? 3
          : 4;
    await root
      .getByLabel("Choose the number of carbon atoms in your scaffold")
      .selectOption(String(n));
    for (let c = 0; c < n; c++)
      for (let slot = 0; slot < 4; slot++)
        if (attachmentRequired(n, c, slot))
          await root.locator(`[data-h-slot="h${c * 4 + slot}"]`).click();
  } else if (q.options)
    await page.getByRole("radio", { name: raw, exact: true }).check();
  else
    await page
      .getByLabel(
        q.shortWritten
          ? "Your answer"
          : q.writtenEquations
            ? "Your equations"
            : q.rubric
              ? "Your explanation"
              : "Your answer",
        { exact: true },
      )
      .fill(raw);
}
async function complete(page: Page, form: LearningTask[], altered = false) {
  for (const [index, q] of form.entries()) {
    if (index)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(
      page,
      q,
      altered && index === 0 ? "C6H14 + O2 -> CO2" : q.answer,
    );
    if (altered && index === 0) {
      await saved(page);
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        "C6H14 + O2 -> CO2",
      );
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".results-list")).toHaveCount(0);
    if (q.id.startsWith("alk-write-v1-")) {
      await expect(page.locator(".sample-reference, .result-row")).toHaveCount(
        0,
      );
      await expect(
        page.getByRole("region", { name: "Task model", exact: true }),
      ).toHaveCount(0);
    }
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toBeVisible();
  await saved(page);
}
async function makeDue(page: Page) {
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      const work = p.work["alkanes-and-combustion"];
      for (const run of work.history) run.submitted = Date.now() - delay - 1000;
      if (work.run?.submitted) work.run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
}
test("a student's incomplete equation survives reload and recovery without automatic correctness", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 38", exact: true })
    .first()
    .click();
  const input = page.getByLabel("Your answer", { exact: true });
  await input.fill("C4H10 + O2 -> CO2");
  await page
    .getByRole("button", { name: "Save and review equations", exact: true })
    .click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "no automatic mark",
  );
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("C4H10 + O2 -> CO2");
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(input).toHaveValue("C4H10 + O2 -> CO2");
  await page
    .getByRole("button", { name: "Save and review equations", exact: true })
    .click();
  await page.locator(".sample-reference summary").click();
  await expect(
    page.getByText(added.practice[1].referenceResponse!, { exact: true }),
  ).toBeVisible();
  await input.fill("C4H10 + 6.5O2 -> 4CO2 + 5H2O");
  await page
    .getByRole("button", { name: "Save and review equations", exact: true })
    .click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "no automatic mark",
  );
});
test("complete written equations have reserved submission and distinct seven-day retrieval", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const form of journey.checkForms.slice(0, 2)) {
    await complete(page, form);
    await page
      .getByRole("button", { name: "Try the next form", exact: true })
      .click();
  }
  await complete(page, added.check, true);
  const fresh = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["alkanes-and-combustion"].run
        .responses["alk-write-v1-ca-six"].fresh,
    STORAGE_KEY,
  );
  expect(fresh).toBe(false);
  await expect(
    page.getByRole("heading", {
      name: "Responses ready for self-review",
      exact: true,
    }),
  ).toBeVisible();
  await page.locator(".result-row > summary").first().click();
  await expect(page.locator(".result-row").first()).toContainText(
    "C6H14 + O2 -> CO2",
  );
  await expect(page.locator(".result-row").first()).toContainText(
    added.check[0].answer,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `docs/qa/alkane-equations-final/${info.project.name}-reserved-own-equation.png`,
    fullPage: true,
    scale: "css",
  });
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  for (const [i, form] of journey.reviewForms.entries()) {
    await makeDue(page);
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await page
      .getByRole("button", {
        name: i === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    await complete(page, form);
    if (i === 2) {
      await expect(
        page.getByRole("heading", {
          name: "Responses ready for self-review",
          exact: true,
        }),
      ).toBeVisible();
      await page.locator(".result-row > summary").nth(1).click();
      await expect(page.locator(".result-row").nth(1)).toContainText(
        added.review[1].answer,
      );
    }
  }
});
