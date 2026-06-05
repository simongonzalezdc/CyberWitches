/**
 * Test Utilities
 * Common helper functions for writing tests
 */

/**
 * Assert that two numbers are close enough (for floating point comparisons)
 */
export function assertClose(actual, expected, tolerance = 0.0001) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(
            `Expected ${actual} to be close to ${expected} (tolerance: ${tolerance}), but difference was ${diff}`
        );
    }
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy(implementation = () => {}) {
    const calls = [];
    const spy = function(...args) {
        calls.push({ args, timestamp: Date.now() });
        return implementation(...args);
    };

    spy.calls = calls;
    spy.callCount = () => calls.length;
    spy.calledWith = (...expectedArgs) => {
        return calls.some(call =>
            call.args.length === expectedArgs.length &&
      call.args.every((arg, i) => arg === expectedArgs[i])
        );
    };
    spy.reset = () => {
        calls.length = 0;
    };

    return spy;
}

/**
 * Mock Date.now() to return a fixed timestamp
 */
export function mockDateNow(timestamp) {
    const original = Date.now;
    Date.now = jest.fn(() => timestamp);

    return () => {
        Date.now = original;
    };
}

/**
 * Mock Math.random() to return predictable values
 */
export function mockRandom(values) {
    const original = Math.random;
    let index = 0;

    Math.random = jest.fn(() => {
        const value = values[index % values.length];
        index++;
        return value;
    });

    return () => {
        Math.random = original;
    };
}

/**
 * Run a function and measure execution time
 */
export function measureTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    return {
        result,
        duration: end - start
    };
}

/**
 * Run an async function and measure execution time
 */
export async function measureTimeAsync(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    return {
        result,
        duration: end - start
    };
}

/**
 * Suppress console output during tests
 */
export function suppressConsole() {
    const original = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };

    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.info = jest.fn();

    return () => {
        console.log = original.log;
        console.warn = original.warn;
        console.error = original.error;
        console.info = original.info;
    };
}

/**
 * Create a deferred promise for testing async operations
 */
export function createDeferred() {
    let resolve, reject;

    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

/**
 * Wait for a specific number of milliseconds
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or max attempts reached
 */
export async function retry(fn, maxAttempts = 3, delayMs = 100) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await delay(delayMs);
            }
        }
    }

    throw lastError;
}

/**
 * Generate a random string for test IDs
 */
export function randomId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Deep equality check for objects
 */
export function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
}

/**
 * Assert that an async function throws an error
 */
export async function assertThrowsAsync(fn, expectedError) {
    let error = null;

    try {
        await fn();
    } catch (err) {
        error = err;
    }

    if (!error) {
        throw new Error('Expected function to throw an error, but it did not');
    }

    if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(
            `Expected error message to include "${expectedError}", but got "${error.message}"`
        );
    }

    return error;
}

/**
 * Create a mock game balance configuration
 */
export function createMockBalance() {
    return {
        prestigeFormula: (abTotal) => Math.floor(Math.sqrt(abTotal / 1000)),
        costFormula: (baseCost, count, growth) => baseCost * Math.pow(growth, count),
        productionFormula: (baseRate, count, growth, multipliers) => {
            const base = baseRate * count * Math.pow(growth, count - 1);
            return multipliers.reduce((total, mult) => total * mult, base);
        },
        offlineFormula: (seconds, abPerSecond, cap) => {
            return Math.min(seconds * abPerSecond, cap);
        }
    };
}

/**
 * Validate game state structure
 */
export function validateGameState(state) {
    const requiredFields = [
        'ab',
        'abTotalEarned',
        'inventory',
        'workstations',
        'upgradesOwned',
        'prestigePoints',
        'prestigeCount',
        'discoveredRecipes',
        'totalTaps'
    ];

    const errors = [];

    for (const field of requiredFields) {
        if (!(field in state)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    if (typeof state.ab !== 'number' || state.ab < 0) {
        errors.push('ab must be a non-negative number');
    }

    if (typeof state.abTotalEarned !== 'number' || state.abTotalEarned < 0) {
        errors.push('abTotalEarned must be a non-negative number');
    }

    if (typeof state.inventory !== 'object') {
        errors.push('inventory must be an object');
    }

    if (typeof state.workstations !== 'object') {
        errors.push('workstations must be an object');
    }

    if (!Array.isArray(state.discoveredRecipes)) {
        errors.push('discoveredRecipes must be an array');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate save data structure
 */
export function validateSaveData(saveData) {
    const requiredFields = ['version', 'timestamp', 'ab', 'abTotal'];

    const errors = [];

    for (const field of requiredFields) {
        if (!(field in saveData)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    if (saveData.timestamp && typeof saveData.timestamp !== 'number') {
        errors.push('timestamp must be a number');
    }

    if (saveData.version && typeof saveData.version !== 'string') {
        errors.push('version must be a string');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generate test data sets for parameterized tests
 */
export function generateTestCases(template, variations) {
    return variations.map(variation => ({
        ...template,
        ...variation
    }));
}

/**
 * Run parameterized tests
 */
export function testCases(cases, testFn) {
    cases.forEach((testCase, index) => {
        const name = testCase.name || `Case ${index + 1}`;
        test(name, () => testFn(testCase));
    });
}

/**
 * Create a mock analytics tracker
 */
export function createMockAnalytics() {
    const events = [];

    return {
        trackEvent: jest.fn((category, action, data) => {
            events.push({ category, action, data, timestamp: Date.now() });
        }),

        getEvents: () => events,
        getEventCount: () => events.length,
        getEventsByCategory: (category) => events.filter(e => e.category === category),
        getEventsByAction: (action) => events.filter(e => e.action === action),
        clear: () => { events.length = 0; }
    };
}

/**
 * Assert that a value is within a range
 */
export function assertInRange(value, min, max) {
    if (value < min || value > max) {
        throw new Error(
            `Expected ${value} to be between ${min} and ${max}`
        );
    }
}

/**
 * Assert that an array contains specific items
 */
export function assertContains(array, ...items) {
    for (const item of items) {
        if (!array.includes(item)) {
            throw new Error(
                `Expected array to contain ${item}, but it was not found`
            );
        }
    }
}

/**
 * Assert that an object has specific properties
 */
export function assertHasProperties(obj, ...properties) {
    for (const prop of properties) {
        if (!(prop in obj)) {
            throw new Error(
                `Expected object to have property ${prop}, but it was not found`
            );
        }
    }
}

/**
 * Snapshot testing helper - compare object to expected structure
 */
export function assertStructureMatches(actual, expected) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();

    if (actualKeys.length !== expectedKeys.length) {
        throw new Error(
            `Structure mismatch: expected ${expectedKeys.length} keys, got ${actualKeys.length}`
        );
    }

    for (let i = 0; i < actualKeys.length; i++) {
        if (actualKeys[i] !== expectedKeys[i]) {
            throw new Error(
                `Structure mismatch: expected key "${expectedKeys[i]}", got "${actualKeys[i]}"`
            );
        }

        const actualType = typeof actual[actualKeys[i]];
        const expectedType = typeof expected[expectedKeys[i]];

        if (actualType !== expectedType) {
            throw new Error(
                `Type mismatch for key "${actualKeys[i]}": expected ${expectedType}, got ${actualType}`
            );
        }
    }
}
