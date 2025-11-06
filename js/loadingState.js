/**
 * Loading State System
 * Provides loading indicators for async operations
 */

class LoadingStateManager {
    constructor() {
        this.activeLoaders = new Set();
        this.loaderElement = null;
        this.init();
    }
    
    init() {
        // Create loading overlay element
        this.loaderElement = document.createElement('div');
        this.loaderElement.id = 'loading-overlay';
        this.loaderElement.className = 'loading-overlay';
        this.loaderElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10001;
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 20px;
        `;
        
        this.loaderElement.innerHTML = `
            <div class="loading-spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: var(--primary, #FF2DAA);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <div class="loading-message" style="
                color: var(--text, #FFFFFF);
                font-size: 18px;
                font-weight: 600;
            ">Loading...</div>
        `;
        
        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.loaderElement);
    }
    
    /**
     * Show loading state
     * @param {string} message - Loading message
     * @param {string} id - Unique identifier for this loader
     * @returns {string} - Loader ID
     */
    show(message = 'Loading...', id = null) {
        const loaderId = id || `loader_${Date.now()}_${Math.random()}`;
        this.activeLoaders.add(loaderId);
        
        const messageEl = this.loaderElement.querySelector('.loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        this.loaderElement.style.display = 'flex';
        this.loaderElement.setAttribute('aria-busy', 'true');
        this.loaderElement.setAttribute('aria-live', 'polite');
        
        return loaderId;
    }
    
    /**
     * Hide loading state
     * @param {string} id - Loader ID to hide
     */
    hide(id = null) {
        if (id) {
            this.activeLoaders.delete(id);
        } else {
            this.activeLoaders.clear();
        }
        
        if (this.activeLoaders.size === 0) {
            this.loaderElement.style.display = 'none';
            this.loaderElement.setAttribute('aria-busy', 'false');
        }
    }
    
    /**
     * Show loading state for async operation
     * @param {Promise} promise - Promise to wait for
     * @param {string} message - Loading message
     * @returns {Promise} - Original promise
     */
    async wrap(promise, message = 'Loading...') {
        const id = this.show(message);
        try {
            const result = await promise;
            this.hide(id);
            return result;
        } catch (error) {
            this.hide(id);
            throw error;
        }
    }
}

// Create global instance
const loadingStateManager = new LoadingStateManager();

// Global function for compatibility
window.showLoadingState = (message) => {
    return loadingStateManager.show(message);
};

window.hideLoadingState = (id) => {
    loadingStateManager.hide(id);
};

export default loadingStateManager;

