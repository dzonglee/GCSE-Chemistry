import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { ionTestsJourney as j } from "../src/content/journeys/ion-tests";
import {
  ionRecords,
  ionChoices,
  ionFields,
  type IonMode,
} from "../src/lib/ion-tests";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  },
});
const route = "/lessons/ion-tests";
async function saved(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(p: Page, index: number) {
  const picker = p.getByLabel("Choose a practice task", { exact: true });
  if (await picker.count()) await picker.selectOption(String(index));
  else
    await p
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
}
async function fill(root: Locator, record: string) {
  for (const [field, value] of Object.entries(ionRecords[record].expected))
    await root.locator(`[data-field="${field}"]`).selectOption(value);
}
async function answer(p: Page, q: Question) {
  if (q.parts) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts)
      await p.getByLabel(part.label, { exact: true }).fill(values[part.id]);
  } else if (q.rubric)
    await p
      .getByLabel(q.writtenEquations ? "Your equations" : "Your explanation", {
        exact: true,
      })
      .fill(q.answer);
  else await p.getByRole("radio", { name: q.answer, exact: true }).check();
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
  const dir = path.join(process.cwd(), "test-results", "qa", "ion-tests");
  fs.mkdirSync(dir, { recursive: true });
  await p.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
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
  "flame",
  "hydroxide",
  "anion",
  "fault",
  "equation",
  "compound",
] as IonMode[])
  test(`${mode}: original science, wrong proposal, undo, scoped clear and reload`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const index = j.guided.findIndex(
      (q) =>
        q.model?.kind === "ion-test-investigation" && q.model.mode === mode,
    );
    await task(page, index);
    const model = j.guided[index].model;
    if (model?.kind !== "ion-test-investigation")
      throw new Error("Missing ion task model");
    const root = page.locator(".ion-tests-workbench"),
      original = await root.locator(".ion-original").innerText();
    await fill(root, model.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".ion-feedback")).toHaveClass(/ion-correct/);
    const field = ionFields[mode][0],
      wrong = ionChoices[field].find(
        (v) => v !== ionRecords[model.record].expected[field],
      )!;
    await root.locator(`[data-field="${field}"]`).selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".ion-feedback")).toHaveClass(/ion-reconsider/);
    expect(await root.locator(".ion-original").innerText()).toBe(original);
    await saved(page);
    await page.reload();
    await expect(root.locator(`[data-field="${field}"]`)).toHaveValue(wrong);
    expect(await root.locator(".ion-original").innerText()).toBe(original);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await accessible(page);
    await shot(page, `native-${mode}`, info.project.name);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(root.locator(`[data-field="${field}"]`)).toHaveValue(
      ionRecords[model.record].expected[field],
    );
    await page.evaluate(() => localStorage.setItem("unrelated-study", "keep"));
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const f of ionFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
    expect(
      await page.evaluate(() => localStorage.getItem("unrelated-study")),
    ).toBe("keep");
    await saved(page);
    await page.reload();
    for (const f of ionFields[mode])
      await expect(root.locator(`[data-field="${f}"]`)).toHaveValue("");
  });
test("first ion control is usable on a short screen and long selected values stay readable at 320px", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 320 : 1280,
    height: info.project.name === "mobile" ? 664 : 720,
  });
  await page.goto(route);
  const field = page.locator('.ion-tests-workbench [data-field="observation"]');
  const b = (await field.boundingBox())!;
  expect(b.y + b.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await field.selectOption("lilac");
  await expect(page.locator(".ion-selected")).toContainText("Lilac flame");
  await accessible(page);
  await shot(page, "opening-320", info.project.name);
});
test("all 35 practice responses use real answers, coefficient construction and honest written review", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    await task(page, i);
    const q = j.practice[i];
    if (q.model)
      await expect(page.locator(".ion-tests-workbench")).toHaveCount(0);
    await answer(page, q);
    await page.locator(".sample-check-answer").click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare" : "right",
    );
    if (q.rubric) {
      await accessible(page);
      await shot(page, "extended-plan-practice-" + i, info.project.name);
    }
    await saved(page);
    const result = await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["ion-tests"].attempts[
          id
        ].at(-1),
      { key: STORAGE_KEY, id: q.id },
    );
    expect(result.correct).toBe(!q.rubric);
  }
});
test("two reserved ten-question forms and delayed five-question forms keep marking sealed and criteria explicit", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let f = 0; f < 2; f++) {
    for (let i = 0; i < 10; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      await answer(page, j.checkForms[f][i]);
      await expect(
        page.locator(
          ".ion-tests-workbench,.ion-scene,.assessment-review-criteria",
        ),
      ).toHaveCount(0);
      if (i === 4) {
        await expect(
          page.getByText("Smallest positive whole-number coefficients", {
            exact: true,
          }),
        ).toBeVisible();
        await accessible(page);
        await shot(page, `sealed-equation-${f}`, info.project.name);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "9 of 9 correct", exact: true }),
    ).toBeVisible();
    const index = j.checkForms[f].findIndex((q) => q.rubric);
    const card = page.locator(".assessment-results details").nth(index);
    await card.locator("summary").click();
    await expect(card.locator(".assessment-review-criteria li")).toHaveText(
      j.checkForms[f][index].rubric!,
    );
    await accessible(page);
    await shot(page, `submitted-plan-${f}`, info.project.name);
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
        for (const r of p.work["ion-tests"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["ion-tests"].run.submitted = Date.now() - delay - 1000;
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
    for (let i = 0; i < 5; i++) {
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
      page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
    ).toBeVisible();
  }
});
test("reading both original hydroxide stages leaves the chemical proposal unchanged", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const root = page.locator(".ion-tests-workbench");
  await fill(root, "oh-al");
  await saved(page);
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  await root
    .getByRole("button", { name: "2. Excess sodium hydroxide", exact: true })
    .click();
  await expect(root.locator(".ion-recorded")).toContainText(
    "Precipitate dissolves",
  );
  const stages = root.getByRole("group", { name: "Read the recorded stages" });
  await expect(stages.locator('button[aria-pressed="true"]')).toHaveCount(1);
  const stageColours = await stages
    .locator("button")
    .evaluateAll((buttons) =>
      buttons.map((b) => getComputedStyle(b).backgroundColor),
    );
  expect(stageColours[0]).not.toBe(stageColours[1]);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(before);
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await accessible(page);
  await shot(page, "hydroxide-excess", info.project.name);
});
test("a wrong equation shows actual zero and charge imbalance, then the smallest positive ratio", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 10);
  const root = page.locator(".ion-tests-workbench");
  await root.locator('[data-field="metal"]').selectOption("1");
  await root.locator('[data-field="hydroxide"]').selectOption("2");
  await root.locator('[data-field="product"]').selectOption("1");
  await expect(root.locator(".ion-ledger tbody tr").last()).toContainText("1");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".ion-feedback")).toHaveClass(/ion-reconsider/);
  await accessible(page);
  await shot(page, "wrong-charge-equation", info.project.name);
  await root.locator('[data-field="hydroxide"]').selectOption("3");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".ion-feedback")).toHaveClass(/ion-correct/);
  await root.locator('[data-field="metal"]').selectOption("0");
  await expect(root.locator(".ion-equation")).toContainText("0 Fe");
});
test("real 3D portions export current wrong reagents, preserve camera-independent work and retain fresh separation", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  const root = page.locator(".ion-tests-workbench");
  await fill(root, "anion-cl");
  await root.locator('[data-field="portion"]').selectOption("reused");
  await root.locator('[data-field="acid"]').selectOption("hydrochloric");
  await expect(
    root.getByRole("button", { name: "Rotate left", exact: true }),
  ).toBeEnabled();
  await saved(page);
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  const canvas = root.locator(".ion-canvas");
  const pose = await canvas.getAttribute("data-yaw");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  expect(await canvas.getAttribute("data-yaw")).not.toBe(pose);
  await canvas.scrollIntoViewIfNeeded();
  const bounds = (await canvas.boundingBox())!;
  const keyboardPose = await canvas.getAttribute("data-yaw");
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 24,
    bounds.y + bounds.height / 2 + 8,
    { steps: 5 },
  );
  await page.mouse.up();
  expect(await canvas.getAttribute("data-yaw")).not.toBe(keyboardPose);
  await root.getByRole("button", { name: "Reset view", exact: true }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(before);
  const pending = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  const download = await pending;
  const dir = path.join(process.cwd(), "test-results", "qa", "ion-tests");
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `${info.project.name}-wrong-portion.glb`);
  await download.saveAs(target);
  const bytes = fs.readFileSync(target);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  const doc = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  const node = doc.nodes.find(
    (n: { name: string }) => n.name === "Student ion-test portion proposal",
  );
  expect(node.extras).toMatchObject({
    portion: "reused",
    acid: "hydrochloric",
    selectedTube: 2,
    observationsSimulated: false,
  });
  expect(node.extras).not.toHaveProperty("expected");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await accessible(page);
  await shot(page, "wrong-portion-3d", info.project.name);
  await root.locator('[data-field="portion"]').selectOption("fresh");
  await root.locator('[data-field="acid"]').selectOption("nitric");
  await expect(
    root.getByRole("button", { name: "Rotate left", exact: true }),
  ).toBeEnabled();
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".ion-feedback")).toHaveClass(/ion-correct/);
  await shot(page, "fresh-portion-3d", info.project.name);
  // The close-up includes all view controls. Give this capture enough height
  // to keep the sticky mobile header above it; the functional checks above
  // and full-page sample still use the original short viewport.
  const originalViewport = page.viewportSize()!;
  const sceneHeight = (await root.locator(".ion-scene").boundingBox())!.height;
  await page.setViewportSize({
    width: originalViewport.width,
    height: Math.max(originalViewport.height, Math.ceil(sceneHeight) + 160),
  });
  await root.locator(".ion-scene").evaluate((el) => {
    el.scrollIntoView({ block: "start" });
    window.scrollBy(0, -80);
  });
  const sceneBounds = (await root.locator(".ion-scene").boundingBox())!;
  expect(sceneBounds.y).toBeGreaterThanOrEqual(79);
  expect(sceneBounds.y + sceneBounds.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await root.locator(".ion-scene").screenshot({
    path: path.join(dir, `${info.project.name}-focused-3d.png`),
    scale: "css",
  });
  await page.setViewportSize(originalViewport);
  const freshPending = page.waitForEvent("download");
  await root
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  await (
    await freshPending
  ).saveAs(path.join(dir, `${info.project.name}-fresh-portion.glb`));
});
test("unavailable WebGL retains readable portions and wrong scientific choices", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto(route);
  await task(page, 5);
  const root = page.locator(".ion-tests-workbench");
  await expect(root.locator(".ion-portions-2d")).toBeVisible();
  await fill(root, "anion-cl");
  await root.locator('[data-field="portion"]').selectOption("reused");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".ion-feedback")).toHaveClass(/ion-reconsider/);
  await expect(root.locator(".ion-portion-selected")).toContainText(
    "Already treated",
  );
  await accessible(page);
  await shot(page, "webgl-fallback", info.project.name);
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[data-field="portion"]')).toHaveValue("fresh");
});
test("wrong practice response offers its specific recovery and returns to the retained task", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = j.practice.findIndex((q) => q.id === "ion-tests-v1-p-br");
  await task(page, index);
  await page
    .getByRole("radio", { name: "White precipitate", exact: true })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".ion-tests-workbench")).toHaveAttribute(
    "data-ion-record",
    "anion-br",
  );
  await accessible(page);
  await shot(page, "targeted-bromide-recovery", info.project.name);
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "White precipitate", exact: true }),
  ).toBeChecked();
});
