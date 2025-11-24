/**
 * Particle System
 * Manages background sparkles and other particle effects
 * Optimized for performance with visibility detection and cleanup
 * Uses object pooling to reduce GC pressure (Week 1, Day 2 optimization)
 */

import { ParticlePool } from '../../core/ObjectPool.js';

export class ParticleSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.canvas = null;
        this.ctx = null;
        this.sparkles = [];
        this.animationFrameId = null;
        this.isPaused = false;
        this.lastTime = 0;
        this.lastFrameTime = 0;
        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
        this.gradientCache = new Map();
        this.resizeTimeout = null;
        this.initialized = false;
        
        // Object pool for particles (reduces GC pressure)
        this.particlePool = null;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    init() {
        if (this.initialized) return;

        this.canvas = document.getElementById('sparkle-canvas');
        if (!this.canvas) {
            console.warn('ParticleSystem: Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('ParticleSystem: Failed to get 2D context');
            return;
        }

        // Performance optimization: reduce sparkle count on mobile/low-end devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const sparkleCount = isMobile ? 15 : 25;
        
        // Initialize object pool for particles
        this.particlePool = new ParticlePool(sparkleCount * 2); // Pool size = 2x active particles

        // Initialize sparkles using object pool
        this.createSparkles(sparkleCount);

        // Set initial size
        this.handleResize();

        // Event listeners
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Initialize timing
        this.lastTime = performance.now();
        this.lastFrameTime = performance.now();

        // Don't start animation here - UnifiedGameLoop will handle it if active
        // Only start if UnifiedGameLoop is not available
        if (!window.gameLoop || !window.gameLoop.isRunning) {
            this.start();
        }

        this.initialized = true;
        this.canvas.dataset.initialized = 'true';
    }

    createSparkles(count) {
        // Release existing sparkles to pool
        if (this.particlePool) {
            this.particlePool.releaseAll(this.sparkles);
        }
        
        this.sparkles = [];
        const colors = [
            { r: 255, g: 255, b: 255 }, // White
            { r: 255, g: 45, b: 170 },  // Pink
            { r: 34, g: 227, b: 255 },  // Cyan
            { r: 255, g: 219, b: 110 }, // Yellow
            { r: 60, g: 227, b: 197 }   // Teal
        ];
        
        for (let i = 0; i < count; i++) {
            // Acquire particle from pool and initialize
            const sparkle = this.particlePool.acquireParticle(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                {
                    vx: Math.cos(Math.random() * Math.PI * 2) * (Math.random() * 0.3 + 0.1),
                    vy: Math.sin(Math.random() * Math.PI * 2) * (Math.random() * 0.3 + 0.1),
                    size: Math.random() * 1.5 + 0.5,
                    life: 1.0,
                    opacity: Math.random() * 0.5 + 0.3,
                    color: colors[Math.floor(Math.random() * colors.length)]
                }
            );
            
            // Add particle-specific properties
            sparkle.angle = Math.random() * Math.PI * 2;
            sparkle.twinkle = Math.random() * Math.PI * 2;
            sparkle.speed = Math.sqrt(sparkle.vx * sparkle.vx + sparkle.vy * sparkle.vy);
            
            this.sparkles.push(sparkle);
        }
    }

    handleResize() {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                // Reinitialize sparkles if they go off-screen
                this.sparkles.forEach(sparkle => {
                    if (sparkle.x > this.canvas.width) sparkle.x = this.canvas.width * Math.random();
                    if (sparkle.y > this.canvas.height) sparkle.y = this.canvas.height * Math.random();
                });
            }
        }, 250);
    }

    handleVisibilityChange() {
        this.isPaused = document.hidden;
        // Don't restart animation if UnifiedGameLoop is managing us
        const isManagedByGameLoop = window.gameLoop && window.gameLoop.isRunning;
        if (!this.isPaused && !this.animationFrameId && !isManagedByGameLoop) {
            this.lastTime = performance.now();
            this.lastFrameTime = performance.now();
            this.animate(performance.now());
        }
    }

    getGradient(size, color) {
        const key = `${color.r}-${color.g}-${color.b}-${size}`;
        if (!this.gradientCache.has(key)) {
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3);
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            this.gradientCache.set(key, gradient);
        }
        return this.gradientCache.get(key);
    }

    animate(currentTime) {
        if (this.isPaused || !this.initialized || !this.canvas || !this.ctx) {
            this.animationFrameId = null;
            return;
        }

        // If UnifiedGameLoop is managing us, don't chain RAF calls
        const isManagedByGameLoop = window.gameLoop && window.gameLoop.isRunning;
        
        if (!isManagedByGameLoop) {
            // Only do frame skipping if we're managing our own loop
            const elapsed = currentTime - this.lastFrameTime;
            if (elapsed < this.frameInterval) {
                this.animationFrameId = requestAnimationFrame(this.animate);
                return;
            }
            this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
        }

        let deltaTime = currentTime - this.lastTime;
        if (isNaN(deltaTime) || deltaTime <= 0 || deltaTime > 100) {
            deltaTime = 16;
        }
        this.lastTime = currentTime;

        // Clear canvas
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.globalCompositeOperation = 'lighter';

        // Update and draw sparkles
        this.sparkles.forEach(sparkle => {
            if (!sparkle.active) return;
            
            // Update position using velocity (from pool) or angle/speed (legacy)
            if (sparkle.vx !== undefined && sparkle.vy !== undefined) {
                sparkle.x += sparkle.vx;
                sparkle.y += sparkle.vy;
            } else {
                // Legacy support
                sparkle.x += Math.cos(sparkle.angle) * sparkle.speed;
                sparkle.y += Math.sin(sparkle.angle) * sparkle.speed;
            }

            // Wrap around
            if (sparkle.x < 0) {
                sparkle.x = this.canvas.width;
                if (sparkle.vx !== undefined) sparkle.vx = Math.abs(sparkle.vx);
            }
            if (sparkle.x > this.canvas.width) {
                sparkle.x = 0;
                if (sparkle.vx !== undefined) sparkle.vx = -Math.abs(sparkle.vx);
            }
            if (sparkle.y < 0) {
                sparkle.y = this.canvas.height;
                if (sparkle.vy !== undefined) sparkle.vy = Math.abs(sparkle.vy);
            }
            if (sparkle.y > this.canvas.height) {
                sparkle.y = 0;
                if (sparkle.vy !== undefined) sparkle.vy = -Math.abs(sparkle.vy);
            }

            // Update twinkle
            sparkle.twinkle += deltaTime * 0.002;
            if (sparkle.twinkle > Math.PI * 4) sparkle.twinkle -= Math.PI * 4;

            // Calculate opacity
            const twinkleOpacity = Math.sin(sparkle.twinkle) * 0.3 + 0.7;
            let currentOpacity = sparkle.opacity * twinkleOpacity;
            currentOpacity = Math.max(0, Math.min(1, currentOpacity));

            // Draw
            if (sparkle.size > 1.2) {
                this.ctx.save();
                this.ctx.translate(sparkle.x, sparkle.y);
                this.ctx.globalAlpha = currentOpacity;
                this.ctx.fillStyle = this.getGradient(sparkle.size, sparkle.color);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, sparkle.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            this.ctx.fillStyle = `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${currentOpacity})`;
            this.ctx.beginPath();
            this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalCompositeOperation = 'source-over';

        // Only continue RAF loop if not managed by UnifiedGameLoop
        // Reuse isManagedByGameLoop variable declared earlier in this function
        if (!isManagedByGameLoop) {
            this.animationFrameId = requestAnimationFrame(this.animate);
        } else {
            this.animationFrameId = null; // UnifiedGameLoop will call us
        }
    }

    start() {
        // If UnifiedGameLoop is active, don't start our own RAF loop
        // The UnifiedGameLoop will call animate() via visual updates
        const isManagedByGameLoop = window.gameLoop && window.gameLoop.isRunning;
        if (isManagedByGameLoop) {
            this.lastTime = performance.now();
            this.lastFrameTime = performance.now();
            return; // UnifiedGameLoop will handle animation
        }
        
        // Fallback: start our own RAF loop if UnifiedGameLoop not available
        if (!this.isPaused && !document.hidden && !this.animationFrameId) {
            this.lastTime = performance.now();
            this.lastFrameTime = performance.now();
            this.animate(performance.now());
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    disable() {
        this.stop();
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }

    enable() {
        if (this.canvas) {
            this.canvas.style.display = 'block';
            this.start();
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.gradientCache.clear();
        
        // Release all particles back to pool
        if (this.particlePool && this.sparkles.length > 0) {
            this.particlePool.releaseAll(this.sparkles);
            this.sparkles = [];
        }
    }
}
