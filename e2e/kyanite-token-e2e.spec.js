// @ts-check
import { test, expect } from '@playwright/test';

const KYANITE = {
    void: 'rgb(5, 7, 11)',
    cyan: 'rgb(38, 230, 255)',
    electric: 'rgb(8, 125, 204)'
};

async function getStyleSamples(page) {
    return page.evaluate(() => {
        const css = (selector, prop, pseudo) => {
            const el = document.querySelector(selector);
            if (!el) throw new Error(`Missing selector: ${selector}`);
            return window.getComputedStyle(el, pseudo).getPropertyValue(prop);
        };

        return {
            version: document.documentElement.dataset.designSystemVersion,
            bodyBackground: window.getComputedStyle(document.body).backgroundColor,
            rootKyVoid: window.getComputedStyle(document.documentElement).getPropertyValue('--ky-void').trim(),
            rootKyCyan: window.getComputedStyle(document.documentElement).getPropertyValue('--ky-cyan').trim(),
            rootKyElectric: window.getComputedStyle(document.documentElement).getPropertyValue('--ky-electric').trim(),
            landingAccent: document.querySelector('.hero-title .accent-word')
                ? css('.hero-title .accent-word', 'color')
                : null,
            landingCtaBackground: document.querySelector('.btn-primary')
                ? css('.btn-primary', 'background-image') || css('.btn-primary', 'background')
                : null,
            castBorder: document.querySelector('#cast-button')
                ? css('#cast-button', 'border-top-color')
                : null,
            castColor: document.querySelector('#cast-button')
                ? css('#cast-button', 'color')
                : null
        };
    });
}

test('landing page resolves public surfaces to Kyanite tokens', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const styles = await getStyleSamples(page);
    expect(styles.version).toBe('kyanite-1');
    expect(styles.rootKyVoid).toBe('#05070b');
    expect(styles.rootKyCyan).toBe('#26e6ff');
    expect(styles.rootKyElectric).toBe('#087dcc');
    expect(styles.bodyBackground).toBe(KYANITE.void);
    expect(styles.landingAccent).toBe(KYANITE.cyan);
    expect(styles.landingCtaBackground).toContain(KYANITE.cyan);
    expect(styles.landingCtaBackground).toContain(KYANITE.electric);
});

test('game shell resolves runtime surfaces to Kyanite tokens', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSkipped', 'true');
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    });
    await page.goto('/play.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.gameState, null, { timeout: 30_000 });

    const styles = await getStyleSamples(page);
    expect(styles.version).toBe('kyanite-1');
    expect(styles.rootKyVoid).toBe('#05070b');
    expect(styles.bodyBackground).toBe(KYANITE.void);
    expect(styles.castBorder).toBe(KYANITE.cyan);
    expect(styles.castColor).toBe(KYANITE.cyan);
});
