/**
 * @jest-environment jsdom
 */
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
    handleError,
    notifyPlayer,
    reportThrottledFailure,
    ErrorSeverity
} from '../../js/errorHandler.js';

describe('silent failure surface', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="craft-notifications"></div>';
        window.showNotification = jest.fn();
        window.__appendSystemLog = jest.fn();
        window.announceToScreenReader = jest.fn();
    });

    afterEach(() => {
        delete window.showNotification;
        delete window.__appendSystemLog;
        delete window.announceToScreenReader;
    });

    test('handleError always hits SYSTEM_LOG bridge and can notify', () => {
        handleError(new Error('boom save failed'), 'save', true);
        expect(window.__appendSystemLog).toHaveBeenCalled();
        expect(window.showNotification).toHaveBeenCalled();
        const msg = window.showNotification.mock.calls[0][0];
        expect(String(msg).toLowerCase()).toMatch(/save|progress/);
    });

    test('handleError load:migration uses player-facing message', () => {
        handleError(
            new Error('Your save could not be upgraded to this version and was reset. A backup was kept in this browser.'),
            'load:migration',
            true
        );
        expect(window.showNotification).toHaveBeenCalled();
        expect(window.showNotification.mock.calls[0][0]).toMatch(/upgraded|reset|backup/i);
    });

    test('reportThrottledFailure rate-limits spam', () => {
        const a = reportThrottledFailure('k1', new Error('x'), 'gameLoop:logic', { showToUser: false });
        const b = reportThrottledFailure('k1', new Error('x'), 'gameLoop:logic', { showToUser: false });
        expect(a).toBe(true);
        expect(b).toBe(false);
        expect(window.__appendSystemLog).toHaveBeenCalledTimes(1);
    });

    test('notifyPlayer writes system log and notification', () => {
        notifyPlayer('Save integrity repaired', 'load:checksum', 'warning');
        expect(window.__appendSystemLog).toHaveBeenCalled();
        expect(window.showNotification).toHaveBeenCalledWith(
            'Save integrity repaired',
            'warning',
            5000
        );
    });

    test('handleError coerces non-Error throws', () => {
        handleError('string failure', 'tick', false, undefined, ErrorSeverity.MEDIUM);
        expect(window.__appendSystemLog).toHaveBeenCalled();
        const line = window.__appendSystemLog.mock.calls[0][0];
        expect(line).toMatch(/string failure/);
    });
});
