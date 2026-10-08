import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { waterJourney as j } from "../src/content/journeys/potable-water";
import {
  waterRecords,
  waterFields,
  waterChoices,
  waterNumeric,
  type WaterMode,
} from "../src/lib/water";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/potable-water",
  dir = path.join(process.cwd(), "test-results/qa/potable-water");
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
  for (const [f, v] of Object.entries(waterRecords[record].expected)) {
    if (waterNumeric.includes(f))
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
  "quality",
  "treatment",
  "residue",
  "distil",
  "membrane",
  "resources",
  "repeat",
] as WaterMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) => q.model?.kind === "water-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "water-investigation") throw Error("Missing model");
    const root = page.locator(".water-workbench"),
      original = await root.locator(".water-context").innerText();
    await fill(root, m.record);

    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    if (mode === "distil")
      await expect(
        root.getByRole("button", { name: "Download 3D asset", exact: true }),
      ).toBeEnabled();
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    const f = waterFields[mode][0],
      wrong = waterNumeric.includes(f)
        ? "999"
        : waterChoices[f].find(
            (v) => v !== waterRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (waterNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".water-context").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(waterRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of waterFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".water-context").innerText()).toBe(original);
  });
test("all27 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".water-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["potable-water"].attempts[
          id
        ].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if ([1, 2, 5, 10, 11, 17, 19, 21, 23, 25, 26].includes(i)) {
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
          ".water-workbench,.assessment-review-criteria,.water-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].waterGiven) {
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
        for (const r of p.work["potable-water"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["potable-water"].run.submitted = Date.now() - delay - 1000;
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
test("all26 records are reachable, scientifically checkable and tied to their task", async ({
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
      if (m?.kind !== "water-investigation" || seen.has(m.record)) continue;
      const root = page.locator(".water-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(waterRecords).sort());
});
test("320px and390px opening gives a useful keyboard control within664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="potable"]');
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
test("malformed native residue remains raw after reload rather than becoming zero", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".water-workbench");
  await fill(root, "dish10");
  await root.locator('[data-field="solidMass"]').fill("1..2");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator(".water-proposal")).toContainText("1..2");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="solidMass"]')).toHaveValue("1..2");
  await accessible(page);
  await shot(page, "raw-residue", info.project.name);
});
test("independent wrong residue preserves the given and returns to its specific refresher with support faded", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 5);
  const q = j.practice[5];
  await answer(page, q);
  await page
    .getByLabel("Concentration / g per dm³", { exact: true })
    .fill("600");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit",
  );
  await expect(page.locator(".water-workbench,.water-proposal")).toHaveCount(0);
  await expect(page.locator(".water-original")).toContainText("27.35");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Concentration / g per dm³", { exact: true }),
  ).toHaveValue("600");
  await accessible(page);
  await shot(page, "independent-wrong-residue", info.project.name);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".water-workbench")).toHaveAttribute(
    "data-record",
    "dish25",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByLabel("Concentration / g per dm³", { exact: true }),
  ).toHaveValue("600");
});
test("a written practical misconception is retained with a gated manual reference and no automatic marks", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 9);
  const q = j.practice[9],
    raw =
      "pH7 proves every sample is safe; weigh the hot dish including its original mass.";
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
      JSON.parse(localStorage.getItem(key)!).work["potable-water"].attempts[
        id
      ].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await accessible(page);
  await shot(page, "written-practical-reference", info.project.name);
});
test("actual cold and uncooled GLBs preserve the selected bath, camera independence and finite geometry", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const root = page.locator(".water-workbench");
  await fill(root, "cold");
  for (const cooling of ["cold", "warm"]) {
    await root.locator('[data-field="cooling"]').selectOption(cooling);
    const downloadButton = root.getByRole("button", {
      name: "Download 3D asset",
      exact: true,
    });
    await expect(downloadButton).toBeEnabled();
    await saved(page);
    const before = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    const host = root.locator(".water-canvas");
    await host.focus();
    const yaw = Number(await host.getAttribute("data-yaw"));
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => Number(await host.getAttribute("data-yaw")))
      .toBeCloseTo(yaw + 0.25);
    await root.getByRole("button", { name: "Reset view", exact: true }).click();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
    ).toBe(before);
    const pending = page.waitForEvent("download");
    await downloadButton.click();
    const d = await pending;
    const output = path.join(dir, `${info.project.name}-${cooling}.glb`);
    await d.saveAs(output);
    const b = fs.readFileSync(output);
    expect(b.readUInt32LE(0)).toBe(0x46546c67);
    expect(b.readUInt32LE(8)).toBe(b.length);
    const doc = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
    const exported = doc.nodes.find(
      (n: { name: string }) => n.name === "Simple distillation apparatus",
    );
    expect(exported.extras.cooling).toBe(cooling);
    expect(exported.extras).not.toHaveProperty("expected");
    expect(
      doc.nodes.some((n: { name: string }) => n.name === "Cold bath water"),
    ).toBe(cooling === "cold");
    await accessible(page);
    await shot(page, "actual-3d-" + cooling, info.project.name);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(
      cooling === "cold" ? /good/ : /bad/,
    );
  }
});
test("unavailable WebGL preserves phase-path alternative, checking and retained wrong choices", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto(route);
  await task(page, 3);
  const root = page.locator(".water-workbench");
  await fill(root, "cold");
  await root.locator('[data-field="heating"]').selectOption("decompose");
  await expect(root.locator(".water-scene")).toContainText("3D is unavailable");
  await expect(root.locator(".water-phase")).toContainText(
    "hydrogen and oxygen",
  );
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[data-field="heating"]')).toHaveValue("evaporate");
  await accessible(page);
  await shot(page, "fallback-phase-path", info.project.name);
});
