import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { molarConcentrationJourney as journey } from "../src/content/journeys/molar-concentration";
import {
  STORAGE_KEY,
  REVIEW_DELAY,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
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
    page.locator(".molar-workbench .feedback[role=status]"),
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

const route = "/lessons/molar-concentration";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/molar-concentration");
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
                  "molar-concentration"
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
      for (const run of p.work["molar-concentration"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["molar-concentration"].run.submitted = Date.now() - delay - 1000;
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
test("c=n/V keeps wrong cubic units, accessible first control and reset history", async ({
  page,
}, info) => {
  await page.goto(route);
  await expect(page.locator(".sample-tier")).toHaveText("Higher");
  await expect(page.getByText("Chemistry only", { exact: true })).toBeVisible();
  const box = await page
    .getByLabel("Final solution volume", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await choices(page, {
    "Final solution volume": "250",
    "Your concentration": "0.0002",
    "Your relationship": "amount-over-final-volume",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your concentration", { exact: true }),
  ).toHaveValue("0.0002");
  await choices(page, {
    "Final solution volume": "0.25",
    "Your concentration": "0.2",
  });
  await check(page, true);
  const diagramText = await page
    .locator(".molar-workbench svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (node) =>
          (parseFloat(getComputedStyle(node).fontSize) *
            node.getBoundingClientRect().height) /
          (node as SVGGraphicsElement).getBBox().height,
      ),
    );
  expect(Math.min(...diagramText)).toBeGreaterThanOrEqual(12);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-concentration.png`,
  );
  await select(page, "Explore a solution record", "moreSolute");
  await check(page, false);
  await select(page, "Your concentration", "0.4");
  await check(page, true);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your concentration", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
});
test("n=cV compares bigger samples and stronger solutions with retained wrong division", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Final sample volume": "75",
    "Your dissolved amount": "30",
    "Your relationship": "concentration-divide-volume",
  });
  await check(page, false);
  await choices(page, {
    "Final sample volume": "0.075",
    "Your dissolved amount": "0.03",
    "Your relationship": "concentration-times-volume",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-amount.png`,
  );
  await select(page, "Explore a solution record", "larger");
  await choices(page, {
    "Final sample volume": "0.15",
    "Your dissolved amount": "0.06",
  });
  await check(page, true);
  await select(page, "Explore a solution record", "stronger");
  await select(page, "Final sample volume", "0.075");
  await check(page, true);
});
test("mass keeps moles equal for changed solute and applies its distinct molar mass", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your solute amount": "0.05",
    "Your solute mass": "58.5",
    "Your relationship": "concentration-is-grams",
  });
  await check(page, false);
  await choices(page, {
    "Your solute mass": "2.925",
    "Your relationship": "amount-times-molar-mass",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-mass.png`,
  );
  await select(page, "Explore a solution record", "changedSolute");
  await check(page, false);
  await select(page, "Your solute mass", "2");
  await check(page, true);
  await expect(
    page.getByLabel("Your solute amount", { exact: true }),
  ).toHaveValue("0.05");
});
test("g/dm³ to mol/dm³ converts grams rather than relabeling the number", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your molar concentration": "11.7",
    "Your conversion": "same-number-different-unit",
  });
  await check(page, false);
  await choices(page, {
    "Your molar concentration": "0.2",
    "Your conversion": "grams-divide-molar-mass",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-units.png`,
  );
  await select(page, "Explore a solution record", "changedSolute");
  await select(page, "Your molar concentration", "0.2925");
  await check(page, true);
});
test("sampling preserves concentration whereas dilution preserves dissolved amount", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your sampled amount": "0.05",
    "Sample concentration": "0.1",
    "After dilution": "0.2",
    "Your explanation": "sampling-lowers-c",
  });
  await check(page, false);
  await choices(page, {
    "Sample concentration": "0.4",
    "Your explanation": "sample-retains-c-dilution-retains-n",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-sampling.png`,
  );
  await select(page, "Explore a solution record", "whole");
  await select(page, "Your sampled amount", "0.2");
  await check(page, true);
  await select(page, "Explore a solution record", "noDilution");
  await choices(page, {
    "Your sampled amount": "0.05",
    "After dilution": "0.4",
  });
  await check(page, true);
});
test("actual separate-ion GLB rotates, doubles volume and retains identified charged inventory", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  const canvas = page.getByRole("group", {
    name: "Rotate dissolved ion dilution inventory",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download dissolved ion inventory as GLB",
      exact: true,
    })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile(path!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const length = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + length).toString());
  const ions = gltf.nodes.filter(
    (n: { extras?: { ionId?: string } }) => n.extras?.ionId,
  );
  expect(ions).toHaveLength(16);
  for (const side of ["before", "after"]) {
    const group = ions.filter(
      (n: { extras: { side: string } }) => n.extras.side === side,
    );
    expect(group).toHaveLength(8);
    expect(
      group.reduce(
        (sum: number, n: { extras: { charge: number } }) =>
          sum + n.extras.charge,
        0,
      ),
    ).toBe(0);
    expect(
      group.every((n: { mesh?: number }) => typeof n.mesh === "number"),
    ).toBe(true);
  }
  expect(
    ions
      .filter((n: { extras: { side: string } }) => n.extras.side === "before")
      .map((n: { extras: { ionId: string } }) => n.extras.ionId)
      .sort(),
  ).toEqual(
    ions
      .filter((n: { extras: { side: string } }) => n.extras.side === "after")
      .map((n: { extras: { ionId: string } }) => n.extras.ionId)
      .sort(),
  );
  await writeFile(
    `docs/qa/molar-concentration-${info.project.name}-dilution.glb`,
    bytes,
  );
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/molar-concentration-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-3d.png`,
  );
  await canvas.focus();
  for (let i = 0; i < 15; i++) await page.keyboard.press("ArrowRight");
  expect(Number(await canvas.getAttribute("data-rotation"))).toBeCloseTo(
    1.6,
    12,
  );
  await page.locator(".reaction-amounts-asset").screenshot({
    path: `docs/qa/molar-concentration-${info.project.name}-quarter-turn.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden}",
  });
});
test("all original practice demands keep accurate units and written self-review", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    const q = journey.practice[i];
    await task(page, i + 1);
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(
      page.locator(".sample-task-answer .feedback[role=status]"),
    ).toContainText(q.rubric ? "Compare your explanation" : "That’s right");
    if (q.rubric) {
      await page.locator(".question-panel textarea").evaluateAll((nodes) => {
        for (const node of nodes) node.scrollTop = 0;
      });
      await capture(
        page,
        `test-results/qa/molar-prose/${info.project.name}-${q.id}.png`,
      );
    }
  }
  for (const q of journey.practice.filter((q) => q.rubric))
    await expect
      .poll(() =>
        page.evaluate(
          ({ key, id }) =>
            JSON.parse(localStorage.getItem(key) ?? "null")?.work?.[
              "molar-concentration"
            ]?.attempts?.[id]?.at(-1)?.correct,
          { key: STORAGE_KEY, id: q.id },
        ),
      )
      .toBe(false);
});

test("historical volume-conversion choice stays selected and raw after correction and reload", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  const q = journey.practice.find((q) => q.id === "mc-v1-p-conversion")!;
  const raw = "Use0.300 dm³ before dividing";
  const original = {
    answer: raw,
    correct: true,
    helped: true,
    fresh: false,
    at: Date.now() - 1000,
  };
  const data = emptyProgress();
  data.preferences.tier = "higher";
  data.preferences.course = "separate";
  data.work["molar-concentration"] = {
    ...emptyWork(),
    section: "practice",
    learning: {
      version: 1,
      stage: "practice",
      index: journey.practice.indexOf(q),
    },
    drafts: { [q.id]: raw },
    attempts: { [q.id]: [original] },
  };
  await page.addInitScript(
    ({ key, data }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data },
  );
  await page.goto(route);
  const selected = page.getByRole("radio", {
    name: "Use 0.300 dm³ before dividing",
    exact: true,
  });
  await expect(selected).toBeChecked();
  await expect(
    page.locator(".sample-task-answer .feedback[role=status]"),
  ).toContainText("That’s right");
  await page.reload();
  await expect(selected).toBeChecked();
  const stored = await page.evaluate(
    ({ key, id }) => {
      const work = JSON.parse(localStorage.getItem(key)!).work[
        "molar-concentration"
      ];
      return { draft: work.drafts[id], attempts: work.attempts[id] };
    },
    { key: STORAGE_KEY, id: q.id },
  );
  expect(stored).toEqual({ draft: raw, attempts: [original] });
  await capture(
    page,
    `test-results/qa/molar-prose/${info.project.name}-legacy-conversion.png`,
  );
});
test("independent answers align without model assistance or revealed answers", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  const q = journey.checkForms[0][0];
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel(q.parts![0].label, { exact: true }).fill("180");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".sample-lesson [role=status]")).toContainText(
    "Complete every part",
  );
  await answer(page, q);
  await expect(page.locator(".sample-lesson [role=status]")).toHaveCount(0);
  const a = await page
      .getByLabel(q.parts![0].label, { exact: true })
      .boundingBox(),
    b = await page.getByLabel(q.parts![1].label, { exact: true }).boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(3);
  expect(a!.height).toBeGreaterThanOrEqual(44);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-independent.png`,
  );
});
test("WebGL failure preserves labelled separate ions and numeric prediction controls", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...rest: unknown[]
    ) {
      if (kind.includes("webgl")) throw Error("test WebGL unavailable");
      return original.apply(this, [kind, ...rest] as never);
    } as typeof original;
  });
  await page.goto(route);
  await task(page, 5);
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await choices(page, {
    "Your sampled amount": "0.05",
    "Sample concentration": "0.4",
    "After dilution": "0.2",
    "Your explanation": "sample-retains-c-dilution-retains-n",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-fallback.png`,
  );
});

test("no-water selection updates the actual GLB and concentration captions together", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await select(page, "Explore a solution record", "noDilution");
  const canvas = page.getByRole("group", {
    name: "Rotate dissolved ion dilution inventory",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(
    page.locator(".reaction-amounts-asset figcaption"),
  ).toContainText("No water is added");
  await expect(page.locator(".reaction-side-labels strong").nth(1)).toHaveText(
    "After: 0.40 mol/dm³",
  );
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download dissolved ion inventory as GLB",
      exact: true,
    })
    .click();
  const download = await pending;
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await download.path())!);
  const gltf = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  const volumes = gltf.nodes
    .filter(
      (n: { extras?: { solutionBoundary?: boolean } }) =>
        n.extras?.solutionBoundary,
    )
    .map((n: { mesh: number }) => {
      const position = gltf.meshes[n.mesh].primitives[0].attributes.POSITION;
      const a = gltf.accessors[position];
      return a.max.reduce(
        (product: number, value: number, i: number) =>
          product * (value - a.min[i]),
        1,
      );
    });
  expect(volumes).toHaveLength(2);
  expect(volumes[1] / volumes[0]).toBeCloseTo(1, 6);
  await writeFile(
    `docs/qa/molar-concentration-${info.project.name}-no-dilution.glb`,
    bytes,
  );
  await capture(
    page,
    `docs/qa/molar-concentration-${info.project.name}-no-dilution.png`,
  );
});
