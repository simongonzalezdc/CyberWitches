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
    show(message, type = 'info', duration = 3000) {
        if (!this.container) return;

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
            this.queue.push({ message, type, duration });
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

        this.createNotificationElement(message, type, duration);
    }

    createNotificationElement(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message;

        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            this.removeNotification(notification);
        };
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
        }, 300);
    }
}

export const notificationManager = new NotificationManager();

// Export for modules
export const showNotification = (message, type, duration) => {
    notificationManager.show(message, type, duration);
};
