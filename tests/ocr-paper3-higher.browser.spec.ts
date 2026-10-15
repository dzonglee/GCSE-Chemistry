import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ocrPaper3HigherFull as paper } from "../src/content/ocr-paper3-higher-full";
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
  if (q.fuelDrawing) {
    const choose = page.getByLabel("Choose an observation or line end", {
      exact: true,
    });
    for (const [i, [x, y]] of q.fuelDrawing.data.points.entries()) {
      await choose.selectOption(String(i));
      await page
        .getByLabel(`Point ${i + 1} x (s)`, { exact: true })
        .fill(String(x));
      await page
        .getByLabel(`Point ${i + 1} y (°C)`, { exact: true })
        .fill(String(wrong && i === 2 ? 34 : y));
    }
    await page
      .getByRole("button", { name: "Edit your best-fit line", exact: true })
      .click();
    for (const i of [0, q.fuelDrawing.data.points.length - 1]) {
      await choose.selectOption(String(i));
      await page
        .getByLabel(
          `Your fit height at original x=${q.fuelDrawing.data.points[i][0]} (°C)`,
          { exact: true },
        )
        .fill(String(q.fuelDrawing.data.points[i][1]));
    }
    await page
      .getByLabel("Your extrapolated line end x (s)", { exact: true })
      .fill("0");
    await page
      .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
      .fill("32.2");
  } else if (q.drawDotCross) {
    await page
      .getByLabel("Original non-metal electrons (dots)", { exact: true })
      .fill("6");
    await page
      .getByLabel("Transferred metal electrons (crosses)", { exact: true })
      .fill("2");
    await page
      .getByLabel("Ion charge", { exact: true })
      .selectOption(wrong ? "-1" : "-2");
    await page
      .getByLabel("Draw square brackets", { exact: true })
      .setChecked(!wrong);
  } else if (q.profileDrawing) {
    const r = JSON.parse(p.referenceConstruction!);
    for (const k of ["reactant", "product", "peak"])
      await page
        .getByLabel(`Your drawn ${k} level / kJ`, { exact: true })
        .fill(wrong && k === "peak" ? "185" : r[k]);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption(r.activationArrow);
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption(r.overallArrow);
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
      .fill(q.answer);
  const working: Record<string, string> = {
    "16(b)": "6×15²=1350nm²;15³=3375nm³;1350/3375=0.40nm⁻¹.",
    "18(b)":
      "Mg²⁺ has arrangement2,8:12 protons and10 electrons. Sulfur gains2 electrons.",
    "19(a)": "(58−8)/(88−8)=50/80=0.625.",
    "20(c)": "32.2−20.4=11.8°C, using my retained intercept.",
    "20(f)":
      "Breaking:2×436+498=1370kJ. Forming:4×464=1856kJ.1370−1856=−486kJ.",
    "21(c)": "58.7/(6.02×10²³)=9.75083…×10⁻²³g→9.75e-23g.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}
test("all45 recorded answers stay sealed; reviewed actual wrong constructions yield86 and survive restart", async ({
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
    await answer(page, p, ["1", "18(b)", "20(a)", "20(e)"].includes(p.number));
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
  await expect(rows).toHaveCount(45);
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
        if (p.number === "20(a)" && c.id === "point-1") value = 1;
        if (
          (p.number === "18(b)" && c.id === "point-2") ||
          (p.number === "20(e)" && c.id === "point-2")
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
  for (const n of ["18(b)", "20(a)", "20(e)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === n));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    await expect(
      row.locator(
        ".result-body > .paper-electron-review input,.result-body > .paper-electron-review select,.result-body > .profile-drawing-input input,.result-body > .profile-drawing-input select,.result-body > .fuel-drawing-input input,.result-body > .fuel-drawing-input select",
      ),
    ).toHaveCount(0);
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toBeVisible();
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
            paper.parts.find((p) => p.number === "20(e)")!.question.id
          ]?.answer ?? "{}",
        ).peak === "185",
    ),
  ).toBe(true);
});
for (const width of [320, 390, 1280]) {
  test(`Gateway03 ${width} intro discloses the exact90mark105minute Higher route`, async ({
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
        "23 question groups · 45 parts",
      );
      await expect(page.locator(".assessment-page")).toContainText("90 marks");
      await page
        .getByText("Paper specification and basis", { exact: true })
        .click();
      await expect(
        page.getByText("OCR Gateway Science A J248 · Component J248/03", {
          exact: true,
        }),
      ).toBeVisible();
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  test(`Gateway03 ${width} all45 cold openings keep usable controls and sealed references`, async ({
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
        ...["13", "18(a)", "18(b)", "19(a)", "20(a)", "20(e)", "21(b)"].map(
          (n) => paper.parts.findIndex((p) => p.number === n),
        ),
        ...paper.parts
          .map((_, i) => i)
          .filter(
            (i) =>
              ![
                "13",
                "18(a)",
                "18(b)",
                "19(a)",
                "20(a)",
                "20(e)",
                "21(b)",
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
  test(`Gateway03 ${width} wrong ion graph and profile survive reload`, async ({
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
      for (const n of ["18(b)", "20(a)", "20(e)"]) {
        const i = paper.parts.findIndex((p) => p.number === n);
        await seed(page, i);
        await answer(page, paper.parts[i], true);
        await settled(page);
        await page.reload();
        if (n === "18(b)") {
          await expect(
            page.getByLabel("Ion charge", { exact: true }),
          ).toHaveValue("-1");
          await expect(
            page.getByLabel("Draw square brackets", { exact: true }),
          ).not.toBeChecked();
        } else if (n === "20(a)") {
          await page
            .getByLabel("Choose an observation or line end", { exact: true })
            .selectOption("2");
          await expect(
            page.getByLabel("Point 3 y (°C)", { exact: true }),
          ).toHaveValue("34");
          await expect(
            page.getByLabel("Your extrapolated line end x (s)", {
              exact: true,
            }),
          ).toHaveValue("0");
          await expect(
            page.getByLabel("Your proposed estimate at x=0 (°C)", {
              exact: true,
            }),
          ).toHaveValue("32.2");
        } else
          await expect(
            page.getByLabel("Your drawn peak level / kJ", { exact: true }),
          ).toHaveValue("185");
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

test("pH data columns stay distinct with readable headings and usable response at320,390,1280", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto(route);
  const index = paper.parts.findIndex((p) => p.number === "13");
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    await seed(page, index);
    const cells = page.locator(".ph-measurements th");
    await expect(cells).toHaveCount(2);
    const bounds = await cells.evaluateAll((nodes) =>
      nodes.map((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        const b = range.getBoundingClientRect();
        return { left: b.left, right: b.right };
      }),
    );
    expect(bounds[1].left - bounds[0].right).toBeGreaterThanOrEqual(12);
    await expect(page.locator(".ph-measurements tbody tr")).toHaveCount(8);
    await geometry(page, paper.parts[index]);
    await answer(page, paper.parts[index]);
    await expect(
      page.getByRole("radio", { name: "20 cm³", exact: true }),
    ).toBeChecked();
  }
});
