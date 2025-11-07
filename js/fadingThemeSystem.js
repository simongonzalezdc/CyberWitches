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
            particlesEnabled: true,
            indicatorsEnabled: true
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
        } catch (error) {
            console.error('Failed to load fading theme settings:', error);
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
        
        // Create particle system (will be initialized when Tier 3+ is reached)
        this.particleSystem = {
            particles: [],
            enabled: false,
            maxParticles: 15,
            spawnRate: 2000, // Spawn a particle every 2 seconds
            spawnInterval: null,
            updateInterval: null
        };
        
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
        
        // Particles: Available in Tier 3+
        if (tier >= 3 && this.settings.particlesEnabled) {
            this.enableParticles();
        } else {
            this.disableParticles();
        }
        
        // Indicators: Available in Tier 1+
        if (tier >= 1 && this.settings.indicatorsEnabled) {
            this.enableIndicators();
        } else {
            this.disableIndicators();
        }
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
     * Spawn a new particle
     */
    spawnParticle() {
        // Check tier before spawning
        const tier = this.designTierSystem?.currentTier || 0;
        if (tier < 3) return; // Only spawn in Tier 3+
        
        const particle = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0.6,
            size: 2 + Math.random() * 2,
            fadeRate: 0.01 + Math.random() * 0.02,
            element: document.createElement('div')
        };
        
        particle.element.className = 'fading-particle';
        particle.element.style.cssText = `
            position: fixed;
            left: ${particle.x}px;
            top: ${particle.y}px;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: radial-gradient(circle, rgba(255, 45, 170, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            opacity: ${particle.opacity};
        `;
        
        document.body.appendChild(particle.element);
        this.particleSystem.particles.push(particle);
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
        
        // Particles toggle
        const particlesToggle = document.getElementById('fading-particles-toggle');
        if (particlesToggle) {
            particlesToggle.checked = this.settings.particlesEnabled;
            // Remove existing listeners
            const newParticlesToggle = particlesToggle.cloneNode(true);
            particlesToggle.parentNode.replaceChild(newParticlesToggle, particlesToggle);
            
            newParticlesToggle.addEventListener('change', (e) => {
                this.settings.particlesEnabled = e.target.checked;
                this.saveSettings();
                const tier = this.designTierSystem?.currentTier || 0;
                if (tier >= 3 && this.settings.particlesEnabled) {
                    this.enableParticles();
                } else {
                    this.disableParticles();
                }
                // Update toggle disabled state
                this.updateToggleStates();
            });
        }
        
        // Indicators toggle
        const indicatorsToggle = document.getElementById('fading-indicators-toggle');
        if (indicatorsToggle) {
            indicatorsToggle.checked = this.settings.indicatorsEnabled;
            // Remove existing listeners
            const newIndicatorsToggle = indicatorsToggle.cloneNode(true);
            indicatorsToggle.parentNode.replaceChild(newIndicatorsToggle, indicatorsToggle);
            
            newIndicatorsToggle.addEventListener('change', (e) => {
                this.settings.indicatorsEnabled = e.target.checked;
                this.saveSettings();
                const tier = this.designTierSystem?.currentTier || 0;
                if (tier >= 1 && this.settings.indicatorsEnabled) {
                    this.enableIndicators();
                } else {
                    this.disableIndicators();
                }
                // Update toggle disabled state
                this.updateToggleStates();
            });
        }
        
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
        
        // Particles: Available in Tier 3+
        const particlesToggle = document.getElementById('fading-particles-toggle');
        if (particlesToggle) {
            particlesToggle.disabled = tier < 3;
            if (tier < 3) {
                particlesToggle.checked = false;
                this.settings.particlesEnabled = false;
                this.saveSettings();
            }
        }
        
        // Indicators: Available in Tier 1+
        const indicatorsToggle = document.getElementById('fading-indicators-toggle');
        if (indicatorsToggle) {
            indicatorsToggle.disabled = tier < 1;
            if (tier < 1) {
                indicatorsToggle.checked = false;
                this.settings.indicatorsEnabled = false;
                this.saveSettings();
            }
        }
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

