import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { wasteJourney as j } from "../src/content/journeys/wastewater";
import {
  wasteRecords,
  wasteFields,
  wasteChoices,
  wasteNumeric,
  type WasteMode,
} from "../src/lib/wastewater";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/wastewater-and-treatment",
  dir = path.join(process.cwd(), "test-results/qa/wastewater-and-treatment");
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
  for (const [f, v] of Object.entries(wasteRecords[record].expected)) {
    if (wasteNumeric.includes(f))
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
  "targets",
  "route",
  "solids",
  "biology",
  "disposal",
  "quality",
] as WasteMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "wastewater-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "wastewater-investigation") throw Error("Missing model");
    const root = page.locator(".waste-workbench"),
      original = await root.locator(".waste-context").innerText();
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
    const f = wasteFields[mode][0],
      wrong = wasteNumeric.includes(f)
        ? "999"
        : wasteChoices[f].find(
            (v) => v !== wasteRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (wasteNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".waste-context").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(wasteRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of wasteFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".waste-context").innerText()).toBe(original);
  });
test("all21 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".waste-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "wastewater-and-treatment"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if ([1, 3, 4, 6, 8, 9, 10, 12, 14, 17, 19].includes(i)) {
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
          ".waste-workbench,.assessment-review-criteria,.waste-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].wasteGiven) {
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
        for (const r of p.work["wastewater-and-treatment"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["wastewater-and-treatment"].run.submitted =
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
test("all15 records are reachable, scientifically checkable and tied to their task", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto(route);
  const seen = new Set<string>();
  for (const stage of ["guided", "refresher"] as const) {
    if (stage === "refresher") {
      await page.getByRole("button", { name: "Practise", exact: true }).click();
      await page
        .getByRole("radio", {
          name: j.practice[0].options!.find((o) => o !== j.practice[0].answer)!,
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
      if (m?.kind !== "wastewater-investigation" || seen.has(m.record))
        continue;
      const root = page.locator(".waste-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(wasteRecords).sort());
});
test("320px and390px opening gives a useful keyboard control within664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="target"]');
    const box = (await first.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(664);
    await first.selectOption("");
    await first.focus();
    await first.press("ArrowDown");
    await expect(first).toHaveValue("organicMicrobes");
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
test("malformed native dry-solid input remains raw after reload rather than becoming zero", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".waste-workbench");
  await fill(root, "solidsA");
  await root.locator('[data-field="after"]').fill("1..2");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator(".waste-proposal")).toContainText("1..2");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="after"]')).toHaveValue("1..2");
  await accessible(page);
  await shot(page, "raw-solids", info.project.name);
});
test("independent wrong solids preserves the given and returns to its specific refresher with support faded", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 4);
  const q = j.practice[4];
  await answer(page, q);
  await page
    .getByLabel("Dry suspended solids in effluent / kg", { exact: true })
    .fill("600");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit",
  );
  await expect(page.locator(".waste-workbench,.waste-proposal")).toHaveCount(0);
  await expect(page.locator(".waste-original")).toContainText("160 kg");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Dry suspended solids in effluent / kg", { exact: true }),
  ).toHaveValue("600");
  await accessible(page);
  await shot(page, "independent-wrong-solids", info.project.name);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".waste-workbench")).toHaveAttribute(
    "data-record",
    "solidsA",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByLabel("Dry suspended solids in effluent / kg", { exact: true }),
  ).toHaveValue("600");
});
test("a written branch misconception is retained with a gated manual reference and no automatic marks", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 3);
  const q = j.practice[3],
    raw =
      "Sludge and effluent both need anaerobic treatment; clear water must be potable.";
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
        "wastewater-and-treatment"
      ].attempts[id].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await accessible(page);
  await shot(page, "written-branch-reference", info.project.name);
});
