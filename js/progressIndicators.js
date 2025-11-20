/**
 * Progress Indicators System
 * Provides progress bars and indicators for milestones, achievements, and goals
 */

class ProgressIndicatorManager {
    constructor() {
        this.progressTrackers = new Map();
        this.init();
    }

    init() {
        // Set up progress indicators for various game systems
        this.setupMilestoneProgress();
        this.setupAchievementProgress();
        this.setupPrestigeProgress();
    }

    /**
     * Create progress bar element
     * @param {string} id - Progress bar ID
     * @param {string} label - Progress label
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @param {string} color - Progress bar color
     * @returns {HTMLElement} - Progress bar element
     */
    createProgressBar(id, label, current, target, color = 'var(--primary, #FF2DAA)') {
        const container = document.createElement('div');
        container.className = 'progress-indicator';
        container.id = id;
        // container.style.marginBottom = '16px'; // Moved to CSS

        const labelDiv = document.createElement('div');
        labelDiv.className = 'progress-label';
        // Styles moved to CSS

        const labelText = document.createElement('span');
        labelText.textContent = label;

        const valueText = document.createElement('span');
        valueText.className = 'progress-value';
        const percentage = Math.min(100, Math.round((current / target) * 100));
        valueText.textContent = `${this.formatValue(current)} / ${this.formatValue(target)} (${percentage}%)`;

        labelDiv.appendChild(labelText);
        labelDiv.appendChild(valueText);

        const barContainer = document.createElement('div');
        barContainer.className = 'progress-bar-container';
        // Styles moved to CSS

        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.width = `${percentage}%`;
        bar.style.backgroundColor = color;
        // Other styles moved to CSS

        barContainer.appendChild(bar);
        container.appendChild(labelDiv);
        container.appendChild(barContainer);

        // Store progress data
        this.progressTrackers.set(id, {
            current,
            target,
            label,
            color,
            element: container,
            bar: bar,
            valueText: valueText
        });

        return container;
    }

    /**
     * Update progress bar
     * @param {string} id - Progress bar ID
     * @param {number} current - Current value
     * @param {number} target - Target value (optional)
     */
    updateProgressBar(id, current, target = null) {
        const tracker = this.progressTrackers.get(id);
        if (!tracker) return;

        tracker.current = current;
        if (target !== null) {
            tracker.target = target;
        }

        const percentage = Math.min(100, Math.round((tracker.current / tracker.target) * 100));

        // Update bar width
        if (tracker.bar) {
            tracker.bar.style.width = `${percentage}%`;
        }

        // Update value text
        if (tracker.valueText) {
            tracker.valueText.textContent = `${this.formatValue(tracker.current)} / ${this.formatValue(tracker.target)} (${percentage}%)`;
        }
    }

    /**
     * Format value for display
     * @param {number} value - Value to format
     * @returns {string} - Formatted value
     */
    formatValue(value) {
        if (value >= 1e12) {
            return (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(2) + 'K';
        }
        return Math.round(value).toString();
    }

    /**
     * Create milestone progress indicator
     * @param {string} milestoneId - Milestone ID
     * @param {number} current - Current progress
     * @param {number} target - Target value
     * @returns {HTMLElement} - Progress indicator element
     */
    createMilestoneProgress(milestoneId, current, target) {
        return this.createProgressBar(
            `milestone-${milestoneId}`,
            `Milestone: ${milestoneId}`,
            current,
            target,
            'var(--secondary, #00D4FF)'
        );
    }

    /**
     * Create achievement progress indicator
     * @param {string} achievementId - Achievement ID
     * @param {number} current - Current progress
     * @param {number} target - Target value
     * @returns {HTMLElement} - Progress indicator element
     */
    createAchievementProgress(achievementId, current, target) {
        return this.createProgressBar(
            `achievement-${achievementId}`,
            `Achievement: ${achievementId}`,
            current,
            target,
            'var(--success, #00FF88)'
        );
    }

    /**
     * Create prestige progress indicator
     * @param {number} current - Current prestige points
     * @param {number} target - Target prestige points
     * @returns {HTMLElement} - Progress indicator element
     */
    createPrestigeProgress(current, target) {
        return this.createProgressBar(
            'prestige-progress',
            'Next Prestige',
            current,
            target,
            'var(--primary, #FF2DAA)'
        );
    }

    /**
     * Setup milestone progress tracking
     */
    setupMilestoneProgress() {
        // This will be called when milestones are displayed
        // Implementation in game.js
    }

    /**
     * Setup achievement progress tracking
     */
    setupAchievementProgress() {
        // This will be called when achievements are displayed
        // Implementation in game.js
    }

    /**
     * Setup prestige progress tracking
     */
    setupPrestigeProgress() {
        // This will be called when prestige modal is shown
        // Implementation in game.js
    }

    /**
     * Show "X more to unlock Y" message
     * @param {string} targetId - Target ID (e.g., upgrade ID, milestone ID)
     * @param {number} remaining - Remaining amount needed
     * @param {string} resource - Resource name
     * @returns {HTMLElement} - Message element
     */
    createUnlockMessage(targetId, remaining, resource = 'AB') {
        const message = document.createElement('div');
        message.className = 'unlock-message';
        // Styles moved to CSS

        message.innerHTML = `
            <span class="unlock-message-highlight">
                ${this.formatValue(remaining)} more ${resource}
            </span>
            to unlock <strong>${targetId}</strong>
        `;

        return message;
    }
}

// Create global instance
const progressIndicatorManager = new ProgressIndicatorManager();

// Global functions for compatibility
window.createProgressBar = (id, label, current, target, color) => {
    return progressIndicatorManager.createProgressBar(id, label, current, target, color);
};

window.updateProgressBar = (id, current, target) => {
    progressIndicatorManager.updateProgressBar(id, current, target);
};

export default progressIndicatorManager;

