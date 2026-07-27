// @ts-check
/**
 * Shared first-run overlay dismiss for smoke / progression e2e.
 * @param {import('@playwright/test').Page} page
 */
export async function dismissFirstRunOverlays(page) {
    await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
    const welcome = page.locator('#close-welcome-button');
    if (await welcome.count().catch(() => 0)) {
        await welcome.click({ force: true, timeout: 4000 }).catch(() => {});
    }
    // Force-hide stuck boot screen after TutorialSystem should have finished
    await page.waitForTimeout(500);
    await page.waitForFunction(() => {
        const story = document.querySelector('.story-intro-modal');
        const boot = document.getElementById('boot-screen');
        const storyGone = !story || getComputedStyle(story).display === 'none';
        const bootGone = !boot || getComputedStyle(boot).display === 'none' || Number(getComputedStyle(boot).opacity) === 0;
        return storyGone && bootGone;
    }, null, { timeout: 15_000 }).catch(async () => {
        await page.evaluate(() => {
            const boot = document.getElementById('boot-screen');
            if (boot) {
                boot.style.display = 'none';
                boot.style.pointerEvents = 'none';
            }
            document.querySelectorAll('.story-intro-modal').forEach((el) => {
                /** @type {HTMLElement} */ (el).style.display = 'none';
            });
        });
        const still = await page.evaluate(() => {
            const boot = document.getElementById('boot-screen');
            return !!(boot && getComputedStyle(boot).display !== 'none');
        });
        if (still) throw new Error('Boot screen stuck after force dismiss');
    });
}
