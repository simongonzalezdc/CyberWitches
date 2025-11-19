/**
 * Notification System
 * Handles displaying toast notifications to the user
 */

export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info, warning)
     * @param {number} duration - Duration in ms
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message; // Allow HTML for icons

        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
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
                notification.classList.remove('show');
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
}

export const notificationManager = new NotificationManager();

// Global helper for backward compatibility
window.showNotification = (message, type, duration) => {
    notificationManager.show(message, type, duration);
};
