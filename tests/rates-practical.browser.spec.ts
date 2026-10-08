import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ratesPracticalJourney as journey } from "../src/content/journeys/rates-practical";
import {
  practicalRecords,
  practicalApparatus,
  type PracticalMode,
} from "../src/lib/rates-practical";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
import { expectedPracticalBoard } from "../src/lib/rates-practical-board";
const route = "/lessons/rates-practical";
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
  await page.screenshot({ path, fullPage: true });
}
async function answer(page: Page, q: (typeof journey.practice)[number]) {
  if (q.rubric)
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
  await page.goto("/lessons/rates-practical");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let form = 0; form < 2; form++) {
    for (let i = 0; i < 6; i++) {
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
        (form === 1 && i === 1)
      )
        await capture(
          page,
          "docs/qa/rates-practical-" +
            info.project.name +
            "-independent-form-" +
            form +
            "-task-" +
            i +
            ".png",
        );
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      if ((form === 0 && (i === 0 || i === 1)) || (form === 1 && i === 0))
        await expect
          .poll(() =>
            page.evaluate(
              ({ key, id }) =>
                JSON.parse(localStorage.getItem(key)!).work["rates-practical"]
                  .run.responses[id]?.fresh,
              { key: STORAGE_KEY, id: q.id },
            ),
          )
          .toBe(form === 0 && i === 1);
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
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["rates-practical"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await saved(page);
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      for (const run of p.work["rates-practical"].history)
        run.submitted = Date.now() - delay - 1000;
      p.work["rates-practical"].run.submitted = Date.now() - delay - 1000;
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
                "rates-practical"
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
async function construct(page: Page, mode: PracticalMode, id: string) {
  const root = page.getByRole("region", { name: "Task model", exact: true }),
    expected = expectedPracticalBoard(mode, id);
  for (const [k, v] of Object.entries(expected)) {
    if (k === "record" || k === "selected" || k.startsWith("placed")) continue;
    if (k === "fitView") {
      await root
        .getByRole("button", { name: "Show chosen fit preview", exact: true })
        .click();
      continue;
    }
    if (mode === "plot" && /^[xy]\d$/.test(k))
      await root
        .getByLabel("Choose point to construct", { exact: true })
        .selectOption(k.slice(1));
    const field = root.locator(`[id$="-${k}"]`);
    if (await field.evaluate((x) => x.tagName === "SELECT"))
      await field.selectOption(v);
    else await field.fill(v);
    if (mode === "plot" && k.startsWith("y"))
      await root
        .getByRole("button", { name: "Place selected point", exact: true })
        .click();
  }
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.correct")).toBeVisible();
  return root;
}
for (const [mode, n] of [
  ["plan", 1],
  ["apparatus", 2],
  ["dilution", 3],
  ["endpoint", 4],
  ["plot", 5],
  ["repeats", 6],
] as [PracticalMode, number][])
  test(`${mode}: six individual comparisons retain wrong work, meaningful construction, committed histories and readable representations`, async ({
    page,
  }, info) => {
    if (
      info.project.name === "mobile" &&
      ["plan", "endpoint", "plot", "repeats"].includes(mode)
    )
      await page.setViewportSize({ width: 320, height: 844 });
    await learn(page, n);
    const root = page.getByRole("region", { name: "Task model", exact: true }),
      model = journey.guided[n - 1].model!;
    if (model.kind !== "rates-practical")
      throw Error("Unexpected lesson model");
    for (const id of Object.keys(practicalRecords[mode])) {
      await root.locator("details summary").click();
      await root
        .getByLabel("Supplied comparison", { exact: true })
        .selectOption(id);
      await root.locator("details summary").click();
      await construct(page, mode, id);
      const key = (
          {
            plan: "hypothesis",
            apparatus: "reading",
            dilution: "water",
            endpoint: "sample",
            plot: "rate",
            repeats: "mean",
          } as Record<PracticalMode, string>
        )[mode],
        expected = expectedPracticalBoard(mode, id);
      if (mode === "plan")
        await root
          .locator(`[id$="-${key}"]`)
          .selectOption("higherConcentrationSlower");
      else
        await root
          .locator(`[id$="-${key}"]`)
          .fill(String(Number(expected[key]) + 1));
      await root
        .getByRole("button", { name: "Check model", exact: true })
        .click();
      await expect(root.locator(".feedback.incorrect")).toBeVisible();
      await saved(page);
      await page.reload();
      await expect(root.locator(`[id$="-${key}"]`)).toHaveValue(
        mode === "plan"
          ? "higherConcentrationSlower"
          : String(Number(expected[key]) + 1),
      );
      await root.locator("details summary").click();
      await root
        .getByLabel("Supplied comparison", { exact: true })
        .selectOption(id);
      await root.locator("details summary").click();
      await expect(root.locator(`[id$="-${key}"]`)).toHaveValue(
        mode === "plan"
          ? "higherConcentrationSlower"
          : String(Number(expected[key]) + 1),
      );
      if (mode === "plan")
        await root.locator(`[id$="-${key}"]`).selectOption(expected[key]);
      else await root.locator(`[id$="-${key}"]`).fill(expected[key]);
      await root
        .getByRole("button", { name: "Check model", exact: true })
        .click();
      await expect(root.locator(".feedback.correct")).toBeVisible();
      if (mode === "apparatus") {
        const record = practicalApparatus[id];
        if (record.method !== "mass") {
          const coordinate = record.method === "water" ? "y1" : "x1";
          const boundary = await root
            .locator("[data-scale-boundary]")
            .getAttribute(coordinate);
          const tick = await root
            .locator(`[data-scale-tick="${record.gasReading}"]`)
            .getAttribute(coordinate);
          expect(Number(boundary)).toBe(Number(tick));
        }
      }
      if (mode === "plan") {
        const table = root.getByRole("region", {
          name: "Proposed comparison conditions",
          exact: true,
        });
        await table.focus();
        await expect(table).toBeFocused();
        if (info.project.name === "mobile")
          expect(
            await table.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
          ).toBe(true);
      }
      for (const button of await root.getByRole("button").all())
        expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      for (const svg of await root.locator("svg").all())
        await svg.evaluate((node) => {
          const svg = node as SVGSVGElement;
          for (const t of svg.querySelectorAll("text")) {
            const b = t.getBBox(),
              m = t.getScreenCTM()!,
              f = parseFloat(getComputedStyle(t).fontSize);
            if (f * Math.hypot(m.a, m.b) < 12)
              throw Error("Small label " + t.textContent);
            if (
              b.x < 0 ||
              b.y < 0 ||
              b.x + b.width > svg.viewBox.baseVal.width ||
              b.y + b.height > svg.viewBox.baseVal.height
            )
              throw Error("Clipped label " + t.textContent);
          }
        });
      if (id === model.record) {
        await answer(page, journey.guided[n - 1]);
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await expect(
          page.locator(".sample-task-answer .feedback.correct"),
        ).toBeVisible();
        await capture(
          page,
          `docs/qa/rates-practical-${info.project.name}-${mode}.png`,
        );
        const box = await root.boundingBox();
        await page.screenshot({
          path: `docs/qa/rates-practical-${info.project.name}-${mode}-model.png`,
          fullPage: true,
          clip: box!,
          scale: "css",
        });
        if (mode === "apparatus") {
          await expect(root.locator("[data-comparison]")).toHaveAttribute(
            "data-comparison",
            practicalRecords.apparatus[id].title,
          );
          const canvas = root.locator("canvas"),
            dims = await canvas.evaluate((c) => ({
              width: c.getBoundingClientRect().width,
              parent: c.parentElement!.clientWidth,
              pixels: (c as HTMLCanvasElement).width,
              dpr: Math.min(devicePixelRatio, 2),
            }));
          expect(Math.abs(dims.width - dims.parent)).toBeLessThan(1);
          expect(
            Math.abs(dims.pixels - dims.parent * dims.dpr),
          ).toBeLessThanOrEqual(1);
          const scene = root.getByRole("img", {
            name: "Schematic flask, delivery tubing and gas syringe. Arrow keys rotate.",
            exact: true,
          });
          await scene.focus();
          await page.keyboard.press("ArrowRight");
          const promise = page.waitForEvent("download");
          await root
            .getByRole("button", { name: "Download 3D asset", exact: true })
            .click();
          await (
            await promise
          ).saveAs(`docs/qa/rates-practical-${info.project.name}.glb`);
        }
      }
      await root.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(root.locator(".feedback.correct")).toHaveCount(0);
    }
    await root
      .getByRole("button", { name: "Reset model", exact: true })
      .click();
    await root.locator("details summary").click();
    await expect(
      root.getByLabel("Supplied comparison", { exact: true }),
    ).toHaveValue(model.record!);
    await root.locator("details summary").click();
    await root
      .getByRole("button", { name: "Check model", exact: true })
      .click();
    await expect(root.locator(".feedback.incorrect")).toBeVisible();
  });
test("raw fractional and incomplete dilution entries stay visible without replacing the last committed evidence", async ({
  page,
}) => {
  await learn(page, 3);
  const initial = page.getByRole("region", { name: "Task model", exact: true });
  await expect(initial.locator(".practical-unfilled")).toHaveText("Unfilled");
  await initial.getByLabel("Stock solution / cm³", { exact: true }).fill("10");
  await initial.getByLabel("Water / cm³", { exact: true }).fill("20");
  const widths = await initial
    .locator(".practical-dilution")
    .evaluate((el) => ({
      inner: el.clientWidth,
      water: el.children[1].getBoundingClientRect().width,
      empty: el.children[2].getBoundingClientRect().width,
    }));
  expect(Math.abs(widths.water / widths.inner - 0.4)).toBeLessThan(0.01);
  expect(Math.abs(widths.empty / widths.inner - 0.4)).toBeLessThan(0.01);
  const root = await construct(page, "dilution", "initial"),
    field = root.getByLabel("Water / cm³", { exact: true });
  await field.fill("1/2");
  await expect(
    root.getByRole("status").filter({ hasText: "ordinary non-negative" }),
  ).toBeVisible();
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.incorrect")).toBeVisible();
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("40");
  await field.fill("39");
  await saved(page);
  await field.fill("");
  await page.reload();
  await expect(field).toHaveValue("39");
  await root.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("40");
});
test("point construction supports keyboard and tap, preserves wrong curves and keeps suspect raw observations separate from the preview", async ({
  page,
}) => {
  await learn(page, 5);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await root.getByLabel("Selected point: time / s", { exact: true }).fill("10");
  await root
    .getByLabel("Selected point: Gas volume / cm³", { exact: true })
    .fill("12");
  await root.getByRole("button", { name: "Move right", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    root.getByLabel("Selected point: time / s", { exact: true }),
  ).toHaveValue("20");
  await root
    .getByRole("button", { name: "Place selected point", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await expect(
    root.getByLabel("Selected point: time / s", { exact: true }),
  ).toHaveValue("20");
  const svg = root.locator("svg"),
    box = await svg.boundingBox();
  await svg.click({
    position: { x: (150 / 560) * box!.width, y: (205 / 300) * box!.height },
  });
  await expect(
    root.getByLabel("Selected point: time / s", { exact: true }),
  ).toHaveValue("0");
  await expect(
    root.getByLabel("Selected point: Gas volume / cm³", { exact: true }),
  ).toHaveValue("0");
  await root.locator("details summary").click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption("anomaly");
  await root.locator("details summary").click();
  await construct(page, "plot", "anomaly");
  await expect(root).toContainText("Original blue points remain visible");
  await expect(root.locator("svg circle")).toHaveCount(6);
  await expect(root.locator("svg polyline")).toHaveCount(1);
  await root
    .getByLabel("Choose a justified best-fit treatment", { exact: true })
    .selectOption("joinEveryPoint");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.incorrect")).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(
    root.getByLabel("Choose a justified best-fit treatment", { exact: true }),
  ).toHaveValue("joinEveryPoint");
  await root
    .getByLabel("Choose point to construct", { exact: true })
    .selectOption("3");
  await expect(
    root.getByLabel("Selected point: Gas volume / cm³", { exact: true }),
  ).toHaveValue("15");
});
test("endpoint observations distinguish last visible bounds and a separately recorded exact time", async ({
  page,
}) => {
  await learn(page, 4);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await expect(
    root.getByRole("heading", { name: "Sample at 0 s", exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++)
    await root
      .getByRole("button", { name: "Next observation", exact: true })
      .click();
  await expect(root).toContainText("Cross still visible");
  await root
    .getByRole("button", { name: "Next observation", exact: true })
    .click();
  await expect(root).toContainText("Cross no longer visible");
  await root.locator("details summary").click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption("exact");
  await root.locator("details summary").click();
  await expect(root).toContainText("exactly 25 s");
  await construct(page, "endpoint", "exact");
  await expect(
    root.getByLabel("First sampled time at endpoint / s", { exact: true }),
  ).toHaveValue("30");
  await expect(
    root.getByLabel("Upper endpoint bound or recorded time / s", {
      exact: true,
    }),
  ).toHaveValue("25");
});
test("documented and unexplained identical repeat sets demand different calculations and preserve every raw result", async ({
  page,
}) => {
  await learn(page, 6);
  const root = await construct(page, "repeats", "initial");
  await expect(
    root.getByLabel("Mean of declared included trials / s", { exact: true }),
  ).toHaveValue("41");
  await expect(
    root.getByText("Excluded; raw record retained", { exact: true }),
  ).toBeVisible();
  await root.locator("details summary").click();
  await root
    .getByLabel("Supplied comparison", { exact: true })
    .selectOption("suspect");
  await root.locator("details summary").click();
  await construct(page, "repeats", "suspect");
  await expect(
    root.getByLabel("Mean of declared included trials / s", { exact: true }),
  ).toHaveValue("34");
  await expect(
    root.getByText("Excluded; raw record retained", { exact: true }),
  ).toHaveCount(0);
  await expect(root.locator("tbody")).toContainText("20");
  await root
    .getByLabel("Choose trials for the stated calculation", { exact: true })
    .selectOption("omit2");
  await root.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(root.locator(".feedback.incorrect")).toBeVisible();
});
test("WebGL failure preserves the supplied scale, apparatus reasoning and saved wrong reading", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      return type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
        ? null
        : original.call(this, type, ...(args as []));
    } as typeof original;
  });
  await learn(page, 2);
  const root = page.getByRole("region", { name: "Task model", exact: true });
  await expect(
    root.getByText("3D is unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    root.getByRole("img", {
      name: "Schematic flask, delivery tubing and gas syringe. Arrow keys rotate.",
      exact: true,
    }),
  ).toBeHidden();
  await root.getByLabel("Measured cm³", { exact: true }).fill("25");
  await saved(page);
  await page.reload();
  await expect(root.getByLabel("Measured cm³", { exact: true })).toHaveValue(
    "25",
  );
  await expect(root.locator("svg")).toBeVisible();
  await capture(
    page,
    `docs/qa/rates-practical-${info.project.name}-fallback.png`,
  );
});
