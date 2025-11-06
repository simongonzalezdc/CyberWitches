/**
 * Memory Leak Prevention System
 * Tracks and cleans up event listeners and references
 */

class MemoryLeakPreventionManager {
    constructor() {
        this.eventListeners = new Map();
        this.intervals = new Set();
        this.timeouts = new Set();
        this.observers = new Set();
        this.init();
    }
    
    init() {
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Periodic cleanup check
        setInterval(() => {
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
        orphanedListeners.forEach(id => {
            this.removeEventListener(id);
        });
        
        // Check memory usage
        if ('performance' in window && 'memory' in performance) {
            const memory = performance.memory;
            const usedMB = memory.usedJSHeapSize / 1048576;
            const totalMB = memory.totalJSHeapSize / 1048576;
            
            // Warn if memory usage is high
            if (usedMB / totalMB > 0.9) {
                console.warn('High memory usage detected. Consider cleaning up resources.');
                this.cleanup();
            }
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
        
        // Clear all intervals
        this.intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        this.intervals.clear();
        
        // Clear all timeouts
        this.timeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.timeouts.clear();
        
        // Disconnect all observers
        this.observers.forEach(observer => {
            this.disconnectObserver(observer);
        });
    }
}

// Create global instance
const memoryLeakPreventionManager = new MemoryLeakPreventionManager();

// Global functions for compatibility
window.trackEventListener = (element, event, handler, id) => {
    memoryLeakPreventionManager.trackEventListener(element, event, handler, id);
};

window.trackInterval = (intervalId) => {
    memoryLeakPreventionManager.trackInterval(intervalId);
};

window.trackTimeout = (timeoutId) => {
    memoryLeakPreventionManager.trackTimeout(timeoutId);
};

export default memoryLeakPreventionManager;

