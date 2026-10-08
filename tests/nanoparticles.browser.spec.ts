import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { nanoparticlesJourney as journey } from "../src/content/journeys/nanoparticles";
import { nanoBlocks } from "../src/lib/nanoparticles";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) {
    await picker.selectOption(String(n - 1));
    return;
  }
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".nano-workbench .feedback[role=status]"),
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
test("subdivision retains wrong volume and exports real equal-scale material cubes", async ({
  page,
}, info) => {
  await page.goto("/lessons/particles-and-nanoparticles");
  const divisions = page.getByLabel("Subdivisions per edge", { exact: true }),
    box = await divisions.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await divisions.selectOption("2");
  await page
    .getByLabel("Expose cut faces", { exact: true })
    .selectOption("yes");
  await page
    .getByLabel("Total exposed surface area", { exact: true })
    .selectOption("larger");
  await page
    .getByLabel("Total material volume", { exact: true })
    .selectOption("larger");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Total material volume", { exact: true }),
  ).toHaveValue("larger");
  await page
    .getByLabel("Total material volume", { exact: true })
    .selectOption("same");
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate nanoparticle subdivision",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-particles", "8");
  const rotation = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", rotation!);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download cubes as GLB", exact: true })
    .click();
  const download = await pending,
    path = `docs/qa/nano-subdivision-${info.project.name}.glb`;
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  const nodes = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  ).nodes as {
    name?: string;
    translation?: number[];
    matrix?: number[];
    scale?: number[];
    extras?: {
      pieceId?: number;
      side?: number;
      totalMaterialVolume?: number;
      exposedSurfaceArea?: number;
    };
  }[];
  const cubes = nodes.filter((n) => /^material-cube-\d+$/.test(n.name ?? ""));
  expect(cubes).toHaveLength(8);
  const group = nodes.find((n) => n.name === "nano-cube-subdivision")!;
  expect(group.extras!.totalMaterialVolume).toBe(216);
  expect(group.extras!.exposedSurfaceArea).toBe(432);
  for (const n of cubes) {
    const p = n.translation ?? n.matrix!.slice(12, 15),
      expected = nanoBlocks(2, true)[n.extras!.pieceId!];
    p.forEach((v, i) => expect(v).toBeCloseTo(expected.position[i], 6));
    expect(n.extras!.side).toBe(3);
    const scale =
      n.scale ??
      [0, 1, 2].map((k) => Math.hypot(...n.matrix!.slice(k * 4, k * 4 + 3)));
    for (const s of scale) expect(s).toBeCloseTo(3, 6);
  }
  await capture(
    page,
    `docs/qa/nanoparticles-${info.project.name}-subdivision.png`,
  );
  await page.getByLabel("Expose cut faces", { exact: true }).selectOption("no");
  await check(page, false);
  await page
    .getByLabel("Total exposed surface area", { exact: true })
    .selectOption("same");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(divisions).toHaveValue("1");
});
test("cube calculation requires all six faces cubic volume and inverse-length quotient", async ({
  page,
}, info) => {
  await page.goto("/lessons/particles-and-nanoparticles");
  await task(page, 2);
  for (const [side, area, volume, ratio] of [
    ["2", "24", "8", "3"],
    ["4", "96", "64", "1.5"],
    ["6", "216", "216", "1"],
  ]) {
    await page
      .getByLabel("Cube side in nm", { exact: true })
      .selectOption(side);
    await page
      .getByLabel("Your six-face area in nm²", { exact: true })
      .selectOption(area);
    await page
      .getByLabel("Your volume in nm³", { exact: true })
      .selectOption(volume);
    await page
      .getByLabel("Numerical area ÷ volume in nm⁻¹", { exact: true })
      .selectOption("6");
    await check(page, false);
    await page
      .getByLabel("Numerical area ÷ volume in nm⁻¹", { exact: true })
      .selectOption(ratio);
    await check(page, true);
  }
  await capture(page, `docs/qa/nanoparticles-${info.project.name}-cube.png`);
});
test("matching-unit length comparisons reject atom-count inference and retain incorrect conversion", async ({
  page,
}, info) => {
  await page.goto("/lessons/particles-and-nanoparticles");
  await task(page, 3);
  await page
    .getByLabel("Diameter in metres", { exact: true })
    .selectOption("4e-7");
  await page
    .getByLabel("Diameter compared with 0.2 nm atom", { exact: true })
    .selectOption("200");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Diameter in metres", { exact: true }),
  ).toHaveValue("4e-7");
  for (const [diameter, metres, multiple] of [
    ["20", "2e-8", "100"],
    ["40", "4e-8", "200"],
    ["80", "8e-8", "400"],
  ]) {
    await page
      .getByLabel("Supplied nanoparticle diameter", { exact: true })
      .selectOption(diameter);
    await page
      .getByLabel("Diameter in metres", { exact: true })
      .selectOption(metres);
    await page
      .getByLabel("Diameter compared with 0.2 nm atom", { exact: true })
      .selectOption(multiple);
    await check(page, true);
  }
  await capture(page, `docs/qa/nanoparticles-${info.project.name}-scale.png`);
});
test("application-specific performance evidence cannot establish universal safety", async ({
  page,
}, info) => {
  await page.goto("/lessons/particles-and-nanoparticles");
  await task(page, 4);
  for (const application of ["coating", "catalyst"]) {
    await page
      .getByLabel("Inspect supplied application", { exact: true })
      .selectOption(application);
    await page
      .getByLabel("Supported benefit", { exact: true })
      .selectOption("less");
    await page
      .getByLabel("Conclusion about risk", { exact: true })
      .selectOption("safe");
    await check(page, false);
    await page
      .getByLabel("Conclusion about risk", { exact: true })
      .selectOption("study");
    await check(page, true);
  }
  await capture(
    page,
    `docs/qa/nanoparticles-${info.project.name}-evidence.png`,
  );
});
test("all twenty-one independent tasks mark original sizes cubes evidence and ungraded written responses", async ({
  page,
}, info) => {
  await page.goto("/lessons/particles-and-nanoparticles");
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
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "particles-and-nanoparticles"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (i === 8)
      await capture(
        page,
        `docs/qa/nanoparticles-${info.project.name}-independent.png`,
      );
  }
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/particles-and-nanoparticles");
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
                  "particles-and-nanoparticles"
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
      for (const run of p.work["particles-and-nanoparticles"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["particles-and-nanoparticles"].run.submitted =
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
test("WebGL fallback preserves cube count and incorrect prediction with accessible six-face interpretation", async ({
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
      return original.call(this, type as never, ...(args as []));
    } as typeof original;
  });
  await page.goto("/lessons/particles-and-nanoparticles");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Subdivisions per edge", { exact: true })
    .selectOption("3");
  await page
    .getByLabel("Expose cut faces", { exact: true })
    .selectOption("yes");
  await expect(page.locator("[data-nano-block]")).toHaveCount(27);
  await page
    .getByLabel("Total exposed surface area", { exact: true })
    .selectOption("same");
  await page
    .getByLabel("Total material volume", { exact: true })
    .selectOption("same");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Total exposed surface area", { exact: true }),
  ).toHaveValue("same");
  await expect(page.locator("[data-nano-block]")).toHaveCount(27);
  await capture(
    page,
    `docs/qa/nanoparticles-${info.project.name}-fallback.png`,
  );
});
test("conversion recovery returns to the original incorrect independent draft", async ({
  page,
}) => {
  await page.goto("/lessons/particles-and-nanoparticles");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page.getByLabel("Your answer", { exact: true }).fill("60");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Convert nanometres", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "60",
  );
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "60",
  );
});
