// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the real-browser smoke test.
 *
 * This exists because jsdom unit tests passed while the actual game crashed in a
 * browser (symbols that moved or were never wired threw at runtime). The smoke
 * test boots the real app, clicks through every tab + core action, and fails the
 * build on any uncaught exception — the exact class the type-check guardrail and
 * unit tests can't fully cover.
 *
 * e2e specs live in `e2e/` (NOT under `tests/`) so Jest's tests-dir spec matcher
 * never tries to run them with the wrong runner.
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    timeout: 60_000,
    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    // Serve the dev tree (unbundled ES modules from the repo root, exactly what
    // index.html references) so the smoke test exercises the real source, not a
    // bundle. `-c-1` disables HTTP caching so a stale response can't mask a fix.
    webServer: {
        command: 'npx http-server . -p 8080 -c-1 --silent',
        url: 'http://localhost:8080',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
});
