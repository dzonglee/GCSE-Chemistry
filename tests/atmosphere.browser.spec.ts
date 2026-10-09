import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { atmosphereJourney as j } from "../src/content/journeys/early-atmosphere";
import {
  atmosphereRecords,
  atmosphereFields,
  atmosphereChoices,
  atmosphereNumeric,
  type AtmosphereMode,
} from "../src/lib/early-atmosphere";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/early-atmosphere",
  dir = path.join(process.cwd(), "test-results/qa/early-atmosphere");
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
  for (const [f, v] of Object.entries(atmosphereRecords[record].expected)) {
    if (atmosphereNumeric.includes(f))
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
  "composition",
  "sequence",
  "photosynthesis",
  "stores",
  "graph",
  "bar",
  "evidence",
] as AtmosphereMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "atmosphere-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "atmosphere-investigation") throw Error("Missing model");
    const root = page.locator(".atmosphere-workbench"),
      original = await root.locator(".atmosphere-original").innerText();
    await fill(root, m.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    const f = atmosphereFields[mode][0],
      wrong = atmosphereNumeric.includes(f)
        ? "999"
        : atmosphereChoices[f].find(
            (v) => v !== atmosphereRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (atmosphereNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".atmosphere-original").innerText()).toBe(
      original,
    );
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(atmosphereRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of atmosphereFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".atmosphere-original").innerText()).toBe(
      original,
    );
  });
test("all25 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".atmosphere-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "early-atmosphere"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if ([6, 14, 16, 19, 22, 23].includes(i)) {
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
          ".atmosphere-workbench,.assessment-review-criteria,.atmosphere-feedback",
        ),
      ).toHaveCount(0);
      if (i === 5) {
        await accessible(page);
        await shot(page, `sealed-bar-${f}`, info.project.name);
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
        for (const r of p.work["early-atmosphere"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["early-atmosphere"].run.submitted = Date.now() - delay - 1000;
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
test("source-substituted saved composition preserves raw bytes and refuses silent replacement", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator('[data-field="nitrogen"]').fill("78");
  await saved(page);
  const raw = await page.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k)!);
    const id = Object.keys(p.work["early-atmosphere"].taskModels)[0];
    for (const b of p.work["early-atmosphere"].taskModels[id])
      b.record = "precise";
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
test("wrong percentage gets its own refresher and returns to the retained number", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 0);
  await page.getByLabel("Your answer", { exact: true }).fill("21");
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".atmosphere-workbench")).toHaveAttribute(
    "data-atmosphere-record",
    "precise",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "21",
  );
});
test("320px and390px openings offer a useful control without document overflow", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="nitrogen"]');
    await expect(first).toBeVisible();
    const b = (await first.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(664);
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});

test("raw composition errors preserve the whole and do not silently renormalise", async ({
  page,
}, info) => {
  await page.goto(route);
  const root = page.locator(".atmosphere-workbench");
  await fill(root, "modern");
  await root.locator('[data-field="nitrogen"]').fill("80");
  await expect(root.locator(".atmosphere-composition")).toContainText("102%");
  await expect(root.locator(".gas0 span")).toHaveAttribute(
    "style",
    /width: 80%/,
  );
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await shot(page, "wrong-whole", info.project.name);
  for (const raw of ["1..2", "-3", "999"]) {
    await root.locator('[data-field="nitrogen"]').fill(raw);
    await saved(page);
    await page.reload();
    await expect(root.locator('[data-field="nitrogen"]')).toHaveValue(raw);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
  }
});
test("actual time marker moves on the descending axis while original curves stay fixed", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  const root = page.locator(".atmosphere-workbench"),
    age = root.locator('[data-field="age"]');
  const original = await root
    .locator("polyline")
    .evaluateAll((es) => es.map((e) => e.getAttribute("points")));
  await age.fill("1500");
  await expect(root.locator('[data-age-marker="1500"] line')).toHaveAttribute(
    "x1",
    "365",
  );
  await age.fill("1250");
  await expect(root.locator('[data-age-marker="1250"] line')).toHaveAttribute(
    "x1",
    "395",
  );
  expect(
    await root
      .locator("polyline")
      .evaluateAll((es) => es.map((e) => e.getAttribute("points"))),
  ).toEqual(original);
  await age.fill("4500");
  await expect(root.locator("[data-age-marker]")).toHaveCount(0);
  await expect(root.locator(".atmosphere-marker-note")).toContainText("4500");
  await expect(root.locator(".atmosphere-marker-note")).toContainText(
    "outside",
  );
  await age.fill("1250");
  await root.locator('[data-field="meaning"]').selectOption("since");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  const pan = root.locator(".atmosphere-pan").first();
  if (info.project.name === "mobile")
    await expect
      .poll(async () => {
        const bounds = await pan.boundingBox(),
          marker = await root
            .locator('[data-age-marker="1250"] line')
            .boundingBox();
        return (
          !!bounds &&
          !!marker &&
          marker.x >= bounds.x &&
          marker.x <= bounds.x + bounds.width
        );
      })
      .toBe(true);
  await pan.focus();
  await pan.press("ArrowRight");
  await page.waitForTimeout(100);
  if (info.project.name === "mobile")
    expect(await pan.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  else
    expect(await pan.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
      true,
    );
  expect(
    await root
      .locator("svg text")
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  await accessible(page);
  await shot(page, "graph-panned", info.project.name);
});
test("independent chart retains wrong labels and out-of-axis oxygen, and uses real bar geometry", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 19);
  const q = j.practice[19];
  await answer(page, q);
  const oxygen = page.locator('[data-oxygen-height="18"]'),
    fixed = page.locator('[data-supplied-bar="dioxide"]');
  await expect(oxygen).toHaveAttribute("y", "105");
  await expect(oxygen).toHaveAttribute("height", "165");
  const original = await fixed.getAttribute("y");
  for (const raw of ["36/2", "1.8e1"]) {
    await page.getByLabel("Your oxygen bar / %", { exact: true }).fill(raw);
    await expect(page.locator(`[data-oxygen-height="${raw}"]`)).toHaveAttribute(
      "y",
      "105",
    );
    await expect(page.locator(".atmosphere-bar figcaption")).toContainText(raw);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "right",
    );
  }

  await page.getByLabel("Second major tick / %", { exact: true }).fill("6");
  await page.getByLabel("Your oxygen bar / %", { exact: true }).fill("999");
  await expect(page.locator("[data-oxygen-height]")).toHaveCount(0);
  await expect(page.locator(".atmosphere-bar figcaption")).toContainText("999");
  await expect(fixed).toHaveAttribute("y", original!);
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit",
  );
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your oxygen bar / %", { exact: true }),
  ).toHaveValue("999");
  await expect(
    page.getByLabel("Second major tick / %", { exact: true }),
  ).toHaveValue("6");
  const pan = page.locator(".atmosphere-bar .atmosphere-pan");
  await pan.focus();
  await pan.press("ArrowRight");
  await page.waitForTimeout(100);
  if (info.project.name === "mobile")
    expect(await pan.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  await expect(
    page.locator(".atmosphere-bar .atmosphere-scroll-note"),
  ).toBeVisible();
  await accessible(page);
  await shot(page, "independent-wrong-bar", info.project.name);
});
