import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import { statesJourney as journey } from "../src/content/journeys/states-of-matter";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import { stateParticles } from "../src/lib/states-of-matter";
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".state-workbench .feedback[role=status]"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
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
async function capture(page: Page, path: string) {
  await mkdir("test-results/qa/states-of-matter", { recursive: true });
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
test("solid vibration retains incorrect predictions and exports conserved real particles", async ({
  page,
}, info) => {
  await page.goto("/lessons/states-of-matter");
  const arrangement = page.getByLabel("Predicted particle arrangement", {
      exact: true,
    }),
    motion = page.getByLabel("Predicted solid movement", { exact: true });
  const box = await arrangement.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await arrangement.selectOption("close-ordered");
  await motion.selectOption("still");
  await check(page, false);
  await page.reload();
  await expect(motion).toHaveValue("still");
  const scene = page.getByRole("group", {
    name: "Rotate state particle model",
    exact: true,
  });
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-particles", "24");
  await page
    .getByRole("button", { name: "Advance illustrative motion", exact: true })
    .click();
  await expect(scene).toHaveAttribute("data-frame", "1");
  await motion.selectOption("vibrate");
  await check(page, true);
  const before = await scene.getAttribute("data-rotation");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).not.toHaveAttribute("data-rotation", before!);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download particles as GLB", exact: true })
    .click();
  const download = await pending;
  await mkdir("test-results/qa/states-of-matter", { recursive: true });
  const path = `test-results/qa/states-of-matter/state-particles-${info.project.name}.glb`;
  await download.saveAs(path);
  const buffer = await readFile(path);
  expect(buffer.readUInt32LE(0)).toBe(0x46546c67);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  const nodes = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  ).nodes as {
    name?: string;
    translation?: number[];
    matrix?: number[];
    extras?: { particleId?: number; radius?: number; particleCount?: number };
  }[];
  const particles = nodes.filter((n) => /^particle-\d+$/.test(n.name ?? ""));
  expect(particles).toHaveLength(24);
  expect(
    nodes.find((n) => n.name === "state-particle-container")!.extras!
      .particleCount,
  ).toBe(24);
  expect(nodes.filter((n) => n.name === "container-boundary")).toHaveLength(1);
  for (const n of particles) {
    const expected = stateParticles("solid", 1)[n.extras!.particleId!];
    expect(n.extras!.radius).toBe(0.15);
    const p = n.translation ?? n.matrix!.slice(12, 15);
    p.forEach((v, i) => expect(v).toBeCloseTo(expected.position[i], 6));
  }
  await capture(
    page,
    `test-results/qa/states-of-matter/states-of-matter-${info.project.name}-solid.png`,
  );
});
test("liquid and gas require distinct arrangement and movement while conserving sizes", async ({
  page,
}, info) => {
  await page.goto("/lessons/states-of-matter");
  await task(page, 2);
  await page
    .getByLabel("Predicted arrangement", { exact: true })
    .selectOption("close-random");
  await page
    .getByLabel("Predicted movement", { exact: true })
    .selectOption("past");
  await check(page, true);
  await page.getByLabel("Inspect a state", { exact: true }).selectOption("gas");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Predicted movement", { exact: true }),
  ).toHaveValue("past");
  await page
    .getByLabel("Predicted arrangement", { exact: true })
    .selectOption("far-random");
  await page
    .getByLabel("Predicted movement", { exact: true })
    .selectOption("rapid");
  await check(page, true);
  await expect(
    page.getByRole("group", {
      name: "Rotate state particle model",
      exact: true,
    }),
  ).toHaveAttribute("data-particles", "24");
  await capture(
    page,
    `test-results/qa/states-of-matter/states-of-matter-${info.project.name}-gas.png`,
  );
});
test("signed temperature predictions preserve coexistence at both exact boundaries", async ({
  page,
}, info) => {
  await page.goto("/lessons/states-of-matter");
  await task(page, 3);
  for (const [temperature, prediction] of [
    ["-40", "solid"],
    ["-20", "solid/liquid"],
    ["0", "liquid"],
    ["60", "liquid/gas"],
    ["80", "gas"],
  ]) {
    await page
      .getByLabel("Temperature in °C", { exact: true })
      .selectOption(temperature);
    await page
      .getByLabel("Your predicted state", { exact: true })
      .selectOption(prediction);
    await check(page, true);
  }
  await page
    .getByLabel("Temperature in °C", { exact: true })
    .selectOption("-20");
  await page
    .getByLabel("Your predicted state", { exact: true })
    .selectOption("liquid");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Your predicted state", { exact: true }),
  ).toHaveValue("liquid");
  await expect(page.locator(".phase-boundary-note")).toContainText(
    "does not determine their proportions",
  );
  await capture(
    page,
    `test-results/qa/states-of-matter/states-of-matter-${info.project.name}-boundary.png`,
  );
});
test("each physical change transfers energy without creating or enlarging particles", async ({
  page,
}, info) => {
  await page.goto("/lessons/states-of-matter");
  await task(page, 4);
  for (const [change, energy] of [
    ["melting", "in"],
    ["freezing", "out"],
    ["boiling", "in"],
    ["condensing", "out"],
  ]) {
    await page
      .getByLabel("Physical change", { exact: true })
      .selectOption(change);
    await page
      .getByLabel("Energy transfer", { exact: true })
      .selectOption(energy);
    await page
      .getByLabel("Particle identity", { exact: true })
      .selectOption("grow");
    await check(page, false);
    await page
      .getByLabel("Particle identity", { exact: true })
      .selectOption("same");
    await check(page, true);
    await expect(page.locator("[data-state-particle]")).toHaveCount(48);
    const radii = await page
      .locator("[data-state-particle]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("r")));
    expect(new Set(radii)).toEqual(new Set(["10"]));
  }
  await capture(
    page,
    `test-results/qa/states-of-matter/states-of-matter-${info.project.name}-transition.png`,
  );
});

async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.options)
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
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/states-of-matter");
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
                JSON.parse(localStorage.getItem(key)!).work["states-of-matter"]
                  .run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(form === 1);
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
      for (const run of p.work["states-of-matter"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["states-of-matter"].run.submitted = Date.now() - delay - 1000;
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

test("all twenty-one independent questions mark data and diagrams while written review remains ungraded", async ({
  page,
}, info) => {
  await page.goto("/lessons/states-of-matter");
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
                "states-of-matter"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (i === 0)
      await capture(
        page,
        `test-results/qa/states-of-matter/states-of-matter-${info.project.name}-independent.png`,
      );
  }
});
test("WebGL fallback keeps the same twenty-four circles and changes the tracked position without erasing wrong movement", async ({
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
  await page.goto("/lessons/states-of-matter");
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("[data-state-particle]")).toHaveCount(24);
  const gold = page.locator('[data-state-particle="0"]'),
    before = await gold.getAttribute("cy");
  await page
    .getByRole("button", { name: "Advance illustrative motion", exact: true })
    .click();
  await expect(gold).not.toHaveAttribute("cy", before!);
  await page
    .getByLabel("Predicted particle arrangement", { exact: true })
    .selectOption("close-ordered");
  await page
    .getByLabel("Predicted solid movement", { exact: true })
    .selectOption("still");
  await check(page, false);
  await page.reload();
  await expect(
    page.getByLabel("Predicted solid movement", { exact: true }),
  ).toHaveValue("still");
  await expect(page.locator("[data-state-particle]")).toHaveCount(24);
  await capture(
    page,
    `test-results/qa/states-of-matter/states-of-matter-${info.project.name}-fallback.png`,
  );
});
