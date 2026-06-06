// @ts-check
import { test, expect } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, cpSync, mkdtempSync, rmSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, 'dist');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const manifestScreenshots = ['screenshots/mobile-1.png', 'screenshots/desktop-1.png'];

/** @type {import('node:child_process').ChildProcess[]} */
const servers = [];

/** @type {string | undefined} */
let tempPagesRoot;
/** @type {string} */
let rootUrl;
/** @type {string} */
let pagesUrl;

test.describe.configure({ mode: 'serial' });
test.setTimeout(90_000);

const getFreePort = () => new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        server.close(() => {
            if (address && typeof address === 'object') resolve(address.port);
            else reject(new Error('Could not allocate a local port'));
        });
    });
});

const waitForHttp = async (url) => {
    const deadline = Date.now() + 15_000;
    let lastError = new Error('No request attempted');

    while (Date.now() < deadline) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (response.status < 500) return;
            lastError = new Error(`HTTP ${response.status} from ${url}`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw lastError;
};

const startServer = async (root, port) => {
    const child = spawn(npxCommand, ['http-server', root, '-p', String(port), '-c-1', '--silent'], {
        cwd: repoRoot,
        stdio: 'ignore'
    });
    servers.push(child);
    await waitForHttp(`http://127.0.0.1:${port}/`);
};

const stopServer = (child) => new Promise((resolve) => {
    if (child.exitCode !== null || child.killed) {
        resolve();
        return;
    }

    const timeout = setTimeout(resolve, 1500);
    child.once('exit', () => {
        clearTimeout(timeout);
        resolve();
    });
    child.kill();
});

const collectRuntimeIssues = (page) => {
    /** @type {string[]} */
    const issues = [];
    const crashPattern = /(is not a function|is not defined|cannot read|cannot access|undefined is not|is not a constructor|TypeError|ReferenceError|SyntaxError)/i;
    const ignorePattern = /(favicon|manifest|service.?worker|sw\.js|net::ERR_ABORTED|AudioContext|play\(\) request)/i;

    page.on('pageerror', (error) => issues.push(error.message));
    page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (ignorePattern.test(text)) return;
        if (crashPattern.test(text)) issues.push(text);
    });

    return issues;
};

const bootProductionApp = async (page, url) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });
};

test.beforeAll(async () => {
    execFileSync('npm', ['run', 'build:prod'], { cwd: repoRoot, stdio: 'inherit' });

    tempPagesRoot = mkdtempSync(path.join(os.tmpdir(), 'cyberwitches-pages-'));
    const pagesProjectDir = path.join(tempPagesRoot, 'CyberWitches');
    cpSync(distDir, pagesProjectDir, { recursive: true });

    const rootPort = await getFreePort();
    const pagesPort = await getFreePort();
    rootUrl = `http://127.0.0.1:${rootPort}/`;
    pagesUrl = `http://127.0.0.1:${pagesPort}/CyberWitches/`;

    await startServer(distDir, rootPort);
    await startServer(tempPagesRoot, pagesPort);
    await waitForHttp(pagesUrl);
});

test.afterAll(async () => {
    await Promise.all(servers.map(stopServer));
    if (tempPagesRoot) {
        rmSync(tempPagesRoot, { recursive: true, force: true });
    }
});

test('production build ships the offline shell and manifest screenshots', async ({ page }) => {
    expect(existsSync(path.join(distDir, 'offline.html'))).toBe(true);
    for (const screenshot of manifestScreenshots) {
        expect(existsSync(path.join(distDir, screenshot))).toBe(true);
    }

    const issues = collectRuntimeIssues(page);
    await bootProductionApp(page, rootUrl);

    const result = await page.evaluate(async ({ manifestScreenshots }) => {
        const manifestResponse = await fetch('manifest.json', { cache: 'no-store' });
        const manifest = await manifestResponse.json();
        const assetStatuses = await Promise.all([
            'offline.html',
            'sw.js',
            ...manifestScreenshots
        ].map(async (asset) => {
            const response = await fetch(asset, { cache: 'no-store' });
            return { asset, status: response.status, url: response.url };
        }));

        return {
            manifestStartUrl: manifest.start_url,
            manifestScope: manifest.scope,
            assetStatuses
        };
    }, { manifestScreenshots });

    expect(result.manifestStartUrl).toBe('./');
    expect(result.manifestScope).toBe('./');
    expect(result.assetStatuses).toEqual(expect.arrayContaining(
        ['offline.html', 'sw.js', ...manifestScreenshots].map((asset) => expect.objectContaining({ asset, status: 200 }))
    ));
    expect(issues, `Production root runtime issues:\n${issues.join('\n') || '(none)'}`).toEqual([]);
});

test('production build boots cleanly under the GitHub Pages project path', async ({ page }) => {
    const issues = collectRuntimeIssues(page);
    await bootProductionApp(page, pagesUrl);
    await page.locator('#cast-button').click({ force: true, timeout: 4000 });
    await page.locator('.tab-btn[data-tab="experiment"]').click({ force: true, timeout: 4000 });
    await expect(page.locator('#experiment-tab')).toBeVisible();
    await page.locator('#experiment-button').click({ force: true, timeout: 4000 });
    await expect(page.locator('#experiment-result')).toContainText(/No new recipes discovered|Discovered|Experiment failed/, { timeout: 5_000 });

    const result = await page.evaluate(async ({ manifestScreenshots }) => {
        const manifest = await fetch('manifest.json', { cache: 'no-store' }).then((response) => response.json());
        const assetStatuses = await Promise.all([
            'manifest.json',
            'offline.html',
            'sw.js',
            ...manifestScreenshots
        ].map(async (asset) => {
            const response = await fetch(asset, { cache: 'no-store' });
            return { asset, status: response.status, url: response.url };
        }));

        return {
            pathname: window.location.pathname,
            manifestStartUrl: manifest.start_url,
            manifestScope: manifest.scope,
            assetStatuses
        };
    }, { manifestScreenshots });

    expect(result.pathname).toBe('/CyberWitches/');
    expect(result.manifestStartUrl).toBe('./');
    expect(result.manifestScope).toBe('./');
    for (const assetStatus of result.assetStatuses) {
        expect(assetStatus.status).toBe(200);
        expect(assetStatus.url).toContain('/CyberWitches/');
    }
    expect(issues, `Production Pages-path runtime issues:\n${issues.join('\n') || '(none)'}`).toEqual([]);
});

test('service worker controls the Pages-path app and offline reload still boots the game', async ({ page, context }) => {
    const issues = collectRuntimeIssues(page);
    await bootProductionApp(page, pagesUrl);

    const registration = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) {
            return { supported: false, active: false, scope: null };
        }
        const readyRegistration = await navigator.serviceWorker.ready;
        return {
            supported: true,
            active: !!readyRegistration.active,
            scope: readyRegistration.scope
        };
    });

    expect(registration).toEqual({
        supported: true,
        active: true,
        scope: pagesUrl
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15_000 });

    try {
        await context.setOffline(true);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });

        const offlineBoot = await page.evaluate(() => ({
            booted: !!window.gameState,
            controlled: !!navigator.serviceWorker.controller,
            pathname: window.location.pathname,
            offlineFallbackVisible: document.body.innerText.includes('NETWORK_CONNECTION_FAILED')
        }));

        expect(offlineBoot).toEqual({
            booted: true,
            controlled: true,
            pathname: '/CyberWitches/',
            offlineFallbackVisible: false
        });
    } finally {
        await context.setOffline(false);
    }

    expect(issues, `Service-worker runtime issues:\n${issues.join('\n') || '(none)'}`).toEqual([]);
});
