/**
 * Prestige preview + commit (ticket 09) + affinity lock-in (ticket 10).
 */

import { cloneState, createInitialState } from './state.js';
import { dominantAffinity, SPECIALIZATION_STRATEGIES } from './affinity.js';

/**
 * Rough EK projection (aligned with typical sqrt lifetime curves).
 * @param {number} lifetimeAb
 */
export function projectKeys(lifetimeAb) {
    const x = Math.max(0, Number(lifetimeAb) || 0);
    // Soft curve: first key ~ around mid-run AB totals
    return Math.floor(Math.sqrt(x / 50));
}

/**
 * Soft recommend band: suggest prestige when keys >= 1 and gains soft.
 * @param {import('./types.js').KernelState} state
 */
export function prestigeRecommend(state) {
    const keys = projectKeys(state.prestigeLifetimeEarned || 0);
    const ab = state.ab || 0;
    const nearChapter = (state.chapters?.qualities || {}).near_prestige === true;
    const ready = keys >= 1 && (ab >= 150 || nearChapter || keys >= 2);
    return {
        ready,
        projectedKeys: keys,
        band: ready ? 'recommend' : keys >= 1 ? 'optional' : 'too_early',
        message: ready
            ? 'Keys outweigh another long grind on this plane — ascend when ready.'
            : keys >= 1
                ? 'You could ascend, but more lifetime AB still fattens Keys.'
                : 'Too early — compile more lifetime AB before abandoning this plane.'
    };
}

/**
 * @param {import('./types.js').KernelState} state
 * @returns {import('./types.js').DispatchResult}
 */
export function applyPrestigePreview(state) {
    const rec = prestigeRecommend(state);
    const persists = {
        prestigeCount: (state.prestigeCount || 0) + 1,
        keysGain: rec.projectedKeys,
        affinity: dominantAffinity(state),
        designTier: state.designTier,
        unlockedTiers: state.unlockedTiers,
        chaptersQualities: state.chapters?.qualities || {}
    };
    const resets = {
        ab: state.ab,
        inventory: state.inventory,
        workstations: state.workstations,
        upgradesOwned: state.upgradesOwned
    };
    return {
        state: cloneState(state),
        events: [
            {
                type: 'prestige_preview',
                recommend: rec,
                persists,
                resets,
                firstPrestigeToy: (state.prestigeCount || 0) === 0 ? 'boon_slot_kernel_fragment' : null
            }
        ]
    };
}

/**
 * @param {import('./types.js').KernelState} state
 * @param {{ affinity?: string|null }} [opts]
 * @returns {import('./types.js').DispatchResult}
 */
export function applyPrestigeCommit(state, opts = {}) {
    const rec = prestigeRecommend(state);
    if (rec.projectedKeys < 1 && (state.prestigeLifetimeEarned || 0) < 100) {
        return {
            state: cloneState(state),
            events: [{ type: 'prestige_failed', reason: 'insufficient_lifetime' }]
        };
    }

    const keys = Math.max(1, rec.projectedKeys);
    const affinityRaw = opts.affinity || dominantAffinity(state);
    const affinity =
        affinityRaw && SPECIALIZATION_STRATEGIES[/** @type {keyof typeof SPECIALIZATION_STRATEGIES} */ (affinityRaw)]
            ? /** @type {keyof typeof SPECIALIZATION_STRATEGIES} */ (affinityRaw)
            : dominantAffinity(state);
    const strategy = SPECIALIZATION_STRATEGIES[affinity];
    const next = createInitialState(state.rngSeed ^ 0xabcddcba);
    next.prestigeCount = (state.prestigeCount || 0) + 1;
    next.prestigeLifetimeEarned = 0; // this-run lifetime resets
    next.totalKeys = (state.totalKeys || 0) + keys;
    next.keys = (state.keys || 0) + keys;
    next.prestigeBonuses = { ...(state.prestigeBonuses || {}) };
    // First prestige sharp toy + strategy lock-in
    next.specializationBonuses = { ...strategy.bonuses };
    if ((state.prestigeCount || 0) === 0) {
        next.prestigeBonuses.boon_kernel_fragment = (next.prestigeBonuses.boon_kernel_fragment || 0) + 1;
        next.specializationBonuses.castRewardMult =
            (Number(next.specializationBonuses.castRewardMult) || 1) * 1.05;
    }
    next.elementSpecialization = affinity;
    next.designTier = Math.max(state.designTier || 0, 6);
    next.unlockedTiers = Array.from({ length: (next.designTier || 0) + 1 }, (_, i) => i);
    next.chapters = {
        reached: ['ch0_boot', 'ch6_prestige'],
        qualities: {
            ...(state.chapters?.qualities || {}),
            prestiger: true,
            affinity,
            strategy: strategy.name
        }
    };
    next.affinity = { fire: 0, water: 0, air: 0, crystal: 0 };
    next.contractsCompleted = ['c_prestige'];

    return {
        state: next,
        events: [
            {
                type: 'prestigeCommitted',
                keysGained: keys,
                affinity,
                strategy: strategy.name,
                pipelineHint: strategy.pipelineHint,
                prestigeCount: next.prestigeCount,
                firstToy: (state.prestigeCount || 0) === 0 ? 'boon_kernel_fragment' : null
            },
            {
                type: 'design_tier_heal',
                from: state.designTier || 0,
                to: next.designTier,
                gateId: 'prestige_1',
                ceremony: 'SYSTEM_RESTORE',
                muteReadable: true
            }
        ]
    };
}
