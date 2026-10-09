import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lcaJourney as j } from "../src/content/journeys/life-cycle-assessment";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const route = "/lessons/life-cycle-and-recycling";
for (const [caseName, raw] of [
  ["broken JSON", '{"larger":"1..2",'],
  [
    "foreign field",
    JSON.stringify({
      ...JSON.parse(j.checkForms[4][0].answer),
      foreign: "retained bytes",
    }),
  ],
] as const)
  test(`${caseName} estimate bytes survive reload and cannot become a recorded answer`, async ({
    page,
  }) => {
    const data = emptyProgress(),
      w = emptyWork(),
      form = j.checkForms[4];
    w.section = "check";
    w.run = {
      kind: "check",
      ids: form.map((q) => q.id),
      index: 0,
      started: Date.now(),
      responses: {},
    };
    w.drafts[form[0].id] = raw;
    data.work["life-cycle-and-recycling"] = w;
    await page.addInitScript(
      ({ key, value }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      },
      { key: STORAGE_KEY, value: JSON.stringify(data) },
    );
    await page.goto(route);
    await expect(
      page.getByText("Saved constructed answer is unreadable.", {
        exact: false,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await settled(page);
    await page.reload();
    const saved = await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["life-cycle-and-recycling"],
      STORAGE_KEY,
    );
    expect(saved.drafts[form[0].id]).toBe(raw);
    expect(saved.run.responses[form[0].id]).toBeUndefined();
    await expect(
      page.getByText("Saved constructed answer is unreadable.", {
        exact: false,
      }),
    ).toBeVisible();
  });
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
    nodes
      .filter((n) => n.getClientRects().length > 0)
      .map((n) => {
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
for (const f of [4, 5])
  test(`resource magnitude form ${f} preserves wrong constructions and real delayed review`, async ({
    browser,
  }) => {
    test.setTimeout(420000);
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
    data.work["life-cycle-and-recycling"] = w;
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
              q.parts ? ".multipart-answer input" : ".written-answer textarea",
            );
            await expect(
              p.locator(
                ".natural-review,.assessment-review-criteria,.sample-reference,.task-workbench,.results-list",
              ),
            ).toHaveCount(0);
          }
          const wrong = q.parts
            ? "999"
            : "Tiny means zero. Therefore every environmental impact is zero.";
          if (q.parts) {
            for (const part of q.parts)
              await p.getByLabel(part.label, { exact: true }).fill(wrong);
          } else
            await p.getByLabel("Your explanation", { exact: true }).fill(wrong);
          await settled(p);
          await p.reload();
          if (q.parts) {
            for (const part of q.parts)
              await expect(
                p.getByLabel(part.label, { exact: true }),
              ).toHaveValue(wrong);
          } else
            await expect(
              p.getByLabel("Your explanation", { exact: true }),
            ).toHaveValue(wrong);
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
          "Written responses and full drawings receive no automatic mark",
        );
        const saved = await p.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key)!).work[
              "life-cycle-and-recycling"
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
          if (!q.rubric) continue;
          const row = p.locator(".results-list > details").nth(i);
          await row.locator(":scope > summary").click();
          await expect(
            row.locator(".assessment-review-criteria"),
          ).toBeVisible();
          await row.locator(".sample-reference > summary").click();
          await expect(row.locator(".sample-reference")).toContainText(
            q.answer,
          );
          await expect(row.locator(".sample-reference")).toContainText(
            "rounded quantities, approximate ratio",
          );
          await expect(row.locator(".sample-reference")).not.toContainText(
            "electrode",
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
  test.setTimeout(420000);
  for (const kind of ["check", "review"] as const)
    for (const f of [0, 1, 2, 3]) {
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
      data.work["life-cycle-and-recycling"] = w;
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
                  : q.parts
                    ? ".multipart-answer input"
                    : ".numeric-input input",
            );
          }
        }
      } finally {
        await c.close();
      }
    }
});

test("every resource practice response retains readable evidence, reachable navigation and the strict opening at all three widths", async ({
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
        .getByLabel("Choose a practice task", { exact: true })
        .selectOption(String(i));
      for (const width of [320, 390, 1280]) {
        await p.setViewportSize({ width, height: 664 });
        await layout(
          p,
          q.rubric
            ? ".written-answer textarea"
            : q.options
              ? ".answer-option"
              : q.parts
                ? ".multipart-answer input"
                : ".numeric-input input",
        );
        const picker = p.getByLabel("Choose a practice task", { exact: true });
        await expect(picker).toHaveValue(String(i));
        await expect(picker).toBeVisible();
        const [frame, control] = await Promise.all([
          p.locator(".sample-task-panel").boundingBox(),
          picker.boundingBox(),
        ]);
        expect(control!.height).toBeGreaterThanOrEqual(44);
        expect(control!.x).toBeGreaterThanOrEqual(frame!.x);
        expect(control!.x + control!.width).toBeLessThanOrEqual(
          frame!.x + frame!.width,
        );
      }
    }
    const picker = p.getByLabel("Choose a practice task", { exact: true });
    await picker.focus();
    await picker.press("Home");
    await expect(picker).toHaveValue("0");
    await picker.focus();
    await picker.press("ArrowDown");
    await expect(picker).toHaveValue("1");
    for (const [stage, index] of [
      ["refresher", 19],
      ["refresher", 20],
      ["guided", 9],
    ] as const) {
      await settled(p);
      const data = emptyProgress(),
        w = emptyWork();
      w.learning = { version: 1, stage, index };
      data.work["life-cycle-and-recycling"] = w;
      await p.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
        key: STORAGE_KEY,
        raw: JSON.stringify(data),
      });
      await p.reload();
      for (const width of [320, 390, 1280]) {
        await p.setViewportSize({ width, height: 664 });
        await layout(
          p,
          index === 20 ? ".written-answer textarea" : ".multipart-answer input",
        );
      }
    }
  } finally {
    await c.close();
  }
});
test("all15 retained native sources keep a visible opening control and legible graphs", async ({
  browser,
}) => {
  test.setTimeout(420000);
  const seen = new Set<string>();
  for (const stage of ["guided", "refresher"] as const)
    for (const [index, q] of j[stage].entries()) {
      if (
        q.model?.kind !== "life-cycle-investigation" ||
        seen.has(q.model.record)
      )
        continue;
      seen.add(q.model.record);
      const data = emptyProgress(),
        w = emptyWork();
      w.learning = { version: 1, stage, index };
      data.work["life-cycle-and-recycling"] = w;
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
        for (const width of [320, 390, 1280]) {
          await p.setViewportSize({ width, height: 664 });
          await layout(p, ".lca-workbench .lca-fields :is(input,select)");
          const graph = p.locator(".lca-workbench .lca-source-chart");
          if (await graph.count()) {
            await graph.evaluate((n) => {
              (n as HTMLDetailsElement).open = true;
            });
            await layout(p, ".lca-workbench .lca-fields :is(input,select)");
          }
        }
      } finally {
        await c.close();
      }
    }
  expect(seen.size).toBe(15);
});
