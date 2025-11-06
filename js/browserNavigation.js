/**
 * Browser Navigation System
 * Implements browser back/forward button support for tab navigation
 */

class BrowserNavigationManager {
    constructor() {
        this.historyState = null;
        this.init();
    }
    
    init() {
        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.switchToTab(e.state.tab);
            }
        });
        
        // Track initial state
        if (!history.state) {
            history.replaceState({ tab: 'workstations' }, '', window.location.href);
        }
    }
    
    /**
     * Switch to tab and update browser history
     * @param {string} tabName - Tab name to switch to
     */
    switchToTab(tabName) {
        // Update browser history
        history.pushState({ tab: tabName }, '', `#${tabName}`);
        
        // Call the existing switchTab function if available
        if (window.switchTab) {
            window.switchTab(tabName);
        }
    }
    
    /**
     * Get current tab from history
     * @returns {string} Current tab name
     */
    getCurrentTab() {
        if (history.state && history.state.tab) {
            return history.state.tab;
        }
        
        // Check URL hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            return hash;
        }
        
        return 'workstations'; // Default
    }
}

// Create global instance
const browserNavigationManager = new BrowserNavigationManager();

// Global functions for compatibility
window.switchToTabWithHistory = (tabName) => {
    browserNavigationManager.switchToTab(tabName);
};

export default browserNavigationManager;

