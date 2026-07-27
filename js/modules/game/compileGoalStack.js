/**
 * Post-tutorial primary compile goals — always-on next objective.
 * TutorialSystem remains first-run owner; this takes over after complete/skip.
 */

/** @typedef {{ id: string, title: string, message: string, check: (ctx: GoalContext) => boolean }} CompileGoal */
/** @typedef {{ ab: number, workstations: Record<string, number>, discoveredRecipes: string[], prestigeCount: number, totalTaps: number, meditationSessionDone?: boolean }} GoalContext */

/** @type {CompileGoal[]} */
export const COMPILE_GOAL_QUEUE = [
    {
        id: 'automate_fire',
        title: 'COMPILE_GOAL',
        message: 'Bring Fire Forge online (own ≥1) to start background compilation.',
        check: (ctx) => (ctx.workstations?.ws_fire_forge || 0) >= 1
    },
    {
        id: 'automate_water',
        title: 'COMPILE_GOAL',
        message: 'Stabilize Water sector — own ≥1 Aqua Well.',
        check: (ctx) => (ctx.workstations?.ws_aqua_well || 0) >= 1
    },
    {
        id: 'lab_protocol',
        title: 'RUN_PROTOCOL',
        message: 'Open /BIN/LAB and discover ≥1 hidden recipe.',
        check: (ctx) => (ctx.discoveredRecipes?.length || 0) >= 1
    },
    {
        id: 'ab_reactor',
        title: 'COMPILE_GOAL',
        message: 'Bring an Arcane Bit reactor online (own any AB producer workstation).',
        check: (ctx) => Object.entries(ctx.workstations || {}).some(([id, n]) => n > 0 && id.includes('bit_reactor'))
    },
    {
        id: 'first_prestige',
        title: 'ASCEND',
        message: 'Prepare and complete Prestige 1 when ready — permanent EK boons unlock.',
        check: (ctx) => (ctx.prestigeCount || 0) >= 1
    },
    {
        id: 'meditation_once',
        title: 'DEFRAG',
        message: 'Run one Meditation session after prestige to boost main production.',
        check: (ctx) => (ctx.prestigeCount || 0) >= 1 && !!ctx.meditationSessionDone
    }
];

/**
 * @param {GoalContext & { meditationSessionDone?: boolean }} ctx
 * @param {string[]} [completedIds]
 * @returns {CompileGoal | null}
 */
export function getPrimaryCompileGoal(ctx, completedIds = []) {
    const done = new Set(completedIds);
    for (const goal of COMPILE_GOAL_QUEUE) {
        if (done.has(goal.id)) continue;
        if (goal.check(ctx)) {
            done.add(goal.id);
            continue;
        }
        return goal;
    }
    return {
        id: 'maintain',
        title: 'COMPILE_IDLE',
        message: 'All primary directives complete. Optimize ABPS, boons, and meditation.',
        check: () => false
    };
}

/**
 * Advance completed ids from context (idempotent).
 * @param {GoalContext & { meditationSessionDone?: boolean }} ctx
 * @param {string[]} completedIds
 * @returns {string[]}
 */
export function syncCompletedGoals(ctx, completedIds = []) {
    const done = new Set(completedIds);
    for (const goal of COMPILE_GOAL_QUEUE) {
        if (goal.check(ctx)) done.add(goal.id);
    }
    return [...done];
}
