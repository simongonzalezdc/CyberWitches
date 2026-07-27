# Hex Compiler — API Documentation

This document provides comprehensive API documentation for all systems and modules in the Cyber Witches: Idle Coven game.

## Table of Contents

1. [Core Systems](#core-systems)
   - [Game State](#game-state)
   - [Coven System](#coven-system)
   - [Achievement System](#achievement-system)
   - [Event System](#event-system)
   - [Chat System](#chat-system)
   - [Leaderboard System](#leaderboard-system)

2. [Advanced Systems](#advanced-systems)
   - [Particle Effects](#particle-effects)
   - [Audio System](#audio-system)
   - [Celebration Animations](#celebration-animations)
   - [Easter Eggs](#easter-eggs)
   - [Performance Monitor](#performance-monitor)
   - [Cloud Save](#cloud-save)
   - [Analytics](#analytics)

3. [Utility Systems](#utility-systems)
   - [Error Handler](#error-handler)
   - [Animations](#animations)
   - [Virtual Scroll](#virtual-scroll)
   - [Common Utils](#common-utils)
   - [Balance](#balance)

4. [Data Structures](#data-structures)
   - [Game Data](#game-data)

5. [Heal / share / funnel (current)](#heal--share--funnel-current)

---

## Heal / share / funnel (current)

Live modules under `js/modules/game/`. Prefer reading sources + unit tests over this section if they diverge.

| Module | Role |
|--------|------|
| `designTierSystem.js` | `emitTierAdvance(from, to)` → `hex:tierAdvance`; `playHealMoment` |
| `healCeremony.js` | `runHealCeremony`, `playHealCeremonyInBrowser` — timeline + reduced-motion |
| `healCapture.js` | `captureSplitStill`, `buildCaptureMeta`, `isCaptureSanitized` |
| `healShare.js` | `buildHealShareArtifact`, `captureHealShare` — SHARE_RESTORE |
| `funnelMetrics.js` | `markSessionStart`, `markFirstAutomation`, `markFirstHeal`, `markShareAttempt`, `getFunnelSnapshot` |
| `compileGoalStack.js` | Primary goal queue + `getPrimaryCompileGoal` |

**Privacy invariant:** share payloads and still meta contain tier chrome only — never AB, inventory, prestige keys, or full save.

**Local keys:** `cw.funnel.sessionStartMs`, `cw.funnel.ttaMs`, `cw.funnel.tthMs`, `cw.funnel.shareAttempt`, `cw.funnel.tierAdvance`.

---

## Core Systems

### Game State

#### Restoration Kernel (`js/kernel/`)

Pure domain package (no DOM). Live game uses the adapter for **cast resources** and **soft fade**.

| Entry | Role |
|-------|------|
| `createKernel` / `reduce` | Command dispatch: cast, tick, craft, prestige_*, chapter_check, tier_check, meditation_complete |
| `castOnGameState` / `fadeOnGameState` | Sole live mutators for cast loot and fade |
| `validateContentPack` / `assertContentPackValid` | CI content pack (`npm run validate:kernel-content`) |
| `projectorsFromGameState` | Pipeline / contract / affinity HUD view-models |
| `roleForId` / `PRODUCER_PIPELINE_ROLES` | Map live `ws_*` stations to pipeline roles |

Docs: `guides/restoration-kernel/SCHEMA.md`.

#### `GameState` Class

The main game state manager that handles all game logic and data.

**File:** `js/gameState.js`

**Constructor:**
```javascript
new GameState()
```

**Methods:**

#### Core Game Methods
- `start()` - Initialize the game state and start the game loop
- `tick(eventMultiplier)` - Main game tick with optional event multiplier
- `cast(comboMultiplier, eventMultiplier)` - Cast a spell to generate resources
- `craftWorkstation(wsId, amount)` - Craft a workstation
- `inscribeUpgrade(upgId)` - Purchase an upgrade
- `ascend()` - Perform prestige/ascension
- `tryExperiment()` - Try to discover a new recipe
- `craftDiscoveredRecipe(recipeId)` - Craft a discovered recipe

#### Resource Management
- `addAb(amount)` - Add AB to player balance
- `spendAb(amount)` - Spend AB if player has enough
- `addIngredient(ingId, amount)` - Add ingredient to inventory
- `spendIngredient(ingId, amount)` - Spend ingredient if player has enough
- `canAfford(recipe)` - Check if player can afford a recipe
- `consumeRecipe(recipe)` - Consume ingredients from a recipe

#### Production Management
- `calculateTotalProduction(delta, eventMultiplier)` - Calculate total production
- `getProductionMultiplier(workstationId)` - Get production multiplier for a workstation
- `getAbPerSecond(eventMultiplier)` - Get AB production per second

#### Save/Load Management
- `saveGameState()` - Save game state to localStorage
- `loadGameState()` - Load game state from localStorage
- `applyOfflineProgress(elapsedSeconds)` - Apply offline progress

#### Callbacks
- `onAbChanged` - Called when AB balance changes
- `onIngredientChanged` - Called when ingredient amount changes
- `onWorkstationCrafted` - Called when workstation is crafted
- `onUpgradePurchased` - Called when upgrade is purchased
- `onPrestigeCompleted` - Called when prestige is completed
- `onRecipeDiscovered` - Called when recipe is discovered
- `onWelcomeBack` - Called when returning from offline

**Example Usage:**
```javascript
const gameState = new GameState();

// Set up callbacks
gameState.onAbChanged = (amount) => {
    console.log(`AB balance changed to: ${amount}`);
};

// Start the game
gameState.start();

// Cast a spell
gameState.cast();

// Craft a workstation
gameState.craftWorkstation('ws_candle', 5);

// Save game
gameState.saveGameState();
```

### Coven System

#### `CovenSystem` Class

Manages coven creation, joining, and collaborative features.

**File:** `js/covenSystem.js`

**Constructor:**
```javascript
new CovenSystem(gameState)
```

**Methods:**

#### Coven Management
- `createCoven(name, description)` - Create a new coven
- `joinCoven(covenId)` - Join an existing coven
- `leaveCoven()` - Leave the current coven
- `getCurrentCoven()` - Get current coven information
- `isInCoven()` - Check if player is in a coven
- `isCovenLeader()` - Check if player is the coven leader

#### Progress Tracking
- `updateCovenProgress(actionType, amount, resource)` - Update coven progress based on actions
- `getCovenProductionBonus()` - Calculate coven production bonus
- `addCovenExperience(amount)` - Add experience to coven
- `completeRitual(ritual)` - Complete a ritual and award rewards

#### Ritual Management
- `generateInitialRituals()` - Generate initial collaborative rituals
- `generateRitualForLevel(level)` - Generate a ritual appropriate for coven level
- `replaceCompletedRitual(completedRitual)` - Replace a completed ritual with a new one

#### Save/Load Management
- `saveCovenData()` - Save coven data to game state
- `loadCovenData(data)` - Load coven data from saved state

**Example Usage:**
```javascript
const covenSystem = new CovenSystem(gameState);

// Set up callbacks
covenSystem.onCovenJoined = (coven) => {
    console.log(`Joined coven: ${coven.name}`);
};

// Create a new coven
covenSystem.createCoven('Arcane Circle', 'A coven for powerful witches');

// Join an existing coven
covenSystem.joinCoven('coven_123');

// Update coven progress
covenSystem.updateCovenProgress('production', 1000, 'ab');

// Get coven production bonus
const bonus = covenSystem.getCovenProductionBonus();
console.log(`Coven production bonus: ${bonus}`);
```

### Achievement System

#### `AchievementSystem` Class

Manages player achievements and rewards.

**File:** `js/achievements.js`

**Constructor:**
```javascript
new AchievementSystem(gameState)
```

**Methods:**

#### Achievement Management
- `checkAchievements()` - Check and unlock achievements based on current game state
- `grantReward(reward)` - Grant achievement reward to player
- `getUnlockedCount()` - Get number of unlocked achievements
- `getTotalCount()` - Get total number of achievements

#### Achievement Categories
- Early game achievements (first cast, first AB, etc.)
- Mid game achievements (hundred casts, thousand AB, etc.)
- Late game achievements (million AB, all workstations, etc.)
- Prestige achievements (first prestige, etc.)
- Special achievements (legendary caster, etc.)

**Example Usage:**
```javascript
const achievementSystem = new AchievementSystem(gameState);

// Check achievements
const newlyUnlocked = achievementSystem.checkAchievements();

if (newlyUnlocked.length > 0) {
    console.log(`Unlocked ${newlyUnlocked.length} achievements:`);
    newlyUnlocked.forEach(achievement => {
        console.log(`- ${achievement.name}: ${achievement.description}`);
    });
}

// Get achievement statistics
const stats = {
    unlocked: achievementSystem.getUnlockedCount(),
    total: achievementSystem.getTotalCount()
};
console.log(`Achievement progress: ${stats.unlocked}/${stats.total}`);
```

### Event System

#### `CovenEventsSystem` Class

Manages special coven events and competitions.

**File:** `js/covenEvents.js`

**Constructor:**
```javascript
new CovenEventsSystem(covenSystem)
```

**Methods:**

#### Event Management
- `createEvent(type, name, description, requirements, rewards, duration)` - Create a new event
- `startEvent(eventId)` - Start an event
- `endEvent(eventId)` - End an event
- `getActiveEvents()` - Get all active events
- `getEventHistory(limit)` - Get event history

#### Event Types
- Competition events (production race, casting marathon, etc.)
- Collaboration events (ritual mastery, resource gathering, etc.)
- Special events (mystery ritual, knowledge sharing, etc.)
- Seasonal events (solstice celebration, harvest festival, etc.)

**Example Usage:**
```javascript
const eventSystem = new CovenEventsSystem(covenSystem);

// Set up callbacks
eventSystem.onEventStarted = (event) => {
    console.log(`Event started: ${event.name}`);
};

// Get active events
const activeEvents = eventSystem.getActiveEvents();

// Get event history
const history = eventSystem.getEventHistory(10);
```

### Chat System

#### `CovenChatSystem` Class

Manages coven communication and messaging.

**File:** `js/covenChat.js`

**Constructor:**
```javascript
new CovenChatSystem(covenSystem)
```

**Methods:**

#### Chat Management
- `sendMessage(content, channelId)` - Send a message to a channel
- `switchChannel(channelId)` - Switch to a different channel
- `getCurrentChannel()` - Get current channel
- `getChannel(channelId)` - Get a specific channel
- `getAllChannels()` - Get all channels

#### Message Types
- User messages
- System messages
- Bot messages (simulated for single-player)
- Achievement notifications
- Event notifications

#### Channel Types
- General discussion
- Ritual coordination
- Achievement sharing
- Event discussion

**Example Usage:**
```javascript
const chatSystem = new CovenChatSystem(covenSystem);

// Set up callbacks
chatSystem.onMessageReceived = (channelId, message) => {
    console.log(`New message in ${channelId}: ${message.content}`);
};

// Send a message
chatSystem.sendMessage('Hello, coven members!');

// Switch channels
chatSystem.switchChannel('rituals');

// Get all channels
const channels = chatSystem.getAllChannels();
```

### Leaderboard System

#### `SocialLeaderboardsSystem` Class

Manages competitive rankings for covens and players.

**File:** `js/socialLeaderboards.js`

**Constructor:**
```javascript
new SocialLeaderboardsSystem(covenSystem)
```

**Methods:**

#### Leaderboard Management
- `getLeaderboard(leaderboardId)` - Get a specific leaderboard
- `getAllLeaderboards(isCoven)` - Get all leaderboards
- `getPlayerRankings(playerId)` - Get player rankings across all leaderboards
- `getCovenRankings(covenId)` - Get coven rankings across all leaderboards
- `getTopEntries(leaderboardId, limit)` - Get top entries from a leaderboard
- `getPlayerPosition(leaderboardId, playerId)` - Get player's position in a leaderboard

#### Leaderboard Categories
- Production leaderboards (daily, weekly, all-time)
- Casting leaderboards (daily, weekly, all-time)
- Crafting leaderboards (daily, weekly, all-time)
- Coven leaderboards (level, production, rituals, members)
- Time-based leaderboards (daily, weekly, monthly, all-time)

**Example Usage:**
```javascript
const leaderboardSystem = new SocialLeaderboardsSystem(covenSystem);

// Get all leaderboards
const allLeaderboards = leaderboardSystem.getAllLeaderboards();

// Get top players
const topPlayers = leaderboardSystem.getTopEntries('player_production_all_time', 10);

// Get player rankings
const rankings = leaderboardSystem.getPlayerRankings('player_123');
```

---

## Advanced Systems

### Particle Effects

#### `ParticleEffectsSystem` Class

Manages visual particle effects for game feedback.

**File:** `js/particleEffects.js`

**Constructor:**
```javascript
new ParticleEffectsSystem()
```

**Methods:**

#### System Management
- `initialize(canvas)` - Initialize the particle system with a canvas element
- `startAnimationLoop()` - Start the animation loop
- `stopAnimationLoop()` - Stop the animation loop

#### Effect Creation
- `createEffect(type, x, y, options)` - Create a particle effect
- `createSpellCastEffect(x, y)` - Create a spell casting effect
- `createAchievementEffect(x, y)` - Create an achievement unlock effect
- `createResourceCollectEffect(x, y)` - Create a resource collection effect
- `createWorkstationCraftEffect(x, y)` - Create a workstation craft effect
- `createLevelUpEffect(x, y)` - Create a level up effect
- `createRitualEffect(x, y)` - Create a coven ritual effect
- `createClickEffect(x, y)` - Create a click effect
- `createErrorEffect(x, y)` - Create an error effect

#### Effect Control
- `stopEffect(effectId)` - Stop a specific effect
- `stopAllEffects()` - Stop all active effects

#### Performance Management
- `setPerformanceMode(isLowPerformance)` - Set performance mode
- `getStats()` - Get system statistics

**Example Usage:**
```javascript
const particleEffects = new ParticleEffectsSystem();

// Initialize with canvas
const canvas = document.getElementById('particle-canvas');
particleEffects.initialize(canvas);

// Create a spell cast effect
particleEffects.createSpellCastEffect(100, 100);

// Create an achievement effect
particleEffects.createAchievementEffect(200, 200);

// Get system stats
const stats = particleEffects.getStats();
console.log(`Active particles: ${stats.activeParticles}`);
```

### Audio System

#### `AudioSystem` Class

Manages sound effects and audio playback.

**File:** `js/audioSystem.js`

**Constructor:**
```javascript
new AudioSystem()
```

**Methods:**

#### Audio Management
- `initializeAudio()` - Initialize the audio system
- `unlockAudio()` - Unlock audio context (requires user interaction)
- `loadSound(soundData)` - Load a sound effect
- `playSound(soundId, options)` - Play a sound effect
- `stopSound(soundId, fadeOut)` - Stop a sound effect
- `stopAllSounds(fadeOut)` - Stop all sound effects

#### Volume Control
- `toggleMute()` - Toggle mute state
- `setMasterVolume(volume)` - Set master volume (0-1)
- `setSfxVolume(volume)` - Set sound effects volume (0-1)
- `setMusicVolume(volume)` - Set music volume (0-1)

#### Audio Settings
- `getMutedStatus()` - Get muted status from localStorage
- `getMasterVolume()` - Get master volume from localStorage
- `getSfxVolume()` - Get sound effects volume from localStorage
- `getMusicVolume()` - Get music volume from localStorage

#### Sound Generation
- `generateClickSound()` - Generate a click sound using Web Audio API
- `generateCastSound()` - Generate a spell cast sound using Web Audio API
- `generateAchievementSound()` - Generate an achievement sound using Web Audio API
- `generateLevelUpSound()` - Generate a level up sound using Web Audio API

**Example Usage:**
```javascript
const audioSystem = new AudioSystem();

// Play a sound effect
audioSystem.playSound('click');

// Toggle mute
const isMuted = audioSystem.toggleMute();

// Set volume
audioSystem.setMasterVolume(0.5);

// Get audio statistics
const stats = audioSystem.getStats();
console.log(`Is muted: ${stats.isMuted}`);
```

### Celebration Animations

#### `CelebrationAnimationsSystem` Class

Manages achievement celebration animations.

**File:** `js/celebrationAnimations.js`

**Constructor:**
```javascript
new CelebrationAnimationsSystem()
```

**Methods:**

#### Celebration Management
- `createCelebration(type, title, description, options)` - Create a celebration
- `endCelebration(celebrationId)` - End a celebration
- `stopAllCelebrations()` - Stop all active celebrations

#### Celebration Types
- `createAchievementCelebration(name, description, rarity, reward)` - Create an achievement celebration
- `createLevelUpCelebration(newLevel, levelType)` - Create a level up celebration
- `createMilestoneCelebration(name, description, reward)` - Create a milestone celebration
- `createCovenAchievementCelebration(name, description, reward)` - Create a coven achievement celebration
- `createEventCompletionCelebration(eventName, eventResult, reward)` - Create an event completion celebration
- `createRitualCompletionCelebration(ritualName, reward)` - Create a ritual completion celebration

#### Celebration Configuration
- `setMaxConcurrentCelebrations(maxConcurrent)` - Set maximum concurrent celebrations
- `setCelebrationDelay(delay)` - Set delay between celebrations

#### System Management
- `isInitialized()` - Check if system is initialized
- `getStats()` - Get system statistics
- `destroy()` - Destroy the celebration system

**Example Usage:**
```javascript
const celebrationAnimations = new CelebrationAnimationsSystem();

// Create an achievement celebration
celebrationAnimations.createAchievementCelebration(
    'First Spell',
    'Cast your first spell!',
    'common',
    '+10 AB'
);

// Create a level up celebration
celebrationAnimations.createLevelUpCelebration(5, 'player');

// Get system stats
const stats = celebrationAnimations.getStats();
console.log(`Active celebrations: ${stats.activeCelebrations}`);
```

### Easter Eggs

#### `EasterEggsSystem` Class

Manages hidden features and Easter eggs.

**File:** `js/easterEggs.js`

**Constructor:**
```javascript
new EasterEggsSystem()
```

**Methods:**

#### Easter Egg Management
- `discoverEasterEgg(eggId, context)` - Discover an Easter egg
- `getStats()` - Get Easter egg statistics
- `resetEasterEggs()` - Reset all Easter eggs

#### Easter Egg Types
- Konami Code (↑↑↓↓→→BA)
- Rapid Clicking (20 clicks in 2 seconds)
- Midnight Magic (play at midnight)
- Combo Master (50x combo)
- Number of the Beast (666 AB)
- Perfect Balance (100 of each basic ingredient)
- Binary Day (October 31st)
- Pi Day (March 14th at 1:59 PM)
- Friday the 13th
- Developer Mode (sudo make me a developer)
- Quantum Entanglement (42 workstations)
- Hexadecimal Mastery (255 of any workstation)

#### Trigger Methods
- `triggerKonamiCode()` - Trigger Konami code Easter egg
- `triggerRapidClick()` - Trigger rapid click Easter egg
- `triggerMidnightMagic()` - Trigger midnight magic Easter egg
- `triggerComboMaster()` - Trigger combo master Easter egg
- `triggerNumberOfTheBeast()` - Trigger number of the beast Easter egg
- `triggerPerfectBalance()` - Trigger perfect balance Easter egg
- `triggerBinaryDay()` - Trigger binary day Easter egg
- `triggerPiDay()` - Trigger Pi day Easter egg
- `triggerFriday13th()` - Trigger Friday the 13th Easter egg
- `triggerDeveloperMode(phrase)` - Trigger developer mode Easter egg
- `triggerQuantumEntanglement()` - Trigger quantum entanglement Easter egg
- `triggerHexadecimalMastery()` - Trigger hexadecimal mastery Easter egg

**Example Usage:**
```javascript
const easterEggsSystem = new EasterEggsSystem();

// Get Easter egg statistics
const stats = easterEggsSystem.getStats();
console.log(`Discovered eggs: ${stats.discoveredCount}/${stats.totalEggs}`);

// Check for specific Easter eggs
easterEggsSystem.checkComboEggs(50); // Check for 50x combo
easterEggsSystem.checkABEggs(666); // Check for 666 AB
easterEggsSystem.checkWorkstationEggs(42); // Check for 42 workstations
```

### Performance Monitor

#### `PerformanceMonitorSystem` Class

Tracks FPS, memory usage, and performance metrics.

**File:** `js/performanceMonitor.js`

**Constructor:**
```javascript
new PerformanceMonitorSystem()
```

**Methods:**

#### Monitoring Control
- `initialize(debugMode)` - Initialize performance monitoring
- `startMonitoring()` - Start performance monitoring
- `stop()` - Stop performance monitoring

#### Performance Tracking
- `startFPSMonitoring()` - Start FPS monitoring
- `startMemoryMonitoring()` - Start memory monitoring
- `startPerformanceTracking()` - Start performance tracking
- `checkPerformanceIssues()` - Check for performance issues and generate suggestions

#### Metrics Collection
- `getMetrics()` - Get current performance metrics
- `getSuggestions()` - Get performance suggestions

#### Debug Mode
- `createPerformanceOverlay()` - Create performance overlay
- `createDebugConsole()` - Create debug console
- `executeDebugCommand(command)` - Execute a debug command

#### Debug Commands
- `help` - Show available debug commands
- `fps` - Show FPS information
- `memory` - Show memory information
- `metrics` - Show all performance metrics
- `add_ab(amount)` - Add AB (debug command)
- `set_level(level)` - Set player level (debug command)
- `clear_save` - Clear save data (debug command)
- `export_save` - Export save data (debug command)
- `particles` - Toggle particle effects (debug command)
- `performance` - Toggle performance overlay (debug command)

**Example Usage:**
```javascript
const performanceMonitor = new PerformanceMonitorSystem();

// Initialize with debug mode
performanceMonitor.initialize(true);

// Get performance metrics
const metrics = performanceMonitor.getMetrics();
console.log(`Current FPS: ${metrics.fps}`);
console.log(`Memory usage: ${metrics.memoryUsage}MB`);

// Get performance suggestions
const suggestions = performanceMonitor.getSuggestions();
suggestions.forEach(suggestion => {
    console.log(`${suggestion.type}: ${suggestion.message}`);
});
```

---

## Utility Systems

### Error Handler

#### `ErrorHandler` Class

Provides centralized error handling and logging.

**File:** `js/errorHandler.js`

**Functions:**

#### Error Handling
- `handleError(error, context, showToast)` - Handle an error with optional toast notification
- `safeFunction(fn, context)` - Wrap a function in error handling
- `safeAsyncFunction(fn, context)` - Wrap an async function in error handling
- `retryWithBackoff(fn, maxRetries, backoffMs)` - Retry a function with exponential backoff

#### Validation
- `validateParams(params, schema)` - Validate parameters against a schema
- `validateSaveData(data)` - Validate save data structure

**Example Usage:**
```javascript
import { handleError, safeFunction } from './errorHandler.js';

// Safe function usage
const safeCast = safeFunction(() => {
    // Potentially error-prone code
    return gameState.cast();
}, 'cast');

// Safe async function usage
const safeSave = safeAsyncFunction(async () => {
    // Potentially error-prone async code
    await gameState.saveGameState();
}, 'save');

// Error handling
try {
    // Risky operation
    riskyOperation();
} catch (error) {
    handleError(error, 'riskyOperation', true);
}
```

### Animations

#### `Animations` Class

Provides animation utilities and helpers.

**File:** `js/animations.js`

**Functions:**

#### Animation Helpers
- `fadeIn(element, duration)` - Fade in an element
- `fadeOut(element, duration)` - Fade out an element
- `slideIn(element, direction, duration)` - Slide in an element
- `slideOut(element, direction, duration)` - Slide out an element
- `scaleIn(element, duration)` - Scale in an element
- `scaleOut(element, duration)` - Scale out an element
- `bounceIn(element, duration)` - Bounce in an element
- `shake(element, duration, intensity)` - Shake an element

#### Animation Control
- `stopAnimation(element)` - Stop all animations on an element
- `setAnimationDuration(duration)` - Set default animation duration

**Example Usage:**
```javascript
import { fadeIn, fadeOut, bounceIn } from './animations.js';

// Fade in an element
fadeIn(element, 500);

// Bounce in an element
bounceIn(element, 1000);

// Stop animations
stopAnimation(element);
```

### Virtual Scroll

#### `VirtualScroll` Class

Provides efficient virtual scrolling for large lists.

**File:** `js/virtualScroll.js`

**Constructor:**
```javascript
new VirtualScroll(container, options)
```

**Methods:**

#### Scroll Management
- `scrollTo(index)` - Scroll to a specific index
- `scrollToItem(item)` - Scroll to a specific item
- `scrollBy(delta)` - Scroll by a delta amount
- `getScrollPosition()` - Get current scroll position

#### Item Management
- `setItems(items)` - Set items for virtual scrolling
- `getVisibleItems()` - Get currently visible items
- `getItem(index)` - Get item at specific index
- `updateItem(index, item)` - Update item at specific index

#### Performance Optimization
- `recycleItem(item)` - Recycle an item for performance
- `clearRecycledItems()` - Clear recycled items

**Example Usage:**
```javascript
import { VirtualScroll } from './virtualScroll.js';

// Create virtual scroll
const container = document.getElementById('scroll-container');
const virtualScroll = new VirtualScroll(container, {
    itemHeight: 50,
    renderItem: (item, index) => {
        // Render item
        const element = document.createElement('div');
        element.textContent = item.name;
        element.style.height = '50px';
        return element;
    }
});

// Set items
const items = Array.from({ length: 1000 }, (_, i) => ({ name: `Item ${i}` }));
virtualScroll.setItems(items);

// Scroll to item
virtualScroll.scrollToItem(items[500]);
```

### Common Utils

#### `CommonUtils` Class

Provides common utility functions.

**File:** `js/commonUtils.js`

**Functions:**

#### Number Utilities
- `formatNumber(num, decimals)` - Format a number with specified decimals
- `formatLargeNumber(num)` - Format a large number with abbreviations (K, M, B, etc.)
- `clamp(num, min, max)` - Clamp a number between min and max
- `randomBetween(min, max)` - Get a random number between min and max
- `lerp(start, end, progress)` - Linear interpolation between start and end

#### Time Utilities
- `formatTime(milliseconds)` - Format milliseconds into readable time
- `formatDuration(milliseconds)` - Format milliseconds into duration string
- `getTimeSince(timestamp)` - Get time elapsed since timestamp

#### String Utilities
- `capitalize(str)` - Capitalize the first letter of a string
- `truncate(str, maxLength)` - Truncate a string to maximum length
- `escapeHtml(str)` - Escape HTML special characters
- `generateId(length)` - Generate a random ID

#### Array Utilities
- `shuffle(array)` - Shuffle an array
- `removeItem(array, item)` - Remove an item from an array
- `moveItem(array, fromIndex, toIndex)` - Move an item in an array
- `groupBy(array, key)` - Group an array by a key

#### DOM Utilities
- `createElement(tag, className, attributes)` - Create an element with tag, class, and attributes
- `addClass(element, className)` - Add a class to an element
- `removeClass(element, className)` - Remove a class from an element
- `toggleClass(element, className)` - Toggle a class on an element
- `showElement(element)` - Show an element
- `hideElement(element)` - Hide an element

**Example Usage:**
```javascript
import { formatNumber, formatTime, capitalize } from './commonUtils.js';

// Format a number
const formatted = formatNumber(1234567, 2);
console.log(formatted); // "1,234,567.00"

// Format time
const timeStr = formatTime(1234567);
console.log(timeStr); // "20 minutes, 34.567 seconds"

// Capitalize a string
const capitalized = capitalize('hello world');
console.log(capitalized); // "Hello world"
```

### Balance

#### `Balance` Class

Provides game balance calculations and utilities.

**File:** `js/utils.js` (Note: This might be in a different location)

**Functions:**

#### Balance Calculations
- `prestigePointsFor(lifetimeAb)` - Calculate prestige points from lifetime AB
- `calculateOfflineProduction(elapsedSeconds, abps)` - Calculate offline production
- `scaledRecipe(baseRecipe, owned, growth)` - Scale a recipe based on owned items
- `calculateProduction(baseRate, multipliers)` - Calculate production with multipliers

#### Cost Calculations
- `calculateCost(baseCost, owned, growth)` - Calculate cost with growth
- `calculateBulkCost(baseCost, amount, growth)` - Calculate bulk cost
- `canAfford(cost, resources)` - Check if player can afford a cost

#### Time Calculations
- `calculateTimeToGoal(currentRate, goal, current)` - Calculate time to reach a goal
- `calculateProductionPerSecond(production, multipliers)` - Calculate production per second with multipliers

**Example Usage:**
```javascript
import { Balance } from './utils.js';

// Calculate prestige points
const points = Balance.prestigePointsFor(1000000);
console.log(points); // 10 prestige points

// Calculate offline production
const offlineAB = Balance.calculateOfflineProduction(3600, 100);
console.log(offlineAB); // 360,000 AB

// Scale a recipe
const recipe = Balance.scaledRecipe({ wax_bits: 10 }, 5, 1.1);
console.log(recipe); // { wax_bits: 16.1 }
```

---

## Data Structures

### Game Data

#### Data Files

**File:** `js/data.js`

Contains all game data definitions.

#### Data Structures

##### Ingredients
```javascript
export const INGREDIENTS = [
    {
        id: "wax_bits",
        displayName: "Wax Bits",
        tier: 0
    },
    // ... more ingredients
];
```

##### Producers (Workstations)
```javascript
export const PRODUCERS = [
    {
        id: "ws_melter",
        displayName: "Wax Melter",
        unlockAtAb: 0.0,
        recipe: { wax_bits: 10 },
        growth: 1.10,
        outputs: { wax_block: 0.30 }
    },
    // ... more producers
];
```

##### Upgrades
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
        unlockAtAb: 0.0
    },
    // ... more upgrades
];
```

##### Prestige Bonuses
```javascript
export const PRESTIGE_BONUSES = [
    {
        id: "pp_global_1",
        displayName: "Coven's Oath",
        description: "+10% global production per level",
        type: "global_mult",
        value: 0.10,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    // ... more prestige bonuses
];
```

##### Daily Tasks
```javascript
export const DAILY_TASKS_POOL = [
    {
        id: "d_kindle",
        displayName: "Kindle the Grid",
        description: "Craft 3 Wax Melters",
        condition: "craft:workstation:ws_melter:3",
        rewardType: "ab",
        rewardValue: 5000.0
    },
    // ... more daily tasks
];
```

##### Hidden Recipes
```javascript
export const HIDDEN_RECIPES = [
    {
        id: "wax_block_bulk",
        inputs: { wax_bits: 50 },
        outputs: { wax_block: 5 },
        name: "Wax Block Bulk",
        description: "Convert raw wax into refined blocks"
    },
    // ... more hidden recipes
];
```

---

## Integration Examples

### Integrating Multiple Systems

```javascript
import { GameState } from './gameState.js';
import { CovenSystem } from './covenSystem.js';
import { AchievementSystem } from './achievements.js';
import { CovenEventsSystem } from './covenEvents.js';
import { CovenChatSystem } from './covenChat.js';
import { SocialLeaderboardsSystem } from './socialLeaderboards.js';
import { ParticleEffectsSystem } from './particleEffects.js';
import { AudioSystem } from './audioSystem.js';
import { CelebrationAnimationsSystem } from './celebrationAnimations.js';
import { EasterEggsSystem } from './easterEggs.js';
import { PerformanceMonitorSystem } from './performanceMonitor.js';
import { CloudSaveSystem } from './cloudSave.js';
import { AnalyticsSystem } from './analytics.js';

// Initialize core game state
const gameState = new GameState();

// Initialize coven system
const covenSystem = new CovenSystem(gameState);

// Initialize achievement system
const achievementSystem = new AchievementSystem(gameState);

// Initialize event system
const eventSystem = new CovenEventsSystem(covenSystem);

// Initialize chat system
const chatSystem = new CovenChatSystem(covenSystem);

// Initialize leaderboard system
const leaderboardSystem = new SocialLeaderboardsSystem(covenSystem);

// Initialize advanced systems
const particleEffects = new ParticleEffectsSystem();
const audioSystem = new AudioSystem();
const celebrationAnimations = new CelebrationAnimationsSystem();
const easterEggs = new EasterEggsSystem();
const performanceMonitor = new PerformanceMonitorSystem();

// Initialize utility systems
const cloudSave = new CloudSaveSystem(gameState);
const analytics = new AnalyticsSystem();

// Set up cross-system callbacks
gameState.onWorkstationCrafted = (wsId, count) => {
    // Update coven progress
    covenSystem.updateCovenProgress('crafting', count);
    
    // Update leaderboards
    leaderboardSystem.updatePlayerScore(gameState.playerId, 'crafting', count);
    
    // Track analytics
    analytics.trackAction('workstation_crafted', { workstation: wsId, count });
};

gameState.onUpgradePurchased = (upgId) => {
    // Update achievements
    achievementSystem.checkAchievements();
    
    // Track analytics
    analytics.trackAction('upgrade_purchased', { upgrade: upgId });
};

gameState.onPrestigeCompleted = (ekGain) => {
    // Update coven progress
    covenSystem.updateCovenProgress('prestige', ekGain);
    
    // Update leaderboards
    leaderboardSystem.updatePlayerScore(gameState.playerId, 'prestige', ekGain);
    
    // Track analytics
    analytics.trackProgression('prestige_completed', { gain: ekGain });
};

// Set up coven system callbacks
covenSystem.onRitualCompleted = (ritual) => {
    // Create celebration
    celebrationAnimations.createRitualCompletionCelebration(ritual.name, ritual.rewards);
    
    // Create particle effect
    particleEffects.createRitualEffect(window.innerWidth / 2, window.innerHeight / 2);
    
    // Play sound effect
    audioSystem.playSound('ritual_complete');
    
    // Track analytics
    analytics.trackSocial('ritual_completed', { ritual: ritual.id });
};

// Set up achievement system callbacks
achievementSystem.onAchievementUnlocked = (achievement) => {
    // Create celebration
    celebrationAnimations.createAchievementCelebration(
        achievement.name,
        achievement.description,
        achievement.rarity || 'common',
        achievement.reward
    );
    
    // Create particle effect
    particleEffects.createAchievementEffect(window.innerWidth / 2, window.innerHeight / 2);
    
    // Play sound effect
    audioSystem.playSound('achievement');
    
    // Track analytics
    analytics.trackProgression('achievement_unlocked', { achievement: achievement.id });
};

// Set up chat system callbacks
chatSystem.onMessageReceived = (channelId, message) => {
    // Track analytics
    analytics.trackSocial('message_sent', { channel: channelId, type: message.type });
};

// Set up event system callbacks
eventSystem.onEventCompleted = (event) => {
    // Create celebration
    celebrationAnimations.createEventCompletionCelebration(event.name, 'completed', event.rewards);
    
    // Track analytics
    analytics.trackSocial('event_completed', { event: event.id });
};

// Set up particle effects callbacks
particleEffects.initialize(document.getElementById('particle-canvas'));

// Set up audio system
audioSystem.initialize();

// Set up celebration animations
celebrationAnimations.initialize();

// Set up Easter eggs
easterEggs.initialize();

// Set up performance monitor
performanceMonitor.initialize(true);

// Set up cloud save
cloudSave.initialize();

// Set up analytics
analytics.initialize();

// Start the game
gameState.start();
```

### Custom System Integration

```javascript
// Creating a custom system that integrates with existing systems
class CustomSystem {
    constructor(gameState, covenSystem, analytics) {
        this.gameState = gameState;
        this.covenSystem = covenSystem;
        this.analytics = analytics;
        
        // Set up callbacks
        this.setupCallbacks();
    }
    
    setupCallbacks() {
        // Listen to game state changes
        this.gameState.onAbChanged = (amount) => {
            // Track in analytics
            this.analytics.trackEconomy('ab_change', { amount });
            
            // Check for Easter eggs
            this.analytics.checkABEggs(amount);
        };
        
        // Listen to coven events
        this.covenSystem.onRitualCompleted = (ritual) => {
            // Create custom celebration
            this.createCustomCelebration(ritual);
            
            // Track in analytics
            this.analytics.trackSocial('custom_ritual', { ritual: ritual.id });
        };
    }
    
    createCustomCelebration(ritual) {
        // Custom celebration logic
        console.log(`Custom ritual completed: ${ritual.name}`);
    }
}

// Initialize custom system
const customSystem = new CustomSystem(gameState, covenSystem, analytics);
```

---

## Error Handling

### Error Types

```javascript
// Standard error types used throughout the game
const ERROR_TYPES = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    SAVE_LOAD: 'save_load',
    SAVE_WRITE: 'save_write',
    AUDIO: 'audio',
    PERFORMANCE: 'performance',
    UNKNOWN: 'unknown'
};
```

### Error Reporting

```javascript
// Example of comprehensive error reporting
try {
    // Risky operation
    riskyOperation();
} catch (error) {
    // Log error details
    console.error(`Error in ${context}:`, error);
    
    // Report to analytics
    analytics.trackError(error, context);
    
    // Show user-friendly message
    if (showToast) {
        showToast(`An error occurred: ${error.message}`);
    }
}
```

---

## Performance Optimization

### Best Practices

1. **Use Object Pooling**
   - Reuse objects instead of creating new ones
   - Particularly important for particles and DOM elements

2. **Batch DOM Updates**
   - Group DOM updates together
   - Use requestAnimationFrame for visual updates
   - Avoid layout thrashing

3. **Optimize Rendering**
   - Use CSS transforms instead of changing position properties
   - Use will-change for smooth animations
   - Avoid forced synchronous layouts

4. **Memory Management**
   - Clear unused objects and arrays
   - Avoid memory leaks
   - Use weak references where appropriate

5. **Event Delegation**
   - Use event delegation for dynamic content
   - Remove event listeners when no longer needed

6. **Lazy Loading**
   - Load resources only when needed
   - Use code splitting for large applications
   - Implement progressive loading

### Performance Monitoring

```javascript
// Example of setting up performance monitoring
const performanceMonitor = new PerformanceMonitorSystem();

// Initialize with debug mode in development
performanceMonitor.initialize(process.env.NODE_ENV === 'development');

// Get performance metrics
const metrics = performanceMonitor.getMetrics();

// Check for performance issues
if (metrics.averageFps < 30) {
    console.warn('Low FPS detected:', metrics.averageFps);
}

// Get performance suggestions
const suggestions = performanceMonitor.getSuggestions();
suggestions.forEach(suggestion => {
    console.log(`${suggestion.severity}: ${suggestion.message}`);
});
```

---

## Contributing

When contributing to the Cyber Witches: Idle Coven codebase:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Use TypeScript for new modules (optional)
5. Follow semantic versioning for releases

---

## License

This API documentation is part of the Cyber Witches: Idle Coven project. See the main project README for license information.