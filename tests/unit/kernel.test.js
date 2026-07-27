/**
 * Kernel pure-dispatch suite (tickets 01–09 + adapter).
 * Uses default jsdom env only for Jest setup; kernel modules themselves are DOM-free.
 */
import {
    createKernel,
    createInitialState,
    reduce,
    validateContentPack,
    assertContentPackValid,
    PIPELINE_MODULES,
    getPrimaryContract,
    applyPrestigePreview
} from '../../js/kernel/index.js';
import { applyFade, FADEABLE, FADE_WEIGHT } from '../../js/kernel/fade.js';
import { migrateKernelSnapshot, serializeKernel, deserializeKernel } from '../../js/kernel/migrate.js';
import { projectCastThroughKernel } from '../../js/kernel/adapter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('01 Kernel cast dispatch pure', () => {
    test('cast is pure and deterministic with fixed seed', () => {
        const a = reduce(createInitialState(42), { type: 'cast' });
        const b = reduce(createInitialState(42), { type: 'cast' });
        expect(a.state.ab).toBe(b.state.ab);
        expect(a.state.inventory.fire_essence).toBe(b.state.inventory.fire_essence);
        expect(a.events.some((e) => e.type === 'cast')).toBe(true);
        expect(a.state.totalTaps).toBe(1);
        expect(a.state.ab).toBeGreaterThan(0);
    });

    test('kernel module has no DOM import', () => {
        const dir = path.join(__dirname, '../../js/kernel');
        for (const f of fs.readdirSync(dir)) {
            if (!f.endsWith('.js')) continue;
            const src = fs.readFileSync(path.join(dir, f), 'utf8');
            expect(src).not.toMatch(/\bdocument\b/);
            expect(src).not.toMatch(/\bwindow\b/);
        }
    });

    test('createKernel store dispatches cast', () => {
        const k = createKernel(createInitialState(7));
        const r = k.dispatch({ type: 'cast' });
        expect(r.events.some((e) => e.type === 'cast')).toBe(true);
        expect(k.getState().totalTaps).toBe(1);
    });

    test('two casts advance seed and stack gains', () => {
        const k = createKernel(createInitialState(11));
        const first = k.dispatch({ type: 'cast' });
        const seedAfter = first.state.rngSeed;
        const abAfter = first.state.ab;
        const second = k.dispatch({ type: 'cast' });
        expect(second.state.rngSeed).not.toBe(seedAfter);
        expect(second.state.ab).toBeGreaterThan(abAfter);
        expect(second.state.totalTaps).toBe(2);
    });

    test('affinity tracks actual essence gain (specialization lean)', () => {
        const s = createInitialState(3);
        s.elementSpecialization = 'fire';
        s.specializationBonuses = { castRewardMult: 2 };
        const r = reduce(s, { type: 'cast' });
        expect(r.state.affinity.fire).toBeGreaterThan(r.state.affinity.water);
        expect(r.state.affinity.fire).toBeGreaterThan(r.state.affinity.air);
        expect(r.state.affinity.fire).toBeGreaterThan(r.state.affinity.crystal);
    });
});

describe('02 content schema', () => {
    test('default pipeline pack validates', () => {
        const r = validateContentPack(PIPELINE_MODULES);
        expect(r.ok).toBe(true);
        expect(() => assertContentPackValid()).not.toThrow();
    });

    test('rejects bad role and duplicate ids', () => {
        const bad = validateContentPack([
            { id: 'x', displayName: 'X', role: 'nope', unlockAtAb: 0, recipe: { a: 1 }, growth: 1.1 }
        ]);
        expect(bad.ok).toBe(false);
        if (!bad.ok) expect(bad.errors.join(' ')).toMatch(/role/);
    });
});

describe('03 fade + storage', () => {
    test('no fade under capacity', () => {
        const state = createInitialState(1);
        state.inventory = { fire_essence: 10 };
        state.storageCap = 50;
        const r = applyFade(state, 10);
        expect(r.inventory.fire_essence).toBeCloseTo(10);
        expect(Object.keys(r.faded).length).toBe(0);
    });

    test('fade when over capacity', () => {
        const state = createInitialState(1);
        state.inventory = { fire_essence: 200 };
        state.storageCap = 50;
        state.totalTaps = 1000; // not soft early
        const r = applyFade(state, 5);
        const lost = 200 - r.inventory.fire_essence;
        expect(lost).toBeGreaterThan(0);
        expect(r.faded.fire_essence).toBeGreaterThan(0);
        expect(FADEABLE).toContain('fire_essence');
    });

    test('FADE_WEIGHT includes craft intermediates (Store stays a midgame verb)', () => {
        expect(FADEABLE).toContain('dist_fire');
        expect(FADEABLE).toContain('shaped_crys');
        expect(FADEABLE).toContain('resonant_crystal');
        expect(FADE_WEIGHT.fire_essence).toBe(1);
        expect(FADE_WEIGHT.resonant_crystal).toBeLessThan(FADE_WEIGHT.fire_essence);
        expect(FADE_WEIGHT.dist_fire).toBeGreaterThan(0);
        expect(FADE_WEIGHT.dist_fire).toBeLessThan(1);
    });

    test('raw essence bleeds faster than equal intermediate stacks under overcap', () => {
        const raw = createInitialState(1);
        raw.inventory = { fire_essence: 200 };
        raw.storageCap = 50;
        raw.totalTaps = 1000;
        const rRaw = applyFade(raw, 10);
        const lostRaw = 200 - rRaw.inventory.fire_essence;

        const mid = createInitialState(1);
        mid.inventory = { dist_fire: 200 };
        mid.storageCap = 50;
        mid.totalTaps = 1000;
        const rMid = applyFade(mid, 10);
        const lostMid = 200 - (rMid.inventory.dist_fire || 0);

        expect(lostRaw).toBeGreaterThan(0);
        expect(lostMid).toBeGreaterThan(0);
        // Weighted total for intermediates is lower → less absolute bleed at same count
        expect(lostRaw).toBeGreaterThan(lostMid);
    });

    test('late-tier intermediates are not immortal (crystal_core / void_crystal fade)', () => {
        for (const key of ['crystal_core', 'void_crystal', 'quantum_candle', 'harmonic_essence']) {
            expect(FADEABLE).toContain(key);
            expect(FADE_WEIGHT[key]).toBeGreaterThan(0);
            expect(FADE_WEIGHT[key]).toBeLessThan(1);
            const s = createInitialState(1);
            s.inventory = { [key]: 500 };
            s.storageCap = 50;
            s.totalTaps = 1000;
            const r = applyFade(s, 30);
            expect(r.inventory[key]).toBeLessThan(500);
            expect(r.faded[key]).toBeGreaterThan(0);
        }
    });

    test('mixed bag: per-unit bleed proportional to weight; Σ faded ≈ lose budget', () => {
        const s = createInitialState(1);
        s.inventory = { fire_essence: 100, dist_fire: 100 };
        s.storageCap = 50;
        s.totalTaps = 1000;
        const r = applyFade(s, 20);
        const lostRaw = 100 - r.inventory.fire_essence;
        const lostMid = 100 - r.inventory.dist_fire;
        expect(lostRaw).toBeGreaterThan(0);
        expect(lostMid).toBeGreaterThan(0);
        // Same stack sizes → higher weight loses more units
        expect(lostRaw / lostMid).toBeCloseTo(FADE_WEIGHT.fire_essence / FADE_WEIGHT.dist_fire, 5);
        const sumFaded = Object.values(r.faded).reduce((a, b) => a + b, 0);
        expect(sumFaded).toBeCloseTo(lostRaw + lostMid, 10);
    });

    test('clamp: stack smaller than weighted share does not go negative', () => {
        const s = createInitialState(1);
        s.inventory = { fire_essence: 0.001, void_crystal: 10000 };
        s.storageCap = 1;
        s.totalTaps = 1000;
        const r = applyFade(s, 3600);
        expect(r.inventory.fire_essence).toBeGreaterThanOrEqual(0);
        expect(r.inventory.void_crystal).toBeGreaterThanOrEqual(0);
    });
});

describe('04 craft pipeline + 05 tick', () => {
    test('craft capture module spends recipe', () => {
        const s = createInitialState(1);
        s.inventory = { fire_essence: 100 };
        const r = reduce(s, { type: 'craft', moduleId: 'mod_fire_capture', amount: 1 });
        expect(r.events.some((e) => e.type === 'crafted')).toBe(true);
        expect(r.state.workstations.ws_fire_forge || r.state.workstations.mod_fire_capture).toBe(1);
        expect(r.state.inventory.fire_essence).toBeLessThan(100);
    });

    test('tick produces from owned modules', () => {
        const s = createInitialState(1);
        s.workstations = { mod_fire_capture: 2 };
        const r = reduce(s, { type: 'tick', dtSec: 10 });
        expect(r.events.some((e) => e.type === 'tick')).toBe(true);
        expect(r.state.inventory.fire_essence || 0).toBeGreaterThan(0);
        expect(r.state.tick).toBe(1);
    });
});

describe('06 migrate', () => {
    test('round-trip serialize', () => {
        const s = createInitialState(99);
        s.ab = 12;
        const json = serializeKernel(s);
        const d = deserializeKernel(json);
        expect(d.ok).toBe(true);
        if (d.ok) expect(d.state.ab).toBe(12);
    });

    test('v1 migrates to v2', () => {
        const r = migrateKernelSnapshot({ version: 1, ab: 3, inventory: { fire_essence: 1 } });
        expect(r.ok).toBe(true);
        if (r.ok) {
            expect(r.state.version).toBe(2);
            expect(r.state.chapters).toBeTruthy();
        }
    });

    test('v1 migrates legacy ws_* workstation ids to mod_*', () => {
        const r = migrateKernelSnapshot({
            version: 1,
            ab: 10,
            workstations: { ws_fire_forge: 2, ws_aqua_well: 1 }
        });
        expect(r.ok).toBe(true);
        if (r.ok) {
            expect(r.state.workstations.mod_fire_capture).toBe(2);
            expect(r.state.workstations.mod_water_capture).toBe(1);
            expect(r.state.workstations.ws_fire_forge).toBeUndefined();
        }
    });
});

describe('07–09 chapters contracts prestige', () => {
    test('primary contract starts at fire tap', () => {
        const c = getPrimaryContract(createInitialState(1));
        expect(c.id).toBe('c_fire_tap');
    });

    test('crafting fire tap completes contract and may open chapter', () => {
        const s = createInitialState(1);
        s.inventory = { fire_essence: 50 };
        let r = reduce(s, { type: 'craft', moduleId: 'mod_fire_capture' });
        r = reduce(r.state, { type: 'chapter_check' });
        expect(r.state.contractsCompleted).toContain('c_fire_tap');
        expect(r.state.chapters.reached).toEqual(expect.arrayContaining(['ch1_capture']));
    });

    test('prestige preview emits recommend band', () => {
        const s = createInitialState(1);
        s.prestigeLifetimeEarned = 5000;
        s.ab = 300;
        const r = applyPrestigePreview(s);
        expect(r.events[0].type).toBe('prestige_preview');
        expect(r.events[0].recommend.projectedKeys).toBeGreaterThanOrEqual(1);
    });

    test('prestige commit resets pipeline keeps prestigeCount', () => {
        const s = createInitialState(1);
        s.prestigeLifetimeEarned = 10000;
        s.ab = 500;
        s.workstations = { mod_fire_capture: 3 };
        const r = reduce(s, { type: 'prestige_commit', affinity: 'fire' });
        expect(r.events.some((e) => e.type === 'prestigeCommitted')).toBe(true);
        expect(r.state.prestigeCount).toBe(1);
        expect(r.state.workstations.mod_fire_capture || 0).toBe(0);
        expect(r.state.elementSpecialization).toBe('fire');
        expect(r.state.prestigeBonuses.boon_kernel_fragment).toBe(1);
        expect(r.state.totalKeys).toBeGreaterThanOrEqual(1);
        expect(r.state.keys).toBe(r.state.totalKeys);
        // Keys survive serialize round-trip
        const json = serializeKernel(r.state);
        const d = deserializeKernel(json);
        expect(d.ok).toBe(true);
        if (d.ok) expect(d.state.totalKeys).toBe(r.state.totalKeys);
    });

    test('offline tick clamps to 8h', () => {
        const s = createInitialState(1);
        s.workstations = { mod_fire_capture: 1 };
        const r = reduce(s, { type: 'tick', dtSec: 9 * 3600, offline: true });
        const ev = r.events.find((e) => e.type === 'tick');
        expect(ev.dtSec).toBe(8 * 3600);
    });
});

describe('adapter', () => {
    test('projectCastThroughKernel from game-like object', () => {
        const gs = { ab: 0, inventory: {}, totalTaps: 0, prestigeLifetimeEarned: 0 };
        const r = projectCastThroughKernel(gs);
        expect(r.state.ab).toBeGreaterThan(0);
    });
});
