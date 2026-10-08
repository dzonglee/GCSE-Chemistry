import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { aqueousProductsJourney as journey } from "../src/content/journeys/aqueous-products";
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
    page.locator(".aqueous-products-workbench .feedback[role=status]"),
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

const route = "/lessons/aqueous-electrolysis-products";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/aqueous-electrolysis-products");
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
          page.getByRole("radio", { name: q.answer, exact: true }),
        ).toBeChecked();
      }
      if (form === 0 && i === 2) {
        await expect(page.locator(".aqueous-independent-scale")).toBeVisible();
        await capture(
          page,
          "docs/qa/aqueous-products-" +
            test.info().project.name +
            "-independent-reading.png",
        );
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
                  "aqueous-electrolysis-products"
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
      for (const run of p.work["aqueous-electrolysis-products"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["aqueous-electrolysis-products"].run.submitted =
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
                "aqueous-electrolysis-products"
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
test("native cathode prediction preserves wrong hydrogen, keyboard input, reload, undo and changed phase", async ({
  page,
}, info) => {
  await page.goto(route);
  const input = page.getByLabel("Your cathode product", { exact: true }),
    box = await input.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await input.focus();
  await page.keyboard.press("h");
  await page.keyboard.press("Enter");
  await select(page, "Your cathode product", "H2");
  await select(page, "Your cathode reason", "water-competes");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your cathode product", { exact: true }),
  ).toHaveValue("H2");
  await select(page, "Your cathode product", "Cu");
  await select(page, "Your cathode reason", "metal-below-hydrogen");
  await check(page, true);
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-cathode.png",
  );
  await select(page, "Explore a supplied aqueous record", "sodium");
  await select(page, "Your cathode product", "H2");
  await select(page, "Your cathode reason", "water-competes");
  await check(page, true);
  await select(page, "Explore a supplied aqueous record", "molten");
  await select(page, "Your cathode product", "Na");
  await select(page, "Your cathode reason", "no-water");
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your cathode reason", { exact: true }),
  ).toHaveValue("water-competes");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Explore a supplied aqueous record", { exact: true }),
  ).toHaveValue("initial");
  await expect(
    page.getByLabel("Your cathode product", { exact: true }),
  ).toHaveValue("unset");
});
test("aqueous products distinguish neutral halogens, salt metals and non-halides", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your aqueous cathode product": "Na",
    "Your aqueous anode product": "Cl−",
  });
  await check(page, false);
  await choices(page, {
    "Your aqueous cathode product": "H2",
    "Your aqueous anode product": "Cl2",
  });
  await check(page, true);
  for (const [record, cathode, anode] of [
    ["copper", "Cu", "O2"],
    ["bromide", "H2", "Br2"],
    ["sulfate", "H2", "O2"],
    ["silver", "Ag", "O2"],
  ]) {
    await select(page, "Explore a supplied aqueous record", record);
    await choices(page, {
      "Your aqueous cathode product": cathode,
      "Your aqueous anode product": anode,
    });
    await check(page, true);
  }
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-products.png",
  );
});
test("active copper and inert oxygen records cannot share an anode prediction", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your anode change": "oxygen-forms",
    "Your copper-ion change": "copper-ions-decrease",
  });
  await check(page, false);
  await choices(page, {
    "Your anode change": "copper-dissolves",
    "Your copper-ion change": "copper-ions-replenished",
  });
  await check(page, true);
  await expect(
    page.getByRole("group", {
      name: "Rotate copper transfer reference",
      exact: true,
    }),
  ).toHaveAttribute("data-ready", "true");
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-transfer.png",
  );
  await select(page, "Explore a supplied aqueous record", "inert");
  await expect(
    page.getByRole("group", {
      name: "Rotate copper transfer reference",
      exact: true,
    }),
  ).toHaveCount(0);
  await check(page, false);
  await choices(page, {
    "Your anode change": "oxygen-forms",
    "Your copper-ion change": "copper-ions-decrease",
  });
  await check(page, true);
});
test("gas marker retains wrong readings, atomic record reset and distinct positive-correlation claims", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  const up = page.getByRole("button", {
    name: "↑ Move reading up 1 cm³",
    exact: true,
  });
  for (let i = 0; i < 3; i++) await up.click();
  await choices(page, {
    "Your direct-proportion classification": "both",
    "Your positive-correlation classification": "both",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.locator(".aqueous-gas-graph")).toContainText("3 cm³");
  await up.click();
  await select(page, "Your direct-proportion classification", "hydrogen-only");
  await check(page, true);
  const texts = await page
    .locator(".aqueous-gas-graph svg text")
    .evaluateAll((ns) =>
      ns.map((n) => {
        const s = n as SVGGraphicsElement,
          m = s.getScreenCTM()!;
        return (
          Number.parseFloat(getComputedStyle(s).fontSize) * Math.hypot(m.c, m.d)
        );
      }),
    );
  expect(Math.min(...texts)).toBeGreaterThanOrEqual(12);
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-graph.png",
  );
  await select(page, "Explore a supplied aqueous record", "offset");
  await expect(page.locator(".aqueous-gas-graph")).toContainText("0 cm³");
  for (let i = 0; i < 6; i++) await up.click();
  await select(page, "Your direct-proportion classification", "neither");
  await check(page, true);
});
test("practical evidence separates identities from bubbles and controlled from confounded comparisons", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your observation summary": "bubbles-only",
    "Your evidence decision": "bubbles-prove-hydrogen",
  });
  await check(page, false);
  await choices(page, {
    "Your observation summary": "pop-and-relight",
    "Your evidence decision": "hypothesis-supported",
  });
  await check(page, true);
  for (const [record, observation, decision] of [
    ["bubbles", "bubbles-only", "identity-not-established"],
    ["controlled", "controlled-comparison", "material-effect-comparable"],
    ["confounded", "several-changes", "material-effect-not-isolated"],
  ]) {
    await select(page, "Explore a supplied aqueous record", record);
    await choices(page, {
      "Your observation summary": observation,
      "Your evidence decision": decision,
    });
    await check(page, true);
  }
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-investigation.png",
  );
});
test("actual binary export preserves24 atomic meshes, twelve identities, tetrahedral sulfate and copper transfer", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const canvas = page.getByRole("group", {
    name: "Rotate copper transfer reference",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  for (let i = 0; i < 7; i++)
    await page
      .getByRole("button", { name: "Rotate right", exact: true })
      .click();
  await canvas.screenshot({
    path: "docs/qa/aqueous-products-" + info.project.name + "-asset.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  await page
    .getByRole("button", { name: "Enlarge after state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "after");
  await canvas.screenshot({
    path:
      "docs/qa/aqueous-products-" + info.project.name + "-enlarged-after.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const d = await pending;
  await d.saveAs(
    "docs/qa/aqueous-products-" + info.project.name + "-transfer.glb",
  );
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString()),
    atoms = g.nodes.filter(
      (n: { extras?: { element?: string } }) => n.extras?.element,
    );
  expect(atoms).toHaveLength(24);
  expect(
    new Set(
      atoms.map((n: { extras: { atomicId: string } }) => n.extras.atomicId),
    ).size,
  ).toBe(12);
  expect(
    atoms.filter(
      (n: { extras: { element: string } }) => n.extras.element === "Cu",
    ),
  ).toHaveLength(14);
  expect(
    g.nodes.filter(
      (n: { extras?: { kind?: string } }) =>
        n.extras?.kind === "sulfate-connection",
    ),
  ).toHaveLength(8);
  expect(
    g.nodes.reduce(
      (s: number, n: { extras?: { ionicCharge?: number } }) =>
        s + (n.extras?.ionicCharge ?? 0),
      0,
    ),
  ).toBe(0);
  const bin = 28 + len;
  for (const mesh of g.meshes) {
    const a = g.accessors[mesh.primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      start = bin + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    expect(a.componentType).toBe(5126);
    for (let i = 0; i < a.count * 3; i++)
      expect(Number.isFinite(bytes.readFloatLE(start + i * 4))).toBe(true);
  }
});
test("wrong inert-electrode claim survives targeted recovery with its original draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 9);
  const wrong =
    "Copper ions stay unchanged because every anode supplies copper";
  await page.getByRole("radio", { name: wrong, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Read electrode material", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
});
test("WebGL fallback retains copper transfer inventory and editable predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind,
      ...args
    ) {
      if (String(kind).startsWith("webgl")) return null;
      return get.call(this, kind, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await task(page, 3);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await choices(page, {
    "Your anode change": "copper-dissolves",
    "Your copper-ion change": "copper-ions-replenished",
  });
  await check(page, true);
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-fallback.png",
  );
});
test("fresh independent aqueous form hides models, hints and marking before submission", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-independent.png",
  );
});

test("inverted cylinder reading follows printed direction, retains wrong marker and resets on changed observation", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 6);
  const down = page.getByRole("button", {
    name: "↓ Move reading down 0.2 cm³",
    exact: true,
  });
  for (let i = 0; i < 21; i++) await down.click();
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.locator(".aqueous-inverted-scale")).toContainText(
    "4.2 cm³",
  );
  await down.click();
  await check(page, true);
  const sizes = await page
    .locator(".aqueous-inverted-scale svg text")
    .evaluateAll((ns) =>
      ns.map((n) => {
        const s = n as SVGGraphicsElement,
          m = s.getScreenCTM()!;
        return (
          Number.parseFloat(getComputedStyle(s).fontSize) * Math.hypot(m.c, m.d)
        );
      }),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await capture(
    page,
    "docs/qa/aqueous-products-" + info.project.name + "-reading.png",
  );
  await select(page, "Explore a supplied aqueous record", "low");
  await expect(page.locator(".aqueous-inverted-scale")).toContainText(
    "0.0 cm³",
  );
  for (let i = 0; i < 14; i++) await down.click();
  await check(page, true);
});
