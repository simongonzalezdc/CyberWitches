/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatShort, formatOneDecimal } from '../../js/utils.js';
import { appendSystemLog, ensureSystemLogEmptyState } from '../../js/modules/ui/systemLog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('audit residual 01 FA icons', () => {
    test('play-path UI modules do not inject Font Awesome classes', () => {
        const roots = [
            path.join(root, 'js/modules/ui'),
            path.join(root, 'js/modules/game'),
            path.join(root, 'play.html'),
        ];
        for (const r of roots) {
            const walk = (fp) => {
                if (!fs.existsSync(fp)) return;
                const st = fs.statSync(fp);
                if (st.isDirectory()) {
                    for (const e of fs.readdirSync(fp)) walk(path.join(fp, e));
                    return;
                }
                if (!/\.(js|html)$/.test(fp)) return;
                const text = fs.readFileSync(fp, 'utf8');
                expect(text).not.toMatch(/fas fa-|fa-bolt/);
            };
            walk(r);
        }
    });
});

describe('audit residual 02 system log', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="craft-notifications"></div>';
    });

    test('appendSystemLog writes capped lines', () => {
        ensureSystemLogEmptyState();
        expect(document.querySelector('[data-system-log-empty]')).not.toBeNull();
        appendSystemLog('CRAFT_OK Fire Forge ×1', 'success');
        expect(document.querySelector('[data-system-log-empty]')).toBeNull();
        const lines = document.querySelectorAll('.system-log-line');
        expect(lines.length).toBe(1);
        expect(lines[0].textContent).toContain('CRAFT_OK');
        for (let i = 0; i < 50; i++) appendSystemLog(`line ${i}`);
        expect(document.querySelectorAll('.system-log-line').length).toBeLessThanOrEqual(40);
    });
});

describe('audit residual 03 formatShort NaN', () => {
    test('formatShort never prints NaN', () => {
        expect(formatShort(NaN)).toBe('0');
        expect(formatShort(Infinity)).toBe('0');
        expect(formatShort(undefined)).toBe('0');
        expect(formatShort(null)).toBe('0');
        expect(formatShort(42)).toBe('42');
        expect(formatShort(1500)).toMatch(/1\.50K|1.50K/);
    });

    test('formatOneDecimal never prints NaN', () => {
        expect(formatOneDecimal(NaN)).toBe('0.0');
        expect(formatOneDecimal(Infinity)).toBe('0.0');
    });
});

describe('audit residual 04 tier0 chrome mute', () => {
    test('components.css defines tier-0 mute rules', () => {
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        expect(css).toContain('body.tier-0 .glow-text');
        expect(css).toContain('body.tier-0 .glass-panel');
        expect(css).toContain('.css-icon-bolt');
    });
});
