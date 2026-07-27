/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    COMPILE_GOAL_QUEUE,
    getPrimaryCompileGoal,
    syncCompletedGoals
} from '../../js/modules/game/compileGoalStack.js';
import { buildHealShareArtifact } from '../../js/modules/game/healShare.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('heal critical path W1–W4', () => {
    test('05 goal stack advances on real beats', () => {
        expect(COMPILE_GOAL_QUEUE.length).toBeGreaterThanOrEqual(4);
        const empty = getPrimaryCompileGoal({
            ab: 0, workstations: {}, discoveredRecipes: [], prestigeCount: 0, totalTaps: 0
        });
        expect(empty.id).toBe('automate_fire');

        const afterFire = getPrimaryCompileGoal({
            ab: 10,
            workstations: { ws_fire_forge: 1 },
            discoveredRecipes: [],
            prestigeCount: 0,
            totalTaps: 5
        });
        expect(afterFire.id).toBe('automate_water');

        const done = syncCompletedGoals({
            workstations: { ws_fire_forge: 1, ws_aqua_well: 1 },
            discoveredRecipes: ['x'],
            prestigeCount: 1,
            meditationSessionDone: true
        }, []);
        expect(done).toEqual(expect.arrayContaining(['automate_fire', 'first_prestige', 'meditation_once']));
    });

    test('06 designTierSystem emits hex:tierAdvance', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(src).toContain("CustomEvent('hex:tierAdvance'");
        expect(src).toContain('emitTierAdvance');
        expect(src).toContain('playHealMoment');
    });

    test('08 heal package + reduced-motion path present', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(src).toContain('tier-advance-heal');
        expect(src).toContain('prefers-reduced-motion');
        expect(src).toContain('SYSTEM_RESTORE');
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        expect(css).toContain('tier-advance-heal');
    });

    test('10 meditation mult delta feedback', () => {
        const src = fs.readFileSync(path.join(root, 'js/meditationState.js'), 'utf8');
        expect(src).toContain('MEDITATION_Δ');
        expect(src).toContain('__lastMeditationMultDelta');
    });

    test('11 save outcome SYSTEM_LOG lines', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameState.js'), 'utf8');
        expect(src).toContain('SAVE_OUTCOME parse_error');
        expect(src).toContain('SAVE_OUTCOME migration_failed');
        expect(src).toContain('SAVE_OUTCOME invalid');
        expect(src).toContain('SAVE_OUTCOME checksum_recalculated');
    });

    test('12 share artifact is sanitized (no save secrets)', () => {
        const { text, payload } = buildHealShareArtifact({ fromTier: 0, toTier: 2, at: 1 });
        expect(payload.kind).toBe('hex-compiler-heal');
        expect(payload).not.toHaveProperty('ab');
        expect(payload).not.toHaveProperty('inventory');
        expect(payload).not.toHaveProperty('save');
        expect(JSON.stringify(payload)).not.toMatch(/cyberWitchesSave|prestigePoints|eldritch/i);
        expect(text).toContain('SYSTEM_RESTORE');
        expect(text).not.toContain('localStorage');
    });

    test('13 landing thesis + before/after present', () => {
        const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        expect(html).toContain('hero-thesis');
        expect(html).toMatch(/heals/i);
        expect(html).toContain('heal-before-after');
        expect(html).toContain('Broken → restored');
        // Play CTA still primary
        expect(html).toMatch(/href="play\.html"[^>]*>[\s\S]*?Play Now/);
    });

    test('14 prestige ceremony preview in play.html', () => {
        const html = fs.readFileSync(path.join(root, 'play.html'), 'utf8');
        expect(html).toContain('prestige-preview');
        expect(html).toContain('PERSISTS');
        expect(html).toContain('RESETS THIS RUN');
        expect(html).toContain('prestige-post-goals');
    });

    test('play.html has compile goal rail and share button', () => {
        const html = fs.readFileSync(path.join(root, 'play.html'), 'utf8');
        expect(html).toContain('compile-goal-rail');
        expect(html).toContain('heal-share-button');
    });

    test('09 pacing: first automation recipe is low essence cost', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/data/producers.js'), 'utf8');
        // Fire forge at unlock 0 with 10 essence — under 15–30 min target on fresh save
        expect(src).toMatch(/id:\s*'ws_fire_forge'[\s\S]*?recipe:\s*\{\s*fire_essence:\s*10/);
    });
});
