/**
 * requestIdleCallback Utility
 * Robust polyfill with fallback for older browsers
 * Used for deferring non-critical UI updates (Week 2 optimization)
 */

/**
 * Schedule an update to run during idle time
 * @param {Function} callback - Function to call during idle time
 * @param {Object} options - Options object with timeout
 * @returns {number} Request ID (can be used with cancelIdleCallback)
 */
export function scheduleIdleUpdate(callback, options = {}) {
    // Native support: Chrome/Edge 47+, Safari 17+, Firefox (behind flag)
    // ~95% global browser support as of 2024
    if ('requestIdleCallback' in window) {
        return requestIdleCallback(callback, options);
    }
    
    // Fallback for older browsers (Safari < 17, older Firefox)
    const timeout = options.timeout || 2000;
    const start = Date.now();
    
    return setTimeout(() => {
        callback({
            didTimeout: Date.now() - start > timeout,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
        });
    }, 1);
}

/**
 * Cancel a scheduled idle update
 * @param {number} id - Request ID from scheduleIdleUpdate
 */
export function cancelIdleUpdate(id) {
    if ('cancelIdleCallback' in window) {
        cancelIdleCallback(id);
    } else {
        clearTimeout(id);
    }
}

/**
 * Create a wrapper that schedules updates during idle time
 * @param {Function} callback - Function to wrap
 * @param {Object} options - Options for requestIdleCallback
 * @returns {Function} Wrapped function
 */
export function idleWrapper(callback, options = {}) {
    return function(...args) {
        scheduleIdleUpdate(() => {
            callback.apply(this, args);
        }, options);
    };
}

