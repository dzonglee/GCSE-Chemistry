import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { molesJourney as journey } from "../src/content/journeys/moles";
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
    page.locator(".mole-workbench .feedback[role=status]"),
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

test("mass unit conversion preserves the sample and wrong work through reload undo and reset", async ({
  page,
}, info) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  const box = await page
    .getByLabel("Supplied sample", { exact: true })
    .boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.locator(".sample-tier")).toBeVisible();
  await select(page, "Your converted mass", "9000");
  await select(page, "Your molar mass", "18");
  await select(page, "Your amount", "500");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your converted mass", { exact: true }),
  ).toHaveValue("9000");
  await select(page, "Your converted mass", "9");
  await select(page, "Your amount", "0.5");
  await check(page, true);
  await page.getByLabel("Displayed mass unit", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByLabel("Displayed mass unit", { exact: true }),
  ).toHaveValue("kg");
  await expect(page.locator(".phase-boundary-note")).toContainText("0.009 kg");
  await check(page, true);
  await capture(page, `docs/qa/moles-${info.project.name}-mass.png`);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Displayed mass unit", { exact: true }),
  ).toHaveValue("mg");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your amount", { exact: true })).toHaveValue(
    "unset",
  );
  await expect(
    page.getByText("Saved progress could not be read", { exact: false }),
  ).toHaveCount(0);
});
test("reverse mass calculation requires correct chemical molar mass at every supported amount", async ({
  page,
}, info) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  await task(page, 2);
  await select(page, "Your molar mass", "12");
  await select(page, "Your sample mass", "11");
  await check(page, false);
  for (const [species, m] of [
    ["H2O", 18],
    ["O2", 32],
    ["CO2", 44],
    ["NaCl", 58.5],
  ] as const)
    for (const amount of [0.25, 0.5, 1, 2]) {
      await select(page, "Supplied formula", species);
      await select(page, "Supplied amount", String(amount));
      await select(page, "Your molar mass", String(m));
      await select(page, "Your sample mass", String(amount * m));
      await check(page, true);
    }
  await capture(page, `docs/qa/moles-${info.project.name}-reverse.png`);
});
test("molecules formula units standard form and constituent mol remain distinct", async ({
  page,
}, info) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  await task(page, 3);
  await select(page, "Your named complete entities", "molecules");
  await select(page, "Your count coefficient", "3.01");
  await select(page, "Your count exponent", "23");
  await select(page, "Your total constituent amount", "0.5");
  await check(page, false);
  await select(page, "Your total constituent amount", "1");
  await check(page, true);
  await select(page, "Supplied amount", "2");
  await select(page, "Your count coefficient", "12.04");
  await select(page, "Your total constituent amount", "4");
  await check(page, false);
  await select(page, "Your count coefficient", "1.204");
  await select(page, "Your count exponent", "24");
  await check(page, true);
  await capture(page, `docs/qa/moles-${info.project.name}-entities.png`);
  await select(page, "Supplied formula", "NaCl");
  await check(page, false);
  await select(page, "Your named complete entities", "formula units");
  await check(page, true);
  await expect(page.locator(".mole-formula-ratio")).toContainText(
    "not a discrete molecule",
  );
  await expect(
    page.getByRole("button", {
      name: "Show one representative molecule",
      exact: true,
    }),
  ).toHaveCount(0);
  await capture(page, `docs/qa/moles-${info.project.name}-ionic.png`);
});
test("inverse named particle count divides the whole standard-form value before mass", async ({
  page,
}, info) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  await task(page, 4);
  await select(page, "Your amount", "1");
  await select(page, "Your sample mass", "18");
  await check(page, false);
  await select(page, "Your amount", "0.5");
  await select(page, "Your sample mass", "9");
  await check(page, true);
  await select(page, "Supplied formula", "CO2");
  await select(page, "Supplied entity count", "two");
  await select(page, "Your amount", "2");
  await select(page, "Your sample mass", "88");
  await check(page, true);
  await capture(page, `docs/qa/moles-${info.project.name}-inverse.png`);
});
test("actual exported representative asset contains one molecule rather than a mole-sized population", async ({
  page,
}, info) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  await task(page, 3);
  await page
    .getByRole("button", {
      name: "Show one representative molecule",
      exact: true,
    })
    .click();
  for (const [formula, elements] of [
    ["O2", ["O", "O"]],
    ["H2O", ["O", "H", "H"]],
  ] as const) {
    await select(page, "Supplied formula", formula);
    await expect(
      page.getByText(
        `This asset shows ONE ${formula === "O2" ? "O₂" : "H₂O"} molecule`,
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("group", {
        name: "Rotate covalent molecule",
        exact: true,
      }),
    ).toHaveAttribute("data-ready", "true");
    const wait = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download molecule as GLB", exact: true })
      .click();
    const download = await wait,
      path = `docs/qa/moles-${formula}-${info.project.name}.glb`;
    await download.saveAs(path);
    const bytes = await readFile(path);
    expect(bytes.toString("utf8", 0, 4)).toBe("glTF");
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    const json = JSON.parse(
        bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
      ),
      nodes = json.nodes as {
        name: string;
        extras: { element?: string };
        translation?: number[];
        matrix?: number[];
      }[];
    const atoms = nodes.filter((x) => x.name?.startsWith("atom-"));
    expect(atoms.map((x) => x.extras.element)).toEqual([...elements]);
    expect(
      nodes.filter((x) => x.name?.includes("covalent-molecule")),
    ).toHaveLength(1);
    expect(nodes.filter((x) => x.name?.startsWith("bond-"))).toHaveLength(2);
    if (formula === "H2O") {
      const positions = atoms.map(
          (x) => x.translation ?? x.matrix!.slice(12, 15),
        ),
        a = positions[1].map((v, i) => v - positions[0][i]),
        b = positions[2].map((v, i) => v - positions[0][i]),
        angle =
          (Math.acos(
            a.reduce((s, v, i) => s + v * b[i], 0) /
              (Math.hypot(...a) * Math.hypot(...b)),
          ) *
            180) /
          Math.PI;
      expect(angle).toBeCloseTo(104.6, 1);
    }
  }
  await capture(page, `docs/qa/moles-${info.project.name}-3d.png`);
  await page
    .locator(".lattice-scene")
    .screenshot({ path: `docs/qa/moles-asset-${info.project.name}.png` });
});
test("all twenty-two independent tasks construct quantities and keep written review honest", async ({
  page,
}, info) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    if (q.id === "mo-v1-p-total-atoms")
      await page
        .getByLabel("Your answer", { exact: true })
        .fill("9.030000000000001e23");
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
    if (q.id === "mo-v1-p-molecules") {
      const tops = await page
        .locator(".multipart-answer input")
        .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().top));
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
      await capture(page, `docs/qa/moles-${info.project.name}-independent.png`);
    }
    if (q.rubric)
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "moles-and-reacting-masses"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    if (q.id === "mo-v1-p-explain" || q.id === "mo-v1-p-justify") {
      await page.locator(".question-panel textarea").evaluateAll((nodes) => {
        for (const node of nodes) node.scrollTop = 0;
      });
      await capture(
        page,
        `test-results/qa/moles-prose/${info.project.name}-${q.id}.png`,
      );
    }
  }
});
test("unnormalized but equal-value working returns from recovery without replacement", async ({
  page,
}) => {
  await page.goto("/lessons/moles-and-reacting-masses");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 13);
  await page.getByLabel("Count coefficient", { exact: true }).fill("12.04");
  await page.getByLabel("Power of 10", { exact: true }).fill("23");
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
    page.getByLabel("Count coefficient", { exact: true }),
  ).toHaveValue("12.04");
  await expect(page.getByLabel("Power of 10", { exact: true })).toHaveValue(
    "23",
  );
});
test("WebGL failure keeps the labelled molecule and wrong constituent prediction", async ({
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
  await page.goto("/lessons/moles-and-reacting-masses");
  await task(page, 3);
  await select(page, "Your total constituent amount", "0.5");
  await page
    .getByRole("button", {
      name: "Show one representative molecule",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your total constituent amount", { exact: true }),
  ).toHaveValue("0.5");
  await check(page, false);
  await capture(page, `docs/qa/moles-${info.project.name}-fallback.png`);
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/moles-and-reacting-masses");
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
                  "moles-and-reacting-masses"
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
      for (const run of p.work["moles-and-reacting-masses"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["moles-and-reacting-masses"].run.submitted =
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
