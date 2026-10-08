import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { gasTestsJourney as j } from "../src/content/journeys/gas-tests-journey";
import { gasTestCases, type GasMode } from "../src/lib/gas-tests-cases";
import {
  expectedGas,
  gasFields,
  gasChoices,
} from "../src/lib/gas-tests-domain";
import { referenceGasDrawing } from "../src/lib/gas-tests-drawing";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import type { Question } from "../src/content/types";
test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  },
});
const route = "/lessons/gas-tests";
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
async function modeTask(
  p: Page,
  mode: GasMode,
): Promise<(typeof j.guided)[number]> {
  const guided = j.guided.findIndex((q) => q.model?.mode === mode);
  if (guided >= 0) {
    await p.getByRole("button", { name: "Learn", exact: true }).click();
    await task(p, guided);
    return j.guided[guided];
  }
  const index = j.refresher.findIndex((q) => q.model?.mode === mode);
  if (index >= 0) {
    await p.getByRole("button", { name: "Check", exact: true }).click();
    await p
      .getByRole("button", { name: "Revisit the key idea", exact: true })
      .click();
    await task(p, index);
    return j.refresher[index];
  }
  const practice = j.practice.findIndex((q) => q.model?.mode === mode);
  expect(practice).toBeGreaterThanOrEqual(0);
  await p.getByRole("button", { name: "Practise", exact: true }).click();
  await task(p, practice);
  await p
    .getByRole("button", { name: "Use the model for support", exact: true })
    .click();
  return j.practice[practice];
}
async function fill(root: Locator, mode: GasMode, record: string) {
  for (const [field, value] of Object.entries(expectedGas(mode, record))) {
    const input = root.locator(`[data-field="${field}"]`);
    if (await input.count()) await input.selectOption(value);
  }
}
async function answer(p: Page, q: Question) {
  if (q.gasDrawing) {
    const b = referenceGasDrawing(q.gasDrawing);
    await p.locator(".gas-drawing select").selectOption(b.placement);
    for (const key of ["material", "observation", "conclusion"] as const)
      await p.locator(`textarea[data-drawing-field="${key}"]`).fill(b[key]);
  } else if (q.rubric)
    await p.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await p.getByRole("radio", { name: q.answer, exact: true }).check();
  else await p.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function shot(p: Page, name: string, device: string) {
  const dir = path.join(process.cwd(), "test-results", "qa", "gas-tests");
  fs.mkdirSync(dir, { recursive: true });
  await p.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await p.screenshot({
    path: path.join(dir, `${device}-${name}.png`),
    fullPage: true,
    scale: "css",
  });
}
async function accessible(p: Page) {
  expect(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
  expect(
    await p
      .locator(
        ".gas-tests-workbench svg text,.gas-drawing svg text,.gas-cold-original svg text",
      )
      .evaluateAll((es) =>
        es.every((e) => {
          const m = (e as SVGGraphicsElement).getScreenCTM();
          return (
            parseFloat(getComputedStyle(e).fontSize) *
              (m ? Math.hypot(m.c, m.d) : 1) >=
            13.9
          );
        }),
      ),
  ).toBe(true);
}
for (const mode of Object.keys(gasTestCases) as GasMode[])
  test(`${mode}: real lesson retains a wrong proposal, original givens, undo, clear and reload`, async ({
    page,
  }, info) => {
    await page.goto(route);
    const q = await modeTask(page, mode),
      model = q.model!,
      root = page.locator(".gas-tests-workbench");
    const original = await root.locator(".gas-original").innerText();
    await fill(root, mode, model.record);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".gas-feedback")).toHaveClass(/gas-correct/);
    const first = gasFields[mode][0],
      wrong = gasChoices(mode, first, model.record).find(
        (v) => v !== expectedGas(mode, model.record)[first],
      )!;
    await root.locator(`[data-field="${first}"]`).selectOption(wrong);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".gas-feedback")).toHaveClass(/gas-reconsider/);
    expect(await root.locator(".gas-original").innerText()).toBe(original);
    await saved(page);
    await page.reload();
    await expect(root.locator(`[data-field="${first}"]`)).toHaveValue(wrong);
    await root.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(root.locator(`[data-field="${first}"]`)).toHaveValue(
      expectedGas(mode, model.record)[first],
    );
    await root.locator(`[data-field="${first}"]`).selectOption(wrong);
    await accessible(page);
    await shot(page, `native-${mode}`, info.project.name);
    await page.evaluate(() =>
      localStorage.setItem("unrelated-gas-sibling", "keep"),
    );
    await root
      .getByRole("button", { name: "Clear proposal", exact: true })
      .click();
    for (const field of gasFields[mode])
      await expect(root.locator(`[data-field="${field}"]`)).toHaveValue("");
    await saved(page);
    await page.reload();
    await expect(
      root.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
    expect(
      await page.evaluate(() => localStorage.getItem("unrelated-gas-sibling")),
    ).toBe("keep");
  });
test("all 26 practice tasks use real answers, honest self-review and targeted support", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < j.practice.length; i++) {
    const q = j.practice[i];
    await task(page, i);
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric
          ? `Save and review ${q.gasDrawing ? "gas-test diagram" : "explanation"}`
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      q.rubric ? "Compare your" : "That’s right",
    );
    if (q.gasDrawing)
      await expect(page.locator(".gas-drawing-review")).toBeVisible();
    await saved(page);
    expect(
      await page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work["gas-tests"].attempts[
            id
          ].at(-1).correct,
        { key: STORAGE_KEY, id: q.id },
      ),
    ).toBe(!q.rubric);
    expect(q.followUp).toBeTruthy();
  }
});
test("two cold forms and two delayed forms defer answers and preserve honest diagram review", async ({
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
        page.locator(".gas-tests-workbench,.gas-scene,.gas-drawing-review"),
      ).toHaveCount(0);
      await expect(page.locator(".assessment-review-criteria")).toHaveCount(0);
      if (j.checkForms[f][i].gasGiven) {
        await accessible(page);
        await shot(page, `sealed-pair-${f}`, info.project.name);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await expect(page.locator(".gas-drawing-review")).toHaveCount(0);
    }
    await page
      .getByRole("button", { name: "Submit whole set", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "6 of 6 correct", exact: true }),
    ).toBeVisible();
    await page
      .locator(".assessment-results details")
      .nth(j.checkForms[f].findIndex((q) => q.gasDrawing))
      .locator("summary")
      .click();
    await expect(page.locator(".gas-drawing-review")).toBeVisible();
    const diagramIndex = j.checkForms[f].findIndex((q) => q.gasDrawing);
    await expect(
      page
        .locator(".assessment-results details")
        .nth(diagramIndex)
        .locator(".assessment-review-criteria li"),
    ).toHaveText(j.checkForms[f][diagramIndex].rubric!);
    await expect(
      page.locator(
        ".assessment-results .gas-drawing textarea,.assessment-results .gas-drawing select",
      ),
    ).toHaveCount(0);
    await accessible(page);
    await shot(page, `submitted-drawing-${f}`, info.project.name);
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
    const next = page.getByRole("button", {
      name: "Try the next form",
      exact: true,
    });
    if (await next.count()) await expect(next).toBeDisabled();
    await saved(page);
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const r of p.work["gas-tests"].history)
          r.submitted = Date.now() - delay - 1000;
        p.work["gas-tests"].run.submitted = Date.now() - delay - 1000;
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
      await expect(page.locator(".gas-drawing-review")).toHaveCount(0);
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
  }
});
test("first scientific control fits a short screen and selected text remains readable at 320px", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 320 : 1280,
    height: info.project.name === "mobile" ? 664 : 720,
  });
  await page.goto(route);
  const field = page.locator('.gas-tests-workbench [data-field="material"]');
  await expect(field).toBeVisible();
  const box = (await field.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await field.selectOption("glowingSplint");
  await expect(field).toHaveValue("glowingSplint");
  await accessible(page);
  await shot(page, "opening-320", info.project.name);
});
test("blank saves do not reveal references and wrong drawings survive reload before scoped clear", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = j.practice.findIndex((q) => q.gasDrawing),
    q = j.practice[index];
  await task(page, index);
  const save = page.getByRole("button", {
    name: "Save and review gas-test diagram",
    exact: true,
  });
  await save.click();
  await expect(page.locator(".gas-drawing-review")).toHaveCount(0);
  await page.locator(".gas-drawing select").selectOption("away");
  await page.locator('[data-drawing-field="material"]').fill("Cold unlit wood");
  await page.locator('[data-drawing-field="observation"]').fill("A pop");
  await page
    .locator('[data-drawing-field="conclusion"]')
    .fill("Pure oxygen, retained overclaim");
  await saved(page);
  await page.reload();
  await expect(page.locator('[data-drawing-field="conclusion"]')).toHaveValue(
    "Pure oxygen, retained overclaim",
  );
  await save.click();
  await expect(page.locator(".gas-drawing-review")).toBeVisible();
  await expect(page.locator(".gas-drawing .gas-drawing-figure")).toContainText(
    "Pure oxygen, retained overclaim",
  );
  await expect(page.locator(".gas-drawing-review")).not.toContainText(
    "retained overclaim",
  );
  await accessible(page);
  await shot(page, "wrong-drawing-reference", info.project.name);
  await saved(page);
  expect(
    await page.evaluate(
      ({ key, id }) =>
        JSON.parse(localStorage.getItem(key)!).work["gas-tests"].attempts[
          id
        ].at(-1).correct,
      { key: STORAGE_KEY, id: q.id },
    ),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Clear construction", exact: true })
    .click();
  await expect(page.locator('[data-drawing-field="conclusion"]')).toHaveValue(
    "",
  );
  await expect(page.locator(".gas-drawing-review")).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(page.locator('[data-drawing-field="conclusion"]')).toHaveValue(
    "",
  );
});
test("actual 3D export preserves wrong choices and camera changes never change the saved answer", async ({
  page,
}, info) => {
  await page.goto(route);
  const root = page.locator(".gas-tests-workbench");
  await root.locator('[data-field="material"]').selectOption("glowingSplint");
  await root.locator('[data-field="placement"]').selectOption("inside");
  await expect(
    root.getByRole("button", { name: "Rotate left", exact: true }),
  ).toBeEnabled();
  await saved(page);
  const before = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    ),
    host = root.locator(".gas-canvas");
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
  await root
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  const download = await pending;
  const dir = path.join(process.cwd(), "test-results", "qa", "gas-tests");
  fs.mkdirSync(dir, { recursive: true });
  const output = path.join(dir, `${info.project.name}-wrong-hydrogen.glb`);
  await download.saveAs(output);
  const b = fs.readFileSync(output);
  expect(b.readUInt32LE(0)).toBe(0x46546c67);
  expect(b.readUInt32LE(4)).toBe(2);
  expect(b.readUInt32LE(8)).toBe(b.length);
  const doc = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
  const exported = doc.nodes.find(
    (n: { name: string }) => n.name === "Student gas-test apparatus proposal",
  );
  expect(exported.extras).toMatchObject({
    material: "glowingSplint",
    placement: "inside",
    observationsSimulated: false,
  });
  expect(exported.extras).not.toHaveProperty("expected");
  expect(exported.extras).not.toHaveProperty("result");
  await accessible(page);
  await shot(page, "actual-3d-wrong-hydrogen", info.project.name);
});
test("unavailable WebGL retains the 2D alternative, wrong choices, check and undo", async ({
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
  const root = page.locator(".gas-tests-workbench");
  await expect(root.locator(".gas-apparatus")).toBeVisible();
  await root.locator('[data-field="material"]').selectOption("glowingSplint");
  await root.locator('[data-field="placement"]').selectOption("inside");
  await root
    .getByRole("button", { name: "Check proposal", exact: true })
    .click();
  await expect(root.locator(".gas-feedback")).toHaveClass(/gas-reconsider/);
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[data-field="placement"]')).toHaveValue("");
  await accessible(page);
  await shot(page, "webgl-fallback", info.project.name);
});
test("the four school-test apparatus views render their actual chosen starting states", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto(route);
  for (let index = 0; index < 4; index++) {
    await task(page, index);
    const model = j.guided[index].model!,
      root = page.locator(".gas-tests-workbench");
    await fill(root, "procedure", model.record);
    await expect(
      root.getByRole("button", { name: "Rotate left", exact: true }),
    ).toBeEnabled();
    await expect(root.locator(".gas-canvas canvas")).toHaveCount(1);
    await root
      .getByRole("button", { name: "Check proposal", exact: true })
      .click();
    await expect(root.locator(".gas-feedback")).toHaveClass(/gas-correct/);
    await accessible(page);
    await shot(page, `apparatus-${model.record}`, info.project.name);
    if (model.record === "co2-delivery") {
      const pending = page.waitForEvent("download");
      await root
        .getByRole("button", { name: "Download 3D asset", exact: true })
        .click();
      const download = await pending;
      const directory = path.join(
        process.cwd(),
        "test-results",
        "qa",
        "gas-tests",
      );
      await download.saveAs(
        path.join(directory, `${info.project.name}-limewater-submerged.glb`),
      );
    }
  }
});
