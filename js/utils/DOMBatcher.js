/**
 * DOM Batcher Utility
 * Batches DOM updates to minimize reflows and repaints
 * (Phase 3, Week 3 Optimization)
 */

export class DOMBatcher {
    constructor() {
        this.pendingUpdates = new Map();
        this.rafId = null;
        
        this.processUpdates = this.processUpdates.bind(this);
    }
    
    /**
     * Schedule a DOM update
     * @param {string} key - Unique key for the update (e.g., element ID or update type)
     * @param {Function} updateFn - Function that performs the DOM update
     * @param {number} _priority - Reserved for future prioritization (currently unused)
     */
    schedule(key, updateFn, _priority = 0) {
        this.pendingUpdates.set(key, updateFn);
        
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(this.processUpdates);
        }
    }
    
    /**
     * Process all pending updates
     */
    processUpdates() {
        this.rafId = null;
        
        // Create a snapshot of updates to process
        const updates = new Map(this.pendingUpdates);
        this.pendingUpdates.clear();
        
        // Execute all updates in a single batch
        // Ideally, we would separate reads and writes, but for now we just batch the execution
        // to ensure they happen in the same frame
        updates.forEach((updateFn, key) => {
            try {
                updateFn();
            } catch (error) {
                console.error(`Error in batched DOM update (${key}):`, error);
            }
        });
    }
    
    /**
     * Cancel a pending update
     * @param {string} key - Update key to cancel
     */
    cancel(key) {
        this.pendingUpdates.delete(key);
    }
}

// Global instance
export const domBatcher = new DOMBatcher();

/**
 * Helper to schedule a batched update
 * @param {string} key - Unique key
 * @param {Function} updateFn - Update function
 * @param {number} priority - Priority
 */
export function batchDOMUpdate(key, updateFn, priority = 0) {
    domBatcher.schedule(key, updateFn, priority);
}
