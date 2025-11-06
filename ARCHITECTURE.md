# Cyber Witches - Architecture Documentation

## Overview

Cyber Witches is an idle/incremental game built with vanilla JavaScript, HTML, and CSS. The game follows a modular architecture with clear separation of concerns.

## Architecture Principles

1. **Modularity**: Code is organized into focused modules with single responsibilities
2. **Performance**: Optimized for 60fps with efficient DOM manipulation and batching
3. **Accessibility**: WCAG 2.2 AA compliant with full keyboard navigation and screen reader support
4. **Progressive Enhancement**: Features unlock based on player progression (Design Tier System)

## System Architecture

### Core Systems

#### Game State Management (`js/gameState.js`)
- **Purpose**: Central state management for all game data
- **Responsibilities**:
  - Currency (AB) management
  - Inventory tracking
  - Workstation management
  - Upgrade system
  - Prestige system
  - Save/load functionality
- **Key Methods**:
  - `cast()`: Main gameplay loop - casting spells
  - `craftWorkstation()`: Crafting workstations
  - `purchaseUpgrade()`: Buying upgrades
  - `ascend()`: Prestige/ascension system
  - `saveGameState()` / `loadGameState()`: Persistence

#### Game Controller (`js/game.js`)
- **Purpose**: Main game loop and UI coordination
- **Responsibilities**:
  - UI initialization and updates
  - Tab navigation
  - Event handling
  - Game loop coordination
  - Integration of all systems
- **Key Functions**:
  - `initUI()`: Initialize all UI components
  - `updateWorkstationsTab()`: Update workstation display
  - `updateInscriptionsTab()`: Update upgrade display
  - `switchTab()`: Tab navigation

### Feature Systems

#### Design Tier System (`js/designTierSystem.js`)
- **Purpose**: Progressive feature unlocking
- **Tiers**:
  - Tier 0: Minimal (text only)
  - Tier 1: Basic colors
  - Tier 2: Sound effects
  - Tier 3: Full graphics and animations
  - Tier 4: Music and advanced features

#### Audio System (`js/audioSystem.js`)
- **Purpose**: Sound effects and music management
- **Features**:
  - Web Audio API integration
  - Tone.js for music generation
  - Volume controls (SFX and Music separate)
  - Tier-based activation

#### Particle Effects (`js/particleEffects.js`)
- **Purpose**: Visual feedback and effects
- **Features**:
  - Particle generation
  - Animation system
  - Performance optimization

### Supporting Systems

#### Error Handling (`js/errorHandler.js`)
- Centralized error handling
- User-friendly error messages
- Error recovery mechanisms
- Error reporting (optional)

#### Accessibility (`js/accessibility.js`)
- Screen reader announcements
- Keyboard navigation
- Focus management
- ARIA labels

#### Performance Optimization
- **DOM Optimization** (`js/domOptimization.js`): Batched DOM updates
- **Memory Leak Prevention** (`js/memoryLeakFix.js`): Resource cleanup
- **Lazy Asset Loading** (`js/lazyAssetLoading.js`): On-demand asset loading
- **Animation Optimization** (`js/animationOptimization.js`): GPU-accelerated animations

#### Analytics & Testing
- **Player Analytics** (`js/playerAnalytics.js`): Player behavior tracking
- **Balance Analytics** (`js/balanceAnalytics.js`): Game balance metrics
- **Balance Testing** (`js/balanceTesting.js`): Testing framework
- **Progression Analysis** (`js/progressionAnalysis.js`): Progression curve analysis
- **Economy Balancing** (`js/economyBalancing.js`): Resource economy analysis

## Data Flow

### Game Loop
1. **Tick** (every 100ms): `gameState.tick()` updates production
2. **UI Update** (debounced): UI elements update based on state changes
3. **Save** (every 30s): Game state saved to localStorage

### User Actions
1. **Cast**: `gameState.cast()` → Updates inventory → Triggers UI update
2. **Craft**: `gameState.craftWorkstation()` → Updates workstations → Triggers UI update
3. **Upgrade**: `gameState.purchaseUpgrade()` → Updates upgrades → Triggers UI update

## File Structure

```
CyberWitches/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── js/
│   ├── game.js         # Main game controller
│   ├── gameState.js    # Game state management
│   ├── data.js         # Game data (ingredients, producers, upgrades)
│   ├── designTierSystem.js
│   ├── audioSystem.js
│   ├── particleEffects.js
│   ├── errorHandler.js
│   ├── accessibility.js
│   ├── [many other modules]
└── [other files]
```

## Design Patterns

### Module Pattern
- Each system is a self-contained module
- Exports main class/object
- Minimal global pollution

### Observer Pattern
- Game state callbacks (`onAbChanged`, `onIngredientChanged`, etc.)
- Event system for game events
- Achievement system notifications

### Factory Pattern
- Card creation for UI elements
- Particle generation
- Audio node creation

## Performance Considerations

1. **Debouncing**: UI updates are debounced to prevent excessive DOM manipulation
2. **Batching**: DOM updates are batched using `requestAnimationFrame`
3. **Lazy Loading**: Assets load on demand
4. **Memory Management**: Event listeners and intervals are tracked and cleaned up
5. **Animation Optimization**: GPU-accelerated transforms, will-change hints

## Accessibility Features

1. **Keyboard Navigation**: Full keyboard support for all features
2. **Screen Reader Support**: ARIA labels and live regions
3. **Focus Management**: Proper focus trapping in modals
4. **High Contrast**: WCAG AA compliant color contrast
5. **Touch Targets**: Minimum 44x44px for all interactive elements

## Save System

- **Format**: JSON stored in localStorage
- **Versioning**: Save data includes version for migration
- **Validation**: Save data is validated before loading
- **Compression**: Zero values removed to reduce size
- **Conflict Resolution**: Multiple saves detected and resolved

## Testing

- **Balance Testing**: Framework for testing game balance
- **Progression Analysis**: Tools for analyzing progression curves
- **Economy Balancing**: Resource economy analysis
- **Manual Testing**: Test UI available in development mode (Ctrl+B)

## Future Improvements

1. Service Worker for offline support
2. Web Share API integration
3. File System Access API for save export/import
4. Background Sync for offline actions
5. Push Notifications (with user consent)

## Dependencies

- **Tone.js**: Music generation (loaded from CDN)
- **Google Fonts**: Orbitron and Rajdhani fonts
- No build step required - vanilla JavaScript

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features required
- Web Audio API for sound
- localStorage for saves

