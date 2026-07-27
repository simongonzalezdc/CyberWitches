/**
 * Systems expand/contract + storage pressure projector
 */
import {
    coalesceWorkstations,
    projectOwnershipBag
} from '../../js/kernel/ownership.js';
import { countOwnedByRole } from '../../js/kernel/pipelineRoles.js';
import { projectPipelineHud } from '../../js/kernel/projector.js';
import { createInitialState } from '../../js/kernel/state.js';
import { fadeableTotal } from '../../js/kernel/fade.js';

describe('ownership projection (S1/S2/S4)', () => {
    test('coalesce prefers legacy ws_* and drops paired mod_* double-count', () => {
        const bag = projectOwnershipBag({
            ws_fire_forge: 2,
            mod_fire_capture: 5,
            mod_essence_buffer: 1
        });
        expect(bag.ws_fire_forge).toBe(5); // max(2,5)
        expect(bag.mod_fire_capture).toBeUndefined();
        expect(bag.mod_essence_buffer).toBe(1);
    });

    test('role counts do not double-count paired ids', () => {
        const counts = countOwnedByRole({
            ws_fire_forge: 1,
            mod_fire_capture: 1
        });
        expect(counts.capture).toBe(1);
    });

    test('pipeline HUD storage used and overcap from weighted fade total', () => {
        const state = createInitialState(1);
        state.inventory = { fire_essence: 200 };
        state.storageCap = 50;
        state.totalTaps = 1000;
        const hud = projectPipelineHud(state, { legacyWorkstations: { ws_fire_forge: 1 } });
        expect(hud.storageUsed).toBeCloseTo(fadeableTotal(state.inventory));
        expect(hud.storageCap).toBe(50);
        expect(hud.storageOvercap).toBe(true);
        expect(hud.voidPressure).toBeGreaterThan(0);
    });
});
