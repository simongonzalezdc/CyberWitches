/**
 * Feature Indicators System
 * Provides visual indicators for locked/hidden features
 */

// Import custom tooltip manager (will be available globally)
// const customTooltipManager = window.customTooltipManager || null;

class FeatureIndicatorManager {
    constructor() {
        this.lockedFeatures = new Map();
        this.init();
    }

    init() {
        // Set up indicators for locked features.
        // Workstation/upgrade lock state is rendered directly by their card
        // renderers (workstationUI / virtualScroll, via each item's unlockAtAb),
        // so only tab indicators are owned here.
        this.setupTabIndicators();
    }

    /**
     * Mark feature as locked
     * @param {string} featureId - Feature ID
     * @param {string} unlockCondition - Unlock condition text
     * @param {Function} checkUnlocked - Function to check if feature is unlocked
     */
    registerLockedFeature(featureId, unlockCondition, checkUnlocked) {
        this.lockedFeatures.set(featureId, {
            unlockCondition,
            checkUnlocked,
            isUnlocked: false
        });
    }

    /**
     * Add lock indicator to element
     * @param {HTMLElement} element - Element to add indicator to
     * @param {string} unlockCondition - Unlock condition text
     * @param {boolean} isLocked - Whether feature is currently locked
     */
    addLockIndicator(element, unlockCondition, isLocked = true) {
        if (!element) return;

        // Remove existing indicator
        const existing = element.querySelector('.lock-indicator');
        if (existing) {
            existing.remove();
        }

        if (!isLocked) {
            // Remove lock class if unlocked
            element.classList.remove('locked');
            return;
        }

        // Add lock class
        element.classList.add('locked');

        // Create lock indicator
        const indicator = document.createElement('div');
        indicator.className = 'lock-indicator';
        // Styles moved to CSS

        indicator.innerHTML = '🔒';
        indicator.setAttribute('aria-label', `Locked: ${unlockCondition}`);
        indicator.setAttribute('title', `Unlocks at: ${unlockCondition}`);

        // Add tooltip
        indicator.addEventListener('mouseenter', () => {
            this.showTooltip(indicator, unlockCondition);
        });

        indicator.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        // Make element position relative if not already
        const position = window.getComputedStyle(element).position;
        if (position === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(indicator);
    }

    /**
     * Show tooltip
     * @param {HTMLElement} element - Element to show tooltip for
     * @param {string} text - Tooltip text
     */
    showTooltip(element, text) {
        // Remove existing tooltip
        const existing = document.querySelector('.feature-tooltip');
        if (existing) {
            existing.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'feature-tooltip';
        tooltip.textContent = text;
        // Styles moved to CSS

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.querySelector('.feature-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * Setup tab indicators for locked tabs
     */
    setupTabIndicators() {
        // Check for locked tabs (Meditation, Boons unlock after prestige)
        if (window.gameState) {
            const prestigeCount = window.gameState.prestigeCount || 0;

            // Meditation tab unlocks at prestige 1
            const meditationTab = document.querySelector('[data-tab="meditation"]');
            if (meditationTab) {
                // Show tab instead of hiding it
                meditationTab.style.display = '';
                meditationTab.removeAttribute('style');

                if (prestigeCount < 1) {
                    meditationTab.classList.add('locked');
                    meditationTab.setAttribute('data-unlock-condition', 'Prestige 1');
                    const previewText = 'Meditation - Unlocks at Prestige 1\n\nPreview: Defend against waves in this tower defense mini-game. Earn Focus currency and unlock meditation upgrades. Gain production bonuses that apply to your main game!';
                    meditationTab.setAttribute('title', previewText);
                    if (window.addTooltip) {
                        window.addTooltip(meditationTab, previewText, 'top', true);
                    }
                    this.addLockIndicator(meditationTab, 'Unlocks at Prestige 1', true);
                } else {
                    meditationTab.classList.remove('locked');
                    meditationTab.removeAttribute('data-unlock-condition');
                    this.addLockIndicator(meditationTab, '', false);
                }
            }

            // Boons tab unlocks at prestige 1
            const boonsTab = document.querySelector('[data-tab="boons"]');
            if (boonsTab) {
                // Show tab instead of hiding it
                boonsTab.style.display = '';
                boonsTab.removeAttribute('style');

                if (prestigeCount < 1) {
                    boonsTab.classList.add('locked');
                    boonsTab.setAttribute('data-unlock-condition', 'Prestige 1');
                    const previewText = 'Boons - Unlocks at Prestige 1\n\nPreview: Purchase powerful permanent bonuses with Eldritch Keys (EK). These bonuses persist across all ascensions and make future runs faster!';
                    boonsTab.setAttribute('title', previewText);
                    if (window.addTooltip) {
                        window.addTooltip(boonsTab, previewText, 'top', true);
                    }
                    this.addLockIndicator(boonsTab, 'Unlocks at Prestige 1', true);
                } else {
                    boonsTab.classList.remove('locked');
                    boonsTab.removeAttribute('data-unlock-condition');
                    this.addLockIndicator(boonsTab, '', false);
                }
            }
        }
    }

    /**
     * Update all indicators
     */
    updateIndicators() {
        this.setupTabIndicators();
    }
}

// Create global instance
const featureIndicatorManager = new FeatureIndicatorManager();

// Global functions for compatibility
window.addLockIndicator = (element, unlockCondition, isLocked) => {
    featureIndicatorManager.addLockIndicator(element, unlockCondition, isLocked);
};

window.updateFeatureIndicators = () => {
    featureIndicatorManager.updateIndicators();
};

export default featureIndicatorManager;

