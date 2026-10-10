import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { concentrationJourney as journey } from "../src/content/journeys/concentration";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
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
    page.locator(".concentration-workbench .feedback[role=status]"),
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
async function captureProse(page: Page, name: string, device: string) {
  await mkdir("test-results/qa/concentration-core-prose", { recursive: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  await page.screenshot({
    path: `test-results/qa/concentration-core-prose/${device}-${name}.png`,
    fullPage: true,
    scale: "css",
  });
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
test("converted volume predictions and raw-cm3 mistakes remain visible through undo reset and reload", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-and-concentration");
  const box = await page
    .getByLabel("Dissolved solute mass", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await select(page, "Your converted solution volume", "200");
  await select(page, "Your concentration", "0.02");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your converted solution volume", { exact: true }),
  ).toHaveValue("200");
  await expect(
    page.locator(".volume-conversion-axis figcaption"),
  ).toContainText("outside this axis");
  await select(page, "Your converted solution volume", "0.2");
  await select(page, "Your concentration", "20");
  await check(page, true);
  await expect(page.locator('[data-proposed-dm3="0.2"]')).toHaveAttribute(
    "x1",
    "178",
  );
  await capture(page, `docs/qa/concentration-${info.project.name}-unit.png`);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your concentration", { exact: true }),
  ).toHaveValue("unset");
  await expect(page.locator(".storage-warning")).toHaveCount(0);
});
test("final solution volume and dissolved solute are distinct from original solvent and whole-solution density", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-and-concentration");
  await task(page, 2);
  await select(page, "Chosen numerator mass", "whole");
  await select(page, "Your concentration", "1040");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Chosen numerator mass", { exact: true }),
  ).toHaveValue("whole");
  await select(page, "Chosen numerator mass", "solute");
  await select(page, "Chosen denominator volume", "solvent");
  await select(page, "Your concentration", "20");
  await check(page, false);
  await select(page, "Chosen denominator volume", "solution");
  await check(page, true);
  await capture(page, `docs/qa/concentration-${info.project.name}-basis.png`);
});
test("solute mass calculations multiply by converted sample volume and preserve a missing-conversion error", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-and-concentration");
  await task(page, 3);
  await select(page, "Your converted sample volume", "250");
  await select(page, "Your dissolved solute mass", "5000");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your dissolved solute mass", { exact: true }),
  ).toHaveValue("5000");
  await select(page, "Your converted sample volume", "0.25");
  await select(page, "Your dissolved solute mass", "5");
  await check(page, true);
  await select(page, "Supplied concentration", "4");
  await select(page, "Homogeneous solution sample volume", "25");
  await select(page, "Your converted sample volume", "0.025");
  await select(page, "Your dissolved solute mass", "0.1");
  await check(page, true);
  await capture(page, `docs/qa/concentration-${info.project.name}-mass.png`);
});
test("rearranged solution volume and reverse cubic conversion require both independent predictions", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-and-concentration");
  await task(page, 4);
  await select(page, "Your final solution volume", "0.25");
  await select(page, "Your converted final volume", "0.25");
  await check(page, false);
  await expect(page.locator('[data-proposed-cm3="0.25"]')).toHaveAttribute(
    "cx",
    "70.135",
  );
  await page.reload();
  await expect(
    page.getByLabel("Your converted final volume", { exact: true }),
  ).toHaveValue("0.25");
  await select(page, "Your converted final volume", "250");
  await check(page, true);
  await select(page, "Supplied dissolved solute mass", "4");
  await select(page, "Supplied concentration", "80");
  await select(page, "Your final solution volume", "0.05");
  await select(page, "Your converted final volume", "50");
  await check(page, true);
  await capture(page, `docs/qa/concentration-${info.project.name}-volume.png`);
});
test("actual binary solution asset retains ten macroscopic gram identities while box volume doubles", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-and-concentration");
  await select(page, "Dissolved solute mass", "10");
  await page
    .getByRole("button", { name: "Show 3D solution volume", exact: true })
    .click();
  const observed = [];
  for (const [cm3, dm3, concentration] of [
    ["250", "0.25", "40"],
    ["500", "0.5", "20"],
  ]) {
    await select(page, "Final solution volume", cm3);
    await select(page, "Your converted solution volume", dm3);
    await select(page, "Your concentration", concentration);
    await check(page, true);
    const scene = page.getByRole("group", {
      name: "Rotate solution volume",
      exact: true,
    });
    await expect(scene).toHaveAttribute("data-ready", "true");
    await scene.focus();
    await page.keyboard.press("ArrowRight");
    await expect(scene).not.toHaveAttribute("data-rotation", "0");
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download solution volume as GLB",
        exact: true,
      })
      .click();
    const download = await pending,
      path = `docs/qa/concentration-solution-${cm3}-${info.project.name}.glb`;
    await download.saveAs(path);
    const buffer = await readFile(path);
    expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
    expect(buffer.readUInt32LE(8)).toBe(buffer.length);
    const data = JSON.parse(
        buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
      ),
      nodes = data.nodes as {
        name?: string;
        mesh?: number;
        extras?: Record<string, unknown>;
        translation?: number[];
        matrix?: number[];
      }[],
      portions = nodes.filter((n) =>
        n.name?.startsWith("dissolved-solute-portion-"),
      );
    expect(portions).toHaveLength(10);
    expect(
      new Set(portions.map((n) => n.translation?.[2] ?? n.matrix?.[14])).size,
    ).toBeGreaterThanOrEqual(5);
    expect(portions.map((n) => n.extras?.portionId)).toEqual(
      Array.from({ length: 10 }, (_, i) => i),
    );
    expect(portions.reduce((sum, n) => sum + Number(n.extras?.grams), 0)).toBe(
      10,
    );
    const root = nodes.find((n) => n.name === "solution-volume-accounting")!;
    expect(root.extras?.solutionCm3).toBe(Number(cm3));
    expect(root.extras?.concentration).toBe(Number(concentration));
    const box = nodes.find((n) => n.name === "final-solution-volume")!,
      attribute = data.meshes[box.mesh!].primitives[0].attributes.POSITION,
      accessor = data.accessors[attribute],
      volume =
        accessor.max.reduce(
          (v: number, max: number, i: number) => v * (max - accessor.min[i]),
          1,
        ) / 64;
    expect(volume).toBeCloseTo(Number(dm3), 6);
    observed.push(volume);
  }
  expect(observed[1] / observed[0]).toBeCloseTo(2, 6);
  await capture(page, `docs/qa/concentration-${info.project.name}-3d.png`);
  await page.locator(".reaction-amounts-canvas").screenshot({
    path: `docs/qa/concentration-asset-${info.project.name}.png`,
  });
});
test("volume diagram labels stay readable and WebGL failure retains wrong quantity predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("/lessons/conservation-and-concentration");
  await select(page, "Your converted solution volume", "0.5");
  await select(page, "Your concentration", "8");
  await check(page, false);
  await page
    .getByRole("button", { name: "Show 3D solution volume", exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator('[data-proposed-dm3="0.5"]')).toHaveAttribute(
    "x1",
    "340",
  );
  const svg = page.locator(".volume-conversion-axis svg");
  for (const text of await svg.locator("text").all())
    expect(
      await text.evaluate(
        (e) =>
          parseFloat(getComputedStyle(e).fontSize) *
          Math.hypot(
            (e as SVGGraphicsElement).getScreenCTM()!.a,
            (e as SVGGraphicsElement).getScreenCTM()!.b,
          ),
      ),
    ).toBeGreaterThanOrEqual(12);
  await writeFile(
    `docs/qa/concentration-volume-${info.project.name}.svg`,
    await svg.evaluate((e) => e.outerHTML),
  );
  await capture(
    page,
    `docs/qa/concentration-${info.project.name}-fallback.png`,
  );
});
test("all twenty-two independent demands preserve constructed units and written responses remain self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-and-concentration");
  await page.getByRole("button", { name: "Warm-up", exact: true }).click();
  await answer(page, journey.warmup[0]);
  await page.locator(".sample-check-answer").click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "right",
  );
  await captureProse(page, "warmup", info.project.name);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page.locator(".sample-task-answer .feedback[role=status]"),
    ).toContainText(q.rubric ? "Compare your explanation" : "That’s right");
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "conservation-and-concentration"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "sc-v1-p-working")
      await captureProse(page, "working", info.project.name);
    if (q.parts)
      await capture(
        page,
        `docs/qa/concentration-${info.project.name}-independent.png`,
      );
  }
});
test("incorrect whole-solution numerator returns from targeted teaching without replacing saved working", async ({
  page,
}) => {
  await page.goto("/lessons/conservation-and-concentration");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 11);
  await page.getByLabel("Solute / g", { exact: true }).fill("430");
  await page.getByLabel("Solution / dm³", { exact: true }).fill("0.4");
  await page.getByLabel("Concentration / g/dm³", { exact: true }).fill("1075");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Name the numerator and denominator",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel("Solute / g", { exact: true })).toHaveValue(
    "430",
  );
  await expect(
    page.getByLabel("Concentration / g/dm³", { exact: true }),
  ).toHaveValue("1075");
});

test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/conservation-and-concentration");
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
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
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
                  "conservation-and-concentration"
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
      page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
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
      for (const run of p.work["conservation-and-concentration"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["conservation-and-concentration"].run.submitted =
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
