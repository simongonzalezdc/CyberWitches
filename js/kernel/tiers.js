/**
 * Design-tier gates rebound to chapter/skill milestones (ticket 12).
 * Ceremony listens to events; Kernel owns the rules.
 */

import { cloneState } from './state.js';
import { CHAPTERS } from './chapters.js';

/**
 * Milestone → design tier index (0-based chrome stage).
 * Rebound away from pure AB grind: chapters and prestige drive heals.
 * @type {{ tier: number, id: string, check: (s: import('./types.js').KernelState) => boolean }[]}
 */
export const TIER_GATES = [
    { tier: 0, id: 'boot', check: () => true },
    {
        tier: 1,
        id: 'first_capture',
        check: (s) => (s.chapters?.reached || []).includes('ch1_capture') || (s.totalTaps || 0) >= 20
    },
    {
        tier: 2,
        id: 'storage_online',
        check: (s) =>
            (s.chapters?.reached || []).includes('ch2_storage') ||
            (s.workstations?.mod_essence_buffer || 0) >= 1
    },
    {
        tier: 3,
        id: 'bind_stream',
        check: (s) => (s.chapters?.reached || []).includes('ch3_bind')
    },
    {
        tier: 4,
        id: 'self_host',
        check: (s) => (s.chapters?.reached || []).includes('ch4_compile')
    },
    {
        tier: 5,
        id: 'near_prestige',
        check: (s) => (s.chapters?.reached || []).includes('ch5_exhaustion')
    },
    {
        tier: 6,
        id: 'prestige_1',
        check: (s) => (s.prestigeCount || 0) >= 1
    }
];

/**
 * Evaluate tier gates; emit design_tier_heal when tier advances.
 * @param {import('./types.js').KernelState} state
 * @returns {import('./types.js').DispatchResult}
 */
export function applyTierCheck(state) {
    const next = cloneState(state);
    /** @type {import('./types.js').DomainEvent[]} */
    const events = [];

    let maxTier = 0;
    /** @type {string[]} */
    const unlocked = [];
    for (const g of TIER_GATES) {
        if (g.check(next)) {
            maxTier = Math.max(maxTier, g.tier);
            unlocked.push(g.id);
        }
    }

    const prev = typeof next.designTier === 'number' ? next.designTier : 0;
    next.designTier = maxTier;
    next.unlockedTiers = [...new Set([...(next.unlockedTiers || [0]), ...unlocked.map((_, i) => i).filter((i) => i <= maxTier)])];
    // Keep numeric unlocked list as 0..maxTier
    next.unlockedTiers = Array.from({ length: maxTier + 1 }, (_, i) => i);

    if (maxTier > prev) {
        events.push({
            type: 'design_tier_heal',
            from: prev,
            to: maxTier,
            gateId: TIER_GATES.find((g) => g.tier === maxTier)?.id || 'unknown',
            // Ceremony hint — UI owns mute-readable SYSTEM_RESTORE; Kernel does not touch DOM
            ceremony: 'SYSTEM_RESTORE',
            muteReadable: true
        });
    } else {
        events.push({ type: 'tier_check', designTier: maxTier, noop: maxTier === prev });
    }

    return { state: next, events };
}

/**
 * Chapter count helper for docs/tests.
 */
export function chapterCount() {
    return CHAPTERS.length;
}
