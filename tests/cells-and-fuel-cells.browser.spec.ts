import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { cellsJourney as journey } from "../src/content/journeys/cells-and-fuel-cells";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import { cellsRecords, type CellsMode } from "../src/lib/cells-and-fuel-cells";
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
    page.locator(".cells-workbench .feedback[role=status]"),
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
  if (q.options)
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

const route = "/lessons/cells-and-fuel-cells";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/cells-and-fuel-cells");
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
      if (i === 0 && !q.options) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/cells-and-fuel-cells-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "cells-and-fuel-cells"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(form === 0);
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
      for (const run of p.work["cells-and-fuel-cells"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["cells-and-fuel-cells"].run.submitted = Date.now() - delay - 1000;
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
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});

test("all original practice works while three written explanations remain self-reviewed", async ({
  page,
}) => {
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
                "cells-and-fuel-cells"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
  }
});
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
const fieldLabels: Record<string, string> = {
  left: "Your left electrode",
  right: "Your right electrode",
  liquid: "Your electrolyte",
  volts: "Your predicted voltage / V",
  connection: "Your cell connection",
  count: "Your number of cells",
  reversed: "Your number of reversed cells",
  action: "Your restoration action",
  reason: "Your supporting reason",
  hydrogen: "Your H₂ coefficient",
  oxygen: "Your O₂ coefficient",
  water: "Your H₂O coefficient",
  source: "Your selected source",
  evidence: "Your comparison evidence",
  claim: "Your supported chemical claim",
};
async function scenario(page: Page, key: string) {
  await page.getByText("Choose another supplied case", { exact: true }).click();
  await select(page, "Supplied cells investigation", key);
  await page.getByText("Choose another supplied case", { exact: true }).click();
}
async function prediction(page: Page, mode: CellsMode, record: string) {
  const r = (cellsRecords[mode] as Record<string, Record<string, unknown>>)[
    record
  ];
  for (const [field, label] of Object.entries(fieldLabels))
    if (field in r) {
      const control = page.getByLabel(label, { exact: true });
      if (typeof r[field] === "number") await control.fill(String(r[field]));
      else await control.selectOption(String(r[field]));
    }
  if (mode === "series") await select(page, "Your cell connection", "series");
}
for (const [index, mode] of [
  "setup",
  "series",
  "restore",
  "reaction",
  "compare",
  "evidence",
].entries()) {
  test(`${mode} covers every supplied record, retains incorrect predictions and exposes an accessible first control`, async ({
    page,
  }, info) => {
    await learn(page, index + 1);
    await page.evaluate(() => scrollTo(0, 0));
    const first = page
      .locator(".cells-workbench input,.cells-workbench select")
      .first();
    const box = await first.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
    await first.focus();
    await expect(first).toBeFocused();
    for (const record of Object.keys(cellsRecords[mode as CellsMode])) {
      if (record !== "initial") await scenario(page, record);
      await check(page, false);
      await prediction(page, mode as CellsMode, record);
      await check(page, true);
    }
    await scenario(page, "initial");
    await prediction(page, mode as CellsMode, "initial");
    await check(page, true);
    await capture(
      page,
      `docs/qa/cells-and-fuel-cells-${info.project.name}-${mode}.png`,
    );
  });
}
test("series keeps a scientific wrong voltage across reload, undo and reset without silently fixing polarity", async ({
  page,
}) => {
  await learn(page, 2);
  await scenario(page, "oppose");
  await prediction(page, "series", "oppose");
  await page
    .getByLabel("Your predicted voltage / V", { exact: true })
    .fill("6");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your predicted voltage / V", { exact: true }),
  ).toHaveValue("6");
  await expect(
    page.getByLabel("Your number of reversed cells", { exact: true }),
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your predicted voltage / V", { exact: true }),
  ).toHaveValue("3");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your number of cells", { exact: true }),
  ).toHaveValue("0");
  await expect(
    page.getByLabel("Your cell connection", { exact: true }),
  ).toHaveValue("unset");
  await saved(page);
  await page.reload();
  await check(page, false);
});
test("invalid decimal input remains visible and blocks model checking without corrupting the saved scientific state", async ({
  page,
}) => {
  await learn(page, 1);
  await prediction(page, "setup", "initial");
  await page
    .getByLabel("Your predicted voltage / V", { exact: true })
    .fill("1/2");
  await check(page, false);
  await expect(
    page.getByLabel("Your predicted voltage / V", { exact: true }),
  ).toHaveValue("1/2");
  await expect(page.locator(".cells-workbench .feedback")).toContainText(
    "valid decimal",
  );
  await page
    .getByLabel("Your predicted voltage / V", { exact: true })
    .fill("1.1");
  await check(page, true);
});
test("a wrong reaction answer returns from targeted refresher with its original retained draft", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex((q) => q.id === "cf-v1-p-double");
  await task(page, index + 1);
  await page.getByLabel("Your answer", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "Not yet.",
  );
  await page.getByRole("button", { name: /Revisit/ }).click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "2",
  );
  await capture(
    page,
    `docs/qa/cells-and-fuel-cells-${info.project.name}-recovery.png`,
  );
});
test("real cell apparatus retains constituents, rotates by keyboard and exports finite three-dimensional geometry", async ({
  page,
}, info) => {
  await learn(page, 1);
  await prediction(page, "setup", "initial");
  await page
    .getByText("Inspect the real 3D simple cell", { exact: true })
    .click();
  const group = page.getByRole("group", {
    name: "Rotate simple cell apparatus",
    exact: true,
  });
  await expect(group).toHaveAttribute("data-ready", "true");
  await group.focus();
  await page.keyboard.press("ArrowRight");
  await expect(group).toHaveAttribute("data-rotation", "0.1");
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(group).toHaveAttribute("data-rotation", "0");
  await select(page, "Your right electrode", "magnesium");
  await expect(group).toHaveAttribute("data-ready", "true");
  await expect(page.locator(".simple-cell-asset figcaption")).toContainText(
    "magnesium",
  );
  await expect(
    page.getByLabel("Your predicted voltage / V", { exact: true }),
  ).toHaveValue("1.1");
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  const download = await wait,
    path = `docs/qa/cells-and-fuel-cells-${info.project.name}-cell.glb`;
  await download.saveAs(path);
  const { readFile } = await import("node:fs/promises"),
    raw = await readFile(path);
  expect(raw.toString("ascii", 0, 4)).toBe("glTF");
  expect(raw.readUInt32LE(4)).toBe(2);
  expect(raw.readUInt32LE(8)).toBe(raw.length);
  const json = JSON.parse(raw.toString("utf8", 20, 20 + raw.readUInt32LE(12)));
  const root = json.nodes.find(
    (n: { name?: string }) => n.name === "macroscopic-simple-cell-cutaway",
  );
  expect(root.extras).toMatchObject({
    leftElectrode: "copper",
    rightElectrode: "magnesium",
    electrolyte: "sodium-chloride",
  });
  expect(
    json.nodes.filter(
      (n: { extras?: { kind?: string } }) =>
        n.extras?.kind === "metal-electrode",
    ),
  ).toHaveLength(2);
  expect(
    json.nodes.filter(
      (n: { extras?: { kind?: string } }) => n.extras?.kind === "external-wire",
    ),
  ).toHaveLength(2);
  const binary = 20 + raw.readUInt32LE(12) + 8;
  let vertices = 0;
  const values: number[] = [];
  for (const a of json.accessors.filter(
    (a: { type: string; componentType: number }) =>
      a.type === "VEC3" && a.componentType === 5126,
  )) {
    const view = json.bufferViews[a.bufferView];
    for (let i = 0; i < a.count; i++)
      for (let axis = 0; axis < 3; axis++)
        values.push(
          raw.readFloatLE(
            binary +
              (view.byteOffset ?? 0) +
              (a.byteOffset ?? 0) +
              i * (view.byteStride ?? 12) +
              axis * 4,
          ),
        );
    vertices += a.count;
  }
  expect(vertices).toBeGreaterThan(1000);
  expect(values).toHaveLength(vertices * 3);
  expect(values.every(Number.isFinite)).toBe(true);
  await select(page, "Your right electrode", "zinc");
  await check(page, true);
  await expect(group).toHaveAttribute("data-ready", "true");
  const canonicalWaiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  const canonical = await canonicalWaiting;
  const canonicalPath = `docs/qa/cells-and-fuel-cells-${info.project.name}-copper-zinc.glb`;
  await canonical.saveAs(canonicalPath);
  const canonicalRaw = await readFile(canonicalPath);
  const canonicalJSON = JSON.parse(
    canonicalRaw.toString("utf8", 20, 20 + canonicalRaw.readUInt32LE(12)),
  );
  expect(
    canonicalJSON.nodes.find(
      (n: { name?: string }) => n.name === "macroscopic-simple-cell-cutaway",
    ).extras,
  ).toMatchObject({
    leftElectrode: "copper",
    rightElectrode: "zinc",
    electrolyte: "sodium-chloride",
  });
  await capture(
    page,
    `docs/qa/cells-and-fuel-cells-${info.project.name}-3d.png`,
  );
  const style = await page.addStyleTag({
    content: ".mobile-bar,.skip-link{visibility:hidden!important}",
  });
  await page.locator(".simple-cell-asset").screenshot({
    path: `docs/qa/cells-and-fuel-cells-${info.project.name}-enlarged3d.png`,
  });
  await style.evaluate((n) => n.parentNode?.removeChild(n));
});
test("unavailable WebGL retains cell constituents, text diagram and working predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await learn(page, 1);
  await prediction(page, "setup", "initial");
  await page
    .getByText("Inspect the real 3D simple cell", { exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "3D is unavailable." }),
  ).toBeVisible();
  await expect(page.locator(".cell-apparatus svg")).toBeVisible();
  await check(page, true);
  await capture(
    page,
    `docs/qa/cells-and-fuel-cells-${info.project.name}-fallback.png`,
  );
});
