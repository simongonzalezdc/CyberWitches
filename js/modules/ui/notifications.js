import { stripEmojisIfLowTier } from './uiHelpers.js';

export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-relevant', 'additions removals');

        // State
        this.queue = [];
        this.count = 0;
        this.lastReset = Date.now();
        this.maxPerSecond = 3;
        /** Max simultaneous toasts — keeps workstation board readable (S+ visual bar). */
        this.maxVisible = 2;
        this.lastSoundTime = 0;
        this.soundThrottle = 500;
        this._draining = false;

        // Dependencies
        this.audioSystem = null;
        this.analyticsManager = null;
    }

    setAudioSystem(audioSystem) {
        this.audioSystem = audioSystem;
    }

    setAnalyticsManager(analyticsManager) {
        this.analyticsManager = analyticsManager;
    }

    /**
     * Show a notification.
     * Default is text-safe (textContent). Pass { html: true } only for trusted templates.
     * @param {string} message
     * @param {string} type
     * @param {number} duration
     * @param {{ html?: boolean }} options
     */
    show(message, type = 'info', duration = 3000, options = {}) {
        if (!this.container) return;

        // Sticky trust decision: only explicit opt-in, never content sniffing
        const allowHtml = options.html === true;
        const opts = { html: allowHtml };

        // Remove emojis if low tier
        message = stripEmojisIfLowTier(message);

        // Track analytics
        if (this.analyticsManager && this.analyticsManager.enabled) {
            this.analyticsManager.track('notification_shown', {
                type,
                message: String(message).substring(0, 50)
            });
        }

        // Rate limiting
        const now = Date.now();
        if (now - this.lastReset > 1000) {
            this.count = 0;
            this.lastReset = now;
        }

        if (this.count >= this.maxPerSecond) {
            // Preserve trust decision at enqueue time
            this.queue.push({ message, type, duration, options: opts });
            return;
        }

        this.count++;
        this._playSound(message, type, now);
        this._render(message, type, duration, opts);
    }

    /**
     * Plain-text notification (safe default).
     */
    showText(message, type = 'info', duration = 3000) {
        this.show(message, type, duration, { html: false });
    }

    /**
     * Trusted HTML notification (icons/templates only). Caller must escape untrusted values.
     */
    showHtml(message, type = 'info', duration = 3000) {
        this.show(message, type, duration, { html: true });
    }

    _playSound(message, type, now = Date.now()) {
        if (this.audioSystem && this.audioSystem.playSound) {
            if (now - this.lastSoundTime >= this.soundThrottle) {
                if (type === 'error') {
                    this.audioSystem.playSound('error', { volume: 0.3 });
                } else if (type === 'success') {
                    if (!String(message).includes('Achievement')) {
                        this.audioSystem.playSound('success', { volume: 0.3 });
                    }
                } else {
                    this.audioSystem.playSound('notification', { volume: 0.3 });
                }
                this.lastSoundTime = now;
            }
        }
    }

    _render(message, type, duration, options = {}) {
        const allowHtml = options.html === true;
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', type === 'error' ? 'alert' : 'status');

        // Message body (separate from close button so textContent is safe)
        const body = document.createElement('span');
        body.className = 'notification-body';
        if (allowHtml) {
            body.innerHTML = message;
        } else {
            body.textContent = String(message ?? '');
        }
        notification.appendChild(body);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Dismiss notification');
        closeBtn.textContent = 'x';
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        notification.appendChild(closeBtn);

        this.container.appendChild(notification);
        this._enforceMaxVisible();

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove — store timer so removeNotification can cancel it
        /** @type {any} */
        const el = notification;
        el._autoRemoveTimer = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    /**
     * Drop oldest visible toasts beyond maxVisible so the main board stays usable.
     * Immediate DOM removal (no fade queue) so the cap is hard, not eventual.
     */
    _enforceMaxVisible() {
        if (!this.container) return;
        const max = Math.max(1, Number(this.maxVisible) || 2);
        const nodes = /** @type {HTMLElement[]} */ (
            Array.from(this.container.querySelectorAll('.notification:not(.fade-out)'))
        );
        // Oldest first (DOM order)
        while (nodes.length > max) {
            const oldest = nodes.shift();
            if (!oldest) break;
            /** @type {any} */
            const el = oldest;
            if (el._autoRemoveTimer) {
                clearTimeout(el._autoRemoveTimer);
                el._autoRemoveTimer = null;
            }
            el._removing = true;
            if (oldest.parentNode) oldest.parentNode.removeChild(oldest);
        }
    }

    removeNotification(notification) {
        /** @type {any} */
        const el = notification;
        if (!el || el._removing) return;
        el._removing = true;

        if (el._autoRemoveTimer) {
            clearTimeout(el._autoRemoveTimer);
            el._autoRemoveTimer = null;
        }

        notification.classList.remove('show');
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this._drainQueueOnce();
        }, 300);
    }

    _drainQueueOnce() {
        if (this._draining || this.queue.length === 0) return;
        this._draining = true;
        try {
            // Allow rate window to open for queued items when prior ones finish
            const now = Date.now();
            if (now - this.lastReset > 1000) {
                this.count = 0;
                this.lastReset = now;
            }
            if (this.count >= this.maxPerSecond) {
                // Still limited — leave queue; next removal will try again
                return;
            }
            const next = this.queue.shift();
            if (!next) return;
            this.count++;
            this._playSound(next.message, next.type, now);
            // options already sticky from enqueue
            this._render(next.message, next.type, next.duration, next.options || { html: false });
        } finally {
            this._draining = false;
        }
    }
}

export const notificationManager = new NotificationManager();

export const showNotification = (message, type, duration, options) => {
    notificationManager.show(message, type, duration, options);
};

export const showText = (message, type, duration) => {
    notificationManager.showText(message, type, duration);
};

export const showHtml = (message, type, duration) => {
    notificationManager.showHtml(message, type, duration);
};
