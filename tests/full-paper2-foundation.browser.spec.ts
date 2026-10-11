import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { paper2FoundationFull as paper } from "../src/content/paper2-foundation-full";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
import { emptyOrganicDrawing } from "../src/lib/organic-drawing";
import { blankPolymerisationDrawing } from "../src/lib/polymerisation-board";
import { emptyFuelDrawing } from "../src/lib/fuel-drawing";
const route = `/exams/${paper.id}`,
  workId = `assessment-${paper.id}`;
const ids = paper.parts.map((p) => p.question.id);
test("historic single-stage and cross-lesson cues keep equivalent paper recall from being labelled fresh", async ({
  page,
}) => {
  const state = emptyProgress();
  state.seen["haber-v1-source-recall-g-sources"] = Date.now();
  state.seen["haber-v1-r-phosphoricRock"] = Date.now();
  for (const cue of [
    "path-v1-p-ethene-water",
    "materials-v1-composite-recall-c-examples",
    "materials-v1-rust-design-v-plan",
    "chromatography-v1-g-explain",
    "greenhouse-v1-vA-explain",
    "materials-v1-cB-glass",
    "oil-v1-a-column",
  ])
    state.seen[cue] = Date.now();
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(state),
  });
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  await saved(page);
  const drafts = await page.evaluate(
    ({ key, workId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].drafts,
    { key: STORAGE_KEY, workId },
  );
  for (const suffix of [
    "10a",
    "10b",
    "05a",
    "04e",
    "09b",
    "06d",
    "08a",
    "04c",
    "03a",
  ])
    expect(drafts[`fresh:chem-p2f-full-v1-${suffix}`]).toBe("false");
  expect(drafts[`fresh:${ids[1]}`]).toBe("true");
});
for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} opened submitted native work and reference criteria are bounded and read-only`, async ({
    browser,
  }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const state = emptyProgress(),
        work = emptyWork(),
        now = Date.now();
      const responses = Object.fromEntries(
        paper.parts.map((part) => {
          const q = part.question;
          const answer = q.organicDrawing
            ? JSON.stringify({
                ...emptyOrganicDrawing(),
                n: "2",
                hydroxyl: "yes",
                h0: "yes",
              })
            : q.polymerisationDrawing
              ? JSON.stringify({
                  ...blankPolymerisationDrawing(),
                  s0: "H",
                  s1: "H",
                  s2: "H",
                  s3: "C2H5",
                  bond: "1",
                  left: "1",
                  right: "1",
                  brackets: "1",
                  countMark: "N",
                })
              : q.fuelDrawing
                ? JSON.stringify({
                    ...emptyFuelDrawing(q.fuelDrawing.data),
                    p0x: "2",
                    p0y: "31.4",
                  })
                : q.answer;
          return [
            q.id,
            {
              answer,
              correct: false,
              fresh: true,
              helped: false,
              at: now - 5000,
            },
          ];
        }),
      );
      work.run = {
        kind: "paper",
        ids,
        index: 48,
        started: now - 10000,
        submitted: now,
        responses,
      };
      work.history = [work.run];
      state.work[workId] = work;
      const page = await context.newPage();
      await page.addInitScript(
        ({ key, raw }) => localStorage.setItem(key, raw),
        { key: STORAGE_KEY, raw: JSON.stringify(state) },
      );
      await page.goto(route);
      for (const number of ["4(a)", "5(a)", "5(e)", "6(b)", "7(a)"]) {
        const row = page
          .locator(".results-list > details")
          .nth(paper.parts.findIndex((p) => p.number === number));
        await row.locator(":scope > summary").click();
        await row.locator(".paper-reference > summary").click();
        if (["4(a)", "5(a)", "5(e)"].includes(number)) {
          await expect(row.locator(".paper-worked-construction")).toHaveCount(
            1,
          );
          await expect(
            row.locator(".paper-worked-construction svg").first(),
          ).toBeVisible();
        }
        if (number === "4(a)") {
          const retained = row.getByRole("region", {
            name: "Retained 4(a) response: polymer construction",
            exact: true,
          });
          const reference = row.getByRole("region", {
            name: "Worked 4(a) reference: polymer construction",
            exact: true,
          });
          for (const [construction, notation, raw] of [
            [
              retained,
              "Upper-case N outside",
              responses[
                paper.parts.find((p) => p.number === number)!.question.id
              ].answer,
            ],
            [
              reference,
              "Lower-case n outside",
              paper.parts.find((p) => p.number === number)!
                .referenceConstruction!,
            ],
          ] as const) {
            await expect(
              construction.locator("input,select,button"),
            ).toHaveCount(0);
            await expect(
              construction
                .locator(".construction-review-values > div")
                .filter({
                  has: page
                    .locator("dt")
                    .getByText("Repeat-count notation", { exact: true }),
                })
                .locator("dd"),
            ).toHaveText(notation);
            await construction
              .getByText("Original saved response", { exact: true })
              .click();
            expect(await construction.locator("pre").textContent()).toBe(raw);
          }
        }
        if (number === "5(a)") {
          await expect(
            row.locator(".result-body > .organic-drawing-input"),
          ).toContainText("1 H");
          await expect(row.locator(".paper-worked-construction")).toContainText(
            "6 H",
          );
        }
        if (number === "5(e)") {
          const retained = row.getByRole("region", {
            name: "Retained 5(e) response: graph construction",
            exact: true,
          });
          const reference = row.getByRole("region", {
            name: "Worked 5(e) reference: graph construction",
            exact: true,
          });
          for (const [construction, coordinates, raw] of [
            [
              retained,
              "x: 2; y: 31.4",
              responses[
                paper.parts.find((p) => p.number === number)!.question.id
              ].answer,
            ],
            [
              reference,
              "x: 2; y: 29.2",
              paper.parts.find((p) => p.number === number)!
                .referenceConstruction!,
            ],
          ] as const) {
            await expect(
              construction.locator("input,select,button"),
            ).toHaveCount(0);
            await expect(
              construction
                .locator(".construction-review-values > div")
                .filter({
                  has: page
                    .locator("dt")
                    .getByText("Observation 1", { exact: true }),
                })
                .locator("dd"),
            ).toHaveText(coordinates);
            await construction
              .getByText("Original saved response", { exact: true })
              .click();
            expect(await construction.locator("pre").textContent()).toBe(raw);
          }
        }
        for (const control of await row
          .locator(
            ".paper-worked-construction input,.paper-worked-construction select,.paper-worked-construction .polymerisation-drawing button,.paper-worked-construction .organic-drawing-input button,.paper-worked-construction .fuel-drawing-input > button",
          )
          .all())
          await expect(control).toBeDisabled();
        await page.evaluate(async () => {
          await document.fonts.ready;
          (document.activeElement as HTMLElement)?.blur();
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          number,
        ).toBe(true);
        for (const field of await row.locator("input,textarea").all())
          await expect(field).toBeDisabled();
        for (const glyph of await row.locator("svg text").evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const t = node as SVGTextElement,
              box = t.getBoundingClientRect(),
              m = t.getScreenCTM();
            return !m || !box.width || !box.height
              ? []
              : [
                  parseFloat(getComputedStyle(t).fontSize) *
                    Math.hypot(m.a, m.b),
                ];
          }),
        ))
          expect(glyph, number).toBeGreaterThanOrEqual(12);
        expect(
          (await new AxeBuilder({ page }).analyze()).violations,
          number,
        ).toEqual([]);
        await row.locator(":scope > summary").click();
      }
    } finally {
      await context.close();
    }
  });
for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} both paper start choices are complete in the opening viewport`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      await page
        .getByRole("button", { name: "Start without a timer →", exact: true })
        .waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        scrollTo(0, 0);
      });
      for (const name of [
        "Start without a timer →",
        "Start with a 105-minute practice timer",
      ]) {
        const box = (await page
          .getByRole("button", { name, exact: true })
          .boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.y + box.height).toBeLessThanOrEqual(664);
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    } finally {
      await context.close();
    }
  });
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
    scrollTo({ top: 0, left: 0, behavior: "instant" });
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  const first = page
    .locator(
      q.options
        ? ".question-panel .answer-option"
        : ".question-panel input,.question-panel textarea,.question-panel select",
    )
    .first();
  const box = (await first.boundingBox())!;
  expect(box.height, q.id).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height, q.id).toBeLessThanOrEqual(664);
  if (q.drawDotCross || q.drawCovalent) {
    const instruction = (await page
      .locator(".question-panel > .written-equation-prompt")
      .boundingBox())!;
    expect(
      instruction.y + instruction.height,
      `${q.id}: instruction before construction`,
    ).toBeLessThanOrEqual(box.y);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    q.id,
  ).toBe(true);
  for (const size of await page.locator("svg text").evaluateAll((nodes) =>
    nodes.flatMap((n) => {
      const t = n as SVGTextElement,
        box = t.getBoundingClientRect(),
        m = t.getScreenCTM();
      return !m ||
        !box.width ||
        !box.height ||
        getComputedStyle(t).visibility === "hidden"
        ? []
        : [parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b)];
    }),
  ))
    expect(size, q.id).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page }).analyze()).violations, q.id).toEqual(
    [],
  );
}
for (const width of [320, 390, 1280])
  for (let chunk = 0; chunk < 5; chunk++)
    test(`fonts-ready ${width} full-paper parts ${chunk * 10 + 1}–${chunk * 10 + 10}`, async ({
      browser,
    }) => {
      test.setTimeout(120000); // Ten different native formats with strict geometry and axe audits.
      const context = await browser.newContext({
        ...(width < 600 ? devices["iPhone 13"] : {}),
        viewport: { width, height: 720 },
      });
      try {
        const page = await context.newPage();
        await page.goto(route);
        await page
          .getByRole("button", { name: "Start without a timer →", exact: true })
          .waitFor();
        for (
          let index = chunk * 10;
          index < Math.min(chunk * 10 + 10, paper.parts.length);
          index++
        ) {
          const p = emptyProgress(),
            w = emptyWork();
          w.run = {
            kind: "paper",
            ids,
            index,
            started: Date.now(),
            responses: {},
          };
          p.work[workId] = w;
          await page.evaluate(
            ({ key, raw }) => localStorage.setItem(key, raw),
            { key: STORAGE_KEY, raw: JSON.stringify(p) },
          );
          await page.reload();
          const part = paper.parts[index];
          await expect(
            page.getByRole("heading", {
              name: part.question.title,
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            page.locator(".question-panel > .eyebrow"),
          ).toContainText(`${part.number} · ${part.marks}`);
          await expect(
            page.locator(".paper-reference,.assessment-results"),
          ).toHaveCount(0);
          await opening(page, part.question);
          await saved(page);
        }
      } finally {
        await context.close();
      }
    });

async function answer(page: Page, q: Question) {
  if (q.polymerisationDrawing) {
    for (const [label, value] of [
      ["Carbon 1: above attachment", "H"],
      ["Carbon 1: below attachment", "H"],
      ["Carbon 2: above attachment", "H"],
      ["Carbon 2: below attachment", "C2H5"],
      ["Bond joining the two backbone/reacting carbons", "1"],
      ["Left continuation bond", "1"],
      ["Right continuation bond", "1"],
      ["Polymer brackets", "1"],
      ["Repeat-count notation", "n"],
    ])
      await page.getByLabel(label, { exact: true }).selectOption(value);
  } else if (q.organicDrawing) {
    await page
      .getByLabel("Choose the number of carbon atoms in your scaffold", {
        exact: true,
      })
      .selectOption("2");
    await page
      .getByRole("button", {
        name: "Terminal C–O attachment: absent",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "H attached to that O: not chosen",
        exact: true,
      })
      .click();
    for (const key of ["h0", "h1", "h2", "h4", "h5"])
      await page.locator(`button[data-h-slot="${key}"]`).click();
  } else if (q.fuelDrawing) {
    for (const [i, [x, y]] of q.fuelDrawing.data.points.entries()) {
      await page
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption(String(i));
      await page
        .getByLabel(`Your plotted point ${i + 1} x`, { exact: true })
        .fill(String(x));
      await page
        .getByLabel(`Your plotted point ${i + 1} y (kJ/g)`, { exact: true })
        .fill(String(y));
    }
    await page
      .getByRole("button", { name: "Edit your fit curve", exact: true })
      .click();
    for (const [i, [x, y]] of q.fuelDrawing.data.points.entries()) {
      await page
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption(String(i));
      await page
        .getByLabel(`Your fit height at original x=${x} (kJ/g)`, {
          exact: true,
        })
        .fill(String(y));
    }
  } else
    await page
      .locator(q.rubric ? ".written-answer textarea" : ".numeric-label input")
      .fill(q.answer);
}

test("all 49 responses stay sealed; contradictory working, native graphs and holistic methods retain manual decisions", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  for (const [i, part] of paper.parts.entries()) {
    await expect(
      page.getByRole("heading", { name: part.question.title, exact: true }),
    ).toBeVisible();
    await answer(page, part.question);
    if (part.number === "7(a)")
      await page
        .locator(".written-answer textarea")
        .fill(
          "Put salt on a clean wire in a blue flame: crimson indicates lithium. Dissolve a fresh portion in water and add silver nitrate: a yellow precipitate suggests iodide. I omitted the acidification step.",
        );
    if (part.number === "5(e)") {
      await page
        .getByRole("button", { name: "Edit observation point", exact: true })
        .click();
      await page
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption("0");
      await page
        .getByLabel("Your plotted point 1 y (kJ/g)", { exact: true })
        .fill("31.4");
    }
    if (part.number === "1(b)") {
      await expect(
        page.getByLabel("Working for this question", { exact: true }),
      ).toBeVisible();
      await page
        .getByLabel("Working for this question", { exact: true })
        .fill("31 × 0.62 = 50\nDeliberately contradictory working.");
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(
      page.getByText("Answer recorded.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.locator(".paper-reference,.assessment-results"),
    ).toHaveCount(0);
    if (i < paper.parts.length - 1)
      await page
        .getByRole("button", { name: "Next part →", exact: true })
        .click();
  }
  await saved(page);
  await page.reload();
  await expect(page.locator(".paper-reference")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit whole paper", exact: true })
    .click();
  const rows = page.locator(".results-list > details");
  await expect(rows).toHaveCount(49);
  for (const number of ["1(b)", "5(e)", "7(a)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === number));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    if (number === "1(b)") {
      await expect(row.locator(".assessment-working-review")).toContainText(
        "Deliberately contradictory",
      );
      await row
        .getByLabel(
          "1(b): final-answer credit after checking working for contradictions",
          { exact: true },
        )
        .selectOption("0");
      for (const n of [1, 2, 3])
        await row
          .getByLabel(`1(b): point-${n} review mark`, { exact: true })
          .selectOption("0");
      await expect(row.locator(":scope > summary")).toContainText("0 / 4");
    } else if (number === "5(e)") {
      await row
        .getByLabel("5(e): point-1 review mark", { exact: true })
        .selectOption("1");
      await row
        .getByLabel("5(e): point-2 review mark", { exact: true })
        .selectOption("1");
      await expect(row.locator(":scope > summary")).toContainText("2 / 3");
    } else {
      await expect(row.locator('input[type="checkbox"]')).toHaveCount(0);
      await row
        .getByLabel("7(a): whole-response mark using the levels", {
          exact: true,
        })
        .selectOption("4");
      await expect(row.locator(":scope > summary")).toContainText("4 / 6");
    }
  }
  await saved(page);
  await page.reload();
  await expect(
    rows
      .nth(paper.parts.findIndex((p) => p.number === "7(a)"))
      .locator(":scope > summary"),
  ).toContainText("4 / 6");
  await expect(
    page.getByRole("heading", { name: /parts still need review/ }),
  ).toBeVisible();
  const state = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(Object.keys(state.work[workId].history[0].responses)).toHaveLength(49);
  expect(state.work[workId].history[0].responses[ids[1]].working).toContain(
    "\n",
  );
  await page
    .getByRole("button", { name: "Try again without a timer", exact: true })
    .click();
  const restart = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(restart.work[workId].history).toHaveLength(1);
  expect(restart.work[workId].drafts["fresh:" + ids[0]]).toBe("false");
});

for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} wrong native constructions survive reload without revealing references`, async ({
    browser,
  }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      for (const number of ["4(a)", "5(a)", "5(e)"]) {
        const index = paper.parts.findIndex((p) => p.number === number),
          q = paper.parts[index].question;
        const p = emptyProgress(),
          w = emptyWork();
        w.run = {
          kind: "paper",
          ids,
          index,
          started: Date.now(),
          responses: {},
        };
        p.work[workId] = w;
        await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
          key: STORAGE_KEY,
          raw: JSON.stringify(p),
        });
        await page.reload();
        await answer(page, q);
        if (number === "4(a)")
          await page
            .getByLabel("Repeat-count notation", { exact: true })
            .selectOption("N");
        if (number === "5(a)")
          await page
            .getByRole("button", {
              name: "H attached to that O: chosen",
              exact: true,
            })
            .click();
        if (number === "5(e)") {
          await page
            .getByRole("button", {
              name: "Edit observation point",
              exact: true,
            })
            .click();
          await page
            .getByLabel(
              "Choose the observation to plot or curve height to edit",
              { exact: true },
            )
            .selectOption("0");
          await page
            .getByLabel("Your plotted point 1 y (kJ/g)", { exact: true })
            .fill("31.4");
        }
        await saved(page);
        const before = await page.evaluate(
          ({ key, workId, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[workId].drafts[id],
          { key: STORAGE_KEY, workId, id: q.id },
        );
        await page.reload();
        await opening(page, q);
        expect(
          await page.evaluate(
            ({ key, workId, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[workId].drafts[id],
            { key: STORAGE_KEY, workId, id: q.id },
          ),
        ).toBe(before);
        await expect(page.locator(".paper-reference")).toHaveCount(0);
      }
    } finally {
      await context.close();
    }
  });

test("malformed numerical work survives refresh without being recordable and timed overrun remains explicit", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-10T10:00:00Z") });
  await page.goto(route);
  await page
    .getByRole("button", {
      name: "Start with a 105-minute practice timer",
      exact: true,
    })
    .click();
  await expect(page.locator(".paper-clock")).toContainText("remaining");
  await page.locator(".assessment-question-jump > summary").click();
  const index = paper.parts.findIndex((p) => p.number === "1(b)");
  await page
    .getByRole("button", {
      name: `Part ${paper.parts[index].number}`,
      exact: true,
    })
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("1..2");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".feedback")).toContainText("valid number");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1..2",
  );
  const state = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(state.work[workId].run.responses[ids[index]]).toBeUndefined();
  await page.clock.fastForward(106 * 60000);
  await expect(page.locator(".paper-clock")).toContainText("Time overrun");
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1..2",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("49");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  const wrong = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(wrong.work[workId].run.responses[ids[index]]).toMatchObject({
    answer: "49",
    correct: false,
  });
});

for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} timed and overrun openings retain readable data and complete response targets`, async ({
    browser,
  }) => {
    test.setTimeout(120000); // Two clock states across five different demanding formats, with axe/geometry checks.
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      await page
        .getByRole("button", { name: "Start without a timer →", exact: true })
        .waitFor();
      for (const overrun of [false, true])
        for (const number of [
          "4(a)",
          "5(a)",
          "5(e)",
          "6(b)",
          "6(c)",
          "10(d)",
        ]) {
          const index = paper.parts.findIndex((p) => p.number === number),
            p = emptyProgress(),
            w = emptyWork();
          const started = Date.now() - (overrun ? 106 * 60000 : 0);
          w.run = { kind: "paper", ids, index, started, responses: {} };
          w.drafts["paper-timer:" + started] = "105";
          p.work[workId] = w;
          await page.evaluate(
            ({ key, raw }) => localStorage.setItem(key, raw),
            { key: STORAGE_KEY, raw: JSON.stringify(p) },
          );
          await page.reload();
          await expect(
            page.getByRole("heading", {
              name: paper.parts[index].question.title,
              exact: true,
            }),
          ).toBeVisible();
          await expect(page.locator(".paper-clock")).toContainText(
            overrun ? "Time overrun" : "remaining",
          );
          await opening(page, paper.parts[index].question);
        }
    } finally {
      await context.close();
    }
  });
