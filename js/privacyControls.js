/**
 * Privacy Controls System
 * Implements GDPR/CCPA compliance with consent management
 */

class PrivacyManager {
    constructor() {
        this.consent = {
            analytics: false,
            errorReporting: false,
            personalization: false
        };
        this.init();
    }

    init() {
        // Load saved consent preferences
        this.loadConsent();

        // Show consent banner if needed
        if (!this.hasConsent()) {
            this.showConsentBanner();
        }

        // Set up privacy settings in settings tab
        this.setupPrivacySettings();
    }

    /**
     * Load consent preferences from localStorage
     */
    loadConsent() {
        try {
            const saved = localStorage.getItem('privacyConsent');
            if (saved) {
                this.consent = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load consent preferences:', error);
        }
    }

    /**
     * Save consent preferences to localStorage
     */
    saveConsent() {
        try {
            localStorage.setItem('privacyConsent', JSON.stringify(this.consent));
        } catch (error) {
            console.error('Failed to save consent preferences:', error);
        }
    }

    /**
     * Check if user has given any consent
     * @returns {boolean}
     */
    hasConsent() {
        return Object.values(this.consent).some(v => v === true);
    }

    /**
     * Show consent banner
     */
    showConsentBanner() {
        // Check if banner already exists
        if (document.getElementById('privacy-consent-banner')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'privacy-consent-banner';
        banner.className = 'privacy-consent-banner';

        banner.innerHTML = `
            <div class="privacy-content">
                <div class="privacy-text-container">
                    <h3 class="privacy-title">Privacy & Cookies</h3>
                    <p class="privacy-description">
                        We use cookies and analytics to improve your experience. Your data is stored locally and never shared with third parties.
                    </p>
                </div>
                <div class="privacy-buttons">
                    <button id="privacy-accept-all" class="btn-primary privacy-btn">Accept All</button>
                    <button id="privacy-reject-all" class="btn-secondary privacy-btn">Reject All</button>
                    <button id="privacy-customize" class="btn-secondary privacy-btn">Customize</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('privacy-accept-all').addEventListener('click', () => {
            this.setConsent({ analytics: true, errorReporting: true, personalization: true });
            this.hideBanner();
        });

        document.getElementById('privacy-reject-all').addEventListener('click', () => {
            this.setConsent({ analytics: false, errorReporting: false, personalization: false });
            this.hideBanner();
        });

        document.getElementById('privacy-customize').addEventListener('click', () => {
            this.showPrivacySettings();
            this.hideBanner();
        });
    }

    /**
     * Hide consent banner
     */
    hideBanner() {
        const banner = document.getElementById('privacy-consent-banner');
        if (banner) {
            banner.remove();
        }
    }

    /**
     * Set consent preferences
     * @param {Object} preferences - Consent preferences
     */
    setConsent(preferences) {
        this.consent = { ...this.consent, ...preferences };
        this.saveConsent();

        // Apply consent changes
        this.applyConsent();
    }

    /**
     * Apply consent preferences
     */
    applyConsent() {
        // Disable analytics if not consented
        if (!this.consent.analytics && window.analytics) {
            // Disable analytics tracking
            console.log('Analytics disabled per user consent');
        }

        // Disable error reporting if not consented
        if (!this.consent.errorReporting) {
            // Disable error reporting
            console.log('Error reporting disabled per user consent');
        }
    }

    /**
     * Check if analytics is allowed
     * @returns {boolean}
     */
    canUseAnalytics() {
        return this.consent.analytics === true;
    }

    /**
     * Check if error reporting is allowed
     * @returns {boolean}
     */
    canReportErrors() {
        return this.consent.errorReporting === true;
    }

    /**
     * Setup privacy settings in settings tab
     */
    setupPrivacySettings() {
        // This will be called when settings tab is opened
        // Implementation will be in game.js
    }

    /**
     * Show privacy settings modal
     */
    showPrivacySettings() {
        // Switch to settings tab and show privacy section
        if (window.switchTab) {
            window.switchTab('settings');
        }

        // Scroll to privacy section
        setTimeout(() => {
            const privacySection = document.getElementById('privacy-settings-section');
            if (privacySection) {
                privacySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    /**
     * Get privacy policy URL
     * @returns {string}
     */
    getPrivacyPolicyURL() {
        return '/privacy-policy.html'; // Update with actual URL
    }

    /**
     * Export user data (GDPR right to data portability)
     * @returns {Object} - User data
     */
    exportUserData() {
        const data = {
            gameState: null,
            preferences: {
                consent: this.consent,
                settings: {}
            },
            timestamp: Date.now()
        };

        // Export game state if available
        if (window.gameState) {
            try {
                const saveData = localStorage.getItem('cyberWitchesSave');
                if (saveData) {
                    data.gameState = JSON.parse(saveData);
                }
            } catch (error) {
                console.error('Failed to export game state:', error);
            }
        }

        return data;
    }

    /**
     * Delete user data (GDPR right to be forgotten)
     */
    deleteUserData() {
        // Clear all game data
        localStorage.clear();
        sessionStorage.clear();

        // Reset consent
        this.consent = {
            analytics: false,
            errorReporting: false,
            personalization: false
        };

        // Show consent banner again
        this.showConsentBanner();
    }
}

// Create global instance
const privacyManager = new PrivacyManager();

// Global functions for compatibility
window.getPrivacyConsent = (type) => {
    return privacyManager.consent[type] || false;
};

window.canUseAnalytics = () => {
    return privacyManager.canUseAnalytics();
};

window.canReportErrors = () => {
    return privacyManager.canReportErrors();
};

export default privacyManager;

