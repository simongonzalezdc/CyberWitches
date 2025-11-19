/**
 * Accessibility System
 * Implements WCAG 2.2 compliance features including focus management,
 * ARIA live regions, and motion sensitivity controls
 */

class AccessibilityManager {
    constructor() {
        this.liveRegions = new Map();
        this.focusHistory = [];
        this.reducedMotion = false;
        this.init();
    }

    init() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reducedMotion = prefersReducedMotion.matches;

        // Listen for changes
        prefersReducedMotion.addEventListener('change', (e) => {
            this.reducedMotion = e.matches;
            this.applyReducedMotion();
        });

        // Create live regions
        this.createLiveRegions();

        // Set up focus management
        this.setupFocusManagement();

        // Apply initial reduced motion
        this.applyReducedMotion();
    }

    /**
     * Create ARIA live regions for announcements
     */
    createLiveRegions() {
        const regions = [
            { id: 'aria-live-polite', politeness: 'polite' },
            { id: 'aria-live-assertive', politeness: 'assertive' },
            { id: 'aria-live-off', politeness: 'off' }
        ];

        regions.forEach(region => {
            const element = document.createElement('div');
            element.id = region.id;
            element.className = 'sr-only';
            element.setAttribute('aria-live', region.politeness);
            element.setAttribute('aria-atomic', 'true');
            element.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(element);
            this.liveRegions.set(region.politeness, element);
        });
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} politeness - 'polite' or 'assertive'
     */
    announce(message, politeness = 'polite') {
        const region = this.liveRegions.get(politeness);
        if (region) {
            // Clear previous message
            region.textContent = '';
            // Set new message (timeout ensures it's announced)
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        }
    }

    /**
     * Set up focus management
     */
    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push(e.target);
            // Keep only last 10 focus targets
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });

        // Restore focus after dynamic updates
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if focus was lost
                    if (document.activeElement === document.body) {
                        // Try to restore focus to last known element
                        const lastFocus = this.focusHistory[this.focusHistory.length - 1];
                        if (lastFocus && document.contains(lastFocus)) {
                            lastFocus.focus();
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Trap focus within a container (for modals)
     * @param {HTMLElement} container - Container to trap focus in
     */
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), ' +
            'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }

            // Close on Escape
            if (e.key === 'Escape') {
                const closeButton = container.querySelector('[data-close-modal]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        });

        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
    }

    /**
     * Apply reduced motion settings
     */
    applyReducedMotion() {
        if (this.reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            document.documentElement.style.setProperty('--transition-duration', '0s');
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
            document.documentElement.style.removeProperty('--transition-duration');
            document.documentElement.classList.remove('reduced-motion');
        }
    }

    /**
     * Toggle reduced motion
     */
    toggleReducedMotion() {
        this.reducedMotion = !this.reducedMotion;
        localStorage.setItem('reducedMotion', this.reducedMotion.toString());
        this.applyReducedMotion();
    }

    /**
     * Check if reduced motion is enabled
     * @returns {boolean}
     */
    isReducedMotion() {
        return this.reducedMotion;
    }
}

// Create global instance
export const accessibilityManager = new AccessibilityManager();

// Export functions for modules
export const announceToScreenReader = (message, politeness) => {
    accessibilityManager.announce(message, politeness);
};

export const trapFocus = (container) => {
    accessibilityManager.trapFocus(container);
};

export default accessibilityManager;
