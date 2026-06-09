/**
 * StatsUI.js
 * Manages the rendering and updates of the Stats tab.
 */

import { stripEmojisIfLowTier } from './uiHelpers.js';
import { escapeHtml } from '../../utils.js';

export class StatsUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.virtualAchievementList = null;
    }

    /**
     * Update stats tab with optimized rendering
     */
    update() {
        const container = document.getElementById('stats-tab');
        if (!container) {
            return;
        }

        // Ensure container is visible
        container.className = 'stats-tab-container';
        container.innerHTML = '';

        // Check if game has started (no casts yet)
        if (this.gameState.totalTaps === 0) {
            container.innerHTML = `
                <div class="empty-state-container">
                    <div class="empty-state-sigil" aria-hidden="true"></div>
                    <p class="empty-state-message">> AWAITING_DATA_STREAM. Metrics will populate after first execution.</p>
                </div>
            `;
            return;
        }

        // Stats section with two-column layout
        const statsCard = document.createElement('div');
        statsCard.className = 'card force-visible';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'card-title';
        titleDiv.textContent = 'Game Statistics';
        statsCard.appendChild(titleDiv);

        // Create stats container with grid layout
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-grid';

        // Split stats into two columns
        const leftColumnStats = [
            { label: 'Total Casts', value: this.gameState.totalTaps },
            { label: 'Total Arcane Bits Earned', value: window.formatShort(this.gameState.abTotalEarned) },
            { label: 'Arcane Bits Per Second', value: window.formatShort(this.gameState.getAbPerSecond()) },
            { label: 'Recipes Discovered', value: this.gameState.discoveredRecipes.length },
            { label: 'Achievements', value: window.achievements ? `${window.achievements.getUnlockedCount()}/${window.achievements.getTotalCount()}` : '0/0' }
        ];

        const rightColumnStats = [
            { label: 'Workstations Crafted', value: this.gameState.totalWorkstationsCrafted },
            { label: 'Current Arcane Bits', value: window.formatShort(this.gameState.ab) },
            { label: 'Prestige Points', value: this.gameState.prestigePoints },
            { label: 'Max Combo', value: window.comboSystem ? window.comboSystem.maxCombo : 0 }
        ];

        // Add meditation production bonus if meditation is unlocked
        if (window.meditationState && typeof window.meditationState.getMeditationProductionBonus === 'function') {
            const meditationBonus = window.meditationState.getMeditationProductionBonus();
            const bonusPercent = ((meditationBonus - 1.0) * 100).toFixed(1);
            rightColumnStats.push({
                label: stripEmojisIfLowTier('Meditation Production Bonus'),
                value: `+${bonusPercent}%`,
                className: 'text-success font-bold'
            });
        }

        // Create left column
        const leftColumn = document.createElement('div');
        leftColumn.className = 'stats-column';
        for (const stat of leftColumnStats) {
            leftColumn.appendChild(this.createStatItem(stat.label, stat.value, stat.className));
        }

        // Create right column
        const rightColumn = document.createElement('div');
        rightColumn.className = 'stats-column';
        for (const stat of rightColumnStats) {
            rightColumn.appendChild(this.createStatItem(stat.label, stat.value, stat.className));
        }

        statsContainer.appendChild(leftColumn);
        statsContainer.appendChild(rightColumn);
        statsCard.appendChild(statsContainer);
        container.appendChild(statsCard);

        // Achievements section with two-column layout
        const achievementsCard = document.createElement('div');
        achievementsCard.className = 'card force-visible';

        const achTitleDiv = document.createElement('div');
        achTitleDiv.className = 'card-title';
        achTitleDiv.textContent = 'Achievements';
        achievementsCard.appendChild(achTitleDiv);

        // Create achievements container with grid layout (two columns)
        const achievementsContainer = document.createElement('div');
        achievementsContainer.className = 'achievements-grid-container';

        // Create left and right columns for achievements
        const achievementsLeftColumn = document.createElement('div');
        achievementsLeftColumn.className = 'achievements-column';

        const achievementsRightColumn = document.createElement('div');
        achievementsRightColumn.className = 'achievements-column';

        // Get achievements array
        let achievementsArray = [];
        if (window.achievements) {
            achievementsArray = window.achievements.achievements ||
                (typeof window.achievements.getAllAchievements === 'function' ? window.achievements.getAllAchievements() : []);
        }

        this.renderAchievementsTraditional(achievementsArray, achievementsContainer, achievementsLeftColumn, achievementsRightColumn);

        achievementsCard.appendChild(achievementsContainer);
        container.appendChild(achievementsCard);
    }

    // Helper to create a stat item safely
    createStatItem(label, value, className = null) {
        const item = document.createElement('div');
        item.className = 'card-section stat-item';
        if (className) {
            // If className is provided, apply it to the value div or item?
            // Based on previous usage, it seemed to be for the value style.
            // But here I'll apply it to the item or value?
            // Let's apply to value for now as that's where the style was.
        }

        const labelDiv = document.createElement('div');
        labelDiv.className = 'card-label';
        labelDiv.textContent = label;
        item.appendChild(labelDiv);

        const valueDiv = document.createElement('div');
        valueDiv.className = 'card-value stat-value';
        if (className) {
            valueDiv.className += ' ' + className;
        }
        valueDiv.textContent = value;
        item.appendChild(valueDiv);

        return item;
    }

    // Helper function for traditional rendering with two-column layout
    renderAchievementsTraditional(achievementsArray, container, leftColumn, rightColumn) {
        if (!achievementsArray || achievementsArray.length === 0) {
            container.innerHTML = `
                <div class="empty-state-container" style="min-height: 120px; padding: 20px;">
                    <p class="empty-state-message" style="font-size: 14px;">> NO_ACHIEVEMENTS_DETECTED. Complete rituals to earn recognition.</p>
                </div>
            `;
            return;
        }

        // Distribute achievements across two columns
        achievementsArray.forEach((achievement, index) => {
            if (!achievement) return;
            const unlocked = window.achievements && window.achievements.unlockedAchievements ?
                window.achievements.unlockedAchievements.has(achievement.id) : false;

            const item = document.createElement('div');
            item.className = `card-section achievement-item ${unlocked ? 'unlocked' : 'locked'}`;

            const labelDiv = document.createElement('div');
            labelDiv.className = `card-label achievement-label ${unlocked ? 'text-success' : 'text-dim'}`;
            labelDiv.textContent = `${stripEmojisIfLowTier(unlocked ? '✓' : '○')} ${achievement.name || 'Unknown Achievement'}`;
            item.appendChild(labelDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'card-description achievement-desc';
            descDiv.textContent = achievement.description || 'No description';
            item.appendChild(descDiv);

            // Calculate progress if achievement has progress tracking
            if (!unlocked && achievement.checkProgress && typeof achievement.checkProgress === 'function') {
                try {
                    const progress = achievement.checkProgress(this.gameState);
                    if (progress && progress.current !== undefined && progress.target !== undefined) {
                        const percentage = Math.min(100, Math.round((progress.current / progress.target) * 100));

                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'achievement-progress';

                        const barContainer = document.createElement('div');
                        barContainer.className = 'progress-bar-container achievement-bar-container';

                        const bar = document.createElement('div');
                        bar.className = 'progress-bar';
                        // Setting style.width programmatically is CSP-safe (no inline style attribute in markup).
                        bar.style.width = `${percentage}%`;

                        barContainer.appendChild(bar);
                        progressContainer.appendChild(barContainer);

                        const textDiv = document.createElement('div');
                        textDiv.className = 'progress-text achievement-progress-text';
                        textDiv.textContent = `${progress.current} / ${progress.target} (${percentage}%)`;
                        progressContainer.appendChild(textDiv);

                        item.appendChild(progressContainer);
                    }
                } catch (e) {
                    console.warn('Error calculating achievement progress:', e);
                }
            }

            // Alternate between left and right columns
            if (index % 2 === 0) {
                leftColumn.appendChild(item);
            } else {
                rightColumn.appendChild(item);
            }
        });

        // Append columns to container
        container.appendChild(leftColumn);
        container.appendChild(rightColumn);
    }
}
