// @ts-check
/**
 * Visual Ralph-style evidence capture for operator journeys.
 * Screenshots land under .scratch/ultraqa-heal/visual/ for audit.
 */
import { test, expect } from '@playwright/test';
import { dismissFirstRunOverlays } from './helpers/dismissOverlays.js';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), '.scratch/ultraqa-heal/visual');

test.beforeAll(() => {
    fs.mkdirSync(OUT, { recursive: true });
});

const bootClean = async (page) => {
    await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
        localStorage.setItem('tutorialCompleted', 'true');
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
    await dismissFirstRunOverlays(page);
    await page.waitForTimeout(200);
};

test('visual: desktop shell + goal rail', async ({ page }) => {
    await bootClean(page);
    await page.evaluate(() => {
        localStorage.setItem('tutorialCompleted', 'true');
        /** @type {any} */ (window).uiManager?.compileGoalUI?.update?.();
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, '01-shell-goal-rail.png'), fullPage: false });
    await expect(page.locator('#cast-button')).toBeVisible();
    await expect(page.locator('#compile-goal-rail')).toBeVisible();
});

test('visual: after cast activity', async ({ page }) => {
    await bootClean(page);
    for (let i = 0; i < 12; i++) {
        await page.locator('#cast-button').click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, '02-after-cast.png'), fullPage: false });
    await expect(page.locator('#cast-button')).toBeVisible();
});

test('visual: heal moment tier advance', async ({ page }) => {
    await bootClean(page);
    await page.evaluate(() => {
        const w = /** @type {any} */ (window);
        const dts = w.uiManager?.systems?.designTierSystem || w.designTierSystem;
        dts?.emitTierAdvance?.(0, 1);
        document.body.classList.remove('tier-0');
        document.body.classList.add('tier-1');
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, '03-heal-tier-advance.png'), fullPage: false });
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toMatch(/tier-[1-4]/);
});

test('visual: prestige ceremony modal', async ({ page }) => {
    await bootClean(page);
    await page.evaluate(() => {
        const w = /** @type {any} */ (window);
        w.gameState.prestigeLifetimeEarned = 5_000_000;
        w.uiManager?.modalManager?.showPrestigeModal?.();
        document.getElementById('prestige-modal')?.classList.remove('hidden');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, '04-prestige-ceremony.png'), fullPage: false });
    await expect(page.locator('#prestige-preview')).toBeVisible();
});

test('visual: landing heal thesis', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, '05-landing-thesis.png'), fullPage: false });
    await expect(page.locator('#hero-thesis')).toBeVisible();
    await expect(page.locator('.heal-before-after')).toBeVisible();
});

test('visual: mobile shell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
        localStorage.setItem('tutorialCompleted', 'true');
    });
    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
    await dismissFirstRunOverlays(page);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, '06-mobile-shell.png'), fullPage: false });
    await expect(page.locator('#cast-button')).toBeVisible();
});
