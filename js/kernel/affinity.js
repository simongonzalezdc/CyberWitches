/**
 * Affinity foreshadow + four specialization strategies (ticket 10).
 * Pure. Paths change optimal pipeline play after prestige lock-in.
 */

/** @typedef {'fire'|'water'|'air'|'crystal'} AffinityId */

/**
 * @typedef {Object} SpecializationStrategy
 * @property {AffinityId} id
 * @property {string} name
 * @property {string} tagline
 * @property {string} pipelineHint
 * @property {{ castRewardMult?: number, captureRateMult?: number, storageBonusMult?: number, fadeMult?: number, bindRateMult?: number, compileRateMult?: number, productionMult?: number }} bonuses
 */

/** @type {Record<AffinityId, SpecializationStrategy>} */
export const SPECIALIZATION_STRATEGIES = {
    fire: {
        id: 'fire',
        name: 'Ember Compiler',
        tagline: 'Hot capture, thin buffers',
        pipelineHint: 'Favor Capture + Compile; spend less on Store early.',
        bonuses: {
            castRewardMult: 1.15,
            captureRateMult: 1.25,
            storageBonusMult: 0.9,
            fadeMult: 1.05
        }
    },
    water: {
        id: 'water',
        name: 'Depth Archivist',
        tagline: 'Buffers hold the tide',
        pipelineHint: 'Store modules are stronger; fade softens while you bank essence.',
        bonuses: {
            castRewardMult: 1.05,
            storageBonusMult: 1.35,
            fadeMult: 0.85,
            bindRateMult: 1.1
        }
    },
    air: {
        id: 'air',
        name: 'Zephyr Linker',
        tagline: 'Bind streams before they scatter',
        pipelineHint: 'Bind and Shield lean; multi-stream recipes resolve faster.',
        bonuses: {
            castRewardMult: 1.05,
            bindRateMult: 1.3,
            fadeMult: 0.92,
            compileRateMult: 1.05
        }
    },
    crystal: {
        id: 'crystal',
        name: 'Lattice Engineer',
        tagline: 'Stable compile, slow bleed',
        pipelineHint: 'Compile pays; Shield stacks cut global fade hard.',
        bonuses: {
            castRewardMult: 1.08,
            compileRateMult: 1.25,
            fadeMult: 0.88,
            storageBonusMult: 1.1
        }
    }
};

/**
 * @param {import('./types.js').KernelState} state
 * @returns {AffinityId}
 */
export function dominantAffinity(state) {
    const a = state.affinity || { fire: 0, water: 0, air: 0, crystal: 0 };
    /** @type {AffinityId} */
    let best = 'fire';
    let v = -1;
    /** @type {AffinityId[]} */
    const keys = ['fire', 'water', 'air', 'crystal'];
    for (const k of keys) {
        const n = a[k] || 0;
        if (n > v) {
            v = n;
            best = k;
        }
    }
    return best;
}

/**
 * Pre-prestige foreshadow readout for HUD.
 * @param {import('./types.js').KernelState} state
 */
export function affinityForeshadow(state) {
    const a = state.affinity || { fire: 0, water: 0, air: 0, crystal: 0 };
    const total = (a.fire || 0) + (a.water || 0) + (a.air || 0) + (a.crystal || 0);
    const lead = dominantAffinity(state);
    const strategy = SPECIALIZATION_STRATEGIES[lead];
    const shares = {
        fire: total > 0 ? (a.fire || 0) / total : 0.25,
        water: total > 0 ? (a.water || 0) / total : 0.25,
        air: total > 0 ? (a.air || 0) / total : 0.25,
        crystal: total > 0 ? (a.crystal || 0) / total : 0.25
    };
    return {
        lead,
        shares,
        strategy,
        locked: (state.prestigeCount || 0) >= 1 && !!state.elementSpecialization,
        lockedId: state.elementSpecialization || null
    };
}

/**
 * Resolve bonuses for a locked specialization (or empty).
 * @param {import('./types.js').KernelState} state
 */
export function activeStrategyBonuses(state) {
    const id = /** @type {AffinityId|null} */ (state.elementSpecialization);
    if (!id || !SPECIALIZATION_STRATEGIES[id]) {
        return { ...(state.specializationBonuses || {}) };
    }
    return {
        ...SPECIALIZATION_STRATEGIES[id].bonuses,
        ...(state.specializationBonuses || {})
    };
}
