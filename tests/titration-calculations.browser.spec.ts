import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { titrationCalculationsJourney as journey } from "../src/content/journeys/titration-calculations";
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
    page.locator(".titration-workbench .feedback[role=status]"),
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

const route = "/lessons/titration-calculations";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/titration-calculations");
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
          page.getByLabel(q.parts![0].label, { exact: true }),
        ).toHaveValue(JSON.parse(q.answer)[q.parts![0].id]);
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
                  "titration-calculations"
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
      for (const run of p.work["titration-calculations"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["titration-calculations"].run.submitted =
        Date.now() - delay - 1000;
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
test("nonzero burette readings keep wrong final-only delivery through reload and canonical reset", async ({
  page,
}, info) => {
  await page.goto(route);
  const first = page.getByLabel("Your delivered volume", { exact: true });
  await expect(first).toBeVisible();
  const box = await first.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await choices(page, {
    "Your delivered volume": "21.4",
    "Your NaOH amount": "0.00214",
    "Your relationship": "final-only",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(first).toHaveValue("21.4");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(first).toHaveValue("unset");
  await saved(page);
  await page.reload();
  await expect(first).toHaveValue("unset");
  await choices(page, {
    "Your delivered volume": "20",
    "Your NaOH amount": "0.002",
    "Your relationship": "final-minus-initial",
  });
  await check(page, true);
  await select(page, "Explore a reacting record", "shifted");
  await check(page, true);
  await select(page, "Explore a reacting record", "larger");
  await check(page, false);
  await choices(page, {
    "Your delivered volume": "25",
    "Your NaOH amount": "0.0025",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-titre.png`,
  );
});
test("known solution amount and original sample denominator control a one-to-one concentration", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your known amount": "0.002",
    "Your unknown concentration": "0.1",
    "Your relationship": "known-concentration",
  });
  await check(page, false);
  await choices(page, {
    "Your unknown concentration": "0.08",
    "Your relationship": "unknown-moles-over-sample",
  });
  await check(page, true);
  await select(page, "Explore a reacting record", "smallerSample");
  await check(page, false);
  await select(page, "Your unknown concentration", "0.16");
  await check(page, true);
  await select(page, "Explore a reacting record", "largerTitre");
  await choices(page, {
    "Your known amount": "0.003",
    "Your unknown concentration": "0.12",
  });
  await check(page, true);
  await expect(page.locator(".titration-ledger")).toContainText(
    "Original HCl sample",
  );
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-concentration.png`,
  );
});
test("opposite equation ratios and equal reacting volumes retain incorrect mole predictions", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your unknown amount": "0.0024",
    "Your unknown concentration": "0.096",
    "Your relationship": "always-one-to-one",
  });
  await check(page, false);
  await choices(page, {
    "Your unknown amount": "0.0012",
    "Your unknown concentration": "0.048",
    "Your relationship": "unknown-over-known-coefficient",
  });
  await check(page, true);
  await select(page, "Explore a reacting record", "dihydroxide");
  await check(page, false);
  await choices(page, {
    "Your unknown amount": "0.0036",
    "Your unknown concentration": "0.144",
  });
  await check(page, true);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your unknown amount", { exact: true }),
  ).toHaveValue("0.0036");
  await select(page, "Explore a reacting record", "equalVolume");
  await choices(page, {
    "Your unknown amount": "0.00125",
    "Your unknown concentration": "0.05",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-ratio.png`,
  );
});
test("mass reporting changes the named molar mass and does not report sample grams", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your molar concentration": "0.16",
    "Your mass concentration": "0.004",
    "Your relationship": "divide-by-M",
  });
  await check(page, false);
  await choices(page, {
    "Your mass concentration": "6.4",
    "Your relationship": "multiply-named-solute-M",
  });
  await check(page, true);
  await select(page, "Explore a reacting record", "sulfuric");
  await choices(page, {
    "Your molar concentration": "0.08",
    "Your mass concentration": "7.84",
  });
  await check(page, true);
  await select(page, "Explore a reacting record", "hydrochloric");
  await choices(page, {
    "Your molar concentration": "0.16",
    "Your mass concentration": "5.84",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-mass.png`,
  );
});
test("reverse reacting volume changes with titrant concentration and acid equation", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your required titrant amount": "0.00125",
    "Your required titrant volume": "12.5",
    "Your relationship": "same-volume-always",
  });
  await check(page, false);
  await choices(page, {
    "Your required titrant amount": "0.0025",
    "Your required titrant volume": "25",
    "Your relationship": "required-moles-over-titrant-c",
  });
  await check(page, true);
  await select(page, "Explore a reacting record", "strongerTitrant");
  await check(page, false);
  await select(page, "Your required titrant volume", "12.5");
  await check(page, true);
  await select(page, "Explore a reacting record", "hydrochloric");
  await select(page, "Your required titrant amount", "0.00125");
  await check(page, true);
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-volume.png`,
  );
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
                "titration-calculations"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
    if (q.id === "tc-v1-p-wrong-ratio" || q.id === "tc-v1-p-shift") {
      await page.locator(".question-panel textarea").evaluateAll((nodes) => {
        for (const node of nodes) node.scrollTop = 0;
      });
      await capture(
        page,
        `test-results/qa/titration-prose/${info.project.name}-${q.id}.png`,
      );
    }
  }
});

test("historical combined-volume response stays raw and incorrect after correction and reload", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  const q = journey.refresher.find((q) => q.id === "tc-v1-r-volume")!;
  const raw = "The combined43.0 cm³ mixture";
  const original = {
    answer: raw,
    correct: false,
    helped: true,
    fresh: false,
    at: Date.now() - 1000,
  };
  const data = emptyProgress();
  data.preferences.tier = "higher";
  data.preferences.course = "separate";
  data.work["titration-calculations"] = {
    ...emptyWork(),
    section: "explore",
    learning: {
      version: 1,
      stage: "refresher",
      index: journey.refresher.indexOf(q),
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
    name: "The combined 43.0 cm³ mixture",
    exact: true,
  });
  await expect(selected).toBeChecked();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "original acid concentration",
  );
  await page.reload();
  await expect(selected).toBeChecked();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "original acid concentration",
  );
  const stored = await page.evaluate(
    ({ key, id }) => {
      const work = JSON.parse(localStorage.getItem(key)!).work[
        "titration-calculations"
      ];
      return { draft: work.drafts[id], attempts: work.attempts[id] };
    },
    { key: STORAGE_KEY, id: q.id },
  );
  expect(stored).toEqual({ draft: raw, attempts: [original] });
  await capture(
    page,
    `test-results/qa/titration-prose/${info.project.name}-legacy-volume.png`,
  );
});
test("fresh independent reacting amounts align inputs and hide assistance until submission", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  const q = journey.checkForms[0][0];
  await answer(page, q);
  const a = await page
      .getByLabel(q.parts![0].label, { exact: true })
      .boundingBox(),
    b = await page.getByLabel(q.parts![1].label, { exact: true }).boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  expect(a!.width).toBeGreaterThanOrEqual(44);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-independent.png`,
  );
});
test("real burette GLB preserves two calibrated states actual graduations and meniscus mesh depth", async ({
  page,
}, info) => {
  await page.goto(route);
  const canvas = page.getByRole("group", {
    name: "Rotate both burette states",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  const displayBox = await page.locator(".burette-display").boundingBox();
  for (const [i, ratio] of [0.17, 0.5, 0.83].entries()) {
    const label = await page
      .locator(".burette-reference span")
      .nth(i)
      .boundingBox();
    expect(
      Math.abs(
        label!.y +
          label!.height / 2 -
          (displayBox!.y + displayBox!.height * ratio),
      ),
    ).toBeLessThan(1);
  }
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download burette states as GLB",
      exact: true,
    })
    .click();
  const download = await pending;
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await download.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const jsonLength = bytes.readUInt32LE(12),
    gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString()),
    binStart = 20 + jsonLength + 8;
  type Node = { name: string; mesh?: number; extras?: Record<string, unknown> };
  const nodes = gltf.nodes as Node[];
  const root = nodes.find((n) => n.name === "same-burette-before-and-after")!;
  expect(root.extras!.deliveredCm3).toBeCloseTo(20, 10);
  const fluids = nodes.filter((n) =>
    n.name.endsWith("solution-column-concave-meniscus"),
  );
  expect(fluids).toHaveLength(2);
  for (const node of fluids) {
    expect(typeof node.mesh).toBe("number");
    const accessor =
        gltf.accessors[
          gltf.meshes[node.mesh!].primitives[0].attributes.POSITION
        ],
      view = gltf.bufferViews[accessor.bufferView],
      offset = binStart + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0),
      stride = view.byteStride ?? 12;
    const y: number[] = [],
      z: number[] = [];
    for (let i = 0; i < accessor.count; i++) {
      y.push(bytes.readFloatLE(offset + i * stride + 4));
      z.push(bytes.readFloatLE(offset + i * stride + 8));
    }
    expect(Math.min(...y)).toBeCloseTo(-2.5, 5);
    expect(Math.max(...y)).toBeCloseTo(
      Number(node.extras!.meniscusBottomY) + 0.025,
      5,
    );
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(0.17);
  }
  const ticks = nodes.filter((n) =>
    n.name.endsWith("graduations-0-top-50-bottom"),
  );
  expect(ticks).toHaveLength(2);
  for (const tick of ticks) {
    const mesh = gltf.meshes[tick.mesh!];
    expect(mesh.primitives[0].mode).toBe(1);
    expect(gltf.accessors[mesh.primitives[0].attributes.POSITION].count).toBe(
      102,
    );
  }
  await writeFile(
    `docs/qa/titration-calculations-${info.project.name}-burette.glb`,
    bytes,
  );
  await page.locator(".titration-burette-asset").screenshot({
    path: `docs/qa/titration-calculations-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
  await canvas.focus();
  for (let i = 0; i < 16; i++) await page.keyboard.press("ArrowRight");
  expect(Number(await canvas.getAttribute("data-rotation"))).toBeCloseTo(
    1.6,
    10,
  );
  await page.locator(".titration-burette-asset").screenshot({
    path: `docs/qa/titration-calculations-${info.project.name}-quarter-turn.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
});
test("unavailable WebGL preserves measured readings and numerical delivery", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (/webgl/i.test(type)) return null;
      return Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
  await page.goto(route);
  await expect(page.getByText(/3D is unavailable/)).toContainText(
    "initial 1.40 cm³",
  );
  await choices(page, {
    "Your delivered volume": "20",
    "Your NaOH amount": "0.002",
    "Your relationship": "final-minus-initial",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/titration-calculations-${info.project.name}-fallback.png`,
  );
});
test("wrong acid calculation survives targeted ratio recovery and reload", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 9);
  await page.getByLabel("Your answer", { exact: true }).fill("0.12");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Orient the reaction factor",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "0.12",
  );
  await expect(page.getByText(/could not be saved/i)).toHaveCount(0);
});
