# Retro Pixel Art Images for Cyber Witches

This directory contains the 15 retro pixel art images for the Cyber Witches: Idle Coven game.

## Standardized Generation Size

**ALL images should be generated at 2048x2048 pixels (square format).**

After generation, images will be cropped/resized to their final display sizes. This standardized approach makes generation easier and allows flexible cropping for different aspect ratios.

## Quick Start

1. **Generate Images**: Use the prompts in `IMAGE_GENERATION_PROMPTS.md` to create each image at 2048x2048px
2. **Crop Images**: Crop each image to its final display size (see prompts for crop ratios)
3. **Place Images**: Add cropped images to the appropriate folders (see folder structure below)
4. **Integrate**: Follow the instructions in `INTEGRATION_GUIDE.md` to add images to the codebase

## Folder Structure

```
images/
├── backgrounds/
│   ├── main-game-bg.png              (Generate: 2048x2048 → Display: 1920x1080)
│   ├── tab-workstations-bg.png       (Generate: 2048x2048 → Display: 1600x1200)
│   ├── tab-inscriptions-bg.png       (Generate: 2048x2048 → Display: 1600x1200)
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
    └── workstation-card-icon.png      (Generate: 2048x2048 → Display: 80x80)
```

## Image Categories

### Tier 1: Large Background Scenes (7 images)
- Highest visual impact
- Full-section backgrounds
- Cover major game areas

### Tier 2: Modal & Scene Images (3 images)
- High impact at key moments
- Celebrate milestones
- Create memorable experiences

### Tier 3: UI Illustrations (3 images)
- Medium-high impact
- Enhance UX with helpful visuals
- Decorate always-visible areas

### Tier 4: Essential Icons (2 images)
- Medium impact but high frequency
- Most-clicked/viewed elements
- Essential for functionality

## Documentation

- **`FINAL_IMAGE_PLAN.md`**: Overview of all 15 images with impact analysis
- **`IMAGE_GENERATION_PROMPTS.md`**: Detailed prompts for generating each image at 2048x2048px with crop instructions
- **`INTEGRATION_GUIDE.md`**: Step-by-step guide for integrating images into the codebase (CSS, HTML, JavaScript)

## Color Palette

All images must use these exact colors:
- **Primary Pink**: #FF2DAA (neon pink)
- **Secondary Cyan**: #22E3FF (electric blue)
- **Accent Yellow**: #FFDB6E (golden yellow)
- **Success Green**: #3CE3C5 (mint green)
- **Background Dark**: #0A0A0F, #1A1A2A, #1F1F3A
- **Text**: #FFFFFF (white)

## Image Requirements

- **Generate Format**: PNG with transparency where needed
- **Generate Size**: 2048x2048 pixels (square) for ALL images
- **Style**: Retro 8-bit pixel art (no anti-aliasing, clear pixel edges)
- **Post-Processing**: Crop to final display sizes after generation
- **Optimization**: Optimize cropped images for web use while maintaining quality
- **Tileable Images**: Must tile seamlessly on all sides

## Status

- [x] Folder structure created
- [x] Image generation prompts created (15 images, all 2048x2048px)
- [x] Integration guide created
- [ ] Images generated at 2048x2048px (pending - use prompts to create)
- [ ] Images cropped to final display sizes (pending)
- [ ] Images integrated into codebase (pending)

## Next Steps

1. Generate all 15 images at 2048x2048px using the prompts in `IMAGE_GENERATION_PROMPTS.md`
2. Crop each image to its final display size (see crop ratios in prompts)
3. Place each cropped image in its designated folder with the exact filename specified
4. Follow `INTEGRATION_GUIDE.md` to integrate images into the codebase
5. Test images at different screen sizes and design tiers
