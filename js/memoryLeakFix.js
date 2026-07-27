/**
 * Memory Leak Prevention System
 * Tracks and cleans up event listeners and references
 * Enhanced with growth monitoring (Phase 1, Week 1)
 */

class MemoryLeakPreventionManager {
    constructor() {
        this.eventListeners = new Map();
        this.intervals = new Set();
        this.timeouts = new Set();
        this.observers = new Set();
        
        // Enhanced monitoring
        this.baselineMemory = 0;
        this.checkInterval = null;
        
        this.init();
    }

    init() {
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Initialize baseline memory if supported
        if (performance.memory) {
            this.baselineMemory = performance.memory.usedJSHeapSize;
        }

        // Periodic cleanup and monitoring check
        this.checkInterval = setInterval(() => {
            this.checkForLeaks();
        }, 60000); // Check every minute
    }

    /**
     * Track event listener
     * @param {HTMLElement} element - Element with listener
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {string} id - Unique identifier
     */
    trackEventListener(element, event, handler, id) {
        if (!this.eventListeners.has(id)) {
            this.eventListeners.set(id, { element, event, handler });
        }
    }

    /**
     * Remove tracked event listener
     * @param {string} id - Listener ID
     */
    removeEventListener(id) {
        const listener = this.eventListeners.get(id);
        if (listener) {
            listener.element.removeEventListener(listener.event, listener.handler);
            this.eventListeners.delete(id);
        }
    }

    /**
     * Track interval
     * @param {number} intervalId - Interval ID
     */
    trackInterval(intervalId) {
        this.intervals.add(intervalId);
    }

    /**
     * Clear tracked interval
     * @param {number} intervalId - Interval ID
     */
    clearTrackedInterval(intervalId) {
        clearInterval(intervalId);
        this.intervals.delete(intervalId);
    }

    /**
     * Track timeout
     * @param {number} timeoutId - Timeout ID
     */
    trackTimeout(timeoutId) {
        this.timeouts.add(timeoutId);
    }

    /**
     * Clear tracked timeout
     * @param {number} timeoutId - Timeout ID
     */
    clearTrackedTimeout(timeoutId) {
        clearTimeout(timeoutId);
        this.timeouts.delete(timeoutId);
    }

    /**
     * Track observer
     * @param {Object} observer - Observer object
     */
    trackObserver(observer) {
        this.observers.add(observer);
    }

    /**
     * Disconnect tracked observer
     * @param {Object} observer - Observer object
     */
    disconnectObserver(observer) {
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
        this.observers.delete(observer);
    }

    /**
     * Check for memory leaks
     */
    checkForLeaks() {
        // Check for orphaned event listeners
        const orphanedListeners = [];
        this.eventListeners.forEach((listener, id) => {
            if (!document.contains(listener.element)) {
                orphanedListeners.push(id);
            }
        });

        // Clean up orphaned listeners
        if (orphanedListeners.length > 0) {
            console.warn(`Found ${orphanedListeners.length} orphaned event listeners. Cleaning up...`);
            orphanedListeners.forEach(id => {
                this.removeEventListener(id);
            });
        }

        // Enhanced Memory Monitoring
        if ('performance' in window && 'memory' in performance) {
            const memory = performance.memory;
            const usedHeap = memory.usedJSHeapSize;
            const totalHeap = memory.totalJSHeapSize;
            
            const usedMB = (usedHeap / 1048576).toFixed(2);
            const totalMB = (totalHeap / 1048576).toFixed(2);

            // Warn if memory usage is high (>90% of total heap)
            if (usedHeap / totalHeap > 0.9) {
                console.warn(`Critical Memory Warning: Using ${usedMB}MB of ${totalMB}MB (${((usedHeap/totalHeap)*100).toFixed(1)}%)`);
                this.forceCleanup();
            }
            
            // Check for rapid growth (>50% increase from baseline)
            if (this.baselineMemory > 0) {
                const growth = usedHeap - this.baselineMemory;
                const growthPercent = (growth / this.baselineMemory) * 100;
                
                if (growthPercent > 50) {
                    console.warn(`Potential Memory Leak: Memory grew by ${growthPercent.toFixed(1)}% (${((growth)/1048576).toFixed(2)}MB) since baseline.`);
                    // Don't force cleanup immediately on growth alone, but log it.
                    // Update baseline if we've stabilized at a higher level to prevent spamming
                    this.baselineMemory = usedHeap; 
                }
            } else {
                this.baselineMemory = usedHeap;
            }
        }
    }
    
    /**
     * Force aggressive cleanup
     */
    forceCleanup() {
        console.info('Forcing memory cleanup...');
        this.cleanup();
        
        // Optional: clear caches if critical
        if ('caches' in window) {
            // We generally don't want to wipe the app cache, but maybe others?
            // Leaving this safe for now.
        }
    }

    /**
     * Clean up all tracked resources
     */
    cleanup() {
        // Remove all event listeners
        this.eventListeners.forEach((listener, id) => {
            this.removeEventListener(id);
        });
        this.eventListeners.clear();

        // Clear all intervals
        this.intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        this.intervals.clear();
        // Re-start our own check interval
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.checkInterval = setInterval(() => this.checkForLeaks(), 60000);

        // Clear all timeouts
        this.timeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.timeouts.clear();

        // Disconnect all observers
        this.observers.forEach(observer => {
            this.disconnectObserver(observer);
        });
        this.observers.clear();
    }
}

// Create global instance
// Not auto-started on player path — construct only from debug tooling
const _memoryLeakPreventionManager = null;
export function startMemoryLeakPrevention() {
    return new MemoryLeakPreventionManager();
}


export default { startMemoryLeakPrevention };
