import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { balancingMassesJourney as journey } from "../src/content/journeys/balancing-masses";
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
    page.locator(".mass-balance-workbench .feedback[role=status]"),
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
async function captureProse(page: Page, name: string, device: string) {
  await page.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/qa/balancing-masses-prose/${device}-${name}.png`,
    fullPage: true,
    scale: "css",
  });
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

test("reacted masses require mol before ratio and preserve wrong gram ratios through reload reset", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-from-masses");
  const box = await page
    .getByLabel("Supplied reacted sample", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator(".sample-topic-tile")).toHaveText("3");
  await expect(page.locator(".sample-topic-tile")).toHaveCSS(
    "background-color",
    "rgb(108, 64, 182)",
  );
  await expect(page.locator(".sample-tier")).toBeVisible();
  await select(page, "Mg 4.8 g: your amount", "0.2");
  await select(page, "O₂ 3.2 g: your amount", "0.1");
  await select(page, "MgO 8 g: your amount", "0.2");
  await select(page, "Your shared divisor", "0.1");
  await select(page, "Your smallest coefficient ratio", "3:2:5");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your smallest coefficient ratio", { exact: true }),
  ).toHaveValue("3:2:5");
  await select(page, "Your smallest coefficient ratio", "2:1:2");
  await check(page, true);
  await capture(
    page,
    `docs/qa/balancing-masses-${info.project.name}-amounts.png`,
  );
  await page.getByLabel("Supplied reacted sample", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByLabel("Supplied reacted sample", { exact: true }),
  ).toHaveValue("double");
  await select(page, "Mg 9.6 g: your amount", "0.4");
  await select(page, "O₂ 6.4 g: your amount", "0.2");
  await select(page, "MgO 16 g: your amount", "0.4");
  await select(page, "Your shared divisor", "0.2");
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your shared divisor", { exact: true }),
  ).toHaveValue("0.1");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your shared divisor", { exact: true }),
  ).toHaveValue("unset");
  await expect(
    page.getByText("Saved progress could not be read", { exact: false }),
  ).toHaveCount(0);
});
test("balanced candidate equations are distinguished by the actual measured product amount ratios", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-from-masses");
  await task(page, 2);
  await select(page, "Cu 2.54 g: your amount", "0.04");
  await select(page, "H₂O 0.72 g: your amount", "0.04");
  await select(page, "Your matching candidate", "Cu2O");
  await check(page, false);
  await select(page, "Your matching candidate", "CuO");
  await check(page, true);
  await capture(
    page,
    `docs/qa/balancing-masses-${info.project.name}-candidates.png`,
  );
  await select(page, "Supplied product sample", "two");
  await select(page, "Cu 5.08 g: your amount", "0.08");
  await check(page, false);
  await select(page, "Your matching candidate", "Cu2O");
  await check(page, true);
});
test("fractional ratios require shared scaling and complete element balance rather than rounding", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-from-masses");
  await task(page, 3);
  await select(page, "Your O₂ ratio entry", "3.5");
  await select(page, "Your whole-ratio multiplier", "2");
  await select(page, "Your O₂ coefficient", "4");
  await check(page, false);
  await expect(
    page.getByRole("table", { name: "Atoms in your proposed equation" }),
  ).toContainText("O87");
  const textSizes = await page
    .locator(".element-ledger th,.element-ledger td")
    .evaluateAll((xs) =>
      xs.map((x) => parseFloat(getComputedStyle(x).fontSize)),
    );
  expect(Math.min(...textSizes)).toBeGreaterThanOrEqual(12);
  await select(page, "Your C₂H₆ coefficient", "2");
  await select(page, "Your O₂ coefficient", "7");
  await select(page, "Your CO₂ coefficient", "4");
  await select(page, "Your H₂O coefficient", "6");
  await check(page, true);
  await capture(
    page,
    `docs/qa/balancing-masses-${info.project.name}-fraction.png`,
  );
  await select(page, "Your C₂H₆ coefficient", "4");
  await select(page, "Your O₂ coefficient", "14");
  await select(page, "Your CO₂ coefficient", "8");
  await select(page, "Your H₂O coefficient", "12");
  await check(page, false);
  await expect(
    page.getByText(
      "Your equation conserves every element, but its whole-number coefficients share a factor.",
      { exact: true },
    ),
  ).toBeVisible();
});
test("unreacted oxygen is excluded from the reaction ratio and preserved in the closed mass inventory", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-from-masses");
  await task(page, 4);
  await select(page, "Your reacted O₂ mass", "10");
  await select(page, "Your reacted Mg amount", "0.25");
  await select(page, "Your reacted O₂ amount", "0.3125");
  await select(page, "Your produced MgO amount", "0.25");
  await select(page, "Your smallest coefficient ratio", "4:5:4");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your reacted O₂ amount", { exact: true }),
  ).toHaveValue("0.3125");
  await select(page, "Your reacted O₂ mass", "4");
  await select(page, "Your reacted O₂ amount", "0.125");
  await select(page, "Your smallest coefficient ratio", "2:1:2");
  await check(page, true);
  await capture(
    page,
    `docs/qa/balancing-masses-${info.project.name}-consumed.png`,
  );
});
test("one representative oxygen GLB contains two atoms and two bonds without depicting MgO molecules", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-from-masses");
  await page
    .getByRole("button", { name: "Inspect one O₂ molecule in 3D", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Rotate covalent molecule", exact: true }),
  ).toHaveAttribute("data-ready", "true");
  await expect(
    page.getByText("MgO is ionic and is not represented", { exact: false }),
  ).toBeVisible();
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download molecule as GLB", exact: true })
    .click();
  const download = await wait,
    path = `docs/qa/balancing-masses-oxygen-${info.project.name}.glb`;
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.toString("utf8", 0, 4)).toBe("glTF");
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const json = JSON.parse(
      bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
    ),
    nodes = json.nodes as {
      name: string;
      extras?: { element?: string };
      translation?: number[];
      matrix?: number[];
    }[];
  const atoms = nodes.filter((x) => x.name?.startsWith("atom-"));
  expect(atoms.map((x) => x.extras!.element)).toEqual(["O", "O"]);
  const points = atoms.map((x) => x.translation ?? x.matrix!.slice(12, 15));
  expect(Math.abs(points[0][0] - points[1][0])).toBeGreaterThan(1);
  expect(nodes.filter((x) => x.name?.startsWith("bond-"))).toHaveLength(2);
  expect(
    nodes.filter((x) => x.name?.includes("covalent-molecule")),
  ).toHaveLength(1);
  await capture(page, `docs/qa/balancing-masses-${info.project.name}-3d.png`);
  await page.locator(".lattice-scene").screenshot({
    path: `docs/qa/balancing-masses-asset-${info.project.name}.png`,
    style: ".mobile-bar,.skip-link {visibility:hidden !important}",
  });
});
test("all twenty-one independent tasks keep complete working container readings and written self review", async ({
  page,
}, info) => {
  await page.goto("/lessons/balancing-from-masses");
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
    if (["bm-v1-p-water", "bm-v1-p-candidate-two"].includes(q.id)) {
      await captureProse(page, q.id, info.project.name);
    }
    if (q.id === "bm-v1-p-ethane") {
      const boxes = await page
        .locator(".multipart-answer input")
        .evaluateAll((xs) =>
          xs.map((x) => {
            const b = x.getBoundingClientRect();
            return {
              top: b.top,
              left: b.left,
              width: b.width,
              height: b.height,
            };
          }),
        );
      expect(boxes).toHaveLength(4);
      expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(1);
      expect(Math.abs(boxes[2].top - boxes[3].top)).toBeLessThan(1);
      expect(Math.abs(boxes[0].left - boxes[2].left)).toBeLessThan(1);
      expect(Math.abs(boxes[1].left - boxes[3].left)).toBeLessThan(1);
      expect(boxes[2].top).toBeGreaterThan(boxes[0].top + boxes[0].height);
      for (const box of boxes) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await capture(
        page,
        `docs/qa/balancing-masses-${info.project.name}-independent.png`,
      );
    }
    if (q.id === "bm-v1-p-apparatus") {
      await expect(
        page.getByRole("table", { name: "Supplied mass readings" }),
      ).toContainText("Empty container");
      await capture(
        page,
        `docs/qa/balancing-masses-${info.project.name}-apparatus.png`,
      );
    }
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "balancing-from-masses"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
  }
});
test("wrong rounding explanation returns from targeted recovery without replacing the selected answer", async ({
  page,
}) => {
  await page.goto("/lessons/balancing-from-masses");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 13);
  await page
    .getByRole("radio", { name: "Carbon:2 before,2 after", exact: true })
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
    page.getByRole("radio", { name: "Carbon:2 before,2 after", exact: true }),
  ).toBeChecked();
});
test("unavailable WebGL preserves the O2 explanation and wrong reacted amount", async ({
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
  await page.goto("/lessons/balancing-from-masses");
  await select(page, "O₂ 3.2 g: your amount", "0.2");
  await page
    .getByRole("button", { name: "Inspect one O₂ molecule in 3D", exact: true })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByLabel("O₂ 3.2 g: your amount", { exact: true }),
  ).toHaveValue("0.2");
  await check(page, false);
  await capture(
    page,
    `docs/qa/balancing-masses-${info.project.name}-fallback.png`,
  );
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/balancing-from-masses");
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
                  "balancing-from-masses"
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
      for (const run of p.work["balancing-from-masses"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["balancing-from-masses"].run.submitted = Date.now() - delay - 1000;
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

test("shared heading uses the actual topic number and colour for atomic bonding and quantitative lessons", async ({
  page,
}) => {
  for (const [slug, number, colour] of [
    ["inside-an-atom", "1", "rgb(48, 70, 200)"],
    ["covalent-bonding", "2", "rgb(8, 119, 111)"],
    ["balancing-from-masses", "3", "rgb(108, 64, 182)"],
  ]) {
    await page.goto(`/lessons/${slug}`);
    await expect(page.locator(".sample-topic-tile")).toHaveText(number);
    await expect(page.locator(".sample-topic-tile")).toHaveCSS(
      "background-color",
      colour,
    );
  }
});
