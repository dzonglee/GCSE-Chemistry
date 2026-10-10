import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { paper2HigherFull as paper } from "../src/content/paper2-higher-full";
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
        : q.polymerisationDrawing
          ? ".question-panel select"
          : ".question-panel input,.question-panel textarea",
    )
    .first();
  const box = (await first.boundingBox())!;
  expect(box.height, q.id).toBeGreaterThanOrEqual(44);
  expect.soft(box.y + box.height, q.id).toBeLessThanOrEqual(664);
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
    expect.soft(size, q.id).toBeGreaterThanOrEqual(12);
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

async function answer(page: Page, index: number) {
  const part = paper.parts[index],
    q = part.question;
  if (q.fuelDrawing) {
    const data = q.fuelDrawing.data;
    for (const [i, [x, y]] of data.points.entries()) {
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
    for (const [i, [x, y]] of data.points.entries()) {
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
    // Deliberately leave the independent extrapolated estimate unanswered.
  } else if (q.polymerisationDrawing) {
    for (const [label, value] of [
      ["Carbon 1: above attachment", "H"],
      ["Carbon 1: below attachment", "CH3"],
      ["Carbon 2: above attachment", "H"],
      ["Carbon 2: below attachment", "F"],
      ["Bond joining the two backbone/reacting carbons", "1"],
      ["Left continuation bond", "1"],
      ["Right continuation bond", "1"],
      ["Polymer brackets", "1"],
      ["Repeat-count notation", "n"],
    ])
      await page.getByLabel(label, { exact: true }).selectOption(value);
  } else
    await page
      .locator(q.rubric ? ".written-answer textarea" : ".numeric-label input")
      .fill(q.answer);
  if (part.number === "1(b)") {
    await page.locator(".numeric-label input").fill("6.02e-5");
    await expect(
      page.getByLabel("Working for this question", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(
        "I included the anomalous time: mean=(36.0+37.2+36.8+56.0)/4=41.5s. Rate=0.00250/41.5=0.00006024096mol/s, to3sf 6.02e-5mol/s.",
      );
  }
  if (part.number === "7(c)") {
    await page.locator(".numeric-label input").fill("0.0160");
    await expect(
      page.getByLabel("Working for this question", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Working for this question", { exact: true })
      .fill(
        "Tangent: change in mass=1.60-0.80=0.80g, change in time=75-25=50s. Rate=0.80/50=0.0160g/s; I kept3 significant figures instead of2.",
      );
  }
  if (part.number === "3(a)")
    await page
      .locator(".written-answer textarea")
      .fill(
        "Place a little sample on a clean wire in a blue flame: lilac indicates potassium. Dissolve a fresh portion in water and add barium chloride: a white precipitate indicates sulfate. I omitted acidification.",
      );
  if (part.number === "10(a)")
    await page
      .locator(".written-answer textarea")
      .fill(
        "Choose A and B: A gives potassium and B gives nitrogen. I have not compared cost or phosphorus.",
      );
}

for (const width of [320, 1280])
  test(`Higher Paper2 ${width} all49 retained answers stay sealed and allow carried-error, precision and whole-level review`, async ({
    browser,
  }) => {
    test.setTimeout(240000);
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      await page
        .getByRole("button", {
          name: "Start without a timer →",
          exact: true,
        })
        .click();
      for (const [i, part] of paper.parts.entries()) {
        await expect(
          page.getByRole("heading", {
            name: part.question.title,
            exact: true,
          }),
        ).toBeVisible();
        if (part.question.writtenEquationKind)
          await expect(
            page.getByText(
              "Use chemical formulas and coefficients to write a balanced symbol equation. You can type → or ->.",
              { exact: true },
            ),
          ).toBeVisible();
        await answer(page, i);
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        await expect(
          page.getByText("Answer recorded.", { exact: false }),
        ).toBeVisible();
        await expect(
          page.locator(
            ".paper-reference,.assessment-results,.paper-worked-construction",
          ),
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
      for (const [i, part] of paper.parts.entries()) {
        const row = rows.nth(i);
        await row.locator(":scope > summary").click();
        await row.locator(".paper-reference > summary").click();
        if (part.question.haberGiven) {
          await expect(row.getByRole("table")).toBeVisible();
          await expect(row.getByRole("table")).toContainText("0.60");
        }
        if (part.question.tangentGraph) {
          await expect(row.locator(".tangent-plot svg")).toBeVisible();
          for (const size of await row
            .locator(".tangent-plot svg text")
            .evaluateAll((nodes) =>
              nodes.map((n) => {
                const t = n as SVGTextElement,
                  m = t.getScreenCTM()!;
                return (
                  parseFloat(getComputedStyle(t).fontSize) *
                  Math.hypot(m.a, m.b)
                );
              }),
            ))
            expect(size).toBeGreaterThanOrEqual(12);
        }
        if (part.number === "1(b)" || part.number === "7(c)")
          await expect(row.locator(".assessment-working-review")).toContainText(
            part.number === "1(b)" ? "anomalous" : "significant figures",
          );
        if (part.levels) {
          await expect(row.locator('input[type="checkbox"]')).toHaveCount(0);
          await row
            .getByLabel(
              `${part.number}: whole-response mark using the levels`,
              { exact: true },
            )
            .selectOption(part.number === "3(a)" ? "4" : "2");
        } else
          for (const [j, c] of part.criteria.entries()) {
            const missed =
              (part.number === "1(b)" && j === 0) ||
              (part.number === "7(c)" && j === 3) ||
              (part.number === "2(b)" && j === 2);
            await row
              .getByLabel(`${part.number}: ${c.id} review mark`, {
                exact: true,
              })
              .selectOption(String(missed ? 0 : c.marks));
          }
        if (part.referenceConstruction) {
          await expect(
            row.locator(".paper-worked-construction svg").first(),
          ).toBeVisible();
          await expect(
            row.locator(
              ".paper-worked-construction input:not(:disabled),.paper-worked-construction select:not(:disabled)",
            ),
          ).toHaveCount(0);
        }
        await row.locator(":scope > summary").click();
      }
      await expect(
        page.getByRole("heading", {
          name: "Your reviewed result: 93 / 100",
          exact: true,
        }),
      ).toBeVisible();
      await saved(page);
      await page.reload();
      await expect(
        page.getByRole("heading", {
          name: "Your reviewed result: 93 / 100",
          exact: true,
        }),
      ).toBeVisible();
      for (const [n, score] of [
        ["1(b)", "4 / 5"],
        ["2(b)", "3 / 4"],
        ["3(a)", "4 / 6"],
        ["7(c)", "3 / 4"],
        ["10(a)", "2 / 4"],
      ])
        await expect(
          rows
            .nth(paper.parts.findIndex((p) => p.number === n))
            .locator(":scope > summary"),
        ).toContainText(score);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
