import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { atomEconomyJourney as journey } from "../src/content/journeys/atom-economy";
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
    page.locator(".economy-workbench .feedback[role=status]"),
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

const route = "/lessons/atom-economy";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/atom-economy");
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
                JSON.parse(localStorage.getItem(key)!).work["atom-economy"].run
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
      for (const run of p.work["atom-economy"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["atom-economy"].run.submitted = Date.now() - delay - 1000;
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
test("named Foundation separate model preserves wrong coefficients, reload, reset and first-control access", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sample-tier")).toHaveCount(0);
  await expect(page.getByText("Chemistry only", { exact: true })).toBeVisible();
  const box = await page
    .getByLabel("Your copper contribution", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await choices(page, {
    "Your copper contribution": "127",
    "Your reactant total": "91.5",
    "Your atom economy": "74.3",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reactant total", { exact: true }),
  ).toHaveValue("91.5");
  await select(page, "Your reactant total", "171");
  await check(page, true);
  await capture(page, `docs/qa/atom-economy-${info.project.name}-weighted.png`);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your copper contribution", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
});
test("desired product and uniform equation scaling keep truthful reference totals and aligned fields", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your desired contribution": "56",
    "Your reactant total": "100",
    "Your atom economy": "56",
  });
  await check(page, true);
  await select(page, "Whole equation scale", "2");
  await check(page, false);
  await choices(page, {
    "Your desired contribution": "112",
    "Your reactant total": "200",
  });
  await check(page, true);
  await choices(page, {
    "Desired product": "CO2",
    "Whole equation scale": "5",
    "Your desired contribution": "220",
    "Your reactant total": "500",
    "Your atom economy": "44",
  });
  await check(page, true);
  await expect(page.locator(".economy-equation")).toContainText(
    "5CaCO3 → 5CaO + 5CO2",
  );
  await expect(page.locator(".economy-mass-chart")).toHaveAccessibleName(
    /Equation reactant total: 500; Your desired contribution: 220; Your denominator: 500/,
  );
  const rendered = await page
    .locator(".economy-mass-chart text")
    .evaluateAll((xs) =>
      xs.map(
        (x) =>
          parseFloat(getComputedStyle(x).fontSize) *
          (x as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...rendered)).toBeGreaterThanOrEqual(12);
  const fields = await page
    .locator(".economy-fields")
    .nth(1)
    .locator("select")
    .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().top));
  expect(Math.abs(fields[0] - fields[1])).toBeLessThan(1);
  await capture(page, `docs/qa/atom-economy-${info.project.name}-desired.png`);
  await choices(page, {
    "Desired product": "both",
    "Your desired contribution": "500",
    "Your atom economy": "100",
  });
  await check(page, true);
});
test("actual collection changes yield while one-product equation economy stays at one hundred", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your atom economy": "60",
    "Your collected percentage yield": "60",
  });
  await check(page, false);
  await select(page, "Your atom economy", "100");
  await check(page, true);
  await capture(page, `docs/qa/atom-economy-${info.project.name}-contrast.png`);
  for (const actual of ["0", "30"]) {
    await select(page, "Actual collected ethane", actual);
    await select(
      page,
      "Your collected percentage yield",
      actual === "0" ? "0" : "100",
    );
    await check(page, true);
    await expect(
      page.getByLabel("Your atom economy", { exact: true }),
    ).toHaveValue("100");
  }
});
test("mass partition rejects atom-count fractions and destruction while desired product changes", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your desired contribution": "44",
    "Your other-product contribution": "36",
    "Your reactant total": "80",
    "Your atom economy": "33.3",
    "Where are the other atoms?": "destroyed",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your atom economy", { exact: true }),
  ).toHaveValue("33.3");
  await choices(page, {
    "Your atom economy": "55",
    "Where are the other atoms?": "byproduct",
  });
  await check(page, true);
  await expect(
    page.locator(".economy-workbench .feedback[role=status]"),
  ).toContainText("55% atom economy");
  await capture(
    page,
    `docs/qa/atom-economy-${info.project.name}-partition.png`,
  );
  await choices(page, {
    "Desired product": "H2O",
    "Your desired contribution": "36",
    "Your other-product contribution": "44",
    "Your atom economy": "45",
  });
  await check(page, true);
});
test("real molecular allocation rotates and exports unchanged elements with desired product frames", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await page
    .getByRole("button", {
      name: "Inspect molecular allocation in 3D",
      exact: true,
    })
    .click();
  const scene = page.getByRole("group", {
    name: "Rotate atom economy allocation",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-rotation", "0.1");
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download allocation as GLB", exact: true })
    .click();
  const dl = await event,
    path = `docs/qa/atom-economy-allocation-${info.project.name}.glb`;
  await dl.saveAs(path);
  const data = await readFile(path);
  expect(data.readUInt32LE(0)).toBe(0x46546c67);
  expect(data.readUInt32LE(8)).toBe(data.length);
  const json = JSON.parse(
    data.subarray(20, 20 + data.readUInt32LE(12)).toString(),
  );
  for (const side of ["reactant", "product"]) {
    const atoms = json.nodes.filter(
      (n: { name?: string }) =>
        n.name?.startsWith(side + "-") && n.name.includes("-atom-"),
    );
    expect(atoms).toHaveLength(9);
    const counts = { C: 0, H: 0, O: 0 };
    for (const atom of atoms) {
      counts[atom.name.split("-").at(-1) as keyof typeof counts]++;
      expect(atom.mesh).not.toBeUndefined();
    }
    expect(counts).toEqual({ C: 1, H: 4, O: 4 });
  }
  expect(
    json.nodes.filter(
      (n: { extras?: { selectionFrame?: boolean } }) =>
        n.extras?.selectionFrame,
    ),
  ).toHaveLength(3);
  await capture(page, `docs/qa/atom-economy-${info.project.name}-3d.png`);
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/atom-economy-asset-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden !important}",
  });
  await select(page, "Desired product", "H2O");
  await expect(page.locator(".reaction-amounts-asset")).toContainText(
    "36 of 80 (45%)",
  );
  await expect(
    page.getByRole("group", {
      name: "Rotate atom economy allocation",
      exact: true,
    }),
  ).toHaveAttribute("data-ready", "true");
});
test("all twenty-three independent demands require mass bases, exact final rounding and false written correctness", async ({
  page,
}, info) => {
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
    await expect(
      page.getByText(q.rubric ? "Compare your explanation." : "That’s right.", {
        exact: true,
      }),
    ).toBeVisible();
    if (i === 0) {
      const inputs = await page
        .locator(".multipart-answer input")
        .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().top));
      expect(Math.abs(inputs[0] - inputs[1])).toBeLessThan(1);
    }
    if (i === 0)
      await capture(
        page,
        `docs/qa/atom-economy-${info.project.name}-independent.png`,
      );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "atom-economy"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("unrounded significant-figure and decimal answers remain incorrect", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (const [index, wrong, right] of [
    [4, "67.816091954", "67.8"],
    [5, "77.31092437", "77.3"],
  ] as const) {
    await task(page, index);
    await page.getByLabel("Your answer", { exact: true }).fill(wrong);
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(page.getByText("Not yet.", { exact: true })).toBeVisible();
    await page.getByLabel("Your answer", { exact: true }).fill(right);
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(
      page.getByText("That’s right.", { exact: true }),
    ).toBeVisible();
  }
});
test("coefficient misconception returns from recovery with the original response retained", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page
    .getByRole("radio", {
      name: "Remove carbon from the denominator",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Weight all reactants", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", {
      name: "Remove carbon from the denominator",
      exact: true,
    }),
  ).toBeChecked();
});
test("unavailable WebGL preserves the named desired product, wrong predictions and textual conservation", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Desired product": "H2O",
    "Your desired contribution": "18",
    "Your other-product contribution": "44",
    "Your reactant total": "80",
    "Your atom economy": "22.5",
    "Where are the other atoms?": "byproduct",
  });
  await check(page, false);
  await page
    .getByRole("button", {
      name: "Inspect molecular allocation in 3D",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your desired contribution", { exact: true }),
  ).toHaveValue("18");
  await expect(page.locator(".reaction-amounts-asset")).toContainText(
    "C1, H4 and O4 on each side",
  );
  await capture(page, `docs/qa/atom-economy-${info.project.name}-fallback.png`);
});
