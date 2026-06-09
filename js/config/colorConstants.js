/**
 * Color Constants - Single source of truth for JavaScript color values
 * These match the CSS variables in styles/theme.css
 * Use these instead of hardcoded colors in JavaScript
 */

export const COLORS = {
    // Core Void Palette
    VOID_950: '#050508',
    VOID_900: '#0a0a12',
    VOID_800: '#11111a',
    VOID_700: '#151723',

    // Magic/Witch Theme
    WITCH_500: '#d93ff0',
    WITCH_600: '#ad24c8',

    // Success/Soul
    SOUL_400: '#3ce3c5',

    // Gold/Magic
    GOLD_400: '#ffcf65',
    MAGIC: '#ffb84c',

    // Error/Glitch
    GLITCH_500: '#ff2a6d',
    CORRUPTION: '#ff2a6d',

    // Code/System
    CODE: '#00f0ff',
    CODE_DIM: '#007a82',
    SYSTEM: '#d7dcf4',
    DIM: '#a8afcf',

    // Retro Terminal
    RETRO_GREEN: '#39ff14',
    RETRO_RED: '#ff0000',

    // Functional Colors
    PRIMARY: '#00f0ff',
    ACCENT: '#ffb84c',
    ERROR: '#ff2a6d',
    SUCCESS: '#3ce3c5',
    WARNING: '#ffb84c',

    // Text Colors
    TEXT_PRIMARY: '#f7f8ff',
    TEXT_SECONDARY: '#a8afcf',
    TEXT_DIM: '#a8afcf',
    TEXT_MUTED: '#a8afcf',

    // Background Colors
    BG_VOID: '#050508',
    BG_TERMINAL: '#0a0a12',
    BG_PANEL: '#11111a',
    BG_CARD: '#1f1f3a',
    BG_DARK: '#06060d',
    BG_DARK_ALT: '#0a0a0f',

    // Border & UI Elements
    BORDER: '#333366',
    BORDER_LIGHT: 'rgba(0, 240, 255, 0.2)',
    BORDER_FOCUS: 'rgba(0, 240, 255, 0.6)',
    BORDER_UI: 'rgba(168, 175, 207, 0.28)',

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