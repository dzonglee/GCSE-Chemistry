import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { climateJourney as j } from "../src/content/journeys/climate-evidence";
import {
  climateRecords,
  climateFields,
  climateChoices,
  climateNumeric,
  type ClimateMode,
} from "../src/lib/climate";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/climate-evidence",
  dir = path.join(process.cwd(), "test-results/qa/climate-evidence");
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
  for (const [f, v] of Object.entries(climateRecords[record].expected)) {
    if (climateNumeric.includes(f))
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
async function proseShot(p: Page, name: string, device: string) {
  await accessible(p);
  const out = path.join(process.cwd(), "docs/qa/climate-prose");
  fs.mkdirSync(out, { recursive: true });
  await p.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    await document.fonts.ready;
    document.querySelectorAll("textarea").forEach((e) => {
      e.scrollTop = 0;
    });
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  await p.screenshot({
    path: path.join(out, `${device}-${name}.png`),
    fullPage: true,
    scale: "css",
  });
}
for (const mode of [
  "trend",
  "report",
  "range",
  "boundary",
  "equivalents",
  "comparison",
  "reduction",
] as ClimateMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) => q.model?.kind === "climate-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "climate-investigation") throw Error("Missing model");
    const root = page.locator(".climate-workbench"),
      original = await root.locator(".climate-original").innerText();
    await fill(root, m.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    if (mode === "comparison")
      await proseShot(page, "comparison", info.project.name);
    const f = climateFields[mode][0],
      wrong = climateNumeric.includes(f)
        ? "999"
        : climateChoices[f].find(
            (v) => v !== climateRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (climateNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".climate-original").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(climateRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of climateFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".climate-original").innerText()).toBe(original);
  });
test("all27 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Warm-up", exact: true }).click();
  await task(page, 1);
  await answer(page, j.warmup[1]);
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await expect(page.locator(".question-panel")).toContainText(
    "1000 g equals 1 kg.",
  );
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "right",
  );
  await proseShot(page, "mass-conversion", info.project.name);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".climate-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "climate-evidence"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if (q.id === "climate-v1-p-graph")
      await proseShot(page, "independent-graph", info.project.name);
    if ([2, 5, 10, 11, 17, 19, 21, 23, 25, 26].includes(i)) {
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
          ".climate-workbench,.assessment-review-criteria,.climate-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].climateGiven) {
        await expect(page.locator(".assessment-session")).not.toContainText(
          "ending minus starting",
        );
        await expect(page.locator(".assessment-session")).not.toContainText(
          "Apply the supplied methane factor",
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
        name: `5 of 5 correct`,
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
        for (const r of p.work["climate-evidence"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["climate-evidence"].run.submitted = Date.now() - delay - 1000;
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
test("source-substituted climate series preserves raw bytes and refuses replacement", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator('[data-field="start"]').fill("-0.2");
  await saved(page);
  const raw = await page.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k)!);
    for (const b of p.work["climate-evidence"].taskModels["climate-v1-g-trend"])
      b.record = "fluctuations";
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
test("wrong percentage uses the relevant recovery and returns to the retained answer", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(
    page,
    j.practice.findIndex((q) => q.id === "climate-v1-p-percent"),
  );
  await page.getByLabel("Your answer", { exact: true }).fill("150");
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".climate-workbench")).toHaveAttribute(
    "data-record",
    "bags",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "150",
  );
});
test("320px and390px opening offers a useful keyboard control inside664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="start"]');
    await expect(first).toBeVisible();
    const b = (await first.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(664);
    if (await first.inputValue()) await expect(first).toHaveValue("-0.2");
    await first.fill("");
    await first.focus();
    await first.press("-");
    await first.press("0");
    await first.press(".");
    await first.press("2");
    await expect(first).toHaveValue("-0.2");
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
test("malformed and outside-scale graph entries stay raw; original curve and scale remain fixed", async ({
  page,
}, info) => {
  await page.goto(route);
  const root = page.locator(".climate-workbench"),
    original = await root.locator('[data-original="series"]').getAttribute("d");
  await root.locator('[data-field="start"]').fill("1..2");
  await root.locator('[data-field="end"]').fill("999");
  await root.locator('[data-field="change"]').fill("-999");
  await root.locator('[data-field="direction"]').selectOption("down");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.getByLabel("Your graph reading")).toContainText(
    "not a readable number",
  );
  await expect(root.getByLabel("Your graph reading")).toContainText(
    "outside the supplied graph scale",
  );
  await expect(root.locator("[data-proposed]")).toHaveCount(0);
  expect(await root.locator('[data-original="series"]').getAttribute("d")).toBe(
    original,
  );
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="start"]')).toHaveValue("1..2");
  await expect(root.locator('[data-field="end"]')).toHaveValue("999");
  await accessible(page);
  await shot(page, "raw-wrong-graph", info.project.name);
});
test("independent graph interprets fractions/scientific notation consistently and retains a wrong endpoint", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(
    page,
    j.practice.findIndex((q) => q.id === "climate-v1-p-graph"),
  );
  const first = page.getByLabel("Starting anomaly / °C", { exact: true }),
    last = page.getByLabel("Ending anomaly / °C", { exact: true }),
    delta = page.getByLabel("Change in anomaly / °C", { exact: true });
  await first.fill("-0.6/2");
  await last.fill("5e-1");
  await delta.fill("1.6/2");
  await expect(page.locator("[data-proposed]")).toHaveCount(2);
  const marker = page.locator('[data-proposed="end"] path');
  const geometry = await marker.evaluate((e) => {
    const b = (e as SVGGraphicsElement).getBBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  });
  expect(geometry.x).toBeCloseTo(480, 6);
  expect(geometry.y).toBeCloseTo(100, 6);
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "right",
  );
  await accessible(page);
  await shot(page, "independent-correct-graph", info.project.name);
  await last.fill("999");
  await page.locator(".sample-check-answer").click();
  await expect(last).toHaveValue("999");
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Not yet",
  );
  await expect(page.getByLabel("Your graph reading")).toContainText(
    "outside the supplied graph scale",
  );
  await saved(page);
  await page.reload();
  await expect(last).toHaveValue("999");
  await accessible(page);
  await shot(page, "independent-wrong-graph", info.project.name);
});
test("graph keeps legible labels, pans to the proposed end and accepts arrow-key scrolling", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto(route);
  await page.locator('[data-field="end"]').fill("0.6");
  const pan = page.locator(".climate-pan");
  await expect
    .poll(() => pan.evaluate((e) => e.scrollLeft))
    .toBeGreaterThan(100);
  const fonts = await page
    .locator(".climate-pan text")
    .evaluateAll((es) =>
      es.map((e) => parseFloat(getComputedStyle(e).fontSize)),
    );
  expect(Math.min(...fonts)).toBeGreaterThanOrEqual(14);
  await pan.focus();
  const endOffset = await pan.evaluate((e) => e.scrollLeft);
  await pan.press("ArrowLeft");
  await expect
    .poll(() => pan.evaluate((e) => e.scrollLeft))
    .toBeLessThan(endOffset);
  await page.locator('[data-field="start"]').fill("-0.2");
  await expect.poll(() => pan.evaluate((e) => e.scrollLeft)).toBe(0);
  await accessible(page);
  await shot(page, "panned-start", info.project.name);
});
test("all17 records are reachable, scientifically checkable and tied to their task", async ({
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
      if (m?.kind !== "climate-investigation" || seen.has(m.record)) continue;
      const root = page.locator(".climate-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(climateRecords).sort());
});
test("written effects preserve a misconception and expose criteria/reference without awarding automatic marks", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const i = j.practice.findIndex((q) => q.id === "climate-v1-p-effects"),
    q = j.practice[i];
  await task(page, i);
  await expect(page.locator(".sample-reference")).toHaveCount(0);
  const raw =
    "Climate change makes ozone holes, and melting floating sea ice always directly raises sea level.";
  await page.getByLabel("Your explanation", { exact: true }).fill(raw);
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "not an automatic mark",
  );
  await expect(page.locator(".question-panel .feedback li")).toHaveText(
    q.rubric!,
  );
  await page.getByText("Compare a reference response", { exact: true }).click();
  await expect(page.locator(".sample-reference")).toContainText(q.answer);
  await saved(page);
  const result = await page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key)!).work["climate-evidence"].attempts[
        id
      ].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(raw);
  await accessible(page);
  await shot(page, "written-effects-reference", info.project.name);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(raw);
});
test("all seven activities at320px preserve readable whole table headings and reflow", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  for (let i = 0; i < j.guided.length; i++) {
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "climate-investigation") throw Error("Missing native model");
    await fill(page.locator(".climate-workbench"), m.record);
    await page.evaluate(() => document.fonts.ready);
    const split = await page
      .locator(".climate-table-wrap thead th")
      .evaluateAll((es) =>
        es.flatMap((e) => {
          const s = getComputedStyle(e),
            canvas = document.createElement("canvas"),
            c = canvas.getContext("2d")!;
          c.font = s.font;
          const available =
            e.clientWidth -
            parseFloat(s.paddingLeft) -
            parseFloat(s.paddingRight);
          return (e.textContent ?? "")
            .split(/\s+/)
            .filter((w) => c.measureText(w).width > available + 0.5)
            .map((w) => ({
              word: w,
              available,
              width: c.measureText(w).width,
            }));
        }),
      );
    expect(split, m.record).toEqual([]);
    await accessible(page);
    if (m.mode === "comparison")
      await shot(page, "narrow-service-comparison", info.project.name);
  }
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(
    page,
    j.practice.findIndex((q) => q.id === "climate-v1-p-service"),
  );
  const split = await page
    .locator(".climate-table-wrap thead th")
    .evaluateAll((es) =>
      es.flatMap((e) => {
        const s = getComputedStyle(e),
          canvas = document.createElement("canvas"),
          c = canvas.getContext("2d")!;
        c.font = s.font;
        const available =
          e.clientWidth -
          parseFloat(s.paddingLeft) -
          parseFloat(s.paddingRight);
        return (e.textContent ?? "")
          .split(/\s+/)
          .filter((w) => c.measureText(w).width > available + 0.5)
          .map((w) => ({
            word: w,
            available,
            width: c.measureText(w).width,
          }));
      }),
    );
  expect(split, "independent-service").toEqual([]);
  const answerWidths = await page
    .locator(".multipart-answer input")
    .evaluateAll((inputs) =>
      inputs.map((e) => e.getBoundingClientRect().width),
    );
  expect(answerWidths.length).toBe(3);
  for (const width of answerWidths) expect(width).toBeGreaterThanOrEqual(200);
  await accessible(page);
  await shot(page, "narrow-independent-service", info.project.name);
});
test("unreadable independent constructions preserve original drafts and recover through an explicit answer clear", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const i = j.practice.findIndex((q) => q.id === "climate-v1-p-graph"),
    q = j.practice[i];
  await task(page, i);
  await saved(page);
  for (const raw of [
    '{"start":2,"end":"0.5","change":"0.8"}',
    '{"start":"-0.3","unknown":"0.5"}',
    '["-0.3","0.5"]',
    "{",
  ]) {
    await page.evaluate(
      ({ key, id, raw }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        p.work["climate-evidence"].drafts[id] = raw;
        localStorage.setItem(key, JSON.stringify(p));
        localStorage.setItem("unrelated-study-record", "retain");
      },
      { key: STORAGE_KEY, id: q.id, raw },
    );
    await page.reload();
    await expect(
      page.getByText("Saved constructed answer is unreadable.", {
        exact: false,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work["climate-evidence"]
            .drafts[id],
        { key: STORAGE_KEY, id: q.id },
      ),
    ).toBe(raw);
    await expect(
      page.getByLabel("Starting anomaly / °C", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Clear answer", exact: true })
      .click();
    for (const p of q.parts!)
      await expect(page.getByLabel(p.label, { exact: true })).toHaveValue("");
    await saved(page);
    expect(
      await page.evaluate(() => localStorage.getItem("unrelated-study-record")),
    ).toBe("retain");
  }
  expect(errors).toEqual([]);
  await accessible(page);
});
