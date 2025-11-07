# Cyber Witches: Idle Coven - Architecture Documentation

**Last Updated:** November 2025  
**Version:** 2.1

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Core Systems](#core-systems)
4. [Data Flow](#data-flow)
5. [File Structure](#file-structure)
6. [Key Design Decisions](#key-design-decisions)
7. [Performance Optimizations](#performance-optimizations)
8. [Future Improvements](#future-improvements)

---

## System Overview

Cyber Witches: Idle Coven is an incremental/idle game built with vanilla JavaScript (ES6+ modules), HTML5, and CSS3. The game follows a modular architecture with clear separation of concerns.

### Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+ modules), HTML5, CSS3
- **Build Tools:** esbuild, http-server
- **Testing:** Jest
- **Code Quality:** ESLint, Prettier
- **Audio:** Web Audio API, Tone.js
- **Storage:** localStorage (with cloud save support archived)

### Core Principles

1. **Modularity:** Each system is self-contained in its own module
2. **Performance:** Optimized for 60fps with batched DOM updates
3. **Accessibility:** WCAG 2.2 AA compliant
4. **Progressive Enhancement:** Design tier system (Tier 0-4)
5. **User Experience:** Responsive design, mobile-first approach

---

## Architecture Patterns

### Module Pattern

The game uses ES6 modules for encapsulation and dependency management:

```javascript
// Example: gameState.js
export class GameState {
    // Game state logic
}

// Example: game.js
import { GameState } from './gameState.js';
```

### Singleton Pattern

Some systems use singleton pattern for global access:

```javascript
// Example: questSystem.js
const questSystem = new QuestSystem();
export default questSystem;
```

### Observer Pattern

Game state uses callbacks for event notifications:

```javascript
// Example: gameState.js
this.onAbChanged = null;
this.onIngredientChanged = null;
```

### Factory Pattern

Utility functions create DOM elements and game objects:

```javascript
// Example: commonUtils.js
function createElement(tag, className, content) {
    // Element creation logic
}
```

---

## Core Systems

### 1. Game State Management (`gameState.js`)

**Responsibility:** Manages all game state (currency, inventory, workstations, upgrades, prestige)

**Key Features:**
- Auto-save every 30 seconds
- Save data validation and versioning
- Offline progress calculation
- Production calculation with multipliers
- Buff system

**State Structure:**
```javascript
{
    ab: number,                    // Current AB currency
    abTotalEarned: number,         // Lifetime AB earned
    inventory: Object,             // Ingredient counts
    workstations: Object,         // Workstation counts
    upgradesOwned: Object,         // Owned upgrades
    prestigePoints: number,         // Eldritch Keys
    prestigeBonuses: Object,      // Prestige bonus levels
    activeBuffs: Array,           // Active temporary buffs
    discoveredRecipes: Array,      // Discovered recipes
    unlockedMilestones: Set       // Unlocked milestones
}
```

### 2. UI Controller (`game.js`)

**Responsibility:** Manages UI updates, user interactions, and coordinates between systems

**Key Features:**
- Tab navigation
- UI update batching (60fps)
- Event handling
- Modal management
- Integration with all game systems

**Update Flow:**
1. Game tick updates state
2. State changes trigger callbacks
3. Callbacks queue UI updates
4. Updates batched and applied at 60fps

### 3. Design Tier System (`designTierSystem.js`)

**Responsibility:** Progressive feature unlocking (Tier 0-4)

**Tiers:**
- **Tier 0:** Minimal (monochrome, no animations)
- **Tier 1:** Basic colors
- **Tier 2:** Sound effects
- **Tier 3:** Full graphics & animations
- **Tier 4:** Music

**Unlock Requirements:**
- Tier 1: First achievement OR 100 AB
- Tier 2: First prestige OR 1,000 AB
- Tier 3: Second prestige OR 10,000 AB
- Tier 4: Third prestige OR 100,000 AB

### 4. Audio System (`audioSystem.js`)

**Responsibility:** Manages sound effects and music

**Features:**
- Web Audio API for sound effects
- Tone.js for ambient music
- Volume controls (SFX and Music separate)
- Tier-based activation

### 5. Achievement System (`achievements.js`)

**Responsibility:** Tracks and awards achievements

**Features:**
- Milestone tracking
- Achievement notifications
- Progress tracking
- Design tier integration

### 6. Daily Rituals (`dailyRituals.js`)

**Responsibility:** Daily task system

**Features:**
- Daily task generation
- Task progress tracking
- Reward distribution
- Eldritch Key fragments

### 7. Meditation System (`meditationState.js`, `meditationUI.js`, `meditationTowers.js`)

**Responsibility:** Tower defense mini-game

**Features:**
- Wave-based gameplay
- Tower placement
- Resource management (Focus)
- Production bonuses

### 8. Tutorial System (`tutorial.js`)

**Responsibility:** Guided onboarding for new players

**Features:**
- Step-by-step tutorial
- Progress saving
- Skip functionality
- Auto-start for new players

### 9. Quest System (`questSystem.js`)

**Responsibility:** Quest/objective system for player guidance

**Features:**
- Quest tracking
- Progress updates
- Reward distribution
- Quest completion notifications

### 10. Balance Testing Framework (`balanceTesting.js`)

**Responsibility:** Tools for testing game balance (development only)

**Features:**
- Progression curve testing
- Economy testing
- Scaling testing
- Accessible via Ctrl+B in development

---

## Data Flow

### Game Loop

```
1. Game Tick (100ms interval)
   ↓
2. Calculate Production
   ↓
3. Update State (AB, ingredients)
   ↓
4. Trigger Callbacks
   ↓
5. Queue UI Updates
   ↓
6. Batch Updates (60fps)
   ↓
7. Render UI
```

### Save/Load Flow

```
Save:
1. Game State → Serialize
2. Validate Data
3. Version Check
4. localStorage.setItem()

Load:
1. localStorage.getItem()
2. Parse JSON
3. Validate Structure
4. Migrate if needed
5. Load State
6. Apply Offline Progress
```

### User Interaction Flow

```
1. User Action (click, keyboard)
   ↓
2. Event Handler
   ↓
3. Validate Action
   ↓
4. Update Game State
   ↓
5. Trigger Callbacks
   ↓
6. Update UI
   ↓
7. Save State (if needed)
```

---

## File Structure

```
CyberWitches/
├── index.html              # Main HTML file
├── styles.css              # All styles
├── package.json            # Dependencies and scripts
├── js/
│   ├── game.js             # Main UI controller (5000+ lines - needs splitting)
│   ├── gameState.js        # Game state management (1000+ lines - needs splitting)
│   ├── data.js             # Game data (ingredients, producers, upgrades)
│   ├── utils.js            # Utility functions
│   ├── commonUtils.js      # Common utilities
│   ├── errorHandler.js     # Error handling
│   ├── audioSystem.js      # Audio management
│   ├── designTierSystem.js # Design tier system
│   ├── achievements.js     # Achievement system
│   ├── dailyRituals.js     # Daily rituals
│   ├── meditationState.js  # Meditation game state
│   ├── meditationUI.js     # Meditation UI
│   ├── meditationTowers.js # Meditation towers
│   ├── tutorial.js         # Tutorial system
│   ├── questSystem.js      # Quest system
│   ├── balanceTesting.js   # Balance testing framework
│   ├── loadingState.js     # Loading state management
│   ├── accessibility.js   # Accessibility features
│   ├── errorRecovery.js   # Error recovery
│   ├── privacyControls.js # Privacy controls
│   ├── searchFilter.js    # Archived - see archive/code/searchFilter.js
│   ├── progressIndicators.js # Progress indicators
│   ├── featureIndicators.js  # Feature indicators
│   ├── sustainableDesign.js # Sustainable design
│   ├── browserNavigation.js # Browser navigation
│   ├── mobileNavigation.js   # Mobile navigation
│   ├── mobilePerformance.js # Mobile performance
│   └── ... (other modules)
├── images/                 # Image assets
├── icons/                  # Icon assets
├── tests/                  # Test files
└── docs/                   # Documentation
```

---

## Key Design Decisions

### 1. Why Vanilla JavaScript?

- **No Build Step Required:** Easy to develop and debug
- **Small Bundle Size:** No framework overhead
- **Full Control:** Direct DOM manipulation for performance
- **Compatibility:** Works in all modern browsers

### 2. Why localStorage?

- **Offline Support:** Works without internet
- **No Backend Required:** Simple deployment
- **Fast Access:** Synchronous API
- **Privacy:** Data stays on user's device

### 3. Why Design Tier System?

- **Progressive Enhancement:** Gradually reveal features
- **Performance:** Lower tiers use fewer resources
- **Accessibility:** Tier 0 is fully accessible
- **Engagement:** Unlocking tiers provides goals

### 4. Why Batched DOM Updates?

- **Performance:** Reduces reflows and repaints
- **Smooth 60fps:** Consistent frame rate
- **Battery Life:** Fewer DOM operations = less CPU usage

### 5. Why Modular Architecture?

- **Maintainability:** Easy to find and fix bugs
- **Testability:** Each module can be tested independently
- **Scalability:** Easy to add new features
- **Collaboration:** Multiple developers can work on different modules

---

## Performance Optimizations

### 1. DOM Update Batching

Updates are batched and applied at 60fps using `requestAnimationFrame`:

```javascript
// Example: gameState.js
this.pendingUpdates = new Set();
this.batchTimeout = null;
this.batchDelay = 16; // ~60fps
```

### 2. Virtual Scrolling

Large lists use virtual scrolling to render only visible items:

```javascript
// Example: virtualScroll.js
class VirtualWorkstationList {
    // Only renders visible items
}
```

### 3. Debouncing/Throttling

UI updates are debounced to prevent excessive updates:

```javascript
// Example: commonUtils.js
function debounce(func, wait) {
    // Debounce implementation
}
```

### 4. Lazy Loading

Assets are loaded on demand:

```javascript
// Example: lazyAssetLoading.js
class LazyAssetLoadingManager {
    // Lazy load images and other assets
}
```

### 5. Animation Optimization

Animations use CSS transforms instead of position changes:

```css
/* Example: styles.css */
.element {
    transform: translateX(0);
    will-change: transform;
}
```

---

## Future Improvements

### 1. Code Organization

- **Split Large Files:** `game.js` (5000+ lines) and `gameState.js` (1000+ lines) need to be split into smaller modules
- **Feature-Based Structure:** Organize code by feature rather than by type
- **Configuration Files:** Extract magic numbers to configuration files

### 2. Testing

- **Increase Coverage:** Target 80%+ test coverage
- **Integration Tests:** Add tests for critical user flows
- **E2E Tests:** Add end-to-end tests

### 3. Performance

- **Code Splitting:** Split JavaScript into smaller chunks
- **Asset Optimization:** Optimize images and other assets
- **Core Web Vitals:** Optimize for LCP < 2.5s, FID < 100ms, CLS < 0.1

### 4. Features

- **Cloud Save:** Re-implement cloud save functionality
- **Social Features:** Re-implement coven system
- **Content Updates:** Regular content updates and events

### 5. Documentation

- **API Documentation:** Complete JSDoc for all public APIs
- **User Documentation:** In-game help system
- **Developer Guide:** Detailed setup and contribution guide

---

## Decision Records (ADRs)

### ADR-001: Vanilla JavaScript over Framework

**Status:** Accepted  
**Date:** 2024

**Context:** Need to choose between vanilla JavaScript and a framework (React, Vue, etc.)

**Decision:** Use vanilla JavaScript with ES6 modules

**Consequences:**
- ✅ No build step required for development
- ✅ Smaller bundle size
- ✅ Full control over DOM manipulation
- ❌ More manual DOM management
- ❌ No built-in state management

### ADR-002: localStorage over Backend

**Status:** Accepted  
**Date:** 2024

**Context:** Need to choose storage solution for game state

**Decision:** Use localStorage with optional cloud save

**Consequences:**
- ✅ Works offline
- ✅ No backend required
- ✅ Fast access
- ❌ Limited storage (5-10MB)
- ❌ No cross-device sync (without cloud save)

### ADR-003: Design Tier System

**Status:** Accepted  
**Date:** 2024

**Context:** Need progressive feature unlocking

**Decision:** Implement design tier system (Tier 0-4)

**Consequences:**
- ✅ Progressive enhancement
- ✅ Performance optimization
- ✅ Accessibility support
- ✅ Engagement through unlocking
- ❌ More complex code
- ❌ More testing required

---

## Contact & Contribution

For questions, suggestions, or contributions, please refer to the main README.md file.

---

**Note:** This document is a living document and will be updated as the architecture evolves.
