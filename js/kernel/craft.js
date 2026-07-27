/**
 * Pure craft of pipeline modules (ticket 04).
 */

import { cloneState } from './state.js';
import { getModule, computeStorageCap } from './content.js';
import { applyOwnershipDelta, ownedCountIncludingAlias, coalesceWorkstations } from './ownership.js';

/**
 * @param {Record<string, number>} inventory
 * @param {Record<string, number>} recipe
 */
export function canAfford(inventory, recipe) {
    const EPS = 1e-9;
    for (const [k, need] of Object.entries(recipe)) {
        if ((inventory[k] || 0) < need - EPS) return false;
    }
    return true;
}

/**
 * @param {Record<string, number>} base
 * @param {number} owned
 * @param {number} growth
 */
export function scaleRecipe(base, owned, growth) {
    /** @type {Record<string, number>} */
    const out = {};
    const g = Math.pow(growth, owned);
    for (const [k, v] of Object.entries(base)) out[k] = v * g;
    return out;
}

/**
 * @param {import('./types.js').KernelState} state
 * @param {string} moduleId
 * @param {number} [amount]
 * @returns {import('./types.js').DispatchResult}
 */
export function applyCraft(state, moduleId, amount = 1) {
    const next = cloneState(state);
    const mod = getModule(moduleId);
    /** @type {import('./types.js').DomainEvent[]} */
    const events = [];

    if (!mod) {
        return { state: next, events: [{ type: 'craft_failed', reason: 'unknown_module', moduleId }] };
    }
    if ((next.ab || 0) < mod.unlockAtAb) {
        return { state: next, events: [{ type: 'craft_failed', reason: 'locked', moduleId, unlockAtAb: mod.unlockAtAb }] };
    }

    let crafted = 0;
    const max = Math.min(100, Math.max(1, amount | 0));
    for (let i = 0; i < max; i++) {
        const owned = ownedCountIncludingAlias(next.workstations, moduleId);
        const recipe = scaleRecipe(mod.recipe, owned, mod.growth);
        if (!canAfford(next.inventory, recipe)) break;
        for (const [k, v] of Object.entries(recipe)) {
            next.inventory[k] = (next.inventory[k] || 0) - v;
        }
        next.workstations = applyOwnershipDelta(next.workstations, moduleId, 1);
        crafted += 1;

        // Affinity lean from elemental modules
        if (mod.element && next.affinity && mod.element in next.affinity) {
            /** @type {any} */
            const aff = next.affinity;
            aff[mod.element] = (aff[mod.element] || 0) + 1;
        }
    }

    if (crafted === 0) {
        return { state: next, events: [{ type: 'craft_failed', reason: 'cannot_afford', moduleId }] };
    }

    next.workstations = coalesceWorkstations(next.workstations);
    next.storageCap = computeStorageCap(next.workstations, next.storageCap || 50);
    events.push({
        type: 'crafted',
        moduleId,
        role: mod.role,
        amount: crafted,
        owned: ownedCountIncludingAlias(next.workstations, moduleId)
    });
    return { state: next, events };
}
