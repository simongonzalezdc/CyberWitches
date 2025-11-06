/**
 * DOM Optimization System
 * Implements optimized DOM manipulation patterns
 */

class DOMOptimizationManager {
    constructor() {
        this.updateQueue = [];
        this.isProcessing = false;
        this.init();
    }
    
    init() {
        // Set up batch update processing
        this.processUpdateQueue();
    }
    
    /**
     * Batch DOM updates
     * @param {Function} updateFn - Function to execute
     * @param {number} priority - Update priority (higher = more urgent)
     */
    batchUpdate(updateFn, priority = 0) {
        this.updateQueue.push({ fn: updateFn, priority });
        this.updateQueue.sort((a, b) => b.priority - a.priority);
        
        if (!this.isProcessing) {
            this.processUpdateQueue();
        }
    }
    
    /**
     * Process update queue
     */
    processUpdateQueue() {
        if (this.updateQueue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            // Process updates in batches
            const batch = this.updateQueue.splice(0, 10);
            
            // Use DocumentFragment for efficient DOM manipulation
            const fragment = document.createDocumentFragment();
            
            batch.forEach(({ fn }) => {
                try {
                    fn();
                } catch (error) {
                    console.error('Error in batched update:', error);
                }
            });
            
            // Continue processing if more updates remain
            if (this.updateQueue.length > 0) {
                this.processUpdateQueue();
            } else {
                this.isProcessing = false;
            }
        });
    }
    
    /**
     * Create element efficiently
     * @param {string} tag - Element tag
     * @param {Object} attributes - Element attributes
     * @param {string} text - Element text content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attributes = {}, text = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'class') {
                element.className = value;
            } else if (key === 'data') {
                for (const [dataKey, dataValue] of Object.entries(value)) {
                    element.setAttribute(`data-${dataKey}`, dataValue);
                }
            } else {
                element.setAttribute(key, value);
            }
        }
        
        if (text) {
            element.textContent = text;
        }
        
        return element;
    }
    
    /**
     * Update multiple elements efficiently
     * @param {Array} updates - Array of update objects {element, property, value}
     */
    batchElementUpdates(updates) {
        this.batchUpdate(() => {
            updates.forEach(({ element, property, value }) => {
                if (element && element[property] !== undefined) {
                    element[property] = value;
                }
            });
        });
    }
}

// Create global instance
const domOptimizationManager = new DOMOptimizationManager();

// Global functions for compatibility
window.batchDOMUpdate = (updateFn, priority) => {
    domOptimizationManager.batchUpdate(updateFn, priority);
};

export default domOptimizationManager;

