import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { edexcelPaper2FoundationFull as paper } from "../src/content/edexcel-paper2-foundation-full";
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
    tier: "foundation",
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

test("previous halogen, profile, propanol and monomer disclosures prevent fresh evidence while original numerical data remain independent", async ({
  page,
}) => {
  const state = emptyProgress();
  for (const cue of [
    "g7-v1-p-none",
    "g1-write-v1-ca-trend",
    "profile-v1-b-draw",
    "chem-p2f-full-v1-08a",
    "alc-v1-p-propanol",
    "natural-v1-r-protein",
    "pol-v1-r-monomer",
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
  await settled(page);
  const drafts = await page.evaluate(
    ({ key, id }) => JSON.parse(localStorage.getItem(key)!).work[id].drafts,
    { key: STORAGE_KEY, id: workId },
  );
  for (const number of [
    "1(b)",
    "2(b)",
    "4(c)",
    "6(e)",
    "8(a)",
    "8(b)",
    "9(e)",
    "9(g)",
  ])
    expect(
      drafts[
        "fresh:" + paper.parts.find((p) => p.number === number)!.question.id
      ],
      number,
    ).toBe("false");
  for (const number of [
    "3(a)",
    "3(b)",
    "4(a)",
    "6(c)",
    "7(b)",
    "8(d)",
    "9(a)",
    "9(f)",
    "10(a)",
    "10(b)",
  ])
    expect(
      drafts[
        "fresh:" + paper.parts.find((p) => p.number === number)!.question.id
      ],
      number,
    ).toBe("true");
});

async function answer(page: Page, p: ExamPart) {
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
        .fill(String(i === 2 ? 70 : y));
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
  } else if (q.profileDrawing) {
    for (const [kind, value] of [
      ["reactant", "70"],
      ["product", "110"],
      ["peak", "190"],
    ])
      await page
        .getByLabel(`Your drawn ${kind} level / kJ`, { exact: true })
        .fill(value);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption("reactants-peak");
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption("reactants-products");
  } else if (q.organicDrawing) {
    await page
      .getByLabel("Choose the number of carbon atoms in your scaffold", {
        exact: true,
      })
      .selectOption("3");
    await page
      .getByRole("button", {
        name: "Terminal C–O attachment: absent",
        exact: true,
      })
      .click();
    // Deliberately omit the O-bound H; all seven carbon-bound H remain correct.
    for (const slot of ["h0", "h1", "h2", "h4", "h5", "h8", "h9"])
      await page.locator(`button[data-h-slot="${slot}"]`).click();
  } else if (q.polymerisationDrawing) {
    for (const [i, value] of ["H", "H", "F", "Cl"].entries())
      await page
        .getByLabel(
          `Carbon ${i < 2 ? 1 : 2}: ${i % 2 === 0 ? "above" : "below"} attachment`,
          { exact: true },
        )
        .selectOption(value);
    for (const [label, value] of [
      ["Bond joining the two backbone/reacting carbons", "1"],
      ["Left continuation bond", "1"],
      ["Right continuation bond", "1"],
      ["Polymer brackets", "1"],
      ["Repeat-count notation", "N"],
    ])
      await page.getByLabel(label, { exact: true }).selectOption(value);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .locator(q.rubric ? ".written-answer textarea" : ".numeric-label input")
      .fill(
        p.number === "4(a)"
          ? "5.2"
          : p.number === "5(b)"
            ? "n=7; H=2×7+2=16, so C7H16."
            : q.answer,
      );
  const working: Record<string, string> = {
    "3(b)": "(66−50)/(80−40)=16/40=0.40 cm³/s.",
    "4(a)":
      "Final minus initial=17.4−22.6=−5.2°C. My entered magnitude5.2 is missing the negative sign.",
    "6(c)": "425.0−377.5=47.5ppm.",
    "7(b)":
      "Blank intensity4. Sensitivity=(44−24)/(4−2)=10 per mg/dm³. c=(34−4)/10=3mg/dm³.",
    "8(d)": "360cm³=0.360dm³; concentration=54/0.360=150g/dm³.",
    "9(f)": "2×12+2×1+19+35.5=80.5; relative formula mass has no gram unit.",
    "10(a)": "75nm=75×10⁻⁹m=7.5×10⁻⁸m.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}

for (const width of [320, 390, 1280]) {
  test(`Pearson 2F ${width} intro has48 parts, the correct component and reachable starts`, async ({
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
        "10 question groups · 48 parts",
      );
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
        page.getByText("Edexcel 1CH0 · Component 1CH0/2F", { exact: true }),
      ).toBeVisible();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  for (let chunk = 0; chunk < 5; chunk++) {
    const from = chunk * 10,
      to = Math.min(from + 10, paper.parts.length);
    test(`Pearson 2F ${width} independently opens parts${from + 1}–${to}`, async ({
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
        }
      } finally {
        await context.close();
      }
    });
  }
  test(`Pearson 2F ${width} wrong curve, O-H omission and uppercase N survive reload without references`, async ({
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
      for (const number of ["3(a)", "8(a)", "9(a)"]) {
        const index = paper.parts.findIndex((p) => p.number === number),
          p = paper.parts[index];
        await seed(page, index);
        await answer(page, p);
        await settled(page);
        await page.reload();
        await expect(
          page.getByRole("heading", { name: p.question.title, exact: true }),
        ).toBeVisible();
        await expect(page.locator(".paper-reference")).toHaveCount(0);
        if (number === "3(a)") {
          await page
            .getByLabel(
              "Choose the observation to plot or curve height to edit",
              { exact: true },
            )
            .selectOption("2");
          await expect(
            page.getByLabel("Your plotted point 3 y (cm³)", { exact: true }),
          ).toHaveValue("70");
          await expect(
            page.getByRole("button", {
              name: "Edit your fit curve",
              exact: true,
            }),
          ).toBeVisible();
          await expect(page.locator(".fuel-drawing-input")).not.toContainText(
            "straight best-fit line",
          );
          const path = await page
            .locator('path[data-fit="your-chosen-curve"]')
            .getAttribute("d");
          const last = path!
            .split("C")
            .at(-1)!
            .match(/-?\d+(?:\.\d+)?/g)!
            .map(Number);
          expect(last).toHaveLength(6);
          expect(last[1]).toBeCloseTo(last[3], 10);
          expect(last[3]).toBeCloseTo(last[5], 10);
        } else if (number === "8(a)") {
          await expect(
            page.getByRole("button", {
              name: "H attached to that O: not chosen",
              exact: true,
            }),
          ).toHaveAttribute("aria-pressed", "false");
          await expect(page.locator(".organic-drawing-input")).toContainText(
            "3 C, 7 H and 1 O",
          );
        } else
          await expect(
            page.getByLabel("Repeat-count notation", { exact: true }),
          ).toHaveValue("N");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    } finally {
      await context.close();
    }
  });
}

test("all48 actual answers remain sealed until submission; independent profiles and four retained errors review to96 and survive restart", async ({
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
    await answer(page, p);
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
  await expect(rows).toHaveCount(48);
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
      for (const c of p.criteria) {
        const value =
          p.number === "3(a)" && c.id === "point-1"
            ? 1
            : p.number === "4(a)" && c.id === "point-2"
              ? 0
              : p.number === "8(a)" && c.id === "point-2"
                ? 0
                : p.number === "9(a)" && c.id === "point-3"
                  ? 0
                  : c.marks;
        await row
          .getByLabel(`${p.number}: ${c.id} review mark`, { exact: true })
          .selectOption(String(value));
      }
    await row.locator(":scope > summary").click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 96 / 100",
      exact: true,
    }),
  ).toBeVisible();
  await settled(page);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 96 / 100",
      exact: true,
    }),
  ).toBeVisible();
  for (const number of ["3(a)", "8(a)", "9(a)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === number));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    await expect(
      row.locator(".paper-worked-construction svg").first(),
    ).toBeVisible();
    if (number === "3(a)")
      await expect(row.locator(".paper-retained-response")).toContainText("70");
    if (number === "9(a)") {
      const retained = row.getByRole("region", {
        name: "Retained 9(a) response: polymer construction",
        exact: true,
      });
      const reference = row.getByRole("region", {
        name: "Worked 9(a) reference: polymer construction",
        exact: true,
      });
      await expect(retained).toContainText("Upper-case N outside");
      await expect(reference).toContainText("Lower-case n outside");
      await expect(
        retained.locator("input,select,textarea,button"),
      ).toHaveCount(0);
      await expect(
        reference.locator("input,select,textarea,button"),
      ).toHaveCount(0);
    }
    await row.locator(":scope > summary").click();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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
      (run: { responses: Record<string, { answer: string }> }) =>
        run.responses[
          paper.parts.find((p) => p.number === "3(a)")!.question.id
        ]?.answer.includes('"70"'),
    ),
  ).toBe(true);
});
