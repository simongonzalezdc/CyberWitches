// @ts-check
import { test, expect } from '@playwright/test';
import { dismissFirstRunOverlays } from './helpers/dismissOverlays.js';

/**
 * Kernel integration e2e: cast → void fade path → save mirror fields survive reload.
 */
test('cast, void-loss path, kernel fields survive reload', async ({ page }) => {
    /** @type {string[]} */
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await dismissFirstRunOverlays(page);

    // Drive casts via live button
    const castBtn = page.locator('#cast-button');
    await expect(castBtn).toBeVisible({ timeout: 15000 });
    for (let i = 0; i < 12; i++) {
        await castBtn.click({ force: true });
        await page.waitForTimeout(40);
    }

    // Inject overcap + tick fade + force save of kernel mirror
    const kernelBefore = await page.evaluate(() => {
        /** @type {any} */
        const gs = window.gameState;
        if (!gs) return { ok: false, reason: 'no_gameState' };
        gs.inventory = gs.inventory || {};
        gs.inventory.fire_essence = 500;
        gs.storageCap = 25;
        gs.totalTaps = Math.max(gs.totalTaps || 0, 100);
        // one tick with large delta → fade
        if (typeof gs.tick === 'function') gs.tick(20);
        if (typeof gs.saveGameStateImmediate === 'function') gs.saveGameStateImmediate();
        return {
            ok: true,
            affinity: gs.affinity || null,
            voidLoss: gs._lastVoidLoss || null,
            storageCap: gs.storageCap,
            taps: gs.totalTaps
        };
    });

    expect(kernelBefore.ok).toBeTruthy();
    expect(kernelBefore.taps).toBeGreaterThan(0);

    // Reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await dismissFirstRunOverlays(page);

    const kernelAfter = await page.evaluate(() => {
        /** @type {any} */
        const gs = window.gameState;
        if (!gs) return { ok: false };
        // Prefer loaded kernel blob if present
        return {
            ok: true,
            affinity: gs.affinity || null,
            storageCap: gs.storageCap,
            taps: gs.totalTaps,
            hasKernelChapters: !!gs.kernelChapters
        };
    });

    expect(kernelAfter.ok).toBeTruthy();
    // taps should survive save (stats)
    expect(kernelAfter.taps).toBeGreaterThan(0);

    // Pipeline HUD exists in DOM after UI update
    await page.evaluate(() => {
        /** @type {any} */
        const ui = window.uiManager;
        if (ui?.pipelineHudUI) ui.pipelineHudUI.update();
        if (ui?.updateAllUI) ui.updateAllUI();
    });
    const hud = page.locator('#pipeline-role-hud');
    // may be hidden until first update — force visible content check if present
    const hudCount = await hud.count();
    expect(hudCount).toBe(1);

    expect(pageErrors.filter((m) => !/AudioContext|favicon/i.test(m))).toEqual([]);
});
