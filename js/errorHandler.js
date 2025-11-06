/**
 * Error Handler - Centralized error handling and logging with enhanced features
 */

// Error severity levels
export const ErrorSeverity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
    GAME_STATE: 'gameState',
    COVEN_SYSTEM: 'covenSystem',
    SAVE_LOAD: 'saveLoad',
    UI: 'ui',
    NETWORK: 'network',
    VALIDATION: 'validation',
    PERFORMANCE: 'performance'
};

// Error log storage
let errorLog = [];
const MAX_ERROR_LOG_SIZE = 100;

/**
 * Enhanced error handler with categorization and severity levels
 * @param {Error} error - The error to handle
 * @param {string} context - Context where the error occurred
 * @param {boolean} showToUser - Whether to show the error to user
 * @param {string} category - Error category for better organization
 * @param {string} severity - Error severity level
 * @param {Object} additionalData - Additional context data
 */
export function handleError(error, context = 'unknown', showToUser = false, category = ErrorCategory.GAME_STATE, severity = ErrorSeverity.MEDIUM, additionalData = {}) {
    // Create error entry
    const errorEntry = {
        timestamp: Date.now(),
        message: error.message || 'Unknown error',
        name: error.name || 'Error',
        context,
        category,
        severity,
        stack: error.stack,
        additionalData,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };
    
    // Add to error log
    addToErrorLog(errorEntry);
    
    // Log error details with enhanced formatting
    logError(errorEntry);
    
    // Show to user if requested
    if (showToUser && typeof window !== 'undefined' && window.showNotification) {
        const userMessage = formatUserMessage(errorEntry);
        window.showNotification(userMessage, 'error');
        
        // Announce to screen readers
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader(userMessage, 'assertive');
        }
    }
    
    // Report critical errors
    if (severity === ErrorSeverity.CRITICAL) {
        reportCriticalError(errorEntry);
    }
}

/**
 * Add error to log with size management
 * @param {Object} errorEntry - Error entry to add
 * @private
 */
function addToErrorLog(errorEntry) {
    errorLog.push(errorEntry);
    
    // Keep log size manageable
    if (errorLog.length > MAX_ERROR_LOG_SIZE) {
        errorLog = errorLog.slice(-MAX_ERROR_LOG_SIZE);
    }
}

/**
 * Log error with enhanced formatting
 * @param {Object} errorEntry - Error entry to log
 * @private
 */
function logError(errorEntry) {
    const logMessage = `[${errorEntry.category}:${errorEntry.context}] ${errorEntry.name}: ${errorEntry.message}`;
    
    switch (errorEntry.severity) {
        case ErrorSeverity.LOW:
            console.debug(logMessage, errorEntry);
            break;
        case ErrorSeverity.MEDIUM:
            console.warn(logMessage, errorEntry);
            break;
        case ErrorSeverity.HIGH:
            console.error(logMessage, errorEntry);
            break;
        case ErrorSeverity.CRITICAL:
            console.error('🚨 CRITICAL ERROR 🚨', logMessage, errorEntry);
            break;
        default:
            console.log(logMessage, errorEntry);
    }
    
    // Log stack trace if available
    if (errorEntry.stack) {
        console.debug('Stack trace:', errorEntry.stack);
    }
}

/**
 * Format error message for user display
 * @param {Object} errorEntry - Error entry to format
 * @returns {string} User-friendly error message
 * @private
 */
function formatUserMessage(errorEntry) {
    // Provide user-friendly messages for common errors with recovery suggestions
    const userMessages = {
        'Storage quota exceeded': {
            message: 'Storage is full. Please clear some data or try again later.',
            recovery: 'Try clearing your browser cache or deleting old saves.'
        },
        'Network error': {
            message: 'Connection problem. Please check your internet connection.',
            recovery: 'Check your internet connection and try again.'
        },
        'Permission denied': {
            message: 'Permission denied. Please check your browser settings.',
            recovery: 'Enable storage permissions in your browser settings.'
        },
        'Invalid parameters': {
            message: 'Invalid input. Please check your input and try again.',
            recovery: 'Please verify your input and try again.'
        },
        'Failed to fetch': {
            message: 'Failed to load data. Please refresh the page.',
            recovery: 'Refresh the page or check your internet connection.'
        },
        'Timeout': {
            message: 'Operation timed out. Please try again.',
            recovery: 'The operation took too long. Please try again.'
        },
        'Save data validation failed': {
            message: 'Save data is corrupted. Attempting to restore from backup...',
            recovery: 'Your game will attempt to recover from a backup.'
        },
        'JSON': {
            message: 'Data format error. Attempting to fix...',
            recovery: 'The game will try to repair your save data.'
        }
    };
    
    // Check for common error patterns
    for (const [pattern, info] of Object.entries(userMessages)) {
        if (errorEntry.message.toLowerCase().includes(pattern.toLowerCase())) {
            return info.message + (info.recovery ? ` ${info.recovery}` : '');
        }
    }
    
    // Context-specific messages
    if (errorEntry.context === 'save') {
        return 'Failed to save game. Your progress may not be saved. Please try again.';
    }
    if (errorEntry.context === 'load') {
        return 'Failed to load game. Attempting to restore from backup...';
    }
    
    // Default message with context (simplified for users)
    return `An error occurred in ${errorEntry.context}. Please try again or refresh the page.`;
}

/**
 * Report critical errors for monitoring
 * @param {Object} errorEntry - Critical error entry
 * @private
 */
function reportCriticalError(errorEntry) {
    // In a real implementation, this would send to an error reporting service
    console.error('🚨 CRITICAL ERROR REPORTED 🚨', {
        error: errorEntry,
        timestamp: new Date(errorEntry.timestamp).toISOString(),
        sessionId: getSessionId()
    });
    
    // Store critical errors separately
    try {
        const criticalErrors = JSON.parse(localStorage.getItem('cyberWitchesCriticalErrors') || '[]');
        criticalErrors.push(errorEntry);
        
        // Keep only last 10 critical errors
        if (criticalErrors.length > 10) {
            criticalErrors.splice(0, criticalErrors.length - 10);
        }
        
        localStorage.setItem('cyberWitchesCriticalErrors', JSON.stringify(criticalErrors));
    } catch (e) {
        console.error('Failed to store critical error:', e);
    }
}

/**
 * Get or create session ID for error tracking
 * @returns {string} Session ID
 * @private
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('cyberWitchesSessionId');
    if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        sessionStorage.setItem('cyberWitchesSessionId', sessionId);
    }
    return sessionId;
}

/**
 * Wrap a function with enhanced error handling
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error handling
 * @param {string} category - Error category
 * @returns {Function} Wrapped function
 */
export function safeFunction(fn, context = 'unknown', category = ErrorCategory.GAME_STATE) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            handleError(error, context, true, category, ErrorSeverity.MEDIUM, {
                function: fn.name || 'anonymous',
                arguments: args.length
            });
            return null;
        }
    };
}

/**
 * Wrap an async function with enhanced error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error handling
 * @param {string} category - Error category
 * @returns {Function} Wrapped async function
 */
export function safeAsyncFunction(fn, context = 'unknown', category = ErrorCategory.GAME_STATE) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            handleError(error, context, true, category, ErrorSeverity.MEDIUM, {
                function: fn.name || 'anonymous',
                arguments: args.length,
                isAsync: true
            });
            return null;
        }
    };
}

/**
 * Enhanced parameter validation with detailed error messages
 * @param {Object} params - Parameters to validate
 * @param {Object} schema - Schema to validate against
 * @param {string} context - Context for validation
 * @returns {boolean} Whether parameters are valid
 */
export function validateParams(params, schema, context = 'validation') {
    if (!params || typeof params !== 'object') {
        handleError(new Error('Invalid parameters: params must be an object'), context, false, ErrorCategory.VALIDATION, ErrorSeverity.HIGH, {
            received: typeof params,
            expected: 'object'
        });
        return false;
    }
    
    if (!schema || typeof schema !== 'object') {
        handleError(new Error('Invalid schema: schema must be an object'), context, false, ErrorCategory.VALIDATION, ErrorSeverity.HIGH, {
            received: typeof schema,
            expected: 'object'
        });
        return false;
    }
    
    for (const [key, type] of Object.entries(schema)) {
        if (!(key in params)) {
            handleError(new Error(`Missing required parameter: ${key}`), context, false, ErrorCategory.VALIDATION, ErrorSeverity.HIGH, {
                missingKey: key,
                availableKeys: Object.keys(params)
            });
            return false;
        }
        
        const actualType = params[key] === null ? 'null' : typeof params[key];
        if (actualType !== type) {
            handleError(new Error(`Invalid parameter type for ${key}: expected ${type}, got ${actualType}`), context, false, ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM, {
                    parameter: key,
                    expected: type,
                    received: actualType,
                    value: params[key]
                });
            return false;
        }
    }
    
    return true;
}

/**
 * Enhanced retry with exponential backoff and detailed logging
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {string} context - Context for retry
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, context = 'retry') {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                handleError(error, context, true, ErrorCategory.NETWORK, ErrorSeverity.HIGH, {
                    maxRetries,
                    totalAttempts: attempt + 1,
                    finalDelay: baseDelay * Math.pow(2, attempt - 1)
                });
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`Retry attempt ${attempt + 1}/${maxRetries + 1} failed in ${context}, retrying in ${delay}ms:`, error.message);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Get error statistics for debugging
 * @returns {Object} Error statistics
 */
export function getErrorStats() {
    const stats = {
        total: errorLog.length,
        byCategory: {},
        bySeverity: {},
        recent: errorLog.slice(-10),
        critical: errorLog.filter(e => e.severity === ErrorSeverity.CRITICAL)
    };
    
    // Calculate statistics by category
    for (const error of errorLog) {
        stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    }
    
    return stats;
}

/**
 * Clear error log
 */
export function clearErrorLog() {
    errorLog = [];
    console.log('Error log cleared');
}

/**
 * Export error log for debugging
 * @returns {string} JSON string of error log
 */
export function exportErrorLog() {
    return JSON.stringify(errorLog, null, 2);
}

/**
 * Performance monitoring for detecting issues
 * @param {string} operation - Operation being monitored
 * @param {Function} fn - Function to monitor
 * @returns {*} Result of function
 */
export function monitorPerformance(operation, fn) {
    const startTime = performance.now();
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    try {
        const result = fn();
        
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const duration = endTime - startTime;
        const memoryDelta = endMemory - startMemory;
        
        // Log performance warnings
        if (duration > 100) { // Operation took more than 100ms
            console.warn(`Performance warning: ${operation} took ${duration.toFixed(2)}ms`);
        }
        
        if (memoryDelta > 1024 * 1024) { // Used more than 1MB
            console.warn(`Memory warning: ${operation} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
        }
        
        return result;
    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        handleError(error, operation, true, ErrorCategory.PERFORMANCE, ErrorSeverity.HIGH, {
            duration,
            operation,
            failed: true
        });
        
        throw error;
    }
}
}