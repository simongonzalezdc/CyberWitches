/**
 * Error Reporting System
 * Implements automated error reporting to developers
 */

class ErrorReportingManager {
    constructor() {
        this.enabled = false;
        this.endpoint = null; // Set to your error reporting endpoint
        this.init();
    }
    
    init() {
        // Check privacy consent
        if (window.canReportErrors && window.canReportErrors()) {
            this.enabled = true;
        }
        
        // Load saved preference
        const saved = localStorage.getItem('errorReportingEnabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
    }
    
    /**
     * Enable error reporting
     */
    enable() {
        this.enabled = true;
        localStorage.setItem('errorReportingEnabled', 'true');
    }
    
    /**
     * Disable error reporting
     */
    disable() {
        this.enabled = false;
        localStorage.setItem('errorReportingEnabled', 'false');
    }
    
    /**
     * Report error to server
     * @param {Error} error - Error to report
     * @param {Object} context - Additional context
     */
    async reportError(error, context = {}) {
        if (!this.enabled || !this.endpoint) {
            return;
        }
        
        // Check privacy consent again
        if (window.canReportErrors && !window.canReportErrors()) {
            return;
        }
        
        const errorReport = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: context,
            sessionId: this.getSessionId(),
            gameState: this.getGameStateSnapshot()
        };
        
        try {
            // Send to error reporting service
            await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorReport)
            });
        } catch (reportError) {
            console.error('Failed to report error:', reportError);
        }
    }
    
    /**
     * Get session ID
     * @returns {string} Session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('cyberWitchesSessionId');
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
            sessionStorage.setItem('cyberWitchesSessionId', sessionId);
        }
        return sessionId;
    }
    
    /**
     * Get game state snapshot (anonymized)
     * @returns {Object} Game state snapshot
     */
    getGameStateSnapshot() {
        if (!window.gameState) {
            return null;
        }
        
        // Only include non-sensitive data
        return {
            prestigeCount: window.gameState.prestigeCount || 0,
            totalTaps: window.gameState.totalTaps || 0,
            version: '2.1'
        };
    }
    
    /**
     * Set error reporting endpoint
     * @param {string} endpoint - Error reporting endpoint URL
     */
    setEndpoint(endpoint) {
        this.endpoint = endpoint;
    }
}

// Create global instance
const errorReportingManager = new ErrorReportingManager();

// Global functions for compatibility
window.enableErrorReporting = () => {
    errorReportingManager.enable();
};

window.disableErrorReporting = () => {
    errorReportingManager.disable();
};

window.reportError = (error, context) => {
    errorReportingManager.reportError(error, context);
};

export default errorReportingManager;

