import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { alkanesJourney as journey } from "../src/content/journeys/alkanes";
import {
  alkaneRecords,
  attachmentRequired,
  type AlkaneMode,
} from "../src/lib/alkanes";
import { expectedAlkaneBoard } from "../src/lib/alkane-board";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/alkanes-and-combustion";
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
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.alkaneDrawing) {
    const root = page.getByRole("region", {
        name: "Molecular structure construction",
      }),
      n = q.prompt.includes("methane")
        ? 1
        : q.prompt.includes("ethane")
          ? 2
          : q.prompt.includes("propane")
            ? 3
            : 4;
    await root
      .getByLabel("Choose the number of carbon atoms in your scaffold")
      .selectOption(String(n));
    for (let c = 0; c < n; c++)
      for (let slot = 0; slot < 4; slot++)
        if (attachmentRequired(n, c, slot))
          await root.locator(`[data-h-slot="h${c * 4 + slot}"]`).click();
  } else if (q.writtenEquations)
    await page
      .getByLabel(q.shortWritten ? "Your answer" : "Your equations", {
        exact: true,
      })
      .fill(q.answer);
  else if (q.rubric)
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
  [
    "kit",
    "formula",
    "classify",
    "equation",
    "oxygen",
    "evidence",
  ] as AlkaneMode[]
).map((m, i) => [m, i + 1] as const))
  test(
    mode +
      " retains individually supplied wrong proposals across reload and has readable accessible controls",
    async ({ page }, info) => {
      await page.goto(route);
      await page.getByRole("button", { name: "Learn", exact: true }).click();
      await task(page, index);
      const root = page.getByRole("region", { name: "Task model" });
      for (const id of Object.keys(alkaneRecords[mode])) {
        await comparison(root, id);
        const e = expectedAlkaneBoard(mode, id);
        for (const [k, v] of Object.entries(e)) {
          if (k === "record") continue;
          if (/^h\d+$/.test(k)) {
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
            mode === "kit"
              ? "hydrogens"
              : mode === "formula"
                ? "twice"
                : mode === "classify"
                  ? "carbons"
                  : mode === "equation"
                    ? "oxygen"
                    : mode === "oxygen"
                      ? "used"
                      : "coEffect",
          wrong = mode === "evidence" ? "smellWarns" : "99",
          input = root.locator(`[id$="-${key}"]`);
        if (mode === "evidence") await input.selectOption(wrong);
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
        if (mode === "evidence") await input.selectOption(e[key]);
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
        if (mode === "kit")
          await expect(
            root.locator('.alkane-canvas[data-state="ready"]'),
          ).toBeVisible();
        if (id === "initial") {
          await capture(
            page,
            `docs/qa/alkanes-${info.project.name}-${mode}.png`,
          );
          await page.screenshot({
            fullPage: true,
            clip: (await root.boundingBox())!,
            path: `docs/qa/alkanes-${info.project.name}-${mode}-model.png`,
            scale: "css",
          });
          if (mode === "kit") {
            const download = page.waitForEvent("download");
            await root
              .getByRole("button", { name: "Download 3D asset", exact: true })
              .click();
            await (
              await download
            ).saveAs(`docs/qa/alkanes-${info.project.name}.glb`);
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
test("all 38 practice demands retain honest structure and written review", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    const q = journey.practice[i];
    await task(page, i + 1);
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.writtenEquations
          ? "Save and review equations"
          : q.rubric
            ? "Save and review explanation"
            : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.locator(".sample-task-answer .feedback")).toContainText(
      q.writtenEquations
        ? "Compare your equations"
        : q.rubric
          ? "Compare your explanation"
          : "right",
    );
  }
  await saved(page);
  const results = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).work["alkanes-and-combustion"]
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
  await page.goto("/lessons/alkanes-and-combustion");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 2);
  await answer(page, journey.practice[1]);
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
      await answer(page, q);
      if (form === 0 && i === 2) {
        await saved(page);
        await page.reload();
        await expect(
          page
            .getByRole("region", { name: "Molecular structure construction" })
            .getByLabel("Choose the number of carbon atoms in your scaffold"),
        ).toHaveValue("3");
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1) ||
        q.alkaneDrawing
      )
        await capture(
          page,
          "docs/qa/alkanes-and-combustion-" +
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
      if (q.alkaneDrawing) {
        const chart = page.getByRole("region", {
          name: "Molecular structure construction",
          exact: true,
        });
        await page.screenshot({
          path: `docs/qa/alkanes-${info.project.name}-independent-form-${form}-drawing.png`,
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
                  "alkanes-and-combustion"
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
          JSON.parse(localStorage.getItem(key)!).work["alkanes-and-combustion"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["alkanes-and-combustion"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["alkanes-and-combustion"].run.submitted =
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
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});

test("molecular response retains an over-bonded draft, hidden choices while submitted review remains disabled", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < 2; i++) {
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  const drawing = page.getByRole("region", {
      name: "Molecular structure construction",
    }),
    count = drawing.getByLabel(
      "Choose the number of carbon atoms in your scaffold",
    );
  await expect(count).toHaveValue("");
  await count.selectOption("4");
  await drawing.locator('[data-h-slot="h15"]').click();
  await count.selectOption("3");
  for (const key of ["h4", "h5", "h6"])
    await drawing.locator(`[data-h-slot="${key}"]`).click();
  await saved(page);
  await page.reload();
  await expect(count).toHaveValue("3");
  await expect(drawing.locator('[data-h-slot="h6"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await count.selectOption("4");
  await expect(drawing.locator('[data-h-slot="h15"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await capture(
    page,
    `docs/qa/alkanes-${info.project.name}-retained-wrong-drawing.png`,
  );
  await count.selectOption("3");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  for (let i = 3; i < 8; i++) {
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await page
    .locator("summary")
    .filter({ hasText: journey.checkForms[0][2].prompt })
    .click();
  const reviewed = page.getByRole("region", {
    name: "Molecular structure construction",
  });
  await expect(
    reviewed.getByLabel("Choose the number of carbon atoms in your scaffold"),
  ).toBeDisabled();
  for (const button of await reviewed.getByRole("button").all())
    await expect(button).toBeDisabled();
  await expect(
    page
      .locator("details[open] summary")
      .getByText("Self-review", { exact: true }),
  ).toBeVisible();
  await capture(
    page,
    `docs/qa/alkanes-${info.project.name}-completed-structure-review.png`,
  );
});

test("unavailable WebGL preserves actual displayed bonds and editable attachments", async ({
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
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const root = page.getByRole("region", { name: "Task model" });
  await expect(
    root.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await root.locator('[data-h-slot="h0"]').click();
  await expect(root.locator('[data-attachment="h0"]')).toHaveAttribute(
    "data-placed",
    "yes",
  );
  await expect(root.locator("canvas")).toHaveCount(0);
  await capture(page, `docs/qa/alkanes-${info.project.name}-fallback.png`);
});

test("opening attachment is reachable on a short screen and keyboard edits retain one renderer", async ({
  page,
}, info) => {
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 320, height: 664 }
      : { width: 1280, height: 720 },
  );
  await page.goto(route);
  const root = page.getByRole("region", { name: "Task model" }),
    button = root.locator('[data-h-slot="h0"]');
  await expect(button).toBeVisible();
  const box = (await button.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(
    root.locator('.alkane-canvas[data-state="ready"]'),
  ).toBeVisible();
  const canvas = await root.locator("canvas").elementHandle();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(root.locator('[data-attachment="h0"]')).toHaveAttribute(
    "data-placed",
    "yes",
  );
  await expect(
    root.locator('.alkane-canvas[data-state="ready"]'),
  ).toBeVisible();
  expect(
    await root
      .locator("canvas")
      .evaluate((n, original) => n === original, canvas),
  ).toBe(true);
  await root.locator(".alkane-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await root.getByRole("button", { name: "Reset view", exact: true }).click();
  await capture(page, `docs/qa/alkanes-${info.project.name}-opening.png`);
});
