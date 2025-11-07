# Tester Feedback - Implementation Plan

## Overview
This document outlines the plan to address all 10 issues reported by testers. Each issue is analyzed with root causes and proposed solutions.

---

## Issue 1: Helper Script for Testers
**Problem:** Need a simple script to help testers install and launch the game locally.

**Root Cause:** No dedicated tester-friendly setup script exists.

**Solution:**
- Create `test-setup.sh` (Unix/Mac) and `test-setup.bat` (Windows)
- Scripts should:
  1. Check for Node.js/Python availability
  2. Install dependencies if needed (`npm install`)
  3. Start local server (prefer npm start, fallback to Python http.server)
  4. Open browser automatically
  5. Provide clear error messages if setup fails
- Add `TESTER_SETUP.md` with step-by-step instructions

**Files to Create:**
- `test-setup.sh`
- `test-setup.bat`
- `TESTER_SETUP.md`

**Priority:** High (blocks testing)

---

## Issue 2: Tutorial Broken - Blocks Functions
**Problem:** Tutorial interrupts game flow and blocks functions.

**Root Cause:**
- Tutorial overlay may be blocking clicks with high z-index
- Tutorial may not properly allow interaction with game elements
- Tutorial might be auto-starting when it shouldn't

**Solution:**
1. **Fix Tutorial Overlay Blocking:**
   - Ensure tutorial overlay doesn't block clicks to game elements
   - Use `pointer-events: none` on backdrop, `pointer-events: auto` only on tutorial tooltip
   - Add "Skip Tutorial" button that's always accessible

2. **Fix Tutorial Auto-Start:**
   - Review `shouldStartTutorial()` logic in `js/tutorial.js`
   - Ensure tutorial only starts for truly new players
   - Add option to disable tutorial in Settings

3. **Fix Tutorial Step Actions:**
   - Review tutorial step actions to ensure they don't block game functions
   - Make tutorial non-blocking (allow game interaction during tutorial)

**Files to Modify:**
- `js/tutorial.js` - Fix overlay blocking, improve shouldStartTutorial logic
- `styles.css` - Fix tutorial overlay CSS (pointer-events)
- `js/game.js` - Add tutorial disable option in Settings

**Priority:** High (blocks gameplay)

---

## Issue 3: 5GB RAM Usage
**Problem:** Game uses 5GB RAM, which is excessive for a browser game.

**Root Cause:**
- Possible memory leaks in game loops
- Large arrays/objects not being cleaned up
- Virtual scrolling may be caching too much
- Audio system may be loading too many assets
- Images may not be optimized

**Solution:**
1. **Investigate Memory Usage:**
   - Add memory profiling to identify leaks
   - Check for:
     - Unclosed intervals/timeouts
     - Event listeners not being removed
     - Large arrays growing unbounded
     - Image assets not being released
     - Audio buffers not being cleaned up

2. **Optimize Memory:**
   - Implement proper cleanup in virtual scrolling
   - Limit audio buffer sizes
   - Optimize image loading (lazy loading, compression)
   - Add memory leak detection and prevention
   - Clean up unused DOM elements

3. **Add Memory Monitoring:**
   - Add optional memory usage display in Settings (dev mode)
   - Log memory usage periodically

**Files to Modify:**
- `js/game.js` - Add memory monitoring, cleanup intervals
- `js/virtualScroll.js` - Optimize memory usage
- `js/audioSystem.js` - Optimize audio buffer management
- `js/memoryLeakPrevention.js` (if exists) - Enhance cleanup

**Priority:** Medium-High (affects performance)

---

## Issue 4: Design Tier Progression Too Easy
**Problem:** Only saw black and white (Tier 0) for 2 seconds before Tier 1 unlocked.

**Root Cause:**
- Tier 1 unlocks at first achievement OR 100 AB
- First achievement likely unlocks very quickly
- No minimum time requirement for Tier 0
- ALL design tier stages progress too quickly, not just Tier 0

**Solution:**
1. **Adjust ALL Tier Unlock Requirements:**
   - Tier 1: Require 3 achievements AND 500 AB (instead of OR)
   - Tier 2: Require 6 achievements AND 5,000 AB (instead of OR)
   - Tier 3: Require 9 achievements AND 50,000 AB (instead of OR)
   - Tier 4: Require 12 achievements AND 500,000 AB (instead of OR)
   - Add minimum playtime requirement for each tier (e.g., 30 seconds for Tier 1, 2 minutes for Tier 2, etc.)
   - Make each tier last significantly longer before next tier unlocks

2. **Review Tier Progression:**
   - Ensure each tier has meaningful progression gates
   - Consider adding time-based requirements in addition to achievement/AB requirements
   - Players should experience each tier for a meaningful duration before progressing

**Files to Modify:**
- `js/designTierSystem.js` - Adjust unlock requirements for ALL tiers, add time-based checks

**Priority:** Medium (affects game feel)

---

## Issue 5: Clicks Broken - Need to Click Twice
**Problem:** Sometimes need to click twice for actions to register.

**Root Cause:**
- Multiple event listeners attached to same element
- Event propagation issues (stopPropagation/preventDefault conflicts)
- Z-index/overlay issues blocking clicks
- Mobile touch handlers interfering with mouse clicks

**Solution:**
1. **Fix Event Listener Duplication:**
   - Ensure event listeners are only attached once
   - Use event delegation where possible
   - Remove duplicate handlers in `updateExperimentTab()` and similar functions

2. **Fix Event Propagation:**
   - Review `e.preventDefault()` and `e.stopPropagation()` usage
   - Ensure they're not preventing legitimate clicks
   - Fix the unified button handler in `initUI()` that may be conflicting

3. **Fix Overlay Issues:**
   - Check for overlays blocking clicks (tutorial, modals, etc.)
   - Ensure proper z-index management

**Files to Modify:**
- `js/game.js` - Fix event listener attachment, review unified handler
- `js/mobile.js` - Fix touch/mouse event conflicts
- `styles.css` - Fix z-index and pointer-events

**Priority:** High (affects core gameplay)

---

## Issue 6: Text Cut Off - "Recipe for next"
**Problem:** Text is cut off, specifically "recipe for next" label.

**Root Cause:**
- CSS overflow/width constraints
- Text not wrapping properly
- Container width too narrow

**Solution:**
1. **Fix CSS Text Overflow:**
   - Add `word-wrap: break-word` and `overflow-wrap: break-word`
   - Ensure containers have proper `max-width` and `box-sizing: border-box`
   - Add `white-space: normal` where needed

2. **Fix Specific "Recipe for next" Label:**
   - Check `.card-label` styles
   - Ensure proper padding/margin
   - Make text responsive

**Files to Modify:**
- `styles.css` - Fix text overflow styles for `.card-label`, `.card-description`
- `js/game.js` - Ensure "Recipe for next" text has proper wrapping
- `js/virtualScroll.js` - Fix text overflow in virtual scroll items

**Priority:** Medium (affects readability)

---

## Issue 7: Elixir Crafting Doesn't Work
**Problem:** Can't click to craft anything in experiments tab - elixir crafting buttons don't work.

**Root Cause:**
- Event listeners not being attached properly in `updateExperimentTab()`
- Button cloning may be removing event listeners
- Z-index/overlay issues blocking clicks
- `craftRecipe()` function may have issues

**Solution:**
1. **Fix Event Listener Attachment:**
   - Review `updateExperimentTab()` in `js/game.js`
   - Ensure buttons get event listeners attached correctly
   - Fix the button cloning issue (lines 3553-3554)

2. **Simplify Button Handler:**
   - Use event delegation instead of attaching to each button
   - Ensure `window.craftRecipe()` is accessible and working

3. **Test Crafting Flow:**
   - Verify recipe discovery works
   - Verify `canAfford()` checks work
   - Verify crafting actually executes

**Files to Modify:**
- `js/game.js` - Fix `updateExperimentTab()` button handlers
- `js/gameState.js` - Verify `craftDiscoveredRecipe()` works correctly

**Priority:** High (blocks core feature)

---

## Issue 8: Visual Bug in Achievement List
**Problem:** Visual bug in the achievement list display.

**Root Cause:**
- Unknown specific issue - need to investigate rendering
- Possible issues: layout, spacing, colors, overflow

**Solution:**
1. **Investigate Achievement List Rendering:**
   - Check `updateStatsTab()` achievement rendering
   - Review virtual scroll implementation for achievements
   - Check CSS for achievement cards

2. **Fix Visual Issues:**
   - Ensure proper spacing and padding
   - Fix any overflow issues
   - Ensure proper colors for locked/unlocked states
   - Fix any layout issues

**Files to Modify:**
- `js/game.js` - Fix `updateStatsTab()` achievement rendering
- `js/virtualScroll.js` - Fix `VirtualAchievementList` if needed
- `styles.css` - Fix achievement card styles

**Priority:** Medium (affects UI)

---

## Issue 9: Meditation Progress Erased on Game Close
**Problem:** Meditation progress (focus, towers, etc.) is lost when game closes.

**Root Cause:**
- `meditationState.saveState()` exists but is never called
- Auto-save only saves `gameState`, not `meditationState`
- No beforeunload handler to save meditation state

**Solution:**
1. **Add Meditation State to Auto-Save:**
   - Modify `initAutoSave()` to also save meditation state
   - Call `meditationState.saveState()` in auto-save interval

2. **Add Beforeunload Handler:**
   - Save meditation state when page unloads
   - Ensure state is saved on browser close

3. **Verify Save/Load:**
   - Ensure `loadState()` is called on game initialization
   - Verify all meditation data is saved (focus, towers, upgrades, etc.)

**Files to Modify:**
- `js/game.js` - Add meditation state to auto-save, add beforeunload handler
- `js/meditationState.js` - Verify saveState() saves all necessary data

**Priority:** High (data loss)

---

## Issue 10: Meditation Wave 1 is Infinite
**Problem:** Meditation wave 1 never ends - it's infinite.

**Root Cause:**
- Wave completion check in `tick()` may be incorrect
- Condition `this.distractions.length === 0 && this.nextSpawnTime > now + 5000` may never be true
- Wave may keep spawning distractions indefinitely
- No maximum wave duration

**Solution:**
1. **Fix Wave Completion Logic:**
   - Review wave completion check in `tick()` (line 429)
   - Ensure wave ends when all distractions are killed AND no more are spawning
   - Add maximum wave duration as fallback (e.g., 30 seconds)

2. **Fix Wave Spawning:**
   - Review `updateWave()` and `spawnDistraction()` logic
   - Ensure waves have a finite number of distractions
   - Add wave duration limit

3. **Add Wave Progress Tracking:**
   - Track total distractions spawned vs. killed
   - End wave when all spawned distractions are killed

**Files to Modify:**
- `js/meditationState.js` - Fix wave completion logic, add wave duration limits

**Priority:** High (blocks meditation gameplay)

---

## Implementation Order

### Phase 1: Critical Blockers (High Priority)
1. Issue 7: Elixir Crafting Doesn't Work
2. Issue 5: Clicks Broken
3. Issue 9: Meditation Progress Erased
4. Issue 2: Tutorial Broken

### Phase 2: Important Fixes (Medium-High Priority)
5. Issue 1: Helper Script for Testers
6. Issue 3: Memory Usage (investigate first, then optimize)
7. Issue 6: Text Cut Off
8. Issue 8: Achievement List Visual Bug

### Phase 3: Balance/Polish (Medium Priority)
9. Issue 4: Design Tier Progression Too Easy (ALL tiers need to last longer - Tier 0 was just an example)
10. Issue 10: Meditation Wave 1 is Infinite

---

## Testing Checklist

After implementing fixes, test:
- [ ] Tutorial doesn't block game functions
- [ ] All buttons work with single click
- [ ] Elixir crafting works in experiments tab
- [ ] Meditation progress saves and loads correctly
- [ ] Text doesn't get cut off
- [ ] Achievement list displays correctly
- [ ] Memory usage is reasonable (< 1GB ideally)
- [ ] Design tier progression feels appropriate - each tier lasts a meaningful duration (ALL tiers, not just Tier 0)
- [ ] Meditation waves end properly (wave 1 and all subsequent waves)
- [ ] Tester setup script works on clean system

---

## Notes

- Some issues may be related (e.g., click issues and tutorial blocking)
- Memory usage investigation should be done first before optimization
- Consider adding error logging to help identify issues in production

