# Element Specialization System - RPG-Style Strategy Design

## Core Concept

Players choose an **Elemental Affinity** during ascension (prestige), which provides permanent bonuses and unlocks specialized paths. Each element offers a unique playstyle and strategic advantages.

---

## The 4 Elemental Strategies

### 🔥 **Fire Path: The Forge Master**
**Theme:** Aggressive production, fast automation, currency focus
**Playstyle:** Rush to AB production, maximize currency generation
**Specialization Bonuses:**
- +50% Fire element production
- +25% AB production from Fire-based reactors
- -20% Fire building costs
- +10% cast rewards (Fire essence)

**Unique Mechanics:**
- Fire buildings produce 2x output
- AB Reactors cost 50% less if built with Fire-heavy recipes
- Unlock "Inferno Mode" - temporary 3x production boost

**Strategy Focus:**
- Prioritize Fire buildings early
- Rush to AB automation
- Maximize currency generation
- Fast prestige cycles

---

### 💧 **Water Path: The Flow Master**
**Theme:** Balanced production, resource efficiency, sustainability
**Playstyle:** Efficient resource management, balanced growth
**Specialization Bonuses:**
- +50% Water element production
- +25% all production (balanced bonus)
- -30% all building costs (efficiency)
- +20% ingredient production

**Unique Mechanics:**
- All buildings cost 30% less
- Production bonuses stack multiplicatively
- Unlock "Tide Pool" - passive resource generation
- Cross-element recipes cost 20% less

**Strategy Focus:**
- Build all elements evenly
- Maximize efficiency
- Lower costs = faster progression
- Sustainable long-term growth

---

### 💨 **Air Path: The Speed Master**
**Theme:** Fast progression, quick unlocks, rapid scaling
**Playstyle:** Speed-focused, unlock buildings faster
**Specialization Bonuses:**
- +50% Air element production
- +30% unlock speed (buildings unlock at lower AB)
- +25% production speed (all buildings)
- +15% cast speed

**Unique Mechanics:**
- Buildings unlock 30% earlier
- Production rates 25% faster
- Unlock "Gale Force" - temporary 2x speed boost
- Prestige unlocks come faster

**Strategy Focus:**
- Unlock new tiers quickly
- Fast progression through tiers
- Speed-focused gameplay
- Rapid scaling

---

### 💎 **Crystal Path: The Foundation Master**
**Theme:** Universal bonuses, bottleneck management, foundation building
**Playstyle:** Focus on universal ingredients, manage bottlenecks
**Specialization Bonuses:**
- +50% Crystal element production
- +25% all universal ingredients (shaped_crys, crystal_orb, crystal_core)
- -40% bottleneck ingredient costs
- +30% production from buildings using Crystal

**Unique Mechanics:**
- Universal ingredients (crystal_orb, crystal_core) produced 2x faster
- Buildings using Crystal cost 40% less
- Unlock "Crystal Resonance" - all buildings get +20% production
- Bottleneck management bonuses

**Strategy Focus:**
- Maximize universal ingredient production
- Manage bottlenecks efficiently
- Build foundation for all elements
- Support all other element chains

---

## Implementation Design

### 1. Ascension (Prestige) Choice

**When player ascends:**
```
┌─────────────────────────────────────┐
│   Choose Your Elemental Affinity    │
├─────────────────────────────────────┤
│                                     │
│  🔥 Fire Path    💧 Water Path      │
│  [Forge Master]  [Flow Master]      │
│                                     │
│  💨 Air Path     💎 Crystal Path    │
│  [Speed Master]  [Foundation Master]│
│                                     │
└─────────────────────────────────────┘
```

**Mechanics:**
- Choice is **permanent** for that prestige cycle
- Can change on next prestige
- Each path has unique bonuses
- Visual indicator shows chosen path

---

### 2. Prestige Bonus System

**Current System:** Generic prestige bonuses
**New System:** Element-specific prestige bonuses

**Structure:**
```javascript
PRESTIGE_ELEMENT_BONUSES = {
    fire: {
        id: "pp_fire_affinity",
        displayName: "Fire Affinity",
        description: "+5% Fire production per level",
        type: "element_mult",
        element: "fire",
        value: 0.05,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    water: {
        id: "pp_water_affinity",
        displayName: "Water Affinity",
        description: "+5% Water production per level",
        type: "element_mult",
        element: "water",
        value: 0.05,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    air: {
        id: "pp_air_affinity",
        displayName: "Air Affinity",
        description: "+5% Air production per level",
        type: "element_mult",
        element: "air",
        value: 0.05,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    crystal: {
        id: "pp_crystal_affinity",
        displayName: "Crystal Affinity",
        description: "+5% Crystal production per level",
        type: "element_mult",
        element: "crystal",
        value: 0.05,
        baseCostPp: 10.0,
        costGrowth: 1.5
    }
}
```

**Specialization Bonuses (one-time, chosen at ascension):**
```javascript
ELEMENT_SPECIALIZATIONS = {
    fire: {
        baseProductionMult: 1.5,      // +50% Fire production
        abProductionMult: 1.25,        // +25% AB from Fire reactors
        costReduction: 0.2,            // -20% Fire building costs
        castRewardMult: 1.1            // +10% cast rewards
    },
    water: {
        baseProductionMult: 1.5,      // +50% Water production
        globalProductionMult: 1.25,     // +25% all production
        costReduction: 0.3,            // -30% all building costs
        ingredientProductionMult: 1.2   // +20% ingredient production
    },
    air: {
        baseProductionMult: 1.5,      // +50% Air production
        unlockSpeedMult: 0.7,          // Unlock 30% earlier (0.7x AB requirement)
        productionSpeedMult: 1.25,      // +25% production speed
        castSpeedMult: 1.15            // +15% cast speed
    },
    crystal: {
        baseProductionMult: 1.5,      // +50% Crystal production
        universalIngredientMult: 1.25, // +25% universal ingredients
        bottleneckCostReduction: 0.4,  // -40% bottleneck costs
        crystalBuildingMult: 1.3       // +30% production from Crystal buildings
    }
}
```

---

### 3. Recipe Modifications

**Current:** All recipes are static
**New:** Specialization affects recipes

**Fire Specialization:**
- Fire buildings: -20% ingredient costs
- AB Reactors: -50% costs if Fire-heavy recipe

**Water Specialization:**
- All buildings: -30% ingredient costs
- Cross-element recipes: -20% additional cost reduction

**Air Specialization:**
- All buildings: Unlock 30% earlier (0.7x AB requirement)
- Production rates: +25% faster

**Crystal Specialization:**
- Crystal buildings: -40% ingredient costs
- Universal ingredients: 2x production rate

---

### 4. Unique Mechanics Per Path

#### 🔥 Fire Path: "Inferno Mode"
- **Trigger:** Build 10 Fire buildings
- **Effect:** 3x production for 5 minutes
- **Cooldown:** 30 minutes
- **Visual:** Buildings glow red, flames effect

#### 💧 Water Path: "Tide Pool"
- **Trigger:** Passive (always active)
- **Effect:** +10% passive resource generation
- **Scales:** +1% per Water building owned
- **Visual:** Flowing water effect around buildings

#### 💨 Air Path: "Gale Force"
- **Trigger:** Unlock new tier
- **Effect:** 2x speed for 10 minutes
- **Cooldown:** Once per tier unlock
- **Visual:** Wind particles, faster animations

#### 💎 Crystal Path: "Crystal Resonance"
- **Trigger:** Build 5 Crystal buildings
- **Effect:** All buildings +20% production
- **Duration:** Permanent (until prestige)
- **Visual:** Crystal sparkles on all buildings

---

## Required Code Changes

### 1. Add Element Specialization to GameState

```javascript
// In gameState.js
constructor() {
    // ... existing code ...
    this.elementSpecialization = null; // 'fire', 'water', 'air', 'crystal', or null
    this.specializationBonuses = {};
}

chooseElementSpecialization(element) {
    if (!['fire', 'water', 'air', 'crystal'].includes(element)) {
        return false;
    }
    this.elementSpecialization = element;
    this.specializationBonuses = ELEMENT_SPECIALIZATIONS[element];
    return true;
}
```

### 2. Modify Production Calculations

```javascript
// In gameState.js - calculateTotalProduction
calculateTotalProduction(delta, eventMultiplier = 1.0) {
    // ... existing code ...
    
    // Apply element specialization bonuses
    if (this.elementSpecialization) {
        const spec = this.specializationBonuses;
        
        // Apply element-specific production multiplier
        if (isFireElement(ingredientId)) {
            totalOutput[ingredientId] *= spec.baseProductionMult;
        }
        // ... similar for other elements ...
        
        // Apply global bonuses (Water path)
        if (this.elementSpecialization === 'water') {
            for (const [ingId, amount] of Object.entries(totalOutput)) {
                totalOutput[ingId] *= spec.globalProductionMult;
            }
        }
        
        // Apply speed bonuses (Air path)
        if (this.elementSpecialization === 'air') {
            delta *= spec.productionSpeedMult;
        }
    }
    
    return totalOutput;
}
```

### 3. Modify Building Costs

```javascript
// In gameState.js - getBuildingCost
getBuildingCost(workstationId, count = 1) {
    const workstation = PRODUCERS.find(p => p.id === workstationId);
    if (!workstation) return null;
    
    const currentOwned = this.workstations[workstationId] || 0;
    const baseRecipe = scaleRecipe(workstation.recipe, currentOwned, workstation.growth);
    
    // Apply specialization cost reductions
    if (this.elementSpecialization) {
        const spec = this.specializationBonuses;
        const element = getWorkstationElement(workstationId);
        
        if (this.elementSpecialization === 'water') {
            // Water: -30% all costs
            for (const [ingId, cost] of Object.entries(baseRecipe)) {
                baseRecipe[ingId] *= (1 - spec.costReduction);
            }
        } else if (element === this.elementSpecialization) {
            // Element-specific: -20% to -40% costs
            for (const [ingId, cost] of Object.entries(baseRecipe)) {
                baseRecipe[ingId] *= (1 - spec.costReduction);
            }
        }
    }
    
    return baseRecipe;
}
```

### 4. Modify Unlock Requirements

```javascript
// In gameState.js - isWorkstationUnlocked
isWorkstationUnlocked(workstationId) {
    const workstation = PRODUCERS.find(p => p.id === workstationId);
    if (!workstation) return false;
    
    let unlockRequirement = workstation.unlockAtAb;
    
    // Air specialization: Unlock 30% earlier
    if (this.elementSpecialization === 'air') {
        unlockRequirement *= 0.7; // 30% reduction = 0.7x multiplier
    }
    
    return this.ab >= unlockRequirement;
}
```

### 5. Add Specialization UI

```javascript
// In game.js - showAscensionChoice
function showAscensionChoice() {
    const modal = document.createElement('div');
    modal.className = 'ascension-choice-modal';
    modal.innerHTML = `
        <div class="ascension-choice-content">
            <h2>Choose Your Elemental Affinity</h2>
            <p>Select a path to specialize in. This choice will provide permanent bonuses until your next ascension.</p>
            
            <div class="element-choices">
                <div class="element-choice" data-element="fire">
                    <div class="element-icon">🔥</div>
                    <h3>Fire Path: Forge Master</h3>
                    <p>+50% Fire production<br>+25% AB from Fire reactors<br>-20% Fire building costs</p>
                </div>
                
                <div class="element-choice" data-element="water">
                    <div class="element-icon">💧</div>
                    <h3>Water Path: Flow Master</h3>
                    <p>+50% Water production<br>+25% all production<br>-30% all building costs</p>
                </div>
                
                <div class="element-choice" data-element="air">
                    <div class="element-icon">💨</div>
                    <h3>Air Path: Speed Master</h3>
                    <p>+50% Air production<br>Unlock 30% earlier<br>+25% production speed</p>
                </div>
                
                <div class="element-choice" data-element="crystal">
                    <div class="element-icon">💎</div>
                    <h3>Crystal Path: Foundation Master</h3>
                    <p>+50% Crystal production<br>+25% universal ingredients<br>-40% bottleneck costs</p>
                </div>
            </div>
        </div>
    `;
    
    // Add click handlers
    modal.querySelectorAll('.element-choice').forEach(choice => {
        choice.addEventListener('click', () => {
            const element = choice.dataset.element;
            gameState.chooseElementSpecialization(element);
            // Close modal and continue prestige
            modal.remove();
            completePrestige();
        });
    });
    
    document.body.appendChild(modal);
}
```

---

## Recipe Changes to Support Strategies

### Make Recipes Element-Specific

**Current Problem:** Recipes don't favor any element
**Solution:** Make recipes element-heavy to support specialization

#### Tier 1 Recipes (After Fix):

**Fire Path Support:**
- Digital Candle Forge: `dist_fire: 3, shaped_crys: 2` ✅ (Fire-heavy)

**Water Path Support:**
- Deep Aqua Well: `liquid_essence: 3, shaped_crys: 2` ✅ (Water-heavy)

**Air Path Support:**
- Enhanced Zephyr Generator: `ethereal_gust: 3, shaped_crys: 2` ✅ (Air-heavy)

**Crystal Path Support:**
- Crystal Orb Chamber: `shaped_crys: 3, dist_fire: 1, dist_aether: 1` (Crystal-heavy, but needs Fire)
- Aether Reactor: `dist_aether: 3, shaped_crys: 2` ✅ (Aether-heavy, but needs Crystal)

**Fix Needed:**
- Crystal Orb Chamber should be Crystal-heavy: `shaped_crys: 3, dist_fire: 1, dist_aether: 1`
- This makes it favor Crystal specialization while still needing other elements

#### Tier 2 Recipes (Already Good):

- Enhanced Candle Forge: `dig_candle: 2, crystal_orb: 1, aether_well: 1` ✅ (Fire-heavy)
- Flowing Current Well: `aqua_well: 3, crystal_orb: 2, dig_candle: 1` ✅ (Water-heavy)
- Wind Spiral Generator: `zephyr_totem: 3, crystal_orb: 2, dig_candle: 1` ✅ (Air-heavy)
- Crystal Core Chamber: `crystal_orb: 3, aether_well: 2, dig_candle: 2` ✅ (Crystal-heavy)

---

## Visual Indicators

### UI Changes:

1. **Element Indicator:**
   - Show chosen element icon in HUD
   - Color-code UI based on specialization
   - Tooltip shows active bonuses

2. **Building Highlights:**
   - Specialized element buildings glow
   - Cost reductions shown in green
   - Production bonuses shown in tooltips

3. **Stats Display:**
   - Show specialization bonuses in stats tab
   - Display element-specific multipliers
   - Show unique mechanic status

---

## Balance Considerations

### Making Strategies Equally Viable:

1. **Fire Path:**
   - Strong early game (fast AB)
   - Weak late game (less versatile)
   - **Balance:** Make AB production scale better

2. **Water Path:**
   - Strong mid game (efficiency)
   - Weak early game (no early bonuses)
   - **Balance:** Add early game efficiency bonus

3. **Air Path:**
   - Strong progression (fast unlocks)
   - Weak production (no production bonuses)
   - **Balance:** Add production speed scaling

4. **Crystal Path:**
   - Strong foundation (universal ingredients)
   - Weak specialization (less focused)
   - **Balance:** Make universal bonuses stronger

---

## Implementation Priority

### Phase 1: Core System
1. Add element specialization choice at prestige
2. Implement base production multipliers
3. Add cost reduction mechanics
4. Update UI to show specialization

### Phase 2: Recipe Changes
1. Fix Tier 1 recipe duplication
2. Make recipes element-heavy
3. Ensure each path has clear advantages

### Phase 3: Unique Mechanics
1. Implement "Inferno Mode" (Fire)
2. Implement "Tide Pool" (Water)
3. Implement "Gale Force" (Air)
4. Implement "Crystal Resonance" (Crystal)

### Phase 4: Balance & Polish
1. Balance all 4 paths
2. Add visual effects
3. Add tooltips and descriptions
4. Test all strategies

---

## Summary

This system creates **4 distinct RPG-like strategies**:

1. **🔥 Fire:** Aggressive, currency-focused, fast automation
2. **💧 Water:** Efficient, balanced, sustainable growth
3. **💨 Air:** Speed-focused, rapid progression, quick unlocks
4. **💎 Crystal:** Foundation-focused, bottleneck management, universal support

Each path offers:
- ✅ Unique bonuses
- ✅ Different playstyles
- ✅ Strategic choices
- ✅ Replayability (try different paths)
- ✅ RPG-like specialization feel

**Next Steps:**
1. Implement core specialization system
2. Fix Tier 1 recipe duplication
3. Add UI for specialization choice
4. Balance all 4 paths

