# Packaging Guide for CyberWitches Game

## Quick Start - How to Share with Your Friend

### Option 1: Zip the Entire Project Folder (Recommended)

1. **Locate your project folder** - The folder containing:
   - `index.html`
   - `js/` directory
   - `images/` directory
   - `styles.css`
   - All other game files

2. **Create a zip file:**
   - **Windows:** Right-click the folder → "Send to" → "Compressed (zipped) folder"
   - **macOS:** Right-click the folder → "Compress [folder name]"
   - **Linux:** Right-click → "Compress" or use `zip -r CyberWitches.zip CyberWitches/`

3. **Share the zip file** via email, cloud storage, or file sharing service

### Option 2: Use Git (If Using Version Control)

If you're using Git, you can create a release:
```bash
git archive --format=zip --output=CyberWitches-v1.0.zip HEAD
```

---

## What's Included in This Version

### Recent Changes Summary

1. **Design Tier System** - Fully implemented with all 5 tiers (0-4) respecting their restrictions
   - Tier 0: Strictly monochrome, no animations, no sound
   - Tier 1: Basic colors, no animations, no sound
   - Tier 2: Colors + sound effects, no animations
   - Tier 3: Full graphics, animations, sound effects, no music
   - Tier 4: Everything + background music

2. **UI Improvements:**
   - Settings button moved to sidebar
   - Settings tab removed from main navigation
   - Tutorial system with Start/Reset buttons
   - Custom tooltips system
   - Compact inventory layout (grid-based)

3. **Removed Features:**
   - Search and filter functionality (removed as requested)
   - Coven system (archived for future expansion)

4. **Bug Fixes:**
   - Fixed syntax error in game.js
   - Fixed button event listeners
   - Fixed tier styling consistency

---

## Instructions for Your Friend

### Setup Instructions

1. **Extract the zip file** to a folder on their computer

2. **Open the game:**
   - Simply double-click `index.html` to open in their default browser
   - OR open their browser and use File → Open → select `index.html`

3. **Recommended Browsers:**
   - Chrome/Edge (latest version)
   - Firefox (latest version)
   - Safari (latest version)

4. **If the game doesn't load properly:**
   - Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
   - Try a different browser
   - Check browser console (F12) for any errors

### Testing Checklist

Ask your friend to test:

- [ ] Game loads without errors
- [ ] Can click buttons and interact with UI
- [ ] Workstations tab displays correctly
- [ ] Inventory tab shows items in compact grid layout
- [ ] Settings accessible from sidebar
- [ ] Tutorial can be started/reset
- [ ] Design tier system works (check Settings → Design Tier)
- [ ] Tier 0 is strictly monochrome (no colors, animations, or sound)
- [ ] Higher tiers unlock features progressively
- [ ] Game saves/loads correctly
- [ ] No console errors (check F12 → Console tab)

---

## File Structure

```
CyberWitches/
├── index.html              # Main HTML file
├── styles.css              # All styling
├── sw.js                   # Service worker (for PWA features)
├── js/
│   ├── game.js            # Main game logic
│   ├── gameState.js       # Game state management
│   ├── designTierSystem.js # Design tier system
│   ├── audioSystem.js     # Audio/music system
│   ├── tutorial.js        # Tutorial system
│   ├── customTooltips.js  # Tooltip system
│   └── ... (other JS files)
├── images/                 # Game images and assets
└── ... (other directories)
```

---

## Known Issues / Notes

1. **ScriptProcessorNode Deprecation Warning:**
   - This is a warning from the Tone.js library (third-party)
   - Does not affect functionality
   - Will be resolved when Tone.js updates their library

2. **Font Loading Warning:**
   - Google Fonts may show a 404 warning
   - Fonts still load correctly via CSS @import
   - Not critical

3. **LCP Performance:**
   - Large Contentful Paint may be slow on first load
   - This is a performance metric, not a bug
   - Game functionality is unaffected

---

## Version Information

- **Version:** Based on latest working branch
- **Last Updated:** Current session
- **Browser Requirements:** Modern browser with ES6+ support
- **No Server Required:** Runs entirely client-side

---

## Support

If your friend encounters issues:

1. Check browser console (F12) for errors
2. Try clearing browser cache
3. Try a different browser
4. Check that all files are extracted correctly
5. Ensure JavaScript is enabled in browser

---

## Quick Test Commands (For Developer)

If you want to verify before sharing:

```bash
# Check for syntax errors (if you have Node.js)
node -c js/game.js

# Or use a linter
# Most IDEs will show errors automatically
```

---

**Ready to Share!** Just zip the folder and send it to your friend. They can unzip and open `index.html` directly - no installation or server needed!

