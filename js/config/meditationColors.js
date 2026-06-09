/**
 * Meditation Color Constants
 * Canvas-safe Kyanite color constants for meditation towers.
 * Keep explicit RGBA strings here because canvas cannot consume CSS custom properties reliably.
 */

export const MEDITATION_COLORS = {
    // Grid lines
    GRID_LINE: 'rgba(243, 248, 255, 0.1)',

    // Success colors (soul theme)
    SUCCESS_FILL: 'rgba(51, 255, 153, 0.25)',
    SUCCESS_STROKE: 'rgba(51, 255, 153, 0.5)',

    // Magic colors (witch theme)
    MAGIC_FILL_START: 'rgba(255, 47, 109, 0.3)',
    MAGIC_FILL_END: 'rgba(255, 47, 109, 0)',
    MAGIC_STROKE: 'rgba(255, 47, 109, 0.8)',

    // Code colors (cyan theme)
    CODE_RANGE_START: (pulse = 0) => `rgba(38, 230, 255, ${0.15 + pulse})`,
    CODE_RANGE_MID: (pulse = 0) => `rgba(38, 230, 255, ${0.08 + pulse * 0.5})`,
    CODE_RANGE_END: 'rgba(38, 230, 255, 0)',
    CODE_STROKE: (pulse = 0) => `rgba(38, 230, 255, ${0.3 + pulse})`,
    CODE_AREA_START: 'rgba(38, 230, 255, 0.1)',
    CODE_AREA_END: 'rgba(38, 230, 255, 0)',

    // Highlight colors
    HIGHLIGHT_YELLOW: 'rgba(245, 211, 92, 0.9)',
    HIGHLIGHT_ORANGE: 'rgba(245, 211, 92, 0.9)',

    // Text colors
    TEXT_WHITE: 'rgba(243, 248, 255, 0.9)',
    TEXT_WHITE_PULSE: (time = 0) => `rgba(243, 248, 255, ${0.9 + Math.sin(time * 2) * 0.1})`,
    TEXT_YELLOW: (time = 0) => `rgba(245, 211, 92, ${0.9 + Math.sin(time * 4) * 0.1})`,

    // Shadow colors
    SHADOW_DARK: 'rgba(5, 7, 11, 0.3)',
    SHADOW_DARKER: 'rgba(5, 7, 11, 0.7)',

    // Placement validation colors
    CAN_PLACE: 'rgba(51, 255, 153, 0.3)',
    CANNOT_PLACE: 'rgba(255, 26, 61, 0.3)',
    CAN_PLACE_STROKE: 'rgba(51, 255, 153, 0.8)',
    CANNOT_PLACE_STROKE: 'rgba(255, 26, 61, 0.8)',

    // Dynamic glow effect helpers
    createGlowGradient: (ctx, r, g, b, a) => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.4})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.2})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        return gradient;
    },

    createFillGradient: (ctx, x1, y1, x2, y2, r, g, b, a) => {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${a})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);
        return gradient;
    },

    // Hex colors for reference (matching RGB values above)
    SUCCESS_HEX: '#33ff99',
    MAGIC_HEX: '#ff2f6d',
    CODE_HEX: '#26e6ff',
    YELLOW_HEX: '#f5d35c',
    ORANGE_HEX: '#f5d35c',
    WHITE_HEX: '#f3f8ff'
};
