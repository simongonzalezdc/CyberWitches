/**
 * Performance Validator
 * Validates performance improvements and creates baseline for Tailwind migration
 * 
 * Week 4, Day 5: Final Validation
 */

import { PerformanceBaseline } from './performanceBaseline.js';

export class PerformanceValidator {
    constructor() {
        this.baseline = null;
        this.current = null;
        this.comparison = null;
    }
    
    /**
     * Load baseline from localStorage
     */
    loadBaseline() {
        const saved = PerformanceBaseline.load();
        if (saved) {
            this.baseline = saved;
            console.log('📊 Loaded baseline:', saved);
            return true;
        }
        return false;
    }
    
    /**
     * Measure current performance
     * @returns {Promise<Object>} Current metrics
     */
    async measureCurrent() {
        const baseline = new PerformanceBaseline();
        await baseline.measure();
        this.current = baseline.getMetrics();
        return this.current;
    }
    
    /**
     * Compare current performance with baseline
     * @returns {Object} Comparison results
     */
    compare() {
        if (!this.baseline || !this.current) {
            console.warn('PerformanceValidator: Baseline or current metrics missing');
            return null;
        }
        
        // Handle invalid loadTime values (negative or zero)
        const baselineLoadTime = (this.baseline.loadTime > 0) ? this.baseline.loadTime : this.current.loadTime;
        const currentLoadTime = (this.current.loadTime > 0) ? this.current.loadTime : baselineLoadTime;
        
        this.comparison = {
            fps: {
                before: this.baseline.averageFps,
                after: this.current.averageFps,
                change: this.current.averageFps - this.baseline.averageFps,
                percentChange: ((this.current.averageFps - this.baseline.averageFps) / this.baseline.averageFps * 100).toFixed(1) + '%'
            },
            memory: {
                before: this.baseline.memoryUsage.toFixed(2) + 'MB',
                after: this.current.memoryUsage.toFixed(2) + 'MB',
                change: this.baseline.memoryUsage - this.current.memoryUsage,
                percentChange: ((this.baseline.memoryUsage - this.current.memoryUsage) / this.baseline.memoryUsage * 100).toFixed(1) + '%'
            },
            loadTime: {
                before: baselineLoadTime + 'ms',
                after: currentLoadTime + 'ms',
                change: baselineLoadTime - currentLoadTime,
                percentChange: baselineLoadTime > 0 
                    ? ((baselineLoadTime - currentLoadTime) / baselineLoadTime * 100).toFixed(1) + '%'
                    : 'N/A'
            }
        };
        
        return this.comparison;
    }
    
    /**
     * Validate performance improvements
     * @returns {Object} Validation results
     */
    validate() {
        if (!this.comparison) {
            this.compare();
        }
        
        if (!this.comparison) {
            return {
                valid: false,
                reason: 'No comparison data available'
            };
        }
        
        const results = {
            valid: true,
            improvements: [],
            regressions: [],
            warnings: []
        };
        
        // Check FPS improvement (should be >= 0%)
        const fpsChange = parseFloat(this.comparison.fps.percentChange);
        if (fpsChange > 0) {
            results.improvements.push(`FPS improved by ${this.comparison.fps.percentChange}`);
        } else if (fpsChange < -5) {
            results.regressions.push(`FPS decreased by ${Math.abs(fpsChange)}%`);
            results.valid = false;
        }
        
        // Check memory improvement (should be <= 0% = less memory)
        // Use more lenient threshold for small baseline values
        const memoryChange = parseFloat(this.comparison.memory.percentChange);
        const memoryBaselineMB = this.baseline.memoryUsage;
        const memoryThreshold = memoryBaselineMB < 10 ? -20 : -15; // More lenient for small baselines
        
        if (memoryChange > 0) {
            results.improvements.push(`Memory usage reduced by ${this.comparison.memory.percentChange}`);
        } else if (memoryChange < memoryThreshold) {
            results.regressions.push(`Memory usage increased by ${Math.abs(memoryChange)}%`);
            // Only fail validation if significant regression (>20% for small baselines, >15% for larger)
            if (memoryChange < (memoryBaselineMB < 10 ? -25 : -20)) {
                results.valid = false;
            } else {
                results.warnings.push(`Memory usage increased by ${Math.abs(memoryChange)}% (within acceptable range)`);
            }
        } else if (memoryChange < -5) {
            // Small increase, just warn
            results.warnings.push(`Memory usage increased by ${Math.abs(memoryChange)}% (normal variation)`);
        }
        
        // Check load time improvement (should be <= 0% = faster)
        // Skip if loadTime is invalid
        if (this.comparison.loadTime.percentChange !== 'N/A') {
            const loadTimeChange = parseFloat(this.comparison.loadTime.percentChange);
            if (loadTimeChange > 0) {
                results.improvements.push(`Load time reduced by ${this.comparison.loadTime.percentChange}`);
            } else if (loadTimeChange < -15) {
                results.regressions.push(`Load time increased by ${Math.abs(loadTimeChange)}%`);
                results.warnings.push('Load time regression detected');
            }
        } else {
            results.warnings.push('Load time comparison skipped (invalid baseline value)');
        }
        
        return results;
    }
    
    /**
     * Create migration baseline for Tailwind CSS
     * @returns {Object} Migration baseline
     */
    createMigrationBaseline() {
        if (!this.current) {
            console.warn('PerformanceValidator: Current metrics not available');
            return null;
        }
        
        const migrationBaseline = {
            ...this.current,
            timestamp: Date.now(),
            phase: 'pre-tailwind',
            bundleSize: this.estimateBundleSize(),
            cssSize: this.estimateCSSSize()
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('migrationBaseline', JSON.stringify(migrationBaseline));
            console.log('💾 Migration baseline saved:', migrationBaseline);
        } catch (error) {
            console.warn('Could not save migration baseline:', error);
        }
        
        return migrationBaseline;
    }
    
    /**
     * Estimate bundle size (rough estimate)
     * @private
     */
    estimateBundleSize() {
        // Rough estimate based on performance.memory
        if (performance.memory) {
            return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB';
        }
        return 'unknown';
    }
    
    /**
     * Estimate CSS size
     * @private
     */
    estimateCSSSize() {
        // Try to get CSS size from stylesheets
        let totalSize = 0;
        try {
            Array.from(document.styleSheets).forEach(sheet => {
                try {
                    Array.from(sheet.cssRules || []).forEach(() => {
                        totalSize += 100; // Rough estimate per rule
                    });
                } catch (e) {
                    // Cross-origin stylesheet, skip
                }
            });
        } catch (error) {
            console.warn('Could not estimate CSS size:', error);
        }
        
        return totalSize > 0 ? (totalSize / 1024).toFixed(2) + 'KB' : 'unknown';
    }
    
    /**
     * Print validation report
     */
    printReport() {
        console.log('═══════════════════════════════════════');
        console.log('📊 Performance Validation Report');
        console.log('═══════════════════════════════════════');
        
        if (this.baseline) {
            console.log('\n📈 Baseline Metrics:');
            console.log(`  FPS: ${this.baseline.averageFps}`);
            console.log(`  Memory: ${this.baseline.memoryUsage.toFixed(2)}MB`);
            console.log(`  Load Time: ${this.baseline.loadTime}ms`);
        }
        
        if (this.current) {
            console.log('\n📊 Current Metrics:');
            console.log(`  FPS: ${this.current.averageFps}`);
            console.log(`  Memory: ${this.current.memoryUsage.toFixed(2)}MB`);
            console.log(`  Load Time: ${this.current.loadTime}ms`);
        }
        
        if (this.comparison) {
            console.log('\n📉 Comparison:');
            console.log(`  FPS: ${this.comparison.fps.percentChange}`);
            console.log(`  Memory: ${this.comparison.memory.percentChange}`);
            console.log(`  Load Time: ${this.comparison.loadTime.percentChange}`);
        }
        
        const validation = this.validate();
        if (validation) {
            console.log('\n✅ Validation Results:');
            if (validation.improvements.length > 0) {
                console.log('  Improvements:');
                validation.improvements.forEach(imp => console.log(`    ✅ ${imp}`));
            }
            if (validation.regressions.length > 0) {
                console.log('  Regressions:');
                validation.regressions.forEach(reg => console.log(`    ❌ ${reg}`));
            }
            if (validation.warnings.length > 0) {
                console.log('  Warnings:');
                validation.warnings.forEach(warn => console.log(`    ⚠️  ${warn}`));
            }
            console.log(`\n  Overall: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
        }
        
        console.log('═══════════════════════════════════════');
    }
}

// Global instance
export const performanceValidator = new PerformanceValidator();

// Expose for debugging
if (typeof window !== 'undefined') {
    window.performanceValidator = performanceValidator;
}

