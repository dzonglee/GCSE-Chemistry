import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { measurementJourney as journey } from "../src/content/journeys/measurement-uncertainty";
import { uncertaintyWritingAdditions as added } from "../src/content/journeys/uncertainty-writing";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/measurement-uncertainty";
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/uncertainty-writing", {
    recursive: true,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/uncertainty-writing/${name}.png`,
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

test("histograms and bar charts draw retained proposals without correcting them or losing malformed counts", async ({
  page,
}, info) => {
  await page.goto(route);
  await choose(page, 5);
  const hist = added.guided[0];
  await expect(page.locator(".frequency-display rect")).toHaveCount(0);
  await answer(page, hist);
  const bars = page.locator(".frequency-display rect");
  await expect(bars).toHaveCount(4);
  const boxes = await bars.evaluateAll((nodes) =>
    nodes.map((n) => ({
      x: Number(n.getAttribute("x")),
      w: Number(n.getAttribute("width")),
      f: Number(n.getAttribute("data-frequency")),
    })),
  );
  expect(boxes.map((b) => b.f)).toEqual([1, 3, 3, 1]);
  for (let i = 1; i < 4; i++)
    expect(boxes[i].x).toBeCloseTo(boxes[i - 1].x + boxes[i - 1].w, 8);
  await shot(page, `${info.project.name}-constructed-histogram`);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await choose(page, 22);
  const q = added.practice[0];
  await answer(page, q);
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("1..2");
  await page.reload();
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "1..2",
  );
  await expect(page.locator(".frequency-unplotted")).toContainText("1..2");
  await expect(page.locator('[data-frequency-index="0"]')).toHaveCount(0);
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("7");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(".question-panel .feedback[role=status]"),
  ).toContainText("Not yet.");
  await expect(
    page.locator(".question-panel .feedback[role=status]"),
  ).toContainText("Revisit 24 ≤ m < 24.2");
  await page.reload();
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "7",
  );
  await expect(page.locator('[data-frequency-index="0"]')).toHaveAttribute(
    "data-frequency",
    "7",
  );
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Revisit frequencies", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "7",
  );
  await choose(page, 23);
  await answer(page, added.practice[1]);
  const separate = await page
    .locator(".frequency-display rect")
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        x: Number(n.getAttribute("x")),
        w: Number(n.getAttribute("width")),
        f: Number(n.getAttribute("data-frequency")),
      })),
    );
  expect(separate.map((b) => b.f)).toEqual([2, 4, 2]);
  expect(separate[1].x).toBeGreaterThan(separate[0].x + separate[0].w);
  await shot(page, `${info.project.name}-constructed-bars`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("cold uncertainty and calibration writing plus frequency construction reveal criteria only after the entire set", async ({
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
      `${info.project.name}-${["scatter", "calibration", "histogram", "bars"][i]}-opening`,
    );
    if (q.parts) {
      await answer(page, q);
      if (i === 2)
        await page.getByLabel(q.parts[0].label, { exact: true }).fill("1..2");
    } else await answer(page, q, raw);
    await page.reload();
    const label = q.parts ? q.parts[0].label : "Your explanation";
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(
      q.parts ? (i === 2 ? "1..2" : String(q.parts[0].answer)) : raw,
    );
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    if (i === 2) {
      await expect(page.locator(".session-heading")).toContainText(
        "2 / 4 recorded",
      );
      await page.getByLabel(label, { exact: true }).fill("7");
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
    }
    if (i < added.check.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(page.locator(".results-banner")).toContainText("1 of 2 correct");
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
  const numeric = page.locator(".results-list > details").nth(2);
  await numeric.locator(":scope > summary").click();
  await expect(numeric).toContainText("17 ≤ m < 17.2: 7");
  await shot(page, `${info.project.name}-retained-wrong-writing`);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("seven-day retrieval independently justifies exclusion, compares investigators and reconstructs both frequency displays", async ({
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
        for (const r of p.work["measurement-uncertainty"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["measurement-uncertainty"].run.submitted =
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
          `${info.project.name}-${["exclusion", "investigators", "histogram", "bars"][n]}-delayed-opening`,
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
        "2 of 2 correct",
      );
      await expect(page.locator(".results-banner")).toContainText(
        "2 of 2 responses saved for self-review",
      );
      await shot(page, `${info.project.name}-mixed-delayed-results`);
    }
  }
});
