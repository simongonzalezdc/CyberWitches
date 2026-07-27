// @ts-check
/**
 * Shared first-run overlay dismiss for smoke / progression e2e.
 * Never wait long for optional overlays — story intro is created async and
 * may already be gone or never shown (hasSeenStoryIntroduction).
 * @param {import('@playwright/test').Page} page
 */
export async function dismissFirstRunOverlays(page) {
    // IMPORTANT: Playwright signature is dispatchEvent(type, eventInit?, options?)
    // Passing { timeout } as 2nd arg is treated as eventInit and does NOT cap wait.
    await page
        .locator('#close-story-intro')
        .dispatchEvent('click', {}, { timeout: 500 })
        .catch(() => {});
    await page
        .locator('#close-welcome-button')
        .click({ force: true, timeout: 500 })
        .catch(() => {});

    // Force-remove + mark seen so re-shows don't re-block later steps
    await page.evaluate(() => {
        try {
            localStorage.setItem('hasSeenStoryIntroduction', 'true');
            localStorage.setItem('tutorialCompleted', 'true');
            localStorage.setItem('tutorialSkipped', 'true');
        } catch { /* private */ }

        document.querySelectorAll(
            '.story-intro-modal, .meditation-story-modal, .full-story-modal, .specialization-modal'
        ).forEach((el) => {
            try { el.remove(); } catch { /* ignore */ }
        });

        const boot = document.getElementById('boot-screen');
        if (boot) {
            boot.style.display = 'none';
            boot.style.pointerEvents = 'none';
            boot.style.opacity = '0';
        }
    });
}
