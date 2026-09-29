import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://127.0.0.1:3111",
    browserName: "chromium",
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : undefined,
    actionTimeout: 15000,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node --import tsx scripts/start-smoke.ts",
    url: "http://127.0.0.1:3111/api/health",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
