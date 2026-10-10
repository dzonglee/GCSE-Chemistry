import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { paper1FoundationFull as paper } from "../src/content/paper1-foundation-full";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = `/exams/${paper.id}`,
  workId = `assessment-${paper.id}`;
const ids = paper.parts.map((p) => p.question.id);
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
        for (let index = chunk * 10; index < chunk * 10 + 10; index++) {
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
  if (q.fuelDrawing) {
    const data = q.fuelDrawing.data;
    for (const [i, [x, y]] of data.points.entries()) {
      await page
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(`Point ${i + 1} x (g)`, { exact: true })
        .fill(String(x));
      await page
        .getByLabel(`Point ${i + 1} y (°C)`, { exact: true })
        .fill(String(y));
    }
    await page
      .getByRole("button", { name: "Edit your best-fit line", exact: true })
      .click();
    for (const [i, value] of [
      [0, 24],
      [5, 19],
    ]) {
      await page
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(`Your fit height at original x=${data.points[i][0]} (°C)`, {
          exact: true,
        })
        .fill(String(value));
    }
    await page
      .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
      .fill("25");
  } else if (q.profileDrawing) {
    const values = JSON.parse(q.answer);
    for (const name of ["reactant", "product", "peak"])
      await page
        .getByLabel(`Your drawn ${name} level / kJ`, { exact: true })
        .fill(values[name]);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption(values.activationArrow);
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption(values.overallArrow);
  } else if (q.drawDotCross) {
    await page
      .getByLabel("Original non-metal electrons (dots)", { exact: true })
      .fill("7");
    await page
      .getByLabel("Transferred metal electrons (crosses)", { exact: true })
      .fill("1");
    await page.getByLabel("Ion charge", { exact: true }).selectOption("-1");
    await page.getByLabel("Draw square brackets", { exact: true }).check();
  } else if (q.arrangement)
    await page
      .getByLabel("Your electron arrangement", { exact: true })
      .fill(q.answer);
  else if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(JSON.parse(q.answer)[part.id]);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .locator(q.rubric ? ".written-answer textarea" : ".numeric-label input")
      .fill(q.answer);
}

for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} retained native constructions remain readable and separate from references`, async ({
    browser,
  }) => {
    test.setTimeout(120000); // Five filled native constructions, storage reloads and geometry/axe audits.
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
      for (const number of ["1(c)", "3(a)", "4(a)", "9(b)", "9(e)"]) {
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
        await expect(
          page.getByRole("heading", { name: q.title, exact: true }),
        ).toBeVisible();
        await answer(page, q);
        await saved(page);
        const before = await page.evaluate(
          ({ key, workId, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[workId].drafts[id],
          { key: STORAGE_KEY, workId, id: q.id },
        );
        await page.reload();
        await expect(
          page.getByRole("heading", { name: q.title, exact: true }),
        ).toBeVisible();
        await opening(page, q);
        await expect(
          page.locator(".paper-reference,.temperature-graph-reference"),
        ).toHaveCount(0);
        const after = await page.evaluate(
          ({ key, workId, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[workId].drafts[id],
          { key: STORAGE_KEY, workId, id: q.id },
        );
        expect(after).toBe(before);
      }
    } finally {
      await context.close();
    }
  });

test("all fifty parts record through their native UI, remain sealed and allow whole-response and method review after submission", async ({
  page,
}) => {
  test.setTimeout(180000); // Complete fifty responses, native drawings/graph, reload and partial manual review.
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  for (const [i, part] of paper.parts.entries()) {
    await expect(
      page.getByRole("heading", { name: part.question.title, exact: true }),
    ).toBeVisible();
    await answer(page, part.question);
    if (part.number === "7(b)")
      await page
        .locator(".written-answer textarea")
        .fill(
          "Gently warm dilute hydrochloric acid in a beaker. Add copper(II) oxide in small portions, stirring until some remains. Cool and filter to remove excess oxide, collecting the filtrate in an evaporating basin. Concentrate gently on a water bath, then leave it to cool and crystallise. Filter out the crystals from the mother liquor.",
        );
    if (part.number === "9(e)") {
      await page
        .getByRole("button", { name: "Edit observation point", exact: true })
        .click();
      await page
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption("4");
      await page.getByLabel("Point 5 y (°C)", { exact: true }).fill("21.1");
    }
    if (part.number === "5(b)") {
      await expect(
        page.getByLabel("Working for this question", { exact: true }),
      ).toBeVisible();
      await page
        .getByLabel("Working for this question", { exact: true })
        .fill(
          "24 + 14 + 3×16 = 148\nThis deliberately contradicts the final answer.",
        );
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
  await expect(page.locator(".full-paper-results")).toBeVisible();
  const rows = page.locator(".results-list > details");
  expect(await rows.count()).toBe(50);
  for (const number of ["5(b)", "7(b)", "9(e)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === number));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    if (number === "5(b)") {
      await expect(row.locator(".assessment-working-review")).toContainText(
        "deliberately contradicts",
      );
      await row
        .getByLabel(
          "5(b): final-answer credit after checking working for contradictions",
          { exact: true },
        )
        .selectOption("0");
      await row
        .getByLabel("5(b): point-1 review mark", { exact: true })
        .selectOption("0");
      await expect(row.locator(":scope > summary")).toContainText("0 / 2");
    } else if (number === "7(b)") {
      await expect(row.locator(".written-answer textarea")).toHaveCount(0);
      expect(await row.locator('input[type="checkbox"]').count()).toBe(0);
      await row
        .getByLabel("7(b): whole-response mark using the levels", {
          exact: true,
        })
        .selectOption("4");
      await expect(row.locator(":scope > summary")).toContainText("4 / 6");
    } else {
      await row
        .getByLabel("9(e): point-1 review mark", { exact: true })
        .selectOption("1");
      await row
        .getByLabel("9(e): point-2 review mark", { exact: true })
        .selectOption("1");
      await expect(row.locator(":scope > summary")).toContainText("2 / 3");
    }
  }
  await saved(page);
  await page.reload();
  await expect(
    rows
      .nth(paper.parts.findIndex((p) => p.number === "7(b)"))
      .locator(":scope > summary"),
  ).toContainText("4 / 6");
  await expect(
    page.getByRole("heading", { name: /parts still need review/ }),
  ).toBeVisible();
  for (const [index, part] of paper.parts.entries()) {
    if (
      ["5(b)", "7(b)", "9(e)"].includes(part.number) ||
      (!part.criteria.length && !part.levels)
    )
      continue;
    const row = rows.nth(index);
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    if (part.levels)
      await row
        .getByLabel(`${part.number}: whole-response mark using the levels`, {
          exact: true,
        })
        .selectOption(String(part.marks));
    else
      for (const criterion of part.criteria)
        await row
          .getByLabel(`${part.number}: ${criterion.id} review mark`, {
            exact: true,
          })
          .selectOption(String(criterion.marks));
    await row.locator(":scope > summary").click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 95 / 100",
      exact: true,
    }),
  ).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 95 / 100",
      exact: true,
    }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const state = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(state.work[workId].history).toHaveLength(1);
  expect(Object.keys(state.work[workId].history[0].responses)).toHaveLength(50);
  expect(
    state.work[workId].history[0].responses[
      paper.parts.find((p) => p.number === "5(b)")!.question.id
    ].working,
  ).toContain("\n");
  await page
    .getByRole("button", { name: "Try again without a timer", exact: true })
    .click();
  const restarted = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(restarted.work[workId].drafts["fresh:" + ids[0]]).toBe("false");
  expect(restarted.work[workId].history).toHaveLength(1);
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
        for (const number of ["1(e)", "3(e)", "9(b)", "9(e)", "10(e)"]) {
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

test("recorded full-paper answers can be edited without losing originals, exposing references or accepting malformed replacements", async ({
  page,
}) => {
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  await page.locator(".assessment-question-jump > summary").click();
  await page.getByRole("button", { name: "Part 5(b)", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("148");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit recorded answer", exact: true })
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
  const run = state.work[workId].run,
    id = paper.parts.find((p) => p.number === "5(b)")!.question.id;
  expect(run.responses[id]).toBeUndefined();
  expect(
    JSON.parse(
      state.work[workId].drafts[`paper-original:${run.started}:${id}`],
    ),
  ).toMatchObject({ answer: "148", correct: true });
  await expect(
    page.locator(".paper-reference,.assessment-results"),
  ).toHaveCount(0);
  await page.getByLabel("Your answer", { exact: true }).fill("147");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  const revised = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(revised.work[workId].run.responses[id]).toMatchObject({
    answer: "147",
    correct: false,
  });
  expect(
    revised.work[workId].drafts[`paper-original:${run.started}:${id}`],
  ).toBe(state.work[workId].drafts[`paper-original:${run.started}:${id}`]);
});

test("malformed numerical work survives refresh without being recordable and timed overrun remains explicit", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-09T10:00:00Z") });
  await page.goto(route);
  await page
    .getByRole("button", {
      name: "Start with a 105-minute practice timer",
      exact: true,
    })
    .click();
  await expect(page.locator(".paper-clock")).toContainText("remaining");
  await page.locator(".assessment-question-jump > summary").click();
  const index = paper.parts.findIndex((p) => p.number === "5(b)");
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
  await page.getByLabel("Your answer", { exact: true }).fill("147");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  const wrong = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(wrong.work[workId].run.responses[ids[index]]).toMatchObject({
    answer: "147",
    correct: false,
  });
});

for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} opened submitted constructions and references stay inside the viewport`, async ({
    browser,
  }) => {
    test.setTimeout(120000); // Five opened retained/reference constructions with glyph, overflow and axe checks.
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage(),
        state = emptyProgress(),
        work = emptyWork(),
        now = Date.now();
      work.run = {
        kind: "paper",
        ids,
        index: 49,
        started: now - 10000,
        submitted: now,
        responses: Object.fromEntries(
          paper.parts.map((part) => [
            part.question.id,
            {
              answer: part.question.answer,
              correct: false,
              fresh: true,
              helped: false,
              at: now - 5000,
            },
          ]),
        ),
      };
      work.history = [work.run];
      state.work[workId] = work;
      await page.addInitScript(
        ({ key, raw }) => localStorage.setItem(key, raw),
        { key: STORAGE_KEY, raw: JSON.stringify(state) },
      );
      await page.goto(route);
      for (const number of ["1(c)", "3(a)", "4(a)", "9(b)", "9(e)"]) {
        const row = page
          .locator(".results-list > details")
          .nth(paper.parts.findIndex((part) => part.number === number));
        await row.locator(":scope > summary").click();
        await row.locator(".paper-reference > summary").click();
        if (number === "9(e)")
          await row.locator(".temperature-graph-reference > summary").click();
        await page.evaluate(async () => {
          await document.fonts.ready;
          (document.activeElement as HTMLElement | null)?.blur();
          scrollTo(0, 0);
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          number,
        ).toBe(true);
        for (const size of await row.locator("svg text").evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const text = node as SVGTextElement,
              box = text.getBoundingClientRect(),
              matrix = text.getScreenCTM();
            return !matrix ||
              !box.width ||
              !box.height ||
              getComputedStyle(text).visibility === "hidden"
              ? []
              : [
                  parseFloat(getComputedStyle(text).fontSize) *
                    Math.hypot(matrix.a, matrix.b),
                ];
          }),
        ))
          expect(size, number).toBeGreaterThanOrEqual(12);
        expect(
          (await new AxeBuilder({ page }).analyze()).violations,
          number,
        ).toEqual([]);
        for (const field of await row.locator("input,textarea").all()) {
          await expect(field).toBeDisabled();
        }
        await row.locator(":scope > summary").click();
      }
    } finally {
      await context.close();
    }
  });
