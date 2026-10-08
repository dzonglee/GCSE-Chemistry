import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { STORAGE_KEY } from "../src/lib/progress";
const dir = "test-results/qa/inverse-atom-economy";
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
async function capture(page: Page, name: string) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(async () => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
    await document.fonts.ready;
  });
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
}
async function check(page: Page, correct: boolean) {
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(
    page.locator(".inverse-economy-workbench .feedback"),
  ).toHaveClass(correct ? /correct/ : /retry/);
}
test("four staged Higher activities connect weighted contributions, symbolic ratio, complement and hypothesis allocation", async ({
  page,
}, info) => {
  await page.goto("/lessons/atom-economy");
  await task(page, 5);
  await page
    .getByLabel("Other-product contribution", { exact: true })
    .fill("44");
  await check(page, false);
  await expect(
    page.locator(".inverse-economy-workbench .feedback"),
  ).toContainText("3 × (12 + 2 × 16)");
  await page
    .getByLabel("Other-product contribution", { exact: true })
    .fill("132");
  await check(page, true);
  await capture(page, `${info.project.name}-contribution`);
  await task(page, 6);
  await page
    .getByLabel("Your mass relationship", { exact: true })
    .selectOption("unweighted");
  await check(page, false);
  await expect(
    page.locator(".inverse-economy-workbench .feedback"),
  ).toContainText("coefficient");
  await page
    .getByLabel("Your mass relationship", { exact: true })
    .selectOption("omitted");
  await check(page, false);
  await page
    .getByLabel("Your mass relationship", { exact: true })
    .selectOption("weighted");
  await check(page, true);
  await capture(page, `${info.project.name}-equation`);
  await task(page, 7);
  await page
    .getByLabel("Your other-product percentage", { exact: true })
    .fill("45.9");
  await check(page, false);
  await page
    .getByLabel("Your other-product percentage", { exact: true })
    .fill("54.1");
  await check(page, true);
  await task(page, 8);
  const field = page.getByLabel("Your proposed relative atomic mass", {
    exact: true,
  });
  await field.fill("112");
  await expect(page.locator(".inverse-allocation")).toHaveAttribute(
    "aria-label",
    /62\.92 percent.*45\.9 percent/,
  );
  await check(page, false);
  await expect(field).toHaveValue("112");
  await capture(page, `${info.project.name}-wrong-proposal`);
  await field.fill("56.0");
  await expect(page.locator(".inverse-allocation")).toHaveAttribute(
    "aria-label",
    /45\.90 percent/,
  );
  const widths = await page
    .locator(".inverse-mass-bar")
    .first()
    .locator("span")
    .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().width));
  expect((widths[0] / (widths[0] + widths[1])) * 100).toBeCloseTo(
    45.90163934426229,
    1,
  );
  await check(page, true);
  await page
    .getByText("Two ways to solve the unknown", { exact: true })
    .click();
  await expect(
    page.locator(".inverse-economy-workbench details"),
  ).toContainText("Subtract 91.8x from both sides");
  await expect(
    page.locator(".inverse-economy-workbench details"),
  ).toContainText("divide by 2");
  await capture(page, `${info.project.name}-solved`);
});
test("invalid raw proposal, wrong ratio, undo and reset survive browser-local saves without silently correcting work", async ({
  page,
}, info) => {
  await page.goto("/lessons/atom-economy");
  await task(page, 8);
  const field = page.getByLabel("Your proposed relative atomic mass", {
    exact: true,
  });
  await field.fill("1..2");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("1..2");
  await expect(page.locator(".inverse-allocation")).toHaveAttribute(
    "aria-label",
    /Enter a positive/,
  );
  await field.fill("56 g");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("56 g");
  await field.fill("56.0");
  await check(page, true);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("56 g");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("");
  await expect(
    page.getByText("Saved work is unreadable", { exact: false }),
  ).toHaveCount(0);
  await task(page, 6);
  await page
    .getByLabel("Your mass relationship", { exact: true })
    .selectOption("other");
  await check(page, false);
  await saved(page);
  await page.reload();
  await expect(
    page.getByLabel("Your mass relationship", { exact: true }),
  ).toHaveValue("other");
  await capture(page, `${info.project.name}-retained-wrong-ratio`);
});
test("independent reverse calculations have no model, enforce precision and retain wrong work before a changed-coefficient transfer", async ({
  page,
}, info) => {
  await page.goto("/lessons/atom-economy");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await task(page, 22);
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  const field = page.getByLabel("Your answer", { exact: true });
  await field.fill("112");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(field).toHaveValue("112");
  await saved(page);
  await page.reload();
  await expect(field).toHaveValue("112");
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Higher: try again",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toBeVisible();
  await page
    .getByText("Two ways to solve the unknown", { exact: true })
    .click();
  await expect(
    page.locator(".inverse-economy-workbench details"),
  ).toContainText("Subtract 91.8x from both sides");
  await expect(
    page.getByRole("button", { name: "Return to learning →", exact: true }),
  ).toHaveCount(0);
  await capture(page, `${info.project.name}-refresher`);
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(field).toHaveValue("112");
  await field.fill("56");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "trailing zero",
  );
  await field.fill("56.0");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "That’s right",
  );
  await capture(page, `${info.project.name}-independent`);
  await task(page, 23);
  await field.fill("104");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(field).toHaveValue("104");
  await field.fill("208");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "That’s right",
  );
  await saved(page);
  const data = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(
    data.work["atom-economy"].attempts["ae-v1-p-inverse-transfer"].at(-1)
      .correct,
  ).toBe(true);
  await capture(page, `${info.project.name}-transfer`);
});
test("all seven Higher activities keep a complete first scientific control within664px at320 and390", async ({
  page,
}, info) => {
  await mkdir(dir, { recursive: true });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 664 });
    await page.goto("/lessons/atom-economy");
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    for (const n of [5, 6, 7, 8]) {
      await task(page, n);
      await page.evaluate(() => scrollTo(0, 0));
      const box = await page
        .locator(
          ".inverse-economy-workbench input, .inverse-economy-workbench select",
        )
        .first()
        .boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height).toBeLessThanOrEqual(664);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${dir}/${info.project.name}-${width}-task-${n}-opening.png`,
      });
    }
    await page.getByRole("button", { name: "Practise", exact: true }).click();
    for (const n of [22, 23]) {
      await task(page, n);
      await page.evaluate(() => scrollTo(0, 0));
      const box = await page
        .getByLabel("Your answer", { exact: true })
        .boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height).toBeLessThanOrEqual(664);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${dir}/${info.project.name}-${width}-practice-${n}-opening.png`,
      });
      if (n === 22) {
        await page.getByLabel("Your answer", { exact: true }).fill("112");
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
        await page.evaluate(() => scrollTo(0, 0));
        const recovery = await page
          .getByLabel("Your proposed relative atomic mass", { exact: true })
          .boundingBox();
        expect(recovery!.height).toBeGreaterThanOrEqual(44);
        expect(recovery!.y + recovery!.height).toBeLessThanOrEqual(664);
        await page.screenshot({
          path: `${dir}/${info.project.name}-${width}-refresher-opening.png`,
        });
        await page
          .getByRole("button", { name: "Return to your task →", exact: true })
          .click();
      }
    }
  }
});
