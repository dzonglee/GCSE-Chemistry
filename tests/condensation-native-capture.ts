import {
  devices,
  expect,
  test,
  type CDPSession,
  type Page,
} from "@playwright/test";

const sessions = new WeakMap<Page, CDPSession>();

export async function assertCondensationNativeDevice(page: Page) {
  const mobile = test.info().project.name === "mobile";
  expect(await page.evaluate(() => navigator.maxTouchPoints > 0)).toBe(mobile);
  expect(await page.evaluate(() => devicePixelRatio)).toBe(
    mobile ? devices["iPhone 13"].deviceScaleFactor : 1,
  );
}

export async function captureCondensationNative(
  page: Page,
  capture: () => Promise<void>,
) {
  const touchPoints = await page.evaluate(() => navigator.maxTouchPoints);
  try {
    await capture();
  } finally {
    // Chromium full-page capture resets touch emulation. Restore the native
    // protocol setting, without overriding navigator or altering the app.
    if (touchPoints) {
      let session = sessions.get(page);
      if (!session) {
        session = await page.context().newCDPSession(page);
        sessions.set(page, session);
      }
      await session.send("Emulation.setTouchEmulationEnabled", {
        enabled: true,
        maxTouchPoints: touchPoints,
      });
      // Detaching also resets emulation; context closure owns session cleanup.
    }
    expect(await page.evaluate(() => navigator.maxTouchPoints)).toBe(
      touchPoints,
    );
  }
}
