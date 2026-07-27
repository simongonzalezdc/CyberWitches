/**
 * Read-only HUD projectors (tickets 13–14).
 * Pure view models — no DOM. Counts legacy ws_* via pipelineRoles.
 */

import { PIPELINE_MODULES } from './content.js';
import { getPrimaryContract } from './chapters.js';
import { affinityForeshadow } from './affinity.js';
import { ROLE_ORDER, countOwnedByRole, roleForId } from './pipelineRoles.js';
import { fadeableTotal } from './fade.js';

/**
 * Pipeline structure for progressive disclosure HUD.
 * @param {import('./types.js').KernelState} state
 * @param {{ legacyWorkstations?: Record<string, number> }} [opts]
 *   When projecting from GameState, pass raw ws_* bag so owned counts match craft UI.
 */
export function projectPipelineHud(state, opts = {}) {
    /** @type {Record<string, { role: string, modules: object[], ownedTotal: number }>} */
    const byRole = {};
    for (const role of ROLE_ORDER) {
        byRole[role] = { role, modules: [], ownedTotal: 0 };
    }

    // Kernel content modules (mod_*)
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
        }
    }

    // Owned totals: use exactly one bag to avoid double-count when legacy ws_*
    // was already mapped into state.workstations as mod_*. Prefer explicit
    // live craft bag when provided (GameState.workstations).
    const bag =
        opts.legacyWorkstations != null
            ? opts.legacyWorkstations
            : state.workstations || {};
    const counts = countOwnedByRole(bag);
    for (const role of ROLE_ORDER) {
        byRole[role].ownedTotal = counts[role] || 0;
    }

    const cap = state.storageCap || 50;
    const used = fadeableTotal(state.inventory || {});
    const overcap = used > cap;
    return {
        roles: ROLE_ORDER.map((r) => byRole[r]),
        storageCap: cap,
        storageUsed: used,
        storageOvercap: overcap,
        voidPressure: overcap ? (used - cap) / Math.max(cap, 1) : 0,
        primaryVerb: 'EXEC',
        dualQuestHud: false,
        roleForId,
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
