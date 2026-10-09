import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { ionTestsJourney as j } from "../src/content/journeys/ion-tests";
import {
  ionWritingGuided as g,
  ionWritingPractice as p,
  ionWritingChecks as c,
  ionWritingReviews as v,
  ionWritingRefresher as r,
} from "../src/content/journeys/ion-equation-writing";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
  exposureIds,
} from "../src/lib/progress";
import { assertIonNativeDevice, captureIonNative } from "./ion-native-capture";
const route = "/lessons/ion-tests",
  slug = "ion-tests";
const dir = path.join(process.cwd(), "test-results/qa/ion-equations");
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function ready(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}
async function layout(page: Page, selector?: string) {
  await ready(page);
  await assertIonNativeDevice(page);
  const box = (await (
    selector
      ? page.locator(selector).first()
      : page.getByLabel("Your equations", { exact: true })
  ).boundingBox())!;
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(
    path.join(dir, "geometry.jsonl"),
    JSON.stringify({
      viewport: page.viewportSize(),
      native: await page.evaluate(() => ({
        touch: navigator.maxTouchPoints > 0,
        dpr: devicePixelRatio,
      })),
      selector: selector ?? "Your equations",
      title: await page
        .locator(".sample-task-panel h2,.assessment-session h2")
        .first()
        .textContent(),
      height: box.height,
      bottom: box.y + box.height,
    }) + "\n",
  );
  for (const font of await page.locator("svg text").evaluateAll((nodes) =>
    nodes.map((node) => {
      const text = node as SVGTextElement,
        matrix = text.getScreenCTM();
      return (
        Number.parseFloat(getComputedStyle(text).fontSize) *
        (matrix ? Math.hypot(matrix.a, matrix.b) : 1)
      );
    }),
  ))
    expect(font).toBeGreaterThanOrEqual(12);
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
}
async function shot(page: Page, name: string) {
  await ready(page);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    const nav = document.querySelector<HTMLElement>(".sample-stages"),
      active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (nav && active)
      nav.scrollLeft =
        active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    document.querySelector<HTMLElement>(".sidebar")?.scrollTo(0, 0);
  });
  fs.mkdirSync(dir, { recursive: true });
  // Capture the native viewport first: full-page capture can resize sticky
  // containers while collecting the taller image.
  await captureIonNative(page, async () => {
    await page.screenshot({
      path: path.join(dir, name + "-viewport.png"),
      fullPage: false,
      scale: "css",
    });
    await page.screenshot({
      path: path.join(dir, name + ".png"),
      fullPage: true,
      scale: "css",
    });
  });
}
async function state(page: Page) {
  await saved(page);
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work["ion-tests"],
    STORAGE_KEY,
  );
}
async function practice(page: Page, index: number) {
  const stage = page.getByRole("button", { name: "Practise", exact: true });
  if (test.info().project.name === "mobile") await stage.tap();
  else await stage.click();
  await page
    .getByLabel("Choose a practice task", { exact: true })
    .selectOption(String(index));
}
const malformed = "1..2 — {unfinished";
const wrong = "FeCl2(aq) + NaOH(aq) -> FeOH(s) + NaCl(aq)";
test("complete writing at fonts-ready320/390/1280 retains malformed drafts, recordable wrong chemistry and recovery", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await page
      .getByRole("button", { name: "Task 13", exact: true })
      .first()
      .click();
    await layout(page);
    const previousAttempts = (await state(page)).attempts[g.id];
    await page.getByLabel("Your equations", { exact: true }).fill(malformed);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "incomplete syntax cannot be recorded",
    );
    await saved(page);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(malformed);
    expect((await state(page)).attempts[g.id]).toEqual(previousAttempts);
    await page.getByLabel("Your equations", { exact: true }).fill(g.answer);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "no automatic mark",
    );
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "check formulas, coefficients, state symbols",
    );
    await expect(page.locator(".question-panel .feedback")).not.toContainText(
      "Include the reasons for your conclusion",
    );
    await shot(page, `${info.project.name}-guided-${width}`);
    await practice(page, 32);
    await layout(page);
    await page.getByLabel("Your equations", { exact: true }).fill(malformed);
    await saved(page);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(malformed);
    await page.getByLabel("Your equations", { exact: true }).fill(wrong);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "no automatic mark",
    );
    await saved(page);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(wrong);
    await shot(page, `${info.project.name}-practice-wrong-${width}`);
    await page
      .getByRole("button", { name: "Revisit the key idea", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: r.title, exact: true }),
    ).toBeVisible();
    await layout(page, ".question-panel .answer-option");
    await shot(page, `${info.project.name}-recovery-${width}`);
    await page
      .getByRole("button", { name: "Return to your task →", exact: true })
      .click();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(wrong);
    expect((await state(page)).attempts[p[0].id].at(-1)).toMatchObject({
      answer: wrong,
      correct: false,
      fresh: false,
    });
    for (const n of [33, 34]) {
      await practice(page, n);
      await layout(page);
      await page
        .getByLabel("Your equations", { exact: true })
        .fill(p[n - 32].answer);
      await page.locator(".sample-check-answer").click();
      await expect(page.locator(".question-panel .feedback")).toContainText(
        "no automatic mark",
      );
      await shot(page, `${info.project.name}-practice-${n}-${width}`);
    }
  }
});
async function expire(page: Page) {
  await saved(page);
  const before = await state(page);
  const now = await page.evaluate(() => Date.now());
  // Advance the browser clock: never rewrite saved submission/response history.
  await page.clock.setSystemTime(now + REVIEW_DELAY + 1000);
  await page.reload();
  const after = await state(page);
  expect(after.history).toEqual(before.history);
  expect(after.run).toEqual(before.run);
}

test("new cold and seven-day written forms seal references, retain old history, reject malformed recording and keep helped equivalents non-fresh", async ({
  page,
}, info) => {
  test.setTimeout(150000);
  const data = emptyProgress(),
    work = emptyWork(),
    old = Date.now() - REVIEW_DELAY - 86400000;
  work.history = ["check", "review"].flatMap((kind) =>
    (kind === "check" ? j.checkForms : j.reviewForms)
      .slice(0, 2)
      .map((form) => ({
        kind: kind as "check" | "review",
        ids: form.map((q) => q.id),
        index: form.length - 1,
        started: old - 1000,
        submitted: old,
        responses: Object.fromEntries(
          form.map((q) => [
            q.id,
            {
              answer: "old wrong work",
              correct: false,
              helped: false,
              fresh: true,
              at: old,
            },
          ]),
        ),
      })),
  );
  // Seed coherent historical exposure as a real completed form would: retained
  // prior formula help must not become fresh merely because the new IDs differ.
  data.seen = Object.fromEntries(
    exposureIds(work.history.flatMap((run) => run.ids)).map((id) => [id, old]),
  );
  data.work[slug] = work;
  await page.addInitScript(
    ({ key, raw }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    },
    { key: STORAGE_KEY, raw: JSON.stringify(data) },
  );
  await page.goto(route);
  // Actual shown/checked help, not fabricated fresh=false state.
  await page
    .getByRole("button", { name: "Task 13", exact: true })
    .first()
    .click();
  await page.getByLabel("Your equations", { exact: true }).fill(wrong);
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page.getByRole("radio", { name: r.answer, exact: true }).check();
  await page.locator(".sample-check-answer").click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    if (form)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
    expect((await state(page)).run.ids).toEqual([c[form][0].id]);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 664 });
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await layout(page);
      await shot(page, `${info.project.name}-independent-${form}-${width}`);
    }
    await expect(
      page.locator(
        ".assessment-review-criteria,.sample-reference,.ion-tests-workbench",
      ),
    ).toHaveCount(0);
    await page.getByLabel("Your equations", { exact: true }).fill(malformed);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(
      page.locator(".assessment-session .feedback[role=status]"),
    ).toContainText("incomplete syntax");
    expect(Object.keys((await state(page)).run.responses)).toHaveLength(0);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(malformed);
    await page.getByLabel("Your equations", { exact: true }).fill(wrong);
    await saved(page);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(wrong);
    await shot(page, `${info.project.name}-independent-wrong-${form}`);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await page.locator(".assessment-results details summary").first().click();
    await expect(page.locator(".assessment-review-criteria li")).toHaveText(
      c[form][0].rubric!,
    );
    await expect(page.locator(".assessment-results")).toContainText(wrong);
    await shot(page, `${info.project.name}-submitted-${form}`);
    const latest = (await state(page)).history.at(-1);
    expect(latest.responses[c[form][0].id]).toMatchObject({
      answer: wrong,
      correct: false,
      fresh: false,
    });
  }
  await practice(page, 33);
  await page
    .getByLabel("Your equations", { exact: true })
    .fill("AlNO3(aq) + NaOH(aq) -> AlOH(s) + NaNO3(aq)");
  await page.locator(".sample-check-answer").click();
  await saved(page);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expire(page);
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    if (form) {
      await expect(
        page.getByRole("button", { name: "Try the next form", exact: true }),
      ).toBeDisabled();
      await expire(page);
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
    }
    expect((await state(page)).run.ids).toEqual([v[form][0].id]);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 664 });
      await page.getByRole("button", { name: "Review", exact: true }).click();
      await layout(page);
      await shot(page, `${info.project.name}-delayed-opening-${form}-${width}`);
    }
    await expect(
      page.locator(".assessment-review-criteria,.sample-reference"),
    ).toHaveCount(0);
    await page.getByLabel("Your equations", { exact: true }).fill(wrong);
    await saved(page);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(wrong);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await page.locator(".assessment-results details summary").first().click();
    await expect(page.locator(".assessment-review-criteria li")).toHaveText(
      v[form][0].rubric!,
    );
    await shot(page, `${info.project.name}-delayed-${form}`);
    const latest = (await state(page)).history.at(-1);
    expect(latest.responses[v[form][0].id]).toMatchObject({
      answer: wrong,
      correct: false,
      fresh: false,
    });
  }
  const final = (await state(page)).history;
  expect(final).toHaveLength(8);
  expect(final.slice(0, 4)).toEqual(work.history);
});

test("every original sealed ion question has a complete first response within664px at320/390/1280", async ({
  browser,
}, info) => {
  test.setTimeout(240000);
  for (const kind of ["check", "review"] as const)
    for (const f of [0, 1]) {
      const data = emptyProgress(),
        work = emptyWork(),
        form = (kind === "check" ? j.checkForms : j.reviewForms)[f],
        old = Date.now() - REVIEW_DELAY - 2000;
      work.section = kind;
      work.run = {
        kind,
        ids: form.map((q) => q.id),
        index: 0,
        started: Date.now(),
        responses: {},
      };
      if (kind === "review") {
        const previous = j.checkForms[f];
        work.history = [
          {
            kind: "check",
            ids: previous.map((q) => q.id),
            index: previous.length - 1,
            started: old - 1000,
            submitted: old,
            responses: Object.fromEntries(
              previous.map((q) => [
                q.id,
                {
                  answer: q.answer,
                  correct: !q.rubric,
                  helped: false,
                  fresh: false,
                  at: old,
                },
              ]),
            ),
          },
        ];
        data.seen = Object.fromEntries(
          exposureIds(previous.map((q) => q.id)).map((id) => [id, old]),
        );
      }
      data.work[slug] = work;
      const context = await browser.newContext({
        ...devices[
          info.project.name === "mobile" ? "iPhone 13" : "Desktop Chrome"
        ],
        viewport: { width: 320, height: 664 },
      });
      try {
        const page = await context.newPage();
        await page.addInitScript(
          ({ key, raw }) => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
          },
          { key: STORAGE_KEY, raw: JSON.stringify(data) },
        );
        await page.goto(route);
        expect(await page.evaluate(() => navigator.maxTouchPoints > 0)).toBe(
          info.project.name === "mobile",
        );
        expect(await page.evaluate(() => devicePixelRatio)).toBe(
          info.project.name === "mobile"
            ? devices["iPhone 13"].deviceScaleFactor
            : 1,
        );
        for (const [i] of form.entries()) {
          if (i)
            await page
              .getByRole("button", { name: "Next question →", exact: true })
              .click();
          const selector =
            ".question-panel .answer-option,.question-panel input:not([type=checkbox]),.question-panel textarea,.question-panel select";
          for (const width of [320, 390, 1280]) {
            await page.setViewportSize({ width, height: 664 });
            await expect(page.locator(selector).first()).toBeVisible();
            await layout(page, selector);
            await expect(
              page.locator(
                ".assessment-review-criteria,.results-list,.sample-reference,.task-workbench",
              ),
            ).toHaveCount(0);
            if (!i)
              await shot(
                page,
                `${info.project.name}-original-${kind}-${f}-${width}`,
              );
          }
          // Native layout and sealing are tested independently of answer correctness.
          await page
            .getByRole("button", { name: "Leave unanswered", exact: true })
            .click();
          await saved(page);
        }
        await page
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await saved(page);
        const actual = await state(page);
        expect(actual.history.slice(0, -1)).toEqual(work.history ?? []);
        expect(actual.history.at(-1).ids).toEqual(form.map((q) => q.id));
      } finally {
        await context.close();
      }
    }
});

test("all original manual practice controls fit and retain malformed and wrong work without automatic marks", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    for (const index of [25, 26, 27]) {
      const q = j.practice[index];
      await practice(page, index);
      await layout(page, 'textarea[aria-label="Your explanation"]');
      const input = page.getByLabel("Your explanation", { exact: true });
      const attempts = (await state(page)).attempts[q.id];
      await input.fill(malformed);
      await saved(page);
      await page.reload();
      await expect(input).toHaveValue(malformed);
      expect((await state(page)).attempts[q.id]).toEqual(attempts);
      await input.fill(wrong);
      await page.locator(".sample-check-answer").click();
      await expect(page.locator(".question-panel .feedback")).toContainText(
        "Compare",
      );
      if (index === 26) {
        await expect(page.locator(".question-panel .feedback")).toContainText(
          "check formulas, coefficients, state symbols",
        );
        await expect(
          page.locator(".question-panel .feedback"),
        ).not.toContainText("Include the reasons for your conclusion");
      }
      await saved(page);
      await page.reload();
      await expect(input).toHaveValue(wrong);
      const attempt = (await state(page)).attempts[q.id].at(-1);
      expect(attempt.correct).toBe(false);
      expect(attempt.answer).toBe(wrong);
      await shot(
        page,
        `${info.project.name}-original-practice-${index + 1}-${width}`,
      );
    }
  }
});
