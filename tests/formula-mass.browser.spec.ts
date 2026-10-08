import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { formulaMassJourney as journey } from "../src/content/journeys/formulae-and-mass";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".formula-mass-workbench .feedback[role=status]"),
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
test("actual molecular counting retains wrong subscripts and exports a genuine bent water structure", async ({
  page,
}, info) => {
  await page.goto("/lessons/formulae-and-mass");
  const formula = page.getByLabel("Inspect a formula", { exact: true }),
    box = await formula.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.getByLabel("Your H count", { exact: true }).selectOption("1");
  await page.getByLabel("Your O count", { exact: true }).selectOption("2");
  await check(page, false);
  await page.reload();
  await expect(page.getByLabel("Your H count", { exact: true })).toHaveValue(
    "1",
  );
  await page.getByLabel("Your H count", { exact: true }).selectOption("2");
  await page.getByLabel("Your O count", { exact: true }).selectOption("1");
  await check(page, true);
  const scene = page.getByRole("group", {
    name: "Rotate covalent molecule",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  const before = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", before!);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download molecule as GLB", exact: true })
    .click();
  const d = await pending,
    path = `docs/qa/formula-mass-water-${info.project.name}.glb`;
  await d.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  const nodes = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  ).nodes as { name?: string; translation?: number[]; matrix?: number[] }[];
  const atoms = nodes.filter((n) => /^atom-/.test(n.name ?? ""));
  expect(atoms).toHaveLength(3);
  expect(atoms.filter((n) => /-H$/.test(n.name ?? ""))).toHaveLength(2);
  expect(atoms.filter((n) => /-O$/.test(n.name ?? ""))).toHaveLength(1);
  const pos = (n: (typeof atoms)[number]) =>
    n.translation ?? n.matrix!.slice(12, 15);
  const oxygen = pos(atoms.find((n) => /-O$/.test(n.name!))!),
    vectors = atoms
      .filter((n) => /-H$/.test(n.name!))
      .map((n) => pos(n).map((v, i) => v - oxygen[i]));
  const cosine =
    vectors[0].reduce((s, v, i) => s + v * vectors[1][i], 0) /
    (Math.hypot(...vectors[0]) * Math.hypot(...vectors[1]));
  expect((Math.acos(cosine) * 180) / Math.PI).toBeCloseTo(104.6, 1);
  await capture(page, `docs/qa/formula-mass-${info.project.name}-water.png`);
  await formula.selectOption("CO2");
  await page.getByLabel("Your C count", { exact: true }).selectOption("1");
  await page.getByLabel("Your O count", { exact: true }).selectOption("2");
  await check(page, true);
});
test("student counts change real mass contributions and correct total cannot hide wrong counts", async ({
  page,
}, info) => {
  await page.goto("/lessons/formulae-and-mass");
  await task(page, 2);
  await page.getByLabel("Your Mg count", { exact: true }).selectOption("1");
  await page.getByLabel("Your Cl count", { exact: true }).selectOption("1");
  await page
    .getByLabel("Your predicted Mᵣ", { exact: true })
    .selectOption("95");
  await expect(page.locator('[data-mass-contribution="Cl"]')).toHaveAttribute(
    "data-relative-contribution",
    "35.5",
  );
  await check(page, false);
  await page.reload();
  await expect(page.getByLabel("Your Cl count", { exact: true })).toHaveValue(
    "1",
  );
  await page.getByLabel("Your Cl count", { exact: true }).selectOption("2");
  await expect(page.locator('[data-mass-contribution="Cl"]')).toHaveAttribute(
    "data-relative-contribution",
    "71",
  );
  await check(page, true);
  const widths = await page
    .locator(".mass-contribution-bar")
    .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().width));
  expect(widths[1] / widths[0]).toBeCloseTo(71 / 24, 1);
  await capture(page, `docs/qa/formula-mass-${info.project.name}-ledger.png`);
  await page
    .getByLabel("Inspect a formula", { exact: true })
    .selectOption("NaCl");
  await page.getByLabel("Your Na count", { exact: true }).selectOption("1");
  await page.getByLabel("Your Cl count", { exact: true }).selectOption("1");
  await page
    .getByLabel("Your predicted Mᵣ", { exact: true })
    .selectOption("58.5");
  await check(page, true);
});
test("every bracket atom is repeated without representing a salt molecule", async ({
  page,
}, info) => {
  await page.goto("/lessons/formulae-and-mass");
  await task(page, 3);
  await expect(page.locator("[data-formula-group]")).toHaveCount(2);
  await expect(page.locator("[data-formula-token]")).toHaveCount(4);
  await page.getByLabel("Your Ca count", { exact: true }).selectOption("1");
  await page.getByLabel("Your O count", { exact: true }).selectOption("1");
  await page.getByLabel("Your H count", { exact: true }).selectOption("2");
  await check(page, false);
  await page.reload();
  await expect(page.getByLabel("Your O count", { exact: true })).toHaveValue(
    "1",
  );
  await page.getByLabel("Your O count", { exact: true }).selectOption("2");
  await check(page, true);
  await capture(page, `docs/qa/formula-mass-${info.project.name}-brackets.png`);
  await page
    .getByLabel("Inspect a formula", { exact: true })
    .selectOption("MgNO3");
  await expect(page.locator("[data-formula-token]")).toHaveCount(8);
  await page.getByLabel("Your Mg count", { exact: true }).selectOption("1");
  await page.getByLabel("Your N count", { exact: true }).selectOption("2");
  await page.getByLabel("Your O count", { exact: true }).selectOption("6");
  await check(page, true);
});
test("coefficients change complete molecule count while per-formula relative mass stays eighteen", async ({
  page,
}, info) => {
  await page.goto("/lessons/formulae-and-mass");
  await task(page, 4);
  for (const coefficient of [1, 2, 3]) {
    await page
      .getByLabel("Coefficient before H₂O", { exact: true })
      .selectOption(String(coefficient));
    await expect(page.locator("[data-water-formula]")).toHaveCount(coefficient);
    await page
      .getByLabel("Total represented H atoms", { exact: true })
      .selectOption(String(2 * coefficient));
    await page
      .getByLabel("Total represented O atoms", { exact: true })
      .selectOption(String(coefficient));
    await page
      .getByLabel("Mᵣ of one H₂O formula", { exact: true })
      .selectOption("36");
    await check(page, false);
    await page
      .getByLabel("Mᵣ of one H₂O formula", { exact: true })
      .selectOption("18");
    await check(page, true);
  }
  await capture(page, `docs/qa/formula-mass-${info.project.name}-quantity.png`);
});
test("all twenty-four independent tasks require complete counts working and honest written review", async ({
  page,
}, info) => {
  await page.goto("/lessons/formulae-and-mass");
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
    await expect(page.getByRole("status")).toContainText(
      q.rubric ? "Compare your explanation" : "That’s right",
    );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "formulae-and-mass"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "fm-v1-p-working")
      await capture(
        page,
        `docs/qa/formula-mass-${info.project.name}-independent.png`,
      );
  }
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/formulae-and-mass");
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
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["formulae-and-mass"]
                  .run.responses[id]?.fresh,
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
      for (const run of p.work["formulae-and-mass"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["formulae-and-mass"].run.submitted = Date.now() - delay - 1000;
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
test("unavailable WebGL keeps labelled molecular counts and retained wrong predictions", async ({
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
  await page.goto("/lessons/formulae-and-mass");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  expect(
    await page.locator(".covalent-diagram svg text").allTextContents(),
  ).toEqual(["O", "H", "H"]);
  await page.getByLabel("Your H count", { exact: true }).selectOption("1");
  await page.getByLabel("Your O count", { exact: true }).selectOption("1");
  await check(page, false);
  await page.reload();
  await expect(page.getByLabel("Your H count", { exact: true })).toHaveValue(
    "1",
  );
  await capture(page, `docs/qa/formula-mass-${info.project.name}-fallback.png`);
});
test("incorrect oxygen working survives targeted recovery", async ({
  page,
}) => {
  await page.goto("/lessons/formulae-and-mass");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 11);
  for (const [label, value] of [
    ["Mg contribution", "24"],
    ["O contribution", "16"],
    ["H contribution", "2"],
    ["Mᵣ total", "58"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Use count times Aᵣ", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("O contribution", { exact: true })).toHaveValue(
    "16",
  );
  await page.reload();
  await expect(page.getByLabel("O contribution", { exact: true })).toHaveValue(
    "16",
  );
});
