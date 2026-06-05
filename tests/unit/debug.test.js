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

        originalLog = console.log;
        originalWarn = console.warn;
        originalError = console.error;
        originalGroup = console.group;
        originalGroupEnd = console.groupEnd;
        originalTime = console.time;
        originalTimeEnd = console.timeEnd;

        console.log = (...args) => { logCalls.push(args); };
        console.warn = (...args) => { warnCalls.push(args); };
        console.error = (...args) => { errorCalls.push(args); };
        console.group = (label) => { groupCalls.push(label); };
        console.groupEnd = () => { groupEndCalls++; };
        console.time = (label) => { timeCalls.push(label); };
        console.timeEnd = (label) => { timeEndCalls.push(label); };
    });

    afterEach(() => {
        console.log = originalLog;
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

        test('should call console.log in debug mode', () => {
            debugLog('test message');
            expect(logCalls.length).toBeGreaterThan(0);
        });

        test('should pass arguments to console.log', () => {
            debugLog('message', 123, { key: 'value' });
            expect(logCalls[logCalls.length - 1]).toEqual(['message', 123, { key: 'value' }]);
        });
    });

    describe('debugWarn', () => {
        test('should exist', () => {
            expect(typeof debugWarn).toBe('function');
        });

        test('should call console.warn in debug mode', () => {
            debugWarn('warning message');
            expect(warnCalls.length).toBeGreaterThan(0);
        });

        test('should pass arguments to console.warn', () => {
            debugWarn('warning', 456);
            expect(warnCalls[warnCalls.length - 1]).toEqual(['warning', 456]);
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

        test('should call console.group', () => {
            debugGroup('Test Group');
            expect(groupCalls.length).toBeGreaterThan(0);
        });

        test('should pass label to console.group', () => {
            debugGroup('My Group');
            expect(groupCalls[groupCalls.length - 1]).toBe('My Group');
        });
    });

    describe('debugGroupEnd', () => {
        test('should exist', () => {
            expect(typeof debugGroupEnd).toBe('function');
        });

        test('should call console.groupEnd', () => {
            debugGroupEnd();
            expect(groupEndCalls).toBeGreaterThan(0);
        });
    });

    describe('debugTime', () => {
        test('should exist', () => {
            expect(typeof debugTime).toBe('function');
        });

        test('should call console.time', () => {
            debugTime('timer1');
            expect(timeCalls.length).toBeGreaterThan(0);
        });

        test('should pass label to console.time', () => {
            debugTime('operation');
            expect(timeCalls[timeCalls.length - 1]).toBe('operation');
        });
    });

    describe('debugTimeEnd', () => {
        test('should exist', () => {
            expect(typeof debugTimeEnd).toBe('function');
        });

        test('should call console.timeEnd', () => {
            debugTimeEnd('timer1');
            expect(timeEndCalls.length).toBeGreaterThan(0);
        });

        test('should pass label to console.timeEnd', () => {
            debugTimeEnd('operation');
            expect(timeEndCalls[timeEndCalls.length - 1]).toBe('operation');
        });
    });
});
