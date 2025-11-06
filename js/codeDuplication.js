/**
 * Code Duplication Detection and Fixes
 * Identifies and helps fix code duplication
 */

class CodeDuplicationDetector {
    constructor() {
        this.duplications = [];
        this.init();
    }
    
    init() {
        // Scan for duplications on load (development only)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Only scan in development
            // this.scanForDuplications();
        }
    }
    
    /**
     * Common utility functions to reduce duplication
     */
    
    /**
     * Format number with short notation
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    static formatShort(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }
    
    /**
     * Format number with one decimal
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    static formatOneDecimal(num) {
        return num.toFixed(1);
    }
    
    /**
     * Create notification element
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @returns {HTMLElement} Notification element
     */
    static createNotificationElement(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        return notification;
    }
    
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in ms
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Safe JSON parse
     * @param {string} str - JSON string
     * @param {*} defaultValue - Default value if parse fails
     * @returns {*} Parsed value or default
     */
    static safeJSONParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error('JSON parse error:', e);
            return defaultValue;
        }
    }
    
    /**
     * Check if element is visible
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Is visible
     */
    static isElementVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }
    
    /**
     * Get element by ID safely
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null
     */
    static getElementById(id) {
        return document.getElementById(id);
    }
    
    /**
     * Add event listener safely
     * @param {HTMLElement} element - Element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    static addEventListenerSafe(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
        }
    }
}

// Export utilities
export const CodeDuplicationUtils = CodeDuplicationDetector;

// Make utilities globally available
window.formatShort = CodeDuplicationDetector.formatShort;
window.formatOneDecimal = CodeDuplicationDetector.formatOneDecimal;
window.safeJSONParse = CodeDuplicationDetector.safeJSONParse;
window.isElementVisible = CodeDuplicationDetector.isElementVisible;
window.getElementByIdSafe = CodeDuplicationDetector.getElementById;
window.addEventListenerSafe = CodeDuplicationDetector.addEventListenerSafe;

export default CodeDuplicationDetector;

