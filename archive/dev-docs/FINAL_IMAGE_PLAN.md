# Top 15 Most Impactful Images - Final Plan

This plan prioritizes visual impact, focusing on larger atmospheric scenes and essential UI elements.

## Standardized Generation Size

**ALL images should be generated at 2048x2048 pixels (square format).**

After generation, images will be cropped/resized to their final display sizes. This standardized approach makes generation easier and allows flexible cropping for different aspect ratios.

## Image Categories by Impact

### Tier 1: Large Background Scenes (Highest Impact)
These are full-section backgrounds that players see constantly.

1. **Main Game Background Scene** (Generate: 2048x2048px → Display: 1920x1080px)
   - Full-screen background for entire game
   - Sets complete game atmosphere
   - Always visible

2. **Workstations Tab Background** (Generate: 2048x2048px → Display: 1600x1200px)
   - Background for workstations tab panel
   - Players spend most time here
   - Large visual area

3. **Meditation Canvas Background** (Generate: 2048x2048px → Display: 1200x800px)
   - Background for meditation minigame canvas
   - Large gameplay area
   - Important mechanic

4. **Inscriptions Tab Background** (Generate: 2048x2048px → Display: 1600x1200px)
   - Background for inscriptions/upgrades tab
   - Major progression section
   - Frequently viewed

5. **Boons Tab Background** (Generate: 2048x2048px → Display: 1600x1200px)
   - Background for prestige/boons tab
   - Major milestone section
   - Important progression area

6. **Coven Tab Background** (Generate: 2048x2048px → Display: 1600x1200px)
   - Background for coven/social tab
   - Community feature area
   - Atmospheric setting

7. **Experiment Tab Background** (Generate: 2048x2048px → Display: 1600x1200px)
   - Background for experiment tab
   - Important gameplay mechanic
   - Discovery/creation area

### Tier 2: Modal & Scene Images (High Impact, Special Moments)

8. **Prestige Modal Scene** (Generate: 2048x2048px → Display: 800x600px)
   - Background for prestige/ascend modal
   - Major milestone celebration
   - Epic ascension scene

9. **Welcome Back Modal Scene** (Generate: 2048x2048px → Display: 800x600px)
   - Background for welcome back modal
   - First thing players see on return
   - Engaging return experience

10. **Achievement Unlock Scene** (Generate: 2048x2048px → Display: 512x512px)
    - Celebration scene for achievements
    - Reward moment
    - Celebratory atmosphere

### Tier 3: UI Illustrations (Medium-High Impact)

11. **Empty State Illustration** (Generate: 2048x2048px → Display: 600x400px)
    - Shows when lists are empty
    - Explains game state
    - Helpful placeholder

12. **Experiment Result Illustration** (Generate: 2048x2048px → Display: 512x512px)
    - Shows experiment success/failure
    - Visual feedback for experiments
    - Discovery moment

13. **HUD Background Decoration** (Generate: 2048x2048px → Display: 512x512px, tileable)
    - Subtle pattern for HUD area
    - Always visible top bar
    - Sets UI atmosphere

### Tier 4: Essential Icons (Frequent Use)

14. **Cast Button Icon** (Generate: 2048x2048px → Display: 64x64px)
    - Primary action button icon
    - Always visible in HUD
    - Most clicked element

15. **Workstation Card Icon** (Generate: 2048x2048px → Display: 80x80px)
    - Icon for workstation cards
    - Used on all workstation cards
    - Most viewed UI element

## Complete Image List

| # | Image Name | Generate Size | Final Display Size | Location | Impact | Priority |
|---|------------|---------------|-------------------|----------|--------|----------|
| 1 | Main Game Background | 2048x2048 | 1920x1080 | Body background | Highest | Tier 1 |
| 2 | Workstations Tab Background | 2048x2048 | 1600x1200 | Workstations tab | Highest | Tier 1 |
| 3 | Meditation Canvas Background | 2048x2048 | 1200x800 | Meditation canvas | Highest | Tier 1 |
| 4 | Inscriptions Tab Background | 2048x2048 | 1600x1200 | Inscriptions tab | Highest | Tier 1 |
| 5 | Boons Tab Background | 2048x2048 | 1600x1200 | Boons tab | Highest | Tier 1 |
| 6 | Coven Tab Background | 2048x2048 | 1600x1200 | Coven tab | Highest | Tier 1 |
| 7 | Experiment Tab Background | 2048x2048 | 1600x1200 | Experiment tab | Highest | Tier 1 |
| 8 | Prestige Modal Scene | 2048x2048 | 800x600 | Prestige modal | High | Tier 2 |
| 9 | Welcome Back Modal Scene | 2048x2048 | 800x600 | Welcome modal | High | Tier 2 |
| 10 | Achievement Unlock Scene | 2048x2048 | 512x512 | Achievement notifications | High | Tier 2 |
| 11 | Empty State Illustration | 2048x2048 | 600x400 | Empty lists | Medium-High | Tier 3 |
| 12 | Experiment Result Illustration | 2048x2048 | 512x512 | Experiment results | Medium-High | Tier 3 |
| 13 | HUD Background Decoration | 2048x2048 | 512x512 | HUD top bar | Medium-High | Tier 3 |
| 14 | Cast Button Icon | 2048x2048 | 64x64 | Cast button | Medium | Tier 4 |
| 15 | Workstation Card Icon | 2048x2048 | 80x80 | Workstation cards | Medium | Tier 4 |

## Folder Structure

```
images/
├── backgrounds/
│   ├── main-game-bg.png              (Generate: 2048x2048 → Display: 1920x1080)
│   ├── tab-workstations-bg.png       (Generate: 2048x2048 → Display: 1600x1200)
│   ├── tab-inscriptions-bg.png        (Generate: 2048x2048 → Display: 1600x1200)
│   ├── tab-boons-bg.png               (Generate: 2048x2048 → Display: 1600x1200)
│   ├── tab-coven-bg.png               (Generate: 2048x2048 → Display: 1600x1200)
│   ├── tab-experiment-bg.png          (Generate: 2048x2048 → Display: 1600x1200)
│   └── hud-bg-pattern.png             (Generate: 2048x2048 → Display: 512x512, tileable)
├── meditation/
│   └── meditation-canvas-bg.png       (Generate: 2048x2048 → Display: 1200x800)
├── modals/
│   ├── prestige-scene.png             (Generate: 2048x2048 → Display: 800x600)
│   └── welcome-back-scene.png         (Generate: 2048x2048 → Display: 800x600)
├── achievements/
│   └── achievement-unlock-scene.png   (Generate: 2048x2048 → Display: 512x512)
└── ui/
    ├── empty-state.png                 (Generate: 2048x2048 → Display: 600x400)
    ├── experiment-result.png           (Generate: 2048x2048 → Display: 512x512)
    ├── cast-button-icon.png            (Generate: 2048x2048 → Display: 64x64)
    └── workstation-card-icon.png       (Generate: 2048x2048 → Display: 80x80)
```

## Impact Summary

**Tier 1 (Large Backgrounds)**: 7 images
- Highest visual impact
- Cover major sections players spend time in
- Set complete atmosphere for each area

**Tier 2 (Modal Scenes)**: 3 images
- High impact at key moments
- Celebrate milestones
- Create memorable experiences

**Tier 3 (UI Illustrations)**: 3 images
- Medium-high impact
- Enhance UX with helpful visuals
- Decorate always-visible areas

**Tier 4 (Essential Icons)**: 2 images
- Medium impact but high frequency
- Most-clicked/viewed elements
- Essential for functionality

## Total: 15 Images

This balanced selection maximizes visual impact while covering:
- All major game sections (7 tab backgrounds)
- Key interaction moments (modals, achievements)
- Helpful UI elements (empty states, results)
- Essential functional icons (cast button, workstations)

## Post-Generation Processing

After generating all images at 2048x2048px:

1. **Crop to Final Size**: Use the crop ratios specified in the prompts
2. **Optimize**: Optimize cropped images for web use
3. **Verify**: Ensure transparency works correctly
4. **Test Tiling**: For tileable patterns, verify seamless tiling
