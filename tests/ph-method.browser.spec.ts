import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { phJourney as j } from "../src/content/journeys/ph";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const route = "/lessons/ph-scale-and-indicators";
async function settled(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function layout(p: Page, selector: string) {
  await p.evaluate(async () => {
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  const b = (await p.locator(selector).first().boundingBox())!;
  expect(b.height).toBeGreaterThanOrEqual(44);
  expect(b.y + b.height).toBeLessThanOrEqual(664);
  expect(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  for (const size of await p.locator("svg text").evaluateAll((nodes) =>
    nodes.map((n) => {
      const t = n as SVGTextElement,
        m = t.getScreenCTM();
      return m
        ? parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b)
        : 0;
    }),
  ))
    expect(size).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
}
for (const f of [2, 3])
  test(`pH method form ${f} preserves wrong constructions and real delayed review`, async ({
    browser,
  }) => {
    test.setTimeout(240000);
    const data = emptyProgress(),
      w = emptyWork(),
      old = Date.now() - REVIEW_DELAY - 2000;
    data.preferences = { tier: "higher", course: "separate", board: "AQA" };
    w.section = "check";
    w.history = (["check", "review"] as const).flatMap((kind) =>
      (kind === "check" ? j.checkForms : j.reviewForms)
        .slice(0, f)
        .map((form) => ({
          kind,
          ids: form.map((q) => q.id),
          index: form.length - 1,
          started: old - 1000,
          submitted: old,
          responses: Object.fromEntries(
            form.map((q) => [
              q.id,
              {
                answer: "",
                correct: false,
                helped: true,
                fresh: false,
                at: old,
              },
            ]),
          ),
        })),
    );
    data.work["ph-scale-and-indicators"] = w;
    const c = await browser.newContext({
      viewport: { width: 320, height: 664 },
    });
    try {
      const p = await c.newPage();
      await p.addInitScript(
        ({ key, raw }) => {
          if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
        },
        { key: STORAGE_KEY, raw: JSON.stringify(data) },
      );
      await p.goto(route);
      await p
        .getByRole("button", {
          name: "Start understanding check →",
          exact: true,
        })
        .click();
      for (const kind of ["check", "review"] as const) {
        const form = (kind === "check" ? j.checkForms : j.reviewForms)[f];
        for (const [i, q] of form.entries()) {
          if (i)
            await p
              .getByRole("button", { name: "Next question →", exact: true })
              .click();
          for (const width of [320, 390, 1280]) {
            await p.setViewportSize({ width, height: 664 });
            await layout(p, ".written-answer textarea");
            await expect(
              p.locator(
                ".natural-review,.assessment-review-criteria,.sample-reference,.task-workbench,.results-list",
              ),
            ).toHaveCount(0);
          }
          const input = p.getByLabel(
            q.writtenEquations ? "Your equations" : "Your explanation",
            { exact: true },
          );
          const wrong = q.writtenEquations
            ? "H+ + OH- -> H2; NaCl disappears."
            : "Use litmus and report exactly 7.0000 without a chart.";
          await input.fill(wrong);
          await settled(p);
          await p.reload();
          await expect(input).toHaveValue(wrong);
          await p
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          await settled(p);
          await expect(
            p.locator(".natural-review,.assessment-review-criteria"),
          ).toHaveCount(0);
        }
        await p
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await settled(p);
        await expect(p.locator(".results-banner")).toContainText(
          "no automatic score is assigned",
        );
        const saved = await p.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "ph-scale-and-indicators"
            ].history.at(-1),
          STORAGE_KEY,
        );
        expect(saved.ids).toEqual(form.map((q) => q.id));
        for (const q of form)
          expect(saved.responses[q.id]).toMatchObject({
            correct: false,
            helped: false,
          });
        for (const [i, q] of form.entries()) {
          const row = p.locator(".results-list > details").nth(i);
          await row.locator(":scope > summary").click();
          await expect(
            row.locator(".assessment-review-criteria"),
          ).toBeVisible();
          await row.locator(".sample-reference > summary").click();
          await expect(row.locator(".sample-reference")).toContainText(
            q.answer,
          );
        }
        if (kind === "check") {
          await p.getByRole("button", { name: "Review", exact: true }).click();
          await settled(p);
          await expect(
            p.getByRole("button", { name: "Start review →", exact: true }),
          ).toHaveCount(0);
          await p.clock.setSystemTime(Date.now() + REVIEW_DELAY + 3000);
          await p.reload();
          await p
            .getByRole("button", { name: "Start review →", exact: true })
            .click();
        }
      }
    } finally {
      await c.close();
    }
  });
test("all original common assessment questions remain accessible at320/390/1280", async ({
  browser,
}) => {
  test.setTimeout(240000);
  for (const kind of ["check", "review"] as const)
    for (const f of [0, 1]) {
      const data = emptyProgress(),
        w = emptyWork(),
        old = Date.now() - REVIEW_DELAY - 2000,
        form = (kind === "check" ? j.checkForms : j.reviewForms)[f];
      data.preferences.course = "separate";
      w.section = kind;
      w.run = {
        kind,
        ids: form.map((q) => q.id),
        index: 0,
        started: Date.now(),
        responses: {},
      };
      w.history = [
        {
          kind: "check",
          ids: j.checkForms[0].map((q) => q.id),
          index: 4,
          started: old - 1000,
          submitted: old,
          responses: Object.fromEntries(
            j.checkForms[0].map((q) => [
              q.id,
              {
                answer: "",
                correct: false,
                helped: true,
                fresh: false,
                at: old,
              },
            ]),
          ),
        },
      ];
      data.work["ph-scale-and-indicators"] = w;
      const c = await browser.newContext();
      try {
        const p = await c.newPage();
        await p.addInitScript(
          ({ key, raw }) => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
          },
          { key: STORAGE_KEY, raw: JSON.stringify(data) },
        );
        await p.goto(route);
        for (const [i, q] of form.entries()) {
          if (i)
            await p
              .getByRole("button", { name: `Question ${i + 1}`, exact: true })
              .click();
          for (const width of [320, 390, 1280]) {
            await p.setViewportSize({ width, height: 664 });
            await layout(
              p,
              q.rubric
                ? ".written-answer textarea"
                : q.options
                  ? ".answer-option"
                  : ".numeric-input input",
            );
          }
        }
      } finally {
        await c.close();
      }
    }
});

test("every practice response retains readable graphs, reachable navigation and the strict opening at all three widths", async ({
  browser,
}) => {
  test.setTimeout(420000);
  const c = await browser.newContext({ viewport: { width: 320, height: 664 } });
  try {
    const p = await c.newPage();
    await p.goto(route);
    await p.getByRole("button", { name: "Practise", exact: true }).click();
    for (const [i, q] of j.practice.entries()) {
      await p
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .first()
        .click();
      for (const width of [320, 390, 1280]) {
        await p.setViewportSize({ width, height: 664 });
        await layout(
          p,
          q.rubric
            ? ".written-answer textarea"
            : q.options
              ? ".answer-option"
              : ".numeric-input input",
        );
        const nav = p
          .locator(".question-navigation:visible")
          .filter({ has: p.locator('[aria-current="step"]') });
        const active = nav.locator('[aria-current="step"]');
        const [navFrame, tab] = await Promise.all([
          nav.boundingBox(),
          active.boundingBox(),
        ]);
        const frame =
          navFrame ?? (await p.locator(".sample-task-panel").boundingBox());
        expect(tab!.x).toBeGreaterThanOrEqual(frame!.x);
        expect(tab!.x + tab!.width).toBeLessThanOrEqual(
          frame!.x + frame!.width,
        );
      }
    }
    for (const index of [6, 7]) {
      await settled(p);
      const data = emptyProgress(),
        w = emptyWork();
      w.learning = { version: 1, stage: "refresher", index };
      data.work["ph-scale-and-indicators"] = w;
      await p.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
        key: STORAGE_KEY,
        raw: JSON.stringify(data),
      });
      await p.reload();
      for (const width of [320, 390, 1280]) {
        await p.setViewportSize({ width, height: 664 });
        await layout(p, ".written-answer textarea");
      }
    }
  } finally {
    await c.close();
  }
});
