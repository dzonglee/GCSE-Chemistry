import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { naturalJourney as j } from "../src/content/journeys/natural-journey";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const route = "/lessons/natural-polymers";
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
  test(`Higher form ${f} preserves wrong constructions and real delayed review`, async ({
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
    data.work["natural-polymers"] = w;
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
            await layout(
              p,
              q.naturalDrawing
                ? ".natural-drawing :is(select,input)"
                : ".written-answer textarea",
            );
            await expect(
              p.locator(
                ".natural-review,.assessment-review-criteria,.sample-reference,.task-workbench,.results-list",
              ),
            ).toHaveCount(0);
          }
          const input = q.naturalDrawing
            ? p.locator(".natural-drawing :is(select,input)").first()
            : p.getByLabel("Your explanation", { exact: true });
          if (q.naturalDrawing)
            await input.selectOption(
              q.naturalDrawing.mode === "peptideUnit" ? "NH2" : "CO",
            );
          else
            await input.fill(
              "No water; ionic attraction joins whole unchanged monomers.",
            );
          await settled(p);
          await p.reload();
          await expect(input).toHaveValue(
            q.naturalDrawing
              ? q.naturalDrawing.mode === "peptideUnit"
                ? "NH2"
                : "CO"
              : "No water; ionic attraction joins whole unchanged monomers.",
          );
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
              "natural-polymers"
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
          if (q.naturalDrawing)
            await expect(row.locator(".natural-review")).toBeVisible();
          else {
            await row.locator(".sample-reference > summary").click();
            await expect(row.locator(".sample-reference")).toContainText(
              q.answer,
            );
          }
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
          index: 7,
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
      data.work["natural-polymers"] = w;
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
              q.naturalDrawing
                ? ".natural-drawing :is(select,input)"
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

test("changing to Foundation retains a started Higher construction and its exact draft", async ({
  page,
}) => {
  const data = emptyProgress(),
    w = emptyWork(),
    q = j.checkForms[2][0];
  data.preferences = { tier: "higher", course: "separate", board: "AQA" };
  w.section = "check";
  w.run = {
    kind: "check",
    ids: j.checkForms[2].map((q) => q.id),
    index: 0,
    started: Date.now(),
    responses: {},
  };
  data.work["natural-polymers"] = w;
  await page.addInitScript(
    ({ key, raw }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    },
    { key: STORAGE_KEY, raw: JSON.stringify(data) },
  );
  await page.goto(route);
  const input = page.locator(
    '.natural-drawing [data-drawing-field="nitrogen"]',
  );
  await input.selectOption("NH2");
  await settled(page);
  const before = await page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key)!).work["natural-polymers"].drafts[
        id
      ],
    { key: STORAGE_KEY, id: q.id },
  );
  await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!);
    data.preferences.tier = "foundation";
    data.revision += 1;
    localStorage.setItem(key, JSON.stringify(data));
  }, STORAGE_KEY);
  await page.reload();
  await expect(input).toHaveValue("NH2");
  await expect(page.locator(".question-panel h2")).toHaveText(q.title!);
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["natural-polymers"].drafts[
          id
        ],
      { key: STORAGE_KEY, id: q.id },
    ),
  ).toBe(before);
  await expect(page.locator(".natural-task-instructions")).toHaveText(q.prompt);
});

test("panning a repeat keeps its scientific captions inside the reading frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 664 });
  const data = emptyProgress(),
    w = emptyWork();
  data.preferences = { tier: "higher", course: "separate", board: "AQA" };
  w.section = "check";
  w.run = {
    kind: "check",
    ids: j.checkForms[2].map((q) => q.id),
    index: 0,
    started: Date.now(),
    responses: {},
  };
  data.work["natural-polymers"] = w;
  await page.addInitScript(
    ({ key, raw }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    },
    { key: STORAGE_KEY, raw: JSON.stringify(data) },
  );
  await page.goto(route);
  const pan = page.locator(".natural-repeat-preview .natural-pan");
  await pan.waitFor();
  await pan.evaluate((n) => {
    n.scrollLeft = 140;
    n.scrollIntoView({ block: "center" });
  });
  await page.evaluate(() => document.fonts.ready);
  const frame = (await pan.boundingBox())!;
  expect(await pan.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
  for (const p of await pan.locator(":scope > p").all()) {
    const box = (await p.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(frame.x);
    expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width);
  }
  await expect(pan).toContainText("condensed connectivity diagram");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
