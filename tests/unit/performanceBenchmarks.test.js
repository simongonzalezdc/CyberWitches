/**
 * Tests for Performance Benchmarks
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { PerformanceBenchmarks } from '../../js/performanceBenchmarks.js';

describe('PerformanceBenchmarks', () => {
    let benchmarks;

    beforeEach(() => {
        benchmarks = new PerformanceBenchmarks();
        // Mock performance.now
        jest.spyOn(performance, 'now').mockReturnValue(0);
    });

    afterEach(() => {
        benchmarks.stop();
        jest.restoreAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize with empty metrics', () => {
            expect(benchmarks.metrics.fps.length).toBe(0);
            expect(benchmarks.metrics.memoryUsage.length).toBe(0);
            expect(benchmarks.metrics.productionCalcTime.length).toBe(0);
        });

        test('should have default thresholds', () => {
            expect(benchmarks.thresholds.fps).toBe(55);
            expect(benchmarks.thresholds.memoryGrowth).toBe(50);
            expect(benchmarks.thresholds.productionCalcTime).toBe(50);
        });

        test('should not be monitoring by default', () => {
            expect(benchmarks.isMonitoring).toBe(false);
        });
    });

    describe('Benchmarking', () => {
        test('should benchmark production calculation', () => {
            const slowFunc = () => {
                // Simulate work
                return 42;
            };

            const result = benchmarks.benchmarkProductionCalc(slowFunc);

            expect(result).toBe(42);
            expect(benchmarks.metrics.productionCalcTime.length).toBe(1);
        });

        test('should benchmark save operation', () => {
            const saveFunc = () => {
                return { saved: true };
            };

            const result = benchmarks.benchmarkSave(saveFunc);

            expect(result).toEqual({ saved: true });
            expect(benchmarks.metrics.saveTime.length).toBe(1);
        });

        test('should benchmark render operation', () => {
            const renderFunc = () => {
                return 'rendered';
            };

            const result = benchmarks.benchmarkRender(renderFunc);

            expect(result).toBe('rendered');
            expect(benchmarks.metrics.renderTime.length).toBe(1);
        });

        test('should limit metric arrays to 100 samples', () => {
            const fastFunc = () => 42;

            for (let i = 0; i < 150; i++) {
                benchmarks.benchmarkProductionCalc(fastFunc);
            }

            expect(benchmarks.metrics.productionCalcTime.length).toBe(100);
        });
    });

    describe('FPS Calculation', () => {
        test('should calculate average FPS', () => {
            benchmarks.metrics.fps = [60, 59, 61, 60, 60];

            const avgFPS = benchmarks.getAverageFPS();

            expect(avgFPS).toBeCloseTo(60, 0);
        });

        test('should return 0 for empty FPS array', () => {
            const avgFPS = benchmarks.getAverageFPS();

            expect(avgFPS).toBe(0);
        });
    });

    describe('Memory Growth Calculation', () => {
        test('should calculate memory growth rate', () => {
            const now = Date.now();

            benchmarks.metrics.memoryUsage = [
                { timestamp: now, memory: 50 },
                { timestamp: now + 3600000, memory: 100 } // 1 hour later
            ];

            const growth = benchmarks.getMemoryGrowthRate();

            expect(growth).toBeCloseTo(50, 0); // 50 MB per hour
        });

        test('should return 0 for insufficient data', () => {
            benchmarks.metrics.memoryUsage = [{ timestamp: Date.now(), memory: 50 }];

            const growth = benchmarks.getMemoryGrowthRate();

            expect(growth).toBe(0);
        });
    });

    describe('Reporting', () => {
        test('should generate comprehensive report', () => {
            // Add some sample data
            benchmarks.metrics.fps = [60, 59, 61];
            benchmarks.metrics.productionCalcTime = [10, 12, 11];
            benchmarks.metrics.saveTime = [50, 55, 52];
            benchmarks.metrics.renderTime = [14, 15, 13];

            const report = benchmarks.getReport();

            expect(report).toHaveProperty('fps');
            expect(report).toHaveProperty('memory');
            expect(report).toHaveProperty('productionCalc');
            expect(report).toHaveProperty('saveTime');
            expect(report).toHaveProperty('renderTime');
            expect(report).toHaveProperty('uptime');
        });

        test('should mark FPS as PASS when above threshold', () => {
            benchmarks.metrics.fps = [60, 59, 61];

            const report = benchmarks.getReport();

            expect(report.fps.status).toBe('PASS');
        });

        test('should mark FPS as FAIL when below threshold', () => {
            benchmarks.metrics.fps = [50, 49, 48];

            const report = benchmarks.getReport();

            expect(report.fps.status).toBe('FAIL');
        });
    });

    describe('Start/Stop', () => {
        test('should start monitoring', () => {
            benchmarks.start();

            expect(benchmarks.isMonitoring).toBe(true);
        });

        test('should stop monitoring', () => {
            benchmarks.start();
            benchmarks.stop();

            expect(benchmarks.isMonitoring).toBe(false);
        });

        test('should not start twice', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            benchmarks.start();
            const firstStartTime = benchmarks.startTime;

            benchmarks.start();
            const secondStartTime = benchmarks.startTime;

            expect(firstStartTime).toBe(secondStartTime);
            consoleSpy.mockRestore();
        });
    });
});
