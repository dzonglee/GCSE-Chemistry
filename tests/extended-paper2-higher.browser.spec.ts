import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { paper2Higher as paper } from "../src/content/extended-assessments";
import { polymerisationJourney } from "../src/content/journeys/polymerisation";
import { STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = `/exams/${paper.slug}`,
  workId = `assessment-${paper.slug}`,
  dir = "test-results/qa/extended-paper2-higher";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function start(page: Page) {
  await page.goto(route);
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
}
async function jump(page: Page, n: number) {
  const details = page.locator(".assessment-question-jump");
  if ((await details.getAttribute("open")) === null)
    await details.locator("summary").click();
  await page
    .getByRole("button", {
      name: new RegExp(`^Question ${n}(?:, recorded)?$`),
    })
    .click();
  if ((await details.getAttribute("open")) !== null)
    await details.locator("summary").click();
}
async function capture(
  page: Page,
  device: string,
  name: string,
  fullPage = true,
) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${device}-${name}.png`, fullPage });
}
async function answer(page: Page, q: Question) {
  if (q.tangentDrawing) {
    for (const [i, [t, y]] of [
      [10, 20],
      [30, 44],
    ].entries()) {
      await page
        .getByLabel("Tangent endpoint to edit", { exact: true })
        .selectOption(String(i));
      await page
        .getByLabel(`Your tangent endpoint ${i + 1} time / s`, { exact: true })
        .fill(String(t));
      await page
        .getByLabel(`Your tangent endpoint ${i + 1} quantity / cm³`, {
          exact: true,
        })
        .fill(String(y));
    }
  } else if (q.organicDrawing) {
    const root = page.locator(".organic-drawing-input");
    await root
      .getByLabel("Choose the number of carbon atoms in your scaffold")
      .selectOption("2");
    await root
      .getByRole("button", { name: /^Terminal C–O attachment:/ })
      .click();
    await root.getByRole("button", { name: /^H attached to that O:/ }).click();
    await root
      .getByLabel("Separate terminal C–O connection and bond order")
      .selectOption("2");
    for (const key of ["h0", "h1", "h2"])
      await root.locator(`[data-h-slot="${key}"]`).click();
  } else if (q.polymerisationDrawing || q.polyesterDrawing) {
    const values = q.polyesterDrawing
      ? {
          diolC: "3",
          acidSpacerC: "1",
          leftO: "1",
          middleO: "1",
          carbonyl1: "2",
          carbonyl2: "2",
          left: "1",
          right: "1",
          brackets: "1",
          countMark: "n",
        }
      : {
          s0: "H",
          s1: "F",
          s2: "H",
          s3: "F",
          bond: "1",
          left: "1",
          right: "1",
          brackets: "1",
          countMark: "n",
        };
    const root = page.locator(".polymerisation-drawing");
    for (const [key, value] of Object.entries(values))
      await root.locator(`[id$="${key}"]`).selectOption(value!);
  } else if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts) {
      const field = page.getByLabel(part.label, { exact: true });
      await expect(field).toHaveAttribute(
        "inputmode",
        part.inputMode === "numeric" ? "numeric" : "text",
      );
      await field.fill(values[part.id]);
    }
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
test("all thirty Higher Paper2 formats retain wrong science and working and hide criteria until the whole-set submission", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await capture(page, info.project.name, "intro");
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  for (const [i, q] of paper.questions.entries()) {
    await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Give me a hint", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Check model", exact: true }),
    ).toHaveCount(0);
    if (i === 29) {
      await page
        .getByRole("button", { name: "Leave unanswered", exact: true })
        .click();
      continue;
    }
    await answer(page, q);
    if (i === 9 || i === 10) {
      const svg = page.locator(
        i === 9
          ? 'svg[aria-label="Original supplied structure"]'
          : 'svg[aria-label="Your constructed polyester repeating unit"]',
      );
      const renderedSize = await svg.evaluate((s) => {
        const text = s.querySelector("text")!;
        return (
          (parseFloat(getComputedStyle(text).fontSize) *
            s.getBoundingClientRect().width) /
          (s as SVGSVGElement).viewBox.baseVal.width
        );
      });
      expect(renderedSize).toBeGreaterThanOrEqual(14);
    }
    if (i === 11) {
      const svg = page.locator(".natural-helix-given svg");
      await expect(svg.locator("line")).toHaveCount(15);
      await expect(svg.locator("path")).toHaveCount(2);
    }
    if (i === 17) {
      await expect(page.locator('[data-spectrum-row="ca"]')).toContainText(
        "1, 5, 8",
      );
      await expect(page.locator('[data-spectrum-row="cu"]')).toContainText(
        "4, 7, 12",
      );
      await expect(page.locator('[data-spectrum-row="unknown"]')).toContainText(
        "1, 4, 5, 7, 8, 12",
      );
    }
    if (i === 0) {
      await capture(page, info.project.name, "tangent-construction");
      await page
        .getByLabel("Tangent endpoint to edit", { exact: true })
        .selectOption("0");
      await page
        .getByLabel("Your tangent endpoint 1 time / s", { exact: true })
        .fill("1..2");
    }
    if (i === 1) {
      await page.getByLabel("Your answer", { exact: true }).fill("0.5");
      await page.locator(".assessment-working summary").click();
      await page
        .getByLabel("Working for this question", { exact: true })
        .fill("(25 − 10)/(50 − 20) = 0.5; I have not used the calibration.");
    }
    if (i === 10)
      await page
        .getByLabel(
          "Number of acid CH₂ spacer carbons (exclude both COOH carbons)",
          { exact: true },
        )
        .selectOption("2");
    if (i === 13)
      await page.getByLabel("Your answer", { exact: true }).fill("0.4");
    if (i === 19) {
      await page
        .getByLabel("Absorbed solar energy / units", { exact: true })
        .fill("999");
      await expect(page.locator(".question-panel")).not.toContainText(
        "outside the supplied incoming total",
      );
      await page
        .getByLabel("Absorbed solar energy / units", { exact: true })
        .fill("180");
    }
    if (i === 24)
      await page
        .getByLabel("B minus A / kWh per m³", { exact: true })
        .fill("2");
    if ([0, 1, 10, 13, 24].includes(i)) {
      await saved(page);
      await page.reload();
      if (i === 0)
        await expect(
          page.getByLabel("Your tangent endpoint 1 time / s", { exact: true }),
        ).toHaveValue("1..2");
      if (i === 1) {
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue("0.5");
        await page.locator(".assessment-working summary").click();
        await expect(
          page.getByLabel("Working for this question", { exact: true }),
        ).toHaveValue(/not used the calibration/);
      }
      if (i === 10)
        await expect(
          page.getByLabel(
            "Number of acid CH₂ spacer carbons (exclude both COOH carbons)",
            { exact: true },
          ),
        ).toHaveValue("2");
      if (i === 13)
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue("0.4");
      if (i === 24)
        await expect(
          page.getByLabel("B minus A / kWh per m³", { exact: true }),
        ).toHaveValue("2");
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    }
    if ([8, 9, 10, 17, 19, 21, 24].includes(i))
      await capture(page, info.project.name, `question-${i + 1}`);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".question-panel .recorded-note")).toContainText(
      "Feedback appears after submission",
    );
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "13 of 16 correct", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).toContainText(
    "13 of 14 responses saved for self-review; 1 left unanswered",
  );
  await expect(page.locator(".result-indicator.self-review")).toHaveCount(14);
  await capture(page, info.project.name, "submitted");
  for (const n of [1, 2, 11, 17, 25]) {
    const row = page.locator(".result-row").nth(n - 1);
    await row.locator(":scope > summary").click();
    if (n === 1) {
      await expect(
        row.getByLabel("Your tangent endpoint 1 time / s", { exact: true }),
      ).toHaveValue("1..2");
      await expect(
        row.getByLabel("Your tangent endpoint 1 time / s", { exact: true }),
      ).toBeDisabled();
      await expect(row).toContainText("Your tangent endpoints");
    }
    if (n === 2) await expect(row).toContainText("not used the calibration");
    if (n === 11 || n === 17)
      await expect(row.locator(".assessment-review-criteria")).toBeVisible();
    if (n === 25) {
      await expect(row).toContainText("−2");
    }
    await capture(page, info.project.name, `submitted-question-${n}`);
    if (info.project.name === "desktop")
      await row.screenshot({ path: `${dir}/desktop-review-${n}.png` });
    await row.locator(":scope > summary").click();
  }
  await saved(page);
  const responses = await page.evaluate(
    ({ key, workId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].run.responses,
    { key: STORAGE_KEY, workId },
  );
  for (const q of paper.questions.filter((q) => q.rubric))
    expect(responses[q.id]?.correct, q.id).not.toBe(true);
});

test("all thirty question openings retain a complete44px response within664px at320 and390", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await start(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    for (let n = 1; n <= 30; n++) {
      await jump(page, n);
      await page.evaluate(async () => {
        await document.fonts.ready;
        scrollTo(0, 0);
      });
      const control = paper.questions[n - 1].options
        ? page.locator(".question-panel .answer-option").first()
        : page
            .locator(
              '.question-panel input:not([type="hidden"]),.question-panel select,.question-panel textarea',
            )
            .first();
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box!.height, `${width}px question${n}`).toBeGreaterThanOrEqual(44);
      expect
        .soft(box!.y + box!.height, `${width}px question${n}`)
        .toBeLessThanOrEqual(664);
      expect
        .soft(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${width}px question${n}`,
        )
        .toBe(true);
      if ([1, 9, 10, 11, 12, 17, 18, 20, 22, 24, 25, 30].includes(n))
        await capture(
          page,
          info.project.name,
          `${width}-question-${n}-opening`,
          false,
        );
    }
  }
});

test("blank and cleared constructions cannot be recorded; independent pressure graph coordinates and fit survive malformed entry and reload", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await start(page);
  for (const n of [1, 9, 10, 11, 30]) {
    await jump(page, n);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.locator(".question-panel .recorded-note")).toHaveCount(0);
    if (n !== 30) {
      await answer(page, paper.questions[n - 1]);
      await page
        .getByRole("button", {
          name:
            n === 1
              ? "Clear your tangent construction"
              : n === 9
                ? "Clear this organic construction"
                : n === 10
                  ? "Clear this polymerisation construction"
                  : "Clear this polyester construction",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".question-panel .recorded-note")).toHaveCount(
        0,
      );
    }
  }
  const root = page.locator(".haber-drawing");
  const source = page.getByRole("group", {
    name: "Original pressure–yield observations; scroll horizontally",
    exact: true,
  });
  await expect(source.locator("tbody tr")).toHaveCount(2);
  await expect(source.locator("td")).toHaveCount(14);
  await expect(source).toContainText("420");
  await source.focus();
  await page.keyboard.press("ArrowRight");
  if (info.project.name === "mobile")
    expect(await source.evaluate((s) => s.scrollLeft)).toBeGreaterThan(0);
  for (const [label, value] of [
    ["Maximum pressure / atm", "500"],
    ["Pressure per major interval / atm", "100"],
    ["Maximum yield / %", "50"],
    ["Yield per major interval / percentage points", "10"],
  ])
    await root
      .getByRole("combobox", { name: label, exact: true })
      .selectOption(value);
  const points = [
      [60, 4],
      [120, 11],
      [180, 17],
      [240, 22],
      [300, 26],
      [360, 29],
      [420, 31],
    ],
    fit = [4, 10.7, 17.2, 21.8, 26.2, 28.8, 31];
  for (const [i, [x, y]] of points.entries()) {
    await root
      .getByRole("combobox", { name: "Point to place by touch", exact: true })
      .selectOption(String(i));
    await root
      .getByLabel(`Point${i + 1} pressure / atm`, { exact: true })
      .fill(String(x));
    await root
      .getByLabel(`Point${i + 1} yield / %`, { exact: true })
      .fill(String(y));
    await root
      .getByLabel(`Curve control at${x} atm / %`, { exact: true })
      .fill(String(fit[i]));
  }
  await root
    .getByRole("combobox", { name: "Point to place by touch", exact: true })
    .selectOption("0");
  await root.getByLabel("Point1 yield / %", { exact: true }).fill("1..2");
  await saved(page);
  await page.reload();
  await expect(
    root.getByLabel("Point1 yield / %", { exact: true }),
  ).toHaveValue("1..2");
  await expect(root.locator('.haber-free-point[data-x="60"]')).toHaveCount(0);
  await root.getByLabel("Point1 yield / %", { exact: true }).fill("4");
  await expect(root.locator(".haber-free-point[data-x][data-y]")).toHaveCount(
    7,
  );
  await expect(root.locator('.haber-free-point[data-x="60"]')).toHaveAttribute(
    "data-y",
    "4",
  );
  await expect(root.locator('.haber-free-point[data-x="420"]')).toHaveAttribute(
    "data-y",
    "31",
  );
  await capture(page, info.project.name, "independent-pressure-graph");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  for (let n = 1; n < 30; n++) {
    await jump(page, n);
    await page
      .getByRole("button", { name: "Leave unanswered", exact: true })
      .click();
  }
  await jump(page, 30);
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  const row = page.locator(".result-row").nth(29);
  await row.locator(":scope > summary").click();
  await expect(row.locator(".assessment-review-criteria")).toBeVisible();
  await capture(page, info.project.name, "submitted-pressure-graph");
  if (info.project.name === "desktop")
    await row.screenshot({ path: `${dir}/desktop-pressure-graph-review.png` });
});

test("a native polyester practice response retains its exposure when reused in the Higher sample", async ({
  page,
}) => {
  const index = polymerisationJourney.practice.findIndex(
    (q) => q.id === "pol-v1-p-polyester2",
  );
  expect(index).toBeGreaterThanOrEqual(0);
  await page.goto("/preferences");
  await page.getByLabel("Tier", { exact: true }).selectOption("higher");
  await page
    .getByLabel("Qualification", { exact: true })
    .selectOption("separate");
  await saved(page);
  await page.goto("/lessons/polymers");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Choose a practice task", exact: true })
    .selectOption(String(index));
  await answer(page, paper.questions[10]);
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await saved(page);
  await start(page);
  await jump(page, 11);
  await answer(page, paper.questions[10]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, workId }) =>
        JSON.parse(localStorage.getItem(key)!).work[workId].run.responses[
          "pol-v1-p-polyester2"
        ].fresh,
      { key: STORAGE_KEY, workId },
    ),
  ).toBe(false);
});
