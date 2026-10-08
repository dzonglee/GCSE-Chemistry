import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fuelHalfJourney as journey } from "../src/content/journeys/fuel-half";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import {
  fuelHalfRecords,
  fuelHalfOptions,
  initialFuelHalfBoard,
} from "../src/lib/fuel-half";
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
    page.locator(".fuel-half-workbench .feedback[role=status]"),
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

const route = "/lessons/fuel-cell-half-equations";
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/fuel-cell-half-equations");
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
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/fuel-cell-half-equations-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "fuel-cell-half-equations"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false); // The opening hydrogen model has already exposed this exact demand.
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
      for (const run of p.work["fuel-cell-half-equations"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["fuel-cell-half-equations"].run.submitted =
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
                "fuel-cell-half-equations"
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
const fieldLabels: Record<string, string> = {
  a: "Your H₂ coefficient",
  b: "Your H⁺ coefficient",
  c: "Your electron coefficient",
  d: "Your H₂O coefficient",
  electronSide: "Your electron side",
  process: "Your electrode process",
  electrode: "Your electrode name and sign",
  leftCharge: "Your predicted left charge",
  rightCharge: "Your predicted right charge",
  hMultiplier: "Your hydrogen-half multiplier",
  oMultiplier: "Your oxygen-half multiplier",
  electrons: "Your electrons cancelled on each side",
  protons: "Your H⁺ cancelled on each side",
  cancel: "Your cancellation rule",
  hydrogen: "Your net H₂ coefficient",
  oxygen: "Your net O₂ coefficient",
  water: "Your net H₂O coefficient",
  carrier: "Your proposed charge carrier",
  path: "Your proposed conducting path",
  direction: "Your proposed direction",
  hydrogenSign: "Your hydrogen-electrode sign",
  oxygenSign: "Your oxygen-electrode sign",
  claim: "Your supported claim",
  reason: "Your chemical reason",
};
for (const [mode, n] of [
  ["construct", 1],
  ["combine", 3],
  ["path", 4],
  ["diagnose", 5],
  ["evidence", 6],
] as const)
  test(`${mode}: all supplied cases preserve predictions, explain errors and reflow accessibly`, async ({
    page,
  }, info) => {
    await learn(page, n);
    const first = page
      .locator(".fuel-half-workbench > .fuel-field")
      .first()
      .locator("input,select");
    const box = await first.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    if (info.project.name === "mobile")
      expect(box!.y + box!.height).toBeLessThanOrEqual(664);
    const cases = Object.keys(fuelHalfRecords[mode]);
    for (const key of cases) {
      if (key !== "initial") {
        await page
          .getByText("Choose another supplied case", { exact: true })
          .click();
        await page
          .getByLabel("Supplied fuel-cell case", { exact: true })
          .selectOption(key);
        await page
          .getByText("Choose another supplied case", { exact: true })
          .click();
      }
      await check(page, false);
      const board = initialFuelHalfBoard(mode, key),
        r = (fuelHalfRecords[mode] as Record<string, Record<string, unknown>>)[
          key
        ];
      for (const k of Object.keys(board)) if (k in r) board[k] = String(r[k]);
      if (mode === "construct") {
        board.leftCharge = "0";
        board.rightCharge = "0";
      }
      if (mode === "combine") board.cancel = "electrons-and-protons";
      for (const [field, value] of Object.entries(board)) {
        if (
          field === "record" ||
          (field === "d" && mode === "construct" && r.kind === "hydrogen")
        )
          continue;
        const label =
          field === "a" && r.kind === "oxygen"
            ? "Your O₂ coefficient"
            : fieldLabels[field];
        if (fuelHalfOptions[mode][field])
          await page.getByLabel(label, { exact: true }).selectOption(value);
        else await page.getByLabel(label, { exact: true }).fill(value);
      }
      await check(page, true);
      if (key === "initial")
        await capture(
          page,
          `docs/qa/fuel-cell-half-equations-${info.project.name}-${mode}.png`,
        );
    }
  });
test("wrong signed charge persists across reload, undo and canonical reset; invalid raw fraction blocks checking", async ({
  page,
}) => {
  await learn(page, 1);
  await page
    .getByLabel("Your predicted right charge", { exact: true })
    .fill("-2");
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your predicted right charge", { exact: true }),
  ).toHaveValue("-2");
  await check(page, false);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your predicted right charge", { exact: true }),
  ).toHaveValue("0");
  await page
    .getByLabel("Your predicted right charge", { exact: true })
    .fill("1/2");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".fuel-half-workbench [role=alert]")).toContainText(
    "Fractions",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your predicted right charge", { exact: true }),
  ).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeEnabled();
});
test("a typed wrong charge equation returns from targeted recovery with its exact draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("H2 -> 2H+ + e-");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Combine signed charges", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "H2 -> 2H+ + e-",
  );
});
test("actual 3D preserves a wrong route in its downloadable binary geometry and supports keyboard rotation", async ({
  page,
}, info) => {
  await learn(page, 4);
  for (const [label, value] of [
    ["Your proposed charge carrier", "electrons"],
    ["Your proposed conducting path", "electrolyte"],
    ["Your proposed direction", "oxygen-to-hydrogen"],
    ["Your hydrogen-electrode sign", "negative"],
    ["Your oxygen-electrode sign", "positive"],
  ])
    await select(page, label, value);
  await page
    .getByText("Inspect your route in actual 3D", { exact: true })
    .click();
  const canvas = page.getByRole("group", {
    name: "Rotate acidic fuel-cell apparatus",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await canvas.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-rotation", "0");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  const download = await pending;
  await download.saveAs(
    `docs/qa/fuel-cell-half-equations-${info.project.name}-wrong-route.glb`,
  );
  const fs = await import("node:fs/promises"),
    data = await fs.readFile((await download.path())!);
  expect(data.toString("ascii", 0, 4)).toBe("glTF");
  expect(data.readUInt32LE(4)).toBe(2);
  expect(data.readUInt32LE(8)).toBe(data.length);
  const json = JSON.parse(
    data.toString("utf8", 20, 20 + data.readUInt32LE(12)),
  );
  const root = json.nodes.find(
    (node: { name?: string }) => node.name === "acidic-fuel-cell-cutaway",
  );
  expect(root.extras.direction).toBe("oxygen-to-hydrogen");
  expect(root.extras.path).toBe("electrolyte");
  expect(json.meshes.length).toBeGreaterThan(10);
  const binary = 20 + data.readUInt32LE(12) + 8;
  let vertices = 0,
    finite = true;
  for (const accessor of json.accessors.filter(
    (a: { type: string; componentType: number }) =>
      a.type === "VEC3" && a.componentType === 5126,
  )) {
    const view = json.bufferViews[accessor.bufferView],
      offset = binary + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0),
      stride = view.byteStride ?? 12;
    for (let i = 0; i < accessor.count; i++)
      for (let axis = 0; axis < 3; axis++)
        finite &&= Number.isFinite(
          data.readFloatLE(offset + i * stride + axis * 4),
        );
    vertices += accessor.count;
  }
  expect(finite).toBe(true);
  expect(vertices).toBeGreaterThan(1000);
  await select(page, "Your proposed conducting path", "external-wire");
  await select(page, "Your proposed direction", "hydrogen-to-oxygen");
  await check(page, true);
  await expect(canvas).toHaveAttribute("data-ready", "true");
  const canonicalPending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D apparatus", exact: true })
    .click();
  const canonical = await canonicalPending;
  await canonical.saveAs(
    `docs/qa/fuel-cell-half-equations-${info.project.name}-acidic-cell.glb`,
  );
  const canonicalData = await fs.readFile((await canonical.path())!);
  const canonicalJson = JSON.parse(
    canonicalData.toString("utf8", 20, 20 + canonicalData.readUInt32LE(12)),
  );
  const canonicalRoot = canonicalJson.nodes.find(
    (node: { name?: string }) => node.name === "acidic-fuel-cell-cutaway",
  );
  expect(canonicalRoot.extras.direction).toBe("hydrogen-to-oxygen");
  expect(canonicalRoot.extras.path).toBe("external-wire");
  await capture(
    page,
    `docs/qa/fuel-cell-half-equations-${info.project.name}-3d.png`,
  );
  const cropStyle = await page.addStyleTag({
    content: ".mobile-bar,.skip-link{visibility:hidden!important}",
  });
  await page.locator(".fuel-cell-asset").screenshot({
    path: `docs/qa/fuel-cell-half-equations-${info.project.name}-enlarged3d.png`,
  });
  await cropStyle.evaluate((n) => n.parentNode?.removeChild(n));
});
test("unavailable WebGL keeps the two-dimensional proposed route and editable predictions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.includes("webgl")) return null;
      return original.apply(this, [kind, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await learn(page, 4);
  await page
    .getByText("Inspect your route in actual 3D", { exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await select(page, "Your proposed conducting path", "external-wire");
  await expect(
    page.getByLabel("Your proposed conducting path", { exact: true }),
  ).toHaveValue("external-wire");
  await check(page, false);
});

test("coefficient buttons update the actual fixed-formula equation and atom inventory without correcting a wrong electron count", async ({
  page,
}) => {
  await learn(page, 1);
  await page
    .getByRole("button", { name: "Increase H₂ coefficient", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Increase H⁺ coefficient", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Increase H⁺ coefficient", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Increase electron coefficient", exact: true })
    .click();
  await select(page, "Your electron side", "right");
  await expect(
    page.getByLabel("Your proposed equation", { exact: true }),
  ).toHaveText("1H₂ → 2H⁺ + 1e⁻");
  await expect(page.locator(".fuel-ledger tbody tr").first()).toHaveText(
    "H atoms22",
  );
  await select(page, "Your electrode process", "oxidation");
  await select(page, "Your electrode name and sign", "negative-anode");
  await check(page, false);
  await expect(
    page.getByLabel("Your electron coefficient", { exact: true }),
  ).toHaveValue("1");
  await page
    .getByRole("button", { name: "Increase electron coefficient", exact: true })
    .click();
  await check(page, true);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your proposed equation", { exact: true }),
  ).toHaveText("1H₂ → 2H⁺ + 2e⁻");
});

test("typed oxygen reduction accepts fuel-cell water vapour and rejects a chemically unsupported ice state", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  const input = page.getByLabel("Your answer", { exact: true });
  await input.fill("O2(g) + 4H+(aq) + 4e- -> 2H2O(g)");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
  await input.fill("O2(g) + 4H+(aq) + 4e- -> 2H2O(s)");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "Not yet.",
  );
  await expect(input).toHaveValue("O2(g) + 4H+(aq) + 4e- -> 2H2O(s)");
});
