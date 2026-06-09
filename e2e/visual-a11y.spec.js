// @ts-check
import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const waitForBoot = async (page) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!(/** @type {any} */ (window).gameState), null, { timeout: 30_000 });
};

const waitForRenderedShell = async (page) => {
    await page.waitForFunction(() => {
        const visible = (selector) => {
            const el = document.querySelector(selector);
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 20 && rect.height > 20 && style.visibility !== 'hidden' && style.opacity !== '0';
        };
        return visible('#cast-button') && visible('.tab-btn') && visible('.tabs-content');
    }, null, { timeout: 10_000 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};

const expectNonBlankViewport = async (page, label) => {
    const image = await page.screenshot({ fullPage: false });
    const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
    const base = [data[0], data[1], data[2]];
    let nonUniformPixels = 0;
    let visiblePixels = 0;
    for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const delta = Math.abs(r - base[0]) + Math.abs(g - base[1]) + Math.abs(b - base[2]);
        if (delta > 12) nonUniformPixels++;
        if (r + g + b > 8) visiblePixels++;
    }
    expect(visiblePixels, `${label} should not be a pure black viewport`).toBeGreaterThan(1000);
    expect(nonUniformPixels, `${label} should not be a uniform blank viewport`).toBeGreaterThan(1000);
};

test('desktop shell has centered modals and semantic tabs', async ({ page }) => {
    await waitForBoot(page);
    await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 });
    await waitForRenderedShell(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'desktop should not have horizontal page overflow').toBeLessThanOrEqual(2);
    await expectNonBlankViewport(page, 'desktop shell');

    const tabs = page.locator('.tab-btn');
    await expect(tabs.first()).toHaveAttribute('role', 'tab');
    await expect(tabs.first()).toHaveAttribute('aria-controls', 'workstations-tab');
    await expect(page.locator('#workstations-tab')).toHaveAttribute('role', 'tabpanel');
    await expect(page.locator('#workstations-tab')).toHaveAttribute('tabindex', '-1');

    await page.locator('#settings-button').dispatchEvent('click');
    const modalBox = await page.locator('#settings-modal .modal-content').boundingBox();
    const viewport = page.viewportSize();
    expect(modalBox, 'settings modal should render').toBeTruthy();
    expect(viewport, 'viewport should be available').toBeTruthy();
    if (modalBox && viewport) {
        expect(modalBox.x, 'settings modal should stay inside viewport').toBeGreaterThanOrEqual(0);
        expect(modalBox.y, 'settings modal should stay inside viewport').toBeGreaterThanOrEqual(0);
        expect(modalBox.x + modalBox.width, 'settings modal should not overflow right').toBeLessThanOrEqual(viewport.width);
        expect(modalBox.y + modalBox.height, 'settings modal should not overflow bottom').toBeLessThanOrEqual(viewport.height);
        const centerDelta = Math.abs((modalBox.x + modalBox.width / 2) - viewport.width / 2);
        expect(centerDelta, 'settings modal should be visually centered').toBeLessThan(48);
    }
});

test('first-run story is readable and closes only after user action', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.removeItem('hasSeenStoryIntroduction');
    });
    await waitForBoot(page);

    const story = page.locator('.story-intro-modal');
    await expect(story).toBeVisible();
    await expect(story).toHaveAttribute('role', 'dialog');

    const seenBeforeClose = await page.evaluate(() => localStorage.getItem('hasSeenStoryIntroduction'));
    expect(seenBeforeClose, 'story should not be marked seen while visible').not.toBe('true');

    const storyBox = await page.locator('.story-intro-content').boundingBox();
    const viewport = page.viewportSize();
    expect(storyBox, 'story content should render').toBeTruthy();
    if (storyBox && viewport) {
        expect(storyBox.height, 'story should fit inside viewport with internal scroll').toBeLessThanOrEqual(viewport.height);
    }

    await page.locator('#close-story-intro').dispatchEvent('click');
    await expect(story).toHaveCount(0);
    const seenAfterClose = await page.evaluate(() => localStorage.getItem('hasSeenStoryIntroduction'));
    expect(seenAfterClose).toBe('true');
});

test('mobile shell keeps cast deck visible and content scrollable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForBoot(page);
    await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 });
    await waitForRenderedShell(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'mobile should not have horizontal page overflow').toBeLessThanOrEqual(2);
    await expectNonBlankViewport(page, 'mobile shell');

    const castBox = await page.locator('#cast-button').boundingBox();
    expect(castBox, 'cast button should render on mobile').toBeTruthy();
    if (castBox) {
        expect(castBox.y, 'cast button should be inside mobile viewport').toBeGreaterThanOrEqual(0);
        expect(castBox.y + castBox.height, 'cast button should not be clipped by bottom edge').toBeLessThanOrEqual(844);
    }

    await expect(page.locator('.sidebar')).toBeHidden();
    const contentBox = await page.locator('.tabs-content').boundingBox();
    expect(contentBox, 'mobile content should render').toBeTruthy();
    if (contentBox) {
        expect(contentBox.x, 'mobile content should start near the viewport edge').toBeLessThanOrEqual(2);
        expect(contentBox.width, 'mobile content should not be squeezed by the sidebar').toBeGreaterThanOrEqual(380);
    }

    const tabListBox = await page.locator('.tabs-nav').boundingBox();
    expect(tabListBox, 'mobile tabs should remain visible').toBeTruthy();
    expect(tabListBox?.height || 0, 'mobile tabs should have visible height').toBeGreaterThan(20);

    const bottomClearance = await page.evaluate(async () => {
        const scroller = document.querySelector('.tab-panels-container');
        const deck = document.querySelector('.control-deck');
        if (!scroller || !deck) return null;

        scroller.scrollTop = scroller.scrollHeight;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const finalActions = document.querySelector('#workstation-list .workstation-card:last-child .card-actions');
        const scrollerRect = scroller.getBoundingClientRect();
        const deckRect = deck.getBoundingClientRect();
        const actionsRect = finalActions?.getBoundingClientRect();

        return {
            scrollerBottom: scrollerRect.bottom,
            deckTop: deckRect.top,
            finalActionsBottom: actionsRect?.bottom ?? null
        };
    });

    expect(bottomClearance, 'mobile scroll clearance metrics should exist').toBeTruthy();
    if (bottomClearance) {
        expect(bottomClearance.deckTop, 'control deck should sit below the scroll viewport').toBeGreaterThanOrEqual(bottomClearance.scrollerBottom - 1);
        if (bottomClearance.finalActionsBottom !== null) {
            expect(bottomClearance.finalActionsBottom).toBeLessThanOrEqual(bottomClearance.scrollerBottom);
        }
    }
});
