import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { alcoholJourney as journey } from "../src/content/journeys/alcohols";
import { alcoholRecords, type AlcoholMode } from "../src/lib/alcohols";
import { expectedAlcoholBoard } from "../src/lib/alcohol-board";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/alcohols-and-acids";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function task(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.count()) {
    await picker.selectOption(String(n - 1));
    return;
  }
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
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
async function fillModel(root: Locator, mode: AlcoholMode, id: string) {
  const e = expectedAlcoholBoard(mode, id);
  for (const [k, v] of Object.entries(e)) {
    if (k === "record" || v === "" || k === "estimate" || /^c\d+$/.test(k))
      continue;
    if (/^h\d+$/.test(k)) {
      const button = root.locator(`[data-h-slot="${k}"]`);
      if (
        (await button.getAttribute("aria-pressed")) !==
        (v === "yes" ? "true" : "false")
      )
        await button.click();
      continue;
    }
    if (k === "hydroxyl" || k === "oxygenH") {
      const button = root.getByRole("button", {
        name: k === "hydroxyl" ? /^Terminal C–O:/ : /^H on that O:/,
      });
      if (
        (await button.getAttribute("aria-pressed")) !==
        (v === "yes" ? "true" : "false")
      )
        await button.click();
      continue;
    }
    if (k === "reveal") {
      const button = root.getByRole("button", { name: /^Reveal original/ });
      if (await button.isEnabled()) await button.click();
      continue;
    }
    if (mode === "plot" && /^p\d+[xy]$/.test(k))
      await root
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption(k.match(/^p(\d+)/)![1]);
    const input = root.locator(`[id$="-${k}"]`);
    if ((await input.evaluate((e) => e.tagName)) === "SELECT")
      await input.selectOption(v);
    else await input.fill(v);
  }
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.organicDrawing) {
    const root = page.getByRole("region", {
        name: "Organic structure construction",
        exact: true,
      }),
      acid = q.prompt.includes("acid"),
      n = q.prompt.includes("methano")
        ? 1
        : q.prompt.includes("methanol")
          ? 1
          : q.prompt.includes("propan")
            ? 3
            : q.prompt.includes("butan")
              ? 4
              : 2;
    await root
      .getByLabel("Choose the number of carbon atoms in your scaffold")
      .selectOption(String(n));
    await root
      .getByRole("button", { name: /^Terminal C–O attachment:/ })
      .click();
    await root.getByRole("button", { name: /^H attached to that O:/ }).click();
    if (acid)
      await root
        .getByLabel("Separate terminal C–O connection and bond order")
        .selectOption("2");
    for (let c = 0; c < n; c++) {
      const other =
        (c > 0 ? 1 : 0) +
        (c < n - 1 ? 1 : 0) +
        (c === n - 1 ? 1 + (acid ? 2 : 0) : 0);
      for (let slot = 0; slot < 4 - other; slot++)
        await root.locator(`[data-h-slot="h${4 * c + slot}"]`).click();
    }
  } else if (q.fuelDrawing) {
    const root = page.getByRole("region", {
      name: "Independent fuel graph construction",
      exact: true,
    });
    for (let i = 0; i < q.fuelDrawing.data.points.length; i++) {
      await root
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption(String(i));
      await root
        .locator(`[id$="-p${i}x"]`)
        .fill(String(q.fuelDrawing.data.points[i][0]));
      await root
        .locator(`[id$="-p${i}y"]`)
        .fill(String(q.fuelDrawing.data.points[i][1]));
    }
    await root
      .getByRole("button", { name: "Edit your fit curve", exact: true })
      .click();
    for (let i = 0; i < q.fuelDrawing.data.points.length; i++) {
      await root
        .getByLabel("Choose the observation to plot or curve height to edit", {
          exact: true,
        })
        .selectOption(String(i));
      await root
        .locator(`[id$="-c${i}"]`)
        .fill(String(q.fuelDrawing.data.points[i][1]));
    }
    await root.locator('[id$="-estimate"]').fill("40.3");
    await expect(
      root.locator('[data-fit-extrapolation="your-proposal"]'),
    ).toBeVisible();
  } else if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
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
for (const [mode, index] of (
  [
    "structure",
    "reaction",
    "combustion",
    "fermentation",
    "fuel",
    "plot",
  ] as AlcoholMode[]
).map((m, i) => [m, i] as const))
  test(
    mode +
      ": every original comparison keeps wrong work across reload and accepts its own scientific proposal",
    async ({ page }, info) => {
      test.setTimeout(180000);
      await page.goto(route);
      await page.getByRole("button", { name: "Learn", exact: true }).click();
      await task(page, index + 1);
      const root = page.getByRole("region", {
        name: "Task model",
        exact: true,
      });
      for (const id of Object.keys(alcoholRecords[mode])) {
        await comparison(root, id);
        await fillModel(root, mode, id);
        const key =
            mode === "structure"
              ? "hTotal"
              : mode === "reaction"
                ? "gas"
                : mode === "combustion"
                  ? "oxygen"
                  : mode === "fermentation"
                    ? "stage"
                    : mode === "fuel"
                      ? id === "equalEnergy"
                        ? "mass"
                        : "massA"
                      : "p0y",
          e = expectedAlcoholBoard(mode, id),
          input = root.locator(`[id$="-${key}"]`),
          wrong =
            mode === "reaction"
              ? "oxygen"
              : mode === "fermentation"
                ? "combustion"
                : "99";
        if (mode === "plot")
          await root
            .getByLabel(
              "Choose the observation to plot or curve height to edit",
            )
            .selectOption("0");
        if (["reaction", "fermentation"].includes(mode))
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
        if (["reaction", "fermentation"].includes(mode))
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
        if (id === "initial") {
          await capture(
            page,
            `docs/qa/alcohols-${info.project.name}-${mode}.png`,
          );
          await root.screenshot({
            path: `docs/qa/alcohols-${info.project.name}-${mode}-model.png`,
          });
          if (mode === "structure") {
            await expect(
              root.locator('.alcohol-canvas[data-state="ready"]'),
            ).toBeVisible();
            const download = page.waitForEvent("download");
            await root
              .getByRole("button", { name: "Download 3D asset", exact: true })
              .click();
            await (
              await download
            ).saveAs(`docs/qa/alcohols-${info.project.name}.glb`);
          }
        }
      }
      await root
        .getByRole("button", { name: "Reset model", exact: true })
        .click();
      await saved(page);
      await page.reload();
      await comparison(root, "initial");
      await expect(
        root.getByLabel("Supplied comparison", { exact: true }),
      ).toHaveValue("initial");
    },
  );
test("all45 practice demands retain honest drawn and written self-review", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    await task(page, i + 1);
    const q = journey.practice[i];
    await answer(page, q);
    await page
      .getByRole("button", {
        name: q.rubric
          ? q.fuelDrawing
            ? "Save and review graph"
            : q.organicDrawing
              ? "Save and review structure"
              : "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    if (q.rubric)
      await expect(page.locator(".sample-task-answer .feedback")).toContainText(
        q.fuelDrawing
          ? "Compare your graph"
          : q.organicDrawing
            ? "Compare your structure"
            : "Compare your explanation",
      );
    else
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toBeVisible();
    if (i === 0 || q.fuelDrawing)
      await capture(
        page,
        `docs/qa/alcohols-${info.project.name}-independent-${q.fuelDrawing ? "graph" : "structure"}.png`,
      );
  }
});
test("reserved checks defer all feedback and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await answer(page, journey.practice[0]);
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
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
      await answer(page, journey.checkForms[form][i]);
      if (i === 0) {
        await saved(page);
        await page.reload();
        await expect(
          page
            .getByRole("region", { name: "Organic structure construction" })
            .getByLabel("Choose the number of carbon atoms in your scaffold"),
        ).toHaveValue("2");
        await capture(
          page,
          `docs/qa/alcohols-${info.project.name}-cold-${form}-drawing.png`,
        );
      }
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if (form === 0 && i === 0)
        await expect
          .poll(() =>
            page.evaluate(
              (key) =>
                JSON.parse(localStorage.getItem(key)!).work[
                  "alcohols-and-acids"
                ].run.responses["alc-v1-a-draw"]?.fresh,
              STORAGE_KEY,
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
    const firstResult = page.locator(".result-row").first();
    await firstResult.locator("summary").click();
    const sealed = firstResult.getByRole("region", {
      name: "Organic structure construction",
      exact: true,
    });
    await expect(sealed).toBeVisible();
    for (const control of await sealed.locator("button,input,select").all())
      await expect(control).toBeDisabled();
    await sealed.screenshot({
      path: `docs/qa/alcohols-${info.project.name}-submitted-${form}-drawing.png`,
    });
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
      for (const run of p.work["alcohols-and-acids"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["alcohols-and-acids"].run.submitted = Date.now() - delay - 1000;
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

test("raw numeric edits, exact global scaling and pointer coordinate pairs preserve model history", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 5);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await root.locator('[id$="-massA"]').fill("1.2");
  await root.locator('[id$="-massA"]').fill("1.");
  await root.locator('[id$="-riseA"]').fill("12");
  await expect(root.locator('[id$="-massA"]')).toHaveValue("1.");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-massA"]')).toHaveValue("1.2");
  await expect(root.locator('[id$="-riseA"]')).toHaveValue("12");
  await saved(page);
  await page.reload();
  await expect(root.locator('[id$="-riseA"]')).toHaveValue("12");
  await task(page, 3);
  await fillModel(root, "combustion", "initial");
  await root
    .getByRole("button", { name: "Double ALL coefficients", exact: true })
    .click();
  await expect(root.locator('[id$="-fuel"]')).toHaveValue("4");
  await expect(root.locator('[id$="-oxygen"]')).toHaveValue("6");
  await root
    .getByRole("button", {
      name: "Halve ALL coefficients, if whole",
      exact: true,
    })
    .click();
  await expect(root.locator('[id$="-fuel"]')).toHaveValue("2");
  await task(page, 6);
  const plot = root.getByRole("region", {
    name: "Fuel graph with fixed original scales",
  });
  await plot.focus();
  await plot.press("ArrowUp");
  await expect(root.locator('[id$="-p0x"]')).toHaveValue("1");
  await expect(root.locator('[id$="-p0y"]')).toHaveValue("28.2");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-p0x"]')).toHaveValue("");
  await fillModel(root, "plot", "initial");
  await root
    .getByLabel("Choose the observation to plot or curve height to edit", {
      exact: true,
    })
    .selectOption("0");
  const beforePan = await root.locator('[id$="-p0x"]').inputValue(),
    canPan = await plot.evaluate((el) => el.scrollWidth > el.clientWidth);
  await plot.press("Shift+ArrowRight");
  if (canPan)
    expect(await plot.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(root.locator('[id$="-p0x"]')).toHaveValue(beforePan);
  await plot.press("Shift+ArrowLeft");
  expect(await plot.evaluate((el) => el.scrollLeft)).toBe(0);
  const svg = plot.locator("svg"),
    box = (await svg.boundingBox())!;
  await expect(svg.locator('[data-minor-grid="x"]')).toHaveCount(28);
  await expect(svg.locator('[data-minor-grid="y"]')).toHaveCount(32);
  await svg.click({
    position: {
      x: ((100 + ((2.05 - 1) / 7) * 520) / 650) * box.width,
      y: ((335 - ((30.1 - 28) / 16) * 300) / 450) * box.height,
    },
  });
  const proposedX = await root.locator('[id$="-p0x"]').inputValue(),
    proposedY = await root.locator('[id$="-p0y"]').inputValue();
  expect(Number(proposedX)).toBeGreaterThan(2);
  expect(Number(proposedX)).toBeLessThanOrEqual(2.1);
  expect(Number(proposedY)).toBeGreaterThan(30);
  expect(Number(proposedY)).toBeLessThanOrEqual(30.2);
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.correct")).toBeVisible();
  await expect(root.locator('[id$="-p0x"]')).toHaveValue(proposedX);
  await expect(root.locator('[id$="-p0y"]')).toHaveValue(proposedY);
  await saved(page);
  await page.reload();
  await expect(root.locator('[id$="-p0x"]')).toHaveValue(proposedX);
  await expect(root.locator('[id$="-p0y"]')).toHaveValue(proposedY);
  await expect(root.locator('[id$="-p0x"]')).not.toHaveValue("");
  await expect(root.locator('[id$="-p0y"]')).not.toHaveValue("");
});
test("independent hidden H/O choices survive scaffold changes and clear is genuinely blank", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const root = page.getByRole("region", {
      name: "Organic structure construction",
      exact: true,
    }),
    n = root.getByLabel("Choose the number of carbon atoms in your scaffold");
  await n.selectOption("4");
  await root.locator('[data-h-slot="h15"]').click();
  await root.getByRole("button", { name: /^H attached to that O:/ }).click();
  await n.selectOption("1");
  await saved(page);
  await page.reload();
  await n.selectOption("4");
  await expect(root.locator('[data-h-slot="h15"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    root.getByRole("button", { name: /^H attached to that O:/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await root
    .getByRole("button", {
      name: "Clear this organic construction",
      exact: true,
    })
    .click();
  await expect(n).toHaveValue("");
  await expect(root.locator("[data-h-slot]")).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(n).toHaveValue("");
  await answer(page, journey.practice[0]);
  await root.locator('[data-h-slot="h3"]').click();
  await page
    .getByRole("button", { name: "Save and review structure", exact: true })
    .click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "Compare your structure",
  );
  await root.screenshot({
    path: `docs/qa/alcohols-${info.project.name}-retained-extra-h.png`,
  });
});
test("short-screen opening and WebGL fallback preserve the complete first control and original evidence", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 664 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const root = page.getByRole("region", { name: "Task model", exact: true }),
    first = root.getByRole("button", { name: /^Terminal C–O:/ }),
    box = await first.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  if (info.project.name === "mobile")
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  await fillModel(root, "structure", "initial");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.correct")).toBeVisible();
  await expect(
    root.getByRole("button", { name: "Download 3D asset", exact: true }),
  ).toBeDisabled();
  await capture(page, `docs/qa/alcohols-${info.project.name}-fallback.png`);
});

test("damaged saved structures and fuel graphs preserve original bytes until explicit scoped replacement", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await saved(page);
  const bad = "{original damaged drawing";
  await page.evaluate(
    ({ key, bad }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["alcohols-and-acids"].drafts["alc-v1-p-methanol"] = bad;
      p.work["alcohols-and-acids"].drafts["alc-v1-p-ethanol"] =
        "keep this original sibling";
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, bad },
  );
  await page.reload();
  await expect(
    page.getByText(
      "Your saved drawing cannot be displayed in the current format. Its original answer is retained.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["alcohols-and-acids"]
          .drafts["alc-v1-p-methanol"],
      STORAGE_KEY,
    ),
  ).toBe(bad);
  await page
    .getByRole("button", {
      name: "Start a new organic construction",
      exact: true,
    })
    .click();
  await saved(page);
  await expect(
    page
      .getByRole("region", { name: "Organic structure construction" })
      .getByLabel("Choose the number of carbon atoms in your scaffold"),
  ).toHaveValue("");
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["alcohols-and-acids"]
          .drafts["alc-v1-p-ethanol"],
      STORAGE_KEY,
    ),
  ).toBe("keep this original sibling");
  const i = journey.practice.findIndex((q) => q.fuelDrawing);
  await task(page, i + 1);
  await saved(page);
  await page.evaluate(
    ({ key, bad }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["alcohols-and-acids"].drafts["alc-v1-p-plot"] = bad;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, bad },
  );
  await page.reload();
  await expect(
    page.getByText(
      "Your saved fuel plot cannot be displayed in the current format. Its original response is retained.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["alcohols-and-acids"]
          .drafts["alc-v1-p-plot"],
      STORAGE_KEY,
    ),
  ).toBe(bad);
  await page
    .getByRole("button", { name: "Start a new fuel plot", exact: true })
    .click();
  await saved(page);
  const graph = page.getByRole("region", {
    name: "Independent fuel graph construction",
  });
  await expect(graph.locator('[data-plot-field="p0x"]')).toHaveValue("");
  await expect(graph.locator('[data-plot-field="p0y"]')).toHaveValue("");
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work["alcohols-and-acids"]
          .drafts["alc-v1-p-ethanol"],
      STORAGE_KEY,
    ),
  ).toBe("keep this original sibling");
});
