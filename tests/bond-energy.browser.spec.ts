import { test, expect, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { bondEnergyJourney as journey } from "../src/content/journeys/bond-energy";
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
    page.locator(".bond-energy-workbench .feedback[role=status]"),
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
  if (q.profileDrawing) {
    const b = JSON.parse(q.answer);
    for (const k of ["reactant", "product", "peak"])
      await page
        .getByLabel("Your drawn " + k + " level / kJ", { exact: true })
        .fill(b[k]);
    await page
      .getByLabel("Your drawn activation arrow", { exact: true })
      .selectOption(b.activationArrow);
    await page
      .getByLabel("Your drawn overall-change arrow", { exact: true })
      .selectOption(b.overallArrow);
  } else if (q.parts) {
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

const route = "/lessons/bond-energy";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/bond-energy");
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
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/bond-energy-" +
            info.project.name +
            (q.profileDrawing
              ? "-independent-draw-" + form + ".png"
              : "-independent-form-" + form + "-task-" + i + ".png"),
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["bond-energy"].run
                  .responses[id]?.fresh,
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
      for (const run of p.work["bond-energy"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["bond-energy"].run.submitted = Date.now() - delay - 1000;
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
                "bond-energy"
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
async function scenario(page: Page, key: string) {
  await select(page, "Supplied bond-energy example", key);
}
async function numberPrediction(page: Page, label: string, value: number) {
  await page.getByLabel(label, { exact: true }).fill(String(value));
}
async function opening(page: Page) {
  const control = page
    .locator(
      ".bond-energy-workbench button:not([disabled]),.bond-energy-workbench input,.bond-energy-workbench select",
    )
    .first();
  const box = await control.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
}
async function bump(page: Page, label: string, n: number) {
  for (let i = 0; i < n; i++)
    await page
      .getByRole("button", { name: "Increase " + label, exact: true })
      .click();
}
const prefix = "docs/qa/bond-energy-";
test("structural inventories retain wrong counts and atomically switch to large coefficients with readable formulae", async ({
  page,
}, info) => {
  await learn(page, 1);
  await opening(page);
  const label = "Your reactant H–H bond count";
  await bump(page, label, 1);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel(label, { exact: true })).toHaveText("1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel(label, { exact: true })).toHaveText("0");
  await bump(page, label, 2);
  await bump(page, "Your reactant O=O bond count", 1);
  await bump(page, "Your product O–H bond count", 4);
  await check(page, true);
  await expect(
    page.locator(".bond-energy-workbench svg[data-species=O2]"),
  ).toHaveAttribute("data-coefficient", "1");
  await expect(
    page.locator(".bond-energy-workbench svg[data-species=O2] line"),
  ).toHaveCount(2);
  await expect(
    page.locator(".bond-energy-workbench svg[data-species=H2O]"),
  ).toHaveAttribute("data-coefficient", "2");
  await expect(
    page.locator(".bond-energy-workbench svg[data-species=H2O] line"),
  ).toHaveCount(2);
  await capture(page, prefix + info.project.name + "-count.png");
  await scenario(page, "ammoniaOxidation");
  for (const [l, n] of [
    ["Your reactant N–H bond count", 12],
    ["Your reactant O=O bond count", 3],
    ["Your product N≡N bond count", 2],
    ["Your product O–H bond count", 12],
  ] as [string, number][])
    await bump(page, l, n);
  await check(page, true);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reactant N–H bond count", { exact: true }),
  ).toHaveText("12");
  await expect(
    page.locator(".bond-energy-workbench svg[data-species=N2] line"),
  ).toHaveCount(3);
  await expect(
    page.locator(".bond-energy-workbench svg[data-species=NH3]"),
  ).toHaveAttribute("data-coefficient", "4");
  const fonts = await page
    .locator(".bond-reaction-diagram svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          (parseFloat(getComputedStyle(n).fontSize) *
            n.getBoundingClientRect().height) /
          (n as SVGGraphicsElement).getBBox().height,
      ),
    );
  expect(Math.min(...fonts)).toBeGreaterThanOrEqual(12);
  await capture(page, prefix + info.project.name + "-large-inventory.png");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Supplied bond-energy example", { exact: true }),
  ).toHaveValue("water");
  await expect(page.getByLabel(label, { exact: true })).toHaveText("0");
});
test("all seven ledgers require actual signed totals and preserve a wrong sign through reload undo and reset", async ({
  page,
}, info) => {
  await learn(page, 2);
  await opening(page);
  await scenario(page, "water");
  const input = "Your total bond-breaking input / kJ per mole of reaction",
    release = "Your total bond-formation release / kJ per mole of reaction",
    change = "Your signed overall change / kJ per mole of reaction";
  await expect(page.getByLabel(change, { exact: true })).toHaveAttribute(
    "inputmode",
    "text",
  );
  await numberPrediction(page, input, 1370);
  await numberPrediction(page, release, 1856);
  await numberPrediction(page, change, 486);
  await select(page, "Your reaction classification", "exothermic");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel(change, { exact: true })).toHaveValue("486");
  await numberPrediction(page, change, -486);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-ledger.png");
  const refs: Record<string, [number, number, number]> = {
    hydrogenChloride: [679, 864, -185],
    ammonia: [2253, 2346, -93],
    methane: [2648, 3466, -818],
    splitHCl: [864, 679, 185],
    doubleHCl: [1358, 1728, -370],
    ammoniaOxidation: [6186, 7458, -1272],
  };
  for (const [id, [a, b, c]] of Object.entries(refs)) {
    await scenario(page, id);
    await numberPrediction(page, input, a);
    await numberPrediction(page, release, b);
    await numberPrediction(page, change, c);
    await select(
      page,
      "Your reaction classification",
      c < 0 ? "exothermic" : "endothermic",
    );
    await check(page, true);
    if (id === "hydrogenChloride")
      await capture(page, prefix + info.project.name + "-ledger.png");
  }
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel(input, { exact: true })).toHaveValue("0");
  await expect(
    page.getByLabel("Supplied bond-energy example", { exact: true }),
  ).toHaveValue("hydrogenChloride");
});
test("inverse calculation retains a reversed-sign mistake and handles multiple unknown bonds on either side", async ({
  page,
}, info) => {
  await learn(page, 3);
  await opening(page);
  const label = "Your unknown bond energy / kJ per mole of bonds";
  await expect(page.locator(".bond-energy-workbench table")).toContainText("X");
  await numberPrediction(page, label, 188);
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.getByLabel(label, { exact: true })).toHaveValue("188");
  await numberPrediction(page, label, 290);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-inverse.png");
  for (const [id, x] of [
    ["unknownHCl", 432],
    ["unknownOH", 464],
    ["unknownHH", 436],
  ] as [string, number][]) {
    await scenario(page, id);
    await expect(page.locator(".bond-energy-workbench table")).toContainText(
      "X",
    );
    await numberPrediction(page, label, x);
    await check(page, true);
  }
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel(label, { exact: true })).toHaveValue("0");
});
test("unequal and excessive cancellations remain visible while matched cancellation preserves the net difference", async ({
  page,
}, info) => {
  await learn(page, 4);
  await opening(page);
  await bump(page, "Your cancelled reactant C–H entries", 3);
  await bump(page, "Your cancelled product C–H entries", 2);
  await numberPrediction(
    page,
    "Your signed overall change / kJ per mole of reaction",
    -51,
  );
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your cancelled product C–H entries", { exact: true }),
  ).toHaveText("2");
  await bump(page, "Your cancelled product C–H entries", 1);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-cancellation.png");
  await bump(page, "Your cancelled reactant C–H entries", 1);
  await bump(page, "Your cancelled product C–H entries", 1);
  await check(page, false);
  await expect(
    page.getByLabel("Your cancelled product C–H entries", { exact: true }),
  ).toHaveText("4");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your cancelled reactant C–H entries", { exact: true }),
  ).toHaveText("0");
});
test("plausible wrong scientific explanations reload as valid saved choices and all ten claims need their reason", async ({
  page,
}, info) => {
  await learn(page, 5);
  await opening(page);
  await scenario(page, "breaking");
  await select(page, "Your bond-energy claim", "Breaking releases energy");
  await select(
    page,
    "Your bond-energy reason",
    "All chemical changes release energy",
  );
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your bond-energy claim", { exact: true }),
  ).toHaveValue("Breaking releases energy");
  const refs: Record<string, [string, string]> = {
    breaking: [
      "Breaking requires input",
      "Energy overcomes the bonded attraction",
    ],
    formation: [
      "Energy is released",
      "Bond formation lowers the energy of the bonded system",
    ],
    exothermic: [
      "Overall exothermic",
      "Formation release exceeds breaking input",
    ],
    endothermic: [
      "Overall endothermic",
      "Breaking input exceeds formation release",
    ],
    mean: [
      "An approximate estimate",
      "Mean bond values depend on chemical environment",
    ],
    phase: [
      "Phase transfer also matters",
      "Gas-phase bond accounting excludes the water condensation change",
    ],
    activation: [
      "Not established by this ledger",
      "The bookkeeping path is not the actual reaction pathway",
    ],
    mechanism: [
      "Hypothetical accounting path",
      "It need not show actual elementary reaction steps",
    ],
    double: [
      "Use the O=O entry once",
      "One double bond is not two copies of a single-bond energy",
    ],
    scale: [
      "Overall energy doubles",
      "All bond counts double while energy per mole of bonds is unchanged",
    ],
  };
  for (const [id, [claim, reason]] of Object.entries(refs)) {
    await scenario(page, id);
    await select(page, "Your bond-energy claim", claim);
    await check(page, false);
    await select(page, "Your bond-energy reason", reason);
    await check(page, true);
  }
  await capture(page, prefix + info.project.name + "-evidence.png");
});
test("wrong coefficient recovery returns to the same original response without replacing it", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "2",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
  await capture(page, prefix + info.project.name + "-recovery.png");
});
test("actual rotatable methane asset exports five atoms, four single connections and finite tetrahedral geometry", async ({
  page,
}, info) => {
  await learn(page, 1);
  await scenario(page, "methane");
  await page
    .getByText("Inspect one supplied molecule: CH4", { exact: true })
    .click();
  const region = page.getByRole("group", {
    name: "Rotate covalent molecule",
    exact: true,
  });
  await expect(region).toHaveAttribute("data-ready", "true");
  await region.focus();
  await region.press("ArrowRight");
  await page
    .getByRole("button", { name: "Rotate molecule left", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download molecule as GLB", exact: true })
    .click();
  const d = await download,
    path = prefix + info.project.name + "-methane.glb";
  await d.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  const json = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  ) as {
    nodes: {
      name?: string;
      translation?: number[];
      matrix?: number[];
      mesh?: number;
      extras?: { bondOrder?: number; context?: string; bondOrders?: number[] };
    }[];
    meshes: { primitives: { attributes: { POSITION: number } }[] }[];
    accessors: {
      bufferView: number;
      byteOffset?: number;
      count: number;
      componentType: number;
      type: string;
    }[];
    bufferViews: {
      byteOffset?: number;
      byteLength: number;
      byteStride?: number;
    }[];
  };
  const atoms = json.nodes.filter((n) => n.name?.startsWith("atom-")),
    bonds = json.nodes.filter((n) => n.name?.startsWith("bond-"));
  expect(atoms).toHaveLength(5);
  expect(atoms.filter((n) => n.name?.endsWith("-H"))).toHaveLength(4);
  expect(atoms.filter((n) => n.name?.endsWith("-C"))).toHaveLength(1);
  expect(bonds).toHaveLength(4);
  expect(bonds.every((n) => n.extras?.bondOrder === 1)).toBe(true);
  const pos = (n: (typeof atoms)[number]) =>
      n.translation ?? n.matrix!.slice(12, 15),
    carbon = pos(atoms.find((n) => n.name!.endsWith("-C"))!),
    h = atoms
      .filter((n) => n.name!.endsWith("-H"))
      .map((n) => pos(n).map((v, i) => v - carbon[i]));
  for (let i = 0; i < 4; i++)
    for (let j = i + 1; j < 4; j++) {
      const cosine =
        h[i].reduce((sum, v, k) => sum + v * h[j][k], 0) /
        (Math.hypot(...h[i]) * Math.hypot(...h[j]));
      expect((Math.acos(cosine) * 180) / Math.PI).toBeCloseTo(109.47, 1);
    }
  expect(
    Math.max(...h.map((v) => v[2])) - Math.min(...h.map((v) => v[2])),
  ).toBeGreaterThan(1);
  const bin = 20 + buffer.readUInt32LE(12) + 8;
  let vertices = 0;
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) {
      const a = json.accessors[primitive.attributes.POSITION],
        v = json.bufferViews[a.bufferView];
      expect(a.componentType).toBe(5126);
      expect(a.type).toBe("VEC3");
      for (let i = 0; i < a.count; i++)
        for (let k = 0; k < 3; k++)
          expect(
            Number.isFinite(
              buffer.readFloatLE(
                bin +
                  (v.byteOffset ?? 0) +
                  (a.byteOffset ?? 0) +
                  i * (v.byteStride ?? 12) +
                  k * 4,
              ),
            ),
          ).toBe(true);
      vertices += a.count;
    }
  await writeFile(
    prefix + info.project.name + "-asset-audit.json",
    JSON.stringify(
      {
        bytes: buffer.length,
        atoms: atoms.length,
        bondConnections: bonds.length,
        bondOrders: bonds.map((n) => n.extras?.bondOrder),
        finiteVertices: vertices,
        moleculeOnly: true,
        hydrogenVectors: h,
      },
      null,
      2,
    ),
  );
  await capture(page, prefix + info.project.name + "-3d.png");
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  const cropStyle = await page.addStyleTag({
    content: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  await region.evaluate((n) => n.scrollIntoView({ block: "center" }));
  await page
    .locator(".covalent-asset")
    .screenshot({ path: prefix + info.project.name + "-enlarged3d.png" });
  await cropStyle.evaluate((n) => n.parentNode?.removeChild(n));
});
test("unavailable WebGL keeps readable projected structure and usable counts without electron-diagram claims", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (
        kind === "webgl" ||
        kind === "webgl2" ||
        kind === "experimental-webgl"
      )
        return null;
      return original.call(
        this,
        kind as "2d",
        args[0] as CanvasRenderingContext2DSettings,
      );
    } as typeof original;
  });
  await learn(page, 1);
  await scenario(page, "methane");
  await page
    .getByText("Inspect one supplied molecule: CH4", { exact: true })
    .click();
  await expect(
    page.getByText(
      "3D is unavailable. The labelled molecular projection, displayed reaction formulae and bond-count controls remain available.",
      { exact: true },
    ),
  ).toBeVisible();
  await bump(page, "Your reactant C–H bond count", 4);
  await bump(page, "Your reactant O=O bond count", 2);
  await bump(page, "Your product C=O bond count", 2);
  await bump(page, "Your product O–H bond count", 4);
  await check(page, true);
  await capture(page, prefix + info.project.name + "-fallback.png");
});
