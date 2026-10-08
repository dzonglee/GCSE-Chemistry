import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { crackingJourney as journey } from "../src/content/journeys/cracking";
import {
  crackingRecords,
  crackingBalances,
  canonicalHydrogens,
  type CrackingMode,
} from "../src/lib/cracking";
import { expectedCrackingBoard } from "../src/lib/cracking-board";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/cracking-and-alkenes";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
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
  await page.screenshot({ path, fullPage: true, scale: "css" });
}
async function suppliedStructure(page: Page) {
  const region = page.locator(".hydrocarbon-given .alkene-diagram-scroll");
  await expect(region).toBeVisible();
  expect(
    await region.evaluate((node) => {
      const box = node.getBoundingClientRect();
      return [...node.querySelectorAll("text")].every((text) => {
        const label = text.getBoundingClientRect();
        const matrix = text.getScreenCTM()!;
        return (
          label.left >= box.left - 1 &&
          label.right <= box.right + 1 &&
          parseFloat(getComputedStyle(text).fontSize) *
            Math.hypot(matrix.a, matrix.b) >=
            12
        );
      });
    }),
  ).toBe(true);
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.alkeneDrawing) {
    const root = page.getByRole("region", {
        name: "Alkene structure construction",
      }),
      n = q.prompt.includes("ethene")
        ? 2
        : q.prompt.includes("propene")
          ? 3
          : q.prompt.includes("pent")
            ? 5
            : 4,
      double = q.prompt.includes("but-2") ? 1 : 0;
    await root
      .getByLabel("Choose the number of carbon atoms in your scaffold")
      .selectOption(String(n));
    await root
      .getByLabel("Choose your carbon–carbon double-bond position")
      .selectOption(String(double));
    for (let c = 0; c < n; c++)
      for (const slot of canonicalHydrogens(n, double, c))
        await root.locator(`[data-h-slot="h${c * 4 + slot}"]`).click();
  } else if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function comparison(root: Locator, id: string) {
  if (
    !(await root.getByLabel("Supplied comparison", { exact: true }).isVisible())
  )
    await root.locator("details summary").click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption(id);
}
for (const [mode, index] of (
  ["rearrange", "structure", "balance", "bromine", "process"] as CrackingMode[]
).map((m, i) => [m, i + 1] as const))
  test(
    mode +
      " retains individually supplied wrong proposals across reload and has readable accessible controls",
    async ({ page }, info) => {
      await page.goto(route);
      await page.getByRole("button", { name: "Learn", exact: true }).click();
      await task(page, index);
      const root = page.getByRole("region", { name: "Task model" });
      for (const id of Object.keys(crackingRecords[mode])) {
        await comparison(root, id);
        const e = expectedCrackingBoard(mode, id);
        for (const [k, v] of Object.entries(e)) {
          if (k === "record") continue;
          if (k === "phase") {
            await root
              .getByRole("button", {
                name: "Compare " + v.toUpperCase(),
                exact: true,
              })
              .click();
          } else if (k.startsWith("show")) {
            await root
              .getByRole("button", {
                name: (
                  {
                    showBlank: "Reveal no-sample blank observation",
                    showPositive: "Reveal known alkene reference observation",
                    showSample: "Reveal original sample observation",
                  } as Record<string, string>
                )[k],
                exact: true,
              })
              .click();
          } else if (/^h\d+$/.test(k)) {
            const button = root.locator(`[data-h-slot="${k}"]`);
            if (
              (await button.getAttribute("aria-pressed")) !==
              (v === "yes" ? "true" : "false")
            )
              await button.click();
          } else {
            const input = root.locator(`[id$="-${k}"]`);
            if (await input.evaluate((x) => x.tagName === "SELECT"))
              await input.selectOption(v);
            else await input.fill(v);
          }
        }
        const key =
            mode === "rearrange"
              ? "hydrogen"
              : mode === "structure"
                ? "hydrogens"
                : mode === "balance"
                  ? crackingBalances[id].kind === "formula"
                    ? "hydrogens"
                    : "feed"
                  : mode === "bromine"
                    ? "verdict"
                    : "heat",
          wrong =
            mode === "bromine"
              ? e.verdict === "alkaneSupported"
                ? "alkeneSupported"
                : "alkaneSupported"
              : mode === "process"
                ? "room"
                : "99",
          input = root.locator(`[id$="-${key}"]`);
        if (["bromine", "process"].includes(mode))
          await input.selectOption(wrong);
        else await input.fill(wrong);
        await root
          .getByRole("button", { name: "Check model", exact: true })
          .click();
        await expect(root.locator(".feedback.incorrect")).toBeVisible();
        await saved(page);
        await page.reload();
        await expect(input).toHaveValue(wrong);
        await comparison(root, id);
        await expect(input).toHaveValue(wrong);
        if (["bromine", "process"].includes(mode))
          await input.selectOption(e[key]);
        else await input.fill(e[key]);
        await root
          .getByRole("button", { name: "Check model", exact: true })
          .click();
        await expect(root.locator(".feedback.correct")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        for (const button of await root.getByRole("button").all())
          expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(
            44,
          );
        if (mode === "rearrange")
          await expect(
            root.locator('.cracking-canvas[data-state="ready"]'),
          ).toBeVisible();
        if (id === "initial") {
          await capture(
            page,
            `docs/qa/cracking-${info.project.name}-${mode}.png`,
          );
          await page.screenshot({
            fullPage: true,
            clip: (await root.boundingBox())!,
            path: `docs/qa/cracking-${info.project.name}-${mode}-model.png`,
            scale: "css",
          });
          if (mode === "rearrange") {
            const download = page.waitForEvent("download");
            await root
              .getByRole("button", { name: "Download 3D asset", exact: true })
              .click();
            await (
              await download
            ).saveAs(`docs/qa/cracking-${info.project.name}-after.glb`);
            await root
              .getByRole("button", { name: "Compare BEFORE", exact: true })
              .click();
            await expect(
              root.locator('.cracking-canvas[data-state="ready"]'),
            ).toBeVisible();
            const before = page.waitForEvent("download");
            await root
              .getByRole("button", { name: "Download 3D asset", exact: true })
              .click();
            await (
              await before
            ).saveAs(`docs/qa/cracking-${info.project.name}-before.glb`);
            await root
              .getByRole("button", { name: "Compare AFTER", exact: true })
              .click();
          }
        }
      }
      await root
        .getByRole("button", { name: "Reset model", exact: true })
        .click();
      await saved(page);
      await page.reload();
      await expect(
        root.getByLabel("Supplied comparison", { exact: true }),
      ).toHaveValue("initial");
    },
  );
test("all 36 practice demands retain honest structure and written review", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    const q = journey.practice[i];
    await task(page, i + 1);
    if (q.hydrocarbonGiven) await suppliedStructure(page);
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric ? "Save and review explanation" : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.locator(".sample-task-answer .feedback")).toContainText(
      q.rubric ? "Compare your explanation" : "right",
    );
  }
  await saved(page);
  const results = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["cracking-and-alkenes"]
        .attempts,
    STORAGE_KEY,
  );
  expect(
    Object.values(results).filter(
      (x: unknown) => (x as { correct: boolean }[]).at(-1)?.correct,
    ),
  ).toHaveLength(29);
});
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/cracking-and-alkenes");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 4);
  await answer(page, journey.practice[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await saved(page);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    for (let i = 0; i < 8; i++) {
      if (i)
        await page
          .getByRole("button", { name: "Next question →", exact: true })
          .click();
      const q = journey.checkForms[form][i];
      if (q.hydrocarbonGiven) await suppliedStructure(page);
      await answer(page, q);
      if (form === 0 && i === 6) {
        await saved(page);
        await page.reload();
        await expect(
          page
            .getByRole("region", { name: "Alkene structure construction" })
            .getByLabel("Choose the number of carbon atoms in your scaffold"),
        ).toHaveValue("3");
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 6) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1) ||
        q.alkeneDrawing
      )
        await capture(
          page,
          "docs/qa/cracking-and-alkenes-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      const stages = page.getByRole("navigation", {
        name: "Lesson stages",
        exact: true,
      });
      const active = stages.locator('[aria-current="step"]');
      const frame = (await stages.boundingBox())!,
        tab = (await active.boundingBox())!;
      expect(tab.x).toBeGreaterThanOrEqual(frame.x - 1);
      expect(tab.x + tab.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
      if (q.alkeneDrawing) {
        const chart = page.getByRole("region", {
          name: "Alkene structure construction",
          exact: true,
        });
        await page.screenshot({
          path: `docs/qa/cracking-${info.project.name}-independent-form-${form}-drawing.png`,
          fullPage: true,
          clip: (await chart.boundingBox())!,
          scale: "css",
        });
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
                  "cracking-and-alkenes"
                ].run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(false);
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
      page.getByRole("heading", { name: "6 of 6 correct", exact: true }),
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
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["cracking-and-alkenes"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["cracking-and-alkenes"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["cracking-and-alkenes"].run.submitted = Date.now() - delay - 1000;
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
test("independent drawing keeps wrong local valence and hidden C=C/H through submitted self-review", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 6; i++) {
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  const root = page.getByRole("region", {
      name: "Alkene structure construction",
    }),
    count = root.getByLabel(
      "Choose the number of carbon atoms in your scaffold",
    ),
    double = root.getByLabel("Choose your carbon–carbon double-bond position");
  await expect(count).toHaveValue("");
  await expect(double).toHaveValue("");
  await count.selectOption("5");
  await double.selectOption("3");
  await root.locator('[data-h-slot="h16"]').click();
  await count.selectOption("3");
  for (const h of ["h4", "h5", "h6"])
    await root.locator(`[data-h-slot="${h}"]`).click();
  await saved(page);
  await page.reload();
  await expect(count).toHaveValue("3");
  await expect(double).toHaveValue("3");
  await expect(root.locator('[data-h-slot="h6"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(root).toContainText("outside");
  await count.selectOption("5");
  await expect(root.locator('[data-h-slot="h16"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await count.selectOption("3");
  await capture(
    page,
    `docs/qa/cracking-${info.project.name}-retained-wrong-drawing.png`,
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  await answer(page, journey.checkForms[0][7]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await page
    .locator("summary")
    .filter({ hasText: journey.checkForms[0][6].prompt })
    .click();
  await expect(count).toBeDisabled();
  await expect(double).toBeDisabled();
  for (const b of await root.getByRole("button").all())
    await expect(b).toBeDisabled();
  await expect(
    page
      .locator("details[open] summary")
      .getByText("Self-review", { exact: true }),
  ).toBeVisible();
  await capture(
    page,
    `docs/qa/cracking-${info.project.name}-completed-structure-review.png`,
  );
});
test("global coefficient scale raw edit and selected schema undo retain original work", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 3);
  const root = page.getByRole("region", { name: "Task model" });
  await comparison(root, "tenCarbon");
  for (const [k, v] of [
    ["feed", "1"],
    ["alkane", "1"],
    ["alkene", "2"],
  ])
    await root.locator(`[id$="-${k}"]`).fill(v);
  await root
    .getByRole("button", { name: "Double ALL coefficients", exact: true })
    .click();
  await expect(root.locator('[id$="-alkene"]')).toHaveValue("4");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.correct")).toBeVisible();
  await comparison(root, "tenCarbon");
  await expect(root.locator(".feedback.correct")).toBeVisible();
  await root.locator('[id$="-feed"]').fill("1e2");
  await root.locator('[id$="-alkane"]').fill("3");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-feed"]')).toHaveValue("2");
  await expect(root.locator('[id$="-alkane"]')).toHaveValue("3");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-alkane"]')).toHaveValue("2");
  await root
    .getByRole("button", {
      name: "Halve ALL coefficients, if whole",
      exact: true,
    })
    .click();
  await expect(root.locator('[id$="-alkene"]')).toHaveValue("2");
  await comparison(root, "twoAlkenes");
  await expect(root.locator('[id$="-carbons"]')).toHaveValue("");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-record"]')).toHaveValue("tenCarbon");
  await saved(page);
  await page.reload();
  await expect(root.locator('[id$="-alkene"]')).toHaveValue("2");
});
test("short-screen first control and keyboard changes retain one actual renderer", async ({
  page,
}, info) => {
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 320, height: 664 }
      : { width: 1280, height: 720 },
  );
  await page.goto(route);
  const root = page.getByRole("region", { name: "Task model" }),
    cut = root.locator('[id$="-cut"]');
  await expect(cut).toBeVisible();
  expect(
    (await cut.boundingBox())!.y + (await cut.boundingBox())!.height,
  ).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(
    root.locator('.cracking-canvas[data-state="ready"]'),
  ).toBeVisible();
  const canvas = await root.locator("canvas").elementHandle();
  await cut.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(cut).toHaveValue("2");
  await expect(
    root.locator('.cracking-canvas[data-state="ready"]'),
  ).toBeVisible();
  await root
    .getByRole("button", { name: "Compare AFTER", exact: true })
    .click();
  await expect(
    root.locator('.cracking-canvas[data-state="ready"]'),
  ).toBeVisible();
  expect(
    await root.locator("canvas").evaluate((node, old) => node === old, canvas),
  ).toBe(true);
  await root.locator(".cracking-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await root.getByRole("button", { name: "Reset view", exact: true }).click();
  await capture(page, `docs/qa/cracking-${info.project.name}-opening.png`);
});
test("WebGL unavailable preserves formulas inventories and editable comparisons", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.includes("webgl")) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto(route);
  const root = page.getByRole("region", { name: "Task model" });
  await expect(
    root.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await root.locator('[id$="-cut"]').selectOption("4");
  await root
    .getByRole("button", { name: "Compare AFTER", exact: true })
    .click();
  await expect(root.locator(".cracking-formulas")).toContainText(
    "C₄H₁₀ + C₂H₄",
  );
  await expect(root.locator("canvas")).toHaveCount(0);
  await capture(page, `docs/qa/cracking-${info.project.name}-fallback.png`);
});
