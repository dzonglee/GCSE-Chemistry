import { expectedNaturalBoard } from "../src/lib/natural";
import { referencePathwayDrawing } from "../src/lib/pathway-board";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lessons, questionById } from "../src/content/curriculum";
import { diagnostics, papers } from "../src/content/assessments";
import {
  STORAGE_KEY,
  REVIEW_DELAY,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
import type { Question } from "../src/content/types";
import type { Page } from "@playwright/test";
async function answer(page: Page, q: Question, value = q.answer) {
  if (q.naturalDrawing) {
    const root = page.locator(".natural-drawing"),
      b = expectedNaturalBoard(q.naturalDrawing.mode, q.naturalDrawing.record);
    for (const [key, value] of Object.entries(b)) {
      const el = root.locator(`[data-drawing-field="${key}"]`);
      if (!(await el.count())) continue;
      if ((await el.evaluate((e) => e.tagName)) === "SELECT")
        await el.selectOption(value);
      else await el.fill(value);
    }
    return;
  }
  if (q.pathwayDrawing) {
    const root = page.locator(".pathway-drawing"),
      b = referencePathwayDrawing(q.pathwayDrawing.caseId);
    await root
      .getByLabel("Number of carbon atoms", { exact: true })
      .selectOption(b.n);
    for (const [k, v] of Object.entries(b)) {
      if (k === "n") continue;
      const el = root.locator(`[data-drawing-field="${k}"]`);
      if (await el.count()) await el.selectOption(v);
    }
    return;
  }
  if (q.polymerisationDrawing) {
    const root = page.locator(".polymerisation-drawing");
    for (let i = 0; i < 4; i++)
      await root
        .locator(`[id$="s${i}"]`)
        .selectOption(q.polymerisationGiven!.groups[i]);
    for (const [k, v] of Object.entries({
      bond: "1",
      left: "1",
      right: "1",
      brackets: "1",
      countMark: "n",
    }))
      await root.locator(`[id$="${k}"]`).selectOption(v);
    return;
  }
  if (q.organicDrawing) {
    const root = page.getByRole("region", {
        name: "Organic structure construction",
        exact: true,
      }),
      acid = q.prompt.includes("acid"),
      n = q.prompt.includes("methan")
        ? 1
        : q.prompt.includes("propan")
          ? 3
          : q.prompt.includes("butan")
            ? 4
            : 2;
    await root
      .getByLabel("Choose the number of carbon atoms in your scaffold")
      .selectOption(String(n));
    await root
      .getByRole("button", { name: /^Terminal C–O attachment:/ })
      .click();
    await root.getByRole("button", { name: /^H attached to that O:/ }).click();
    if (acid)
      await root
        .getByLabel("Separate terminal C–O connection and bond order")
        .selectOption("2");
    for (let c = 0; c < n; c++) {
      const other =
        (c > 0 ? 1 : 0) +
        (c < n - 1 ? 1 : 0) +
        (c === n - 1 ? 1 + (acid ? 2 : 0) : 0);
      for (let slot = 0; slot < 4 - other; slot++)
        await root.locator(`[data-h-slot="h${4 * c + slot}"]`).click();
    }
    return;
  }
  if (q.parts) {
    const values = JSON.parse(value) as Record<string, string>;
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
    return;
  }
  if (q.arrangement) {
    await page
      .getByLabel("Your electron arrangement", { exact: true })
      .fill(value);
    return;
  }
  if (q.options)
    await page
      .getByRole("radio", {
        name: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"),
      })
      .check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(value);
}
async function completeSet(page: Page, questions: Question[]) {
  for (let i = 0; i < questions.length; i++) {
    await answer(page, questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < questions.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
test("contents exposes ten topics and all authored lessons can be found", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Small discoveries/ }),
  ).toBeVisible();
  await expect(page.locator(".topic-card")).toHaveCount(10);
  await page
    .getByRole("searchbox", { name: "Search lessons" })
    .fill("titration");
  await expect(page.locator(".lesson-card")).toHaveCount(6);
  await expect(page.locator(".lesson-card h3")).toHaveText([
    "Molar concentration",
    "Titration calculations",
    "Acids and neutralisation",
    "Making soluble salts",
    "Titration technique",
    "Haber process and fertilisers",
  ]);
  await page.getByRole("link", { name: /Titration calculations/ }).click();
  await expect(
    page.getByRole("heading", { name: "Titration calculations", exact: true }),
  ).toBeVisible();
});
test("atom operations respond to keyboard, diagnose errors and retain undo after reload", async ({
  page,
}) => {
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  const count = page.getByLabel("Neutron count", { exact: true });
  for (let i = 0; i < 13; i++)
    await page
      .getByRole("button", { name: "Remove neutron", exact: true })
      .press("Enter");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "target is 27",
  );
  for (let i = 0; i < 14; i++)
    await page
      .getByRole("button", { name: "Add neutron", exact: true })
      .press("Enter");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "14 neutrons",
  );
  await page.reload();
  await expect(count).toHaveText("14");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(count).toHaveText("13");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(count).toHaveText("13");
});
test("practice handles wrong answers, hints, recovery, draft resume and explicit progress", async ({
  page,
}) => {
  const l = lessons.find((l) => l.slug === "inside-an-atom")!;
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await answer(page, l.journey!.practice[0], "10");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Not yet");
  await page.getByRole("button", { name: "Give me a hint" }).click();
  await expect(page.getByRole("status")).toContainText("Mass number");
  await answer(page, l.journey!.practice[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("That’s right");
  await page.getByRole("button", { name: "Next task →" }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("6");
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "6",
  );
  await page.goto("/learn");
  await expect(
    page.getByText("Lessons started", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".stat").first()).toContainText("1");
});
async function resumeLegacyMoleCheck(page: Page) {
  const l = lessons.find((l) => l.slug === "moles-and-reacting-masses")!,
    p = emptyProgress(),
    w = emptyWork(),
    ids = l.checks.map((q) => q.id),
    now = Date.now();
  w.section = "check";
  w.run = { kind: "check", ids, index: 0, responses: {}, started: now };
  w.drafts = Object.fromEntries(
    ids.flatMap((id) => [
      [id, ""],
      ["fresh:" + id, "true"],
    ]),
  );
  for (const id of exposureIds(ids)) p.seen[id] = now;
  p.work[l.slug] = w;
  await page.goto("/");
  await page.evaluate(
    ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
    { key: STORAGE_KEY, p },
  );
  await page.goto("/lessons/moles-and-reacting-masses");
  await expect(
    page.getByText(
      "Your earlier check is retained with its original questions.",
      { exact: true },
    ),
  ).toBeVisible();
}
test("saved legacy independent checks lock answers, defer feedback and never refresh freshness", async ({
  page,
}) => {
  const l = lessons.find((l) => l.slug === "moles-and-reacting-masses")!;
  await resumeLegacyMoleCheck(page);
  await answer(page, l.checks[0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(
    page.getByText(l.checks[0].explanation, { exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toBeDisabled();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await answer(page, l.checks[1]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "2 of 2 correct" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "2 correct on a fresh, first response. Repeated questions are practice evidence.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try this set again" }).click();
  await completeSet(page, l.checks);
  await expect(
    page.getByText(
      "0 correct on a fresh, first response. Repeated questions are practice evidence.",
    ),
  ).toBeVisible();
});
test("saved legacy due review survives restart and uses previously seen questions", async ({
  page,
}) => {
  const l = lessons.find((l) => l.slug === "moles-and-reacting-masses")!;
  await resumeLegacyMoleCheck(page);
  await completeSet(page, l.checks);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["moles-and-reacting-masses"].run.submitted =
        Date.now() - delay - 1000;
      p.work["moles-and-reacting-masses"].history[0].submitted =
        Date.now() - delay - 1000;
      const w = p.work["moles-and-reacting-masses"],
        ids = w.run.ids;
      w.section = "review";
      w.run = {
        kind: "review",
        ids,
        index: 0,
        responses: {},
        started: Date.now(),
      };
      for (const id of ids) {
        w.drafts[id] = "";
        w.drafts["fresh:" + id] = "false";
      }
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByText("Your delayed review is available."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Record answer", exact: true }),
  ).toBeVisible();
  await page.reload();
  await completeSet(page, l.checks);
  await expect(
    page.getByText(
      "0 correct on a fresh, first response. Repeated questions are practice evidence.",
    ),
  ).toBeVisible();
});
test("all released lesson routes expose a working model and mark their first practice item", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const l of lessons) {
    await page.goto(`/lessons/${l.slug}`);
    await expect(
      page.getByRole("heading", { name: l.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: l.journey ? "Task model" : "Interactive chemistry model",
      }),
    ).toBeVisible();
    const firstControl = page
      .locator(
        ".haber-workbench [data-field], .materials-workbench [data-field], .lca-workbench [data-field], .bio-workbench [data-field], .waste-workbench [data-field], .water-workbench [data-field], .cycle-workbench [data-field], .pollution-workbench [data-field], .climate-workbench [data-field], .greenhouse-workbench [data-field], .atmosphere-workbench [data-field], .separation-workbench [data-field], .instrumental-workbench [data-field], .ion-tests-workbench [data-field], .gas-tests-workbench [data-field], .purity-marker-tools button, .natural-workbench [data-field], .pathway-workbench select, .model.polymerisation-workbench button, .model.alcohol-workbench button, .model.cracking-workbench button, .model.alkane-workbench button, .model.oil-workbench button, .model.practical-workbench button, .model.shift-workbench button, .model.reversible-workbench button, .model input, .model select, .model .prediction-card, .model .shell-controls button, .model .mini-periodic button, .model .particle-choice, .model .counter-steps button",
      )
      .first();
    if (await firstControl.count()) {
      const bounds = await firstControl.boundingBox();
      expect
        .soft(bounds!.y + bounds!.height, l.slug)
        .toBeLessThanOrEqual(page.viewportSize()!.height);
    }
    await page
      .getByRole("button", {
        name: l.journey ? "Practise" : "02 Practise",
        exact: true,
      })
      .click();
    const question = l.journey?.practice[0] ?? l.questions[0];
    await answer(page, question);
    await page
      .getByRole("button", {
        name: question.rubric
          ? question.naturalDrawing ||
            question.organicDrawing ||
            question.pathwayDrawing ||
            question.polymerisationDrawing ||
            question.polyesterDrawing
            ? "Save and review structure"
            : question.fuelDrawing
              ? "Save and review graph"
              : "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      question.rubric
        ? question.naturalDrawing ||
          question.organicDrawing ||
          question.pathwayDrawing ||
          question.polymerisationDrawing ||
          question.polyesterDrawing
          ? "Compare your structure"
          : question.fuelDrawing
            ? "Compare your graph"
            : "Compare your explanation"
        : "That’s right",
    );
  }
});
test("diagnostic can resume and submit all twenty reserved questions", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/diagnostics/foundation");
  await page.getByRole("button", { name: "Start starting check →" }).click();
  await completeSet(page, diagnostics[0].questions);
  await expect(
    page.getByRole("heading", { name: "20 of 20 correct" }),
  ).toBeVisible();
  await expect(page.locator(".result-row")).toHaveCount(20);
  await page.locator(".result-row").first().locator("summary").click();
  await expect(
    page.getByRole("link", { name: "Revisit this topic →" }).first(),
  ).toBeVisible();
});
test("original practice paper works with blank, invalid and locked responses", async ({
  page,
}) => {
  await page.goto("/exams/paper-1");
  await page.getByRole("button", { name: "Start paper →" }).click();
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Choose or enter");
  await page.getByLabel("Your answer", { exact: true }).fill("not a number");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("valid number");
  await page
    .getByRole("button", { name: "Leave unanswered", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toBeDisabled();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  for (let i = 1; i < papers[0].questions.length; i++) {
    await answer(page, papers[0].questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < papers[0].questions.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "Submit whole set" }).click();
  await expect(
    page.getByRole("heading", { name: "14 of 15 correct" }),
  ).toBeVisible();
});
test("mixed practice uses the selected route and reports practice evidence only", async ({
  page,
}) => {
  await page.goto("/practice");
  await page.getByRole("button", { name: "Prepare my set →" }).click();
  await page
    .getByRole("button", { name: "Start understanding check →" })
    .click();
  await expect(
    page.getByRole("button", { name: "Record answer", exact: true }),
  ).toBeVisible();
  const ids = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).work.mixed.run.ids,
    STORAGE_KEY,
  );
  const qs = ids.map((id: string) => questionById(id)!);
  await completeSet(page, qs);
  await expect(
    page.getByText(
      "Retrieval practice results; no mastery or independent-evidence claim.",
    ),
  ).toBeVisible();
});
test("blocked storage leaves the app usable and warns accurately", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", {
      value: () => {
        throw new Error("blocked");
      },
    });
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/lessons/inside-an-atom");
  await expect(page.getByRole("status")).toContainText(
    "Browser storage is unavailable",
  );
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await answer(
    page,
    lessons.find((l) => l.slug === "inside-an-atom")!.journey!.practice[0],
  );
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText("That’s right");
});
test("corrupt data is preserved and explicit deletion touches only the Chemistry namespace", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(key, "original-corrupt-bytes");
      localStorage.setItem("gcse-maths.keep", "preserve me");
    },
    { key: STORAGE_KEY },
  );
  await page.goto("/preferences");
  await expect(page.getByRole("status")).toContainText(
    "original contents have been preserved",
  );
  await page.getByLabel("Tier", { exact: true }).selectOption("higher");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe("original-corrupt-bytes");
  await page.getByRole("button", { name: "Delete this app’s data" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe("original-corrupt-bytes");
  await page.getByRole("button", { name: "Delete this app’s data" }).click();
  await page
    .getByRole("button", { name: "Yes, delete Chemistry data" })
    .click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem("gcse-maths.keep")),
  ).toBe("preserve me");
});
test("another tab cannot be silently overwritten by stale local work", async ({
  page,
  context,
}) => {
  await page.goto("/preferences");
  const second = await context.newPage();
  await second.goto("/preferences");
  await second.getByLabel("Tier", { exact: true }).selectOption("higher");
  await expect(page.getByRole("status")).toContainText(
    "changed in another tab",
  );
  const original = await second.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  await page
    .getByLabel("Qualification", { exact: true })
    .selectOption("separate");
  expect(
    await second.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(original);
  await page.reload();
  await expect(page.getByLabel("Tier", { exact: true })).toHaveValue("higher");
  await second.close();
});
test("preferences persist and export yields a real record", async ({
  page,
}) => {
  await page.goto("/preferences");
  await page.getByLabel("Exam board", { exact: true }).selectOption("OCR");
  await page.getByLabel("Tier", { exact: true }).selectOption("higher");
  await page
    .getByLabel("Qualification", { exact: true })
    .selectOption("separate");
  await page.reload();
  await expect(page.getByLabel("Exam board", { exact: true })).toHaveValue(
    "OCR",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my data" }).click();
  expect((await download).suggestedFilename()).toBe(
    "gcse-chemistry-progress.json",
  );
});
test("representative pages are accessible and reflow without horizontal overflow", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const route of [
    "/",
    "/topics/bonding",
    "/lessons/inside-an-atom",
    "/preferences",
    "/exams",
    "/learn",
    "/privacy",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations, route).toEqual([]);
  }
});
test("model families provide recoverable scientific interactions", async ({
  page,
}) => {
  await page.goto("/lessons/balancing-equations");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".balancing-workbench .feedback")).toHaveClass(
    /retry/,
  );
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-left-count",
    "2",
  );
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-right-count",
    "1",
  );
  for (const label of ["Coefficient of H₂", "Coefficient of H₂O"])
    await page.getByLabel(label, { exact: true }).selectOption("2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".balancing-workbench .feedback")).toHaveClass(
    /correct/,
  );
  await expect(page.locator('[data-balance-element="H"]')).toHaveAttribute(
    "data-left-count",
    "4",
  );
  await expect(page.locator('[data-balance-element="H"]')).toHaveAttribute(
    "data-right-count",
    "4",
  );
  await expect(page.locator('[data-balance-element="O"]')).toHaveAttribute(
    "data-right-count",
    "2",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".balancing-workbench .feedback")).toHaveClass(
    /retry/,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Coefficient of H₂", { exact: true }),
  ).toHaveValue("1");
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["balancing-equations"]
            .taskModels["be-v1-g-ledger"]?.length,
        STORAGE_KEY,
      ),
    )
    .toBe(1);
  await page.reload();
  await expect(page.locator(".storage-warning")).toHaveCount(0);
  await expect(
    page.getByLabel("Coefficient of H₂", { exact: true }),
  ).toHaveValue("1");
  await page.goto("/lessons/electrolysis");
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Explore a supplied electrolysis record", { exact: true })
    .selectOption("sodium");
  await page
    .getByLabel("Your final cathode product", { exact: true })
    .selectOption("H2");
  await page
    .getByLabel("Your final anode product", { exact: true })
    .selectOption("Cl2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".electrolysis-workbench .feedback")).toHaveClass(
    /retry/,
  );
  await page
    .getByLabel("Your final cathode product", { exact: true })
    .selectOption("Na");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".electrolysis-workbench .feedback")).toHaveClass(
    /correct/,
  );
  await page.goto("/lessons/chromatography");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Task 5", exact: true })
    .first()
    .click();
  const chroma = page.locator(".chroma-workbench");
  await chroma.locator('[data-field="rf"]').fill("2");
  await chroma
    .getByRole("button", { name: "Check model", exact: true })
    .click();
  await expect(chroma.locator(".chroma-model-feedback")).toContainText(
    "Your proposal is retained",
  );
  await expect(chroma).toContainText("160 mm");
  await expect(chroma).toContainText("Outside the displayed scale");
  await expect(chroma.locator('[data-field="rf"]')).toHaveValue("2");
});
test("screenshots capture the course and a guided atom interaction at both sizes", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.screenshot({
    path: info.outputPath("course.png"),
    fullPage: true,
  });
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await page.screenshot({
    path: info.outputPath("atom-result.png"),
    fullPage: true,
  });
});
test("simultaneous tab saves retain a winner and flag the conflicting writer", async ({
  page,
  context,
}) => {
  await page.goto("/preferences");
  const second = await context.newPage();
  await second.goto("/preferences");
  await Promise.all([
    page.getByLabel("Tier", { exact: true }).selectOption("higher"),
    second
      .getByLabel("Qualification", { exact: true })
      .selectOption("separate"),
  ]);
  await expect
    .poll(
      async () =>
        await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
    )
    .not.toBeNull();
  const raw = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  const record = JSON.parse(raw!);
  expect(
    record.preferences.tier === "higher" ||
      record.preferences.course === "separate",
  ).toBe(true);
  const warnings = await Promise.all([
    page.locator(".storage-warning").count(),
    second.locator(".storage-warning").count(),
  ]);
  expect(warnings.some((n) => n > 0)).toBe(true);
  await second.close();
});
test("immediate refresh recovers a draft even while its commit lock is held", async ({
  page,
}) => {
  await page.goto("/lessons/inside-an-atom");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByRole("button", { name: "Next task →" }).click();
  await page.evaluate((key) => {
    void navigator.locks.request(
      key,
      () =>
        new Promise<void>((resolve) => {
          (window as unknown as { releaseSave: () => void }).releaseSave =
            resolve;
        }),
    );
  }, STORAGE_KEY);
  await page.getByLabel("Your answer", { exact: true }).fill("6");
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "6",
  );
});
test("the rebuilt periodic lesson retains the complete first-20 reference", async ({
  page,
}) => {
  await page.goto("/lessons/periodic-patterns");
  await page.getByText("First 20 elements reference", { exact: true }).click();
  const reference = page.locator(".first-twenty-reference");
  await expect(reference.locator("tbody tr")).toHaveCount(20);
  await expect(
    reference.getByRole("row").filter({ hasText: "Sodium (Na)" }),
  ).toContainText("2,8,1");
  await expect(
    reference.getByRole("row").filter({ hasText: "Magnesium (Mg)" }),
  ).toContainText("2,8,2");
  await expect(
    reference
      .getByRole("row")
      .filter({ hasText: "Helium (He)" })
      .locator("td")
      .nth(1),
  ).toHaveText("0");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("higher papers are available and their quantitative questions can be answered", async ({
  page,
}) => {
  const higher = papers.find((p) => p.slug === "higher-paper-1")!;
  await page.goto("/exams/higher-paper-1");
  await page.getByRole("button", { name: "Start paper →" }).click();
  await completeSet(page, higher.questions);
  await expect(
    page.getByRole("heading", { name: "15 of 15 correct" }),
  ).toBeVisible();
});
