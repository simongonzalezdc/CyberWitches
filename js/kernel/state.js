/**
 * Pure Kernel state factory (Restoration Kernel).
 * No DOM. Serializable snapshot shape.
 */

/** @typedef {Record<string, number>} Bag */

/**
 * @returns {import('./types.js').KernelState}
 */
export function createInitialState(seed = 1) {
    return {
        version: 2,
        ab: 0,
        inventory: {},
        workstations: {},
        upgradesOwned: {},
        prestigeBonuses: {},
        prestigeCount: 0,
        prestigeLifetimeEarned: 0,
        totalKeys: 0,
        keys: 0,
        totalTaps: 0,
        elementSpecialization: null,
        specializationBonuses: {},
        /** Global unbound storage capacity (soft fade targets overflow). */
        storageCap: 50,
        /** Per-resource soft caps override (optional). */
        resourceCaps: {},
        chapters: {
            reached: ['ch0_boot'],
            qualities: {}
        },
        affinity: { fire: 0, water: 0, air: 0, crystal: 0 },
        contractsCompleted: [],
        rngSeed: seed >>> 0 || 1,
        tick: 0,
        designTier: 0,
        unlockedTiers: [0]
    };
}

/**
 * Deep-ish clone for immutable-style transitions (plain data only).
 * @template T
 * @param {T} state
 * @returns {T}
 */
export function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
}
