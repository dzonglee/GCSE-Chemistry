import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { polymerStructureJourney as journey } from "../src/content/journeys/polymer-structures";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".polymer-workbench .feedback[role=status]"),
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
  await mkdir("test-results/qa/polymer-structures", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.polymerRepeatDrawing) {
    const values = JSON.parse(q.answer);
    for (const part of q.parts!)
      await page
        .getByLabel(part.label, { exact: true })
        .selectOption(values[part.id]);
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
async function task(page: Page, index: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) {
    await picker.selectOption(String(index - 1));
    return;
  }
  await page
    .getByRole("button", { name: `Task ${index}`, exact: true })
    .first()
    .click();
}
test("whole-unit growth retains wrong extent and exports a genuine tetrahedral C H chain with omitted continuation", async ({
  page,
}, info) => {
  await page.goto("/lessons/polymer-structures");
  const extent = page.getByLabel("Structure extent", { exact: true }),
    bond = page.getByLabel("Links within the chain", { exact: true });
  const box = await extent.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await extent.selectOption("network");
  await bond.selectOption("covalent");
  await check(page, false);
  await page.reload();
  await expect(extent).toHaveValue("network");
  const scene = page.getByRole("group", {
    name: "Rotate polymer chain",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-atoms", "12");
  await page
    .getByRole("button", { name: "Add one repeat unit", exact: true })
    .click();
  await expect(scene).toHaveAttribute("data-atoms", "18");
  await page
    .getByRole("button", { name: "Add one repeat unit", exact: true })
    .click();
  await expect(scene).toHaveAttribute("data-atoms", "24");
  await expect(
    page.getByRole("button", { name: "Add one repeat unit", exact: true }),
  ).toBeDisabled();
  await extent.selectOption("molecule");
  await check(page, true);
  const before = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", before!);
  const promise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download chain as GLB", exact: true })
    .click();
  const download = await promise,
    path = `test-results/qa/polymer-structures/polyethene-section-${info.project.name}.glb`;
  await mkdir("test-results/qa/polymer-structures", { recursive: true });
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  type Node = {
    name?: string;
    translation?: number[];
    matrix?: number[];
    extras?: {
      element?: string;
      atomA?: number;
      atomB?: number;
      selectedNeighbours?: number[];
      notCompleteMolecularFormula?: boolean;
      omittedEndContinuation?: boolean;
    };
  };
  const nodes = JSON.parse(
      buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
    ).nodes as Node[],
    atoms = nodes.filter((n) => /^(carbon|hydrogen)-\d+$/.test(n.name ?? "")),
    bonds = nodes.filter((n) => /^covalent-bond-/.test(n.name ?? ""));
  expect(atoms).toHaveLength(24);
  expect(atoms.filter((n) => n.extras!.element === "C")).toHaveLength(8);
  expect(atoms.filter((n) => n.extras!.element === "H")).toHaveLength(16);
  expect(bonds).toHaveLength(23);
  expect(nodes.filter((n) => /^continuation-/.test(n.name ?? ""))).toHaveLength(
    2,
  );
  const group = nodes.find((n) => n.name === "polyethene-chain-section")!;
  expect(group.extras!.selectedNeighbours).toHaveLength(4);
  expect(group.extras!.notCompleteMolecularFormula).toBe(true);
  expect(group.extras!.omittedEndContinuation).toBe(true);
  const id = (n: Node) => Number(n.name!.split("-").at(-1)),
    positions = new Map(
      atoms.map((n) => [id(n), n.translation ?? n.matrix!.slice(12, 15)]),
    ),
    elements = new Map(atoms.map((n) => [id(n), n.extras!.element]));
  const edges = bonds.map((n) => [n.extras!.atomA!, n.extras!.atomB!]),
    expected: string[] = [];
  for (const [a, p] of positions)
    for (const [b, q] of positions)
      if (a < b) {
        const ea = elements.get(a),
          eb = elements.get(b);
        if (ea === "H" && eb === "H") continue;
        const target = ea === "C" && eb === "C" ? 0.55 : 0.4;
        if (Math.abs(Math.hypot(...p.map((v, i) => v - q[i])) - target) < 1e-6)
          expected.push(`${a},${b}`);
      }
  expect(edges.map((e) => e.sort((a, b) => a - b).join(",")).sort()).toEqual(
    expected.sort(),
  );
  const neighbours = (id: number) =>
    edges.filter((e) => e.includes(id)).map(([a, b]) => (a === id ? b : a));
  for (const [id, element] of elements) {
    const n = neighbours(id);
    if (element === "H") expect(n).toHaveLength(1);
    else if (id > 0 && id < 7) {
      expect(n).toHaveLength(4);
      const p = positions.get(id)!,
        vectors = n.map((id) => positions.get(id)!.map((v, i) => v - p[i]));
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          expect(
            vectors[i].reduce((s, v, k) => s + v * vectors[j][k], 0) /
              (Math.hypot(...vectors[i]) * Math.hypot(...vectors[j])),
          ).toBeCloseTo(-1 / 3, 5);
    }
  }
  await audit(page);
  await capture(
    page,
    `test-results/qa/polymer-structures/polymer-structures-${info.project.name}-chain.png`,
  );
  await page
    .getByRole("button", { name: "Remove one repeat unit", exact: true })
    .click();
  await expect(scene).toHaveAttribute("data-atoms", "18");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(scene).toHaveAttribute("data-atoms", "24");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(extent).toHaveValue("unset");
  await expect(scene).toHaveAttribute("data-atoms", "12");
});
test("WebGL fallback retains a chemically connected atom drawing with readable labels and wrong predictions", async ({
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
  await page.goto("/lessons/polymer-structures");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("[data-polymer-atom]")).toHaveCount(12);
  await expect(page.locator("[data-polymer-bond]")).toHaveCount(11);
  await expect(page.locator("[data-chain-continuation]")).toHaveCount(2);
  const sizes = await page
    .locator(".polymer-chain-projection svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          parseFloat(getComputedStyle(n).fontSize) *
          (n as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await page
    .getByLabel("Structure extent", { exact: true })
    .selectOption("separate-units");
  await page
    .getByLabel("Links within the chain", { exact: true })
    .selectOption("covalent");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Structure extent", { exact: true }),
  ).toHaveValue("separate-units");
  await audit(page);
  await capture(
    page,
    `test-results/qa/polymer-structures/polymer-structures-${info.project.name}-projection.png`,
  );
});
test("repeat-unit model keeps a wrong double bond hydrogen count and marker visible through reload before deliberate correction", async ({
  page,
}, info) => {
  await page.goto("/lessons/polymer-structures");
  await task(page, 2);
  const backbone = page.getByLabel("Carbon backbone bond", { exact: true }),
    h = page.getByLabel("Hydrogens per carbon", { exact: true }),
    outside = page.getByLabel("Continuation through brackets", { exact: true }),
    marker = page.getByLabel("Repeat count marker", { exact: true });
  await backbone.selectOption("double");
  await h.selectOption("3");
  await outside.selectOption("no");
  await marker.selectOption("N");
  await check(page, false);
  await expect(page.locator("[data-repeat-backbone=double]")).toHaveCount(2);
  await expect(page.locator("[data-repeat-hydrogen]")).toHaveCount(6);
  await expect(page.locator("[data-repeat-continuation]")).toHaveCount(0);
  await expect(page.locator("[data-repeat-count=N]")).toHaveCount(1);
  await page.reload();
  await expect(backbone).toHaveValue("double");
  await expect(h).toHaveValue("3");
  await backbone.selectOption("single");
  await h.selectOption("2");
  await outside.selectOption("yes");
  await marker.selectOption("n");
  await check(page, true);
  await expect(page.locator("[data-repeat-hydrogen]")).toHaveCount(4);
  await expect(page.locator("[data-repeat-continuation]")).toHaveCount(2);
  await audit(page);
  await capture(
    page,
    `test-results/qa/polymer-structures/polymer-structures-${info.project.name}-repeat.png`,
  );
});
test("separation preserves both entire chain graphs while the state comparison requires size force and energy", async ({
  page,
}, info) => {
  await page.goto("/lessons/polymer-structures");
  await task(page, 3);
  const interaction = page.getByLabel("Interaction overcome", { exact: true }),
    internal = page.getByLabel("Internal chain bonds", { exact: true });
  await interaction.selectOption("covalent");
  await internal.selectOption("break");
  await check(page, false);
  const bonds = page.locator("[data-polymer-internal-bond]");
  await expect(bonds).toHaveCount(46);
  await expect(page.locator("[data-chain-carbon]")).toHaveCount(16);
  await expect(page.locator("[data-chain-hydrogen]")).toHaveCount(32);
  const vectors = () =>
    bonds.evaluateAll((nodes) =>
      nodes.map((n) => [
        Number(n.getAttribute("x2")) - Number(n.getAttribute("x1")),
        Number(n.getAttribute("y2")) - Number(n.getAttribute("y1")),
      ]),
    );
  const before = await vectors();
  await page
    .getByRole("button", { name: "Separate intact chains", exact: true })
    .click();
  expect(await vectors()).toEqual(before);
  await page.reload();
  await expect(interaction).toHaveValue("covalent");
  await expect(internal).toHaveValue("break");
  await interaction.selectOption("between");
  await internal.selectOption("intact");
  await check(page, true);
  const sizes = await page
    .locator(".polymer-separation svg text")
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
    `test-results/qa/polymer-structures/polymer-structures-${info.project.name}-separation.png`,
  );
  await task(page, 4);
  await page
    .getByLabel("Poly(ethene) molecule size", { exact: true })
    .selectOption("larger");
  await page
    .getByLabel("Between-molecule forces", { exact: true })
    .selectOption("covalent");
  await page
    .getByLabel("Energy to overcome these forces", { exact: true })
    .selectOption("more");
  await check(page, false);
  await page
    .getByLabel("Between-molecule forces", { exact: true })
    .selectOption("stronger");
  await check(page, true);
  await audit(page);
  await capture(
    page,
    `test-results/qa/polymer-structures/polymer-structures-${info.project.name}-phase.png`,
  );
});
test("all sixteen independent tasks mark atom ledgers and constructed repeat diagrams while written answers remain self reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/polymer-structures");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await task(page, i + 1);
    const q = journey.practice[i];
    if (q.polymerRepeatDrawing) {
      await page
        .getByLabel("Joining carbon bond", { exact: true })
        .selectOption("2");
      await page
        .getByLabel("Hydrogens at each carbon", { exact: true })
        .selectOption("1");
      await page
        .getByLabel("Outside repeat-count marker", { exact: true })
        .selectOption("2");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel [role=status]"),
      ).not.toHaveClass(/correct/);
      await expect(page.locator("[data-repeat-backbone=double]")).toHaveCount(
        2,
      );
      await page.reload();
      await expect(
        page.getByLabel("Joining carbon bond", { exact: true }),
      ).toHaveValue("2");
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
              JSON.parse(localStorage.getItem(key)!).work[
                "polymer-structures"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.polymerRepeatDrawing) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/polymer-structures/polymer-structures-${info.project.name}-independent.png`,
      );
    }
  }
});
test("both reserved check forms defer marking, preserve construction drafts and keep seven-day retrieval separate", async ({
  page,
}) => {
  await page.goto("/lessons/polymer-structures");
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
        if (q.polymerRepeatDrawing)
          await expect(
            page.getByLabel("Joining carbon bond", { exact: true }),
          ).toHaveValue("1");
        else
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
                  "polymer-structures"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false);
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
      for (const run of p.work["polymer-structures"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["polymer-structures"].run.submitted = Date.now() - delay - 1000;
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
test("incorrect repeat construction returns from targeted teaching without replacing the original double bond", async ({
  page,
}) => {
  await page.goto("/lessons/polymer-structures");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex((q) => q.polymerRepeatDrawing);
  await task(page, index + 1);
  await page
    .getByLabel("Joining carbon bond", { exact: true })
    .selectOption("2");
  await page
    .getByLabel("Hydrogens at each carbon", { exact: true })
    .selectOption("2");
  await page
    .getByLabel("Bonds crossing bracket sides", { exact: true })
    .selectOption("1");
  await page
    .getByLabel("Outside repeat-count marker", { exact: true })
    .selectOption("1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Read the bracketed repeat",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByLabel("Joining carbon bond", { exact: true }),
  ).toHaveValue("2");
  await page.reload();
  await expect(
    page.getByLabel("Joining carbon bond", { exact: true }),
  ).toHaveValue("2");
  await expect(page.locator("[data-repeat-backbone=double]")).toHaveCount(2);
});
