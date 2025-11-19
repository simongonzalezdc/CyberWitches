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
            this.container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden;';
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

        // Default styles if class doesn't exist or for base positioning
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.transform = 'translate(-50%, -50%)';
        element.style.pointerEvents = 'none';
        element.style.fontWeight = 'bold';
        element.style.fontSize = '1.2rem';
        element.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
        element.style.opacity = '1';
        element.style.transition = 'transform 1s ease-out, opacity 1s ease-out';

        // Type-specific colors (fallback if CSS classes aren't fully defined)
        switch (type) {
            case 'success':
                element.style.color = 'var(--success, #3CE3C5)';
                break;
            case 'error':
                element.style.color = 'var(--error, #FF4444)';
                break;
            case 'info':
                element.style.color = 'var(--text, #FFFFFF)';
                break;
            case 'crit':
                element.style.color = 'var(--accent, #FFDB6E)';
                element.style.fontSize = '1.5rem';
                break;
        }

        this.container.appendChild(element);

        // Animate
        requestAnimationFrame(() => {
            element.style.transform = 'translate(-50%, -150%)';
            element.style.opacity = '0';
        });

        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 1000);
    }
}
