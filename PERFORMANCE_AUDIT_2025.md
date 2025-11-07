# Performance Audit - RAM/CPU Optimization Opportunities
**Date:** November 2025  
**Purpose:** Identify RAM/CPU savings without impacting functionality or aesthetics

---

## Executive Summary

This audit identifies opportunities similar to the audio loop muting vs stopping optimization. The key principle: **Stop processing when not needed, don't just hide it**.

### Key Findings

1. **Canvas Animation Loops** - Continue rendering when tabs are hidden (CPU waste)
2. **Game Tick Intervals** - Run even when tab is inactive (CPU waste)
3. **Meditation Tick Loop** - Runs even when meditation tab is hidden (CPU waste)
4. **Background Sparkles** - Continue animating when tab is hidden (CPU waste)
5. **Particle Effects** - Continue updating when not visible (CPU waste)
6. **Unbounded Arrays** - Some arrays grow without limits (RAM waste)

---

## Detailed Findings

### 1. Canvas Animation Loops ⚠️ **HIGH CPU WASTE**

#### Issue: Meditation Towers Canvas
**File:** `js/meditationTowers.js`
- **Problem:** Animation loop (`requestAnimationFrame`) continues running even when meditation tab is hidden
- **Impact:** ~60 FPS rendering when not visible = wasted CPU cycles
- **Current Behavior:** Loop starts in `init()` and never stops
- **Fix:** Stop animation loop when leaving meditation tab, restart when entering

**Similar to:** Audio loops muting vs stopping - we should **stop** the loop, not just hide the canvas

#### Issue: Background Sparkles Canvas
**File:** `js/game.js` (initBackgroundSparkles)
- **Problem:** Animation loop continues even when tab is hidden or game is paused
- **Impact:** Continuous rendering = wasted CPU cycles
- **Current Behavior:** Loop runs continuously with frame skipping, but still processes
- **Fix:** Stop animation loop when tab is hidden (using Page Visibility API)

#### Issue: Particle Effects Canvas
**File:** `js/particleEffects.js`
- **Problem:** Animation loop continues even when particles are disabled or tab is hidden
- **Impact:** Continuous rendering = wasted CPU cycles
- **Current Behavior:** Loop checks `isRunning` but doesn't stop when tab is hidden
- **Fix:** Stop animation loop when tab is hidden (using Page Visibility API)

---

### 2. Game Tick Intervals ⚠️ **MEDIUM CPU WASTE**

#### Issue: Game State Tick Loop
**File:** `js/gameState.js`
- **Problem:** Game tick loop runs continuously even when tab is inactive
- **Impact:** Continuous game logic processing = wasted CPU cycles
- **Current Behavior:** `setInterval` runs every tick rate (typically 100ms)
- **Fix:** Pause tick loop when tab is hidden (using Page Visibility API)

**Note:** This is intentional for idle games, but we can pause when tab is completely hidden

---

### 3. Meditation Tick Loop ⚠️ **MEDIUM CPU WASTE**

#### Issue: Meditation State Tick Loop
**File:** `js/meditationState.js`
- **Problem:** Tick loop runs even when meditation tab is hidden
- **Impact:** Continuous meditation logic processing = wasted CPU cycles
- **Current Behavior:** Loop starts when meditation tab is active, but doesn't stop when leaving
- **Fix:** Already partially implemented - ensure it stops when leaving meditation tab

**Status:** Partially fixed in `switchTab()` - but animation loop still runs

---

### 4. Unbounded Arrays ⚠️ **MEDIUM RAM WASTE**

#### Issue: Discovered Recipes Array
**File:** `js/gameState.js`
- **Problem:** `discoveredRecipes` array grows unbounded
- **Impact:** Memory usage grows with game progress
- **Current Behavior:** No limit on array size
- **Fix:** Cap at 100 recipes, archive older ones

#### Issue: Distractions Array
**File:** `js/meditationState.js`
- **Problem:** `distractions` array can grow large during waves
- **Impact:** Memory usage spikes during meditation waves
- **Current Behavior:** Already cleared when leaving meditation tab (good!)
- **Fix:** Ensure cleanup is consistent

#### Issue: Particles Array
**File:** `js/particleEffects.js`
- **Problem:** Particles array can grow if cleanup is delayed
- **Impact:** Memory usage grows if particles aren't cleaned up
- **Current Behavior:** Has max particles limit (500), but cleanup might be delayed
- **Fix:** More aggressive cleanup of expired particles

---

### 5. Event Listeners ⚠️ **LOW-MEDIUM RAM WASTE**

#### Issue: Accumulating Event Listeners
**File:** Multiple files
- **Problem:** Event listeners may accumulate if not properly removed
- **Impact:** Memory usage grows over time
- **Current Behavior:** Some listeners are added but not tracked for removal
- **Fix:** Use `memoryLeakPreventionManager` consistently

**Status:** Already has `memoryLeakFix.js` - ensure it's used everywhere

---

### 6. Page Visibility Optimization ⚠️ **HIGH CPU SAVINGS**

#### Issue: No Page Visibility Handling
**File:** Multiple files
- **Problem:** Game continues processing when browser tab is hidden
- **Impact:** Wasted CPU cycles when user isn't looking
- **Current Behavior:** All loops continue running
- **Fix:** Use Page Visibility API to pause/resume loops

**Similar to:** Audio loops muting vs stopping - we should **stop** processing when not visible

---

## Optimization Opportunities (Ranked by Impact)

### High Priority (CPU Savings)

1. **Stop Meditation Towers Animation Loop When Tab Hidden**
   - **File:** `js/meditationTowers.js`
   - **Impact:** ~60 FPS rendering stopped = significant CPU savings
   - **Effort:** Low
   - **Similar to:** Audio loops stopping vs muting

2. **Stop Background Sparkles Animation Loop When Tab Hidden**
   - **File:** `js/game.js`
   - **Impact:** Continuous rendering stopped = significant CPU savings
   - **Effort:** Low
   - **Similar to:** Audio loops stopping vs muting

3. **Stop Particle Effects Animation Loop When Tab Hidden**
   - **File:** `js/particleEffects.js`
   - **Impact:** Continuous rendering stopped = significant CPU savings
   - **Effort:** Low
   - **Similar to:** Audio loops stopping vs muting

4. **Pause Game Tick Loop When Tab Hidden**
   - **File:** `js/gameState.js`
   - **Impact:** Continuous game logic stopped = significant CPU savings
   - **Effort:** Medium (need to handle state properly)

5. **Implement Page Visibility API**
   - **File:** `js/game.js` (new handler)
   - **Impact:** All loops pause when tab hidden = massive CPU savings
   - **Effort:** Medium

### Medium Priority (RAM Savings)

6. **Cap Discovered Recipes Array**
   - **File:** `js/gameState.js`
   - **Impact:** Prevents unbounded memory growth
   - **Effort:** Low

7. **More Aggressive Particle Cleanup**
   - **File:** `js/particleEffects.js`
   - **Impact:** Reduces memory spikes
   - **Effort:** Low

### Low Priority (Code Quality)

8. **Ensure Event Listener Cleanup**
   - **File:** Multiple files
   - **Impact:** Prevents memory leaks over time
   - **Effort:** Low (already has infrastructure)

---

## Implementation Plan

### Phase 1: Canvas Animation Loops (High Impact, Low Effort)
1. Stop meditation towers animation loop when leaving meditation tab
2. Stop background sparkles animation loop when tab is hidden
3. Stop particle effects animation loop when tab is hidden

### Phase 2: Page Visibility API (High Impact, Medium Effort)
1. Add Page Visibility API handler
2. Pause all animation loops when tab is hidden
3. Resume all animation loops when tab is visible

### Phase 3: Game Tick Optimization (Medium Impact, Medium Effort)
1. Pause game tick loop when tab is hidden
2. Handle state properly on resume

### Phase 4: Memory Optimization (Medium Impact, Low Effort)
1. Cap discovered recipes array
2. More aggressive particle cleanup

---

## Expected Savings

### CPU Savings
- **Canvas Animation Loops:** ~30-50% CPU reduction when tabs are hidden
- **Game Tick Loop:** ~10-20% CPU reduction when tab is hidden
- **Total:** ~40-70% CPU reduction when tab is hidden

### RAM Savings
- **Discovered Recipes Cap:** ~1-2 MB savings (prevents unbounded growth)
- **Particle Cleanup:** ~500 KB-1 MB savings (reduces spikes)
- **Total:** ~1.5-3 MB RAM savings

---

## Similar Patterns to Audio Loop Optimization

The audio loop optimization (stopping vs muting) applies to:

1. **Canvas Animation Loops** - Stop `requestAnimationFrame` instead of just hiding canvas
2. **Game Tick Intervals** - Stop `setInterval` instead of just skipping ticks
3. **Meditation Tick Loop** - Stop `setInterval` instead of just checking if active
4. **Background Sparkles** - Stop animation loop instead of just pausing

**Key Principle:** **Stop processing when not needed, don't just hide it.**

---

## Notes

- All optimizations maintain functionality and aesthetics
- No visual changes - only performance improvements
- Similar to the audio loop optimization pattern
- Focus on stopping loops when not needed, not just hiding them

