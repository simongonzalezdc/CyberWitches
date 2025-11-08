# Testing Guide - Spellwright

**Purpose**: Complete manual and automated testing procedures for launch readiness
**Version**: 1.0
**Last Updated**: 2025-11-08

---

## 🧪 Automated Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/gameState.test.js

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Current Test Coverage

```
Statements   : 14.01% (748 tests passing)
Branches     : Unknown
Functions    : Unknown
Lines        : Unknown
```

**Test Files**:
1. `tests/gameState.test.js` - Core game state logic
2. `tests/cloudSave.test.js` - Cloud save functionality
3. `tests/onboarding.test.js` - Tutorial system
4. `tests/game.utility.test.js` - Game utility functions
5. `tests/gameState.saveValidation.test.js` - Save file validation (27 tests)

### Automated Test Checklist

- [x] All 748 tests passing
- [x] No test timeouts
- [x] Save validation comprehensive
- [ ] Increase coverage to 60% (long-term goal)

---

## 🎮 Manual Testing Procedures

### 1. Fresh Start Playthrough (60-90 minutes)

**Objective**: Verify complete new player experience from start to first ascension.

**Steps**:

1. **Clear all data**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Tutorial verification**
   - [ ] Tutorial modal appears on first launch
   - [ ] Tutorial steps are clear
   - [ ] Can skip tutorial
   - [ ] Can restart tutorial from settings

3. **Early game (0-15 minutes)**
   - [ ] Click "Cast" button successfully
   - [ ] Earn Fire, Water, Air essences
   - [ ] Unlock Crystal and Aether essences
   - [ ] Tooltip explanations are helpful
   - [ ] Can afford first Candle
   - [ ] Craft first Candle successfully
   - [ ] Candle produces AB automatically
   - [ ] AB counter updates in real-time
   - [ ] AB/s display shows production

4. **Mid game (15-45 minutes)**
   - [ ] Unlock all basic workstations
   - [ ] Craft at least one of each workstation type
   - [ ] Inscriptions tab unlocks
   - [ ] Purchase first inscription
   - [ ] Inscription effect applies correctly
   - [ ] Inventory tab shows all materials
   - [ ] Experiment tab unlocks
   - [ ] Discover first recipe through experimentation
   - [ ] Craft discovered recipe successfully

5. **Late game (45-90 minutes)**
   - [ ] Accumulate enough AB for advanced workstations
   - [ ] Meditation tab unlocks
   - [ ] Play meditation mini-game
   - [ ] Earn Focus from meditation
   - [ ] Rituals tab unlocks
   - [ ] Complete at least one daily ritual
   - [ ] Reach conditions for first ascension
   - [ ] Ascension modal appears
   - [ ] Preview shows Eldritch Key gain
   - [ ] Complete ascension successfully

6. **Post-ascension (5-10 minutes)**
   - [ ] Eldritch Keys saved correctly
   - [ ] Boons tab unlocked
   - [ ] Can purchase Boons with keys
   - [ ] Boon effects apply on next run
   - [ ] Start second run with bonuses

**Expected Time**: 60-90 minutes for average player

---

### 2. Save/Load Testing (15 minutes)

**Objective**: Verify all save mechanisms work reliably.

**Steps**:

1. **Auto-save**
   - [ ] Play for 1 minute
   - [ ] Refresh page
   - [ ] Progress restored correctly
   - [ ] All counters accurate

2. **Manual export/import**
   - [ ] Go to Settings → Export Save
   - [ ] Copy save data
   - [ ] Clear localStorage
   - [ ] Refresh page (starts fresh)
   - [ ] Go to Settings → Import Save
   - [ ] Paste save data
   - [ ] Progress restored exactly

3. **Corrupted save handling**
   ```javascript
   // Manually corrupt save
   localStorage.setItem('cyberWitchesSave', '{"invalid": json}');
   location.reload();
   ```
   - [ ] Error handled gracefully
   - [ ] Backup created automatically
   - [ ] Game starts fresh without crash

4. **Offline progress**
   - [ ] Note current AB and AB/s
   - [ ] Close game/browser
   - [ ] Wait 5-10 minutes
   - [ ] Reopen game
   - [ ] Welcome back modal shows time away
   - [ ] Offline AB earnings displayed
   - [ ] Earnings match expected (AB/s × seconds)

---

### 3. Cross-Browser Testing (30 minutes)

**Objective**: Ensure game works on all major browsers.

**Test Matrix**:

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | Latest | ☐ | ☐ | |
| Firefox | Latest | ☐ | ☐ | |
| Safari | Latest | ☐ | ☐ | |
| Edge | Latest | ☐ | - | |
| Samsung Internet | Latest | - | ☐ | |

**For each browser, test**:
- [ ] Game loads without errors
- [ ] All buttons clickable
- [ ] Animations smooth
- [ ] Sound effects play (Tier 2+)
- [ ] Music plays (Tier 4+)
- [ ] Save/load works
- [ ] No console errors
- [ ] No visual glitches
- [ ] Tooltips appear correctly
- [ ] Modals display properly

**Mobile-specific checks**:
- [ ] Touch targets at least 44x44px
- [ ] No horizontal scrolling
- [ ] Pinch-to-zoom disabled on game area
- [ ] Virtual keyboard doesn't break layout
- [ ] Install prompt appears (PWA)
- [ ] Add to home screen works
- [ ] Runs from home screen correctly
- [ ] Offline mode works

---

### 4. Accessibility Testing (45 minutes)

**Objective**: Verify WCAG 2.1 Level AA compliance.

#### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Focus indicator clearly visible on all elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes all modals
- [ ] Number keys (1-8) switch tabs
- [ ] Ctrl+, opens settings
- [ ] No keyboard traps

#### Screen Reader Testing (NVDA/JAWS/VoiceOver)

**Use one screen reader for testing**:
- [ ] Tab navigation announced correctly
- [ ] Button labels descriptive
- [ ] Tab switch announced ("Switched to X tab")
- [ ] Currency updates announced (AB changes)
- [ ] Modal open/close announced
- [ ] Form controls labeled properly
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Help modal content readable

#### Visual Accessibility
- [ ] Can zoom to 200% without layout breaking
- [ ] Color contrast meets AA standards (use WebAIM tool)
- [ ] Don't rely solely on color to convey information
- [ ] Text remains readable at all zoom levels
- [ ] Animations respect prefers-reduced-motion

#### Testing Tools
```bash
# Install axe DevTools browser extension
# Or use Lighthouse accessibility audit
```

- [ ] Run axe DevTools scan - 0 violations
- [ ] Run Lighthouse accessibility audit - Score 90+
- [ ] Manual keyboard test passed
- [ ] Screen reader test passed

---

### 5. Performance Testing (60 minutes)

**Objective**: Ensure game runs smoothly for extended periods.

#### Load Time
- [ ] First Contentful Paint (FCP) < 2 seconds
- [ ] Time to Interactive (TTI) < 3 seconds
- [ ] Page size < 2MB uncompressed
- [ ] Page size < 500KB gzipped

#### Runtime Performance
- [ ] CPU usage < 5% while idle
- [ ] CPU usage < 20% during active play
- [ ] Memory usage starts < 50MB
- [ ] Memory usage after 1 hour < 100MB
- [ ] Memory usage after 24 hours < 150MB
- [ ] No memory leaks (use Chrome DevTools Memory Profiler)
- [ ] Frame rate consistent 60fps (animations)
- [ ] No frame drops during tab switching

#### 24-Hour Stability Test
```javascript
// Leave game running with console open
// Monitor memory usage every hour
console.memory.usedJSHeapSize; // Check this periodically
```

**Procedure**:
1. Start fresh game
2. Play to mid-game (~100 AB/s production)
3. Leave game running overnight (24 hours)
4. Check console for errors
5. Check memory usage (should be stable)
6. Verify game still responsive
7. Check save still works

**Expected Results**:
- [ ] No crashes
- [ ] Memory usage stable (<200MB)
- [ ] No console errors
- [ ] Game still responsive
- [ ] Save/load still works

#### Lighthouse Audit
```bash
# Run Lighthouse in Chrome DevTools
# Target scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 90
- [ ] Best Practices score ≥ 90
- [ ] SEO score ≥ 90

---

### 6. Edge Case Testing (30 minutes)

**Objective**: Test unusual scenarios and boundary conditions.

**Test Cases**:

1. **Maximum values**
   ```javascript
   gameState.ab = 1e100; // Set very high AB
   gameState.workstations = { candle: 1e50 }; // Massive workstation count
   ```
   - [ ] Large numbers display correctly (using formatShort)
   - [ ] No overflow errors
   - [ ] Game remains playable

2. **Zero values**
   ```javascript
   gameState.ab = 0;
   gameState.workstations = {};
   ```
   - [ ] No division by zero errors
   - [ ] UI shows "0" not empty
   - [ ] Tooltips still work

3. **Empty inventory**
   - [ ] Can still interact with game
   - [ ] Experiment tab shows helpful message
   - [ ] No crashes

4. **Rapid clicking**
   - [ ] Click Cast button 100 times rapidly
   - [ ] Click Craft button rapidly
   - [ ] No crashes or freezes
   - [ ] Counts update correctly

5. **Tab spam**
   - [ ] Switch tabs rapidly (1-2-3-4-5-6-7-8 repeatedly)
   - [ ] No visual glitches
   - [ ] No memory leaks
   - [ ] Tab content loads correctly

6. **Modal spam**
   - [ ] Open/close help modal rapidly
   - [ ] Open/close settings rapidly
   - [ ] Escape key always works
   - [ ] No orphaned modals

7. **Network offline**
   - [ ] Disconnect network
   - [ ] Game still playable
   - [ ] Service worker serves cached assets
   - [ ] Reconnect - game continues normally

8. **LocalStorage quota exceeded**
   ```javascript
   // Fill localStorage
   try {
       localStorage.setItem('test', 'a'.repeat(10000000));
   } catch(e) {
       console.log('Quota exceeded');
   }
   ```
   - [ ] Save error handled gracefully
   - [ ] User notified of storage issue
   - [ ] Game doesn't crash

---

### 7. Security Testing (15 minutes)

**Objective**: Verify no security vulnerabilities.

**Tests**:

1. **XSS Protection**
   ```javascript
   // Try injecting script via save data
   localStorage.setItem('cyberWitchesSave',
     '{"ab": "<script>alert(\'XSS\')</script>"}');
   ```
   - [ ] Script doesn't execute
   - [ ] Save validation rejects it
   - [ ] CSP blocks inline scripts

2. **Save tampering**
   ```javascript
   // Try to cheat by editing save
   const save = JSON.parse(localStorage.getItem('cyberWitchesSave'));
   save.ab = 999999999;
   delete save.checksum;
   localStorage.setItem('cyberWitchesSave', JSON.stringify(save));
   location.reload();
   ```
   - [ ] Checksum validation catches tampering
   - [ ] Save rejected or corrupted backup created
   - [ ] Game handles gracefully

3. **Input validation**
   - [ ] Save with negative values rejected
   - [ ] Save with NaN values rejected
   - [ ] Save with overflow values rejected
   - [ ] All validation tests pass (27 tests in saveValidation.test.js)

4. **CSP Verification**
   - [ ] Open DevTools Console
   - [ ] Check for CSP violations
   - [ ] No "refused to execute inline script" errors (except expected)
   - [ ] External scripts only from cdn.jsdelivr.net

---

## 📊 Test Results Template

### Session Information
- **Date**: [Date]
- **Tester**: [Name]
- **Browser**: [Browser + Version]
- **OS**: [Operating System]
- **Device**: [Desktop/Mobile/Tablet]

### Test Results

| Category | Passed | Failed | Notes |
|----------|--------|--------|-------|
| Fresh Playthrough | ☐ | ☐ | |
| Save/Load | ☐ | ☐ | |
| Cross-Browser | ☐ | ☐ | |
| Accessibility | ☐ | ☐ | |
| Performance | ☐ | ☐ | |
| Edge Cases | ☐ | ☐ | |
| Security | ☐ | ☐ | |

### Bugs Found

1. **Bug Title**: [Description]
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]
   - **Screenshot**: [Link or attach]

### Recommendations

[Any recommendations for improvements]

### Sign-Off

- [ ] All critical tests passed
- [ ] All high-severity bugs fixed
- [ ] Game ready for [soft launch / public launch]

**Tester Signature**: _______________
**Date**: _______________

---

## 🚨 Critical Bug Criteria

**A bug is considered CRITICAL if**:
- Game crashes or becomes unplayable
- Save data is lost or corrupted
- Security vulnerability exists
- Legal compliance violated
- Accessibility blocker (keyboard trap, no screen reader support)

**Critical bugs MUST be fixed before launch.**

---

## ✅ Launch Approval Criteria

**Minimum requirements for launch approval**:

1. **Automated Tests**: All 748 tests passing ✅
2. **Fresh Playthrough**: Completed without critical bugs
3. **Save/Load**: All tests passed
4. **Accessibility**: Keyboard navigation and screen reader working
5. **Performance**: No crashes in 24-hour test
6. **Security**: No vulnerabilities found
7. **Cross-Browser**: Works on Chrome, Firefox, Safari
8. **Legal**: All documents accessible and accurate

**If all criteria met**: ✅ Approved for launch
**If any critical tests fail**: 🔴 Not approved - fix issues first

---

## 📋 Quick Pre-Launch Test

**10-Minute Smoke Test before deployment**:

1. [ ] Load game → No console errors
2. [ ] Click Cast → Essences increase
3. [ ] Craft workstation → AB increases
4. [ ] Switch all tabs → No errors
5. [ ] Open Help modal → Content displays
6. [ ] Save/reload → Progress restored
7. [ ] Check footer links → All accessible
8. [ ] Escape key → Closes modals
9. [ ] Tab navigation → Works smoothly
10. [ ] Mobile view → Layout responsive

**If all passed**: ✅ Safe to deploy
**If any failed**: 🔴 Fix before deployment

---

**Last Updated**: 2025-11-08
**Next Update**: After testing complete
**Maintained By**: QA Team / Development Team
