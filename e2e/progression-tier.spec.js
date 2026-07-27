// @ts-check
import { test, expect } from '@playwright/test';
import { dismissFirstRunOverlays } from './helpers/dismissOverlays.js';

test('design tier advances when AB and achievements criteria met', async ({ page }) => {
    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
    await dismissFirstRunOverlays(page);

    // Force criteria: enough AB + 3 unlocked achievements + run tier check
    await page.evaluate(() => {
        const w = /** @type {any} */ (window);
        const gs = w.gameState;
        gs.ab = 600;
        gs.abTotalEarned = Math.max(gs.abTotalEarned || 0, 600);
        // Prefer real achievements system if present
        const ach = w.achievements || w.uiManager?.systems?.achievements;
        if (ach && ach.unlockedAchievements) {
            // mark first three as unlocked if structure allows
            const list = ach.achievements || ach.allAchievements || [];
            const ids = (Array.isArray(list) ? list : []).slice(0, 3).map((a) => a.id).filter(Boolean);
            if (ach.unlockedAchievements instanceof Set) {
                ids.forEach((id) => ach.unlockedAchievements.add(id));
            } else if (Array.isArray(ach.unlockedAchievements)) {
                ids.forEach((id) => {
                    if (!ach.unlockedAchievements.includes(id)) ach.unlockedAchievements.push(id);
                });
            }
        }
        // Stub getUnlockedCount if still 0
        if (ach && typeof ach.getUnlockedCount === 'function' && ach.getUnlockedCount() < 3) {
            ach.getUnlockedCount = () => 3;
        }
        if (!w.achievements && w.uiManager?.systems) {
            w.achievements = { getUnlockedCount: () => 3, getTotalCount: () => 30 };
            w.uiManager.systems.achievements = w.achievements;
        }
        if (w.achievements && w.achievements.getUnlockedCount() < 3) {
            w.achievements.getUnlockedCount = () => 3;
        }
        const dts = w.uiManager?.systems?.designTierSystem || w.designTierSystem;
        if (dts && typeof dts.checkTierUnlocks === 'function') {
            dts.checkTierUnlocks();
        }
    });

    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
        const w = /** @type {any} */ (window);
        const dts = w.uiManager?.systems?.designTierSystem || w.designTierSystem;
        const bodyTier = document.body.className;
        return {
            currentTier: dts?.getCurrentTier?.() ?? dts?.currentTier ?? null,
            unlocked: dts?.getUnlockedTiers?.() ?? Array.from(dts?.unlockedTiers || []),
            bodyHasTier1: document.body.classList.contains('tier-1') || document.body.classList.contains('tier-2')
                || document.body.classList.contains('tier-3') || document.body.classList.contains('tier-4'),
            bodyClasses: bodyTier,
            achCount: w.achievements?.getUnlockedCount?.() ?? null,
            ab: w.gameState?.ab ?? null,
            systemsKey: !!(w.uiManager?.systems?.achievements)
        };
    });

    expect(result.systemsKey || result.achCount !== null).toBeTruthy();
    expect(result.ab).toBeGreaterThanOrEqual(500);
    // Must leave pure tier-0-only chrome when criteria met
    const leftTier0Only = result.bodyHasTier1 || (typeof result.currentTier === 'number' && result.currentTier >= 1)
        || (Array.isArray(result.unlocked) && result.unlocked.includes(1));
    expect(leftTier0Only).toBeTruthy();
});

test('meditationState bridge multiplies production when present', async ({ page }) => {
    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
    await dismissFirstRunOverlays(page);

    const mult = await page.evaluate(() => {
        const w = /** @type {any} */ (window);
        const gs = w.gameState;
        // inject fake meditation bonus
        w.meditationState = {
            getMeditationProductionBonus: () => 1.5
        };
        gs.invalidateMultiplierCache?.();
        const withBonus = gs.getProductionMultiplier('ws_fire_forge');
        w.meditationState = {
            getMeditationProductionBonus: () => 1.0
        };
        gs.invalidateMultiplierCache?.();
        const baseline = gs.getProductionMultiplier('ws_fire_forge');
        return { withBonus, baseline };
    });

    expect(mult.withBonus).toBeGreaterThan(mult.baseline * 1.2);
});
