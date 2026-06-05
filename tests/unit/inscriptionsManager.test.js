/**
 * Regression tests for InscriptionsManager.
 *
 * Guards two real bugs where inscribing an upgrade from the UI was completely
 * broken (every click threw, error swallowed by the handler):
 *   1. inscribeUpgrade called this.gameState.inscribeUpgrade — but that method
 *      was moved to CraftingManager, so gameState.inscribeUpgrade is undefined.
 *   2. The success/failure notification read this.gameState.upgrades[upgId] —
 *      gameState has no `upgrades` table (definitions live in UPGRADES), so it
 *      threw AFTER a successful inscribe, before the UI could refresh.
 */
import { jest, describe, test, expect } from '@jest/globals';
import { InscriptionsManager } from '../../js/modules/game/inscriptionsManager.js';
import { UPGRADES } from '../../js/data.js';

function makeManager(inscribeResult) {
    const craftingManager = { inscribeUpgrade: jest.fn(() => inscribeResult) };
    const inscriptionsUI = { update: jest.fn() };
    const workstationUI = { update: jest.fn() };
    const uiManager = { systems: { craftingManager }, inscriptionsUI, workstationUI };
    const gameState = { upgradesOwned: {} }; // truthy; intentionally NO inscribeUpgrade / upgrades
    const manager = new InscriptionsManager(gameState, uiManager);
    return { manager, craftingManager, inscriptionsUI, workstationUI, gameState };
}

describe('InscriptionsManager.inscribeUpgrade', () => {
    test('delegates to CraftingManager.inscribeUpgrade (not gameState)', () => {
        const { manager, craftingManager } = makeManager(true);
        const upgId = UPGRADES[0].id;

        expect(() => manager.inscribeUpgrade(upgId)).not.toThrow();
        expect(craftingManager.inscribeUpgrade).toHaveBeenCalledWith(upgId);
    });

    test('does not throw on the success notification path and refreshes UI', () => {
        const { manager, inscriptionsUI, workstationUI } = makeManager(true);

        expect(() => manager.inscribeUpgrade(UPGRADES[0].id)).not.toThrow();
        // The success path must reach the UI refresh (previously blocked by a throw
        // on this.gameState.upgrades[upgId]).
        expect(inscriptionsUI.update).toHaveBeenCalled();
        expect(workstationUI.update).toHaveBeenCalled();
    });

    test('does not throw on the failure path', () => {
        const { manager, inscriptionsUI } = makeManager(false);

        expect(() => manager.inscribeUpgrade(UPGRADES[0].id)).not.toThrow();
        // Failed inscribe should not refresh as if it succeeded.
        expect(inscriptionsUI.update).not.toHaveBeenCalled();
    });

    test('resolves a real upgrade displayName from UPGRADES data', () => {
        // The notification looks up the upgrade in the UPGRADES table; this only
        // works because the first upgrade actually has a displayName.
        expect(UPGRADES[0].displayName).toBeTruthy();
    });
});
