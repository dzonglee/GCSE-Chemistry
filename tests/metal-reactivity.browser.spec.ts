import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { metalReactivityJourney as journey } from "../src/content/journeys/metal-reactivity";
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
    page.locator(".metal-reactivity-workbench .feedback[role=status]"),
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

const route = "/lessons/metal-reactivity";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/metal-reactivity");
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
          page.getByRole("radio", { name: q.answer, exact: true }),
        ).toBeChecked();
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["metal-reactivity"]
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
      for (const run of p.work["metal-reactivity"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["metal-reactivity"].run.submitted = Date.now() - delay - 1000;
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

test("ordering controls preserve wrong order and canonical reset through reload", async ({
  page,
}, info) => {
  await page.goto(route);
  const first = page.getByRole("button", {
    name: "Move Cu right",
    exact: true,
  });
  await expect(first).toBeVisible();
  const box = await first.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await check(page, false);
  await first.click();
  await saved(page);
  await page.reload();
  await expect(page.locator(".metal-order-card strong")).toHaveText([
    "Mg",
    "Cu",
    "Zn",
  ]);
  await page
    .getByRole("button", { name: "Move Cu right", exact: true })
    .click();
  await check(page, true);
  await select(page, "Explore a supplied record", "alkali");
  await saved(page);
  await page.reload();
  await expect(page.locator(".metal-order-card strong")).toHaveText([
    "Li",
    "K",
    "Na",
  ]);
  await page
    .getByRole("button", { name: "Move Li right", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Move Li right", exact: true })
    .click();
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(page.locator(".metal-order-card strong")).toHaveText([
    "Cu",
    "Mg",
    "Zn",
  ]);
  await capture(
    page,
    `docs/qa/metal-reactivity-${info.project.name}-series.png`,
  );
});
test("room temperature observations distinguish short null evidence from no acid displacement", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your gas prediction": "oxygen",
    "Your interpretation": "all-gas-is-oxygen",
  });
  await check(page, false);
  await choices(page, {
    "Your gas prediction": "hydrogen",
    "Your interpretation": "salt-and-hydrogen",
  });
  await check(page, true);
  await select(page, "Explore a supplied record", "slow");
  await choices(page, {
    "Your gas prediction": "not-detected",
    "Your interpretation": "short-observation-not-no-reaction",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/metal-reactivity-${info.project.name}-observations.png`,
  );
  await select(page, "Explore a supplied record", "copper");
  await choices(page, {
    "Your gas prediction": "none",
    "Your interpretation": "below-hydrogen",
  });
  await check(page, true);
});
test("displacement retains ions and atom identity with real downloadable geometry", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your reaction prediction": "displacement",
    "Your deposited metal": "Cu",
    "Your reason": "added-metal-more-reactive",
  });
  await check(page, true);
  const canvas = page.getByRole("group", {
    name: "Rotate displacement states",
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download 3D asset" }).click();
  const download = await downloaded;
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await download.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const gltf = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  const atoms = gltf.nodes.filter(
    (n: { extras?: { element?: string } }) => n.extras?.element,
  );
  expect(atoms).toHaveLength(14);
  expect(
    new Set(
      atoms.map((n: { extras: { particleId: string } }) => n.extras.particleId),
    ).size,
  ).toBe(7);
  for (const n of atoms) {
    expect(typeof n.mesh).toBe("number");
    const accessor =
      gltf.accessors[gltf.meshes[n.mesh].primitives[0].attributes.POSITION];
    expect(accessor.count).toBeGreaterThan(100);
    expect(accessor.max[2] - accessor.min[2]).toBeGreaterThan(1);
  }
  expect(
    gltf.nodes.filter(
      (n: { extras?: { spectator?: boolean } }) => n.extras?.spectator,
    ),
  ).toHaveLength(2);
  await download.saveAs(
    `docs/qa/metal-reactivity-${info.project.name}-displacement.glb`,
  );
  await capture(
    page,
    `docs/qa/metal-reactivity-${info.project.name}-displacement.png`,
  );
  await select(page, "Explore a supplied record", "reverse");
  await choices(page, {
    "Your reaction prediction": "no-displacement",
    "Your deposited metal": "unchanged",
    "Your reason": "added-metal-not-more-reactive",
  });
  await check(page, true);
});
test("partial and contradictory evidence are retained without forced ordering", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await select(page, "Explore a supplied record", "partial");
  await choices(page, {
    "Your supported conclusion": "A>B>C",
    "Your evidence rule": "force-a-complete-order",
  });
  await check(page, false);
  await choices(page, {
    "Your supported conclusion": "A/B-undetermined-C-last",
    "Your evidence rule": "missing-comparison",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/metal-reactivity-${info.project.name}-evidence.png`,
  );
  await select(page, "Explore a supplied record", "contradictory");
  await choices(page, {
    "Your supported conclusion": "inconsistent",
    "Your evidence rule": "check-conflicting-data",
  });
  await check(page, true);
});
test("controls and final yield are distinguished from comparison over time", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your comparison conclusion": "unfair-comparison",
    "Your comparison rule": "control-metal-amount-and-division",
  });
  await check(page, true);
  await select(page, "Explore a supplied record", "finalOnly");
  await choices(page, {
    "Your comparison conclusion": "equal-final-volume-equal-reactivity",
    "Your comparison rule": "bigger-final-volume-always-reactive",
  });
  await check(page, false);
  await choices(page, {
    "Your comparison conclusion": "cannot-rank-final-yield",
    "Your comparison rule": "yield-does-not-measure-rate",
  });
  await check(page, true);
  await capture(page, `docs/qa/metal-reactivity-${info.project.name}-fair.png`);
});
test("all original practice works while four written explanations remain self-reviewed", async ({
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
                "metal-reactivity"
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

test("fresh independent partial-order question hides help and feedback", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][0]);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    `docs/qa/metal-reactivity-${info.project.name}-independent.png`,
  );
});
test("missing WebGL retains readable ions and working predictions", async ({
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
  await task(page, 3);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await choices(page, {
    "Your reaction prediction": "displacement",
    "Your deposited metal": "Cu",
    "Your reason": "added-metal-more-reactive",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/metal-reactivity-${info.project.name}-fallback.png`,
  );
});

test("quarter-turn asset remains usable and can be inspected at native resolution", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const canvas = page.getByRole("group", {
    name: "Rotate displacement states",
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  for (let i = 0; i < 16; i++) await page.keyboard.press("ArrowRight");
  await page.locator(".metal-displacement-asset").screenshot({
    path: `docs/qa/metal-reactivity-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link {visibility:hidden !important}",
  });
});

test("wrong reverse-displacement answer survives targeted recovery and reload", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const i = journey.practice.findIndex((q) => q.id === "mr-v1-p-reverse"),
    q = journey.practice[i],
    wrong = q.options!.find((v) => v !== q.answer)!;
  await task(page, i + 1);
  await page.getByRole("radio", { name: wrong, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Compare the two metals", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
  await expect(page.getByText(/could not be saved/i)).toHaveCount(0);
});
