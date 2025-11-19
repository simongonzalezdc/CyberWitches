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
    update() {
        // console.log('updateStatsTab called, gameState exists:', !!this.gameState, 'achievements exists:', !!window.achievements);

        const container = document.getElementById('stats-tab');
        if (!container) {
            // console.error('stats-tab container not found!');
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
        statsCard.className = 'card';
        statsCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
        statsCard.innerHTML = '<div class="card-title">Game Statistics</div>';

        // Create stats container with grid layout
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 10px;';

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
        leftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
        for (const stat of leftColumnStats) {
            const item = document.createElement('div');
            if (stat.style) {
                item.style.cssText = stat.style;
            }
            item.className = 'card-section';
            item.style.cssText += 'margin-bottom: 0;';
            item.innerHTML = `
                <div class="card-label">${stat.label}</div>
                <div class="card-value" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${stat.value}</div>
            `;
            leftColumn.appendChild(item);
        }

        // Create right column
        const rightColumn = document.createElement('div');
        rightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
        for (const stat of rightColumnStats) {
            const item = document.createElement('div');
            if (stat.style) {
                item.style.cssText = stat.style;
            }
            item.className = 'card-section';
            item.style.cssText += 'margin-bottom: 0;';
            item.innerHTML = `
                <div class="card-label">${stat.label}</div>
                <div class="card-value" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${stat.value}</div>
            `;
            rightColumn.appendChild(item);
        }

        statsContainer.appendChild(leftColumn);
        statsContainer.appendChild(rightColumn);
        statsCard.appendChild(statsContainer);
        container.appendChild(statsCard);

        // Achievements section with two-column layout
        const achievementsCard = document.createElement('div');
        achievementsCard.className = 'card';
        achievementsCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
        achievementsCard.innerHTML = '<div class="card-title">Achievements</div>';

        // Create achievements container with grid layout (two columns)
        const achievementsContainer = document.createElement('div');
        achievementsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 10px; max-height: 50vh; overflow-y: auto;';

        // Create left and right columns for achievements
        const achievementsLeftColumn = document.createElement('div');
        achievementsLeftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        const achievementsRightColumn = document.createElement('div');
        achievementsRightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        const achievementsList = document.createElement('div');
        achievementsList.className = 'content-list';
        achievementsList.style.cssText = 'display: none;'; // Hidden, we'll use the columns instead

        // Destroy existing virtual list if it exists
        if (this.virtualAchievementList) {
            try {
                this.virtualAchievementList.destroy();
            } catch (e) {
                console.error('Error destroying virtual achievement list:', e);
            }
            this.virtualAchievementList = null;
        }

        // Get achievements array - check multiple possible structures
        let achievementsArray = [];
        if (window.achievements) {
            achievementsArray = window.achievements.achievements ||
                (typeof window.achievements.getAllAchievements === 'function' ? window.achievements.getAllAchievements() : []);
        }
        // console.log('Achievements array length:', achievementsArray.length);

        // Always use traditional rendering for achievements (simpler and more reliable)
        // DISABLED: Virtual scroll causes items to disappear - using traditional rendering instead
        if (false && achievementsArray && achievementsArray.length > 10 && window.VirtualAchievementList) {
            console.log('Using virtual scrolling for', achievementsArray.length, 'achievements');
            try {
                this.virtualAchievementList = new window.VirtualAchievementList(achievementsList, achievementsArray, window.achievements);
                // Force initial render after a short delay
                setTimeout(() => {
                    if (this.virtualAchievementList && this.virtualAchievementList._constructorComplete) {
                        console.log('Forcing virtual scroll initial render for achievements...');
                        this.virtualAchievementList.updateContainerHeight();
                        this.virtualAchievementList.renderVisibleItems();
                    }
                }, 50);
            } catch (e) {
                console.error('Error creating virtual achievement list:', e);
                // Fall back to traditional rendering
                this.renderAchievementsTraditional(achievementsArray, achievementsContainer, achievementsLeftColumn, achievementsRightColumn);
            }
        } else {
            // Traditional rendering for all lists
            this.renderAchievementsTraditional(achievementsArray, achievementsContainer, achievementsLeftColumn, achievementsRightColumn);
        }

        achievementsCard.appendChild(achievementsContainer);
        container.appendChild(achievementsCard);

        // console.log('Stats tab updated, container children:', container.children.length);
    }

    // Helper function for traditional rendering with two-column layout
    renderAchievementsTraditional(achievementsArray, container, leftColumn, rightColumn) {
        // console.log('Using traditional rendering for', achievementsArray.length, 'achievements');

        if (!achievementsArray || achievementsArray.length === 0) {
            console.warn('No achievements to render');
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'card-section';
            emptyMsg.style.cssText = 'padding: 10px; color: var(--text-dim); grid-column: 1 / -1;';
            emptyMsg.textContent = 'No achievements yet.';
            container.appendChild(emptyMsg);
            return;
        }

        // Distribute achievements across two columns
        achievementsArray.forEach((achievement, index) => {
            if (!achievement) return;
            const unlocked = window.achievements && window.achievements.unlockedAchievements ?
                window.achievements.unlockedAchievements.has(achievement.id) : false;

            // Calculate progress if achievement has progress tracking
            let progressHTML = '';
            if (!unlocked && achievement.checkProgress && typeof achievement.checkProgress === 'function') {
                try {
                    const progress = achievement.checkProgress(this.gameState);
                    if (progress && progress.current !== undefined && progress.target !== undefined) {
                        const percentage = Math.min(100, Math.round((progress.current / progress.target) * 100));
                        progressHTML = `
                            <div class="achievement-progress" style="margin-top: 8px;">
                                <div class="progress-bar-container" style="width: 100%; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; overflow: hidden;">
                                    <div class="progress-bar" style="width: ${percentage}%; height: 100%; background: var(--primary, #FF2DAA); transition: width 0.3s;"></div>
                                </div>
                                <div class="progress-text" style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">
                                    ${progress.current} / ${progress.target} (${percentage}%)
                                </div>
                            </div>
                        `;
                    }
                } catch (e) {
                    console.warn('Error calculating achievement progress:', e);
                }
            }

            const item = document.createElement('div');
            item.className = 'card-section achievement-item';
            item.style.cssText = `padding: 10px; border-radius: 6px; background: ${unlocked ? 'rgba(60, 227, 197, 0.2)' : 'rgba(0, 0, 0, 0.3)'}; margin-bottom: 8px; position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; box-sizing: border-box; overflow: visible; line-height: 1.5;`;
            item.innerHTML = `
                <div class="card-label" style="color: ${unlocked ? 'var(--success)' : 'var(--text-dim)'}; word-wrap: break-word; overflow-wrap: break-word; margin-bottom: 6px; font-weight: 600; line-height: 1.5; display: block; white-space: normal;">
                    ${stripEmojisIfLowTier(unlocked ? '✓' : '○')} ${achievement.name || 'Unknown Achievement'}
                </div>
                <div class="card-description" style="font-size: 11px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; line-height: 1.5; color: var(--text-dim); display: block; white-space: normal; margin-bottom: 4px;">${achievement.description || 'No description'}</div>
                ${progressHTML}
            `;

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

        // console.log('Rendered', achievementsArray.length, 'achievements using traditional rendering in two columns');
    }
}
