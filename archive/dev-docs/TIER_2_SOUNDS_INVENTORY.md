# Tier 2 Sounds Inventory

## Overview

Tier 2 unlocks sound effects in Cyber Witches. All sounds are procedurally generated using the Web Audio API and are available once Tier 2 is unlocked (First Prestige or 1000 AB).

**Unlock Condition:** Tier 2 (First Prestige or 1000 AB)  
**Sound Generation:** Procedural (Web Audio API)  
**Total Sounds:** 9  
**File Location:** `js/audioSystem.js`

---

## Complete Sound Inventory

### 1. Click Sound
- **ID:** `'click'`
- **Name:** "Click"
- **Volume:** 0.3
- **Duration:** 100ms (0.1 seconds)
- **Type:** Percussive (hi-hat/snare-like)
- **Frequency Range:** G3 (196Hz) to G4 (392Hz)
- **Characteristics:**
  - Sharp percussive envelope
  - Strong noise transient at start
  - Drum-like character
- **Usage:** General button clicks (not currently used in codebase)
- **Generation Method:** `generateClickSound()`

### 2. Cast Sound
- **ID:** `'cast'`
- **Name:** "Spell Cast"
- **Volume:** 0.4
- **Duration:** 400ms (0.4 seconds)
- **Type:** Percussive (tom/kick-like with tone)
- **Frequency Range:** G3 (196Hz) to C5 (523.25Hz)
- **Characteristics:**
  - Uses pentatonic scale notes: G3, A3, C4, D4
  - Multiple note progression
  - Drum-like percussive character
- **Usage:** 
  - Cast button clicks (`js/game.js:1193`)
  - Throttled during auto-cast mode (plays every 10 casts)
  - Volume adjusted: 0.3 for auto-cast, 0.4 for manual
- **Generation Method:** `generateCastSound()`

### 3. Achievement Sound
- **ID:** `'achievement'`
- **Name:** "Achievement"
- **Volume:** 0.5
- **Duration:** 800ms (0.8 seconds)
- **Type:** Victory fanfare (ascending notes)
- **Frequency Range:** G3 (196Hz) to C5 (523.25Hz)
- **Characteristics:**
  - Multiple ascending drum hits
  - Four-hit progression: G3 → A3 → C4 → C5
  - "Super cute and dopaminergic" design
  - Victory fanfare style
- **Usage:** Achievement unlock notifications (not currently used in codebase)
- **Generation Method:** `generateAchievementSound()`

### 4. Level Up Sound
- **ID:** `'level_up'`
- **Name:** "Level Up"
- **Volume:** 0.6
- **Duration:** 800ms (0.8 seconds)
- **Type:** Ascending arpeggio with sparkle
- **Frequency Range:** G3 (196Hz) to E4 (329.63Hz)
- **Characteristics:**
  - Fast percussive drum hits
  - Pentatonic scale: G3, A3, C4, D4, E4
  - 12 hits per second pattern
  - "Super cute" design
- **Usage:** Level up notifications (not currently used in codebase)
- **Generation Method:** `generateLevelUpSound()`

### 5. Purchase Sound
- **ID:** `'purchase'`
- **Name:** "Purchase"
- **Volume:** 0.4
- **Duration:** 250ms (0.25 seconds)
- **Type:** Percussive (snare/rim shot-like)
- **Frequency Range:** G3 (196Hz) to C5 (523.25Hz)
- **Characteristics:**
  - Pentatonic notes: G3, A3, C4
  - Quick progression
  - Drum-like character
- **Usage:**
  - Workstation crafting (`js/game.js:192, 257`)
  - Upgrade purchases (`js/game.js:300`)
  - Recipe crafting (`js/game.js:401`)
  - Boon purchases (`js/game.js:448`)
- **Generation Method:** `generatePurchaseSound()`

### 6. Error Sound
- **ID:** `'error'`
- **Name:** "Error"
- **Volume:** 0.3
- **Duration:** 300ms (0.3 seconds)
- **Type:** Descending percussive (low tom/kick-like)
- **Frequency Range:** C4 (261.63Hz) to E4 (329.63Hz)
- **Characteristics:**
  - Descending pentatonic notes: E4 → D4 → C4
  - Lower volume for less annoyance
  - Drum-like character
- **Usage:** Error notifications (not currently used in codebase)
- **Generation Method:** `generateErrorSound()`

### 7. Notification Sound
- **ID:** `'notification'`
- **Name:** "Notification"
- **Volume:** 0.4
- **Duration:** 200ms (0.2 seconds)
- **Type:** Percussive (hi-hat/cymbal-like)
- **Frequency Range:** G4 (392Hz) to C5 (523.25Hz)
- **Characteristics:**
  - Two-tone: G4 and C5
  - Hi-hat/cymbal-like character
  - Quick, light sound
- **Usage:**
  - General notifications (`js/game.js:4465`)
  - Volume: 0.3 (lowered for notifications)
- **Generation Method:** `generateNotificationSound()`

### 8. Ritual Complete Sound
- **ID:** `'ritual_complete'`
- **Name:** "Ritual Complete"
- **Volume:** 0.5
- **Duration:** 700ms (0.7 seconds)
- **Type:** Percussive (tom with ascending progression)
- **Frequency Range:** G3 (196Hz) to C5 (523.25Hz)
- **Characteristics:**
  - Ascending pentatonic notes: G3 → A3 → C4 → D4
  - Longer duration for satisfaction
  - Drum-like character
- **Usage:** Coven ritual completion (not currently used, coven system archived)
- **Generation Method:** `generateRitualSound()`

### 9. Craft Sound
- **ID:** `'craft'`
- **Name:** "Craft"
- **Volume:** 0.4
- **Duration:** 300ms (0.3 seconds)
- **Type:** Percussive (tom/kick-like with tone)
- **Frequency Range:** G3 (196Hz) to C5 (523.25Hz)
- **Characteristics:**
  - Pentatonic notes: G3, A3, C4, D4
  - Satisfying crafting character
  - Drum-like sound
- **Usage:** Workstation crafting (`js/game.js:192, 257`)
- **Generation Method:** `generateCraftSound()`

---

## Sound Characteristics Summary

### All Sounds Share:
- **Generation Method:** Procedural (Web Audio API)
- **Audio Format:** Data URLs (generated on-the-fly)
- **Character:** Percussive/drum-like sounds
- **Frequency Range:** G3 (196Hz) to C5 (523.25Hz)
- **Scale:** Pentatonic scale (no dissonance)
- **Envelope:** Sharp percussive (instant attack, quick decay)
- **Noise Component:** Strong transient at start (drum hit character)

### Volume Levels:
| Sound | Volume | Reason |
|-------|--------|--------|
| Click | 0.3 | Lower volume for frequent clicks |
| Cast | 0.4 | Standard volume |
| Achievement | 0.5 | Higher volume for celebration |
| Level Up | 0.6 | Highest volume for celebration |
| Purchase | 0.4 | Standard volume |
| Error | 0.3 | Lower volume to reduce annoyance |
| Notification | 0.4 | Standard volume |
| Ritual Complete | 0.5 | Higher volume for celebration |
| Craft | 0.4 | Standard volume |

### Duration Levels:
| Sound | Duration | Reason |
|--------|----------|--------|
| Click | 100ms | Very short for frequent clicks |
| Cast | 400ms | Satisfying duration for main action |
| Achievement | 800ms | Longer for celebration |
| Level Up | 800ms | Longer for celebration |
| Purchase | 250ms | Quick confirmation |
| Error | 300ms | Quick error feedback |
| Notification | 200ms | Quick notification |
| Ritual Complete | 700ms | Longer for satisfaction |
| Craft | 300ms | Satisfying crafting sound |

---

## Usage in Codebase

### Currently Used Sounds:

1. **Cast Sound** (`'cast'`)
   - Location: `js/game.js:1193`
   - Context: Cast button handler
   - Throttling: Plays every 10 casts during auto-cast mode
   - Volume: 0.3 (auto-cast) or 0.4 (manual)

2. **Purchase Sound** (`'purchase'`)
   - Location: Multiple locations
     - `js/game.js:192` - Workstation crafting
     - `js/game.js:257` - Workstation crafting
     - `js/game.js:300` - Upgrade purchase
     - `js/game.js:401` - Recipe crafting
     - `js/game.js:448` - Boon purchase

3. **Craft Sound** (`'craft'`)
   - Location: `js/game.js:192, 257`
   - Context: Workstation crafting

4. **Notification Sound** (`'notification'`)
   - Location: `js/game.js:4465`
   - Context: General notifications
   - Volume: 0.3 (lowered)

### Unused Sounds (Available but not currently triggered):

1. **Click Sound** (`'click'`)
   - Available but not used
   - Could be used for button clicks

2. **Achievement Sound** (`'achievement'`)
   - Available but not used
   - Should be triggered when achievements unlock

3. **Level Up Sound** (`'level_up'`)
   - Available but not used
   - Could be used for prestige/level ups

4. **Error Sound** (`'error'`)
   - Available but not used
   - Should be triggered on errors

5. **Ritual Complete Sound** (`'ritual_complete'`)
   - Available but not used
   - Was for coven system (now archived)

---

## Sound Generation Details

### Technical Implementation:
- All sounds are generated procedurally using Web Audio API
- No audio files are loaded (all generated on-the-fly)
- Sounds use pentatonic scale (G, A, C, D, E) to avoid dissonance
- Frequency range constrained to G3-C5 for consistency
- All sounds have percussive/drum-like character
- Envelope: Exponential decay with instant attack
- Noise component: Random noise transient at start for drum-like character

### Generation Process:
1. Create audio buffer with appropriate sample rate
2. Generate waveform using sine waves at pentatonic frequencies
3. Apply envelope (exponential decay)
4. Add noise transient for percussive character
5. Convert buffer to data URL
6. Store in sound effects map

---

## Tier 2 Sound System Integration

### Activation:
- Tier 2 unlocks via `DesignTierSystem.applyTier2()`
- Calls `audioSystem.enableSoundEffects()`
- Sound effects check `currentTier >= 2` before playing
- Also checks `soundEffectsEnabled` flag

### Playback Control:
- `playSound(soundId, options)` method checks:
  1. Current tier >= 2
  2. `soundEffectsEnabled` flag
  3. Audio support available
  4. Not muted
- Returns `false` if any condition fails

### Volume Control:
- Master volume slider (affects all sounds)
- SFX volume slider (affects sound effects only)
- Individual sound volumes can be overridden via `options`
- Settings persist in localStorage

---

## Recommendations

### Missing Implementations:

1. **Achievement Sound** - Should play when achievements unlock
   - Add to `js/achievements.js` on achievement unlock
   - Use `audioSystem.playSound('achievement')`

2. **Level Up Sound** - Should play on prestige/ascension
   - Add to prestige completion handler
   - Use `audioSystem.playSound('level_up')`

3. **Error Sound** - Should play on errors
   - Add to error handlers
   - Use `audioSystem.playSound('error')`

4. **Click Sound** - Could be used for button clicks
   - Add to button click handlers
   - Use `audioSystem.playSound('click')`

5. **Ritual Complete Sound** - Currently unused (coven system archived)
   - Will be available when coven system is re-enabled

### Current Usage Issues:

1. **Craft Sound vs Purchase Sound**
   - Both `'craft'` and `'purchase'` are used for crafting
   - Consider standardizing on one sound

2. **Sound Throttling**
   - Cast sound is throttled (good)
   - Other sounds might benefit from throttling if used frequently

3. **Volume Consistency**
   - Some sounds use different volumes than their defaults
   - Consider standardizing volume usage

---

## Summary

**Total Tier 2 Sounds:** 9

**Currently Used:** 4 (cast, purchase, craft, notification)  
**Available but Unused:** 5 (click, achievement, level_up, error, ritual_complete)

**All sounds are:**
- Procedurally generated (no audio files)
- Percussive/drum-like character
- Pentatonic scale (no dissonance)
- Frequency range: G3-C5
- Quick attack, exponential decay

**Tier 2 enables:**
- Sound effects playback
- Volume controls in settings
- Mute toggle
- SFX volume slider

---

**Last Updated:** Current Date  
**File Reference:** `js/audioSystem.js` lines 140-638

