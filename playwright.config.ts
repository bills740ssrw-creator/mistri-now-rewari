import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    channel: "msedge",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 960 }, channel: "msedge" },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: "msedge" },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
