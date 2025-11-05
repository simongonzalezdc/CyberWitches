import { GameState } from './gameState.js';
import { DailyRituals } from './dailyRituals.js';
import { AchievementSystem } from './achievements.js';
import { ComboSystem } from './comboSystem.js';
import { EventSystem } from './eventSystem.js';
import { PRODUCERS, UPGRADES, PRESTIGE_BONUSES, HIDDEN_RECIPES } from './data.js';
import { formatShort, formatPrecise, formatTimeDuration } from './utils.js';
import { createParticle, pulseElement, highlightElement, slideIn, animateNumber } from './animations.js';

// Initialize game
let gameState;
let dailyRituals;
let achievements;
let comboSystem;
let eventSystem;

// UI Elements (will be set after DOM loads)
let abDisplay;
let abpsDisplay;
let castButton;
let tabButtons;
let tabPanes;
let prestigeModal;
let welcomeBackModal;

// Initialize UI
function initUI() {
    // Get UI elements after DOM is loaded
    abDisplay = document.getElementById('ab-display');
    abpsDisplay = document.getElementById('abps-display');
    castButton = document.getElementById('cast-button');
    tabButtons = document.querySelectorAll('.tab-button');
    tabPanes = document.querySelectorAll('.tab-pane');
    prestigeModal = document.getElementById('prestige-modal');
    welcomeBackModal = document.getElementById('welcome-back-modal');
    
    // Initialize game state
    gameState = new GameState();
    dailyRituals = new DailyRituals(gameState);
    achievements = new AchievementSystem(gameState);
    comboSystem = new ComboSystem();
    eventSystem = new EventSystem(gameState);
    
    // Tab switching
    if (tabButtons && tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabName = button.dataset.tab;
                switchTab(tabName);
            });
        });
    }
    
    // Cast button - optimized for responsiveness
    if (castButton) {
        let isProcessing = false;
        
        const handleCast = () => {
            // Prevent double-processing
            if (isProcessing) return;
            isProcessing = true;
            
            // Process cast immediately (synchronous)
            const oldAb = gameState.ab;
            
            // Apply combo multiplier if active
            const comboMult = comboSystem.getComboMultiplier();
            comboSystem.recordAction();
            
            // Check for event multipliers
            const eventMult = eventSystem.hasEventEffect('double_casts') ? 2.0 : 1.0;
            
            gameState.cast(comboMult, eventMult);
            
            // Check for achievements
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
            }
            
            updateDailyProgress('tap', '', gameState.totalTaps);
            
            // Visual feedback (non-blocking)
            castButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                castButton.style.transform = 'scale(1)';
                isProcessing = false;
            }, 100);
            
            // Particles (deferred to not block)
            requestAnimationFrame(() => {
                const rect = castButton.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                // Create particles (limit to prevent spam)
                if (gameState.totalTaps % 5 === 0 || Math.random() > 0.7) {
                    createParticle(x, y - 30, '+1', '#22E3FF');
                }
                
                // Show AB gain if any
                if (gameState.ab > oldAb && (gameState.ab - oldAb) > 0.05) {
                    createParticle(x, y - 60, `+${formatShort(gameState.ab - oldAb)} AB`, '#FFDB6E');
                }
            });
        };
        
        // Use both click and mousedown for better responsiveness
        castButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCast();
        }, { passive: false });
        
        castButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Also support touch for mobile
        castButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCast();
        }, { passive: false });
        
        // Store handler for auto-cast
        castButton.onclick = handleCast;
    }
    
    // Auto-cast toggle
    const autoCastToggle = document.getElementById('auto-cast-toggle');
    let autoCastEnabled = false;
    let autoCastInterval = null;
    
    if (autoCastToggle) {
        autoCastToggle.addEventListener('click', () => {
            autoCastEnabled = !autoCastEnabled;
            autoCastToggle.textContent = `Auto: ${autoCastEnabled ? 'ON' : 'OFF'}`;
            autoCastToggle.style.background = autoCastEnabled ? 'var(--success)' : 'transparent';
            
            if (autoCastEnabled) {
                // Auto-cast every 500ms
                autoCastInterval = setInterval(() => {
                    if (gameState && castButton) {
                        const handler = castButton.onclick;
                        if (handler) handler();
                    }
                }, 500);
            } else {
                if (autoCastInterval) {
                    clearInterval(autoCastInterval);
                    autoCastInterval = null;
                }
            }
        });
    }
    
    // Prestige modal
    document.getElementById('ascend-button').addEventListener('click', () => {
        gameState.ascend();
        prestigeModal.classList.remove('active');
        updateAllUI();
    });
    
    document.getElementById('close-prestige-button').addEventListener('click', () => {
        prestigeModal.classList.remove('active');
    });
    
    // Welcome back modal
    document.getElementById('close-welcome-button').addEventListener('click', () => {
        welcomeBackModal.classList.remove('active');
    });
    
    // Game state callbacks
    let previousAb = gameState ? gameState.ab : 0;
    let abUpdateTimeout = null;
    
    gameState.onAbChanged = (newValue) => {
        if (!abDisplay) return;
        
        // Throttle updates to avoid blocking
        if (abUpdateTimeout) {
            clearTimeout(abUpdateTimeout);
        }
        
        abUpdateTimeout = setTimeout(() => {
            // Simple update for small changes, animate for large changes
            const diff = newValue - previousAb;
            if (Math.abs(diff) > 1) {
                animateNumber(abDisplay, previousAb, newValue, 200);
            } else {
                // Direct update for small changes (faster)
                abDisplay.textContent = `AB: ${formatShort(newValue)}`;
            }
            
            previousAb = newValue;
        }, 16); // ~60fps throttle
    };
    
    gameState.onWorkstationCrafted = (wsId, count) => {
        updateDailyProgress('craft', wsId, gameState.totalWorkstationsCrafted);
        updateDailyProgress('own', wsId, count);
        updateWorkstationsTab();
    };
    
    gameState.onUpgradePurchased = () => {
        updateInscriptionsTab();
    };
    
    gameState.onPrestigeCompleted = (ekGained) => {
        updateAllUI();
    };
    
    gameState.onRecipeDiscovered = (recipeId) => {
        updateExperimentTab();
    };
    
    gameState.onWelcomeBack = (elapsed, abGained) => {
        showWelcomeBack(elapsed, abGained);
    };
    
    // Update inventory when ingredients change
    gameState.onIngredientChanged = (ingId, newValue) => {
        // Only update if inventory tab is currently active
        const inventoryTab = document.getElementById('inventory-tab');
        if (inventoryTab && inventoryTab.classList.contains('active')) {
            updateInventoryTab();
        }
        // Also update workstations tab if active (to refresh recipe costs)
        const workstationsTab = document.getElementById('workstations-tab');
        if (workstationsTab && workstationsTab.classList.contains('active')) {
            updateWorkstationsTab();
        }
        // Update inscriptions tab if active (to refresh recipe costs)
        const inscriptionsTab = document.getElementById('inscriptions-tab');
        if (inscriptionsTab && inscriptionsTab.classList.contains('active')) {
            updateInscriptionsTab();
        }
        // Update experiment tab if active (to refresh recipe costs)
        const experimentTab = document.getElementById('experiment-tab');
        if (experimentTab && experimentTab.classList.contains('active')) {
            updateExperimentTab();
        }
    };
    
    // Daily rituals callbacks
    dailyRituals.onTaskProgressUpdated = () => {
        updateDailiesTab();
    };
    
    dailyRituals.onTaskCompleted = () => {
        updateDailiesTab();
    };
    
    dailyRituals.onTasksRefreshed = () => {
        updateDailiesTab();
    };
    
    // Start game
    gameState.start();
    dailyRituals.init();
    
    // Initialize first tab (workstations)
    switchTab('workstations');
    
    // Update UI
    updateAllUI();
    
    // Update ABPS every second with animation
    let previousAbps = 0;
    setInterval(() => {
        if (abpsDisplay && gameState) {
            // Get event multiplier for display
            let eventMult = 1.0;
            if (eventSystem) {
                eventMult = eventSystem.getProductionMultiplier();
            }
            const abps = gameState.getAbPerSecond(eventMult);
            
            if (abps !== previousAbps) {
                // Animate number change
                animateNumber(abpsDisplay, previousAbps, abps, 500);
                
                // Add glow effect if AB/s increased
                if (abps > previousAbps && abps > 0) {
                    abpsDisplay.style.textShadow = '0 0 10px rgba(34, 227, 255, 0.8)';
                    setTimeout(() => {
                        abpsDisplay.style.textShadow = '';
                    }, 500);
                }
                
                previousAbps = abps;
            }
        }
    }, 1000);
    
    // Check for achievements periodically
    setInterval(() => {
        if (achievements) {
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
            }
        }
    }, 1000);
    
    // Check for random events
    setInterval(() => {
        if (eventSystem) {
            eventSystem.checkForEvents();
            eventSystem.updateEvents(0.1);
            updateActiveEvents();
        }
    }, 1000);
    
    // Update combo display
    setInterval(() => {
        updateComboDisplay();
    }, 100);
    
    // Modify game tick to include event multipliers
    const originalTick = gameState.tick;
    gameState.tick = function() {
        let eventMult = 1.0;
        if (eventSystem) {
            eventMult = eventSystem.getProductionMultiplier();
        }
        originalTick.call(this, eventMult);
    };
    
    // Make showNotification globally available for event system
    window.showNotification = showNotification;
    
    // Initial AB display
    if (abDisplay && gameState) {
        abDisplay.textContent = `AB: ${formatShort(gameState.ab)}`;
        previousAb = gameState.ab;
    }
}

function switchTab(tabName) {
    if (!tabButtons || !tabPanes) {
        return;
    }
    
    // Update buttons
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
    });
    
    // Update panes
    tabPanes.forEach(pane => {
        const isActive = pane.id === `${tabName}-tab`;
        pane.classList.toggle('active', isActive);
    });
    
    // Update tab content
    switch(tabName) {
        case 'workstations':
            updateWorkstationsTab();
            break;
        case 'inscriptions':
            updateInscriptionsTab();
            break;
        case 'inventory':
            updateInventoryTab();
            break;
        case 'experiment':
            updateExperimentTab();
            break;
        case 'dailies':
            updateDailiesTab();
            break;
        case 'boons':
            updateBoonsTab();
            break;
        case 'stats':
            updateStatsTab();
            break;
        default:
            console.warn('Unknown tab:', tabName);
    }
}

function updateWorkstationsTab() {
    if (!gameState) return;
    
    const container = document.getElementById('workstation-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const prodData of PRODUCERS) {
        if (gameState.ab < prodData.unlockAtAb) continue;
        
        const owned = gameState.workstations[prodData.id] || 0;
        const recipe = getScaledRecipe(prodData.recipe, owned, prodData.growth);
        
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-title">${prodData.displayName}</div>
            <div class="card-description">⚙️ Owned: ${owned}</div>
            <div class="card-section">
                <div class="card-label">Produces:</div>
                ${Object.entries(prodData.outputs).map(([id, rate]) => 
                    `<div class="card-value">${formatPrecise(rate, 2)}/s ${id}</div>`
                ).join('')}
            </div>
            <div class="card-section">
                <div class="card-label">Recipe for next:</div>
                ${Object.entries(recipe).map(([ingId, amount]) => {
                    const have = gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        ${ingId}: ${formatShort(have)} / ${formatShort(amount)}
                    </div>`;
                }).join('')}
            </div>
            <div class="button-row">
                <button class="primary-button" onclick="craftWorkstation('${prodData.id}', 1, this)">Craft x1</button>
                <button class="primary-button" onclick="craftWorkstation('${prodData.id}', 10, this)">Craft x10</button>
                <button class="primary-button" onclick="craftWorkstationMax('${prodData.id}')">Max</button>
            </div>
        `;
        
        container.appendChild(card);
    }
}

function updateInscriptionsTab() {
    const container = document.getElementById('upgrade-list');
    container.innerHTML = '';
    
    for (const upgData of UPGRADES) {
        if (gameState.ab < upgData.unlockAtAb) continue;
        
        const owned = gameState.upgradesOwned[upgData.id] || false;
        
        const card = document.createElement('div');
        card.className = 'card';
        
        let effectText = '';
        if (upgData.affects === 'global') {
            effectText = `Global ${upgData.type} ×${upgData.value}`;
        } else if (upgData.affects.startsWith('producer:')) {
            const wsId = upgData.affects.split(':')[1];
            effectText = `${wsId} ${upgData.type} ×${upgData.value}`;
        } else if (upgData.affects === 'click') {
            effectText = `Click ${upgData.type} +${upgData.value}`;
        }
        
        card.innerHTML = `
            <div class="card-title">${upgData.displayName} ${owned ? '✓' : ''}</div>
            <div class="card-description">${upgData.description}</div>
            <div class="card-section">
                <div class="card-label">Effect: ${effectText}</div>
            </div>
            <div class="card-section">
                <div class="card-label">Recipe:</div>
                ${Object.entries(upgData.recipe).map(([ingId, amount]) => {
                    const have = gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        ${ingId}: ${formatShort(have)} / ${formatShort(amount)}
                    </div>`;
                }).join('')}
            </div>
            <button class="primary-button" ${owned ? 'disabled' : ''} onclick="inscribeUpgrade('${upgData.id}', this)">
                ${owned ? 'Owned' : 'Inscribe'}
            </button>
        `;
        
        container.appendChild(card);
    }
}

function updateInventoryTab() {
    if (!gameState) {
        console.error('gameState not initialized in updateInventoryTab');
        return;
    }
    
    const container = document.getElementById('inventory-list');
    if (!container) {
        console.error('inventory-list container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!gameState.inventory || Object.keys(gameState.inventory).length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'card';
        emptyMsg.innerHTML = '<div class="card-value">No ingredients yet. Cast to gather ingredients!</div>';
        container.appendChild(emptyMsg);
        return;
    }
    
    for (const ingId in gameState.inventory) {
        const amount = gameState.inventory[ingId];
        if (amount <= 0) continue;
        
        const item = document.createElement('div');
        item.className = 'card';
        item.innerHTML = `
            <div class="card-value">${ingId}: ${formatShort(amount)}</div>
        `;
        container.appendChild(item);
    }
}

function updateExperimentTab() {
    const container = document.getElementById('recipe-list');
    container.innerHTML = '';
    
        // Experiment button handler
        const expButton = document.getElementById('experiment-button');
        if (expButton) {
            expButton.onclick = () => {
                const result = gameState.tryExperiment();
                const resultLabel = document.getElementById('experiment-result');
                
                if (result.success) {
                    resultLabel.textContent = `✨ Discovered: ${result.recipe.name}`;
                    resultLabel.className = 'result-label success';
                    
                    // Celebration!
                    pulseElement(expButton, 1.2, 400);
                    showNotification(`🎉 Discovered: ${result.recipe.name}!`, 'success');
                    
                    // Create confetti-like particles
                    const rect = expButton.getBoundingClientRect();
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            createParticle(
                                rect.left + Math.random() * rect.width,
                                rect.top + Math.random() * rect.height,
                                '✨',
                                ['#FF2DAA', '#22E3FF', '#FFDB6E', '#3CE3C5', '#C9A0FF'][i % 5]
                            );
                        }, i * 50);
                    }
                    
                    // Check achievements
                    if (achievements) {
                        const newAchievements = achievements.checkAchievements();
                        for (const achievement of newAchievements) {
                            showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
                        }
                    }
                } else {
                    resultLabel.textContent = result.message;
                    resultLabel.className = 'result-label error';
                    
                    // Shake on failure
                    shakeElement(expButton, 3, 200);
                }
                
                updateExperimentTab();
            };
        }
    
    // Show discovered recipes
    for (const recipeId of gameState.discoveredRecipes) {
        const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
        if (!recipe) continue;
        
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-title">${recipe.name}</div>
            <div class="card-description">${recipe.description}</div>
            <div class="card-section">
                <div class="card-label">Costs:</div>
                ${Object.entries(recipe.inputs).map(([ingId, amount]) => {
                    const have = gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        ${ingId}: ${formatShort(have)} / ${formatShort(amount)}
                    </div>`;
                }).join('')}
            </div>
            <div class="card-section">
                <div class="card-label">Produces:</div>
                ${Object.entries(recipe.outputs).map(([outputId, amount]) => 
                    `<div class="card-value">${outputId}: ${formatShort(amount)}</div>`
                ).join('')}
            </div>
            <button class="primary-button" onclick="craftRecipe('${recipeId}')">Craft</button>
        `;
        
        container.appendChild(card);
    }
}

function updateDailiesTab() {
    const container = document.getElementById('task-list');
    container.innerHTML = '';
    
    dailyRituals.checkDailyRefresh();
    
    for (const task of dailyRituals.activeTasks) {
        const parts = task.condition.split(':');
        const target = parts.length > 0 ? parseInt(parts[parts.length - 1]) : 1;
        const progress = dailyRituals.taskProgress[task.id] || 0;
        const claimed = dailyRituals.claimedTasks.includes(task.id);
        
        let rewardText = '';
        switch (task.rewardType) {
            case 'ab':
                rewardText = `${formatShort(task.rewardValue)} AB`;
                break;
            case 'buff':
                rewardText = `+${Math.floor(task.buffMultiplier * 100)}% for ${formatTimeDuration(task.rewardValue)}`;
                break;
            case 'ek_frag':
                rewardText = `${Math.floor(task.rewardValue)} EK Fragment(s)`;
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
                    <div class="progress-fill" style="width: ${Math.min(100, (progress / target) * 100)}%"></div>
                </div>
            </div>
            <div class="card-section">
                <div class="card-label">Reward: ${rewardText}</div>
            </div>
            <button class="primary-button" ${progress >= target && !claimed ? '' : 'disabled'} onclick="claimTask('${task.id}')">
                ${claimed ? 'Claimed' : progress >= target ? 'Claim' : 'Incomplete'}
            </button>
        `;
        
        container.appendChild(card);
    }
}

function updateBoonsTab() {
    const ekDisplay = document.getElementById('ek-display');
    ekDisplay.textContent = `Eldritch Keys: ${gameState.prestigePoints}`;
    
    const container = document.getElementById('boon-list');
    container.innerHTML = '';
    
    for (const boonData of PRESTIGE_BONUSES) {
        const currentLevel = gameState.prestigeBonuses[boonData.id] || 0;
        const cost = boonData.baseCostPp * Math.pow(boonData.costGrowth, currentLevel);
        
        let effectText = '';
        switch (boonData.type) {
            case 'global_mult':
                effectText = `+${Math.floor(boonData.value * 100)}% Global Production per level`;
                break;
            case 'producer_mult':
                effectText = `+${Math.floor(boonData.value * 100)}% ${boonData.param} Production per level`;
                break;
            case 'starting_currency':
                effectText = `+${formatShort(boonData.value)} AB at start per level`;
                break;
            case 'start_ingredient':
                effectText = `+${formatShort(boonData.value)} ${boonData.param} at start per level`;
                break;
            case 'ab_production_mult':
                effectText = `+${Math.floor(boonData.value * 100)}% AB Production per level`;
                break;
            case 'click_mult':
                effectText = `+${Math.floor(boonData.value * 100)}% Cast Rewards per level`;
                break;
            case 'prestige_speed':
                effectText = `+${Math.floor(boonData.value * 100)}% Prestige Point Gain per level`;
                break;
        }
        
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-title">${boonData.displayName} (Lv. ${currentLevel})</div>
            <div class="card-description">${boonData.description}</div>
            <div class="card-section">
                <div class="card-label">Effect: ${effectText}</div>
            </div>
            <div class="card-section">
                <div class="card-label">Cost: ${Math.floor(cost)} EK</div>
            </div>
            <button class="primary-button" ${gameState.prestigePoints >= cost ? '' : 'disabled'} onclick="purchaseBoon('${boonData.id}')">
                Purchase
            </button>
        `;
        
        container.appendChild(card);
    }
}

function updateComboDisplay() {
    if (!comboSystem) return;
    
    const comboCount = comboSystem.getComboCount();
    const comboDisplay = document.getElementById('combo-display');
    
    if (comboCount > 0 && comboDisplay) {
        const mult = comboSystem.getComboMultiplier();
        comboDisplay.textContent = `🔥 ${comboCount}x Combo (${(mult * 100).toFixed(0)}%)`;
        comboDisplay.style.display = 'block';
    } else if (comboDisplay) {
        comboDisplay.style.display = 'none';
    }
}

function updateActiveEvents() {
    if (!eventSystem) return;
    
    const activeEvents = eventSystem.getActiveEvents();
    const eventsContainer = document.getElementById('active-events');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '';
    
    for (const event of activeEvents) {
        const remaining = Math.ceil((event.endTime - Date.now()) / 1000);
        const badge = document.createElement('div');
        badge.className = 'event-badge';
        badge.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${event.name}</div>
            <div style="font-size: 12px; color: var(--text-dim);">${remaining}s remaining</div>
        `;
        eventsContainer.appendChild(badge);
    }
}

function updateStatsTab() {
    if (!gameState || !achievements) return;
    
    const statsList = document.getElementById('stats-list');
    const achievementsList = document.getElementById('achievements-list');
    
    if (!statsList || !achievementsList) return;
    
    // Stats
    statsList.innerHTML = '';
    const stats = [
        { label: 'Total Casts', value: gameState.totalTaps },
        { label: 'Workstations Crafted', value: gameState.totalWorkstationsCrafted },
        { label: 'Total AB Earned', value: formatShort(gameState.abTotalEarned) },
        { label: 'Current AB', value: formatShort(gameState.ab) },
        { label: 'AB Per Second', value: formatShort(gameState.getAbPerSecond()) },
        { label: 'Prestige Points', value: gameState.prestigePoints },
        { label: 'Recipes Discovered', value: gameState.discoveredRecipes.length },
        { label: 'Max Combo', value: comboSystem ? comboSystem.maxCombo : 0 },
        { label: 'Achievements', value: `${achievements.getUnlockedCount()}/${achievements.getTotalCount()}` }
    ];
    
    for (const stat of stats) {
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
            <span class="stat-label">${stat.label}</span>
            <span class="stat-value">${stat.value}</span>
        `;
        statsList.appendChild(item);
    }
    
    // Achievements
    achievementsList.innerHTML = '';
    for (const achievement of achievements.achievements) {
        const unlocked = achievements.unlockedAchievements.has(achievement.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div style="font-weight: bold; color: ${unlocked ? 'var(--success)' : 'var(--text-dim)'};">
                ${unlocked ? '✓' : '○'} ${achievement.name}
            </div>
            <div style="font-size: 14px; margin-top: 5px; color: var(--text-dim);">
                ${achievement.description}
            </div>
        `;
        achievementsList.appendChild(card);
    }
}

function updateAllUI() {
    updateWorkstationsTab();
    updateInscriptionsTab();
    updateInventoryTab();
    updateExperimentTab();
    updateDailiesTab();
    updateBoonsTab();
    updateStatsTab();
}

// Global functions for onclick handlers
window.craftWorkstation = (wsId, amount, buttonElement = null) => {
    if (!gameState) return;
    
    const oldCount = gameState.workstations[wsId] || 0;
    const success = gameState.craftWorkstation(wsId, amount);
    
    if (success) {
        const newCount = gameState.workstations[wsId] || 0;
        const gained = newCount - oldCount;
        
        // Visual feedback
        if (buttonElement) {
            highlightElement(buttonElement, '#3CE3C5', 300);
            pulseElement(buttonElement, 1.1, 200);
        }
        
        // Show notification
        if (gained > 0) {
            showNotification(`✨ Crafted ${gained} ${PRODUCERS.find(p => p.id === wsId)?.displayName || wsId}!`, 'success');
        }
    } else {
        // Shake effect on failure
        if (buttonElement) {
            shakeElement(buttonElement, 5, 300);
        }
    }
    
    updateWorkstationsTab();
};

window.craftWorkstationMax = (wsId) => {
    if (!gameState) return;
    let maxCount = 0;
    for (let i = 0; i < 1000; i++) {
        const owned = (gameState.workstations[wsId] || 0) + maxCount;
        const prodData = PRODUCERS.find(p => p.id === wsId);
        if (!prodData) break;
        const recipe = getScaledRecipe(prodData.recipe, owned, prodData.growth);
        
        if (gameState.canAfford(recipe)) {
            maxCount++;
        } else {
            break;
        }
    }
    
    if (maxCount > 0) {
        gameState.craftWorkstation(wsId, maxCount);
        updateWorkstationsTab();
    }
};

window.inscribeUpgrade = (upgId, buttonElement = null) => {
    if (!gameState) return;
    
    const success = gameState.inscribeUpgrade(upgId);
    
    if (success) {
        const upgrade = UPGRADES.find(u => u.id === upgId);
        showNotification(`✨ Inscribed ${upgrade?.displayName || upgId}!`, 'success');
        
        // Pulse effect
        if (buttonElement) {
            pulseElement(buttonElement, 1.2, 300);
            highlightElement(buttonElement, '#FFDB6E', 400);
        }
    }
    
    updateInscriptionsTab();
};

window.craftRecipe = (recipeId) => {
    if (!gameState) return;
    if (gameState.craftDiscoveredRecipe(recipeId)) {
        showNotification('✨ Recipe crafted!', 'success');
        updateExperimentTab();
        updateInventoryTab();
        
        // Check achievements
        if (achievements) {
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
            }
        }
    }
};

window.claimTask = (taskId) => {
    if (!dailyRituals) return;
    if (dailyRituals.claimTask(taskId)) {
        updateDailiesTab();
    }
};

window.purchaseBoon = (bonusId) => {
    if (!gameState) return;
    if (gameState.purchasePrestigeBonus(bonusId)) {
        updateBoonsTab();
    }
};

function getScaledRecipe(baseRecipe, owned, growth) {
    const scaled = {};
    for (const ingId in baseRecipe) {
        const baseCost = baseRecipe[ingId];
        scaled[ingId] = Math.ceil(baseCost * Math.pow(growth, owned));
    }
    return scaled;
}

function updateDailyProgress(conditionType, param, value) {
    dailyRituals.updateTaskProgress(conditionType, param, value);
}

// Notification system
let notificationQueue = [];
let isShowingNotification = false;

function showNotification(message, type = 'info') {
    notificationQueue.push({ message, type });
    processNotificationQueue();
}

function processNotificationQueue() {
    if (isShowingNotification || notificationQueue.length === 0) return;
    
    isShowingNotification = true;
    const { message, type } = notificationQueue.shift();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    slideIn(notification, 'top', 300);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
            isShowingNotification = false;
            processNotificationQueue();
        }, 300);
    }, 3000);
}

function showWelcomeBack(elapsed, abGained) {
    document.getElementById('welcome-time').textContent = `⏰ Away for: ${formatTimeDuration(elapsed)}`;
    document.getElementById('welcome-ab').textContent = `✨ Earned: ${formatShort(abGained)} AB`;
    welcomeBackModal.classList.add('active');
    
    // Animate modal appearance
    const modalContent = welcomeBackModal.querySelector('.modal-content');
    if (modalContent) {
        slideIn(modalContent, 'bottom', 400);
    }
    
    setTimeout(() => {
        welcomeBackModal.classList.remove('active');
    }, 5000);
}

// Show prestige modal
window.showPrestigeModal = () => {
    if (!gameState || !prestigeModal) return;
    document.getElementById('prestige-ek').textContent = gameState.prestigePoints;
    document.getElementById('prestige-gain').textContent = gameState.calculatePrestigeGain();
    document.getElementById('ascend-button').disabled = gameState.calculatePrestigeGain() <= 0;
    prestigeModal.classList.add('active');
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Add prestige button to top bar
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        const ascendBtn = document.createElement('button');
        ascendBtn.className = 'cast-button';
        ascendBtn.textContent = '⚡ Ascend';
        ascendBtn.onclick = showPrestigeModal;
        ascendBtn.style.marginLeft = '10px';
        topBar.appendChild(ascendBtn);
    }
    
    try {
        initUI();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

