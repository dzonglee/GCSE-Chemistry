import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { changingConcentrationJourney as journey } from "../src/content/journeys/changing-concentration";
type GlbNode = {
  name?: string;
  mesh: number;
  extras: {
    portionId: number;
    grams: number;
    soluteGrams: number;
    solutionCm3: number;
  };
};
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
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
    page.locator(".changing-concentration-workbench .feedback[role=status]"),
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

test("two-factor prediction retains the actual wrong answer through reload undo and reset", async ({
  page,
}, info) => {
  await page.goto("/lessons/changing-concentration");
  await expect(page.locator(".sample-tier")).toHaveText("Higher");
  await expect(page.locator(".sample-tier")).toBeVisible();
  const control = page.getByLabel("Dissolved-mass factor", { exact: true }),
    box = await control.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await select(page, "Your concentration factor", "1");
  await select(page, "Your reason", "multiply");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your concentration factor", { exact: true }),
  ).toHaveValue("1");
  await select(page, "Your concentration factor", "4");
  await select(page, "Your reason", "mass-over-volume");
  await check(page, true);
  await expect(page.locator('[data-proposed-factor="4"]')).toHaveAttribute(
    "x1",
    "355",
  );
  await capture(
    page,
    `docs/qa/changing-concentration-${info.project.name}-factors.png`,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Your reason", { exact: true })).toHaveValue(
    "multiply",
  );
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your concentration factor", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved progress could not be read", { exact: false }),
  ).toHaveCount(0);
});
test("every factor combination has a selectable correct answer and graph labels remain readable", async ({
  page,
}) => {
  await page.goto("/lessons/changing-concentration");
  for (const m of [0.5, 1, 2, 3])
    for (const v of [0.5, 1, 2, 4]) {
      await select(page, "Dissolved-mass factor", String(m));
      await select(page, "Final-volume factor", String(v));
      await select(page, "Your concentration factor", String(m / v));
      await select(page, "Your reason", "mass-over-volume");
      await check(page, true);
    }
  const min = await page
    .locator(".concentration-factor-axis svg text")
    .evaluateAll((xs) =>
      Math.min(
        ...xs.map(
          (x) =>
            parseFloat(getComputedStyle(x).fontSize) *
            (x as SVGGraphicsElement).getScreenCTM()!.a,
        ),
      ),
    );
  expect(min).toBeGreaterThanOrEqual(12);
  await capture(page, "test-results/changing-factor-accessibility.png");
});
test("dilution actual 3D export keeps the same ten identities while real volume changes", async ({
  page,
}, info) => {
  await page.goto("/lessons/changing-concentration");
  await task(page, 2);
  await select(page, "Your retained solute mass", "5");
  await select(page, "Your concentration", "20");
  await select(page, "Your reason", "solute-lost");
  await check(page, false);
  await select(page, "Your retained solute mass", "10");
  await select(page, "Your reason", "retained-more-volume");
  await check(page, true);
  await page
    .getByRole("button", { name: "Show retained-solute 3D model", exact: true })
    .click();
  for (const cm3 of [500, 1000]) {
    await select(page, "Final solution volume", String(cm3));
    await select(page, "Your concentration", cm3 === 500 ? "20" : "10");
    await check(page, true);
    const canvas = page.getByRole("group", {
      name: "Rotate solution volume",
      exact: true,
    });
    await expect(canvas).toHaveAttribute("data-ready", "true");
    await canvas.focus();
    await page.keyboard.press("ArrowRight");
    await expect(canvas).toHaveAttribute("data-rotation", "0.1");
    const wait = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download solution volume as GLB",
        exact: true,
      })
      .click();
    const download = await wait,
      path = `docs/qa/changing-concentration-${cm3}-${info.project.name}.glb`;
    await download.saveAs(path);
    const bytes = await readFile(path);
    expect(bytes.toString("utf8", 0, 4)).toBe("glTF");
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    const json = JSON.parse(
        bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
      ),
      nodes = json.nodes,
      root = nodes.find(
        (x: GlbNode) => x.name === "solution-volume-accounting",
      );
    expect(root.extras.soluteGrams).toBe(10);
    expect(root.extras.solutionCm3).toBe(cm3);
    const portions = nodes.filter((x: GlbNode) =>
      x.name?.startsWith("dissolved-solute-portion-"),
    );
    expect(
      portions
        .map((x: GlbNode) => x.extras.portionId)
        .sort((a: number, b: number) => a - b),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(
      portions.reduce((sum: number, x: GlbNode) => sum + x.extras.grams, 0),
    ).toBe(10);
    const box = nodes.find((x: GlbNode) => x.name === "final-solution-volume"),
      acc =
        json.accessors[json.meshes[box.mesh].primitives[0].attributes.POSITION];
    expect(
      acc.max.reduce(
        (prod: number, v: number, i: number) => prod * (v - acc.min[i]),
        1,
      ) / 64,
    ).toBeCloseTo(cm3 / 1000, 6);
  }
  await capture(
    page,
    `docs/qa/changing-concentration-${info.project.name}-dilution.png`,
  );
  await page.locator(".reaction-amounts-canvas").screenshot({
    path: `docs/qa/changing-concentration-asset-${info.project.name}.png`,
  });
});
test("homogeneous sampling requires solute in both portions and a correct causal reason", async ({
  page,
}, info) => {
  await page.goto("/lessons/changing-concentration");
  await task(page, 3);
  await select(page, "Your retained solute mass", "10");
  await select(page, "Your retained concentration", "40");
  await select(page, "Your reason", "all-solute-retained");
  await check(page, false);
  await expect(page.locator(".changing-portion-cards")).toContainText(
    "0 g claimed removed",
  );
  await select(page, "Your retained solute mass", "5");
  await select(page, "Your retained concentration", "20");
  await check(page, false);
  await select(page, "Your reason", "both-proportional");
  await check(page, true);
  await expect(page.locator(".changing-portion-cards")).toContainText(
    "5 g claimed removed",
  );
  await select(page, "Retained solution volume", "100");
  await select(page, "Your retained solute mass", "2");
  await check(page, true);
  await capture(
    page,
    `docs/qa/changing-concentration-${info.project.name}-portion.png`,
  );
});
test("target dilution distinguishes final solution from the addition", async ({
  page,
}, info) => {
  await page.goto("/lessons/changing-concentration");
  await task(page, 4);
  await select(page, "Your final solution volume", "500");
  await select(page, "Your added solvent volume", "500");
  await select(page, "Your reason", "final-minus-initial");
  await check(page, false);
  await select(page, "Your added solvent volume", "250");
  await check(page, true);
  await select(page, "Target concentration", "10");
  await select(page, "Your final solution volume", "1000");
  await select(page, "Your added solvent volume", "750");
  await check(page, true);
  await capture(
    page,
    `docs/qa/changing-concentration-${info.project.name}-target.png`,
  );
});
test("twenty independent demands include constructed inventories and honest written self review", async ({
  page,
}, info) => {
  await page.goto("/lessons/changing-concentration");
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
    if (q.parts)
      await capture(
        page,
        `docs/qa/changing-concentration-${info.project.name}-independent.png`,
      );
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "changing-concentration"
              ].attempts[id].at(-1).correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("incorrect inventory returns from targeted recovery with original working preserved", async ({
  page,
}) => {
  await page.goto("/lessons/changing-concentration");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 17);
  await page.getByLabel("Retained solute / g", { exact: true }).fill("12");
  await page.getByLabel("Removed solute / g", { exact: true }).fill("0");
  await page.getByLabel("Concentration / g/dm³", { exact: true }).fill("80");
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
    page.getByLabel("Retained solute / g", { exact: true }),
  ).toHaveValue("12");
  await expect(
    page.getByLabel("Removed solute / g", { exact: true }),
  ).toHaveValue("0");
});
test("unavailable WebGL retains the labelled inventory and numerical prediction", async ({
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
  await page.goto("/lessons/changing-concentration");
  await task(page, 2);
  await select(page, "Your retained solute mass", "10");
  await select(page, "Your concentration", "20");
  await select(page, "Your reason", "retained-more-volume");
  await page
    .getByRole("button", { name: "Show retained-solute 3D model", exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await check(page, true);
  await expect(
    page.getByLabel("Your concentration", { exact: true }),
  ).toHaveValue("20");
  await capture(
    page,
    `docs/qa/changing-concentration-${info.project.name}-fallback.png`,
  );
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/changing-concentration");
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
                  "changing-concentration"
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
      for (const run of p.work["changing-concentration"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["changing-concentration"].run.submitted =
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
