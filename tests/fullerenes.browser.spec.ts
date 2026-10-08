import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { fullereneJourney as journey } from "../src/content/journeys/fullerenes";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".fullerene-workbench .feedback[role=status]"),
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
  await mkdir("test-results/qa/fullerenes", { recursive: true });
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
test("the real C60 export has a connected closed sixty-carbon cage and deliberate ring mistakes persist", async ({
  page,
}, info) => {
  await page.goto("/lessons/fullerenes");
  const extent = page.getByLabel("Structure extent", { exact: true }),
    count = page.getByLabel("Carbons in the selected ring", { exact: true }),
    ring = page.getByLabel("Inspect a ring", { exact: true });
  const box = await extent.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await extent.selectOption("sheet");
  await count.selectOption("6");
  await check(page, false);
  await page.reload();
  await expect(extent).toHaveValue("sheet");
  await expect(count).toHaveValue("6");
  await extent.selectOption("molecule");
  await count.selectOption("5");
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate fullerene cage",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-atoms", "60");
  const before = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", before!);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download network as GLB", exact: true })
    .click();
  const download = await downloadPromise,
    path = `test-results/qa/fullerenes/C60-fullerene-${info.project.name}.glb`;
  await mkdir("test-results/qa/fullerenes", { recursive: true });
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
      selectedRing?: number[];
      molecularFormula?: string;
      closedCage?: boolean;
    };
  };
  const nodes = JSON.parse(
      buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
    ).nodes as Node[],
    atoms = nodes.filter((n) => /^carbon-\d+$/.test(n.name ?? "")),
    bonds = nodes.filter((n) => /^covalent-bond-/.test(n.name ?? ""));
  expect(atoms).toHaveLength(60);
  expect(bonds).toHaveLength(90);
  const positions = new Map(
    atoms.map((n) => [
      Number(n.name!.slice(7)),
      n.translation ?? n.matrix!.slice(12, 15),
    ]),
  );
  expect(
    new Set([...positions.values()].map((p) => p[2])).size,
  ).toBeGreaterThan(5);
  const edges = bonds.map((n) => [n.extras!.carbonA!, n.extras!.carbonB!]),
    expected: string[] = [];
  for (const [a, p] of positions)
    for (const [b, q] of positions)
      if (
        a < b &&
        Math.abs(p.reduce((s, v, i) => s + (v - q[i]) ** 2, 0) - 4 / 9) < 1e-6
      )
        expected.push(`${a},${b}`);
  expect(edges.map(([a, b]) => `${a},${b}`).sort()).toEqual(expected.sort());
  const neighbours = (id: number) =>
    edges
      .filter(([a, b]) => a === id || b === id)
      .map(([a, b]) => (a === id ? b : a));
  for (const id of positions.keys()) expect(neighbours(id)).toHaveLength(3);
  const reached = new Set([0]);
  for (let i = 0; i < 60; i++)
    for (const [a, b] of edges) {
      if (reached.has(a)) reached.add(b);
      if (reached.has(b)) reached.add(a);
    }
  expect(reached.size).toBe(60);
  const cycles = (length: number) => {
    const found = new Set<string>();
    const walk = (path: number[]) => {
      for (const next of neighbours(path.at(-1)!)) {
        if (path.length === length) {
          if (next === path[0])
            found.add([...path].sort((a, b) => a - b).join(","));
        } else if (!path.includes(next)) walk([...path, next]);
      }
    };
    for (const id of positions.keys()) walk([id]);
    return found;
  };
  expect(cycles(5).size).toBe(12);
  expect(cycles(6).size).toBe(20);
  expect(60 - 90 + cycles(5).size + cycles(6).size).toBe(2);
  const group = nodes.find((n) => n.name === "C60-closed-covalent-cage")!;
  expect(group.extras!.molecularFormula).toBe("C60");
  expect(group.extras!.closedCage).toBe(true);
  expect(group.extras!.selectedRing).toHaveLength(5);
  await audit(page);
  await capture(
    page,
    `test-results/qa/fullerenes/fullerenes-${info.project.name}-cage.png`,
  );
  await ring.selectOption("1");
  await check(page, false);
  await expect(count).toHaveValue("5");
  await count.selectOption("6");
  await check(page, true);
  await ring.selectOption("2");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(extent).toHaveValue("unset");
  await expect(count).toHaveValue("0");
});
test("unavailable WebGL preserves ring evidence and wrong counts without changing molecular structure", async ({
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
  await page.goto("/lessons/fullerenes");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Structure extent", { exact: true })
    .selectOption("molecule");
  await page
    .getByLabel("Carbons in the selected ring", { exact: true })
    .selectOption("6");
  await check(page, false);
  await expect(
    page.getByLabel("Carbons in the selected ring", { exact: true }),
  ).toHaveValue("6");
  await expect(page.locator("[data-fullerene-carbon]")).toHaveCount(60);
  await expect(page.locator("[data-fullerene-bond]")).toHaveCount(90);
  await expect(page.locator('[data-selected-ring-carbon="true"]')).toHaveCount(
    5,
  );
  await expect(page.locator('[data-selected-ring-bond="true"]')).toHaveCount(5);
  await page.getByLabel("Inspect a ring", { exact: true }).selectOption("1");
  await check(page, true);
  await expect(page.locator('[data-selected-ring-carbon="true"]')).toHaveCount(
    6,
  );
  await audit(page);
  await capture(
    page,
    `test-results/qa/fullerenes/fullerenes-${info.project.name}-projection.png`,
  );
});
test("separating intact molecules preserves both cages and enclosure does not guarantee suitability", async ({
  page,
}, info) => {
  await page.goto("/lessons/fullerenes");
  await page
    .getByRole("button", { name: "Task 2", exact: true })
    .first()
    .click();
  const force = page.getByLabel("Interaction overcome in separation", {
      exact: true,
    }),
    internal = page.getByLabel("Internal bonds after separation", {
      exact: true,
    });
  await force.selectOption("covalent");
  await internal.selectOption("break");
  await check(page, false);
  const vectors = () =>
    page
      .locator("[data-cage-internal-bond]")
      .evaluateAll((nodes) =>
        nodes.map((n) => [
          Number(n.getAttribute("x2")) - Number(n.getAttribute("x1")),
          Number(n.getAttribute("y2")) - Number(n.getAttribute("y1")),
        ]),
      );
  const before = await vectors();
  const carbon = () =>
    page
      .locator("[data-separated-cage-carbon]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("cx")));
  const first = await carbon();
  await page
    .getByRole("button", { name: "Separate the intact molecules", exact: true })
    .click();
  expect(await carbon()).not.toEqual(first);
  const after = await vectors();
  expect(after).toHaveLength(180);
  for (let i = 0; i < 180; i++)
    for (let j = 0; j < 2; j++) expect(after[i][j]).toBeCloseTo(before[i][j]);
  await expect(page.locator("[data-separated-cage-carbon]")).toHaveCount(120);
  await page.reload();
  await expect(force).toHaveValue("covalent");
  await expect(internal).toHaveValue("break");
  await force.selectOption("between");
  await internal.selectOption("intact");
  await check(page, true);
  const sizes = await page
    .locator(".fullerene-separation svg text")
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
    `test-results/qa/fullerenes/fullerenes-${info.project.name}-separation.png`,
  );
  await page
    .getByRole("button", { name: "Task 3", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Feature supporting a possible carrier role", { exact: true })
    .selectOption("hollow");
  await page
    .getByLabel("Does shape alone guarantee suitability?", { exact: true })
    .selectOption("yes");
  await check(page, false);
  await page
    .getByRole("button", { name: "Show conceptual enclosure", exact: true })
    .click();
  await page
    .getByLabel("Does shape alone guarantee suitability?", { exact: true })
    .selectOption("no");
  await check(page, true);
  await expect(
    page.getByRole("group", { name: "Rotate fullerene cage", exact: true }),
  ).toHaveAttribute("data-ready", "true");
  await audit(page);
  await capture(
    page,
    `test-results/qa/fullerenes/fullerenes-${info.project.name}-carrier.png`,
  );
  const payloadDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download network as GLB", exact: true })
    .click();
  const payloadFile = await payloadDownload,
    payloadPath = `test-results/qa/fullerenes/C60-conceptual-payload-${info.project.name}.glb`;
  await payloadFile.saveAs(payloadPath);
  const payloadBuffer = await readFile(payloadPath),
    payloadJson = JSON.parse(
      payloadBuffer
        .subarray(20, 20 + payloadBuffer.readUInt32LE(12))
        .toString(),
    );
  const payloadNodes = payloadJson.nodes as {
    name?: string;
    extras?: { notActualDrug?: boolean };
  }[];
  expect(
    payloadNodes.filter((n) => /^carbon-\d+$/.test(n.name ?? "")),
  ).toHaveLength(60);
  expect(
    payloadNodes.filter((n) => n.name === "conceptual-payload"),
  ).toHaveLength(1);
  expect(
    payloadNodes.find((n) => n.name === "conceptual-payload")!.extras!
      .notActualDrug,
  ).toBe(true);

  await page
    .getByRole("button", { name: "Remove conceptual payload", exact: true })
    .click();
});
test("all thirteen independent demands distinguish rings formulas and honestly self reviewed writing", async ({
  page,
}, info) => {
  await page.goto("/lessons/fullerenes");
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
    if (q.id === "fu-v1-p-count") {
      await page.getByLabel("Your answer", { exact: true }).fill("6");
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
              JSON.parse(localStorage.getItem(key)!).work.fullerenes.attempts[
                id
              ]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "fu-v1-p-pentagon") {
      await audit(page);
      await capture(
        page,
        `test-results/qa/fullerenes/fullerenes-${info.project.name}-independent.png`,
      );
    }
  }
});
test("reserved fullerenes checks defer feedback, preserve typed drafts and reserve distinct seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/fullerenes");
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
              JSON.parse(localStorage.getItem(key)!).work["fullerenes"].run
                .responses["fu-v1-ca-count"]?.fresh,
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
      p.work["fullerenes"].history[0].submitted = Date.now() - delay - 1000;
      p.work["fullerenes"].run.submitted = Date.now() - delay - 1000;
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
test("incorrect independent ring counting returns from targeted teaching without replacing the draft", async ({
  page,
}) => {
  await page.goto("/lessons/fullerenes");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex((q) => q.id === "fu-v1-p-pentagon");
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(index));
  else
    await page
      .getByRole("button", { name: `Task ${index + 1}`, exact: true })
      .first()
      .click();
  await page.getByLabel("Your answer", { exact: true }).fill("6");
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
    "6",
  );
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "6",
  );
  const caption = page.locator(".fullerene-projection figcaption");
  await expect(caption).not.toContainText("covalent");
  await expect(caption).not.toContainText("giant");
});
