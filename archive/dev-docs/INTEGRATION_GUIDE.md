# Image Integration Guide - 15 Images

This document specifies exactly where and how each of the 15 retro pixel art images will be integrated into the Cyber Witches codebase.

## Integration Overview

Images will be integrated via CSS `background-image` properties or as `<img>` tags where appropriate. All paths should be relative to the project root.

---

## TIER 1: Large Background Scenes (Highest Impact)

### 1. Main Game Background Scene
**File**: `images/backgrounds/main-game-bg.png`  
**Size**: 1920x1080px  
**Integration Point**: Body background

**Location**: `styles.css`  
**Element**: `body` or `body::before`

**CSS Code**:
```css
body {
    background-image: url('../images/backgrounds/main-game-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

/* Or overlay existing gradient */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('../images/backgrounds/main-game-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    opacity: 0.7; /* Adjust to blend with existing gradient */
    z-index: -3;
    pointer-events: none;
}
```

**Note**: May need to adjust existing animated gradient background to blend with image.

---

### 2. Workstations Tab Background
**File**: `images/backgrounds/tab-workstations-bg.png`  
**Size**: 1600x1200px  
**Integration Point**: Workstations tab panel

**Location**: `styles.css`  
**Element**: `#workstations-tab` or `.tab-panel[data-tab="workstations"]`

**CSS Code**:
```css
#workstations-tab.tab-panel.active {
    background-image: url('../images/backgrounds/tab-workstations-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#workstations-tab.tab-panel.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/backgrounds/tab-workstations-bg.png');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 46-48 (workstations tab)

---

### 3. Meditation Canvas Background
**File**: `images/meditation/meditation-canvas-bg.png`  
**Size**: 1200x800px  
**Integration Point**: Meditation canvas container

**Location**: `styles.css`  
**Element**: `.meditation-grid-container` or `#meditation-canvas`

**CSS Code**:
```css
.meditation-grid-container {
    background-image: url('../images/meditation/meditation-canvas-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

/* Or as background for canvas element */
#meditation-canvas {
    background-image: url('../images/meditation/meditation-canvas-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
```

**HTML Location**: `index.html` line 106-107 (meditation canvas)

**Note**: May need to adjust canvas rendering to blend with background.

---

### 4. Inscriptions Tab Background
**File**: `images/backgrounds/tab-inscriptions-bg.png`  
**Size**: 1600x1200px  
**Integration Point**: Inscriptions tab panel

**Location**: `styles.css`  
**Element**: `#inscriptions-tab`

**CSS Code**:
```css
#inscriptions-tab.tab-panel.active {
    background-image: url('../images/backgrounds/tab-inscriptions-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#inscriptions-tab.tab-panel.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/backgrounds/tab-inscriptions-bg.png');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 51-53 (inscriptions tab)

---

### 5. Boons Tab Background
**File**: `images/backgrounds/tab-boons-bg.png`  
**Size**: 1600x1200px  
**Integration Point**: Boons tab panel

**Location**: `styles.css`  
**Element**: `#boons-tab`

**CSS Code**:
```css
#boons-tab.tab-panel.active {
    background-image: url('../images/backgrounds/tab-boons-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#boons-tab.tab-panel.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/backgrounds/tab-boons-bg.png');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 78-83 (boons tab)

---

### 6. Coven Tab Background
**File**: `images/backgrounds/tab-coven-bg.png`  
**Size**: 1600x1200px  
**Integration Point**: Coven tab panel

**Location**: `styles.css`  
**Element**: `#coven-tab`

**CSS Code**:
```css
#coven-tab.tab-panel.active {
    background-image: url('../images/backgrounds/tab-coven-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#coven-tab.tab-panel.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/backgrounds/tab-coven-bg.png');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 73-75 (coven tab)

---

### 7. Experiment Tab Background
**File**: `images/backgrounds/tab-experiment-bg.png`  
**Size**: 1600x1200px  
**Integration Point**: Experiment tab panel

**Location**: `styles.css`  
**Element**: `#experiment-tab`

**CSS Code**:
```css
#experiment-tab.tab-panel.active {
    background-image: url('../images/backgrounds/tab-experiment-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#experiment-tab.tab-panel.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/backgrounds/tab-experiment-bg.png');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 61-65 (experiment tab)

---

## TIER 2: Modal & Scene Images (High Impact, Special Moments)

### 8. Prestige Modal Scene
**File**: `images/modals/prestige-scene.png`  
**Size**: 800x600px  
**Integration Point**: Prestige/Ascend modal

**Location**: `styles.css`  
**Element**: `#prestige-modal .modal-content`

**CSS Code**:
```css
#prestige-modal .modal-content {
    background-image: url('../images/modals/prestige-scene.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#prestige-modal .modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/modals/prestige-scene.png');
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 165-175 (prestige modal)

**Note**: May need to adjust existing glassmorphism background to blend with image.

---

### 9. Welcome Back Modal Scene
**File**: `images/modals/welcome-back-scene.png`  
**Size**: 800x600px  
**Integration Point**: Welcome back modal

**Location**: `styles.css`  
**Element**: `#welcome-back-modal .modal-content`

**CSS Code**:
```css
#welcome-back-modal .modal-content {
    background-image: url('../images/modals/welcome-back-scene.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
}

#welcome-back-modal .modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/modals/welcome-back-scene.png');
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    z-index: -1;
    border-radius: 24px;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 177-184 (welcome back modal)

---

### 10. Achievement Unlock Scene
**File**: `images/achievements/achievement-unlock-scene.png`  
**Size**: 512x512px  
**Integration Point**: Achievement notifications

**Location**: `js/achievements.js` or `js/game.js` - Achievement notification function  
**Function**: Achievement unlock notification display

**JavaScript Code**:
```javascript
// In achievement unlock notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'notification achievement-notification';
    
    const scene = document.createElement('img');
    scene.src = 'images/achievements/achievement-unlock-scene.png';
    scene.className = 'achievement-scene';
    scene.style.width = '256px';
    scene.style.height = '256px';
    scene.alt = 'Achievement Unlocked';
    
    notification.appendChild(scene);
    // ... rest of notification content
}
```

**CSS Code** (add to `styles.css`):
```css
.achievement-notification {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
}

.achievement-scene {
    width: 256px;
    height: 256px;
    object-fit: contain;
    flex-shrink: 0;
}
```

**Alternative**: Use CSS background-image:
```css
.achievement-notification {
    background-image: url('../images/achievements/achievement-unlock-scene.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    padding-left: 280px;
}
```

**Note**: Check `js/achievements.js` for existing notification system.

---

## TIER 3: UI Illustrations (Medium-High Impact)

### 11. Empty State Illustration
**File**: `images/ui/empty-state.png`  
**Size**: 600x400px  
**Integration Point**: Empty lists (workstations, inventory, etc.)

**Location**: `js/game.js` - Empty state handling  
**Function**: Empty list display functions

**JavaScript Code**:
```javascript
// In empty state display function
function showEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const illustration = document.createElement('img');
    illustration.src = 'images/ui/empty-state.png';
    illustration.className = 'empty-state-illustration';
    illustration.style.width = '400px';
    illustration.style.height = 'auto';
    illustration.alt = 'Empty State';
    
    emptyState.appendChild(illustration);
    
    const text = document.createElement('p');
    text.textContent = message;
    text.className = 'empty-state-message';
    
    emptyState.appendChild(text);
    container.appendChild(emptyState);
}
```

**CSS Code** (add to `styles.css`):
```css
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.empty-state-illustration {
    max-width: 400px;
    width: 100%;
    height: auto;
    margin-bottom: 20px;
    opacity: 0.8;
}

.empty-state-message {
    color: var(--text-dim);
    font-size: 18px;
}
```

**Note**: Apply to empty workstation lists, empty inventory, etc.

---

### 12. Experiment Result Illustration
**File**: `images/ui/experiment-result.png`  
**Size**: 512x512px  
**Integration Point**: Experiment result box

**Location**: `js/game.js` - Experiment result display  
**Function**: Experiment result rendering

**JavaScript Code**:
```javascript
// In experiment result display
function showExperimentResult(result) {
    const resultBox = document.getElementById('experiment-result');
    
    const illustration = document.createElement('img');
    illustration.src = 'images/ui/experiment-result.png';
    illustration.className = 'experiment-result-illustration';
    illustration.style.width = '256px';
    illustration.style.height = '256px';
    illustration.alt = 'Experiment Result';
    
    // Add success/failure class
    if (result.success) {
        illustration.classList.add('experiment-success');
    } else {
        illustration.classList.add('experiment-failure');
    }
    
    resultBox.appendChild(illustration);
    // ... rest of result content
}
```

**CSS Code** (add to `styles.css`):
```css
.experiment-result-illustration {
    width: 256px;
    height: 256px;
    object-fit: contain;
    margin: 0 auto 20px;
    display: block;
}

.experiment-result-illustration.experiment-success {
    filter: brightness(1.2);
}

.experiment-result-illustration.experiment-failure {
    filter: brightness(0.7) grayscale(0.3);
}

.result-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
```

**HTML Location**: `index.html` line 63 (experiment result box)

---

### 13. HUD Background Decoration
**File**: `images/backgrounds/hud-bg-pattern.png`  
**Size**: 512x512px (tileable)  
**Integration Point**: HUD top bar

**Location**: `styles.css`  
**Element**: `.hud`

**CSS Code**:
```css
.hud {
    background-image: url('../images/backgrounds/hud-bg-pattern.png');
    background-repeat: repeat;
    background-size: 512px 512px;
    background-position: 0 0;
    background-blend-mode: overlay;
    opacity: 0.2; /* Very subtle */
}

/* Or as overlay */
.hud::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../images/backgrounds/hud-bg-pattern.png');
    background-repeat: repeat;
    background-size: 512px 512px;
    opacity: 0.15;
    z-index: -1;
    pointer-events: none;
}
```

**HTML Location**: `index.html` line 11-22 (HUD)

**Note**: Keep very subtle to not distract from HUD content.

---

## TIER 4: Essential Icons (Frequent Use)

### 14. Cast Button Icon
**File**: `images/ui/cast-button-icon.png`  
**Size**: 64x64px  
**Integration Point**: HUD Cast Button

**Location**: `index.html` and `styles.css`  
**Element**: `#cast-button` or `.btn-cast`

**HTML Code** (modify `index.html` line 19):
```html
<button id="cast-button" class="btn-cast">
    <img src="images/ui/cast-button-icon.png" alt="Cast" class="cast-icon" style="width: 32px; height: 32px; margin-right: 8px; vertical-align: middle;">
    <span class="css-icon-sparkle"></span> Cast
</button>
```

**CSS Code** (add to `styles.css`):
```css
.cast-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
    margin-right: 8px;
}

.btn-cast {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
```

**Alternative**: Use CSS background-image:
```css
.btn-cast {
    background-image: url('../images/ui/cast-button-icon.png');
    background-repeat: no-repeat;
    background-position: left center;
    background-size: 32px 32px;
    padding-left: 50px;
}
```

---

### 15. Workstation Card Icon
**File**: `images/ui/workstation-card-icon.png`  
**Size**: 80x80px  
**Integration Point**: Workstation cards

**Location**: `js/game.js` - Workstation card rendering function  
**Function**: `updateWorkstationsTab()` or workstation card creation

**JavaScript Code** (in workstation card creation):
```javascript
// In the function that creates workstation cards
function createWorkstationCard(workstation) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const icon = document.createElement('img');
    icon.src = 'images/ui/workstation-card-icon.png';
    icon.className = 'workstation-card-icon';
    icon.style.width = '64px';
    icon.style.height = '64px';
    icon.alt = 'Workstation';
    
    card.appendChild(icon);
    // ... rest of card content
}
```

**CSS Code** (add to `styles.css`):
```css
.workstation-card-icon {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin-right: 12px;
    flex-shrink: 0;
}

.card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}
```

**Note**: This will be used on all workstation cards.

---

## Implementation Checklist

### Step 1: Add Images to Project
- [ ] Place all 15 images in their respective folders
- [ ] Verify image file names match exactly
- [ ] Verify image sizes are correct

### Step 2: CSS Integration (Background Images)
- [ ] Main game background (body)
- [ ] All 6 tab backgrounds (workstations, inscriptions, boons, coven, experiment)
- [ ] Meditation canvas background
- [ ] Prestige modal background
- [ ] Welcome back modal background
- [ ] HUD background pattern

### Step 3: HTML Integration
- [ ] Cast button icon (add `<img>` tag)
- [ ] Verify all modal structures are correct

### Step 4: JavaScript Integration
- [ ] Achievement unlock scene (achievement notifications)
- [ ] Empty state illustration (empty lists)
- [ ] Experiment result illustration (experiment results)
- [ ] Workstation card icon (workstation cards)

### Step 5: Testing
- [ ] Test all images load correctly
- [ ] Verify images display at correct sizes
- [ ] Check responsive behavior on mobile devices
- [ ] Verify images don't break existing layout
- [ ] Test opacity and blending modes
- [ ] Verify transparent backgrounds work correctly
- [ ] Test tab switching with backgrounds
- [ ] Test modal displays with backgrounds

### Step 6: Optimization
- [ ] Optimize image file sizes for web
- [ ] Verify images work with design tier system (tier 0-4)
- [ ] Test fallbacks if images fail to load
- [ ] Verify performance with large background images

---

## File Paths Reference

All image paths should be relative to the project root:
- `images/backgrounds/main-game-bg.png`
- `images/backgrounds/tab-workstations-bg.png`
- `images/backgrounds/tab-inscriptions-bg.png`
- `images/backgrounds/tab-boons-bg.png`
- `images/backgrounds/tab-coven-bg.png`
- `images/backgrounds/tab-experiment-bg.png`
- `images/backgrounds/hud-bg-pattern.png`
- `images/meditation/meditation-canvas-bg.png`
- `images/modals/prestige-scene.png`
- `images/modals/welcome-back-scene.png`
- `images/achievements/achievement-unlock-scene.png`
- `images/ui/empty-state.png`
- `images/ui/experiment-result.png`
- `images/ui/cast-button-icon.png`
- `images/ui/workstation-card-icon.png`

---

## Design Tier Considerations

The design tier system (Tier 0-4) may affect image visibility:
- **Tier 0-2**: May need to disable or reduce image opacity
- **Tier 3-4**: Full image display with all effects

Consider adding CSS rules like:
```css
body.tier-0 .tab-panel,
body.tier-1 .tab-panel,
body.tier-2 .tab-panel {
    background-image: none !important;
}

body.tier-0 img,
body.tier-1 img,
body.tier-2 img {
    display: none !important;
}
```

---

## Notes

1. **Image Loading**: Consider using lazy loading for images that aren't immediately visible
2. **Fallbacks**: Provide fallbacks (CSS or alt text) if images fail to load
3. **Performance**: Optimize images for web (use tools like TinyPNG or ImageOptim)
4. **Accessibility**: Ensure all images have appropriate alt text
5. **Responsive**: Test images at different screen sizes and adjust sizes accordingly
6. **Browser Compatibility**: Test background-image and background-size properties across browsers
7. **Blending**: Adjust `background-blend-mode` and `opacity` to achieve desired visual effect
8. **Z-index**: Ensure proper layering with existing UI elements
