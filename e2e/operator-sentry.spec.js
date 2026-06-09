// @ts-check
import { test, expect } from '@playwright/test';

const issueText = (items) => items.map((item) => `- ${item}`).join('\n') || '(none)';

const attachStrictRuntimeSentry = (page) => {
    /** @type {string[]} */
    const issues = [];

    page.on('pageerror', (error) => {
        issues.push(`pageerror: ${error.message}`);
    });

    page.on('console', (message) => {
        if (!['warning', 'error'].includes(message.type())) return;
        issues.push(`${message.type()}: ${message.text()}`);
    });

    page.on('requestfailed', (request) => {
        const failure = request.failure()?.errorText || 'unknown failure';
        const url = request.url();
        if (/favicon\.ico/i.test(url)) return;
        issues.push(`requestfailed: ${failure} ${url}`);
    });

    return issues;
};

const topHitTarget = async (page, selector) => page.locator(selector).first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const top = document.elementFromPoint(x, y);
    return {
        expectedTag: element.tagName,
        expectedId: element.id,
        expectedClass: String(element.className),
        topTag: top?.tagName || null,
        topId: top?.id || null,
        topClass: top ? String(top.className) : null,
        topText: top?.textContent?.trim().slice(0, 80) || null,
        isExpectedOrChild: top === element || element.contains(top)
    };
});

const expectHumanClickable = async (page, selector, label) => {
    const locator = page.locator(selector).first();
    await expect(locator, `${label} should be visible`).toBeVisible();
    await expect(locator, `${label} should be enabled`).toBeEnabled();
    const hit = await topHitTarget(page, selector);
    expect(hit.isExpectedOrChild, `${label} should be the top pointer target, got ${JSON.stringify(hit)}`).toBe(true);
    await locator.click({ timeout: 5_000 });
};

const waitForGame = async (page) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });
};

test('operator sentry: first-run player can reach and use crafting stations with normal clicks', async ({ page }) => {
    const issues = attachStrictRuntimeSentry(page);

    await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await waitForGame(page);

    await expect(page.locator('.story-intro-modal')).toBeVisible();
    await expectHumanClickable(page, '#close-story-intro', 'first-run story close button');

    await page.waitForFunction(() => {
        const boot = document.querySelector('#boot-screen');
        return !boot || window.getComputedStyle(boot).display === 'none';
    }, null, { timeout: 12_000 });

    for (let i = 0; i < 20; i++) {
        await expectHumanClickable(page, '#cast-button', `EXEC button click ${i + 1}`);
    }

    await page.waitForFunction(() => {
        const gs = /** @type {any} */ (window).gameState;
        return (gs.inventory?.fire_essence || 0) >= 10;
    }, null, { timeout: 5_000 });

    await expectHumanClickable(
        page,
        '#workstation-list button[data-action="craft"][data-ws-id="ws_fire_forge"]',
        'Fire Forge craft button'
    );

    const state = await page.evaluate(() => {
        const gs = /** @type {any} */ (window).gameState;
        return {
            fireEssence: gs.inventory.fire_essence || 0,
            fireForgeCount: gs.workstations.ws_fire_forge || 0,
            totalWorkstationsCrafted: gs.totalWorkstationsCrafted || 0
        };
    });

    expect(state.fireForgeCount, 'normal human click should craft one Fire Forge').toBe(1);
    expect(state.totalWorkstationsCrafted, 'crafting should update durable workstation stats').toBe(1);
    expect(issues, `Strict runtime issues:\n${issueText(issues)}`).toEqual([]);
});

test('operator sentry: returning-player core controls have no invisible blockers', async ({ page }) => {
    const issues = attachStrictRuntimeSentry(page);

    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    });
    await waitForGame(page);

    const selectors = [
        ['#cast-button', 'EXEC button'],
        ['.tab-btn[data-tab="inventory"]', 'inventory tab'],
        ['.tab-btn[data-tab="workstations"]', 'workstations tab'],
        ['#help-button', 'help button'],
        ['#settings-button', 'settings button']
    ];

    for (const [selector, label] of selectors) {
        const hit = await topHitTarget(page, selector);
        expect(hit.isExpectedOrChild, `${label} should be topmost, got ${JSON.stringify(hit)}`).toBe(true);
    }

    await expectHumanClickable(page, '.tab-btn[data-tab="inventory"]', 'inventory tab');
    await expect(page.locator('#inventory-tab')).toBeVisible();
    await expectHumanClickable(page, '.tab-btn[data-tab="workstations"]', 'workstations tab');
    await expect(page.locator('#workstations-tab')).toBeVisible();

    expect(issues, `Strict runtime issues:\n${issueText(issues)}`).toEqual([]);
});
