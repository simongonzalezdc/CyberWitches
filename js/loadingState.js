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

        this.loaderElement.innerHTML = `
            <div class="loading-spinner-large"></div>
            <div class="loading-message loading-message-text">Loading...</div>
        `;

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

        this.loaderElement.classList.add('active');
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
            this.loaderElement.classList.remove('active');
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
export const loadingStateManager = new LoadingStateManager();

// Export functions for modules
export const showLoadingState = (message) => {
    return loadingStateManager.show(message);
};

export const hideLoadingState = (id) => {
    loadingStateManager.hide(id);
};

export default loadingStateManager;

