import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ocrPaper1FoundationFull as paper } from "../src/content/ocr-paper1-foundation-full";
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
  if (q.drawCovalent) {
    const r = JSON.parse(p.referenceConstruction!);
    for (const field of q.parts!)
      await page
        .getByLabel(field.label, { exact: true })
        .fill(wrong && field.id === "unsharedCentre" ? "0" : r[field.id]);
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
        .fill(wrong && k === "product" ? "75" : r[k]);
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
  else if (q.rubric)
    await page.locator(".written-answer textarea").fill(q.answer);
  else await page.locator(".numeric-label input").fill(q.answer);
  const working: Record<string, string> = {
    "17(b)":
      "Each K atom loses one electron. The potassium ion is K⁺, charge1+, with arrangement2,8,8 (18 electrons). Two K⁺ balance one O²⁻.",
    "18(c)": "54−12=42mm;82−12=70mm;42/70=0.60.",
    "18(f)": "3.6/12=.3; .3×25=7.5g.",
    "19(b)": "24+2×14+6×16=148.",
    "20(a)": "23.4−16.8=6.6°C.",
    "22(b)": "6×20²=2400;20³=8000;2400/8000=.30nm⁻¹.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}

for (const width of [320, 390, 1280]) {
  test(`Gateway01 ${width} intro states90marks105minutes and the exact route`, async ({
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
        "Chemistry only · OCR Gateway Science A J248",
      );
      await expect(page.locator(".full-paper-intro")).toContainText(
        "22 question groups · 47 parts",
      );
      await expect(page.locator(".assessment-page")).toContainText("90 marks");
      await settled(page);
      for (const name of [
        "Start without a timer →",
        "Start with a 105-minute practice timer",
      ]) {
        const b = (await page
          .getByRole("button", { name, exact: true })
          .boundingBox())!;
        expect(b.height).toBeGreaterThanOrEqual(44);
        expect(b.y + b.height).toBeLessThanOrEqual(664);
      }
      await page
        .getByText("Paper specification and basis", { exact: true })
        .click();
      await expect(
        page.getByText("OCR Gateway Science A J248 · Component J248/01", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".full-paper-intro")).toContainText(
        "15 multiple-choice marks",
      );
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  test(`Gateway01 ${width} all47 cold openings keep a usable first response and sealed references`, async ({
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
  test(`Gateway01 ${width} wrong electron and energy constructions survive reload without corrections`, async ({
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
      for (const number of ["17(a)", "17(b)", "20(c)"]) {
        const index = paper.parts.findIndex((p) => p.number === number);
        await seed(page, index);
        await answer(page, paper.parts[index], true);
        await settled(page);
        await page.reload();
        if (number === "17(a)")
          await expect(
            page.getByLabel("Unshared N dots", { exact: true }),
          ).toHaveValue("0");
        if (number === "17(b)") {
          await expect(
            page.getByLabel("Ion charge", { exact: true }),
          ).toHaveValue("-1");
          await expect(
            page.getByLabel("Draw square brackets", { exact: true }),
          ).not.toBeChecked();
        }
        if (number === "20(c)")
          await expect(
            page.getByLabel("Your drawn product level / kJ", { exact: true }),
          ).toHaveValue("75");
        await geometry(page, paper.parts[index]);
      }
    } finally {
      await context.close();
    }
  });
}

test("all47 actual responses remain sealed;15 automatic choices and reviewed wrong diagrams produce86 and survive restart", async ({
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
    await answer(page, p, ["1", "17(a)", "17(b)", "20(c)"].includes(p.number));
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
  await expect(rows).toHaveCount(47);
  const lost: Record<string, string[]> = {
    "17(a)": ["point-2"],
    "17(b)": ["point-2"],
    "20(c)": ["point-1"],
  };
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
      for (const c of p.criteria)
        await row
          .getByLabel(`${p.number}: ${c.id} review mark`, { exact: true })
          .selectOption(lost[p.number]?.includes(c.id) ? "0" : String(c.marks));
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
  for (const number of ["17(a)", "17(b)", "20(c)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === number));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    const retained = row.locator(
      ".result-body > .paper-electron-review,.result-body > .profile-drawing-input",
    );
    await expect(retained.locator("svg").first()).toHaveAccessibleName(
      new RegExp(`^Retained ${number.replace(/[()]/g, "\\$&")} response`),
    );
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toHaveAccessibleName(
      new RegExp(`^Worked ${number.replace(/[()]/g, "\\$&")} reference`),
    );
    await expect(row.locator(".paper-reference > p").first()).not.toHaveText(
      /^\s*\{/,
    );
    await expect(retained.locator("input,select,textarea,button")).toHaveCount(
      0,
    );
    await expect(
      row.locator(
        ".paper-worked-construction input,.paper-worked-construction select",
      ),
    ).toHaveCount(0);
    if (number === "17(b)") {
      await expect(retained.locator("figure")).toHaveAttribute(
        "data-charge",
        "-1",
      );
      await expect(retained.locator("figure")).toHaveAttribute(
        "data-brackets",
        "false",
      );
      await expect(
        row.locator(".paper-worked-construction figure"),
      ).toHaveAttribute("data-charge", "-2");
    }
    await noOverflow(page);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
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
            paper.parts.find((p) => p.number === "17(b)")!.question.id
          ]?.answer ?? "{}",
        ).charge === "-1",
    ),
  ).toBe(true);
});

test("earlier disclosed responses prevent fresh credit while new numerical cases stay fresh", async ({
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

test("submitted electron and energy records preserve mistakes and readable labels at320,390,1280", async ({
  page,
}) => {
  test.setTimeout(120000);
  const state = emptyProgress(),
    work = emptyWork(),
    now = Date.now();
  state.preferences = { board: "OCR", course: "separate", tier: "foundation" };
  const responses = Object.fromEntries(
    paper.parts.map((p) => {
      let answer = p.referenceConstruction ?? p.question.answer;
      if (p.number === "17(a)")
        answer = JSON.stringify({ ...JSON.parse(answer), unsharedCentre: "0" });
      if (p.number === "17(b)")
        answer = JSON.stringify({
          ...JSON.parse(answer),
          charge: "-1",
          brackets: "0",
        });
      if (p.number === "20(c)")
        answer = JSON.stringify({ ...JSON.parse(answer), product: "75" });
      return [
        p.question.id,
        { answer, correct: false, fresh: false, helped: false, at: now },
      ];
    }),
  );
  work.run = {
    kind: "paper",
    ids: paper.parts.map((p) => p.question.id),
    index: 46,
    started: now - 5000,
    submitted: now,
    responses,
  };
  state.work[workId] = work;
  await page.addInitScript(
    ({ key, raw }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
    },
    { key: STORAGE_KEY, raw: JSON.stringify(state) },
  );
  await page.goto(route);
  await expect(
    page.getByRole("heading", { name: /parts still need review/ }),
  ).toBeVisible();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    for (const number of ["17(a)", "17(b)", "20(c)"]) {
      const row = page
        .locator(".result-question")
        .nth(paper.parts.findIndex((p) => p.number === number));
      await row.locator(":scope > summary").click();
      await row.locator(".paper-reference > summary").click();
      await expect(
        row.locator(".paper-worked-construction svg").first(),
      ).toBeVisible();
      await expect(
        row
          .locator(
            ".result-body > .paper-electron-review svg,.result-body > .profile-drawing-input svg",
          )
          .first(),
      ).toBeVisible();
      await settled(page);
      await noOverflow(page);
      const retained = row.locator(
        ".result-body > .paper-electron-review,.result-body > .profile-drawing-input",
      );
      await expect(
        retained.locator("input,select,textarea,button"),
      ).toHaveCount(0);
      await expect(
        row.locator(
          ".paper-worked-construction input,.paper-worked-construction select",
        ),
      ).toHaveCount(0);
      if (number === "17(b)") {
        await expect(retained.locator("figure")).toHaveAttribute(
          "data-brackets",
          "false",
        );
        await expect(
          row.locator(".paper-worked-construction figure"),
        ).toHaveAttribute("data-brackets", "true");
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await row.locator(".paper-reference > summary").click();
      await row.locator(":scope > summary").click();
    }
  }
});
