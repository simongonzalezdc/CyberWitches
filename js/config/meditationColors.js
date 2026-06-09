/**
 * Meditation Color Constants
 * These colors are used for canvas rendering in meditation towers
 * They match the CSS variables in styles/theme.css
 */

export const MEDITATION_COLORS = {
    // Grid lines
    GRID_LINE: 'rgba(255, 255, 255, 0.1)',

    // Success colors (soul theme)
    SUCCESS_FILL: 'rgba(60, 227, 197, 0.25)',
    SUCCESS_STROKE: 'rgba(60, 227, 197, 0.5)',

    // Magic colors (witch theme)
    MAGIC_FILL_START: 'rgba(255, 45, 170, 0.3)',
    MAGIC_FILL_END: 'rgba(255, 45, 170, 0)',
    MAGIC_STROKE: 'rgba(255, 45, 170, 0.8)',

    // Code colors (cyan theme)
    CODE_RANGE_START: (pulse = 0) => `rgba(0, 255, 255, ${0.15 + pulse})`,
    CODE_RANGE_MID: (pulse = 0) => `rgba(0, 255, 255, ${0.08 + pulse * 0.5})`,
    CODE_RANGE_END: 'rgba(0, 255, 255, 0)',
    CODE_STROKE: (pulse = 0) => `rgba(0, 255, 255, ${0.3 + pulse})`,
    CODE_AREA_START: 'rgba(0, 255, 255, 0.1)',
    CODE_AREA_END: 'rgba(0, 255, 255, 0)',

    // Highlight colors
    HIGHLIGHT_YELLOW: 'rgba(255, 255, 0, 0.9)',
    HIGHLIGHT_ORANGE: 'rgba(255, 200, 0, 0.9)',

    // Text colors
    TEXT_WHITE: 'rgba(255, 255, 255, 0.9)',
    TEXT_WHITE_PULSE: (time = 0) => `rgba(255, 255, 255, ${0.9 + Math.sin(time * 2) * 0.1})`,
    TEXT_YELLOW: (time = 0) => `rgba(255, 255, 0, ${0.9 + Math.sin(time * 4) * 0.1})`,

    // Shadow colors
    SHADOW_DARK: 'rgba(0, 0, 0, 0.3)',
    SHADOW_DARKER: 'rgba(0, 0, 0, 0.7)',

    // Placement validation colors
    CAN_PLACE: 'rgba(0, 255, 0, 0.3)',
    CANNOT_PLACE: 'rgba(255, 0, 0, 0.3)',
    CAN_PLACE_STROKE: 'rgba(0, 255, 0, 0.8)',
    CANNOT_PLACE_STROKE: 'rgba(255, 0, 0, 0.8)',

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
    SUCCESS_HEX: '#3ce3c5',
    MAGIC_HEX: '#ff2aad',
    CODE_HEX: '#00ffff',
    YELLOW_HEX: '#ffff00',
    ORANGE_HEX: '#ffc800',
    WHITE_HEX: '#ffffff'
};