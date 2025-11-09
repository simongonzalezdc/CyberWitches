# Sound Parameters Guide

This document describes all the sound parameters available for adjusting meditation sound effects and how they work.

## Currently Used Parameters

### 1. **Reverb** (Currently Used)
Controls the "room size" and echo effect of sounds.

**Parameters:**
- `roomSize` (0.0 - 1.0): How large the virtual room is
  - `0.0` = No reverb (dry)
  - `1.0` = Maximum reverb (100% wet)
  - **Current**: Meditation mode = `1.0`, Normal mode = `0.65`

- `dampening` (milliseconds): Controls frequency-dependent decay (how quickly high frequencies fade)
  - Lower values (e.g., 2000ms) = High frequencies decay faster (warmer, more muffled reverb)
  - Higher values (e.g., 5000ms) = High frequencies decay slower (brighter, more detailed reverb)
  - This is NOT the overall reverb tail length - it's specifically about high-frequency decay
  - **Current**: Meditation mode = `5000ms` (bright, detailed), Normal mode = `2000ms` (warmer, less bright)

**Location:** `js/audioSystem.js` lines 191-192, 3588-3589

### 2. **Envelope (ADSR)** (Currently Used)
Controls how sounds start, sustain, and fade out.

**Parameters:**
- `attack` (seconds): How quickly the sound reaches full volume
  - `0.001` = Instant (percussive)
  - `0.2` = Gradual (smooth)
  - **Current**: Varies by synth type (0.001 - 0.2)

- `decay` (seconds): How quickly the sound drops from peak to sustain level
  - `0.01` = Very quick (sharp)
  - `0.5` = Gradual (smooth)
  - **Current**: Varies by synth type (0.1 - 0.5)

- `sustain` (0.0 - 1.0): The volume level the sound holds after decay
  - `0.0` = No sustain (percussive)
  - `0.5` = Half volume (sustained)
  - **Current**: Varies by synth type (0.01 - 0.5)

- `release` (seconds): How long the sound takes to fade out after note ends
  - `0.01` = Very short (sharp cutoff)
  - `1.4` = Long tail (lingering)
  - **Current**: Varies by synth type (0.3 - 1.4)

**Location:** `js/audioSystem.js` lines 214-270 (synth definitions)

### 3. **Filter** (Currently Used for Some Synths)
Controls which frequencies are emphasized or cut.

**Parameters:**
- `type`: Filter type
  - `'lowpass'` = Passes low frequencies, cuts highs (warm, muffled)
  - `'highpass'` = Passes high frequencies, cuts lows (bright, thin)
  - `'bandpass'` = Passes a specific frequency range (focused)
  - `'notch'` = Cuts a specific frequency range
  - **Current**: `'highpass'` for sparkle synth, `'bandpass'` for noise

- `frequency` (Hz): The cutoff frequency
  - Lower = More muffled (200-1000 Hz)
  - Higher = More bright (2000-8000 Hz)
  - **Current**: `2000 Hz` for sparkle, `1000 Hz` for noise

- `Q` (quality factor): How sharp the filter is
  - Lower = Gentle slope (0.5 - 2)
  - Higher = Sharp cutoff (4 - 10)
  - **Current**: `2` for both

**Location:** `js/audioSystem.js` lines 252-256, 276-280

### 4. **Oscillator Type** (Currently Used)
The basic waveform shape of the sound.

**Types:**
- `'sine'` = Smooth, pure tone (soft, mellow)
- `'triangle'` = Bright but smooth (clear, bell-like)
- `'square'` = Harsh, buzzy (aggressive)
- `'sawtooth'` = Bright, buzzy (sharp, cutting)
- `'pink'` = Noise (for texture, wind, etc.)
- `'white'` = Harsh noise (for static, etc.)
- **Current**: Varies by synth type

**Location:** `js/audioSystem.js` lines 217-218, 231-232, 244, 262, 274

## Available But Not Currently Used

### 5. **Delay** (Available in Tone.js)
Creates echo/repeat effects.

**Parameters:**
- `delayTime` (seconds): How long before the echo
  - `0.1` = Quick echo (slapback)
  - `0.5` = Medium echo (rhythmic)
  - `1.0` = Long echo (spacious)
  - **Not currently used for sound effects** (only for music)

- `feedback` (0.0 - 1.0): How much echo feeds back into itself
  - `0.0` = Single echo
  - `0.5` = Multiple echoes that fade
  - `1.0` = Infinite feedback (dangerous!)
  - **Not currently used for sound effects**

**Example Usage:**
```javascript
const delay = new Tone.FeedbackDelay({
    delayTime: 0.3,  // 300ms delay
    feedback: 0.2    // 20% feedback
}).connect(sfxOutput);
```

### 6. **Chorus** (Available in Tone.js)
Creates a "thickening" effect by duplicating and slightly detuning the sound.

**Parameters:**
- `frequency` (Hz): Speed of the chorus modulation
  - `1.0` = Slow, gentle
  - `5.0` = Fast, wobbly
- `delayTime` (seconds): Delay between original and chorus
- `depth` (0.0 - 1.0): How much detuning
- `feedback` (0.0 - 1.0): How much chorus feeds back

**Not currently used**

### 7. **Distortion** (Available in Tone.js)
Adds grit and saturation.

**Parameters:**
- `distortion` (0.0 - 1.0): Amount of distortion
  - `0.0` = Clean
  - `0.5` = Slight grit
  - `1.0` = Heavy distortion
- `oversample`: Anti-aliasing quality ('none', '2x', '4x')

**Not currently used**

### 8. **Tremolo** (Available in Tone.js)
Modulates volume up and down.

**Parameters:**
- `frequency` (Hz): Speed of tremolo
- `depth` (0.0 - 1.0): How much volume varies

**Not currently used**

### 9. **Vibrato** (Available in Tone.js)
Modulates pitch up and down.

**Parameters:**
- `frequency` (Hz): Speed of vibrato
- `depth` (0.0 - 1.0): How much pitch varies

**Not currently used**

### 10. **Pitch/Detune** (Available in Tone.js)
Shifts the pitch of sounds.

**Parameters:**
- `detune` (cents): Pitch shift in cents
  - `-100` = One semitone down
  - `0` = No shift
  - `100` = One semitone up
- **Not currently used** (but could be used to create variations)

## Meditation Mode Adjustments

Currently, meditation mode adjusts:
1. **Reverb**: `roomSize = 1.0` (100%), `dampening = 5000ms` (longer decay)
2. **Volume**: Additional 50% reduction when music is playing
3. **Base volume**: Reduced from `0.2` to `0.15` for tower attacks

## Potential Meditation Mode Enhancements

You could add:

1. **Delay** for meditation mode:
   ```javascript
   // Add delay to meditation sound effects
   const delay = new Tone.FeedbackDelay({
       delayTime: 0.4,  // 400ms delay
       feedback: 0.15   // Gentle feedback
   });
   ```

2. **Longer release times** for meditation mode:
   ```javascript
   // Make sounds fade out more slowly in meditation
   envelope: {
       release: isMeditationMode ? 2.0 : 0.3  // Longer tail
   }
   ```

3. **Lower filter frequency** for meditation mode:
   ```javascript
   // Make sounds warmer/more muffled in meditation
   filter: {
       frequency: isMeditationMode ? 1000 : 2000  // Warmer
   }
   ```

4. **Chorus** for meditation mode:
   ```javascript
   // Add thickness to meditation sounds
   const chorus = new Tone.Chorus({
       frequency: 1.5,
       delayTime: 0.02,
       depth: 0.3
   });
   ```

## How to Adjust Parameters

### For Meditation Mode Specifically:

1. **In `initializeToneSynths()`** (around line 152):
   - Check `isMeditationMode` before creating synths
   - Adjust envelope, filter, or other parameters based on mode

2. **In `updateSfxReverbForMeditation()`** (around line 3597):
   - Add delay, chorus, or other effects here
   - Recreate effects when entering/exiting meditation

3. **In sound configuration** (around line 445):
   - Adjust `volume`, `duration`, or `quantization` per sound
   - Add meditation-specific variations

### Example: Adding Delay to Meditation Mode

```javascript
// In initializeToneSynths()
const isMeditationMode = window.meditationState && window.meditationState.activeSession;

if (isMeditationMode) {
    // Create delay for meditation mode
    this.toneSfxDelay = new Tone.FeedbackDelay({
        delayTime: 0.4,  // 400ms delay
        feedback: 0.15    // Gentle feedback
    }).connect(this.toneSfxMaster);
    
    // Connect synths through delay instead of directly to master
    sfxOutput = this.toneSfxDelay;
} else {
    // No delay in normal mode
    sfxOutput = this.toneSfxMaster;
}
```

## Parameter Ranges Summary

| Parameter | Range | Typical Values | Effect |
|-----------|-------|---------------|--------|
| **Reverb roomSize** | 0.0 - 1.0 | 0.65 - 1.0 | Space size |
| **Reverb dampening** | 0 - 10000ms | 2000 - 5000ms | Reverb tail length |
| **Attack** | 0.001 - 1.0s | 0.001 - 0.2s | Attack speed |
| **Decay** | 0.01 - 2.0s | 0.1 - 0.5s | Decay speed |
| **Sustain** | 0.0 - 1.0 | 0.01 - 0.5 | Sustain level |
| **Release** | 0.01 - 5.0s | 0.3 - 2.0s | Fade out time |
| **Filter frequency** | 20 - 20000Hz | 500 - 5000Hz | Brightness |
| **Filter Q** | 0.1 - 20 | 1 - 5 | Filter sharpness |
| **Delay time** | 0.0 - 5.0s | 0.1 - 1.0s | Echo delay |
| **Delay feedback** | 0.0 - 0.9 | 0.1 - 0.3 | Echo repeats |
| **Chorus frequency** | 0.1 - 10Hz | 1 - 5Hz | Chorus speed |
| **Chorus depth** | 0.0 - 1.0 | 0.2 - 0.5 | Chorus amount |
| **Distortion** | 0.0 - 1.0 | 0.1 - 0.5 | Grit amount |

## Recommendations for Meditation Mode

To make meditation sound effects blend better with music:

1. **Increase reverb** ✅ (Already done: 100%)
2. **Add delay** (0.3 - 0.5s delay, 0.1 - 0.2 feedback)
3. **Longer release times** (1.5 - 2.5s instead of 0.3 - 1.4s)
4. **Lower filter frequencies** (1000 - 1500Hz instead of 2000Hz)
5. **Softer attack** (0.05 - 0.1s instead of 0.001s)
6. **Add chorus** (frequency: 1.5Hz, depth: 0.3)

These changes would make meditation sounds more atmospheric and blend better with the ambient music.

