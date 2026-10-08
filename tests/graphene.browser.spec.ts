import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { grapheneJourney as journey } from "../src/content/journeys/graphene";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".graphene-workbench .feedback[role=status]"),
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
  await mkdir("test-results/qa/graphene", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
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
test("single-layer predictions retain wrong stacks and the actual GLB has one connected planar sheet", async ({
  page,
}, info) => {
  await page.goto("/lessons/graphene");
  const layers = page.getByLabel("Atom layers", { exact: true }),
    extent = page.getByLabel("Structure extent", { exact: true });
  const box = await layers.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await layers.selectOption("3");
  await extent.selectOption("network");
  await check(page, false);
  await page.reload();
  await expect(layers).toHaveValue("3");
  await expect(extent).toHaveValue("network");
  await layers.selectOption("1");
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate graphene sheet",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-atoms", "32");
  const rotation = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowUp");
  await expect(scene).not.toHaveAttribute("data-rotation", rotation!);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download network as GLB", exact: true })
    .click();
  const download = await downloadPromise,
    path = `test-results/qa/graphene/graphene-sheet-${info.project.name}.glb`;
  await mkdir("test-results/qa/graphene", { recursive: true });
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(4)).toBe(2);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  type Node = {
    name?: string;
    translation?: number[];
    matrix?: number[];
    extras?: {
      carbonA?: number;
      carbonB?: number;
      selectedCarbon?: number;
      selectedNeighbours?: number[];
      layerCount?: number;
    };
  };
  const nodes = JSON.parse(
      buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
    ).nodes as Node[],
    atoms = nodes.filter((n) => /^carbon-\d+$/.test(n.name ?? "")),
    bonds = nodes.filter((n) => /^covalent-bond-/.test(n.name ?? ""));
  expect(atoms).toHaveLength(32);
  expect(bonds).toHaveLength(40);
  const positions = new Map(
    atoms.map((n) => [
      Number(n.name!.slice(7)),
      n.translation ?? n.matrix!.slice(12, 15),
    ]),
  );
  expect(new Set([...positions.values()].map((p) => p[2]))).toEqual(
    new Set([0]),
  );
  const edges = bonds.map((n) => [n.extras!.carbonA!, n.extras!.carbonB!]),
    expected: string[] = [];
  for (const [a, p] of positions)
    for (const [b, q] of positions)
      if (
        a < b &&
        Math.abs(p.reduce((s, v, i) => s + (v - q[i]) ** 2, 0) - 0.25) < 1e-6
      )
        expected.push(`${a},${b}`);
  expect(edges.map(([a, b]) => `${a},${b}`).sort()).toEqual(expected.sort());
  const reached = new Set([0]);
  for (let i = 0; i < 32; i++)
    for (const [a, b] of edges) {
      if (reached.has(a)) reached.add(b);
      if (reached.has(b)) reached.add(a);
    }
  expect(reached.size).toBe(32);
  const group = nodes.find((n) => n.name === "graphene-single-sheet-fragment")!;
  expect(group.extras!.layerCount).toBe(1);
  const centre = positions.get(group.extras!.selectedCarbon!)!,
    vectors = group.extras!.selectedNeighbours!.map((id) =>
      positions.get(id)!.map((v, i) => v - centre[i]),
    );
  expect(vectors).toHaveLength(3);
  for (let a = 0; a < 3; a++) {
    expect(vectors[a][2]).toBe(0);
    expect(vectors[a].reduce((s, v) => s + v * v, 0)).toBeCloseTo(0.25);
    for (let b = a + 1; b < 3; b++)
      expect(
        vectors[a].reduce((s, v, i) => s + v * vectors[b][i], 0),
      ).toBeCloseTo(-0.125);
  }
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphene/graphene-${info.project.name}-sheet.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(layers).toHaveValue("0");
  await expect(extent).toHaveValue("unset");
});
test("the single-sheet projection remains usable without WebGL and its labels are readable", async ({
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
  await page.goto("/lessons/graphene");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Atom layers", { exact: true }).selectOption("3");
  await page
    .getByLabel("Structure extent", { exact: true })
    .selectOption("network");
  await check(page, false);
  await expect(page.getByLabel("Atom layers", { exact: true })).toHaveValue(
    "3",
  );
  await expect(page.locator("[data-graphene-carbon]")).toHaveCount(32);
  await expect(page.locator("[data-graphene-bond]")).toHaveCount(40);
  await page.getByLabel("Atom layers", { exact: true }).selectOption("1");
  await check(page, true);
  await expect(
    page.locator('[data-graphene-selected-bond="true"]'),
  ).toHaveCount(3);
  const sizes = await page
    .locator(".graphene-projection svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          parseFloat(getComputedStyle(n).fontSize) *
          (n as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphene/graphene-${info.project.name}-projection.png`,
  );
});
test("electronic uses require mobile carriers and composite choices require both data criteria and strong bonding", async ({
  page,
}, info) => {
  await page.goto("/lessons/graphene");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  const property = page.getByLabel("Property suited to thin electronics", {
      exact: true,
    }),
    carrier = page.getByLabel("Electrical carrier explanation", {
      exact: true,
    });
  await property.selectOption("thin-conducting");
  await carrier.selectOption("fixed");
  await check(page, false);
  await page.reload();
  await expect(carrier).toHaveValue("fixed");
  await carrier.selectOption("mobile");
  await check(page, true);
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphene/graphene-${info.project.name}-electronics.png`,
  );
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  const panel = page.getByLabel("Panel meeting both requirements", {
      exact: true,
    }),
    cause = page.getByLabel("Graphene strength explanation", { exact: true });
  await cause.selectOption("covalent");
  for (const id of ["A", "C"]) {
    await panel.selectOption(id);
    await check(page, false);
  }
  await panel.selectOption("B");
  await cause.selectOption("mobile");
  await check(page, false);
  await cause.selectOption("covalent");
  await check(page, true);
  await expect(
    page.getByRole("row", {
      name: "B Graphene-reinforced polymer panel 12 18",
      exact: true,
    }),
  ).toBeVisible();
  await audit(page);
  await capture(
    page,
    `test-results/qa/graphene/graphene-${info.project.name}-composite.png`,
  );
});
test("all thirteen independent graphene tasks keep data calculations separate from self reviewed explanations", async ({
  page,
}, info) => {
  await page.goto("/lessons/graphene");
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
    if (q.id === "ge-v1-p-reduction") {
      await page.getByLabel("Your answer", { exact: true }).fill("60");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel [role=status]"),
      ).not.toHaveClass(/correct/);
    }
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
              JSON.parse(localStorage.getItem(key)!).work.graphene.attempts[
                id
              ]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "ge-v1-p-neighbours") {
      await audit(page);
      await capture(
        page,
        `test-results/qa/graphene/graphene-${info.project.name}-independent.png`,
      );
    }
  }
});
test("reserved graphene checks defer feedback, preserve typed drafts and reserve distinct seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/graphene");
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
              JSON.parse(localStorage.getItem(key)!).work["graphene"].run
                .responses["ge-v1-ca-layers"]?.fresh,
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
      p.work["graphene"].history[0].submitted = Date.now() - delay - 1000;
      p.work["graphene"].run.submitted = Date.now() - delay - 1000;
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
  await page.goto("/lessons/graphene");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex(
    (q) => q.id === "ge-v1-p-neighbours",
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
  const caption = page.locator(".graphene-projection figcaption");
  await expect(caption).not.toContainText("covalent");
  await expect(caption).not.toContainText("giant");
});
