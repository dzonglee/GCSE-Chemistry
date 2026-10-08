import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { collisionJourney as journey } from "../src/content/journeys/collision-theory";
import type { CollisionMode } from "../src/lib/collision-theory";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/collision-theory";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
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
  if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".collision-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/collision-theory");
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
      if (form === 0 && i === 1) {
        await saved(page);
        await page.reload();
        await expect(
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/collision-theory-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["collision-theory"]
                  .run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false); // The opening encounter model conservatively exposes the shared collision conditions.
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
      for (const run of p.work["collision-theory"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["collision-theory"].run.submitted = Date.now() - delay - 1000;
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
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});

test("all original practice works while written responses remain self-reviewed", async ({
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
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("Compare your explanation");
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "collision-theory"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
  }
});
const answers = {
  conditions: {
    initial: { outcome: "no" },
    threshold: { outcome: "yes" },
    noContact: { outcome: "no" },
    inert: { outcome: "no" },
    molecular: { outcome: "no" },
    atomic: { outcome: "yes" },
  },
  solution: {
    initial: {
      particles: "24",
      occupiedVolume: "2",
      density: "12",
      direction: "more",
      kinetic: "unchanged",
    },
    dilution: {
      particles: "12",
      occupiedVolume: "4",
      density: "3",
      direction: "less",
      kinetic: "unchanged",
    },
    equal: {
      particles: "24",
      occupiedVolume: "4",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    vessel: {
      particles: "12",
      occupiedVolume: "2",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    lessDespiteCount: {
      particles: "18",
      occupiedVolume: "6",
      density: "3",
      direction: "less",
      kinetic: "unchanged",
    },
    moreDespiteCount: {
      particles: "18",
      occupiedVolume: "2",
      density: "9",
      direction: "more",
      kinetic: "unchanged",
    },
  },
  gas: {
    initial: {
      occupiedVolume: "2",
      density: "6",
      direction: "more",
      kinetic: "unchanged",
    },
    expansion: {
      occupiedVolume: "4",
      density: "3",
      direction: "less",
      kinetic: "unchanged",
    },
    unchanged: {
      occupiedVolume: "2",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    stronger: {
      occupiedVolume: "1",
      density: "24",
      direction: "more",
      kinetic: "unchanged",
    },
    inert: {
      occupiedVolume: "2",
      density: "6",
      direction: "same",
      kinetic: "unchanged",
    },
    inertCompression: {
      occupiedVolume: "2",
      density: "6",
      direction: "more",
      kinetic: "unchanged",
    },
  },
  surface: {
    initial: {
      divisions: "2",
      separated: "yes",
      pieces: "8",
      area: "192",
      volume: "64",
      ratio: "3",
      rateFactor: "not-established",
    },
    whole: {
      divisions: "1",
      separated: "no",
      pieces: "1",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
    fine: {
      divisions: "4",
      separated: "yes",
      pieces: "64",
      area: "384",
      volume: "64",
      ratio: "6",
      rateFactor: "not-established",
    },
    joinedEight: {
      divisions: "2",
      separated: "no",
      pieces: "8",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
    joinedFine: {
      divisions: "4",
      separated: "no",
      pieces: "64",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
    separateWhole: {
      divisions: "1",
      separated: "yes",
      pieces: "1",
      area: "96",
      volume: "64",
      ratio: "1.5",
      rateFactor: "not-established",
    },
  },
  comparison: {
    initial: { rateA: ".8", rateB: ".4", faster: "A" },
    slower: { rateA: ".5", rateB: ".25", faster: "A" },
    reverse: { rateA: ".3", rateB: ".6", faster: "B" },
    differentAmount: { rateA: "1", rateB: "1.3333333333", faster: "B" },
    equalRate: { rateA: ".6", rateB: ".6", faster: "same" },
    mass: { rateA: ".02", rateB: ".03", faster: "B" },
  },
  evidence: {
    initial: { claim: "frequency", reason: "density" },
    exactRate: { claim: "direction-only", reason: "measurement-needed" },
    solidAmount: { claim: "speed-not-amount", reason: "same-material" },
    joined: { claim: "outer-faces", reason: "interfaces-blocked" },
    depletion: { claim: "frequency-decreases", reason: "reactant-consumed" },
    cooling: { claim: "energy-and-speed", reason: "temperature-lower" },
  },
};

const modeTasks: Record<CollisionMode, number> = {
  conditions: 1,
  solution: 2,
  gas: 3,
  surface: 4,
  comparison: 5,
  evidence: 6,
};
const cases = answers as Record<
  CollisionMode,
  Record<string, Record<string, string>>
>;
for (const mode of Object.keys(modeTasks) as CollisionMode[])
  test(
    mode +
      ": all native comparisons retain false predictions, saved fields and keyboard-accessible controls",
    async ({ page }, info) => {
      await learn(page, modeTasks[mode]);
      await page
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      for (const [record, fields] of Object.entries(cases[mode])) {
        await page
          .getByLabel("Supplied teaching case", { exact: true })
          .selectOption(record);
        await check(page, false);
        for (const [k, value] of Object.entries(fields)) {
          const input = page.locator(`.collision-workbench [id$="-${k}"]`);
          const v = value.startsWith(".") ? "0" + value : value;
          if (await input.evaluate((el) => el.tagName === "SELECT"))
            await input.selectOption(v);
          else await input.fill(v);
        }
        await check(page, true);
      }
      await page
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await saved(page);
      await page.reload();
      const record = Object.keys(cases[mode]).at(-1)!;
      await expect(
        page.getByLabel("Supplied teaching case", { exact: true }),
      ).toHaveValue(record);
      const last = cases[mode][record];
      for (const [k, value] of Object.entries(last))
        await expect(
          page.locator(`.collision-workbench [id$="-${k}"]`),
        ).toHaveValue(value.startsWith(".") ? "0" + value : value);
      await page
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await page
        .getByLabel("Supplied teaching case", { exact: true })
        .selectOption("initial");
      for (const [k, value] of Object.entries(cases[mode].initial)) {
        const input = page.locator(`.collision-workbench [id$="-${k}"]`);
        const v = value.startsWith(".") ? "0" + value : value;
        if (await input.evaluate((el) => el.tagName === "SELECT"))
          await input.selectOption(v);
        else await input.fill(v);
      }
      if (mode === "conditions") {
        await page
          .getByLabel("Collision energy / stated units", { exact: true })
          .fill("30");
        await page
          .getByLabel("Your reaction prediction", { exact: true })
          .selectOption("yes");
      }
      await check(page, true);
      await page
        .getByText("Change the supplied teaching case", { exact: true })
        .click();
      await answer(page, journey.guided[modeTasks[mode] - 1]);
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("That’s right.");
      await capture(
        page,
        `docs/qa/collision-theory-${info.project.name}-${mode}.png`,
      );
      await page
        .getByRole("button", { name: "Reset model", exact: true })
        .click();
      await expect(
        page.getByLabel("Supplied teaching case", { exact: true }),
      ).toHaveValue("initial");
      await check(page, false);
    },
  );
test("the opening energy control has44px height within the unchanged mobile viewport", async ({
  page,
}, info) => {
  await learn(page, 1);
  await page.evaluate(() => scrollTo(0, 0));
  const input = page.getByLabel("Collision energy / stated units", {
    exact: true,
  });
  const box = await input.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await capture(
    page,
    `docs/qa/collision-theory-${info.project.name}-opening.png`,
  );
});
test("wrong density persists through reload and undo; invalid raw entries remain visible until explicit reset", async ({
  page,
}) => {
  await learn(page, 2);
  await page
    .getByLabel("Your reacting density / symbols per unit", { exact: true })
    .fill("99");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reacting density / symbols per unit", {
      exact: true,
    }),
  ).toHaveValue("99");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your reacting density / symbols per unit", {
      exact: true,
    }),
  ).toHaveValue("0");
  await page
    .getByLabel("Your reacting density / symbols per unit", { exact: true })
    .fill("1/2");
  await expect(
    page.getByRole("button", { name: "Check model", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByLabel("Your reacting density / symbols per unit", {
      exact: true,
    }),
  ).toHaveValue("1/2");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(
    page.getByLabel("Your reacting density / symbols per unit", {
      exact: true,
    }),
  ).toHaveValue("0");
});
test("actual3D supports keyboard rotation and exports the selected separated solid; unavailable WebGL retains controls and scientific text", async ({
  page,
}, info) => {
  await learn(page, 4);
  await page
    .getByLabel("Pieces along each edge", { exact: true })
    .selectOption("2");
  await page
    .getByLabel("Are pieces separated and fully wetted?", { exact: true })
    .selectOption("yes");
  const visual = page.locator(".collision-workbench div[role=img]");
  await expect(
    page.getByRole("button", { name: "Rotate right", exact: true }),
  ).toBeEnabled();
  const hostBounds = await visual.boundingBox();
  const canvasBounds = await visual.locator("canvas").boundingBox();
  expect(Math.abs(canvasBounds!.width - hostBounds!.width)).toBeLessThanOrEqual(
    1,
  );
  expect(
    Math.abs(canvasBounds!.height - hostBounds!.height),
  ).toBeLessThanOrEqual(1);
  const backing = await visual.locator("canvas").evaluate((c) => ({
    width: (c as HTMLCanvasElement).width,
    height: (c as HTMLCanvasElement).height,
    ratio: Math.min(devicePixelRatio, 2),
  }));
  expect(backing.width).toBe(Math.floor(canvasBounds!.width * backing.ratio));
  expect(backing.height).toBe(Math.floor(canvasBounds!.height * backing.ratio));
  await visual.focus();
  await page.keyboard.press("ArrowRight");
  await expect(visual).toHaveAttribute("data-rotation", "0.2");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  await (
    await download
  ).saveAs(`docs/qa/collision-theory-${info.project.name}-eight-separated.glb`);
  await capture(
    page,
    `docs/qa/collision-theory-${info.project.name}-actual3D-solid.png`,
  );
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      if (String(type).includes("webgl")) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.reload();
  await expect(
    page.getByText(
      "3D is unavailable. The count, volume and accessible-face description remain usable.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByLabel("Your accessible area / mm²", { exact: true })
    .fill("99");
  await check(page, false);
  await capture(
    page,
    `docs/qa/collision-theory-${info.project.name}-fallback.png`,
  );
});
