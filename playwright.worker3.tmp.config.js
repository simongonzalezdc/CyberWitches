// @ts-check
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1,
    forbidOnly: false,
    retries: 0,
    reporter: 'line',
    timeout: 60000,
    use: { baseURL: 'http://localhost:18080', trace: 'off' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npx http-server . -p 18080 -c-1 --silent',
        url: 'http://localhost:18080',
        reuseExistingServer: false,
        timeout: 60000
    }
});
