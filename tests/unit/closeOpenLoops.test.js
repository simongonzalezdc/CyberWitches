/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { shouldAllowMusic, shouldAllowSfx } from '../../js/audio/musicPolicy.js';
import { rollCastBonus } from '../../js/game/castBonus.js';
import { PRODUCERS } from '../../js/modules/data/producers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('close-open-loops', () => {
    test('01 color-debt green (components not above baseline)', () => {
        // run is external; assert our tier-0 block is token-only
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        expect(css).toContain('body.tier-0 .glow-text');
        expect(css).not.toMatch(/body\.tier-0[\s\S]{0,200}#[0-9A-Fa-f]{3,6}/);
    });

    test('03 orphan onboarding archived', () => {
        expect(fs.existsSync(path.join(root, 'js/tutorial.js'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'js/onboarding.js'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'js/archive/tutorial.js'))).toBe(true);
        expect(fs.existsSync(path.join(root, 'js/archive/onboarding.js'))).toBe(true);
        const lazy = fs.readFileSync(path.join(root, 'js/lazyLoader.js'), 'utf8');
        expect(lazy).not.toContain("preload('./tutorial.js')");
        expect(lazy).toContain('tutorialSystem.js');
    });

    test('04 analytics load is debug-gated', () => {
        const lazy = fs.readFileSync(path.join(root, 'js/lazyLoader.js'), 'utf8');
        expect(lazy).toContain('debugAnalytics');
        const bal = fs.readFileSync(path.join(root, 'js/balanceAnalytics.js'), 'utf8');
        expect(bal).toContain('cyberWitchesDebugAnalytics');
    });

    test('05 lazy failure reporter exists', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameInit.js'), 'utf8');
        expect(src).toContain('function reportLazyFailure');
        expect(src).toContain('reportLazyFailure(');
    });

    test('06/11 every producer has non-empty description', () => {
        for (const p of PRODUCERS) {
            expect(String(p.description || '').trim().length).toBeGreaterThan(10);
        }
    });

    test('08 save store ADR exists', () => {
        const adr = fs.readFileSync(path.join(root, 'docs/adr/0002-save-store-primary.md'), 'utf8');
        expect(adr).toMatch(/localStorage/i);
        expect(adr).toMatch(/IndexedDB/i);
    });

    test('09 landing CSP drops unsafe-eval', () => {
        const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        expect(html).not.toMatch(/script-src[^"]*unsafe-eval/);
    });

    test('10 mid-arc tutorial goals present', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/tutorialSystem.js'), 'utf8');
        expect(src).toContain('compile_goal_water');
        expect(src).toContain('run_protocol');
        expect(src).toContain('Aqua Well');
    });

    test('12 music policy pure rules', () => {
        expect(shouldAllowMusic(0)).toBe(false);
        expect(shouldAllowMusic(3)).toBe(false);
        expect(shouldAllowMusic(4)).toBe(true);
        expect(shouldAllowSfx(1)).toBe(false);
        expect(shouldAllowSfx(2)).toBe(true);
    });

    test('13 cast bonus pure roll', () => {
        const alwaysJack = rollCastBonus(() => 0.01);
        expect(alwaysJack.bonusType).toBe('critical_compile');
        expect(alwaysJack.bonusMultiplier).toBeGreaterThanOrEqual(2);
        const over = rollCastBonus(() => 0.10);
        expect(over.bonusType).toBe('compile_overclock');
        const none = rollCastBonus(() => 0.9);
        expect(none.bonusType).toBeNull();
        expect(none.bonusMultiplier).toBe(1);
    });

    test('14 tier-0 dramatization CSS present', () => {
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        expect(css).toContain('body.tier-0 #cast-button');
        expect(css).toContain('body.tier-0 .tab-btn');
    });
});
