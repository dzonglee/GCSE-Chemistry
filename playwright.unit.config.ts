import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results/unit",
  testMatch: "**/*.unit.spec.ts",
  reporter: "list",
  workers: 2,
});
