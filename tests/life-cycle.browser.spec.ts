import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { lcaJourney as j } from "../src/content/journeys/life-cycle-assessment";
import {
  lcaRecords,
  lcaFields,
  lcaChoices,
  lcaNumeric,
  type LcaMode,
} from "../src/lib/life-cycle";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/life-cycle-and-recycling",
  dir = path.join(process.cwd(), "test-results/qa/life-cycle-and-recycling");
async function saved(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(p: Page, i: number) {
  const pick = p.getByLabel("Choose a practice task", { exact: true });
  if (await pick.count()) await pick.selectOption(String(i));
  else
    await p
      .getByRole("button", { name: `Task ${i + 1}`, exact: true })
      .first()
      .click();
}
async function fill(root: Locator, record: string) {
  for (const [f, v] of Object.entries(lcaRecords[record].expected)) {
    if (lcaNumeric.includes(f))
      await root.locator(`[data-field="${f}"]`).fill(v);
    else await root.locator(`[data-field="${f}"]`).selectOption(v);
  }
}
async function answer(p: Page, q: Question) {
  if (q.parts) {
    for (const part of q.parts)
      await p.getByLabel(part.label, { exact: true }).fill(String(part.answer));
  } else if (q.rubric)
    await p.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await p.getByRole("radio", { name: q.answer, exact: true }).check();
  else await p.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function accessible(p: Page) {
  expect(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
}
async function shot(p: Page, name: string, device: string) {
  fs.mkdirSync(dir, { recursive: true });
  await p.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  await p.screenshot({
    path: path.join(dir, `${device}-${name}.png`),
    fullPage: true,
    scale: "css",
  });
}
for (const mode of [
  "stages",
  "boundary",
  "inventory",
  "reuse",
  "tradeoff",
  "recycle",
] as LcaMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "life-cycle-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "life-cycle-investigation") throw Error("Missing model");
    const root = page.locator(".lca-workbench"),
      original = await root.locator(".lca-context").innerText();
    await fill(root, m.record);

    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    await root.screenshot({
      path: path.join(dir, `${info.project.name}-panel-${mode}.png`),
      scale: "css",
      style: "header { visibility: hidden !important; }",
    });
    const f = lcaFields[mode][0],
      wrong = lcaNumeric.includes(f)
        ? "999"
        : lcaChoices[f].find((v) => v !== lcaRecords[m.record].expected[f])!,
      control = root.locator(`[data-field="${f}"]`);
    if (lcaNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".lca-context").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(lcaRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of lcaFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".lca-context").innerText()).toBe(original);
  });
test("all23 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".lca-workbench")).toHaveCount(0);
    if (q.parts)
      await expect(page.locator(".multipart-answer legend")).not.toContainText(
        "particle counts",
      );
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "life-cycle-and-recycling"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if ([0, 1, 5, 7, 8, 9, 10, 12, 16, 17, 19, 20, 21, 22].includes(i)) {
      await accessible(page);
      await shot(page, "practice-" + i, info.project.name);
    }
  }
});
test("both reserved six-question forms and delayed three-question forms seal marking and retain written criteria", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < 2; f++) {
    for (let i = 0; i < 6; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.checkForms[f][i]);
      await expect(
        page.locator(
          ".lca-workbench,.assessment-review-criteria,.lca-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].lcaGiven) {
        await expect(page.locator(".assessment-session")).not.toContainText(
          "Your proposal",
        );
        await expect(page.locator(".assessment-session")).not.toContainText(
          "Check proposal",
        );
        await accessible(page);
        await shot(page, `sealed-figure-${f}-${i}`, info.project.name);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: `${6 - j.checkForms[f].filter((q) => q.rubric).length} of ${6 - j.checkForms[f].filter((q) => q.rubric).length} correct`,
        exact: true,
      }),
    ).toBeVisible();
    const i = j.checkForms[f].findIndex((q) => q.rubric),
      card = page.locator(".assessment-results details").nth(i);
    await card.locator("summary").click();
    await expect(card.locator(".assessment-review-criteria li")).toHaveText(
      j.checkForms[f][i].rubric!,
    );
    await accessible(page);
    await shot(page, `submitted-check-${f}`, info.project.name);
    if (!f)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
  for (let f = 0; f < 2; f++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Start review →", exact: true }),
    ).toHaveCount(0);
    await saved(page);
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const r of p.work["life-cycle-and-recycling"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["life-cycle-and-recycling"].run.submitted =
          Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: f ? "Try the next form" : "Start review →",
        exact: true,
      })
      .click();
    for (let i = 0; i < 3; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.reviewForms[f][i]);
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: `2 of 2 correct`,
        exact: true,
      }),
    ).toBeVisible();
  }
});
test("all15 records are reachable, checkable without changing the sources and tied to their task", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto(route);
  const seen = new Set<string>();
  for (const stage of ["guided", "refresher"] as const) {
    if (stage === "refresher") {
      await page.getByRole("button", { name: "Practise", exact: true }).click();
      const choiceIndex = j.practice.findIndex((q) => q.options);
      expect(choiceIndex).toBeGreaterThanOrEqual(0);
      await task(page, choiceIndex);
      await page
        .getByRole("radio", {
          name: j.practice[choiceIndex].options!.find(
            (o) => o !== j.practice[choiceIndex].answer,
          )!,
          exact: true,
        })
        .check();
      await page.locator(".sample-check-answer").click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
    } else
      await page.getByRole("button", { name: "Learn", exact: true }).click();
    for (let i = 0; i < j[stage].length; i++) {
      await task(page, i);
      const m = j[stage][i].model;
      if (m?.kind !== "life-cycle-investigation" || seen.has(m.record))
        continue;
      const root = page.locator(".lca-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(lcaRecords).sort());
});
test("320px and390px opening gives a useful keyboard control within664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="event1"]');
    const box = (await first.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(664);
    await first.selectOption("");
    await first.focus();
    await first.press("ArrowDown");
    await expect(first).toHaveValue("raw");
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
test("malformed native energy inventory remains raw after reload rather than becoming zero", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".lca-workbench");
  await fill(root, "totals");
  await root.locator('[data-field="aTotal"]').fill("1..2");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator(".lca-proposal")).toContainText("1..2");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="aTotal"]')).toHaveValue("1..2");
  await accessible(page);
  await shot(page, "raw-energy", info.project.name);
});
test("independent wrong energy inventory preserves the given and returns to its specific refresher with support faded", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 3);
  const q = j.practice[3];
  await answer(page, q);
  await page.getByLabel("B total / kJ", { exact: true }).fill("1000");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit",
  );
  await expect(page.locator(".lca-workbench,.lca-proposal")).toHaveCount(0);
  await expect(page.locator(".lca-given")).toContainText("120");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("B total / kJ", { exact: true })).toHaveValue(
    "1000",
  );
  await accessible(page);
  await shot(page, "independent-wrong-energy", info.project.name);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".lca-workbench")).toHaveAttribute(
    "data-record",
    "totals",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("B total / kJ", { exact: true })).toHaveValue(
    "1000",
  );
});
test("a selective written claim is retained with a gated manual reference and no automatic marks", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  const q = j.practice[2],
    raw =
      "Only manufacture counts. Ignore washing, disposal and transport because a green label proves no impacts.";
  await page.getByLabel("Your explanation", { exact: true }).fill(raw);
  await expect(page.locator(".sample-reference")).toHaveCount(0);
  await page.locator(".sample-check-answer").click();
  await page.locator(".sample-reference summary").click();
  await expect(page.locator(".sample-reference")).toContainText(
    q.referenceResponse!,
  );
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(raw);
  await saved(page);
  const result = await page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key)!).work[
        "life-cycle-and-recycling"
      ].attempts[id].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await accessible(page);
  await shot(page, "written-boundary-reference", info.project.name);
});
test("common-axis source graph remains fixed through wrong calculations and independent transfer", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".lca-workbench");
  await root.locator(".lca-source-chart summary").click();
  const graph = root.locator(".lca-energy-chart");
  await expect(graph).toContainText("0–240");
  const original = await graph.innerHTML();
  expect(await graph.locator("svg").count()).toBe(4);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await expect
      .poll(() =>
        graph
          .locator("svg text")
          .first()
          .evaluate((e) => {
            const matrix = (e as SVGGraphicsElement).getScreenCTM()!;
            return (
              parseFloat(getComputedStyle(e).fontSize) * Math.abs(matrix.d)
            );
          }),
      )
      .toBeGreaterThanOrEqual(14);
    await accessible(page);
  }
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1280, height: 900 },
  );
  const bars = graph.locator("svg").first().locator("rect");
  expect(Number(await bars.nth(0).getAttribute("width"))).toBeCloseTo(250);
  expect(Number(await bars.nth(1).getAttribute("width"))).toBeCloseTo(156.25);
  await fill(root, "totals");
  await root.locator('[data-field="aTotal"]').fill("999");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  expect(await graph.innerHTML()).toBe(original);
  await accessible(page);
  await shot(page, "fixed-source-graph", info.project.name);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 4);
  await expect(page.locator(".lca-workbench,.lca-proposal")).toHaveCount(0);
  await page.locator(".lca-source-chart summary").click();
  await expect(page.locator(".lca-energy-chart")).toContainText("0–180");
  await page.getByLabel("Your answer", { exact: true }).fill("80");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "right",
  );
  await accessible(page);
  await shot(page, "independent-graph-reading", info.project.name);
});
test("omitted boundary stages remain visible and never silently become a complete result", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 1);
  const root = page.locator(".lca-workbench");
  await fill(root, "full");
  await root.locator('[data-field="use"]').selectOption("exclude");
  await root.locator('[data-field="end"]').selectOption("exclude");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator(".lca-proposal")).toContainText("A 340, B 240 kJ");
  await expect(root.locator(".lca-proposal")).toContainText(
    "not an automatic full-life result",
  );
  await expect(root.locator('[data-field="use"]')).toHaveValue("exclude");
  await accessible(page);
  await shot(page, "partial-boundary", info.project.name);
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="end"]')).toHaveValue("exclude");
  await expect(root.locator(".lca-proposal")).toContainText("A 340, B 240 kJ");
});
