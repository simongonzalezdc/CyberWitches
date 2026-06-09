/**
 * Unit tests for debug.js
 * Tests debug logging utilities
 */

import { debugLog, debugWarn, debugError, debugGroup, debugGroupEnd, debugTime, debugTimeEnd } from '../../js/debug.js';

describe('Debug Utilities', () => {
    let originalLog;
    let originalWarn;
    let originalError;
    let originalGroup;
    let originalGroupEnd;
    let originalTime;
    let originalTimeEnd;
    let logCalls;
    let warnCalls;
    let errorCalls;
    let groupCalls;
    let groupEndCalls;
    let timeCalls;
    let timeEndCalls;

    beforeEach(() => {
        logCalls = [];
        warnCalls = [];
        errorCalls = [];
        groupCalls = [];
        groupEndCalls = 0;
        timeCalls = [];
        timeEndCalls = [];

        originalLog = console.info;
        originalWarn = console.warn;
        originalError = console.error;
        originalGroup = console.group;
        originalGroupEnd = console.groupEnd;
        originalTime = console.time;
        originalTimeEnd = console.timeEnd;

        console.info = (...args) => { logCalls.push(args); };
        console.warn = (...args) => { warnCalls.push(args); };
        console.error = (...args) => { errorCalls.push(args); };
        console.group = (label) => { groupCalls.push(label); };
        console.groupEnd = () => { groupEndCalls++; };
        console.time = (label) => { timeCalls.push(label); };
        console.timeEnd = (label) => { timeEndCalls.push(label); };
    });

    afterEach(() => {
        console.info = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        console.group = originalGroup;
        console.groupEnd = originalGroupEnd;
        console.time = originalTime;
        console.timeEnd = originalTimeEnd;
    });

    describe('debugLog', () => {
        test('should exist', () => {
            expect(typeof debugLog).toBe('function');
        });

        test('should not call console.info when debug is disabled', () => {
            debugLog('test message');
            // In production mode (DEBUG = false), console.info should not be called
            expect(logCalls.length).toBe(0);
        });

        test('should handle arguments without crashing', () => {
            expect(() => debugLog('message', 123, { key: 'value' })).not.toThrow();
        });
    });

    describe('debugWarn', () => {
        test('should exist', () => {
            expect(typeof debugWarn).toBe('function');
        });

        test('should not call console.warn when debug is disabled', () => {
            debugWarn('warning message');
            // In production mode (DEBUG = false), console.warn should not be called
            expect(warnCalls.length).toBe(0);
        });

        test('should handle arguments without crashing', () => {
            expect(() => debugWarn('warning', 456)).not.toThrow();
        });
    });

    describe('debugError', () => {
        test('should exist', () => {
            expect(typeof debugError).toBe('function');
        });

        test('should always call console.error', () => {
            debugError('error message');
            expect(errorCalls.length).toBeGreaterThan(0);
        });

        test('should pass arguments to console.error', () => {
            const error = new Error('test');
            debugError('error', error);
            expect(errorCalls[errorCalls.length - 1][0]).toBe('error');
            expect(errorCalls[errorCalls.length - 1][1]).toBeInstanceOf(Error);
        });

        test('should handle multiple arguments', () => {
            debugError('error', 'details', { code: 500 });
            expect(errorCalls[errorCalls.length - 1]).toEqual(['error', 'details', { code: 500 }]);
        });
    });

    describe('debugGroup', () => {
        test('should exist', () => {
            expect(typeof debugGroup).toBe('function');
        });

        test('should not call console.group when debug is disabled', () => {
            debugGroup('Test Group');
            // In production mode (DEBUG = false), console.group should not be called
            expect(groupCalls.length).toBe(0);
        });

        test('should handle label without crashing', () => {
            expect(() => debugGroup('My Group')).not.toThrow();
        });
    });

    describe('debugGroupEnd', () => {
        test('should exist', () => {
            expect(typeof debugGroupEnd).toBe('function');
        });

        test('should not call console.groupEnd when debug is disabled', () => {
            debugGroupEnd();
            // In production mode (DEBUG = false), console.groupEnd should not be called
            expect(groupEndCalls).toBe(0);
        });
    });

    describe('debugTime', () => {
        test('should exist', () => {
            expect(typeof debugTime).toBe('function');
        });

        test('should not call console.time when debug is disabled', () => {
            debugTime('timer1');
            // In production mode (DEBUG = false), console.time should not be called
            expect(timeCalls.length).toBe(0);
        });

        test('should handle label without crashing', () => {
            expect(() => debugTime('operation')).not.toThrow();
        });
    });

    describe('debugTimeEnd', () => {
        test('should exist', () => {
            expect(typeof debugTimeEnd).toBe('function');
        });

        test('should not call console.timeEnd when debug is disabled', () => {
            debugTimeEnd('timer1');
            // In production mode (DEBUG = false), console.timeEnd should not be called
            expect(timeEndCalls.length).toBe(0);
        });

        test('should handle label without crashing', () => {
            expect(() => debugTimeEnd('operation')).not.toThrow();
        });
    });
});
