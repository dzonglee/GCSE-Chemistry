import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { groupSevenJourney as journey } from "../src/content/journeys/group-seven";
import { groupSevenWriting as added } from "../src/content/journeys/group-seven-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/group-seven";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/group-seven-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/group-seven-writing/${name}.png`,
    fullPage: !name.endsWith("opening"),
  });
}
async function opening(page: Page, model = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  const control = page
    .locator(
      model
        ? ".task-workbench select, .task-workbench input, .task-workbench button:not([disabled])"
        : ".question-panel .answer-option, .question-panel input, .question-panel textarea",
    )
    .first();
  const b = (await control.boundingBox())!;
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
}
async function answer(page: Page, q: Question, raw = q.answer) {
  if (q.options)
    await page.getByRole("radio", { name: raw, exact: true }).check();
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
      .fill(raw);
}
async function choose(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function complete(page: Page, form: Question[]) {
  for (let i = 0; i < form.length; i++) {
    await opening(page);
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

test("every teaching task opens at 320, 390 and desktop with a full response control", async ({
  browser,
}, info) => {
  test.setTimeout(150000);
  for (const width of [320, 390, 1280])
    for (const stage of [
      "warmup",
      "refresher",
      "guided",
      "practice",
    ] as const) {
      const context = await browser.newContext({
        ...devices[
          info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
        ],
        viewport: { width, height: 720 },
      });
      const page = await context.newPage();
      await page.goto(route);
      if (stage === "warmup")
        await page
          .getByRole("button", { name: "Warm-up", exact: true })
          .click();
      if (stage === "refresher") {
        const q = journey.guided[0];
        await answer(
          page,
          q,
          q.options!.find((o) => o !== q.answer)!,
        );
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await page
          .locator(".question-panel")
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
      }
      if (stage === "practice")
        await page
          .getByRole("button", { name: "Practise", exact: true })
          .click();
      for (let i = 0; i < journey[stage].length; i++) {
        await choose(page, i + 1);
        await opening(page, !!journey[stage][i].model);
        if (journey[stage][i].rubric) {
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue("");
          await expect(
            page.getByText(journey[stage][i].answer, { exact: true }),
          ).toHaveCount(0);
        }
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      if (stage === "practice")
        await shot(page, `${info.project.name}-${width}-practice-opening`);
      await context.close();
    }
});

test("wider supplied symbols are usable by keyboard and the real neutral molecule remains available", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await opening(page, true);
  await page
    .getByLabel("Proposed halogen particle", { exact: true })
    .selectOption("molecule");
  await expect(page.locator(".diatomic-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".diatomic-scene")).toHaveAttribute(
    "data-atoms",
    "2",
  );
  await expect(page.locator(".diatomic-scene")).toHaveAttribute(
    "data-charge",
    "0",
  );
  await shot(page, `${info.project.name}-neutral-molecule`);
  await page.getByRole("button", { name: "Task 5", exact: true }).click();
  await opening(page);
  const summary = page.getByText("Group 7 names and symbols", { exact: true });
  await summary.focus();
  await summary.press("Enter");
  const table = page.locator(".halogen-reference table");
  await expect(table.locator("tbody tr")).toHaveCount(6);
  await expect(table).toContainText("AstatineAt85");
  await expect(table).toContainText("TennessineTs117");
  await page.getByRole("radio", { name: "At⁻", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "At⁻", exact: true }),
  ).toBeChecked();
  await summary.press("Enter");
  await shot(page, `${info.project.name}-supplied-symbol-reference`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("complete displacement and gain responses hide criteria and preserve malformed chemical writing", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
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
  const raw = [
    "Bromine loses an electron because it has more protons. 1..2",
    "Br + NaI → NaBr2. Purple aqueous iodine forms sodium metal.",
    "NaI and HI are elemental I2 molecules and form alkaline solutions.",
    added.check[3].answer,
    "45 is below −7: solid. Br2 splits into single atoms.",
  ];
  const names = [
    "electron-gain",
    "displacement-equations",
    "compound-types",
    "symbol-use",
    "state-explanation",
  ];
  for (let i = 0; i < added.check.length; i++) {
    const q = added.check[i];
    await opening(page);
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (q.rubric)
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue("");
    await shot(page, `${info.project.name}-${names[i]}-opening`);
    await answer(page, q, raw[i]);
    await page.reload();
    if (q.rubric)
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue(raw[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (q.rubric)
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toBeDisabled();
    if (i < added.check.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "1 of 1 correct", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).toContainText(
    "4 of 4 responses saved for self-review",
  );
  for (const i of [0, 1, 2, 4]) {
    const row = page.locator(".results-list > details").nth(i);
    await row.locator(":scope > summary").click();
    await expect(row.locator(".result-self-review")).toHaveText("Self-review");
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
    await expect(row.getByText(raw[i], { exact: true })).toBeVisible();
  }
  await shot(page, `${info.project.name}-retained-wrong-writing`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("delayed evidence reasoning remains gated and uses all original review forms", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".assessment-session")).toHaveCount(0);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work["group-seven"].section,
          STORAGE_KEY,
        ),
      )
      .toBe("review");
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
        for (const run of p.work["group-seven"].history)
          run.submitted = Date.now() - delay - 1000;
        p.work["group-seven"].run.submitted = Date.now() - delay - 1000;
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
    if (i < 2) await complete(page, journey.reviewForms[i]);
    else {
      for (let n = 0; n < added.review.length; n++) {
        const q = added.review[n];
        await opening(page);
        if (q.rubric)
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue("");
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
        if (n === 2)
          await expect(page.locator(".halogen-data tbody tr")).toHaveCount(2);
        await shot(
          page,
          `${info.project.name}-${["gain", "no-displacement", "data", "symbol"][n]}-delayed-opening`,
        );
        await answer(
          page,
          q,
          n === 2
            ? "Z > X > Y because the letters are alphabetical."
            : q.answer,
        );
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        if (n < added.review.length - 1)
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
      }
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "1 of 1 correct", exact: true }),
      ).toBeVisible();
      const row = page.locator(".results-list > details").nth(2);
      await row.locator(":scope > summary").click();
      await expect(
        row.getByText("Z > X > Y because the letters are alphabetical.", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(row.locator(".result-self-review")).toHaveText(
        "Self-review",
      );
      await shot(page, `${info.project.name}-delayed-data-self-review`);
    }
    await expect(
      page.getByRole("button", { name: "Try the next form", exact: true }),
    ).toBeDisabled();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
