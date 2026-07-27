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

    test('08 save store ownership documented in tracked CONTEXT', () => {
        // docs/ is gitignored; persistence ownership must live in tracked CONTEXT.md
        const ctx = fs.readFileSync(path.join(root, 'CONTEXT.md'), 'utf8');
        expect(ctx).toMatch(/Persistence ownership/i);
        expect(ctx).toMatch(/localStorage/i);
        expect(ctx).toMatch(/IndexedDB/i);
    });

    test('06/11 descriptions are not pure template slop or broken articles', () => {
        const template = /preservation chamber that compiles .+ essence into stable hex structures/;
        for (const p of PRODUCERS) {
            expect(p.description).not.toMatch(template);
            expect(p.description).not.toMatch(/^A [AEIOUaeiou]/);
        }
    });

    test('12 music policy is actually wired into audioSystem tier monitor', () => {
        const src = fs.readFileSync(path.join(root, 'js/audioSystem.js'), 'utf8');
        expect(src).toContain("from './audio/musicPolicy.js'");
        expect(src).toContain('shouldAllowMusic(currentTier)');
        expect(src).not.toMatch(/if \(!shouldAllowMusic\([^)]+\) && this\.musicEnabled\) \{\s*\/\/ keep existing/);
    });

    test('14 tier-0 glass panels must not use element opacity (cast is inside glass-panel footer)', () => {
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        const tier0Glass = css.match(/body\.tier-0 \.glass-panel\s*\{[^}]+\}/);
        expect(tier0Glass).toBeTruthy();
        expect(tier0Glass[0]).not.toMatch(/(?:^|[^-])opacity\s*:/);
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
        expect(alwaysJack.bonusMultiplier).toBeLessThanOrEqual(5);
        const over = rollCastBonus(() => 0.10);
        expect(over.bonusType).toBe('compile_overclock');
        const none = rollCastBonus(() => 0.9);
        expect(none.bonusType).toBeNull();
        expect(none.bonusMultiplier).toBe(1);
        // Hostile RNGs must not invert rewards
        const neg = rollCastBonus(() => -1);
        expect(neg.bonusType).toBe('critical_compile');
        expect(neg.bonusMultiplier).toBeGreaterThanOrEqual(2);
        const nan = rollCastBonus(() => NaN);
        expect(nan.bonusType).toBeNull();
        expect(nan.bonusMultiplier).toBe(1);
    });

    test('14 tier-0 dramatization CSS present', () => {
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        expect(css).toContain('body.tier-0 #cast-button');
        expect(css).toContain('body.tier-0 .tab-btn');
    });
});
