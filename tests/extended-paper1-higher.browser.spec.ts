import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { paper1Higher as paper } from "../src/content/extended-assessments";
import { STORAGE_KEY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = `/exams/${paper.slug}`,
  workId = `assessment-${paper.slug}`,
  dir = "test-results/qa/extended-paper1-higher";
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
  const d = page.locator(".assessment-question-jump");
  if ((await d.getAttribute("open")) === null)
    await d.locator("summary").click();
  await page
    .getByRole("button", { name: `Question ${n}`, exact: true })
    .click();
  if ((await d.getAttribute("open")) !== null)
    await d.locator("summary").click();
}
function graph(page: Page) {
  return page.getByRole("region", {
    name: "Temperature graph construction",
    exact: true,
  });
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
async function construct(root: Locator) {
  const points = [
    [3, 20.4],
    [6, 18.2],
    [9, 16.7],
    [12, 14.6],
    [15, 13.1],
    [18, 11.2],
  ];
  for (const [i, [x, y]] of points.entries()) {
    await root
      .getByLabel("Choose an observation or line end", { exact: true })
      .selectOption(String(i));
    await root.locator(`[data-plot-field="p${i}x"]`).fill(String(x));
    await root.locator(`[data-plot-field="p${i}y"]`).fill(String(y));
  }
  await root
    .getByRole("button", { name: "Edit your best-fit line", exact: true })
    .click();
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("0");
  await root.locator('[data-plot-field="c0"]').fill("20.2");
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("5");
  await root.locator('[data-plot-field="c5"]').fill("11.2");
  await root
    .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
    .fill("19");
}
async function answer(page: Page, q: Question) {
  if (q.fuelDrawing) {
    await construct(graph(page));
    return;
  }
  if (q.drawDotCross) {
    await page
      .getByLabel("Original non-metal electrons (dots)", { exact: true })
      .fill("6");
    await page
      .getByLabel("Transferred metal electrons (crosses)", { exact: true })
      .fill("2");
    await page.getByLabel("Ion charge", { exact: true }).selectOption("-2");
    await page.getByLabel("Draw square brackets", { exact: true }).check();
    return;
  }
  if (q.parts) {
    const values: Record<string, string> =
      q.id === "iso-v1-cb-table"
        ? { p: "13", n: "14", e: "10" }
        : q.id === "rm-v1-cb-working"
          ? { requested: "0.3", mass: "5.1" }
          : {
              unsharedCentre: "4",
              centre0: "1",
              partner0: "1",
              unsharedPartner0: "0",
              centre1: "1",
              partner1: "1",
              unsharedPartner1: "0",
            };
    for (const p of q.parts)
      await page.getByLabel(p.label, { exact: true }).fill(values[p.id]);
    return;
  }
  if (q.options) {
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
    return;
  }
  if (q.rubric) {
    await page
      .getByLabel("Your explanation", { exact: true })
      .fill(
        q.id === "am-v1-p-contrast"
          ? "The nucleus occupies the whole atom."
          : q.id === "ss-v1-p-method-write"
            ? "Filter the acid first, then evaporate everything dry."
            : q.answer,
      );
    return;
  }
  const values: Record<string, string> = {
    "as-v1-cb-analogy": "2",
    "ram-v1-cb-count": "40.5",
    "if-v1-cb-nitrate": "Al(NO3)3",
    "np-v1-cb-ratio": "0.75",
    "ae-v1-p-inverse-transfer": "104",
    "tc-v1-cb-volume": "12",
    "gv-v1-cb-steam": "62",
    "ty-v1-cb-required": "15",
    "he-v1-b-zinc-acid": "Zn + 2H+ -> Zn2+ + H2",
    "acid-v1-b-factor": "1000",
    "bond-v1-b-change": "-305",
    "bond-v1-b-inverse": "440",
    "fh-v1-B-oxygen": "O2 + 4H+ + 4e- -> 2H2O",
  };
  await page.getByLabel("Your answer", { exact: true }).fill(values[q.id]);
  if (q.chemicalFormula || q.electronEquation || q.id === "bond-v1-b-change")
    await expect(
      page.getByLabel("Your answer", { exact: true }),
    ).toHaveAttribute("inputmode", "text");
}
test("the individually reviewed Higher sample renders thirty formats, preserves wrong working and conceals all references until whole-set submission", async ({
  page,
}, info) => {
  test.setTimeout(120000); // Thirty individually entered responses plus constructed diagrams and axe audits.
  await page.goto("/exams");
  await page
    .getByRole("link", { name: /Paper 1 cumulative practice · Higher/ })
    .click();
  await expect(page.locator("main")).toContainText("Chemistry only");
  await capture(page, info.project.name, "intro");
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  for (let i = 0; i < 30; i++) {
    const q = paper.questions[i];
    const hasSeparatePrompt = !!(
      (q.writtenEquations || q.conciseHeading) &&
      q.title
    );
    await expect(
      page.getByRole("heading", {
        name: hasSeparatePrompt ? q.title : q.prompt,
        exact: true,
      }),
    ).toBeVisible();
    if (hasSeparatePrompt) {
      const prompt = page.locator(".question-panel .written-equation-prompt");
      await expect(prompt).toBeVisible();
      await expect(prompt).toHaveText(q.prompt);
    }
    await expect(
      page.locator(
        ".assessment-results,.assessment-review-criteria,.temperature-graph-reference",
      ),
    ).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 29) {
      await page
        .getByRole("button", { name: "Leave unanswered", exact: true })
        .click();
      continue;
    }
    if (i === 0) {
      const smallestLabel = await page
        .locator(".atomic-model-diagram svg")
        .evaluate((svg) => {
          const scale = svg.getBoundingClientRect().width / 380;
          return Math.min(
            ...Array.from(
              svg.querySelectorAll("text"),
              (label) => parseFloat(getComputedStyle(label).fontSize) * scale,
            ),
          );
        });
      expect(smallestLabel).toBeGreaterThanOrEqual(14);
    }
    if (i === 10) {
      await expect(
        page.locator(".assessment-panel-results tbody tr"),
      ).toHaveText(["A108", "B1218", "C2030"]);
      await page
        .getByText("Panel materials and evidence", { exact: true })
        .click();
      await expect(page.locator(".assessment-panel-evidence")).toContainText(
        "Graphene-reinforced polymer panel",
      );
      await page
        .getByText("Panel materials and evidence", { exact: true })
        .click();
    }
    if (i === 24) {
      const structures = page.locator(".assessment-supplied-structures");
      await structures.locator("summary").click();
      for (const [species, coefficient, orders] of [
        ["NH3", "4", "1,1,1"],
        ["O2", "3", "2"],
        ["N2", "2", "3"],
        ["H2O", "6", "1,1"],
      ]) {
        const formula = structures.locator(`[data-species="${species}"]`);
        await expect(formula).toBeVisible();
        await expect(formula).toHaveAttribute("data-coefficient", coefficient);
        await expect(formula).toHaveAttribute("data-bond-orders", orders);
      }
      await structures.locator("summary").click();
    }
    await answer(page, q);
    if (i === 13) {
      for (const part of q.parts!) {
        await expect(
          page.getByLabel(part.label, { exact: true }),
        ).toHaveAttribute("inputmode", "text");
        await expect(page.getByLabel(part.label, { exact: true })).toHaveValue(
          String(part.answer),
        );
      }
    }
    if (i === 6 || i === 7) {
      const controls = page.locator(
        i === 6
          ? ".ion-construction-controls"
          : ".covalent-construction-controls",
      );
      const diagram = page.locator(
        i === 6 ? ".ion-construction-preview" : ".covalent-diagram",
      );
      await expect(diagram).toBeVisible();
      if (info.project.name === "desktop") {
        const a = (await controls.boundingBox())!;
        const b = (await diagram.boundingBox())!;
        expect(b.x).toBeGreaterThan(a.x + a.width);
        expect(Math.abs(b.y - a.y)).toBeLessThanOrEqual(24);
        const svg = (await diagram.locator("svg").boundingBox())!;
        expect(svg.height).toBeLessThanOrEqual(420);
      }
      if (i === 7) await expect(diagram).toHaveAttribute("data-electrons", "8");
    }
    if (i === 12) {
      await page.locator(".assessment-working summary").click();
      await page
        .getByLabel("Working for this question", { exact: true })
        .fill(
          "70.3 = 100 × 2x / (2x + 88)\nx = 104 (my incorrect coefficient)",
        );
      await saved(page);
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        "104",
      );
      await page.locator(".assessment-working summary").click();
      await expect(
        page.getByLabel("Working for this question", { exact: true }),
      ).toHaveValue(/incorrect coefficient/);
      await capture(page, info.project.name, "inverse-working-retained");
    }
    if ([6, 7, 13, 18, 28].includes(i))
      await capture(page, info.project.name, `question-${i + 1}`);
    if (i === 28) {
      await saved(page);
      await page.reload();
      await expect(
        graph(page).getByLabel("Your proposed estimate at x=0 (°C)", {
          exact: true,
        }),
      ).toHaveValue("19");
      await expect(
        page.locator(
          ".temperature-graph-reference,.assessment-review-criteria",
        ),
      ).toHaveCount(0);
    }
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
    page.getByRole("heading", { name: "18 of 20 correct", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".results-banner")).toContainText(
    "9 of 10 responses saved for self-review; 1 left unanswered",
  );
  await expect(page.locator(".result-indicator.self-review")).toHaveCount(10);
  const inverse = page.locator(".result-row").nth(12);
  await inverse.locator("summary").click();
  await expect(inverse).toContainText("incorrect coefficient");
  await expect(inverse).toContainText("208");
  const method = page.locator(".result-row").nth(18);
  await method.locator("summary").click();
  await expect(method).toContainText(
    "Filter the acid first, then evaporate everything dry.",
  );
  await expect(method.locator(".assessment-review-criteria li")).toHaveText(
    paper.questions[18].rubric!,
  );
  const drawing = page.locator(".result-row").nth(28);
  await drawing.locator(":scope > summary").click();
  await expect(drawing.locator('[data-fit="your-chosen-line"]')).toBeVisible();
  await expect(drawing.locator('input[id$="-estimate"]')).toHaveValue("19");
  await drawing.getByText("Compare a reference graph", { exact: true }).click();
  await capture(page, info.project.name, "submitted-review");
  if (info.project.name === "desktop") {
    await drawing.screenshot({
      path: `${dir}/${info.project.name}-submitted-graph.png`,
    });
    await inverse.screenshot({
      path: `${dir}/${info.project.name}-submitted-calculation.png`,
    });
    await method.screenshot({
      path: `${dir}/${info.project.name}-submitted-method.png`,
    });
  }
  await saved(page);
  const responses = await page.evaluate(
    ({ key, workId }) =>
      JSON.parse(localStorage.getItem(key)!).work[workId].run.responses,
    { key: STORAGE_KEY, workId },
  );
  for (const q of paper.questions.filter((q) => q.rubric))
    expect(responses[q.id]?.correct, q.id).not.toBe(true);
  await expect(
    page.locator(".result-row").last().locator("summary"),
  ).toContainText("Not answered");
});
test("a wholly blank construction cannot be recorded and wrong or malformed graph coordinates survive an unrecorded reload", async ({
  page,
}, info) => {
  await start(page);
  await jump(page, 29);
  const root = graph(page);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".question-panel")).toContainText(
    "Choose or enter an answer",
  );
  await root.locator('[data-plot-field="p0x"]').fill("1..2");
  await root.locator('[data-plot-field="p0y"]').fill("20.4");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("1..2");
  await expect(root.locator("[data-plot-point]")).toHaveCount(0);
  await expect(
    page.locator(
      ".assessment-review-criteria,.temperature-graph-reference,.feedback.correct",
    ),
  ).toHaveCount(0);
  await construct(root);
  await saved(page);
  await page.reload();
  await expect(root.locator("[data-plot-point]")).toHaveCount(6);
  await expect(
    root.getByLabel("Your proposed estimate at x=0 (°C)", { exact: true }),
  ).toHaveValue("19");
  await capture(page, info.project.name, "unrecorded-wrong-graph");
  await root
    .getByRole("button", { name: "Clear this temperature graph", exact: true })
    .click();
  await expect(root.locator("[data-plot-point]")).toHaveCount(0);
  await expect(root.locator("[data-fit]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".question-panel")).toContainText(
    "Choose or enter an answer",
  );
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("");
});
test("all thirty Higher question openings preserve a complete44px scientific response within664px at320 and390", async ({
  page,
}, info) => {
  test.setTimeout(120000); // Sixty loaded question views with explicit layout checks.
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px question${n}`,
      ).toBe(true);
      if ([1, 7, 8, 10, 11, 13, 19, 25, 29].includes(n))
        await capture(
          page,
          info.project.name,
          `${width}-question-${n}-opening`,
          false,
        );
    }
  }
});
test("reusing a studied construction or calculation in Higher practice preserves its existing exposure identity", async ({
  page,
}) => {
  await page.goto("/lessons/atom-economy");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 23", exact: true })
    .first()
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("208");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await saved(page);
  await start(page);
  await jump(page, 13);
  await page.getByLabel("Your answer", { exact: true }).fill("208");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, workId }) =>
        JSON.parse(localStorage.getItem(key)!).work[workId].run.responses[
          "ae-v1-p-inverse-transfer"
        ].fresh,
      { key: STORAGE_KEY, workId },
    ),
  ).toBe(false);
});
