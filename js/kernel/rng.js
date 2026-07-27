/**
 * Seeded RNG for pure Kernel transitions (no Math.random).
 * Mulberry32 — deterministic, fast, good enough for cast rolls.
 */

/**
 * @param {number} seed
 * @returns {() => number} unit sample in [0, 1)
 */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Advance seed after n draws (for state.rngSeed updates).
 * @param {number} seed
 * @param {number} n
 * @returns {number}
 */
export function advanceSeed(seed, n = 1) {
    const rng = mulberry32(seed);
    for (let i = 0; i < n; i++) rng();
    // Derive next seed from last sample bits
    return (Math.floor(rng() * 0xffffffff) ^ (seed + n * 0x9e3779b9)) >>> 0;
}
