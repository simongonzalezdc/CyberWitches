/**
 * Pure cast-bonus roll (diegetic critical compile).
 * Extracted from GameState.cast for testability.
 */

/**
 * @param {() => number} [rng] Math.random-compatible
 * @returns {{ bonusMultiplier: number, bonusType: string|null }}
 */
export function rollCastBonus(rng = Math.random) {
    const bonusRoll = rng();
    let bonusMultiplier = 1.0;
    let bonusType = null;

    if (bonusRoll < 0.05) {
        bonusMultiplier = 2.0 + rng() * 3.0;
        bonusType = 'critical_compile';
    } else if (bonusRoll < 0.15) {
        bonusMultiplier = 1.5;
        bonusType = 'compile_overclock';
    }

    return { bonusMultiplier, bonusType };
}
