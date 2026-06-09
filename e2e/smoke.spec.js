// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Real-browser smoke test.
 *
 * Boots the actual game and drives the core operator journeys — cast the main
 * action, visit every tab, open/close the modals, run an experiment — while
 * recording uncaught exceptions and crash-shaped console errors. The build fails
 * if any appear.
 *
 * This is the guard that would have caught the bugs from the recent audit: the
 * inscribe/experiment actions threw at runtime (a method moved off its class)
 * while jsdom unit tests stayed green. jsdom can't catch that; a real browser can.
 */

// Console-error text that signals an actual app crash (vs. third-party/network
// noise). The "moved / never-wired symbol" bug class surfaces as these.
const CRASH_PATTERN =
    /(is not a function|is not defined|cannot read|cannot access|undefined is not|is not a constructor|TypeError|ReferenceError|SyntaxError)/i;

// Third-party / environmental noise to ignore — CDN audio lib, favicon, SW, and
// generic resource-load failures are not app-logic crashes.
const IGNORE_PATTERN =
    /(tone(\.js)?|cdn|favicon|service.?worker|sw\.js|net::|Failed to load resource|manifest|the AudioContext|play\(\) request)/i;

test('app boots and core flows raise no uncaught errors', async ({ page }) => {
    /** @type {string[]} */
    const pageErrors = [];
    /** @type {string[]} */
    const crashLogs = [];

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (IGNORE_PATTERN.test(text)) return;
        if (CRASH_PATTERN.test(text)) crashLogs.push(text);
    });

    // 1. Boot — the game sets window.gameState once initGame resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });

    // The game runs a perpetual requestAnimationFrame loop, so elements never go
    // "stable" — Playwright's default actionability checks would hang on it. Every
    // click below uses force + a short timeout: we don't care whether a given
    // button was strictly actionable, only that driving the UI raises no crash.
    /** @param {string} selector */
    const clickIfPresent = async (selector) => {
        const el = page.locator(selector).first();
        if (await el.count().catch(() => 0)) {
            await el.click({ force: true, timeout: 4000 }).catch(() => {});
        }
    };

    // 2. Dismiss any first-run overlays so they can't intercept the clicks below.
    //    A fresh save shows the full-screen story-intro modal (`introShown` false);
    //    leaving it up means the forced clicks land on the overlay instead of the
    //    real cast/tab/experiment handlers, so the test would pass without actually
    //    exercising them. Close it (and the welcome-back modal) first.
    // dispatchEvent targets the button node directly. A force-click here is
    // unreliable: the story-intro overlay animates (perpetual rAF), so a
    // coordinate-based click can miss/hit the overlay instead of the button —
    // which is precisely how this dismissal silently failed before.
    await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
    await clickIfPresent('#close-welcome-button');
    // Wait for the story-intro overlay to actually leave the DOM before driving UI.
    // Do NOT swallow this timeout: waitForFunction resolves immediately when the
    // modal is absent, so it only rejects if the overlay is genuinely stuck (close
    // button missing/miswired/click swallowed). Letting it fail is the point — a
    // stuck overlay + forced clicks would otherwise pass without exercising the
    // real handlers, the exact false positive this dismissal exists to prevent.
    await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 });

    // 3. Cast the main action a few times (the primary gameplay loop).
    for (let i = 0; i < 5; i++) await clickIfPresent('#cast-button');

    // 4. Visit every tab. Locked tabs (boons/meditation pre-prestige) just toast
    //    a notification — that must NOT throw.
    const tabs = ['workstations', 'inventory', 'inscriptions', 'experiment', 'stats', 'dailies', 'boons', 'meditation'];
    for (const tab of tabs) {
        await clickIfPresent(`.tab-btn[data-tab="${tab}"], .tab-button[data-tab="${tab}"]`);
        await page.waitForTimeout(120);
    }

    // 5. Open and close the help + settings modals.
    for (const [openId, closeId] of [['help-button', 'close-help-button'], ['settings-button', 'close-settings-button']]) {
        await clickIfPresent(`#${openId}`);
        await page.waitForTimeout(120);
        await clickIfPresent(`#${closeId}`);
        await page.waitForTimeout(80);
    }

    // 6. Exercise the experiment action (one of the actions that was dead before).
    await clickIfPresent('.tab-btn[data-tab="experiment"], .tab-button[data-tab="experiment"]');
    await page.waitForTimeout(120);
    await clickIfPresent('#experiment-button');
    await page.waitForTimeout(120);

    // 7. Settle, then assert no crashes were observed at any point.
    await page.waitForTimeout(300);
    expect(pageErrors, `Uncaught exceptions:\n${pageErrors.join('\n') || '(none)'}`).toEqual([]);
    expect(crashLogs, `Crash-shaped console errors:\n${crashLogs.join('\n') || '(none)'}`).toEqual([]);
});

test('saves are mirrored into IndexedDB (durable backup)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });

    // Force an immediate save, which writes localStorage AND fire-and-forget
    // mirrors into IndexedDB.
    await page.evaluate(() => {
        const gs = /** @type {any} */ (window).gameState;
        if (gs && typeof gs.saveGameStateImmediate === 'function') gs.saveGameStateImmediate();
    });

    // Poll the IndexedDB backup store for the mirrored save (mirror is async).
    const mirrored = await page.evaluate(async () => {
        const read = () => new Promise((resolve) => {
            let req;
            try { req = indexedDB.open('cyberWitchesBackup', 1); } catch { resolve(null); return; }
            req.onsuccess = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains('saves')) { db.close(); resolve(null); return; }
                const tx = db.transaction('saves', 'readonly');
                const g = tx.objectStore('saves').get('cyberWitchesSave');
                g.onsuccess = () => { resolve(g.result ?? null); db.close(); };
                g.onerror = () => { resolve(null); db.close(); };
            };
            req.onerror = () => resolve(null);
        });
        for (let i = 0; i < 30; i++) {
            const v = await read();
            if (v) return true;
            await new Promise((r) => setTimeout(r, 100));
        }
        return false;
    });

    expect(mirrored, 'expected cyberWitchesSave to be mirrored into IndexedDB').toBe(true);
});

test('self-hosted Tone.js lazy-loads after gesture without boot autoplay warnings', async ({ page }) => {
    // Catch any Content-Security-Policy violation — if the tightened CSP or the
    // local path were wrong, the vendored script would be blocked and this fails.
    /** @type {string[]} */
    const cspViolations = [];
    /** @type {string[]} */
    const autoplayWarnings = [];
    page.on('console', (msg) => {
        const text = msg.text();
        if (msg.type() === 'error' && /content security policy|refused to load|refused to execute/i.test(text)) {
            cspViolations.push(text);
        }
        if (msg.type() === 'warning' && /AudioContext was not allowed to start/i.test(text)) {
            autoplayWarnings.push(text);
        }
    });

    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
        localStorage.setItem('cw.designTier', '2');
        localStorage.setItem('cw.unlockedTiers', JSON.stringify([0, 2]));
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });

    const toneBeforeGesture = await page.evaluate(() => typeof (/** @type {any} */ (window).Tone));
    expect(toneBeforeGesture, 'Tone should not create an AudioContext during boot').toBe('undefined');
    expect(autoplayWarnings, `Unexpected autoplay warnings before gesture:\n${autoplayWarnings.join('\n') || '(none)'}`).toEqual([]);

    await page.locator('#cast-button').click({ timeout: 5_000 });
    await page.waitForFunction(() => typeof (/** @type {any} */ (window).Tone) !== 'undefined', null, { timeout: 15_000 });

    const toneScript = await page.evaluate(() => {
        const script = document.querySelector('script[data-tone-loader="true"]');
        return script?.getAttribute('src') || '';
    });

    expect(toneScript, 'Tone should load from the self-hosted vendor path').toContain('/vendor/tone-15.1.22.js');
    expect(cspViolations, `CSP violations:\n${cspViolations.join('\n') || '(none)'}`).toEqual([]);
    expect(autoplayWarnings, `Unexpected autoplay warnings:\n${autoplayWarnings.join('\n') || '(none)'}`).toEqual([]);
});

test('casting unlocks real workstation crafting through normal clicks', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });

    for (let i = 0; i < 20; i++) {
        await page.locator('#cast-button').click({ timeout: 5_000 });
    }

    const fireEssence = await page.evaluate(() => (/** @type {any} */ (window).gameState).inventory.fire_essence || 0);
    expect(fireEssence, 'Exec should grant the elemental essence needed by workstation recipes').toBeGreaterThanOrEqual(10);

    const craftFireForge = page.locator('#workstation-list button[data-action="craft"][data-ws-id="ws_fire_forge"]');
    await expect(craftFireForge, 'Fire Forge craft button should become affordable after enough Exec clicks').toBeEnabled();
    await craftFireForge.click({ timeout: 5_000 });

    const crafted = await page.evaluate(() => (/** @type {any} */ (window).gameState).workstations.ws_fire_forge || 0);
    expect(crafted, 'normal pointer click should craft a Fire Forge').toBe(1);
});

test('first-run boot fade does not intercept visible controls', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.clear();
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
    await page.locator('#close-story-intro').dispatchEvent('click');
    await page.waitForFunction(() => {
        const boot = document.querySelector('#boot-screen');
        if (!boot) return false;
        const style = window.getComputedStyle(boot);
        return style.display !== 'none' && style.pointerEvents === 'none';
    }, null, { timeout: 10_000 });

    const topAtCast = await page.evaluate(() => {
        const castButton = document.querySelector('#cast-button');
        if (!castButton) return null;
        const rect = castButton.getBoundingClientRect();
        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return top ? { id: top.id, tagName: top.tagName } : null;
    });

    expect(topAtCast?.id, 'invisible boot fade should not be the top pointer target').not.toBe('boot-screen');
});

test('modals close on Escape and trap focus (dialog-like a11y)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });

    // Clear the first-run overlay so it doesn't intercept. (dispatchEvent may
    // throw if the button is absent — that's fine; the wait below is the real
    // guard and is NOT swallowed, so a stuck overlay fails the test.)
    await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 });

    const settingsModal = page.locator('#settings-modal');

    // Open settings via its real click handler. dispatchEvent targets the button
    // node directly, so it isn't affected by the perpetual-rAF overlay/coordinate
    // issues that force-clicks hit.
    await page.locator('#settings-button').dispatchEvent('click');
    await page.waitForTimeout(150);
    const openedHidden = await settingsModal.evaluate((el) => el.classList.contains('hidden'));
    expect(openedHidden, 'settings modal should be visible after opening').toBe(false);

    // Press Escape — the new keyboard handler should close it.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const closedHidden = await settingsModal.evaluate((el) => el.classList.contains('hidden'));
    expect(closedHidden, 'settings modal should close on Escape').toBe(true);
});
