# Glitch Effects - Design Tier Classification

## Design Tier System Overview
- **Tier 0**: Monochrome, no animations, CLI-like, minimal
- **Tier 1**: Basic colors, CLI-like, no animations
- **Tier 2**: Colors + Sound effects, CLI-like, no animations
- **Tier 3**: Full animations, sound effects, no music
- **Tier 4**: Perfect, music enabled, all effects smooth

---

## Glitch Effects by Tier Compatibility

### 1. **Screen Tearing / Horizontal Glitch Lines**
**Compatibility**: ✅ Tier 0, 1, 2, 3 | ❌ Tier 4

**Rationale**:
- Works in monochrome (Tier 0) - can be white/black lines
- Gets colored at Tier 1+
- Represents system instability
- Should be gone by Tier 4 (perfect stability)

**Progression**:
- **Tier 0**: Heavy, frequent, monochrome
- **Tier 1**: Heavy, frequent, colored
- **Tier 2**: Moderate, less frequent
- **Tier 3**: Light, rare
- **Tier 4**: None

---

### 2. **Chromatic Aberration (RGB Channel Separation)**
**Compatibility**: ❌ Tier 0 | ✅ Tier 1, 2, 3 | ❌ Tier 4

**Rationale**:
- Requires color (Tier 0 is monochrome)
- Perfect for Tier 1+ when colors are introduced
- Represents color corruption/instability
- Should be gone by Tier 4

**Progression**:
- **Tier 0**: None (monochrome)
- **Tier 1**: Heavy (2-3px offset)
- **Tier 2**: Moderate (1px offset)
- **Tier 3**: Light (0.5px offset)
- **Tier 4**: None

---

### 3. **Scanlines (CRT Monitor Effect)**
**Compatibility**: ✅ Tier 0, 1, 2, 3 | ❌ Tier 4

**Rationale**:
- Works in monochrome (Tier 0)
- Classic glitch effect
- Represents old/glitchy display
- Should be gone by Tier 4

**Progression**:
- **Tier 0**: Heavy, flickering, monochrome
- **Tier 1**: Heavy, flickering, colored
- **Tier 2**: Moderate
- **Tier 3**: Light
- **Tier 4**: None

---

### 4. **Text Corruption / Character Flicker**
**Compatibility**: ✅ Tier 0, 1 | ❌ Tier 2, 3, 4

**Rationale**:
- Works in monochrome (Tier 0)
- Very noticeable glitch
- Should be gone by Tier 2 (too distracting for mid-game)
- Represents data corruption

**Progression**:
- **Tier 0**: Heavy corruption, random characters
- **Tier 1**: Light flicker, occasional corruption
- **Tier 2+**: None (too distracting)

---

### 5. **Position Jitter (Micro-shifts)**
**Compatibility**: ✅ Tier 0, 1 | ⚠️ Tier 2 (very light) | ❌ Tier 3, 4

**Rationale**:
- Works in monochrome (Tier 0)
- Creates sense of instability
- Should be gone by Tier 3 (too distracting with animations)
- Can be very subtle at Tier 2

**Progression**:
- **Tier 0**: Heavy jitter (1-2px)
- **Tier 1**: Moderate jitter (1px)
- **Tier 2**: Very light jitter (0.5px, optional)
- **Tier 3+**: None

---

### 6. **Opacity Flicker**
**Compatibility**: ✅ Tier 0, 1 | ❌ Tier 2, 3, 4

**Rationale**:
- Works in monochrome (Tier 0)
- Creates sense of instability
- Should be gone by Tier 2 (too distracting)
- Represents display instability

**Progression**:
- **Tier 0**: Heavy flicker (opacity 0.7-1.0)
- **Tier 1**: Light flicker (opacity 0.9-1.0)
- **Tier 2+**: None

---

### 7. **Distortion Waves**
**Compatibility**: ✅ Tier 0, 1 | ⚠️ Tier 2 (very subtle) | ❌ Tier 3, 4

**Rationale**:
- Works in monochrome (Tier 0)
- Subtle effect on borders
- Should be gone by Tier 3 (conflicts with smooth animations)
- Can be very subtle at Tier 2

**Progression**:
- **Tier 0**: Moderate distortion
- **Tier 1**: Light distortion
- **Tier 2**: Very subtle (optional)
- **Tier 3+**: None

---

### 8. **Glitchy Gradient (Fading Theme)**
**Compatibility**: ❌ Tier 0, 1 | ✅ Tier 2 | ❌ Tier 3, 4

**Rationale**:
- Tier 0 is monochrome (no gradient)
- Tier 1 introduces colors but gradient is not yet stable enough to appear
- Perfect for Tier 2 when gradient is introduced but still unstable
- Should be smooth by Tier 3 (current implementation)
- Represents magic instability

**Progression**:
- **Tier 0**: None (monochrome)
- **Tier 1**: None (colors introduced but gradient not yet stable)
- **Tier 2**: Heavy glitchy gradient (color corruption, artifacts) - First appearance
- **Tier 3**: Moderate glitchy gradient (smoother but still has artifacts)
- **Tier 4**: Smooth gradient (enhanced smoothness)

---

## Summary Table

| Effect | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|--------|--------|--------|--------|--------|
| **Screen Tearing** | ✅ Heavy | ✅ Heavy | ✅ Moderate | ✅ Light | ❌ None |
| **Chromatic Aberration** | ❌ None | ✅ Heavy | ✅ Moderate | ✅ Light | ❌ None |
| **Scanlines** | ✅ Heavy | ✅ Heavy | ✅ Moderate | ✅ Light | ❌ None |
| **Text Corruption** | ✅ Heavy | ✅ Light | ❌ None | ❌ None | ❌ None |
| **Position Jitter** | ✅ Heavy | ✅ Moderate | ⚠️ Very Light | ❌ None | ❌ None |
| **Opacity Flicker** | ✅ Heavy | ✅ Light | ❌ None | ❌ None | ❌ None |
| **Distortion Waves** | ✅ Moderate | ✅ Light | ⚠️ Very Subtle | ❌ None | ❌ None |
| **Glitchy Gradient** | ❌ None | ❌ None | ✅ Heavy | ✅ Moderate | ❌ Smooth |

---

## Recommended Tier Distribution

### **Tier 0 (Maximum Glitch)**
- Screen Tearing (Heavy, monochrome)
- Scanlines (Heavy, monochrome)
- Text Corruption (Heavy)
- Position Jitter (Heavy)
- Opacity Flicker (Heavy)
- Distortion Waves (Moderate)
- **No gradient** (monochrome)

### **Tier 1 (Heavy Glitch)**
- Screen Tearing (Heavy, colored)
- Chromatic Aberration (Heavy) ⭐ NEW
- Scanlines (Heavy, colored)
- Text Corruption (Light)
- Position Jitter (Moderate)
- Opacity Flicker (Light)
- Distortion Waves (Light)
- **ZERO GRADIENTS** (colors introduced but no gradients appear - system too unstable)

### **Tier 2 (Moderate Glitch)**
- Screen Tearing (Moderate)
- Chromatic Aberration (Moderate)
- Scanlines (Moderate)
- **Glitchy Gradient** (Heavy) ⭐ NEW - First appearance
- Position Jitter (Very Light, optional)
- Distortion Waves (Very Subtle, optional)

### **Tier 3 (Light Glitch)**
- Screen Tearing (Light, rare)
- Chromatic Aberration (Light)
- Scanlines (Light)
- **Moderate Glitchy Gradient** (smoother but still has artifacts)

### **Tier 4 (Perfect)**
- All glitches removed
- **Smooth Gradient** (current implementation - perfect smoothness)

---

## Notes

- **Tier 0-1**: Maximum glitch effects (system is very unstable)
- **Tier 2**: Moderate glitch (system stabilizing)
- **Tier 3**: Light glitch (system mostly stable)
- **Tier 4**: Perfect (system fully stable)

- Effects marked with ⚠️ are optional and can be skipped if too distracting
- Effects should progressively reduce in intensity and frequency
- All effects are CSS-only for performance

