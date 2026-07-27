/**
 * Deterministic production + fade tick (tickets 03, 05).
 */

import { cloneState } from './state.js';
import { PIPELINE_MODULES } from './content.js';
import { applyFade } from './fade.js';

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

    // Production from capture/bind/compile modules
    /** @type {Record<string, number>} */
    const produced = {};
    for (const mod of PIPELINE_MODULES) {
        const owned = next.workstations[mod.id] || 0;
        if (owned <= 0 || !mod.outputs) continue;
        for (const [outId, rate] of Object.entries(mod.outputs)) {
            const gain = rate * owned * dt;
            if (outId === 'ab') {
                next.ab = (next.ab || 0) + gain;
                next.prestigeLifetimeEarned = (next.prestigeLifetimeEarned || 0) + gain;
            } else {
                next.inventory[outId] = (next.inventory[outId] || 0) + gain;
            }
            produced[outId] = (produced[outId] || 0) + gain;
        }
    }

    const soft = (next.totalTaps || 0) < 80 && (next.prestigeCount || 0) === 0;
    const fadeResult = applyFade(next, dt, { soft: soft || !!opts.offline });
    next.inventory = fadeResult.inventory;
    next.storageCap = fadeResult.storageCap;
    next.tick = (next.tick || 0) + 1;

    events.push({
        type: 'tick',
        dtSec: dt,
        offline: !!opts.offline,
        produced,
        faded: fadeResult.faded,
        storageCap: fadeResult.storageCap
    });

    if (Object.keys(fadeResult.faded).length) {
        events.push({ type: 'faded', amounts: fadeResult.faded });
    }

    return { state: next, events };
}
