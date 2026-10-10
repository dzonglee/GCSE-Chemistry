import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lessons } from "../src/content/curriculum";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";

async function visibleCurrent(page: Page, index: number) {
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      page.locator(".sample-task-jump").evaluateAll((navs, index) => {
        const visible = navs.filter((nav) => nav.getClientRects().length > 0);
        return (
          visible.length > 0 &&
          visible.every((nav) => {
            const picker = nav.querySelector<HTMLSelectElement>("select");
            if (picker) return picker.value === String(index);
            const button = nav.querySelector<HTMLElement>(
              '[aria-current="step"]',
            );
            if (
              !button ||
              button.getAttribute("aria-label") !== `Task ${index + 1}`
            )
              return false;
            const frame = nav.getBoundingClientRect(),
              target = button.getBoundingClientRect();
            return target.left >= frame.left && target.right <= frame.right;
          })
        );
      }, index),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

for (const width of [320, 390, 1280])
  test(`fonts-ready ${width}: late guided and practice tasks remain visible after reload and resizing`, async ({
    browser,
  }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      for (const [slug, stage] of [
        ["yield-and-atom-economy", "guided"],
        ["yield-and-atom-economy", "practice"],
        ["ph-scale-and-indicators", "practice"],
        ["aqueous-electrolysis-products", "guided"],
        ["inside-an-atom", "guided"],
      ] as const) {
        const journey = lessons.find(
          (lesson) => lesson.slug === slug,
        )!.journey!;
        const index = journey[stage].length - 1,
          task = journey[stage][index];
        const progress = emptyProgress(),
          work = emptyWork();
        progress.preferences.course = "separate";
        work.section = stage === "practice" ? "practice" : "explore";
        work.learning = { version: 1, stage, index };
        work.drafts[task.id] = "Retained unfinished answer 1/2";
        progress.work[slug] = work;
        await page.goto(`/lessons/${slug}`);
        await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
          key: STORAGE_KEY,
          raw: JSON.stringify(progress),
        });
        await page.reload();
        await visibleCurrent(page, index);
        expect(await page.evaluate(() => scrollY)).toBe(0);
        await page.reload();
        await visibleCurrent(page, index);
        const retained = await page.evaluate(
          ({ key, slug, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[slug].drafts[id],
          { key: STORAGE_KEY, slug, id: task.id },
        );
        expect(retained).toBe("Retained unfinished answer 1/2");
        if (slug === "yield-and-atom-economy" && stage === "practice") {
          for (const resized of [1280, 390, 320, width]) {
            await page.setViewportSize({ width: resized, height: 720 });
            await visibleCurrent(page, index);
            expect(await page.evaluate(() => scrollY)).toBe(0);
          }
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
            [],
          );
        }
      }
    } finally {
      await context.close();
    }
  });
