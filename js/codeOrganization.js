/**
 * Code Organization Utilities
 * Provides constants and utilities to reduce magic numbers and improve organization
 */

// Game Constants
export const GAME_CONSTANTS = {
    // Timing
    TICK_RATE: 100, // milliseconds
    TICKS_PER_SECOND: 10,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    UI_UPDATE_DELAY: 16, // ~60fps
    
    // Limits
    MAX_NOTIFICATIONS_PER_SECOND: 5,
    MAX_ACHIEVEMENTS_CHECK_INTERVAL: 1000,
    MAX_EVENTS_CHECK_INTERVAL: 1000,
    
    // Animation
    ANIMATION_DURATION_FAST: 150,
    ANIMATION_DURATION_NORMAL: 300,
    ANIMATION_DURATION_SLOW: 500,
    
    // UI
    SIDEBAR_WIDTH: 250,
    SIDEBAR_COLLAPSED_WIDTH: 50,
    HUD_HEIGHT: 100,
    
    // Gameplay
    BASE_AB_PER_CAST: 0.15,
    BASE_INGREDIENT_PER_CAST: 0.5,
    BONUS_CHANCE_JACKPOT: 0.05,
    BONUS_CHANCE_NORMAL: 0.15,
    BONUS_MULTIPLIER_MIN: 2.0,
    BONUS_MULTIPLIER_MAX: 5.0,
    BONUS_MULTIPLIER_NORMAL: 1.5,
    
    // Progression
    MILESTONE_THRESHOLDS: [100, 1000, 10000, 100000, 1000000, 10000000],
    
    // Performance
    SPARKLE_COUNT_DESKTOP: 25,
    SPARKLE_COUNT_MOBILE: 15,
    TARGET_FPS: 60,
    TARGET_FPS_BACKGROUND: 30
};

// File Naming Conventions
export const FILE_NAMING = {
    // Module files should be camelCase
    MODULE_PATTERN: /^[a-z][a-zA-Z0-9]*\.js$/,
    
    // Data files can be UPPER_CASE
    DATA_PATTERN: /^[A-Z_]+\.js$/,
    
    // Test files should end with .test.js
    TEST_PATTERN: /\.test\.js$/
};

// Global State Management
class GlobalStateManager {
    constructor() {
        this.state = {
            gameState: null,
            designTierSystem: null,
            audioSystem: null,
            particleEffects: null,
            achievements: null,
            dailyRituals: null,
            comboSystem: null,
            eventSystem: null,
            meditationState: null,
            meditationUI: null,
            meditationTowers: null
        };
    }
    
    /**
     * Register global state
     * @param {string} key - State key
     * @param {*} value - State value
     */
    register(key, value) {
        this.state[key] = value;
        window[key] = value; // Also set on window for backward compatibility
    }
    
    /**
     * Get global state
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
        return this.state[key];
    }
    
    /**
     * Clear global state
     */
    clear() {
        Object.keys(this.state).forEach(key => {
            delete window[key];
        });
        this.state = {};
    }
}

// Create global instance
export const globalStateManager = new GlobalStateManager();

// Magic Number Replacements
export const MAGIC_NUMBERS = {
    // UI
    BUTTON_MIN_SIZE: 44, // WCAG AA minimum touch target
    TAB_BUTTON_MIN_HEIGHT: 50,
    NOTIFICATION_DURATION: 3000,
    
    // Game
    MAX_CRAFT_AMOUNT: 1000,
    OFFLINE_PROGRESS_THRESHOLD: 60, // seconds
    
    // Performance
    DEBOUNCE_DELAY: 16,
    THROTTLE_DELAY: 100,
    MEMORY_CHECK_INTERVAL: 60000, // 1 minute
    LEAK_CHECK_INTERVAL: 60000
};

// Export utilities
export const CodeOrganization = {
    constants: GAME_CONSTANTS,
    magicNumbers: MAGIC_NUMBERS,
    fileNaming: FILE_NAMING,
    stateManager: globalStateManager
};

