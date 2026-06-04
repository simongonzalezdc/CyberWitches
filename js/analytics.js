import { handleError } from './errorHandler.js';

/**
 * Analytics System - Tracks gameplay metrics and user behavior
 * Implements privacy-compliant, anonymized analytics
 */

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string} id - Unique event identifier
 * @property {string} type - Event type ('session', 'action', 'progression', 'performance', 'error')
 * @property {string} category - Event category
 * @property {string} action - Specific action performed
 * @property {Object} value - Event value/data
 * @property {number} timestamp - Event timestamp
 * @property {Object} metadata - Additional event metadata
 * @property {string} sessionId - Current session ID
 */

/**
 * Analytics System class
 */
export class AnalyticsSystem {
    /**
     * Create a new AnalyticsSystem instance
     */
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getOrCreateUserId();
        this.events = [];
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.isOptedIn = this.getOptInStatus();
        this.isOnline = navigator.onLine;
        
        // Analytics configuration
        this.config = {
            maxEvents: 1000, // Maximum events to store locally
            batchSize: 50, // Events to send in batch
            flushInterval: 300000, // 5 minutes
            sessionTimeout: 1800000 // 30 minutes
        };
        
        // Performance tracking
        this.performanceMetrics = {
            fps: [],
            memoryUsage: [],
            loadTimes: {},
            errorCount: 0
        };
        
        // Privacy settings
        this.privacySettings = {
            collectPerformance: true,
            collectErrors: true,
            collectSessionData: true,
            collectProgression: true,
            anonymizeData: true
        };
        
        // Start session tracking
        this.startSession();
        
        // Start periodic flush
        this.startPeriodicFlush();
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushEvents();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }
    
    /**
     * Generate a unique session ID
     * @returns {string} Session ID
     * @private
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }
    
    /**
     * Get or create user ID
     * @returns {string} User ID
     * @private
     */
    getOrCreateUserId() {
        let userId = localStorage.getItem('cyberWitchesUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            localStorage.setItem('cyberWitchesUserId', userId);
        }
        return userId;
    }
    
    /**
     * Get opt-in status for analytics
     * @returns {boolean} Whether user has opted in
     * @private
     */
    getOptInStatus() {
        const status = localStorage.getItem('cyberWitchesAnalyticsOptIn');
        return status === 'true';
    }
    
    /**
     * Set opt-in status for analytics
     * @param {boolean} optedIn - Whether user opts in
     */
    setOptInStatus(optedIn) {
        this.isOptedIn = optedIn;
        localStorage.setItem('cyberWitchesAnalyticsOptIn', optedIn.toString());
        
        if (optedIn) {
            this.startSession();
        } else {
            this.endSession();
            this.clearEvents();
        }
    }
    
    /**
     * Start a new session
     * @private
     */
    startSession() {
        if (!this.isOptedIn) {
            return;
        }
        
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        
        this.trackEvent('session', 'start', {
            duration: 0,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: this.sessionStartTime
        });
    }
    
    /**
     * End the current session
     * @private
     */
    endSession() {
        if (!this.isOptedIn) {
            return;
        }
        
        const sessionDuration = Date.now() - this.sessionStartTime;
        
        this.trackEvent('session', 'end', {
            duration: sessionDuration,
            eventsTracked: this.events.length,
            performanceMetrics: this.getAggregatedPerformanceMetrics(),
            timestamp: Date.now()
        });
        
        // Flush events before ending
        this.flushEvents();
    }
    
    /**
     * Handle visibility change events
     * @private
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page hidden, track pause
            this.trackEvent('session', 'pause', {
                sessionDuration: Date.now() - this.sessionStartTime,
                timestamp: Date.now()
            });
        } else {
            // Page visible, check for session timeout
            const timeSinceLastActivity = Date.now() - this.lastActivityTime;
            
            if (timeSinceLastActivity > this.config.sessionTimeout) {
                // Session timed out, start new session
                this.endSession();
                this.sessionId = this.generateSessionId();
                this.startSession();
            } else {
                // Resume session
                this.trackEvent('session', 'resume', {
                    timeSinceLastActivity: timeSinceLastActivity,
                    timestamp: Date.now()
                });
            }
            
            this.lastActivityTime = Date.now();
        }
    }
    
    /**
     * Track a custom event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {Object} value - Event value/data
     * @param {Object} metadata - Additional metadata
     */
    trackEvent(category, action, value = {}, metadata = {}) {
        if (!this.isOptedIn) {
            return;
        }
        
        try {
            const event = {
                id: this.generateEventId(),
                type: this.getEventType(category),
                category: category,
                action: action,
                value: this.anonymizeData(value),
                timestamp: Date.now(),
                metadata: this.anonymizeData(metadata),
                sessionId: this.sessionId
            };
            
            this.events.push(event);
            this.lastActivityTime = Date.now();
            
            // Limit events stored locally
            if (this.events.length > this.config.maxEvents) {
                this.events = this.events.slice(-this.config.maxEvents);
            }
            
            // Check if we should flush
            if (this.events.length >= this.config.batchSize) {
                this.flushEvents();
            }
        } catch (error) {
            handleError(error, 'analyticsTrackEvent');
        }
    }
    
    /**
     * Generate a unique event ID
     * @returns {string} Event ID
     * @private
     */
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }
    
    /**
     * Get event type from category
     * @param {string} category - Event category
     * @returns {string} Event type
     * @private
     */
    getEventType(category) {
        const typeMap = {
            'session': 'session',
            'action': 'action',
            'progression': 'progression',
            'performance': 'performance',
            'error': 'error',
            'social': 'action',
            'economy': 'action',
            'ui': 'action'
        };
        
        return typeMap[category] || 'action';
    }
    
    /**
     * Anonymize data based on privacy settings
     * @param {Object} data - Data to anonymize
     * @returns {Object} Anonymized data
     * @private
     */
    anonymizeData(data) {
        if (!this.privacySettings.anonymizeData) {
            return data;
        }
        
        const anonymized = {};
        
        for (const [key, value] of Object.entries(data)) {
            // Skip sensitive keys
            if (this.isSensitiveKey(key)) {
                continue;
            }
            
            // Hash string values that might be identifying
            if (typeof value === 'string' && this.isPotentiallyIdentifying(key)) {
                anonymized[key] = this.hashString(value);
            } else {
                anonymized[key] = value;
            }
        }
        
        return anonymized;
    }
    
    /**
     * Check if a key is sensitive
     * @param {string} key - Key to check
     * @returns {boolean} Whether key is sensitive
     * @private
     */
    isSensitiveKey(key) {
        const sensitiveKeys = [
            'email', 'name', 'username', 'userid', 'id',
            'ip', 'address', 'phone', 'creditcard',
            'password', 'token', 'key', 'secret'
        ];
        
        return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive));
    }
    
    /**
     * Check if a key might contain identifying information
     * @param {string} key - Key to check
     * @returns {boolean} Whether key might be identifying
     * @private
     */
    isPotentiallyIdentifying(key) {
        const identifyingKeys = [
            'playername', 'covenname', 'customname',
            'message', 'chat', 'comment', 'input'
        ];
        
        return identifyingKeys.some(identifying => key.toLowerCase().includes(identifying));
    }
    
    /**
     * Hash a string for anonymization
     * @param {string} str - String to hash
     * @returns {string} Hashed string
     * @private
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }
    
    /**
     * Track game progression events
     * @param {string} progressionType - Type of progression
     * @param {Object} data - Progression data
     */
    trackProgression(progressionType, data) {
        if (!this.privacySettings.collectProgression) {
            return;
        }
        
        this.trackEvent('progression', progressionType, data);
    }
    
    /**
     * Track user actions
     * @param {string} actionType - Type of action
     * @param {Object} data - Action data
     */
    trackAction(actionType, data) {
        this.trackEvent('action', actionType, data);
    }
    
    /**
     * Track social interactions
     * @param {string} socialType - Type of social interaction
     * @param {Object} data - Social data
     */
    trackSocial(socialType, data) {
        this.trackEvent('social', socialType, data);
    }
    
    /**
     * Track economy events
     * @param {string} economyType - Type of economy event
     * @param {Object} data - Economy data
     */
    trackEconomy(economyType, data) {
        this.trackEvent('economy', economyType, data);
    }
    
    /**
     * Track performance metrics
     * @param {string} metricType - Type of performance metric
     * @param {number} value - Metric value
     */
    trackPerformance(metricType, value) {
        if (!this.privacySettings.collectPerformance) {
            return;
        }
        
        // Store in performance metrics
        if (!this.performanceMetrics[metricType]) {
            this.performanceMetrics[metricType] = [];
        }
        
        this.performanceMetrics[metricType].push({
            value: value,
            timestamp: Date.now()
        });
        
        // Keep only last 100 entries
        if (this.performanceMetrics[metricType].length > 100) {
            this.performanceMetrics[metricType] = this.performanceMetrics[metricType].slice(-100);
        }
        
        this.trackEvent('performance', metricType, { value: value });
    }
    
    /**
     * Track errors
     * @param {Error} error - Error object
     * @param {string} context - Error context
     */
    trackError(error, context = '') {
        if (!this.privacySettings.collectErrors) {
            return;
        }
        
        this.performanceMetrics.errorCount++;
        
        this.trackEvent('error', 'javascript_error', {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: Date.now()
        });
    }
    
    /**
     * Track page load performance
     * @private
     */
    trackPageLoad() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            this.performanceMetrics.loadTimes.pageLoad = loadTime;
            this.trackPerformance('page_load_time', loadTime);
        }
    }
    
    /**
     * Get aggregated performance metrics
     * @returns {Object} Aggregated metrics
     * @private
     */
    getAggregatedPerformanceMetrics() {
        const metrics = {};
        
        for (const [metricType, values] of Object.entries(this.performanceMetrics)) {
            if (Array.isArray(values) && values.length > 0) {
                const numericValues = values.map(v => v.value);
                metrics[metricType] = {
                    count: numericValues.length,
                    average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                    min: Math.min(...numericValues),
                    max: Math.max(...numericValues),
                    latest: numericValues[numericValues.length - 1]
                };
            } else if (typeof values === 'number') {
                metrics[metricType] = values;
            }
        }
        
        return metrics;
    }
    
    /**
     * Start periodic flush of events
     * @private
     */
    startPeriodicFlush() {
        setInterval(() => {
            this.flushEvents();
        }, this.config.flushInterval);
    }
    
    /**
     * Flush events to server
     * @returns {Promise<boolean>} Whether flush was successful
     */
    async flushEvents() {
        if (!this.isOptedIn || !this.isOnline || this.events.length === 0) {
            return false;
        }
        
        try {
            const eventsToSend = this.events.slice(0, this.config.batchSize);
            
            // In a real implementation, this would send to an analytics server
            // For now, we'll simulate with localStorage
            const existingEvents = JSON.parse(localStorage.getItem('cyberWitchesAnalyticsEvents') || '[]');
            const allEvents = [...existingEvents, ...eventsToSend];
            
            // Keep only last 1000 events
            const trimmedEvents = allEvents.slice(-1000);
            localStorage.setItem('cyberWitchesAnalyticsEvents', JSON.stringify(trimmedEvents));
            
            // Remove sent events from memory
            this.events = this.events.slice(eventsToSend.length);
            
            return true;
        } catch (error) {
            handleError(error, 'analyticsFlush');
            return false;
        }
    }
    
    /**
     * Clear all stored events
     * @private
     */
    clearEvents() {
        this.events = [];
        localStorage.removeItem('cyberWitchesAnalyticsEvents');
    }
    
    /**
     * Get analytics summary
     * @returns {Object} Analytics summary
     */
    getAnalyticsSummary() {
        const totalEvents = this.events.length;
        const sessionDuration = Date.now() - this.sessionStartTime;
        const performanceMetrics = this.getAggregatedPerformanceMetrics();
        
        return {
            sessionId: this.sessionId,
            userId: this.privacySettings.anonymizeData ? this.hashString(this.userId) : this.userId,
            isOptedIn: this.isOptedIn,
            sessionStartTime: this.sessionStartTime,
            sessionDuration: sessionDuration,
            totalEvents: totalEvents,
            performanceMetrics: performanceMetrics,
            privacySettings: this.privacySettings
        };
    }
    
    /**
     * Update privacy settings
     * @param {Object} settings - New privacy settings
     */
    updatePrivacySettings(settings) {
        this.privacySettings = { ...this.privacySettings, ...settings };
        localStorage.setItem('cyberWitchesPrivacySettings', JSON.stringify(this.privacySettings));
    }
    
    /**
     * Load privacy settings
     * @private
     */
    loadPrivacySettings() {
        try {
            const settings = localStorage.getItem('cyberWitchesPrivacySettings');
            if (settings) {
                this.privacySettings = { ...this.privacySettings, ...JSON.parse(settings) };
            }
        } catch (error) {
            handleError(error, 'analyticsLoadPrivacySettings');
        }
    }
    
    /**
     * Export analytics data
     * @returns {Object} Exportable analytics data
     */
    exportAnalyticsData() {
        return {
            summary: this.getAnalyticsSummary(),
            events: this.events,
            performanceMetrics: this.performanceMetrics,
            privacySettings: this.privacySettings
        };
    }
    
    /**
     * Delete all analytics data
     */
    deleteAllData() {
        this.clearEvents();
        this.performanceMetrics = {
            fps: [],
            memoryUsage: [],
            loadTimes: {},
            errorCount: 0
        };
        
        // Remove user ID if requested
        localStorage.removeItem('cyberWitchesUserId');
        localStorage.removeItem('cyberWitchesAnalyticsEvents');
        localStorage.removeItem('cyberWitchesPrivacySettings');
    }
}

// Create global analytics instance
export const analytics = new AnalyticsSystem();

// Track page load
window.addEventListener('load', () => {
    analytics.trackPageLoad();
});

// Track errors globally
window.addEventListener('error', (event) => {
    analytics.trackError(event.error, 'global_error_handler');
});

// Track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(event.reason, 'unhandled_promise_rejection');
});