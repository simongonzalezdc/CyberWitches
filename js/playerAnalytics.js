/**
 * Player Analytics System
 * Tracks player behavior with privacy controls
 */

class PlayerAnalyticsManager {
    constructor() {
        this.enabled = false;
        this.events = [];
        this.maxEvents = 1000;
        this.init();
    }
    
    init() {
        // Check privacy consent
        if (window.canUseAnalytics && window.canUseAnalytics()) {
            this.enabled = true;
        }
        
        // Load saved preference
        const saved = localStorage.getItem('analyticsEnabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
    }
    
    /**
     * Enable analytics
     */
    enable() {
        this.enabled = true;
        localStorage.setItem('analyticsEnabled', 'true');
    }
    
    /**
     * Disable analytics
     */
    disable() {
        this.enabled = false;
        localStorage.setItem('analyticsEnabled', 'false');
        this.events = []; // Clear events
    }
    
    /**
     * Track event
     * @param {string} eventName - Event name
     * @param {Object} properties - Event properties
     */
    track(eventName, properties = {}) {
        if (!this.enabled) {
            return;
        }
        
        // Check privacy consent again
        if (window.canUseAnalytics && !window.canUseAnalytics()) {
            return;
        }
        
        const event = {
            name: eventName,
            properties: this.anonymizeProperties(properties),
            timestamp: Date.now()
        };
        
        this.events.push(event);
        
        // Limit event storage
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
    }
    
    /**
     * Anonymize event properties
     * @param {Object} properties - Event properties
     * @returns {Object} Anonymized properties
     */
    anonymizeProperties(properties) {
        const anonymized = { ...properties };
        
        // Remove any potentially identifying information
        delete anonymized.userId;
        delete anonymized.email;
        delete anonymized.name;
        
        return anonymized;
    }
    
    /**
     * Track player action
     * @param {string} action - Action name
     * @param {Object} data - Action data
     */
    trackAction(action, data = {}) {
        this.track('player_action', {
            action,
            ...data
        });
    }
    
    /**
     * Track progression
     * @param {string} milestone - Milestone name
     * @param {Object} data - Milestone data
     */
    trackProgression(milestone, data = {}) {
        this.track('progression', {
            milestone,
            ...data
        });
    }
    
    /**
     * Get analytics data
     * @returns {Object} Analytics data
     */
    getAnalyticsData() {
        return {
            events: this.events,
            totalEvents: this.events.length
        };
    }
}

// Create global instance
const playerAnalyticsManager = new PlayerAnalyticsManager();

// Global functions for compatibility
window.trackEvent = (eventName, properties) => {
    playerAnalyticsManager.track(eventName, properties);
};

window.trackAction = (action, data) => {
    playerAnalyticsManager.trackAction(action, data);
};

export default playerAnalyticsManager;

