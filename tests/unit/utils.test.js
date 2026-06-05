/**
 * Unit tests for utils.js
 * Tests number formatting and balance calculation functions
 */

import {
    formatShort,
    formatPrecise,
    formatOneDecimal,
    formatTimeDuration,
    Balance
} from '../../js/utils.js';

describe('utils.js - Number Formatting', () => {
    describe('formatShort', () => {
        test('should format numbers under 1000 as integers', () => {
            expect(formatShort(0)).toBe('0');
            expect(formatShort(1)).toBe('1');
            expect(formatShort(42)).toBe('42');
            expect(formatShort(999)).toBe('999');
        });

        test('should format thousands with K suffix', () => {
            expect(formatShort(1000)).toBe('1.00K');
            expect(formatShort(1500)).toBe('1.50K');
            expect(formatShort(42000)).toBe('42.00K');
            expect(formatShort(999999)).toBe('1000.00K');
        });

        test('should format millions with M suffix', () => {
            expect(formatShort(1000000)).toBe('1.00M');
            expect(formatShort(1500000)).toBe('1.50M');
            expect(formatShort(42000000)).toBe('42.00M');
        });

        test('should format billions with B suffix', () => {
            expect(formatShort(1000000000)).toBe('1.00B');
            expect(formatShort(1500000000)).toBe('1.50B');
            expect(formatShort(42000000000)).toBe('42.00B');
        });

        test('should format trillions with T suffix', () => {
            expect(formatShort(1000000000000)).toBe('1.00T');
            expect(formatShort(1500000000000)).toBe('1.50T');
        });

        test('should format quadrillions with Qa suffix', () => {
            expect(formatShort(1000000000000000)).toBe('1.00Qa');
        });

        test('should format quintillions with Qi suffix', () => {
            expect(formatShort(1000000000000000000)).toBe('1.00Qi');
        });

        test('should handle decimal values correctly', () => {
            expect(formatShort(1234.56)).toBe('1.23K'); // 1234 >= 1000, so K suffix
            expect(formatShort(1234567.89)).toBe('1.23M');
            expect(formatShort(999.99)).toBe('999'); // Below 1000, no suffix
        });

        test('should handle negative numbers', () => {
            expect(formatShort(-100)).toBe('-100');
            // Note: formatShort doesn't properly handle negatives with suffixes
            // -1500 < 1000 is true, so it returns floor value
            expect(formatShort(-1500)).toBe('-1500');
        });

        test('should cap at highest suffix (Sp)', () => {
            const hugNumber = 1e27; // 1 Sp
            const result = formatShort(hugNumber);
            expect(result).toContain('Sp');
        });
    });

    describe('formatPrecise', () => {
        test('should format with default 2 decimals', () => {
            expect(formatPrecise(1.23456)).toBe('1.23');
            expect(formatPrecise(100)).toBe('100.00');
            expect(formatPrecise(0.1)).toBe('0.10');
        });

        test('should format with custom decimal places', () => {
            expect(formatPrecise(1.23456, 0)).toBe('1');
            expect(formatPrecise(1.23456, 1)).toBe('1.2');
            expect(formatPrecise(1.23456, 3)).toBe('1.235');
            expect(formatPrecise(1.23456, 4)).toBe('1.2346');
        });

        test('should round correctly', () => {
            expect(formatPrecise(1.235, 2)).toBe('1.24');
            expect(formatPrecise(1.234, 2)).toBe('1.23');
        });

        test('should handle negative numbers', () => {
            expect(formatPrecise(-1.23456, 2)).toBe('-1.23');
        });

        test('should handle zero', () => {
            expect(formatPrecise(0, 2)).toBe('0.00');
        });
    });

    describe('formatOneDecimal', () => {
        test('should format small numbers with 1 decimal', () => {
            expect(formatOneDecimal(0)).toBe('0.0');
            expect(formatOneDecimal(1.5)).toBe('1.5');
            expect(formatOneDecimal(42.7)).toBe('42.7');
            expect(formatOneDecimal(999.9)).toBe('999.9');
        });

        test('should format thousands with K suffix and 1 decimal', () => {
            expect(formatOneDecimal(1000)).toBe('1.0K');
            expect(formatOneDecimal(1500)).toBe('1.5K');
            expect(formatOneDecimal(42000)).toBe('42.0K');
        });

        test('should format millions with M suffix and 1 decimal', () => {
            expect(formatOneDecimal(1000000)).toBe('1.0M');
            expect(formatOneDecimal(1500000)).toBe('1.5M');
        });

        test('should format billions with B suffix and 1 decimal', () => {
            expect(formatOneDecimal(1000000000)).toBe('1.0B');
            expect(formatOneDecimal(2500000000)).toBe('2.5B');
        });

        test('should round to 1 decimal place', () => {
            // Note: toFixed uses banker's rounding
            expect(formatOneDecimal(1.25)).toBe('1.3'); // Rounds up
            expect(formatOneDecimal(1.24)).toBe('1.2'); // Rounds down
            expect(formatOneDecimal(1.96)).toBe('2.0'); // Rounds up
        });
    });

    describe('formatTimeDuration', () => {
        test('should format seconds only', () => {
            expect(formatTimeDuration(0)).toBe('0s');
            expect(formatTimeDuration(1)).toBe('1s');
            expect(formatTimeDuration(30)).toBe('30s');
            expect(formatTimeDuration(59)).toBe('59s');
        });

        test('should format minutes and seconds', () => {
            expect(formatTimeDuration(60)).toBe('1m 0s');
            expect(formatTimeDuration(90)).toBe('1m 30s');
            expect(formatTimeDuration(150)).toBe('2m 30s');
            expect(formatTimeDuration(3599)).toBe('59m 59s');
        });

        test('should format hours and minutes (no seconds)', () => {
            expect(formatTimeDuration(3600)).toBe('1h 0m');
            expect(formatTimeDuration(3660)).toBe('1h 1m');
            expect(formatTimeDuration(7200)).toBe('2h 0m');
            expect(formatTimeDuration(7320)).toBe('2h 2m');
        });

        test('should handle large durations', () => {
            expect(formatTimeDuration(86400)).toBe('24h 0m'); // 1 day
            expect(formatTimeDuration(90061)).toBe('25h 1m'); // >1 day
        });

        test('should floor decimal values', () => {
            expect(formatTimeDuration(1.9)).toBe('1s');
            expect(formatTimeDuration(60.5)).toBe('1m 0s');
            expect(formatTimeDuration(3660.9)).toBe('1h 1m');
        });
    });
});

describe('utils.js - Balance Calculations', () => {
    describe('Balance.prestigePointsFor', () => {
        test('should return 0 for zero lifetime earned', () => {
            expect(Balance.prestigePointsFor(0)).toBe(0);
        });

        test('should calculate prestige points with correct formula', () => {
            // Formula: floor(sqrt(lifetimeEarned / prestigeScale))
            // prestigeScale = 1,200,000

            expect(Balance.prestigePointsFor(1200000)).toBe(1); // sqrt(1) = 1
            expect(Balance.prestigePointsFor(4800000)).toBe(2); // sqrt(4) = 2
            expect(Balance.prestigePointsFor(10800000)).toBe(3); // sqrt(9) = 3
        });

        test('should floor the result', () => {
            // Test values that don't give perfect squares
            expect(Balance.prestigePointsFor(2000000)).toBe(1); // sqrt(1.66...) = 1.29... -> 1
            expect(Balance.prestigePointsFor(5000000)).toBe(2); // sqrt(4.16...) = 2.04... -> 2
        });

        test('should handle negative values as zero', () => {
            expect(Balance.prestigePointsFor(-1000000)).toBe(0);
        });

        test('should handle large values', () => {
            expect(Balance.prestigePointsFor(120000000)).toBe(10); // sqrt(100) = 10
            expect(Balance.prestigePointsFor(1200000000)).toBe(31); // sqrt(1000) = 31.6... -> 31
        });
    });

    describe('Balance.nextPrestigeThreshold', () => {
        test('should calculate next threshold correctly', () => {
            // Formula: (currentEk + 1)^2 * prestigeScale
            // prestigeScale = 1,200,000

            expect(Balance.nextPrestigeThreshold(0)).toBe(1200000); // 1^2 * 1,200,000
            expect(Balance.nextPrestigeThreshold(1)).toBe(4800000); // 2^2 * 1,200,000
            expect(Balance.nextPrestigeThreshold(2)).toBe(10800000); // 3^2 * 1,200,000
            expect(Balance.nextPrestigeThreshold(3)).toBe(19200000); // 4^2 * 1,200,000
        });

        test('should handle large prestige counts', () => {
            expect(Balance.nextPrestigeThreshold(9)).toBe(120000000); // 10^2 * 1,200,000
            expect(Balance.nextPrestigeThreshold(99)).toBe(12000000000); // 100^2 * 1,200,000
        });

        test('should work with the prestigePointsFor function', () => {
            // If you have enough to get X prestige points,
            // the next threshold should require more
            const lifetimeEarned = 1200000; // Gives 1 prestige point
            const currentPp = Balance.prestigePointsFor(lifetimeEarned);
            const nextThreshold = Balance.nextPrestigeThreshold(currentPp);

            expect(nextThreshold).toBeGreaterThan(lifetimeEarned);
            expect(nextThreshold).toBe(4800000);
        });
    });

    describe('Balance.scaledRecipe', () => {
        test('should scale recipe costs with growth', () => {
            const baseRecipe = { fire: 10, water: 5 };
            const owned = 0;
            const growth = 1.15;

            const scaled = Balance.scaledRecipe(baseRecipe, owned, growth);

            expect(scaled.fire).toBe(10); // 10 * 1.15^0 = 10
            expect(scaled.water).toBe(5); // 5 * 1.15^0 = 5
        });

        test('should increase costs exponentially', () => {
            const baseRecipe = { fire: 10 };
            const growth = 1.15;

            const scaled0 = Balance.scaledRecipe(baseRecipe, 0, growth);
            const scaled1 = Balance.scaledRecipe(baseRecipe, 1, growth);
            const scaled2 = Balance.scaledRecipe(baseRecipe, 2, growth);

            expect(scaled0.fire).toBe(10); // 10 * 1.15^0 = 10
            expect(scaled1.fire).toBe(12); // ceil(10 * 1.15^1) = ceil(11.5) = 12
            expect(scaled2.fire).toBe(14); // ceil(10 * 1.15^2) = ceil(13.225) = 14
        });

        test('should ceil the results', () => {
            const baseRecipe = { fire: 10 };
            const scaled = Balance.scaledRecipe(baseRecipe, 1, 1.15);

            // 10 * 1.15 = 11.5, should ceil to 12
            expect(scaled.fire).toBe(12);
        });

        test('should handle multiple ingredients', () => {
            const baseRecipe = {
                fire: 10,
                water: 20,
                earth: 30,
                air: 40
            };

            const scaled = Balance.scaledRecipe(baseRecipe, 2, 1.1);

            expect(scaled.fire).toBe(13); // ceil(10 * 1.1^2) = ceil(12.1) = 13
            expect(scaled.water).toBe(25); // ceil(20 * 1.1^2) = ceil(24.2) = 25
            expect(scaled.earth).toBe(37); // ceil(30 * 1.1^2) = ceil(36.3) = 37
            expect(scaled.air).toBe(49); // ceil(40 * 1.1^2) = ceil(48.4) = 49
        });

        test('should handle high ownership counts', () => {
            const baseRecipe = { fire: 10 };
            const scaled = Balance.scaledRecipe(baseRecipe, 10, 1.15);

            // 10 * 1.15^10 = 10 * 4.046 = 40.46 -> 41
            expect(scaled.fire).toBe(41);
        });

        test('should handle growth of 1.0 (no scaling)', () => {
            const baseRecipe = { fire: 10, water: 20 };
            const scaled = Balance.scaledRecipe(baseRecipe, 5, 1.0);

            expect(scaled.fire).toBe(10); // No scaling
            expect(scaled.water).toBe(20);
        });

        test('should create new object, not modify original', () => {
            const baseRecipe = { fire: 10 };
            const scaled = Balance.scaledRecipe(baseRecipe, 5, 1.15);

            expect(baseRecipe.fire).toBe(10); // Original unchanged
            expect(scaled.fire).not.toBe(10); // Scaled is different
        });
    });

    describe('Balance.calculateOfflineProduction', () => {
        test('should calculate production for short durations', () => {
            const production = Balance.calculateOfflineProduction(60, 10);
            expect(production).toBe(600); // 60 seconds * 10/sec = 600
        });

        test('should calculate production for various rates', () => {
            expect(Balance.calculateOfflineProduction(100, 1)).toBe(100);
            expect(Balance.calculateOfflineProduction(100, 5)).toBe(500);
            expect(Balance.calculateOfflineProduction(100, 0.5)).toBe(50);
        });

        test('should cap at 12 hours (43200 seconds)', () => {
            const offlineCap = Balance.offlineCapSeconds;
            expect(offlineCap).toBe(43200);

            // Production for exactly 12 hours
            const production12h = Balance.calculateOfflineProduction(43200, 10);
            expect(production12h).toBe(432000);

            // Production for more than 12 hours should be capped
            const production24h = Balance.calculateOfflineProduction(86400, 10);
            expect(production24h).toBe(432000); // Same as 12h
        });

        test('should handle zero production rate', () => {
            expect(Balance.calculateOfflineProduction(1000, 0)).toBe(0);
        });

        test('should handle zero elapsed time', () => {
            expect(Balance.calculateOfflineProduction(0, 10)).toBe(0);
        });

        test('should handle fractional production rates', () => {
            const production = Balance.calculateOfflineProduction(1000, 1.5);
            expect(production).toBe(1500);
        });

        test('should handle decimal elapsed time', () => {
            const production = Balance.calculateOfflineProduction(1.5, 10);
            expect(production).toBe(15);
        });
    });

    describe('Balance constants', () => {
        test('should have correct prestige scale', () => {
            expect(Balance.prestigeScale).toBe(1200000);
        });

        test('should have correct offline cap (12 hours)', () => {
            expect(Balance.offlineCapSeconds).toBe(43200);
            expect(Balance.offlineCapSeconds).toBe(12 * 60 * 60);
        });
    });
});

describe('utils.js - Edge Cases', () => {
    test('formatShort should handle Infinity', () => {
        const result = formatShort(Infinity);
        expect(result).toBeTruthy(); // Should not crash
    });

    test('formatShort should handle very small numbers', () => {
        expect(formatShort(0.1)).toBe('0');
        expect(formatShort(0.9)).toBe('0');
    });

    test('Balance.prestigePointsFor should handle very large numbers', () => {
        const hugeNumber = 1e20;
        const result = Balance.prestigePointsFor(hugeNumber);
        expect(result).toBeGreaterThan(0);
        expect(Number.isFinite(result)).toBe(true);
    });

    test('Balance.scaledRecipe should handle empty recipe', () => {
        const scaled = Balance.scaledRecipe({}, 5, 1.15);
        expect(scaled).toEqual({});
    });

    test('formatTimeDuration should handle negative values', () => {
    // Negative duration doesn't make sense, but shouldn't crash
        const result = formatTimeDuration(-10);
        expect(result).toBeTruthy();
    });
});

describe('utils.js - Integration Tests', () => {
    test('should maintain consistency between prestige calculations', () => {
    // Test that prestigePointsFor and nextPrestigeThreshold work together
        const testValues = [0, 1, 2, 5, 10, 50, 100];

        testValues.forEach(currentPp => {
            const nextThreshold = Balance.nextPrestigeThreshold(currentPp);
            const ppAtThreshold = Balance.prestigePointsFor(nextThreshold);

            // At the next threshold, you should get currentPp + 1 points
            expect(ppAtThreshold).toBeGreaterThanOrEqual(currentPp + 1);
        });
    });

    test('should scale recipe costs realistically', () => {
    // Verify that costs grow but not too fast
        const baseRecipe = { fire: 10 };
        const growth = 1.15;

        const costs = [];
        for (let owned = 0; owned < 20; owned++) {
            const scaled = Balance.scaledRecipe(baseRecipe, owned, growth);
            costs.push(scaled.fire);
        }

        // Each cost should be >= previous cost
        for (let i = 1; i < costs.length; i++) {
            expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
        }

        // Cost at 19 should be significantly higher than cost at 0
        expect(costs[19]).toBeGreaterThan(costs[0] * 10);
    });

    test('should format and calculate consistently', () => {
    // Test that formatted values match calculated values
        const abPerSecond = 1.5;
        const seconds = 1000;
        const totalAb = Balance.calculateOfflineProduction(seconds, abPerSecond);

        expect(totalAb).toBe(1500);
        expect(formatShort(totalAb)).toBe('1.50K');
    });
});
