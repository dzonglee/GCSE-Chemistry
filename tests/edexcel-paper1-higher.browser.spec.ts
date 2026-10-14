import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { edexcelPaper1HigherFull as paper } from "../src/content/edexcel-paper1-higher-full";
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

test("actual oxygen, acid, salt, half-equation and catalyst disclosures prevent fresh Higher evidence", async ({
  page,
}) => {
  const state = emptyProgress();
  for (const id of [
    "iso-v1-rb-neutrons",
    "cb-v1-p-o2",
    "acid-v1-rb-two",
    "tech-v1-p-salt",
    "he-v1-g-cation",
    "me-v1-p-al",
    "haber-v1-r-catalyst",
    "cf-v1-g-evidence",
  ])
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
  for (const number of [
    "1(a)",
    "2(a)",
    "4(c)",
    "5(b)",
    "6(b)",
    "7(b)",
    "9(c)",
    "10(b)",
  ])
    expect(
      drafts[
        "fresh:" + paper.parts.find((p) => p.number === number)!.question.id
      ],
      number,
    ).toBe("false");
  for (const number of [
    "1(b)",
    "3(a)",
    "3(b)",
    "5(a)",
    "5(c)",
    "5(d)",
    "5(e)",
    "6(a)",
    "6(c)",
    "7(d)",
    "7(e)",
    "8(a)",
    "8(b)",
    "8(c)",
    "9(d)",
    "10(d)",
  ])
    expect(
      drafts[
        "fresh:" + paper.parts.find((p) => p.number === number)!.question.id
      ],
      number,
    ).toBe("true");
});
async function graph(page: Page, p: ExamPart) {
  await expect(page.locator(".fuel-drawing-input")).toContainText(
    "Zero is within the measured x range.",
  );
  await expect(page.locator(".fuel-drawing-input")).not.toContainText(
    "outside the measured x values",
  );
  await expect(
    page.getByLabel("Your proposed estimate at x=1.25 (g)", { exact: true }),
  ).toHaveCount(0);
  const d = p.question.fuelDrawing!.data,
    ref = JSON.parse(p.referenceConstruction!);
  for (const [i, [x, y]] of d.points.entries()) {
    await page
      .getByLabel("Choose an observation or line end", { exact: true })
      .selectOption(String(i));
    await page
      .getByLabel(`Point ${i + 1} x (A)`, { exact: true })
      .fill(String(x));
    await page
      .getByLabel(`Point ${i + 1} y (g)`, { exact: true })
      .fill(i === 2 ? "0.090" : String(y));
  }
  await page
    .getByRole("button", { name: "Edit your best-fit line", exact: true })
    .click();
  for (const i of [0, d.points.length - 1]) {
    await page
      .getByLabel("Choose an observation or line end", { exact: true })
      .selectOption(String(i));
    await page
      .getByLabel(`Your fit height at original x=${d.points[i][0]} (g)`, {
        exact: true,
      })
      .fill(ref["c" + i]);
  }
}
async function answer(page: Page, p: ExamPart) {
  const q = p.question;
  if (q.fuelDrawing) await graph(page, p);
  else if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const field of q.parts)
      await page
        .getByLabel(field.label, { exact: true })
        .fill(
          p.number === "2(a)" && field.id === "centre0"
            ? "3"
            : values[field.id],
        );
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else if (q.rubric)
    await page
      .locator(".written-answer textarea")
      .fill(p.number === "6(b)" ? "Cu2+ -> Cu +2e-" : q.answer);
  else
    await page
      .locator(".numeric-label input")
      .fill(p.number === "5(a)" ? "20.6" : q.answer);
  const working: Record<string, string> = {
    "1(b)": "(28×91+29×5+30×4)/100=2813/100=28.13.",
    "3(b)": "Spot=3.9−1.2=2.7cm; front=6.6−1.2=5.4cm; Rf=2.7/5.4=0.50.",
    "4(a)": "pH gap3.4−1.4=2; factor10²=100.",
    "5(a)":
      "Final23.75−initial3.15=20.60cm³. The entered20.6 is missing the requested second decimal place.",
    "5(c)":
      "Acid0.120×0.02040=0.002448mol; NaOH2×0.002448=0.004896mol. c=0.004896/0.0250=0.19584→0.196mol/dm³.",
    "5(d)":
      "Absolute uncertainty0.05+0.05=0.10cm³;0.10/18.70×100=0.534759…%→0.53%.",
    "6(c)":
      "95.25mg=0.09525g; n=0.09525/63.5=0.0015mol; N=0.0015×6.02×10²³=9.03×10²⁰atoms.",
    "8(a)":
      "Mg3.72/24=0.155mol needs0.310mol HCl, but only0.260mol available, so HCl limits. H2=0.260/2=0.130mol. V=0.130×24=3.12dm³=3120cm³.",
    "8(b)": "2520/3000×100=84%.",
    "8(c)": "Desired106; reactant mass2×84=168;106/168×100=63.095…→63.1%.",
  };
  if (working[p.number])
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(working[p.number]);
}
for (const width of [320, 390, 1280]) {
  test(`Pearson1H ${width} intro has43 parts, the correct component and complete start choices`, async ({
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
        "10 question groups · 43 parts",
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
        page.getByText("Edexcel 1CH0 · Component 1CH0/1H", { exact: true }),
      ).toBeVisible();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  for (let chunk = 0; chunk < Math.ceil(paper.parts.length / 10); chunk++) {
    const from = chunk * 10,
      to = Math.min(from + 10, paper.parts.length);
    test(`Pearson1H ${width} independently opens parts${from + 1}–${to}`, async ({
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
            .all()) {
            const box = (await field.boundingBox())!;
            expect(box.height, paper.parts[i].number).toBeGreaterThanOrEqual(
              104,
            );
          }
        }
      } finally {
        await context.close();
      }
    });
  }
  test(`Pearson1H ${width} wrong oxygen, current plot, precision and electron side survive reload while references stay sealed`, async ({
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
      await page
        .getByRole("button", { name: "Start without a timer →", exact: true })
        .waitFor();
      for (const number of ["2(a)", "5(a)", "6(a)", "6(b)"]) {
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
        if (number === "2(a)")
          await expect(
            page.getByLabel("Left-oxygen electrons in the bond", {
              exact: true,
            }),
          ).toHaveValue("3");
        if (number === "5(a)") {
          await expect(page.locator(".numeric-label input")).toHaveValue(
            "20.6",
          );
          await expect(
            page.getByLabel("Working for this question", { exact: true }),
          ).toHaveValue(/23.75/);
        }
        if (number === "6(b)")
          await expect(page.locator(".written-answer textarea")).toHaveValue(
            "Cu2+ -> Cu +2e-",
          );
        if (number === "6(a)") {
          await page
            .getByRole("button", {
              name: "Edit observation point",
              exact: true,
            })
            .click();
          await page
            .getByLabel("Choose an observation or line end", { exact: true })
            .selectOption("2");
          await expect(
            page.getByLabel("Point 3 y (g)", { exact: true }),
          ).toHaveValue("0.090");
        }
        await geometry(page, paper.parts[i]);
      }
    } finally {
      await context.close();
    }
  });
}
test("all43 actual responses stay sealed; two whole-response reviews and four retained errors produce96 and persist through reload/restart", async ({
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
  await expect(rows).toHaveCount(43);
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
          p.number === "2(a)" && c.id === "point-1"
            ? 0
            : p.number === "5(a)" && c.id === "point-2"
              ? 0
              : p.number === "6(a)" && c.id === "point-1"
                ? 1
                : p.number === "6(b)" && c.id === "point-2"
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
  for (const number of ["2(a)", "6(a)", "6(b)"]) {
    const row = rows.nth(paper.parts.findIndex((p) => p.number === number));
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    if (number !== "6(b)")
      await expect(
        row.locator(".paper-worked-construction svg").first(),
      ).toBeVisible();
    if (number === "2(a)") {
      await expect(row.locator("svg").first()).toHaveAttribute(
        "aria-label",
        /^Retained 2\(a\) response O2/,
      );
      await expect(
        row.locator(".paper-worked-construction svg").first(),
      ).toHaveAttribute("aria-label", /^Worked 2\(a\) reference O2/);
      await expect(row.locator(".paper-worked-construction")).toContainText(
        "Worked 2(a) reference",
      );
      await expect(row.locator(".paper-worked-construction")).not.toContainText(
        "Your proposed diagram",
      );
    }
    for (const input of await row
      .locator(
        ".paper-worked-construction input,.paper-worked-construction select,.paper-worked-construction textarea",
      )
      .all())
      await expect(input).toBeDisabled();
    if (number === "6(a)") {
      await expect(row.locator(".paper-retained-response")).toContainText(
        "0.090",
      );
      await row.getByText("Compare a reference graph", { exact: true }).click();
      const ref = row.locator(".temperature-graph-reference");
      await expect(ref).toContainText("within the measured range");
      await expect(ref).not.toContainText("extrapolat");
      await expect(ref).not.toContainText("°C");
      await expect(ref.locator("line[stroke-dasharray]")).toHaveCount(0);
    }
    if (number === "6(b)")
      await expect(row.locator(".paper-retained-response")).toContainText(
        "Cu2+ -> Cu +2e-",
      );
    await row.locator(":scope > summary").click();
  }
  const saved = await page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key)!).work[id].run.responses,
    { key: STORAGE_KEY, id: workId },
  );
  expect(
    JSON.parse(
      saved[paper.parts.find((p) => p.number === "2(a)")!.question.id].answer,
    ).centre0,
  ).toBe("3");
  expect(
    JSON.parse(
      saved[paper.parts.find((p) => p.number === "6(a)")!.question.id].answer,
    ).p2y,
  ).toBe("0.090");
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
      (r: { responses: Record<string, { answer: string }> }) =>
        r.responses[
          paper.parts.find((p) => p.number === "6(a)")!.question.id
        ]?.answer.includes("0.090"),
    ),
  ).toBe(true);
});
