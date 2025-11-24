/**
 * Performance Baseline Measurement
 * Records initial performance metrics before optimizations
 * Used to measure improvement impact
 */

export class PerformanceBaseline {
    constructor() {
        this.metrics = {
            fps: 0,
            averageFps: 0,
            minFps: Infinity,
            maxFps: 0,
            memoryUsage: 0,
            loadTime: 0,
            bundleSize: 0,
            timestamp: Date.now()
        };
        
        this.frameCount = 0;
        this.fpsHistory = [];
        this.lastFrameTime = performance.now();
        this.measurementDuration = 5000; // 5 seconds
        this.isMeasuring = false;
    }
    
    /**
     * Start measuring performance baseline
     * @returns {Promise<Object>} Performance metrics
     */
    async measure() {
        console.log('📊 Starting performance baseline measurement...');
        
        // Measure load time
        if (performance.timing) {
            this.metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        }
        
        // Measure memory
        if (performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
        }
        
        // Measure FPS
        return new Promise((resolve) => {
            this.isMeasuring = true;
            this.frameCount = 0;
            this.fpsHistory = [];
            const startTime = performance.now();
            this.lastFrameTime = startTime;
            
            const measureFPS = (currentTime) => {
                const deltaTime = currentTime - this.lastFrameTime;
                this.lastFrameTime = currentTime;
                
                if (deltaTime > 0) {
                    const fps = 1000 / deltaTime;
                    this.fpsHistory.push(fps);
                    this.frameCount++;
                    
                    this.metrics.fps = Math.round(fps);
                    this.metrics.minFps = Math.min(this.metrics.minFps, fps);
                    this.metrics.maxFps = Math.max(this.metrics.maxFps, fps);
                }
                
                // Compare against start time, not lastFrameTime
                const elapsed = currentTime - startTime;
                if (elapsed < this.measurementDuration) {
                    requestAnimationFrame(measureFPS);
                } else {
                    this.isMeasuring = false;
                    
                    // Calculate average FPS
                    if (this.fpsHistory.length > 0) {
                        this.metrics.averageFps = Math.round(
                            this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
                        );
                    }
                    
                    console.log('✅ Performance baseline measurement complete:', this.metrics);
                    resolve(this.metrics);
                }
            };
            
            requestAnimationFrame(measureFPS);
        });
    }
    
    /**
     * Get current metrics
     * @returns {Object} Current performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * Compare with another baseline
     * @param {Object} otherMetrics - Metrics to compare against
     * @returns {Object} Comparison results
     */
    compare(otherMetrics) {
        return {
            fps: {
                before: this.metrics.averageFps,
                after: otherMetrics.averageFps,
                improvement: ((otherMetrics.averageFps - this.metrics.averageFps) / this.metrics.averageFps * 100).toFixed(1) + '%'
            },
            memory: {
                before: this.metrics.memoryUsage.toFixed(2) + 'MB',
                after: otherMetrics.memoryUsage.toFixed(2) + 'MB',
                improvement: ((this.metrics.memoryUsage - otherMetrics.memoryUsage) / this.metrics.memoryUsage * 100).toFixed(1) + '%'
            },
            loadTime: {
                before: this.metrics.loadTime + 'ms',
                after: otherMetrics.loadTime + 'ms',
                improvement: ((this.metrics.loadTime - otherMetrics.loadTime) / this.metrics.loadTime * 100).toFixed(1) + '%'
            }
        };
    }
    
    /**
     * Save baseline to localStorage
     */
    save() {
        try {
            localStorage.setItem('performanceBaseline', JSON.stringify(this.metrics));
            console.log('💾 Performance baseline saved to localStorage');
        } catch (error) {
            console.warn('Could not save baseline to localStorage:', error);
        }
    }
    
    /**
     * Load baseline from localStorage
     * @returns {Object|null} Saved baseline or null
     */
    static load() {
        try {
            const saved = localStorage.getItem('performanceBaseline');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load baseline from localStorage:', error);
        }
        return null;
    }
}

