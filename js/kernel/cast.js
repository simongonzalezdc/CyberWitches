/**
 * Pure cast transition — no DOM, no GameState.
 */

import { mulberry32, advanceSeed } from './rng.js';
import { cloneState } from './state.js';

/**
 * Diegetic cast bonus roll (mirrors rollCastBonus, seeded).
 * @param {() => number} rng
 */
export function rollCastBonusSeeded(rng) {
    const bonusRoll = rng();
    let bonusMultiplier = 1.0;
    /** @type {string|null} */
    let bonusType = null;
    if (bonusRoll < 0.05) {
        bonusMultiplier = 2.0 + rng() * 3.0;
        bonusType = 'critical_compile';
    } else if (bonusRoll < 0.15) {
        bonusMultiplier = 1.5;
        bonusType = 'compile_overclock';
    }
    return { bonusMultiplier, bonusType };
}

/**
 * @param {import('./types.js').KernelState} state
 * @param {{ comboMult?: number, eventMult?: number, clickMult?: number, clickAdditive?: number, castSpeedMult?: number }} [opts]
 * @returns {import('./types.js').DispatchResult}
 */
export function applyCast(state, opts = {}) {
    const next = cloneState(state);
    const rng = mulberry32(next.rngSeed);
    const { bonusMultiplier, bonusType } = rollCastBonusSeeded(rng);

    const comboMult = Number(opts.comboMult) || 1;
    const eventMult = Number(opts.eventMult) || 1;
    const clickMult = Number(opts.clickMult) || 1;
    const clickAdditive = Number(opts.clickAdditive) || 0;
    const castSpeedMult = Number(opts.castSpeedMult) || 1;

    /** @type {Record<string, number>} */
    const baseAmounts = {
        crystal_dust: 0.5,
        fire_essence: 0.5,
        water_essence: 0.5,
        air_essence: 0.5
    };

    if (next.elementSpecialization === 'fire' && next.specializationBonuses?.castRewardMult) {
        const m = Number(next.specializationBonuses.castRewardMult) || 1;
        for (const k of Object.keys(baseAmounts)) baseAmounts[k] *= m;
    }

    const totalMult = clickMult * comboMult * eventMult * castSpeedMult * bonusMultiplier;
    next.totalTaps = (next.totalTaps || 0) + 1;

    for (const [ingId, base] of Object.entries(baseAmounts)) {
        const gain = (base + clickAdditive) * totalMult;
        next.inventory[ingId] = (next.inventory[ingId] || 0) + gain;
    }

    const abGain = 0.15 * totalMult;
    next.ab = (next.ab || 0) + abGain;
    next.prestigeLifetimeEarned = (next.prestigeLifetimeEarned || 0) + abGain;

    // Affinity foreshadow: slight lean toward highest essence gained this cast (all equal → fire bias none)
    next.affinity = next.affinity || { fire: 0, water: 0, air: 0, crystal: 0 };
    next.affinity.fire += 0.25 * totalMult;
    next.affinity.water += 0.25 * totalMult;
    next.affinity.air += 0.25 * totalMult;
    next.affinity.crystal += 0.25 * totalMult;

    next.rngSeed = advanceSeed(state.rngSeed, 3);

    /** @type {import('./types.js').DomainEvent[]} */
    const events = [
        {
            type: 'cast',
            abGain,
            bonusType,
            bonusMultiplier,
            totalMult,
            totalTaps: next.totalTaps
        }
    ];

    return { state: next, events };
}
