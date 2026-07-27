/**
 * @jest-environment jsdom
 */
import { NotificationManager } from '../../js/modules/ui/notifications.js';

describe('NotificationManager S+ stack cap', () => {
    /** @type {NotificationManager} */
    let mgr;

    beforeEach(() => {
        document.body.innerHTML = '';
        mgr = new NotificationManager();
        mgr.maxVisible = 2;
        mgr.maxPerSecond = 100; // disable rate limit for stack tests
    });

    test('never keeps more than maxVisible toasts in DOM', () => {
        mgr.show('one', 'info', 60000);
        mgr.show('two', 'info', 60000);
        mgr.show('three', 'info', 60000);
        const nodes = document.querySelectorAll('#notification-container .notification');
        expect(nodes.length).toBeLessThanOrEqual(2);
    });

    test('newest toasts survive when stack is full', () => {
        mgr.show('A', 'info', 60000);
        mgr.show('B', 'info', 60000);
        mgr.show('C', 'info', 60000);
        const text = Array.from(document.querySelectorAll('.notification-body')).map(
            (el) => el.textContent
        );
        expect(text).toContain('C');
        expect(text.length).toBeLessThanOrEqual(2);
        // Oldest A should be gone
        expect(text).not.toContain('A');
    });

    test('maxVisible defaults to 2', () => {
        const m = new NotificationManager();
        expect(m.maxVisible).toBe(2);
    });
});
