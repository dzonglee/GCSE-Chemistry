import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { materialsJourney as j } from "../src/content/journeys/materials-and-corrosion";
import {
  materialsRecords,
  materialsFields,
  materialsChoices,
  materialsNumeric,
  type MaterialsMode,
} from "../src/lib/materials";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/materials-and-corrosion",
  dir = path.join(process.cwd(), "test-results/qa/materials-and-corrosion");
async function saved(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function openSuppliedSources(p: Page) {
  await p.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
  for (const source of await p.locator(".materials-source").all()) {
    if ((await source.getAttribute("open")) === null)
      await source.locator(":scope > summary").click();
    await expect(source.locator(".materials-given")).toBeVisible();
  }
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
  for (const [f, v] of Object.entries(materialsRecords[record].expected)) {
    if (materialsNumeric.includes(f))
      await root.locator(`[data-field="${f}"]`).fill(v);
    else await root.locator(`[data-field="${f}"]`).selectOption(v);
  }
}
async function answer(p: Page, q: Question) {
  if (q.parts) {
    for (const part of q.parts)
      await p.getByLabel(part.label, { exact: true }).fill(String(part.answer));
  } else if (q.rubric)
    await p
      .getByLabel(q.shortWritten ? "Your answer" : "Your explanation", {
        exact: true,
      })
      .fill(q.answer);
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
  "rust",
  "protection",
  "composition",
  "alloy",
  "polymer",
  "manufacture",
  "composite",
  "selection",
] as MaterialsMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "materials-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "materials-investigation") throw Error("Missing model");
    await openSuppliedSources(page);
    const root = page.locator(".materials-workbench"),
      original = await root.locator(".materials-context").innerText();
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
    const f = materialsFields[mode][0],
      wrong = materialsNumeric.includes(f)
        ? "999"
        : materialsChoices[f].find(
            (v) => v !== materialsRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (materialsNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".materials-context").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await openSuppliedSources(page);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(materialsRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of materialsFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".materials-context").innerText()).toBe(original);
  });
test("all38 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".materials-workbench")).toHaveCount(0);
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
          "materials-and-corrosion"
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
test("both original eight-question forms and delayed four-question forms seal marking and retain written criteria", async ({
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
          ".materials-workbench,.assessment-review-criteria,.materials-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].materialsGiven) {
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
        name: `${8 - j.checkForms[f].filter((q) => q.rubric).length} of ${8 - j.checkForms[f].filter((q) => q.rubric).length} correct`,
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
        for (const r of p.work["materials-and-corrosion"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["materials-and-corrosion"].run.submitted =
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
test("all25 records are reachable, checkable without changing the sources and tied to their task", async ({
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
      await openSuppliedSources(page);
      const m = j[stage][i].model;
      if (m?.kind !== "materials-investigation" || seen.has(m.record)) continue;
      const root = page.locator(".materials-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(materialsRecords).sort());
});
test("320px and390px opening gives a useful keyboard control within664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="oxygen"]');
    const box = (await first.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(664);
    await first.selectOption("");
    await first.focus();
    await first.press("ArrowDown");
    await expect(first).toHaveValue("yes");
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
test("malformed native alloy entries remain exactly typed after checking and reload", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".materials-workbench");
  await fill(root, "gold18");
  for (const raw of ["1..2", "1e3", "5 g"]) {
    await root.locator('[data-field="baseMass"]').fill(raw);
    await expect(root.locator('[data-field="baseMass"]')).toHaveValue(raw);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(root.locator(".materials-proposal")).toContainText(raw);
    await saved(page);
    await page.reload();
    await expect(root.locator('[data-field="baseMass"]')).toHaveValue(raw);
    await accessible(page);
    await shot(
      page,
      "raw-composition-" + raw.replace(/[^a-z0-9]/gi, "_"),
      info.project.name,
    );
  }
});

test("independent wrong gold calculation preserves the given and returns to its specific refresher with support faded", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 8);
  const q = j.practice[8];
  await answer(page, q);
  await page.getByLabel("Gold / g", { exact: true }).fill("1000");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit",
  );
  await expect(
    page.locator(".materials-workbench,.materials-proposal"),
  ).toHaveCount(0);
  await expect(page.locator(".materials-given")).toContainText("16 g");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Gold / g", { exact: true })).toHaveValue(
    "1000",
  );
  await accessible(page);
  await shot(page, "independent-wrong-gold", info.project.name);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".materials-workbench")).toHaveAttribute(
    "data-record",
    "gold18",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Gold / g", { exact: true })).toHaveValue(
    "1000",
  );
});
test("an incorrect corrosion explanation is retained with a gated manual reference and no automatic marks", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 0);
  const q = j.practice[0],
    raw =
      "Dry nitrogen causes rust. Scratched paint protects forever and zinc never reacts.";
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
        "materials-and-corrosion"
      ].attempts[id].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await accessible(page);
  await shot(page, "written-rust-reference", info.project.name);
});
test("fixed chain and atom diagrams remain unchanged through wrong predictions at narrow widths", async ({
  page,
}, info) => {
  await page.goto(route);
  for (const [i, record] of [
    [3, "mixed"],
    [4, "set"],
  ] as const) {
    await task(page, i);
    await openSuppliedSources(page);
    const root = page.locator(".materials-workbench"),
      graph = root.locator(".materials-structure");
    await expect(root).toHaveAttribute("data-record", record);
    const original = await graph.innerHTML();
    await fill(root, record);
    const field = i === 3 ? "sliding" : "reason";
    await root
      .locator(`[data-field="${field}"]`)
      .selectOption(i === 3 ? "easy" : "backbone");
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    expect(await graph.innerHTML()).toBe(original);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 664 });
      await openSuppliedSources(page);
      await accessible(page);
      const box = (await graph.locator("svg").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    await shot(page, "fixed-structure-" + record, info.project.name);
  }
});

test("every rendered crosslink and branch actually joins its supplied polymer chain", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const k = j.practice.findIndex((q) => q.options);
  await task(page, k);
  await page
    .getByRole("radio", {
      name: j.practice[k].options!.find((o) => o !== j.practice[k].answer)!,
      exact: true,
    })
    .check();
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  for (const record of ["set", "ld", "hd", "soft"]) {
    const i = j.refresher.findIndex(
      (q) =>
        q.model?.kind === "materials-investigation" &&
        q.model.record === record,
    );
    await task(page, i);
    await openSuppliedSources(page);
    const root = page.locator(".materials-workbench");
    await fill(root, record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    const geometry = await root.locator("svg").evaluate((svg) => {
      const paths = [
        ...svg.querySelectorAll("g>path:first-child"),
      ] as SVGPathElement[];
      function distance(x: number, y: number) {
        return Math.min(
          ...paths.map((p) => {
            const length = p.getTotalLength();
            let best = Infinity;
            for (let k = 0; k <= 2000; k++) {
              const q = p.getPointAtLength((length * k) / 2000);
              best = Math.min(best, Math.hypot(q.x - x, q.y - y));
            }
            return best;
          }),
        );
      }
      const lines = [...svg.querySelectorAll(":scope>line")].map((e) => ({
        x1: Number(e.getAttribute("x1")),
        x2: Number(e.getAttribute("x2")),
        y1: Number(e.getAttribute("y1")),
        y2: Number(e.getAttribute("y2")),
      }));
      const branches = [
        ...svg.querySelectorAll("g>path:not(:first-child)"),
      ] as SVGPathElement[];
      return {
        chains: paths.length,
        links: lines.length,
        branches: branches.length,
        freeEnds: branches.map((p) => {
          const q = p.getPointAtLength(p.getTotalLength());
          return distance(q.x, q.y);
        }),
        distances: [
          ...lines.flatMap((e) => [distance(e.x1, e.y1), distance(e.x2, e.y2)]),
          ...branches.map((p) => {
            const q = p.getPointAtLength(0);
            return distance(q.x, q.y);
          }),
        ],
      };
    });
    expect(geometry.chains).toBe(3);
    expect(geometry.links).toBe(record === "set" ? 6 : 0);
    expect(geometry.branches).toBe(record === "ld" ? 9 : 0);
    for (const d of geometry.freeEnds) expect(d).toBeGreaterThan(8);
    for (const d of geometry.distances) expect(d).toBeLessThanOrEqual(0.3);
    await accessible(page);
    await shot(page, "connected-chains-" + record, info.project.name);
    await root.screenshot({
      path: path.join(dir, `${info.project.name}-connected-${record}.png`),
      scale: "css",
      style: "header { visibility:hidden !important; }",
    });
  }
});

test("every native choice label fits the actual320px and390px control", async ({
  page,
}) => {
  await page.goto(route);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    for (let i = 0; i < j.guided.length; i++) {
      await task(page, i);
      await page.evaluate(() => document.fonts.ready);
      const controls = await page
        .locator(".materials-workbench select")
        .evaluateAll((selects) =>
          (selects as HTMLSelectElement[]).map((e) => {
            const style = getComputedStyle(e),
              canvas = document.createElement("canvas"),
              ctx = canvas.getContext("2d")!;
            ctx.font = style.font;
            const available =
              e.clientWidth -
              parseFloat(style.paddingLeft) -
              parseFloat(style.paddingRight) -
              20;
            return {
              label: e.labels?.[0]?.textContent,
              available,
              tooLong: [...e.options]
                .filter((o) => ctx.measureText(o.text).width > available)
                .map((o) => ({
                  text: o.text,
                  width: ctx.measureText(o.text).width,
                })),
            };
          }),
        );
      for (const c of controls)
        expect(c.tooLong, JSON.stringify({ width, i, ...c })).toEqual([]);
    }
  }
});
test("three worked numerical recoveries teach the right operation and retain the original wrong work", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (const s of ["p-rustPercent", "p-gain", "p-panel"]) {
    const i = j.practice.findIndex((q) => q.id === "materials-v1-" + s),
      q = j.practice[i];
    await task(page, i);
    await answer(page, q);
    if (q.parts)
      await page.getByLabel(q.parts[0].label, { exact: true }).fill("999");
    else await page.getByLabel("Your answer", { exact: true }).fill("999");
    await page.locator(".sample-check-answer").click();
    await page
      .getByRole("button", { name: "Revisit the key idea", exact: true })
      .click();
    const ref = j.refresher.find((r) => r.id === q.followUp)!;
    await expect(page.locator(".materials-workbench")).toHaveCount(0);
    await expect(page.locator(".materials-given")).toContainText(
      s === "p-panel"
        ? "mass = density × volume"
        : s === "p-gain"
          ? "Mass gain = final − initial"
          : "gain ÷ initial mass × 100",
    );
    await page.getByLabel("Your answer", { exact: true }).fill(ref.answer);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      "right",
    );
    await accessible(page);
    await shot(page, "worked-recovery-" + s, info.project.name);
    await page
      .getByRole("button", { name: "Return to your task →", exact: true })
      .click();
    if (q.parts)
      await expect(
        page.getByLabel(q.parts[0].label, { exact: true }),
      ).toHaveValue("999");
    else
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        "999",
      );
  }
});
