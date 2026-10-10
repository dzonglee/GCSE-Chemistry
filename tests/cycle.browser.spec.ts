import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { cycleJourney as j } from "../src/content/journeys/carbon-cycle";
import {
  cycleRecords,
  cycleFields,
  cycleChoices,
  cycleNumeric,
  type CycleMode,
} from "../src/lib/cycle";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/carbon-cycle",
  dir = path.join(process.cwd(), "test-results/qa/carbon-cycle");
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
  for (const [f, v] of Object.entries(cycleRecords[record].expected)) {
    if (cycleNumeric.includes(f))
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
  "route",
  "ledger",
  "atom",
  "stores",
  "change",
  "pattern",
] as CycleMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "carbon-cycle-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "carbon-cycle-investigation") throw Error("Missing model");
    const root = page.locator(".cycle-workbench"),
      original = await root.locator(".cycle-context").innerText();
    await fill(root, m.record);

    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    const f = cycleFields[mode][0],
      wrong = cycleNumeric.includes(f)
        ? "999"
        : cycleChoices[f].find(
            (v) => v !== cycleRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (cycleNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".cycle-context").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(cycleRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of cycleFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".cycle-context").innerText()).toBe(original);
  });
test("all30 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".cycle-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["carbon-cycle"].attempts[
          id
        ].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if (["cycle-v1-p-forest", "cycle-v1-p-sameSeason"].includes(q.id)) {
      await accessible(page);
      await shot(page, "prose-" + q.id, info.project.name);
    }
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
          ".cycle-workbench,.assessment-review-criteria,.cycle-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].cycleGiven) {
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
        for (const r of p.work["carbon-cycle"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["carbon-cycle"].run.submitted = Date.now() - delay - 1000;
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
      if (m?.kind !== "carbon-cycle-investigation" || seen.has(m.record))
        continue;
      const root = page.locator(".cycle-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(cycleRecords).sort());
});
test("320px and390px opening gives a useful keyboard control within664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="from"]');
    const box = (await first.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(664);
    await first.selectOption("");
    await first.focus();
    await first.press("ArrowDown");
    await expect(first).toHaveValue("air");
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});

test("malformed inventory work remains raw and cannot silently become zero", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 1);
  const root = page.locator(".cycle-workbench");
  await fill(root, "atmosphere");
  await root.locator('[data-field="net"]').fill("1..2");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator(".cycle-proposal")).toContainText("1..2");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="net"]')).toHaveValue("1..2");
  await accessible(page);
  await shot(page, "raw-invalid-net", info.project.name);
});
test("wrong independent inventory stays faded and recovers to its specific source idea", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const i = j.practice.findIndex((q) => q.id === "cycle-v1-p-budget"),
    q = j.practice[i];
  await task(page, i);
  await answer(page, q);
  await page
    .getByLabel("Signed change / g of carbon", { exact: true })
    .fill("999");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit Signed change / g of carbon.",
  );
  await expect(page.locator(".cycle-workbench,.cycle-proposal")).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Signed change / g of carbon", { exact: true }),
  ).toHaveValue("999");
  await accessible(page);
  await shot(page, "independent-wrong-budget", info.project.name);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".cycle-workbench")).toHaveAttribute(
    "data-record",
    "atmosphere",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByLabel("Signed change / g of carbon", { exact: true }),
  ).toHaveValue("999");
});
test("a connected compost reference follows saved self-review while retaining a misconception without automatic marks", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const q = j.practice.find((q) => q.id === "cycle-v1-p-compost")!;
  await task(page, j.practice.indexOf(q));
  const raw =
    "The roots take every carbon atom from mineral ions; dead leaves instantly become coal.";
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
      JSON.parse(localStorage.getItem(key)!).work["carbon-cycle"].attempts[
        id
      ].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await accessible(page);
  await shot(page, "written-compost-reference", info.project.name);
});
test("fixed14px graph labels pan at320px; independent fractions/scientific entries place their actual values and outliers stay raw", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  await task(page, 5);
  const pan = page.locator(".cycle-pan");
  await pan.focus();
  await pan.press("ArrowRight");
  await expect.poll(() => pan.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  const sizes = await pan
    .locator("text")
    .evaluateAll((es) =>
      es.map((e) => parseFloat(getComputedStyle(e).fontSize)),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(14);
  await accessible(page);
  await shot(page, "panned-seasonal-graph", info.project.name);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const q = j.practice.find((q) => q.id === "cycle-v1-p-endpoints")!;
  await task(page, j.practice.indexOf(q));
  await page
    .getByLabel("First concentration / arbitrary units", { exact: true })
    .fill("400/2");
  await page
    .getByLabel("Last concentration / arbitrary units", { exact: true })
    .fill("2.16e2");
  await page
    .getByLabel("Signed endpoint change / arbitrary units", { exact: true })
    .fill("16");
  await expect(page.locator("[data-endpoint]")).toHaveCount(2);
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "right",
  );
  await page
    .getByLabel("Last concentration / arbitrary units", { exact: true })
    .fill("999");
  await expect(page.locator('[data-endpoint="end"]')).toHaveCount(0);
  await expect(page.locator(".cycle-route-text")).toContainText("999");
  for (const w of await page
    .locator(".multipart-answer input")
    .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().width)))
    expect(w).toBeGreaterThanOrEqual(200);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Last concentration / arbitrary units", { exact: true }),
  ).toHaveValue("999");
  await accessible(page);
  await shot(page, "independent-raw-graph", info.project.name);
});
test("a wrong oxygen form has zero carbon markers and never acquires a fictitious traced C", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".cycle-workbench");
  await fill(root, "biologicalAtom");
  await expect(
    root
      .locator(".cycle-atom-trace li")
      .nth(1)
      .locator(".cycle-carbon-dots span"),
  ).toHaveCount(6);
  await root.locator('[data-field="middleForm"]').selectOption("oxygen");
  const middle = root.locator(".cycle-atom-trace li").nth(1);
  await expect(middle).toContainText("Oxygen (O₂)");
  await expect(middle.locator(".cycle-carbon-dots span")).toHaveCount(0);
  await expect(middle).toContainText("0 carbon atoms");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await accessible(page);
  await shot(page, "wrong-oxygen-trace", info.project.name);
});
test("foreign saved record preserves original bytes and refuses automatic replacement", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator('[data-field="from"]').selectOption("air");
  await saved(page);
  const raw = await page.evaluate((key) => {
    const p = JSON.parse(localStorage.getItem(key)!);
    for (const b of p.work["carbon-cycle"].taskModels["cycle-v1-g-route"])
      b.record = "feeding";
    const raw = JSON.stringify(p);
    localStorage.setItem(key, raw);
    return raw;
  }, STORAGE_KEY);
  await page.reload();
  await expect(
    page.getByText("Saved data is unreadable.", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
});
