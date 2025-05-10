import { defineConfig, devices } from '@playwright/test';

// Detect CI environment to skip auto-starting the dev server
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['dot'], ['html', { open: 'never' }]],
  use: {
    // Allow overriding in Docker via BASE_URL, defaults to localhost
    baseURL: process.env.BASE_URL || 'http://localhost:5800',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Auto-start dev server only when not in CI; in CI tests expect an external server at baseURL
  webServer: isCI
    ? undefined
    : {
        // Use pnpm for install and start; reuses existing server if already running
        command: 'pnpm install && pnpm run dev -- --host 0.0.0.0',
        cwd: __dirname,
        port: 5800,
        reuseExistingServer: true,
      },
});