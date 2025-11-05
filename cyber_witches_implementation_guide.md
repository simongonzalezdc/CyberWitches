# 🎮 CYBER WITCHES: IDLE COVEN
## Complete Implementation Guide

**Version:** 2.0 - Experiment Edition  
**Platform:** Web (HTML5), Portrait-First  
**Timeline:** Full scope, no constraints

---

## 📚 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Project Setup](#project-setup)
3. [Folder Structure](#folder-structure)
4. [Data Models](#data-models)
5. [Core Systems](#core-systems)
6. [Experiment System](#experiment-system)
7. [UI Implementation](#ui-implementation)
8. [Game Content](#game-content)
9. [Balance Formulas](#balance-formulas)
10. [Daily Rituals](#daily-rituals)
11. [Testing Checklist](#testing-checklist)
12. [Web Deployment](#web-deployment)
13. [Implementation Timeline](#implementation-timeline)

---

## 🚀 QUICK START

### What You're Building

**Cyber Witches** is an idle game where players:
- ✨ **Cast spells** to gather ingredients
- 🏭 **Craft workstations** that auto-produce resources
- 🔬 **Experiment** to discover hidden recipes
- ⚡ **Ascend** to earn permanent upgrades
- 📅 **Complete dailies** for bonus rewards

### Core Philosophy

**Everything is earned through gameplay.**  
No shops. No purchases. Just gathering, crafting, and discovery.

---

## 🔧 PROJECT SETUP

### Initial Configuration

**Step 1: Create Project Structure**

```
CyberWitches/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── js/                 # JavaScript files
├── package.json        # npm configuration
└── README.md          # Documentation
```

**Step 2: Initialize npm Project**

```bash
npm init -y
npm install --save-dev http-server
```

**Step 3: Add Start Script**

Add to package.json:
```json
{
  "scripts": {
    "start": "http-server -p 8080 -o"
  }
}
```

---

## 📁 FOLDER STRUCTURE

```
CyberWitches/
│
├── index.html          # Main HTML structure
├── styles.css          # All styling (neon theme)
├── package.json        # npm configuration
│
├── js/
│   ├── game.js        # Main game controller & UI
│   ├── gameState.js   # Core game logic
│   ├── dailyRituals.js # Daily task system
│   ├── data.js        # Game content definitions
│   ├── utils.js       # Utility functions
│   ├── achievements.js # Achievement system
│   ├── animations.js  # UI animations
│   ├── comboSystem.js # Combo system
│   └── eventSystem.js # Event management
│
└── docs/
    ├── README.md
    ├── SETUP_GUIDE.md
    ├── GAME_MANUAL.md
    └── QUICK_START.md
```

---

## 📊 DATA MODELS

### JavaScript Data Structures

All game data is defined as JavaScript objects and arrays in `js/data.js`.

---

### 1️⃣ Ingredients

```javascript
// Basic ingredients from casting
const INGREDIENTS = [
    {
        id: "wax_bits",
        displayName: "Wax Bits",
        tier: 0,
        icon: "🕯️"
    },
    {
        id: "wick_fiber",
        displayName: "Wick Fiber",
        tier: 0,
        icon: "🧵"
    },
    // ... more ingredients
];
```

---

### 2️⃣ Workstations (Producers)

```javascript
// Workstations that auto-produce
const WORKSTATIONS = [
    {
        id: "ws_melter",
        displayName: "Wax Melter",
        description: "Melts wax into refined blocks",
        unlockAtAB: 0,
        recipe: { wax_bits: 10 },
        growth: 1.10,
        outputs: { wax_block: 0.30 },
        icon: "🔥"
    },
    // ... more workstations
];
```

---

### 3️⃣ Upgrades

```javascript
// One-time permanent boosts
const UPGRADES = [
    {
        id: "u_global_1",
        displayName: "Hex Compiler v1",
        description: "Increases all production by 50%",
        affects: "global",
        type: "multiplier",
        value: 1.5,
        recipe: { wax_block: 2, braided_wick: 2 },
        unlockAtAB: 0
    },
    // ... more upgrades
];
```

---

### 4️⃣ Prestige Bonuses

```javascript
// Permanent upgrades from prestige currency
const PRESTIGE_BONUSES = [
    {
        id: "pp_global_1",
        displayName: "Coven's Oath",
        description: "Global production boost",
        type: "global_mult",
        value: 0.10,
        baseCost: 10,
        costGrowth: 1.5
    },
    // ... more bonuses
];
```

---

### 5️⃣ Daily Tasks

```javascript
// Daily challenge definitions
const DAILY_TASKS_POOL = [
    {
        id: "d_kindle",
        displayName: "Kindle the Grid",
        description: "Craft 3 Wax Melters",
        condition: "craft:workstation:ws_melter:3",
        rewardType: "ab",
        rewardValue: 5000
    },
    // ... more tasks
];
```

---

### 💾 Save File Format

```javascript
// localStorage save structure
const saveData = {
    version: 2,
    timestamp: 1730640000,
    ab: 123456.0,
    abTotal: 456789.0,
    inventory: {
        wax_bits: 120,
        wick_fiber: 60
    },
    workstations: {
        ws_melter: 2,
        ws_spinner: 1
    },
    upgrades: {
        u_global_1: true
    },
    prestige: {
        points: 15,
        lifetimeEarned: 1200000.0,
        bonuses: {
            pp_global_1: 2
        }
    },
    dailies: {
        dayKey: "2025-11-03",
        activeIds: ["d_kindle", "d_song", "d_flow"],
        progress: { d_flow: 73 },
        claimed: { d_kindle: true }
    },
    experiments: {
        discovered: ["wax_block_bulk", "braid_wick"]
    }
};
```

---

## ⚙️ CORE SYSTEMS

### System 1: Number Formatting (utils.js)

```javascript
// Format with K, M, B suffixes
function formatShort(value) {
    if (value < 1000) return Math.floor(value).toString();
    
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    let tier = 0;
    
    while (value >= 1000 && tier < suffixes.length - 1) {
        value /= 1000;
        tier++;
    }
    
    return value.toFixed(2) + suffixes[tier];
}

// Format time duration
function formatTimeDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds - hrs * 3600) / 60);
    const secs = Math.floor(seconds - hrs * 3600 - mins * 60);
    
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}
```

---

### System 2: Balance Formulas (utils.js)

```javascript
// Prestige calculations
const PRESTIGE_SCALE = 1200000;

function calculatePrestigePoints(lifetimeEarned) {
    return Math.floor(Math.sqrt(Math.max(lifetimeEarned, 0) / PRESTIGE_SCALE));
}

// Recipe scaling
function scaleRecipe(baseRecipe, owned, growth) {
    const scaled = {};
    for (const [ingId, baseCost] of Object.entries(baseRecipe)) {
        scaled[ingId]] = Math.ceil(baseCost * Math.pow(growth, owned));
    }
    return scaled;
}

// Production multipliers
function getProductionMultiplier(workstationId, upgrades, prestigeBonuses, buffs) {
    let mult = 1.0;
    
    // Apply global upgrades
    for (const upgradeId of Object.keys(upgrades)) {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (upgrade && upgrade.affects === "global" && upgrade.type === "multiplier") {
            mult *= upgrade.value;
        }
    }
    
    // Apply prestige bonuses
    for (const [bonusId, level] of Object.entries(prestigeBonuses)) {
        const bonus = PRESTIGE_BONUSES.find(b => b.id === bonusId);
        if (bonus && bonus.type === "global_mult") {
            mult *= (1.0 + bonus.value * level);
        }
    }
    
    // Apply active buffs
    for (const buff of buffs) {
        if (buff.multiplier) {
            mult *= (1.0 + buff.multiplier);
        }
    }
    
    return mult;
}

// Offline progress (capped at 12 hours)
const OFFLINE_CAP_SECONDS = 43200;

function calculateOfflineProduction(elapsedSeconds, productionPerSecond) {
    const cappedTime = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);
    return productionPerSecond * cappedTime;
}
```

---

### System 3: Game State (gameState.js)

```javascript
class GameState {
    constructor() {
        // Currency
        this.ab = 0.0;
        this.abTotalEarned = 0.0;
        
        // Inventory
        this.inventory = {};
        
        // Workstations
        this.workstations = {};
        
        // Upgrades
        this.upgradesOwned = {};
        
        // Prestige
        this.prestigePoints = 0;
        this.prestigeLifetimeEarned = 0.0;
        this.prestigeBonuses = {};
        
        // Buffs
        this.activeBuffs = [];
        
        // Experiments
        this.discoveredRecipes = [];
        
        // Stats
        this.totalTaps = 0;
        this.totalWorkstationsCrafted = 0;
        
        // Initialize
        this.loadGameState();
        this.startTickLoop();
    }
    
    // Start the main game loop
    startTickLoop() {
        setInterval(() => this.tick(), 100); // 10 ticks per second
    }
    
    // Main game tick
    tick() {
        const delta = 0.1; // 100ms tick
        
        // Update buffs
        this.updateBuffs(delta);
        
        // Calculate production
        const production = this.calculateTotalProduction(delta);
        
        // Apply production
        for (const [outputId, amount] of Object.entries(production)) {
            if (outputId === "ab") {
                this.addAB(amount);
            } else {
                this.addIngredient(outputId, amount);
            }
        }
        
        // Auto-save every 30 seconds
        if (Date.now() - this.lastSaveTime > 30000) {
            this.saveGameState();
        }
    }
    
    // Calculate total production from all workstations
    calculateTotalProduction(delta) {
        const totalOutput = {};
        
        for (const [wsId, owned] of Object.entries(this.workstations)) {
            const workstation = WORKSTATIONS.find(ws => ws.id === wsId);
            if (!workstation || owned <= 0) continue;
            
            // Get base outputs
            for (const [outputId, baseRate] of Object.entries(workstation.outputs)) {
                // Apply multipliers
                const mult = getProductionMultiplier(
                    wsId,
                    this.upgradesOwned,
                    this.prestigeBonuses,
                    this.activeBuffs
                );
                
                const finalRate = baseRate * mult * owned;
                
                if (!totalOutput[outputId]) {
                    totalOutput[outputId] = 0.0;
                }
                totalOutput[outputId] += finalRate * delta;
            }
        }
        
        return totalOutput;
    }
    
    // Cast spell (manual gathering)
    cast() {
        this.totalTaps++;
        
        // Base ingredients from casting
        const baseAmounts = {
            wax_bits: 1.0,
            wick_fiber: 1.0,
            crystal_dust: 0.5,
            aether_ess: 0.5
        };
        
        // Apply click upgrades
        let clickMult = 1.0;
        for (const upgradeId of Object.keys(this.upgradesOwned)) {
            const upgrade = UPGRADES.find(u => u.id === upgradeId);
            if (upgrade && upgrade.affects === "click") {
                if (upgrade.type === "multiplier") {
                    clickMult *= upgrade.value;
                } else if (upgrade.type === "additive") {
                    clickMult += upgrade.value;
                }
            }
        }
        
        // Grant ingredients
        for (const [ingId, amount] of Object.entries(baseAmounts)) {
            this.addIngredient(ingId, amount * clickMult);
        }
    }
    
    // Add AB
    addAB(amount) {
        this.ab += amount;
        this.abTotalEarned += amount;
        this.prestigeLifetimeEarned += amount;
        this.updateUI();
    }
    
    // Add ingredient to inventory
    addIngredient(ingId, amount) {
        if (!this.inventory[ingId]) {
            this.inventory[ingId] = 0.0;
        }
        this.inventory[ingId] += amount;
        this.updateUI();
    }
    
    // Craft workstation
    craftWorkstation(wsId, amount = 1) {
        const workstation = WORKSTATIONS.find(ws => ws.id === wsId);
        if (!workstation) return false;
        
        // Check unlock
        if (this.ab < workstation.unlockAtAB) return false;
        
        let successCount = 0;
        for (let i = 0; i < amount; i++) {
            const currentOwned = this.workstations[wsId] || 0;
            const recipe = scaleRecipe(workstation.recipe, currentOwned, workstation.growth);
            
            if (!this.canAfford(recipe)) break;
            
            // Consume ingredients
            for (const [ingId, cost] of Object.entries(recipe)) {
                this.inventory[ingId] -= cost;
            }
            
            // Add workstation
            this.workstations[wsId] = currentOwned + 1;
            successCount++;
            this.totalWorkstationsCrafted++;
        }
        
        if (successCount > 0) {
            this.updateUI();
            return true;
        }
        
        return false;
    }
    
    // Check if player can afford recipe
    canAfford(recipe) {
        for (const [ingId, cost] of Object.entries(recipe)) {
            if ((this.inventory[ingId] || 0) < cost) {
                return false;
            }
        }
        return true;
    }
    
    // Save game state
    saveGameState() {
        const saveData = {
            version: 2,
            timestamp: Date.now(),
            ab: this.ab,
            abTotal: this.abTotalEarned,
            inventory: this.inventory,
            workstations: this.workstations,
            upgrades: this.upgradesOwned,
            prestige: {
                points: this.prestigePoints,
                lifetimeEarned: this.prestigeLifetimeEarned,
                bonuses: this.prestigeBonuses
            },
            dailies: dailyRituals.saveState(),
            experiments: {
                discovered: this.discoveredRecipes
            },
            stats: {
                totalTaps: this.totalTaps,
                totalWorkstationsCrafted: this.totalWorkstationsCrafted
            }
        };
        
        localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData));
        this.lastSaveTime = Date.now();
    }
    
    // Load game state
    loadGameState() {
        const saveDataStr = localStorage.getItem('cyberWitchesSave');
        if (!saveDataStr) return;
        
        try {
            const saveData = JSON.parse(saveDataStr);
            
            // Calculate offline progress
            const elapsed = (Date.now() - saveData.timestamp) / 1000;
            
            // Load state
            this.ab = saveData.ab || 0;
            this.abTotalEarned = saveData.abTotal || 0;
            this.inventory = saveData.inventory || {};
            this.workstations = saveData.workstations || {};
            this.upgradesOwned = saveData.upgrades || {};
            
            const prestigeData = saveData.prestige || {};
            this.prestigePoints = prestigeData.points || 0;
            this.prestigeLifetimeEarned = prestigeData.lifetimeEarned || 0;
            this.prestigeBonuses = prestigeData.bonuses || {};
            
            const experimentsData = saveData.experiments || {};
            this.discoveredRecipes = experimentsData.discovered || [];
            
            const stats = saveData.stats || {};
            this.totalTaps = stats.totalTaps || 0;
            this.totalWorkstationsCrafted = stats.totalWorkstationsCrafted || 0;
            
            // Apply offline progress
            if (elapsed > 0) {
                this.applyOfflineProgress(elapsed);
            }
            
            this.lastSaveTime = Date.now();
        } catch (error) {
            console.error('Failed to load save data:', error);
        }
    }
    
    // Apply offline progress
    applyOfflineProgress(elapsedSeconds) {
        const abps = this.getABPerSecond();
        const offlineAB = calculateOfflineProduction(elapsedSeconds, abps);
        
        if (offlineAB > 0) {
            this.addAB(offlineAB);
            this.showWelcomeBackModal(elapsedSeconds, offlineAB);
        }
    }
    
    // Get current AB production per second
    getABPerSecond() {
        const production = this.calculateTotalProduction(1.0);
        return production.ab || 0;
    }
    
    // Update UI elements
    updateUI() {
        // This would be implemented in game.js
        if (window.gameUI) {
            window.gameUI.updateDisplay();
        }
    }
    
    // Show welcome back modal
    showWelcomeBackModal(elapsed, abGained) {
        // This would be implemented in game.js
        console.log(`Welcome back! Away for ${formatTimeDuration(elapsed)}, earned ${formatShort(abGained)} AB`);
    }
}
```

---

## 🔬 EXPERIMENT SYSTEM

### How It Works

**Players discover recipes by having the right ingredients.**

### Flow

1. Player gathers materials
2. Clicks **"Experiment"** button
3. System checks for valid combos
4. If match found → **Discovery!**
5. Recipe unlocked permanently
6. Can now craft that recipe anytime

### Implementation

```javascript
// Hidden recipes for discovery
const HIDDEN_RECIPES = [
    {
        id: "wax_block_bulk",
        inputs: { wax_bits: 50 },
        outputs: { wax_block: 5 },
        name: "Wax Block Bulk",
        description: "Convert raw wax into refined blocks"
    },
    {
        id: "braid_wick",
        inputs: { wick_fiber: 30 },
        outputs: { braided_wick: 3 },
        name: "Braided Wick",
        description: "Weave fibers into sturdy wicks"
    },
    // ... more recipes
];

// Try to discover a new recipe
function tryExperiment() {
    for (const recipe of HIDDEN_RECIPES) {
        if (gameState.discoveredRecipes.includes(recipe.id)) continue;
        
        // Check if player has ingredients
        let hasAll = true;
        for (const [ingId, amount] of Object.entries(recipe.inputs)) {
            if ((gameState.inventory[ingId] || 0) < amount) {
                hasAll = false;
                break;
            }
        }
        
        if (hasAll) {
            gameState.discoveredRecipes.push(recipe.id);
            return {
                success: true,
                recipe: recipe
            };
        }
    }
    
    return {
        success: false,
        message: "No new recipes discovered. Try gathering more materials!"
    };
}

// Craft discovered recipe
function craftDiscoveredRecipe(recipeId) {
    if (!gameState.discoveredRecipes.includes(recipeId)) return false;
    
    const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    
    // Check and consume inputs
    if (!gameState.canAfford(recipe.inputs)) return false;
    
    for (const [ingId, cost] of Object.entries(recipe.inputs)) {
        gameState.inventory[ingId] -= cost;
    }
    
    // Grant outputs
    for (const [outputId, amount] of Object.entries(recipe.outputs)) {
        if (outputId === "ab") {
            gameState.addAB(amount);
        } else {
            gameState.addIngredient(outputId, amount);
        }
    }
    
    return true;
}
```

---

## 🎨 UI IMPLEMENTATION

### Main HTML Structure (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cyber Witches: Idle Coven</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="game-container">
        <!-- Top Bar -->
        <div id="top-bar">
            <div id="ab-display">AB: 0</div>
            <div id="abps-display">0 AB/s</div>
            <button id="cast-button">✨ Cast</button>
        </div>
        
        <!-- Tab Container -->
        <div id="tab-container">
            <div id="tab-buttons">
                <button class="tab-button active" data-tab="workstations">🏭 Workstations</button>
                <button class="tab-button" data-tab="inscriptions">📜 Inscriptions</button>
                <button class="tab-button" data-tab="inventory">🎒 Inventory</button>
                <button class="tab-button" data-tab="experiment">🔬 Experiment</button>
                <button class="tab-button" data-tab="dailies">📅 Dailies</button>
                <button class="tab-button" data-tab="boons">⭐ Boons</button>
            </div>
            
            <!-- Tab Content -->
            <div id="tab-content">
                <div id="workstations-tab" class="tab-content active">
                    <div id="workstation-list"></div>
                </div>
                <div id="inscriptions-tab" class="tab-content">
                    <div id="upgrade-list"></div>
                </div>
                <div id="inventory-tab" class="tab-content">
                    <div id="inventory-list"></div>
                </div>
                <div id="experiment-tab" class="tab-content">
                    <button id="experiment-button">Try Experiment</button>
                    <div id="experiment-result"></div>
                    <div id="recipe-list"></div>
                </div>
                <div id="dailies-tab" class="tab-content">
                    <div id="daily-tasks"></div>
                </div>
                <div id="boons-tab" class="tab-content">
                    <div id="prestige-display">EK: 0</div>
                    <div id="boon-list"></div>
                </div>
            </div>
        </div>
        
        <!-- Modals -->
        <div id="welcome-back-modal" class="modal">
            <div class="modal-content">
                <h2>Welcome Back!</h2>
                <p id="away-time"></p>
                <p id="offline-ab"></p>
                <button id="close-welcome">Continue</button>
            </div>
        </div>
        
        <div id="prestige-modal" class="modal">
            <div class="modal-content">
                <h2>Ascend</h2>
                <p id="prestige-gain"></p>
                <button id="ascend-button">Ascend</button>
                <button id="cancel-prestige">Cancel</button>
            </div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script type="module" src="js/data.js"></script>
    <script type="module" src="js/utils.js"></script>
    <script type="module" src="js/dailyRituals.js"></script>
    <script type="module" src="js/gameState.js"></script>
    <script type="module" src="js/game.js"></script>
</body>
</html>
```

---

### Main Game Controller (game.js)

```javascript
// Main UI controller
class GameUI {
    constructor() {
        this.gameState = new GameState();
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Cast button
        document.getElementById('cast-button').addEventListener('click', () => {
            this.gameState.cast();
        });
        
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Experiment button
        document.getElementById('experiment-button').addEventListener('click', () => {
            this.tryExperiment();
        });
        
        // Modal close buttons
        document.getElementById('close-welcome').addEventListener('click', () => {
            this.closeModal('welcome-back-modal');
        });
        
        document.getElementById('cancel-prestige').addEventListener('click', () => {
            this.closeModal('prestige-modal');
        });
        
        document.getElementById('ascend-button').addEventListener('click', () => {
            this.ascend();
        });
    }
    
    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update tab content
        this.updateTabContent(tabName);
    }
    
    updateTabContent(tabName) {
        switch (tabName) {
            case 'workstations':
                this.updateWorkstationsTab();
                break;
            case 'inscriptions':
                this.updateInscriptionsTab();
                break;
            case 'inventory':
                this.updateInventoryTab();
                break;
            case 'experiment':
                this.updateExperimentTab();
                break;
            case 'dailies':
                this.updateDailiesTab();
                break;
            case 'boons':
                this.updateBoonsTab();
                break;
        }
    }
    
    updateDisplay() {
        // Update AB display
        document.getElementById('ab-display').textContent = `AB: ${formatShort(this.gameState.ab)}`;
        document.getElementById('abps-display').textContent = `${formatShort(this.gameState.getABPerSecond())} AB/s`;
        
        // Update prestige display
        document.getElementById('prestige-display').textContent = `EK: ${this.gameState.prestigePoints}`;
    }
    
    updateWorkstationsTab() {
        const container = document.getElementById('workstation-list');
        container.innerHTML = '';
        
        for (const workstation of WORKSTATIONS) {
            if (this.gameState.ab < workstation.unlockAtAB) continue;
            
            const owned = this.gameState.workstations[workstation.id] || 0;
            const recipe = scaleRecipe(workstation.recipe, owned, workstation.growth);
            
            const card = this.createWorkstationCard(workstation, owned, recipe);
            container.appendChild(card);
        }
    }
    
    createWorkstationCard(workstation, owned, recipe) {
        const card = document.createElement('div');
        card.className = 'workstation-card';
        
        card.innerHTML = `
            <h3>${workstation.displayName}</h3>
            <p>⚙️ Owned: ${owned}</p>
            <p>Produces: ${Object.entries(workstation.outputs).map(([id, rate]) => 
                `${formatShort(rate)}/s ${id}`).join(', ')}</p>
            <h4>Recipe for next:</h4>
            ${Object.entries(recipe).map(([id, cost]) => {
                const have = this.gameState.inventory[id] || 0;
                const canAfford = have >= cost;
                return `<p class="${canAfford ? 'can-afford' : 'cannot-afford'}">
                    ${id}: ${formatShort(have)} / ${formatShort(cost)}
                </p>`;
            }).join('')}
            <div class="button-row">
                <button onclick="gameUI.craftWorkstation('${workstation.id}', 1)">Craft x1</button>
                <button onclick="gameUI.craftWorkstation('${workstation.id}', 10)">Craft x10</button>
                <button onclick="gameUI.craftWorkstation('${workstation.id}', 'max')">Max</button>
            </div>
        `;
        
        return card;
    }
    
    craftWorkstation(wsId, amount) {
        if (amount === 'max') {
            // Calculate max affordable
            amount = 0;
            const workstation = WORKSTATIONS.find(ws => ws.id === wsId);
            if (!workstation) return;
            
            for (let i = 0; i < 1000; i++) { // Safety limit
                const owned = (this.gameState.workstations[wsId] || 0) + amount;
                const recipe = scaleRecipe(workstation.recipe, owned, workstation.growth);
                
                if (this.gameState.canAfford(recipe)) {
                    amount++;
                } else {
                    break;
                }
            }
        }
        
        this.gameState.craftWorkstation(wsId, amount);
        this.updateWorkstationsTab();
    }
    
    tryExperiment() {
        const result = tryExperiment();
        const resultDiv = document.getElementById('experiment-result');
        
        if (result.success) {
            resultDiv.innerHTML = `<div class="success">✨ Discovered: ${result.recipe.name}</div>`;
            resultDiv.className = 'experiment-success';
        } else {
            resultDiv.innerHTML = `<div class="failure">${result.message}</div>`;
            resultDiv.className = 'experiment-failure';
        }
        
        this.updateExperimentTab();
    }
    
    updateExperimentTab() {
        const container = document.getElementById('recipe-list');
        container.innerHTML = '';
        
        for (const recipeId of this.gameState.discoveredRecipes) {
            const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
            if (!recipe) continue;
            
            const card = this.createRecipeCard(recipe);
            container.appendChild(card);
        }
    }
    
    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        card.innerHTML = `
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <h4>Cost:</h4>
            ${Object.entries(recipe.inputs).map(([id, cost]) => {
                const have = this.gameState.inventory[id] || 0;
                const canAfford = have >= cost;
                return `<p class="${canAfford ? 'can-afford' : 'cannot-afford'}">
                    ${id}: ${formatShort(have)} / ${formatShort(cost)}
                </p>`;
            }).join('')}
            <h4>Produces:</h4>
            ${Object.entries(recipe.outputs).map(([id, amount]) => 
                `<p>${formatShort(amount)} ${id}</p>`).join('')}
            <button onclick="gameUI.craftDiscoveredRecipe('${recipe.id}')">Craft</button>
        `;
        
        return card;
    }
    
    craftDiscoveredRecipe(recipeId) {
        if (craftDiscoveredRecipe(recipeId)) {
            this.updateExperimentTab();
            this.updateDisplay();
        }
    }
    
    // ... other tab update methods would be implemented similarly
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }
    
    ascend() {
        const ekGain = this.gameState.calculatePrestigeGain();
        if (ekGain > 0) {
            this.gameState.ascend();
            this.closeModal('prestige-modal');
            this.updateDisplay();
            this.updateTabContent('workstations');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new GameUI();
});
```

---

## 📦 GAME CONTENT

### Ingredients (data.js)

```javascript
export const INGREDIENTS = [
    {
        id: "wax_bits",
        displayName: "Wax Bits",
        tier: 0,
        icon: "🕯️"
    },
    {
        id: "wick_fiber",
        displayName: "Wick Fiber",
        tier: 0,
        icon: "🧵"
    },
    {
        id: "crystal_dust",
        displayName: "Crystal Dust",
        tier: 0,
        icon: "💎"
    },
    {
        id: "aether_ess",
        displayName: "Aether Essence",
        tier: 0,
        icon: "✨"
    },
    {
        id: "wax_block",
        displayName: "Wax Block",
        tier: 1,
        icon: "🧱"
    },
    {
        id: "braided_wick",
        displayName: "Braided Wick",
        tier: 1,
        icon: "🪢"
    },
    {
        id: "shaped_crys",
        displayName: "Shaped Crystal",
        tier: 1,
        icon: "💠"
    },
    {
        id: "dist_aether",
        displayName: "Distilled Aether",
        tier: 1,
        icon: "🧪"
    },
    {
        id: "dig_candle",
        displayName: "Digital Candle",
        tier: 2,
        icon: "🕯️"
    }
];
```

---

### Workstations (data.js)

```javascript
export const WORKSTATIONS = [
    {
        id: "ws_melter",
        displayName: "Wax Melter",
        description: "Melts raw wax into refined blocks",
        unlockAtAB: 0,
        recipe: { wax_bits: 10 },
        growth: 1.10,
        outputs: { wax_block: 0.30 },
        icon: "🔥"
    },
    {
        id: "ws_spinner",
        displayName: "Wick Spinner",
        description: "Spins fibers into braided wicks",
        unlockAtAB: 0,
        recipe: { wick_fiber: 10 },
        growth: 1.10,
        outputs: { braided_wick: 0.30 },
        icon: "🌀"
    },
    {
        id: "ws_shaper",
        displayName: "Crystal Shaper",
        description: "Shapes dust into refined crystals",
        unlockAtAB: 25,
        recipe: { crystal_dust: 10 },
        growth: 1.12,
        outputs: { shaped_crys: 0.20 },
        icon: "💎"
    },
    {
        id: "ws_still",
        displayName: "Aether Still",
        description: "Distills essence into pure aether",
        unlockAtAB: 50,
        recipe: { aether_ess: 10 },
        growth: 1.12,
        outputs: { dist_aether: 0.20 },
        icon: "🧪"
    },
    {
        id: "ws_candle",
        displayName: "Digital Candle Farm",
        description: "Automated candle production",
        unlockAtAB: 100,
        recipe: { wax_block: 5, braided_wick: 1, dist_aether: 2 },
        growth: 1.14,
        outputs: { ab: 1.0 },
        icon: "🕯️"
    },
    {
        id: "ws_crystal",
        displayName: "Crystal Rig",
        description: "Mining operation for crystals and AB",
        unlockAtAB: 250,
        recipe: { shaped_crys: 2, dist_aether: 2 },
        growth: 1.14,
        outputs: { ab: 0.15, crystal_dust: 0.05 },
        icon: "⛏️"
    },
    {
        id: "ws_cauldron",
        displayName: "Quantum Cauldron",
        description: "Advanced AB generation",
        unlockAtAB: 1500,
        recipe: { shaped_crys: 3, dist_aether: 3, dig_candle: 1 },
        growth: 1.16,
        outputs: { ab: 2.5 },
        icon: "🪄"
    }
];
```

---

### Upgrades (data.js)

```javascript
export const UPGRADES = [
    {
        id: "u_global_1",
        displayName: "Hex Compiler v1",
        description: "Increases all production by 50%",
        affects: "global",
        type: "multiplier",
        value: 1.5,
        recipe: { wax_block: 2, braided_wick: 2, shaped_crys: 1 },
        unlockAtAB: 0
    },
    {
        id: "u_click_1",
        displayName: "Sigil Stroke",
        description: "Adds +1 to all cast rewards",
        affects: "click",
        type: "additive",
        value: 1.0,
        recipe: { wick_fiber: 10 },
        unlockAtAB: 0
    },
    {
        id: "u_candle_1",
        displayName: "Wax Algorithm",
        description: "Doubles Digital Candle Farm production",
        affects: "producer:ws_candle",
        type: "multiplier",
        value: 2.0,
        recipe: { wax_block: 3, dist_aether: 1 },
        unlockAtAB: 100
    },
    {
        id: "u_crystal_1",
        displayName: "Quantum Faceting",
        description: "Doubles Crystal Rig production",
        affects: "producer:ws_crystal",
        type: "multiplier",
        value: 2.0,
        recipe: { shaped_crys: 2, dist_aether: 1 },
        unlockAtAB: 250
    },
    {
        id: "u_global_2",
        displayName: "Sigil Cache",
        description: "Increases all production by 80%",
        affects: "global",
        type: "multiplier",
        value: 1.8,
        recipe: { wax_block: 3, shaped_crys: 2, dist_aether: 2 },
        unlockAtAB: 500
    },
    {
        id: "u_cauldron_1",
        displayName: "Brew Daemon",
        description: "Increases Quantum Cauldron production by 80%",
        affects: "producer:ws_cauldron",
        type: "multiplier",
        value: 1.8,
        recipe: { shaped_crys: 2, dist_aether: 2, dig_candle: 1 },
        unlockAtAB: 1500
    }
];
```

---

### Prestige Bonuses (data.js)

```javascript
export const PRESTIGE_BONUSES = [
    {
        id: "pp_global_1",
        displayName: "Coven's Oath",
        description: "Global production boost",
        type: "global_mult",
        value: 0.05,
        baseCost: 10,
        costGrowth: 1.5
    },
    {
        id: "pp_start_ab",
        displayName: "Seeded Spellbook",
        description: "Start with AB after prestige",
        type: "starting_currency",
        value: 1000,
        baseCost: 5,
        costGrowth: 1.5
    },
    {
        id: "pp_candle_mult",
        displayName: "Wax Moon",
        description: "Digital Candle Farm bonus",
        type: "producer_mult",
        param: "ws_candle",
        value: 0.05,
        baseCost: 8,
        costGrowth: 1.5
    },
    {
        id: "pp_crystal_mult",
        displayName: "Facet Star",
        description: "Crystal Rig bonus",
        type: "producer_mult",
        param: "ws_crystal",
        value: 0.05,
        baseCost: 10,
        costGrowth: 1.5
    },
    {
        id: "pp_cauldron_mult",
        displayName: "Crucible Pact",
        description: "Quantum Cauldron bonus",
        type: "producer_mult",
        param: "ws_cauldron",
        value: 0.05,
        baseCost: 12,
        costGrowth: 1.5
    },
    {
        id: "pp_start_wax",
        displayName: "Pocket Satchel",
        description: "Start with ingredients",
        type: "start_ingredient",
        param: "wax_bits",
        value: 100,
        baseCost: 6,
        costGrowth: 1.5
    }
];
```

---

### Daily Tasks (data.js)

```javascript
export const DAILY_TASKS_POOL = [
    {
        id: "d_kindle",
        displayName: "Kindle the Grid",
        description: "Craft 3 Wax Melters",
        condition: "craft:workstation:ws_melter:3",
        rewardType: "ab",
        rewardValue: 5000
    },
    {
        id: "d_song",
        displayName: "Crystal Song",
        description: "Own 3 Crystal Rigs",
        condition: "own:workstation:ws_crystal:3",
        rewardType: "buff",
        rewardValue: 900,
        buffMultiplier: 0.10
    },
    {
        id: "d_flow",
        displayName: "Rite of Flow",
        description: "Cast 150 times",
        condition: "tap:150",
        rewardType: "ek_frag",
        rewardValue: 1
    },
    {
        id: "d_threads",
        displayName: "Threads of Fate",
        description: "Craft 20 Braided Wicks",
        condition: "craft_item:braided_wick:20",
        rewardType: "ab",
        rewardValue: 8000
    },
    {
        id: "d_alchemy",
        displayName: "Aether Alchemy",
        description: "Craft 10 Distilled Aether",
        condition: "craft_item:dist_aether:10",
        rewardType: "buff",
        rewardValue: 600,
        buffMultiplier: 0.15
    }
];
```

---

## 📐 BALANCE FORMULAS

### Key Constants

```javascript
// First prestige target (about 35 minutes with base rates)
const PRESTIGE_SCALE = 1200000;

// Offline progress cap
const OFFLINE_CAP_SECONDS = 43200; // 12 hours

// Cast base amounts
const CAST_BASE_AMOUNTS = {
    wax_bits: 1.0,
    wick_fiber: 1.0,
    crystal_dust: 0.5,
    aether_ess: 0.5
};
```

---

### Prestige Formula

```javascript
// EK = floor(sqrt(lifetime_AB / 1,200,000))

// Examples:
// - 1.2M lifetime → 1 EK
// - 4.8M lifetime → 2 EK
// - 10.8M lifetime → 3 EK

// Next threshold:
// Next = (current_EK + 1)² × 1,200,000

// Examples:
// - Currently 1 EK → need 4.8M (+3.6M more)
// - Currently 2 EK → need 10.8M (+6M more)
```

---

### Recipe Scaling

```javascript
// cost = base_cost × (growth ^ owned)

// Example: Wax Melter (growth 1.10)
// - 1st: 10 wax_bits
// - 2nd: 11 wax_bits
// - 10th: 26 wax_bits
// - 100th: 137,795 wax_bits
```

---

### Production Multipliers

```javascript
// final_output = base_rate × global_mult × producer_mult × buff_mult × owned

// Where:
// - global_mult = product of all global upgrades
// - producer_mult = product of producer-specific upgrades
// - buff_mult = product of active buffs
```

---

## 📅 DAILY RITUALS

### Daily Rituals System (dailyRituals.js)

```javascript
export class DailyRituals {
    constructor() {
        this.taskPool = DAILY_TASKS_POOL;
        this.activeTasks = [];
        this.taskProgress = {};
        this.claimedTasks = [];
        this.currentDayKey = "";
        this.ekFragments = 0;
        
        this.checkDailyRefresh();
    }
    
    checkDailyRefresh() {
        const today = this.getDayKey();
        
        if (today !== this.currentDayKey) {
            this.currentDayKey = today;
            this.selectDailyTasks();
            this.taskProgress = {};
            this.claimedTasks = [];
        }
    }
    
    getDayKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    selectDailyTasks() {
        // Randomly select 3 tasks
        this.activeTasks = [];
        const available = [...this.taskPool];
        
        // Shuffle array
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }
        
        // Select first 3
        for (let i = 0; i < Math.min(3, available.length); i++) {
            this.activeTasks.push(available[i]);
        }
    }
    
    updateTaskProgress(conditionType, param, value) {
        for (const task of this.activeTasks) {
            if (this.claimedTasks.includes(task.id)) continue;
            
            const parts = task.condition.split(":");
            if (parts.length < 2) continue;
            
            const taskType = parts[0];
            
            // Match condition type
            if (taskType === conditionType) {
                // For workstation tasks
                if (["craft", "own"].includes(conditionType) && parts.length > 2) {
                    if (parts[2] === param) {
                        const target = parseInt(parts[3]) || 1;
                        this.taskProgress[task.id] = value;
                        
                        if (value >= target) {
                            this.onTaskCompleted(task.id);
                        }
                    }
                }
                // For tap tasks
                else if (conditionType === "tap") {
                    const target = parseInt(parts[1]);
                    this.taskProgress[task.id] = value;
                    
                    if (value >= target) {
                        this.onTaskCompleted(task.id);
                    }
                }
            }
        }
    }
    
    onTaskCompleted(taskId) {
        // Play celebration effect
        console.log(`Task completed: ${taskId}`);
    }
    
    claimTask(taskId) {
        if (this.claimedTasks.includes(taskId)) return false;
        
        // Find task
        const task = this.activeTasks.find(t => t.id === taskId);
        if (!task) return false;
        
        // Check completion
        const parts = task.condition.split(":");
        const target = parseInt(parts[parts.length - 1]) || 1;
        const progress = this.taskProgress[taskId] || 0;
        
        if (progress < target) return false;
        
        // Grant reward
        switch (task.rewardType) {
            case "ab":
                gameState.addAB(task.rewardValue);
                break;
            case "buff":
                gameState.addBuff(task.buffMultiplier, task.rewardValue);
                break;
            case "ek_frag":
                this.grantEKFragments(parseInt(task.rewardValue));
                break;
        }
        
        this.claimedTasks.push(taskId);
        return true;
    }
    
    grantEKFragments(amount) {
        this.ekFragments += amount;
        
        // Convert 5 fragments → 1 EK
        while (this.ekFragments >= 5) {
            this.ekFragments -= 5;
            gameState.prestigePoints += 1;
        }
    }
    
    saveState() {
        return {
            dayKey: this.currentDayKey,
            activeIds: this.activeTasks.map(t => t.id),
            progress: this.taskProgress,
            claimed: this.claimedTasks,
            ekFragments: this.ekFragments
        };
    }
    
    loadState(data) {
        this.currentDayKey = data.dayKey || "";
        this.taskProgress = data.progress || {};
        this.claimedTasks = data.claimed || [];
        this.ekFragments = data.ekFragments || 0;
        
        // Reconstruct active tasks
        const activeIds = data.activeIds || [];
        this.activeTasks = [];
        for (const taskId of activeIds) {
            const task = this.taskPool.find(t => t.id === taskId);
            if (task) {
                this.activeTasks.push(task);
            }
        }
        
        this.checkDailyRefresh();
    }
}
```

---

## ✅ TESTING CHECKLIST

### Core Systems

- [ ] Cast button grants ingredients
- [ ] Ingredients accumulate correctly
- [ ] Workstation crafting works
- [ ] Workstations produce every tick
- [ ] AB accumulates from production
- [ ] Upgrades apply multipliers
- [ ] Click upgrades boost Cast

### Recipes & Scaling

- [ ] Recipe costs increase with owned count
- [ ] Growth formula works (1.10^owned)
- [ ] Have/Need display updates
- [ ] Craft x1, x10, Max work
- [ ] Can't craft without ingredients

### Prestige

- [ ] EK calculation correct
- [ ] Ascend preview shows gain
- [ ] Ascend resets run properly
- [ ] Bonuses persist after reset
- [ ] Starting bonuses apply
- [ ] Boon costs increase correctly

### Offline Progress

- [ ] Save creates in localStorage
- [ ] Offline time calculates correctly
- [ ] Production caps at 12h
- [ ] Welcome Back shows correct values
- [ ] No production without workstations

### Experiment System

- [ ] Discovery checks ingredients
- [ ] Can't discover without materials
- [ ] Discovery persists after save/load
- [ ] Discovered recipes can craft
- [ ] Crafting consumes correctly

### Daily Rituals

- [ ] 3 tasks selected daily
- [ ] Progress tracks correctly
- [ ] Rewards grant on claim
- [ ] Refresh at midnight
- [ ] EK fragments combine (5→1)

### UI/UX

- [ ] Portrait layout works
- [ ] All tabs accessible
- [ ] Numbers format (K, M, B)
- [ ] Buttons disable when broke
- [ ] Modals show/hide properly

### Web Performance

- [ ] 60 FPS on desktop browser
- [ ] 30+ FPS on mobile browser
- [ ] Save persists (localStorage)
- [ ] No console errors
- [ ] Touch input works
- [ ] Portrait orientation locks

---

## 🌐 WEB DEPLOYMENT

### Local Testing

```bash
# Navigate to project folder
cd CyberWitches

# Install dependencies
npm install

# Start local server
npm start

# Open browser to http://localhost:8080
```

---

### Production Deployment

```bash
# Build for production (if using build tools)
npm run build

# Deploy to hosting service
# Options: GitHub Pages, Netlify, Vercel, etc.
```

---

### Performance Tips

```javascript
// Limit FPS for better performance
let lastFrameTime = 0;
const targetFPS = 60;

function gameLoop(timestamp) {
    if (timestamp - lastFrameTime >= 1000 / targetFPS) {
        updateGame();
        render();
        lastFrameTime = timestamp;
    }
    
    requestAnimationFrame(gameLoop);
}

// Optimize DOM updates
let pendingUpdate = false;

function scheduleUpdate() {
    if (!pendingUpdate) {
        pendingUpdate = true;
        requestAnimationFrame(() => {
            updateUI();
            pendingUpdate = false;
        });
    }
}

// Use object pooling for frequently created/destroyed elements
const elementPool = [];

function getDivElement() {
    return elementPool.pop() || document.createElement('div');
}

function returnDivElement(element) {
    elementPool.push(element);
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Week 1)

**Days 1-2: Project Setup**
- [ ] Create HTML structure
- [ ] Set up CSS styling
- [ ] Configure npm project
- [ ] Create folder structure

**Days 3-5: Data Models**
- [ ] Define all game data
- [ ] Create data structures
- [ ] Test data loading

**Days 6-7: Core Utils**
- [ ] Implement number formatting
- [ ] Implement balance formulas
- [ ] Test formulas

---

### Phase 2: Core Systems (Week 2)

**Days 8-10: Game State**
- [ ] Implement GameState class
- [ ] Implement save/load system
- [ ] Test persistence

**Days 11-14: Production**
- [ ] Implement inventory system
- [ ] Implement Cast() function
- [ ] Implement tick loop
- [ ] Implement workstation crafting
- [ ] Test full production chain

---

### Phase 3: Progression (Week 3)

**Days 15-17: Upgrades & Production**
- [ ] Implement upgrade system
- [ ] Implement multiplier calculations
- [ ] Test all upgrade types

**Days 18-21: Prestige**
- [ ] Implement prestige formulas
- [ ] Implement reset logic
- [ ] Implement boon purchasing
- [ ] Test full prestige cycle

---

### Phase 4: Discovery (Week 4)

**Days 22-24: Experiment System**
- [ ] Add hidden recipes
- [ ] Implement try_experiment()
- [ ] Implement recipe crafting
- [ ] Test discovery flow

**Days 25-28: Daily Rituals**
- [ ] Implement DailyRituals class
- [ ] Wire task tracking
- [ ] Test daily refresh
- [ ] Test EK fragments

---

### Phase 5: UI (Weeks 5-6)

**Days 29-35: Basic UI**
- [ ] Create HTML structure
- [ ] Implement TopBar + Cast
- [ ] Create tab system
- [ ] Implement Workstations tab
- [ ] Implement Inscriptions tab

**Days 36-42: Advanced UI**
- [ ] Implement Inventory tab
- [ ] Implement Experiment tab
- [ ] Implement Dailies tab
- [ ] Implement Boons tab
- [ ] Create all modals

---

### Phase 6: Polish (Week 7)

**Days 43-49: Quality of Life**
- [ ] Add animations
- [ ] Implement settings panel
- [ ] Add accessibility options
- [ ] Fix visual bugs
- [ ] Optimize performance

---

### Phase 7: Balance (Week 8)

**Days 50-56: Tuning**
- [ ] Playtest first prestige
- [ ] Adjust prestige_scale
- [ ] Tune production rates
- [ ] Test offline progression
- [ ] Verify unlock curve

---

### Phase 8: Deployment (Week 9)

**Days 57-63: Deployment**
- [ ] Configure for production
- [ ] Test on Chrome/Firefox/Safari
- [ ] Test on mobile devices
- [ ] Verify localStorage
- [ ] Optimize loading times
- [ ] Deploy to hosting

---

## 🎯 SUCCESS CRITERIA

### Minimum Viable Product

✅ **Core loop works:**
- Cast → Gather → Craft → Produce → Prestige

✅ **Systems functional:**
- Save/Load persists
- Offline progress calculates
- All tabs accessible

✅ **Performance:**
- 60 FPS on desktop
- 30+ FPS on mobile

---

### Full v1.0 Release

✅ **All features:**
- Experiment system complete
- Daily rituals working
- All content unlockable

✅ **Polish:**
- No critical bugs
- UI is responsive
- Numbers format correctly

✅ **Balance:**
- First prestige ~30-40 min
- Progression feels smooth
- Offline rewards fair

---

## 📝 FINAL NOTES

### Implementation Tips

**Start small, test often.**
Build one system at a time and verify it works before moving on.

**Use debug commands.**
Add functions to skip ahead and test late-game content.

**Save frequently.**
Auto-save every 30 seconds prevents data loss.

**Test on real devices.**
Desktop simulation doesn't catch mobile issues.

---

### Common Pitfalls

⚠️ **Forgetting to save**
Call `saveGameState()` after major changes

⚠️ **UI not updating**
Connect events properly to refresh displays

⚠️ **Recipe scaling bugs**
Always test with 0, 1, 10, 100 owned units

⚠️ **Offline calculation errors**
Verify production rates before calculating offline

⚠️ **Prestige bonuses not applying**
Check starting bonus application on new run

---

### Getting Help

**JavaScript Documentation:**
https://developer.mozilla.org/en-US/docs/Web/JavaScript

**Web Game Development:**
https://developer.mozilla.org/en-US/docs/Games

**Idle Game Design:**
https://www.reddit.com/r/incremental_games/

---

## 🎮 YOU'RE READY TO BUILD

This document contains everything needed to implement **Cyber Witches: Idle Coven v1.0** with **Experiment discovery system** using vanilla JavaScript.

Follow phases sequentially, test frequently, and you'll have a polished web game in **8-9 weeks**.

**Good luck, and may your code compile on the first try!** ✨

---

*End of Implementation Guide*
