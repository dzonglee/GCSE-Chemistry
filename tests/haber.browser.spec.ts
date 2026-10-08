import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import {
  haberJourney as j,
  haberForTier,
} from "../src/content/journeys/haber-and-fertilisers";
import {
  haberRecords as R,
  haberFields,
  haberNumeric,
  haberChoices,
  type HaberMode,
} from "../src/lib/haber";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
const route = "/lessons/haber-and-fertilisers",
  dir = path.join(process.cwd(), "test-results/qa/haber-and-fertilisers");
async function saved(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function tier(p: Page, v: "higher" | "foundation") {
  await saved(p);
  await expect
    .poll(() => p.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
    .not.toBeNull();
  await p.evaluate(
    ({ key, v }) => {
      const b = JSON.parse(localStorage.getItem(key)!);
      b.preferences.tier = v;
      localStorage.setItem(key, JSON.stringify(b));
    },
    { key: STORAGE_KEY, v },
  );
  await p.reload();
}
async function start(p: Page, v: "higher" | "foundation" = "higher") {
  await p.goto(route);
  await p.getByRole("heading", { level: 1 }).waitFor();
  if (v === "higher") await tier(p, v);
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
  for (const [f, v] of Object.entries(R[record].expected)) {
    const field = root.locator(`[data-field="${f}"]`);
    if (haberNumeric.includes(f)) await field.fill(v);
    else await field.selectOption(v);
  }
}
async function answer(p: Page, q: Question) {
  if (q.haberDrawing) {
    const b = JSON.parse(q.answer);
    for (const [k, label] of [
      ["xMax", "Maximum pressure / atm"],
      ["xStep", "Pressure per major interval / atm"],
      ["yMax", "Maximum yield / %"],
      ["yStep", "Yield per major interval / percentage points"],
    ])
      await p
        .getByRole("combobox", { name: label, exact: true })
        .selectOption(b[k]);
    for (let i = 0; i < 7; i++) {
      await p
        .getByLabel(`Point${i + 1} pressure / atm`, { exact: true })
        .fill(b["p" + i + "x"]);
      await p
        .getByLabel(`Point${i + 1} yield / %`, { exact: true })
        .fill(b["p" + i + "y"]);
      await p
        .getByLabel(`Curve control at${q.haberDrawing.points[i][0]} atm / %`, {
          exact: true,
        })
        .fill(b["c" + i]);
    }
  } else if (q.parts)
    for (const part of q.parts)
      await p.getByLabel(part.label, { exact: true }).fill(String(part.answer));
  else if (q.rubric)
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
    path: path.join(dir, device + "-" + name + ".png"),
    fullPage: true,
    scale: "css",
  });
}
for (const mode of Object.keys(haberFields) as HaberMode[])
  test(`${mode}: scientific proposal, wrong work, reload, undo and scoped clear`, async ({
    page,
  }, info) => {
    await start(page);
    const i = j.guided.findIndex(
      (q) => q.model?.kind === "haber-investigation" && q.model.mode === mode,
    );
    if (i >= 0) await task(page, i);
    else {
      await page.getByRole("button", { name: "Practise", exact: true }).click();
      await task(page, 0);
      await page
        .getByRole("radio", {
          name: j.practice[0].options!.find((v) => v !== j.practice[0].answer)!,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await task(
        page,
        j.refresher.findIndex(
          (q) =>
            q.model?.kind === "haber-investigation" && q.model.mode === mode,
        ),
      );
    }
    const q = (
        i >= 0
          ? j.guided[i]
          : j.refresher.find(
              (q) =>
                q.model?.kind === "haber-investigation" &&
                q.model.mode === mode,
            )
      )!,
      record = (q.model as { record: string }).record,
      root = page.locator(".haber-workbench");
    await fill(root, record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback.good")).toBeVisible();
    await accessible(page);
    await shot(page, "correct-" + mode, info.project.name);
    const f = haberFields[mode][0],
      v = haberNumeric.includes(f)
        ? "999"
        : haberChoices[f].find((v) => v !== R[record].expected[f])!;
    if (haberNumeric.includes(f))
      await root.locator(`[data-field="${f}"]`).fill(v);
    else await root.locator(`[data-field="${f}"]`).selectOption(v);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback.bad")).toContainText(
      "entries remain as typed",
    );
    await saved(page);
    await page.reload();
    await expect(
      page.locator(`.haber-workbench [data-field="${f}"]`),
    ).toHaveValue(v);
    await page
      .locator(".haber-workbench")
      .getByRole("button", { name: "Undo", exact: true })
      .click();
    await expect(
      page.locator(`.haber-workbench [data-field="${f}"]`),
    ).toHaveValue(R[record].expected[f]);
    await page
      .locator(".haber-workbench")
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const field of haberFields[mode])
      await expect(
        page.locator(`.haber-workbench [data-field="${field}"]`),
      ).toHaveValue("");
  });
test("all19 native records are individually reachable and fixed sources survive wrong entries", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await start(page);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 0);
  await page
    .getByRole("radio", {
      name: j.practice[0].options!.find((v) => v !== j.practice[0].answer)!,
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  const seen = new Set<string>();
  for (let i = 0; i < j.refresher.length; i++) {
    const q = j.refresher[i];
    if (q.model?.kind !== "haber-investigation") continue;
    await task(page, i);
    const r = q.model.record,
      root = page.locator(".haber-workbench");
    seen.add(r);
    const original = await root.locator(".haber-given").innerText();
    await fill(root, r);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback.good")).toBeVisible();
    expect(await root.locator(".haber-given").innerText()).toBe(original);
    if (["rateGraph", "catalyst", "phosphoricRock", "nitrateSalt"].includes(r))
      await shot(page, "record-" + r, info.project.name);
  }
  expect([...seen].sort()).toEqual(Object.keys(R).sort());
});
test("every independent practice works, all recoveries resolve and written criteria remain gated", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await start(page);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    const q = j.practice[i];
    await task(page, i);
    await expect(page.locator(".haber-workbench")).toHaveCount(0);
    await answer(page, q);
    await expect(page.locator(".sample-reference")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: q.rubric
          ? q.haberDrawing
            ? "Save and review graph"
            : "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page.locator(".sample-task-answer .feedback strong"),
    ).toContainText(q.rubric ? "Compare your" : "That’s right.");
    if (q.rubric) {
      await expect(page.locator(".sample-task-answer")).toContainText(
        q.haberDrawing ? "no automatic exam mark" : "not an automatic mark",
      );
      await expect(page.locator(".sample-reference")).not.toHaveAttribute(
        "open",
        "",
      );
      if (q.id === "haber-v1-p-compromise") {
        await page.locator(".sample-reference summary").click();
        await shot(page, "written-commercial-reference", info.project.name);
      }
    } else {
      if (q.parts)
        await page.getByLabel(q.parts[0].label, { exact: true }).fill("999");
      else if (q.options)
        await page
          .getByRole("radio", {
            name: q.options.find((o) => o !== q.answer)!,
            exact: true,
          })
          .check();
      else await page.getByLabel("Your answer", { exact: true }).fill("999");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".sample-task-answer .feedback strong"),
      ).toHaveText("Not yet.");
    }
    await page
      .getByRole("button", { name: "Revisit the key idea", exact: true })
      .click();
    await expect(page.locator(".sample-task-panel h2")).toHaveText(
      j.refresher.find((r) => r.id === q.followUp)!.title!,
    );
    await page
      .getByRole("button", { name: "Return to your task →", exact: true })
      .click();
    await expect(page.locator(".sample-task-panel h2")).toHaveText(q.title!);
  }
  await saved(page);
  const work = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["haber-and-fertilisers"],
    STORAGE_KEY,
  );
  for (const q of j.practice.filter((q) => q.rubric))
    expect(work.attempts[q.id].at(-1).correct).toBe(false);
});
test("both reserved Higher checks and delayed reviews defer feedback and keep graph review manual", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await start(page);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < 2; f++) {
    for (let i = 0; i < j.checkForms[f].length; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = j.checkForms[f][i];
      await answer(page, q);
      await expect(
        page.locator(
          ".haber-workbench,.assessment-review-criteria,.sample-reference",
        ),
      ).toHaveCount(0);
      if (q.haberDrawing) {
        await accessible(page);
        await shot(page, "sealed-free-graph-" + f, info.project.name);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    const form = j.checkForms[f];
    await expect(
      page.getByRole("heading", {
        name: `${form.length - form.filter((q) => q.rubric).length} of ${form.length - form.filter((q) => q.rubric).length} correct`,
        exact: true,
      }),
    ).toBeVisible();
    await accessible(page);
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
        const b = JSON.parse(localStorage.getItem(key)!);
        for (const r of b.work["haber-and-fertilisers"].history)
          r.submitted = Date.now() - delay - 1000;
        b.work["haber-and-fertilisers"].run.submitted =
          Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(b));
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
        name: `${4 - j.reviewForms[f].filter((q) => q.rubric).length} of ${4 - j.reviewForms[f].filter((q) => q.rubric).length} correct`,
        exact: true,
      }),
    ).toBeVisible();
  }
});
test("Foundation excludes Higher tasks while tier switches retain answers and started original forms", async ({
  page,
}, info) => {
  await start(page, "foundation");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await expect(page.getByLabel("Choose a practice task")).toHaveCount(1);
  const foundation = haberForTier("foundation");
  expect(
    await page.getByLabel("Choose a practice task").locator("option").count(),
  ).toBe(foundation.practice.length);
  await expect(page.getByLabel("Choose a practice task")).not.toContainText(
    "Higher:",
  );
  await task(page, 8);
  const q = foundation.practice[8];
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("999");
  await saved(page);
  await tier(page, "higher");
  await expect(page.locator(".sample-task-panel h2")).toHaveText(q.title!);
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "999",
  );
  await tier(page, "foundation");
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "999",
  );
  await shot(page, "foundation-preserved-wrong-mass", info.project.name);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".assessment-intro")).toContainText("7 questions.");
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, foundation.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
  await tier(page, "higher");
  await expect(page.locator(".assessment-session")).toContainText(
    "Question 1 of 7",
  );
  await expect(
    page.getByRole("button", { name: "Next question →", exact: true }),
  ).toBeVisible();
});
test("free graph keeps independent points, axes and fit through invalid input, pointer placement and reload", async ({
  page,
}, info) => {
  await start(page);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const q = j.practice.find((q) => q.haberDrawing)!;
  await task(page, j.practice.indexOf(q));
  await expect(page.locator(".haber-free-point,.haber-best-fit")).toHaveCount(
    0,
  );
  await answer(page, q);
  await expect(page.locator(".haber-free-point")).toHaveCount(7);
  await expect(page.locator(".haber-best-fit")).toHaveCount(1);
  await page.getByLabel("Point1 yield / %", { exact: true }).fill("999");
  await expect(page.locator(".haber-free-point")).toHaveCount(6);
  await expect(page.locator(".haber-best-fit")).toHaveCount(1);
  await page.getByLabel("Point1 yield / %", { exact: true }).fill("1..2");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Point1 yield / %", { exact: true }),
  ).toHaveValue("1..2");
  await expect(page.locator(".haber-free-point")).toHaveCount(6);
  await page.getByLabel("Point1 yield / %", { exact: true }).fill("7e0");
  await expect(page.locator('.haber-free-point[data-y="7"]')).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save and review graph", exact: true })
    .click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "no automatic exam mark",
  );
  await accessible(page);
  await shot(page, "independent-free-graph", info.project.name);
  const svg = page.locator(".haber-drawing svg"),
    box = (await svg.boundingBox())!;
  await svg.click({
    position: { x: (box.width * 180) / 420, y: (box.height * 150) / 300 },
  });
  await expect(
    page.getByLabel("Point1 pressure / atm", { exact: true }),
  ).not.toHaveValue("60");
  await page
    .getByRole("button", { name: "Clear graph construction", exact: true })
    .click();
  await expect(page.locator(".haber-free-point,.haber-best-fit")).toHaveCount(
    0,
  );
  await expect(
    page.getByLabel("Point1 yield / %", { exact: true }),
  ).toHaveValue("");
});
test("independent coordinate graph plots raw wrong work without changing given observations", async ({
  page,
}, info) => {
  await start(page);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const q = j.practice.find((q) => q.id === "haber-v1-p-plot")!;
  await task(page, j.practice.indexOf(q));
  const given = await page.locator(".haber-given table").innerText();
  await expect(page.locator(".haber-draft-point")).toHaveCount(0);
  await answer(page, q);
  await expect(page.locator(".haber-draft-point")).toHaveCount(3);
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("9");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback strong")).toHaveText(
    "Not yet.",
  );
  await expect(page.locator('.haber-draft-point[data-y="9"]')).toHaveCount(1);
  expect(await page.locator(".haber-given table").innerText()).toBe(given);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel(q.parts![0].label, { exact: true })).toHaveValue(
    "9",
  );
  await accessible(page);
  await shot(page, "independent-wrong-coordinate", info.project.name);
});
test("raw model numbers never silently restore a previously correct feed", async ({
  page,
}, info) => {
  await start(page);
  const root = page.locator(".haber-workbench");
  await fill(root, "feed2");
  for (const raw of ["1..2", "1e3", "5 mol"]) {
    await root.locator('[data-field="hydrogenAmount"]').fill(raw);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".feedback.bad")).toBeVisible();
    await saved(page);
    await page.reload();
    await expect(
      page.locator('.haber-workbench [data-field="hydrogenAmount"]'),
    ).toHaveValue(raw);
    await shot(
      page,
      "raw-feed-" + raw.replace(/[^a-z0-9]/g, "_"),
      info.project.name,
    );
  }
});
test("independent nutrient bars use one fixed scale and retain wrong percentages", async ({
  page,
}, info) => {
  await start(page, "foundation");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const view = haberForTier("foundation"),
    q = view.practice.find((q) => q.id === "haber-v1-p-bars")!;
  await task(page, view.practice.indexOf(q));
  await expect(page.locator(".haber-bar-track span[data-value]")).toHaveCount(
    0,
  );
  await answer(page, q);
  await page.getByLabel("Nitrogen bar height / %", { exact: true }).fill("15");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback strong")).toHaveText(
    "Not yet.",
  );
  await expect(
    page.locator('.haber-bar-track span[data-field="n"]'),
  ).toHaveAttribute("data-value", "15");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Nitrogen bar height / %", { exact: true }),
  ).toHaveValue("15");
  await accessible(page);
  await shot(page, "independent-wrong-nutrient-bars", info.project.name);
});
test("native options fit actual320/390 widths and graph labels retain readable14px", async ({
  page,
}, info) => {
  await start(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of Object.keys(haberFields) as HaberMode[]) {
      const i = j.guided.findIndex(
        (q) => q.model?.kind === "haber-investigation" && q.model.mode === mode,
      );
      if (i < 0) continue;
      await page.getByRole("button", { name: "Learn", exact: true }).click();
      await task(page, i);
      const options = await page
        .locator(".haber-fields select")
        .evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const el = node as HTMLSelectElement,
              s = getComputedStyle(el),
              c = document.createElement("canvas").getContext("2d")!;
            c.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
            const available =
              el.clientWidth -
              parseFloat(s.paddingLeft) -
              parseFloat(s.paddingRight) -
              22;
            return [...el.options].map((o) => ({
              label: o.text,
              width: c.measureText(o.text).width,
              available,
            }));
          }),
        );
      for (const o of options)
        expect(o.width, o.label + " at" + width).toBeLessThanOrEqual(
          o.available,
        );
      if (mode === "graph") {
        const texts = await page
          .locator(".haber-graph text")
          .evaluateAll((ns) =>
            ns.map((n) => parseFloat(getComputedStyle(n).fontSize)),
          );
        expect(texts.every((v) => v >= 14)).toBe(true);
      }
      await expect(page.locator(".haber-workbench")).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await shot(page, "mobile-choice-widths", info.project.name);
});
test("opening offers a meaningful scientific control within unchanged664px gate at320/390", async ({
  page,
}, info) => {
  await start(page, "foundation");
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await task(page, 0);
    await page.evaluate(() => scrollTo(0, 0));
    const first = page.locator(".haber-workbench [data-field]").first(),
      b = (await first.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(664);
    await accessible(page);
    await shot(page, "opening-" + width, info.project.name);
  }
});
