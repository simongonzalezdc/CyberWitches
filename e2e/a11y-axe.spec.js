// @ts-check
import { createRequire } from 'node:module';
import { test, expect } from '@playwright/test';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.setTimeout(60_000);
test.use({ bypassCSP: true });

const boot = async (page, { skipStory = true } = {}) => {
    await page.addInitScript(({ skipStory }) => {
        localStorage.setItem('tutorialSkipped', 'true');
        if (skipStory) localStorage.setItem('hasSeenStoryIntroduction', 'true');
        else localStorage.removeItem('hasSeenStoryIntroduction');
    }, { skipStory });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });

    if (skipStory) {
        await page.locator('#close-story-intro').dispatchEvent('click').catch(() => {});
        await page.waitForFunction(() => !document.querySelector('.story-intro-modal'), null, { timeout: 5_000 }).catch(() => {});
    }
};

const loadStaticShell = async (page) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.tab-panels-container', { timeout: 10_000 });
};

const violationSummary = (violations) => violations
    .map(({ id, impact, description, nodes }) => {
        const targets = nodes
            .slice(0, 3)
            .map((node) => node.target.join(' '))
            .join(', ');
        return `${id} (${impact || 'unknown'}): ${description} [${targets}]`;
    })
    .join('\n');

const expectA11yClean = async (page, label, selector) => {
    await page.addScriptTag({ path: axePath });
    const results = await page.evaluate(async ({ selector, wcagTags }) => {
        const root = document.querySelector(selector);
        if (!root) throw new Error(`Axe target not found: ${selector}`);
        return /** @type {any} */ (window).axe.run(root, {
            runOnly: { type: 'tag', values: wcagTags }
        });
    }, { selector, wcagTags });

    expect(
        results.violations,
        `${label} accessibility violations:\n${violationSummary(results.violations) || '(none)'}`
    ).toEqual([]);
};

test('desktop shell exposes keyboard-accessible structure', async ({ page }) => {
    await loadStaticShell(page);
    const structure = await page.evaluate(() => ({
        firstFocusableClass: document.querySelector('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')?.className || '',
        tablistRole: document.querySelector('.tabs-nav')?.getAttribute('role'),
        panelTabindex: document.querySelector('.tab-panels-container')?.getAttribute('tabindex'),
        panelLabel: document.querySelector('.tab-panels-container')?.getAttribute('aria-label'),
        mainTabindex: document.querySelector('#main-content')?.getAttribute('tabindex')
    }));

    expect(structure).toEqual({
        firstFocusableClass: 'skip-link',
        tablistRole: 'tablist',
        panelTabindex: '0',
        panelLabel: 'Active game panel',
        mainTabindex: '-1'
    });
});

test('settings modal passes axe WCAG A/AA scan', async ({ page }) => {
    await loadStaticShell(page);
    const visible = await page.evaluate(() => {
        const modal = document.querySelector('#settings-modal');
        modal?.classList.remove('hidden');
        return !!modal && !modal.classList.contains('hidden');
    });
    expect(visible).toBe(true);
    await expectA11yClean(page, 'settings modal', '#settings-modal');
});

test('first-run story passes axe WCAG A/AA scan before dismissal', async ({ page }) => {
    await boot(page, { skipStory: false });
    await expect(page.locator('.story-intro-modal')).toBeVisible();
    await expectA11yClean(page, 'first-run story', '.story-intro-modal');
});

test('narrow mobile shell keeps semantic controls keyboard reachable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await loadStaticShell(page);
    const mobile = await page.evaluate(() => {
        const box = (selector) => {
            const el = document.querySelector(selector);
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            return {
                width: rect.width,
                height: rect.height,
                display: styles.display,
                visibility: styles.visibility
            };
        };
        return {
            sidebar: box('.sidebar'),
            panelTabindex: document.querySelector('.tab-panels-container')?.getAttribute('tabindex'),
            castButton: box('#cast-button'),
            settingsButton: box('#settings-button')
        };
    });

    expect(mobile.sidebar?.display).toBe('none');
    expect(mobile.panelTabindex).toBe('0');
    expect(mobile.castButton?.width).toBeGreaterThanOrEqual(44);
    expect(mobile.castButton?.height).toBeGreaterThanOrEqual(44);
    expect(mobile.settingsButton?.width).toBeGreaterThanOrEqual(44);
    expect(mobile.settingsButton?.height).toBeGreaterThanOrEqual(44);
});
