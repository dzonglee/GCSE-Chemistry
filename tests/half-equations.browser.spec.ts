import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { halfEquationsJourney as journey } from "../src/content/journeys/half-equations";
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
    page.locator(".half-equations-workbench .feedback[role=status]"),
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

const route = "/lessons/aqueous-electrolysis";

test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/aqueous-electrolysis");
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
                  "aqueous-electrolysis"
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
      for (const run of p.work["aqueous-electrolysis"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["aqueous-electrolysis"].run.submitted = Date.now() - delay - 1000;
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

test("all original practice works while two written explanations remain self-reviewed", async ({
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
    if (q.rubric) {
      await expect(
        page.locator(".sample-task-answer .feedback[role=status]"),
      ).toContainText("Compare your explanation");
      await expect
        .poll(() =>
          page.evaluate(
            ({ key, id }) =>
              JSON.parse(localStorage.getItem(key)!).work[
                "aqueous-electrolysis"
              ].attempts[id]?.at(-1)?.correct,
            { key: STORAGE_KEY, id: q.id },
          ),
        )
        .toBe(false);
    } else
      await expect(
        page.locator(".sample-task-answer [role=status]"),
      ).toContainText("That’s right.");
    if (["he-v1-p-charge-only", "he-v1-p-minimum", "he-v1-p-carriers"].includes(q.id)) {
      await page.locator("textarea").evaluateAll((fields) => {
        for (const field of fields) field.scrollTop = 0;
      });
      await capture(page, `test-results/qa/half-equations-prose/${info.project.name}-${q.id}.png`);
    }
  }
});
test("native electron changes preserve wrong direction, keyboard use, undo, atomic record reset and reload", async ({
  page,
}, info) => {
  await page.goto(route);
  const gain = page.getByRole("button", {
      name: "Gain one electron",
      exact: true,
    }),
    box = await gain.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await page
    .getByRole("button", { name: "Lose one electron", exact: true })
    .click();
  await select(page, "Your redox classification", "reduction");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.locator(".model-readout")).toContainText("Charge now: 3");
  await gain.focus();
  await page.keyboard.press("Enter");
  await gain.click();
  await gain.click();
  await check(page, true);
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-electrons.png",
  );
  await select(page, "Supplied reaction", "iron");
  await expect(page.locator(".model-readout")).toContainText("Charge now: 2");
  await expect(
    page.getByLabel("Your redox classification", { exact: true }),
  ).toHaveValue("unset");
  await page
    .getByRole("button", { name: "Lose one electron", exact: true })
    .click();
  await select(page, "Your redox classification", "oxidation");
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Your redox classification", { exact: true }),
  ).toHaveValue("unset");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Supplied reaction", { exact: true }),
  ).toHaveValue("initial");
});
async function up(page: Page, label: string, n: number) {
  for (let i = 0; i < n; i++)
    await page
      .getByRole("button", { name: "Increase " + label, exact: true })
      .click();
}
test("cation coefficients distinguish incorrect electron charge from balanced multiples and smallest explicit demand", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await up(page, "Starting species coefficient", 1);
  await up(page, "Electron coefficient", 1);
  await up(page, "Product coefficient", 1);
  await select(page, "Your electron side", "left");
  await check(page, false);
  await up(page, "Electron coefficient", 1);
  await check(page, true);
  await page
    .getByLabel("Your answer", { exact: true })
    .fill("2Cu2+ +4e- ->2Cu");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-cation.png",
  );
  await select(page, "Supplied reaction", "hydrogen");
  await expect(page.locator(".half-equation-preview")).toContainText("0 H+");
  await up(page, "Starting species coefficient", 2);
  await up(page, "Electron coefficient", 2);
  await up(page, "Product coefficient", 1);
  await select(page, "Your electron side", "left");
  await check(page, true);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 14);
  await page.getByLabel("Your answer", { exact: true }).fill("2Cu2++4e- ->2Cu");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "smallest",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("Cu2++2e- ->Cu");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer [role=status]")).toContainText(
    "That’s right.",
  );
});
test("hydroxide work retains water, charge and atomic identities, with separate external account", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await up(page, "Starting species coefficient", 4);
  await up(page, "Product coefficient", 1);
  await up(page, "Electron coefficient", 4);
  await select(page, "Your electron side", "right");
  await check(page, false);
  await up(page, "Water coefficient", 2);
  await check(page, true);
  await expect(
    page.getByRole("group", {
      name: "Rotate hydroxide oxidation reference",
      exact: true,
    }),
  ).toHaveAttribute("data-ready", "true");
  await page
    .getByLabel("Your answer", { exact: true })
    .fill("4OH- -4e- ->O2+2H2O");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-hydroxide.png",
  );
  await select(page, "Supplied reaction", "ironOxidation");
  await expect(page.locator(".hydroxide-oxidation-asset")).toHaveCount(0);
  await up(page, "Starting species coefficient", 1);
  await up(page, "Product coefficient", 1);
  await up(page, "Electron coefficient", 1);
  await select(page, "Your electron side", "right");
  await check(page, true);
  await select(page, "Supplied reaction", "oxide");
  await up(page, "Starting species coefficient", 2);
  await up(page, "Product coefficient", 1);
  await up(page, "Electron coefficient", 4);
  await select(page, "Your electron side", "right");
  await check(page, true);
  await expect(page.locator(".half-equation-preview")).toContainText("O²−");
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-oxide.png",
  );
});
test("diagnostic and ionic modes retain separate atom/charge and electron-transfer predictions", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await select(page, "Your conservation claim", "both");
  await check(page, false);
  await select(page, "Your conservation claim", "atoms-only");
  await check(page, true);
  await select(page, "Supplied reaction", "neither");
  await select(page, "Your conservation claim", "neither");
  await check(page, true);
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-diagnose.png",
  );
  await task(page, 5);
  await select(page, "Your oxidised species", "Cu2+");
  await select(page, "Your reduced species", "Zn");
  await select(page, "Your spectator ion", "SO4²−");
  await check(page, false);
  await select(page, "Your oxidised species", "Zn");
  await select(page, "Your reduced species", "Cu2+");
  await check(page, true);
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-ionic.png",
  );
});
test("typed wrong equation survives targeted refresher recovery, with uncharged electron rejected", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await page.getByLabel("Your answer", { exact: true }).fill("Ag+ +e ->Ag");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "Keep the stated chemical species",
  );
  await expect(
    page.locator(".sample-task-answer .feedback.correct"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Count the transferred electrons",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "Ag+ +e ->Ag",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "Ag+ +e ->Ag",
  );
});
test("actual binary export retains sixteen atomic meshes, bent water and separately accounted external electrons", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  const canvas = page.getByRole("group", {
    name: "Rotate hydroxide oxidation reference",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  for (let i = 0; i < 7; i++)
    await page
      .getByRole("button", { name: "Rotate right", exact: true })
      .click();
  await canvas.screenshot({
    path: "docs/qa/half-equations-" + info.project.name + "-asset.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  await page
    .getByRole("button", { name: "Enlarge after state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "after");
  await canvas.screenshot({
    path: "docs/qa/half-equations-" + info.project.name + "-enlarged-after.png",
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download actual 3D asset", exact: true })
    .click();
  const d = await pending;
  await d.saveAs(
    "docs/qa/half-equations-" + info.project.name + "-hydroxide.glb",
  );
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString()),
    nodes = g.nodes as {
      extras?: {
        atomicId?: string;
        element?: string;
        externalElectrons?: number;
        totalIncludingExternal?: number;
        kind?: string;
      };
    }[],
    atoms = nodes.filter((n) => n.extras?.atomicId);
  expect(atoms).toHaveLength(16);
  expect(new Set(atoms.map((n) => n.extras!.atomicId)).size).toBe(8);
  expect(atoms.filter((n) => n.extras?.element === "O")).toHaveLength(8);
  expect(
    nodes.filter((n) => n.extras?.kind === "covalent-bond-rod"),
  ).toHaveLength(10);
  expect(nodes.filter((n) => n.extras?.externalElectrons === 4)).toHaveLength(
    1,
  );
  expect(
    nodes.filter((n) => n.extras?.totalIncludingExternal === -4),
  ).toHaveLength(2);
  const bin = 28 + len;
  for (const mesh of g.meshes) {
    const a = g.accessors[mesh.primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      start = bin + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    expect(a.componentType).toBe(5126);
    for (let i = 0; i < a.count * 3; i++)
      expect(Number.isFinite(bytes.readFloatLE(start + i * 4))).toBe(true);
  }
});
test("fresh equation check hides assistance and retains text draft without premature marking", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("Ni2+ +e- ->Ni");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "Ni2+ +e- ->Ni",
  );
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".feedback.correct")).toHaveCount(0);
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-independent.png",
  );
});
test("WebGL fallback preserves O4H4 and external charge while coefficient controls remain editable", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind,
      ...args
    ) {
      if (String(kind).startsWith("webgl")) return null;
      return get.call(this, kind, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(route);
  await task(page, 3);
  await expect(page.getByText(/3D is unavailable/)).toBeVisible();
  await up(page, "Starting species coefficient", 4);
  await up(page, "Product coefficient", 1);
  await up(page, "Water coefficient", 2);
  await up(page, "Electron coefficient", 4);
  await select(page, "Your electron side", "right");
  await check(page, true);
  await capture(
    page,
    "docs/qa/half-equations-" + info.project.name + "-fallback.png",
  );
});
