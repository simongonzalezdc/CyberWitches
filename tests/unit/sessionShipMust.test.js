/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
        expect(src).toMatch(/posDelta/);
    });

    test('cast path uses critical_compile not jackpot bonusType', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameState.js'), 'utf8');
        expect(src).toContain("bonusType = 'critical_compile'");
        expect(src).not.toMatch(/bonusType\s*=\s*'jackpot'/);
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

    test('notifications default to text-safe path', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/ui/notifications.js'), 'utf8');
        expect(src).toContain('showText');
        expect(src).toContain('showHtml');
        expect(src).toContain('textContent');
    });

    test('mobile tooltips do not preventDefault on touchstart', () => {
        const src = fs.readFileSync(path.join(root, 'js/customTooltips.js'), 'utf8');
        expect(src).not.toMatch(/touchstart[\s\S]{0,120}preventDefault/);
        expect(src).toContain('passive: true');
    });

    test('player-facing currency living names ban list', () => {
        const roots = ['js/modules', 'CONTEXT.md', 'play.html', 'index.html', 'GAME_MANUAL.md'];
        const banned = [/Aether Bits/, /Arcane Bytes/, /Spell Energy/];
        for (const rel of roots) {
            const full = path.join(root, rel);
            const walk = (fp) => {
                if (!fs.existsSync(fp)) return;
                const st = fs.statSync(fp);
                if (st.isDirectory()) {
                    for (const e of fs.readdirSync(fp)) walk(path.join(fp, e));
                    return;
                }
                if (!/\.(js|md|html)$/.test(fp)) return;
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
