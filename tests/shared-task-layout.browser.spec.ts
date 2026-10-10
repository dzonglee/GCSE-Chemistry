import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lessons } from "../src/content/curriculum";
import { STORAGE_KEY } from "../src/lib/progress";

test("one below-task chooser preserves late answers, focus and numeric opening access", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 664 });
    for (const [slug, id] of [
      ["molar-concentration", "mc-v1-p-round"],
      ["measuring-rates", "rr-v1-p-minutes"],
    ]) {
      const journey = lessons.find((l) => l.slug === slug)!.journey!;
      const index = journey.practice.findIndex((q) => q.id === id);
      expect(index).toBeGreaterThanOrEqual(0);
      await page.goto(`/lessons/${slug}`);
      await page.getByRole("button", { name: "Practise", exact: true }).click();
      const jump = page.getByLabel("Learning task navigation", { exact: true });
      await expect(jump).toHaveCount(1);
      const picker = jump.getByLabel("Choose a practice task", { exact: true });
      // Ensure a real task change even when the previous viewport saved this task.
      const otherIndex = index === 0 ? 1 : 0;
      if (await picker.count()) await picker.selectOption(String(otherIndex));
      else
        await jump
          .getByRole("button", { name: `Task ${otherIndex + 1}`, exact: true })
          .click();
      if (await picker.count()) await picker.selectOption(String(index));
      else
        await jump
          .getByRole("button", { name: `Task ${index + 1}`, exact: true })
          .click();
      const input = page.getByLabel("Your answer", { exact: true });
      await expect(page.locator(".sample-task-panel h2")).toBeFocused();
      const raw = "1..2";
      await input.fill(raw);
      await expect
        .poll(() =>
          page.evaluate(() =>
            sessionStorage.getItem("gcse-chemistry.pending.v1"),
          ),
        )
        .toBeNull();
      // Measure opening access, rather than the scroll restored from clicking
      // the below-task chooser or focusing a lower response field.
      await page.evaluate(() => {
        (document.activeElement as HTMLElement)?.blur();
        window.scrollTo(0, 0);
      });
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await page.reload();
      await expect(input).toHaveValue(raw);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      const bounds = await input.boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(664);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      const nav = await jump.boundingBox();
      expect(nav!.y).toBeGreaterThan(bounds!.y + bounds!.height);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.evaluate(() =>
        (document.activeElement as HTMLElement)?.blur(),
      );
      await page.screenshot({
        path: `test-results/qa/shared-navigation-${info.project.name}-${width}-${slug}.png`,
        fullPage: true,
        scale: "css",
      });
      const nextIndex = index === 0 ? 1 : 0;
      if (await picker.count()) await picker.selectOption(String(nextIndex));
      else
        await jump
          .getByRole("button", { name: `Task ${nextIndex + 1}`, exact: true })
          .click();
      if (await picker.count()) await picker.selectOption(String(index));
      else
        await jump
          .getByRole("button", { name: `Task ${index + 1}`, exact: true })
          .click();
      await expect(input).toHaveValue(raw);
      const retained = await page.evaluate(
        ({ key, slug, id }) =>
          JSON.parse(localStorage.getItem(key)!).work[slug].drafts[id],
        { key: STORAGE_KEY, slug, id },
      );
      expect(retained).toBe(raw);
    }
  }
});
