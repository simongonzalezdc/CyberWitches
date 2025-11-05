import { handleError, safeFunction } from './errorHandler.js';

/**
 * Particle Effects System - Manages visual particle effects for game feedback
 * Provides various particle types and animations
 */

/**
 * @typedef {Object} Particle
 * @property {string} id - Unique particle identifier
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} vx - X velocity
 * @property {number} vy - Y velocity
 * @property {number} size - Particle size
 * @property {string} color - Particle color
 * @property {number} alpha - Particle opacity (0-1)
 * @property {number} lifetime - Particle lifetime in milliseconds
 * @property {number} age - Current age in milliseconds
 * @property {string} type - Particle type
 * @property {Object} properties - Additional particle properties
 */

/**
 * @typedef {Object} ParticleEffect
 * @property {string} id - Unique effect identifier
 * @property {string} type - Effect type
 * @property {number} x - Effect X position
 * @property {number} y - Effect Y position
 * @property {Object} config - Effect configuration
 * @property {Particle[]} particles - Array of particles in effect
 * @property {boolean} isActive - Whether effect is active
 * @property {number} startTime - Effect start time
 * @property {number} duration - Effect duration in milliseconds
 */

/**
 * Particle Effects System class
 */
export class ParticleEffectsSystem {
    /**
     * Create a new ParticleEffectsSystem instance
     */
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.effects = new Map();
        this.particles = [];
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        
        // Performance settings
        this.maxParticles = 500;
        this.maxEffects = 20;
        this.isLowPerformanceMode = false;
        
        // Effect templates
        this.effectTemplates = new Map();
        this.initializeEffectTemplates();
        
        // Particle pool for performance
        this.particlePool = [];
        this.poolSize = 100;
        
        // Initialize particle pool
        this.initializeParticlePool();
    }
    
    /**
     * Initialize the particle system
     * @param {HTMLCanvasElement} canvas - Canvas element for rendering
     */
    initialize(canvas) {
        try {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            if (!this.ctx) {
                throw new Error('Could not get 2D context from canvas');
            }
            
            this.resizeCanvas();
            this.startAnimationLoop();
            
            // Listen for resize events
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
            
            // Detect performance capabilities
            this.detectPerformanceCapabilities();
            
            this.isRunning = true;
        } catch (error) {
            handleError(error, 'particleEffectsInitialize');
        }
    }
    
    /**
     * Resize canvas to match window
     * @private
     */
    resizeCanvas() {
        if (!this.canvas) {
            return;
        }
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Detect performance capabilities and adjust settings
     * @private
     */
    detectPerformanceCapabilities() {
        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isLowPerformanceMode = true;
            this.maxParticles = 100;
            return;
        }
        
        // Check device memory if available
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            this.isLowPerformanceMode = true;
            this.maxParticles = 200;
            return;
        }
        
        // Check for mobile device
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.isLowPerformanceMode = true;
            this.maxParticles = 150;
        }
    }
    
    /**
     * Initialize particle pool for performance
     * @private
     */
    initializeParticlePool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.particlePool.push(this.createEmptyParticle());
        }
    }
    
    /**
     * Create an empty particle object
     * @returns {Particle} Empty particle
     * @private
     */
    createEmptyParticle() {
        return {
            id: '',
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 1,
            color: '#ffffff',
            alpha: 1,
            lifetime: 1000,
            age: 0,
            type: 'basic',
            properties: {}
        };
    }
    
    /**
     * Get a particle from the pool
     * @returns {Particle} Particle from pool
     * @private
     */
    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        
        return this.createEmptyParticle();
    }
    
    /**
     * Return a particle to the pool
     * @param {Particle} particle - Particle to return
     * @private
     */
    returnParticleToPool(particle) {
        if (this.particlePool.length < this.poolSize) {
            // Reset particle properties
            particle.age = 0;
            particle.alpha = 1;
            this.particlePool.push(particle);
        }
    }
    
    /**
     * Initialize effect templates
     * @private
     */
    initializeEffectTemplates() {
        // Spell casting effect
        this.effectTemplates.set('spell_cast', {
            particleCount: 20,
            particleLifetime: 1500,
            colors: ['#9333ea', '#a855f7', '#c084fc', '#e879f9'],
            speed: { min: 50, max: 150 },
            size: { min: 2, max: 6 },
            gravity: 0.1,
            spread: Math.PI / 4,
            fadeOut: true,
            rotation: true
        });
        
        // Achievement unlock effect
        this.effectTemplates.set('achievement', {
            particleCount: 50,
            particleLifetime: 3000,
            colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
            speed: { min: 30, max: 100 },
            size: { min: 3, max: 8 },
            gravity: -0.05,
            spread: Math.PI * 2,
            fadeOut: true,
            rotation: true,
            sparkle: true
        });
        
        // Resource collection effect
        this.effectTemplates.set('resource_collect', {
            particleCount: 15,
            particleLifetime: 1000,
            colors: ['#10b981', '#059669', '#047857', '#065f46'],
            speed: { min: 20, max: 80 },
            size: { min: 1, max: 4 },
            gravity: 0,
            spread: Math.PI / 6,
            fadeOut: true,
            rotation: false
        });
        
        // Workstation craft effect
        this.effectTemplates.set('workstation_craft', {
            particleCount: 30,
            particleLifetime: 2000,
            colors: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
            speed: { min: 40, max: 120 },
            size: { min: 2, max: 5 },
            gravity: 0.05,
            spread: Math.PI / 3,
            fadeOut: true,
            rotation: true,
            trail: true
        });
        
        // Level up effect
        this.effectTemplates.set('level_up', {
            particleCount: 40,
            particleLifetime: 2500,
            colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'],
            speed: { min: 60, max: 150 },
            size: { min: 3, max: 7 },
            gravity: -0.1,
            spread: Math.PI * 2,
            fadeOut: true,
            rotation: true,
            rainbow: true
        });
        
        // Coven ritual effect
        this.effectTemplates.set('ritual', {
            particleCount: 60,
            particleLifetime: 4000,
            colors: ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
            speed: { min: 20, max: 80 },
            size: { min: 2, max: 6 },
            gravity: 0,
            spread: Math.PI / 2,
            fadeOut: true,
            rotation: true,
            spiral: true
        });
        
        // Click effect
        this.effectTemplates.set('click', {
            particleCount: 8,
            particleLifetime: 800,
            colors: ['#ffffff', '#e5e7eb', '#d1d5db'],
            speed: { min: 100, max: 200 },
            size: { min: 1, max: 3 },
            gravity: 0,
            spread: Math.PI / 8,
            fadeOut: true,
            rotation: false
        });
        
        // Error effect
        this.effectTemplates.set('error', {
            particleCount: 12,
            particleLifetime: 1200,
            colors: ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
            speed: { min: 30, max: 90 },
            size: { min: 2, max: 5 },
            gravity: 0.05,
            spread: Math.PI / 3,
            fadeOut: true,
            rotation: false,
            shake: true
        });
    }
    
    /**
     * Start the animation loop
     * @private
     */
    startAnimationLoop() {
        const animate = (currentTime) => {
            if (!this.isRunning) {
                return;
            }
            
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
        this.lastFrameTime = performance.now();
    }
    
    /**
     * Stop the animation loop
     */
    stopAnimationLoop() {
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Update all particles and effects
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @private
     */
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Update effects
        for (const [effectId, effect] of this.effects) {
            if (!effect.isActive) {
                continue;
            }
            
            // Check if effect should end
            if (Date.now() - effect.startTime > effect.duration) {
                effect.isActive = false;
                continue;
            }
            
            // Update effect-specific logic
            this.updateEffect(effect, dt);
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update particle physics
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.age += deltaTime;
            
            // Apply gravity if specified
            if (particle.properties.gravity) {
                particle.vy += particle.properties.gravity * dt;
            }
            
            // Update particle alpha based on lifetime
            if (particle.properties.fadeOut) {
                particle.alpha = Math.max(0, 1 - (particle.age / particle.lifetime));
            }
            
            // Remove dead particles
            if (particle.age >= particle.lifetime || particle.alpha <= 0) {
                this.particles.splice(i, 1);
                this.returnParticleToPool(particle);
            }
        }
        
        // Clean up inactive effects
        for (const [effectId, effect] of this.effects) {
            if (!effect.isActive) {
                this.effects.delete(effectId);
            }
        }
    }
    
    /**
     * Update effect-specific logic
     * @param {ParticleEffect} effect - Effect to update
     * @param {number} dt - Delta time
     * @private
     */
    updateEffect(effect, dt) {
        const config = effect.config;
        const progress = (Date.now() - effect.startTime) / effect.duration;
        
        // Update effect based on type
        switch (effect.type) {
            case 'ritual':
                if (config.spiral) {
                    this.updateSpiralEffect(effect, progress);
                }
                break;
            case 'level_up':
                if (config.rainbow) {
                    this.updateRainbowEffect(effect, progress);
                }
                break;
            case 'error':
                if (config.shake) {
                    this.updateShakeEffect(effect, progress);
                }
                break;
        }
    }
    
    /**
     * Update spiral effect
     * @param {ParticleEffect} effect - Effect to update
     * @param {number} progress - Effect progress (0-1)
     * @private
     */
    updateSpiralEffect(effect, progress) {
        const angle = progress * Math.PI * 4;
        const radius = 50 * (1 - progress);
        
        for (const particle of effect.particles) {
            const spiralAngle = angle + particle.properties.spiralOffset || 0;
            particle.x = effect.x + Math.cos(spiralAngle) * radius;
            particle.y = effect.y + Math.sin(spiralAngle) * radius;
        }
    }
    
    /**
     * Update rainbow effect
     * @param {ParticleEffect} effect - Effect to update
     * @param {number} progress - Effect progress (0-1)
     * @private
     */
    updateRainbowEffect(effect, progress) {
        const hue = progress * 360;
        
        for (const particle of effect.particles) {
            if (particle.properties.rainbowIndex !== undefined) {
                const particleHue = (hue + particle.properties.rainbowIndex * 30) % 360;
                particle.color = `hsl(${particleHue}, 70%, 50%)`;
            }
        }
    }
    
    /**
     * Update shake effect
     * @param {ParticleEffect} effect - Effect to update
     * @param {number} progress - Effect progress (0-1)
     * @private
     */
    updateShakeEffect(effect, progress) {
        const intensity = 10 * (1 - progress);
        
        for (const particle of effect.particles) {
            particle.x += (Math.random() - 0.5) * intensity;
            particle.y += (Math.random() - 0.5) * intensity;
        }
    }
    
    /**
     * Render all particles and effects
     * @private
     */
    render() {
        if (!this.ctx) {
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set composite operation for better blending
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Render particles
        for (const particle of this.particles) {
            this.renderParticle(particle);
        }
    }
    
    /**
     * Render a single particle
     * @param {Particle} particle - Particle to render
     * @private
     */
    renderParticle(particle) {
        this.ctx.save();
        
        // Set particle properties
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        
        // Apply rotation if needed
        if (particle.properties.rotation) {
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.age * 0.001);
            this.ctx.translate(-particle.x, -particle.y);
        }
        
        // Render particle based on type
        switch (particle.type) {
            case 'sparkle':
                this.renderSparkle(particle);
                break;
            case 'trail':
                this.renderTrail(particle);
                break;
            default:
                this.renderBasic(particle);
                break;
        }
        
        this.ctx.restore();
    }
    
    /**
     * Render basic particle
     * @param {Particle} particle - Particle to render
     * @private
     */
    renderBasic(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Render sparkle particle
     * @param {Particle} particle - Particle to render
     * @private
     */
    renderSparkle(particle) {
        const spikes = 4;
        const outerRadius = particle.size * 2;
        const innerRadius = particle.size;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = particle.x + Math.cos(angle) * radius;
            const y = particle.y + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * Render trail particle
     * @param {Particle} particle - Particle to render
     * @private
     */
    renderTrail(particle) {
        if (!particle.properties.trail) {
            this.renderBasic(particle);
            return;
        }
        
        const trailLength = 5;
        const trailPoints = particle.properties.trailPoints || [];
        
        // Add current position to trail
        trailPoints.push({ x: particle.x, y: particle.y });
        
        // Limit trail length
        if (trailPoints.length > trailLength) {
            trailPoints.shift();
        }
        
        // Store trail points
        particle.properties.trailPoints = trailPoints;
        
        // Draw trail
        this.ctx.beginPath();
        this.ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
        
        for (let i = 1; i < trailPoints.length; i++) {
            const point = trailPoints[i];
            const alpha = (i / trailPoints.length) * particle.alpha;
            this.ctx.globalAlpha = alpha;
            this.ctx.lineTo(point.x, point.y);
        }
        
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = particle.size;
        this.ctx.stroke();
        
        // Draw particle at current position
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Create a particle effect
     * @param {string} type - Effect type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Additional options
     * @returns {string} Effect ID
     */
    createEffect(type, x, y, options = {}) {
        if (!this.isRunning || this.isLowPerformanceMode) {
            return null;
        }
        
        try {
            const template = this.effectTemplates.get(type);
            if (!template) {
                console.warn(`Unknown particle effect type: ${type}`);
                return null;
            }
            
            // Check if we have too many effects
            if (this.effects.size >= this.maxEffects) {
                return null;
            }
            
            const effectId = 'effect_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            const config = { ...template, ...options };
            
            const effect = {
                id: effectId,
                type: type,
                x: x,
                y: y,
                config: config,
                particles: [],
                isActive: true,
                startTime: Date.now(),
                duration: config.duration || 2000
            };
            
            // Create particles for effect
            this.createParticlesForEffect(effect);
            
            this.effects.set(effectId, effect);
            
            return effectId;
        } catch (error) {
            handleError(error, 'createParticleEffect');
            return null;
        }
    }
    
    /**
     * Create particles for an effect
     * @param {ParticleEffect} effect - Effect to create particles for
     * @private
     */
    createParticlesForEffect(effect) {
        const config = effect.config;
        const particleCount = Math.min(config.particleCount, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            
            // Set basic properties
            particle.id = 'particle_' + Date.now() + '_' + i;
            particle.x = effect.x;
            particle.y = effect.y;
            particle.lifetime = config.particleLifetime;
            particle.age = 0;
            particle.alpha = 1;
            
            // Set velocity based on spread
            const angle = (Math.random() - 0.5) * config.spread;
            const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // Set size
            particle.size = config.size.min + Math.random() * (config.size.max - config.size.min);
            
            // Set color
            if (config.colors && config.colors.length > 0) {
                particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            }
            
            // Set type
            particle.type = config.sparkle ? 'sparkle' : (config.trail ? 'trail' : 'basic');
            
            // Set additional properties
            particle.properties = {
                gravity: config.gravity || 0,
                fadeOut: config.fadeOut !== false,
                rotation: config.rotation || false,
                sparkle: config.sparkle || false,
                trail: config.trail || false,
                spiralOffset: config.spiral ? (i / particleCount) * Math.PI * 2 : undefined,
                rainbowIndex: config.rainbow ? i : undefined,
                trailPoints: config.trail ? [] : undefined
            };
            
            effect.particles.push(particle);
            this.particles.push(particle);
        }
    }
    
    /**
     * Create a spell casting effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createSpellCastEffect(x, y) {
        return this.createEffect('spell_cast', x, y);
    }
    
    /**
     * Create an achievement unlock effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createAchievementEffect(x, y) {
        return this.createEffect('achievement', x, y);
    }
    
    /**
     * Create a resource collection effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createResourceCollectEffect(x, y) {
        return this.createEffect('resource_collect', x, y);
    }
    
    /**
     * Create a workstation craft effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createWorkstationCraftEffect(x, y) {
        return this.createEffect('workstation_craft', x, y);
    }
    
    /**
     * Create a level up effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createLevelUpEffect(x, y) {
        return this.createEffect('level_up', x, y);
    }
    
    /**
     * Create a coven ritual effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createRitualEffect(x, y) {
        return this.createEffect('ritual', x, y);
    }
    
    /**
     * Create a click effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createClickEffect(x, y) {
        return this.createEffect('click', x, y);
    }
    
    /**
     * Create an error effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Effect ID
     */
    createErrorEffect(x, y) {
        return this.createEffect('error', x, y);
    }
    
    /**
     * Stop an effect
     * @param {string} effectId - Effect ID to stop
     */
    stopEffect(effectId) {
        const effect = this.effects.get(effectId);
        if (effect) {
            effect.isActive = false;
        }
    }
    
    /**
     * Stop all effects
     */
    stopAllEffects() {
        for (const effect of this.effects.values()) {
            effect.isActive = false;
        }
    }
    
    /**
     * Get system statistics
     * @returns {Object} System statistics
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            activeEffects: this.effects.size,
            activeParticles: this.particles.length,
            maxParticles: this.maxParticles,
            maxEffects: this.maxEffects,
            isLowPerformanceMode: this.isLowPerformanceMode,
            particlePoolSize: this.particlePool.length
        };
    }
    
    /**
     * Set performance mode
     * @param {boolean} isLowPerformance - Whether to use low performance mode
     */
    setPerformanceMode(isLowPerformance) {
        this.isLowPerformanceMode = isLowPerformance;
        
        if (isLowPerformance) {
            this.maxParticles = 100;
            this.stopAllEffects();
        } else {
            this.maxParticles = 500;
        }
    }
    
    /**
     * Enable particle effects system
     */
    enable() {
        this.isRunning = true;
        if (this.canvas) {
            this.canvas.style.display = 'block';
        }
        if (!this.animationId && this.canvas) {
            this.startAnimationLoop();
        }
    }
    
    /**
     * Disable particle effects system
     */
    disable() {
        this.isRunning = false;
        this.stopAllEffects();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }
}

// Create global particle effects instance
export const particleEffects = new ParticleEffectsSystem();