import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { oxygenRedoxJourney as journey } from "../src/content/journeys/oxygen-redox";
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
    page.locator(".oxygen-redox-workbench .feedback[role=status]"),
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

const route = "/lessons/oxidation-and-reduction";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/oxidation-and-reduction");
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
                JSON.parse(localStorage.getItem(key)!).work[
                  "oxidation-and-reduction"
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
      for (const run of p.work["oxidation-and-reduction"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["oxidation-and-reduction"].run.submitted =
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

test("oxygen atom controls retain incorrect counts, undo and canonical reset at mobile opening", async ({
  page,
}, info) => {
  await page.goto(route);
  const add = page.getByRole("button", {
    name: "Add oxygen atom",
    exact: true,
  });
  await expect(add).toBeVisible();
  const box = await add.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await add.click();
  await select(page, "Your metal change", "reduction");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your metal change", { exact: true }),
  ).toHaveValue("reduction");
  await expect(page.locator(".oxygen-counter strong")).toHaveText("1");
  await add.click();
  await select(page, "Your metal change", "oxidation");
  await check(page, true);
  await select(page, "Explore a supplied reaction record", "aluminium");
  await check(page, false);
  for (let i = 0; i < 4; i++) await add.click();
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(page.locator(".oxygen-counter strong")).toHaveText(
    "Not entered",
  );
  await capture(
    page,
    `docs/qa/oxygen-redox-${info.project.name}-oxidation.png`,
  );
});
test("paired oxygen transfer keeps original substance names and conserved actual atoms", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const add = page.getByRole("button", {
    name: "Add oxygen atom",
    exact: true,
  });
  await add.click();
  await add.click();
  await choices(page, {
    "Your substance reduced": "CuO",
    "Your substance oxidised": "C",
  });
  await check(page, true);
  const canvas = page.getByRole("group", {
    name: "Rotate oxygen transfer states",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  const download = await pending;
  const { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await download.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    gltf = JSON.parse(bytes.subarray(20, 20 + len).toString()),
    binStart = 28 + len;
  const atoms = gltf.nodes.filter(
    (n: { extras?: { element?: string } }) => n.extras?.element,
  );
  expect(atoms).toHaveLength(10);
  expect(
    new Set(
      atoms.map((n: { extras: { particleId: string } }) => n.extras.particleId),
    ).size,
  ).toBe(5);
  expect(
    gltf.nodes.filter(
      (n: { extras?: { bondOrder?: number } }) => n.extras?.bondOrder === 2,
    ),
  ).toHaveLength(4);
  for (const n of atoms) {
    const a =
        gltf.accessors[gltf.meshes[n.mesh].primitives[0].attributes.POSITION],
      v = gltf.bufferViews[a.bufferView],
      base = binStart + (v.byteOffset ?? 0) + (a.byteOffset ?? 0),
      stride = v.byteStride ?? 12,
      z = [];
    for (let i = 0; i < a.count; i++)
      z.push(bytes.readFloatLE(base + i * stride + 8));
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(1.9);
  }
  await download.saveAs(
    `docs/qa/oxygen-redox-${info.project.name}-transfer.glb`,
  );
  await capture(page, `docs/qa/oxygen-redox-${info.project.name}-transfer.png`);
  await select(page, "Explore a supplied reaction record", "nickel");
  await page
    .getByRole("button", { name: "Remove oxygen atom", exact: true })
    .click();
  await select(page, "Your substance reduced", "NiO");
  await check(page, true);
  await expect(canvas).toHaveCount(0);
});
test("reducing agent is different from oxide reduced", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your reducing agent": "CuO",
    "Your reason": "loses-oxygen-and-is-reduced",
  });
  await check(page, false);
  await choices(page, {
    "Your reducing agent": "C",
    "Your reason": "receives-oxygen-and-is-oxidised",
  });
  await check(page, true);
  await select(page, "Explore a supplied reaction record", "monoxide");
  await select(page, "Your reducing agent", "CO");
  await check(page, true);
  await capture(page, `docs/qa/oxygen-redox-${info.project.name}-agent.png`);
});
test("sample crossing and internal oxygen transfer keep different mass interpretations", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await choices(page, {
    "Your net crossing mass / g": "0.32",
    "Your boundary interpretation": "oxygen-entered",
  });
  await check(page, true);
  await select(page, "Explore a supplied reaction record", "reduction");
  await select(page, "Your boundary interpretation", "oxygen-left-this-sample");
  await check(page, true);
  await expect(page.locator(".oxygen-mass-ledger")).toContainText("-0.32");
  await select(page, "Explore a supplied reaction record", "enclosed");
  await choices(page, {
    "Your net crossing mass / g": "0",
    "Your boundary interpretation": "internal-transfer-no-total-change",
  });
  await check(page, true);
  await capture(page, `docs/qa/oxygen-redox-${info.project.name}-mass.png`);
});
test("evidence distinguishes colour, neutralisation and broader oxygen-model limits", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await select(page, "Explore a supplied reaction record", "acid");
  await choices(page, {
    "Your supported conclusion": "every-oxygen-movement-is-redox",
    "Your evidence rule": "colour-proves-everything",
  });
  await check(page, false);
  await choices(page, {
    "Your supported conclusion": "neutralisation-not-metal-reduction",
    "Your evidence rule": "copper-remains-ion-not-metal",
  });
  await check(page, true);
  await capture(page, `docs/qa/oxygen-redox-${info.project.name}-evidence.png`);
  await select(page, "Explore a supplied reaction record", "noOxygen");
  await choices(page, {
    "Your supported conclusion": "oxygen-model-insufficient",
    "Your evidence rule": "broader-electron-redox-separate",
  });
  await check(page, true);
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
                "oxidation-and-reduction"
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

test("fresh changed reaction check hides assistance and premature feedback", async ({
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
    `docs/qa/oxygen-redox-${info.project.name}-independent.png`,
  );
});
test("WebGL fallback retains complete oxygen inventory and editable prediction", async ({
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
  await task(page, 2);
  await expect(page.getByText(/3D is unavailable/)).toContainText("Cu2 C1 O2");
  await page
    .getByRole("button", { name: "Add oxygen atom", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add oxygen atom", exact: true })
    .click();
  await choices(page, {
    "Your substance reduced": "CuO",
    "Your substance oxidised": "C",
  });
  await check(page, true);
  await capture(page, `docs/qa/oxygen-redox-${info.project.name}-fallback.png`);
});
test("actual quarter-turn geometry remains visible with readable composition", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  const canvas = page.getByRole("group", {
    name: "Rotate oxygen transfer states",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  for (let i = 0; i < 16; i++) await page.keyboard.press("ArrowRight");
  await page.locator(".oxygen-transfer-asset").screenshot({
    path: `docs/qa/oxygen-redox-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link {visibility:hidden !important}",
  });
});
test("wrong agent role survives targeted recovery and reload", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const i = journey.practice.findIndex((q) => q.id === "or-v1-p-agent-role"),
    q = journey.practice[i],
    wrong = q.options!.find((v) => v !== q.answer)!;
  await task(page, i + 1);
  await page.getByRole("radio", { name: wrong, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Identify the oxygen receiver",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: wrong, exact: true }),
  ).toBeChecked();
});
