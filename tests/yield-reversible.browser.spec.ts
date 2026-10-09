import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { percentageYieldJourney as j } from "../src/content/journeys/percentage-yield";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const slug = "yield-and-atom-economy",
  route = `/lessons/${slug}`;
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
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    scrollTo({ top: 0, left: 0, behavior: "instant" });
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  const box = (await p.locator(selector).first().boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  for (const size of await p.locator("svg text").evaluateAll((nodes) =>
    nodes.flatMap((n) => {
      const t = n as SVGTextElement,
        box = t.getBoundingClientRect(),
        matrix = t.getScreenCTM();
      if (
        !matrix ||
        !box.width ||
        !box.height ||
        getComputedStyle(t).visibility === "hidden"
      )
        return [];
      return [
        parseFloat(getComputedStyle(t).fontSize) *
          Math.hypot(matrix.a, matrix.b),
      ];
    }),
  ))
    expect(size).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
}
for (const width of [320, 390, 1280])
  test(`fonts-ready ${width}: reversible inventory, complete causes and original response openings`, async ({
    browser,
  }) => {
    test.setTimeout(240000);
    const c = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 664 },
    });
    try {
      const p = await c.newPage();
      await p.goto(route);
      for (const stage of ["refresher", "guided", "practice"] as const) {
        const candidates = j[stage]
          .map((q, i) => ({ q, i }))
          .filter(({ q }) => q.id.startsWith("py-v1-reversible-"));
        for (const { q, i } of candidates) {
          const d = emptyProgress(),
            w = emptyWork();
          d.preferences.course = "separate";
          w.section = stage === "practice" ? "practice" : "explore";
          w.learning = { version: 1, stage, index: i };
          d.work[slug] = w;
          await p.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
            key: STORAGE_KEY,
            raw: JSON.stringify(d),
          });
          await p.reload();
          await layout(
            p,
            q.model
              ? ".reversible-workbench .button"
              : q.rubric
                ? ".written-answer textarea"
                : ".question-panel input",
          );
          if (q.model) {
            await expect(p.locator(".task-workbench")).toContainText(
              "See continuing reactions",
            );
            await expect(p.locator(".reversible-token")).toHaveCount(20);
            await expect(p.locator(".reversible-yield-summary dd")).toHaveText([
              "14",
              "6",
              "20",
            ]);
            await expect(
              p.getByRole("button", { name: "Check model", exact: true }),
            ).toHaveCount(0);
            await p
              .getByRole("button", {
                name: "Advance one interval",
                exact: true,
              })
              .click();
            await settled(p);
            await expect(p.locator(".token-changed")).toHaveCount(4);
            await expect(p.locator(".reversible-yield-summary dd")).toHaveText([
              "14",
              "6",
              "20",
            ]);
            await layout(p, ".reversible-workbench .button");
            await p.locator(".question-panel input").fill("42.857");
            await p
              .getByRole("button", { name: "Check answer", exact: true })
              .click();
            await settled(p);
            await p.reload();
            await expect(p.locator(".question-panel input")).toHaveValue(
              "42.857",
            );
            await expect(p.locator(".token-changed")).toHaveCount(4);
            await p.getByRole("button", { name: "Undo", exact: true }).click();
            await expect(p.locator(".token-changed")).toHaveCount(0);
            await p
              .getByRole("button", {
                name: "Advance one interval",
                exact: true,
              })
              .click();
            await p
              .getByRole("button", { name: "Reset model", exact: true })
              .click();
            await expect(p.locator(".token-changed")).toHaveCount(0);
            await expect(p.locator(".reversible-yield-summary dd")).toHaveText([
              "14",
              "6",
              "20",
            ]);
            await expect(p.locator(".question-panel input")).toHaveValue(
              "42.857",
            );
            await p.locator(".question-panel input").fill("30");
            await p
              .getByRole("button", { name: "Check answer", exact: true })
              .click();
            await expect(p.locator(".question-panel")).toContainText("30%");
          } else {
            await p
              .locator(".written-answer textarea")
              .fill("Atoms vanished, so the yield is lower.");
            await p.getByRole("button", { name: /^Save and review/ }).click();
            await settled(p);
            await p.reload();
            await expect(p.locator(".written-answer textarea")).toHaveValue(
              "Atoms vanished, so the yield is lower.",
            );
            const saved = await p.evaluate(
              (key) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "yield-and-atom-economy"
                ],
              STORAGE_KEY,
            );
            expect(saved.attempts[q.id].at(-1)).toMatchObject({
              correct: false,
              fresh: false,
            });
          }
        }
      }
      for (const kind of ["check", "review"] as const)
        for (const f of [0, 1, 2, 3]) {
          const form = (kind === "check" ? j.checkForms : j.reviewForms)[f];
          for (const [index, q] of form.entries()) {
            const d = emptyProgress(),
              w = emptyWork();
            d.preferences.course = "separate";
            w.section = kind;
            w.run = {
              kind,
              ids: form.map((q) => q.id),
              index,
              started: Date.now(),
              responses: {},
            };
            if (kind === "review")
              w.history = [
                {
                  kind: "check",
                  ids: j.checkForms[0].map((q) => q.id),
                  index: 0,
                  started: Date.now() - REVIEW_DELAY - 3000,
                  submitted: Date.now() - REVIEW_DELAY - 2000,
                  responses: Object.fromEntries(
                    j.checkForms[0].map((q) => [
                      q.id,
                      {
                        answer: "",
                        correct: false,
                        helped: true,
                        fresh: false,
                        at: Date.now() - REVIEW_DELAY - 2000,
                      },
                    ]),
                  ),
                },
              ];
            d.work[slug] = w;
            await p.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
              key: STORAGE_KEY,
              raw: JSON.stringify(d),
            });
            await p.reload();
            await layout(
              p,
              q.rubric ? ".written-answer textarea" : ".question-panel input",
            );
            await expect(
              p.locator(
                ".sample-reference,.assessment-review-criteria,.results-list,.task-workbench",
              ),
            ).toHaveCount(0);
          }
        }
    } finally {
      await c.close();
    }
  });
for (const f of [2, 3])
  test(`new yield form ${f}: raw wrong answers, sealed manual review and real seven-day retrieval`, async ({
    browser,
  }) => {
    test.setTimeout(240000);
    const c = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 320, height: 664 },
    });
    try {
      const d = emptyProgress(),
        w = emptyWork(),
        old = Date.now() - REVIEW_DELAY - 2000;
      d.preferences.course = "separate";
      w.section = "check";
      w.history = (["check", "review"] as const).flatMap((kind) =>
        (kind === "check" ? j.checkForms : j.reviewForms)
          .slice(0, f)
          .map((form) => ({
            kind,
            ids: form.map((q) => q.id),
            index: 0,
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
      d.work[slug] = w;
      const p = await c.newPage();
      await p.addInitScript(
        ({ key, raw }) => {
          if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
        },
        { key: STORAGE_KEY, raw: JSON.stringify(d) },
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
          const input = p.locator(
              q.rubric ? ".written-answer textarea" : ".question-panel input",
            ),
            wrong = q.rubric
              ? "All atoms disappeared; a reversible reaction must stop."
              : "40";
          if (!q.rubric) {
            await input.fill("1..2");
            await p
              .getByRole("button", { name: "Record answer", exact: true })
              .click();
            await settled(p);
            const run = await p.evaluate(
              (key) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "yield-and-atom-economy"
                ].run,
              STORAGE_KEY,
            );
            expect(run.responses[q.id]).toBeUndefined();
            await p.reload();
            await expect(input).toHaveValue("1..2");
          }
          await input.fill(wrong);
          await settled(p);
          await p.reload();
          await expect(input).toHaveValue(wrong);
          await p
            .getByRole("button", { name: "Record answer", exact: true })
            .click();
          await settled(p);
          await expect(
            p.locator(".sample-reference,.assessment-review-criteria"),
          ).toHaveCount(0);
        }
        await p
          .getByRole("button", { name: "Submit whole set", exact: true })
          .click();
        await settled(p);
        const saved = await p.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "yield-and-atom-economy"
            ].history.at(-1),
          STORAGE_KEY,
        );
        expect(saved.ids).toEqual(form.map((q) => q.id));
        for (const q of form)
          expect(saved.responses[q.id]).toMatchObject({
            correct: false,
            helped: false,
          });
        const row = p.locator(".results-list > details").nth(1);
        await row.locator(":scope > summary").click();
        await expect(row.locator(".assessment-review-criteria")).toBeVisible();
        await row.locator(".sample-reference > summary").click();
        await expect(row.locator(".sample-reference")).toContainText(
          form[1].answer,
        );
        await expect(row).toContainText(
          "All atoms disappeared; a reversible reaction must stop.",
        );
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
