# 🛠️ Setup Guide for Spellwright

## ✅ What's Been Implemented

All core game systems have been implemented in vanilla JavaScript:

### ✅ Core Systems
- **Number formatting** - Number formatting (K, M, B suffixes)
- **Balance formulas** - All formulas (prestige, scaling, multipliers)
- **Crafting system** - Recipe management and validation
- **Save/Load system** - Auto-save to localStorage
- **Game state** - Main game logic (tick loop, production, crafting, prestige, experiments)
- **Daily rituals** - Daily task system
- **Data definitions** - All game content definitions

### ✅ UI Components
- **Main HUD** - Top bar with Arcane Bits (AB) display and Cast button
- **Workstations tab** - Preservation chamber crafting interface
- **Inscriptions tab** - Upgrade purchasing interface (refine preservation techniques)
- **Inventory tab** - Inventory display (preserved materials)
- **Experiment tab** - Experiment/discovery interface (discover new preservation techniques)
- **Daily rituals tab** - Daily tasks interface (maintenance rituals)
- **Boons tab** - Prestige bonuses interface
- **Meditation tab** - Mental defense mini-game (unlocks after first ascension)
- **Settings tab** - Settings, story section, fading theme toggles
- **Welcome back modal** - Offline progress modal
- **Prestige modal** - Ascension modal with elemental specialization choice
- **Story modals** - Story introduction, meditation story, full story

## 🚀 Getting Started

### Option 1: Using npm (Recommended)

```bash
npm install
npm start
```

This will start a local server and open the game in your browser at `http://localhost:8080`

### Option 2: Using Python

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Option 3: Direct File Access

Simply open `index.html` in your browser (some features may be limited due to CORS).

## 📁 Project Structure

```
Spellwright/
├── index.html          # Main HTML structure
├── styles.css          # All styling (neon theme + glitch effects)
├── js/
│   ├── game.js        # Main game controller & UI, story integration
│   ├── gameState.js   # Core game logic
│   ├── dailyRituals.js # Daily task system
│   ├── data.js        # Game content definitions
│   ├── utils.js       # Utility functions
│   ├── achievements.js # Achievement system
│   ├── animations.js  # UI animations
│   ├── comboSystem.js # Combo system
│   ├── eventSystem.js # Event management
│   ├── designTierSystem.js # Design tier system
│   ├── fadingThemeSystem.js # Visual fading theme effects
│   ├── elementSpecialization.js # Elemental specialization system
│   ├── meditationState.js # Meditation mini-game state
│   ├── meditationUI.js # Meditation UI
│   └── meditationTowers.js # Meditation tower system
├── package.json        # npm configuration
└── README.md          # Project documentation
```

## 🎮 How to Play

1. **Cast** - Click the Cast button to gather magic before it fades (Arcane Bits)
2. **Craft Preservation Chambers** - Use materials to build auto-producing preservation chambers
3. **Inscribe Upgrades** - Purchase permanent upgrades to refine preservation techniques
4. **Experiment** - Try experimenting to discover new preservation techniques
5. **Complete Daily Rituals** - Finish maintenance rituals to keep preserved magic stable
6. **Ascend** - Prestige to choose an elemental preservation strategy and earn permanent bonuses
7. **Meditate** - Defend your mind from the mental toll of the fading (unlocks after first ascension)

## 🛠️ Development

All code is in vanilla JavaScript (ES6 modules). No build step required!

### Key Files

- **game.js** - Main entry point, UI initialization and updates
- **gameState.js** - Core game state management (tick loop, production, crafting)
- **dailyRituals.js** - Daily task system with auto-refresh
- **data.js** - All game content (ingredients, producers, upgrades, etc.)
- **utils.js** - Formatting functions and balance formulas

### Adding New Content

Edit `js/data.js` to add:
- New ingredients
- New producers (workstations)
- New upgrades
- New prestige bonuses
- New daily tasks

### Modifying Game Balance

Edit formulas in `js/utils.js`:
- `Balance.prestigeScale` - Prestige point calculation
- `Balance.offlineCapSeconds` - Offline progress cap
- Production multipliers in `gameState.js`

## 🎨 Styling

The game uses a neon cyberpunk theme with progressive glitch effects defined in `styles.css`:
- Background: `#0E0E12` (dark)
- Primary: `#FF2DAA` (pink)
- Secondary: `#22E3FF` (cyan)
- Accent: `#FFDB6E` (gold)
- Success: `#3CE3C5` (teal)
- Mystical: `#C9A0FF` (purple)

### Glitch Effects System
The UI starts heavily glitched at Tier 0 and progressively stabilizes to perfect at Tier 4:
- Screen tearing, chromatic aberration, scanlines, text corruption, position jitter, opacity flicker, distortion waves, glitchy gradient
- All effects are CSS-only and GPU-accelerated for performance

## 📱 Responsive Design

The game is designed to work on:
- Desktop browsers
- Mobile devices (portrait orientation)
- Tablets

## 💾 Save System

Saves are stored in browser localStorage under the key `spellwrightSave`. The game auto-saves every 30 seconds and on window close.

### Manual Save/Load

Saves happen automatically. To manually export/import saves:
- Export: Copy the value from `localStorage.getItem('spellwrightSave')`
- Import: Use `localStorage.setItem('spellwrightSave', yourSaveData)`

## 🐛 Troubleshooting

### Game not loading
- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- Make sure JavaScript modules are enabled

### Save not working
- Check if localStorage is available (some private browsing modes disable it)
- Clear browser cache and try again

### Performance issues
- Reduce tick rate in `gameState.js` (currently 10 ticks/second)
- Close other browser tabs

## 📝 Notes

- All game systems are fully implemented and ready to use
- The game works entirely in the browser with no external dependencies
- Auto-save happens every 30 seconds
- Offline progress is capped at 12 hours

Good luck! 🎮✨
