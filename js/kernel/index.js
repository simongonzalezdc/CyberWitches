/**
 * Restoration Kernel — pure dispatch seam (tickets 01–15).
 * No DOM. UI and GameState adapt to this.
 */

import { createInitialState, cloneState } from './state.js';
import { applyCast } from './cast.js';
import { applyTick } from './tick.js';
import { applyCraft } from './craft.js';
import { applyChapterCheck } from './chapters.js';
import { applyPrestigePreview, applyPrestigeCommit } from './prestige.js';
import { applyMeditationComplete } from './meditation.js';
import { applyTierCheck } from './tiers.js';

export { createInitialState, cloneState } from './state.js';
export { applyCast } from './cast.js';
export { applyTick } from './tick.js';
export { applyCraft } from './craft.js';
export { validateContentPack, assertContentPackValid } from './schema.js';
export { PIPELINE_MODULES, getModule, LEGACY_TO_MODULE, mapLegacyWorkstations } from './content.js';
export { CHAPTERS, getPrimaryContract } from './chapters.js';
export { applyPrestigePreview, applyPrestigeCommit } from './prestige.js';
export {
    SPECIALIZATION_STRATEGIES,
    affinityForeshadow,
    dominantAffinity,
    activeStrategyBonuses
} from './affinity.js';
export { applyMeditationComplete, FIRST_SESSION_TARGET_SEC } from './meditation.js';
export { applyTierCheck, TIER_GATES } from './tiers.js';
export { projectPipelineHud, projectContractHud, projectAffinityHud } from './projector.js';
export { coalesceWorkstations, projectOwnershipBag } from './ownership.js';
export {
    PRODUCER_PIPELINE_ROLES,
    ROLE_ORDER,
    roleForId,
    countOwnedByRole,
    withPipelineRole,
    assertAllProducersMapped
} from './pipelineRoles.js';

/**
 * @param {import('./types.js').KernelState} [state]
 * @returns {{ getState: () => import('./types.js').KernelState, dispatch: (cmd: import('./types.js').KernelCommand) => import('./types.js').DispatchResult }}
 */
export function createKernel(state) {
    let current = state ? cloneState(state) : createInitialState();

    return {
        getState() {
            return cloneState(current);
        },
        /**
         * @param {import('./types.js').KernelCommand} command
         */
        dispatch(command) {
            const result = reduce(current, command);
            current = result.state;
            // Chapter + tier checks after most mutating commands
            if (command.type !== 'chapter_check' && command.type !== 'tier_check') {
                const ch = applyChapterCheck(current);
                current = ch.state;
                result.events.push(...ch.events);
                const tr = applyTierCheckSafe(current);
                current = tr.state;
                result.events.push(...tr.events);
                result.state = current;
            }
            return { state: cloneState(current), events: result.events };
        }
    };
}

/**
 * @param {import('./types.js').KernelState} state
 * @returns {import('./types.js').DispatchResult}
 */
function applyTierCheckSafe(state) {
    try {
        return applyTierCheck(state);
    } catch (err) {
        return {
            state,
            events: [
                {
                    type: 'tier_check_error',
                    message: String(err && /** @type {Error} */ (err).message ? /** @type {Error} */ (err).message : err)
                }
            ]
        };
    }
}

/**
 * Pure reduce (no store).
 * @param {import('./types.js').KernelState} state
 * @param {import('./types.js').KernelCommand} command
 * @returns {import('./types.js').DispatchResult}
 */
export function reduce(state, command) {
    switch (command.type) {
        case 'cast':
            return applyCast(state, {
                comboMult: Number(command.comboMult) || undefined,
                eventMult: Number(command.eventMult) || undefined,
                clickMult: Number(command.clickMult) || undefined,
                clickAdditive: Number(command.clickAdditive) || undefined,
                castSpeedMult: Number(command.castSpeedMult) || undefined
            });
        case 'tick':
            return applyTick(state, {
                dtSec: Number(command.dtSec) || 0,
                offline: !!command.offline
            });
        case 'craft':
            return applyCraft(state, String(command.moduleId || ''), Number(command.amount) || 1);
        case 'prestige_preview':
            return applyPrestigePreview(state);
        case 'prestige_commit':
            return applyPrestigeCommit(state, {
                affinity: command.affinity ? String(command.affinity) : null
            });
        case 'chapter_check':
            return applyChapterCheck(state);
        case 'tier_check':
            return applyTierCheck(state);
        case 'meditation_complete':
            return applyMeditationComplete(state, {
                durationSec: Number(command.durationSec) || 0,
                wavesCleared: Number(command.wavesCleared) || 0,
                skip: !!command.skip
            });
        default:
            return {
                state: cloneState(state),
                events: [{ type: 'unknown_command', commandType: command.type }]
            };
    }
}
