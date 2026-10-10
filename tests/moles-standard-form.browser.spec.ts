import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { molesJourney } from "../src/content/journeys/moles";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";

const slug = "moles-and-reacting-masses",
  id = "mo-v1-p-total-atoms";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
test("requested standard form retains equivalent wrong representations and offers targeted recovery", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await mkdir("test-results/qa/moles-standard-form", { recursive: true });
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto(`/lessons/${slug}`);
    const progress = emptyProgress(),
      work = emptyWork();
    progress.preferences.tier = "higher";
    work.section = "practice";
    work.learning = {
      version: 1,
      stage: "practice",
      index: molesJourney.practice.findIndex((q) => q.id === id),
    };
    progress.work[slug] = work;
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key: STORAGE_KEY,
      raw: JSON.stringify(progress),
    });
    await page.reload();
    const field = page.getByLabel("Your answer", { exact: true });
    await expect(
      page.getByRole("heading", {
        name: "Count all atoms in molecules",
        exact: true,
      }),
    ).toBeVisible();
    await expect(field).toHaveAttribute("inputmode", "text");
    await expect(field).toHaveAttribute("autocapitalize", "off");
    await expect(field).toHaveAttribute("spellcheck", "false");
    await expect(page.locator(".numeric-label small")).toContainText(
      "at least 1 and less than 10",
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      (document.activeElement as HTMLElement)?.blur();
      scrollTo(0, 0);
    });
    const box = (await field.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y + box.height).toBeLessThanOrEqual(664);
    for (const raw of ["90.3e22", "903000000000000000000000"]) {
      await field.fill(raw);
      await saved(page);
      await page.reload();
      await expect(field).toHaveValue(raw);
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(page.locator(".question-panel [role=status]")).toContainText(
        "Your numerical value is right.",
      );
      await expect(
        page.getByText("That’s right.", { exact: true }),
      ).toHaveCount(0);
      await saved(page);
      expect(
        await page.evaluate(
          ({ key, slug, id }) =>
            JSON.parse(localStorage.getItem(key)!).work[slug].attempts[id].at(
              -1,
            ),
          { key: STORAGE_KEY, slug, id },
        ),
      ).toMatchObject({ answer: raw, correct: false, fresh: false });
      if (raw === "90.3e22") {
        await page
          .getByRole("button", { name: "Revisit the key idea", exact: true })
          .click();
        await expect(
          page.getByRole("heading", {
            name: "Recognise normalized form",
            exact: true,
          }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: "Return to your task →", exact: true })
          .click();
        await saved(page);
        await page.reload();
        await expect(field).toHaveValue(raw);
        await page
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await page.evaluate(async () => {
          await document.fonts.ready;
          (document.activeElement as HTMLElement)?.blur();
          scrollTo(0, 0);
        });
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: `test-results/qa/moles-standard-form/${info.project.name}-${width}-representation.png`,
          fullPage: true,
          scale: "css",
        });
        await page.screenshot({
          path: `test-results/qa/moles-standard-form/${info.project.name}-${width}-representation-viewport.png`,
          scale: "css",
        });
      }
    }
    await field.fill("9.03e");
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(page.locator(".question-panel [role=status]")).toContainText(
      "Use e notation",
    );
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
      0,
    );
    await field.fill("+9.030E+023");
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(
      page.getByText("That’s right.", { exact: true }),
    ).toBeVisible();
    await saved(page);
    await page.reload();
    await expect(field).toHaveValue("+9.030E+023");
  }
});
