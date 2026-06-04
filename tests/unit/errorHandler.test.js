/**
 * @jest-environment jsdom
 *
 * Tests for handleError's user-facing notification contract. The save-recovery
 * code in gameState relies on handleError(..., showToUser=true) actually
 * reaching window.showNotification — which is only wired in gameInit. These
 * tests pin that contract so the save-reset notices can't silently regress.
 */

import { handleError, ErrorCategory, ErrorSeverity } from '../../js/errorHandler.js';

describe('handleError user notification routing', () => {
    let calls;

    beforeEach(() => {
        calls = [];
        window.showNotification = (message, type) => calls.push({ message, type });
    });

    afterEach(() => {
        delete window.showNotification;
    });

    test('routes a user-facing error to window.showNotification when showToUser=true', () => {
        handleError(new Error('save reset'), 'load:validation', true);
        expect(calls).toHaveLength(1);
        expect(calls[0].type).toBe('error');
        expect(typeof calls[0].message).toBe('string');
        expect(calls[0].message.length).toBeGreaterThan(0);
    });

    test('does NOT notify the user when showToUser is false', () => {
        handleError(new Error('internal only'), 'background', false);
        expect(calls).toHaveLength(0);
    });

    test('never throws even if window.showNotification is missing', () => {
        delete window.showNotification;
        expect(() =>
            handleError(new Error('boom'), 'ctx', true, ErrorCategory.GAME_STATE, ErrorSeverity.MEDIUM)
        ).not.toThrow();
    });
});
