/**
 * Music tier policy — pure rules extracted from AudioSystem god object.
 * Music is only allowed at design tier 4+.
 */

/**
 * @param {number} designTier
 * @returns {boolean}
 */
export function shouldAllowMusic(designTier) {
    const tier = Number(designTier);
    if (!Number.isFinite(tier)) return false;
    return tier >= 4;
}

/**
 * @param {number} designTier
 * @returns {boolean}
 */
export function shouldAllowSfx(designTier) {
    const tier = Number(designTier);
    if (!Number.isFinite(tier)) return false;
    return tier >= 2;
}
