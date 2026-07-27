// @ts-check
/**
 * Freeze mute-clip stimulus (12–15s beat list) for field testing.
 * Outputs screenshots + optional video under artifacts/mute-clip-field/
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../artifacts/mute-clip-field');

test.use({
  viewport: { width: 1280, height: 720 },
  // record video for full mute stimulus
  video: { mode: 'on', size: { width: 1280, height: 720 } }
});

const boot = async (page) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('hasSeenStoryIntroduction', 'true');
    localStorage.setItem('tutorialCompleted', 'true');
  });
  await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
  await page.locator('#close-story-intro').click({ force: true, timeout: 2_000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.story-intro-modal').forEach((el) => el.remove());
    const bootEl = document.getElementById('boot-screen');
    if (bootEl) {
      bootEl.style.display = 'none';
      bootEl.style.pointerEvents = 'none';
    }
  });
  // Force hard Tier 0 mono presentation for deprivation (Opus 5 Rank 4)
  await page.evaluate(() => {
    document.body.classList.remove('tier-1', 'tier-2', 'tier-3', 'tier-4');
    document.body.classList.add('tier-0');
    localStorage.setItem('cw.designTier', '0');
    localStorage.setItem('tutorialCompleted', 'true');
    /** @type {any} */
    const w = window;
    const dts = w.uiManager?.systems?.designTierSystem;
    if (dts?.applyTier) {
      try { dts.applyTier(0); } catch { /* optional */ }
    }
    w.uiManager?.compileGoalUI?.update?.();
  });
  await page.waitForTimeout(300);
};

test('mute-clip stimulus: Tier0 → cast/goal → heal → SHARE_RESTORE', async ({ page }) => {
  fs.mkdirSync(outDir, { recursive: true });
  await boot(page);

  // Beat 0–3s: Tier 0 shell
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '01-tier0.png'), fullPage: false });
  await page.waitForTimeout(1500);

  // Beat 3–6s: cast + goal rail
  await page.locator('#cast-button, #cast-btn, button:has-text("EXEC")').first().click({ force: true, timeout: 3000 }).catch(() => {});
  await page.evaluate(() => {
    localStorage.setItem('tutorialCompleted', 'true');
    /** @type {any} */
    const w = window;
    w.uiManager?.compileGoalUI?.update?.();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '02-cast-goal.png'), fullPage: false });
  await page.waitForTimeout(1500);

  // Beat 6–12s: tier advance ceremony
  const detail = await page.evaluate(() => {
    /** @type {any} */
    const w = window;
    const dts = w.uiManager?.systems?.designTierSystem || w.designTierSystem;
    if (!dts?.emitTierAdvance) return null;
    dts.emitTierAdvance(0, 1);
    document.body.classList.add('tier-1');
    return w.__lastTierAdvance || { fromTier: 0, toTier: 1 };
  });
  expect(detail, 'tier advance detail').toBeTruthy();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '03-heal-ceremony.png'), fullPage: false });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(outDir, '04-system-restore.png'), fullPage: false });

  // Beat 12–15s: SHARE_RESTORE visible
  const share = page.locator('#heal-share-button');
  await expect(share).toBeVisible({ timeout: 5000 });
  await expect(share).toContainText('SHARE_RESTORE');
  await page.screenshot({ path: path.join(outDir, '05-share-restore.png'), fullPage: false });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '06-end-frame.png'), fullPage: false });

  // Manifest for field kit
  const manifest = {
    created: new Date().toISOString(),
    durationHintSec: 15,
    mute: true,
    beats: [
      '01-tier0.png',
      '02-cast-goal.png',
      '03-heal-ceremony.png',
      '04-system-restore.png',
      '05-share-restore.png',
      '06-end-frame.png'
    ],
    detail,
    questions: [
      'What just happened?',
      'Did the UI change? How?',
      'Would you open the link? Why/why not?',
      'One-word description of the game.'
    ],
    passRule: '≥4/5 spontaneous restored/healed/fixed/online'
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
});
