import { test, expect, type Page, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { equationWriting as a } from "../src/content/journeys/equation-writing";
import { balancingJourney as journey } from "../src/content/journeys/balancing-equations";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const path = "/lessons/balancing-equations";
const shots = "test-results/qa/equation-writing";
async function opening(page: Page, model = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  const target = page
    .locator(
      model
        ? ".task-workbench button, .task-workbench select"
        : ".question-panel .answer-option, .question-panel input, .question-panel textarea",
    )
    .first();
  const b = (await target.boundingBox())!;
  expect.soft(b.height).toBeGreaterThanOrEqual(44);
  expect
    .soft(
      b.y + b.height,
      `${await page.locator(".sample-task-panel > h2, .assessment-session .question-panel h2").first().innerText()} at ${page.viewportSize()!.width}px`,
    )
    .toBeLessThanOrEqual(664);
  expect
    .soft(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
  for (const child of await page.locator(".session-heading > *").all()) {
    const bounds = (await child.boundingBox())!;
    expect.soft(bounds.x).toBeGreaterThanOrEqual(0);
    expect.soft(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
}
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function answer(page: Page, q: Question, raw?: string) {
  if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const p of q.parts)
      await page.getByLabel(p.label, { exact: true }).fill(values[p.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(
        q.writtenEquations
          ? "Your equations"
          : q.rubric
            ? "Your explanation"
            : "Your answer",
        {
          exact: true,
        },
      )
      .fill(raw ?? q.answer);
}
async function complete(page: Page, form: Question[]) {
  for (let i = 0; i < form.length; i++) {
    await answer(page, form[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < form.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
async function capture(page: Page, name: string) {
  await mkdir(shots, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `${shots}/${name}.png`,
    fullPage: !name.endsWith("-opening"),
  });
}

test("complete writing follows the existing chemical workbench and retains wrong drafts through review and recovery", async ({
  page,
}, info) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Task 5", exact: true }).click();
  await opening(page, true);
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    "",
  );
  await answer(page, a.guided[0], "K + water → KOH + H");
  await page
    .getByRole("button", { name: "Save and review equations", exact: true })
    .click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "no automatic mark",
  );
  await capture(page, `${info.project.name}-guided-writing`);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 24);
  await opening(page);
  const wrong = "Mg + O2 -> MgO2\n1..2";
  await answer(page, a.practice[1], wrong);
  await page
    .getByRole("button", { name: "Save and review equations", exact: true })
    .click();
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    wrong,
  );
  await page.getByText("Compare a reference response", { exact: true }).click();
  await expect(
    page
      .locator(".sample-reference")
      .getByText(a.practice[1].answer, { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    wrong,
  );
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByText(a.refresher[1].prompt, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    wrong,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await capture(page, `${info.project.name}-retained-wrong-equation`);
});

test("all appended teaching tasks keep a full response control inside the narrow opening", async ({
  browser,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 390]) {
    for (const [stage, start, tasks] of [
      ["Revisit the key idea", 5, a.refresher],
      ["Learn", 4, a.guided],
      ["Practise", 22, a.practice],
    ] as const) {
      const context = await browser.newContext({
        ...devices[
          info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
        ],
        viewport: { width, height: 720 },
      });
      const page = await context.newPage();
      await page.goto(path);
      if (stage === "Revisit the key idea") {
        await page.getByRole("button", { name: "Task 5", exact: true }).click();
        await answer(page, a.guided[0], "K + H2O -> KOH + H");
        await page
          .getByRole("button", {
            name: "Save and review equations",
            exact: true,
          })
          .click();
        await page
          .locator(".question-panel")
          .getByRole("button", { name: stage, exact: true })
          .click();
      } else
        await page.getByRole("button", { name: stage, exact: true }).click();
      for (let i = 0; i < tasks.length; i++) {
        await task(page, start + i + 1);
        await opening(page, !!tasks[i].model);
        if (tasks[i].rubric) {
          await expect(
            page.getByText(tasks[i].answer, { exact: true }),
          ).toHaveCount(0);
          await expect(
            page.getByLabel("Your equations", { exact: true }),
          ).toHaveValue("");
        }
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      if (stage === "Practise")
        await capture(page, `${info.project.name}-${width}-opening`);
      await context.close();
    }
  }
});

test("third independent form has blank full writing, hides references until submission and keeps raw answers", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(path);
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
  for (let i = 0; i < a.check.length; i++) {
    const q = a.check[i];
    await opening(page);
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue("");
    await expect(
      page.locator(".assessment-review-criteria, .sample-reference"),
    ).toHaveCount(0);
    await expect(
      page.locator(".assessment-session p").filter({ hasText: q.answer }),
    ).toHaveCount(0);
    for (const point of q.rubric ?? [])
      await expect(page.getByText(point, { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 0) await capture(page, `${info.project.name}-cold-check-opening`);
    await answer(page, q, i === 1 ? "H2 + Br2 -> HBr\n1..2" : q.answer);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(
      page.locator(".assessment-review-criteria, .sample-reference"),
    ).toHaveCount(0);
    if (i === 1) {
      await page.reload();
      await expect(
        page.getByLabel("Your equations", { exact: true }),
      ).toHaveValue("H2 + Br2 -> HBr\n1..2");
    }
    if (i < a.check.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  const result = page.locator(".results-list > details").nth(1);
  await result.locator(":scope > summary").click();
  await result
    .getByText("Compare a reference response", { exact: true })
    .click();
  await expect(
    page.getByText(a.check[1].answer, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("H2 + Br2 -> HBr\n1..2", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["balancing-equations"]
            .history.length,
        STORAGE_KEY,
      ),
    )
    .toBe(3);
  await capture(page, `${info.project.name}-submitted-writing`);
});

test("the appended review waits seven days and retains manual boundaries across all three forms", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(path);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          sessionStorage.getItem("gcse-chemistry.pending.v1"),
        ),
      )
      .toBeNull();
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const run of p.work["balancing-equations"].history)
          run.submitted = Date.now() - delay - 1000;
        p.work["balancing-equations"].run.submitted = Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: i === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (i === 2) {
      for (let k = 0; k < a.review.length; k++) {
        await opening(page);
        await expect(
          page.getByText(a.review[k].answer, { exact: true }),
        ).toHaveCount(0);
        if (k === 0) {
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
            [],
          );
          await capture(page, `${info.project.name}-delayed-writing-opening`);
          await answer(page, a.review[k]);
          await page
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
        }
      }
      await answer(page, a.review[1]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
    } else await complete(page, journey.reviewForms[i]);
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Try the next form", exact: true }),
    ).toBeDisabled();
  }
});
