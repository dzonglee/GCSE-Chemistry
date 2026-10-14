import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { edexcelPaper1FoundationFull as paper } from "../src/content/edexcel-paper1-foundation-full";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";

const route = `/exams/${paper.id}`,
  workId = `assessment-${paper.id}`;
test("existing shell, formula, indicator and practical disclosures prevent fresh cross-board evidence", async ({
  page,
}) => {
  const state = emptyProgress();
  for (const cue of [
    "sh-v1-w-read",
    "fm-v1-p-co2",
    "chem-p1f-full-v1-03e",
    "an-v1-p-litmus",
    "tech-v1-p-meniscus",
    "materials-v1-cB-barrier",
    "haber-v1-p-conditions",
    "cf-v1-R-primary",
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
    "2(d)",
    "2(e)",
    "5(e)",
    "8(d)",
    "9(b)",
    "10(a)",
    "10(c)",
  ])
    expect(
      drafts[
        "fresh:" +
          paper.parts.find((part) => part.number === number)!.question.id
      ],
      number,
    ).toBe("false");
  for (const number of ["1(d)", "3(b)", "4(c)", "6(c)", "8(b)"])
    expect(
      drafts[
        "fresh:" +
          paper.parts.find((part) => part.number === number)!.question.id
      ],
      number,
    ).toBe("true");
});
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
  const p = emptyProgress(),
    w = emptyWork();
  p.preferences = { tier: "foundation", course: "separate", board: "Edexcel" };
  w.run = {
    kind: "paper",
    ids: paper.parts.map((p) => p.question.id),
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
    page.getByRole("heading", {
      name: paper.parts[index].question.title,
      exact: true,
    }),
  ).toBeVisible();
}
async function geometry(page: Page, q: Question) {
  await settled(page);
  const target = page
    .locator(
      q.options
        ? ".question-panel .answer-option"
        : ".question-panel input,.question-panel textarea,.question-panel select",
    )
    .first();
  const box = (await target.boundingBox())!;
  expect(box.height, q.id).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height, q.id).toBeLessThanOrEqual(664);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    q.id,
  ).toBe(true);
  expect(
    await page.locator(".paper-reference,.assessment-results").count(),
  ).toBe(0);
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
    expect(size, q.id).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page }).analyze()).violations, q.id).toEqual(
    [],
  );
}

for (const width of [320, 390, 1280]) {
  test(`Pearson ${width} intro uses the correct qualification,40 parts and reachable start choices`, async ({
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
        "10 question groups · 40 parts",
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
        page.getByText("Edexcel 1CH0 · Component 1CH0/1F", { exact: true }),
      ).toBeVisible();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
  for (let chunk = 0; chunk < 4; chunk++)
    test(`Pearson ${width} independently opens parts ${chunk * 10 + 1}–${chunk * 10 + 10}`, async ({
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
        for (let index = chunk * 10; index < chunk * 10 + 10; index++) {
          await seed(page, index);
          await expect(
            page.locator(".question-panel > .eyebrow"),
          ).toContainText(
            `${paper.parts[index].number} · ${paper.parts[index].marks}`,
          );
          await geometry(page, paper.parts[index].question);
        }
      } finally {
        await context.close();
      }
    });
  test(`Pearson ${width} fractional mass keyboard steps and wrong oxide work persist without references`, async ({
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
      await seed(
        page,
        paper.parts.findIndex((p) => p.number === "4(c)"),
      );
      const graph = page.getByRole("img", {
        name: /plotted observations and separate chosen fit/,
      });
      // The SVG is keyboard-editable; a one-tenth y tick is0.004g, not0.0g after rounding.
      const editor = page.locator(".fuel-plot-scroll");
      await editor.focus();
      await editor.press("ArrowUp");
      await expect(
        page.getByLabel("Point 1 y (g)", { exact: true }),
      ).toHaveValue("0.004");
      await settled(page);
      await page.reload();
      await expect(
        page.getByLabel("Point 1 y (g)", { exact: true }),
      ).toHaveValue("0.004");
      await expect(page.locator(".paper-reference")).toHaveCount(0);
      await expect(graph).toBeVisible();
      await seed(
        page,
        paper.parts.findIndex((p) => p.number === "2(a)"),
      );
      await page
        .getByLabel("Original non-metal electrons (dots)", { exact: true })
        .fill("6");
      await page
        .getByLabel("Transferred metal electrons (crosses)", { exact: true })
        .fill("1");
      await page.getByLabel("Ion charge", { exact: true }).selectOption("-1");
      await page.getByLabel("Draw square brackets", { exact: true }).check();
      await settled(page);
      await page.reload();
      await expect(
        page.getByLabel("Transferred metal electrons (crosses)", {
          exact: true,
        }),
      ).toHaveValue("1");
      await expect(page.getByLabel("Ion charge", { exact: true })).toHaveValue(
        "-1",
      );
      await expect(page.locator(".paper-reference")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Record answer", exact: true }),
      ).toBeEnabled();
    } finally {
      await context.close();
    }
  });
}

async function answer(page: Page, q: Question) {
  if (q.fuelDrawing) {
    for (const [i, [x, y]] of q.fuelDrawing.data.points.entries()) {
      await page
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(`Point ${i + 1} x (min)`, { exact: true })
        .fill(String(x));
      await page
        .getByLabel(`Point ${i + 1} y (g)`, { exact: true })
        .fill(String(i === 0 ? 0.004 : y));
    }
    await page
      .getByRole("button", { name: "Edit your best-fit line", exact: true })
      .click();
    for (const [i, y] of [
      [0, 0.036],
      [5, 0.216],
    ]) {
      await page
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(
          `Your fit height at original x=${q.fuelDrawing.data.points[i][0]} (g)`,
          { exact: true },
        )
        .fill(String(y));
    }
  } else if (q.drawDotCross) {
    await page
      .getByLabel("Original non-metal electrons (dots)", { exact: true })
      .fill("6");
    await page
      .getByLabel("Transferred metal electrons (crosses)", { exact: true })
      .fill("2");
    await page.getByLabel("Ion charge", { exact: true }).selectOption("-2");
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

test("Pearson all40 native answers submit together; raw precision, wrong observations and empirical working retain manual decisions after reload", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start without a timer →", exact: true })
    .click();
  for (const [index, part] of paper.parts.entries()) {
    await expect(
      page.getByRole("heading", { name: part.question.title, exact: true }),
    ).toBeVisible();
    await answer(page, part.question);
    if (part.number === "3(b)")
      await page.locator(".numeric-label input").fill("0.4");
    if (part.number === "7(b)")
      await page.locator(".written-answer textarea").fill("MgO");
    await expect(
      page.locator(".paper-reference,.assessment-results"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (index < paper.parts.length - 1)
      await page
        .getByRole("button", { name: "Next part →", exact: true })
        .click();
  }
  await page.getByRole("button", { name: /Submit.*paper/ }).click();
  await expect(
    page.getByRole("heading", { name: /parts still need review/ }),
  ).toBeVisible();
  const rows = page.locator(".result-question");
  await expect(rows).toHaveCount(40);
  for (const [index, part] of paper.parts.entries()) {
    const row = rows.nth(index);
    await row.locator(":scope > summary").click();
    await row.locator(".paper-reference > summary").click();
    if (part.levels)
      await row
        .getByLabel(`${part.number}: whole-response mark using the levels`, {
          exact: true,
        })
        .selectOption("6");
    else
      for (const c of part.criteria) {
        const value =
          part.number === "7(b)"
            ? 0
            : part.number === "3(b)" && c.id === "point-3"
              ? 0
              : part.number === "4(c)" && c.id === "point-1"
                ? 1
                : c.marks;
        await row
          .getByLabel(`${part.number}: ${c.id} review mark`, { exact: true })
          .selectOption(String(value));
      }
    await row.locator(":scope > summary").click();
  }
  // 3 empirical marks withheld,1 raw precision mark withheld,1 point-plotting mark withheld.
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 95 / 100",
      exact: true,
    }),
  ).toBeVisible();
  await settled(page);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Your reviewed result: 95 / 100",
      exact: true,
    }),
  ).toBeVisible();
  const graphRow = rows.nth(paper.parts.findIndex((p) => p.number === "4(c)"));
  await graphRow.locator(":scope > summary").click();
  await expect(graphRow.locator(".paper-retained-response")).toContainText(
    "0.004",
  );
  await graphRow.locator(".paper-reference > summary").click();
  await graphRow
    .getByText("Compare a reference graph", { exact: true })
    .click();
  await expect(
    graphRow.getByRole("region", {
      name: "Reference measurement graph, scroll horizontally",
      exact: true,
    }),
  ).toBeVisible();
  await expect(graphRow.locator(".temperature-graph-reference")).toContainText(
    "approximately 0 g.",
  );
  await expect(
    graphRow.locator(".temperature-graph-reference"),
  ).not.toContainText("°C");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Try again without a timer", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: paper.parts[0].question.title,
      exact: true,
    }),
  ).toBeVisible();
  await answer(page, paper.parts[0].question);
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
          paper.parts.find((part) => part.number === "4(c)")!.question.id
        ]?.answer.includes("0.004"),
    ),
  ).toBe(true);
});
