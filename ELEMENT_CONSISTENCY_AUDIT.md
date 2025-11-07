# Element Specialization Consistency Audit

## Overview
This audit reviews all game systems to ensure consistency with the newly implemented element specialization system. The goal is to make element-based strategies meaningful throughout the entire game.

---

## 🔍 Part 1: Upgrades (Inscriptions) Audit

### Current State
Upgrades are mostly generic, with some element-specific workstation upgrades. They don't strongly support element specialization strategies.

### Issues Found

#### 1. **Global Upgrades Don't Favor Elements**
- `u_global_1` (Hex Compiler v1): Recipe uses `dist_fire: 2, shaped_crys: 2, dist_aether: 1`
  - **Issue**: Balanced recipe doesn't favor any element
  - **Recommendation**: Create element-specific global upgrades OR make recipes element-heavy

#### 2. **Workstation Upgrades Are Generic**
- All workstation upgrades are simple 2x multipliers
- **Issue**: No element-specific bonuses or synergies
- **Recommendation**: Add element-specific upgrade bonuses that stack with specialization

#### 3. **Missing Element-Specific Upgrades**
- **Issue**: No upgrades that specifically boost Fire/Water/Air/Crystal production
- **Recommendation**: Add element-specific production upgrades

### Recommendations

#### Option A: Element-Specific Upgrade Paths
Create separate upgrade trees for each element:

**Fire Path Upgrades:**
- `u_fire_production_1`: +25% Fire production (recipe: `dist_fire: 5`)
- `u_fire_ab_boost`: +15% AB from Fire reactors (recipe: `dig_candle: 3, dist_fire: 2`)
- `u_fire_cost_reduction`: -10% Fire building costs (recipe: `enhanced_candle: 2, dist_fire: 3`)

**Water Path Upgrades:**
- `u_water_production_1`: +25% Water production (recipe: `liquid_essence: 5`)
- `u_water_efficiency`: +15% all production, -10% all costs (recipe: `aqua_well: 3, liquid_essence: 2`)
- `u_water_ingredient_boost`: +20% ingredient production (recipe: `flowing_current: 2, aqua_well: 3`)

**Air Path Upgrades:**
- `u_air_production_1`: +25% Air production (recipe: `ethereal_gust: 5`)
- `u_air_speed_boost`: +15% production speed (recipe: `zephyr_totem: 3, ethereal_gust: 2`)
- `u_air_unlock_boost`: Unlock 10% earlier (recipe: `wind_spiral: 2, zephyr_totem: 3`)

**Crystal Path Upgrades:**
- `u_crystal_production_1`: +25% Crystal production (recipe: `shaped_crys: 5`)
- `u_crystal_universal_boost`: +20% universal ingredients (recipe: `crystal_orb: 3, shaped_crys: 2`)
- `u_crystal_bottleneck_reduction`: -15% bottleneck costs (recipe: `crystal_core: 2, crystal_orb: 3`)

#### Option B: Element-Heavy Recipes
Make existing upgrades favor specific elements:

- `u_global_1`: Change recipe to `dist_fire: 4, shaped_crys: 1` (Fire-heavy)
- `u_global_2`: Change recipe to `liquid_essence: 3, shaped_crys: 2, dist_aether: 1` (Water-heavy)
- `u_global_3`: Change recipe to `ethereal_gust: 3, shaped_crys: 2, dist_aether: 1` (Air-heavy)
- `u_global_4`: Change recipe to `shaped_crys: 4, crystal_orb: 2, dist_aether: 1` (Crystal-heavy)

**Recommendation**: **Option A** - Create element-specific upgrade paths that synergize with specialization.

---

## 🔍 Part 2: Prestige Bonuses (Boons) Audit

### Current State
Prestige bonuses are generic and don't support element specialization.

### Issues Found

#### 1. **No Element-Specific Prestige Bonuses**
- All bonuses are generic (global production, starting AB, etc.)
- **Issue**: No way to permanently boost chosen element specialization
- **Recommendation**: Add element-specific prestige bonuses

#### 2. **Missing Specialization Synergy**
- **Issue**: Prestige bonuses don't interact with element specialization
- **Recommendation**: Add bonuses that scale with specialization choice

### Recommendations

#### Add Element-Specific Prestige Bonuses

**Fire Affinity Bonuses:**
- `pp_fire_affinity`: +5% Fire production per level (cost: 10 EK base)
- `pp_fire_ab_affinity`: +3% AB from Fire reactors per level (cost: 15 EK base)
- `pp_fire_cost_affinity`: -1% Fire building costs per level (cost: 20 EK base)

**Water Affinity Bonuses:**
- `pp_water_affinity`: +5% Water production per level (cost: 10 EK base)
- `pp_water_global_affinity`: +3% all production per level (cost: 15 EK base)
- `pp_water_efficiency_affinity`: -1% all building costs per level (cost: 20 EK base)

**Air Affinity Bonuses:**
- `pp_air_affinity`: +5% Air production per level (cost: 10 EK base)
- `pp_air_speed_affinity`: +2% production speed per level (cost: 15 EK base)
- `pp_air_unlock_affinity`: Unlock 1% earlier per level (cost: 20 EK base)

**Crystal Affinity Bonuses:**
- `pp_crystal_affinity`: +5% Crystal production per level (cost: 10 EK base)
- `pp_crystal_universal_affinity`: +3% universal ingredients per level (cost: 15 EK base)
- `pp_crystal_bottleneck_affinity`: -1% bottleneck costs per level (cost: 20 EK base)

**Specialization Synergy Bonuses:**
- `pp_specialization_mastery`: +10% specialization bonuses per level (cost: 50 EK base)
  - Only available if player has chosen a specialization
  - Multiplies all specialization bonuses by 1.1x per level

---

## 🔍 Part 3: Daily Tasks Audit

### Current State
Daily tasks are element-agnostic and don't encourage element specialization.

### Issues Found

#### 1. **No Element-Specific Tasks**
- Tasks are generic (craft workstations, own workstations, etc.)
- **Issue**: Don't encourage players to focus on their chosen element
- **Recommendation**: Add element-specific daily tasks

#### 2. **Missing Specialization Rewards**
- **Issue**: Tasks don't reward element specialization playstyle
- **Recommendation**: Add tasks that reward specializing in chosen element

### Recommendations

#### Add Element-Specific Daily Tasks

**Fire Path Tasks:**
- `d_fire_forge_master`: Craft 5 Fire Forges (reward: 10K AB + 10% Fire production buff)
- `d_fire_ab_rush`: Produce 50K AB from Fire reactors (reward: 20K AB + 15% AB production buff)
- `d_fire_inferno`: Own 10 Fire buildings (reward: 30K AB + 20% Fire production buff)

**Water Path Tasks:**
- `d_water_flow_master`: Craft 5 Water Wells (reward: 10K AB + 10% all production buff)
- `d_water_efficiency`: Own 8 buildings with -30% cost reduction (reward: 20K AB + 15% efficiency buff)
- `d_water_balance`: Own at least 2 buildings from each element (reward: 30K AB + 20% all production buff)

**Air Path Tasks:**
- `d_air_speed_master`: Unlock 3 new buildings (reward: 10K AB + 10% speed buff)
- `d_air_gale_force`: Craft 5 Air Generators (reward: 20K AB + 15% speed buff)
- `d_air_rapid_progression`: Reach 3 new tiers in one day (reward: 30K AB + 20% speed buff)

**Crystal Path Tasks:**
- `d_crystal_foundation_master`: Craft 5 Crystal Chambers (reward: 10K AB + 10% universal ingredient buff)
- `d_crystal_bottleneck`: Own 3 Crystal buildings (reward: 20K AB + 15% bottleneck reduction buff)
- `d_crystal_resonance`: Own 5 Crystal buildings (reward: 30K AB + 20% all production buff)

**Specialization-Specific Tasks:**
- `d_specialization_master`: Complete 3 tasks matching your specialization (reward: 50K AB + 25% specialization bonus buff)

---

## 🔍 Part 4: Hidden Recipes (Potions) Audit

### Current State
Hidden recipes are generic and don't support element strategies.

### Issues Found

#### 1. **No Element-Specific Potions**
- All potions are generic (production boost, speed boost, etc.)
- **Issue**: Don't support element specialization strategies
- **Recommendation**: Add element-specific potions

#### 2. **Missing Specialization Synergy**
- **Issue**: Potions don't interact with element specialization
- **Recommendation**: Add potions that enhance specialization bonuses

### Recommendations

#### Add Element-Specific Potions

**Fire Path Potions:**
- `fire_inferno_elixir`: +200% Fire production, +100% AB from Fire reactors (30 min)
  - Recipe: `dig_candle: 5, dist_fire: 10, enhanced_candle: 2`
- `fire_forge_boost`: -50% Fire building costs (1 hour)
  - Recipe: `enhanced_candle: 3, dist_fire: 5, crystal_orb: 2`

**Water Path Potions:**
- `water_tide_pool_elixir`: +150% all production, -30% all costs (1 hour)
  - Recipe: `aqua_well: 5, liquid_essence: 10, flowing_current: 2`
- `water_flow_boost`: +100% ingredient production (1 hour)
  - Recipe: `flowing_current: 3, aqua_well: 5, crystal_orb: 2`

**Air Path Potions:**
- `air_gale_force_elixir`: +200% production speed, unlock 50% earlier (1 hour)
  - Recipe: `zephyr_totem: 5, ethereal_gust: 10, wind_spiral: 2`
- `air_speed_boost`: +150% cast speed, +100% production speed (1 hour)
  - Recipe: `wind_spiral: 3, zephyr_totem: 5, crystal_orb: 2`

**Crystal Path Potions:**
- `crystal_resonance_elixir`: +200% universal ingredients, +150% Crystal production (1 hour)
  - Recipe: `crystal_orb: 5, shaped_crys: 10, crystal_core: 2`
- `crystal_bottleneck_boost`: -50% bottleneck costs, +100% Crystal building production (1 hour)
  - Recipe: `crystal_core: 3, crystal_orb: 5, dist_fire: 2`

**Specialization Synergy Potions:**
- `specialization_amplifier`: +50% all specialization bonuses (2 hours)
  - Recipe: `enhanced_candle: 3, crystal_core: 3, flowing_current: 3, wind_spiral: 3`
  - Only works if player has chosen a specialization

---

## 🔍 Part 5: Achievements Audit

### Current State
Achievements are generic and don't track element specialization.

### Issues Found

#### 1. **No Element-Specific Achievements**
- All achievements are generic (cast X times, craft X workstations, etc.)
- **Issue**: Don't reward element specialization playstyle
- **Recommendation**: Add element-specific achievements

#### 2. **Missing Specialization Tracking**
- **Issue**: No achievements for specializing in an element
- **Recommendation**: Add achievements for element specialization milestones

### Recommendations

#### Add Element-Specific Achievements

**Fire Path Achievements:**
- `fire_master`: Own 10 Fire buildings
- `fire_forge_master`: Craft 50 Fire Forges
- `fire_ab_king`: Produce 1M AB from Fire reactors
- `fire_inferno`: Activate Inferno Mode 10 times

**Water Path Achievements:**
- `water_master`: Own 10 Water buildings
- `water_flow_master`: Craft 50 Water Wells
- `water_efficiency_master`: Own 20 buildings with cost reduction
- `water_balance`: Own at least 5 buildings from each element

**Air Path Achievements:**
- `air_master`: Own 10 Air buildings
- `air_speed_master`: Craft 50 Air Generators
- `air_unlock_master`: Unlock 20 buildings early
- `air_gale_force`: Activate Gale Force 10 times

**Crystal Path Achievements:**
- `crystal_master`: Own 10 Crystal buildings
- `crystal_foundation_master`: Craft 50 Crystal Chambers
- `crystal_bottleneck_master`: Own 20 Crystal buildings
- `crystal_resonance`: Activate Crystal Resonance 10 times

**Specialization Achievements:**
- `specialization_master`: Complete 10 prestige cycles with same specialization
- `element_diversifier`: Complete prestige cycles with all 4 specializations
- `specialization_synergy`: Reach 100 specialization bonus multiplier

---

## 🔍 Part 6: Meditation System Audit

### Current State
Meditation system is separate from main game and doesn't integrate with elements.

### Issues Found

#### 1. **No Element Integration**
- Meditation towers use generic recipes
- **Issue**: Doesn't support element specialization
- **Recommendation**: Add element-specific meditation bonuses

#### 2. **Missing Specialization Synergy**
- **Issue**: Meditation doesn't interact with element specialization
- **Recommendation**: Add meditation bonuses that scale with specialization

### Recommendations

#### Add Element Integration to Meditation

**Element-Specific Meditation Bonuses:**
- If player has Fire specialization: +25% tower damage for Fire-based towers
- If player has Water specialization: +25% Focus generation, -10% tower costs
- If player has Air specialization: +25% tower attack speed, +10% Focus generation
- If player has Crystal specialization: +25% all tower production, +15% Focus generation

**Element-Specific Meditation Towers:**
- `fire_tower`: Fire-based tower (recipe: `dist_fire: 5, dig_candle: 3`)
- `water_tower`: Water-based tower (recipe: `liquid_essence: 5, aqua_well: 3`)
- `air_tower`: Air-based tower (recipe: `ethereal_gust: 5, zephyr_totem: 3`)
- `crystal_tower`: Crystal-based tower (recipe: `shaped_crys: 5, crystal_orb: 3`)

**Specialization Meditation Upgrades:**
- `med_specialization_boost`: +10% meditation bonuses per specialization level
  - Recipe: `focus: 100, [element]_material: 5` (where element matches specialization)

---

## 🔍 Part 7: UI/UX Audit

### Current State
UI shows specialization indicator but could be more prominent.

### Issues Found

#### 1. **Specialization Not Prominent Enough**
- Indicator is small and in HUD
- **Issue**: Players might not notice their specialization
- **Recommendation**: Make specialization more visible

#### 2. **Missing Element Indicators**
- **Issue**: Workstations/buildings don't show element affiliation
- **Recommendation**: Add element indicators to workstations

### Recommendations

#### UI Improvements

**Specialization Display:**
- Add large specialization icon in top-left corner
- Show active specialization bonuses in tooltip
- Add specialization progress bar (if applicable)

**Element Indicators:**
- Add element icons to workstation cards
- Color-code workstations by element
- Show element affiliation in tooltips

**Specialization Stats:**
- Add "Specialization" tab to stats
- Show specialization bonuses and multipliers
- Track element-specific production stats

---

## 📊 Summary of Recommendations

### High Priority (Implement First)

1. **Add Element-Specific Upgrades**
   - Create upgrade paths for each element
   - Make upgrades synergize with specialization

2. **Add Element-Specific Prestige Bonuses**
   - Allow players to permanently boost chosen element
   - Add specialization synergy bonuses

3. **Add Element-Specific Daily Tasks**
   - Encourage players to focus on chosen element
   - Reward specialization playstyle

### Medium Priority (Implement Second)

4. **Add Element-Specific Potions**
   - Support element strategies with temporary boosts
   - Add specialization synergy potions

5. **Add Element-Specific Achievements**
   - Track element specialization milestones
   - Reward specialization playstyle

6. **Improve UI/UX**
   - Make specialization more prominent
   - Add element indicators to workstations

### Low Priority (Implement Third)

7. **Integrate Meditation with Elements**
   - Add element-specific meditation bonuses
   - Create element-based meditation towers

---

## 🎯 Implementation Priority

**Phase 1: Core Element Support**
- Element-specific upgrades
- Element-specific prestige bonuses
- Element-specific daily tasks

**Phase 2: Element Enhancement**
- Element-specific potions
- Element-specific achievements
- UI/UX improvements

**Phase 3: Element Integration**
- Meditation element integration
- Advanced specialization features

---

## 📝 Notes

- All recommendations maintain game balance
- Element strategies should be equally viable
- Specialization should feel meaningful but not mandatory
- Players should be able to switch specializations between prestige cycles

