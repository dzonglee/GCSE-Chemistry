import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { reactingMassesJourney as journey } from "../src/content/journeys/reacting-masses";
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
    page.locator(".reacting-workbench .feedback[role=status]"),
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

test("named mole ratios preserve wrong direction through reload and canonical undo reset", async ({
  page,
}, info) => {
  await page.goto("/lessons/reacting-masses");
  const box = await page
    .getByLabel("Known substance", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await select(page, "Your requested amount", "0.25");
  const widths = await page
    .locator(".reaction-mole-bar span")
    .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().width));
  expect(widths[0] / widths[1]).toBeCloseTo(2, 1);
  await select(page, "Given coefficient", "2");
  await select(page, "Requested coefficient", "1");
  await select(page, "Your requested amount", "0.25");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Given coefficient", { exact: true }),
  ).toHaveValue("2");
  await select(page, "Given coefficient", "1");
  await select(page, "Requested coefficient", "2");
  await select(page, "Your requested amount", "1");
  await check(page, true);
  await capture(page, `docs/qa/reacting-masses-${info.project.name}-ratio.png`);
  await page.getByLabel("Known substance", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Known substance", { exact: true })).toHaveValue(
    "hydrogen",
  );
  await select(page, "Given coefficient", "3");
  await check(page, true);
  await select(page, "Known substance", "reverse");
  await select(page, "Given coefficient", "2");
  await select(page, "Requested coefficient", "3");
  await select(page, "Your requested amount", "3");
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your requested amount", { exact: true }),
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your requested amount", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved progress could not be read", { exact: false }),
  ).toHaveCount(0);
});
test("all forward scenarios require mass to mol ratio and mol to mass rather than coefficient gram ratios", async ({
  page,
}, info) => {
  await page.goto("/lessons/reacting-masses");
  await task(page, 2);
  await select(page, "Your given amount", "0.5");
  await select(page, "Your requested amount", "1");
  await select(page, "Your requested mass", "28");
  await check(page, false);
  for (const [reaction, values] of [
    [
      "ammonia",
      [
        [0.5, 1, 17],
        [1, 2, 34],
        [2, 4, 68],
      ],
    ],
    [
      "water",
      [
        [0.5, 1, 18],
        [1, 2, 36],
        [2, 4, 72],
      ],
    ],
    [
      "magnesium",
      [
        [0.25, 0.25, 10],
        [0.5, 0.5, 20],
        [1, 1, 40],
      ],
    ],
  ] as const)
    for (const [i, size] of ["small", "middle", "large"].entries()) {
      await select(page, "Supplied reaction", reaction);
      await select(page, "Supplied sample", size);
      await select(page, "Your given amount", String(values[i][0]));
      await select(page, "Your requested amount", String(values[i][1]));
      await select(page, "Your requested mass", String(values[i][2]));
      await check(page, true);
    }
  await capture(
    page,
    `docs/qa/reacting-masses-${info.project.name}-forward.png`,
  );
});
test("required reactant uses converted silica mass and retains wrong kilograms and coefficient grams", async ({
  page,
}, info) => {
  await page.goto("/lessons/reacting-masses");
  await task(page, 3);
  await select(page, "Your converted mass", "1.2");
  await select(page, "Your given amount", "20");
  await select(page, "Your required Mg amount", "40");
  await select(page, "Your required Mg mass", "2400");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your converted mass", { exact: true }),
  ).toHaveValue("1.2");
  await select(page, "Your converted mass", "1200");
  await select(page, "Your required Mg mass", "960");
  await check(page, true);
  await select(page, "Displayed mass unit", "g");
  await check(page, true);
  await expect(page.locator(".phase-boundary-note")).toContainText(
    "1200 g SiO₂",
  );
  await capture(
    page,
    `docs/qa/reacting-masses-${info.project.name}-required.png`,
  );
});
test("mass conservation does not falsely conserve total molecular amount", async ({
  page,
}, info) => {
  await page.goto("/lessons/reacting-masses");
  await task(page, 4);
  await select(page, "Your total molecule amount before", "4");
  await select(page, "Your total molecule amount after", "4");
  await select(page, "Your total mass before", "34");
  await select(page, "Your total mass after", "34");
  await check(page, false);
  await select(page, "Your total molecule amount after", "2");
  await check(page, true);
  for (const scale of [0.5, 2]) {
    await select(page, "Supplied N₂ amount", String(scale));
    await select(page, "Your total molecule amount before", String(4 * scale));
    await select(page, "Your total molecule amount after", String(2 * scale));
    await select(page, "Your total mass before", String(34 * scale));
    await select(page, "Your total mass after", String(34 * scale));
    await check(page, true);
  }
  await capture(
    page,
    `docs/qa/reacting-masses-${info.project.name}-conserved.png`,
  );
});
test("actual GLB shows one ammonia event with conserved N H atoms and triple nitrogen bonding", async ({
  page,
}, info) => {
  await page.goto("/lessons/reacting-masses");
  await task(page, 4);
  await page
    .getByRole("button", {
      name: "Inspect one equation event in 3D",
      exact: true,
    })
    .click();
  const scene = page.getByRole("group", {
    name: "Rotate ammonia equation event",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-rotation", "0.1");
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download reaction as GLB", exact: true })
    .click();
  const download = await wait,
    path = `docs/qa/reacting-masses-ammonia-${info.project.name}.glb`;
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.toString("utf8", 0, 4)).toBe("glTF");
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const json = JSON.parse(
      bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
    ),
    nodes = json.nodes as {
      name: string;
      extras?: { element?: string; side?: string; formula?: string };
      translation?: number[];
      matrix?: number[];
    }[];
  expect(nodes.filter((x) => x.name === "ammonia-equation-event")).toHaveLength(
    1,
  );
  for (const side of ["before", "after"]) {
    const atoms = nodes.filter(
      (x) => x.extras?.element && x.extras.side === side,
    );
    expect(atoms.filter((x) => x.extras!.element === "N")).toHaveLength(2);
    expect(atoms.filter((x) => x.extras!.element === "H")).toHaveLength(6);
    expect(
      nodes.filter((x) => x.extras?.formula && x.extras.side === side),
    ).toHaveLength(side === "before" ? 4 : 2);
  }
  expect(
    nodes.filter((x) => x.name?.startsWith("before-N2-0-bond-")),
  ).toHaveLength(3);
  expect(
    nodes.filter((x) => x.name?.startsWith("after-NH3-0-bond-")),
  ).toHaveLength(3);
  const atoms = nodes.filter((x) => x.name?.startsWith("after-NH3-0-atom-")),
    positions = atoms.map((x) => x.translation ?? x.matrix!.slice(12, 15));
  expect(positions[0][1]).toBeGreaterThan(positions[1][1]);
  expect(new Set(positions.map((p) => p[2])).size).toBe(3);
  await capture(page, `docs/qa/reacting-masses-${info.project.name}-3d.png`);
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/reacting-masses-asset-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link {visibility:hidden !important}",
  });
});
test("all twenty independent tasks keep constructed working and written review honest", async ({
  page,
}, info) => {
  await page.goto("/lessons/reacting-masses");
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
    if (q.id === "rm-v1-p-working") {
      const tops = await page
        .locator(".multipart-answer input")
        .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().top));
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
      await capture(
        page,
        `docs/qa/reacting-masses-${info.project.name}-independent.png`,
      );
    }
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "reacting-masses"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("wrong mass-ratio explanation survives recovery and reload", async ({
  page,
}) => {
  await page.goto("/lessons/reacting-masses");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 13);
  await page
    .getByRole("radio", {
      name: "Keep 28 g because coefficients are always mass ratios",
      exact: true,
    })
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
    page.getByRole("radio", {
      name: "Keep 28 g because coefficients are always mass ratios",
      exact: true,
    }),
  ).toBeChecked();
});
test("WebGL unavailable keeps atom accounting and wrong molecular prediction", async ({
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
  await page.goto("/lessons/reacting-masses");
  await task(page, 4);
  await select(page, "Your total molecule amount after", "4");
  await page
    .getByRole("button", {
      name: "Inspect one equation event in 3D",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".mole-prediction-ledger")).toContainText(
    "before N=2, H=6; after N=2, H=6",
  );
  await expect(
    page.getByLabel("Your total molecule amount after", { exact: true }),
  ).toHaveValue("4");
  await check(page, false);
  await capture(
    page,
    `docs/qa/reacting-masses-${info.project.name}-fallback.png`,
  );
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/reacting-masses");
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
                JSON.parse(localStorage.getItem(key)!).work["reacting-masses"]
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
      for (const run of p.work["reacting-masses"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["reacting-masses"].run.submitted = Date.now() - delay - 1000;
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
