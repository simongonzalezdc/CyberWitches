# Cyber Witches: Idle Coven - Game Manual

## 📖 Table of Contents

1. [Game Overview](#game-overview)
2. [Getting Started](#getting-started)
3. [Core Mechanics](#core-mechanics)
4. [Workstations](#workstations)
5. [Inscriptions (Upgrades)](#inscriptions-upgrades)
6. [Experiments & Recipes](#experiments--recipes)
7. [Prestige System](#prestige-system)
8. [Achievements](#achievements)
9. [Daily Rituals](#daily-rituals)
10. [Advanced Features](#advanced-features)
11. [Tips & Strategies](#tips--strategies)

---

## 🎮 Game Overview

**Cyber Witches: Idle Coven** is an incremental idle game where you play as a cyber witch crafting magical ingredients and automating production. The game features:

- **Manual Casting**: Click the Cast button to manually generate ingredients
- **Automated Production**: Craft workstations that automatically produce ingredients
- **Upgrades**: Inscribe powerful upgrades to boost your production
- **Experimentation**: Discover hidden recipes through experimentation
- **Prestige System**: Reset your progress to gain permanent bonuses
- **Achievements**: Unlock achievements for milestones and rewards
- **Daily Challenges**: Complete daily tasks for bonus rewards
- **Combo System**: Build combos for increased rewards
- **Random Events**: Experience special events that boost production

---

## 🚀 Getting Started

### Initial Setup

1. **Launch the game**: Open `index.html` in your browser or access via the dev server
2. **First Cast**: Click the **"✨ Cast"** button to start generating ingredients
3. **Earn AB**: Each cast gives you 0.1 AB (Aether Bits) - the main currency
4. **Build Workstations**: Use ingredients to craft workstations that automate production

### Basic Controls

- **Cast Button**: Click to manually generate ingredients and AB
- **Auto-Cast Toggle**: Enable automatic casting (casts every 500ms)
- **Tab Navigation**: Switch between different game sections using tabs
- **Craft Buttons**: Use "Craft x1", "Craft x10", or "Max" to build items

---

## ⚙️ Core Mechanics

### Currency

- **AB (Aether Bits)**: Main currency, used to unlock workstations and upgrades
  - Earned by clicking Cast (0.1 per cast)
  - Produced by certain workstations (Digital Candle Farm, Crystal Rig, Quantum Cauldron)
  
- **EK (Eldritch Keys)**: Prestige currency, earned by ascending
  - Used to purchase permanent bonuses
  - Persists across prestige resets

### Ingredients

**Tier 0 (Base Ingredients - from Casting):**
- **Wax Bits**: 1.0 per cast
- **Wick Fiber**: 1.0 per cast
- **Crystal Dust**: 0.5 per cast
- **Aether Essence**: 0.5 per cast

**Tier 1 (Crafted Ingredients):**
- **Wax Block**: Crafted from Wax Bits (10 Wax Bits)
- **Braided Wick**: Crafted from Wick Fiber (10 Wick Fiber)
- **Shaped Crystal**: Crafted from Crystal Dust (10 Crystal Dust)
- **Distilled Aether**: Crafted from Aether Essence (10 Aether Essence)

**Tier 2 (Advanced Ingredients):**
- **Digital Candle**: Crafted from multiple ingredients (see workstations)

### Production Scaling

Workstation costs scale exponentially:
- Each workstation costs more than the previous one
- Growth rate: 1.10x to 1.16x depending on the workstation
- Formula: `cost = base_cost × (growth_rate ^ owned_count)`

---

## 🏭 Workstations

Workstations are automated producers that generate ingredients and AB over time. Each workstation has:
- **Unlock Requirement**: Minimum AB needed to see the workstation
- **Recipe**: Ingredients needed to craft
- **Growth Rate**: How fast costs increase
- **Outputs**: What the workstation produces per second

### Workstation List

#### 1. **Wax Melter** (Unlocks at 0 AB)
- **Recipe**: 10 Wax Bits
- **Growth**: 1.10x
- **Produces**: 0.30 Wax Block/s
- **Strategy**: First workstation, produces Wax Blocks for crafting

#### 2. **Wick Spinner** (Unlocks at 0 AB)
- **Recipe**: 10 Wick Fiber
- **Growth**: 1.10x
- **Produces**: 0.30 Braided Wick/s
- **Strategy**: Second workstation, produces Braided Wicks

#### 3. **Crystal Shaper** (Unlocks at 25 AB)
- **Recipe**: 10 Crystal Dust
- **Growth**: 1.12x
- **Produces**: 0.20 Shaped Crystal/s
- **Strategy**: Produces Shaped Crystals for advanced crafting

#### 4. **Aether Still** (Unlocks at 50 AB)
- **Recipe**: 10 Aether Essence
- **Growth**: 1.12x
- **Produces**: 0.20 Distilled Aether/s
- **Strategy**: Produces Distilled Aether for advanced recipes

#### 5. **Digital Candle Farm** (Unlocks at 100 AB) ⭐ **First AB Producer**
- **Recipe**: 5 Wax Block, 1 Braided Wick, 2 Distilled Aether
- **Growth**: 1.14x
- **Produces**: 1.0 AB/s
- **Strategy**: **KEY WORKSTATION** - This is your first automated AB producer!

#### 6. **Crystal Rig** (Unlocks at 250 AB)
- **Recipe**: 2 Shaped Crystal, 2 Distilled Aether
- **Growth**: 1.14x
- **Produces**: 0.15 AB/s, 0.05 Crystal Dust/s
- **Strategy**: Secondary AB producer with bonus Crystal Dust

#### 7. **Quantum Cauldron** (Unlocks at 1500 AB) ⭐ **Best AB Producer**
- **Recipe**: 3 Shaped Crystal, 3 Distilled Aether, 1 Digital Candle
- **Growth**: 1.16x
- **Produces**: 2.5 AB/s
- **Strategy**: **BEST WORKSTATION** - Highest AB production rate!

### Unlocking Workstations

**Progression Path:**
1. **0 AB**: Cast manually → Build Wax Melter & Wick Spinner
2. **25 AB**: Unlock Crystal Shaper
3. **50 AB**: Unlock Aether Still
4. **100 AB**: Unlock Digital Candle Farm (first AB producer!)
5. **250 AB**: Unlock Crystal Rig
6. **1500 AB**: Unlock Quantum Cauldron (best producer!)

---

## 📜 Inscriptions (Upgrades)

Inscriptions are permanent upgrades that boost production. Each inscription can only be purchased once.

### Upgrade List

#### 1. **Hex Compiler v1** (Unlocks at 0 AB)
- **Effect**: Increases all production by 50%
- **Type**: Global multiplier (×1.5)
- **Recipe**: 2 Wax Block, 2 Braided Wick, 1 Shaped Crystal
- **Priority**: ⭐⭐⭐ High - Get this early!

#### 2. **Sigil Stroke** (Unlocks at 0 AB)
- **Effect**: Adds +1 to all cast rewards
- **Type**: Click additive (+1.0)
- **Recipe**: 10 Wick Fiber
- **Priority**: ⭐⭐ Medium - Helps manual casting

#### 3. **Wax Algorithm** (Unlocks at 100 AB)
- **Effect**: Doubles Digital Candle Farm production
- **Type**: Producer multiplier (×2.0)
- **Recipe**: 3 Wax Block, 1 Distilled Aether
- **Priority**: ⭐⭐⭐ High - Doubles your first AB producer!

#### 4. **Quantum Faceting** (Unlocks at 250 AB)
- **Effect**: Doubles Crystal Rig production
- **Type**: Producer multiplier (×2.0)
- **Recipe**: 2 Shaped Crystal, 1 Distilled Aether
- **Priority**: ⭐⭐ Medium - Good for Crystal Rig users

#### 5. **Sigil Cache** (Unlocks at 500 AB)
- **Effect**: Increases all production by 80%
- **Type**: Global multiplier (×1.8)
- **Recipe**: 3 Wax Block, 2 Shaped Crystal, 2 Distilled Aether
- **Priority**: ⭐⭐⭐ High - Massive global boost!

#### 6. **Brew Daemon** (Unlocks at 1500 AB)
- **Effect**: Increases Quantum Cauldron production by 80%
- **Type**: Producer multiplier (×1.8)
- **Recipe**: 2 Shaped Crystal, 2 Distilled Aether, 1 Digital Candle
- **Priority**: ⭐⭐⭐ High - Best for Quantum Cauldron users!

### Upgrade Strategy

**Early Game (0-100 AB):**
1. Hex Compiler v1 (global boost)
2. Sigil Stroke (casting boost)

**Mid Game (100-500 AB):**
1. Wax Algorithm (double Digital Candle Farm)
2. Sigil Cache (massive global boost)

**Late Game (500+ AB):**
1. Quantum Faceting (Crystal Rig boost)
2. Brew Daemon (Quantum Cauldron boost)

---

## 🔬 Experiments & Recipes

### Experimentation System

The Experiment tab allows you to discover hidden recipes by spending ingredients.

**How to Experiment:**
1. Go to the **Experiment** tab
2. Click the **"Try Experiment"** button
3. Spend ingredients to attempt discovery
4. Successfully discover recipes unlock new crafting options

**Experiment Costs:**
- Base cost increases with each attempt
- Successful discovery reveals a new recipe
- Failed experiments still consume ingredients

### Hidden Recipes

Hidden recipes are discovered through experimentation. These recipes often provide:
- Alternative crafting paths
- More efficient ingredient conversion
- Special items not available through normal crafting

**Strategy:**
- Experiment early to discover efficient recipes
- Some recipes may be more cost-effective than workstations
- Experimentation can unlock unique crafting paths

---

## ⚡ Prestige System

### What is Prestige?

Prestige (Ascension) allows you to reset your progress in exchange for permanent bonuses called **Eldritch Keys (EK)**.

### How to Ascend

1. Click the **"⚡ Ascend"** button in the top bar
2. Check how many EK you'll gain
3. Confirm the ascension
4. Your progress resets, but you keep EK and prestige bonuses

### Prestige Bonuses (Boons)

EK can be spent on permanent bonuses that persist across ascensions:

#### 1. **Global Production Boost** (Level-based)
- **Effect**: +5% production per level
- **Cost**: Increases per level
- **Max Level**: Unlimited

#### 2. **Starting AB** (Level-based)
- **Effect**: Start with +AB after ascension
- **Cost**: Increases per level
- **Max Level**: Unlimited

#### 3. **Starting Ingredients** (Level-based)
- **Effect**: Start with ingredients after ascension
- **Cost**: Increases per level
- **Max Level**: Unlimited

### When to Ascend

**Good Time to Ascend:**
- When you've earned significantly more AB than your current total
- When progress slows down significantly
- When you can afford meaningful prestige bonuses
- After unlocking major milestones

**Prestige Formula:**
- EK gained = `prestige_points_for(lifetime_ab) - current_ek`
- More lifetime AB = More EK gained

---

## 🏆 Achievements

Achievements are milestones that reward you with AB or EK when unlocked.

### Achievement List

1. **First Spell** (Cast 1 time)
   - Reward: 10 AB

2. **First AB** (Earn 1 AB)
   - Reward: 5 AB

3. **First Factory** (Craft 1 workstation)
   - Reward: 50 AB

4. **Century of Spells** (Cast 100 times)
   - Reward: 100 AB

5. **Century of Power** (Reach 100 AB)
   - Reward: 200 AB

6. **Experimenter** (Discover 1 recipe)
   - Reward: 100 AB

7. **Industrial Scale** (Craft 10 workstations)
   - Reward: 500 AB

8. **Diverse Production** (Own 5 different workstation types)
   - Reward: 500 AB

9. **Master Alchemist** (Discover all 5 recipes)
   - Reward: 1000 AB

10. **Ascendant** (Complete 1 prestige)
    - Reward: 1 EK

### Achievement Strategy

- Achievements provide free AB/EK
- Check the **Stats** tab to see your progress
- Some achievements unlock naturally through gameplay
- Focus on achievements that provide large rewards

---

## 📅 Daily Rituals

### Daily Tasks System

Daily tasks provide bonus rewards for completing specific objectives.

**Task Types:**
- **Tap**: Cast a certain number of times
- **Craft**: Craft a specific workstation
- **Own**: Own a certain number of workstations
- **Earn**: Earn a certain amount of AB

**Rewards:**
- Tasks refresh daily
- Complete tasks to earn bonus AB
- Multiple tasks can be active simultaneously

**Strategy:**
- Check the Dailies tab regularly
- Complete easy tasks first
- Some tasks may require strategic planning

---

## 🎯 Advanced Features

### Combo System

**How Combos Work:**
- Click Cast rapidly to build a combo
- Each click within 2 seconds continues the combo
- Combo multiplies your rewards (up to 2x at 50+ combo)
- Formula: `multiplier = 1.0 + (combo_count × 0.02)`, capped at 2.0

**Combo Benefits:**
- Increased ingredient rewards
- Increased AB rewards
- Visual feedback shows current combo
- Max combo tracked in stats

**Strategy:**
- Use auto-cast to maintain combos
- Combos reset after 2 seconds of inactivity
- Higher combos = Better rewards

### Random Events

Random events provide temporary bonuses:

#### 1. **✨ Lucky Strike**
- **Effect**: All production doubled for 30 seconds
- **Strategy**: Great time to stock up on ingredients and AB

#### 2. **💰 Windfall**
- **Effect**: Instant AB bonus (10% of current AB, minimum 100)
- **Strategy**: Happens automatically, enjoy the bonus!

#### 3. **💡 Inspiration**
- **Effect**: Double cast rewards for 20 seconds
- **Strategy**: Perfect time to manually cast for maximum rewards

**Event Frequency:**
- Events occur randomly (0.1% chance per tick)
- Minimum 60 seconds between events
- More active players get more events
- Event chance increases with more taps

### Auto-Cast Feature

**How to Use:**
- Click the **"Auto: OFF"** button to toggle
- When enabled, casts automatically every 500ms
- Great for maintaining combos
- Useful for idle gameplay

**Strategy:**
- Enable auto-cast when you want to focus on other tasks
- Combines well with combo system
- Can help complete tap-based achievements

### Offline Progress

The game calculates offline progress when you return:
- Production continues while you're away
- Welcome back modal shows time away and AB earned
- Offline production is based on your AB/s when you left

---

## 💡 Tips & Strategies

### Early Game (0-100 AB)

1. **Manual Casting**: Click Cast to build up initial ingredients and AB
2. **First Workstations**: Build Wax Melter and Wick Spinner early
3. **First Upgrade**: Get Hex Compiler v1 for global production boost
4. **Goal**: Reach 100 AB to unlock Digital Candle Farm

### Mid Game (100-500 AB)

1. **Digital Candle Farm**: Focus on building your first AB-producing workstation
2. **Wax Algorithm**: Double your Digital Candle Farm production
3. **Sigil Cache**: Get the massive global production boost
4. **Crystal Rig**: Unlock at 250 AB for additional AB production
5. **Goal**: Build up to 500 AB for Sigil Cache

### Late Game (500+ AB)

1. **Quantum Cauldron**: Unlock at 1500 AB - best AB producer
2. **Brew Daemon**: Boost Quantum Cauldron production
3. **Experimentation**: Discover hidden recipes for efficiency
4. **Prestige Planning**: Consider when to ascend for maximum EK

### General Strategies

**Production Optimization:**
- Focus on workstations that produce AB
- Use upgrades to boost production
- Balance ingredient production with AB production
- Plan workstation growth strategically

**Efficiency Tips:**
- Use "Max" button to craft efficiently
- Check costs before crafting (they scale!)
- Prioritize upgrades that affect multiple workstations
- Experiment with different production paths

**Prestige Strategy:**
- Ascend when progress slows significantly
- Invest EK in production bonuses first
- Starting bonuses help early game significantly
- Plan your prestige timing for maximum EK gain

**Achievement Hunting:**
- Check Stats tab regularly
- Some achievements unlock naturally
- Focus on high-reward achievements
- Achievements provide free AB/EK

---

## 🎮 Game Tabs Overview

### 🏭 Workstations Tab
- View all available workstations
- Craft workstations using ingredients
- See production rates and costs
- Check unlock requirements

### 📜 Inscriptions Tab
- View all available upgrades
- Purchase upgrades with ingredients
- See upgrade effects and requirements
- Track which upgrades you own

### 🎒 Inventory Tab
- View all your current ingredients
- See ingredient quantities
- Track your resources

### 🔬 Experiment Tab
- Try experiments to discover recipes
- View discovered recipes
- Craft discovered recipes
- See experiment results

### 📅 Dailies Tab
- View daily tasks
- Track task progress
- Claim task rewards
- See available bonuses

### ⭐ Boons Tab
- View prestige bonuses
- Purchase bonuses with EK
- See bonus levels and costs
- Plan your prestige investments

### 📊 Stats Tab
- View game statistics
- Track achievements
- See your progress
- Monitor your performance

---

## 🔧 Technical Details

### Production Calculation

**Workstation Production:**
```
final_production = base_rate × multiplier × owned_count × event_multiplier
```

**Multipliers:**
- Global upgrades (affect all)
- Producer-specific upgrades
- Prestige bonuses
- Event bonuses

### Cost Scaling

**Workstation Costs:**
```
cost = base_cost × (growth_rate ^ owned_count)
```

**Example:**
- Base cost: 10 Wax Bits
- Growth: 1.10x
- 1st workstation: 10 × 1.10^0 = 10
- 2nd workstation: 10 × 1.10^1 = 11
- 3rd workstation: 10 × 1.10^2 = 12.1
- etc.

### Game Tick Rate

- Game updates 10 times per second (100ms per tick)
- Production is calculated per tick
- UI updates every second for AB/s display

---

## 📝 Changelog & Version

**Current Version**: 1.0

**Features:**
- ✅ Manual casting system
- ✅ Workstation automation
- ✅ Upgrade system
- ✅ Experimentation system
- ✅ Prestige system
- ✅ Achievement system
- ✅ Daily rituals
- ✅ Combo system
- ✅ Random events
- ✅ Auto-cast feature
- ✅ Offline progress
- ✅ Visual polish and animations

---

## 🆘 Troubleshooting

### Common Issues

**Game not loading:**
- Check browser console for errors
- Ensure all files are present
- Try refreshing the page

**Production not updating:**
- Check browser console for errors
- Verify game state is initialized
- Try refreshing the page

**Save not working:**
- Check browser localStorage support
- Clear browser cache if needed
- Check browser console for errors

**Performance issues:**
- Disable auto-cast if laggy
- Close other browser tabs
- Check browser console for errors

---

## 📚 Additional Resources

- **Game Code**: See `js/` folder for game logic
- **Data Files**: See `js/data.js` for game content
- **Styling**: See `styles.css` for visual design
- **Setup Guide**: See `SETUP_GUIDE.md` for development setup

---

## 🎉 Have Fun!

Enjoy your journey as a Cyber Witch! Build your coven, automate your production, and ascend to greater heights of power!

**Remember:**
- Progress is saved automatically
- Experiment with different strategies
- Prestige when progress slows
- Enjoy the idle gameplay!

Happy casting! ✨

