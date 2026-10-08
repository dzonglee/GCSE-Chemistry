import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { acidNeutralisationJourney as journey } from "../src/content/journeys/acids-and-neutralisation";
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
    page.locator(".acid-workbench .feedback[role=status]"),
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

const route = "/lessons/acids-and-neutralisation";
async function choices(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values))
    await select(page, label, value);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}) => {
  await page.goto("/lessons/acids-and-neutralisation");
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
                  "acids-and-neutralisation"
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
      for (const run of p.work["acids-and-neutralisation"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["acids-and-neutralisation"].run.submitted =
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
                "acids-and-neutralisation"
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
    `docs/qa/acids-and-neutralisation-${info.project.name}-independent.png`,
  );
});
test("one-pair controls preserve wrong residual predictions through reload and atomic record reset", async ({
  page,
}, info) => {
  await page.goto(route);
  const react = page.getByRole("button", {
    name: "React one H+ / OH− pair",
    exact: true,
  });
  await expect(react).toBeVisible();
  const box = await react.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await react.click();
  await choices(page, {
    "Your final H+ units remaining": "0",
    "Your final OH− units remaining": "0",
    "Your final solution classification": "acidic",
  });
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(page.locator(".acid-pair-inventory")).toContainText("3");
  await expect(
    page.getByLabel("Your final solution classification", { exact: true }),
  ).toHaveValue("acidic");
  for (let i = 0; i < 3; i++) await react.click();
  await select(page, "Your final solution classification", "neutral");
  await check(page, true);
  await expect(react).toBeDisabled();
  await capture(
    page,
    `docs/qa/acids-neutralisation-${info.project.name}-pairs.png`,
  );
  await select(page, "Explore a supplied acid reaction record", "acidExcess");
  await expect(react).toBeEnabled();
  await expect(page.locator(".acid-pair-inventory dd").last()).toHaveText("0");
  for (let i = 0; i < 4; i++) await react.click();
  await choices(page, {
    "Your final H+ units remaining": "2",
    "Your final solution classification": "acidic",
  });
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await check(page, false);
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(page.locator(".acid-pair-inventory dd").last()).toHaveText("0");
  await expect(
    page.getByLabel("Your final H+ units remaining", { exact: true }),
  ).toHaveValue("unset");
});
test("metal, oxide and carbonate produce distinct gas and water outcomes", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 2);
  await choices(page, {
    "Your other reactant family": "hydroxide",
    "Your gas product": "H2",
    "Your water product": "yes",
  });
  await check(page, false);
  await select(page, "Your gas product", "none");
  await check(page, true);
  await select(page, "Explore a supplied acid reaction record", "magnesium");
  await choices(page, {
    "Your other reactant family": "metal",
    "Your gas product": "H2",
    "Your water product": "no",
  });
  await check(page, true);
  await select(page, "Explore a supplied acid reaction record", "carbonate");
  await choices(page, {
    "Your other reactant family": "carbonate",
    "Your gas product": "CO2",
    "Your water product": "yes",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/acids-neutralisation-${info.project.name}-products.png`,
  );
});
test("salt name and formula both use supplied acid and cation without breaking nitrate or sulfate", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 3);
  await choices(page, {
    "Your salt name": "calcium-chloride",
    "Your salt formula": "CaCl",
  });
  await check(page, false);
  await select(page, "Your salt formula", "CaCl2");
  await check(page, true);
  await select(page, "Explore a supplied acid reaction record", "nitrate");
  await choices(page, {
    "Your salt name": "magnesium-nitrate",
    "Your salt formula": "Mg(NO3)2",
  });
  await check(page, true);
  await select(page, "Explore a supplied acid reaction record", "sulfate");
  await choices(page, {
    "Your salt name": "aluminium-sulfate",
    "Your salt formula": "Al2(SO4)3",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/acids-neutralisation-${info.project.name}-salts.png`,
  );
});
test("insoluble base is not forced to be an alkali by its neutralising behaviour", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 4);
  await select(page, "Explore a supplied acid reaction record", "oxide");
  await choices(page, {
    "Your substance classification": "alkali-soluble-base",
    "Your supplied acid or alkali ion evidence": "OH−",
  });
  await check(page, false);
  await choices(page, {
    "Your substance classification": "insoluble-base",
    "Your supplied acid or alkali ion evidence": "not-an-aqueous-ion-record",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/acids-neutralisation-${info.project.name}-identity.png`,
  );
});
test("gas observations, litmus and warming cannot invent exact pH or full neutralisation", async ({
  page,
}, info) => {
  await page.goto(route);
  await task(page, 5);
  await choices(page, {
    "Your supported conclusion": "CO2-supported",
    "Your pH conclusion": "not-determined",
  });
  await check(page, true);
  await select(page, "Explore a supplied acid reaction record", "litmus");
  await choices(page, {
    "Your supported conclusion": "alkaline-supported",
    "Your pH conclusion": "exactly-12",
  });
  await check(page, false);
  await select(page, "Your pH conclusion", "not-exactly-determined");
  await check(page, true);
  await capture(
    page,
    `docs/qa/acids-neutralisation-${info.project.name}-evidence.png`,
  );
  await select(page, "Explore a supplied acid reaction record", "warming");
  await choices(page, {
    "Your supported conclusion": "heat-release-not-complete-neutrality",
    "Your pH conclusion": "not-determined",
  });
  await check(page, true);
});
test("real hydrated asset keeps16 atomic meshes,8 identities and single bonds without spectator salt molecules", async ({
  page,
}, info) => {
  await page.goto(route);
  const canvas = page.getByRole("group", {
    name: "Rotate neutralisation states",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.1");
  for (let i = 0; i < 8; i++)
    await page
      .getByRole("button", { name: "Rotate right", exact: true })
      .click();
  await canvas.screenshot({
    path: `docs/qa/acids-neutralisation-${info.project.name}-asset.png`,
    style: ".mobile-bar,.skip-link {visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  const d = await pending,
    { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!);
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString()),
    start = 28 + len,
    atoms = g.nodes.filter(
      (n: { extras?: { element?: string } }) => n.extras?.element,
    );
  expect(atoms).toHaveLength(16);
  expect(
    new Set(
      atoms.map((n: { extras: { particleId: string } }) => n.extras.particleId),
    ).size,
  ).toBe(8);
  expect(
    g.nodes.filter(
      (n: { extras?: { bondOrder?: number } }) => n.extras?.bondOrder === 1,
    ),
  ).toHaveLength(8);
  for (const n of atoms) {
    const a = g.accessors[g.meshes[n.mesh].primitives[0].attributes.POSITION],
      v = g.bufferViews[a.bufferView],
      base = start + (v.byteOffset ?? 0) + (a.byteOffset ?? 0),
      stride = v.byteStride ?? 12,
      z = [];
    for (let i = 0; i < a.count; i++)
      z.push(bytes.readFloatLE(base + i * stride + 8));
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(1.9);
  }
  await d.saveAs(
    `docs/qa/acids-neutralisation-${info.project.name}-hydrated.glb`,
  );
  await expect(page.locator(".neutralisation-asset")).toContainText(
    "H+ + OH− → H2O",
  );
});
test("wrong ion charge recovers to its own refresher and retains the original wrong answer", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByRole("radio", { name: "H−", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByText(
      "Which pair reacts in the GCSE acid–alkali neutralisation equation?",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "H−", exact: true }),
  ).toBeChecked();
});
test("WebGL fallback keeps hydrated and shorthand identities alongside editable pair controls", async ({
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
  await expect(
    page.locator(".neutralisation-asset [role=status]"),
  ).toContainText("Na1 Cl1 O2 H4");
  const react = page.getByRole("button", {
    name: "React one H+ / OH− pair",
    exact: true,
  });
  for (let i = 0; i < 4; i++) await react.click();
  await choices(page, {
    "Your final H+ units remaining": "0",
    "Your final OH− units remaining": "0",
    "Your final solution classification": "neutral",
  });
  await check(page, true);
  await capture(
    page,
    `docs/qa/acids-neutralisation-${info.project.name}-fallback.png`,
  );
});

test("mobile-friendly focus enlarges each chemical state but binary download always retains both inventories", async ({
  page,
}, info) => {
  await page.goto(route);
  const canvas = page.getByRole("group", {
    name: "Rotate neutralisation states",
    exact: true,
  });
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("button", { name: "Enlarge before state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "before");
  await page
    .getByRole("button", { name: "Enlarge after state", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "after");
  await canvas.screenshot({
    path: `docs/qa/acids-neutralisation-${info.project.name}-enlarged-after.png`,
    style: ".mobile-bar,.skip-link{visibility:hidden!important;}",
  });
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download 3D asset", exact: true })
    .click();
  const d = await pending,
    { readFile } = await import("node:fs/promises"),
    bytes = await readFile((await d.path())!),
    len = bytes.readUInt32LE(12),
    g = JSON.parse(bytes.subarray(20, 20 + len).toString());
  expect(
    g.nodes.filter((n: { extras?: { element?: string } }) => n.extras?.element),
  ).toHaveLength(16);
  await page
    .getByRole("button", {
      name: "Compare both neutralisation states",
      exact: true,
    })
    .click();
  await expect(canvas).toHaveAttribute("data-focus", "both");
});
