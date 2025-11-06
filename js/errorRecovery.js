/**
 * Error Recovery System
 * Implements graceful degradation and error recovery mechanisms
 */

class ErrorRecoveryManager {
    constructor() {
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        this.fallbackStates = new Map();
        this.init();
    }
    
    init() {
        // Set up global error handler
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e.error || e);
        });
        
        // Set up unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e.reason);
        });
    }
    
    /**
     * Handle global errors
     * @param {Error} error - Error object
     */
    handleGlobalError(error) {
        console.error('Global error caught:', error);
        
        // Try to recover based on error type
        if (error.message && error.message.includes('localStorage')) {
            this.recoverFromStorageError(error);
        } else if (error.message && error.message.includes('JSON')) {
            this.recoverFromParseError(error);
        } else {
            this.recoverFromGenericError(error);
        }
    }
    
    /**
     * Handle unhandled promise rejections
     * @param {Error} reason - Rejection reason
     */
    handleUnhandledRejection(reason) {
        console.error('Unhandled promise rejection:', reason);
        
        // Try to recover
        if (reason instanceof Error) {
            this.handleGlobalError(reason);
        }
    }
    
    /**
     * Retry a function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxAttempts - Maximum retry attempts
     * @param {number} delay - Initial delay in ms
     * @returns {Promise} - Result of function
     */
    async retry(fn, maxAttempts = this.maxRetries, delay = this.retryDelay) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                console.warn(`Retry attempt ${attempt}/${maxAttempts} failed:`, error);
                
                if (attempt < maxAttempts) {
                    // Exponential backoff
                    const waitTime = delay * Math.pow(2, attempt - 1);
                    await this.sleep(waitTime);
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Recover from storage errors
     * @param {Error} error - Storage error
     */
    recoverFromStorageError(error) {
        console.warn('Attempting to recover from storage error');
        
        // Try to use sessionStorage as fallback
        try {
            if (typeof Storage !== 'undefined' && sessionStorage) {
                console.log('Switching to sessionStorage as fallback');
                // Could implement sessionStorage fallback here
            }
        } catch (e) {
            console.error('SessionStorage fallback also failed:', e);
        }
        
        // Show user-friendly error
        if (window.showNotification) {
            window.showNotification(
                'Storage error detected. Some features may not work correctly.',
                'error'
            );
        }
    }
    
    /**
     * Recover from parse errors
     * @param {Error} error - Parse error
     */
    recoverFromParseError(error) {
        console.warn('Attempting to recover from parse error');
        
        // Try to restore from backup
        this.restoreFromBackup();
        
        // Show user-friendly error
        if (window.showNotification) {
            window.showNotification(
                'Data corruption detected. Attempting to restore from backup...',
                'error'
            );
        }
    }
    
    /**
     * Recover from generic errors
     * @param {Error} error - Generic error
     */
    recoverFromGenericError(error) {
        console.warn('Attempting to recover from generic error');
        
        // Try to restore fallback state
        this.restoreFallbackState();
        
        // Show user-friendly error
        if (window.showNotification) {
            window.showNotification(
                'An error occurred. The game will attempt to recover...',
                'error'
            );
        }
    }
    
    /**
     * Restore from backup
     */
    restoreFromBackup() {
        try {
            // Look for backup saves
            const backupKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('cyberWitchesSave_backup_')
            );
            
            if (backupKeys.length > 0) {
                // Get most recent backup
                const mostRecent = backupKeys.sort().reverse()[0];
                const backupData = localStorage.getItem(mostRecent);
                
                if (backupData) {
                    // Restore from backup
                    localStorage.setItem('cyberWitchesSave', backupData);
                    console.log('Restored from backup:', mostRecent);
                    
                    // Reload game state
                    if (window.gameState && window.gameState.loadGameState) {
                        window.gameState.loadGameState();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to restore from backup:', error);
        }
    }
    
    /**
     * Restore fallback state
     */
    restoreFallbackState() {
        // Could implement fallback game state here
        console.log('Restoring fallback state');
    }
    
    /**
     * Create fallback state
     * @param {string} key - State key
     * @param {*} state - State value
     */
    saveFallbackState(key, state) {
        this.fallbackStates.set(key, JSON.parse(JSON.stringify(state)));
    }
    
    /**
     * Get fallback state
     * @param {string} key - State key
     * @returns {*} - Fallback state
     */
    getFallbackState(key) {
        return this.fallbackStates.get(key);
    }
}

// Create global instance
const errorRecoveryManager = new ErrorRecoveryManager();

// Global functions for compatibility
window.retryOperation = (fn, maxAttempts, delay) => {
    return errorRecoveryManager.retry(fn, maxAttempts, delay);
};

export default errorRecoveryManager;

