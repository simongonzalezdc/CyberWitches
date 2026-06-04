/**
 * Notifier port.
 *
 * The seam game-logic modules emit player-facing notifications through, so they
 * depend on a one-function interface — notify(message, type, duration) — instead
 * of holding the whole UIManager. The notification *renderer*
 * (modules/ui/notifications.js) is the production adapter behind this port; a
 * test can inject its own adapter to assert what a module emits.
 *
 * Modules should take `notify` as an injected dependency (defaulting to the
 * export here) rather than importing it directly, so the seam stays testable.
 */
import { showNotification } from '../modules/ui/notifications.js';

/**
 * @param {string} message
 * @param {'info'|'success'|'warning'|'error'} [type]
 * @param {number} [duration]
 */
export function notify(message, type = 'info', duration = 3000) {
    showNotification(message, type, duration);
}
