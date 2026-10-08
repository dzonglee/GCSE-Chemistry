import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { groupOneJourney as journey } from "../src/content/journeys/group-one";
import { groupOneWriting as added } from "../src/content/journeys/group-one-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/group-reactions";
test("supplied wider-group symbols work by keyboard and readable shell captions preserve counts", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  const captions = page.locator(".shell-diagram.with-text-legend figcaption");
  await expect(captions).toHaveCount(2);
  await expect(captions.first()).toContainText("2, 1");
  await page
    .getByLabel("Comparison metal", { exact: true })
    .selectOption("potassium");
  await expect(captions.last()).toContainText("2, 8, 8, 1");
  const views = await page
    .locator(".shell-diagram.with-text-legend svg")
    .evaluateAll((els) => els.map((el) => el.getAttribute("viewBox")));
  expect(views[0]).toBe(views[1]);
  await expect(captions.first()).toContainText("magnified nucleus");
  expect(
    await captions
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(14);
  await shot(page, `${info.project.name}-readable-shell-comparison`);
  await page.getByRole("button", { name: "Task 5", exact: true }).click();
  await opening(page);
  const summary = page.getByText("Alkali-metal names and symbols", {
    exact: true,
  });
  await summary.focus();
  await summary.press("Enter");
  const table = page.locator(".alkali-reference table");
  await expect(table.locator("tbody tr")).toHaveCount(6);
  await expect(table).toContainText("RubidiumRb37");
  await expect(table).toContainText("CaesiumCs55");
  await expect(table).toContainText("FranciumFr87");
  await page.getByRole("radio", { name: "Br", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Br", exact: true }),
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
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/group-one-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/group-one-writing/${name}.png`,
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
        ? ".task-workbench select, .task-workbench button:not([disabled])"
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

test("complete chemical responses hide criteria and retain wrong equations without automatic marks", async ({
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
  await opening(page);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("");
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await shot(page, `${info.project.name}-water-description-opening`);
  const wrong =
    "Potassium forms potassium oxide and chlorine. Na + Cl → NaCl2. 1..2";
  await answer(page, added.check[0], wrong);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(wrong);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await opening(page);
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await shot(page, `${info.project.name}-chlorine-equations-opening`);
  await answer(page, added.check[1], "Na + Cl → NaCl2");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await opening(page);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue("");
  await shot(page, `${info.project.name}-reactivity-explanation-opening`);
  await answer(
    page,
    added.check[2],
    "More protons make rubidium less reactive.",
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await opening(page);
  await answer(page, added.check[3]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "1 of 1 correct", exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++) {
    const row = page.locator(".results-list > details").nth(i);
    await row.locator(":scope > summary").click();
    await expect(row.locator(".result-self-review")).toHaveText("Self-review");
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
  }
  await expect(page.getByText(wrong, { exact: true })).toBeVisible();
  await expect(page.locator(".results-list")).toContainText("NaCl");
  await shot(page, `${info.project.name}-retained-wrong-explanations`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("delayed explanations remain seven-day gated and retain original review forms", async ({
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
  await expect(
    page.getByText("Review is available from", { exact: false }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work["group-reactions"]
              .section,
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
        for (const run of p.work["group-reactions"].history)
          run.submitted = Date.now() - delay - 1000;
        p.work["group-reactions"].run.submitted = Date.now() - delay - 1000;
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
      for (let n = 0; n < 3; n++) {
        await opening(page);
        if (n < 2)
          await expect(
            page.getByLabel("Your explanation", { exact: true }),
          ).toHaveValue("");
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
        await shot(
          page,
          `${info.project.name}-${n === 0 ? "water" : n === 1 ? "trend" : "symbol"}-delayed-opening`,
        );
        await answer(page, added.review[n]);
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        if (n < 2)
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
      }
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: "1 of 1 correct",
          exact: true,
        }),
      ).toBeVisible();
      await shot(page, `${info.project.name}-delayed-submitted`);
    }
    await expect(
      page.getByRole("button", { name: "Try the next form", exact: true }),
    ).toBeDisabled();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
