# Cyber Witches: Idle Coven - Testing Instructions

## Quick Start

**URL:** http://localhost:3000/index-final.html

The game is ready for testing! The debug team has fixed all loading issues and created a working version.

## First 3 Features to Test Immediately

1. **Basic Game Mechanics** - Cast spells and gather resources
2. **Digital Candle Forge** - Unlock at 750 AB, produces Digital Candles
3. **Coven System** - Create or join a coven for social bonuses

---

## Complete Feature Testing Guide

### 1. Basic Game Mechanics
**Location:** Main game screen (default view)
**How to Test:**
- Click the "✨ Cast" button multiple times
- Watch AB (Arcane Bits) and AB/s counters increase
- Try the "Auto: OFF" toggle to enable auto-casting
- Check keyboard shortcuts (Space to cast, 1-8 for tabs)

**Expected Results:**
- Cast button responds immediately with visual feedback
- AB counter increases with each cast
- AB/s updates every second
- Auto-cast works when enabled
- Keyboard shortcuts function properly

### 2. Digital Candle Forge
**Location:** Workstations Tab → Unlock at 750 AB
**How to Test:**
1. Cast spells until you have 750+ AB
2. Click "Craft x1" or "Craft x10" for Digital Candle Forge
3. Verify it produces Digital Candles (0.5 per second)
4. Check the upgrade "Candle Algorithm" doubles its production

**Expected Results:**
- Digital Candle Forge appears in workstations list at 750 AB
- Successfully crafts with required ingredients
- Shows in inventory as "Digital Candle" ingredient
- Production increases AB generation

### 3. Coven System
**Location:** Coven Tab (🔮)
**How to Test:**
1. **Create Coven:**
   - Enter coven name and description
   - Click "Create Coven"
   - Verify you become leader with 👑 badge

2. **Join Coven:**
   - Enter any code (e.g., "TEST123")
   - Click "Join Coven"
   - Verify mock coven functionality

3. **Coven Features:**
   - Check member list shows your contribution
   - Verify production bonus (5% per member, max 25%)
   - Test collaborative rituals progress

**Expected Results:**
- Coven creation/joining works smoothly
- Member list displays correctly
- Production bonus applies to AB generation
- Rituals track collective progress

### 4. Workstations & Production Chain
**Location:** Workstations Tab
**How to Test:**
1. Craft basic workstations: Wax Melter, Wick Spinner, Crystal Shaper
2. Progress to Digital Candle Farm (75 AB)
3. Advance through tiers: Crystal Rig, Quantum Cauldron, etc.
4. Test "Max" button for bulk crafting

**Expected Results:**
- Each workstation shows recipe requirements
- Production chain flows from basic to advanced
- "Max" button crafts maximum affordable units
- Upgrade buttons show production multipliers

### 5. Inscriptions (Upgrades)
**Location:** Inscriptions Tab (📜)
**How to Test:**
1. Purchase "Hex Compiler v1" for 50% global production boost
2. Buy "Sigil Stroke" to increase cast rewards
3. Test workstation-specific upgrades

**Expected Results:**
- Upgrades show clear effects and costs
- Production multipliers apply immediately
- Click upgrades increase cast rewards

### 6. Experiment System
**Location:** Experiment Tab (🔬)
**How to Test:**
1. Click "🔬 Try Experiment" button
2. Discover hidden recipes like "Wax Block Bulk"
3. Craft discovered recipes from the list

**Expected Results:**
- Experiments consume ingredients and reveal recipes
- Discovered recipes appear in the list
- Can craft discovered items with proper ingredients

### 7. Daily Rituals
**Location:** Dailies Tab (📅)
**How to Test:**
1. Complete tasks like "Craft 3 Wax Melters"
2. Claim rewards when progress bar fills
3. Check for daily reset functionality

**Expected Results:**
- Tasks track progress accurately
- Rewards (AB, buffs, EK fragments) claim correctly
- New tasks appear after daily reset

### 8. Prestige System (Ascension)
**Location:** ⚡ Ascend button (appears in top bar)
**How to Test:**
1. Accumulate significant AB production
2. Click "⚡ Ascend" button
3. Gain Eldritch Keys (EK)
4. Purchase prestige bonuses in Boons tab

**Expected Results:**
- Ascend button appears when enough progress made
- Prestige resets game but grants EK
- Boons provide permanent bonuses

### 9. Mobile Features
**How to Test:**
1. Resize browser to mobile width
2. Test touch interactions on cast button
3. Verify tab navigation works on mobile
4. Check responsive layout

**Expected Results:**
- Interface adapts to mobile screens
- Touch controls work properly
- No horizontal scrolling on mobile
- All features accessible on mobile

### 10. Accessibility Features
**How to Test:**
1. Tab through interface elements
2. Use screen reader (if available)
3. Test keyboard navigation
4. Check ARIA labels and roles

**Expected Results:**
- Logical tab order
- Screen reader announcements for game events
- All interactive elements accessible via keyboard
- Proper ARIA labels on controls

---

## Known Working Features

✅ **Core Mechanics:** Casting, AB generation, auto-cast
✅ **Digital Candle Forge:** Unlocks at 750 AB, produces Digital Candles
✅ **Coven System:** Create/join covens, member management, production bonuses
✅ **Workstations:** Full production chain from basic to legendary
✅ **Upgrades:** Global and workstation-specific multipliers
✅ **Experiment System:** Recipe discovery and crafting
✅ **Daily Rituals:** Task tracking and rewards
✅ **Prestige System:** Ascension and permanent bonuses
✅ **Mobile Support:** Responsive design and touch controls
✅ **Accessibility:** ARIA labels, keyboard navigation, screen reader support

## Troubleshooting

**If something doesn't work:**
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check browser console for errors (F12 → Console)
3. Verify you're using index-final.html
4. Make sure local server is running on port 3000

**Performance Tips:**
- Game uses virtual scrolling for large lists
- UI updates are debounced for smoothness
- Auto-save runs every 30 seconds

## Testing Priority Order

1. **Immediate:** Basic casting, Digital Candle Forge, Coven creation
2. **Core Features:** Workstations, upgrades, experiments
3. **Advanced:** Prestige system, daily rituals
4. **Quality:** Mobile responsiveness, accessibility

---

**Ready for testing!** The game should load immediately and all features be functional. Report any issues found during testing.