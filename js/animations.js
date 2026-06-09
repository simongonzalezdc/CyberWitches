// Animation utilities for polish with performance optimizations
import { formatShort } from './utils.js';

// Track active animations to prevent multiple simultaneous animations
const activeAnimations = new Map();

// Animation frame throttling for better performance
let animationFrameId = null;
const pendingAnimations = new Set();

/**
 * Throttled requestAnimationFrame handler to batch animations
 */
function processAnimations() {
    animationFrameId = null;
    
    // Process all pending animations
    for (const animation of pendingAnimations) {
        animation();
    }
    
    pendingAnimations.clear();
}

/**
 * Schedule an animation to be processed in next frame
 * @param {Function} animation - Animation function to execute
 */
function scheduleAnimation(animation) {
    pendingAnimations.add(animation);
    
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(processAnimations);
    }
}

/**
 * Animate a number with requestAnimationFrame throttling for smoother performance
 * @param {HTMLElement} element - Element to animate
 * @param {number} startValue - Starting value
 * @param {number} endValue - Ending value
 * @param {number} duration - Animation duration in milliseconds
 */
export function animateNumber(element, startValue, endValue, duration = 500) {
    if (!element) return;
    
    // Cancel any existing animation for this element
    if (activeAnimations.has(element)) {
        cancelAnimationFrame(activeAnimations.get(element));
    }
    
    const startTime = performance.now();
    const difference = endValue - startValue;
    
    // If difference is very small, just update directly
    if (Math.abs(difference) < 0.01) {
        element.textContent = formatShort(endValue);
        return;
    }
    
    // Cache prefix to avoid repeated string operations
    const textContent = element.textContent || '';
    const prefix = textContent.includes(':') ? textContent.split(':')[0] + ': ' : '';
    
    function update() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (difference * easeProgress);
        
        // Update text content with cached prefix
        element.textContent = prefix + formatShort(current);
        
        if (progress < 1) {
            const frameId = requestAnimationFrame(update);
            activeAnimations.set(element, frameId);
        } else {
            element.textContent = prefix + formatShort(endValue);
            activeAnimations.delete(element);
        }
    }
    
    // Schedule animation
    scheduleAnimation(update);
}

/**
 * Create a particle effect with optimized DOM operations
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} text - Text to display
 * @param {string} color - Color of particle
 */
export function createParticle(x, y, text, color = 'var(--color-glitch-500)') {
    // Check if we're on Tier 0 (no animations allowed)
    if (window.designTierSystem && window.designTierSystem.getCurrentTier() === 0) {
        return; // Don't create particles on Tier 0
    }
    
    // Use object pooling for particles to reduce GC pressure
    const particle = document.createElement('div');
    
    // Batch style updates for better performance
    const styles = {
        position: 'fixed',
        left: x + 'px',
        top: y + 'px',
        color: color,
        fontSize: '24px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: '90',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
        filter: `drop-shadow(0 0 5px ${color})`,
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        padding: '4px 8px',
        borderRadius: '8px',
        border: `1px solid ${color}44`,
        backdropFilter: 'blur(5px)',
        willChange: 'transform, opacity' // Optimize for animation
    };
    
    // Apply all styles at once
    Object.assign(particle.style, styles);
    particle.textContent = text;
    
    document.body.appendChild(particle);
    
    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
        const randomX = (Math.random() - 0.5) * 100;
        particle.style.transform = `translate(${randomX}px, -80px) scale(1.8) rotate(${Math.random() * 20 - 10}deg)`;
        particle.style.opacity = '0';
    });
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, 800);
}

/**
 * Pulse an element with optimized animation
 * @param {HTMLElement} element - Element to pulse
 * @param {number} scale - Scale factor
 * @param {number} duration - Animation duration in milliseconds
 */
export function pulseElement(element, scale = 1.1, duration = 200) {
    if (!element) return;
    
    // Use will-change for better performance
    element.style.willChange = 'transform';
    element.style.transition = `transform ${duration}ms ease-out`;
    element.style.transform = `scale(${scale})`;
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        // Remove will-change after animation
        setTimeout(() => {
            element.style.willChange = 'auto';
        }, duration);
    }, duration);
}

/**
 * Highlight an element with optimized animation
 * @param {HTMLElement} element - Element to highlight
 * @param {string} color - Highlight color
 * @param {number} duration - Animation duration in milliseconds
 */
export function highlightElement(element, color = 'var(--color-code)', duration = 300) {
    if (!element) return;
    
    const originalBg = element.style.backgroundColor;
    
    // Use will-change for better performance
    element.style.willChange = 'background-color';
    element.style.transition = `background-color ${duration}ms ease-out`;
    element.style.backgroundColor = color;
    
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
        // Remove will-change after animation
        setTimeout(() => {
            element.style.willChange = 'auto';
        }, duration);
    }, duration);
}

/**
 * Shake an element with optimized animation
 * @param {HTMLElement} element - Element to shake
 * @param {number} intensity - Shake intensity
 * @param {number} duration - Animation duration in milliseconds
 */
export function shakeElement(element, intensity = 5, duration = 300) {
    if (!element) return;
    
    const startTime = performance.now();
    const originalTransform = element.style.transform || '';
    
    // Use will-change for better performance
    element.style.willChange = 'transform';
    
    function update() {
        const elapsed = performance.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const shake = Math.sin(progress * Math.PI * 10) * intensity * (1 - progress);
            element.style.transform = `translateX(${shake}px) ${originalTransform}`;
            requestAnimationFrame(update);
        } else {
            element.style.transform = originalTransform;
            // Remove will-change after animation
            element.style.willChange = 'auto';
        }
    }
    
    update();
}

/**
 * Slide in an element with optimized animation
 * @param {HTMLElement} element - Element to slide in
 * @param {string} from - Direction to slide from ('bottom', 'top', 'left', 'right')
 * @param {number} duration - Animation duration in milliseconds
 */
export function slideIn(element, from = 'bottom', duration = 300) {
    if (!element) return;
    
    const directions = {
        bottom: 'translateY(20px)',
        top: 'translateY(-20px)',
        left: 'translateX(-20px)',
        right: 'translateX(20px)'
    };
    
    // Use will-change for better performance
    element.style.willChange = 'opacity, transform';
    element.style.opacity = '0';
    element.style.transform = directions[from] || directions.bottom;
    element.style.transition = `all ${duration}ms ease-out`;
    
    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translate(0, 0)';
        
        // Remove will-change after animation
        setTimeout(() => {
            element.style.willChange = 'auto';
        }, duration);
    });
}
