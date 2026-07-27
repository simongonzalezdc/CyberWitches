/**
 * Optional Meditation mastery (ticket 11).
 * Pure: grants production mult after a short first session; skippable.
 */

import { cloneState } from './state.js';

/** Design target: first session ≤ 3 minutes (180s simulated). */
export const FIRST_SESSION_TARGET_SEC = 180;

/**
 * @param {import('./types.js').KernelState} state
 * @param {{ durationSec?: number, wavesCleared?: number, skip?: boolean }} [opts]
 * @returns {import('./types.js').DispatchResult}
 */
export function applyMeditationComplete(state, opts = {}) {
    const next = cloneState(state);
    /** @type {import('./types.js').DomainEvent[]} */
    const events = [];

    if ((next.prestigeCount || 0) < 1) {
        return {
            state: next,
            events: [{ type: 'meditation_failed', reason: 'requires_prestige_1' }]
        };
    }

    if (opts.skip) {
        next.chapters = next.chapters || { reached: [], qualities: {} };
        next.chapters.qualities = { ...(next.chapters.qualities || {}), meditation_skipped: true };
        events.push({
            type: 'meditation_skipped',
            message: 'Pure idle path kept. Meditation remains optional.'
        });
        return { state: next, events };
    }

    const durationSec = Math.max(0, Number(opts.durationSec) || 0);
    const waves = Math.max(0, Number(opts.wavesCleared) || 0);
    const alreadyMastered = !!(next.chapters?.qualities || {}).meditation_mastered;

    // First-session mastery: complete within target with ≥1 wave → production mult
    let multDelta = 0;
    if (!alreadyMastered) {
        const withinTarget = durationSec > 0 && durationSec <= FIRST_SESSION_TARGET_SEC;
        if (withinTarget && waves >= 1) {
            multDelta = 0.08 + Math.min(0.07, waves * 0.01);
            next.specializationBonuses = {
                ...(next.specializationBonuses || {}),
                productionMult:
                    (Number(next.specializationBonuses?.productionMult) || 1) * (1 + multDelta)
            };
            next.chapters = next.chapters || { reached: [], qualities: {} };
            next.chapters.qualities = {
                ...(next.chapters.qualities || {}),
                meditation_mastered: true,
                meditation_first_session_sec: durationSec
            };
            events.push({
                type: 'meditation_mastered',
                durationSec,
                wavesCleared: waves,
                productionMultDelta: multDelta,
                productionMult:
                    next.specializationBonuses.productionMult,
                message: `First Meditation mastery — main pipeline production ×${(1 + multDelta).toFixed(2)}`
            });
        } else {
            events.push({
                type: 'meditation_session',
                durationSec,
                wavesCleared: waves,
                mastered: false,
                hint:
                    durationSec > FIRST_SESSION_TARGET_SEC
                        ? 'First mastery wants ≤3 minutes — try a shorter clear.'
                        : 'Clear at least one wave within 3 minutes for first mastery.'
            });
        }
    } else {
        // Repeat sessions: smaller stacking mult capped
        const prior = Number(next.specializationBonuses?.productionMult) || 1;
        const add = Math.min(0.02, waves * 0.005);
        if (add > 0 && prior < 1.35) {
            next.specializationBonuses = {
                ...(next.specializationBonuses || {}),
                productionMult: Math.min(1.35, prior * (1 + add))
            };
            multDelta = add;
        }
        events.push({
            type: 'meditation_session',
            durationSec,
            wavesCleared: waves,
            mastered: true,
            productionMultDelta: multDelta,
            productionMult: next.specializationBonuses?.productionMult
        });
    }

    return { state: next, events };
}
