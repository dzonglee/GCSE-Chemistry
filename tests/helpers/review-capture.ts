import { expect, type Locator, type Page } from "@playwright/test";

// Keep the actual sticky header visible and verify the caption is unobstructed.
// Use instead of Locator.screenshot()/scrollIntoViewIfNeeded() for user samples.
export async function captureReadableCaption(
  page: Page,
  caption: Locator,
  path: string,
) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
  });
  const captionDocumentTop = await caption.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  const visibleHeaderBottom = await page
    .locator(".mobile-bar")
    .evaluateAll((headers) =>
      Math.max(
        0,
        ...headers.flatMap((header) => {
          const box = header.getBoundingClientRect();
          const style = getComputedStyle(header);
          return style.display !== "none" &&
            style.visibility !== "hidden" &&
            box.height > 0
            ? [box.bottom]
            : [];
        }),
      ),
    );
  await page.evaluate(
    ({ top, headerBottom }) => {
      window.scrollTo({
        top: Math.max(0, top - headerBottom - 12),
        behavior: "instant",
      });
    },
    { top: captionDocumentTop, headerBottom: visibleHeaderBottom },
  );
  // Wait for browser scroll/layout commitment; do not assume toBeVisible prevents occlusion.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(caption).toBeVisible();
  const bounds = (await caption.boundingBox())!;
  const viewport = page.viewportSize()!;
  const actualHeaderBottom = await page
    .locator(".mobile-bar")
    .evaluateAll((headers) =>
      Math.max(
        0,
        ...headers.flatMap((header) => {
          const box = header.getBoundingClientRect();
          const style = getComputedStyle(header);
          return style.display !== "none" &&
            style.visibility !== "hidden" &&
            box.height > 0
            ? [box.bottom]
            : [];
        }),
      ),
    );
  expect(bounds.y).toBeGreaterThanOrEqual(actualHeaderBottom + 8);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
  // Hit-testing additionally detects other overlays at caption center.
  expect(
    await caption.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      );
      return !!hit && (element === hit || element.contains(hit));
    }),
  ).toBe(true);
  // Page viewport screenshot preserves the verified scroll offset. Locator screenshot
  // would scroll automatically and could reintroduce header obstruction.
  await page.screenshot({ path, fullPage: false, scale: "css" });
}

export async function captureDocumentRegion(
  page: Page,
  region: Locator,
  path: string,
) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    scrollTo({ top: 0, left: 0, behavior: "instant" });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  const clip = (await region.boundingBox())!;
  expect(clip.x).toBeGreaterThanOrEqual(0);
  expect(clip.width).toBeGreaterThan(0);
  await page.screenshot({ path, fullPage: true, clip, scale: "css" });
}
