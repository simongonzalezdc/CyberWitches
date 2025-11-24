/**
 * Error Boundary System
 * Provides module-level error isolation and graceful degradation
 * Prevents one module failure from crashing the entire game
 * 
 * Week 2, Day 3 Optimization
 */

import { handleError } from '../errorHandler.js';

export class ModuleErrorBoundary {
    /**
     * Create an error boundary for a module
     * @param {string} moduleName - Name of the module (for logging)
     * @param {Function} fallbackFn - Optional fallback function
     * @param {Object} options - Options for error handling
     */
    constructor(moduleName, fallbackFn = null, options = {}) {
        this.moduleName = moduleName;
        this.fallbackFn = fallbackFn;
        this.options = {
            logErrors: true,
            showUserNotification: true,
            retryOnError: false,
            maxRetries: 3,
            ...options
        };
        this.errorCount = 0;
        this.lastError = null;
        this.isDisabled = false;
    }
    
    /**
     * Wrap a function with error boundary
     * @param {Function} fn - Function to wrap
     * @returns {Function} Wrapped function
     */
    wrap(fn) {
        return (...args) => {
            if (this.isDisabled) {
                return this.fallbackFn ? this.fallbackFn(null, ...args) : null;
            }
            
            try {
                return fn(...args);
            } catch (error) {
                return this.handleError(error, fn, args);
            }
        };
    }
    
    /**
     * Wrap an async function with error boundary
     * @param {Function} asyncFn - Async function to wrap
     * @returns {Function} Wrapped async function
     */
    wrapAsync(asyncFn) {
        return async (...args) => {
            if (this.isDisabled) {
                return this.fallbackFn ? await this.fallbackFn(null, ...args) : null;
            }
            
            try {
                return await asyncFn(...args);
            } catch (error) {
                return this.handleError(error, asyncFn, args);
            }
        };
    }
    
    /**
     * Handle an error
     * @private
     */
    handleError(error, fn, args) {
        this.errorCount++;
        this.lastError = error;
        
        // Log error
        if (this.options.logErrors) {
            console.error(`[ErrorBoundary:${this.moduleName}] Error in ${fn.name || 'anonymous'}:`, error);
            handleError(error, `${this.moduleName}.${fn.name || 'anonymous'}`, false);
        }
        
        // Show user notification
        if (this.options.showUserNotification && window.uiManager) {
            window.uiManager.showNotification(
                `${this.moduleName} temporarily unavailable`,
                'warning'
            );
        }
        
        // Disable module if too many errors
        if (this.errorCount >= this.options.maxRetries) {
            console.warn(`[ErrorBoundary:${this.moduleName}] Too many errors, disabling module`);
            this.isDisabled = true;
        }
        
        // Return fallback result
        if (this.fallbackFn) {
            try {
                return this.fallbackFn(error, ...args);
            } catch (fallbackError) {
                console.error(`[ErrorBoundary:${this.moduleName}] Fallback also failed:`, fallbackError);
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * Reset error boundary (re-enable module)
     */
    reset() {
        this.errorCount = 0;
        this.lastError = null;
        this.isDisabled = false;
    }
    
    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getStats() {
        return {
            moduleName: this.moduleName,
            errorCount: this.errorCount,
            isDisabled: this.isDisabled,
            lastError: this.lastError ? this.lastError.message : null
        };
    }
}

/**
 * Create error boundary for a module
 * @param {string} moduleName - Name of the module
 * @param {Function} fallbackFn - Optional fallback function
 * @returns {ModuleErrorBoundary} Error boundary instance
 */
export function createErrorBoundary(moduleName, fallbackFn = null) {
    return new ModuleErrorBoundary(moduleName, fallbackFn);
}

/**
 * Global error boundary manager
 */
class ErrorBoundaryManager {
    constructor() {
        this.boundaries = new Map();
    }
    
    /**
     * Register an error boundary
     * @param {string} moduleName - Module name
     * @param {ModuleErrorBoundary} boundary - Error boundary instance
     */
    register(moduleName, boundary) {
        this.boundaries.set(moduleName, boundary);
    }
    
    /**
     * Get error boundary for a module
     * @param {string} moduleName - Module name
     * @returns {ModuleErrorBoundary|null} Error boundary or null
     */
    get(moduleName) {
        return this.boundaries.get(moduleName) || null;
    }
    
    /**
     * Get all error statistics
     * @returns {Array} Array of error statistics
     */
    getAllStats() {
        return Array.from(this.boundaries.values()).map(boundary => boundary.getStats());
    }
    
    /**
     * Reset all error boundaries
     */
    resetAll() {
        this.boundaries.forEach(boundary => boundary.reset());
    }
}

export const errorBoundaryManager = new ErrorBoundaryManager();

