import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { solubleSaltsJourney as journey } from "../src/content/journeys/making-soluble-salts";
import {
  STORAGE_KEY,
  REVIEW_DELAY,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function select(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).selectOption(value);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".salt-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function capture(page: Page, path: string) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts)
      await page.getByLabel(part.label, { exact: true }).fill(values[part.id]);
  } else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}

const route = "/lessons/making-soluble-salts";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/making-soluble-salts");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    for (let i = 0; i < 5; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = journey.checkForms[form][i];
      await answer(page, q);
      if (i === 0) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByRole("radio", { name: q.answer, exact: true }),
        ).toBeChecked();
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "making-soluble-salts"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(true);
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("region", { name: "Task model", exact: true }),
      ).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
    ).toBeVisible();
    if (form === 0)
      await page
        .getByRole("button", { name: "Try the next form", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["making-soluble-salts"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["making-soluble-salts"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < 3; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.reviewForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});

test("all original practice works while four written explanations remain self-reviewed", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("Compare your explanation");
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "making-soluble-salts"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
    if (["ss-v1-p-cooling-write", "ss-v1-p-method-write"].includes(q.id)) {
      await page.locator("textarea").evaluateAll((fields) => {
        for (const field of fields) field.scrollTop = 0;
      });
      await capture(
        page,
        `test-results/qa/soluble-salts-prose/${info.project.name}-${q.id}.png`,
      );
    }
  }
});

test("method selections retain wrong acid, reload, undo and reset without filtering dissolved alkali", async ({
  page,
}, info) => {
  await page.goto(route);
  await choices(page, {
    "Your preparation method": "excess-insoluble",
    "Your acid choice": "hydrochloric",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your acid choice", { exact: true }),
  ).toHaveValue("hydrochloric");
  await select(page, "Your acid choice", "sulfuric");
  await check(page, true);
  await capture(page, `docs/qa/soluble-salts-${info.project.name}-method.png`);
  await select(page, "Explore a supplied salt preparation record", "sodium");
  await choices(page, {
    "Your preparation method": "titration",
    "Your acid choice": "hydrochloric",
  });
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your acid choice", { exact: true }),
  ).toHaveValue("sulfuric");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your acid choice", { exact: true }),
  ).toHaveValue("unset");
  const control = page.getByLabel("Your preparation method", { exact: true });
  await control.focus();
  await page.keyboard.press("ArrowDown");
  const box = await control.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
});
test("sequence demands the correct next step and saves each distinct material stage", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const first = await page
    .getByLabel("Your next step", { exact: true })
    .boundingBox();
  expect(first!.height).toBeGreaterThanOrEqual(44);
  expect(first!.y + first!.height).toBeLessThanOrEqual(664);
  const advance = page.getByRole("button", {
    name: "Advance the predicted correct step",
    exact: true,
  });
  await expect(advance).toBeDisabled();
  await select(page, "Your next step", "boil-dry");
  await check(page, false);
  await expect(advance).toBeDisabled();
  const steps = ["filter-excess", "concentrate", "cool", "recover-dry"];
  for (let i = 0; i < 4; i++) {
    await select(page, "Your next step", steps[i]);
    await check(page, true);
    await advance.click();
    await expect(page.locator(".salt-current-state")).toContainText(
      `Stage ${i + 2}`,
    );
  }
  await select(page, "Your next step", "complete");
  await check(page, true);
  await expect(advance).toBeDisabled();
  await saved(page);
  await page.reload();
  await expect(page.locator(".salt-current-state")).toContainText("Stage 5");
  await capture(
    page,
    `docs/qa/soluble-salts-${info.project.name}-sequence.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.locator(".salt-current-state")).toContainText("Stage 1");
});
test("first and second filtration preserve distinct fractions and dissolved excess passes", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your residue": "all-dissolved-salt",
    "Your filtrate": "pure-water",
  });
  await check(page, false);
  await choices(page, {
    "Your residue": "excess-CuO",
    "Your filtrate": "salt-solution",
  });
  await check(page, true);
  await capture(page, `docs/qa/soluble-salts-${info.project.name}-filter.png`);
  for (const [record, residue, filtrate] of [
    ["early", "none-of-these-solids", "salt-and-acid"],
    ["alkali", "none-of-these-solids", "salt-and-alkali"],
    ["crystals", "salt-crystals", "mother-liquor"],
  ]) {
    await select(page, "Explore a supplied salt preparation record", record);
    await choices(page, { "Your residue": residue, "Your filtrate": filtrate });
    await check(page, true);
    await expect(page.locator(".filtration-asset")).toHaveCount(0);
  }
});
test("cooling conserves salt and an unsaturated record never invents crystals", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your cold dissolved salt mass (g)": "0",
    "Your formed crystal mass (g)": "40",
  });
  await check(page, false);
  await choices(page, {
    "Your cold dissolved salt mass (g)": "16",
    "Your formed crystal mass (g)": "24",
  });
  await check(page, true);
  await capture(page, `docs/qa/soluble-salts-${info.project.name}-cooling.png`);
  await select(
    page,
    "Explore a supplied salt preparation record",
    "unsaturated",
  );
  await choices(page, {
    "Your cold dissolved salt mass (g)": "10",
    "Your formed crystal mass (g)": "0",
  });
  await check(page, true);
});
test("purity separates concentration from drying and avoids indicator contamination", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your next action": "boil-dry",
    "Your reason": "all-water-must-be-driven-off",
  });
  await check(page, false);
  await choices(page, {
    "Your next action": "concentrate-then-cool",
    "Your reason": "preserve-crystals",
  });
  await check(page, true);
  for (const [record, next, reason] of [
    ["wet", "pat-dry", "remove-surface-liquid"],
    ["indicator", "repeat-without-indicator", "avoid-indicator-contamination"],
    ["soluble", "choose-measured-proportions", "dissolved-passes-filter"],
  ]) {
    await select(page, "Explore a supplied salt preparation record", record);
    await choices(page, { "Your next action": next, "Your reason": reason });
    await check(page, true);
  }
  await capture(page, `docs/qa/soluble-salts-${info.project.name}-purity.png`);
});
test("actual GLB contains open apparatus and named macroscopic fractions with no invented particles", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const canvas = page.getByRole("group", {
    name: "Rotate salt filtration apparatus",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.screenshot({
    path: `docs/qa/soluble-salts-${info.project.name}-asset-front.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  for (let i = 0; i < 7; i++)
    await page
      .getByRole("button", { name: "Rotate right", exact: true })
      .click();
  await canvas.screenshot({
    path: `docs/qa/soluble-salts-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const d = await pending;
  await d.saveAs(`docs/qa/soluble-salts-${info.project.name}-filtration.glb`);
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString());
  expect(g.meshes).toHaveLength(12);
  const names = g.nodes.map((n: { name?: string }) => n.name);
  for (const name of [
    "filter-paper",
    "glass-funnel",
    "funnel-stem",
    "excess-CuO-residue",
    "receiving-beaker",
    "copper-sulfate-filtrate",
  ])
    expect(names).toContain(name);
  expect(
    g.nodes.filter((n: { extras?: { element?: string } }) => n.extras?.element),
  ).toHaveLength(0);
  const binary = 28 + len;
  for (const mesh of g.meshes) {
    const a = g.accessors[mesh.primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      start = binary + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    expect(a.componentType).toBe(5126);
    for (let i = 0; i < a.count * 3; i++)
      expect(Number.isFinite(bytes.readFloatLE(start + i * 4))).toBe(true);
  }
});
test("wrong mother-liquor interpretation returns from targeted recovery with its original wrong draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 7);
  await page
    .getByRole("radio", { name: "Only water with no salt", exact: true })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Name both fractions", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "Only water with no salt", exact: true }),
  ).toBeChecked();
});
test("WebGL unavailable retains physical fraction labels and editable predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind,
      ...args
    ) {
      if (String(kind).startsWith("webgl")) return null;
      return get.call(this, kind, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await task(page, 3);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await choices(page, {
    "Your residue": "excess-CuO",
    "Your filtrate": "salt-solution",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/soluble-salts-${info.project.name}-fallback.png`,
  );
});

test("fresh independent salt preparation hides assistance and premature marking", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    `docs/qa/soluble-salts-${info.project.name}-independent.png`,
  );
});

test("historical exact-pH draft remains selected and wrong without rewriting history", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  const q = journey.practice.find((q) => q.id === "ss-v1-p-excess")!;
  const raw = "It proves an exact pH of7";
  const original = {
    answer: raw,
    correct: false,
    helped: true,
    fresh: false,
    at: Date.now() - 1000,
  };
  const data = emptyProgress();
  data.work["making-soluble-salts"] = {
    ...emptyWork(),
    section: "practice",
    learning: {
      version: 1,
      stage: "practice",
      index: journey.practice.indexOf(q),
    },
    drafts: { [q.id]: raw },
    attempts: { [q.id]: [original] },
  };
  await page.addInitScript(
    ({ key, data }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data },
  );
  await page.goto(route);
  const selected = page.getByRole("radio", {
    name: "It proves an exact pH of 7",
    exact: true,
  });
  await expect(selected).toBeChecked();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "exact pH measurement",
  );
  await page.reload();
  await expect(selected).toBeChecked();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "exact pH measurement",
  );
  const stored = await page.evaluate(
    ({ key, id }) => {
      const w = JSON.parse(localStorage.getItem(key)!).work[
        "making-soluble-salts"
      ];
      return { draft: w.drafts[id], attempts: w.attempts[id] };
    },
    { key: STORAGE_KEY, id: q.id },
  );
  expect(stored).toEqual({ draft: raw, attempts: [original] });
  await capture(
    page,
    `test-results/qa/soluble-salts-prose/${info.project.name}-legacy-pH.png`,
  );
});
