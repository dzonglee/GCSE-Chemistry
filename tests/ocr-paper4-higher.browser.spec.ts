import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ocrPaper4HigherFull as paper } from "../src/content/ocr-paper4-higher-full";
import type { ExamPart } from "../src/content/exam-paper-types";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
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
  state.preferences = { board: "OCR", course: "separate", tier: "higher" };
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
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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
    expect(size).toBeGreaterThanOrEqual(12);
}
async function geometry(page: Page, p: ExamPart) {
  await settled(page);
  const first = page
      .locator(
        p.question.options
          ? ".question-panel .answer-option"
          : ".question-panel input,.question-panel textarea,.question-panel select",
      )
      .first(),
    box = (await first.boundingBox())!;
  expect(box.height, p.number).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height, p.number).toBeLessThanOrEqual(664);
  for (const field of await page.locator(".written-answer textarea").all())
    expect((await field.boundingBox())!.height).toBeGreaterThanOrEqual(104);
  await noOverflow(page);
  await expect(
    page.locator(".paper-reference,.assessment-results"),
  ).toHaveCount(0);
  expect(
    (await new AxeBuilder({ page }).analyze()).violations,
    p.number,
  ).toEqual([]);
}
async function answer(page: Page, p: ExamPart, wrong = false) {
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
        .fill(wrong ? (i === 0 ? "9" : "39") : r["ty" + i]);
    }
  } else if (q.polymerisationDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    for (const i of [0, 1, 2, 3])
      await page
        .getByLabel(
          `Carbon ${i < 2 ? 1 : 2}: ${i % 2 === 0 ? "above" : "below"} attachment`,
          { exact: true },
        )
        .selectOption(wrong && i === 1 ? "F" : r["s" + i]);
    await page
      .getByLabel("Bond joining the two backbone/reacting carbons", {
        exact: true,
      })
      .selectOption("1");
    for (const label of [
      "Left continuation bond",
      "Right continuation bond",
      "Polymer brackets",
    ])
      await page.getByLabel(label, { exact: true }).selectOption("1");
    await page
      .getByLabel("Repeat-count notation", { exact: true })
      .selectOption("none");
  } else if (q.polyesterDrawing) {
    const r = JSON.parse(p.referenceConstruction!),
      fields: Record<string, string> = {
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
    for (const [k, label] of Object.entries(fields))
      await page
        .getByLabel(label, { exact: true })
        .selectOption(
          k === "countMark"
            ? "none"
            : wrong && k === "acidSpacerC"
              ? "3"
              : r[k],
        );
  } else if (q.options)
    await page
      .getByRole("radio", {
        name: wrong ? q.options.find((o) => o !== q.answer)! : q.answer,
        exact: true,
      })
      .check();
  else
    await page
      .locator(q.rubric ? ".written-answer textarea" : ".numeric-label input")
      .fill(p.number === "16(b)" && wrong ? "1.0" : q.answer);
  const working: Record<string, string> = {
    "16(b)": wrong
      ? "(39−9)/(35−5)=30/30=1.0cm³/s from my retained line."
      : "(36−12)/(35−5)=24/30=0.8cm³/s.",
    "17(b)": "Final18.45−initial2.10=16.35cm³.",
    "17(c)":
      "Exclude rough15.00; use14.15,14.20,14.25 (span0.10).42.60/3=14.20cm³.",
    "17(d)":
      "KOH0.150×0.0200=.00300mol; acid=.00300/2=.00150mol; .00150/.01420=.1056338…→.106mol/dm³(3sf).",
    "21(c)": "Percentage yield=actual/theory×100=15.3/18.0×100=85%.",
    "23(c)":
      "Room molar volume24dm³/mol;2.64kg=2640g;MrCO₂44;2640/44=60mol;60×24=1440dm³.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}
test("all48 recorded answers stay sealed; reviewed actual wrong constructions yield86 and survive restart", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  for (const [i, p] of paper.parts.entries()) {
    await expect(
      page.getByRole("heading", { name: p.question.title, exact: true }),
    ).toBeVisible();
    await answer(
      page,
      p,
      ["1", "16(a)", "16(b)", "19(b)", "19(c)"].includes(p.number),
    );
    await expect(
      page.locator(".paper-reference,.assessment-results"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Edit recorded answer", exact: true }),
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
  await expect(rows).toHaveCount(48);
  for (const [i, p] of paper.parts.entries()) {
    if (i < 15) continue;
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
      for (const c of p.criteria) {
        let value = c.marks;
        if (p.number === "16(a)" && c.id === "point-2") value = 0;
        if (
          (p.number === "19(b)" && c.id === "point-2") ||
          (p.number === "19(c)" && c.id === "point-1")
        )
          value = 0;
        await row
          .getByLabel(`${p.number}: ${c.id} review mark`, { exact: true })
          .selectOption(String(value));
      }
    await row.locator(":scope > summary").click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 86 / 90",
      exact: true,
    }),
  ).toBeVisible();
  await settled(page);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 86 / 90",
      exact: true,
    }),
  ).toBeVisible();
  for (const n of ["16(a)", "19(b)", "19(c)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === n));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    await expect(
      row.locator(
        ".result-body > .rate-drawing-input input,.result-body > .rate-drawing-input select,.result-body > .polymerisation-drawing input,.result-body > .polymerisation-drawing select",
      ),
    ).toHaveCount(0);
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toBeVisible();
    const retained = row.locator(
      ".result-body > .rate-drawing-input,.result-body > .polymerisation-drawing",
    );
    await expect(retained.locator("svg").first()).toBeVisible();
    await expect(retained.locator("svg").first()).toHaveAccessibleName(
      new RegExp(`^Retained ${n.replace(/[()]/g, "\\$&")} response`),
    );
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toHaveAccessibleName(
      new RegExp(`^Worked ${n.replace(/[()]/g, "\\$&")} reference`),
    );
    await expect(retained.locator("input,select,textarea,button")).toHaveCount(
      0,
    );
    await expect(
      row.locator(
        ".paper-worked-construction input,.paper-worked-construction select,.paper-worked-construction textarea",
      ),
    ).toHaveCount(0);
    await expect(row.locator(".paper-reference > p").first()).not.toHaveText(
      /^\s*\{/,
    );
    await noOverflow(page);
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
  expect(
    state.work[workId].history.some(
      (r: { responses: Record<string, { answer: string }> }) =>
        JSON.parse(
          r.responses[
            paper.parts.find((p) => p.number === "16(a)")!.question.id
          ]?.answer ?? "{}",
        ).ty1 === "39",
    ),
  ).toBe(true);
  const oldRun = state.work[workId].history.find(
    (r: { responses: Record<string, { answer: string }> }) =>
      r.responses[paper.parts.find((p) => p.number === "16(b)")!.question.id]
        ?.answer === "1.0",
  );
  expect(oldRun).toBeTruthy();
  expect(
    oldRun.responses[paper.parts.find((p) => p.number === "16(b)")!.question.id]
      .working,
  ).toContain("30/30=1.0");
});
for (const width of [320, 390, 1280]) {
  test(`Gateway04 ${width} intro discloses the exact90mark105minute Higher route`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      await expect(page.locator(".full-paper-intro")).toContainText(
        "23 question groups · 48 parts",
      );
      await expect(page.locator(".assessment-page")).toContainText("90 marks");
      await page
        .getByText("Paper specification and basis", { exact: true })
        .click();
      await expect(
        page.getByText("OCR Gateway Science A J248 · Component J248/04", {
          exact: true,
        }),
      ).toBeVisible();
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  test(`Gateway04 ${width} all48 cold openings keep usable controls and sealed references`, async ({
    browser,
  }) => {
    test.setTimeout(300000);
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      for (const i of [
        ...[
          "16(a)",
          "17(b)",
          "18(a)",
          "19(b)",
          "19(c)",
          "19(e)",
          "22(b)",
          "13",
        ].map((n) => paper.parts.findIndex((p) => p.number === n)),
        ...paper.parts
          .map((_, i) => i)
          .filter(
            (i) =>
              ![
                "16(a)",
                "17(b)",
                "18(a)",
                "19(b)",
                "19(c)",
                "19(e)",
                "22(b)",
                "13",
              ].includes(paper.parts[i].number),
          ),
      ]) {
        const p = paper.parts[i];
        await seed(page, i);
        await geometry(page, p);
      }
    } finally {
      await context.close();
    }
  });
  test(`Gateway04 ${width} wrong tangent and both polymers survive reload`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      for (const n of ["16(a)", "19(b)", "19(c)"]) {
        const i = paper.parts.findIndex((p) => p.number === n);
        await seed(page, i);
        await answer(page, paper.parts[i], true);
        await settled(page);
        await page.reload();
        if (n === "16(a)") {
          await page
            .getByLabel("Tangent endpoint to edit", { exact: true })
            .selectOption("0");
          await expect(
            page.getByLabel("Your tangent endpoint 1 quantity / cm³", {
              exact: true,
            }),
          ).toHaveValue("9");
          await page
            .getByLabel("Tangent endpoint to edit", { exact: true })
            .selectOption("1");
          await expect(
            page.getByLabel("Your tangent endpoint 2 quantity / cm³", {
              exact: true,
            }),
          ).toHaveValue("39");
        } else if (n === "19(b)")
          await expect(
            page.getByLabel("Carbon 1: below attachment", { exact: true }),
          ).toHaveValue("F");
        else
          await expect(
            page.getByLabel(
              "Number of acid CH₂ spacer carbons (exclude both COOH carbons)",
              { exact: true },
            ),
          ).toHaveValue("3");
        if (n !== "16(a)")
          await expect(
            page.getByLabel("Repeat-count notation", { exact: true }),
          ).toHaveValue("none");
        await noOverflow(page);
      }
    } finally {
      await context.close();
    }
  });
}
test("earlier disclosed answers are non-fresh while new numeric data remain fresh", async ({
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

test("meniscus remains inside the original scale and reads18.45 at320,390,1280", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto(route);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    const index = paper.parts.findIndex((p) => p.number === "17(b)");
    await seed(page, index);
    const svg = page.locator(".technique-fine-scale svg");
    await expect(svg.getByText("18.0", { exact: true })).toBeVisible();
    await expect(svg.getByText("18.8", { exact: true })).toBeVisible();
    const drawn = await svg.evaluate((node) => {
      const b = (
        node.querySelector('path[stroke="#3349c6"]') as SVGPathElement
      ).getBBox();
      return {
        top: b.y,
        bottom: b.y + b.height,
        guide: Number(
          node.querySelector('line[stroke="#a84619"]')!.getAttribute("y1"),
        ),
      };
    });
    expect(drawn.top).toBeGreaterThan(30);
    expect(drawn.bottom).toBeLessThan(310);
    expect(drawn.bottom).toBeCloseTo(187.5);
    expect(drawn.guide).toBeCloseTo(187.5);
    await geometry(page, paper.parts[index]);
  }
});

test("industrial and service givens remain readable raw data at320,390,1280", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto(route);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    for (const n of ["18(a)", "22(b)"]) {
      const index = paper.parts.findIndex((p) => p.number === n);
      await seed(page, index);
      await geometry(page, paper.parts[index]);
      if (n === "18(a)") {
        const table = page.locator(".haber-given table");
        await expect(table.locator("tbody tr")).toHaveCount(3);
        expect(await table.locator("tbody tr").allTextContents()).toEqual([
          "A4212",
          "B2642",
          "C3755",
        ]);
        const bounds = await table.locator("thead th").evaluateAll((nodes) =>
          nodes.map((n) => {
            const r = document.createRange();
            r.selectNodeContents(n);
            const b = r.getBoundingClientRect();
            return { left: b.left, right: b.right };
          }),
        );
        for (let i = 1; i < bounds.length; i++)
          expect(bounds[i].left - bounds[i - 1].right).toBeGreaterThanOrEqual(
            6,
          );
      } else {
        const data = page.locator(".lca-given");
        await expect(data).toContainText("3600 kJ");
        await expect(data).toContainText("30 kJ");
        await expect(data).not.toContainText("6600");
        await expect(data).not.toContainText("10000");
      }
    }
  }
});
