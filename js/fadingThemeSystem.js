/**
 * Fading Theme Visual Effects System
 * Implements visual effects that represent "The Fading" theme
 * Respects design tier rules and can be toggled in settings
 */

export class FadingThemeSystem {
    constructor(gameState, designTierSystem) {
        this.gameState = gameState;
        this.designTierSystem = designTierSystem;
        
        // Settings state (loaded from localStorage)
        this.settings = {
            gradientEnabled: true,
            particlesEnabled: false, // Particle effects disabled
            indicatorsEnabled: false // Element fade indicators disabled
        };
        
        // Effect elements
        this.gradientOverlay = null;
        this.particleSystem = null;
        this.indicatorElements = new Map();
        
        // Load settings
        this.loadSettings();
        
        // Initialize effects
        this.init();
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('fadingThemeSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
            // Force particles to be disabled (removed from background)
            this.settings.particlesEnabled = false;
            // Force indicators to be disabled (removed)
            this.settings.indicatorsEnabled = false;
        } catch (error) {
            console.error('Failed to load fading theme settings:', error);
            // Ensure particles are disabled even on error
            this.settings.particlesEnabled = false;
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('fadingThemeSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save fading theme settings:', error);
        }
    }
    
    /**
     * Initialize the fading theme system
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }
        
        // Create gradient overlay
        this.createGradientOverlay();
        
        // Create particle system (disabled - particles removed from background)
        this.particleSystem = {
            particles: [],
            enabled: false,
            maxParticles: 15,
            spawnRate: 2000,
            spawnInterval: null,
            updateInterval: null
        };
        
        // Clean up any existing particles in the DOM
        this.cleanupExistingParticles();
        
        // Ensure particles are disabled
        this.disableParticles();
        
        // Create element indicators
        this.createElementIndicators();
        
        // Apply current tier
        const currentTier = this.designTierSystem?.currentTier || 0;
        this.updateForTier(currentTier);
        
        // Set up settings toggles (with delay to ensure DOM is ready)
        setTimeout(() => {
            this.setupSettingsToggles();
        }, 100);
    }
    
    /**
     * Create background gradient overlay
     */
    createGradientOverlay() {
        // Check if overlay already exists
        let overlay = document.getElementById('fading-gradient-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'fading-gradient-overlay';
            overlay.className = 'fading-theme-overlay';
            document.body.appendChild(overlay);
        }
        this.gradientOverlay = overlay;
    }
    
    /**
     * Create element fade indicators
     */
    createElementIndicators() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createElementIndicators());
            return;
        }
        
        const elements = ['fire', 'water', 'air', 'crystal', 'aether'];
        elements.forEach(element => {
            const counter = document.getElementById(`element-counter-${element}`);
            if (counter) {
                // Check if indicator already exists
                let indicator = counter.querySelector('.element-fade-indicator');
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.className = `element-fade-indicator element-fade-indicator-${element}`;
                    indicator.style.cssText = `
                        width: 40px;
                        height: 3px;
                        background: currentColor;
                        border-radius: 2px;
                        opacity: 0.4;
                        margin-top: 4px;
                        pointer-events: none;
                        display: none;
                    `;
                    counter.appendChild(indicator);
                }
                this.indicatorElements.set(element, indicator);
            }
        });
    }
    
    /**
     * Update effects based on current design tier
     */
    updateForTier(tier) {
        // Update toggle states first
        this.updateToggleStates();
        
        // Gradient: Available in Tier 2+ (Tier 1 has zero gradients)
        if (tier >= 2 && this.settings.gradientEnabled) {
            this.enableGradient();
        } else {
            this.disableGradient();
        }
        
        // Particles: Disabled (removed from background)
        this.disableParticles();
        
        // Indicators: Disabled (removed)
        this.disableIndicators();
    }
    
    /**
     * Enable gradient overlay
     */
    enableGradient() {
        const tier = this.designTierSystem?.currentTier || 0;
        if (tier < 2) return; // Only enable in Tier 2+ (Tier 1 has zero gradients)
        
        if (!this.gradientOverlay) return;
        this.gradientOverlay.style.display = 'block';
        this.gradientOverlay.style.visibility = 'visible';
        this.gradientOverlay.style.opacity = '1';
    }
    
    /**
     * Disable gradient overlay
     */
    disableGradient() {
        if (!this.gradientOverlay) return;
        this.gradientOverlay.style.display = 'none';
        this.gradientOverlay.style.visibility = 'hidden';
        this.gradientOverlay.style.opacity = '0';
    }
    
    /**
     * Enable particle fade effect
     */
    enableParticles() {
        if (this.particleSystem.enabled) return;
        this.particleSystem.enabled = true;
        this.startParticleSystem();
    }
    
    /**
     * Disable particle fade effect
     */
    disableParticles() {
        this.particleSystem.enabled = false;
        
        // Clear intervals
        if (this.particleSystem.spawnInterval) {
            clearInterval(this.particleSystem.spawnInterval);
            this.particleSystem.spawnInterval = null;
        }
        if (this.particleSystem.updateInterval) {
            clearInterval(this.particleSystem.updateInterval);
            this.particleSystem.updateInterval = null;
        }
        
        // Remove all particles
        this.particleSystem.particles = [];
        this.updateParticleDisplay();
    }
    
    /**
     * Start particle system
     */
    startParticleSystem() {
        if (!this.particleSystem.enabled) return;
        
        // Clear any existing intervals
        if (this.particleSystem.spawnInterval) {
            clearInterval(this.particleSystem.spawnInterval);
        }
        if (this.particleSystem.updateInterval) {
            clearInterval(this.particleSystem.updateInterval);
        }
        
        // Spawn particles periodically
        this.particleSystem.spawnInterval = setInterval(() => {
            if (this.particleSystem.enabled && this.particleSystem.particles.length < this.particleSystem.maxParticles) {
                this.spawnParticle();
            }
        }, this.particleSystem.spawnRate);
        
        // Update particles
        this.particleSystem.updateInterval = setInterval(() => {
            if (this.particleSystem.enabled) {
                this.updateParticles();
            }
        }, 100); // Update every 100ms
    }
    
    /**
     * Spawn a new particle (DISABLED - particles removed from background)
     */
    spawnParticle() {
        // Particles are disabled - do nothing
        return;
    }
    
    /**
     * Update all particles
     */
    updateParticles() {
        if (!this.particleSystem.enabled) return;
        
        // Check tier before updating
        const tier = this.designTierSystem?.currentTier || 0;
        if (tier < 3) {
            // Tier too low, remove all particles
            this.disableParticles();
            return;
        }
        
        const particles = this.particleSystem.particles;
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.opacity -= particle.fadeRate;
            
            if (particle.opacity <= 0) {
                // Remove particle
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                particles.splice(i, 1);
            } else {
                // Update particle display
                if (particle.element) {
                    particle.element.style.opacity = particle.opacity;
                    particle.element.style.transform = `scale(${0.5 + particle.opacity * 0.5})`;
                }
            }
        }
    }
    
    /**
     * Update particle display (cleanup)
     */
    updateParticleDisplay() {
        this.particleSystem.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
    }
    
    /**
     * Clean up any existing particles in the DOM
     */
    cleanupExistingParticles() {
        // Remove all fading-particle elements from the DOM
        const existingParticles = document.querySelectorAll('.fading-particle');
        existingParticles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        // Clear particle array
        if (this.particleSystem) {
            this.particleSystem.particles = [];
        }
    }
    
    /**
     * Enable element fade indicators
     */
    enableIndicators() {
        const tier = this.designTierSystem?.currentTier || 0;
        if (tier < 1) return; // Only enable in Tier 1+
        
        this.indicatorElements.forEach((indicator, element) => {
            if (indicator) {
                // Set animation duration based on element
                const durations = {
                    fire: 2,      // Fastest fade
                    water: 3,
                    air: 2.5,
                    crystal: 4,   // Slowest fade
                    aether: 3.5
                };
                const duration = durations[element] || 3;
                
                indicator.style.animation = `elementFade ${duration}s ease-in-out infinite`;
                indicator.style.display = 'block';
            }
        });
    }
    
    /**
     * Disable element fade indicators
     */
    disableIndicators() {
        this.indicatorElements.forEach(indicator => {
            if (indicator) {
                indicator.style.display = 'none';
                indicator.style.animation = 'none';
            }
        });
    }
    
    /**
     * Set up settings toggle handlers
     */
    setupSettingsToggles() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSettingsToggles());
            return;
        }
        
        // Gradient toggle
        const gradientToggle = document.getElementById('fading-gradient-toggle');
        if (gradientToggle) {
            gradientToggle.checked = this.settings.gradientEnabled;
            // Remove existing listeners
            const newGradientToggle = gradientToggle.cloneNode(true);
            gradientToggle.parentNode.replaceChild(newGradientToggle, gradientToggle);
            
            newGradientToggle.addEventListener('change', (e) => {
                this.settings.gradientEnabled = e.target.checked;
                this.saveSettings();
                const tier = this.designTierSystem?.currentTier || 0;
                if (tier >= 2 && this.settings.gradientEnabled) {
                    this.enableGradient();
                } else {
                    this.disableGradient();
                }
                // Update toggle disabled state
                this.updateToggleStates();
            });
        }
        
        // Particles toggle removed - particle effects disabled
        
        // Indicators toggle removed - element fade indicators disabled
        
        // Update toggle states based on current tier
        this.updateToggleStates();
    }
    
    /**
     * Update toggle states based on current tier
     */
    updateToggleStates() {
        const tier = this.designTierSystem?.currentTier || 0;
        
        // Gradient: Available in Tier 2+ (Tier 1 has zero gradients)
        const gradientToggle = document.getElementById('fading-gradient-toggle');
        if (gradientToggle) {
            gradientToggle.disabled = tier < 2;
            if (tier < 2) {
                gradientToggle.checked = false;
                this.settings.gradientEnabled = false;
                this.saveSettings();
            }
        }
        
        // Particles: Disabled (removed from background)
        
        // Indicators: Disabled (removed)
    }
    
    /**
     * Trigger preserve effect (when casting or building)
     */
    triggerPreserveEffect() {
        // Brighten gradient briefly
        if (this.gradientOverlay && this.settings.gradientEnabled) {
            this.gradientOverlay.classList.add('preserved');
            setTimeout(() => {
                this.gradientOverlay.classList.remove('preserved');
            }, 2000);
        }
        
        // Brighten nearby particles
        if (this.particleSystem.enabled) {
            this.particleSystem.particles.forEach(particle => {
                if (particle.element) {
                    particle.element.classList.add('preserved');
                    setTimeout(() => {
                        particle.element.classList.remove('preserved');
                    }, 1500);
                }
            });
        }
    }
    
    /**
     * Cleanup on destroy
     */
    destroy() {
        this.disableParticles();
        if (this.gradientOverlay && this.gradientOverlay.parentNode) {
            this.gradientOverlay.parentNode.removeChild(this.gradientOverlay);
        }
        // Remove indicators
        this.indicatorElements.forEach(indicator => {
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        });
        this.indicatorElements.clear();
    }
}

