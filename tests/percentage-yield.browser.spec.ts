import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { percentageYieldJourney as journey } from "../src/content/journeys/percentage-yield";
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
    page.locator(".yield-workbench .feedback[role=status]"),
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

const route = "/lessons/yield-and-atom-economy";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("Foundation separate scope has a named model, correct denominator and first-control access; wrong reactant mass survives reload", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sample-tier")).toHaveCount(0);
  await expect(page.getByText("Chemistry only", { exact: true })).toBeVisible();
  const box = await page
    .getByLabel("Supplied product report", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await choices(page, {
    "Your actual product mass": "15",
    "Your theoretical product mass": "12",
    "Your percentage yield": "125",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your theoretical product mass", { exact: true }),
  ).toHaveValue("12");
  await choices(page, {
    "Your theoretical product mass": "20",
    "Your percentage yield": "75",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/percentage-yield-${info.project.name}-fraction.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your actual product mass", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
  await select(page, "Supplied product report", "mixedUnits");
  await choices(page, {
    "Your actual product mass": "900",
    "Your theoretical product mass": "1.2",
    "Your percentage yield": "75",
  });
  await check(page, false);
  await select(page, "Your theoretical product mass", "1200");
  await check(page, true);
  await select(page, "Supplied product report", "none");
  await choices(page, {
    "Your actual product mass": "0",
    "Your theoretical product mass": "20",
    "Your percentage yield": "0",
  });
  await check(page, true);
  await select(page, "Supplied product report", "complete");
  await choices(page, {
    "Your actual product mass": "20",
    "Your percentage yield": "100",
  });
  await check(page, true);
});
test("actual target uses decimal yield factor, preserves a percent-loss mistake and requested gram units", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your decimal yield factor": "75",
    "Your actual product mass": "15",
  });
  await check(page, false);
  await select(page, "Your decimal yield factor", "0.75");
  await check(page, true);
  await capture(
    page,
    `docs/qa/percentage-yield-${info.project.name}-actual.png`,
  );
  await select(page, "Supplied yield report", "second");
  await choices(page, {
    "Your decimal yield factor": "0.6",
    "Your actual product mass": "30",
  });
  await check(page, true);
  await select(page, "Supplied yield report", "kilograms");
  await choices(page, {
    "Your decimal yield factor": "0.8",
    "Your actual product mass": "1200",
  });
  await check(page, true);
});
test("reverse theoretical denominator divides actual by the supplied factor, with aligned fields and truthful gram axis", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your decimal yield factor": "0.6",
    "Your theoretical product mass": "10.8",
  });
  await check(page, false);
  const gold = await page
    .locator(".yield-mass-chart g")
    .nth(1)
    .locator("rect")
    .last()
    .getAttribute("width");
  expect(Number(gold)).toBeCloseTo((10.8 / 18) * 325, 10);
  await select(page, "Your theoretical product mass", "30");
  await check(page, true);
  await expect(page.locator(".yield-mass-chart")).toHaveAccessibleName(
    /Actual product: 18 g; Your theoretical mass: 30 g/,
  );
  const rendered = await page
    .locator(".yield-mass-chart text")
    .evaluateAll((xs) =>
      xs.map(
        (x) =>
          parseFloat(getComputedStyle(x).fontSize) *
          (x as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...rendered)).toBeGreaterThanOrEqual(12);
  const fields = await page
    .locator(".yield-fields")
    .nth(1)
    .locator("select")
    .evaluateAll((xs) =>
      xs.map((x) => {
        const r = x.getBoundingClientRect();
        return { top: r.top, width: r.width, height: r.height };
      }),
    );
  expect(Math.abs(fields[0].top - fields[1].top)).toBeLessThan(1);
  for (const b of fields) {
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
  await capture(
    page,
    `docs/qa/percentage-yield-${info.project.name}-reverse.png`,
  );
  await select(page, "Supplied reverse report", "second");
  await choices(page, {
    "Your decimal yield factor": "0.8",
    "Your theoretical product mass": "15",
  });
  await check(page, true);
});
test("collection changes sample boundary but retains all formed product and rejects atom destruction", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your collected product mass": "16",
    "Your retained product mass": "4",
    "Your collected percentage yield": "80",
    "Your explanation of uncollected product": "destroyed",
  });
  await check(page, false);
  await select(page, "Your explanation of uncollected product", "remains");
  await check(page, true);
  await capture(
    page,
    `docs/qa/percentage-yield-${info.project.name}-collection.png`,
  );
  await select(page, "Number of recovered portions", "6");
  await choices(page, {
    "Your collected product mass": "12",
    "Your retained product mass": "8",
    "Your collected percentage yield": "60",
  });
  await check(page, true);
  await select(page, "Number of recovered portions", "10");
  await choices(page, {
    "Your collected product mass": "20",
    "Your retained product mass": "0",
    "Your collected percentage yield": "100",
  });
  await check(page, true);
});
test("actual keyboard-rotatable recovery export preserves identified2-g markers and collection location", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your collected product mass": "16",
    "Your retained product mass": "4",
    "Your collected percentage yield": "80",
    "Your explanation of uncollected product": "remains",
  });
  await check(page, true);
  await page
    .getByRole("button", {
      name: "Inspect recovery inventory in 3D",
      exact: true,
    })
    .click();
  const scene = page.getByRole("group", {
    name: "Rotate product recovery inventory",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-rotation", "0.1");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download recovery as GLB", exact: true })
    .click();
  const asset = await download;
  const path = `docs/qa/percentage-yield-recovery-${info.project.name}.glb`;
  await asset.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const json = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  const before = json.nodes.filter(
      (n: { extras?: { side?: string } }) => n.extras?.side === "before",
    ),
    after = json.nodes.filter(
      (n: { extras?: { side?: string } }) => n.extras?.side === "after",
    );
  expect(before).toHaveLength(10);
  expect(after).toHaveLength(10);
  expect(
    after.map((n: { extras: { portionId: string } }) => n.extras.portionId),
  ).toEqual(
    before.map((n: { extras: { portionId: string } }) => n.extras.portionId),
  );
  expect(
    after.filter(
      (n: { extras: { location: string } }) =>
        n.extras.location === "collected sample",
    ),
  ).toHaveLength(8);
  expect(
    after.filter(
      (n: { extras: { location: string } }) =>
        n.extras.location === "retained in apparatus",
    ),
  ).toHaveLength(2);
  expect(
    new Set(
      after.map(
        (n: { translation?: number[]; matrix?: number[] }) =>
          n.translation?.[2] ?? n.matrix?.[14] ?? 0,
      ),
    ).size,
  ).toBeGreaterThan(1);
  await capture(page, `docs/qa/percentage-yield-${info.project.name}-3d.png`);
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/percentage-yield-asset-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden !important}",
  });
  await select(page, "Number of recovered portions", "6");
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(
    page.locator(".reaction-amounts-asset figcaption"),
  ).toContainText("12 g collected");
});
test("all 23 practice demands preserve product bases, final rounding and false written correctness", async ({
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
    if (q.id === "py-v1-p-select")
      await capture(
        page,
        `docs/qa/percentage-yield-${info.project.name}-independent.png`,
      );
    if (q.id === "py-v1-p-wet")
      await capture(
        page,
        `docs/qa/percentage-yield-${info.project.name}-wet.png`,
      );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "yield-and-atom-economy"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("wrong percentage shortfall survives targeted teaching return and reload", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 3);
  await page
    .getByRole("radio", { name: "The percentage shortfall", exact: true })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("Not yet.", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "The percentage shortfall", exact: true }),
  ).toBeChecked();
});
test("wet-product apparent yield is not capped and rounding rejects unrounded responses", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 17);
  await page.getByLabel("Apparent wet value / %", { exact: true }).fill("100");
  await page.getByLabel("Dry-product yield / %", { exact: true }).fill("90");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("Not yet.", { exact: true })).toBeVisible();
  await page.getByLabel("Apparent wet value / %", { exact: true }).fill("110");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("That’s right.", { exact: true })).toBeVisible();
  await task(page, 5);
  await page.getByLabel("Your answer", { exact: true }).fill("74.46");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("Not yet.", { exact: true })).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("74.5");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("That’s right.", { exact: true })).toBeVisible();
  await task(page, 19);
  await page.getByLabel("Your answer", { exact: true }).fill("58.333333");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("Not yet.", { exact: true })).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("58.3");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("That’s right.", { exact: true })).toBeVisible();
});
test("unavailable WebGL preserves recovered count, wrong mass and text inventory", async ({
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
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto(route);
  await task(page, 4);
  await select(page, "Your collected product mass", "20");
  await page
    .getByRole("button", {
      name: "Inspect recovery inventory in 3D",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your collected product mass", { exact: true }),
  ).toHaveValue("20");
  await check(page, false);
  await capture(
    page,
    `docs/qa/percentage-yield-${info.project.name}-fallback.png`,
  );
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/yield-and-atom-economy");
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
                  "yield-and-atom-economy"
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
      for (const run of p.work["yield-and-atom-economy"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["yield-and-atom-economy"].run.submitted =
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
