/**
 * Pure cast-bonus roll (diegetic critical compile).
 * Extracted from GameState.cast for testability.
 */

/**
 * @param {() => number} [rng]
 * @returns {number} sample clamped to [0, 1]
 */
function unitSample(rng) {
    const raw = Number(typeof rng === 'function' ? rng() : NaN);
    if (!Number.isFinite(raw)) return 1; // fail closed: no bonus
    // Clamp to [0, 1] so hostile/broken RNGs cannot invert cast rewards
    if (raw < 0) return 0;
    if (raw > 1) return 1;
    return raw;
}

/**
 * @param {() => number} [rng] Math.random-compatible
 * @returns {{ bonusMultiplier: number, bonusType: string|null }}
 */
export function rollCastBonus(rng = Math.random) {
    const bonusRoll = unitSample(rng);
    let bonusMultiplier = 1.0;
    /** @type {string|null} */
    let bonusType = null;

    if (bonusRoll < 0.05) {
        bonusMultiplier = 2.0 + unitSample(rng) * 3.0; // 2.0–5.0
        bonusType = 'critical_compile';
    } else if (bonusRoll < 0.15) {
        bonusMultiplier = 1.5;
        bonusType = 'compile_overclock';
    }

    return { bonusMultiplier, bonusType };
}
