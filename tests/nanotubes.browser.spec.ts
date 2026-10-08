import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { nanotubeJourney as journey } from "../src/content/journeys/nanotubes";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".nanotube-workbench .feedback[role=status]"),
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
  await mkdir("test-results/qa/nanotubes", { recursive: true });
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
async function guided(page: Page, index: number) {
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
test("real nanotube GLB joins its seam, retains wrong shape and neighbour predictions and supports keyboard rotation", async ({
  page,
}, info) => {
  await page.goto("/lessons/carbon-nanotubes");
  const shape = page.getByLabel("Wall shape", { exact: true }),
    count = page.getByLabel("Interior bonded neighbours", { exact: true });
  const box = await shape.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await shape.selectOption("rod");
  await count.selectOption("6");
  await check(page, false);
  await page.reload();
  await expect(shape).toHaveValue("rod");
  await expect(count).toHaveValue("6");
  await shape.selectOption("tube");
  await count.selectOption("3");
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate carbon nanotube",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-atoms", "72");
  await expect(scene).toHaveAttribute("data-bonds", "96");
  const before = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", before!);
  const promise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download network as GLB", exact: true })
    .click();
  const download = await promise,
    path = `test-results/qa/nanotubes/carbon-nanotube-${info.project.name}.glb`;
  await mkdir("test-results/qa/nanotubes", { recursive: true });
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  type Node = {
    name?: string;
    translation?: number[];
    matrix?: number[];
    extras?: {
      row?: number;
      column?: number;
      basis?: number;
      carbonA?: number;
      carbonB?: number;
      periodicSeam?: boolean;
      openCutEnds?: boolean;
      notFixedMolecularFormula?: boolean;
      selectedNeighbours?: number[];
    };
  };
  const nodes = JSON.parse(
      buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
    ).nodes as Node[],
    atoms = nodes.filter((n) => /^carbon-\d+$/.test(n.name ?? "")),
    bonds = nodes.filter((n) => /^covalent-bond-/.test(n.name ?? ""));
  expect(atoms).toHaveLength(72);
  expect(bonds).toHaveLength(96);
  const group = nodes.find((n) => n.name === "nanotube-joined-wall-fragment")!;
  expect(group.extras!.periodicSeam).toBe(true);
  expect(group.extras!.openCutEnds).toBe(true);
  expect(group.extras!.notFixedMolecularFormula).toBe(true);
  expect(group.extras!.selectedNeighbours).toHaveLength(3);
  const positions = new Map(
    atoms.map((n) => [
      Number(n.name!.slice(7)),
      n.translation ?? n.matrix!.slice(12, 15),
    ]),
  );
  for (const p of positions.values())
    expect(Math.hypot(p[0], p[2])).toBeCloseTo(
      ((6 * Math.sqrt(3)) / (2 * Math.PI)) * 0.45,
      5,
    );
  const edges = bonds.map((n) => [n.extras!.carbonA!, n.extras!.carbonB!]);
  const expected: string[] = [];
  for (const a of atoms)
    for (const b of atoms) {
      const ia = Number(a.name!.slice(7)),
        ib = Number(b.name!.slice(7));
      if (ia >= ib) continue;
      const ka = a.extras!.column! * 2 + (a.extras!.row! % 2),
        kb = b.extras!.column! * 2 + (b.extras!.row! % 2),
        dk = Math.min(Math.abs(ka - kb), 12 - Math.abs(ka - kb));
      const dx = (dk * Math.sqrt(3)) / 2,
        dy =
          1.5 * (a.extras!.row! - b.extras!.row!) +
          a.extras!.basis! -
          b.extras!.basis!;
      if (Math.abs(dx * dx + dy * dy - 1) < 1e-9) expected.push(`${ia},${ib}`);
    }
  expect(edges.map((e) => e.sort((a, b) => a - b).join(",")).sort()).toEqual(
    expected.sort(),
  );
  const reached = new Set([0]);
  for (let i = 0; i < 72; i++)
    for (const [a, b] of edges) {
      if (reached.has(a)) reached.add(b);
      if (reached.has(b)) reached.add(a);
    }
  expect(reached.size).toBe(72);
  for (const a of atoms)
    if (a.extras!.row! > 0 && a.extras!.row! < 5)
      expect(
        edges.filter((e) => e.includes(Number(a.name!.slice(7)))),
      ).toHaveLength(3);
  await audit(page);
  await capture(
    page,
    `test-results/qa/nanotubes/nanotubes-${info.project.name}-wall.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(shape).toHaveValue("unset");
  await expect(count).toHaveValue("0");
});
test("WebGL fallback preserves a genuine tube-wall diagram and wrong predictions", async ({
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
  await page.goto("/lessons/carbon-nanotubes");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("[data-nanotube-carbon]")).toHaveCount(72);
  await expect(page.locator("[data-nanotube-bond]")).toHaveCount(96);
  await expect(page.locator("[data-nanotube-selected-bond=true]")).toHaveCount(
    3,
  );
  await page.getByLabel("Wall shape", { exact: true }).selectOption("sphere");
  await page
    .getByLabel("Interior bonded neighbours", { exact: true })
    .selectOption("3");
  await check(page, false);
  await page.reload();
  await expect(page.getByLabel("Wall shape", { exact: true })).toHaveValue(
    "sphere",
  );
  await page.getByLabel("Wall shape", { exact: true }).selectOption("tube");
  await check(page, true);
  await audit(page);
  await capture(
    page,
    `test-results/qa/nanotubes/nanotubes-${info.project.name}-projection.png`,
  );
});
test("aspect ratio changes numerator and denominator independently with honest units, retained mistakes and undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/carbon-nanotubes");
  await guided(page, 2);
  const length = page.getByLabel("Length in nm", { exact: true }),
    diameter = page.getByLabel("Diameter in nm", { exact: true }),
    ratio = page.getByLabel("Predicted length ÷ diameter", { exact: true });
  await ratio.selectOption("2000");
  await check(page, false);
  await page.reload();
  await expect(ratio).toHaveValue("2000");
  await ratio.selectOption("500");
  await check(page, true);
  await length.selectOption("2000");
  await check(page, false);
  await ratio.selectOption("1000");
  await check(page, true);
  await diameter.selectOption("4");
  await check(page, false);
  await ratio.selectOption("500");
  await check(page, true);
  const sizes = await page
    .locator(".nanotube-dimensions svg text")
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
    `test-results/qa/nanotubes/nanotubes-${info.project.name}-ratio.png`,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(ratio).toHaveValue("1000");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(diameter).toHaveValue("2");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(length).toHaveValue("1000");
  await expect(diameter).toHaveValue("2");
  await expect(ratio).toHaveValue("0");
});
test("material selection checks all three criteria and conduction requires mobile electrons rather than strength", async ({
  page,
}, info) => {
  await page.goto("/lessons/carbon-nanotubes");
  await guided(page, 3);
  const material = page.getByLabel("Material meeting all limits", {
      exact: true,
    }),
    cause = page.getByLabel("Strength explanation", { exact: true });
  await material.selectOption("A");
  await cause.selectOption("covalent");
  await check(page, false);
  await material.selectOption("C");
  await check(page, false);
  await material.selectOption("B");
  await cause.selectOption("electrons");
  await check(page, false);
  await page.reload();
  await expect(material).toHaveValue("B");
  await expect(cause).toHaveValue("electrons");
  await cause.selectOption("covalent");
  await check(page, true);
  await audit(page);
  await capture(
    page,
    `test-results/qa/nanotubes/nanotubes-${info.project.name}-materials.png`,
  );
  await guided(page, 4);
  const carrier = page.getByLabel("Electrical carrier", { exact: true }),
    mobility = page.getByLabel("Carrier mobility", { exact: true });
  await carrier.selectOption("ions");
  await mobility.selectOption("mobile");
  await check(page, false);
  await carrier.selectOption("electrons");
  await mobility.selectOption("fixed");
  await check(page, false);
  await mobility.selectOption("mobile");
  await check(page, true);
  await expect(page.locator(".nanotube-workbench .feedback")).toContainText(
    "conductivity varies",
  );
  await audit(page);
});
test("all fifteen independent tasks support original numerical and causal demands while writing stays self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/carbon-nanotubes");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await guided(page, i + 1);
    const q = journey.practice[i];
    if (q.id === "nt-v1-p-unit") {
      await page.getByLabel("Your answer", { exact: true }).fill("0.5");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".question-panel [role=status]"),
      ).not.toHaveClass(/correct/);
      await page.reload();
      await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
        "0.5",
      );
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
                "carbon-nanotubes"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (i === 1) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/nanotubes/nanotubes-${info.project.name}-independent.png`,
      );
    }
  }
});
test("reserved checks defer answers, preserve drafts and reserve a distinct real seven-day review", async ({
  page,
}) => {
  await page.goto("/lessons/carbon-nanotubes");
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
            (key) =>
              JSON.parse(localStorage.getItem(key)!).work["carbon-nanotubes"]
                .run.responses["nt-v1-ca-shape"]?.fresh,
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
      p.work["carbon-nanotubes"].history[0].submitted =
        Date.now() - delay - 1000;
      p.work["carbon-nanotubes"].run.submitted = Date.now() - delay - 1000;
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

test("incorrect unit conversion returns from targeted teaching with the original draft intact", async ({
  page,
}) => {
  await page.goto("/lessons/carbon-nanotubes");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex((q) => q.id === "nt-v1-p-unit");
  await guided(page, index + 1);
  await page.getByLabel("Your answer", { exact: true }).fill("0.5");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel [role=status]")).not.toHaveClass(
    /correct/,
  );
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Divide matching units", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "0.5",
  );
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "0.5",
  );
});
