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
        this.lastSoundTime = 0;
        this.soundThrottle = 500;

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
     * Show a notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info, warning)
     * @param {number} duration - Duration in ms
     */
    show(message, type = 'info', duration = 3000, options = {}) {
        if (!this.container) return;

        // Default is text-safe; opt into HTML via options.html or showHtml().
        // Also allow known trusted icon templates from our own call sites.
        const looksLikeTrustedIconTemplate =
            typeof message === 'string' &&
            message.includes('css-icon-') &&
            !message.includes('<script') &&
            !message.includes('onerror=');
        const allowHtml = options.html === true || looksLikeTrustedIconTemplate;

        // Remove emojis if low tier
        message = stripEmojisIfLowTier(message);

        // Track analytics
        if (this.analyticsManager && this.analyticsManager.enabled) {
            this.analyticsManager.track('notification_shown', {
                type,
                message: message.substring(0, 50)
            });
        }

        // Rate limiting
        const now = Date.now();
        if (now - this.lastReset > 1000) {
            this.count = 0;
            this.lastReset = now;
        }

        if (this.count >= this.maxPerSecond) {
            this.queue.push({ message, type, duration, options: { html: allowHtml } });
            return;
        }

        this.count++;

        // Play sound
        if (this.audioSystem && this.audioSystem.playSound) {
            if (now - this.lastSoundTime >= this.soundThrottle) {
                if (type === 'error') {
                    this.audioSystem.playSound('error', { volume: 0.3 });
                } else if (type === 'success') {
                    if (!message.includes('Achievement')) {
                        this.audioSystem.playSound('success', { volume: 0.3 });
                    }
                } else {
                    this.audioSystem.playSound('notification', { volume: 0.3 });
                }
                this.lastSoundTime = now;
            }
        }

        this.createNotificationElement(message, type, duration, { html: allowHtml });
    }

    /**
     * Show plain-text notification (safe default; no HTML).
     */
    showText(message, type = 'info', duration = 3000) {
        this.show(message, type, duration, { html: false });
    }

    /**
     * Show trusted HTML notification (icons/templates only).
     */
    showHtml(message, type = 'info', duration = 3000) {
        this.show(message, type, duration, { html: true });
    }

    createNotificationElement(message, type, duration, options = {}) {
        const allowHtml = options.html === true;
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
        if (allowHtml) {
            notification.innerHTML = message;
        } else {
            notification.textContent = String(message ?? '');
        }

        // Add close button
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

        // Animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                this.removeNotification(notification);
            }
        }, duration);
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            // Drain one queued notification if rate-limit had deferred it
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.show(next.message, next.type, next.duration, next.options || {});
            }
        }, 300);
    }
}

export const notificationManager = new NotificationManager();

// Export for modules
export const showNotification = (message, type, duration, options) => {
    notificationManager.show(message, type, duration, options);
};
