/**
 * Deterministic production + fade tick (tickets 03, 05, 10 strategy mults).
 */

import { cloneState } from './state.js';
import { PIPELINE_MODULES, computeStorageCap } from './content.js';
import { applyFade } from './fade.js';
import { activeStrategyBonuses } from './affinity.js';

/**
 * @param {import('./types.js').KernelState} state
 * @param {{ dtSec?: number, offline?: boolean }} [opts]
 * @returns {import('./types.js').DispatchResult}
 */
export function applyTick(state, opts = {}) {
    let dt = Math.max(0, Number(opts.dtSec) || 0);
    // Bound offline catch-up (8h)
    if (opts.offline) dt = Math.min(dt, 8 * 3600);

    const next = cloneState(state);
    /** @type {import('./types.js').DomainEvent[]} */
    const events = [];

    if (dt <= 0) {
        return { state: next, events: [{ type: 'tick', dtSec: 0, noop: true }] };
    }

    const bonuses = activeStrategyBonuses(next);
    const captureMult = Number(bonuses.captureRateMult) || 1;
    const bindMult = Number(bonuses.bindRateMult) || 1;
    const compileMult = Number(bonuses.compileRateMult) || 1;
    const productionMult = Number(bonuses.productionMult) || 1;
    const storageMult = Number(bonuses.storageBonusMult) || 1;
    const strategyFade = Number(bonuses.fadeMult) || 1;

    /** @type {Record<string, number>} */
    const produced = {};
    for (const mod of PIPELINE_MODULES) {
        const owned = next.workstations[mod.id] || 0;
        if (owned <= 0 || !mod.outputs) continue;
        let roleMult = 1;
        if (mod.role === 'capture') roleMult = captureMult;
        else if (mod.role === 'bind') roleMult = bindMult;
        else if (mod.role === 'compile') roleMult = compileMult;
        roleMult *= productionMult;
        for (const [outId, rate] of Object.entries(mod.outputs)) {
            const gain = rate * owned * dt * roleMult;
            if (outId === 'ab') {
                next.ab = (next.ab || 0) + gain;
                next.prestigeLifetimeEarned = (next.prestigeLifetimeEarned || 0) + gain;
            } else {
                next.inventory[outId] = (next.inventory[outId] || 0) + gain;
            }
            produced[outId] = (produced[outId] || 0) + gain;
        }
    }

    const baseCap = computeStorageCap(next.workstations || {}, 50);
    next.storageCap = Math.max(50, Math.floor(baseCap * storageMult));

    const soft = (next.totalTaps || 0) < 80 && (next.prestigeCount || 0) === 0;
    // strategyFade < 1 slows fade: reduce effective fade time; > 1 hastens it.
    const fadeDt = dt * Math.max(0.5, strategyFade);
    const fadeResult = applyFade(next, fadeDt, { soft: soft || !!opts.offline });
    next.inventory = fadeResult.inventory;
    next.storageCap = fadeResult.storageCap;
    next.tick = (next.tick || 0) + 1;

    events.push({
        type: 'tick',
        dtSec: dt,
        offline: !!opts.offline,
        produced,
        faded: fadeResult.faded,
        storageCap: next.storageCap
    });

    if (Object.keys(fadeResult.faded).length) {
        events.push({ type: 'faded', amounts: fadeResult.faded });
    }

    return { state: next, events };
}
