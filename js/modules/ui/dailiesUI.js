/**
 * DailiesUI.js
 * Manages the rendering and updates of the Daily Rituals tab.
 */

import { showNotification } from './notifications.js';
import { formatTimeDuration, formatShort } from '../../utils.js';

export class DailiesUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
    }

    /**
     * Update daily rituals tab with optimized rendering
     */
    update() {
        const container = document.getElementById('task-list');
        if (!container) return;

        container.innerHTML = '';

        // Access dailyRituals from uiManager systems or window as fallback
        const dailyRituals = this.uiManager.systems.dailyRituals || window.dailyRituals;

        try {
            if (dailyRituals && typeof dailyRituals.checkDailyRefresh === 'function') {
                dailyRituals.checkDailyRefresh();
            }

            // Batch DOM updates for better performance
            const fragment = document.createDocumentFragment();

            const activeTasks = dailyRituals ? dailyRituals.activeTasks : [];
            const taskProgress = dailyRituals ? dailyRituals.taskProgress : {};
            const claimedTasks = dailyRituals ? dailyRituals.claimedTasks : [];

            for (const task of activeTasks) {
                const parts = task.condition.split(':');
                const target = parts.length > 0 ? parseInt(parts[parts.length - 1], 10) : 1;
                const progress = taskProgress[task.id] || 0;
                const claimed = claimedTasks.includes(task.id);

                let rewardText = '';
                switch (task.rewardType) {
                    case 'ab':
                        rewardText = `${formatShort(task.rewardValue)} SE`;
                        break;
                    case 'buff':
                        rewardText = `+${Math.floor(task.buffMultiplier * 100)}% for ${formatTimeDuration(task.rewardValue)}`;
                        break;
                    case 'ek_frag':
                        rewardText = `${Math.floor(task.rewardValue)} EK Fragment${Math.floor(task.rewardValue) !== 1 ? 's' : ''}`;
                        break;
                }

                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                    <div class="card-title">${task.displayName}</div>
                    <div class="card-description">${task.description}</div>
                    <div class="card-section">
                        <div class="card-label">Progress: ${progress} / ${target}</div>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                    <div class="card-section">
                        <div class="card-label">Reward: ${rewardText}</div>
                    </div>
                    <button class="btn-primary" data-action="claim-task" data-task-id="${task.id}" ${progress >= target && !claimed ? '' : 'disabled'}>
                        ${claimed ? 'Claimed' : progress >= target ? 'Claim' : 'Not Ready'}
                    </button>
                `;

                // Set dynamic styles safely
                const progressFill = /** @type {HTMLElement} */ (card.querySelector('.progress-fill'));
                if (progressFill) {
                    progressFill.style.width = `${Math.min(100, (progress / target) * 100)}%`;
                }

                // Attach event listener directly - always attach handler, check conditions inside
                const button = /** @type {HTMLButtonElement} */ (card.querySelector('button[data-action="claim-task"]'));
                if (button) {
                    // Ensure button is visible and clickable
                    button.style.position = 'relative';
                    button.style.zIndex = '100';
                    button.style.pointerEvents = (progress < target || claimed || button.disabled) ? 'none' : 'auto';
                    button.style.cursor = (progress < target || claimed || button.disabled) ? 'not-allowed' : 'pointer';
                    button.style.visibility = 'visible';
                    button.style.display = 'inline-block';

                    // Always attach handler - it will check if it can execute
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Check if we can actually claim
                        if (progress < target || claimed || button.disabled) {
                            console.log('Claim button disabled:', { progress, target, claimed, disabled: button.disabled });
                            return;
                        }

                        console.log('Claim task button clicked:', { taskId: task.id });

                        if (dailyRituals && typeof dailyRituals.claimTask === 'function') {
                            dailyRituals.claimTask(task.id);
                        } else if (typeof window.claimTask === 'function') {
                            window.claimTask(task.id);
                        }

                        // Update UI after claim
                        this.update();
                    });
                }

                fragment.appendChild(card);
            }

            container.appendChild(fragment);
        } catch (error) {
            console.error('Error updating dailies tab:', error);
            showNotification('Failed to load daily tasks', 'error');
        }
    }
}
