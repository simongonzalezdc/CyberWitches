/**
 * Performance Benchmarks - Automated Performance Monitoring
 * Tracks key metrics and reports degradation
 */

export class PerformanceBenchmarks {
    constructor() {
        this.metrics = {
            fps: [],
            memoryUsage: [],
            productionCalcTime: [],
            saveTime: [],
            renderTime: []
        };

        this.thresholds = {
            fps: 55, // Minimum acceptable FPS
            memoryGrowth: 50, // MB per hour
            productionCalcTime: 50, // ms
            saveTime: 100, // ms
            renderTime: 16 // ms (60fps)
        };

        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.startTime = Date.now();
        this.isMonitoring = false;
    }

    /**
     * Start monitoring
     */
    start() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.startTime = Date.now();

        // FPS monitoring
        this.monitorFPS();

        // Memory monitoring (if available)
        if (performance.memory) {
            this.monitorMemory();
        }

        console.info('[Performance] Monitoring started');
    }

    /**
     * Stop monitoring
     */
    stop() {
        this.isMonitoring = false;
        console.info('[Performance] Monitoring stopped');
    }

    /**
     * Monitor FPS
     */
    monitorFPS() {
        if (!this.isMonitoring) return;

        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        const fps = 1000 / delta;
        this.metrics.fps.push(fps);

        // Keep only last 60 samples
        if (this.metrics.fps.length > 60) {
            this.metrics.fps.shift();
        }

        this.frameCount++;

        // Check threshold every 60 frames
        if (this.frameCount % 60 === 0) {
            const avgFPS = this.getAverageFPS();
            if (avgFPS < this.thresholds.fps) {
                console.warn(`[Performance] Low FPS detected: ${avgFPS.toFixed(1)}`);
            }
        }

        requestAnimationFrame(() => this.monitorFPS());
    }

    /**
     * Monitor memory usage
     */
    monitorMemory() {
        if (!this.isMonitoring || !performance.memory) return;

        const usedMemory = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
        this.metrics.memoryUsage.push({
            timestamp: Date.now(),
            memory: usedMemory
        });

        // Keep only last hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.metrics.memoryUsage = this.metrics.memoryUsage.filter(
            m => m.timestamp > oneHourAgo
        );

        // Check for memory growth
        const memoryGrowth = this.getMemoryGrowthRate();
        if (memoryGrowth > this.thresholds.memoryGrowth) {
            console.warn(`[Performance] High memory growth rate: ${memoryGrowth.toFixed(1)} MB/hour`);
        }

        setTimeout(() => this.monitorMemory(), 60000); // Check every minute
    }

    /**
     * Benchmark production calculation
     * @param {Function} callback - Production calculation function
     * @returns {*} - Result of callback
     */
    benchmarkProductionCalc(callback) {
        const start = performance.now();
        const result = callback();
        const duration = performance.now() - start;

        this.metrics.productionCalcTime.push(duration);

        if (this.metrics.productionCalcTime.length > 100) {
            this.metrics.productionCalcTime.shift();
        }

        if (duration > this.thresholds.productionCalcTime) {
            console.warn(`[Performance] Slow production calc: ${duration.toFixed(2)}ms`);
        }

        return result;
    }

    /**
     * Benchmark save operation
     * @param {Function} callback - Save function
     * @returns {*} - Result of callback
     */
    benchmarkSave(callback) {
        const start = performance.now();
        const result = callback();
        const duration = performance.now() - start;

        this.metrics.saveTime.push(duration);

        if (this.metrics.saveTime.length > 100) {
            this.metrics.saveTime.shift();
        }

        if (duration > this.thresholds.saveTime) {
            console.warn(`[Performance] Slow save: ${duration.toFixed(2)}ms`);
        }

        return result;
    }

    /**
     * Benchmark render operation
     * @param {Function} callback - Render function
     * @returns {*} - Result of callback
     */
    benchmarkRender(callback) {
        const start = performance.now();
        const result = callback();
        const duration = performance.now() - start;

        this.metrics.renderTime.push(duration);

        if (this.metrics.renderTime.length > 100) {
            this.metrics.renderTime.shift();
        }

        if (duration > this.thresholds.renderTime) {
            console.warn(`[Performance] Slow render: ${duration.toFixed(2)}ms`);
        }

        return result;
    }

    /**
     * Get average FPS
     * @returns {number} - Average FPS
     */
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return 0;
        const sum = this.metrics.fps.reduce((a, b) => a + b, 0);
        return sum / this.metrics.fps.length;
    }

    /**
     * Get memory growth rate (MB per hour)
     * @returns {number} - Growth rate
     */
    getMemoryGrowthRate() {
        if (this.metrics.memoryUsage.length < 2) return 0;

        const first = this.metrics.memoryUsage[0];
        const last = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];

        const memoryDelta = last.memory - first.memory;
        const timeDelta = (last.timestamp - first.timestamp) / (1000 * 60 * 60); // hours

        return memoryDelta / timeDelta;
    }

    /**
     * Get comprehensive report
     * @returns {Object} - Performance report
     */
    getReport() {
        const avgFPS = this.getAverageFPS();
        const memoryGrowth = this.getMemoryGrowthRate();

        const avgProductionCalc = this.metrics.productionCalcTime.length > 0
            ? this.metrics.productionCalcTime.reduce((a, b) => a + b, 0) / this.metrics.productionCalcTime.length
            : 0;

        const avgSaveTime = this.metrics.saveTime.length > 0
            ? this.metrics.saveTime.reduce((a, b) => a + b, 0) / this.metrics.saveTime.length
            : 0;

        const avgRenderTime = this.metrics.renderTime.length > 0
            ? this.metrics.renderTime.reduce((a, b) => a + b, 0) / this.metrics.renderTime.length
            : 0;

        const currentMemory = performance.memory
            ? (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)
            : 'N/A';

        return {
            fps: {
                average: avgFPS.toFixed(1),
                threshold: this.thresholds.fps,
                status: avgFPS >= this.thresholds.fps ? 'PASS' : 'FAIL'
            },
            memory: {
                current: currentMemory + ' MB',
                growthRate: memoryGrowth.toFixed(1) + ' MB/hour',
                threshold: this.thresholds.memoryGrowth + ' MB/hour',
                status: memoryGrowth <= this.thresholds.memoryGrowth ? 'PASS' : 'FAIL'
            },
            productionCalc: {
                average: avgProductionCalc.toFixed(2) + 'ms',
                threshold: this.thresholds.productionCalcTime + 'ms',
                status: avgProductionCalc <= this.thresholds.productionCalcTime ? 'PASS' : 'FAIL'
            },
            saveTime: {
                average: avgSaveTime.toFixed(2) + 'ms',
                threshold: this.thresholds.saveTime + 'ms',
                status: avgSaveTime <= this.thresholds.saveTime ? 'PASS' : 'FAIL'
            },
            renderTime: {
                average: avgRenderTime.toFixed(2) + 'ms',
                threshold: this.thresholds.renderTime + 'ms',
                status: avgRenderTime <= this.thresholds.renderTime ? 'PASS' : 'FAIL'
            },
            uptime: ((Date.now() - this.startTime) / 1000 / 60).toFixed(1) + ' minutes'
        };
    }

    /**
     * Print report to console
     */
    printReport() {
        const report = this.getReport();

        console.info('='.repeat(60));
        console.info('PERFORMANCE BENCHMARK REPORT');
        console.info('='.repeat(60));
        console.info(`Uptime: ${report.uptime}`);
        console.info('');
        console.info(`FPS: ${report.fps.average} (threshold: ${report.fps.threshold}) [${report.fps.status}]`);
        console.info(`Memory: ${report.memory.current}, Growth: ${report.memory.growthRate} [${report.memory.status}]`);
        console.info(`Production Calc: ${report.productionCalc.average} (threshold: ${report.productionCalc.threshold}) [${report.productionCalc.status}]`);
        console.info(`Save Time: ${report.saveTime.average} (threshold: ${report.saveTime.threshold}) [${report.saveTime.status}]`);
        console.info(`Render Time: ${report.renderTime.average} (threshold: ${report.renderTime.threshold}) [${report.renderTime.status}]`);
        console.info('='.repeat(60));

        return report;
    }

    /**
     * Get metrics data for analysis
     * @returns {Object} - Raw metrics data
     */
    getMetrics() {
        return this.metrics;
    }
}

// Global instance
export const performanceBenchmarks = new PerformanceBenchmarks();

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.performanceBenchmarks = performanceBenchmarks;

    // Auto-start in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        performanceBenchmarks.start();
        console.info('[Performance] Auto-started benchmarks (localhost detected)');
        console.info('[Performance] Run performanceBenchmarks.printReport() to see results');
    }
}

export default performanceBenchmarks;
