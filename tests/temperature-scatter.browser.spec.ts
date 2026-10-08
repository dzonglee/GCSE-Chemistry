import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { temperatureScatter } from "../src/lib/temperature-scatter";
import { STORAGE_KEY } from "../src/lib/progress";
const route = "/lessons/energy-practical",
  dir = "test-results/qa/temperature-scatter";
async function task(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Task ${n}`, exact: true })
    .first()
    .click();
}
function graph(page: Page) {
  return page.getByRole("region", {
    name: "Temperature graph construction",
    exact: true,
  });
}
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function capture(page: Page, name: string, fullPage = true) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage });
}
async function plot(root: Locator, data: "guided" | "transfer") {
  for (const [i, [x, y]] of temperatureScatter[data].data.points.entries()) {
    await root
      .getByLabel("Choose an observation or line end", { exact: true })
      .selectOption(String(i));
    await root.locator(`[data-plot-field="p${i}x"]`).fill(String(x));
    await root.locator(`[data-plot-field="p${i}y"]`).fill(String(y));
  }
}
async function line(root: Locator, data: "guided" | "transfer") {
  await root
    .getByRole("button", { name: "Edit your best-fit line", exact: true })
    .click();
  const ends = temperatureScatter[data].referenceLine!;
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("0");
  await root.locator('[data-plot-field="c0"]').fill(String(ends[0]));
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("5");
  await root.locator('[data-plot-field="c5"]').fill(String(ends[1]));
}
test("construct six observations and a straight fit; an incorrect intercept does not bend the extrapolation", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 7);
  const root = graph(page);
  await expect(root.locator("[data-plot-point]")).toHaveCount(0);
  await expect(root.locator("[data-fit]")).toHaveCount(0);
  await expect(
    page.getByText("Compare a reference graph", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Save and review graph", exact: true })
    .click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "Enter or choose an answer",
  );
  await expect(
    page.getByText("Compare a reference graph", { exact: true }),
  ).toHaveCount(0);
  await plot(root, "guided");
  await line(root, "guided");
  await root
    .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
    .fill("20");
  const path = await root
    .locator('[data-fit="your-chosen-line"]')
    .getAttribute("d");
  expect(path).toContain(" L");
  expect(path).not.toContain("C");
  const extension = root.locator("[data-fit-extrapolation]");
  // Original fixed scale: y=24 must meet at77.857px, independently of the estimate20.
  expect(Number(await extension.getAttribute("y2"))).toBeCloseTo(
    77.857142857,
    6,
  );
  expect(
    Number(await root.locator("[data-estimate]").getAttribute("cy")),
  ).toBeCloseTo(163.57142857, 6);
  await saved(page);
  await page.reload();
  await expect(
    root.getByLabel("Your proposed estimate at x=0 (°C)", { exact: true }),
  ).toHaveValue("20");
  await expect(root.locator("[data-plot-point]")).toHaveCount(6);
  await capture(page, info.project.name + "-wrong-intercept");
  await root.locator(".fuel-plot-scroll").screenshot({
    path: `${dir}/${info.project.name}-wrong-plot.png`,
    scale: "css",
  });
  await root
    .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
    .fill("24");
  await page
    .getByRole("button", { name: "Save and review graph", exact: true })
    .click();
  await expect(page.locator(".sample-task-answer .feedback")).toContainText(
    "Compare your graph",
  );
  await expect(page.locator(".sample-task-answer .feedback")).not.toHaveClass(
    /correct/,
  );
  await page.getByText("Compare a reference graph", { exact: true }).click();
  await expect(
    page.getByRole("img", {
      name: "Reference observations with one balanced straight fit and its extrapolation to zero mass",
    }),
  ).toBeVisible();
  await capture(page, info.project.name + "-guided-reference");
  await page.locator(".temperature-graph-reference").screenshot({
    path: `${dir}/${info.project.name}-reference-detail.png`,
    scale: "css",
  });
});
test("changed independent graph retains malformed and wrong work through reload and a separate recovery graph", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 24);
  const root = graph(page);
  await root.locator('[data-plot-field="p0x"]').fill("1..2");
  await root.locator('[data-plot-field="p0y"]').fill("20.4");
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("1..2");
  await expect(root.locator("[data-plot-point]")).toHaveCount(0);
  await plot(root, "transfer");
  await line(root, "transfer");
  await root
    .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
    .fill("19");
  expect(
    Number(await root.locator("[data-fit-extrapolation]").getAttribute("y2")),
  ).toBeCloseTo(72.5, 6);
  expect(
    Number(await root.locator("[data-estimate]").getAttribute("cy")),
  ).toBeCloseTo(128.75, 6);
  await page
    .getByRole("button", { name: "Save and review graph", exact: true })
    .click();
  await saved(page);
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).work[
          "energy-practical"
        ].attempts["ep-v1-p-scatter"].at(-1).correct,
      STORAGE_KEY,
    ),
  ).toBe(false);
  await capture(page, info.project.name + "-independent-wrong");
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Try the graph again", exact: true }),
  ).toBeVisible();
  await expect(graph(page).locator("[data-plot-point]")).toHaveCount(0);
  await expect(graph(page).locator('[data-plot-field="p0x"]')).toHaveValue("");
  await expect(
    graph(page).getByRole("button", {
      name: "Edit observation point",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    graph(page).getByRole("cell", { name: "2→22.7", exact: true }),
  ).toBeVisible();
  await capture(page, info.project.name + "-recovery");
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    root.getByLabel("Your proposed estimate at x=0 (°C)", { exact: true }),
  ).toHaveValue("19");
  await expect(root.locator("[data-plot-point]")).toHaveCount(6);
  await root
    .getByRole("button", { name: "Edit observation point", exact: true })
    .click();
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("0");
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("3");
  await root
    .getByRole("button", { name: "Clear this temperature graph", exact: true })
    .click();
  await expect(root.locator("[data-plot-point]")).toHaveCount(0);
  await expect(root.locator("[data-fit]")).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("");
});
test("plot supports pointer and keyboard placement, fixed scales, line-end selection and readable labels", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await task(page, 7);
  const root = graph(page),
    plotRegion = root.getByRole("region", {
      name: "Temperature graph with fixed original scales",
      exact: true,
    });
  await plotRegion.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("0.2");
  await expect(root.locator('[data-plot-field="p0y"]')).toHaveValue("12.2");
  await root.getByRole("img").evaluate((el) => {
    const box = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: box.left + box.width * (174.285714 / 650),
        clientY: box.top + box.height * (110 / 450),
      }),
    );
  });
  await expect(root.locator('[data-plot-field="p0x"]')).toHaveValue("2");
  await expect(root.locator('[data-plot-field="p0y"]')).toHaveValue("22.5");
  await root
    .getByRole("button", { name: "Edit your best-fit line", exact: true })
    .click();
  await expect(
    root
      .getByLabel("Choose an observation or line end", { exact: true })
      .locator("option"),
  ).toHaveCount(2);
  await plotRegion.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  await expect(root.locator('[data-plot-field="c0"]')).toHaveValue("12.2");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await expect(root.locator('[data-plot-field="c5"]')).toHaveValue("12.2");
  await root
    .getByLabel("Your proposed estimate at x=0 (°C)", { exact: true })
    .fill("99");
  await expect(root).toContainText(
    "Retained outside the original printed scale: Proposed estimate",
  );
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("0");
  await root.locator('[data-plot-field="c0"]').fill("26");
  await root
    .getByLabel("Choose an observation or line end", { exact: true })
    .selectOption("5");
  await root.locator('[data-plot-field="c5"]').fill("12");
  await expect(root).toContainText("Your extrapolated line crossing");
  const fonts = await root
    .locator("svg text")
    .evaluateAll((nodes) =>
      nodes.map(
        (n) =>
          parseFloat(getComputedStyle(n).fontSize) *
          ((n as SVGTextElement).ownerSVGElement!.getBoundingClientRect()
            .width /
            650),
      ),
    );
  expect(Math.min(...fonts)).toBeGreaterThanOrEqual(14);
  await capture(page, info.project.name + "-keyboard");
});
test("all three graph tasks expose a complete44px coordinate input within664px at320 and390", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto(route);
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await task(page, 7);
    for (const stage of ["guided", "practice", "refresher"]) {
      if (stage === "practice") {
        await page
          .getByRole("button", { name: "Practise", exact: true })
          .click();
        await task(page, 24);
      }
      if (stage === "refresher") {
        await graph(page).locator('[data-plot-field="p0x"]').fill("9");
        await page
          .getByRole("button", { name: "Save and review graph", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        scrollTo(0, 0);
      });
      const box = await graph(page).locator("input").first().boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height).toBeLessThanOrEqual(664);
      await capture(
        page,
        `${info.project.name}-${width}-${stage}-opening`,
        false,
      );
    }
  }
});
