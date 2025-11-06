/**
 * Debug utility for conditional logging
 * In production, all debug logs are disabled
 * Error logs are always enabled for critical issues
 */

// Set to true for development, false for production
// Build script will replace this value in production
const DEBUG = true;

/**
 * Debug log - only logs in development mode
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

/**
 * Debug warn - only logs in development mode
 * @param {...any} args - Arguments to log
 */
export function debugWarn(...args) {
    if (DEBUG) {
        console.warn(...args);
    }
}

/**
 * Debug error - always logs (use for actual errors)
 * @param {...any} args - Arguments to log
 */
export function debugError(...args) {
    console.error(...args);
}

/**
 * Debug group - only logs in development mode
 * @param {string} label - Group label
 */
export function debugGroup(label) {
    if (DEBUG) {
        console.group(label);
    }
}

/**
 * Debug group end - only logs in development mode
 */
export function debugGroupEnd() {
    if (DEBUG) {
        console.groupEnd();
    }
}

/**
 * Debug time - only logs in development mode
 * @param {string} label - Timer label
 */
export function debugTime(label) {
    if (DEBUG) {
        console.time(label);
    }
}

/**
 * Debug time end - only logs in development mode
 * @param {string} label - Timer label
 */
export function debugTimeEnd(label) {
    if (DEBUG) {
        console.timeEnd(label);
    }
}

