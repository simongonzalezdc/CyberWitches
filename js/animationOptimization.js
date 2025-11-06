/**
 * Animation Optimization System
 * Implements performance-optimized animations
 */

class AnimationOptimizationManager {
    constructor() {
        this.activeAnimations = new Map();
        this.animationFrameId = null;
        this.init();
    }
    
    init() {
        // Set up will-change hints
        this.setupWillChangeHints();
    }
    
    /**
     * Set up will-change hints for better performance
     */
    setupWillChangeHints() {
        // Add will-change to elements that will be animated
        const animatedElements = document.querySelectorAll('.card, .tab-btn, .btn-primary, .element-counter');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });
    }
    
    /**
     * Animate element using transform (GPU accelerated)
     * @param {HTMLElement} element - Element to animate
     * @param {Object} properties - Animation properties
     * @param {number} duration - Animation duration in ms
     * @returns {Promise} Animation promise
     */
    animateTransform(element, properties, duration = 300) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const startProps = {};
            
            // Get initial values
            Object.keys(properties).forEach(prop => {
                if (prop === 'translateX' || prop === 'translateY' || prop === 'scale' || prop === 'rotate') {
                    startProps[prop] = 0;
                } else {
                    const computed = window.getComputedStyle(element)[prop];
                    startProps[prop] = parseFloat(computed) || 0;
                }
            });
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const eased = this.easeInOutCubic(progress);
                
                // Apply transforms
                const transforms = [];
                const translateX = properties.translateX !== undefined 
                    ? startProps.translateX + (properties.translateX - startProps.translateX) * eased 
                    : 0;
                const translateY = properties.translateY !== undefined 
                    ? startProps.translateY + (properties.translateY - startProps.translateY) * eased 
                    : 0;
                const scale = properties.scale !== undefined 
                    ? startProps.scale + (properties.scale - startProps.scale) * eased 
                    : 1;
                const rotate = properties.rotate !== undefined 
                    ? startProps.rotate + (properties.rotate - startProps.rotate) * eased 
                    : 0;
                
                if (translateX !== 0 || translateY !== 0) {
                    transforms.push(`translate(${translateX}px, ${translateY}px)`);
                }
                if (scale !== 1) {
                    transforms.push(`scale(${scale})`);
                }
                if (rotate !== 0) {
                    transforms.push(`rotate(${rotate}deg)`);
                }
                
                if (transforms.length > 0) {
                    element.style.transform = transforms.join(' ');
                }
                
                // Apply other properties
                Object.keys(properties).forEach(prop => {
                    if (prop !== 'translateX' && prop !== 'translateY' && prop !== 'scale' && prop !== 'rotate') {
                        const value = startProps[prop] + (properties[prop] - startProps[prop]) * eased;
                        element.style[prop] = value + (prop === 'opacity' ? '' : 'px');
                    }
                });
                
                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    /**
     * Easing function - cubic ease in/out
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased progress
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Cancel animation
     * @param {string} animationId - Animation ID
     */
    cancelAnimation(animationId) {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.activeAnimations.delete(animationId);
    }
}

// Create global instance
const animationOptimizationManager = new AnimationOptimizationManager();

// Global functions for compatibility
window.animateTransform = (element, properties, duration) => {
    return animationOptimizationManager.animateTransform(element, properties, duration);
};

export default animationOptimizationManager;

