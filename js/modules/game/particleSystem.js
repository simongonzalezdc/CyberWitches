/**
 * Particle System
 * Manages background sparkles and other particle effects
 * Optimized for performance with visibility detection and cleanup
 */

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

        // Initialize sparkles
        this.createSparkles(sparkleCount);

        // Set initial size
        this.handleResize();

        // Event listeners
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Start animation
        this.start();

        this.initialized = true;
        this.canvas.dataset.initialized = 'true';
    }

    createSparkles(count) {
        this.sparkles = [];
        for (let i = 0; i < count; i++) {
            this.sparkles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                angle: Math.random() * Math.PI * 2,
                twinkle: Math.random() * Math.PI * 2,
                color: [
                    { r: 255, g: 255, b: 255 }, // White
                    { r: 255, g: 45, b: 170 },  // Pink
                    { r: 34, g: 227, b: 255 },  // Cyan
                    { r: 255, g: 219, b: 110 }, // Yellow
                    { r: 60, g: 227, b: 197 }   // Teal
                ][Math.floor(Math.random() * 5)],
                opacity: Math.random() * 0.5 + 0.3
            });
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
        if (!this.isPaused && !this.animationFrameId) {
            this.lastTime = performance.now();
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
        if (this.isPaused) {
            this.animationFrameId = null;
            return;
        }

        const elapsed = currentTime - this.lastFrameTime;

        // Skip frames to maintain target FPS
        if (elapsed < this.frameInterval) {
            this.animationFrameId = requestAnimationFrame(this.animate);
            return;
        }

        this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

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
            // Update position
            sparkle.x += Math.cos(sparkle.angle) * sparkle.speed;
            sparkle.y += Math.sin(sparkle.angle) * sparkle.speed;

            // Wrap around
            if (sparkle.x < 0) sparkle.x = this.canvas.width;
            if (sparkle.x > this.canvas.width) sparkle.x = 0;
            if (sparkle.y < 0) sparkle.y = this.canvas.height;
            if (sparkle.y > this.canvas.height) sparkle.y = 0;

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

        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    start() {
        if (!this.isPaused && !document.hidden) {
            this.lastTime = performance.now();
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
    }
}
