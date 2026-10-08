import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { empiricalFormulaeJourney as journey } from "../src/content/journeys/empirical-formulae";
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
    page.locator(".empirical-workbench .feedback[role=status]"),
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

const route = "/lessons/empirical-formulae";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/empirical-formulae");
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
                  "empirical-formulae"
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
      for (const run of p.work["empirical-formulae"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["empirical-formulae"].run.submitted = Date.now() - delay - 1000;
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
test("Foundation mass-to-amount work preserves wrong gram ratios, canonical reset and keyboard reach", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(page.locator(".sample-tier")).toHaveCount(0);
  await expect(page.getByText("Chemistry only", { exact: true })).toHaveCount(
    0,
  );
  const first = page.getByLabel("Your Mg relative amount", { exact: true });
  const box = await first.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await first.focus();
  await first.press("ArrowDown");
  await first.press("Enter");
  await choices(page, {
    "Your Mg relative amount": "4.8",
    "Your O relative amount": "3.2",
    "Your Mg subscript": "3",
    "Your O subscript": "2",
    "Your relationship": "mass-ratio",
  });
  await check(page, false);
  await expect(page.locator(".formula-callout")).toContainText("Mg3O2");
  await saved(page);
  await page.reload();
  await expect(first).toHaveValue("4.8");
  await choices(page, {
    "Your Mg relative amount": "0.2",
    "Your O relative amount": "0.2",
    "Your Mg subscript": "1",
    "Your O subscript": "1",
    "Your relationship": "mass-over-Ar",
  });
  await check(page, true);
  await select(page, "Explore a composition record", "kilograms");
  await select(page, "Your Mg relative amount", "0.0048");
  await check(page, false);
  await select(page, "Your Mg relative amount", "0.2");
  await check(page, true);
  await capture(
    page,
    `docs/qa/empirical-formulae-${info.project.name}-masses.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(first).toHaveValue("unset");
  await expect(
    page.getByLabel("Explore a composition record", { exact: true }),
  ).toHaveValue("initial");
});
test("exact halves and thirds multiply every part and demand a smallest whole ratio", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "First element subscript": "2",
    "Second element subscript": "3",
    "Your common multiplier": "2",
    "Your relationship": "round-each",
  });
  await check(page, false);
  await select(page, "Your relationship", "multiply-all-then-simplify");
  await check(page, true);
  await select(page, "Explore a composition record", "halves");
  await select(page, "Second element subscript", "5");
  await check(page, true);
  await select(page, "Explore a composition record", "thirds");
  await choices(page, {
    "First element subscript": "3",
    "Second element subscript": "4",
    "Your common multiplier": "3",
  });
  await check(page, true);
  await expect(page.locator(".formula-callout")).toContainText("Fe3O4");
  await capture(
    page,
    `docs/qa/empirical-formulae-${info.project.name}-fraction.png`,
  );
});
test("percentage mass basis scales the sample and distinguishes justified rounded analysis", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your C subscript": "1",
    "Your H subscript": "4",
    "Your O subscript": "1",
    "Your relationship": "percent-is-atom-ratio",
  });
  await check(page, false);
  await select(page, "Your relationship", "percent-to-mass-to-amount");
  await check(page, true);
  await select(page, "Explore a composition record", "larger");
  await check(page, true);
  await expect(page.locator(".empirical-workbench table")).toContainText("75");
  await select(page, "Explore a composition record", "rounded");
  await select(page, "Your H subscript", "2");
  await check(page, true);
  await expect(page.locator(".formula-callout")).toContainText("CH2O");
  const amount = page
    .locator(".empirical-ledger tbody tr")
    .first()
    .locator("td")
    .nth(1);
  await expect(amount).toHaveText("3.33333");
  expect(
    await amount.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getClientRects().length;
    }),
  ).toBe(1);
  const inputs = page.locator(".sample-task-answer .multipart-answer input");
  await expect(inputs).toHaveCount(3);
  const bounds = await inputs.evaluateAll((elements) =>
    elements.map((e) => e.getBoundingClientRect().toJSON()),
  );
  expect(
    Math.max(...bounds.map((b) => b.y)) - Math.min(...bounds.map((b) => b.y)),
  ).toBeLessThan(2);
  expect(bounds.every((b) => b.height >= 44 && b.width >= 44)).toBe(true);

  await capture(
    page,
    `docs/qa/empirical-formulae-${info.project.name}-percent.png`,
  );
});
test("whole molecules scale every subscript and incompatible exact masses are diagnosed", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your empirical formula mass": "15",
    "Your molecular multiplier": "2",
    "First element atom count": "2",
    "Second element atom count": "6",
    "Your relationship": "whole-molecular-multiple",
  });
  await check(page, true);
  await expect(
    page.getByRole("group", { name: "Rotate intact ethane molecule" }),
  ).toHaveAttribute("data-ready", "true");
  await capture(
    page,
    `docs/qa/empirical-formulae-${info.project.name}-molecular.png`,
  );
  await select(page, "Explore a composition record", "larger");
  await expect(page.locator(".ethane-formula-asset")).toHaveCount(0);
  await choices(page, {
    "Your empirical formula mass": "14",
    "Your molecular multiplier": "4",
    "First element atom count": "4",
    "Second element atom count": "8",
  });
  await check(page, true);
  await select(page, "Explore a composition record", "inconsistent");
  await choices(page, {
    "Your molecular multiplier": "2.5",
    "First element atom count": "undefined",
    "Second element atom count": "undefined",
  });
  await check(page, true);
  await expect(page.locator(".empirical-workbench .feedback")).toContainText(
    "no consistent whole molecular formula",
  );
});
test("crucible subtraction separates oxygen gain and changing readings remain provisional ratios", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your Mg mass": "0.48",
    "Your oxygen gain": "0.8",
    "Your Mg ratio part": "1",
    "Your O ratio part": "1",
    "Your relationship": "constant-mass-supports-ratio",
  });
  await check(page, false);
  await select(page, "Your oxygen gain", "0.32");
  await check(page, true);
  await select(page, "Explore a composition record", "premature");
  await choices(page, {
    "Your oxygen gain": "0.24",
    "Your Mg ratio part": "4",
    "Your O ratio part": "3",
  });
  await check(page, false);
  await select(page, "Your relationship", "not-yet-constant");
  await check(page, true);
  await expect(page.locator(".formula-callout")).toContainText("Mg:O = 4:3");
  await expect(page.locator(".formula-callout")).not.toContainText("Mg4O3");
  await capture(
    page,
    `docs/qa/empirical-formulae-${info.project.name}-experiment.png`,
  );
});
test("every original practice item marks numeric work and keeps written explanations self-reviewed", async ({
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
    await expect(
      page.locator(".sample-task-answer .feedback[role=status]"),
    ).toContainText(q.rubric ? "Compare your explanation" : "That’s right");
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "empirical-formulae"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("independent element amounts have aligned fields and no assisted answers before submission", async ({
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
    `docs/qa/empirical-formulae-${info.project.name}-independent.png`,
  );
});
test("real ethane GLB has eight nonplanar atoms, seven bonds and complete molecular counts", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  const canvas = page.getByRole("group", {
    name: "Rotate intact ethane molecule",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download intact ethane as GLB", exact: true })
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
    matrix?: number[];
    translation?: number[];
    extras?: {
      element?: string;
      atomId?: string;
      bond?: boolean;
      from?: number;
      to?: number;
    };
  };
  const nodes = gltf.nodes as Node[],
    atoms = nodes.filter((n) => n.extras?.element),
    bonds = nodes.filter((n) => n.extras?.bond);
  expect(atoms).toHaveLength(8);
  expect(atoms.filter((n) => n.extras?.element === "C")).toHaveLength(2);
  expect(atoms.filter((n) => n.extras?.element === "H")).toHaveLength(6);
  expect(bonds).toHaveLength(7);
  expect(atoms.every((n) => typeof n.mesh === "number")).toBe(true);
  for (const atom of atoms) {
    const index = Number(atom.extras?.atomId?.split("-")[1]);
    expect(
      bonds.filter((b) => b.extras?.from === index || b.extras?.to === index)
        .length,
    ).toBe(atom.extras?.element === "C" ? 4 : 1);
  }
  const z = atoms.map((n) => n.translation?.[2] ?? n.matrix?.[14] ?? 0);
  expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(1.5);
  await writeFile(
    `docs/qa/empirical-formulae-${info.project.name}-ethane.glb`,
    bytes,
  );
  await page.locator(".ethane-formula-asset").screenshot({
    path: `docs/qa/empirical-formulae-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
  await canvas.focus();
  for (let i = 0; i < 16; i++) await page.keyboard.press("ArrowRight");
  expect(Number(await canvas.getAttribute("data-rotation"))).toBeCloseTo(
    1.6,
    12,
  );
  await page.locator(".ethane-formula-asset").screenshot({
    path: `docs/qa/empirical-formulae-${info.project.name}-quarter-turn.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
});
test("unavailable 3D keeps correct ethane interpretation and usable molecular calculations", async ({
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
    "2 C and 6 H",
  );
  await choices(page, {
    "Your empirical formula mass": "15",
    "Your molecular multiplier": "2",
    "First element atom count": "2",
    "Second element atom count": "6",
    "Your relationship": "whole-molecular-multiple",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/empirical-formulae-${info.project.name}-fallback.png`,
  );
});
test("fractional-ratio recovery preserves the original wrong formula after teaching and reload", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 5);
  await page.getByRole("radio", { name: "AlO2", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Preserve a half ratio", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "AlO2", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".storage-warning")).toHaveCount(0);
});
