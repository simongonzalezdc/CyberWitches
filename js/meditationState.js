import { MEDITATION_TOWERS, MEDITATION_DISTRACTIONS, MEDITATION_UPGRADES } from './data.js';
import { handleError, safeFunction } from './errorHandler.js';

/**
 * Meditation State Manager - Manages meditation tower defense mode
 * Separate game mode with rhythm-based mechanics and tower defense gameplay
 */
export class MeditationState {
    constructor(gameState) {
        // Reference to main game state for accessing inventory
        this.gameState = gameState;
        
        // Meditation resources
        this.focus = 0.0;
        this.focusTotalEarned = 0.0;
        this.focusPassiveRate = 0.1; // Passive focus per second
        
        // Tranquility (health)
        this.tranquility = 100.0;
        this.tranquilityMax = 100.0;
        
        // Grid system (8x8 grid)
        this.gridSize = 8;
        this.grid = []; // Array of {x, y, tower: null or tower object}
        this.towers = []; // Array of placed towers
        
        // Wave system
        this.currentWave = 0;
        this.waveActive = false;
        this.distractions = []; // Active distractions on the grid
        this.nextSpawnTime = 0;
        this.waveStartTime = 0;
        
        // Active session
        this.activeSession = false;
        this.sessionStartTime = 0;
        
        // Meditation inventory (exclusive ingredients)
        this.meditationInventory = {};
        
        // Meditation upgrades
        this.meditationUpgrades = {};
        
        // Tick timer
        this.tickInterval = null;
        this.lastTickTime = Date.now();
        
        // Callbacks
        this.onFocusChanged = null;
        this.onTranquilityChanged = null;
        this.onWaveChanged = null;
        this.onTowerPlaced = null;
        this.onDistractionKilled = null;
        
        // Initialize grid
        this.initializeGrid();
    }
    
    /**
     * Initialize the meditation grid
     */
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.grid.push({
                    x: x,
                    y: y,
                    tower: null
                });
            }
        }
    }
    
    /**
     * Start meditation session
     */
    startSession() {
        if (this.activeSession) return;
        
        this.activeSession = true;
        this.sessionStartTime = Date.now();
        this.waveActive = false;
        this.currentWave = 0;
        this.tranquility = this.tranquilityMax;
        this.distractions = [];
        
        // Start wave after a delay
        setTimeout(() => {
            this.startWave();
        }, 2000);
    }
    
    /**
     * End meditation session
     */
    endSession() {
        if (!this.activeSession) return;
        
        this.activeSession = false;
        this.waveActive = false;
        this.distractions = [];
        
        // Calculate rewards based on performance
        this.calculateSessionRewards();
    }
    
    /**
     * Start a new wave
     */
    startWave() {
        if (!this.activeSession) return;
        
        this.currentWave++;
        this.waveActive = true;
        this.waveStartTime = Date.now();
        this.nextSpawnTime = Date.now() + 1000; // First spawn after 1 second
        
        if (this.onWaveChanged) {
            this.onWaveChanged(this.currentWave);
        }
    }
    
    /**
     * Main meditation tick
     */
    tick() {
        const now = Date.now();
        const delta = (now - this.lastTickTime) / 1000;
        this.lastTickTime = now;
        
        // Passive focus generation (even when not in session)
        const focusMult = this.getFocusMultiplier();
        const passiveFocus = this.focusPassiveRate * focusMult * delta;
        this.addFocus(passiveFocus);
        
        if (!this.activeSession) return;
        
        // Update wave if active
        if (this.waveActive) {
            this.updateWave(delta);
            
            // Update towers
            this.updateTowers(delta);
            
            // Update distractions
            this.updateDistractions(delta);
            
            // Check if wave is complete
            if (this.distractions.length === 0 && this.nextSpawnTime > now + 5000) {
                // Wave complete, start next wave after delay
                this.waveActive = false;
                setTimeout(() => {
                    this.startWave();
                }, 3000);
            }
            
            // Check if tranquility reached 0
            if (this.tranquility <= 0) {
                this.endSession();
            }
        }
    }
    
    /**
     * Update wave spawning
     */
    updateWave(delta) {
        const now = Date.now();
        
        if (now >= this.nextSpawnTime) {
            this.spawnDistraction();
            
            // Calculate next spawn time (faster spawning as wave progresses)
            const waveProgress = (now - this.waveStartTime) / 30000; // 30 second waves
            const baseInterval = 2000 - (waveProgress * 1500); // 2s to 0.5s
            this.nextSpawnTime = now + Math.max(baseInterval, 500);
        }
    }
    
    /**
     * Spawn a new distraction
     */
    spawnDistraction() {
        // Select distraction based on wave
        const tier = Math.min(Math.floor(this.currentWave / 2), 4);
        const availableDistractions = MEDITATION_DISTRACTIONS.filter(d => d.tier <= tier);
        
        if (availableDistractions.length === 0) return;
        
        const distractionData = availableDistractions[Math.floor(Math.random() * availableDistractions.length)];
        
        // Spawn at random edge
        const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let x, y;
        
        switch (edge) {
            case 0: // top
                x = Math.floor(Math.random() * this.gridSize);
                y = 0;
                break;
            case 1: // right
                x = this.gridSize - 1;
                y = Math.floor(Math.random() * this.gridSize);
                break;
            case 2: // bottom
                x = Math.floor(Math.random() * this.gridSize);
                y = this.gridSize - 1;
                break;
            case 3: // left
                x = 0;
                y = Math.floor(Math.random() * this.gridSize);
                break;
        }
        
        // Scale health and rewards with wave
        const waveMultiplier = 1 + (this.currentWave * 0.2);
        const health = distractionData.health * waveMultiplier;
        const speed = distractionData.speed;
        const damage = distractionData.damage;
        
        const distraction = {
            id: distractionData.id,
            displayName: distractionData.displayName,
            tier: distractionData.tier,
            health: health,
            maxHealth: health,
            speed: speed,
            damage: damage,
            reward: distractionData.reward,
            x: x,
            y: y,
            targetX: this.gridSize / 2 - 0.5, // Center of grid
            targetY: this.gridSize / 2 - 0.5,
            progress: 0.0 // 0.0 to 1.0 (progress to center)
        };
        
        this.distractions.push(distraction);
    }
    
    /**
     * Update distractions movement and health
     */
    updateDistractions(delta) {
        for (let i = this.distractions.length - 1; i >= 0; i--) {
            const dist = this.distractions[i];
            
            // Move toward center
            const dx = dist.targetX - dist.x;
            const dy = dist.targetY - dist.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.1) {
                dist.x += (dx / distance) * dist.speed * delta * 0.5;
                dist.y += (dy / distance) * dist.speed * delta * 0.5;
                dist.progress = 1.0 - (distance / (this.gridSize / 2));
            } else {
                // Reached center, deal damage to tranquility
                this.tranquility = Math.max(0, this.tranquility - dist.damage);
                if (this.onTranquilityChanged) {
                    this.onTranquilityChanged(this.tranquility, this.tranquilityMax);
                }
                
                // Remove distraction
                this.distractions.splice(i, 1);
                continue;
            }
            
            // Check if health <= 0
            if (dist.health <= 0) {
                // Grant rewards
                this.grantDistractionReward(dist);
                
                // Remove distraction
                this.distractions.splice(i, 1);
                
                if (this.onDistractionKilled) {
                    this.onDistractionKilled(dist);
                }
            }
        }
    }
    
    /**
     * Grant reward for killing a distraction
     */
    grantDistractionReward(distraction) {
        // Grant focus
        if (distraction.reward.focus) {
            this.addFocus(distraction.reward.focus);
        }
        
        // Grant meditation ingredients
        for (const ingId in distraction.reward) {
            if (ingId !== 'focus') {
                this.addMeditationIngredient(ingId, distraction.reward[ingId]);
            }
        }
    }
    
    /**
     * Update towers (attack distractions)
     */
    updateTowers(delta) {
        for (const tower of this.towers) {
            if (!tower || !tower.data) continue;
            
            // Find nearest distraction in range
            const nearestDist = this.findNearestDistraction(tower.x, tower.y, tower.data.range);
            
            if (nearestDist) {
                // Check if tower can attack (based on attack speed)
                const now = Date.now();
                if (!tower.lastAttackTime) tower.lastAttackTime = 0;
                const timeSinceAttack = (now - tower.lastAttackTime) / 1000;
                const attackInterval = 1.0 / tower.data.attackSpeed;
                
                if (timeSinceAttack >= attackInterval) {
                    // Attack!
                    const damage = tower.data.damage * this.getTowerDamageMultiplier();
                    nearestDist.health -= damage;
                    
                    tower.lastAttackTime = now;
                    
                    // Consume attack cost
                    this.consumeTowerCost(tower);
                }
            }
        }
    }
    
    /**
     * Find nearest distraction in range
     */
    findNearestDistraction(x, y, range) {
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const dist of this.distractions) {
            const dx = dist.x - x;
            const dy = dist.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= range && distance < nearestDist) {
                nearest = dist;
                nearestDist = distance;
            }
        }
        
        return nearest;
    }
    
    /**
     * Consume tower attack cost
     */
    consumeTowerCost(tower) {
        if (!tower.data.cost) return;
        
        for (const ingId in tower.data.cost) {
            const cost = tower.data.cost[ingId];
            if (this.meditationInventory[ingId] < cost) {
                // Can't afford, disable tower temporarily
                tower.disabled = true;
                return;
            }
            this.meditationInventory[ingId] -= cost;
        }
    }
    
    /**
     * Place a tower on the grid
     */
    placeTower(towerId, gridX, gridY) {
        // Check if valid position
        if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
            return false;
        }
        
        const gridIndex = gridY * this.gridSize + gridX;
        const cell = this.grid[gridIndex];
        
        // Check if cell is occupied
        if (cell.tower) {
            return false;
        }
        
        // Find tower data
        const towerData = MEDITATION_TOWERS.find(t => t.id === towerId);
        if (!towerData) {
            return false;
        }
        
        // Check if player can afford tower
        if (!this.canAffordTower(towerData)) {
            return false;
        }
        
        // Spend ingredients
        this.spendTowerCost(towerData);
        
        // Place tower
        const tower = {
            id: towerId,
            data: towerData,
            x: gridX + 0.5, // Center of cell
            y: gridY + 0.5,
            gridX: gridX,
            gridY: gridY,
            lastAttackTime: 0,
            disabled: false
        };
        
        cell.tower = tower;
        this.towers.push(tower);
        
        if (this.onTowerPlaced) {
            this.onTowerPlaced(tower);
        }
        
        // Track tower placement for daily tasks
        if (typeof window.updateDailyProgress === 'function') {
            window.updateDailyProgress('meditation_towers', '', this.towers.length);
        }
        
        return true;
    }
    
    /**
     * Check if player can afford tower
     */
    canAffordTower(towerData) {
        if (!towerData.recipe) return false;
        
        for (const ingId in towerData.recipe) {
            const required = towerData.recipe[ingId];
            const have = this.gameState.inventory[ingId] || 0;
            if (have < required) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Spend tower cost
     */
    spendTowerCost(towerData) {
        if (!towerData.recipe) return;
        
        for (const ingId in towerData.recipe) {
            const amount = towerData.recipe[ingId];
            this.gameState.spendIngredient(ingId, amount);
        }
    }
    
    /**
     * Calculate session rewards
     */
    calculateSessionRewards() {
        // Base reward: wave completion
        const baseReward = this.currentWave * 10;
        
        // Final reward
        this.addFocus(baseReward);
    }
    
    /**
     * Add focus
     */
    addFocus(amount) {
        this.focus += amount;
        this.focusTotalEarned += amount;
        
        if (this.onFocusChanged) {
            this.onFocusChanged(this.focus);
        }
    }
    
    /**
     * Spend focus
     */
    spendFocus(amount) {
        if (this.focus >= amount) {
            this.focus -= amount;
            if (this.onFocusChanged) {
                this.onFocusChanged(this.focus);
            }
            return true;
        }
        return false;
    }
    
    /**
     * Add meditation ingredient
     */
    addMeditationIngredient(ingId, amount) {
        if (!this.meditationInventory[ingId]) {
            this.meditationInventory[ingId] = 0;
        }
        this.meditationInventory[ingId] += amount;
    }
    
    /**
     * Get focus multiplier from upgrades
     */
    getFocusMultiplier() {
        let mult = 1.0;
        for (const upgId in this.meditationUpgrades) {
            const upg = MEDITATION_UPGRADES.find(u => u.id === upgId);
            if (upg && upg.type === 'focus_generation') {
                mult *= upg.value;
            }
        }
        return mult;
    }
    
    /**
     * Get tower damage multiplier from upgrades
     */
    getTowerDamageMultiplier() {
        let mult = 1.0;
        for (const upgId in this.meditationUpgrades) {
            const upg = MEDITATION_UPGRADES.find(u => u.id === upgId);
            if (upg && upg.type === 'tower_damage') {
                mult *= upg.value;
            }
        }
        return mult;
    }
    
    /**
     * Purchase meditation upgrade
     */
    purchaseMeditationUpgrade(upgId) {
        const upg = MEDITATION_UPGRADES.find(u => u.id === upgId);
        if (!upg) return false;
        
        // Check if already owned
        if (this.meditationUpgrades[upgId]) return false;
        
        // Check if unlocked
        if (upg.unlockAtFocus && this.focusTotalEarned < upg.unlockAtFocus) return false;
        
        // Check if can afford
        if (!this.canAffordUpgrade(upg)) return false;
        
        // Spend ingredients
        this.spendUpgradeCost(upg);
        
        // Purchase upgrade
        this.meditationUpgrades[upgId] = true;
        
        return true;
    }
    
    /**
     * Check if can afford upgrade
     */
    canAffordUpgrade(upg) {
        if (!upg.recipe) return false;
        
        for (const ingId in upg.recipe) {
            const required = upg.recipe[ingId];
            const have = this.meditationInventory[ingId] || 0;
            if (have < required) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Spend upgrade cost
     */
    spendUpgradeCost(upg) {
        if (!upg.recipe) return;
        
        for (const ingId in upg.recipe) {
            const amount = upg.recipe[ingId];
            this.meditationInventory[ingId] = Math.max(0, (this.meditationInventory[ingId] || 0) - amount);
        }
    }
    
    /**
     * Start meditation tick loop
     */
    startTickLoop() {
        const tickRate = 100; // 10 ticks per second
        this.tickInterval = setInterval(() => {
            this.tick();
        }, tickRate);
    }
    
    /**
     * Stop meditation tick loop
     */
    stopTickLoop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }
    
    /**
     * Save meditation state
     */
    saveState() {
        const state = {
            focus: this.focus,
            focusTotalEarned: this.focusTotalEarned,
            tranquilityMax: this.tranquilityMax,
            meditationInventory: this.meditationInventory,
            meditationUpgrades: this.meditationUpgrades,
            towers: this.towers.map(t => ({
                id: t.id,
                gridX: t.gridX,
                gridY: t.gridY
            }))
        };
        
        localStorage.setItem('meditationState', JSON.stringify(state));
    }
    
    /**
     * Load meditation state
     */
    loadState() {
        try {
            const saved = localStorage.getItem('meditationState');
            if (!saved) return;
            
            const state = JSON.parse(saved);
            
            this.focus = state.focus || 0;
            this.focusTotalEarned = state.focusTotalEarned || 0;
            this.tranquilityMax = state.tranquilityMax || 100;
            this.meditationInventory = state.meditationInventory || {};
            this.meditationUpgrades = state.meditationUpgrades || {};
            
            // Rebuild towers
            if (state.towers) {
                this.towers = [];
                for (const towerData of state.towers) {
                    const towerInfo = MEDITATION_TOWERS.find(t => t.id === towerData.id);
                    if (towerInfo) {
                        const gridIndex = towerData.gridY * this.gridSize + towerData.gridX;
                        const cell = this.grid[gridIndex];
                        if (cell) {
                            const tower = {
                                id: towerData.id,
                                data: towerInfo,
                                x: towerData.gridX + 0.5,
                                y: towerData.gridY + 0.5,
                                gridX: towerData.gridX,
                                gridY: towerData.gridY,
                                lastAttackTime: 0,
                                disabled: false
                            };
                            cell.tower = tower;
                            this.towers.push(tower);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading meditation state:', error);
        }
    }
}

