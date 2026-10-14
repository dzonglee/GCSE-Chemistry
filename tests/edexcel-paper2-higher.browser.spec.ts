import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { edexcelPaper2HigherFull as paper } from "../src/content/edexcel-paper2-higher-full";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import type { ExamPart } from "../src/content/exam-paper-types";
const route = `/exams/${paper.id}`,
  workId = `assessment-${paper.id}`;
async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    scrollTo(0, 0);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}
async function seed(page: Page, index: number) {
  await settled(page);
  const state = emptyProgress(),
    work = emptyWork();
  state.preferences = {
    board: "Edexcel",
    course: "separate",
    tier: "higher",
  };
  work.run = {
    kind: "paper",
    ids: paper.parts.map((p) => p.question.id),
    index,
    started: Date.now(),
    responses: {},
  };
  state.work[workId] = work;
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(state),
  });
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: paper.parts[index].question.title,
      exact: true,
    }),
  ).toBeVisible();
}
async function geometry(page: Page, p: ExamPart) {
  await settled(page);
  const first = page
    .locator(
      p.question.options
        ? ".question-panel .answer-option"
        : ".question-panel input,.question-panel textarea,.question-panel select",
    )
    .first();
  const box = (await first.boundingBox())!;
  expect(box.height, p.number).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height, p.number).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    p.number,
  ).toBe(true);
  await expect(
    page.locator(".paper-reference,.assessment-results"),
  ).toHaveCount(0);
  for (const size of await page.locator("svg text").evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const text = node as SVGTextElement,
        box = text.getBoundingClientRect(),
        m = text.getScreenCTM();
      return !m ||
        !box.width ||
        !box.height ||
        getComputedStyle(text).visibility === "hidden"
        ? []
        : [parseFloat(getComputedStyle(text).fontSize) * Math.hypot(m.a, m.b)];
    }),
  ))
    expect(size, p.number).toBeGreaterThanOrEqual(12);
  expect(
    (await new AxeBuilder({ page }).analyze()).violations,
    p.number,
  ).toEqual([]);
}

test("earlier disclosed chemistry prevents fresh evidence while new numerical cases stay fresh", async ({
  page,
}) => {
  const state = emptyProgress();
  for (const p of paper.parts)
    for (const id of p.question.exposureAliases ?? [])
      state.seen[id] = Date.now();
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(state),
  });
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  await settled(page);
  const drafts = await page.evaluate(
    ({ key, id }) => JSON.parse(localStorage.getItem(key)!).work[id].drafts,
    { key: STORAGE_KEY, id: workId },
  );
  for (const p of paper.parts)
    expect(drafts["fresh:" + p.question.id], p.number).toBe(
      p.question.exposureAliases ? "false" : "true",
    );
});

async function answer(page: Page, p: ExamPart, wrong = true) {
  const q = p.question;
  if (q.tangentDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    for (const i of [0, 1]) {
      await page
        .getByLabel("Tangent endpoint to edit", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(`Your tangent endpoint ${i + 1} time / s`, { exact: true })
        .fill(r["tx" + i]);
      await page
        .getByLabel(`Your tangent endpoint ${i + 1} quantity / cm³`, {
          exact: true,
        })
        .fill(wrong && i === 1 ? "29" : r["ty" + i]);
    }
  } else if (q.profileDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    for (const k of ["reactant", "product", "peak"])
      await page
        .getByLabel(`Your drawn ${k} level / kJ`, { exact: true })
        .fill(wrong && k === "product" ? "90" : r[k]);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption(r.activationArrow);
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption(r.overallArrow);
  } else if (q.organicDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    await page
      .getByLabel("Choose the number of carbon atoms in your scaffold", {
        exact: true,
      })
      .selectOption(r.n);
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
    await page
      .getByLabel("Separate terminal C–O connection and bond order", {
        exact: true,
      })
      .selectOption(r.carbonyl);
    for (const [key, value] of Object.entries(r))
      if (/^h\d+$/.test(key) && value === "yes")
        await page.locator(`[data-h-slot="${key}"]`).click();
    if (wrong) await page.locator('[data-h-slot="h12"]').click();
  } else if (q.polymerisationDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    for (const i of [0, 1, 2, 3])
      await page
        .getByLabel(
          `Carbon ${i < 2 ? 1 : 2}: ${i % 2 === 0 ? "above" : "below"} attachment`,
          { exact: true },
        )
        .selectOption(r["s" + i]);
    await page
      .getByLabel("Bond joining the two backbone/reacting carbons", {
        exact: true,
      })
      .selectOption(wrong ? "1" : r.bond);
    for (const [key, label] of [
      ["left", "Left continuation bond"],
      ["right", "Right continuation bond"],
      ["brackets", "Polymer brackets"],
      ["countMark", "Repeat-count notation"],
    ])
      await page.getByLabel(label, { exact: true }).selectOption(r[key]);
  } else if (q.polyesterDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    const fields: Record<string, string> = {
      diolC: "Number of CH₂ spacer carbons from the diol",
      acidSpacerC:
        "Number of acid CH₂ spacer carbons (exclude both COOH carbons)",
      leftO: "Left alcohol-derived linking O",
      middleO: "Other alcohol-derived linking O",
      carbonyl1: "First carboxyl carbon: separate bond to O",
      carbonyl2: "Second carboxyl carbon: separate bond to O",
      left: "Left single continuation",
      right: "Right single continuation",
      brackets: "Repeat brackets",
      countMark: "Repeat-count notation",
    };
    for (const [key, label] of Object.entries(fields))
      await page
        .getByLabel(label, { exact: true })
        .selectOption(wrong && key === "carbonyl1" ? "1" : r[key]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else if (q.rubric)
    await page.locator(".written-answer textarea").fill(q.answer);
  else await page.locator(".numeric-label input").fill(q.answer);
  const working: Record<string, string> = {
    "1(e)": "Total350. (210×35+140×37)/350=35.8.",
    "2(b)": "(58−18)/(55−15)=40/40=1.0cm³/s.",
    "2(e)": "Rate B/rate A=(1/50)/(1/75)=1.5.",
    "3(a)":
      "Cancel four unchanged C–H. Broken612+436=1048;formed348+2×412=1172. Δ=1048−1172=−124kJ/mol ethene.",
    "8(a)": "42×10⁻⁹=4.2×10⁻⁸m.",
    "10(a)": "Fuel152.84−151.59=1.25g;rise43.6−18.6=25°C;1.25/25=.050g/°C.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}

for (const width of [320, 390, 1280]) {
  test(`Pearson2H ${width} intro identifies the real component and both timer choices`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      await expect(page.locator(".sample-course-scope")).toHaveText(
        "Chemistry only · Edexcel 1CH0",
      );
      await expect(page.locator(".full-paper-intro")).toContainText(
        "10 question groups · 39 parts",
      );
      await settled(page);
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
      await page
        .getByText("Paper specification and basis", { exact: true })
        .click();
      await expect(
        page.getByText("Edexcel 1CH0 · Component 1CH0/2H", { exact: true }),
      ).toBeVisible();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  for (let chunk = 0; chunk < Math.ceil(paper.parts.length / 10); chunk++) {
    const from = chunk * 10,
      to = Math.min(from + 10, paper.parts.length);
    test(`Pearson2H ${width} independently opens parts${from + 1}–${to}`, async ({
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
        await page
          .getByRole("button", { name: "Start without a timer →", exact: true })
          .waitFor();
        for (let i = from; i < to; i++) {
          await seed(page, i);
          await expect(
            page.locator(".question-panel > .eyebrow"),
          ).toContainText(`${paper.parts[i].number} · ${paper.parts[i].marks}`);
          await geometry(page, paper.parts[i]);
          for (const field of await page
            .locator(".written-answer textarea")
            .all())
            expect(
              (await field.boundingBox())!.height,
              paper.parts[i].number,
            ).toBeGreaterThanOrEqual(104);
        }
      } finally {
        await context.close();
      }
    });
  }
  test(`Pearson2H ${width} five wrong constructions and raw tangent coordinates survive reload with references sealed`, async ({
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
      await page
        .getByRole("button", { name: "Start without a timer →", exact: true })
        .waitFor();
      for (const number of ["2(a)", "3(b)", "5(a)", "6(a)", "6(b)"]) {
        const i = paper.parts.findIndex((p) => p.number === number);
        await seed(page, i);
        await answer(page, paper.parts[i]);
        await settled(page);
        await page.reload();
        await expect(
          page.getByRole("heading", {
            name: paper.parts[i].question.title,
            exact: true,
          }),
        ).toBeVisible();
        if (number === "2(a)") {
          await page
            .getByLabel("Tangent endpoint to edit", { exact: true })
            .selectOption("1");
          await expect(
            page.getByLabel("Your tangent endpoint 2 quantity / cm³", {
              exact: true,
            }),
          ).toHaveValue("29");
          await page
            .getByLabel("Your tangent endpoint 2 time / s", { exact: true })
            .fill("1/2");
          await settled(page);
          await page.reload();
          await page
            .getByLabel("Tangent endpoint to edit", { exact: true })
            .selectOption("1");
          await expect(
            page.getByLabel("Your tangent endpoint 2 time / s", {
              exact: true,
            }),
          ).toHaveValue("1/2");
          await expect(
            page.getByText(/Your invalid coordinate is retained/),
          ).toBeVisible();
        }
        if (number === "3(b)")
          await expect(
            page.getByLabel("Your drawn product level / kJ", { exact: true }),
          ).toHaveValue("90");
        if (number === "5(a)")
          await expect(page.locator('[data-h-slot="h12"]')).toHaveAttribute(
            "aria-pressed",
            "true",
          );
        if (number === "6(a)")
          await expect(
            page.getByLabel("Bond joining the two backbone/reacting carbons", {
              exact: true,
            }),
          ).toHaveValue("1");
        if (number === "6(b)")
          await expect(
            page.getByLabel("First carboxyl carbon: separate bond to O", {
              exact: true,
            }),
          ).toHaveValue("1");
        await geometry(page, paper.parts[i]);
      }
    } finally {
      await context.close();
    }
  });
}

test("submitted construction review keeps every SVG label readable at320,390,1280 without page overflow", async ({
  page,
}) => {
  test.setTimeout(120000);
  const state = emptyProgress(),
    work = emptyWork(),
    now = Date.now();
  state.preferences = { board: "Edexcel", course: "separate", tier: "higher" };
  work.run = {
    kind: "paper",
    ids: paper.parts.map((p) => p.question.id),
    index: paper.parts.length - 1,
    started: now - 5000,
    submitted: now,
    responses: Object.fromEntries(
      paper.parts.map((p) => [
        p.question.id,
        {
          answer: p.referenceConstruction ?? p.question.answer,
          correct: false,
          fresh: false,
          helped: false,
          at: now - 1000,
        },
      ]),
    ),
  };
  work.history = [work.run];
  state.work[workId] = work;
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(state),
  });
  await page.goto(route);
  await expect(
    page.getByRole("heading", { name: /parts still need review/ }),
  ).toBeVisible();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    for (const number of ["2(a)", "3(b)", "5(a)", "6(a)", "6(b)"]) {
      const row = page
        .locator(".result-question")
        .nth(paper.parts.findIndex((p) => p.number === number));
      await row.locator(":scope > summary").click();
      await row.locator(".paper-reference > summary").click();
      const sizes = await row.locator("svg text").evaluateAll((nodes) =>
        nodes.flatMap((node) => {
          const t = node as SVGTextElement,
            b = t.getBoundingClientRect(),
            m = t.getScreenCTM();
          return !m || !b.width || !b.height
            ? []
            : [parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b)];
        }),
      );
      expect(sizes.length, `${number} at${width}`).toBeGreaterThan(0);
      for (const size of sizes)
        expect(size, `${number} at${width}`).toBeGreaterThanOrEqual(12);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${number} at${width}`,
      ).toBe(true);
      await row.locator(".paper-reference > summary").click();
      await row.locator(":scope > summary").click();
    }
  }
});

test("all39 actual responses stay sealed; holistic review and retained wrong structures produce94 and survive restart", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  for (const [i, p] of paper.parts.entries()) {
    await expect(
      page.getByRole("heading", { name: p.question.title, exact: true }),
    ).toBeVisible();
    await answer(page, p, p.number !== "3(b)");
    await expect(
      page.locator(".paper-reference,.assessment-results"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Edit recorded answer", exact: true }),
      p.number,
    ).toBeVisible();
    if (i < paper.parts.length - 1)
      await page
        .getByRole("button", { name: "Next part →", exact: true })
        .click();
  }
  await page.getByRole("button", { name: /Submit.*paper/ }).click();
  await expect(
    page.getByRole("heading", { name: /parts still need review/ }),
  ).toBeVisible();
  const rows = page.locator(".result-question");
  await expect(rows).toHaveCount(39);
  const lost: Record<string, string[]> = {
    "2(a)": ["point-1", "point-2"],
    "5(a)": ["point-3"],
    "6(a)": ["point-1"],
    "6(b)": ["point-2", "point-3"],
  };
  for (const [i, p] of paper.parts.entries()) {
    const row = rows.nth(i);
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    if (p.levels)
      await row
        .getByLabel(`${p.number}: whole-response mark using the levels`, {
          exact: true,
        })
        .selectOption("6");
    else
      for (const c of p.criteria)
        await row
          .getByLabel(`${p.number}: ${c.id} review mark`, { exact: true })
          .selectOption(lost[p.number]?.includes(c.id) ? "0" : String(c.marks));
    await row.locator(":scope > summary").click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 94 / 100",
      exact: true,
    }),
  ).toBeVisible();
  await settled(page);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 94 / 100",
      exact: true,
    }),
  ).toBeVisible();
  for (const number of ["2(a)", "3(b)", "5(a)", "6(a)", "6(b)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === number));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toBeVisible();
    await expect(row.locator(".paper-reference > p").first()).not.toHaveText(
      /^\s*\{/,
    );
    const retained = row.locator(
      ".result-body > .rate-drawing-input,.result-body > .profile-drawing-input,.result-body > .organic-drawing-input,.result-body > .polymerisation-drawing",
    );
    await expect(retained.locator("svg").first()).toBeVisible();
    await expect(retained.locator("svg").first()).toHaveAccessibleName(
      new RegExp(`^Retained ${number.replace(/[()]/g, "\\$&")} response`),
    );
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toHaveAccessibleName(
      new RegExp(`^Worked ${number.replace(/[()]/g, "\\$&")} reference`),
    );
    await expect(
      row.locator(
        ".paper-worked-construction input,.paper-worked-construction select,.paper-worked-construction textarea",
      ),
    ).toHaveCount(0);
    await expect(retained.locator("input,select,textarea,button")).toHaveCount(
      0,
    );
    await expect(row.locator(".paper-retained-response")).not.toHaveText(
      /^\s*\{/,
    );
    if (number === "2(a)") await expect(retained).toContainText("29 cm³");
    if (number === "5(a)")
      await expect(retained.locator('[data-attachment="h12"]')).toHaveAttribute(
        "data-placed",
        "yes",
      );
    if (number === "6(b)") {
      await expect(
        retained.getByText("First carboxyl C–O", { exact: true }).locator(".."),
      ).toContainText("Single C–O");
      await expect(
        row
          .locator(".paper-worked-construction")
          .getByText("First carboxyl C–O", { exact: true })
          .locator(".."),
      ).toContainText("Double C=O");
    }
    expect(
      (await new AxeBuilder({ page }).analyze()).violations,
      number,
    ).toEqual([]);
    await row.locator(":scope > summary").click();
  }
  await page
    .getByRole("button", { name: "Try again without a timer", exact: true })
    .click();
  await answer(page, paper.parts[0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await settled(page);
  const state = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(
    state.work[workId].run.responses[paper.parts[0].question.id].fresh,
  ).toBe(false);
  const wrongPolyesterId = paper.parts.find((p) => p.number === "6(b)")!
    .question.id;
  expect(
    state.work[workId].history.some(
      (r: { responses: Record<string, { answer: string }> }) =>
        JSON.parse(r.responses[wrongPolyesterId]?.answer ?? "{}").carbonyl1 ===
        "1",
    ),
  ).toBe(true);
});
