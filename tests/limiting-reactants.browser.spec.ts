import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { limitingReactantsJourney as journey } from "../src/content/journeys/limiting-reactants";
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
    page.locator(".limiting-workbench .feedback[role=status]"),
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

const route = "/lessons/limiting-reactants";
const correctMoles: Record<string, string> = {
  "Your CH₄ capacity": "3",
  "Your O₂ capacity": "2",
  "Your limiting reactant": "oxygen",
  "Your maximum CO₂": "2",
  "Your CH₄ remaining": "1",
  "Your O₂ remaining": "0",
};
async function choices(page: Page, values: Record<string, string>) {
  for (const [k, v] of Object.entries(values)) await select(page, k, v);
}
test("native capacities preserve wrong raw-mol comparison, reload, reset and first-control keyboard access", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  const box = await page
    .getByLabel("Supplied mole inventory", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await choices(page, {
    ...correctMoles,
    "Your O₂ capacity": "4",
    "Your limiting reactant": "methane",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your O₂ capacity", { exact: true }),
  ).toHaveValue("4");
  const fields = await page
    .locator(".bench-fields")
    .nth(1)
    .locator("select")
    .evaluateAll((xs) =>
      xs.map((x) => {
        const r = x.getBoundingClientRect();
        return { top: r.top, width: r.width, height: r.height };
      }),
    );
  expect(fields).toHaveLength(6);
  for (let i = 0; i < 6; i += 2)
    expect(Math.abs(fields[i].top - fields[i + 1].top)).toBeLessThan(1);
  for (const f of fields) {
    expect(f.width).toBeGreaterThanOrEqual(44);
    expect(f.height).toBeGreaterThanOrEqual(44);
  }
  await choices(page, correctMoles);
  await check(page, true);
  await capture(
    page,
    `docs/qa/limiting-reactants-${info.project.name}-capacities.png`,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your O₂ capacity", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
  await page.getByLabel("Supplied mole inventory", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByLabel("Supplied mole inventory", { exact: true }),
  ).toHaveValue("oxygenExcess");
  await choices(page, {
    "Your CH₄ capacity": "2",
    "Your O₂ capacity": "2.5",
    "Your limiting reactant": "methane",
    "Your maximum CO₂": "2",
    "Your CH₄ remaining": "0",
    "Your O₂ remaining": "1",
  });
  await check(page, true);
  await select(page, "Supplied mole inventory", "exact");
  await choices(page, {
    "Your O₂ capacity": "2",
    "Your limiting reactant": "both",
    "Your O₂ remaining": "0",
  });
  await check(page, true);
});
test("mass supplies require converted amounts and retain the larger-mass limiting acid", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const correct: Record<string, string> = {
    "Your initial Mg amount": "0.5",
    "Your initial HCl amount": "0.4",
    "Your limiting reactant": "HCl",
    "Your maximum H₂ mass": "0.4",
    "Your Mg remaining mass": "7.2",
  };
  await choices(page, { ...correct, "Your limiting reactant": "Mg" });
  await check(page, false);
  await choices(page, correct);
  await check(page, true);
  await expect(page.locator(".limiting-workbench .feedback")).not.toContainText(
    "999999",
  );
  await capture(
    page,
    `docs/qa/limiting-reactants-${info.project.name}-masses.png`,
  );
  await select(page, "Supplied mass inventory", "metalLimits");
  await choices(page, {
    "Your initial Mg amount": "0.1",
    "Your limiting reactant": "Mg",
    "Your maximum H₂ mass": "0.2",
    "Your Mg remaining mass": "0",
  });
  await check(page, true);
  await select(page, "Supplied mass inventory", "exact");
  await choices(page, {
    "Your initial Mg amount": "0.2",
    "Your limiting reactant": "both",
    "Your maximum H₂ mass": "0.4",
  });
  await check(page, true);
});
test("changing excess alone cannot raise maximum and enough added oxygen switches the limit", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await select(page, "Change the starting supply", "methane");
  await choices(page, {
    "Your maximum CO₂": "5",
    "Your limiting reactant": "oxygen",
    "Your CH₄ remaining": "3",
    "Your O₂ remaining": "0",
  });
  await check(page, false);
  await select(page, "Your maximum CO₂", "2");
  await check(page, true);
  await select(page, "Change the starting supply", "oxygen");
  await choices(page, {
    "Your maximum CO₂": "3",
    "Your limiting reactant": "methane",
    "Your CH₄ remaining": "0",
    "Your O₂ remaining": "2",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/limiting-reactants-${info.project.name}-change.png`,
  );
});
test("plateau graph retains wrong gold amount and uses readable genuine amount axes", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await select(page, "Supplied carbonate amount", "0.015");
  await choices(page, {
    "Your maximum CO₂": "0.015",
    "Your carbonate remaining": "0.005",
    "Your limiting reactant": "acid",
  });
  await check(page, false);
  const wrong = await page
    .locator(".limiting-capacity-graph circle")
    .getAttribute("cy");
  expect(Number(wrong)).toBeCloseTo(78.75, 8);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your maximum CO₂", { exact: true }),
  ).toHaveValue("0.015");
  await select(page, "Your maximum CO₂", "0.01");
  await check(page, true);
  await expect(page.locator(".limiting-capacity-graph circle")).toHaveAttribute(
    "cy",
    "122.5",
  );
  const fonts = await page
    .locator(".limiting-capacity-graph text")
    .evaluateAll((xs) =>
      xs.map(
        (x) =>
          parseFloat(getComputedStyle(x).fontSize) *
          (x as SVGGraphicsElement).getScreenCTM()!.a,
      ),
    );
  expect(Math.min(...fonts)).toBeGreaterThanOrEqual(12);
  await capture(
    page,
    `docs/qa/limiting-reactants-${info.project.name}-plateau.png`,
  );
  await select(page, "Supplied carbonate amount", "0.01");
  await choices(page, {
    "Your carbonate remaining": "0",
    "Your limiting reactant": "both",
  });
  await check(page, true);
  await select(page, "Supplied carbonate amount", "0.005");
  await choices(page, {
    "Your maximum CO₂": "0.005",
    "Your limiting reactant": "carbonate",
  });
  await check(page, true);
});
test("actual downloadable 3D inventory preserves intact excess and all exported atom totals", async ({
  page,
}, info) => {
  await page.goto(route);
  await choices(page, correctMoles);
  await check(page, true);
  await page
    .getByRole("button", { name: "Inspect a small 3D inventory", exact: true })
    .click();
  const scene = page.getByRole("group", {
    name: "Rotate limiting-reactant inventory",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-rotation", "0.1");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download reaction as GLB", exact: true })
    .click();
  const file = await download;
  const path = `docs/qa/limiting-reactants-inventory-${info.project.name}.glb`;
  await file.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  const json = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  );
  for (const side of ["before", "after"]) {
    const counts: Record<string, number> = {};
    for (const n of json.nodes) {
      if (n.mesh !== undefined && n.extras?.side === side && n.extras.element)
        counts[n.extras.element] = (counts[n.extras.element] ?? 0) + 1;
    }
    expect(counts).toEqual({ C: 3, H: 12, O: 8 });
  }
  expect(
    json.nodes.filter(
      (n: { extras?: { unreacted?: boolean } }) => n.extras?.unreacted,
    ),
  ).toHaveLength(1);
  await capture(page, `docs/qa/limiting-reactants-${info.project.name}-3d.png`);
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/limiting-reactants-asset-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link {visibility:hidden !important}",
  });
});
test("all 21 independent tasks accept reviewed working and written explanations never mark correct", async ({
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
    if (q.id === "lr-v1-p-capacities")
      await capture(
        page,
        `docs/qa/limiting-reactants-${info.project.name}-independent.png`,
      );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "limiting-reactants"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("targeted recovery preserves wrong raw-mol answer across return and reload", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page
    .getByRole("radio", { name: "Nitrogen because 2<3", exact: true })
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
    page.getByRole("radio", { name: "Nitrogen because 2<3", exact: true }),
  ).toBeChecked();
});
test("unavailable WebGL retains wrong capacity and provides a complete text inventory", async ({
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
  await select(page, "Your O₂ capacity", "4");
  await page
    .getByRole("button", { name: "Inspect a small 3D inventory", exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your O₂ capacity", { exact: true }),
  ).toHaveValue("4");
  await check(page, false);
  await capture(
    page,
    `docs/qa/limiting-reactants-${info.project.name}-fallback.png`,
  );
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/limiting-reactants");
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
                  "limiting-reactants"
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
      for (const run of p.work["limiting-reactants"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["limiting-reactants"].run.submitted = Date.now() - delay - 1000;
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
