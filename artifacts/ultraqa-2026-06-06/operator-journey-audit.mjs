import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactRoot = path.join(repoRoot, 'artifacts', 'ultraqa-2026-06-06');
const cycle = process.env.ULTRAQA_CYCLE || 'manual';
const runDir = path.join(artifactRoot, `cycle-${cycle}`);
await fs.mkdir(runDir, { recursive: true });

const targets = [
    { name: 'source', root: repoRoot, port: 8091 },
    { name: 'production', root: path.join(repoRoot, 'dist'), port: 8092 }
];

const issue = (severity, target, area, message, evidence = {}) => ({
    severity,
    target,
    area,
    message,
    evidence
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withTimeout(label, targetName, issues, fn, timeout = 60_000) {
    console.info(`[journey] ${targetName}:${label}`);
    let timer;
    try {
        return await Promise.race([
            fn(),
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeout}ms`)), timeout);
            })
        ]);
    } catch (error) {
        issues.push(issue('P1', targetName, label, error.message));
        return null;
    } finally {
        clearTimeout(timer);
    }
}

async function safeClose(context) {
    await Promise.race([
        context.close().catch(() => {}),
        wait(1_000)
    ]);
}

async function waitForServer(url, timeout = 15_000) {
    const start = Date.now();
    let lastError;
    while (Date.now() - start < timeout) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.status < 500) return;
        } catch (error) {
            lastError = error;
        }
        await wait(250);
    }
    throw lastError || new Error(`Server did not become ready: ${url}`);
}

async function withServer(target, fn) {
    const server = spawn('npx', ['http-server', target.root, '-p', String(target.port), '-c-1', '--silent'], {
        cwd: repoRoot,
        stdio: 'ignore'
    });
    try {
        await waitForServer(`http://127.0.0.1:${target.port}/`);
        return await fn(`http://127.0.0.1:${target.port}`);
    } finally {
        server.kill('SIGTERM');
        await wait(250);
    }
}

function attachObservers(page, targetName, issues, network) {
    page.on('pageerror', (error) => {
        issues.push(issue('P1', targetName, 'runtime', `Uncaught page error: ${error.message}`));
    });
    page.on('console', (msg) => {
        const text = msg.text();
        if (msg.type() === 'error') {
            const ignorable = /favicon|AudioContext|play\(\) request|Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(text);
            if (!ignorable) issues.push(issue('P2', targetName, 'console', text));
        }
    });
    page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
            const url = response.url();
            if (!/favicon\.ico/i.test(url)) {
                network.push({ status, url });
            }
        }
    });
}

async function boot(page, baseURL, skipStory = true) {
    await page.addInitScript(({ skipStory }) => {
        localStorage.setItem('tutorialSkipped', 'true');
        if (skipStory) localStorage.setItem('hasSeenStoryIntroduction', 'true');
        else localStorage.removeItem('hasSeenStoryIntroduction');
    }, { skipStory });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.gameState), null, { timeout: 30_000 });
}

async function dismissStory(page) {
    await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 });
}

async function visibleBox(page, selector) {
    return await page.locator(selector).first().boundingBox().catch(() => null);
}

async function capture(page, target, name) {
    const file = path.join(runDir, `${target}-${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    return file;
}

async function auditTarget(browser, target, baseURL) {
    const issues = [];
    const network = [];
    const evidence = {
        target: target.name,
        baseURL,
        screenshots: [],
        metrics: {},
        tabs: [],
        keyboard: [],
        saveIO: {},
        wipe: {}
    };

    // First-run story journey.
    await withTimeout('first-run-story', target.name, issues, async () => {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, serviceWorkers: 'block' });
        const page = await context.newPage();
        attachObservers(page, target.name, issues, network);
        await boot(page, baseURL, false);
        const storyVisible = await page.locator('.story-intro-modal').isVisible().catch(() => false);
        if (!storyVisible) issues.push(issue('P1', target.name, 'onboarding', 'First-run story did not render.'));
        evidence.screenshots.push(await capture(page, target.name, 'story-mobile'));
        const beforeSeen = await page.evaluate(() => localStorage.getItem('hasSeenStoryIntroduction'));
        await page.locator('#close-story-intro').dispatchEvent('click');
        await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 });
        const afterSeen = await page.evaluate(() => localStorage.getItem('hasSeenStoryIntroduction'));
        if (beforeSeen === 'true') issues.push(issue('P2', target.name, 'onboarding', 'Story was marked seen before user dismissed it.'));
        if (afterSeen !== 'true') issues.push(issue('P2', target.name, 'onboarding', 'Story dismissal did not persist hasSeenStoryIntroduction.'));
        await safeClose(context);
    });

    // Main desktop operator journey.
    await withTimeout('desktop-core', target.name, issues, async () => {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, serviceWorkers: 'block' });
        const page = await context.newPage();
        attachObservers(page, target.name, issues, network);
        await boot(page, baseURL, true);
        await dismissStory(page);
        await page.waitForSelector('#cast-button', { state: 'visible', timeout: 10_000 });
        evidence.screenshots.push(await capture(page, target.name, 'desktop-shell'));

        const startAB = await page.evaluate(() => window.gameState?.ab ?? 0);
        for (let i = 0; i < 6; i++) await page.locator('#cast-button').dispatchEvent('click');
        await page.waitForTimeout(150);
        const endAB = await page.evaluate(() => window.gameState?.ab ?? 0);
        evidence.metrics.castDelta = endAB - startAB;
        if (!(endAB > startAB)) issues.push(issue('P1', target.name, 'casting', 'Cast button did not increase Arcane Bits.', { startAB, endAB }));

        const tabs = await page.locator('.tab-btn').evaluateAll((nodes) => nodes.map((node) => ({
            tab: node.getAttribute('data-tab'),
            locked: node.classList.contains('locked'),
            text: node.textContent?.trim()
        })));
        for (const tab of tabs) {
            if (!tab.tab) continue;
            await page.locator(`.tab-btn[data-tab="${tab.tab}"]`).dispatchEvent('click');
            await page.waitForTimeout(180);
            const active = await page.evaluate(() => document.querySelector('.tab-btn.active')?.getAttribute('data-tab'));
            const panel = await visibleBox(page, `#${tab.tab}-tab`);
            evidence.tabs.push({ ...tab, active, panelVisible: Boolean(panel) });
            if (tab.locked) {
                if (active === tab.tab) issues.push(issue('P2', target.name, 'tabs', `Locked tab activated: ${tab.tab}`));
            } else if (active !== tab.tab || !panel) {
                issues.push(issue('P1', target.name, 'tabs', `Unlocked tab did not activate/render: ${tab.tab}`, { active, panel }));
            }
        }

        const keyboardMap = [
            ['1', 'workstations'],
            ['2', 'inscriptions'],
            ['3', 'inventory'],
            ['4', 'experiment'],
            ['5', 'dailies'],
            ['8', 'stats']
        ];
        for (const [key, expected] of keyboardMap) {
            await page.keyboard.press(key);
            await page.waitForTimeout(80);
            const active = await page.evaluate(() => document.querySelector('.tab-btn.active')?.getAttribute('data-tab'));
            evidence.keyboard.push({ key, expected, active });
            if (active !== expected) issues.push(issue('P2', target.name, 'keyboard', `Shortcut ${key} did not activate ${expected}.`, { active }));
        }

        await page.locator('#help-button').dispatchEvent('click');
        if (!await page.locator('#help-modal').isVisible().catch(() => false)) {
            issues.push(issue('P1', target.name, 'modal', 'Help modal did not open.'));
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(120);
        if (await page.locator('#help-modal').isVisible().catch(() => false)) {
            issues.push(issue('P2', target.name, 'modal', 'Help modal did not close on Escape.'));
        }

        await page.locator('#settings-button').dispatchEvent('click');
        if (!await page.locator('#settings-modal').isVisible().catch(() => false)) {
            issues.push(issue('P1', target.name, 'modal', 'Settings modal did not open.'));
        }
        evidence.screenshots.push(await capture(page, target.name, 'settings-modal'));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(120);
        if (await page.locator('#settings-modal').isVisible().catch(() => false)) {
            issues.push(issue('P2', target.name, 'modal', 'Settings modal did not close on Escape.'));
        }

        await page.locator('.tab-btn[data-tab="experiment"]').dispatchEvent('click');
        await page.locator('#experiment-button').dispatchEvent('click');
        await page.waitForTimeout(250);
        const experimentText = await page.locator('#experiment-result').innerText().catch(() => '');
        evidence.metrics.experimentTextLength = experimentText.trim().length;
        if (!experimentText.trim()) issues.push(issue('P2', target.name, 'experiment', 'Experiment action produced no visible result text.'));

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        evidence.metrics.desktopOverflowX = overflow;
        if (overflow > 2) issues.push(issue('P2', target.name, 'layout', 'Desktop horizontal overflow detected.', { overflow }));
        await safeClose(context);
    });

    // File System Access export/import journey.
    await withTimeout('save-export-import', target.name, issues, async () => {
        const context = await browser.newContext({ viewport: { width: 900, height: 800 }, acceptDownloads: true, serviceWorkers: 'block' });
        const page = await context.newPage();
        attachObservers(page, target.name, issues, network);
        await page.addInitScript(() => {
            window.__fsWrites = [];
            window.__importText = '';
            window.showSaveFilePicker = async () => ({
                createWritable: async () => ({
                    write: async (data) => window.__fsWrites.push(String(data ?? '')),
                    close: async () => {}
                })
            });
            window.showOpenFilePicker = async () => [{
                getFile: async () => new window.File([window.__importText || '{}'], 'cyber-witches-save.json', { type: 'application/json' })
            }];
        });
        await boot(page, baseURL, true);
        await dismissStory(page);
        await page.evaluate(() => window.gameState.saveGameStateImmediate());
        const exportedSeed = await page.evaluate(() => localStorage.getItem('cyberWitchesSave'));
        await page.locator('#settings-button').dispatchEvent('click');
        await page.locator('#export-save-button').dispatchEvent('click');
        await page.waitForTimeout(150);
        const writes = await page.evaluate(() => window.__fsWrites);
        evidence.saveIO.exportWriteLength = writes?.[0]?.length || 0;
        if (!writes?.[0]) issues.push(issue('P1', target.name, 'save-io', 'Export save did not write data through File System Access API.'));

        await page.evaluate((seed) => { window.__importText = seed; }, exportedSeed);
        await page.locator('#import-save-button').dispatchEvent('click');
        await page.waitForTimeout(1_000);
        await page.waitForFunction(() => Boolean(window.gameState), null, { timeout: 5_000 }).catch(() => {});
        const loadedAfterImport = await page.evaluate(() => Boolean(window.gameState));
        evidence.saveIO.importReloaded = loadedAfterImport;
        if (!loadedAfterImport) issues.push(issue('P1', target.name, 'save-io', 'Import save did not reload into a booted game.'));
        await safeClose(context);
    });

    // Destructive wipe journey in isolated storage.
    await withTimeout('wipe-save', target.name, issues, async () => {
        const context = await browser.newContext({ viewport: { width: 900, height: 800 }, serviceWorkers: 'block' });
        const page = await context.newPage();
        attachObservers(page, target.name, issues, network);
        await boot(page, baseURL, true);
        await dismissStory(page);
        await page.evaluate(() => {
            localStorage.setItem('cyberWitchesSave', '{"version":"2.1","ab":123}');
            localStorage.setItem('meditationState', '{"seed":true}');
            localStorage.setItem('cyberWitchesCriticalErrors', '["err"]');
        });
        await page.locator('#settings-button').dispatchEvent('click');
        await page.locator('#clear-save-button').dispatchEvent('click');
        await page.waitForSelector('#destructive-confirm-input', { timeout: 5_000 });
        const disabledBefore = await page.locator('#destructive-confirm-ok').isDisabled();
        await page.locator('#destructive-confirm-input').fill('WIPE SAVE');
        const disabledAfter = await page.locator('#destructive-confirm-ok').isDisabled();
        evidence.wipe.disabledBefore = disabledBefore;
        evidence.wipe.disabledAfter = disabledAfter;
        if (!disabledBefore || disabledAfter) {
            issues.push(issue('P1', target.name, 'wipe-save', 'Destructive confirmation enablement is wrong.', { disabledBefore, disabledAfter }));
        }
        await page.locator('#destructive-confirm-ok').dispatchEvent('click');
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForTimeout(500);
        const keysAfter = await page.evaluate(() => ({
            save: localStorage.getItem('cyberWitchesSave'),
            meditation: localStorage.getItem('meditationState'),
            critical: localStorage.getItem('cyberWitchesCriticalErrors')
        })).catch((error) => ({ error: error.message }));
        evidence.wipe.keysAfter = keysAfter;
        const staleSeedSurvived = typeof keysAfter.save === 'string' && keysAfter.save.includes('"ab":123');
        if (staleSeedSurvived || keysAfter.meditation || keysAfter.critical) {
            issues.push(issue('P1', target.name, 'wipe-save', 'Wipe save left persisted keys behind.', keysAfter));
        }
        await safeClose(context);
    });

    // Responsive visual metrics.
    for (const viewport of [
        { label: 'mobile390', width: 390, height: 844 },
        { label: 'narrow320', width: 320, height: 700 }
    ]) {
        await withTimeout(`responsive-${viewport.label}`, target.name, issues, async () => {
            const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
            const page = await context.newPage();
            attachObservers(page, target.name, issues, network);
            await boot(page, baseURL, true);
            await dismissStory(page);
            await page.waitForSelector('#cast-button', { state: 'visible', timeout: 10_000 });
            evidence.screenshots.push(await capture(page, target.name, viewport.label));
            const metrics = await page.evaluate(() => {
                const cast = document.querySelector('#cast-button')?.getBoundingClientRect();
                const deck = document.querySelector('.control-deck')?.getBoundingClientRect();
                const tabs = document.querySelector('.tabs-nav')?.getBoundingClientRect();
                return {
                    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                    cast: cast ? { x: cast.x, y: cast.y, width: cast.width, height: cast.height } : null,
                    deck: deck ? { x: deck.x, y: deck.y, width: deck.width, height: deck.height } : null,
                    tabs: tabs ? { x: tabs.x, y: tabs.y, width: tabs.width, height: tabs.height } : null
                };
            });
            evidence.metrics[viewport.label] = metrics;
            if (metrics.overflowX > 2) issues.push(issue('P2', target.name, 'responsive', `${viewport.label} horizontal overflow.`, metrics));
            if (!metrics.cast || metrics.cast.width < 44 || metrics.cast.height < 44) {
                issues.push(issue('P1', target.name, 'responsive', `${viewport.label} cast target is below 44px.`, metrics.cast));
            }
            await safeClose(context);
        });
    }

    if (network.length > 0) {
        issues.push(issue('P3', target.name, 'network', 'HTTP errors observed during journeys.', { network }));
    }
    evidence.network = network;

    return { target: target.name, issues, evidence };
}

const browser = await chromium.launch();
const results = [];
try {
    for (const target of targets) {
        results.push(await withServer(target, (baseURL) => auditTarget(browser, target, baseURL)));
    }
} finally {
    await browser.close();
}

const summary = {
    generatedAt: new Date().toISOString(),
    cycle,
    issueCount: results.reduce((sum, result) => sum + result.issues.length, 0),
    results
};

const jsonPath = path.join(runDir, 'operator-journey-audit.json');
await fs.writeFile(jsonPath, JSON.stringify(summary, null, 2));
console.info(JSON.stringify({
    generatedAt: summary.generatedAt,
    cycle,
    issueCount: summary.issueCount,
    issues: results.flatMap((result) => result.issues),
    evidencePath: jsonPath
}, null, 2));
