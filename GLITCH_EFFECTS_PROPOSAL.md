# Glitch Effects Proposal - Progressive UI Stabilization

## Concept
The UI starts heavily glitched at Tier 0 and progressively stabilizes until it's perfect at Tier 4. This represents the "fading magic" theme - as you preserve more magic, the UI becomes more stable.

## Proposed Glitch Artifacts (CSS-Based, Low Resource)

### 1. **Screen Tearing / Horizontal Glitch Lines** ⭐ Recommended
- **Tier 0-1**: Heavy horizontal lines that randomly shift
- **Tier 2**: Moderate tearing, less frequent
- **Tier 3**: Light tearing, rare
- **Tier 4**: None
- **Implementation**: CSS `::before` pseudo-element with `clip-path` and random `transform: translateX()`
- **Resource**: Very low (CSS only)

### 2. **Chromatic Aberration (RGB Channel Separation)** ⭐ Recommended
- **Tier 0-1**: Strong RGB channel offset (2-3px)
- **Tier 2**: Moderate offset (1px)
- **Tier 3**: Light offset (0.5px)
- **Tier 4**: None
- **Implementation**: CSS `filter: drop-shadow()` with multiple offsets
- **Resource**: Low (CSS filter)

### 3. **Scanlines (CRT Monitor Effect)**
- **Tier 0-1**: Heavy scanlines, flickering
- **Tier 2**: Moderate scanlines
- **Tier 3**: Light scanlines
- **Tier 4**: None
- **Implementation**: CSS `linear-gradient` overlay with `::after` pseudo-element
- **Resource**: Very low (CSS only)

### 4. **Text Corruption / Character Flicker**
- **Tier 0**: Random character corruption (using CSS `text-shadow` with random offsets)
- **Tier 1**: Light flicker on text
- **Tier 2+**: None
- **Implementation**: CSS `animation` with `text-shadow` variations
- **Resource**: Low (CSS animation)

### 5. **Position Jitter (Micro-shifts)**
- **Tier 0-1**: Elements randomly shift 1-2px
- **Tier 2**: Very light jitter (0.5px)
- **Tier 3+**: None
- **Implementation**: CSS `transform: translate()` with animation
- **Resource**: Low (CSS transform)

### 6. **Opacity Flicker**
- **Tier 0**: Heavy flicker (opacity 0.7-1.0)
- **Tier 1**: Light flicker (opacity 0.9-1.0)
- **Tier 2+**: None
- **Implementation**: CSS `animation` with `opacity` keyframes
- **Resource**: Very low (CSS animation)

### 7. **Distortion Waves**
- **Tier 0-1**: Subtle wave distortion on borders
- **Tier 2+**: None
- **Implementation**: CSS `clip-path` with wave pattern
- **Resource**: Low (CSS clip-path)

### 8. **Glitchy Gradient (Fading Theme)**
- **Tier 0**: No gradient (monochrome)
- **Tier 1**: **Glitchy, broken gradient** with artifacts and color corruption
- **Tier 2**: Still glitchy but smoother transitions
- **Tier 3**: Smooth gradient (current implementation)
- **Tier 4**: Perfect gradient with enhanced smoothness
- **Implementation**: CSS `background` with `linear-gradient` + `filter: hue-rotate()` for glitch effect
- **Resource**: Very low (CSS only)

## Recommended Implementation (Top 3)

### Priority 1: **Chromatic Aberration** (Most Visible, Low Cost)
- Strong visual impact
- Pure CSS (very performant)
- Fits cyberpunk theme perfectly

### Priority 2: **Screen Tearing** (High Impact, Low Cost)
- Very noticeable glitch effect
- Pure CSS with pseudo-elements
- Creates sense of instability

### Priority 3: **Glitchy Gradient** (Theme Integration)
- Replaces current smooth gradient at Tier 1
- Shows progression from broken → perfect
- Integrates with fading theme

## Tier Progression

### Tier 0: Maximum Glitch
- Heavy chromatic aberration (3px offset)
- Heavy screen tearing
- Text corruption
- Opacity flicker
- Position jitter
- **No gradient** (monochrome)

### Tier 1: Heavy Glitch
- Moderate chromatic aberration (2px offset)
- Moderate screen tearing
- Light text flicker
- Light opacity flicker
- Light position jitter
- **Glitchy, broken gradient** (color corruption, artifacts)

### Tier 2: Moderate Glitch
- Light chromatic aberration (1px offset)
- Light screen tearing
- **Glitchy gradient** (smoother but still has artifacts)

### Tier 3: Light Glitch
- Very light chromatic aberration (0.5px offset)
- Rare screen tearing
- **Smooth gradient** (current implementation)

### Tier 4: Perfect
- No glitches
- **Perfect gradient** (enhanced smoothness)

## CSS Implementation Strategy

All effects use CSS only (no JavaScript calculations):
- Use `::before` and `::after` pseudo-elements for overlays
- Use CSS `animation` with `@keyframes` for glitch patterns
- Use CSS `filter` for chromatic aberration
- Use CSS `clip-path` for screen tearing
- Use CSS variables for tier-based intensity control

## Performance Considerations

- All effects are CSS-based (GPU accelerated)
- Use `will-change` property for animated elements
- Use `transform` and `opacity` (compositor-friendly properties)
- Avoid `width`, `height`, `top`, `left` animations
- Use `contain: layout style paint` where possible

## Example CSS Structure

```css
/* Tier 0 - Maximum Glitch */
body.tier-0::before {
    /* Screen tearing overlay */
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255, 0, 0, 0.1) 2px,
        rgba(255, 0, 0, 0.1) 4px
    );
    animation: screenTear 0.1s infinite;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: screen;
}

body.tier-0 * {
    /* Chromatic aberration */
    filter: drop-shadow(2px 0 0 rgba(255, 0, 0, 0.5))
            drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.5));
    animation: chromaticAberration 0.3s infinite;
}

/* Progressive reduction per tier */
body.tier-1 * {
    filter: drop-shadow(1px 0 0 rgba(255, 0, 0, 0.3))
            drop-shadow(-1px 0 0 rgba(0, 255, 255, 0.3));
}

body.tier-2 * {
    filter: drop-shadow(0.5px 0 0 rgba(255, 0, 0, 0.2))
            drop-shadow(-0.5px 0 0 rgba(0, 255, 255, 0.2));
}

body.tier-3 * {
    filter: drop-shadow(0.25px 0 0 rgba(255, 0, 0, 0.1))
            drop-shadow(-0.25px 0 0 rgba(0, 255, 255, 0.1));
}

body.tier-4 * {
    filter: none; /* Perfect */
}
```

## Glitchy Gradient Implementation

```css
/* Tier 1 - Glitchy Gradient */
body.tier-1 .fading-theme-overlay {
    background: linear-gradient(
        180deg,
        rgba(108, 92, 231, 0.15) 0%,
        rgba(255, 0, 0, 0.1) 25%,  /* Red corruption */
        rgba(108, 92, 231, 0.1) 30%,
        rgba(0, 255, 255, 0.1) 50%, /* Cyan corruption */
        rgba(108, 92, 231, 0.05) 70%,
        rgba(26, 26, 46, 0.2) 100%
    );
    animation: glitchGradient 2s infinite;
    filter: hue-rotate(0deg);
}

@keyframes glitchGradient {
    0%, 100% {
        filter: hue-rotate(0deg);
        background-position: 0% 0%;
    }
    25% {
        filter: hue-rotate(10deg);
        background-position: 2% 0%;
    }
    50% {
        filter: hue-rotate(-10deg);
        background-position: -2% 0%;
    }
    75% {
        filter: hue-rotate(5deg);
        background-position: 1% 0%;
    }
}

/* Tier 2 - Smoother but still glitchy */
body.tier-2 .fading-theme-overlay {
    animation: glitchGradient 4s infinite;
    /* Less color corruption */
}

/* Tier 3 - Smooth (current) */
body.tier-3 .fading-theme-overlay {
    animation: fadeShift 60s ease-in-out infinite;
    /* Current smooth gradient */
}

/* Tier 4 - Perfect */
body.tier-4 .fading-theme-overlay {
    animation: fadeShift 60s ease-in-out infinite;
    /* Enhanced smoothness */
}
```

