/**
 * DOM Batching System
 * Batches DOM updates to reduce layout thrashing and improve performance
 * 
 * Week 3, Day 1-2 Optimization
 */

class DOMBatcher {
    constructor(options = {}) {
        this.pendingUpdates = new Map();
        this.batchTimeout = null;
        this.batchDelay = options.batchDelay || 16; // ~60fps
        this.maxBatchSize = options.maxBatchSize || 100;
        this.flushCallbacks = [];
    }
    
    /**
     * Schedule a DOM update
     * @param {string} key - Unique key for the update
     * @param {Function} updateFn - Function that performs the DOM update
     * @param {number} priority - Priority (higher = more important, default: 0)
     */
    schedule(key, updateFn, priority = 0) {
        if (typeof updateFn !== 'function') {
            console.warn('DOMBatcher: updateFn must be a function');
            return;
        }
        
        // Store update with priority
        this.pendingUpdates.set(key, { updateFn, priority, timestamp: performance.now() });
        
        // Schedule batch flush
        this.scheduleFlush();
    }
    
    /**
     * Schedule a batch flush
     * @private
     */
    scheduleFlush() {
        if (this.batchTimeout) return;
        
        // Flush immediately if batch is too large
        if (this.pendingUpdates.size >= this.maxBatchSize) {
            this.flush();
            return;
        }
        
        // Schedule flush after delay
        this.batchTimeout = setTimeout(() => {
            this.flush();
        }, this.batchDelay);
    }
    
    /**
     * Flush all pending updates
     */
    flush() {
        if (this.pendingUpdates.size === 0) {
            if (this.batchTimeout) {
                clearTimeout(this.batchTimeout);
                this.batchTimeout = null;
            }
            return;
        }
        
        // Clear timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        
        // Sort by priority (higher first), then by timestamp
        const updates = Array.from(this.pendingUpdates.entries())
            .map(([key, value]) => ({ key, ...value }))
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority; // Higher priority first
                }
                return a.timestamp - b.timestamp; // Older first
            });
        
        // Clear pending updates before executing (in case of errors)
        this.pendingUpdates.clear();
        
        // Use requestAnimationFrame for smooth batching
        requestAnimationFrame(() => {
            
            updates.forEach(({ updateFn }) => {
                try {
                    // Try to detect if it's a read or write operation
                    // This is a simple heuristic - in practice, you might want more sophisticated detection
                    const result = updateFn();
                    if (result && typeof result.then === 'function') {
                        // Async operation
                        result.catch(err => console.error('DOMBatcher: Error in async update:', err));
                    }
                } catch (error) {
                    console.error('DOMBatcher: Error executing update:', error);
                }
            });
            
            // Execute callbacks
            this.flushCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('DOMBatcher: Error in flush callback:', error);
                }
            });
        });
    }
    
    /**
     * Register a callback to be called after each flush
     * @param {Function} callback - Callback function
     */
    onFlush(callback) {
        if (typeof callback === 'function') {
            this.flushCallbacks.push(callback);
        }
    }
    
    /**
     * Cancel a scheduled update
     * @param {string} key - Key of the update to cancel
     */
    cancel(key) {
        this.pendingUpdates.delete(key);
    }
    
    /**
     * Cancel all pending updates
     */
    cancelAll() {
        this.pendingUpdates.clear();
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
    }
    
    /**
     * Get pending updates count
     * @returns {number} Number of pending updates
     */
    getPendingCount() {
        return this.pendingUpdates.size;
    }
}

// Global instance
export const domBatcher = new DOMBatcher();

/**
 * Batch a DOM update
 * @param {string} key - Unique key
 * @param {Function} updateFn - Update function
 * @param {number} priority - Priority (optional)
 */
export function batchDOMUpdate(key, updateFn, priority = 0) {
    domBatcher.schedule(key, updateFn, priority);
}

/**
 * Flush all pending DOM updates immediately
 */
export function flushDOMUpdates() {
    domBatcher.flush();
}

