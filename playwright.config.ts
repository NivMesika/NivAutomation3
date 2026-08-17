import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const authFile = path.resolve(__dirname, 'playwright/.auth/user.json');
const defaultBaseURL = 'https://guardio.app.getnotch.dev';

if (!fs.existsSync(authFile)) {
  throw new Error(
    `Missing ${authFile}. Run \`npm run auth\` and sign in with Google in the Chrome window.`,
  );
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: process.env.CI ? 'never' : 'always' }]],
  timeout: 180_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.BASE_URL ?? defaultBaseURL,
    channel: 'chrome',
    launchOptions: {
      ignoreDefaultArgs: ['--enable-automation'],
      args: ['--disable-blink-features=AutomationControlled'],
    },
    storageState: authFile,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
});
