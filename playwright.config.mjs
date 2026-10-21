import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4173/nsysu-christmas-ball-2026/', headless: true, trace: 'retain-on-failure' },
  reporter: [['list'], ['html',{open:'never'}]],
  webServer: {command:'npm run dev',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
});
