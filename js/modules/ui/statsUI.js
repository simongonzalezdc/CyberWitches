/**
 * StatsUI.js
 * Manages the rendering and updates of the Stats tab.
 */

import { stripEmojisIfLowTier } from './uiHelpers.js';

export class StatsUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.virtualAchievementList = null;
    }

    /**
     * Update stats tab with optimized rendering
     */
    // Helper to create a stat item safely
    createStatItem(label, value, style = null) {
        const item = document.createElement('div');
        item.className = 'card-section';
        item.style.marginBottom = '0';
        if (style) {
            // Parse simple style string or use object
            // For now, assuming style is a string like "color: var(--success); font-weight: bold;"
            // We'll just set specific properties if needed, or use cssText if strictly necessary but safer to avoid
            // However, the input comes from code, so it's relatively safe, but CSP blocks cssText? No, CSP blocks inline style attribute.
            // cssText in JS is allowed. The issue is innerHTML with style="..."
            item.style.cssText += style;
        }

        const labelDiv = document.createElement('div');
        labelDiv.className = 'card-label';
        labelDiv.textContent = label;
        item.appendChild(labelDiv);

        const valueDiv = document.createElement('div');
        valueDiv.className = 'card-value';
        valueDiv.style.wordWrap = 'break-word';
        valueDiv.style.overflowWrap = 'break-word';
        valueDiv.style.whiteSpace = 'normal';
        valueDiv.textContent = value;
        item.appendChild(valueDiv);

        return item;
    }

    update() {
        const container = document.getElementById('stats-tab');
        if (!container) {
            return;
        }

        // Ensure container is visible
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.innerHTML = '';

        // Stats section with two-column layout
        const statsCard = document.createElement('div');
        statsCard.className = 'card force-visible';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'card-title';
        titleDiv.textContent = 'Game Statistics';
        statsCard.appendChild(titleDiv);

        // Create stats container with grid layout
        const statsContainer = document.createElement('div');
        statsContainer.style.display = 'grid';
        statsContainer.style.gridTemplateColumns = '1fr 1fr';
        statsContainer.style.gap = '12px';
        statsContainer.style.padding = '10px';

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
                label: stripEmojisIfLowTier('🧘 Meditation Production Bonus'),
                value: `+${bonusPercent}%`,
                style: 'color: var(--success); font-weight: bold;'
            });
        }

        // Create left column
        const leftColumn = document.createElement('div');
        leftColumn.style.display = 'flex';
        leftColumn.style.flexDirection = 'column';
        leftColumn.style.gap = '10px';
        for (const stat of leftColumnStats) {
            leftColumn.appendChild(this.createStatItem(stat.label, stat.value, stat.style));
        }

        // Create right column
        const rightColumn = document.createElement('div');
        rightColumn.style.display = 'flex';
        rightColumn.style.flexDirection = 'column';
        rightColumn.style.gap = '10px';
        for (const stat of rightColumnStats) {
            rightColumn.appendChild(this.createStatItem(stat.label, stat.value, stat.style));
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
        achievementsContainer.style.display = 'grid';
        achievementsContainer.style.gridTemplateColumns = '1fr 1fr';
        achievementsContainer.style.gap = '12px';
        achievementsContainer.style.padding = '10px';
        achievementsContainer.style.maxHeight = '50vh';
        achievementsContainer.style.overflowY = 'auto';

        // Create left and right columns for achievements
        const achievementsLeftColumn = document.createElement('div');
        achievementsLeftColumn.style.display = 'flex';
        achievementsLeftColumn.style.flexDirection = 'column';
        achievementsLeftColumn.style.gap = '8px';

        const achievementsRightColumn = document.createElement('div');
        achievementsRightColumn.style.display = 'flex';
        achievementsRightColumn.style.flexDirection = 'column';
        achievementsRightColumn.style.gap = '8px';

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

    // Helper function for traditional rendering with two-column layout
    renderAchievementsTraditional(achievementsArray, container, leftColumn, rightColumn) {
        if (!achievementsArray || achievementsArray.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'card-section';
            emptyMsg.style.padding = '10px';
            emptyMsg.style.color = 'var(--text-dim)';
            emptyMsg.style.gridColumn = '1 / -1';
            emptyMsg.textContent = 'No achievements yet.';
            container.appendChild(emptyMsg);
            return;
        }

        // Distribute achievements across two columns
        achievementsArray.forEach((achievement, index) => {
            if (!achievement) return;
            const unlocked = window.achievements && window.achievements.unlockedAchievements ?
                window.achievements.unlockedAchievements.has(achievement.id) : false;

            const item = document.createElement('div');
            item.className = 'card-section achievement-item';
            item.style.padding = '10px';
            item.style.borderRadius = '6px';
            item.style.background = unlocked ? 'rgba(60, 227, 197, 0.2)' : 'rgba(0, 0, 0, 0.3)';
            item.style.marginBottom = '8px';
            item.style.position = 'relative';
            item.style.zIndex = '1';
            item.style.pointerEvents = 'auto';
            item.style.visibility = 'visible';
            item.style.display = 'block';
            item.style.wordWrap = 'break-word';
            item.style.overflowWrap = 'break-word';
            item.style.maxWidth = '100%';
            item.style.boxSizing = 'border-box';
            item.style.overflow = 'visible';
            item.style.lineHeight = '1.5';

            const labelDiv = document.createElement('div');
            labelDiv.className = 'card-label';
            labelDiv.style.color = unlocked ? 'var(--success)' : 'var(--text-dim)';
            labelDiv.style.wordWrap = 'break-word';
            labelDiv.style.overflowWrap = 'break-word';
            labelDiv.style.marginBottom = '6px';
            labelDiv.style.fontWeight = '600';
            labelDiv.style.lineHeight = '1.5';
            labelDiv.style.display = 'block';
            labelDiv.style.whiteSpace = 'normal';
            labelDiv.textContent = `${stripEmojisIfLowTier(unlocked ? '✓' : '○')} ${achievement.name || 'Unknown Achievement'}`;
            item.appendChild(labelDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'card-description';
            descDiv.style.fontSize = '11px';
            descDiv.style.wordWrap = 'break-word';
            descDiv.style.overflowWrap = 'break-word';
            descDiv.style.maxWidth = '100%';
            descDiv.style.lineHeight = '1.5';
            descDiv.style.color = 'var(--text-dim)';
            descDiv.style.display = 'block';
            descDiv.style.whiteSpace = 'normal';
            descDiv.style.marginBottom = '4px';
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
                        progressContainer.style.marginTop = '8px';

                        const barContainer = document.createElement('div');
                        barContainer.className = 'progress-bar-container';
                        barContainer.style.width = '100%';
                        barContainer.style.height = '8px';
                        barContainer.style.background = 'rgba(0, 0, 0, 0.3)';
                        barContainer.style.borderRadius = '4px';
                        barContainer.style.overflow = 'hidden';

                        const bar = document.createElement('div');
                        bar.className = 'progress-bar';
                        bar.style.width = `${percentage}%`;
                        bar.style.height = '100%';
                        bar.style.background = 'var(--primary, #FF2DAA)';
                        bar.style.transition = 'width 0.3s';
                        barContainer.appendChild(bar);
                        progressContainer.appendChild(barContainer);

                        const textDiv = document.createElement('div');
                        textDiv.className = 'progress-text';
                        textDiv.style.fontSize = '11px';
                        textDiv.style.color = 'var(--text-dim)';
                        textDiv.style.marginTop = '4px';
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
