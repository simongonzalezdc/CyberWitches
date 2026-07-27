/**
 * Systems ownership coalesce + production sole path (GLM C1/C2/H1/H2 fixes)
 */
import {
    coalesceWorkstations,
    projectOwnershipBag,
    applyOwnershipDelta,
    canonicalWorkstationId,
    ownedCountIncludingAlias
} from '../../js/kernel/ownership.js';
import { countOwnedByRole } from '../../js/kernel/pipelineRoles.js';
import { projectPipelineHud } from '../../js/kernel/projector.js';
import { createInitialState } from '../../js/kernel/state.js';
import { applyCraft } from '../../js/kernel/craft.js';
import { fadeableTotal } from '../../js/kernel/fade.js';
import { GameState } from '../../js/gameState.js';

describe('ownership projection (C1 sum + write canonical)', () => {
    test('canonical id maps mod capture to live ws_*', () => {
        expect(canonicalWorkstationId('mod_fire_capture')).toBe('ws_fire_forge');
        expect(canonicalWorkstationId('ws_fire_forge')).toBe('ws_fire_forge');
        expect(canonicalWorkstationId('mod_essence_buffer')).toBe('mod_essence_buffer');
    });

    test('coalesce SUMs paired ids so kernel crafts are not max-masked', () => {
        const bag = coalesceWorkstations({
            ws_fire_forge: 2,
            mod_fire_capture: 5,
            mod_essence_buffer: 1
        });
        expect(bag.ws_fire_forge).toBe(7);
        expect(bag.mod_fire_capture).toBeUndefined();
        expect(bag.mod_essence_buffer).toBe(1);
    });

    test('applyOwnershipDelta writes canonical and preserves prior live craft count', () => {
        let bag = { ws_fire_forge: 5 };
        bag = applyOwnershipDelta(bag, 'mod_fire_capture', 1);
        expect(bag.ws_fire_forge).toBe(6);
        expect(bag.mod_fire_capture).toBeUndefined();
    });

    test('kernel craft increments live twin when already owned', () => {
        let s = createInitialState(1);
        s.workstations = { ws_fire_forge: 5 };
        s.inventory = { fire_essence: 1000 };
        s.ab = 100;
        const r = applyCraft(s, 'mod_fire_capture', 1);
        expect(r.events.some((e) => e.type === 'crafted')).toBe(true);
        expect(r.state.workstations.ws_fire_forge).toBe(6);
        expect(r.state.workstations.mod_fire_capture).toBeUndefined();
        expect(ownedCountIncludingAlias(r.state.workstations, 'mod_fire_capture')).toBe(6);
    });

    test('role counts sum paired ids once after coalesce', () => {
        const counts = countOwnedByRole({
            ws_fire_forge: 1,
            mod_fire_capture: 2
        });
        expect(counts.capture).toBe(3);
    });

    test('pipeline HUD storage used/overcap; cap from store modules not stale base', () => {
        const state = createInitialState(1);
        state.inventory = { fire_essence: 200 };
        state.storageCap = 50;
        state.workstations = { mod_essence_buffer: 1 };
        state.totalTaps = 1000;
        const hud = projectPipelineHud(state, {
            legacyWorkstations: { mod_essence_buffer: 1 }
        });
        expect(hud.storageUsed).toBeCloseTo(fadeableTotal(state.inventory));
        // base 50 + buffer storageBonus 40
        expect(hud.storageCap).toBe(90);
        expect(hud.storageOvercap).toBe(true);
    });
});

describe('production sole path (C2)', () => {
    test('paired ids produce once at summed ownership', () => {
        const gs = new GameState();
        gs.workstations = { ws_fire_forge: 2, mod_fire_capture: 3 };
        gs.specializationBonuses = {};
        gs.upgradesOwned = {};
        gs.prestigeBonuses = {};
        gs.elementSpecialization = null;
        const out = gs.calculateTotalProduction(10, 1);
        // 5 owned * 0.2 dist_fire/s * 10s = 10
        expect(out.dist_fire).toBeCloseTo(10, 5);
    });

    test('kernel-only sector compiler produces AB', () => {
        const gs = new GameState();
        gs.workstations = { mod_sector_compiler: 2 };
        gs.specializationBonuses = {};
        gs.upgradesOwned = {};
        gs.prestigeBonuses = {};
        gs.elementSpecialization = null;
        const out = gs.calculateTotalProduction(10, 1);
        // 2 * 0.05 ab/s * 10 = 1
        expect(out.ab).toBeCloseTo(1, 5);
    });

    test('save coalesce round-trip keeps summed ownership', () => {
        const gs = new GameState();
        gs.workstations = { ws_fire_forge: 2, mod_fire_capture: 3, mod_essence_buffer: 1 };
        gs.ab = 10;
        gs.inventory = { fire_essence: 1 };
        // build payload like save
        const payload = {
            workstations: { ...gs.workstations },
            ab: gs.ab,
            inventory: { ...gs.inventory }
        };
        const saved = { workstations: coalesceWorkstations(payload.workstations) };
        expect(saved.workstations.ws_fire_forge).toBe(5);
        expect(saved.workstations.mod_fire_capture).toBeUndefined();
        const loaded = coalesceWorkstations(saved.workstations);
        expect(loaded.ws_fire_forge).toBe(5);
        expect(coalesceWorkstations(loaded)).toEqual(loaded);
    });
});
