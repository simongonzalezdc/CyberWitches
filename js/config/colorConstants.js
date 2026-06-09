/**
 * Color Constants - Single source of truth for JavaScript color values
 * Kyanite runtime palette for JavaScript-managed UI surfaces.
 * Keep CSS variables and canvas-safe JS constants aligned during the Branch B reskin.
 */

export const COLORS = {
    // Core Void Palette
    VOID_950: '#05070b',
    VOID_900: '#070a10',
    VOID_800: '#080d14',
    VOID_700: '#0b131d',

    // Magic/Witch Theme
    WITCH_500: '#ff2f6d',
    WITCH_600: '#b314ff',

    // Success/Soul
    SOUL_400: '#33ff99',

    // Gold/Magic
    GOLD_400: '#f5d35c',
    MAGIC: '#f5d35c',

    // Error/Glitch
    GLITCH_500: '#ff1a3d',
    CORRUPTION: '#ff1a3d',

    // Code/System
    CODE: '#26e6ff',
    CODE_DIM: '#087dcc',
    SYSTEM: '#c3d4e2',
    DIM: '#8297aa',


    // Kyanite Labs canonical tokens
    KY_VOID: '#05070b',
    KY_VOID_DEPTH: '#070a10',
    KY_MIDNIGHT: '#080d14',
    KY_BASALT: '#0b131d',
    KY_BASALT_ELEVATED: '#0e1b29',
    KY_BASALT_RIDGE: '#122335',
    KY_CRYSTAL: '#f3f8ff',
    KY_MIST: '#c3d4e2',
    KY_STEEL: '#8297aa',
    KY_CYAN: '#26e6ff',
    KY_ELECTRIC: '#087dcc',
    KY_OCEAN: '#00a7dc',
    KY_MAGENTA: '#ff2f6d',
    KY_VIOLET: '#b314ff',
    KY_AMBER: '#f5d35c',
    KY_GREEN: '#33ff99',
    KY_RED: '#ff1a3d',

    // Retro Terminal
    RETRO_GREEN: '#39ff14',
    RETRO_RED: '#ff1a3d',

    // Functional Colors
    PRIMARY: '#26e6ff',
    ACCENT: '#f5d35c',
    ERROR: '#ff1a3d',
    SUCCESS: '#33ff99',
    WARNING: '#f5d35c',

    // Text Colors
    TEXT_PRIMARY: '#f3f8ff',
    TEXT_SECONDARY: '#c3d4e2',
    TEXT_DIM: '#8297aa',
    TEXT_MUTED: '#8297aa',

    // Background Colors
    BG_VOID: '#05070b',
    BG_TERMINAL: '#070a10',
    BG_PANEL: '#080d14',
    BG_CARD: '#0e1b29',
    BG_DARK: '#05070b',
    BG_DARK_ALT: '#070a10',

    // Border & UI Elements
    BORDER: '#122335',
    BORDER_LIGHT: 'rgba(38, 230, 255, 0.18)',
    BORDER_FOCUS: 'rgba(38, 230, 255, 0.6)',
    BORDER_UI: 'rgba(130, 151, 170, 0.28)',

    // Opacity Constants
    OPACITY_HIDDEN: 0,
    OPACITY_FAINT: 0.1,
    OPACITY_DIM: 0.3,
    OPACITY_HALF: 0.5,
    OPACITY_VISIBLE: 0.7,
    OPACITY_FULL: 1.0,

    // Font Size Constants (minimum 10px for readability)
    FONT_SIZE_TINY: 10,
    FONT_SIZE_SMALL: 12,
    FONT_SIZE_NORMAL: 14,
    FONT_SIZE_MEDIUM: 16,
    FONT_SIZE_LARGE: 18,
    FONT_SIZE_XLARGE: 24,
    FONT_SIZE_XXLARGE: 32
};

/**
 * Helper function to get CSS variable values at runtime
 * Use this for colors that might be overridden by themes
 */
export function getCSSColor(variableName) {
    if (typeof document === 'undefined') {
        return COLORS[variableName] || '#000000';
    }

    // eslint-disable-next-line no-undef
    const style = getComputedStyle(document.documentElement);
    const cssVar = variableName.startsWith('--') ? variableName : `--color-${variableName.toLowerCase()}`;
    return style.getPropertyValue(cssVar).trim() || COLORS[variableName] || '#000000';
}

/**
 * Helper to convert CSS variable name to constant name
 * Example: '--color-witch-500' -> 'WITCH_500'
 */
export function cssVarToConstant(cssVar) {
    return cssVar
        .replace('--color-', '')
        .replace('--', '')
        .toUpperCase()
        .replace(/-/g, '_');
}
