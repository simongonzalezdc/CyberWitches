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
import { applyFade, FADEABLE } from '../../js/kernel/fade.js';
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
});

describe('04 craft pipeline + 05 tick', () => {
    test('craft capture module spends recipe', () => {
        const s = createInitialState(1);
        s.inventory = { fire_essence: 100 };
        const r = reduce(s, { type: 'craft', moduleId: 'mod_fire_capture', amount: 1 });
        expect(r.events.some((e) => e.type === 'crafted')).toBe(true);
        expect(r.state.workstations.mod_fire_capture).toBe(1);
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
    });
});

describe('adapter', () => {
    test('projectCastThroughKernel from game-like object', () => {
        const gs = { ab: 0, inventory: {}, totalTaps: 0, prestigeLifetimeEarned: 0 };
        const r = projectCastThroughKernel(gs);
        expect(r.state.ab).toBeGreaterThan(0);
    });
});
