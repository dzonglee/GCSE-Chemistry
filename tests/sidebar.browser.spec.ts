import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lessons, topics } from "../src/content/curriculum";

async function activeVisible(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      page
        .locator('.topic-lesson-links [aria-current="page"]')
        .evaluate((el) => {
          const link = el.getBoundingClientRect();
          const panel = el
            .closest("#course-navigation")!
            .getBoundingClientRect();
          return link.top >= panel.top && link.bottom <= panel.bottom;
        }),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(await page.locator(".sidebar").evaluate((el) => el.scrollTop)).toBe(0);
}

for (const topic of topics)
  test(`every lesson in ${topic.title} reveals its current course link without moving the academy heading`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    const mobile = info.project.name === "mobile";
    await page.setViewportSize({ width: mobile ? 320 : 1280, height: 720 });
    for (const lesson of lessons.filter(
      (lesson) => lesson.topic === topic.slug,
    )) {
      await page.goto(`/lessons/${lesson.slug}`);
      if (mobile)
        await page
          .getByRole("button", { name: "Course map", exact: true })
          .click();
      await activeVisible(page);
      if (mobile) {
        const bar = await page.locator(".mobile-bar").boundingBox();
        expect(bar!.y).toBe(0);
        expect(bar!.height).toBe(64);
        await expect(
          page.getByRole("button", { name: "Close map", exact: true }),
        ).toHaveAttribute("aria-expanded", "true");
      } else {
        const brand = await page.locator(".brand").boundingBox();
        expect(brand!.y).toBeGreaterThanOrEqual(0);
        expect(brand!.y + brand!.height).toBeLessThan(120);
        await expect(page.locator(".brand")).toContainText("Atelier Academy");
      }
      expect(await page.evaluate(() => scrollY)).toBe(0);
    }
  });

test("map scrolling, reload, viewport changes and keyboard navigation preserve course identity", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/lessons/yield-and-atom-economy");
  await activeVisible(page);
  const brandBefore = await page.locator(".brand").boundingBox();
  await page.locator("#course-navigation").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const brandAfter = await page.locator(".brand").boundingBox();
  expect(brandAfter).toEqual(brandBefore);
  await page.reload();
  await activeVisible(page);
  await page.setViewportSize({ width: 1280, height: 560 });
  await activeVisible(page);
  await page.setViewportSize({ width: 390, height: 720 });
  const toggle = page.getByRole("button", { name: "Course map", exact: true });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await activeVisible(page);
  const current = page.locator('.topic-lesson-links [aria-current="page"]');
  await current.focus();
  await expect(current).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Course map", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 320, height: 720 });
  await page.getByRole("button", { name: "Course map", exact: true }).click();
  await activeVisible(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
