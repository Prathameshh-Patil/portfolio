import { defineConfig, devices } from "@playwright/test";

// Smoke tests against the production build (`npm run build` first). The web server talks to a mock API
// (e2e/mock-api.mjs), so no database or real API is needed. Ports avoid the dev ones (3000/4000).
const WEB_PORT = 3200;
const MOCK_API_PORT = 4100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // a stray test.only must not silently skip the rest in CI
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${WEB_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/mock-api.mjs",
      url: `http://127.0.0.1:${MOCK_API_PORT}/health`,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
      reuseExistingServer: false,
    },
    {
      // The standalone server is what Docker runs; static files are copied next to it first.
      command:
        "cp -r .next/static .next/standalone/apps/web/.next/ && cp -r public .next/standalone/apps/web/ && node .next/standalone/apps/web/server.js",
      url: `http://127.0.0.1:${WEB_PORT}`,
      env: { PORT: String(WEB_PORT), HOSTNAME: "127.0.0.1", API_URL_INTERNAL: `http://127.0.0.1:${MOCK_API_PORT}` },
      reuseExistingServer: false,
    },
  ],
});
