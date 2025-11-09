/**
 * Core Web Vitals Optimization
 * Implements optimizations for LCP, FID, CLS, and other Web Vitals
 */

class CoreWebVitalsOptimizer {
    constructor() {
        this.metrics = {
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null
        };
        this.init();
    }
    
    init() {
        // Measure Core Web Vitals
        this.measureLCP();
        this.measureFID();
        this.measureCLS();
        this.measureFCP();
        this.measureTTFB();
        
        // Optimize for better scores
        this.optimizeLCP();
        this.optimizeFID();
        this.optimizeCLS();
    }
    
    /**
     * Measure Largest Contentful Paint (LCP)
     */
    measureLCP() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
                    
                    // Log if LCP is poor (>2.5s) - only log once per session to reduce spam
                    if (this.metrics.lcp > 2500 && !this._lcpLogged) {
                        console.warn('LCP is poor:', this.metrics.lcp, 'ms', '- Largest Contentful Paint is slow (expected for game with many assets)');
                        this._lcpLogged = true;
                    }
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.error('LCP measurement failed:', e);
            }
        }
    }
    
    /**
     * Measure First Input Delay (FID)
     */
    measureFID() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                        
                        // Log if FID is poor (>100ms)
                        if (this.metrics.fid > 100) {
                            console.warn('FID is poor:', this.metrics.fid, 'ms');
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.error('FID measurement failed:', e);
            }
        }
    }
    
    /**
     * Measure Cumulative Layout Shift (CLS)
     */
    measureCLS() {
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.metrics.cls = clsValue;
                    
                    // Log if CLS is poor (>0.1) - only log once per session to reduce spam
                    if (this.metrics.cls > 0.1 && !this._clsLogged) {
                        console.warn('CLS is poor:', this.metrics.cls.toFixed(4), '- Layout shifts detected (expected for dynamic game content)');
                        this._clsLogged = true;
                    }
                });
                
                observer.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.error('CLS measurement failed:', e);
            }
        }
    }
    
    /**
     * Measure First Contentful Paint (FCP)
     */
    measureFCP() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (entry.name === 'first-contentful-paint') {
                            this.metrics.fcp = entry.startTime;
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.error('FCP measurement failed:', e);
            }
        }
    }
    
    /**
     * Measure Time to First Byte (TTFB)
     */
    measureTTFB() {
        if ('performance' in window && 'timing' in performance) {
            const timing = performance.timing;
            this.metrics.ttfb = timing.responseStart - timing.requestStart;
        }
    }
    
    /**
     * Optimize for LCP
     */
    optimizeLCP() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize images
        this.optimizeImages();
        
        // Reduce render-blocking resources
        this.reduceRenderBlocking();
    }
    
    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        // Fonts are loaded via @import in CSS, no need to preload specific font files
        // The browser will automatically load the fonts from Google Fonts when needed
        // Removing hardcoded font preload to avoid 404 errors if font URLs change
    }
    
    /**
     * Optimize images
     */
    optimizeImages() {
        // Add loading="lazy" to non-critical images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
        });
    }
    
    /**
     * Reduce render-blocking resources
     */
    reduceRenderBlocking() {
        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                script.defer = true;
            }
        });
    }
    
    /**
     * Optimize for FID
     */
    optimizeFID() {
        // Reduce JavaScript execution time
        this.reduceJSExecution();
        
        // Optimize event handlers
        this.optimizeEventHandlers();
    }
    
    /**
     * Reduce JavaScript execution time
     */
    reduceJSExecution() {
        // Use requestIdleCallback for non-critical work
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Defer non-critical initialization
                this.deferNonCriticalInit();
            });
        }
    }
    
    /**
     * Optimize event handlers
     */
    optimizeEventHandlers() {
        // Use passive event listeners where possible
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
    }
    
    /**
     * Defer non-critical initialization
     */
    deferNonCriticalInit() {
        // Initialize non-critical features after page load
        setTimeout(() => {
            // Initialize background sparkles if not already done
            if (window.initBackgroundSparkles && typeof window.initBackgroundSparkles === 'function') {
                const currentTier = window.designTierSystem?.getCurrentTier() || 0;
                if (currentTier >= 3) {
                    window.initBackgroundSparkles();
                }
            }
        }, 2000);
    }
    
    /**
     * Optimize for CLS
     */
    optimizeCLS() {
        // Set dimensions on images
        this.setImageDimensions();
        
        // Reserve space for dynamic content
        this.reserveSpaceForContent();
    }
    
    /**
     * Set dimensions on images
     */
    setImageDimensions() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.width || !img.height) {
                img.addEventListener('load', () => {
                    img.style.width = img.naturalWidth + 'px';
                    img.style.height = img.naturalHeight + 'px';
                });
            }
        });
    }
    
    /**
     * Reserve space for dynamic content
     */
    reserveSpaceForContent() {
        // Set min-height on content containers
        const contentList = document.querySelector('.content-list');
        if (contentList) {
            contentList.style.minHeight = '400px';
        }
    }
    
    /**
     * Get metrics
     * @returns {Object} Web Vitals metrics
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * Report metrics
     */
    reportMetrics() {
        console.log('Core Web Vitals:', this.metrics);
        
        // Send to analytics if available
        if (window.playerAnalyticsManager && window.playerAnalyticsManager.enabled) {
            window.playerAnalyticsManager.track('web_vitals', this.metrics);
        }
    }
}

// Create global instance
const coreWebVitalsOptimizer = new CoreWebVitalsOptimizer();

// Report metrics after page load
window.addEventListener('load', () => {
    setTimeout(() => {
        coreWebVitalsOptimizer.reportMetrics();
    }, 5000);
});

export default coreWebVitalsOptimizer;

