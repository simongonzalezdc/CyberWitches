/**
 * @jest-environment jsdom
 */

import { GameState } from '../../js/gameState.js';
import { encode } from '../../js/save/saveCodec.js';
import { DesignTierSystem } from '../../js/modules/game/designTierSystem.js';

const DESIGN_KEY = 'hexcompiler-design-system-version';

function minimalSnapshot(overrides = {}) {
    return {
        ab: 1,
        abTotal: 1,
        inventory: {},
        workstations: {},
        upgrades: {},
        prestige: { points: 0, lifetimeEarned: 0, bonuses: {}, count: 0 },
        experiments: { discovered: [] },
        stats: { totalTaps: 0, totalWorkstationsCrafted: 0, totalPotionsCrafted: 0 },
        milestones: { unlocked: [] },
        elementSpecialization: null,
        specializationBonuses: {},
        timestamp: Date.now() / 1000,
        version: '2.1',
        ...overrides
    };
}

describe('design-system version storage', () => {
    test('persists outside save/export blobs', () => {
        localStorage.setItem(DESIGN_KEY, 'kyanite-1');
        const gameState = new GameState();
        gameState.milestones = [];
        gameState.addAb(42);
        gameState.saveGameStateImmediate();

        const saved = localStorage.getItem('cyberWitchesSave');
        expect(saved).toBeTruthy();
        expect(saved).not.toContain(DESIGN_KEY);
        expect(localStorage.getItem(DESIGN_KEY)).toBe('kyanite-1');

        const exported = encode(minimalSnapshot({ [DESIGN_KEY]: 'kyanite-1' }));
        expect(exported).not.toContain(DESIGN_KEY);

        if (gameState.tickInterval) clearInterval(gameState.tickInterval);
    });

    test('DesignTierSystem records version and reapplies theme on mismatch', async () => {
        localStorage.setItem(DESIGN_KEY, 'legacy');
        localStorage.setItem('cw.designTier', '2');
        localStorage.setItem('cw.unlockedTiers', JSON.stringify([0, 1, 2]));

        const system = new DesignTierSystem({}, null, null);
        await system.reconcileDesignSystemVersion();

        expect(localStorage.getItem(DESIGN_KEY)).toBe(DesignTierSystem.DESIGN_SYSTEM_VERSION);
        expect(document.documentElement.dataset.designSystemVersion).toBe('kyanite-1');
        expect(document.documentElement.style.getPropertyValue('--color-code')).toBe('#26E6FF');
        expect(document.documentElement.style.getPropertyValue('--color-magic')).toBe('#F5D35C');
    });
});
