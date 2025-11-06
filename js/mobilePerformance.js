/**
 * Mobile Performance System
 * Implements performance optimizations for mobile devices
 */

class MobilePerformanceManager {
    constructor() {
        this.performanceMode = 'auto';
        this.isLowEndDevice = false;
        this.init();
    }
    
    init() {
        // Detect device performance
        this.detectDevicePerformance();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Apply initial optimizations
        this.applyOptimizations();
    }
    
    /**
     * Detect device performance capabilities
     */
    detectDevicePerformance() {
        // Check hardware concurrency (CPU cores)
        const cores = navigator.hardwareConcurrency || 2;
        
        // Check device memory (if available)
        const memory = navigator.deviceMemory || 4;
        
        // Check connection type (if available)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        
        // Determine if low-end device
        this.isLowEndDevice = cores <= 2 || memory <= 2 || isSlowConnection;
        
        // Auto-enable performance mode on low-end devices
        if (this.isLowEndDevice) {
            this.enablePerformanceMode();
        }
    }
    
    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 60;
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // If FPS drops below 30, enable performance mode
                if (fps < 30 && this.performanceMode !== 'high') {
                    this.enablePerformanceMode();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    /**
     * Enable performance mode
     */
    enablePerformanceMode() {
        this.performanceMode = 'low';
        document.body.classList.add('mobile-performance-mode');
        
        // Reduce animations
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.style.setProperty('--transition-duration', '0.1s');
        
        // Disable particle effects
        if (window.particleEffects) {
            window.particleEffects.disable();
        }
        
        // Reduce canvas quality
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            canvas.dataset.lowPerformance = 'true';
        });
        
        // Save preference
        localStorage.setItem('mobilePerformanceMode', 'low');
    }
    
    /**
     * Disable performance mode
     */
    disablePerformanceMode() {
        this.performanceMode = 'high';
        document.body.classList.remove('mobile-performance-mode');
        
        // Restore animations
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--transition-duration');
        
        // Enable particle effects
        if (window.particleEffects) {
            window.particleEffects.enable();
        }
        
        // Restore canvas quality
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            canvas.dataset.lowPerformance = 'false';
        });
        
        // Save preference
        localStorage.setItem('mobilePerformanceMode', 'high');
    }
    
    /**
     * Apply performance optimizations
     */
    applyOptimizations() {
        const savedMode = localStorage.getItem('mobilePerformanceMode');
        if (savedMode === 'low') {
            this.enablePerformanceMode();
        } else if (savedMode === 'high') {
            this.disablePerformanceMode();
        } else if (this.isLowEndDevice) {
            this.enablePerformanceMode();
        }
    }
    
    /**
     * Get current performance mode
     * @returns {string} Performance mode
     */
    getPerformanceMode() {
        return this.performanceMode;
    }
}

// Create global instance
const mobilePerformanceManager = new MobilePerformanceManager();

// Global functions for compatibility
window.enableMobilePerformanceMode = () => {
    mobilePerformanceManager.enablePerformanceMode();
};

window.disableMobilePerformanceMode = () => {
    mobilePerformanceManager.disablePerformanceMode();
};

export default mobilePerformanceManager;

