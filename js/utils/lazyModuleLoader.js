/**
 * Lazy Module Loader
 * Dynamically loads modules only when needed
 * Reduces initial bundle size and improves load time
 * 
 * Week 2, Day 1-2 Optimization
 */

import { scheduleIdleUpdate } from './scheduleIdleUpdate.js';

/**
 * Lazy module loader with caching and loading indicators
 */
class LazyModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.loadingCallbacks = new Map();
    }
    
    /**
     * Load a module dynamically
     * @param {string} modulePath - Path to module
     * @param {string} exportName - Name of export (optional, for named exports)
     * @param {Object} options - Loading options
     * @returns {Promise} Promise resolving to module
     */
    async loadModule(modulePath, exportName = null, options = {}) {
        const cacheKey = `${modulePath}${exportName ? `#${exportName}` : ''}`;
        
        // Return cached module if already loaded
        if (this.loadedModules.has(cacheKey)) {
            return this.loadedModules.get(cacheKey);
        }
        
        // Return existing loading promise if already loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }
        
        // Show loading indicator if callback provided
        const showLoading = options.showLoading !== false;
        let loadingIndicator = null;
        if (showLoading && window.uiManager && window.uiManager.showLoadingIndicator) {
            loadingIndicator = window.uiManager.showLoadingIndicator(`Loading ${options.moduleName || 'module'}...`);
        }
        
        // Create loading promise
        const loadPromise = (async () => {
            try {
                const module = await import(modulePath);
                const exported = exportName ? module[exportName] : module;
                
                // Cache the module
                this.loadedModules.set(cacheKey, exported);
                
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.hide();
                }
                
                return exported;
            } catch (error) {
                // Hide loading indicator on error
                if (loadingIndicator) {
                    loadingIndicator.hide();
                }
                
                console.error(`Failed to load module ${modulePath}:`, error);
                throw error;
            } finally {
                // Clean up loading promise
                this.loadingPromises.delete(cacheKey);
            }
        })();
        
        // Store loading promise
        this.loadingPromises.set(cacheKey, loadPromise);
        
        return loadPromise;
    }
    
    /**
     * Preload a module during idle time
     * @param {string} modulePath - Path to module
     * @param {string} exportName - Name of export
     */
    preloadModule(modulePath, exportName = null) {
        scheduleIdleUpdate(() => {
            this.loadModule(modulePath, exportName, { showLoading: false }).catch(() => {
                // Silently fail preload - it's just a hint
            });
        });
    }
    
    /**
     * Check if module is loaded
     * @param {string} modulePath - Path to module
     * @param {string} exportName - Name of export
     * @returns {boolean} True if loaded
     */
    isLoaded(modulePath, exportName = null) {
        const cacheKey = `${modulePath}${exportName ? `#${exportName}` : ''}`;
        return this.loadedModules.has(cacheKey);
    }
    
    /**
     * Clear module cache
     */
    clearCache() {
        this.loadedModules.clear();
    }
}

// Global instance
export const lazyModuleLoader = new LazyModuleLoader();

/**
 * Lazy load meditation system (loads on first tab click)
 */
export async function loadMeditationSystem() {
    // Check if already initialized (either via lazy load or regular init)
    if (window.meditationSystem) {
        return window.meditationSystem;
    }
    
    // Check if meditationManager exists in uiManager systems
    if (window.uiManager && window.uiManager.systems && window.uiManager.systems.meditationManager) {
        window.meditationSystem = window.uiManager.systems.meditationManager;
        return window.meditationSystem;
    }
    
    try {
        const { MeditationManager } = await lazyModuleLoader.loadModule(
            './modules/game/meditationManager.js',
            'MeditationManager',
            { moduleName: 'Meditation System' }
        );
        
        // Initialize if game state exists
        if (window.gameState && window.uiManager) {
            const meditationManager = new MeditationManager(window.gameState, window.uiManager);
            window.meditationSystem = meditationManager;
            
            // Wire it up to uiManager if not already done
            if (window.uiManager.systems) {
                window.uiManager.systems.meditationManager = meditationManager;
            }
        }
        
        return window.meditationSystem;
    } catch (error) {
        console.error('Failed to load meditation system:', error);
        return null;
    }
}

/**
 * Lazy load tutorial system (loads on first game start)
 */
export async function loadTutorialSystem() {
    if (window.tutorialSystem) {
        return window.tutorialSystem;
    }
    
    try {
        const { TutorialSystem } = await lazyModuleLoader.loadModule(
            './modules/game/tutorialSystem.js',
            'TutorialSystem',
            { moduleName: 'Tutorial System' }
        );
        
        // Initialize if game state exists
        if (window.gameState && window.uiManager) {
            window.tutorialSystem = new TutorialSystem(window.gameState, window.uiManager);
        }
        
        return window.tutorialSystem;
    } catch (error) {
        console.error('Failed to load tutorial system:', error);
        return null;
    }
}

/**
 * Lazy load audio system (loads when tier 2+ reached)
 */
export async function loadAudioSystem() {
    if (window.audioSystem) {
        return window.audioSystem;
    }
    
    try {
        const { AudioSystem } = await lazyModuleLoader.loadModule(
            './audioSystem.js',
            'AudioSystem',
            { moduleName: 'Audio System' }
        );
        
        const audioSystem = new AudioSystem();
        
        // Initialize audio worklet if supported
        if (audioSystem.initAudioWorklet) {
            await audioSystem.initAudioWorklet();
        }
        
        window.audioSystem = audioSystem;
        return audioSystem;
    } catch (error) {
        console.error('Failed to load audio system:', error);
        return null;
    }
}

