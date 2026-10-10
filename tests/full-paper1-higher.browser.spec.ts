import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { paper1HigherFull as paper } from "../src/content/paper1-higher-full";
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

async function answer(page: Page, q: Question) {
  if (q.fuelDrawing) {
    const data = q.fuelDrawing.data;
    for (const [i, [x, y]] of data.points.entries()) {
      await page
        .getByLabel("Choose an observation or line end", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(`Point ${i + 1} x (cm³)`, { exact: true })
        .fill(String(x));
      await page
        .getByLabel(`Point ${i + 1} y (°C)`, { exact: true })
        .fill(String(y));
    }
    await page
      .getByRole("button", { name: "Edit your best-fit line", exact: true })
      .click();
    for (const [i, value] of [
      [0, 22.085],
      [5, 25.51],
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
    if (data.independentExtrapolation)
      await page
        .getByLabel("Your extrapolated line end x (cm³)", { exact: true })
        .fill("0");
    await page
      .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
      .fill("21.4");
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

for (const width of [320, 1280])
  test(`Higher ${width} all43 answers record independently, remain sealed, retain working and allow partial review`, async ({
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
        .getByRole("button", { name: "Start without a timer →", exact: true })
        .click();
      for (const [i, part] of paper.parts.entries()) {
        await expect(
          page.getByRole("heading", { name: part.question.title, exact: true }),
        ).toBeVisible();
        if (part.question.writtenEquationKind) {
          await expect(
            page.getByText("For ‘both’, write one of each.", { exact: false }),
          ).toHaveCount(0);
          await expect(
            page.getByText(
              part.question.writtenEquationKind === "half"
                ? "Use chemical formulas, ion charges and electrons. Balance atoms and charge. You can type → or ->. State symbols are optional for this question. Include any explanation requested."
                : "Use chemical formulas and coefficients to write a balanced symbol equation. You can type → or ->.",
              { exact: true },
            ),
          ).toBeVisible();
        }
        await answer(page, part.question);
        if (part.number === "4(a)")
          await page
            .locator(".written-answer textarea")
            .fill(
              "Warm dilute sulfuric acid in a beaker. Add zinc carbonate in portions while stirring until excess solid remains. Filter, keeping the filtrate in an evaporating basin. Heat gently to concentrate, then leave to cool so crystals form.",
            );
        if (part.number === "9(b)")
          for (const [name, value] of [
            ["reactant", "100"],
            ["product", "20"],
            ["peak", "180"],
          ])
            await page
              .getByLabel(`Your drawn ${name} level / kJ`, { exact: true })
              .fill(value);
        if (part.number === "1(b)") {
          await page.locator(".numeric-label input").fill("63.60");
          await page.getByText("Show your working", { exact: true }).click();
          await page
            .getByLabel("Working for this question", { exact: true })
            .fill(
              "(63×68+65×32)/100=63.64. I retained two decimal places instead of the requested one.",
            );
        }
        if (part.number === "7(b)") {
          await page.locator(".numeric-label input").fill("4.50e23");
          await page.getByText("Show your working", { exact: true }).click();
          await page
            .getByLabel("Working for this question", { exact: true })
            .fill(
              "0.750×6.02×10^23 = 4.500×10^23 (an arithmetic error). I rounded this carried value to 3 significant figures in normalized standard form: 4.50×10^23.",
            );
        }
        if (part.number === "8(b)") {
          await page.locator(".numeric-label input").fill("12000");
          await page.getByText("Show your working", { exact: true }).click();
          await page
            .getByLabel("Working for this question", { exact: true })
            .fill(
              "Mr=72; mass=72000g; n=1000mol; n(CO2)=500mol; V=500×24=12000dm³",
            );
        }
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        await expect(
          page.getByText("Answer recorded.", { exact: false }),
        ).toBeVisible();
        await expect(
          page.locator(
            ".paper-reference,.assessment-results,.temperature-graph-reference",
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
      await expect(page.locator(".full-paper-results")).toBeVisible();
      const rows = page.locator(".results-list > details");
      await expect(rows).toHaveCount(43);
      for (const number of [
        "1(b)",
        "7(b)",
        "8(b)",
        "4(a)",
        "3(b)",
        "2(a)",
        "9(b)",
      ]) {
        const part = paper.parts.find((p) => p.number === number)!;
        const row = rows.nth(paper.parts.indexOf(part));
        await row.locator(":scope > summary").click();
        await row.locator(".paper-reference > summary").click();
        if (number === "1(b)" || number === "7(b)" || number === "8(b)") {
          await expect(row.locator(".assessment-working-review")).toContainText(
            number === "1(b)"
              ? "two decimal places"
              : number === "7(b)"
                ? "arithmetic error"
                : "Mr=72",
          );
          for (const [i, c] of part.criteria.entries())
            await row
              .getByLabel(`${number}: ${c.id} review mark`, { exact: true })
              .selectOption(
                String(
                  number === "1(b)"
                    ? i === 2
                      ? 0
                      : 1
                    : number === "7(b)"
                      ? i === 1
                        ? 0
                        : 1
                      : i === 0
                        ? 0
                        : 1,
                ),
              );
          await expect(row.locator(":scope > summary")).toContainText(
            number === "1(b)" || number === "7(b)" ? "2 / 3" : "5 / 6",
          );
        } else if (number === "4(a)") {
          expect(await row.locator('input[type="checkbox"]').count()).toBe(0);
          await row
            .getByLabel("4(a): whole-response mark using the levels", {
              exact: true,
            })
            .selectOption("4");
          await expect(row.locator(":scope > summary")).toContainText("4 / 6");
        } else {
          await expect(row.locator("svg").first()).toBeVisible();
          for (const disabled of await row
            .locator(".result-body input,.result-body textarea")
            .evaluateAll((nodes) =>
              nodes.map((n) => (n as HTMLInputElement).matches(":disabled")),
            ))
            expect(disabled).toBe(true);
          if (number === "3(b)") {
            await row.locator(".temperature-graph-reference > summary").click();
            await expect(
              row.getByRole("img", {
                name: /Reference observations.*zero volume of alkali/,
              }),
            ).toBeVisible();
          }
        }
        await row.locator(":scope > summary").click();
      }
      await saved(page);
      await page.reload();
      for (const [number, score] of [
        ["1(b)", "2 / 3"],
        ["7(b)", "2 / 3"],
        ["8(b)", "5 / 6"],
        ["4(a)", "4 / 6"],
      ])
        await expect(
          rows
            .nth(paper.parts.findIndex((p) => p.number === number))
            .locator(":scope > summary"),
        ).toContainText(score);
      await expect(
        page.getByRole("heading", { name: /parts still need review/ }),
      ).toBeVisible();
      for (const [index, part] of paper.parts.entries()) {
        if (
          ["1(b)", "7(b)", "8(b)", "4(a)"].includes(part.number) ||
          !part.criteria.length
        )
          continue;
        const row = rows.nth(index);
        await row.locator(":scope > summary").click();
        await row.locator(".paper-reference > summary").click();
        for (const c of part.criteria)
          await row
            .getByLabel(`${part.number}: ${c.id} review mark`, { exact: true })
            .selectOption(String(c.marks));
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
    } finally {
      await context.close();
    }
  });

for (const width of [320, 1280])
  test(`Higher ${width} extrapolation is blank until independently constructed and its endpoint persists`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      const state = emptyProgress(),
        work = emptyWork();
      work.run = {
        kind: "paper",
        ids,
        index: paper.parts.findIndex((p) => p.number === "3(b)"),
        started: Date.now(),
        responses: {},
      };
      state.work[workId] = work;
      await page.addInitScript(
        ({ key, raw }) => {
          if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
        },
        { key: STORAGE_KEY, raw: JSON.stringify(state) },
      );
      await page.goto(route);
      await page
        .getByRole("heading", {
          name: "Plot, fit and extrapolate",
          exact: true,
        })
        .waitFor();
      await expect(
        page.locator(".temperature-source-table caption"),
      ).toContainText("Volume of alkali");
      await expect(
        page.locator(".temperature-source-table caption"),
      ).toContainText("Highest temperature");
      await expect(page.locator(".question-panel")).not.toContainText(
        "21.4 + 0.137",
      );
      await page
        .getByRole("button", { name: "Edit your best-fit line", exact: true })
        .click();
      for (const [index, y] of [
        [0, 22.085],
        [5, 25.51],
      ]) {
        await page
          .getByLabel("Choose an observation or line end", { exact: true })
          .selectOption(String(index));
        await page
          .getByLabel(
            `Your fit height at original x=${index === 0 ? 5 : 30} (°C)`,
            { exact: true },
          )
          .fill(String(y));
      }
      await expect(page.locator('[data-fit="your-chosen-line"]')).toHaveCount(
        1,
      );
      await expect(page.locator("[data-fit-extrapolation]")).toHaveCount(0);
      const endpoint = page.getByLabel("Your extrapolated line end x (cm³)", {
        exact: true,
      });
      await expect(endpoint).toHaveValue("");
      await endpoint.fill("10");
      await expect(page.locator("[data-fit-extrapolation]")).toHaveCount(0);
      await endpoint.fill("1");
      await expect(page.locator("[data-fit-extrapolation]")).toHaveCount(1);
      await endpoint.fill("0");
      await saved(page);
      await page.reload();
      await expect(endpoint).toHaveValue("0");
      await expect(page.locator("[data-fit-extrapolation]")).toHaveCount(1);
    } finally {
      await context.close();
    }
  });
