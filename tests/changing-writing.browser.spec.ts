import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { changingConcentrationJourney as journey } from "../src/content/journeys/changing-concentration";
import { changingWritingAdditions as added } from "../src/content/journeys/changing-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/changing-concentration";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/changing-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/changing-writing/${name}.png`,
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
        ? ".task-workbench select, .task-workbench input:not([type=checkbox]), .task-workbench button:not([disabled])"
        : ".question-panel .answer-option, .question-panel input, .question-panel textarea, .question-panel select",
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
  const sizes = await page
    .locator(".question-panel svg text, .task-workbench svg text")
    .evaluateAll((nodes) =>
      nodes.map((n) => {
        const text = n as SVGTextElement,
          m = text.getScreenCTM();
        return (
          parseFloat(getComputedStyle(text).fontSize) *
          (m ? Math.hypot(m.a, m.b) : 1)
        );
      }),
    );
  for (const size of sizes) expect.soft(size).toBeGreaterThanOrEqual(12);
}
async function answer(page: Page, q: Question, raw = q.answer) {
  if (q.parts) {
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  } else if (q.options)
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
        await page
          .getByRole("radio", {
            name: journey.guided[0].options!.find(
              (o) => o !== journey.guided[0].answer,
            )!,
            exact: true,
          })
          .check();
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

test("cold competing factors and homogeneous inventories retain wrong writing and reveal criteria only after the entire set", async ({
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
  const raw =
    "Tight repeats guarantee the true value. A mean removes every offset. 1..2";
  for (let i = 0; i < added.check.length; i++) {
    const q = added.check[i];
    await opening(page);
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    await shot(
      page,
      `${info.project.name}-${["competing", "sampling", "symbols"][i]}-opening`,
    );
    await answer(
      page,
      q,
      q.rubric ? raw : q.options!.find((o) => o !== q.answer)!,
    );
    await page.reload();
    if (q.rubric)
      await expect(
        page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue(raw);
    else
      await expect(
        page.getByRole("radio", {
          name: q.options!.find((o) => o !== q.answer)!,
          exact: true,
        }),
      ).toBeChecked();
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (i < added.check.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toContainText("0 of 1 correct");
  await expect(page.locator(".results-banner")).toContainText(
    "2 of 2 responses saved for self-review",
  );
  for (let i = 0; i < 2; i++) {
    const row = page.locator(".results-list > details").nth(i);
    await row.locator(":scope > summary").click();
    await expect(row.getByText(raw, { exact: true })).toBeVisible();
    await expect(row.locator(".assessment-review-criteria")).toBeVisible();
    await expect(row.locator(".result-self-review")).toHaveText("Self-review");
  }
  await shot(page, `${info.project.name}-retained-wrong-writing`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("seven-day retrieval independently explains scaling and solvent-only removal", async ({
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
        for (const r of p.work["changing-concentration"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["changing-concentration"].run.submitted =
          Date.now() - delay - 1000;
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
        await opening(page);
        await expect(page.locator(".assessment-review-criteria")).toHaveCount(
          0,
        );
        await shot(
          page,
          `${info.project.name}-${["scaling", "removal", "symbols"][n]}-delayed-opening`,
        );
        await answer(page, added.review[n]);
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
      await expect(page.locator(".results-banner")).toContainText(
        "1 of 1 correct",
      );
      await expect(page.locator(".results-banner")).toContainText(
        "2 of 2 responses saved for self-review",
      );
      await shot(page, `${info.project.name}-mixed-delayed-results`);
    }
  }
});

test("guided symbols support keyboard exploration while wrong proposals and help exposure persist", async ({
  page,
}, info) => {
  await page.goto(route);
  await choose(page, 5);
  const buttons = page.locator(".concentration-symbol-buttons button");
  await expect(buttons).toHaveCount(7);
  for (let i = 0; i < 7; i++) {
    await buttons.nth(i).focus();
    await page.keyboard.press("Enter");
    await expect(buttons.nth(i)).toHaveAttribute("aria-pressed", "true");
    const box = (await buttons.nth(i).boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator(".concentration-symbols")).toContainText(
    "AQA lists ~",
  );
  await shot(page, `${info.project.name}-symbol-reference`);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await choose(page, 22);
  await expect(page.locator(".concentration-symbols")).toHaveCount(0);
  const wrong = added.practice[1].options!.find(
    (o) => o !== added.practice[1].answer,
  )!;
  await answer(page, added.practice[1], wrong);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Read concentration symbols",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
