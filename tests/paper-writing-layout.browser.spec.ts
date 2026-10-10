import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { paper1FoundationFull } from "../src/content/paper1-foundation-full";
import { paper2FoundationFull } from "../src/content/paper2-foundation-full";
import { paper1HigherFull } from "../src/content/paper1-higher-full";
import { paper2HigherFull } from "../src/content/paper2-higher-full";
import { STORAGE_KEY } from "../src/lib/progress";

async function choosePart(page: Page, number: string) {
  const jump = page.locator(".assessment-question-jump");
  if ((await jump.getAttribute("open")) === null)
    await jump.locator("summary").click();
  await page
    .getByRole("button", { name: `Part ${number}`, exact: true })
    .click();
}

for (const paper of [
  paper1FoundationFull,
  paper2FoundationFull,
  paper1HigherFull,
  paper2HigherFull,
])
  test(`${paper.id}: direct working and substantial writing retain wrong drafts without changing study preference`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    const calculation = paper.parts.find(
      ({ question: q }) =>
        !q.rubric &&
        !q.options &&
        !q.parts &&
        Number.isFinite(Number(q.answer)),
    )!;
    const long = paper.parts.find(
      ({ question: q, marks }) =>
        q.rubric &&
        !q.shortWritten &&
        marks >= 4 &&
        !Object.keys(q).some((key) => /drawing/i.test(key)),
    )!;
    const short = paper.parts.find(
      ({ question: q }) => q.rubric && q.shortWritten,
    );
    expect(calculation).toBeTruthy();
    expect(long).toBeTruthy();
    await page.goto(`/exams/${paper.id}`);
    await page
      .getByRole("button", { name: "Start without a timer →", exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
      )
      .not.toBeNull();
    const preferences = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).preferences,
      STORAGE_KEY,
    );
    expect(preferences.tier).toBe("foundation");
    expect(preferences.course).toBe("combined");
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 664 });
      await choosePart(page, calculation.number);
      const working = page.getByLabel("Working for this question", {
        exact: true,
      });
      await expect(working).toBeVisible();
      await expect(page.locator(".assessment-working summary")).toHaveCount(0);
      const raw = `My original wrong working at ${width}px:\n11 / 44 = 0.5 mol\nI have not checked this calculation.`;
      await working.fill(raw);
      await expect
        .poll(() =>
          page.evaluate(() =>
            sessionStorage.getItem("gcse-chemistry.pending.v1"),
          ),
        )
        .toBeNull();
      await choosePart(page, long.number);
      await choosePart(page, calculation.number);
      await expect(working).toHaveValue(raw);
      await page.reload();
      await expect(working).toBeVisible();
      await expect(working).toHaveValue(raw);
      await expect(
        page.locator(".assessment-results,.assessment-review-criteria"),
      ).toHaveCount(0);
      await page.evaluate(async () => {
        await document.fonts.ready;
        (document.activeElement as HTMLElement)?.blur();
        scrollTo(0, 0);
      });
      await page.screenshot({
        path: `test-results/qa/paper-writing-${info.project.name}-${width}-${paper.id}-working.png`,
        fullPage: true,
        scale: "css",
      });
      await choosePart(page, long.number);
      const explanation = page.getByLabel("Your explanation", { exact: true });
      await explanation.fill("");
      await page.evaluate(async () => {
        await document.fonts.ready;
        (document.activeElement as HTMLElement)?.blur();
        scrollTo(0, 0);
      });
      await expect(explanation).toHaveCSS("min-height", "140px");
      const bounds = (await explanation.boundingBox())!;
      expect(bounds.height, long.question.id).toBeGreaterThanOrEqual(140);
      expect(bounds.y + bounds.height, long.question.id).toBeLessThanOrEqual(
        664,
      );
      const wrong =
        "My incomplete method:\nUse the wrong reagent.\nDo not separate the remaining solid.\nKeep my original wording for review." +
        (width === 390
          ? "\nI omitted the first control.\nI omitted the second control.\nI used an unsuitable measuring instrument.\nI changed two variables together.\nI did not repeat the readings.\nI kept the anomaly without checking it.\nI did not justify my conclusion.\nThis is my original longer draft."
          : "");
      await explanation.fill(wrong);
      await expect
        .poll(() =>
          page.evaluate(() =>
            sessionStorage.getItem("gcse-chemistry.pending.v1"),
          ),
        )
        .toBeNull();
      await page.reload();
      await expect(explanation).toHaveValue(wrong);
      if (width === 390) {
        const retainedBounds = (await explanation.boundingBox())!;
        expect(retainedBounds.height).toBeGreaterThan(bounds.height);
        expect(retainedBounds.height).toBeLessThanOrEqual(420);
      }
      await expect(
        page.locator(".assessment-results,.assessment-review-criteria"),
      ).toHaveCount(0);
      await expect(page.locator(".sidebar-note small")).toHaveText(
        "Your study preference: Foundation · Combined Science",
      );
      expect(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!).preferences,
          STORAGE_KEY,
        ),
      ).toEqual(preferences);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.evaluate(() => {
        (document.activeElement as HTMLElement)?.blur();
        scrollTo(0, 0);
      });
      await page.screenshot({
        path: `test-results/qa/paper-writing-${info.project.name}-${width}-${paper.id}-explanation.png`,
        fullPage: true,
        scale: "css",
      });
      if (short) {
        await choosePart(page, short.number);
        await expect(page.locator(".short-written-answer textarea")).toHaveCSS(
          "min-height",
          "64px",
        );
        await expect(
          page.locator(".short-written-answer textarea"),
        ).toHaveAttribute("rows", "2");
      }
    }
  });
