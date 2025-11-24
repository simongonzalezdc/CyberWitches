/**
 * Loading States Utility
 * Provides loading indicators for async operations
 * 
 * Week 3, Day 4-5 Optimization
 */

/**
 * Loading indicator manager
 */
class LoadingIndicatorManager {
    constructor() {
        this.activeIndicators = new Map();
        this.indicatorIdCounter = 0;
    }
    
    /**
     * Show a loading indicator
     * @param {string} message - Loading message
     * @param {Object} options - Options
     * @returns {Object} Indicator object with hide() method
     */
    show(message = 'Loading...', options = {}) {
        const id = `loading-${++this.indicatorIdCounter}`;
        const {
            position = 'center',
            overlay = true,
            spinner = true
        } = options;
        
        // Create indicator element
        const indicator = document.createElement('div');
        indicator.id = id;
        indicator.className = 'loading-indicator';
        indicator.setAttribute('role', 'status');
        indicator.setAttribute('aria-live', 'polite');
        indicator.setAttribute('aria-label', message);
        
        // Build HTML
        let html = '';
        if (overlay) {
            html += '<div class="loading-overlay"></div>';
        }
        html += '<div class="loading-content">';
        if (spinner) {
            html += '<div class="loading-spinner"></div>';
        }
        html += `<div class="loading-message">${message}</div>`;
        html += '</div>';
        
        indicator.innerHTML = html;
        
        // Add position class
        indicator.classList.add(`loading-${position}`);
        
        // Add to DOM
        document.body.appendChild(indicator);
        
        // Animate in
        requestAnimationFrame(() => {
            indicator.classList.add('active');
        });
        
        // Store indicator
        const indicatorObj = {
            id,
            element: indicator,
            hide: () => this.hide(id),
            updateMessage: (newMessage) => {
                const messageEl = indicator.querySelector('.loading-message');
                if (messageEl) {
                    messageEl.textContent = newMessage;
                    indicator.setAttribute('aria-label', newMessage);
                }
            }
        };
        
        this.activeIndicators.set(id, indicatorObj);
        
        return indicatorObj;
    }
    
    /**
     * Hide a loading indicator
     * @param {string} id - Indicator ID
     */
    hide(id) {
        const indicator = this.activeIndicators.get(id);
        if (!indicator) return;
        
        const element = indicator.element;
        
        // Animate out
        element.classList.remove('active');
        element.classList.add('hiding');
        
        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeIndicators.delete(id);
        }, 300); // Match CSS animation duration
    }
    
    /**
     * Hide all indicators
     */
    hideAll() {
        this.activeIndicators.forEach((indicator) => {
            this.hide(indicator.id);
        });
    }
    
    /**
     * Check if any indicators are active
     * @returns {boolean} True if any indicators are active
     */
    hasActive() {
        return this.activeIndicators.size > 0;
    }
}

// Global instance
export const loadingIndicatorManager = new LoadingIndicatorManager();

/**
 * Show loading indicator
 * @param {string} message - Loading message
 * @param {Object} options - Options
 * @returns {Object} Indicator object
 */
export function showLoadingIndicator(message, options) {
    return loadingIndicatorManager.show(message, options);
}

/**
 * Hide loading indicator
 * @param {string} id - Indicator ID
 */
export function hideLoadingIndicator(id) {
    loadingIndicatorManager.hide(id);
}

/**
 * Wrap an async operation with loading indicator
 * @param {Function} operation - Async operation
 * @param {string} message - Loading message
 * @param {Object} options - Options
 * @returns {Promise} Promise that resolves with operation result
 */
export async function withLoadingIndicator(operation, message = 'Loading...', options = {}) {
    const indicator = showLoadingIndicator(message, options);
    
    try {
        const result = await operation();
        return result;
    } catch (error) {
        console.error('Operation failed:', error);
        throw error;
    } finally {
        indicator.hide();
    }
}

