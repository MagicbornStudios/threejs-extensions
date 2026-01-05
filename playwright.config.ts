import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --hostname 0.0.0.0 --port 3000',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
};

export default config;
