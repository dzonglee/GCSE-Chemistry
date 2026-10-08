import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { periodicDevelopmentJourney as journey } from "../src/content/journeys/periodic-development";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function choose(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function answer(page: Page, q: Question) {
  if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else await page.getByRole("radio", { name: q.answer, exact: true }).check();
}
async function capture(page: Page, path: string) {
  path = path.replace("docs/qa/", "test-results/qa/periodic-development/");
  await mkdir("test-results/qa/periodic-development", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    document.querySelectorAll("textarea").forEach((el) => {
      el.scrollTop = 0;
    });
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
test("property evidence board preserves a wrong arrangement, repairs, resumes and resets on keyboard", async ({
  page,
}, info) => {
  await page.goto("/lessons/periodic-development");
  const select = page.getByLabel("Proposed historical arrangement", {
    exact: true,
  });
  const box = await select.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator('[data-history-cell="4"]')).toContainText("E");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".history-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await select.focus();
  await select.press("ArrowDown");
  await select.press("Enter");
  await expect(select).toHaveValue("gap");
  await expect(page.locator('[data-history-cell="4"]')).toContainText("Gap");
  await expect(page.locator('[data-history-cell="5"]')).toContainText("E");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".history-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/periodic-development-${info.project.name}-gap.png`,
  );
  await page.reload();
  await expect(select).toHaveValue("gap");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(select).toHaveValue("force");
  await select.selectOption("gap");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(select).toHaveValue("force");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("That’s right");
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("modern ordering example and all independent historical practice include evidence repair and written self-review", async ({
  page,
}, info) => {
  await page.goto("/lessons/periodic-development");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/periodic-development-${info.project.name}-weight-order.png`,
  );
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await choose(page, i + 1);
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 3) {
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
        page.getByRole("heading", { name: /What should happen if/ }),
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
        `docs/qa/periodic-development-${info.project.name}-explanation.png`,
      );
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "periodic-development"
          ].attempts["pd-v1-p-explain"]?.at(-1)?.correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
});
test("reserved historical checks defer feedback and retain locked drafts across reload", async ({
  page,
}) => {
  await page.goto("/lessons/periodic-development");
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
  await expect(page.getByText(/3 of 3/).first()).toBeVisible();
});

test("historical delayed review waits seven days and reserves new prompts", async ({
  page,
}) => {
  await page.goto("/lessons/periodic-development");
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
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
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
      data.work["periodic-development"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["periodic-development"].run.submitted =
        Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  await page.reload();
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
