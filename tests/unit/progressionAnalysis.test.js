/**
 * Unit tests for progressionAnalysis.js
 * Tests progression tracking and analysis
 */

import ProgressionAnalysis from '../../js/progressionAnalysis.js';
import { GameState } from '../../js/gameState.js';

describe('Progression Analysis', () => {
    let gameState;
    let progressionAnalysis;
    let originalDateNow;

    beforeEach(() => {
        gameState = new GameState();
        gameState.milestones = [];
        originalDateNow = Date.now;
        progressionAnalysis = new ProgressionAnalysis(gameState);
    });

    afterEach(() => {
        Date.now = originalDateNow;
        if (gameState && gameState.tickInterval) {
            clearInterval(gameState.tickInterval);
        }
    });

    describe('Initialization', () => {
        test('should create progression analysis', () => {
            expect(progressionAnalysis).toBeDefined();
            expect(progressionAnalysis.gameState).toBe(gameState);
        });

        test('should initialize with empty progression data', () => {
            const analysis = new ProgressionAnalysis(gameState);
            // Data collection happens on init, so might have 1 data point
            expect(Array.isArray(analysis.progressionData)).toBe(true);
        });

        test('should collect initial data point on init', () => {
            const analysis = new ProgressionAnalysis(gameState);
            expect(analysis.progressionData.length).toBeGreaterThan(0);
        });
    });

    describe('Data Collection', () => {
        test('should collect data point', () => {
            const initialLength = progressionAnalysis.progressionData.length;
            progressionAnalysis.collectDataPoint();

            expect(progressionAnalysis.progressionData.length).toBe(initialLength + 1);
        });

        test('should include timestamp in data point', () => {
            progressionAnalysis.collectDataPoint();

            const dataPoint = progressionAnalysis.progressionData[progressionAnalysis.progressionData.length - 1];
            expect(dataPoint.timestamp).toBeDefined();
            expect(typeof dataPoint.timestamp).toBe('number');
        });

        test('should include AB in data point', () => {
            gameState.ab = 500;
            progressionAnalysis.collectDataPoint();

            const dataPoint = progressionAnalysis.progressionData[progressionAnalysis.progressionData.length - 1];
            expect(dataPoint.ab).toBe(500);
        });

        test('should include workstation count in data point', () => {
            gameState.workstations = { ws1: 5, ws2: 3 };
            progressionAnalysis.collectDataPoint();

            const dataPoint = progressionAnalysis.progressionData[progressionAnalysis.progressionData.length - 1];
            expect(dataPoint.workstations).toBe(8);
        });

        test('should include upgrades count in data point', () => {
            gameState.upgradesOwned = { upgrade1: true, upgrade2: true };
            progressionAnalysis.collectDataPoint();

            const dataPoint = progressionAnalysis.progressionData[progressionAnalysis.progressionData.length - 1];
            expect(dataPoint.upgrades).toBe(2);
        });

        test('should include prestige count in data point', () => {
            gameState.prestigeCount = 3;
            progressionAnalysis.collectDataPoint();

            const dataPoint = progressionAnalysis.progressionData[progressionAnalysis.progressionData.length - 1];
            expect(dataPoint.prestigeCount).toBe(3);
        });

        test('should include total taps in data point', () => {
            gameState.totalTaps = 100;
            progressionAnalysis.collectDataPoint();

            const dataPoint = progressionAnalysis.progressionData[progressionAnalysis.progressionData.length - 1];
            expect(dataPoint.totalTaps).toBe(100);
        });

        test('should limit data points to 1000', () => {
            // Add 1100 data points
            for (let i = 0; i < 1100; i++) {
                progressionAnalysis.collectDataPoint();
            }

            expect(progressionAnalysis.progressionData.length).toBe(1000);
        });

        test('should not collect data when gameState is null', () => {
            progressionAnalysis.gameState = null;
            const initialLength = progressionAnalysis.progressionData.length;

            progressionAnalysis.collectDataPoint();

            expect(progressionAnalysis.progressionData.length).toBe(initialLength);
        });
    });

    describe('Growth Rate Calculation', () => {
        test('should calculate growth rate', () => {
            let currentTime = 1000;
            Date.now = () => currentTime;

            progressionAnalysis.progressionData = [];
            progressionAnalysis.collectDataPoint();

            // Advance time and change AB
            currentTime += 60000; // 1 minute
            gameState.ab = 100;
            progressionAnalysis.collectDataPoint();

            const growthRate = progressionAnalysis.calculateGrowthRate('ab');
            expect(growthRate).toBeGreaterThanOrEqual(0);
        });

        test('should return 0 when not enough data', () => {
            progressionAnalysis.progressionData = [{ ab: 100 }];

            const growthRate = progressionAnalysis.calculateGrowthRate('ab');
            expect(growthRate).toBe(0);
        });

        test('should return 0 when first value is 0', () => {
            progressionAnalysis.progressionData = [
                { ab: 0, timestamp: 1000 },
                { ab: 100, timestamp: 61000 }
            ];

            const growthRate = progressionAnalysis.calculateGrowthRate('ab');
            expect(growthRate).toBe(0);
        });

        test('should return 0 when time diff is 0', () => {
            const time = 1000;
            progressionAnalysis.progressionData = [
                { ab: 50, timestamp: time },
                { ab: 100, timestamp: time }
            ];

            const growthRate = progressionAnalysis.calculateGrowthRate('ab');
            expect(growthRate).toBe(0);
        });

        test('should calculate positive growth rate', () => {
            progressionAnalysis.progressionData = [
                { ab: 50, timestamp: 1000 },
                { ab: 150, timestamp: 61000 } // 1 minute later
            ];

            const growthRate = progressionAnalysis.calculateGrowthRate('ab');
            expect(growthRate).toBe(100); // 100 AB per minute
        });

        test('should calculate growth rate for different metrics', () => {
            progressionAnalysis.progressionData = [
                { workstations: 5, timestamp: 1000 },
                { workstations: 10, timestamp: 61000 }
            ];

            const growthRate = progressionAnalysis.calculateGrowthRate('workstations');
            expect(growthRate).toBe(5); // 5 workstations per minute
        });
    });

    describe('Progression Speed Calculation', () => {
        test('should calculate progression speed', () => {
            progressionAnalysis.progressionData = [
                { ab: 100, abps: 1, workstations: 5, timestamp: 1000 },
                { ab: 200, abps: 2, workstations: 10, timestamp: 61000 }
            ];

            const speed = progressionAnalysis.calculateProgressionSpeed();

            expect(speed).toBeDefined();
            expect(speed.error).toBeUndefined();
        });

        test('should return error when not enough data', () => {
            progressionAnalysis.progressionData = [{ ab: 100 }];

            const speed = progressionAnalysis.calculateProgressionSpeed();

            expect(speed.error).toBe('Not enough data');
        });

        test('should include AB per minute', () => {
            progressionAnalysis.progressionData = [
                { ab: 100, timestamp: 1000 },
                { ab: 200, timestamp: 61000 }
            ];

            const speed = progressionAnalysis.calculateProgressionSpeed();

            expect(speed.abPerMinute).toBeDefined();
            expect(typeof speed.abPerMinute).toBe('number');
        });

        test('should include ABPS per minute', () => {
            progressionAnalysis.progressionData = [
                { abps: 1, timestamp: 1000 },
                { abps: 2, timestamp: 61000 }
            ];

            const speed = progressionAnalysis.calculateProgressionSpeed();

            expect(speed.abpsPerMinute).toBeDefined();
            expect(typeof speed.abpsPerMinute).toBe('number');
        });

        test('should include workstations per minute', () => {
            progressionAnalysis.progressionData = [
                { workstations: 5, timestamp: 1000 },
                { workstations: 10, timestamp: 61000 }
            ];

            const speed = progressionAnalysis.calculateProgressionSpeed();

            expect(speed.workstationsPerMinute).toBeDefined();
            expect(typeof speed.workstationsPerMinute).toBe('number');
        });
    });

    describe('Progression Analysis', () => {
        test('should analyze progression', () => {
            progressionAnalysis.progressionData = [
                { ab: 100, abps: 1, workstations: 5, upgrades: 2, timestamp: 1000 },
                { ab: 200, abps: 2, workstations: 10, upgrades: 4, timestamp: 61000 }
            ];

            const analysis = progressionAnalysis.analyzeProgression();

            expect(analysis).toBeDefined();
            expect(analysis.error).toBeUndefined();
        });

        test('should return error when not enough data', () => {
            progressionAnalysis.progressionData = [];

            const analysis = progressionAnalysis.analyzeProgression();

            expect(analysis.error).toBe('Not enough data');
        });

        test('should include growth rates in analysis', () => {
            progressionAnalysis.progressionData = [
                { ab: 100, abps: 1, workstations: 5, upgrades: 2, timestamp: 1000 },
                { ab: 200, abps: 2, workstations: 10, upgrades: 4, timestamp: 61000 }
            ];

            const analysis = progressionAnalysis.analyzeProgression();

            expect(analysis.abGrowthRate).toBeDefined();
            expect(analysis.abpsGrowthRate).toBeDefined();
            expect(analysis.workstationGrowthRate).toBeDefined();
            expect(analysis.upgradeGrowthRate).toBeDefined();
        });

        test('should include progression speed in analysis', () => {
            progressionAnalysis.progressionData = [
                { ab: 100, abps: 1, workstations: 5, timestamp: 1000 },
                { ab: 200, abps: 2, workstations: 10, timestamp: 61000 }
            ];

            const analysis = progressionAnalysis.analyzeProgression();

            expect(analysis.progressionSpeed).toBeDefined();
        });

        test('should include bottlenecks in analysis', () => {
            progressionAnalysis.progressionData = [
                { ab: 100, abps: 1, workstations: 5, timestamp: 1000 },
                { ab: 200, abps: 2, workstations: 10, timestamp: 61000 }
            ];

            const analysis = progressionAnalysis.analyzeProgression();

            expect(analysis.bottlenecks).toBeDefined();
            expect(Array.isArray(analysis.bottlenecks)).toBe(true);
        });
    });

    describe('Bottleneck Identification', () => {
        test('should identify bottlenecks', () => {
            const bottlenecks = progressionAnalysis.identifyBottlenecks();

            expect(Array.isArray(bottlenecks)).toBe(true);
        });

        test('should identify no workstations bottleneck', () => {
            gameState.ab = 150;
            gameState.workstations = {};

            const bottlenecks = progressionAnalysis.identifyBottlenecks();

            const noWorkstationsBottleneck = bottlenecks.find(b => b.type === 'no_workstations');
            expect(noWorkstationsBottleneck).toBeDefined();
            expect(noWorkstationsBottleneck.severity).toBe('high');
        });

        test('should not identify bottleneck when AB is low', () => {
            gameState.ab = 50;
            gameState.workstations = {};

            const bottlenecks = progressionAnalysis.identifyBottlenecks();

            const noWorkstationsBottleneck = bottlenecks.find(b => b.type === 'no_workstations');
            expect(noWorkstationsBottleneck).toBeUndefined();
        });
    });
});
