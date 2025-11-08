# Testing Roadmap to 60% Coverage

**Current Coverage**: 13.18% statements | 9.82% branches | 20.23% functions | 13.14% lines
**Target Coverage**: 60% statements | 55% branches | 60% functions | 60% lines

**Gap to Close**: ~46% statements | ~45% branches | ~40% functions | ~47% lines

---

## Current Status (✅ Completed)

| Module | Coverage | Tests | Status |
|--------|----------|-------|--------|
| **achievements.js** | 100% | 68 tests | ✅ Complete |
| **utils.js** | 100% | 50 tests | ✅ Complete |
| **debug.js** | 100% | 21 tests | ✅ Complete |
| **data.js** | 100% | - | ✅ Complete (data only) |
| **playerAnalytics.js** | 97.14% | 38 tests | ✅ Complete |
| **questSystem.js** | 90.38% | 30 tests | ✅ Complete |
| **comboSystem.js** | 87.8% | 40 tests | ✅ Complete |
| **progressionAnalysis.js** | 77.77% | 31 tests | ✅ Good |
| **balanceAnalytics.js** | 78.75% | 24 tests | ✅ Good |
| **analytics.js** | 74.39% | 46 tests | ✅ Good |
| **onboarding.js** | 58.89% | 50 tests | ✅ Good |
| **gameState.js** | 51.07% | 144 tests | ⚠️ Needs more (target: 75%) |
| **dailyRituals.js** | 52.66% | 13 tests | ⚠️ Needs expansion |

---

## Priority 1: Critical Game Logic (High Impact)

### 1. **gameState.js** - 51.07% → 75%+ coverage
**Current**: 144 tests
**Estimated Additional Tests Needed**: 60-80 tests

#### Uncovered Critical Areas:
- **Save/Load Conflict Resolution** (lines 763-859)
  - [ ] Test save data versioning and migration
  - [ ] Test conflict resolution between local and cloud saves
  - [ ] Test corrupted save data recovery
  - [ ] Test backwards compatibility with old save formats

- **Advanced Prestige Calculations** (lines 1378-1555)
  - [ ] Test prestige point calculations at various levels
  - [ ] Test prestige multiplier effects on production
  - [ ] Test prestige reset mechanics
  - [ ] Test element specialization bonuses

- **Recipe Discovery** (lines 1117-1161)
  - [ ] Test recipe unlocking conditions
  - [ ] Test hidden recipe discovery
  - [ ] Test recipe tier progression

- **Production Calculations** (lines 449-492, 558-586)
  - [ ] Test production rate calculations with buffs
  - [ ] Test multi-workstation production
  - [ ] Test production overflow handling
  - [ ] Test production multiplier stacking

- **Buff Management** (lines 249-268, 608-613)
  - [ ] Test buff expiration
  - [ ] Test buff stacking rules
  - [ ] Test buff refresh mechanics
  - [ ] Test conflicting buffs

- **Achievement Triggers** (lines 920-927)
  - [ ] Test achievement unlock conditions
  - [ ] Test retroactive achievement grants
  - [ ] Test achievement milestone rewards

**Priority**: 🔴 CRITICAL - Core game mechanics

---

### 2. **cloudSave.js** - 37.23% → 60%+ coverage
**Current**: 25 tests (23 passing)
**Estimated Additional Tests Needed**: 40-50 tests

#### Uncovered Critical Areas:
- **Upload/Download Logic** (lines 248-287, 309-412)
  - [ ] Test HTTP request/response handling
  - [ ] Test network error recovery
  - [ ] Test retry logic with exponential backoff
  - [ ] Test request timeout handling
  - [ ] Test large save data compression

- **Conflict Resolution** (lines 434-655)
  - [ ] Test timestamp-based conflict resolution
  - [ ] Test manual conflict resolution UI
  - [ ] Test merge strategies for different data types
  - [ ] Test conflict resolution with missing data
  - [ ] Test three-way merge scenarios

- **Sync State Management** (lines 138-145, 209)
  - [ ] Test sync status transitions
  - [ ] Test concurrent sync prevention
  - [ ] Test sync queue management
  - [ ] Test offline queue persistence

- **Data Integrity** (lines 115-122)
  - [ ] Test checksum validation
  - [ ] Test data schema validation
  - [ ] Test data sanitization
  - [ ] Test malformed data handling

**Priority**: 🔴 CRITICAL - User data safety

---

### 3. **eventSystem.js** - 27.45% → 60%+ coverage
**Current**: ~10 tests
**Estimated Additional Tests Needed**: 30-40 tests

#### Uncovered Areas:
- **Event Scheduling** (lines 21-73)
  - [ ] Test event start/end timing
  - [ ] Test event cooldown periods
  - [ ] Test event prerequisites
  - [ ] Test event overlapping rules
  - [ ] Test seasonal event triggers

- **Event Rewards** (lines 102-138)
  - [ ] Test reward calculation
  - [ ] Test reward distribution
  - [ ] Test bonus multipliers
  - [ ] Test event milestone rewards
  - [ ] Test event leaderboard mechanics

**Priority**: 🔴 CRITICAL - Player engagement

---

## Priority 2: Core Systems (Medium-High Impact)

### 4. **meditationState.js** - 0% → 40%+ coverage
**Current**: 0 tests
**Estimated Tests Needed**: 50-60 tests

#### Areas to Test:
- **Tower Management**
  - [ ] Test tower placement
  - [ ] Test tower upgrading
  - [ ] Test tower synergies
  - [ ] Test tower effects

- **Resource Generation**
  - [ ] Test focus generation
  - [ ] Test meditation tick loop
  - [ ] Test offline progress
  - [ ] Test resource caps

- **State Persistence**
  - [ ] Test meditation state save/load
  - [ ] Test tower configuration persistence
  - [ ] Test meditation progress tracking

- **Progression System**
  - [ ] Test meditation level progression
  - [ ] Test unlock conditions
  - [ ] Test prestige integration

**Priority**: 🟠 HIGH - Major game feature

---

### 5. **audioSystem.js** - 3.25% → 40%+ coverage
**Current**: ~15 tests
**Estimated Tests Needed**: 40-50 tests

#### Areas to Test:
- **Sound Loading** (lines 147-300)
  - [ ] Test audio file loading
  - [ ] Test load error handling
  - [ ] Test preload strategies
  - [ ] Test audio sprite management

- **Playback Control** (lines 300-600)
  - [ ] Test play/pause/stop
  - [ ] Test volume control
  - [ ] Test fade in/out
  - [ ] Test audio pooling

- **Music System** (lines 600-1000)
  - [ ] Test music track switching
  - [ ] Test crossfade transitions
  - [ ] Test music looping
  - [ ] Test dynamic music layers

- **Settings Integration** (lines 1600-1700)
  - [ ] Test volume persistence
  - [ ] Test mute functionality
  - [ ] Test audio preferences

**Priority**: 🟠 HIGH - User experience quality

---

### 6. **dailyRituals.js** - 52.66% → 70%+ coverage
**Current**: 13 tests
**Estimated Additional Tests Needed**: 20-25 tests

#### Uncovered Areas:
- **Ritual Completion** (lines 94-174)
  - [ ] Test daily ritual completion
  - [ ] Test streak tracking
  - [ ] Test streak rewards
  - [ ] Test streak reset conditions
  - [ ] Test completion rewards

- **Ritual Reset** (lines 69-77)
  - [ ] Test daily reset timing
  - [ ] Test timezone handling
  - [ ] Test reset during active rituals

- **Progress Tracking** (lines 201-205)
  - [ ] Test progress persistence
  - [ ] Test progress validation
  - [ ] Test partial completion handling

**Priority**: 🟠 HIGH - Retention mechanic

---

### 7. **designTierSystem.js** - 0% → 40%+ coverage
**Current**: 0 tests
**Estimated Tests Needed**: 30-40 tests

#### Areas to Test:
- **Tier Progression**
  - [ ] Test tier unlock conditions
  - [ ] Test tier transition effects
  - [ ] Test tier thresholds

- **Visual Effects**
  - [ ] Test glitch effect intensity
  - [ ] Test color scheme changes
  - [ ] Test animation unlocks
  - [ ] Test particle effects

- **UI Updates**
  - [ ] Test UI element visibility by tier
  - [ ] Test style application by tier
  - [ ] Test tier indicator updates

**Priority**: 🟡 MEDIUM - Polish/UX

---

### 8. **fadingThemeSystem.js** - 0% → 30%+ coverage
**Current**: 0 tests
**Estimated Tests Needed**: 25-35 tests

#### Areas to Test:
- **Theme State**
  - [ ] Test theme transition triggers
  - [ ] Test preservation mechanics
  - [ ] Test decay mechanics
  - [ ] Test theme persistence

- **Visual Feedback**
  - [ ] Test color transitions
  - [ ] Test animation timing
  - [ ] Test effect stacking

**Priority**: 🟡 MEDIUM - Visual polish

---

## Priority 3: User Experience & Polish (Medium Impact)

### 9. **accessibility.js** - 47.94% → 60%+ coverage
**Current**: ~20 tests
**Estimated Additional Tests Needed**: 15-20 tests

#### Uncovered Areas:
- **Screen Reader Support** (lines 121-157)
  - [ ] Test ARIA label generation
  - [ ] Test screen reader announcements
  - [ ] Test focus management
  - [ ] Test live region updates

- **Keyboard Navigation** (lines 87-90, 103)
  - [ ] Test keyboard shortcuts
  - [ ] Test tab order
  - [ ] Test escape key handling

- **Reduced Motion** (lines 70-76)
  - [ ] Test animation disabling
  - [ ] Test motion preference detection
  - [ ] Test fallback visuals

**Priority**: 🟡 MEDIUM - Accessibility compliance

---

### 10. **errorHandler.js** - 14.78% → 50%+ coverage
**Current**: ~10 tests
**Estimated Tests Needed**: 30-40 tests

#### Areas to Test:
- **Error Catching** (lines 99-150)
  - [ ] Test error type detection
  - [ ] Test error categorization
  - [ ] Test error stack parsing

- **Error Recovery** (lines 150-300)
  - [ ] Test recovery strategies
  - [ ] Test retry logic
  - [ ] Test fallback handlers
  - [ ] Test graceful degradation

- **Error Reporting** (lines 300-426)
  - [ ] Test error logging
  - [ ] Test error aggregation
  - [ ] Test error rate limiting
  - [ ] Test sensitive data filtering

**Priority**: 🟡 MEDIUM - Stability

---

### 11. **privacyControls.js** - 40.27% → 60%+ coverage
**Current**: ~15 tests
**Estimated Additional Tests Needed**: 20-25 tests

#### Uncovered Areas:
- **Consent Management** (lines 36-50, 106-157)
  - [ ] Test consent collection
  - [ ] Test consent persistence
  - [ ] Test consent revocation
  - [ ] Test GDPR compliance

- **Data Deletion** (lines 190-256)
  - [ ] Test user data deletion
  - [ ] Test deletion confirmation
  - [ ] Test partial data deletion
  - [ ] Test deletion verification

**Priority**: 🟡 MEDIUM - Legal compliance

---

### 12. **pwaFeatures.js** - 21.42% → 50%+ coverage
**Current**: ~10 tests
**Estimated Tests Needed**: 25-30 tests

#### Areas to Test:
- **Install Prompt** (lines 53-62)
  - [ ] Test install prompt display
  - [ ] Test install acceptance
  - [ ] Test install rejection

- **Offline Support** (lines 74-129)
  - [ ] Test offline detection
  - [ ] Test offline mode activation
  - [ ] Test service worker registration
  - [ ] Test cache strategies

- **App Updates** (lines 142-185)
  - [ ] Test update detection
  - [ ] Test update prompt
  - [ ] Test background updates

**Priority**: 🟡 MEDIUM - Progressive enhancement

---

## Priority 4: Performance & Optimization (Lower Impact)

### 13. **virtualScroll.js** - 0% → 30%+ coverage
**Current**: 0 tests
**Estimated Tests Needed**: 35-45 tests

#### Areas to Test:
- **Virtual Scrolling**
  - [ ] Test viewport calculation
  - [ ] Test item rendering
  - [ ] Test scroll position tracking
  - [ ] Test dynamic item heights

- **Performance**
  - [ ] Test large list handling (1000+ items)
  - [ ] Test smooth scrolling
  - [ ] Test memory management
  - [ ] Test item recycling

**Priority**: 🟢 LOW - Performance optimization

---

### 14. **performanceMonitor.js** - 0% → 30%+ coverage
**Current**: 0 tests
**Estimated Tests Needed**: 25-30 tests

#### Areas to Test:
- **Metrics Collection**
  - [ ] Test FPS monitoring
  - [ ] Test memory usage tracking
  - [ ] Test CPU usage detection
  - [ ] Test network metrics

- **Performance Warnings**
  - [ ] Test performance threshold alerts
  - [ ] Test optimization suggestions
  - [ ] Test performance reporting

**Priority**: 🟢 LOW - Diagnostics

---

### 15. **coreWebVitals.js** - 39.21% → 60%+ coverage
**Current**: ~15 tests
**Estimated Additional Tests Needed**: 20-25 tests

#### Uncovered Areas:
- **LCP Tracking** (lines 61-76)
  - [ ] Test Largest Contentful Paint measurement
  - [ ] Test LCP threshold detection

- **FID Tracking** (lines 86-105)
  - [ ] Test First Input Delay measurement
  - [ ] Test interaction responsiveness

- **CLS Tracking** (lines 115-127)
  - [ ] Test Cumulative Layout Shift measurement
  - [ ] Test layout stability detection

**Priority**: 🟢 LOW - Analytics/SEO

---

## Priority 5: Non-Critical/Nice-to-Have

### Low-Priority Modules (Can skip for 60% goal)

- **animations.js** - 3.33% (DOM-heavy, hard to test)
- **particleEffects.js** - 0% (Visual effects, low business logic)
- **celebrationAnimations.js** - 0% (Visual effects)
- **mobile.js** - 0% (Device-specific, requires mobile emulation)
- **tutorial.js** - 2.29% (Duplicate of onboarding.js)
- **easterEggs.js** - 0% (Non-critical feature)
- **retentionTracking.js** - 0% (Analytics only)

---

## Estimated Test Requirements Summary

To reach **60% overall coverage**, we need approximately:

| Priority | Modules | Current Avg | Target Avg | Est. Tests Needed |
|----------|---------|-------------|------------|-------------------|
| **Priority 1** | 3 modules | 38% | 65%+ | 130-170 tests |
| **Priority 2** | 6 modules | 20% | 50%+ | 190-240 tests |
| **Priority 3** | 4 modules | 31% | 55%+ | 90-120 tests |
| **Priority 4** | 3 modules | 13% | 40%+ | 80-100 tests |
| **TOTAL** | **16 modules** | - | - | **490-630 tests** |

**Current Total Tests**: 721 tests
**Estimated Final Total**: ~1,150-1,350 tests

---

## Strategic Recommendations

### Quick Wins (High Coverage ROI)
1. **gameState.js** - Add 60 tests to reach 75% (most critical)
2. **cloudSave.js** - Add 40 tests to reach 60% (data safety)
3. **dailyRituals.js** - Add 20 tests to reach 70% (already halfway)
4. **eventSystem.js** - Add 35 tests to reach 60% (engagement)

**Impact**: These 4 modules alone would add ~155 tests and significantly improve overall coverage.

### Long-Term Goals
5. **meditationState.js** - 50 tests for 40% coverage (major feature)
6. **audioSystem.js** - 40 tests for 40% coverage (UX quality)
7. **designTierSystem.js** - 35 tests for 40% coverage (visual progression)

---

## Implementation Timeline Estimate

- **Phase 1** (Quick Wins): 2-3 weeks → ~30% overall coverage
- **Phase 2** (Core Systems): 3-4 weeks → ~45% overall coverage
- **Phase 3** (UX & Polish): 2-3 weeks → ~55% overall coverage
- **Phase 4** (Final Push): 1-2 weeks → **60%+ overall coverage**

**Total Estimated Time**: 8-12 weeks for full 60% coverage

---

## Notes

### Modules Intentionally Excluded from 60% Goal
- **game.js** (6,442 lines, 97% DOM code) - Only utility functions tested
- **meditationUI.js** (446 lines, all DOM) - UI-heavy, minimal logic
- **meditationTowers.js** (1,087 lines) - Depends heavily on meditationState
- **virtualScroll.js** (990 lines) - Complex DOM manipulation, lower priority

### Testing Challenges
- **DOM-heavy code**: Many modules require extensive DOM mocking
- **Async operations**: Cloud save, audio loading require async handling
- **External dependencies**: PWA features require service worker support
- **State interdependencies**: Many systems depend on gameState initialization

### Testing Best Practices for This Codebase
1. ✅ **Prioritize business logic** over DOM manipulation
2. ✅ **Mock external APIs** (localStorage, fetch, audio)
3. ✅ **Test edge cases** (offline, corrupted data, errors)
4. ✅ **Use manual mocking** (ES modules don't support jest.fn())
5. ✅ **Avoid DOM tests** unless critical to functionality

---

**Last Updated**: 2025-11-08
**Current Coverage**: 13.18% statements
**Target Coverage**: 60% statements
**Progress**: 22% of goal achieved
