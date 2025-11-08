/**
 * Sustainable Design System
 * Implements energy optimization and sustainable design practices
 */

class SustainableDesignManager {
    constructor() {
        this.lowPowerMode = false;
        this.animationQuality = 'high';
        this.init();
    }
    
    init() {
        // Load saved preferences
        this.loadPreferences();
        
        // Set up battery monitoring
        this.setupBatteryMonitoring();
        
        // Apply initial settings
        this.applySettings();
    }
    
    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('sustainableDesign');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.lowPowerMode = prefs.lowPowerMode || false;
                this.animationQuality = prefs.animationQuality || 'high';
            }
        } catch (error) {
            console.error('Failed to load sustainable design preferences:', error);
        }
    }
    
    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('sustainableDesign', JSON.stringify({
                lowPowerMode: this.lowPowerMode,
                animationQuality: this.animationQuality
            }));
        } catch (error) {
            console.error('Failed to save sustainable design preferences:', error);
        }
    }
    
    /**
     * Set up battery monitoring
     */
    setupBatteryMonitoring() {
        // Check if Battery API is available
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                // Monitor battery level
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2 && !this.lowPowerMode) {
                        // Auto-enable low power mode when battery is low
                        this.enableLowPowerMode();
                        if (window.showNotification) {
                            window.showNotification('Low battery detected. Low Power Mode enabled.', 'info');
                        }
                    }
                });
                
                // Monitor charging status
                battery.addEventListener('chargingchange', () => {
                    if (battery.charging && this.lowPowerMode) {
                        // Optionally disable low power mode when charging
                        // this.disableLowPowerMode();
                    }
                });
            }).catch((error) => {
                console.warn('Battery API not available:', error);
            });
        }
    }
    
    /**
     * Enable low power mode
     */
    enableLowPowerMode() {
        this.lowPowerMode = true;
        this.animationQuality = 'low';
        this.applySettings();
        this.savePreferences();
    }
    
    /**
     * Disable low power mode
     */
    disableLowPowerMode() {
        this.lowPowerMode = false;
        this.animationQuality = 'high';
        this.applySettings();
        this.savePreferences();
    }
    
    /**
     * Set animation quality
     * @param {string} quality - 'low', 'medium', 'high'
     */
    setAnimationQuality(quality) {
        this.animationQuality = quality;
        this.applySettings();
        this.savePreferences();
    }
    
    /**
     * Apply sustainable design settings
     */
    applySettings() {
        // Reduce animations in low power mode
        if (this.lowPowerMode || this.animationQuality === 'low') {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            document.documentElement.style.setProperty('--transition-duration', '0.1s');
            document.documentElement.classList.add('low-power-mode');
            
            // Disable particle effects
            if (window.particleEffects) {
                window.particleEffects.disable();
            }
            
            // Reduce canvas animations
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Reduce frame rate
                    canvas.dataset.lowPower = 'true';
                }
            });
        } else if (this.animationQuality === 'medium') {
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
            document.documentElement.style.setProperty('--transition-duration', '0.2s');
            document.documentElement.classList.remove('low-power-mode');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
            document.documentElement.style.removeProperty('--transition-duration');
            document.documentElement.classList.remove('low-power-mode');
            
            // Particle effects disabled for performance
            if (window.particleEffects) {
                window.particleEffects.disable();
            }
        }
        
        // Optimize dark mode for OLED (reduces power usage)
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Use true black for OLED efficiency
            document.documentElement.style.setProperty('--bg-dark', '#000000');
        }
    }
    
    /**
     * Monitor resource consumption
     */
    monitorResourceConsumption() {
        if ('performance' in window && 'memory' in performance) {
            const memory = performance.memory;
            const usedMB = memory.usedJSHeapSize / 1048576;
            const totalMB = memory.totalJSHeapSize / 1048576;
            
            // If memory usage is high, suggest low power mode
            if (usedMB / totalMB > 0.8 && !this.lowPowerMode) {
                console.warn('High memory usage detected. Consider enabling Low Power Mode.');
            }
        }
    }
    
    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return {
            lowPowerMode: this.lowPowerMode,
            animationQuality: this.animationQuality
        };
    }
}

// Create global instance
const sustainableDesignManager = new SustainableDesignManager();

// Global functions for compatibility
window.enableLowPowerMode = () => {
    sustainableDesignManager.enableLowPowerMode();
};

window.disableLowPowerMode = () => {
    sustainableDesignManager.disableLowPowerMode();
};

window.setAnimationQuality = (quality) => {
    sustainableDesignManager.setAnimationQuality(quality);
};

export default sustainableDesignManager;

