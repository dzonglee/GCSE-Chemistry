import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { crudeOilJourney as journey } from "../src/content/journeys/crude-oil";
import {
  oilRecords,
  oilInventories,
  oilTrends,
  oilTraces,
  type OilMode,
} from "../src/lib/crude-oil";
import { expectedOilBoard } from "../src/lib/crude-oil-board";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const route = "/lessons/crude-oil-and-fractions";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
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
  if (q.oilBarDrawing) {
    const root = page.getByRole("region", {
        name: "Percentage chart construction",
        exact: true,
      }),
      d = q.oilBarDrawing;
    await root
      .getByLabel("Your major interval / percentage points", { exact: true })
      .fill(String(d.max / d.intervals));
    expect(
      (await root.locator("svg").boundingBox())!.width,
    ).toBeLessThanOrEqual(420);
    await root.locator("svg").evaluate((node) => {
      for (const t of node.querySelectorAll("text")) {
        const m = (t as SVGTextElement).getScreenCTM()!;
        if (
          parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b) <
          12
        )
          throw Error("Unreadable independent chart label");
      }
    });
    for (const [i, source] of ["A", "B"].entries()) {
      await root
        .getByLabel("Choose source bar", { exact: true })
        .selectOption(source);
      await root
        .getByLabel("Selected bar height / %", { exact: true })
        .fill(String(d.percentages[i]));
      await root
        .getByRole("button", { name: "Place selected bar", exact: true })
        .click();
    }
  } else if (q.rubric)
    await page.getByLabel("Your explanation", { exact: true }).fill(q.answer);
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function learn(page: Page, n: number) {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, n);
}
test("reserved checks defer marking, retain drafts and separate actual seven-day retrieval", async ({
  page,
}, info) => {
  await page.goto("/lessons/crude-oil-and-fractions");
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
          page.getByLabel("Your answer", { exact: true }),
        ).toHaveValue(q.answer);
      }
      if (
        (form === 0 && i === 0) ||
        (form === 0 && i === 2) ||
        (form === 0 && i === 3) ||
        (form === 1 && i === 1) ||
        q.oilBarDrawing
      )
        await capture(
          page,
          "docs/qa/crude-oil-and-fractions-" +
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
      if (q.oilBarDrawing) {
        const chart = page.getByRole("region", {
          name: "Percentage chart construction",
          exact: true,
        });
        await page.screenshot({
          path: `docs/qa/crude-oil-${info.project.name}-independent-form-${form}-chart.png`,
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
                  "crude-oil-and-fractions"
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
          JSON.parse(localStorage.getItem(key)!).work["crude-oil-and-fractions"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["crude-oil-and-fractions"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["crude-oil-and-fractions"].run.submitted =
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

test("all original practice works while written responses remain self-reviewed", async ({
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
                "crude-oil-and-fractions"
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
async function comparison(root: ReturnType<Page["getByRole"]>, id: string) {
  await root.locator("details summary").click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption(id);
  await root.locator("details summary").click();
}
async function construct(page: Page, mode: OilMode, id: string) {
  const root = page.getByRole("region", { name: "Task model", exact: true }),
    e = expectedOilBoard(mode, id);
  if (mode === "inventory")
    for (let i = 0; i < oilInventories[id].components.length; i++) {
      const button = root.locator(`[data-component="${i}"]`);
      if (
        (await button.getAttribute("aria-pressed")) !==
        (e["include" + i] === "yes" ? "true" : "false")
      )
        await button.click();
    }
  if (mode === "trends")
    for (let place = 0; place < 4; place++) {
      const index = Number(e["order" + place]),
        label = oilTrends[id].sizes[index].label;
      let order = await root
        .locator("[data-order-index]")
        .evaluateAll((nodes) =>
          nodes.map((n) => Number((n as HTMLElement).dataset.orderIndex)),
        );
      while (order.indexOf(index) > place) {
        await root
          .getByRole("button", { name: `Move ${label} earlier`, exact: true })
          .click();
        order = await root
          .locator("[data-order-index]")
          .evaluateAll((nodes) =>
            nodes.map((n) => Number((n as HTMLElement).dataset.orderIndex)),
          );
      }
    }
  for (const [key, v] of Object.entries(e)) {
    if (
      ["record", "step", "selected"].includes(key) ||
      /^(include|order|drawn|placed)/.test(key)
    )
      continue;
    const input = root.locator(`[id$="-${key}"]`);
    if (await input.evaluate((x) => x.tagName === "SELECT"))
      await input.selectOption(v);
    else await input.fill(v);
  }
  if (mode === "yield")
    for (const source of ["A", "B"]) {
      await root
        .getByLabel("Choose source bar", { exact: true })
        .selectOption(source);
      await root
        .getByRole("button", { name: "Place selected bar", exact: true })
        .click();
    }
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.correct")).toBeVisible();
  return root;
}
for (const [mode, n] of [
  ["inventory", 1],
  ["column", 2],
  ["trace", 3],
  ["trends", 4],
  ["uses", 5],
  ["yield", 6],
] as [OilMode, number][])
  test(`${mode}: all six records support real construction, saved wrong predictions, correction, readable controls and original reset`, async ({
    page,
  }, info) => {
    if (info.project.name === "mobile")
      await page.setViewportSize({ width: 320, height: 844 });
    await learn(page, n);
    const root = page.getByRole("region", { name: "Task model", exact: true });
    for (const id of Object.keys(oilRecords[mode])) {
      await comparison(root, id);
      await construct(page, mode, id);
      const key = {
          inventory: "compounds",
          column: "gradient",
          trace: "identity",
          trends: "explanation",
          uses: "category",
          yield: "massA",
        }[mode],
        e = expectedOilBoard(mode, id);
      const wrong = {
        inventory: String(Number(e[key]) + 1),
        column: "hotterUp",
        trace: "broken",
        trends: "covalentBroken",
        uses: e[key] === "fuel" ? "material" : "fuel",
        yield: String(Number(e[key]) + 1),
      }[mode];
      const field = root.locator(`[id$="-${key}"]`);
      if (await field.evaluate((x) => x.tagName === "SELECT"))
        await field.selectOption(wrong);
      else await field.fill(wrong);
      await root
        .getByRole("button", { name: "Check model", exact: true })
        .click();
      await expect(root.locator(".feedback.incorrect")).toBeVisible();
      await saved(page);
      await page.reload();
      await expect(field).toHaveValue(wrong);
      await comparison(root, id);
      await expect(field).toHaveValue(wrong);
      if (await field.evaluate((x) => x.tagName === "SELECT"))
        await field.selectOption(e[key]);
      else await field.fill(e[key]);
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
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      for (const svg of await root.locator("svg").all())
        await svg.evaluate((node) => {
          const svg = node as SVGSVGElement;
          for (const t of svg.querySelectorAll("text")) {
            const box = t.getBBox(),
              m = t.getScreenCTM()!,
              f = parseFloat(getComputedStyle(t).fontSize);
            if (f * Math.hypot(m.a, m.b) < 12)
              throw Error("Small label " + t.textContent);
            if (
              box.x < 0 ||
              box.y < 0 ||
              box.x + box.width > svg.viewBox.baseVal.width ||
              box.y + box.height > svg.viewBox.baseVal.height
            )
              throw Error("Clipped label " + t.textContent);
          }
        });
      if (id === "initial") {
        await answer(page, journey.guided[n - 1]);
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await expect(
          page.locator(".sample-task-answer .feedback.correct"),
        ).toBeVisible();
        if (mode === "trace") {
          for (let station = 1; station <= 6; station++)
            await root
              .getByRole("button", { name: "Next station", exact: true })
              .click();
          await expect(
            root.locator('.oil-canvas[data-state="ready"]'),
          ).toBeVisible();
          const download = page.waitForEvent("download");
          await root
            .getByRole("button", { name: "Download 3D asset", exact: true })
            .click();
          await (
            await download
          ).saveAs(`docs/qa/crude-oil-${info.project.name}.glb`);
        }
        await capture(
          page,
          `docs/qa/crude-oil-${info.project.name}-${mode}.png`,
        );
        await page.screenshot({
          path: `docs/qa/crude-oil-${info.project.name}-${mode}-model.png`,
          fullPage: true,
          clip: (await root.boundingBox())!,
          scale: "css",
        });
      }
      await root.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(root.locator(".feedback.correct")).toHaveCount(0);
    }
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await comparison(root, "initial");
    await root
      .getByRole("button", { name: "Check model", exact: true })
      .click();
    await expect(root.locator(".feedback.incorrect")).toBeVisible();
  });
test("multiple raw invalid predictions do not prevent a different legitimate field from committing; Undo discards raw before saved history", async ({
  page,
}) => {
  await learn(page, 1);
  const root = await construct(page, "inventory", "initial");
  await root.locator('[id$="-compounds"]').fill("1/2");
  await root.locator('[id$="-hydrocarbons"]').fill("01");
  await root.locator('[id$="-purity"]').selectOption("pure");
  await expect(root.locator('[id$="-compounds"]')).toHaveValue("1/2");
  await expect(root.locator('[id$="-hydrocarbons"]')).toHaveValue("01");
  await saved(page);
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-compounds"]')).toHaveValue("4");
  await expect(root.locator('[id$="-purity"]')).toHaveValue("pure");
  await page.reload();
  await expect(root.locator('[id$="-purity"]')).toHaveValue("pure");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(root.locator('[id$="-purity"]')).toHaveValue("mixture");
});
test("yield bars retain their last placed height during pending edits and support keyboard and chart taps", async ({
  page,
}) => {
  await learn(page, 6);
  const root = await construct(page, "yield", "initial");
  await root.locator('[id$="-barA"]').fill("17");
  await expect(root.locator('[data-bar-source="A"]')).toHaveAttribute(
    "data-bar-value",
    "18",
  );
  await root.getByLabel("Choose source bar", { exact: true }).selectOption("A");
  await root
    .getByRole("button", { name: "Place selected bar", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(root.locator('[data-bar-source="A"]')).toHaveAttribute(
    "data-bar-value",
    "17",
  );
  const svg = root.locator("svg"),
    box = (await svg.boundingBox())!;
  await svg.click({
    position: { x: (180 / 420) * box.width, y: (160 / 300) * box.height },
  });
  await expect(root.locator('[id$="-barA"]')).toHaveValue("20");
  await expect(root.locator('[data-bar-source="A"]')).toHaveAttribute(
    "data-bar-value",
    "17",
  );
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-bar-source="A"]')).toHaveAttribute(
    "data-bar-value",
    "17",
  );
});
test("all tracer stations preserve formula and stop collected liquid while gas exits and residue remains; real canvas supports keyboard rotation", async ({
  page,
}) => {
  await learn(page, 3);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  for (const id of Object.keys(oilRecords.trace)) {
    await comparison(root, id);
    for (let step = 1; step <= 6; step++) {
      await root
        .getByRole("button", { name: "Next station", exact: true })
        .click();
      await expect(
        root.locator('.oil-canvas[data-state="ready"]'),
      ).toBeVisible();
      const status = root.locator('p[aria-live="polite"]');
      await expect(status).toContainText(oilTraces[id].formula);
      const tray = Number(expectedOilBoard("trace", id).tray);
      if (tray > 0 && step >= tray)
        await expect(status).toContainText("does not continue rising");
    }
    const scene = root.locator(".oil-canvas"),
      canvas = root.locator("canvas"),
      dims = await canvas.evaluate((c) => ({
        w: c.getBoundingClientRect().width,
        parent: c.parentElement!.getBoundingClientRect().width,
        pixels: (c as HTMLCanvasElement).width,
        dpr: Math.min(devicePixelRatio, 2),
      }));
    expect(Math.abs(dims.w - dims.parent)).toBeLessThan(1);
    expect(Math.abs(dims.pixels - dims.parent * dims.dpr)).toBeLessThanOrEqual(
      1,
    );
    await scene.focus();
    await page.keyboard.press("ArrowRight");
    await expect(scene).toBeFocused();
  }
  await root.getByRole("button", { name: "Hide 3D", exact: true }).click();
  await expect(root.locator("canvas")).toHaveCount(0);
  await root.getByRole("button", { name: "Show 3D", exact: true }).click();
  await expect(root.locator('.oil-canvas[data-state="ready"]')).toBeVisible();
});
test("independent drawn drafts preserve invalid pending entries without moving placed bars and receive only honest self-review", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  const form = journey.checkForms[0],
    index = form.findIndex((q) => q.oilBarDrawing);
  for (let i = 0; i < index; i++) {
    await answer(page, form[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
  }
  await answer(page, form[index]);
  const root = page.getByRole("region", {
    name: "Percentage chart construction",
    exact: true,
  });
  await root.getByLabel("Selected bar height / %", { exact: true }).fill("1/2");
  await saved(page);
  await page.reload();
  await expect(
    root.getByLabel("Selected bar height / %", { exact: true }),
  ).toHaveValue("1/2");
  await expect(root.locator('[data-bar-source="B"]')).toHaveAttribute(
    "data-bar-value",
    String(form[index].oilBarDrawing!.percentages[1]),
  );
  await expect(
    root.getByRole("button", { name: "Place selected bar", exact: true }),
  ).toBeDisabled();
  await capture(
    page,
    `docs/qa/crude-oil-${info.project.name}-independent-drawing-raw.png`,
  );
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  for (let i = index + 1; i < form.length; i++) {
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
    await answer(page, form[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "6 of 6 correct", exact: true }),
  ).toBeVisible();
  const result = page.locator(".result-row").last();
  await result.locator("summary").click();
  await expect(result.locator("summary")).toContainText("Self-review");
  await expect(result).toContainText("Major interval: 10 percentage points");
  await expect(result).toContainText("source B: 47% placed");
  const chart = result.getByRole("region", {
    name: "Percentage chart construction",
    exact: true,
  });
  await expect(
    chart.getByLabel("Selected bar height / %", { exact: true }),
  ).toHaveValue("1/2");
  for (const field of await chart.locator("input,select,button").all())
    await expect(field).toBeDisabled();
  await capture(
    page,
    `docs/qa/crude-oil-${info.project.name}-completed-chart-review.png`,
  );
});
test("WebGL failure retains original temperature trace, predictions and saved wrong identity", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      return ["webgl", "webgl2", "experimental-webgl"].includes(type)
        ? null
        : original.call(this, type, ...(args as []));
    } as typeof original;
  });
  await learn(page, 3);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await expect(
    root.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await root.locator('[id$="-identity"]').selectOption("broken");
  await saved(page);
  await page.reload();
  await expect(root.locator('[id$="-identity"]')).toHaveValue("broken");
  await expect(root.locator("svg")).toBeVisible();
  await capture(page, `docs/qa/crude-oil-${info.project.name}-fallback.png`);
});
test("the first genuine chemical manipulation fits the initial desktop and small-mobile viewport", async ({
  page,
}, info) => {
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 320, height: 664 }
      : { width: 1280, height: 720 },
  );
  await learn(page, 1);
  await page.evaluate(() => {
    scrollTo(0, 0);
  });
  const button = page
      .getByRole("region", { name: "Task model", exact: true })
      .locator('[data-component="0"]'),
    box = (await button.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(
    info.project.name === "mobile" ? 664 : 720,
  );
});
