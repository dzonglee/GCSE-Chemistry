import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { pollutionJourney as j } from "../src/content/journeys/air-pollutants";
import {
  pollutionRecords,
  pollutionFields,
  pollutionChoices,
  pollutionNumeric,
  type PollutionMode,
} from "../src/lib/pollution";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/air-pollutants",
  dir = path.join(process.cwd(), "test-results/qa/air-pollutants");
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
  for (const [f, v] of Object.entries(pollutionRecords[record].expected)) {
    if (pollutionNumeric.includes(f))
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
  const out = path.join(process.cwd(), "docs/qa/pollution-prose");
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
  "products",
  "source",
  "balance",
  "effects",
  "fuels",
  "control",
] as PollutionMode[])
  test(`${mode}: scientific proposal, wrong state, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const i = j.guided.findIndex(
      (q) =>
        q.model?.kind === "pollution-investigation" && q.model.mode === mode,
    );
    await task(page, i);
    const m = j.guided[i].model!;
    if (m.kind !== "pollution-investigation") throw Error("Missing model");
    const root = page.locator(".pollution-workbench"),
      original = await root.locator(".pollution-context").innerText();
    await fill(root, m.record);
    if (mode === "products") {
      await expect(
        root.getByRole("combobox", { name: "Water (H₂O)", exact: true }),
      ).toBeVisible();
      await expect(root.locator('[data-proposal="possible"]')).toContainText(
        "Water (H₂O)",
      );
    }

    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/good/);
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    if (mode === "products")
      await proseShot(page, "products", info.project.name);
    const f = pollutionFields[mode][0],
      wrong = pollutionNumeric.includes(f)
        ? "999"
        : pollutionChoices[f].find(
            (v) => v !== pollutionRecords[m.record].expected[f],
          )!,
      control = root.locator(`[data-field="${f}"]`);
    if (pollutionNumeric.includes(f)) await control.fill(wrong);
    else await control.selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback")).toHaveClass(/bad/);
    await expect(control).toHaveValue(wrong);
    expect(await root.locator(".pollution-context").innerText()).toBe(original);
    await accessible(page);
    await shot(page, "native-" + mode, info.project.name);
    await saved(page);
    await page.reload();
    await expect(control).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(control).toHaveValue(pollutionRecords[m.record].expected[f]);
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of pollutionFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(await root.locator(".pollution-context").innerText()).toBe(original);
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
    await expect(page.locator(".pollution-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["air-pollutants"].attempts[
          id
        ].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
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
          ".pollution-workbench,.assessment-review-criteria,.pollution-feedback,.sample-reference",
        ),
      ).toHaveCount(0);
      if (j.checkForms[f][i].pollutionGiven) {
        await expect(page.locator(".assessment-session")).not.toContainText(
          "Your proposed atom totals",
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
        for (const r of p.work["air-pollutants"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["air-pollutants"].run.submitted = Date.now() - delay - 1000;
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
    const review = page.locator(".assessment-results details").nth(3);
    await review.locator("summary").click();
    await expect(review).toContainText(
      f ? "Decrease 18 g/hour" : "Decrease 30 mg/min",
    );
    await proseShot(page, `delayed-${f}`, info.project.name);
    await review.locator("summary").click();
  }
});
test("all20 records are reachable, scientifically checkable and tied to their task", async ({
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
      if (m?.kind !== "pollution-investigation" || seen.has(m.record)) continue;
      const root = page.locator(".pollution-workbench");
      await expect(root).toHaveAttribute("data-record", m.record);
      await fill(root, m.record);
      await root
        .getByRole("button", { name: "Check proposal", exact: true })
        .click();
      await expect(root.locator(".feedback")).toHaveClass(/good/);
      seen.add(m.record);
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(pollutionRecords).sort());
});
test("320px and390px opening gives a useful keyboard control within664px", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('[data-field="co2"]');
    const box = (await first.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(664);
    await first.selectOption("");
    await first.focus();
    await first.press("ArrowDown");
    await expect(first).toHaveValue("possible");
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
test("malformed and unequal coefficients retain raw work and never change chemical formulae", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const root = page.locator(".pollution-workbench");
  await fill(root, "balanceCO");
  await root.locator('[data-field="c"]').fill("3");
  await expect(root.locator('[data-atom="C"]')).toHaveText("C23");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".feedback")).toHaveClass(/bad/);
  await shot(page, "wrong-atom-tally", info.project.name);
  await root.locator('[data-field="a"]').fill("1..2");
  await expect(root.locator(".pollution-tally")).toHaveCount(0);
  await expect(root.locator(".pollution-unknown")).toContainText(
    "remain unknown",
  );
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-field="a"]')).toHaveValue("1..2");
  await expect(root.locator(".pollution-equation")).toContainText("CH₄");
  await expect(root.locator(".pollution-equation")).toContainText("H₂O");
  await accessible(page);
  await shot(page, "raw-invalid-coefficients", info.project.name);
});
test("wrong independent construction is retained, faded and recovers to the specific pathway", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const i = j.practice.findIndex((q) => q.id === "pollution-v1-p-balanceCO"),
    q = j.practice[i];
  await task(page, i);
  await answer(page, q);
  await page.getByLabel("CO coefficient", { exact: true }).fill("3");
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit CO coefficient.",
  );
  await expect(
    page.locator(".pollution-tally,.pollution-workbench"),
  ).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("CO coefficient", { exact: true })).toHaveValue(
    "3",
  );
  await accessible(page);
  await shot(page, "independent-wrong-balance", info.project.name);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".pollution-workbench")).toHaveAttribute(
    "data-record",
    "balanceCO",
  );
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("CO coefficient", { exact: true })).toHaveValue(
    "3",
  );
});
test("writtenCO misconception remains while saved criteria and reference have no automatic mark", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const q = j.practice.find((q) => q.id === "pollution-v1-p-smoke")!;
  await task(page, j.practice.indexOf(q));
  const raw =
    "There is no visible smoke so carbon monoxide must be absent and harmless.";
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
      JSON.parse(localStorage.getItem(key)!).work["air-pollutants"].attempts[
        id
      ].at(-1),
    { key: STORAGE_KEY, id: q.id },
  );
  expect(result.correct).toBe(false);
  await accessible(page);
  await shot(page, "written-CO-reference", info.project.name);
});
test("320px fuel table keeps legible columns with keyboard panning and full-width independent fields", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 664 });
  await page.goto(route);
  await task(page, 4);
  const pan = page.locator(".pollution-fuel-table");
  await pan.focus();
  await pan.press("ArrowRight");
  await expect.poll(() => pan.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  await expect(pan).toContainText("Particles");
  const fonts = await pan
    .locator("th,td")
    .evaluateAll((es) =>
      es.map((e) => parseFloat(getComputedStyle(e).fontSize)),
    );
  expect(Math.min(...fonts)).toBeGreaterThanOrEqual(14);
  await accessible(page);
  await shot(page, "panned-fuel-data", info.project.name);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(
    page,
    j.practice.findIndex((q) => q.id === "pollution-v1-p-monitor"),
  );
  for (const box of await page
    .locator(".multipart-answer input")
    .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().width)))
    expect(box).toBeGreaterThanOrEqual(200);
  await accessible(page);
  await shot(page, "narrow-independent-monitor", info.project.name);
});
test("foreign saved record retains original bytes and refuses automatic source replacement", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator('[data-field="co2"]').selectOption("possible");
  await saved(page);
  const raw = await page.evaluate((key) => {
    const p = JSON.parse(localStorage.getItem(key)!);
    for (const b of p.work["air-pollutants"].taskModels[
      "pollution-v1-g-products"
    ])
      b.record = "incomplete";
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
