/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotificationManager } from '../../js/modules/ui/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('session-ship Must contracts', () => {
    test('play.html has design-system version and all counters', () => {
        const html = fs.readFileSync(path.join(root, 'play.html'), 'utf8');
        expect(html).toContain('data-design-system-version="kyanite-1"');
        for (const id of ['fire', 'water', 'air', 'crystal', 'aether', 'focus']) {
            expect(html).toContain(`id="element-counter-${id}"`);
        }
        expect(html).toMatch(/class="[^"]*\btier-0\b/);
    });

    test('index.html has design-system version', () => {
        const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        expect(html).toContain('data-design-system-version="kyanite-1"');
    });

    test('meditationState loadState restores stats fields', () => {
        const src = fs.readFileSync(path.join(root, 'js/meditationState.js'), 'utf8');
        expect(src).toMatch(/this\.totalWavesCompleted\s*=\s*state\.totalWavesCompleted/);
        expect(src).toMatch(/this\.totalDistractionsKilled\s*=\s*state\.totalDistractionsKilled/);
        expect(src).toMatch(/this\.totalSessionsCompleted\s*=\s*state\.totalSessionsCompleted/);
        expect(src).toMatch(/closingOnWaypoint|closingOnCenter/);
    });

    test('cast path uses critical_compile not jackpot bonusType', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameState.js'), 'utf8');
        const bonus = fs.readFileSync(path.join(root, 'js/game/castBonus.js'), 'utf8');
        expect(bonus).toContain("bonusType = 'critical_compile'");
        expect(src).toContain('rollCastBonus');
        expect(src).not.toMatch(/bonusType\s*=\s*'jackpot'/);
        expect(bonus).not.toMatch(/bonusType\s*=\s*'jackpot'/);
        const backup = path.join(root, 'js/gameState.js.backup');
        if (fs.existsSync(backup)) {
            const b = fs.readFileSync(backup, 'utf8');
            expect(b).not.toMatch(/bonusType\s*=\s*'jackpot'/);
        }
    });

    test('triggerBonusFeedback is wired in gameInit', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameInit.js'), 'utf8');
        expect(src).toContain('window.triggerBonusFeedback');
        expect(src).toContain('CRITICAL_COMPILE');
    });

    test('TutorialSystem owns COMPILE_GOAL copy', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/tutorialSystem.js'), 'utf8');
        expect(src).toContain('COMPILE_GOAL: Stabilize Fire sector — craft 1 Fire Forge.');
        expect(src).toContain("id: 'compile_goal_fire'");
    });

    test('notifications default to text-safe path without content sniff', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/ui/notifications.js'), 'utf8');
        expect(src).toContain('showText');
        expect(src).toContain('showHtml');
        expect(src).toContain('textContent');
        expect(src).not.toContain('looksLikeTrustedIconTemplate');
        expect(src).not.toMatch(/message\.includes\(['"]css-icon-/);
    });

    test('NotificationManager treats default path as textContent (XSS residual closed)', () => {
        document.body.innerHTML = '';
        const mgr = new NotificationManager();
        const payload = '<img src=x onerror=alert(1)> css-icon-fire';
        mgr.show(payload, 'info', 5000);
        const note = document.querySelector('.notification');
        expect(note).not.toBeNull();
        const body = note.querySelector('.notification-body');
        expect(body).not.toBeNull();
        expect(body.textContent).toBe(payload);
        // Must not create an executable img node from the payload
        expect(body.querySelector('img')).toBeNull();
    });

    test('NotificationManager showHtml still allows trusted templates', () => {
        document.body.innerHTML = '';
        const mgr = new NotificationManager();
        mgr.showHtml('<span class="css-icon-fire"></span> OK', 'success', 5000);
        const body = document.querySelector('.notification-body');
        expect(body).not.toBeNull();
        expect(body.querySelector('.css-icon-fire')).not.toBeNull();
    });

    test('mobile tooltips do not preventDefault on touchstart', () => {
        const src = fs.readFileSync(path.join(root, 'js/customTooltips.js'), 'utf8');
        expect(src).not.toMatch(/addEventListener\(\s*['"]touchstart['"][\s\S]{0,400}preventDefault/);
        expect(src).toContain('passive: true');
    });

    test('player-facing currency living names ban list', () => {
        const roots = ['js', 'CONTEXT.md', 'play.html', 'index.html', 'GAME_MANUAL.md'];
        const banned = [/Aether Bits/, /Arcane Bytes/, /Spell Energy/];
        const skipDirs = new Set(['node_modules', 'coverage', 'dist', '.git']);
        for (const rel of roots) {
            const full = path.join(root, rel);
            const walk = (fp) => {
                if (!fs.existsSync(fp)) return;
                const st = fs.statSync(fp);
                if (st.isDirectory()) {
                    const base = path.basename(fp);
                    if (skipDirs.has(base)) return;
                    for (const e of fs.readdirSync(fp)) walk(path.join(fp, e));
                    return;
                }
                if (!/\.(js|md|html)$/.test(fp)) return;
                if (fp.endsWith('.backup')) return;
                const text = fs.readFileSync(fp, 'utf8');
                for (const re of banned) {
                    expect(text).not.toMatch(re);
                }
            };
            walk(full);
        }
    });

    test('GAME_MANUAL matches live starter workstations', () => {
        const manual = fs.readFileSync(path.join(root, 'GAME_MANUAL.md'), 'utf8');
        expect(manual).toContain('Fire Forge');
        expect(manual).toContain('Aqua Well');
        expect(manual).toContain('Arcane Bits');
        expect(manual).not.toContain('Wax Melter');
        expect(manual).toContain('0.15 AB');
    });

    test('landing wires real screenshot media', () => {
        const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        expect(html).toContain('screenshots/desktop-1.png');
        expect(html).toContain('screenshots/mobile-1.png');
        expect(html).toContain('images/generated/hero-atmosphere-kyanite.jpg');
    });
});
