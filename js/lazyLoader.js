/**
 * Lazy Loading Utility - Code Splitting Support
 * Dynamically loads non-critical modules only when needed
 */

export class LazyLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Lazy load a module (with caching)
     * @param {string} modulePath - Path to module (e.g., './tutorial.js')
     * @param {string} exportName - Named export to load (default: 'default')
     * @returns {Promise} - Promise that resolves to the module
     */
    async loadModule(modulePath, exportName = 'default') {
        // Return cached module if already loaded
        if (this.loadedModules.has(modulePath)) {
            const module = this.loadedModules.get(modulePath);
            return exportName === 'default' ? module : module[exportName];
        }

        // Return existing loading promise if already in progress
        if (this.loadingPromises.has(modulePath)) {
            return this.loadingPromises.get(modulePath);
        }

        // Start loading
        const loadPromise = (async () => {
            try {
                console.info(`[LazyLoader] Loading module: ${modulePath}`);
                const module = await import(modulePath);

                // Cache the module
                this.loadedModules.set(modulePath, module);

                // Remove from loading promises
                this.loadingPromises.delete(modulePath);

                console.info(`[LazyLoader] Loaded module: ${modulePath}`);
                return exportName === 'default' ? module.default : module[exportName];
            } catch (error) {
                console.error(`[LazyLoader] Failed to load ${modulePath}:`, error);
                this.loadingPromises.delete(modulePath);
                throw error;
            }
        })();

        // Cache the loading promise
        this.loadingPromises.set(modulePath, loadPromise);

        return loadPromise;
    }

    /**
     * Preload a module (loads but doesn't wait)
     * @param {string} modulePath - Path to module
     */
    preload(modulePath) {
        if (!this.loadedModules.has(modulePath) && !this.loadingPromises.has(modulePath)) {
            this.loadModule(modulePath).catch(() => {
                // Silent fail for preloading
            });
        }
    }

    /**
     * Check if a module is already loaded
     * @param {string} modulePath - Path to module
     * @returns {boolean} - True if loaded
     */
    isLoaded(modulePath) {
        return this.loadedModules.has(modulePath);
    }

    /**
     * Unload a module from cache
     * @param {string} modulePath - Path to module
     */
    unload(modulePath) {
        this.loadedModules.delete(modulePath);
        this.loadingPromises.delete(modulePath);
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache stats
     */
    getStats() {
        return {
            loadedModules: this.loadedModules.size,
            loading: this.loadingPromises.size,
            modules: Array.from(this.loadedModules.keys())
        };
    }
}

// Global instance
export const lazyLoader = new LazyLoader();

/**
 * Lazy load tutorial system
 * @returns {Promise<any>} The TutorialSystem default export
 */
export async function loadTutorial() {
    // Sole owner is modules/game/tutorialSystem.js (orphans archived under js/archive/)
    return lazyLoader.loadModule('./modules/game/tutorialSystem.js', 'TutorialSystem');
}

/**
 * Lazy load meditation system
 * @returns {Promise<Object>} - Meditation modules
 */
export async function loadMeditationSystem() {
    const [MeditationState, MeditationUI, MeditationTowers] = await Promise.all([
        lazyLoader.loadModule('./meditationState.js', 'MeditationState'),
        lazyLoader.loadModule('./meditationUI.js', 'MeditationUI'),
        lazyLoader.loadModule('./meditationTowers.js', 'MeditationTowers')
    ]);

    return { MeditationState, MeditationUI, MeditationTowers };
}

/**
 * Lazy load analytics systems
 * @returns {Promise<Object>} - Analytics modules
 */
export async function loadAnalytics() {
    // Analytics theater is debug-only — never start interval-backed modules on player path
    const debug = (() => {
        try {
            return new URLSearchParams(location.search).has('debugAnalytics')
                || localStorage.getItem('cyberWitchesDebugAnalytics') === 'true';
        } catch { return false; }
    })();
    if (!debug) {
        return { playerAnalytics: null, balanceAnalytics: null, progressionAnalysis: null };
    }
    const [playerAnalytics, balanceAnalytics, progressionAnalysis] = await Promise.all([
        lazyLoader.loadModule('./playerAnalytics.js', 'default'),
        lazyLoader.loadModule('./balanceAnalytics.js', 'default'),
        lazyLoader.loadModule('./progressionAnalysis.js', 'default')
    ]);
    return { playerAnalytics, balanceAnalytics, progressionAnalysis };
}

/**
 * Lazy load balance testing framework
 * @returns {Promise<any>} The BalanceTestingFramework default export
 */
export async function loadBalanceTesting() {
    return lazyLoader.loadModule('./balanceTesting.js', 'default');
}

/**
 * Lazy load economy balancing
 * @returns {Promise<any>} The EconomyBalancing default export
 */
export async function loadEconomyBalancing() {
    return lazyLoader.loadModule('./economyBalancing.js', 'default');
}

/**
 * Preload modules that will likely be needed soon
 */
export function preloadCommonModules() {
    // Preload meditation if player is past early game (tutorial is static-imported via gameInit lazy map)
    if (window.gameState && window.gameState.ab > 1000) {
        lazyLoader.preload('./meditationState.js');
        lazyLoader.preload('./meditationUI.js');
        lazyLoader.preload('./meditationTowers.js');
    }
}

export default lazyLoader;
