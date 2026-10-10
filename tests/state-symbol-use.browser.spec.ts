import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { statesJourney } from "../src/content/journeys/states-of-matter";
import { stateSymbolUseAdditions as added } from "../src/content/journeys/state-symbol-use";
import { statesForTier } from "../src/content/journeys/states-writing";
import type { Question } from "../src/content/types";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
  exposureIds,
} from "../src/lib/progress";
import { mark } from "../src/lib/marking";
const route = "/lessons/states-of-matter",
  foundation = statesForTier(statesJourney, "foundation");
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function opening(page: Page, q: Question) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  const field = page
    .locator(
      q.options ? ".question-panel .answer-option" : ".question-panel textarea",
    )
    .first();
  const b = (await field.boundingBox())!;
  expect(b.height).toBeGreaterThanOrEqual(q.options ? 44 : 104);
  expect(b.y + b.height, q.id).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function shot(page: Page, name: string) {
  await mkdir("test-results/qa/state-symbol-use", { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-results/qa/state-symbol-use/${name}.png`,
    fullPage: true,
    scale: "css",
  });
  await page.screenshot({
    path: `test-results/qa/state-symbol-use/${name}-viewport.png`,
    scale: "css",
  });
}
async function answer(page: Page, q: Question, raw = q.answer) {
  if (q.options)
    await page.getByRole("radio", { name: raw, exact: true }).check();
  else
    await page
      .getByLabel(q.writtenEquations ? "Your equations" : "Your explanation", {
        exact: true,
      })
      .fill(raw);
}
async function complete(page: Page, form: Question[]) {
  for (const [i, q] of form.entries()) {
    await answer(page, q);
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
  await saved(page);
}

test("individual teaching, recovery and practice use complete state equations and preserve wrong raw answers at three widths", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 1280])
    for (const [stage, q] of [
      ["guided", added.guided],
      ["refresher", added.recovery],
      ["practice", added.practice],
    ] as const) {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(route);
      const p = emptyProgress(),
        w = emptyWork();
      w.learning = {
        version: 1,
        stage,
        index: statesJourney[stage].findIndex((task) => task.id === q.id),
      };
      w.section = stage === "practice" ? "practice" : "explore";
      p.work["states-of-matter"] = w;
      await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
        key: STORAGE_KEY,
        raw: JSON.stringify(p),
      });
      await page.reload();
      await expect(
        page.getByRole("heading", { name: q.title!, exact: true }),
      ).toBeVisible();
      await opening(page, q);
      if (q.rubric) {
        await expect(
          page.getByLabel("Your equations", { exact: true }),
        ).toHaveValue("");
        const wrong = "Na2CO3(aq) + 2HNO3(l)\n-> 2NaNO3(s) + CO2(l) + H2O(g)";
        await answer(page, q, wrong);
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your equations", { exact: true }),
        ).toHaveValue(wrong);
        await page
          .getByRole("button", {
            name: "Save and review equations",
            exact: true,
          })
          .click();
        await expect(
          page.locator(".question-panel [role=status]"),
        ).toContainText("Compare your equations");
        await expect(
          page.getByText("That’s right.", { exact: true }),
        ).toHaveCount(0);
        await saved(page);
        const result = await page.evaluate(
          ({ key, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "states-of-matter"
            ].attempts[id].at(-1),
          { key: STORAGE_KEY, id: q.id },
        );
        expect(result.answer).toBe(wrong);
        expect(result.correct).toBe(false);
      } else {
        await answer(page, q, "H2O(aq)");
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await expect(
          page.locator(".question-panel [role=status]"),
        ).toContainText("Aqueous");
      }
      await shot(page, `${info.project.name}-${width}-${stage}`);
    }
});

test("fourth cold form stays sealed and vapour transfer follows three original reviews with each real seven-day wait", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 720 });
  const now = Date.now();
  await page.clock.setFixedTime(new Date(now));
  await page.goto(route);
  const p = emptyProgress(),
    w = emptyWork();
  w.history = foundation.checkForms.slice(0, 3).map((form, i) => {
    const started = now - 10000 + i * 1000,
      submitted = started + 500;
    for (const q of form)
      for (const id of exposureIds([q.id])) p.seen[id] = submitted;
    return {
      kind: "check" as const,
      ids: form.map((q) => q.id),
      index: form.length - 1,
      started,
      submitted,
      responses: Object.fromEntries(
        form.map((q) => [
          q.id,
          {
            answer: q.answer,
            correct: mark(q, q.answer).correct,
            fresh: true,
            helped: false,
            at: started + 100,
          },
        ]),
      ),
    };
  });
  p.work["states-of-matter"] = w;
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(p),
  });
  await page.reload();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: added.check.title!, exact: true }),
  ).toBeVisible();
  await opening(page, added.check);
  const wrong = "Zn(aq) + H2SO4(l)\n-> ZnSO4(s) + H2(l)";
  await answer(page, added.check, wrong);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    wrong,
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  await expect(
    page.locator(".assessment-review-criteria,.assessment-results"),
  ).toHaveCount(0);
  await expect(page.getByText(added.check.answer, { exact: true })).toHaveCount(
    0,
  );
  await shot(page, `${info.project.name}-cold-recorded-sealed`);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await saved(page);
  const cold = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["states-of-matter"].run,
    STORAGE_KEY,
  );
  expect(cold.ids).toEqual([added.check.id]);
  expect(cold.responses[added.check.id]).toMatchObject({
    answer: wrong,
    correct: false,
    fresh: true,
    helped: false,
  });
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await saved(page);
  await page.clock.setFixedTime(new Date(cold.submitted + REVIEW_DELAY - 1));
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  for (let i = 0; i < 4; i++) {
    const submitted = await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "states-of-matter"
        ].history.at(-1).submitted,
      STORAGE_KEY,
    );
    await page.clock.setFixedTime(new Date(submitted + REVIEW_DELAY));
    await page.reload();
    await page
      .getByRole("button", {
        name: i === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (i < 3) {
      await complete(page, foundation.reviewForms[i]);
      continue;
    }
    await expect(
      page.getByRole("heading", { name: added.review.title!, exact: true }),
    ).toBeVisible();
    await opening(page, added.review);
    const raw = "2NaHCO3(s) -> Na2CO3(s) + CO2(g) + H2O(l)";
    await answer(page, added.review, raw);
    await saved(page);
    await page.reload();
    await expect(
      page.getByLabel("Your equations", { exact: true }),
    ).toHaveValue(raw);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await saved(page);
    await expect(
      page.locator(".assessment-review-criteria,.assessment-results"),
    ).toHaveCount(0);
    await shot(page, `${info.project.name}-delayed-recorded-sealed`);
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await saved(page);
    const result = await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["states-of-matter"].run,
      STORAGE_KEY,
    );
    expect(result.ids).toEqual([added.review.id]);
    expect(result.responses[added.review.id]).toMatchObject({
      answer: raw,
      correct: false,
      fresh: true,
      helped: false,
    });
    await page.locator(".results-list > details > summary").click();
    await expect(page.locator(".assessment-review-criteria")).toContainText(
      "water vapour",
    );
    await shot(page, `${info.project.name}-delayed-manual-review`);
  }
});

test("a previously seen state-symbol check retains wrong raw work without fresh credit", async ({
  page,
}) => {
  await page.goto(route);
  const now = Date.now(),
    p = emptyProgress(),
    w = emptyWork();
  w.history = foundation.checkForms.slice(0, 3).map((form, i) => ({
    kind: "check" as const,
    ids: form.map((q) => q.id),
    index: form.length - 1,
    started: now - 10000 + i * 1000,
    submitted: now - 9500 + i * 1000,
    responses: Object.fromEntries(
      form.map((q) => [
        q.id,
        {
          answer: q.answer,
          correct: mark(q, q.answer).correct,
          fresh: true,
          helped: false,
          at: now - 9900 + i * 1000,
        },
      ]),
    ),
  }));
  for (const run of w.history)
    for (const id of exposureIds(run.ids)) p.seen[id] = run.submitted!;
  const previouslySeen = now - 20000;
  p.seen[added.check.id] = previouslySeen;
  p.work["states-of-matter"] = w;
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(p),
  });
  await page.reload();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: added.check.title!, exact: true }),
  ).toBeVisible();
  const raw = "Zn(aq) + H2SO4(l)\n-> ZnSO4(s) + H2(l)";
  await answer(page, added.check, raw);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your equations", { exact: true })).toHaveValue(
    raw,
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  const recorded = await page.evaluate(
    ({ key, id }) => {
      const stored = JSON.parse(localStorage.getItem(key)!);
      return {
        response: stored.work["states-of-matter"].run.responses[id],
        seen: stored.seen[id],
      };
    },
    { key: STORAGE_KEY, id: added.check.id },
  );
  expect(recorded.response).toMatchObject({
    answer: raw,
    correct: false,
    helped: false,
    fresh: false,
  });
  expect(recorded.seen).toBe(previouslySeen);
  await expect(
    page.locator(".assessment-review-criteria,.assessment-results"),
  ).toHaveCount(0);
});
