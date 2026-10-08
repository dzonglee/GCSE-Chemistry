import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { instrumentalJourney as j } from "../src/content/journeys/instrumental-analysis";
import {
  instrumentalRecords,
  instrumentalFields,
  instrumentalChoices,
  metalKeys,
  type InstrumentalMode,
} from "../src/lib/instrumental";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/instrumental-analysis",
  dir = path.join(process.cwd(), "test-results/qa/instrumental-analysis");
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
  for (const [f, v] of Object.entries(instrumentalRecords[record].expected)) {
    if (f === "ions") {
      if (v === "unresolved")
        await root
          .getByRole("button", { name: "Not uniquely identified", exact: true })
          .click();
      else
        for (const k of metalKeys)
          await root
            .locator(`[data-ion="${k}"]`)
            .setChecked(v.split(",").includes(k));
    } else if (f === "concentration")
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
    scrollTo(0, 0);
    await document.fonts.ready;
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
  "path",
  "spectrum",
  "calibration",
  "quality",
  "advantage",
] as InstrumentalMode[])
  test(`${mode}: correct science and wrong proposal retain original evidence, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "instrumental-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "instrumental-investigation") throw Error("Missing model");
    const root = page.locator(".instrumental-workbench");
    const original = await root.locator(".instrumental-original").innerText(),
      unknown = (await root.locator('[data-spectrum-row="unknown"]').count())
        ? await root
            .locator('[data-spectrum-row="unknown"]')
            .evaluate((e) => e.outerHTML)
        : null;
    await fill(root, m.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".instrumental-feedback")).toHaveClass(
      /instrumental-correct/,
    );
    const f = instrumentalFields[mode][0],
      v =
        f === "ions"
          ? "li"
          : f === "concentration"
            ? "99"
            : instrumentalChoices[f].find(
                (v) => v !== instrumentalRecords[m.record].expected[f],
              )!;
    if (f === "ions") await root.locator('[data-ion="li"]').check();
    else if (f === "concentration")
      await root.locator('[data-field="concentration"]').fill(v);
    else await root.locator(`[data-field="${f}"]`).selectOption(v);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".instrumental-feedback")).toHaveClass(
      /instrumental-reconsider/,
    );
    expect(await root.locator(".instrumental-original").innerText()).toBe(
      original,
    );
    if (unknown)
      expect(
        await root
          .locator('[data-spectrum-row="unknown"]')
          .evaluate((e) => e.outerHTML),
      ).toBe(unknown);
    await saved(page);
    await page.reload();
    if (f === "ions") {
      await expect(root.locator('[data-ion="li"]')).toBeChecked();
      await expect(root.locator('[data-ion="na"]')).toBeChecked();
    } else await expect(root.locator(`[data-field="${f}"]`)).toHaveValue(v);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await accessible(page);
    await shot(page, `native-${mode}`, info.project.name);
    await root
      .getByRole("button", { name: "Undo last change", exact: true })
      .click();
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".instrumental-feedback")).toHaveClass(
      /instrumental-correct/,
    );
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    await saved(page);
    await page.reload();
    for (const f of instrumentalFields[mode].filter((f) => f !== "ions"))
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    if (mode === "spectrum")
      for (const k of metalKeys)
        await expect(root.locator(`[data-ion="${k}"]`)).not.toBeChecked();
  });
test("opening at 320 pixels exposes a useful control, keeps full selections and supports keyboard", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  const root = page.locator(".instrumental-workbench"),
    f = root.locator('[data-field="sample"]');
  const box = await f.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await f.focus();
  await f.press("ArrowDown");
  await f.press("Enter");
  await expect(f).toHaveValue("flame");
  await expect(root.locator(".instrumental-selection").first()).toHaveText(
    "Put the solution sample into a flame",
  );
  await accessible(page);
  await shot(page, "opening-320", info.project.name);
});
test("mixture overlays, table reading and keyboard toggles preserve the actual original and export a wrong set", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".instrumental-workbench");
  const original = await root
    .locator('[data-spectrum-row="unknown"]')
    .evaluate((e) => e.outerHTML);
  const li = root.locator('[data-ion="li"]');
  await li.focus();
  await li.press("Space");
  await root.locator('[data-ion="cu"]').check();
  await root.locator('[data-field="basis"]').selectOption("positions");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".instrumental-feedback")).toHaveClass(
    /instrumental-reconsider/,
  );
  expect(
    await root
      .locator('[data-spectrum-row="unknown"]')
      .evaluate((e) => e.outerHTML),
  ).toBe(original);
  expect(
    await root
      .locator('[data-spectrum-row="proposal"] line')
      .evaluateAll((es) =>
        es.map((e) => Number(e.getAttribute("data-position"))),
      ),
  ).toEqual([1, 4, 7, 10, 12]);
  const pan = root.getByRole("group", {
    name: "Aligned reference spectra; scroll horizontally with arrows or touch",
  });
  const spectrum = root.locator('svg[data-instrumental-svg="spectrum"]');
  await page.evaluate(() => document.fonts.ready);
  expect(
    await spectrum.evaluate((svg) => {
      const box = (svg as SVGSVGElement).viewBox.baseVal;
      return (
        [...svg.querySelectorAll("g[data-spectrum-row] > text")].every(
          (label) => {
            const bounds = (label as SVGGraphicsElement).getBBox();
            return bounds.x + bounds.width < box.x - 2;
          },
        ) &&
        [...svg.querySelectorAll("line[data-position]")].every(
          (line) =>
            Number(line.getAttribute("x1")) - 1.5 > box.x + 4 &&
            Number(line.getAttribute("x1")) + 1.5 < box.x + box.width - 4,
        )
      );
    }),
  ).toBe(true);
  await pan.focus();
  await pan.press("ArrowRight");
  for (const label of [
    "Li⁺",
    "Na⁺",
    "K⁺",
    "Ca²⁺",
    "Cu²⁺",
    "Unknown",
    "Your set",
  ])
    await expect(
      root
        .locator(".instrumental-row-labels")
        .getByText(label, { exact: true }),
    ).toBeVisible();
  if (info.project.name === "mobile")
    expect(await pan.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  await accessible(page);
  await shot(page, "mixture-wrong-overlay", info.project.name);
  const downloadPromise = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download comparison SVG", exact: true })
    .click();
  const download = await downloadPromise;
  fs.mkdirSync(dir, { recursive: true });
  await download.saveAs(
    path.join(dir, `${info.project.name}-mixture-wrong.svg`),
  );
  await saved(page);
  const before = await page.evaluate(
    (k) => localStorage.getItem(k),
    STORAGE_KEY,
  );
  await root
    .getByRole("button", { name: "Position table", exact: true })
    .click();
  await expect(root.locator('[data-spectrum-row="unknown"]')).toContainText(
    "1, 2, 5, 6, 8, 9",
  );
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(
    before,
  );
  await accessible(page);
  await shot(page, "mixture-table", info.project.name);
});
test("concentration marker responds to pointer and buttons, saves invalid entry and exports actual wrong geometry", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  const root = page.locator(".instrumental-workbench"),
    svg = root.locator('[data-instrumental-svg="calibration"]'),
    input = root.locator('[data-field="concentration"]');
  await input.fill("1..2");
  await saved(page);
  await page.reload();
  await expect(input).toHaveValue("1..2");
  await expect(root.locator("[data-marker-description]")).toContainText(
    "retained as entered",
  );
  await svg.scrollIntoViewIfNeeded();
  const box = (await svg.boundingBox())!;
  await svg.click({
    position: {
      x: ((48 + (4 / 6) * 234) / 310) * box.width,
      y: (100 / 320) * box.height,
    },
  });
  await expect(input).toHaveValue("4");
  await root.locator('[data-field="claim"]').selectOption("calibrated");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".instrumental-feedback")).toHaveClass(
    /instrumental-correct/,
  );
  await root
    .getByRole("button", { name: "← Lower by 0.5", exact: true })
    .click();
  await expect(input).toHaveValue("3.5");
  await expect(root.locator("[data-student-marker]")).toHaveAttribute(
    "data-student-marker",
    "3.5",
  );
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".instrumental-feedback")).toHaveClass(
    /instrumental-reconsider/,
  );
  await accessible(page);
  await shot(page, "concentration-wrong-marker", info.project.name);
  const pending = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download comparison SVG", exact: true })
    .click();
  const download = await pending;
  fs.mkdirSync(dir, { recursive: true });
  await download.saveAs(
    path.join(dir, `${info.project.name}-concentration-wrong.svg`),
  );
});
test("a partial shared line remains unresolved without inventing absence evidence", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  const root = page.locator(".instrumental-workbench");
  await root.locator('[data-ion="na"]').check();
  await root.locator('[data-field="basis"]').selectOption("positions");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".instrumental-feedback")).toHaveClass(
    /instrumental-reconsider/,
  );
  await expect(root.locator(".instrumental-feedback")).toContainText(
    "does not uniquely identify",
  );
  await root
    .getByRole("button", { name: "Not uniquely identified", exact: true })
    .click();
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".instrumental-feedback")).toHaveClass(
    /instrumental-correct/,
  );
  await expect(root.locator('[data-ion="na"]')).not.toBeChecked();
  expect(await root.locator('[data-spectrum-row="unknown"] line').count()).toBe(
    1,
  );
  await accessible(page);
  await shot(page, "shared-line-uncertainty", info.project.name);
});
test("all 24 practice responses keep models hidden, actual data supplied and written feedback honest", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".instrumental-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "instrumental-analysis"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if (i === 3 || i === 9 || i === 20 || i === 22) {
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
          ".instrumental-workbench,.assessment-review-criteria,.instrumental-feedback",
        ),
      ).toHaveCount(0);
      if (i === 4) {
        await accessible(page);
        await shot(page, `sealed-calibration-${f}`, info.project.name);
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
        name: `${f ? 7 : 6} of ${f ? 7 : 6} correct`,
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
        for (const r of p.work["instrumental-analysis"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["instrumental-analysis"].run.submitted =
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
        name: `${f ? 4 : 3} of ${f ? 4 : 3} correct`,
        exact: true,
      }),
    ).toBeVisible();
  }
});
test("source-substituted saved model is preserved raw and does not silently become a new original", async ({
  page,
}) => {
  await page.goto(route);
  await task(page, 1);
  await page.locator('[data-ion="na"]').check();
  await saved(page);
  const raw = await page.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k)!);
    const id = Object.keys(p.work["instrumental-analysis"].taskModels)[0];
    for (const b of p.work["instrumental-analysis"].taskModels[id])
      b.record = "s-k";
    const raw = JSON.stringify(p);
    localStorage.setItem(k, raw);
    return raw;
  }, STORAGE_KEY);
  await page.reload();
  await expect(
    page.getByText("Saved data is unreadable.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(
    raw,
  );
});
test("wrong practice offers its concept-specific recovery and returns to the retained response", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 17);
  const q = j.practice[17],
    wrong = Object.keys(q.misconceptions!)[0];
  await page.getByRole("radio", { name: wrong, exact: true }).check();
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".sample-task-panel h2")).toHaveText(
    "Judge closeness to a reference",
  );
  await expect(page.locator(".instrumental-workbench")).toHaveAttribute(
    "data-instrumental-record",
    "a-accurate",
  );
  await page
    .getByRole("button", {
      name: "Return to your task →",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
});
