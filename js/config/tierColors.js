/**
 * Tier Color Constants
 * Single source of truth for tier styling used by UI helpers and design tier system.
 * Branch B maps tier visuals to the Kyanite Labs palette.
 */

import { COLORS } from './colorConstants.js';

const rgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;

export const TIER_STYLES = {
    0: {
        symbol: '◉',
        color: COLORS.KY_CRYSTAL,
        glow: rgba('243, 248, 255', 0.28),
        gradient: `linear-gradient(135deg, ${COLORS.KY_CRYSTAL} 0%, ${COLORS.KY_MIST} 100%)`,
        borderGlow: rgba('243, 248, 255', 0.42)
    },
    1: {
        symbol: '◆',
        color: COLORS.KY_MAGENTA,
        glow: rgba('255, 47, 109', 0.4),
        gradient: `linear-gradient(135deg, ${COLORS.KY_MAGENTA} 0%, ${COLORS.KY_VIOLET} 100%)`,
        borderGlow: rgba('255, 47, 109', 0.72)
    },
    2: {
        symbol: '◈',
        color: COLORS.KY_AMBER,
        glow: rgba('245, 211, 92', 0.36),
        gradient: `linear-gradient(135deg, ${COLORS.KY_AMBER} 0%, ${COLORS.KY_GREEN} 100%)`,
        borderGlow: rgba('245, 211, 92', 0.72)
    },
    3: {
        symbol: '✧',
        color: COLORS.KY_GREEN,
        glow: rgba('51, 255, 153', 0.34),
        gradient: `linear-gradient(135deg, ${COLORS.KY_GREEN} 0%, ${COLORS.KY_CYAN} 100%)`,
        borderGlow: rgba('51, 255, 153', 0.64)
    },
    4: {
        symbol: '✦',
        color: COLORS.KY_CYAN,
        glow: rgba('38, 230, 255', 0.4),
        gradient: `linear-gradient(135deg, ${COLORS.KY_CYAN} 0%, ${COLORS.KY_OCEAN} 100%)`,
        borderGlow: rgba('38, 230, 255', 0.7)
    },
    5: {
        symbol: '✪',
        color: COLORS.KY_RED,
        glow: rgba('255, 26, 61', 0.44),
        gradient: `linear-gradient(135deg, ${COLORS.KY_RED} 0%, ${COLORS.KY_MAGENTA} 100%)`,
        borderGlow: rgba('255, 26, 61', 0.76)
    }
};
