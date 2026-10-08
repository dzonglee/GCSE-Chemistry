import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile } from "node:fs/promises";
import { massConservationJourney as journey } from "../src/content/journeys/conservation-of-mass";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) {
    await picker.selectOption(String(n - 1));
    return;
  }
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".mass-workbench .feedback[role=status]"),
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

test("apparatus boundary and unused reactants retain separate mass predictions through reload and reset", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-of-mass");
  const choice = page.getByLabel("Supplied reaction inventory", {
      exact: true,
    }),
    box = await choice.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page
    .getByLabel("Your final balance reading", { exact: true })
    .selectOption("20");
  await page
    .getByLabel("Your new product mass total", { exact: true })
    .selectOption("20");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your final balance reading", { exact: true }),
  ).toHaveValue("20");
  await page
    .getByLabel("Your final balance reading", { exact: true })
    .selectOption("70");
  await check(page, true);
  await capture(
    page,
    `docs/qa/conservation-${info.project.name}-inventory.png`,
  );
  await choice.selectOption("leftover");
  await page
    .getByLabel("Weighed collection", { exact: true })
    .selectOption("contents");
  await page
    .getByLabel("Your final balance reading", { exact: true })
    .selectOption("17");
  await page
    .getByLabel("Your new product mass total", { exact: true })
    .selectOption("17");
  await check(page, false);
  await page
    .getByLabel("Your new product mass total", { exact: true })
    .selectOption("13");
  await check(page, true);
  await capture(page, `docs/qa/conservation-${info.project.name}-leftover.png`);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(choice).toHaveValue("complete");
  await expect(
    page.getByLabel("Your final balance reading", { exact: true }),
  ).toHaveValue("unset");
  await expect(page.locator(".storage-warning")).toHaveCount(0);
});
test("open and closed boundaries retain the same gas parcels and distinguish formation from escape", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-of-mass");
  await task(page, 2);
  await page.getByLabel("Gas release stage", { exact: true }).selectOption("3");
  await page
    .getByLabel("Your vessel-plus-contents reading", { exact: true })
    .selectOption("70.5");
  await page
    .getByLabel("Reason for the reading", { exact: true })
    .selectOption("weightless");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Reason for the reading", { exact: true }),
  ).toHaveValue("weightless");
  await expect(page.locator('[data-parcel-inside="true"]')).toHaveCount(3);
  await page
    .getByLabel("Your vessel-plus-contents reading", { exact: true })
    .selectOption("75");
  await page
    .getByLabel("Reason for the reading", { exact: true })
    .selectOption("retained");
  await check(page, true);
  await page
    .getByLabel("Vessel boundary", { exact: true })
    .selectOption("open");
  for (const [stage, reading] of [
    ["1", "73.5"],
    ["2", "72"],
    ["3", "70.5"],
  ]) {
    await page
      .getByLabel("Gas release stage", { exact: true })
      .selectOption(stage);
    await page
      .getByLabel("Your vessel-plus-contents reading", { exact: true })
      .selectOption(reading);
    await page
      .getByLabel("Reason for the reading", { exact: true })
      .selectOption("escaped");
    await check(page, true);
    await expect(page.locator('[data-parcel-inside="false"]')).toHaveCount(
      Number(stage),
    );
    await expect(page.locator("[data-gas-parcel]")).toHaveCount(3);
  }
  const svg = page.locator(".boundary-gas-diagram svg");
  const font = await svg.locator("text").evaluateAll((nodes) =>
    Math.min(
      ...nodes.map((n) => {
        const text = n as SVGTextElement;
        return Number(text.getAttribute("font-size")) * text.getScreenCTM()!.a;
      }),
    ),
  );
  expect(font).toBeGreaterThanOrEqual(12);
  await writeFile(
    `docs/qa/conservation-gas-${info.project.name}.svg`,
    await svg.evaluate((n) => n.outerHTML),
  );
  await capture(page, `docs/qa/conservation-${info.project.name}-gas.png`);
});
test("actual three-dimensional gas exports retain nine atoms and three macroscopic parcel identities on both sides of the boundary", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-of-mass");
  await task(page, 2);
  await page.getByLabel("Gas release stage", { exact: true }).selectOption("3");
  await page
    .getByLabel("Vessel boundary", { exact: true })
    .selectOption("open");
  await page
    .getByLabel("Your vessel-plus-contents reading", { exact: true })
    .selectOption("70.5");
  await page
    .getByLabel("Reason for the reading", { exact: true })
    .selectOption("escaped");
  await check(page, true);
  await page
    .getByRole("button", { name: "Show 3D boundary", exact: true })
    .click();
  for (const [closure, inside, reading] of [
    ["open", 0, 70.5],
    ["closed", 3, 75],
  ] as const) {
    await page
      .getByLabel("Vessel boundary", { exact: true })
      .selectOption(closure);
    const scene = page.getByRole("group", {
      name: "Rotate gas boundary",
      exact: true,
    });
    await expect(scene).toHaveAttribute("data-ready", "true");
    await scene.focus();
    await page.keyboard.press("ArrowRight");
    await expect(scene).not.toHaveAttribute("data-rotation", "0");
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download gas boundary as GLB",
        exact: true,
      })
      .click();
    const d = await pending,
      path = `docs/qa/conservation-gas-${closure}-${info.project.name}.glb`;
    await d.saveAs(path);
    const buffer = await readFile(path);
    expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
    expect(buffer.readUInt32LE(8)).toBe(buffer.length);
    const nodes = JSON.parse(
      buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
    ).nodes as { name?: string; extras?: Record<string, unknown> }[];
    const parcels = nodes.filter((n) => /^CO2-parcel-/.test(n.name ?? ""));
    expect(parcels).toHaveLength(3);
    expect(parcels.filter((n) => n.extras?.inside === true)).toHaveLength(
      inside,
    );
    expect(parcels.map((n) => n.extras?.parcelId)).toEqual([0, 1, 2]);
    expect(nodes.filter((n) => /-atom-\d+-C$/.test(n.name ?? ""))).toHaveLength(
      3,
    );
    expect(nodes.filter((n) => /-atom-\d+-O$/.test(n.name ?? ""))).toHaveLength(
      6,
    );
    expect(
      nodes.find((n) => n.name === "gas-boundary-accounting")!.extras
        ?.readingGrams,
    ).toBe(reading);
    if (closure === "open") {
      await capture(
        page,
        `docs/qa/conservation-${info.project.name}-3d-gas.png`,
      );
      await page.locator(".reaction-amounts-canvas").screenshot({
        path: `docs/qa/conservation-gas-asset-${info.project.name}.png`,
      });
    }
  }
});
test("oxygen gain follows the selected boundary while the complete reacting collection retains mass", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-of-mass");
  await task(page, 3);
  await page
    .getByLabel("Your final oxide mass", { exact: true })
    .selectOption("20");
  await page
    .getByLabel("Your mass increase for this boundary", { exact: true })
    .selectOption("8");
  await page
    .getByLabel("Cause within this boundary", { exact: true })
    .selectOption("heat");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Cause within this boundary", { exact: true }),
  ).toHaveValue("heat");
  await page
    .getByLabel("Cause within this boundary", { exact: true })
    .selectOption("entered");
  await check(page, true);
  await page
    .getByLabel("Supplied reacting masses", { exact: true })
    .selectOption("2");
  await expect(page.locator("[data-reacting-oxygen]")).toHaveAttribute(
    "data-reacting-oxygen",
    "16",
  );
  await page
    .getByLabel("Your final oxide mass", { exact: true })
    .selectOption("40");
  await page
    .getByLabel("Your mass increase for this boundary", { exact: true })
    .selectOption("16");
  await check(page, true);
  await capture(
    page,
    `docs/qa/conservation-${info.project.name}-oxidation.png`,
  );
  await page
    .getByLabel("Accounting boundary", { exact: true })
    .selectOption("closed");
  await page
    .getByLabel("Your mass increase for this boundary", { exact: true })
    .selectOption("0");
  await page
    .getByLabel("Cause within this boundary", { exact: true })
    .selectOption("retained");
  await check(page, true);
});
test("relative-mass totals require every equation coefficient and cannot be mistaken for gram ratios", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-of-mass");
  await task(page, 4);
  await page
    .getByLabel("Your weighted reactant total", { exact: true })
    .selectOption("34");
  await page
    .getByLabel("Your weighted product total", { exact: true })
    .selectOption("18");
  await check(page, false);
  await page.getByLabel("Coefficient of H₂", { exact: true }).selectOption("2");
  await page
    .getByLabel("Coefficient of H₂O", { exact: true })
    .selectOption("2");
  await page
    .getByLabel("Your weighted reactant total", { exact: true })
    .selectOption("36");
  await page
    .getByLabel("Your weighted product total", { exact: true })
    .selectOption("36");
  await check(page, true);
  await expect(page.locator('[data-weighted-formula="H2"]')).toHaveAttribute(
    "data-weighted-contribution",
    "4",
  );
  await capture(page, `docs/qa/conservation-${info.project.name}-weighted.png`);
  await page
    .getByLabel("Relative-mass equation", { exact: true })
    .selectOption("magnesium");
  await page
    .getByLabel("Your weighted reactant total", { exact: true })
    .selectOption("80");
  await page
    .getByLabel("Your weighted product total", { exact: true })
    .selectOption("80");
  await check(page, true);
});
test("all twenty-two independent demands keep apparatus, gas, oxygen and unused reactants distinct", async ({
  page,
}, info) => {
  await page.goto("/lessons/conservation-of-mass");
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
                "conservation-of-mass"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "mc-v1-p-ledger")
      await capture(
        page,
        `docs/qa/conservation-${info.project.name}-independent.png`,
      );
  }
});
test("unavailable WebGL retains the actual gas parcel diagram and saved false causal prediction", async ({
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
  await page.goto("/lessons/conservation-of-mass");
  await task(page, 2);
  await page
    .getByLabel("Vessel boundary", { exact: true })
    .selectOption("open");
  await page.getByLabel("Gas release stage", { exact: true }).selectOption("2");
  await page
    .getByLabel("Your vessel-plus-contents reading", { exact: true })
    .selectOption("72");
  await page
    .getByLabel("Reason for the reading", { exact: true })
    .selectOption("destroyed");
  await page
    .getByRole("button", { name: "Show 3D boundary", exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Reason for the reading", { exact: true }),
  ).toHaveValue("destroyed");
  await expect(page.locator('[data-parcel-inside="false"]')).toHaveCount(2);
  await capture(page, `docs/qa/conservation-${info.project.name}-fallback.png`);
});
test("incorrect apparatus-plus-contents working survives targeted recovery", async ({
  page,
}) => {
  await page.goto("/lessons/conservation-of-mass");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 15);
  for (const [label, value] of [
    ["Final contents / g", "11.5"],
    ["Final vessel + contents / g", "11.5"],
    ["Escaped CO₂ / g", "2.5"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Name the measured collection",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByLabel("Final vessel + contents / g", { exact: true }),
  ).toHaveValue("11.5");
  await expect(page.locator(".storage-warning")).toHaveCount(0);
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/conservation-of-mass");
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
                JSON.parse(localStorage.getItem(key)!).work[
                  "conservation-of-mass"
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
      for (const run of p.work["conservation-of-mass"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["conservation-of-mass"].run.submitted = Date.now() - delay - 1000;
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
