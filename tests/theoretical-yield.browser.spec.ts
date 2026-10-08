import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { theoreticalYieldJourney as journey } from "../src/content/journeys/theoretical-yield";
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
    page.locator(".theoretical-workbench .feedback[role=status]"),
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

const route = "/lessons/theoretical-yield";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/theoretical-yield");
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
                JSON.parse(localStorage.getItem(key)!).work["theoretical-yield"]
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
      for (const run of p.work["theoretical-yield"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["theoretical-yield"].run.submitted = Date.now() - delay - 1000;
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
test("maximum retains wrong mol ratio, reload and canonical reset with reachable Higher controls", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sample-tier")).toHaveText("Higher");
  await expect(page.getByText("Chemistry only", { exact: true })).toBeVisible();
  const box = await page
    .getByLabel("Your N2 mass in grams", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await choices(page, {
    "Your N2 mass in grams": "14",
    "Your amount of N2": "0.5",
    "Your amount of NH3": "0.5",
    "Your theoretical NH3 mass": "17",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your amount of NH3", { exact: true }),
  ).toHaveValue("0.5");
  await select(page, "Your amount of NH3", "1");
  await check(page, true);
  await expect(page.locator(".theoretical-workbench .feedback")).toContainText(
    "1 g remains",
  );
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-maximum.png`,
  );
  await select(page, "Nitrogen record", "kilograms");
  await check(page, false);
  await choices(page, {
    "Your N2 mass in grams": "28",
    "Your amount of N2": "1",
    "Your amount of NH3": "2",
    "Your theoretical NH3 mass": "34",
  });
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your N2 mass in grams", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
});
test("construct product denominator and flag apparent excess without capping", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your amount of Fe2O3": "0.1",
    "Your amount of Fe": "0.2",
    "Your theoretical Fe mass": "16",
    "Your percentage yield": "61.25",
  });
  await check(page, false);
  await choices(page, {
    "Your theoretical Fe mass": "11.2",
    "Your percentage yield": "87.5",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-percentage.png`,
  );
  await select(page, "Batch record", "suspect");
  await select(page, "Your percentage yield", "120");
  await check(page, true);
  await expect(page.locator(".theoretical-workbench .feedback")).toContainText(
    "exceeds 100%",
  );
  await expect(page.locator(".theoretical-mass-chart")).toHaveAccessibleName(
    /Apparent iron sample \/ g: 13.44/,
  );
});
test("forward collected product follows maximum and converted kilogram report", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your amount of CaCO3": "0.25",
    "Your theoretical CaO mass": "25",
    "Your yield multiplier": "0.8",
    "Your collected CaO mass": "11.2",
  });
  await check(page, false);
  await select(page, "Your theoretical CaO mass", "14");
  await check(page, true);
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-collected.png`,
  );
  await select(page, "Batch record", "kilograms");
  await check(page, true);
  await select(page, "Batch record", "larger");
  await choices(page, {
    "Your amount of CaCO3": "0.75",
    "Your theoretical CaO mass": "42",
    "Your yield multiplier": "0.6",
    "Your collected CaO mass": "25.2",
  });
  await check(page, true);
});
test("reverse requirement undoes yield before reversing equation and preserves lower-yield target", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your yield multiplier": "0.8",
    "Your theoretical MgCl2 mass": "15.2",
    "Your amount of MgCl2": "0.25",
    "Your required starting Mg mass": "6",
  });
  await check(page, false);
  await select(page, "Your theoretical MgCl2 mass", "23.75");
  await check(page, true);
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-required.png`,
  );
  await select(page, "Batch record", "lower");
  await choices(page, {
    "Your yield multiplier": "0.5",
    "Your theoretical MgCl2 mass": "38",
    "Your amount of MgCl2": "0.4",
    "Your required starting Mg mass": "9.6",
  });
  await check(page, true);
  await expect(page.locator(".theoretical-workbench .feedback")).toContainText(
    "does not establish how much Mg actually reacted",
  );
});
test("compare product capacities rather than gram masses including exact stoichiometry", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your possible Fe from Al": "10",
    "Your possible Fe from oxide": "12.5",
    "Your limiting supply": "Al",
    "Your theoretical Fe mass": "560",
    "Your percentage yield": "75",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-limited.png`,
  );
  await select(page, "Batch record", "oxide");
  await choices(page, {
    "Your possible Fe from Al": "20",
    "Your possible Fe from oxide": "10",
    "Your limiting supply": "Al",
    "Your percentage yield": "80",
  });
  await check(page, false);
  await select(page, "Your limiting supply", "Fe2O3");
  await check(page, true);
  await select(page, "Batch record", "exact");
  await choices(page, {
    "Your possible Fe from Al": "10",
    "Your limiting supply": "both",
    "Your percentage yield": "70",
  });
  await check(page, true);
  const sizes = await page
    .locator(".theoretical-mass-chart text")
    .evaluateAll((xs) =>
      xs.map(
        (x) =>
          parseFloat(getComputedStyle(x).fontSize) *
          (x as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
});
test("actual excess inventory rotates by keyboard and exports intact unused hydrogen", async ({
  page,
}, info) => {
  await page.goto(route);
  await page
    .getByRole("button", { name: "Inspect excess hydrogen in 3D", exact: true })
    .click();
  const canvas = page.getByRole("group", {
    name: "Rotate theoretical ammonia inventory",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await canvas.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download theoretical inventory as GLB",
      exact: true,
    })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(
    "theoretical-ammonia-inventory.glb",
  );
  const destination = `docs/qa/theoretical-yield-inventory-${info.project.name}.glb`;
  await download.saveAs(destination);
  const buffer = await readFile(destination);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  const json = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  );
  expect(
    json.nodes.filter(
      (n: { extras?: { element?: string } }) => n.extras?.element,
    ),
  ).toHaveLength(20);
  expect(
    json.nodes.filter(
      (n: { extras?: { unused?: boolean } }) => n.extras?.unused,
    ),
  ).toHaveLength(2);
  await capture(page, `docs/qa/theoretical-yield-${info.project.name}-3d.png`);
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/theoretical-yield-asset-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden!important}",
  });
});
test("all original practice tasks retain honest written review and final rounding", async ({
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
    await expect(
      page.getByText(q.rubric ? "Compare your explanation." : "That’s right.", {
        exact: true,
      }),
    ).toBeVisible();
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "theoretical-yield"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("WebGL failure retains the chemical inventory and editable predictions", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind,
      ...args
    ) {
      if (String(kind).includes("webgl")) return null;
      return original.apply(this, [kind, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto(route);
  await select(page, "Your theoretical NH3 mass", "28");
  await page
    .getByRole("button", { name: "Inspect excess hydrogen in 3D", exact: true })
    .click();
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await expect(
    page.getByLabel("Your theoretical NH3 mass", { exact: true }),
  ).toHaveValue("28");
  await expect(
    page.getByText(/2 N atoms and 8 H atoms on each side/),
  ).toBeVisible();
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-fallback.png`,
  );
});
test("independent multipart answers align without displaying theory or feedback", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await page.getByLabel("MgCl2 / mol", { exact: true }).fill("0.125");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "Complete every part with a valid number",
  );
  await answer(page, journey.checkForms[0][0]);
  await expect(page.locator(".question-panel [role=status]")).toHaveCount(0);
  const fields = await page
    .locator(".multipart-answer input")
    .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().top));
  expect(Math.abs(fields[0] - fields[1])).toBeLessThan(1);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await capture(
    page,
    `docs/qa/theoretical-yield-${info.project.name}-independent.png`,
  );
});
test("inverse-ratio recovery returns to the original wrong draft", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const index = journey.practice.findIndex(
    (q) => q.id === "ty-v1-p-inverse-ratio",
  );
  await task(page, index + 1);
  await page.getByRole("radio", { name: "3 mol N2", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: journey.refresher.find((q) => q.id === "ty-v1-r-ratio")!.title,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "3 mol N2", exact: true }),
  ).toBeChecked();
});
