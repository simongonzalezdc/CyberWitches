# Hex Compiler Architecture Documentation

## System Overview

Hex Compiler is an idle/incremental game where players compile magical hexes into hexadecimal code. The game combines traditional incremental mechanics (clicking, resource generation, upgrades) with unique features like element specialization, tower-defense meditation, and a progressive design tier system.

**Core Gameplay Loop:**
1. Click the CAST button to generate Arcane Bits (AB) - the primary currency
2. Craft workstations that auto-generate resources and elements
3. Purchase upgrades (inscriptions) to multiply production
4. Discover hidden recipes through experimentation
5. Prestige to convert lifetime progress into permanent Eldritch Keys
6. Unlock meditation (tower-defense minigame) and boons after first prestige

## Module Dependency Graph

### Entry Point
- `js/game.js` → Bootstraps the application, handles performance instrumentation
- `js/gameInit.js` → Initializes all game systems and wires dependencies

### Core Systems (_INITIALIZED IN gameInit.js_)
```
GameState (gameState.js)
├── Cast resources + soft fade → js/kernel/adapter.js (castOnGameState / fadeOnGameState)
├── Production tick: PRODUCERS (ws_*) + mults (incl. Kernel productionMult)
├── Save/Load: saveCodec.js, indexedDBBackup.js (+ optional kernel mirror fields)
├── Element System: elementSpecialization.js + Kernel affinity strategies
├── Balance: utils.js (Balance class)
└── DOM Batching: DOMBatcher.js

Restoration Kernel (js/kernel/) — pure, DOM-free
├── reduce / createKernel — cast, tick, craft, prestige, chapter/tier, meditation
├── content.js + schema.js — pipeline modules + CI validator
├── fade.js — soft fade / storage law
├── affinity.js + pipelineRoles.js — strategies + ws_* role map
├── projector.js — HUD view-models
└── tickWorkerHost.js — optional large offline worker path

UIManager (ui/uiManager.js)
├── Tab Management
├── UI Update Coordination
└── Sub-UI Managers:
    ├── workstationUI.js (+ pipeline role badges)
    ├── pipelineHudUI.js — Capture→Store→Bind→Compile→Shield strip
    ├── inventoryUI.js
    ├── inscriptionsUI.js
    ├── experimentUI.js
    ├── statsUI.js
    ├── dailiesUI.js
    ├── boonsUI.js
    ├── meditationUI.js (lazy-loaded)
    ├── hudUI.js
    ├── floatingTextUI.js
    └── modalManager.js
```

### Game Mechanics Managers
```
CraftingManager (craftingManager.js)
├── Recipe execution
└── Ingredient validation

CastManager (castManager.js)
├── Click handling → GameState.cast → Kernel
├── Combo system
└── Auto-cast functionality

MeditationManager (meditationManager.js)
├── Tower-defense logic
├── Wave management
└── endSession → Kernel meditation mastery mult

PrestigeManager (prestigeManager.js)
├── Ascension logic
└── Key calculation

InscriptionsManager (inscriptionsManager.js)
├── Upgrade purchasing
└── Bonus application

DesignTierSystem (designTierSystem.js)
├── Progressive feature unlocks (AB/achievements OR chapter milestones)
├── Visual/audio tier progression
├── emitTierAdvance → CustomEvent('hex:tierAdvance')
└── playHealMoment → healCeremony

TutorialSystem (tutorialSystem.js)
├── Onboarding flow
└── Step progression

Heal / share / funnel (Capture the heal)
├── healCeremony.js — mute-first restore timeline, reduced-motion branch
├── healCapture.js — sanitized split still (canvas, tier chrome only)
├── healShare.js — SHARE_RESTORE (PNG download + text clipboard)
├── funnelMetrics.js — local cw.funnel.* TTA/TTH/shareAttempt
└── compileGoalStack.js + compileGoalUI.js — single primary goal rail

Notifications (notifications.js)
└── maxVisible = 2 hard cap (board readability)
```

### Supporting Systems
```
AudioSystem (audioSystem.js)
├── Tone.js integration
├── Sound effects (Tier 2+)
└── Music (Tier 4+)

ParticleSystem (particleSystem.js)
├── Celebration effects
└── Visual feedback (Tier 3+)

FadingThemeSystem (fadingThemeSystem.js)
└── Dynamic theme transitions

DailyRituals (dailyRituals.js)
├── Task generation
└── Refresh cycle

EventSystem (eventSystem.js)
├── Random events
└── Buff/debuff management

AchievementSystem (achievements.js)
├── Achievement tracking
└── Unlock conditions
```

### Unified Game Loop
```
UnifiedGameLoop (core/UnifiedGameLoop.js)
├── Logic updates (10 TPS)
│   └── gameState.tick()
├── Visual updates (60 FPS)
│   ├── Particle system
│   └── Animation frames
└── Render updates (60 FPS)
    └── UI refresh
```

## Data Flow

### Game State Flow
```
User Action (CAST button)
    ↓
CastManager.handleCast()
    ↓
GameState.addAb() → triggers onAbChanged callback
    ↓
UIManager.hudUI.updateABDisplay()
    ↓
DOM update batched → flushed after ~60fps
```

### Crafting Flow
```
User crafts workstation/potion
    ↓
CraftingManager.craftItem()
    ↓
GameState.deductIngredients() → validate affordability
    ↓
GameState.addWorkstation() / addInventory()
    ↓
UIManager updateAllUI()
    ↓
Relevant UI sub-manager updates (debounced)
```

### Save/Load Flow
```
Game state change → GameState.debouncedSave() (3s delay)
    ↓
saveCodec.encode() → compress & validate
    ↓
localStorage.setItem('cyberWitchesSave', serialized)
    ↓
indexedDBBackup.mirrorToIndexedDB() → async backup
```

### Meditation Minigame Flow
```
User starts meditation → MeditationManager.startGame()
    ↓
MeditationState (headless sim) begins tick loop
    ↓
MeditationTowers renders canvas grid
    ↓
User places towers → Tower targeting/attack logic
    ↓
Wave completion → Production bonus calculated
    ↓
Bonus applied to main game production
```

## Key Design Patterns

### 1. Manager Pattern
Each major system has a dedicated Manager class that encapsulates related logic:
- `CastManager` handles all casting mechanics
- `CraftingManager` manages recipe execution
- `UIManager` coordinates all UI updates
- `MeditationManager` runs the tower-defense minigame

**Benefits:** Clear separation of concerns, single responsibility for each system

### 2. Event Delegation
The UI uses event delegation for performance:
```javascript
// UIManager sets up tab switching once
tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
    });
});
```

**Benefits:** Fewer event listeners, better dynamic content handling

### 3. Callback Pattern
GameState exposes callbacks for reactive updates:
```javascript
gameState.onAbChanged = (newValue) => {
    uiManager.hudUI.updateABDisplay();
};
```

**Benefits:** Decouples state changes from UI updates, enables multiple subscribers

### 4. Module System
JavaScript ES6 modules organize code by responsibility:
```
js/
├── core/          # Core game loop, error handling
├── modules/
│   ├── game/      # Game mechanics managers
│   ├── ui/        # UI components and managers
│   ├── data/      # Static data (recipes, upgrades)
│   └── pwa/       # Progressive Web App features
├── utils/         # Helper functions, utilities
└── save/          # Save/load, IndexedDB backup
```

**Benefits:** Clear import paths, dependency management, tree-shaking support

### 5. DOM Batching
UI updates are batched to reduce DOM thrashing:
```javascript
uiManager.debouncedUIUpdate('workstationsTab', () => {
    uiManager.workstationUI.update();
});
```

**Benefits:** Smoother UI, fewer reflows/paints, better performance

### 6. Lazy Loading
Heavy systems load only when needed:
- Tone.js audio engine loads after user gesture (Tier 2+)
- MeditationUI loads when meditation tab unlocked
- Glitch effects CSS loads after design tier progression

**Benefits:** Faster initial load, smaller baseline bundle

## Build Pipeline

### esbuild Configuration (build.js)

**Development Build:**
```bash
node build.js  # Unminified, inline sourcemaps, console.log retained
```

**Production Build:**
```bash
node build.js --production  # Minified, no sourcemaps, console removed
```

### Bundling Strategy
1. **Single Bundle:** All JavaScript bundled into `js/game.bundle.js`
2. **Tree Shaking:** Unused code eliminated
3. **Code Splitting:** None (single bundle for simplicity)
4. **External Dependencies:** Tone.js remains external (CDN)

### Static File Handling
Files copied directly to `dist/`:
- `index.html` (script tag updated to use bundle)
- `styles/theme.css` (design tokens)
- `css/` (all CSS modules)
- `vendor/tone-15.1.22.js` (self-hosted audio engine)
- `icons/`, `images/`, `screenshots/` (assets)
- `manifest.json`, `sw.js` (PWA files)
- `offline.html` (fallback page)

### Production Optimizations
1. **Minification:** Terser via esbuild
2. **Console Removal:** `drop: ['console']` in production
3. **DEBUG Flag Flip:** `const DEBUG = true` → `false` via regex
4. **Source Maps:** Disabled in production for smaller bundle

## Deployment Pipeline

### GitHub Actions Workflow (.github/workflows/deploy.yml)

**Trigger:** Push to `main` branch

**Steps:**
1. **Checkout:** Clone repository
2. **Setup Node:** Install Node.js (^18)
3. **Install Dependencies:** `npm ci`
4. **Build Production:** `npm run build:prod`
5. **Deploy Pages:** Push `dist/` to GitHub Pages
6. **Artifact Upload:** Bundle uploaded for rollback capability

**Deployment Target:** `https://simongonzalezdc.github.io/CyberWitches/`

**Rollback:** Manual re-run of previous workflow with uploaded artifact

### Service Worker (sw.js)
- **Scope:** `/` (root)
- **Cache Strategy:** Network-first for HTML, cache-first for assets
- **Offline Fallback:** `offline.html`
- **Update Cycle:** Check for updates on every page load

### PWA Manifest (manifest.json)
- **Name:** Hex Compiler - Arcane Terminal
- **Display:** standalone
- **Orientation:** any
- **Theme Color:** `#050508` (void background)
- **Install Prompts:** Handled by PWAFeaturesManager

## Performance Optimizations

### 1. Unified Game Loop
- **Before:** Multiple `setInterval` calls (10 TPS logic, 30 FPS visuals, 60 FPS UI)
- **After:** Single `requestAnimationFrame` loop with separate update tracks
- **Benefit:** Better frame pacing, reduced power consumption

### 2. DOM Batching
- **Before:** Every state change triggered immediate DOM update
- **After:** Changes batched and flushed at ~60fps
- **Benefit:** Fewer reflows, smoother UI

### 3. Lazy System Loading
- **Before:** All systems loaded at boot
- **After:** Heavy systems (audio, meditation) load on-demand
- **Benefit:** 40% faster initial load

### 4. IndexedDB Backup
- **Purpose:** Durable save mirror if localStorage evicted
- **Timing:** Async, non-blocking after every save
- **Recovery:** Auto-restores on boot if localStorage empty

## Error Handling

### Error Boundaries
Critical systems wrapped in error boundaries:
```javascript
const inputManagerBoundary = createErrorBoundary('InputManager');
const inputManager = inputManagerBoundary.wrap(() => new InputManager(...))();
```

**Protected Systems:** InputManager, CastManager, AudioSystem, ParticleSystem

### Global Error Reporter
```javascript
errorReporter.install(); // Installs in initGame()
```

**Captures:** Unhandled rejections, errors in protected systems

### Fatal Error Display
If game.js fails to load, displays error overlay:
- Background: `var(--color-glitch-500)`
- Border: `var(--color-retro-red)`
- Z-Index: 140 (above all modals)

## Extension Points

### Adding New Game Mechanics
1. Create manager in `js/modules/game/`
2. Initialize in `gameInit.js`
3. Wire to UIManager via `uiManager.systems.yourSystem`
4. Add UI sub-manager in `js/modules/ui/` if needed

### Adding New UI Tabs
1. Add tab button & panel in `index.html`
2. Create UI manager in `js/modules/ui/`
3. Initialize in `UIManager` constructor
4. Add to `updateAllUI()` if needed

### Adding New Design Tiers
1. Update `DESIGN_TIERS` in `designTierSystem.js`
2. Add unlock conditions in `checkTierUnlocks()`
3. Add CSS/JS assets for tier in `loadingState.js`

## File Reference Summary

### Core Architecture
- `js/game.js` - Entry point, performance baseline
- `js/gameInit.js` - System initialization and dependency injection
- `js/gameState.js` - Central state manager with save/load
- `js/core/UnifiedGameLoop.js` - Unified tick/render loop

### UI Architecture
- `js/modules/ui/uiManager.js` - UI coordination and tab management
- `js/modules/ui/modalManager.js` - Modal/dialog system
- `js/modules/ui/hudUI.js` - HUD updates (AB display, combo)

### Game Mechanics
- `js/modules/game/castManager.js` - Casting and combo system
- `js/modules/game/craftingManager.js` - Recipe execution
- `js/modules/game/meditationManager.js` - Tower-defense minigame
- `js/modules/game/prestigeManager.js` - Ascension logic
- `js/modules/game/designTierSystem.js` - Progressive feature unlocks

### Build & Deployment
- `build.js` - esbuild configuration and static file copying
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `sw.js` - Service Worker for offline support
- `manifest.json` - PWA manifest

This architecture supports the game's complexity while maintaining clear separation of concerns and enabling future expansion.