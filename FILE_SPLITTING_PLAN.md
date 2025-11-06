# File Splitting Plan

**Date:** November 2025  
**Purpose:** Split large files (`game.js` and `gameState.js`) into smaller, more maintainable modules

---

## Overview

- **game.js**: 5,542 lines → Split into ~6-8 modules
- **gameState.js**: 1,341 lines → Split into ~5 modules

---

## gameState.js Splitting Strategy

### 1. `gameStateCore.js` (~300 lines)
**Responsibility:** Core state management, initialization, currency, inventory
- Constructor
- `start()`, `startTickLoop()`, `tick()`
- Currency methods: `addAb()`, `spendAb()`
- Inventory methods: `addIngredient()`, `spendIngredient()`
- Basic state properties

### 2. `gameStateProduction.js` (~200 lines)
**Responsibility:** Production calculations
- `calculateTotalProduction()`
- `getProductionMultiplier()`
- `getAbPerSecond()`
- Production-related logic

### 3. `gameStateBuffs.js` (~150 lines)
**Responsibility:** Buff and potion system
- `updateBuffs()`
- `addBuff()`
- `getBuff()`
- `getPotionEffect()`
- `consumePotion()`

### 4. `gameStatePrestige.js` (~200 lines)
**Responsibility:** Prestige/ascension system
- `calculatePrestigeGain()`
- `ascend()`
- `applyPrestigeStartBonuses()`
- `purchasePrestigeBonus()`

### 5. `gameStateSave.js` (~400 lines)
**Responsibility:** Save/load functionality
- `saveGameState()`
- `loadGameState()`
- `validateSaveData()`
- `migrateSaveData()`
- `compressSaveData()`
- `checkSaveConflicts()`
- `mergeSaveData()`
- `applyOfflineProgress()`
- `cleanupInventory()`

### 6. `gameStateCrafting.js` (~100 lines)
**Responsibility:** Crafting and experimentation
- `craftWorkstation()`
- `inscribeUpgrade()`
- `canAfford()`
- `consumeRecipe()`
- `tryExperiment()`
- `craftDiscoveredRecipe()`

### 7. `gameStateMilestones.js` (~100 lines)
**Responsibility:** Milestone system
- `checkMilestones()`
- `unlockMilestone()`
- Milestone-related logic

### 8. `gameState.js` (Main file, ~100 lines)
**Responsibility:** Main class that imports and composes all modules
- Main `GameState` class
- Imports all sub-modules
- Composes functionality

---

## game.js Splitting Strategy

### 1. `gameCore.js` (~200 lines)
**Responsibility:** Core game initialization and main loop
- Global variables
- `initUI()` (core initialization)
- Main game loop
- System initialization

### 2. `gameUI.js` (~300 lines)
**Responsibility:** UI element management and updates
- UI element references
- `updateAbDisplay()`
- `updateAbpsDisplay()`
- Element counter updates
- Sidebar management

### 3. `gameTabs.js` (~400 lines)
**Responsibility:** Tab navigation and switching
- `switchTab()`
- Tab button management
- Tab content updates
- Browser navigation integration

### 4. `gameWorkstations.js` (~800 lines)
**Responsibility:** Workstation tab logic
- `updateWorkstationsTab()`
- `updateWorkstationsTabTraditional()`
- Workstation card creation
- Workstation crafting UI
- Helper functions: `getInscriptionBonuses()`, `getInscriptionBonusRates()`, `getTierSymbol()`, `getWorkstationTier()`

### 5. `gameInscriptions.js` (~600 lines)
**Responsibility:** Inscriptions/upgrades tab logic
- `updateInscriptionsTab()`
- Upgrade card creation
- Upgrade purchasing UI
- Helper functions: `getUpgradeTier()`

### 6. `gameInventory.js` (~200 lines)
**Responsibility:** Inventory tab logic
- `updateInventoryTab()`
- Inventory display
- Ingredient management UI

### 7. `gameModals.js` (~400 lines)
**Responsibility:** Modal management
- Prestige modal
- Welcome back modal
- Destructive confirmation modal
- Modal show/hide logic

### 8. `gameKeyboard.js` (~200 lines)
**Responsibility:** Keyboard shortcuts
- `keyboardShortcuts` object
- Keyboard event handlers
- Shortcut definitions

### 9. `gameAnimations.js` (~100 lines)
**Responsibility:** Animation helpers
- `animateNumberWithFormatter()`
- Animation utilities

### 10. `game.js` (Main file, ~200 lines)
**Responsibility:** Main game controller that imports and composes all modules
- Main initialization
- Imports all sub-modules
- Composes functionality
- Event listeners setup

---

## Implementation Steps

1. **Create new module files** with extracted functionality
2. **Update imports** in main files
3. **Test each module** independently
4. **Update main files** to use new modules
5. **Run full test suite** to ensure nothing broke
6. **Update documentation** (ARCHITECTURE.md)

---

## Benefits

1. **Maintainability:** Easier to find and fix bugs
2. **Testability:** Each module can be tested independently
3. **Collaboration:** Multiple developers can work on different modules
4. **Performance:** Smaller files load faster
5. **Code Organization:** Clear separation of concerns

---

## Risks & Mitigation

1. **Risk:** Breaking existing functionality
   - **Mitigation:** Comprehensive testing after each split

2. **Risk:** Circular dependencies
   - **Mitigation:** Careful dependency management, use dependency injection

3. **Risk:** Increased complexity
   - **Mitigation:** Clear documentation, consistent naming

---

## Notes

- All modules should use ES6 modules (`import`/`export`)
- Maintain backward compatibility where possible
- Update all references to split functions
- Keep main files as thin wrappers that compose functionality

