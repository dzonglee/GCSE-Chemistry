import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { greenhouseJourney as j } from "../src/content/journeys/greenhouse-effect";
import {
  greenhouseRecords,
  greenhouseFields,
  greenhouseChoices,
  greenhouseNumeric,
  type GreenhouseMode,
} from "../src/lib/greenhouse";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/greenhouse-effect",
  dir = path.join(process.cwd(), "test-results/qa/greenhouse-effect");
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
  for (const [f, v] of Object.entries(greenhouseRecords[record].expected)) {
    if (greenhouseNumeric.includes(f))
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
  "wave",
  "mechanism",
  "budget",
  "change",
  "source",
  "critique",
] as GreenhouseMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "greenhouse-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "greenhouse-investigation") throw Error("Missing model");
    const root = page.locator(".greenhouse-workbench"),
      original = await root.locator(".greenhouse-original").innerText();
    await fill(root, m.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    const f = greenhouseFields[mode][0],
      wrong = greenhouseNumeric.includes(f)
        ? "999"
        : greenhouseChoices[f].find(
            (v) => v !== greenhouseRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (greenhouseNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".greenhouse-original").innerText()).toBe(
      original,
    );
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(greenhouseRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of greenhouseFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".greenhouse-original").innerText()).toBe(
      original,
    );
  });
test("all22 practice responses preserve supplied evidence and honest written feedback", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    await expect(page.locator(".greenhouse-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "greenhouse-effect"
        ].attempts[id].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
    if ([8, 9, 16, 17, 18, 20, 21].includes(i)) {
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
          ".greenhouse-workbench,.assessment-review-criteria,.greenhouse-feedback",
        ),
      ).toHaveCount(0);
      if (i === 2) {
        await expect(page.locator(".greenhouse-ledger")).not.toContainText(
          "internal back radiation",
        );
        await expect(page.locator(".greenhouse-ledger")).not.toContainText(
          "No exact temperature",
        );
        await accessible(page);
        await shot(page, `sealed-ledger-${f}`, info.project.name);
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
        for (const r of p.work["greenhouse-effect"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["greenhouse-effect"].run.submitted = Date.now() - delay - 1000;
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
test("source-substituted energy ledger preserves raw bytes and refuses silent replacement", async ({
  page,
}) => {
  await page.goto(route);
  await task(page, 3);
  await page.locator('[data-field="absorbed"]').fill("70");
  await saved(page);
  const raw = await page.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k)!);
    const h = p.work["greenhouse-effect"].taskModels["greenhouse-v1-g-gain"];
    for (const b of h) b.record = "balance";
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
test("wrong signed energy reaches its own recovery and returns to the retained value", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 9);
  await page.getByLabel("Your answer", { exact: true }).fill("8");
  await page.locator(".sample-check-answer").click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".greenhouse-workbench")).toHaveAttribute(
    "data-record",
    "loss",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "8",
  );
});
test("320px and390px openings offer a useful control without document overflow", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="incoming"]');
    await expect(first).toBeVisible();
    const b = (await first.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(664);
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
test("malformed and negative ledger proposals are retained without changing original bars", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const root = page.locator(".greenhouse-workbench"),
    original = await root
      .locator(".greenhouse-track")
      .evaluateAll((es) => es.map((e) => e.innerHTML));
  await root.locator('[data-field="absorbed"]').fill("1..2");
  await root.locator('[data-field="net"]').fill("-999");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator(".greenhouse-proposal-ledger")).toContainText(
    "not a readable number",
  );
  expect(
    await root
      .locator(".greenhouse-track")
      .evaluateAll((es) => es.map((e) => e.innerHTML)),
  ).toEqual(original);
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="absorbed"]')).toHaveValue("1..2");
  await expect(root.locator('[data-field="net"]')).toHaveValue("-999");
  await accessible(page);
  await shot(page, "raw-wrong-ledger", info.project.name);
});
test("actual radiation arrows follow the proposal and preserve wrong emission direction", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 1);
  const root = page.locator(".greenhouse-workbench");
  await fill(root, "pathway");
  await expect(root.locator("[data-upward-emission]")).toHaveCount(1);
  await expect(root.locator("[data-downward-emission]")).toHaveCount(1);
  const sun = await root.locator("[data-solar-path]").getAttribute("d");
  await root.locator('[data-field="release"]').selectOption("downOnly");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await expect(root.locator("[data-upward-emission]")).toHaveCount(0);
  await expect(root.locator("[data-downward-emission]")).toHaveCount(1);
  expect(await root.locator("[data-solar-path]").getAttribute("d")).toBe(sun);
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="release"]')).toHaveValue("downOnly");
  await expect(root.locator("[data-upward-emission]")).toHaveCount(0);
  await accessible(page);
  await shot(page, "wrong-radiation-direction", info.project.name);
});
test("independent ledger retains wrong totals and interprets accepted fraction and scientific entries", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 8);
  const absorbed = page.getByLabel("Absorbed solar energy / units", {
      exact: true,
    }),
    net = page.getByLabel("Net energy gain / units", { exact: true });
  await absorbed.fill("240/2");
  await net.fill("2e1");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "right",
  );
  await expect(page.locator(".greenhouse-proposal-ledger")).toContainText(
    "240/2",
  );
  await expect(page.locator(".greenhouse-proposal-ledger")).not.toContainText(
    "not a readable number",
  );
  await absorbed.fill("999");
  await net.fill("-20");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Not yet",
  );
  await saved(page);
  expect(
    await page.evaluate(
      (k) =>
        JSON.parse(localStorage.getItem(k)!).work["greenhouse-effect"].attempts[
          "greenhouse-v1-p-ledger"
        ].at(-1).correct,
      STORAGE_KEY,
    ),
  ).toBe(false);
  await expect(page.locator(".greenhouse-proposal-ledger")).toContainText(
    "outside the supplied incoming total",
  );
  await saved(page);
  await page.reload();
  await expect(absorbed).toHaveValue("999");
  await expect(net).toHaveValue("-20");
  await expect(page.locator(".greenhouse-ledger")).toHaveCount(1);
  await accessible(page);
  await shot(page, "independent-wrong-ledger", info.project.name);
});
test("all fourteen supplied records render and check through their own scientific control", async ({
  page,
}) => {
  await page.goto(route);
  const seen = new Set<string>();
  for (const stage of ["refresher", "guided"] as const) {
    if (stage === "refresher") {
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
    } else {
      await page.getByRole("button", { name: "Learn", exact: true }).click();
    }
    for (let i = 0; i < j[stage].length; i++) {
      await task(page, i);
      const m = j[stage][i].model;
      if (m?.kind !== "greenhouse-investigation" || seen.has(m.record))
        continue;
      const root = page.locator(".greenhouse-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(greenhouseRecords).sort());
});
