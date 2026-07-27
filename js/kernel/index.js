/**
 * Restoration Kernel — pure dispatch seam (ticket 01+).
 * No DOM. UI and GameState adapt to this.
 */

import { createInitialState, cloneState } from './state.js';
import { applyCast } from './cast.js';
import { applyTick } from './tick.js';
import { applyCraft } from './craft.js';
import { applyChapterCheck } from './chapters.js';
import { applyPrestigePreview, applyPrestigeCommit } from './prestige.js';

export { createInitialState, cloneState } from './state.js';
export { applyCast } from './cast.js';
export { applyTick } from './tick.js';
export { applyCraft } from './craft.js';
export { validateContentPack, assertContentPackValid } from './schema.js';
export { PIPELINE_MODULES, getModule } from './content.js';
export { CHAPTERS, getPrimaryContract } from './chapters.js';
export { applyPrestigePreview, applyPrestigeCommit } from './prestige.js';

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
            // Chapter checks after most commands
            if (command.type !== 'chapter_check') {
                const ch = applyChapterCheck(current);
                current = ch.state;
                result.events.push(...ch.events);
                result.state = current;
            }
            return { state: cloneState(current), events: result.events };
        }
    };
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
        default:
            return {
                state: cloneState(state),
                events: [{ type: 'unknown_command', commandType: command.type }]
            };
    }
}
