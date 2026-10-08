import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { gasVolumesJourney as journey } from "../src/content/journeys/gas-volumes";
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
    page.locator(".gas-workbench .feedback[role=status]"),
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

const route = "/lessons/gas-volumes-and-solutions";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/gas-volumes-and-solutions");
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
          page.getByLabel(q.parts![0].label, { exact: true }),
        ).toHaveValue(JSON.parse(q.answer)[q.parts![0].id]);
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
                  "gas-volumes-and-solutions"
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
      for (const run of p.work["gas-volumes-and-solutions"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["gas-volumes-and-solutions"].run.submitted =
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
test("RTP amount and cubic units retain wrong predictions, keyboard access and reset", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(page.locator(".sample-tier")).toHaveText("Higher");
  await expect(page.getByText("Chemistry only", { exact: true })).toBeVisible();
  const first = page.getByLabel("Your gas volume", { exact: true });
  const box = await first.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await first.focus();
  await first.press("ArrowDown");
  await first.press("Enter");
  await choices(page, {
    "Your gas volume": "24",
    "Volume unit": "cm3",
    "Your relationship": "24cm3",
  });
  await check(page, false);
  await expect(
    page.getByRole("img", { name: /1 mol reference/ }),
  ).toHaveAccessibleName(/24000.*24/);
  await saved(page);
  await page.reload();
  await expect(first).toHaveValue("24");
  await choices(page, {
    "Your gas volume": "7200",
    "Volume unit": "cm3",
    "Your relationship": "moles-times24-convert",
  });
  await check(page, true);
  await select(page, "Explore a gas record", "larger");
  await select(page, "Your gas volume", "14400");
  await check(page, true);
  await capture(page, `docs/qa/gas-volumes-${info.project.name}-molar.png`);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(first).toHaveValue("unset");
  await expect(
    page.getByLabel("Explore a gas record", { exact: true }),
  ).toHaveValue("initial");
});
test("gas molecular mass and kilograms change the appropriate amount, not the RTP constant", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your gas mass": "8.8",
    "Your gas amount": "0.275",
    "Your gas volume": "6.6",
    "Your relationship": "grams-divide-M-times24",
  });
  await check(page, true);
  await select(page, "Explore a gas record", "different");
  await check(page, false);
  await choices(page, { "Your gas amount": "0.2", "Your gas volume": "4.8" });
  await check(page, true);
  await select(page, "Explore a gas record", "kilograms");
  await select(page, "Your gas mass", "0.0088");
  await check(page, false);
  await choices(page, {
    "Your gas mass": "8.8",
    "Your gas amount": "0.275",
    "Your gas volume": "6.6",
  });
  await check(page, true);
  await capture(page, `docs/qa/gas-volumes-${info.project.name}-mass.png`);
});
test("gas equation volumes scale backwards from the known product under matching conditions", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your N2 volume": "15",
    "Your H2 volume": "45",
    "Your NH3 volume": "30",
    "Your relationship": "mass-ratio",
  });
  await check(page, false);
  await select(page, "Your relationship", "matching-gas-coefficients");
  await check(page, true);
  await select(page, "Explore a gas record", "ammonia");
  await choices(page, {
    "Your N2 volume": "12",
    "Your H2 volume": "36",
    "Your NH3 volume": "24",
  });
  await check(page, true);
  await select(page, "Explore a gas record", "hydrogen");
  await choices(page, {
    "Your N2 volume": "6",
    "Your H2 volume": "18",
    "Your NH3 volume": "12",
  });
  await check(page, true);
  await capture(page, `docs/qa/gas-volumes-${info.project.name}-ratio.png`);
});
test("dry gas inventory includes unused methane or oxygen but excludes collected liquid water", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your CO2 volume": "20",
    "Your unused gas volume": "10",
    "Unused gas identity": "CH4",
    "Your total dry gas": "20",
    "Your relationship": "dry-products-plus-unused",
  });
  await check(page, false);
  await select(page, "Your total dry gas", "30");
  await check(page, true);
  await expect(
    page.getByRole("group", { name: "Rotate dry gas inventory" }),
  ).toHaveAttribute("data-ready", "true");
  await capture(page, `docs/qa/gas-volumes-${info.project.name}-remaining.png`);
  await select(page, "Explore a gas record", "oxygenExcess");
  await choices(page, {
    "Your CO2 volume": "10",
    "Your unused gas volume": "10",
    "Unused gas identity": "O2",
    "Your total dry gas": "20",
  });
  await check(page, true);
  await expect(
    page.locator(".reaction-amounts-asset figcaption"),
  ).toContainText("40 cm³");
  await expect(
    page.locator(".reaction-amounts-asset figcaption"),
  ).toContainText("20 cm³");
  await select(page, "Explore a gas record", "stoichiometric");
  await choices(page, {
    "Your CO2 volume": "10",
    "Your unused gas volume": "0",
    "Unused gas identity": "none",
    "Your total dry gas": "10",
  });
  await check(page, true);
});
test("steam contributes to final gas while solid silica is excluded without assuming RTP", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your steam volume": "60",
    "Your unused gas volume": "30",
    "Your total gas volume": "90",
    "Your relationship": "exclude-steam",
  });
  await check(page, false);
  await select(page, "Your relationship", "steam-and-unused-gases");
  await check(page, true);
  await select(page, "Explore a gas record", "oxygenLimited");
  await choices(page, {
    "Your steam volume": "30",
    "Your unused gas volume": "10",
    "Your total gas volume": "40",
  });
  await check(page, true);
  await capture(page, `docs/qa/gas-volumes-${info.project.name}-phases.png`);
});
test("every original practice item works and explanations remain honest self-review", async ({
  page,
}) => {
  await page.goto(route);
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
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("Compare your explanation");
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "gas-volumes-and-solutions"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toHaveClass(/correct/);
  }
});
test("fresh multipart independent task has aligned fields and no model or pre-submit answers", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  const q = journey.checkForms[0][0];
  await answer(page, q);
  const a = await page
      .getByLabel(q.parts![0].label, { exact: true })
      .boundingBox(),
    b = await page.getByLabel(q.parts![1].label, { exact: true }).boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    `docs/qa/gas-volumes-${info.project.name}-independent.png`,
  );
});
test("WebGL failure retains accurate phases and usable numerical predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (/webgl/i.test(type)) return null;
      return Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
  await page.goto(route);
  await task(page, 4);
  await expect(page.getByText(/3D is unavailable/)).toContainText(
    "Dry total 30 cm³",
  );
  await choices(page, {
    "Your CO2 volume": "20",
    "Your unused gas volume": "10",
    "Unused gas identity": "CH4",
    "Your total dry gas": "30",
    "Your relationship": "dry-products-plus-unused",
  });
  await check(page, true);
  await capture(page, `docs/qa/gas-volumes-${info.project.name}-fallback.png`);
});
test("real binary 3D inventory conserves atoms, phase counts, unused identity and common gas-volume scale", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  const canvas = page.getByRole("group", {
    name: "Rotate dry gas inventory",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  for (const record of ["initial", "oxygenExcess"] as const) {
    if (record !== "initial") {
      await select(page, "Explore a gas record", record);
      await expect(canvas).toHaveAttribute("data-ready", "true");
    }
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download dry gas inventory as GLB",
        exact: true,
      })
      .click();
    const download = await pending;
    const { readFile } = await import("node:fs/promises");
    const bytes = await readFile((await download.path())!);
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    const gltf = JSON.parse(
      bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
    );
    type Node = {
      mesh?: number;
      translation?: number[];
      matrix?: number[];
      children?: number[];
      extras?: {
        element?: string;
        side?: string;
        phase?: string;
        formula?: string;
        unreacted?: boolean;
        originalId?: string;
        gasVolumeBoundary?: boolean;
      };
    };
    const nodes = gltf.nodes as Node[],
      atoms = nodes.filter((n) => n.extras?.element);
    expect(atoms).toHaveLength(record === "initial" ? 46 : 22);
    const counts = (side: string) =>
      Object.fromEntries(
        ["C", "H", "O"].map((e) => [
          e,
          atoms.filter(
            (n) => n.extras?.side === side && n.extras?.element === e,
          ).length,
        ]),
      );
    expect(counts("before")).toEqual(
      record === "initial" ? { C: 3, H: 12, O: 8 } : { C: 1, H: 4, O: 6 },
    );
    expect(counts("before")).toEqual(counts("after"));
    expect(atoms.every((n) => typeof n.mesh === "number")).toBe(true);
    const molecules = nodes.filter((n) => n.extras?.formula);
    expect(
      ["before", "after"].map(
        (side) =>
          molecules.filter(
            (n) => n.extras?.side === side && n.extras?.phase === "gas",
          ).length,
      ),
    ).toEqual(record === "initial" ? [7, 3] : [4, 2]);
    const liquid = molecules.filter((n) => n.extras?.phase === "liquid");
    expect(liquid).toHaveLength(record === "initial" ? 4 : 2);
    expect(liquid.every((n) => n.extras?.formula === "H2O")).toBe(true);
    expect(
      nodes.filter((n) => n.extras?.unreacted).map((n) => n.extras?.originalId),
    ).toEqual(
      record === "initial"
        ? ["retained-CH4-2", "retained-CH4-2"]
        : ["retained-O2-2", "retained-O2-2"],
    );
    const boundaries = nodes.filter((n) => n.extras?.gasVolumeBoundary);
    expect(boundaries).toHaveLength(2);
    const binaryStart = 20 + bytes.readUInt32LE(12) + 8;
    const volumes = boundaries.map((n) => {
      const accessor =
        gltf.accessors[gltf.meshes[n.mesh!].primitives[0].attributes.POSITION];
      expect(accessor.componentType).toBe(5126);
      expect(accessor.type).toBe("VEC3");
      const view = gltf.bufferViews[accessor.bufferView];
      const minimum = [Infinity, Infinity, Infinity],
        maximum = [-Infinity, -Infinity, -Infinity];
      for (let vertex = 0; vertex < accessor.count; vertex++)
        for (let axis = 0; axis < 3; axis++) {
          const value = bytes.readFloatLE(
            binaryStart +
              (view.byteOffset ?? 0) +
              (accessor.byteOffset ?? 0) +
              vertex * (view.byteStride ?? 12) +
              axis * 4,
          );
          minimum[axis] = Math.min(minimum[axis], value);
          maximum[axis] = Math.max(maximum[axis], value);
        }
      return maximum.reduce(
        (product, value, axis) => product * (value - minimum[axis]),
        1,
      );
    });
    expect(volumes[1] / volumes[0]).toBeCloseTo(
      record === "initial" ? 3 / 7 : 1 / 2,
      6,
    );
    const positions = molecules
      .filter((n) => n.extras?.phase === "gas")
      .map((n) => n.translation?.[2] ?? n.matrix?.[14] ?? 0);
    expect(Math.max(...positions) - Math.min(...positions)).toBeGreaterThan(1);
    await writeFile(
      `docs/qa/gas-volumes-${info.project.name}-${record}.glb`,
      bytes,
    );
    await page.locator(".reaction-amounts-asset").screenshot({
      path: `docs/qa/gas-volumes-${info.project.name}-${record}-asset.png`,
      style: ".mobile-bar,.skip-link{visibility:hidden}",
    });
  }
  await canvas.focus();
  for (let i = 0; i < 16; i++) await page.keyboard.press("ArrowRight");
  expect(Number(await canvas.getAttribute("data-rotation"))).toBeCloseTo(
    1.6,
    12,
  );
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/gas-volumes-${info.project.name}-quarter-turn.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
});
