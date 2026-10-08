import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results/browser",
  testMatch: "**/*.browser.spec.ts",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3201",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3201",
    url: "http://127.0.0.1:3201",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
