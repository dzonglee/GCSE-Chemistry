import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fullPapers } from "../src/content/full-assessments";
async function layoutSettled(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
    scrollTo(0, 0);
  });
}
const regressionPaper = fullPapers.find(
  (p) => p.slug === "edexcel-paper-1-higher-full",
)!;
for (const item of [
  regressionPaper,
  ...fullPapers.filter((p) => p !== regressionPaper),
]) {
  test(`${item.slug}: every original part reflows at actual320 and390 without revealing answers`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(`/exams/${item.slug}`);
      if (width === 320) {
        await page
          .getByRole("button", { name: "Start without a timer →", exact: true })
          .click();
      } else {
        // Return through the real jump controls; preserve the untouched run.
        const jump = page.getByText(
          new RegExp(
            `^Jump to a part · 0 of ${item.questions.length} recorded$`,
          ),
        );
        await jump.click();
        await page
          .locator(".paper-part-navigation button,.question-navigation button")
          .first()
          .click();
      }
      const parts = item.examPaper!.parts;
      for (const [i, p] of parts.entries()) {
        await expect(page.locator(".question-panel > .eyebrow")).toContainText(
          `${p.number} · ${p.marks}`,
        );
        await layoutSettled(page);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          `${item.slug} ${p.number} at${width}`,
        ).toBeLessThanOrEqual(width);
        const first = page
          .locator(
            p.question.options
              ? ".question-panel .answer-option"
              : ".question-panel input,.question-panel textarea,.question-panel select",
          )
          .first();
        const box = (await first.boundingBox())!;
        expect(box.height, `${p.number} control`).toBeGreaterThanOrEqual(44);
        expect(box.y + box.height, `${p.number} control`).toBeLessThanOrEqual(
          664,
        );
        for (const size of await page.locator("svg text").evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const text = node as SVGTextElement,
              b = text.getBoundingClientRect(),
              m = text.getScreenCTM();
            return !m ||
              !b.width ||
              !b.height ||
              getComputedStyle(text).visibility === "hidden"
              ? []
              : [
                  parseFloat(getComputedStyle(text).fontSize) *
                    Math.hypot(m.a, m.b),
                ];
          }),
        ))
          expect(size, `${p.number} diagram text`).toBeGreaterThanOrEqual(12);
        await expect(
          page.locator(".paper-reference,.assessment-results"),
        ).toHaveCount(0);
        if (i === 0 || i === parts.length - 1)
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
            [],
          );
        if (i < parts.length - 1)
          await page
            .getByRole("button", { name: "Next part →", exact: true })
            .click();
      }
    }
  });
}
