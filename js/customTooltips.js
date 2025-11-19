/**
 * Custom Tooltip System
 * Provides custom tooltips that work on both desktop and mobile
 */

class CustomTooltipManager {
    constructor() {
        this.activeTooltip = null;
        this.tooltipElement = null;
        this.init();
    }

    init() {
        // Create tooltip element
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'custom-tooltip';
        this.tooltipElement.style.cssText = `
            position: absolute;
            background: var(--bg-card, #1a1a2e);
            border: 2px solid var(--primary, #FF2DAA);
            border-radius: 8px;
            padding: 12px 16px;
            color: var(--text, #FFFFFF);
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            max-width: 300px;
            display: none;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        document.body.appendChild(this.tooltipElement);
    }

    /**
     * Show tooltip
     * @param {HTMLElement} element - Element to show tooltip for
     * @param {string} text - Tooltip text
     * @param {string} position - Tooltip position (top, bottom, left, right)
     */
    show(element, text, position = 'top') {
        if (!element || !text) return;

        // Hide existing tooltip
        this.hide();

        this.activeTooltip = { element, text, position };
        this.tooltipElement.textContent = text;
        this.tooltipElement.style.display = 'block';

        // Position tooltip
        this.positionTooltip(element, position);

        // Show with fade in
        setTimeout(() => {
            this.tooltipElement.style.opacity = '1';
        }, 10);
    }

    /**
     * Position tooltip relative to element
     * @param {HTMLElement} element - Target element
     * @param {string} position - Position preference
     */
    positionTooltip(element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = rect.top + scrollY - tooltipRect.height - 8;
                left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + scrollY + 8;
                left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left + scrollX - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + scrollX + 8;
                break;
        }

        // Keep tooltip within viewport
        const padding = 8;
        if (left < padding) left = padding;
        if (left + tooltipRect.width > window.innerWidth - padding) {
            left = window.innerWidth - tooltipRect.width - padding;
        }
        if (top < padding) top = padding;
        if (top + tooltipRect.height > window.innerHeight - padding) {
            top = window.innerHeight - tooltipRect.height - padding;
        }

        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left}px`;
    }

    /**
     * Hide tooltip
     */
    hide() {
        if (this.tooltipElement) {
            this.tooltipElement.style.opacity = '0';
            setTimeout(() => {
                this.tooltipElement.style.display = 'none';
                this.activeTooltip = null;
            }, 200);
        }
    }

    /**
     * Add tooltip to element
     * @param {HTMLElement} element - Element to add tooltip to
     * @param {string} text - Tooltip text
     * @param {string} position - Tooltip position
     * @param {boolean} mobileFriendly - Show on tap for mobile
     */
    addTooltip(element, text, position = 'top', mobileFriendly = true) {
        if (!element || !text) return;

        // Store tooltip data
        element.setAttribute('data-tooltip', text);
        element.setAttribute('data-tooltip-position', position);

        // Desktop: show on hover
        element.addEventListener('mouseenter', () => {
            if (!isMobile && !isTouchDevice) {
                this.show(element, text, position);
            }
        });

        element.addEventListener('mouseleave', () => {
            this.hide();
        });

        // Mobile: show on tap
        if (mobileFriendly && (isMobile || isTouchDevice)) {
            let tapTimeout;
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                tapTimeout = setTimeout(() => {
                    this.show(element, text, position);
                }, 300);
            });

            element.addEventListener('touchend', () => {
                clearTimeout(tapTimeout);
            });

            element.addEventListener('touchmove', () => {
                clearTimeout(tapTimeout);
                this.hide();
            });

            // Hide on tap outside
            document.addEventListener('touchstart', (e) => {
                if (!element.contains(e.target)) {
                    this.hide();
                }
            });
        }
    }

    /**
     * Update tooltip text
     * @param {HTMLElement} element - Element
     * @param {string} text - New tooltip text
     */
    updateTooltip(element, text) {
        if (element) {
            element.setAttribute('data-tooltip', text);
            if (this.activeTooltip && this.activeTooltip.element === element) {
                this.show(element, text, this.activeTooltip.position);
            }
        }
    }

    /**
     * Remove tooltip from element
     * @param {HTMLElement} element - Element
     */
    removeTooltip(element) {
        if (element) {
            element.removeAttribute('data-tooltip');
            element.removeAttribute('data-tooltip-position');
            // Remove event listeners by cloning element
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        }
    }
}

// Create global instance
const customTooltipManager = new CustomTooltipManager();

// Global functions removed - use customTooltipManager directly
// window.addTooltip = ...
// window.showTooltip = ...
// window.hideTooltip = ...

export default customTooltipManager;

