import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { graphiteJourney as journey } from "../src/content/journeys/graphite";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".graphite-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/graphite", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
test("graphite retains wrong coordination and exports genuine connected layered planar geometry", async ({
  page,
}, info) => {
  await page.goto("/lessons/graphite");
  const count = page.getByLabel("Bonded neighbours", { exact: true });
  const box = await count.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await count.selectOption("4");
  await check(page, false);
  await page.reload();
  await expect(count).toHaveValue("4");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(count).toHaveValue("0");
  await count.selectOption("3");
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate graphite layers",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-atoms", "96");
  const rotation = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", rotation!);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download network as GLB", exact: true })
    .click();
  const download = await downloadPromise;
  const path = `test-results/qa/graphite/graphite-network-${info.project.name}.glb`;
  await mkdir("test-results/qa/graphite", { recursive: true });
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(4)).toBe(2);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  const gltf = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  );
  type Node = {
    name?: string;
    translation?: number[];
    matrix?: number[];
    extras?: {
      carbonA?: number;
      carbonB?: number;
      selectedCarbon?: number;
      selectedNeighbours?: number[];
    };
  };
  const nodes = gltf.nodes as Node[];
  const atoms = nodes.filter((n) => /^carbon-\d+$/.test(n.name ?? ""));
  const bonds = nodes.filter((n) => /^covalent-bond-/.test(n.name ?? ""));
  expect(atoms).toHaveLength(96);
  expect(bonds).toHaveLength(120);
  const positions = new Map(
    atoms.map((n) => [
      Number(n.name!.slice(7)),
      n.translation ?? n.matrix!.slice(12, 15),
    ]),
  );
  expect(new Set([...positions.values()].map((p) => p[2])).size).toBe(3);
  const edges = bonds.map((n) => [n.extras!.carbonA!, n.extras!.carbonB!]);
  const expected: string[] = [];
  for (const [a, p] of positions)
    for (const [b, q] of positions)
      if (
        a < b &&
        Math.abs(p.reduce((s, v, i) => s + (v - q[i]) ** 2, 0) - 0.25) < 1e-6
      )
        expected.push(`${a},${b}`);
  expect(
    edges.map(([a, b]) => `${Math.min(a, b)},${Math.max(a, b)}`).sort(),
  ).toEqual(expected.sort());
  const reached = new Set([0]);
  for (let i = 0; i < 96; i++)
    for (const [a, b] of edges) {
      if (reached.has(a)) reached.add(b);
      if (reached.has(b)) reached.add(a);
    }
  expect(reached.size).toBe(32);
  const group = nodes.find(
    (n) => n.name === "graphite-layered-network-fragment",
  )!;
  const center = positions.get(group.extras!.selectedCarbon!)!;
  const vectors = group.extras!.selectedNeighbours!.map((id) =>
    positions.get(id)!.map((v, i) => v - center[i]),
  );
  expect(vectors).toHaveLength(3);
  for (let a = 0; a < 3; a++) {
    expect(vectors[a].reduce((s, v) => s + v * v, 0)).toBeCloseTo(0.25);
    for (let b = a + 1; b < 3; b++)
      expect(
        vectors[a].reduce((s, v, i) => s + v * vectors[b][i], 0),
      ).toBeCloseTo(-0.125);
  }
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphite/graphite-${info.project.name}-network.png`,
  );
  for (const site of ["1", "2"]) {
    await page
      .getByLabel("Inspect a sheet", { exact: true })
      .selectOption(site);
    await check(page, true);
    await expect(scene).toHaveAttribute("data-ready", "true");
  }
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(count).toHaveValue("0");
});
test("graphite has a usable accurate projection when WebGL is unavailable", async ({
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
      return original.call(this, type as "2d", ...(args as []));
    } as typeof original;
  });
  await page.goto("/lessons/graphite");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Bonded neighbours", { exact: true }).selectOption("4");
  await check(page, false);
  await expect(page.locator("[data-graphite-carbon]")).toHaveCount(96);
  await expect(page.locator("[data-graphite-bond]")).toHaveCount(120);
  await expect(
    page.locator('[data-graphite-selected-bond="true"]'),
  ).toHaveCount(3);
  await expect(
    page.getByLabel("Bonded neighbours", { exact: true }),
  ).toHaveValue("4");
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphite/graphite-${info.project.name}-projection.png`,
  );
});
test("sliding moves one whole sheet and electron drift moves carriers with carbon positions fixed", async ({
  page,
}, info) => {
  await page.goto("/lessons/graphite");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Interaction overcome during sliding", { exact: true })
    .selectOption("covalent");
  await page
    .getByLabel("Within-sheet bonds after sliding", { exact: true })
    .selectOption("break");
  await check(page, false);
  const carbon = () =>
    page
      .locator("[data-graphite-carbon] circle")
      .evaluateAll((nodes) =>
        nodes.map((n) => [n.getAttribute("cx"), n.getAttribute("cy")]),
      );
  const before = await carbon();
  await page
    .getByRole("button", { name: "Slide the upper sheet", exact: true })
    .click();
  const after = await carbon();
  expect(after.slice(0, 64)).toEqual(before.slice(0, 64));
  expect(after.slice(64)).not.toEqual(before.slice(64));
  const lengths = await page
    .locator("[data-graphite-bond]")
    .evaluateAll((nodes) =>
      nodes.map((n) =>
        Math.hypot(
          Number(n.getAttribute("x2")) - Number(n.getAttribute("x1")),
          Number(n.getAttribute("y2")) - Number(n.getAttribute("y1")),
        ),
      ),
    );
  expect(new Set(lengths.map((v) => v.toFixed(5))).size).toBe(2);
  await page.reload();
  await expect(
    page.getByLabel("Interaction overcome during sliding", { exact: true }),
  ).toHaveValue("covalent");
  await expect(
    page.getByLabel("Within-sheet bonds after sliding", { exact: true }),
  ).toHaveValue("break");
  await page
    .getByLabel("Interaction overcome during sliding", { exact: true })
    .selectOption("interlayer");
  await page
    .getByLabel("Within-sheet bonds after sliding", { exact: true })
    .selectOption("intact");
  await check(page, true);
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphite/graphite-${info.project.name}-sliding.png`,
  );
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Graphite charge carriers", { exact: true })
    .selectOption("nuclei");
  await page
    .getByLabel("Carrier movement through a sheet", { exact: true })
    .selectOption("mobile");
  await check(page, false);
  const cores = await carbon();
  const electrons = () =>
    page
      .locator("[data-graphite-electron]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("cx")));
  const first = await electrons();
  expect(first).toHaveLength(96);
  await page
    .getByRole("button", { name: "Advance electron drift", exact: true })
    .click();
  expect(await carbon()).toEqual(cores);
  expect(await electrons()).not.toEqual(first);
  const minimumGap = await page
    .locator(".graphite-projection svg")
    .evaluate((svg) => {
      const positions = (selector: string) =>
        [...svg.querySelectorAll(selector)].map((n) => ({
          x: Number(n.getAttribute("cx")),
          y: Number(n.getAttribute("cy")),
          r: Number(n.getAttribute("r")),
        }));
      const atoms = positions("[data-graphite-carbon] circle"),
        electrons = positions("[data-graphite-electron]");
      return Math.min(
        ...atoms.flatMap((a) =>
          electrons.map((e) => Math.hypot(a.x - e.x, a.y - e.y) - a.r - e.r),
        ),
      );
    });
  expect(minimumGap).toBeGreaterThanOrEqual(0);

  await expect(
    page.getByLabel("Graphite charge carriers", { exact: true }),
  ).toHaveValue("nuclei");
  await page
    .getByLabel("Graphite charge carriers", { exact: true })
    .selectOption("electrons");
  await check(page, true);
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphite/graphite-${info.project.name}-carriers.png`,
  );
  await page
    .getByRole("button", { name: "Task 4", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Interaction overcome in changing the giant structure", {
      exact: true,
    })
    .selectOption("interlayer");
  await page
    .getByLabel("Energy required for changing the giant structure", {
      exact: true,
    })
    .selectOption("high");
  await check(page, false);
  await page
    .getByLabel("Interaction overcome in changing the giant structure", {
      exact: true,
    })
    .selectOption("covalent");
  await check(page, true);
});
test("all thirteen independent tasks preserve original explanations as self reviewed work", async ({
  page,
}, info) => {
  await page.goto("/lessons/graphite");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) {
      const picker = page.getByLabel("Choose a practice task", { exact: true });
      if (await picker.isVisible()) await picker.selectOption(String(i));
      else
        await page
          .getByRole("button", { name: `Task ${i + 1}`, exact: true })
          .first()
          .click();
    }
    const q = journey.practice[i];
    if (q.options)
      await page.getByRole("radio", { name: q.answer, exact: true }).check();
    else
      await page
        .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
          exact: true,
        })
        .fill(q.answer);
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
              JSON.parse(localStorage.getItem(key)!).work["graphite"].attempts[
                id
              ]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "gr-v1-p-neighbours") {
      await audit(page);
      await capture(
        page,
        `test-results/qa/graphite/graphite-${info.project.name}-independent.png`,
      );
    }
  }
});

async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
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
test("reserved graphite checks defer feedback, preserve typed drafts and reserve distinct seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/graphite");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    const q = journey.checkForms[0][i];
    await answer(page, q);
    if (i === 0) {
      await saved(page);
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        q.answer,
      );
    }
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i === 0)
      await expect
        .poll(() =>
          page.evaluate(
            (key) =>
              JSON.parse(localStorage.getItem(key)!).work["graphite"].run
                .responses["gr-v1-ca-neighbours"]?.fresh,
            STORAGE_KEY,
          ),
        )
        .toBe(false);
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
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
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["graphite"].history[0].submitted = Date.now() - delay - 1000;
      p.work["graphite"].run.submitted = Date.now() - delay - 1000;
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
test("incorrect independent coordination returns from targeted teaching without replacing the draft", async ({
  page,
}) => {
  await page.goto("/lessons/graphite");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex(
    (q) => q.id === "gr-v1-p-neighbours",
  );
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(index));
  else
    await page
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
  await page.getByLabel("Your answer", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).not.toHaveClass(
    /correct/,
  );
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "4",
  );
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "4",
  );
  const caption = page.locator(".graphite-projection figcaption");
  await expect(caption).not.toContainText("covalent");
  await expect(caption).not.toContainText("giant");
});
