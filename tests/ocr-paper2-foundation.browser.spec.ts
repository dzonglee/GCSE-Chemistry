import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ocrPaper2FoundationFull as paper } from "../src/content/ocr-paper2-foundation-full";
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
  state.preferences = { board: "OCR", course: "separate", tier: "foundation" };
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
    for (const [i, [x, y]] of q.fuelDrawing.data.points.entries()) {
      await page
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption(String(i));
      await page
        .getByLabel(`Your plotted point ${i + 1} x (s)`, { exact: true })
        .fill(String(x));
      await page
        .getByLabel(`Your plotted point ${i + 1} y (cm³)`, { exact: true })
        .fill(String(wrong && i === 2 ? 55 : y));
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
        .getByLabel(`Your fit height at original x=${x} (cm³)`, { exact: true })
        .fill(String(y));
    }
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
      .getByLabel("Separate terminal C–O connection and bond order", {
        exact: true,
      })
      .selectOption("2");
    if (!wrong)
      await page
        .getByRole("button", {
          name: "H attached to that O: not chosen",
          exact: true,
        })
        .click();
    for (const slot of ["h0", "h1", "h2"])
      await page.locator(`button[data-h-slot="${slot}"]`).click();
  } else if (q.polymerisationDrawing) {
    for (const [i, v] of ["H", "CH3", "H", "CH3"].entries())
      await page
        .getByLabel(
          `Carbon ${i < 2 ? 1 : 2}: ${i % 2 === 0 ? "above" : "below"} attachment`,
          { exact: true },
        )
        .selectOption(v);
    for (const [label, v] of [
      ["Bond joining the two backbone/reacting carbons", "1"],
      ["Left continuation bond", "1"],
      ["Right continuation bond", "1"],
      ["Polymer brackets", "1"],
      ["Repeat-count notation", wrong ? "N" : "n"],
    ])
      await page.getByLabel(label, { exact: true }).selectOption(v);
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
    "17(b)": "250/160×112=175g.",
    "17(c)": "144/180×100=80%.",
    "17(d)": "2Fe=112;3CO2=132;112/(112+132)×100=45.9%.",
    "18(b)": "22.60−2.30=20.30cm³.",
    "18(c)": "(22.10+22.20+22.10)/3=22.1333…→22.13cm³.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}
for (const width of [320, 390, 1280]) {
  test(`Gateway02 ${width} intro discloses the exact90mark105minute Foundation route`, async ({
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
        page.getByText("OCR Gateway Science A J248 · Component J248/02", {
          exact: true,
        }),
      ).toBeVisible();
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  test(`Gateway02 ${width} all48 cold openings keep usable controls and sealed references`, async ({
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
      for (const [i, p] of paper.parts.entries()) {
        await seed(page, i);
        await geometry(page, p);
      }
    } finally {
      await context.close();
    }
  });
  test(`Gateway02 ${width} wrong graph acid and repeat survive reload`, async ({
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
      for (const n of ["19(a)", "21(a)", "21(c)"]) {
        const i = paper.parts.findIndex((p) => p.number === n);
        await seed(page, i);
        await answer(page, paper.parts[i], true);
        await settled(page);
        await page.reload();
        if (n === "19(a)") {
          await page
            .getByLabel(
              "Choose the observation to plot or curve height to edit",
              { exact: true },
            )
            .selectOption("2");
          await expect(
            page.getByLabel("Your plotted point 3 y (cm³)", { exact: true }),
          ).toHaveValue("55");
          await expect(page.getByLabel(/Your estimate/)).toHaveCount(0);
        }
        if (n === "21(a)")
          await expect(
            page.getByRole("button", {
              name: "H attached to that O: not chosen",
              exact: true,
            }),
          ).toBeVisible();
        if (n === "21(c)")
          await expect(
            page.getByLabel("Repeat-count notation", { exact: true }),
          ).toHaveValue("N");
        await noOverflow(page);
      }
    } finally {
      await context.close();
    }
  });
}
test("all48 recorded answers stay sealed; reviewed actual wrong drawings yield86 and survive restart", async ({
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
    await answer(page, p, ["1", "19(a)", "21(a)", "21(c)"].includes(p.number));
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
        if (p.number === "19(a)" && c.id === "point-1") value = 1;
        if (
          (p.number === "21(a)" && c.id === "point-2") ||
          (p.number === "21(c)" && c.id === "point-3")
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
  for (const n of ["19(a)", "21(a)", "21(c)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === n));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    await expect(
      row.locator(
        ".result-body > .organic-drawing-input input,.result-body > .organic-drawing-input select,.result-body > .polymerisation-drawing input,.result-body > .polymerisation-drawing select,.result-body > .fuel-drawing-input input,.result-body > .fuel-drawing-input select",
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
            paper.parts.find((p) => p.number === "21(c)")!.question.id
          ]?.answer ?? "{}",
        ).countMark === "N",
    ),
  ).toBe(true);
});
test("burette meniscus stays inside the supplied scale and matches22.60 at320,390,1280", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto(route);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    const index = paper.parts.findIndex((p) => p.number === "18(b)");
    await seed(page, index);
    const svg = page.locator(".technique-fine-scale svg");
    await expect(svg.getByText("22.0", { exact: true })).toBeVisible();
    await expect(svg.getByText("22.8", { exact: true })).toBeVisible();
    const drawn = await svg.evaluate((node) => {
      const curve = node.querySelector(
        'path[stroke="#3349c6"]',
      ) as SVGPathElement;
      const box = curve.getBBox();
      return {
        top: box.y,
        bottom: box.y + box.height,
        guide: Number(
          node.querySelector('line[stroke="#a84619"]')!.getAttribute("y1"),
        ),
      };
    });
    expect(drawn.top).toBeGreaterThan(30);
    expect(drawn.bottom).toBeLessThan(310);
    expect(drawn.bottom).toBeCloseTo(240);
    expect(drawn.guide).toBeCloseTo(240);
    await geometry(page, paper.parts[index]);
  }
});

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
