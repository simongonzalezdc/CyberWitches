/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCERS } from '../../js/modules/data/producers.js';
import { GameState } from '../../js/gameState.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('heal W0 foundation', () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.meditationState;
    });

    test('04 unlock ratio bound < 5', () => {
        const unlocks = [...new Set(PRODUCERS.map((p) => Number(p.unlockAtAb) || 0))]
            .filter((u) => u > 0)
            .sort((a, b) => a - b);
        let maxR = 1;
        for (let i = 1; i < unlocks.length; i++) {
            maxR = Math.max(maxR, unlocks[i] / unlocks[i - 1]);
        }
        expect(maxR).toBeLessThan(5);
    });

    test('02 meditation applies after stable cache (behavioral)', () => {
        const gs = new GameState();
        gs.workstations = { ws_fire_forge: 1 };
        gs.upgradesOwned = {};
        gs.prestigeBonuses = {};
        gs.activeBuffs = [];

        const base = gs.getProductionMultiplier('ws_fire_forge');
        expect(base).toBeGreaterThan(0);
        // Second call hits cache path
        expect(gs.getProductionMultiplier('ws_fire_forge')).toBe(base);

        window.meditationState = {
            getMeditationProductionBonus: () => 2
        };
        // Meditation is volatile — must apply without invalidate
        const withMed = gs.getProductionMultiplier('ws_fire_forge');
        expect(withMed).toBeCloseTo(base * 2, 5);

        const br = gs.getProductionMultiplierBreakdown('ws_fire_forge');
        expect(br.meditation).toBe(2);
        expect(br.total).toBeCloseTo(withMed, 5);
    });

    test('02 ascend invalidates multiplier cache (no stale upgrade mult)', () => {
        const gs = new GameState();
        gs.workstations = { ws_fire_forge: 1 };
        gs.upgradesOwned = {};
        gs.prestigeBonuses = {};
        gs.activeBuffs = [];
        // lifetime needed for EK gain: floor(sqrt(L / 1.2e6)) > 0 → L >= 1.2e6
        gs.prestigeLifetimeEarned = 5_000_000;
        gs.prestigePoints = 0;
        gs.saveGameState = () => {};
        gs.saveGameStateImmediate = () => {};

        // Seed a cached base that would be wrong after reset if not cleared
        gs.multiplierCache.set('ws_fire_forge', 99);
        gs.multiplierCacheDirty = false;
        expect(gs.calculatePrestigeGain()).toBeGreaterThan(0);

        gs.ascend();

        expect(gs.multiplierCacheDirty).toBe(true);
        expect(gs.multiplierCache.size).toBe(0);
        expect(gs.workstations).toEqual({});
        expect(gs.upgradesOwned).toEqual({});

        // Fresh mult is base ~1× volatile, not the polluted 99
        const after = gs.getProductionMultiplier('ws_fire_forge');
        expect(after).toBeLessThan(10);
        expect(after).not.toBe(99);
    });

    test('01 forgejo CI runs tests without swallowing failures', () => {
        const yml = fs.readFileSync(path.join(root, '.forgejo/workflows/ci.yml'), 'utf8');
        expect(yml).toMatch(/npm test/);
        expect(yml).not.toMatch(/npm test \|\| true/);
    });

    test('03 smoke-dist script exists and polls readiness', () => {
        expect(fs.existsSync(path.join(root, 'scripts/smoke-dist.sh'))).toBe(true);
        const sh = fs.readFileSync(path.join(root, 'scripts/smoke-dist.sh'), 'utf8');
        expect(sh).toContain('mktemp');
        expect(sh).toMatch(/for _ in/);
        const pkg = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
        expect(pkg).toContain('smoke:dist');
    });
});
