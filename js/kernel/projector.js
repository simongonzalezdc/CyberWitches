/**
 * Read-only HUD projectors (tickets 13–14).
 * Pure view models — no DOM. UI may render these without owning economy rules.
 */

import { PIPELINE_MODULES } from './content.js';
import { getPrimaryContract } from './chapters.js';
import { affinityForeshadow } from './affinity.js';

const ROLE_ORDER = ['capture', 'store', 'bind', 'compile', 'shield'];

/**
 * Pipeline structure for progressive disclosure HUD.
 * @param {import('./types.js').KernelState} state
 */
export function projectPipelineHud(state) {
    /** @type {Record<string, { role: string, modules: object[], ownedTotal: number }>} */
    const byRole = {};
    for (const role of ROLE_ORDER) {
        byRole[role] = { role, modules: [], ownedTotal: 0 };
    }
    for (const mod of PIPELINE_MODULES) {
        const owned = state.workstations?.[mod.id] || 0;
        const unlocked = (state.ab || 0) >= mod.unlockAtAb;
        const entry = {
            id: mod.id,
            displayName: mod.displayName,
            role: mod.role,
            owned,
            unlocked,
            unlockAtAb: mod.unlockAtAb,
            description: mod.description
        };
        if (byRole[mod.role]) {
            byRole[mod.role].modules.push(entry);
            byRole[mod.role].ownedTotal += owned;
        }
    }
    return {
        roles: ROLE_ORDER.map((r) => byRole[r]),
        storageCap: state.storageCap || 50,
        primaryVerb: 'EXEC',
        dualQuestHud: false,
        a11y: {
            reducedMotionSafe: true,
            oneThumbExec: true,
            liveRegionHint: 'pipeline status'
        }
    };
}

/**
 * Single primary contract rail (no dual quest HUD).
 * @param {import('./types.js').KernelState} state
 */
export function projectContractHud(state) {
    const c = getPrimaryContract(state);
    return {
        id: c.id,
        title: c.title,
        message: c.message,
        secondaryRails: [] // kill-list: no dual primary objectives
    };
}

/**
 * Affinity foreshadow strip.
 * @param {import('./types.js').KernelState} state
 */
export function projectAffinityHud(state) {
    const f = affinityForeshadow(state);
    return {
        lead: f.lead,
        shares: f.shares,
        strategyName: f.strategy?.name || null,
        pipelineHint: f.strategy?.pipelineHint || null,
        locked: f.locked,
        lockedId: f.lockedId
    };
}
