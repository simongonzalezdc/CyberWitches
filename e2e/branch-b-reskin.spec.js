// @ts-check
import { test, expect } from '@playwright/test';

const topHitTarget = async (page, selector) => page.locator(selector).first().evaluate((element, expectedSelector) => {
    const rect = element.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
        selector: expectedSelector,
        topTag: top?.tagName || null,
        topId: top?.id || null,
        topClass: top ? String(top.className) : null,
        topText: top?.textContent?.trim().slice(0, 80) || null,
        isExpectedOrChild: top === element || element.contains(top)
    };
}, selector);

const attachRuntimeIssues = (page) => {
    /** @type {string[]} */
    const issues = [];
    page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
        if (message.type() === 'error') issues.push(`console error: ${message.text()}`);
    });
    return issues;
};

test('branch B landing page keeps the reskinned funnel playable and documented', async ({ page }) => {
    const issues = attachRuntimeIssues(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Hex Compiler/);
    await expect(page.locator('#hero-title')).toContainText('Preserve magic');
    await expect(page.locator('.hero-badge')).toContainText(/Browser Idle Game/i);
    await expect(page.locator('.btn.btn-primary[href="play.html"]').first()).toContainText('Play Now');
    await expect(page.locator('.feature-row')).toHaveCount(6);
    await expect(page.locator('.feature-title')).toContainText([
        'Progressive UI stabilization',
        'Cast, craft, ascend',
        'Experimentation and discovery',
        'Meditation tower defense',
        'Achievements and daily rituals',
        'Offline PWA support'
    ]);

    const ctaHit = await topHitTarget(page, '.btn.btn-primary[href="play.html"]');
    expect(ctaHit.isExpectedOrChild, `primary landing CTA should be human-clickable: ${JSON.stringify(ctaHit)}`).toBe(true);

    const internalLinks = await page.locator('a[href]').evaluateAll((links) => links
        .map((link) => link.getAttribute('href') || '')
        .filter((href) => href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:'))
        .filter((href) => !href.includes('play.html')));

    const uniqueInternalLinks = [...new Set(internalLinks)];
    const statuses = await page.evaluate(async (links) => Promise.all(links.map(async (href) => {
        const response = await fetch(href, { cache: 'no-store' });
        return { href, status: response.status };
    })), uniqueInternalLinks);

    expect(statuses, 'landing docs/legal/footer links should resolve').toEqual(
        statuses.map((item) => expect.objectContaining({ href: item.href, status: 200 }))
    );
    expect(issues).toEqual([]);
});

test('branch B game shell boots with reskinned HUD, nav managers, and normal controls', async ({ page }) => {
    const issues = attachRuntimeIssues(page);

    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    });
    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });

    await expect(page.locator('.hud.hud-panel.glass-panel')).toBeVisible();
    await expect(page.locator('#sidebar.glass-panel')).toContainText('RESOURCE_MONITOR');
    const tabLabels = await page.locator('.tabs-nav[role="tablist"] .tab-btn').evaluateAll((buttons) =>
        buttons.map((button) => button.textContent?.replace('🔒', '').trim() || '')
    );
    expect(tabLabels).toEqual([
        '/MNT/WORKSTATIONS',
        '/SYS/UPGRADES',
        '/USR/DATA',
        '/BIN/LAB',
        '/LOG/STATS',
        '/ETC/RITUALS',
        '/OPT/BOONS',
        '/PROC/MEDITATION'
    ]);

    for (const selector of ['#cast-button', '#help-button', '#settings-button', '.tab-btn[data-tab="inventory"]']) {
        const hit = await topHitTarget(page, selector);
        expect(hit.isExpectedOrChild, `${selector} should not be covered by the reskin shell: ${JSON.stringify(hit)}`).toBe(true);
    }

    await page.locator('.tab-btn[data-tab="inventory"]').click({ timeout: 5_000 });
    await expect(page.locator('#inventory-tab')).toBeVisible();
    await page.locator('.tab-btn[data-tab="experiment"]').click({ timeout: 5_000 });
    await expect(page.locator('#experiment-button')).toBeVisible();
    await page.locator('#cast-button').click({ timeout: 5_000 });

    const runtimeState = await page.evaluate(() => {
        const gs = /** @type {any} */ (window).gameState;
        return {
            arcaneBits: gs.arcaneBits,
            activeTab: document.querySelector('.tab-panel:not(.hidden)')?.id || null,
            hasUiManager: typeof (/** @type {any} */ (window).uiManager) === 'object'
        };
    });

    expect(runtimeState.arcaneBits).toBeGreaterThan(0);
    expect(runtimeState.activeTab).toBe('experiment-tab');
    expect(runtimeState.hasUiManager).toBe(true);
    expect(issues).toEqual([]);
});

test('branch B imagery and PWA metadata reference installable local assets', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(async () => {
        const manifest = await fetch('manifest.json', { cache: 'no-store' }).then((response) => response.json());
        const assets = [
            ...manifest.icons.map((icon) => icon.src),
            ...manifest.screenshots.map((screenshot) => screenshot.src),
            'offline.html',
            'sw.js'
        ];
        const statuses = await Promise.all(assets.map(async (asset) => {
            const response = await fetch(asset, { cache: 'no-store' });
            return { asset, status: response.status };
        }));
        return {
            name: manifest.name,
            startUrl: manifest.start_url,
            scope: manifest.scope,
            display: manifest.display,
            themeColor: manifest.theme_color,
            backgroundColor: manifest.background_color,
            iconCount: manifest.icons.length,
            screenshotCount: manifest.screenshots.length,
            statuses
        };
    });

    expect(result).toEqual(expect.objectContaining({
        name: 'Hex Compiler',
        startUrl: './play.html',
        scope: './',
        display: 'standalone',
        iconCount: 3,
        screenshotCount: 2
    }));
    expect(result.themeColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result.statuses).toEqual(
        result.statuses.map((item) => expect.objectContaining({ asset: item.asset, status: 200 }))
    );
});
