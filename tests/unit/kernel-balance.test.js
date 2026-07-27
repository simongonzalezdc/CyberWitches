/**
 * Balance battery + property tests (ticket 15).
 */
import { createInitialState, reduce, createKernel, SPECIALIZATION_STRATEGIES } from '../../js/kernel/index.js';
import { applyFade, FADEABLE } from '../../js/kernel/fade.js';
import { projectKeys } from '../../js/kernel/prestige.js';

function assertFiniteState(state) {
    expect(Number.isFinite(state.ab)).toBe(true);
    expect(state.ab).toBeGreaterThanOrEqual(0);
    for (const [_k, v] of Object.entries(state.inventory || {})) {
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(-1e-9);
    }
    for (const [_k, v] of Object.entries(state.workstations || {})) {
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
    }
}

describe('15 balance battery', () => {
    test('random cast/tick sequences never NaN or illegal negatives', () => {
        for (let seed = 1; seed <= 20; seed++) {
            let s = createInitialState(seed * 997);
            s.inventory = { fire_essence: 50, water_essence: 50, air_essence: 50, crystal_dust: 50 };
            for (let i = 0; i < 40; i++) {
                const r1 = reduce(s, { type: 'cast' });
                s = r1.state;
                assertFiniteState(s);
                const r2 = reduce(s, { type: 'tick', dtSec: 1 + (i % 5) });
                s = r2.state;
                assertFiniteState(s);
            }
        }
    });

    test('craft costs grow monotonically with owned count', () => {
        let s = createInitialState(5);
        s.inventory = { fire_essence: 1e9 };
        let lastCost = 0;
        for (let n = 0; n < 8; n++) {
            const before = s.inventory.fire_essence;
            const r = reduce(s, { type: 'craft', moduleId: 'mod_fire_capture', amount: 1 });
            expect(r.events.some((e) => e.type === 'crafted')).toBe(true);
            const cost = before - r.state.inventory.fire_essence;
            expect(cost).toBeGreaterThanOrEqual(lastCost - 1e-9);
            lastCost = cost;
            s = r.state;
        }
    });

    test('fade never produces negative stacks', () => {
        const s = createInitialState(1);
        s.inventory = { fire_essence: 500, water_essence: 300 };
        s.storageCap = 20;
        s.totalTaps = 1000;
        const r = applyFade(s, 60);
        for (const k of FADEABLE) {
            expect(r.inventory[k] || 0).toBeGreaterThanOrEqual(0);
        }
    });

    test('prestige keys non-absurd on fixtures', () => {
        expect(projectKeys(0)).toBe(0);
        expect(projectKeys(50)).toBe(1);
        expect(projectKeys(5000)).toBeLessThan(50);
        expect(projectKeys(1e12)).toBeLessThan(1e7);
    });

    test('four specialization strategies have asymmetric bonuses', () => {
        const ids = Object.keys(SPECIALIZATION_STRATEGIES);
        expect(ids).toHaveLength(4);
        const captures = ids.map((id) => SPECIALIZATION_STRATEGIES[id].bonuses.captureRateMult || 1);
        const stores = ids.map((id) => SPECIALIZATION_STRATEGIES[id].bonuses.storageBonusMult || 1);
        // Not all identical
        expect(new Set(captures.map((x) => x.toFixed(3))).size).toBeGreaterThan(1);
        expect(new Set(stores.map((x) => x.toFixed(3))).size).toBeGreaterThan(1);
    });

    test('strategy lock-in changes tick capture rate (fire > water on capture)', () => {
        const fire = createInitialState(1);
        fire.elementSpecialization = 'fire';
        fire.specializationBonuses = { ...SPECIALIZATION_STRATEGIES.fire.bonuses };
        fire.workstations = { mod_fire_capture: 5 };
        const water = createInitialState(1);
        water.elementSpecialization = 'water';
        water.specializationBonuses = { ...SPECIALIZATION_STRATEGIES.water.bonuses };
        water.workstations = { mod_fire_capture: 5 };
        const rf = reduce(fire, { type: 'tick', dtSec: 10 });
        const rw = reduce(water, { type: 'tick', dtSec: 10 });
        expect(rf.state.inventory.fire_essence || 0).toBeGreaterThan(rw.state.inventory.fire_essence || 0);
    });

    test('meditation mastery grants production mult within 3 min', () => {
        const s = createInitialState(1);
        s.prestigeCount = 1;
        const r = reduce(s, {
            type: 'meditation_complete',
            durationSec: 120,
            wavesCleared: 2
        });
        expect(r.events.some((e) => e.type === 'meditation_mastered')).toBe(true);
        expect(r.state.specializationBonuses.productionMult).toBeGreaterThan(1);
        expect(r.state.chapters.qualities.meditation_mastered).toBe(true);
    });

    test('meditation skippable pure-idle path', () => {
        const s = createInitialState(1);
        s.prestigeCount = 1;
        const r = reduce(s, { type: 'meditation_complete', skip: true });
        expect(r.events.some((e) => e.type === 'meditation_skipped')).toBe(true);
        expect(r.state.chapters.qualities.meditation_skipped).toBe(true);
    });

    test('tier heal on chapter milestone not AB-only', () => {
        const s = createInitialState(1);
        s.chapters = { reached: ['ch0_boot', 'ch1_capture'], qualities: {} };
        const r = reduce(s, { type: 'tier_check' });
        expect(r.state.designTier).toBeGreaterThanOrEqual(1);
        expect(r.events.some((e) => e.type === 'design_tier_heal' || e.type === 'tier_check')).toBe(
            true
        );
    });

    test('kernel store auto tier after craft path', () => {
        const k = createKernel(createInitialState(2));
        // Seed inventory and craft capture → chapter + tier
        const st = k.getState();
        st.inventory = { fire_essence: 100 };
        const k2 = createKernel(st);
        const r = k2.dispatch({ type: 'craft', moduleId: 'mod_fire_capture' });
        expect(r.state.workstations.mod_fire_capture).toBe(1);
        expect(r.state.designTier).toBeGreaterThanOrEqual(1);
    });
});
