import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { separationJourney as j } from "../src/content/journeys/separation-practical";
import {
  separationRecords,
  separationFields,
  separationChoices,
  type SeparationMode,
} from "../src/lib/separation-investigation";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/separation-practical",
  dir = path.join(process.cwd(), "test-results/qa/separation-practical");
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
  for (const [f, v] of Object.entries(separationRecords[record].expected)) {
    if (["net", "percent"].includes(f))
      await root.locator(`[data-field="${f}"]`).fill(v);
    else await root.locator(`[data-field="${f}"]`).selectOption(v);
  }
}
async function answer(p: Page, q: Question) {
  if (q.rubric)
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
  "sequence",
  "fractions",
  "recovery",
  "setup",
  "comparison",
  "purity",
] as SeparationMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "separation-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "separation-investigation") throw Error("Missing model");
    const root = page.locator(".separation-workbench"),
      original = await root.locator(".separation-original").innerText();
    await fill(root, m.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    const f = separationFields[mode][0],
      wrong = ["net", "percent"].includes(f)
        ? "999"
        : separationChoices[f].find(
            (v) => v !== separationRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (["net", "percent"].includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".separation-original").innerText()).toBe(
      original,
    );
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(separationRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of separationFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".separation-original").innerText()).toBe(
      original,
    );
  });
test("apparent recovery retains >100% and malformed input rather than repairing the evidence", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  const root = page.locator(".separation-workbench"),
    input = root.locator('[data-field="percent"]');
  await fill(root, "wet-recovery");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toContainText("115%");
  await expect(root.locator(".feedback")).toHaveClass(/good/);
  await shot(page, "wet-recovery", info.project.name);
  await input.fill("1..2");
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("1..2");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(input).toHaveValue("1..2");
  await input.fill("-3");
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("-3");
});
test("proposed origin actually moves above and below the fixed solvent; keyboard line choices retain faults", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  const root = page.locator(".separation-workbench"),
    level = root.locator('[data-field="level"]');
  await level.selectOption("submerged");
  await root.locator('[data-field="line"]').selectOption("ink");
  await root.locator('[data-field="front"]').selectOption("afterDrying");
  await expect(
    root.locator('[data-proposed-origin="submerged"] circle'),
  ).toHaveAttribute("cy", "195");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await accessible(page);
  await shot(page, "submerged-origin", info.project.name);
  await level.focus();
  await level.press("ArrowUp");
  await expect(level).toHaveValue("above");
  await expect(
    root.locator('[data-proposed-origin="above"] circle'),
  ).toHaveAttribute("cy", "145");
  await expect(root.locator('[data-field="line"]')).toHaveValue("ink");
  await expect(root.locator(".separation-diagram-key")).toBeVisible();
  expect(
    await root
      .locator(".separation-diagram-key")
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  ).toBeGreaterThanOrEqual(16);
});
test("all24 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".separation-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "separation-practical"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if ([7, 14, 19, 20, 21, 23].includes(i)) {
      await accessible(page);
      await shot(page, "practice-" + i, info.project.name);
    }
  }
});
test("both reserved eight-question forms and delayed four-question forms seal marking and retain written criteria", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < 2; f++) {
    for (let i = 0; i < 8; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.checkForms[f][i]);
      await expect(
        page.locator(
          ".separation-workbench,.assessment-review-criteria,.separation-feedback",
        ),
      ).toHaveCount(0);
      if (i === 4) {
        await accessible(page);
        await shot(page, `sealed-rf-${f}`, info.project.name);
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
        name: `6 of 6 correct`,
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
        for (const r of p.work["separation-practical"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["separation-practical"].run.submitted =
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
    for (let i = 0; i < 4; i++) {
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
        name: `3 of 3 correct`,
        exact: true,
      }),
    ).toBeVisible();
  }
});
test("source-substituted saved sequence preserves raw bytes and refuses silent replacement", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator('[data-field="first"]').selectOption("dissolve");
  await saved(page);
  const raw = await page.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k)!);
    const id = Object.keys(p.work["separation-practical"].taskModels)[0];
    for (const b of p.work["separation-practical"].taskModels[id])
      b.record = "sand-route";
    const raw = JSON.stringify(p);
    localStorage.setItem(k, raw);
    return raw;
  }, STORAGE_KEY);
  await page.reload();
  await expect(
    page.getByText("Saved data is unreadable.", { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(
    raw,
  );
});
test("wrong target gets its own refresher and returns to the retained choice", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 0);
  const q = j.practice[0],
    wrong = Object.keys(q.misconceptions!)[0];
  await page.getByRole("radio", { name: wrong, exact: true }).check();
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".separation-workbench")).toHaveAttribute(
    "data-separation-record",
    "sand-route",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
});
test("320px and390px openings offer a useful control without document overflow", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="first"]');
    await expect(first).toBeVisible();
    const b = (await first.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(664);
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
