/**
 * Lifecycle Manager - Prevents memory leaks from event listeners and timers
 * Tracks all event listeners and timers for proper cleanup
 */

export class LifecycleManager {
    constructor() {
        this.eventListeners = [];
        this.timers = {
            intervals: new Set(),
            timeouts: new Set(),
            animationFrames: new Set()
        };
        this.isDestroyed = false;
    }

    /**
     * Add event listener with automatic tracking
     * @param {EventTarget} target - Element or window/document
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event listener options
     */
    addEventListener(target, event, handler, options = false) {
        if (this.isDestroyed) {
            console.warn('LifecycleManager: Attempted to add listener after destruction');
            return;
        }

        target.addEventListener(event, /** @type {EventListener} */ (handler), options);
        this.eventListeners.push({ target, event, handler, options });
    }

    /**
     * Remove specific event listener
     * @param {EventTarget} target - Element or window/document
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    removeEventListener(target, event, handler) {
        target.removeEventListener(event, /** @type {EventListener} */ (handler));

        // Remove from tracking
        this.eventListeners = this.eventListeners.filter(
            listener => !(listener.target === target &&
                         listener.event === event &&
                         listener.handler === handler)
        );
    }

    /**
     * Set interval with automatic tracking
     * @param {Function} callback - Callback function
     * @param {number} delay - Delay in milliseconds
     * @returns {number} - Interval ID
     */
    setInterval(callback, delay) {
        if (this.isDestroyed) {
            console.warn('LifecycleManager: Attempted to set interval after destruction');
            return null;
        }

        const id = setInterval(callback, delay);
        this.timers.intervals.add(id);
        return id;
    }

    /**
     * Clear specific interval
     * @param {number} id - Interval ID
     */
    clearInterval(id) {
        clearInterval(id);
        this.timers.intervals.delete(id);
    }

    /**
     * Set timeout with automatic tracking
     * @param {Function} callback - Callback function
     * @param {number} delay - Delay in milliseconds
     * @returns {number} - Timeout ID
     */
    setTimeout(callback, delay) {
        if (this.isDestroyed) {
            console.warn('LifecycleManager: Attempted to set timeout after destruction');
            return null;
        }

        const id = setTimeout(() => {
            this.timers.timeouts.delete(id);
            callback();
        }, delay);

        this.timers.timeouts.add(id);
        return id;
    }

    /**
     * Clear specific timeout
     * @param {number} id - Timeout ID
     */
    clearTimeout(id) {
        clearTimeout(id);
        this.timers.timeouts.delete(id);
    }

    /**
     * Request animation frame with automatic tracking
     * @param {Function} callback - Callback function
     * @returns {number} - Animation frame ID
     */
    requestAnimationFrame(callback) {
        if (this.isDestroyed) {
            console.warn('LifecycleManager: Attempted to request animation frame after destruction');
            return null;
        }

        const id = requestAnimationFrame((timestamp) => {
            this.timers.animationFrames.delete(id);
            callback(timestamp);
        });

        this.timers.animationFrames.add(id);
        return id;
    }

    /**
     * Cancel specific animation frame
     * @param {number} id - Animation frame ID
     */
    cancelAnimationFrame(id) {
        cancelAnimationFrame(id);
        this.timers.animationFrames.delete(id);
    }

    /**
     * Clean up all tracked resources
     */
    destroy() {
        if (this.isDestroyed) {
            return;
        }

        // Remove all event listeners
        this.eventListeners.forEach(({ target, event, handler, options }) => {
            try {
                target.removeEventListener(event, handler, options);
            } catch (error) {
                console.warn('Error removing event listener:', error);
            }
        });
        this.eventListeners = [];

        // Clear all intervals
        this.timers.intervals.forEach(id => clearInterval(id));
        this.timers.intervals.clear();

        // Clear all timeouts
        this.timers.timeouts.forEach(id => clearTimeout(id));
        this.timers.timeouts.clear();

        // Cancel all animation frames
        this.timers.animationFrames.forEach(id => cancelAnimationFrame(id));
        this.timers.animationFrames.clear();

        this.isDestroyed = true;
    }

    /**
     * Get current resource counts (for debugging)
     */
    getStats() {
        return {
            eventListeners: this.eventListeners.length,
            intervals: this.timers.intervals.size,
            timeouts: this.timers.timeouts.size,
            animationFrames: this.timers.animationFrames.size,
            isDestroyed: this.isDestroyed
        };
    }
}

/**
 * Global lifecycle manager instance
 * Use this for the main game instance
 */
export const globalLifecycleManager = new LifecycleManager();

/**
 * Setup global cleanup on page unload
 */
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        globalLifecycleManager.destroy();
    });
}
