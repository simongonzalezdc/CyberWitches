/**
 * Reactive UI Store
 * Lightweight reactive state management for UI-only state
 * 
 * Week 4, Day 3-4: Optional Feature
 * 
 * ⚠️ IMPORTANT: This is ONLY for UI state (menu open, current tab, volume, etc.)
 * NOT for game state - game state stays direct for performance
 */

class ReactiveStore {
    constructor(initialState = {}) {
        this.state = { ...initialState };
        this.listeners = new Map();
        this.batchUpdates = false;
        this.pendingUpdates = new Set();
    }
    
    /**
     * Get current state value
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
        return this.state[key];
    }
    
    /**
     * Set state value and notify listeners
     * @param {string} key - State key
     * @param {*} value - New value
     */
    set(key, value) {
        if (this.state[key] === value) {
            return; // No change, skip update
        }
        
        const oldValue = this.state[key];
        this.state[key] = value;
        
        if (this.batchUpdates) {
            this.pendingUpdates.add(key);
        } else {
            this.notify(key, value, oldValue);
        }
    }
    
    /**
     * Update multiple state values at once
     * @param {Object} updates - Object with key-value pairs
     */
    update(updates) {
        const changedKeys = [];
        
        for (const [key, value] of Object.entries(updates)) {
            if (this.state[key] !== value) {
                const oldValue = this.state[key];
                this.state[key] = value;
                changedKeys.push({ key, value, oldValue });
            }
        }
        
        if (changedKeys.length > 0) {
            if (this.batchUpdates) {
                changedKeys.forEach(({ key }) => this.pendingUpdates.add(key));
            } else {
                changedKeys.forEach(({ key, value, oldValue }) => {
                    this.notify(key, value, oldValue);
                });
            }
        }
    }
    
    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }
    
    /**
     * Subscribe to all state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeAll(callback) {
        return this.subscribe('*', callback);
    }
    
    /**
     * Notify listeners of state change
     * @private
     */
    notify(key, value, oldValue) {
        // Notify specific key listeners
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(callback => {
                try {
                    callback(value, oldValue, key);
                } catch (error) {
                    console.error(`ReactiveStore: Error in listener for ${key}:`, error);
                }
            });
        }
        
        // Notify wildcard listeners
        const wildcardListeners = this.listeners.get('*');
        if (wildcardListeners) {
            wildcardListeners.forEach(callback => {
                try {
                    callback(key, value, oldValue);
                } catch (error) {
                    console.error('ReactiveStore: Error in wildcard listener:', error);
                }
            });
        }
    }
    
    /**
     * Start batching updates (for multiple rapid changes)
     */
    startBatch() {
        this.batchUpdates = true;
        this.pendingUpdates.clear();
    }
    
    /**
     * End batching and notify all pending updates
     */
    endBatch() {
        this.batchUpdates = false;
        
        if (this.pendingUpdates.size > 0) {
            const updates = Array.from(this.pendingUpdates);
            this.pendingUpdates.clear();
            
            updates.forEach(key => {
                this.notify(key, this.state[key], undefined);
            });
        }
    }
    
    /**
     * Batch update with callback
     * @param {Function} callback - Callback that performs updates
     */
    batch(callback) {
        this.startBatch();
        try {
            callback();
        } finally {
            this.endBatch();
        }
    }
    
    /**
     * Reset store to initial state
     */
    reset() {
        const oldState = { ...this.state };
        this.state = { ...this.initialState };
        
        // Notify all listeners
        Object.keys(oldState).forEach(key => {
            this.notify(key, this.state[key], oldState[key]);
        });
    }
    
    /**
     * Get all state
     * @returns {Object} Current state
     */
    getAll() {
        return { ...this.state };
    }
}

/**
 * Create a reactive store
 * @param {Object} initialState - Initial state
 * @returns {ReactiveStore} Store instance
 */
export function createReactiveStore(initialState = {}) {
    return new ReactiveStore(initialState);
}

/**
 * Global UI store for UI-only state
 * Use this for: menu state, tab state, volume, settings, etc.
 * DO NOT use for: game state, currency, production (use direct updates)
 */
export const uiStore = createReactiveStore({
    // UI State
    menuOpen: false,
    currentTab: 'workstations',
    sidebarCollapsed: false,
    
    // Settings
    volume: 1.0,
    soundEffectsEnabled: true,
    musicEnabled: false,
    
    // UI Preferences
    theme: 'default',
    animationsEnabled: true,
    
    // Loading states
    isLoading: false,
    loadingMessage: ''
});

// Expose for debugging
if (typeof window !== 'undefined') {
    window.uiStore = uiStore;
}

