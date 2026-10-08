import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { periodicTableJourney as journey } from "../src/content/journeys/periodic-table";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function answer(page: Page, q: Question) {
  if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function choose(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function form(page: Page, questions: Question[]) {
  for (let i = 0; i < questions.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await mkdir("test-results/qa/periodic-position", { recursive: true });
  await page.screenshot({ path, fullPage: true });
}
test("proposed position stays wrong until repaired, works with keyboard and resumes undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/periodic-patterns");
  const group = page.getByLabel("Proposed GCSE group", { exact: true }),
    period = page.getByLabel("Proposed period", { exact: true });
  const box = await group.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator(".position-selection")).toContainText(
    "Group 3, period 1",
  );
  await expect(page.locator('[data-proposed="true"]')).toHaveText("Na");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".position-workbench [role=status]"),
  ).not.toHaveClass(/correct/);
  await group.selectOption("1");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".position-workbench [role=status]")).toContainText(
    "group is right",
  );
  await period.selectOption("3");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".position-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/periodic-position/periodic-table-${info.project.name}-placement.png`,
  );
  await page.reload();
  await expect(group).toHaveValue("1");
  await expect(period).toHaveValue("3");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(period).toHaveValue("1");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(group).toHaveValue("3");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await group.selectOption("6");
  await period.selectOption("2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".position-workbench [role=status]")).toContainText(
    "Group 6, period 2",
  );
});
test("main-group magnesium ion formation keeps its nucleus and supplies a real 3D model", async ({
  page,
}, info) => {
  await page.goto("/lessons/periodic-patterns");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove electron", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).not.toHaveClass(
    /correct/,
  );
  await page
    .getByRole("button", { name: "Remove electron", exact: true })
    .click();
  await expect(page.getByLabel("Electron count", { exact: true })).toHaveText(
    "10",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "+2",
  );
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `test-results/qa/periodic-position/periodic-table-${info.project.name}-magnesium-ion.png`,
  );
});
test("independent position, unfamiliar groups, exceptions and written reasoning have targeted recovery", async ({
  page,
}, info) => {
  await page.goto("/lessons/periodic-patterns");
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
        page.getByRole("heading", {
          name: "Keep hydrogen’s exception",
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
    }
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
    if (i === 8)
      await capture(
        page,
        `test-results/qa/periodic-position/periodic-table-${info.project.name}-boundary-evidence.png`,
      );
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "periodic-patterns"
          ].attempts["pt-v1-p-explain"]?.at(-1)?.correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
});
test("periodic independent forms lock answers, defer feedback and keep repeated exposure", async ({
  page,
}) => {
  await page.goto("/lessons/periodic-patterns");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByLabel("GCSE group", { exact: true })).toBeDisabled();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  for (let i = 1; i < 4; i++) {
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
  await expect(
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[1]);
  await expect(page.getByText(/^4 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[2]);
  await expect(
    page.getByRole("heading", {
      name: "Responses ready for self-review",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await expect(page.getByText(/^0 correct on a fresh/)).toBeVisible();
});
test("periodic delayed retrieval uses separate questions and resumes on reload", async ({
  page,
}) => {
  await page.goto("/lessons/periodic-patterns");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
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
      data.work["periodic-patterns"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["periodic-patterns"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  await page.reload();
  await form(page, journey.reviewForms[0]);
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
test("placement, ion formation, exceptions, written reasoning and the full reference are accessible", async ({
  page,
}) => {
  for (const [stage, index] of [
    ["Learn", 0],
    ["Learn", 2],
    ["Practise", 3],
    ["Practise", 7],
    ["Practise", 8],
    ["Check", 0],
  ] as const) {
    await page.goto("/lessons/periodic-patterns");
    await page.getByRole("button", { name: stage, exact: true }).click();
    if (index) await choose(page, index + 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
