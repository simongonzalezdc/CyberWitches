// Animation utilities for polish

// Track active animations to prevent multiple simultaneous animations
const activeAnimations = new Map();

export function animateNumber(element, startValue, endValue, duration = 500) {
    if (!element) return;
    
    // Cancel any existing animation for this element
    if (activeAnimations.has(element)) {
        cancelAnimationFrame(activeAnimations.get(element));
    }
    
    const startTime = Date.now();
    const difference = endValue - startValue;
    
    // If difference is very small, just update directly
    if (Math.abs(difference) < 0.01) {
        element.textContent = formatShort(endValue);
        return;
    }
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (difference * easeProgress);
        
        // Update text content directly (no formatShort during animation for performance)
        if (element.textContent) {
            const prefix = element.textContent.split(':')[0] + ': ';
            element.textContent = prefix + formatShort(current);
        } else {
            element.textContent = formatShort(current);
        }
        
        if (progress < 1) {
            const frameId = requestAnimationFrame(update);
            activeAnimations.set(element, frameId);
        } else {
            element.textContent = formatShort(endValue);
            activeAnimations.delete(element);
        }
    }
    
    update();
}

export function createParticle(x, y, text, color = '#FF2DAA') {
    const particle = document.createElement('div');
    particle.textContent = text;
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.color = color;
    particle.style.fontSize = '24px';
    particle.style.fontWeight = 'bold';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '10000';
    particle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    particle.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;
    particle.style.filter = `drop-shadow(0 0 5px ${color})`;
    particle.style.background = `linear-gradient(135deg, ${color}22, ${color}11)`;
    particle.style.padding = '4px 8px';
    particle.style.borderRadius = '8px';
    particle.style.border = `1px solid ${color}44`;
    particle.style.backdropFilter = 'blur(5px)';
    
    document.body.appendChild(particle);
    
    // Animate with rotation and scale
    setTimeout(() => {
        const randomX = (Math.random() - 0.5) * 100;
        particle.style.transform = `translate(${randomX}px, -80px) scale(1.8) rotate(${Math.random() * 20 - 10}deg)`;
        particle.style.opacity = '0';
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, 800);
}

export function pulseElement(element, scale = 1.1, duration = 200) {
    if (!element) return;
    
    element.style.transition = `transform ${duration}ms ease-out`;
    element.style.transform = `scale(${scale})`;
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, duration);
}

export function highlightElement(element, color = '#22E3FF', duration = 300) {
    if (!element) return;
    
    const originalBg = element.style.backgroundColor;
    element.style.transition = `background-color ${duration}ms ease-out`;
    element.style.backgroundColor = color;
    
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
    }, duration);
}

export function shakeElement(element, intensity = 5, duration = 300) {
    if (!element) return;
    
    const startTime = Date.now();
    const originalTransform = element.style.transform || '';
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const shake = Math.sin(progress * Math.PI * 10) * intensity * (1 - progress);
            element.style.transform = `translateX(${shake}px) ${originalTransform}`;
            requestAnimationFrame(update);
        } else {
            element.style.transform = originalTransform;
        }
    }
    
    update();
}

export function slideIn(element, from = 'bottom', duration = 300) {
    if (!element) return;
    
    const directions = {
        bottom: 'translateY(20px)',
        top: 'translateY(-20px)',
        left: 'translateX(-20px)',
        right: 'translateX(20px)'
    };
    
    element.style.opacity = '0';
    element.style.transform = directions[from] || directions.bottom;
    element.style.transition = `all ${duration}ms ease-out`;
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translate(0, 0)';
    }, 10);
}

export function formatShort(value) {
    if (value < 1000) {
        return Math.floor(value).toString();
    }
    
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    let tier = 0;
    
    while (value >= 1000 && tier < suffixes.length - 1) {
        value /= 1000;
        tier++;
    }
    
    return value.toFixed(2) + suffixes[tier];
}

