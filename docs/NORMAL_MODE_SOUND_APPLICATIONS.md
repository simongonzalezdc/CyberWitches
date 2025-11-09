# Normal Mode Sound Applications

This document describes potential sound parameter applications for **normal mode** (non-meditation gameplay).

## Current Normal Mode Settings

- **Reverb**: 65% room size, 2000ms dampening
- **Envelope**: Sharp attack (0.001s), shorter release (0.3-1.4s)
- **Filter**: Higher frequencies (2000Hz), bright sound
- **Effects**: Just reverb, no delay or chorus

## Potential Normal Mode Enhancements

### 1. **Punchy, Responsive Sounds** (Current Approach)
**Goal**: Make sounds feel immediate and satisfying

**Parameters:**
- **Attack**: 0.001s (instant) ✅ Current
- **Release**: 0.3-1.4s (short to medium) ✅ Current
- **Filter**: Highpass 2000Hz (bright) ✅ Current
- **Reverb**: 65% (moderate space) ✅ Current

**Use Cases:**
- Click sounds
- Purchase confirmations
- Achievement unlocks
- Level up notifications

**Why it works:**
- Instant attack = immediate feedback
- Short release = doesn't linger
- Bright filter = cuts through music
- Moderate reverb = adds space without muddiness

### 2. **Add Subtle Delay for Rhythm** (New Enhancement)
**Goal**: Make sounds feel more musical and rhythmic

**Parameters:**
- **Delay time**: 0.15-0.25s (short, rhythmic)
- **Feedback**: 0.1-0.2 (gentle echo)
- **Wet/Dry**: 0.2-0.3 (mostly dry, subtle echo)

**Use Cases:**
- Achievement sounds
- Level up sounds
- Major purchase confirmations
- Prestige sounds

**Why it works:**
- Short delay = rhythmic echo that matches music
- Low feedback = doesn't overwhelm
- Subtle mix = adds depth without distraction

**Example:**
```javascript
// Add subtle delay for important sounds
const subtleDelay = new Tone.FeedbackDelay({
    delayTime: 0.2,  // 200ms - matches 16th note at 120 BPM
    feedback: 0.15   // Gentle echo
});
```

### 3. **Add Compression for Consistency** (New Enhancement)
**Goal**: Make all sounds feel consistent in volume

**Parameters:**
- **Threshold**: -20 dB
- **Ratio**: 3:1
- **Attack**: 0.01s
- **Release**: 0.1s

**Use Cases:**
- All sound effects
- Prevents loud sounds from overwhelming quiet ones

**Why it works:**
- Compression = consistent volume levels
- Prevents ear fatigue
- Makes mix feel more professional

### 4. **Add Subtle Distortion for Grit** (New Enhancement)
**Goal**: Add character to certain sounds

**Parameters:**
- **Distortion**: 0.1-0.3 (subtle)
- **Oversample**: '2x' (prevents aliasing)

**Use Cases:**
- Purchase sounds (adds "spending" character)
- Upgrade sounds (adds "power" feeling)
- Prestige sounds (adds "transformation" feeling)

**Why it works:**
- Subtle distortion = adds character without harshness
- Makes sounds feel more "gamey" and satisfying
- Adds weight to important actions

**Example:**
```javascript
// Add subtle distortion for purchase sounds
const purchaseDistortion = new Tone.Distortion({
    distortion: 0.2,  // Subtle grit
    oversample: '2x'
});
```

### 5. **Add Tremolo for Pulsing Effects** (New Enhancement)
**Goal**: Make certain sounds feel alive and pulsing

**Parameters:**
- **Frequency**: 3-5 Hz (moderate speed)
- **Depth**: 0.2-0.4 (subtle to moderate)

**Use Cases:**
- Achievement sounds (pulsing celebration)
- Level up sounds (pulsing growth)
- Prestige sounds (pulsing transformation)

**Why it works:**
- Tremolo = adds movement and life
- Makes sounds feel more dynamic
- Creates excitement without being overwhelming

**Example:**
```javascript
// Add tremolo for achievement sounds
const achievementTremolo = new Tone.Tremolo({
    frequency: 4,    // 4 Hz - moderate speed
    depth: 0.3       // 30% depth - subtle pulsing
});
```

### 6. **Add Vibrato for Melodic Sounds** (New Enhancement)
**Goal**: Make melodic sounds feel more expressive

**Parameters:**
- **Frequency**: 5-7 Hz (moderate speed)
- **Depth**: 0.1-0.2 (subtle)

**Use Cases:**
- Achievement sounds
- Level up sounds
- Prestige sounds
- Any melodic/chord-based sounds

**Why it works:**
- Vibrato = adds expressiveness
- Makes sounds feel more musical
- Adds character without being distracting

**Example:**
```javascript
// Add vibrato to melodic synths
const melodicVibrato = new Tone.Vibrato({
    frequency: 6,    // 6 Hz - moderate speed
    depth: 0.15      // 15% depth - subtle
});
```

### 7. **Add High-Pass Filter for Clarity** (Enhancement)
**Goal**: Make sounds cut through the mix better

**Parameters:**
- **Frequency**: 200-500 Hz (cuts low mud)
- **Q**: 1-2 (gentle slope)

**Use Cases:**
- All sound effects (master filter)
- Prevents low-end buildup
- Makes mix cleaner

**Why it works:**
- High-pass = removes low-end mud
- Makes sounds feel cleaner
- Prevents frequency conflicts with music

### 8. **Add EQ for Frequency Shaping** (New Enhancement)
**Goal**: Shape the frequency response of sounds

**Parameters:**
- **Low shelf**: +2 dB at 200 Hz (adds warmth)
- **Mid boost**: +3 dB at 2000 Hz (adds presence)
- **High shelf**: -1 dB at 8000 Hz (reduces harshness)

**Use Cases:**
- All sound effects (master EQ)
- Shapes overall sound character
- Makes sounds feel more polished

**Why it works:**
- EQ = shapes frequency response
- Adds warmth and presence
- Reduces harshness

## Recommended Normal Mode Setup

### For Immediate, Punchy Sounds (Current):
- ✅ Sharp attack (0.001s)
- ✅ Short release (0.3-1.4s)
- ✅ Bright filter (2000Hz)
- ✅ Moderate reverb (65%)

### For Musical, Rhythmic Sounds (Enhancement):
- ✅ Add subtle delay (0.2s, 0.15 feedback)
- ✅ Add compression (consistent volume)
- ✅ Add high-pass filter (200-500Hz)

### For Character, Weight (Enhancement):
- ✅ Add subtle distortion (0.2) for purchases/upgrades
- ✅ Add tremolo (4 Hz, 0.3 depth) for achievements
- ✅ Add vibrato (6 Hz, 0.15 depth) for melodic sounds

### For Polish, Clarity (Enhancement):
- ✅ Add EQ (warmth + presence)
- ✅ Add compression (consistency)
- ✅ Add high-pass filter (clarity)

## Implementation Priority

### High Priority (Immediate Impact):
1. **Subtle delay** for important sounds (achievements, level ups)
2. **Compression** for consistency
3. **High-pass filter** for clarity

### Medium Priority (Nice to Have):
4. **Subtle distortion** for purchases/upgrades
5. **Tremolo** for achievements
6. **Vibrato** for melodic sounds

### Low Priority (Polish):
7. **EQ** for frequency shaping
8. **Advanced routing** for different sound types

## Example Normal Mode Chain

```
Synth → High-Pass Filter → Compression → [Optional: Distortion/Tremolo/Vibrato] → Delay → Reverb → Master
```

**Benefits:**
- High-pass = clarity
- Compression = consistency
- Optional effects = character
- Delay = rhythm
- Reverb = space

## Comparison: Meditation vs Normal Mode

| Parameter | Meditation Mode | Normal Mode |
|-----------|----------------|-------------|
| **Reverb** | 100% (1.0) | 65% (0.65) |
| **Dampening** | 5000ms | 2000ms |
| **Delay** | ✅ 400ms, 0.15 feedback | ❌ None (or 200ms for important sounds) |
| **Chorus** | ✅ 1.5 Hz, 0.3 depth | ❌ None |
| **Attack** | 0.05s (soft) | 0.001s (sharp) |
| **Release** | 1.5-2.5s (long) | 0.3-1.4s (short) |
| **Filter** | 1200Hz (warm) | 2000Hz (bright) |
| **Goal** | Blend with music | Cut through music |

## Summary

**Meditation Mode**: Atmospheric, blended, ambient
- Long tails, warm tones, effects chain (chorus → delay → reverb)

**Normal Mode**: Punchy, immediate, clear
- Sharp attacks, bright tones, minimal effects (just reverb, maybe subtle delay)

Both modes serve different purposes:
- **Meditation** = immersive, atmospheric experience
- **Normal** = responsive, satisfying feedback

