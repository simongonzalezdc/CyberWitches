/**
 * FloatingTextUI
 * Manages floating text effects for resource gains and other feedback.
 */
export class FloatingTextUI {
    constructor() {
        this.container = document.getElementById('floating-text-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'floating-text-container';
            // Styles moved to CSS
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show floating text at a specific position
     * @param {string} text - The text to display
     * @param {number} x - X coordinate (clientX)
     * @param {number} y - Y coordinate (clientY)
     * @param {string} type - Type of text ('success', 'error', 'info', 'crit')
     */
    show(text, x, y, type = 'success') {
        const element = document.createElement('div');
        element.textContent = text;
        element.className = `floating-text floating-text-${type}`;

        // Positioning still needs to be inline as it's dynamic
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        this.container.appendChild(element);

        // Animate
        requestAnimationFrame(() => {
            element.classList.add('floating-text-animate');
        });

        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 1000);
    }
}
