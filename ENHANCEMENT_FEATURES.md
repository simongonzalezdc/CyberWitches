# Cyber Witches: Future Enhancement Features

## Table of Contents

1. [Best Practices](#best-practices)
2. [Feature 1: Alchemical Elements Alignment](#feature-1-alchemical-elements-alignment)
3. [Feature 2: Progressive Design Revelation](#feature-2-progressive-design-revelation)
4. [Feature 3: Dopamine Maximization](#feature-3-dopamine-maximization)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Testing Considerations](#testing-considerations)
7. [References](#references)

---

## Best Practices

This section outlines best practices from software engineering, game design, and product management that inform the design and implementation of these enhancements.

### Software Engineering Documentation Best Practices

#### 1. Clear Structure and Organization
- **Hierarchical Structure**: Use clear headings, subheadings, and consistent formatting to guide readers through complex information
- **Table of Contents**: Provide navigation for long documents
- **Code Examples**: Include concrete code snippets and file references where applicable
- **Version Control**: Track changes and maintain historical context

**Sources**: [Atlassian Technical Documentation](https://www.atlassian.com/blog/it-teams/software-documentation-best-practices), [Swimm Documentation Best Practices](https://swimm.io/learn/software-documentation/software-documentation-best-practices-to-improve-your-docs)

#### 2. User-Centric Approach
- **Target Audience**: Tailor documentation to the technical knowledge level of developers, designers, and stakeholders
- **Examples and Use Cases**: Include real-world scenarios to illustrate practical applications
- **Acceptance Criteria**: Define clear, testable requirements for each feature

**Sources**: [BetterDocs Documentation Guide](https://betterdocs.co/good-to-great-tips-for-improving-your-documentation/)

#### 3. Maintainability
- **Regular Updates**: Keep documentation synchronized with codebase changes
- **Living Documentation**: Treat documentation as part of the development process, not an afterthought
- **Concrete File Touch Points**: Reference specific files and line numbers where changes are needed

### Game Design Best Practices

#### 1. Progressive Disclosure
- **Gradual Introduction**: Introduce game mechanics and features gradually to avoid overwhelming players
- **Tiered Unlocks**: Use milestone-based progression to reveal new content
- **Visual Progression**: Allow players to see their progress through visual changes in the game world

**Principles**: 
- Players learn better when information is presented in digestible chunks
- Visual progression provides tangible feedback for player achievements
- Unlocking new features creates anticipation and excitement

#### 2. Elemental System Integration
- **Thematic Consistency**: Ensure all elements align with the game's core theme (alchemical/magical)
- **Mechanical Balance**: Each element should have unique properties while maintaining game balance
- **Visual Differentiation**: Use distinct colors, animations, and visual styles for each element

**Alchemical Elements Reference**:
- **Fire**: Transformation, energy, passion (currently represented by candles)
- **Earth**: Stability, foundation, material (currently represented by crystals)
- **Water**: Flow, purification, life (to be implemented)
- **Air**: Movement, communication, freedom (to be implemented)
- **Aether**: Spirit, quintessence, transcendence (currently implemented)

#### 3. Reward System Design
- **Variable Ratio Rewards**: Implement unpredictable rewards to maintain player interest (Skinner Box psychology)
- **Immediate Feedback**: Provide instant visual and audio feedback for all player actions
- **Compulsion Loops**: Create action → reward → motivation cycles that encourage continued play

**Psychology Principles**:
- Dopamine release is maximized when rewards are unpredictable
- Immediate feedback reinforces positive behaviors
- Progressive challenges maintain player engagement without frustration

### Product Management Best Practices

#### 1. Feature Prioritization
- **Impact vs. Effort**: Prioritize features that provide maximum player value with reasonable implementation effort
- **User Value**: Focus on features that enhance player experience and retention
- **Technical Debt**: Balance new features with code quality and maintainability

#### 2. Implementation Roadmaps
- **Phased Approach**: Break large features into manageable phases
- **Clear Milestones**: Define measurable checkpoints for progress tracking
- **Risk Assessment**: Identify potential blockers and dependencies early

#### 3. Acceptance Criteria
- **Testable Requirements**: Define clear, measurable success criteria
- **User Stories**: Describe features from the player's perspective
- **Edge Cases**: Consider boundary conditions and error scenarios

---

## Feature 1: Alchemical Elements Alignment

### Overview

Currently, the game implements three of the five classical alchemical elements:
- **Aether**: Represented by `aether_ess`, `dist_aether`, `aether_well`, `aether_flux`, `quantum_aether`
- **Fire**: Represented by candles (`dig_candle`, `enhanced_candle`, `quantum_candle`, `arcane_candle`)
- **Earth**: Represented by crystals (`crystal_dust`, `shaped_crys`, `crystal_orb`, `crystal_core`, `void_crystal`)

This feature will add **Water** and **Air** elements to complete the elemental system and provide thematic depth and mechanical variety.

### Current State Analysis

#### Existing Element Implementations

**Standardized Tier Progression Pattern**

All 5 elements follow this consistent pattern across Tiers 0-4:
- **Tier 0**: Base essence (raw material obtained from casting)
- **Tier 1**: Refined element (2 items: refined essence + elemental item)
- **Tier 2**: Advanced element (1 item: enhanced/purified version)
- **Tier 3**: Quantum element (1 item: quantum-enhanced version)
- **Tier 4**: Void/Infinity element (1 item: ultimate legendary version)

**Tier Progression Summary Table:**

| Tier | Aether | Fire | Earth | Water | Air |
|------|--------|------|-------|-------|-----|
| **0** | `aether_ess` | `fire_essence` [NEW] | `crystal_dust` | `water_essence` | `air_essence` |
| **1** | `dist_aether`<br>`aether_well` | `dist_fire` [NEW]<br>`dig_candle` | `shaped_crys`<br>`crystal_orb` | `liquid_essence`<br>`aqua_well` | `ethereal_gust`<br>`zephyr_totem` |
| **2** | `aether_flux` | `enhanced_candle` | `crystal_core` | `flowing_current` | `wind_spiral` |
| **3** | `quantum_aether` | `quantum_candle` | `quantum_crystal` [NEW] | `quantum_water` | `quantum_air` |
| **4** | `infinity_flux` | `arcane_candle` | `void_crystal` | `void_liquid` | `void_breath` |

**Aether (Quintessence)**
- Tier 0: `aether_ess` (Aether Essence) - Base essence
- Tier 1: `dist_aether` (Distilled Aether), `aether_well` (Aether Well) - Refined essence + elemental item
- Tier 2: `aether_flux` (Aether Flux) - Advanced flux
- Tier 3: `quantum_aether` (Quantum Aether) - Quantum-enhanced
- Tier 4: `infinity_flux` (Infinity Flux) - Ultimate legendary
- Producers: Aether Still (`ws_still`), Aether Well (`ws_cauldron`), Aether Flux Reactor (`ws_fluxreactor`), Quantum Aether Chamber (`ws_quantumlab_aether`), Infinity Flux Core (`ws_infinitycore`)
- Theme: Spirit, quintessence, transcendence

**Fire (Candles)**
- Tier 0: `fire_essence` (Fire Essence) - Base essence [NEW - needs implementation]
- Tier 1: `dist_fire` (Distilled Fire), `dig_candle` (Digital Candle) - Refined essence + elemental item [UPDATED]
- Tier 2: `enhanced_candle` (Enhanced Candle) - Advanced candle
- Tier 3: `quantum_candle` (Quantum Candle) - Quantum-enhanced
- Tier 4: `arcane_candle` (Arcane Candle) - Ultimate legendary
- Producers: Fire Still (`ws_fire_still`) [NEW], Digital Candle Forge (`ws_digcandle_forge`), Enhanced Candle Forge (`ws_digcandle_forge_t2`), Quantum Candle Forge (`ws_quantumlab_candle`), Arcane Candle Tower (`ws_arcanetower`)
- Theme: Light, energy, transformation

**Earth (Crystals)**
- Tier 0: `crystal_dust` (Crystal Dust) - Base essence
- Tier 1: `shaped_crys` (Shaped Crystal), `crystal_orb` (Crystal Orb) - Refined essence + elemental item
- Tier 2: `crystal_core` (Crystal Core) - Advanced core
- Tier 3: `quantum_crystal` (Quantum Crystal) - Quantum-enhanced [NEW - needs implementation]
- Tier 4: `void_crystal` (Void Crystal) - Ultimate legendary
- Producers: Crystal Shaper (`ws_shaper`), Crystal Orb Forge (`ws_crystal`), Crystal Core Forge (`ws_coreforge`), Quantum Crystal Chamber (`ws_quantum_crystal`) [NEW], Void Crystal Chamber (`ws_voidchamber`)
- Theme: Stability, structure, foundation

### Water Element Design

#### Thematic Identity
Water represents flow, purification, healing, and life. In alchemical tradition, water is associated with dissolution, transformation, and the emotional realm.

#### Proposed Items and Mechanics

**Standardized Tier Progression** (matching all 5 elements):
- **Tier 0**: `water_essence` (Water Essence) - Base essence
- **Tier 1**: `liquid_essence` (Liquid Essence), `aqua_well` (Aqua Well) - Refined essence + elemental item
- **Tier 2**: `flowing_current` (Flowing Current) - Advanced current
- **Tier 3**: `quantum_water` (Quantum Water) - Quantum-enhanced
- **Tier 4**: `void_liquid` (Void Liquid) - Ultimate legendary

#### Water Producers (Workstations)

**Standardized Producer Pattern** (matching all 5 elements):
- **Tier 0**: Aqua Collector (`ws_aqua_collector`) - Produces `liquid_essence` from `water_essence`
- **Tier 1**: Aqua Well (`ws_aqua_well`) - Produces `aqua_well` from `liquid_essence` + other elements
- **Tier 2**: Flowing Current Generator (`ws_flowing_current`) - Produces `flowing_current` from `aqua_well` + other elements
- **Tier 3**: Quantum Water Chamber (`ws_quantum_water`) - Produces `quantum_water` from `flowing_current` + quantum elements
- **Tier 4**: Void Liquid Core (`ws_void_liquid`) - Produces `void_liquid` from `quantum_water` + void elements

**Detailed Producer Specifications:**
- **Tier 0**: Aqua Collector (`ws_aqua_collector`)
  - Unlock: 50 AB (parallel to Aether Still)
  - Recipe: `{ water_essence: 10 }`
  - Output: `liquid_essence: 0.20/s`
  - Growth: 1.12

- **Tier 1**: Aqua Well (`ws_aqua_well`)
  - Unlock: 1000 AB (matching other Tier 1 producers)
  - Recipe: `{ liquid_essence: 3, shaped_crys: 2 }`
  - Output: `aqua_well: 0.4/s`
  - Growth: 1.15

- **Tier 2**: Flowing Current Generator (`ws_flowing_current`)
  - Unlock: 15000 AB (matching other Tier 2 producers)
  - Recipe: `{ aqua_well: 3, crystal_core: 2, enhanced_candle: 1 }`
  - Output: `flowing_current: 0.4/s`
  - Growth: 1.17

- **Tier 3**: Quantum Water Chamber (`ws_quantum_water`)
  - Unlock: 400000 AB (matching other Tier 3 producers)
  - Recipe: `{ flowing_current: 4, quantum_essence: 2, quantum_candle: 2 }`
  - Output: `quantum_water: 0.2/s`
  - Growth: 1.22

- **Tier 4**: Void Liquid Core (`ws_void_liquid`)
  - Unlock: 15000000 AB (matching other Tier 4 producers)
  - Recipe: `{ quantum_water: 5, void_crystal: 3, arcane_candle: 2 }`
  - Output: `void_liquid: 0.05/s`
  - Growth: 1.27

#### Visual Design
- **Color Scheme**: Blue (#22E3FF), Cyan (#00FFFF), Deep Blue (#0066CC)
- **Animations**: Flowing, rippling effects; droplet particles; water surface animations
- **Icons**: Chalice, fountain, droplet, wave symbols

#### Gameplay Function
- **Purification**: Water-based items can be used in recipes that "cleanse" or enhance other ingredients
- **Flow Mechanics**: Water items increase production speed or reduce crafting time
- **Healing/Regeneration**: Water can provide passive regeneration bonuses
- **Recipe Integration**: Water items can be used as alternative ingredients in existing recipes

### Air Element Design

#### Thematic Identity
Air represents movement, communication, freedom, and the mental realm. In alchemical tradition, air is associated with breath, wind, and the connection between heaven and earth.

#### Proposed Items and Mechanics

**Standardized Tier Progression** (matching all 5 elements):
- **Tier 0**: `air_essence` (Air Essence) - Base essence
- **Tier 1**: `ethereal_gust` (Ethereal Gust), `zephyr_totem` (Zephyr Totem) - Refined essence + elemental item
- **Tier 2**: `wind_spiral` (Wind Spiral) - Advanced spiral
- **Tier 3**: `quantum_air` (Quantum Air) - Quantum-enhanced
- **Tier 4**: `void_breath` (Void Breath) - Ultimate legendary

#### Air Producers (Workstations)

**Standardized Producer Pattern** (matching all 5 elements):
- **Tier 0**: Zephyr Collector (`ws_zephyr_collector`) - Produces `ethereal_gust` from `air_essence`
- **Tier 1**: Zephyr Generator (`ws_zephyr_generator`) - Produces `zephyr_totem` from `ethereal_gust` + other elements
- **Tier 2**: Wind Spiral Forge (`ws_wind_spiral`) - Produces `wind_spiral` from `zephyr_totem` + other elements
- **Tier 3**: Quantum Air Chamber (`ws_quantum_air`) - Produces `quantum_air` from `wind_spiral` + quantum elements
- **Tier 4**: Void Breath Core (`ws_void_breath`) - Produces `void_breath` from `quantum_air` + void elements

**Detailed Producer Specifications:**
- **Tier 0**: Zephyr Collector (`ws_zephyr_collector`)
  - Unlock: 75 AB (slightly after Aether Still)
  - Recipe: `{ air_essence: 10 }`
  - Output: `ethereal_gust: 0.20/s`
  - Growth: 1.12

- **Tier 1**: Zephyr Generator (`ws_zephyr_generator`)
  - Unlock: 1200 AB (matching other Tier 1 producers)
  - Recipe: `{ ethereal_gust: 3, shaped_crys: 2 }`
  - Output: `zephyr_totem: 0.4/s`
  - Growth: 1.15

- **Tier 2**: Wind Spiral Forge (`ws_wind_spiral`)
  - Unlock: 18000 AB (matching other Tier 2 producers)
  - Recipe: `{ zephyr_totem: 3, crystal_core: 2, enhanced_candle: 1 }`
  - Output: `wind_spiral: 0.4/s`
  - Growth: 1.17

- **Tier 3**: Quantum Air Chamber (`ws_quantum_air`)
  - Unlock: 500000 AB (matching other Tier 3 producers)
  - Recipe: `{ wind_spiral: 4, quantum_essence: 2, quantum_candle: 2 }`
  - Output: `quantum_air: 0.2/s`
  - Growth: 1.22

- **Tier 4**: Void Breath Core (`ws_void_breath`)
  - Unlock: 20000000 AB (matching other Tier 4 producers)
  - Recipe: `{ quantum_air: 5, void_crystal: 3, arcane_candle: 2 }`
  - Output: `void_breath: 0.05/s`
  - Growth: 1.27

#### Visual Design
- **Color Scheme**: Light Blue (#88D8FF), White (#FFFFFF), Silver (#C0C0C0), Transparent effects
- **Animations**: Floating particles, swirling winds, transparency effects, gentle movement
- **Icons**: Wind chimes, feathers, spirals, cloud symbols

#### Gameplay Function
- **Speed Boosts**: Air-based items increase casting speed or reduce wait times
- **Reveal Mechanics**: Air items can reveal hidden recipes or provide information
- **Movement**: Air items can provide bonuses to production efficiency
- **Recipe Integration**: Air items can be used as alternative ingredients in existing recipes

### Integration with Existing Systems

#### Recipe Updates

**Enhanced Recipes** (combining all 5 elements):
- **Tier 1**: Digital Candle Forge could accept `liquid_essence` or `ethereal_gust` as alternatives to `dist_aether`
- **Tier 2**: Enhanced recipes could require combinations of elements (e.g., `enhanced_candle` + `aqua_well` + `zephyr_totem`)
- **Tier 3**: Master recipes could require all 5 elements for maximum efficiency
- **Tier 4**: Legendary recipes could create "Quintessence" items that combine all elements

#### New Combination Recipes

**Elemental Fusion** (new recipe type):
- **Quintessence Orb**: `aether_well` + `dig_candle` + `crystal_orb` + `aqua_well` + `zephyr_totem`
- **Elemental Harmony**: Provides bonuses when all 5 elements are balanced in production

#### Upgrade Integration

New upgrades could be added:
- **Water Purification**: Increases efficiency of water-based producers
- **Air Current Optimization**: Increases efficiency of air-based producers
- **Elemental Balance**: Bonus when all 5 elements are in production
- **Elemental Fusion Mastery**: Unlocks combination recipes

### Technical Implementation

#### File: `js/data.js`

**Add to INGREDIENTS array (following standardized pattern):**
```javascript
// Tier 0 - Base ingredients (Water) - Base essence
{ id: "water_essence", displayName: "Water Essence", tier: 0 },

// Tier 0 - Base ingredients (Air) - Base essence
{ id: "air_essence", displayName: "Air Essence", tier: 0 },

// Tier 1 - Refined ingredients (Water) - Refined essence + elemental item
{ id: "liquid_essence", displayName: "Liquid Essence", tier: 1 },
{ id: "aqua_well", displayName: "Aqua Well", tier: 1 },

// Tier 1 - Refined ingredients (Air) - Refined essence + elemental item
{ id: "ethereal_gust", displayName: "Ethereal Gust", tier: 1 },
{ id: "zephyr_totem", displayName: "Zephyr Totem", tier: 1 },

// Tier 2 - Advanced ingredients (Water) - Advanced version
{ id: "flowing_current", displayName: "Flowing Current", tier: 2 },

// Tier 2 - Advanced ingredients (Air) - Advanced version
{ id: "wind_spiral", displayName: "Wind Spiral", tier: 2 },

// Tier 3 - Master ingredients (Water) - Quantum-enhanced
{ id: "quantum_water", displayName: "Quantum Water", tier: 3 },

// Tier 3 - Master ingredients (Air) - Quantum-enhanced
{ id: "quantum_air", displayName: "Quantum Air", tier: 3 },

// Tier 4 - Legendary ingredients (Water) - Ultimate legendary
{ id: "void_liquid", displayName: "Void Liquid", tier: 4 },

// Tier 4 - Legendary ingredients (Air) - Ultimate legendary
{ id: "void_breath", displayName: "Void Breath", tier: 4 },
```

**Add to PRODUCERS array (following standardized pattern):**
```javascript
// Water Producers - Tier 0: Base essence to refined essence
{
    id: "ws_aqua_collector",
    displayName: "Aqua Collector",
    unlockAtAb: 50.0,
    recipe: { water_essence: 10 },
    growth: 1.12,
    outputs: { liquid_essence: 0.20 }
},
// Water Producers - Tier 1: Refined essence to elemental item
{
    id: "ws_aqua_well",
    displayName: "Aqua Well",
    unlockAtAb: 1000.0,
    recipe: { liquid_essence: 3, shaped_crys: 2 },
    growth: 1.15,
    outputs: { aqua_well: 0.4 }
},
// Water Producers - Tier 2: Advanced element
{
    id: "ws_flowing_current",
    displayName: "Flowing Current Generator",
    unlockAtAb: 15000.0,
    recipe: { aqua_well: 3, crystal_core: 2, enhanced_candle: 1 },
    growth: 1.17,
    outputs: { flowing_current: 0.4 }
},
// Water Producers - Tier 3: Quantum-enhanced
{
    id: "ws_quantum_water",
    displayName: "Quantum Water Chamber",
    unlockAtAb: 400000.0,
    recipe: { flowing_current: 4, quantum_essence: 2, quantum_candle: 2 },
    growth: 1.22,
    outputs: { quantum_water: 0.2 }
},
// Water Producers - Tier 4: Ultimate legendary
{
    id: "ws_void_liquid",
    displayName: "Void Liquid Core",
    unlockAtAb: 15000000.0,
    recipe: { quantum_water: 5, void_crystal: 3, arcane_candle: 2 },
    growth: 1.27,
    outputs: { void_liquid: 0.05 }
},

// Air Producers - Tier 0: Base essence to refined essence
{
    id: "ws_zephyr_collector",
    displayName: "Zephyr Collector",
    unlockAtAb: 75.0,
    recipe: { air_essence: 10 },
    growth: 1.12,
    outputs: { ethereal_gust: 0.20 }
},
// Air Producers - Tier 1: Refined essence to elemental item
{
    id: "ws_zephyr_generator",
    displayName: "Zephyr Generator",
    unlockAtAb: 1200.0,
    recipe: { ethereal_gust: 3, shaped_crys: 2 },
    growth: 1.15,
    outputs: { zephyr_totem: 0.4 }
},
// Air Producers - Tier 2: Advanced element
{
    id: "ws_wind_spiral",
    displayName: "Wind Spiral Forge",
    unlockAtAb: 18000.0,
    recipe: { zephyr_totem: 3, crystal_core: 2, enhanced_candle: 1 },
    growth: 1.17,
    outputs: { wind_spiral: 0.4 }
},
// Air Producers - Tier 3: Quantum-enhanced
{
    id: "ws_quantum_air",
    displayName: "Quantum Air Chamber",
    unlockAtAb: 500000.0,
    recipe: { wind_spiral: 4, quantum_essence: 2, quantum_candle: 2 },
    growth: 1.22,
    outputs: { quantum_air: 0.2 }
},
// Air Producers - Tier 4: Ultimate legendary
{
    id: "ws_void_breath",
    displayName: "Void Breath Core",
    unlockAtAb: 20000000.0,
    recipe: { quantum_air: 5, void_crystal: 3, arcane_candle: 2 },
    growth: 1.27,
    outputs: { void_breath: 0.05 }
},
```

#### File: `js/gameState.js`

**Update Cast function to include water and air essence:**
```javascript
// In the cast() function, add water_essence and air_essence to the rewards
// This should be done alongside existing wax_bits, wick_fiber, crystal_dust, aether_ess
```

#### File: `styles.css`

**Add water and air color variables:**
```css
:root {
    /* Water Colors */
    --water-primary: #22E3FF;
    --water-secondary: #00FFFF;
    --water-dark: #0066CC;
    
    /* Air Colors */
    --air-primary: #88D8FF;
    --air-secondary: #FFFFFF;
    --air-light: #E0F4FF;
}
```

### Acceptance Criteria

1. **Water Element Implementation**
   - [ ] All water ingredients are defined in `js/data.js`
   - [ ] All water producers are defined and functional
   - [ ] Water items appear in inventory and crafting interfaces
   - [ ] Water items have blue/cyan visual styling
   - [ ] Water items can be obtained from casting
   - [ ] Water producers unlock at appropriate AB thresholds

2. **Air Element Implementation**
   - [ ] All air ingredients are defined in `js/data.js`
   - [ ] All air producers are defined and functional
   - [ ] Air items appear in inventory and crafting interfaces
   - [ ] Air items have light blue/white visual styling
   - [ ] Air items can be obtained from casting
   - [ ] Air producers unlock at appropriate AB thresholds

3. **Integration**
   - [ ] Water and air items can be used in existing recipes (where appropriate)
   - [ ] New combination recipes work correctly
   - [ ] Game balance is maintained (no broken economies)
   - [ ] Visual styling is consistent with existing elements
   - [ ] All 5 elements are represented in the game

4. **Testing**
   - [ ] Players can craft water and air workstations
   - [ ] Water and air items are produced correctly
   - [ ] Recipes using water/air items work as expected
   - [ ] No console errors or bugs
   - [ ] Save/load functionality preserves water/air items

---

## Feature 2: Progressive Design Revelation

### Overview

This feature implements a tiered system that progressively reveals the game's visual and audio design as players progress. Starting with a minimal, monochrome CLI-terminal aesthetic, the game gradually unlocks color, sound, motion, and music as players achieve milestones.

### Design Philosophy

The progressive revelation system serves multiple purposes:
1. **Unique First Impression**: The minimal design creates a distinctive, memorable experience
2. **Tangible Progression**: Players can see their progress reflected in the game's appearance
3. **Performance Optimization**: Lower tiers are more performant, suitable for low-end devices
4. **Accessibility**: Players can choose to remain at lower tiers if preferred
5. **Narrative Integration**: The visual progression tells a story of awakening and discovery

### Tier System Design

#### Tier 0: Minimal/CLI Terminal (Default State)

**Visual Design:**
- **Color Scheme**: Monochrome black and white only
- **Typography**: Monospace font (Courier New, Consolas, or 'Fira Code')
- **UI Elements**: Terminal-style interface with ASCII art elements
- **Background**: Solid black (#000000) or very dark gray (#0A0A0A)
- **Text**: White (#FFFFFF) on black background
- **Borders**: Simple ASCII characters (─, │, ┌, ┐, └, ┘) or solid lines
- **Icons**: ASCII representations (e.g., `[AB]`, `[C]` for currency and cast button)

**Audio:**
- No sound effects
- No background music
- Silent operation

**Animations:**
- Minimal or no animations
- Text-only updates
- No particle effects
- No glow effects

**Unlock Condition:**
- Starting state (default)
- No unlock required

**Implementation:**
- CSS class: `.tier-0` applied to `body` element
- Override all color variables with monochrome equivalents
- Disable all animations and effects
- Use monospace font stack

#### Tier 1: Basic Color (Unlock: First Achievement or 100 AB)

**Visual Design:**
- **Color Scheme**: Introduction of primary colors
  - Primary Pink: #FF2DAA
  - Secondary Cyan: #22E3FF
  - Accent Gold: #FFDB6E
  - Success Teal: #3CE3C5
- **Typography**: Mix of monospace and sans-serif (gradual transition)
- **UI Elements**: Color-coded buttons and elements
- **Background**: Dark gradient with subtle color hints
- **Icons**: Basic colored icons begin to appear

**Audio:**
- Still no sound effects (preparing for Tier 2)

**Animations:**
- Minimal color transitions
- Simple hover effects
- No particle effects yet

**Unlock Condition:**
- First achievement unlocked OR
- Reaching 100 AB total
- Achievement: "First Colors" - Unlock Tier 1 design

**Implementation:**
- CSS class: `.tier-1` applied to `body` element
- Enable color CSS variables
- Add color transition animations
- Display unlock notification: "✨ Colors Awakened ✨"

**Transition Animation:**
- Smooth color fade-in over 2 seconds
- Notification toast with achievement-style message

#### Tier 2: Basic Sound Effects (Unlock: First Prestige or 1000 AB)

**Visual Design:**
- Same as Tier 1 (color scheme maintained)

**Audio:**
- Basic sound effects enabled:
  - Cast button click sound
  - Purchase success sound
  - Achievement unlock sound
  - Error/warning sound
- Volume controls appear in settings
- Mute toggle available

**Animations:**
- Same as Tier 1

**Unlock Condition:**
- First prestige completed OR
- Reaching 1000 AB total
- Achievement: "First Sounds" - Unlock Tier 2 audio

**Implementation:**
- Integrate with existing `audioSystem.js`
- Enable sound effects playback
- Add audio settings to settings modal
- Display unlock notification: "🔊 Sounds Awakened 🔊"

**Transition:**
- Test sound plays on unlock
- Volume slider appears in settings

#### Tier 3: Advanced Graphics/Motion (Unlock: Second Prestige or 10,000 AB)

**Visual Design:**
- Full color scheme with all gradients
- Enhanced visual effects:
  - Particle effects on cast
  - Glow effects on buttons
  - Screen shake on achievements
  - Celebration animations
- Smooth transitions and animations
- Enhanced typography with decorative fonts

**Audio:**
- Enhanced sound effects (more variety)
- Same as Tier 2

**Animations:**
- Full particle effects system
- Screen shake effects
- Celebration animations
- Smooth UI transitions
- Hover animations
- Pulse effects

**Unlock Condition:**
- Second prestige completed OR
- Reaching 10,000 AB total
- Achievement: "First Motion" - Unlock Tier 3 graphics

**Implementation:**
- Enable `animations.js` and `particleEffects.js` features
- Add motion classes to UI elements
- Display unlock notification: "✨ Motion Awakened ✨"

**Transition:**
- Particle burst animation on unlock
- All animations gradually activate

#### Tier 4: Enhanced Audio/Music (Unlock: Third Prestige or 100,000 AB)

**Visual Design:**
- Same as Tier 3 (full graphics)

**Audio:**
- Background music tracks enabled
- Ambient soundscapes
- Layered audio effects
- Music volume controls (separate from SFX)
- Multiple music tracks for different game states

**Animations:**
- Same as Tier 3

**Unlock Condition:**
- Third prestige completed OR
- Reaching 100,000 AB total
- Achievement: "First Music" - Unlock Tier 4 audio

**Implementation:**
- Extend `audioSystem.js` with music playback
- Add music tracks
- Add music volume slider to settings
- Display unlock notification: "🎵 Music Awakened 🎵"

**Transition:**
- Background music fades in smoothly
- Music selection UI appears

### Technical Implementation

#### File: `js/designTierSystem.js` (New File)

```javascript
/**
 * Design Tier System - Manages progressive revelation of game design
 */

export class DesignTierSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTier = this.loadTier();
        this.unlockedTiers = new Set([0]); // Tier 0 always unlocked
    }
    
    /**
     * Check if a tier should be unlocked based on game state
     */
    checkTierUnlocks() {
        const ab = this.gameState.arcaneBits;
        const achievements = this.gameState.achievements || [];
        const prestigeCount = this.gameState.prestigeCount || 0;
        
        // Tier 1: First achievement or 100 AB
        if (!this.unlockedTiers.has(1)) {
            if (achievements.length > 0 || ab >= 100) {
                this.unlockTier(1);
            }
        }
        
        // Tier 2: First prestige or 1000 AB
        if (!this.unlockedTiers.has(2)) {
            if (prestigeCount >= 1 || ab >= 1000) {
                this.unlockTier(2);
            }
        }
        
        // Tier 3: Second prestige or 10,000 AB
        if (!this.unlockedTiers.has(3)) {
            if (prestigeCount >= 2 || ab >= 10000) {
                this.unlockTier(3);
            }
        }
        
        // Tier 4: Third prestige or 100,000 AB
        if (!this.unlockedTiers.has(4)) {
            if (prestigeCount >= 3 || ab >= 100000) {
                this.unlockTier(4);
            }
        }
    }
    
    /**
     * Unlock a tier and apply its effects
     */
    unlockTier(tier) {
        if (this.unlockedTiers.has(tier)) return;
        
        this.unlockedTiers.add(tier);
        this.currentTier = Math.max(this.currentTier, tier);
        this.applyTier(tier);
        this.saveTier();
        this.showUnlockNotification(tier);
    }
    
    /**
     * Apply tier visual and audio settings
     */
    applyTier(tier) {
        const body = document.body;
        
        // Remove all tier classes
        body.classList.remove('tier-0', 'tier-1', 'tier-2', 'tier-3', 'tier-4');
        
        // Apply current tier class
        body.classList.add(`tier-${tier}`);
        
        // Apply tier-specific settings
        switch(tier) {
            case 0:
                this.applyTier0();
                break;
            case 1:
                this.applyTier1();
                break;
            case 2:
                this.applyTier2();
                break;
            case 3:
                this.applyTier3();
                break;
            case 4:
                this.applyTier4();
                break;
        }
    }
    
    applyTier0() {
        // Monochrome mode
        document.documentElement.style.setProperty('--primary', '#FFFFFF');
        document.documentElement.style.setProperty('--secondary', '#FFFFFF');
        document.documentElement.style.setProperty('--accent', '#FFFFFF');
        document.documentElement.style.setProperty('--success', '#FFFFFF');
        // Disable animations
        document.body.classList.add('no-animations');
    }
    
    applyTier1() {
        // Enable colors
        document.documentElement.style.setProperty('--primary', '#FF2DAA');
        document.documentElement.style.setProperty('--secondary', '#22E3FF');
        document.documentElement.style.setProperty('--accent', '#FFDB6E');
        document.documentElement.style.setProperty('--success', '#3CE3C5');
        document.body.classList.remove('no-animations');
        document.body.classList.add('color-transitions');
    }
    
    applyTier2() {
        // Enable sound effects
        if (window.audioSystem) {
            window.audioSystem.enableSoundEffects();
        }
    }
    
    applyTier3() {
        // Enable animations and particle effects
        document.body.classList.add('full-animations');
        if (window.particleSystem) {
            window.particleSystem.enable();
        }
    }
    
    applyTier4() {
        // Enable background music
        if (window.audioSystem) {
            window.audioSystem.enableMusic();
        }
    }
    
    /**
     * Show unlock notification
     */
    showUnlockNotification(tier) {
        const messages = {
            1: { title: '✨ Colors Awakened ✨', message: 'The world gains color...' },
            2: { title: '🔊 Sounds Awakened 🔊', message: 'Silence is broken...' },
            3: { title: '✨ Motion Awakened ✨', message: 'The world comes alive...' },
            4: { title: '🎵 Music Awakened 🎵', message: 'Harmony fills the air...' }
        };
        
        const msg = messages[tier];
        if (msg && window.showNotification) {
            window.showNotification(msg.title, 'success');
            setTimeout(() => {
                window.showNotification(msg.message, 'info');
            }, 2000);
        }
    }
    
    /**
     * Load tier from save
     */
    loadTier() {
        const saved = localStorage.getItem('cw.designTier');
        if (saved !== null) {
            return parseInt(saved, 10);
        }
        return 0; // Default to Tier 0
    }
    
    /**
     * Save tier to localStorage
     */
    saveTier() {
        localStorage.setItem('cw.designTier', this.currentTier.toString());
        localStorage.setItem('cw.unlockedTiers', JSON.stringify(Array.from(this.unlockedTiers)));
    }
    
    /**
     * Get current tier
     */
    getCurrentTier() {
        return this.currentTier;
    }
    
    /**
     * Set tier manually (for settings/preferences)
     */
    setTier(tier) {
        if (this.unlockedTiers.has(tier)) {
            this.currentTier = tier;
            this.applyTier(tier);
            this.saveTier();
        }
    }
}
```

#### File: `js/game.js`

**Integration:**
```javascript
import { DesignTierSystem } from './designTierSystem.js';

// In initUI() or similar initialization function:
let designTierSystem;

// Initialize design tier system
designTierSystem = new DesignTierSystem(gameState);

// Check for tier unlocks periodically
setInterval(() => {
    designTierSystem.checkTierUnlocks();
}, 5000); // Check every 5 seconds

// Apply initial tier
designTierSystem.applyTier(designTierSystem.getCurrentTier());
```

#### File: `styles.css`

**Tier-specific styles:**
```css
/* Tier 0 - Monochrome */
body.tier-0 {
    color: #FFFFFF;
    background: #000000;
    font-family: 'Courier New', 'Consolas', 'Fira Code', monospace;
}

body.tier-0 * {
    color: #FFFFFF !important;
    background: transparent !important;
    border-color: #FFFFFF !important;
    box-shadow: none !important;
    text-shadow: none !important;
}

body.tier-0 .btn-primary,
body.tier-0 .btn-cast {
    background: #000000 !important;
    border: 1px solid #FFFFFF !important;
    color: #FFFFFF !important;
}

body.tier-0 .no-animations * {
    animation: none !important;
    transition: none !important;
}

/* Tier 1 - Basic Color */
body.tier-1 {
    /* Colors are enabled via CSS variables */
    transition: color 2s ease, background 2s ease;
}

body.tier-1 .color-transitions {
    transition: all 0.3s ease;
}

/* Tier 3 - Full Animations */
body.tier-3 .full-animations {
    /* All animations enabled */
}

body.tier-3 .full-animations * {
    transition: all var(--transition-normal);
}
```

#### File: `index.html`

**Settings Modal Addition:**
```html
<!-- In settings modal -->
<div class="settings-section">
    <h3>Design Tier</h3>
    <p>Current Tier: <span id="current-tier-display">0</span></p>
    <select id="tier-selector">
        <option value="0">Tier 0: Minimal</option>
        <option value="1">Tier 1: Basic Color</option>
        <option value="2">Tier 2: Sound Effects</option>
        <option value="3">Tier 3: Full Graphics</option>
        <option value="4">Tier 4: Music</option>
    </select>
    <p class="settings-note">You can only select tiers you've unlocked</p>
</div>
```

### User Experience Considerations

#### Unlock Notifications
- Clear, celebratory notifications when tiers unlock
- Achievement-style popups with tier-specific messages
- Visual feedback (particle effects, screen shake) on unlock

#### Settings Integration
- Players can manually select unlocked tiers in settings
- Preference persists across sessions
- Clear indication of which tiers are locked vs. unlocked

#### Accessibility
- Respect user preferences for reduced motion
- Tier 0 provides minimal distractions for focus
- Sound can be toggled independently of tier

#### Performance
- Lower tiers are more performant
- Tier 0 ideal for low-end devices
- Players can choose tier based on device capabilities

### Acceptance Criteria

1. **Tier 0 (Default)**
   - [ ] Game starts in monochrome mode
   - [ ] All colors are black/white
   - [ ] Monospace font is used
   - [ ] No animations or effects
   - [ ] No sound effects

2. **Tier 1 Unlock**
   - [ ] Tier 1 unlocks when first achievement is earned OR 100 AB reached
   - [ ] Colors are introduced smoothly
   - [ ] Color transition animation plays
   - [ ] Unlock notification appears
   - [ ] Achievement is recorded

3. **Tier 2 Unlock**
   - [ ] Tier 2 unlocks when first prestige is completed OR 1000 AB reached
   - [ ] Sound effects are enabled
   - [ ] Audio settings appear in settings modal
   - [ ] Unlock notification appears
   - [ ] Achievement is recorded

4. **Tier 3 Unlock**
   - [ ] Tier 3 unlocks when second prestige is completed OR 10,000 AB reached
   - [ ] Particle effects are enabled
   - [ ] Animations are enabled
   - [ ] Unlock notification appears
   - [ ] Achievement is recorded

5. **Tier 4 Unlock**
   - [ ] Tier 4 unlocks when third prestige is completed OR 100,000 AB reached
   - [ ] Background music is enabled
   - [ ] Music controls appear in settings
   - [ ] Unlock notification appears
   - [ ] Achievement is recorded

6. **Settings Integration**
   - [ ] Players can manually select unlocked tiers
   - [ ] Tier selection persists across sessions
   - [ ] Locked tiers are clearly indicated
   - [ ] Settings reflect current tier

7. **Performance**
   - [ ] Lower tiers perform better on low-end devices
   - [ ] No performance degradation when unlocking tiers
   - [ ] Animations respect reduced motion preferences

---

## Feature 3: Dopamine Maximization

### Overview

This feature implements psychological principles and game design patterns to maximize player engagement and satisfaction through strategic dopamine release. By leveraging variable rewards, compulsion loops, immediate feedback, and social elements, the game creates a highly engaging experience that encourages continued play.

### Core Principles

#### 1. Variable Reward Schedules (Skinner Box Psychology)
Unpredictable rewards trigger stronger dopamine release than predictable ones. The brain releases more dopamine when outcomes are uncertain.

**Implementation:**
- Random bonus multipliers on casting
- Surprise ingredients from experiments
- Hidden achievements with rare rewards
- Time-limited bonus events with variable rewards

#### 2. Compulsion Loops
Action → Reward → Motivation cycles that create self-reinforcing gameplay patterns.

**Current Loop:**
```
Cast → Gain Resources → Craft Workstation → 
Increase Production → Gain More Resources → 
Unlock Upgrades → Progress → Cast Again
```

**Enhancements:**
- Shorter loops for immediate gratification
- Longer loops for sustained engagement
- Multiple parallel loops for varied experiences

#### 3. Progressive Challenges
Maintain optimal difficulty curve (Flow State) where challenges match player skill level.

**Implementation:**
- Dynamic difficulty scaling
- Milestone rewards at key progression points
- Tiered achievements with increasing rewards
- Challenge modes with special rewards

#### 4. Immediate Feedback
Provide instant visual and audio confirmation for all player actions.

**Implementation:**
- Particle effects for all actions
- Sound effects for all interactions
- Visual animations for progress
- Celebration animations for achievements

#### 5. Social Elements
Leverage social psychology for additional engagement.

**Implementation:**
- Coven competitions
- Leaderboard rankings
- Collaborative achievements
- Social sharing of milestones

### Implementation Strategies

#### Variable Rewards System

**1. Random Cast Bonuses**
- **Mechanic**: Occasionally (5-10% chance) cast gives 2x-5x bonus resources
- **Visual Feedback**: Special particle effect, screen flash, notification
- **Audio Feedback**: Special sound effect for bonus
- **Implementation**: Modify `cast()` function in `gameState.js`

```javascript
// In gameState.js cast() function
cast() {
    const baseReward = this.calculateCastReward();
    
    // Variable reward: 5% chance for bonus
    const bonusRoll = Math.random();
    let multiplier = 1.0;
    let bonusType = null;
    
    if (bonusRoll < 0.05) {
        // 5% chance for 2x-5x bonus
        multiplier = 2 + Math.random() * 3; // 2.0 to 5.0
        bonusType = 'jackpot';
    } else if (bonusRoll < 0.15) {
        // 10% chance for 1.5x bonus
        multiplier = 1.5;
        bonusType = 'bonus';
    }
    
    const finalReward = baseReward * multiplier;
    
    // Apply rewards...
    
    // Trigger bonus feedback
    if (bonusType) {
        this.triggerBonusFeedback(bonusType, multiplier);
    }
}
```

**2. Surprise Experiment Results**
- **Mechanic**: Experiments have chance to discover rare ingredients or hidden recipes
- **Visual Feedback**: Special discovery animation, rare item glow
- **Audio Feedback**: Discovery sound effect
- **Implementation**: Enhance `experiment()` function

```javascript
// In gameState.js experiment() function
experiment() {
    // Normal experiment logic...
    
    // 10% chance for rare discovery
    const rareRoll = Math.random();
    if (rareRoll < 0.10) {
        const rareIngredient = this.getRandomRareIngredient();
        this.inventory[rareIngredient] = (this.inventory[rareIngredient] || 0) + 1;
        this.showRareDiscovery(rareIngredient);
    }
}
```

**3. Hidden Achievements**
- **Mechanic**: Secret achievements that unlock unexpectedly
- **Visual Feedback**: Special achievement animation, unique badge
- **Audio Feedback**: Special achievement sound
- **Implementation**: Add hidden achievements to `achievements.js`

**4. Time-Limited Bonus Events**
- **Mechanic**: Random events that provide temporary bonuses
- **Visual Feedback**: Event notification, timer display, visual effects
- **Audio Feedback**: Event start/end sounds
- **Implementation**: Extend `eventSystem.js`

#### Compulsion Loop Enhancements

**1. Daily Ritual Enhancements**
- **Current**: Daily tasks with fixed rewards
- **Enhancement**: Escalating rewards, streak bonuses, surprise rewards
- **Implementation**: Enhance `dailyRituals.js`

```javascript
// In dailyRituals.js
calculateReward(taskId) {
    const baseReward = this.tasks[taskId].reward;
    const streak = this.getStreak();
    
    // Streak bonus: +10% per day, up to 100%
    const streakMultiplier = 1.0 + Math.min(streak * 0.1, 1.0);
    
    // 5% chance for double reward
    const bonusRoll = Math.random();
    const bonusMultiplier = bonusRoll < 0.05 ? 2.0 : 1.0;
    
    return baseReward * streakMultiplier * bonusMultiplier;
}
```

**2. Combo System Enhancements**
- **Current**: Combo system exists in `comboSystem.js`
- **Enhancement**: 
  - Visual combo meter with milestones
  - Bonus rewards at combo milestones (10x, 25x, 50x, 100x)
  - Combo decay creates urgency
- **Implementation**: Enhance `comboSystem.js`

```javascript
// In comboSystem.js
recordAction() {
    // Existing combo logic...
    
    // Check for milestone bonuses
    const milestones = [10, 25, 50, 100, 250, 500];
    if (milestones.includes(this.comboCount)) {
        this.triggerMilestoneReward(this.comboCount);
    }
}

triggerMilestoneReward(combo) {
    // Give bonus resources
    const bonus = combo * 0.1; // 0.1 AB per combo point
    gameState.arcaneBits += bonus;
    
    // Visual feedback
    showNotification(`Combo ${combo}x! +${formatShort(bonus)} AB`, 'success');
    createParticleEffect('combo-milestone');
}
```

**3. Prestige Cycle Optimization**
- **Current**: Prestige provides permanent bonuses
- **Enhancement**: 
  - Prestige milestones with special rewards
  - Visual celebration for each prestige
  - Prestige counter creates anticipation
- **Implementation**: Enhance prestige system in `gameState.js`

#### Progressive Challenge System

**1. Dynamic Difficulty Scaling**
- **Mechanic**: Adjust challenge difficulty based on player performance
- **Implementation**: Track player efficiency and adjust reward rates

```javascript
// In gameState.js
calculateDynamicDifficulty() {
    const efficiency = this.calculatePlayerEfficiency();
    
    // Adjust production rates based on efficiency
    if (efficiency > 0.8) {
        // Player is doing well, slightly reduce rates
        return 0.95; // 5% reduction
    } else if (efficiency < 0.5) {
        // Player is struggling, slightly increase rates
        return 1.05; // 5% increase
    }
    
    return 1.0; // Normal
}
```

**2. Milestone Rewards**
- **Mechanic**: Special rewards at key progression points (100 AB, 1K AB, 10K AB, etc.)
- **Visual Feedback**: Milestone celebration, special notification
- **Audio Feedback**: Milestone sound effect
- **Implementation**: Add milestone tracking to `gameState.js`

```javascript
// In gameState.js
checkMilestones() {
    const milestones = [100, 1000, 10000, 100000, 1000000];
    const currentAB = this.arcaneBits;
    
    milestones.forEach(milestone => {
        if (currentAB >= milestone && !this.unlockedMilestones.has(milestone)) {
            this.unlockMilestone(milestone);
        }
    });
}

unlockMilestone(ab) {
    this.unlockedMilestones.add(ab);
    
    // Give milestone reward
    const reward = ab * 0.1; // 10% of milestone as bonus
    this.arcaneBits += reward;
    
    // Visual feedback
    showNotification(`Milestone: ${formatShort(ab)} AB! +${formatShort(reward)} bonus`, 'success');
    createCelebrationAnimation('milestone');
}
```

**3. Tiered Achievements**
- **Current**: Achievements exist in `achievements.js`
- **Enhancement**: 
  - Bronze/Silver/Gold tiers for same achievement type
  - Increasing rewards for higher tiers
  - Visual progression indicators
- **Implementation**: Enhance `achievements.js`

#### Immediate Feedback Systems

**1. Enhanced Particle Effects**
- **Current**: Basic particle effects exist
- **Enhancement**: 
  - Particle effects for all actions (cast, purchase, upgrade, etc.)
  - Color-coded particles for different action types
  - Particle trails and bursts for special events
- **Implementation**: Enhance `particleEffects.js`

**2. Audio Feedback**
- **Current**: Basic audio system exists in `audioSystem.js`
- **Enhancement**: 
  - Unique sounds for all interaction types
  - Layered audio for complex actions
  - Audio feedback for progress (level up sounds, etc.)
- **Implementation**: Enhance `audioSystem.js`

**3. Visual Progress Indicators**
- **Current**: Basic progress displays
- **Enhancement**: 
  - Animated progress bars
  - Visual "level up" effects
  - Progress celebration animations
- **Implementation**: Enhance `animations.js` and UI updates

**4. Celebration Animations**
- **Current**: Basic celebration effects
- **Enhancement**: 
  - Special animations for achievements
  - Milestone celebrations
  - Prestige celebrations
- **Implementation**: Enhance `celebrationAnimations.js`

#### Social Elements

**1. Coven Competitions**
- **Current**: Coven system exists
- **Enhancement**: 
  - Weekly competitions with leaderboards
  - Special rewards for top performers
  - Collaborative goals
- **Implementation**: Enhance `covenSystem.js` and `covenEvents.js`

**2. Leaderboard Enhancements**
- **Current**: Leaderboards exist
- **Enhancement**: 
  - Real-time rankings
  - Position change notifications
  - Rewards for top positions
- **Implementation**: Enhance `socialLeaderboards.js`

**3. Collaborative Achievements**
- **Current**: Coven achievements exist
- **Enhancement**: 
  - Group goals with shared progress
  - Rewards for all participants
  - Special recognition for contributors
- **Implementation**: Enhance `covenAchievements.js`

### Technical Implementation

#### File: `js/gameState.js`

**Add variable reward system:**
```javascript
// Add to GameState class
calculateCastReward() {
    const baseReward = this.baseCastReward;
    
    // Variable reward check
    const bonusRoll = Math.random();
    let multiplier = 1.0;
    
    if (bonusRoll < 0.05) {
        multiplier = 2 + Math.random() * 3; // 2.0-5.0x bonus
    } else if (bonusRoll < 0.15) {
        multiplier = 1.5; // 1.5x bonus
    }
    
    return baseReward * multiplier;
}

triggerBonusFeedback(bonusType, multiplier) {
    // Visual feedback
    if (window.createParticle) {
        window.createParticle('bonus', multiplier);
    }
    
    // Audio feedback
    if (window.audioSystem) {
        window.audioSystem.playSound('bonus');
    }
    
    // Notification
    if (window.showNotification) {
        window.showNotification(`🎉 ${multiplier.toFixed(1)}x Bonus!`, 'success');
    }
}
```

#### File: `js/comboSystem.js`

**Enhance combo system:**
```javascript
// Add milestone tracking
constructor() {
    // ... existing code ...
    this.milestoneBonuses = new Set();
}

recordAction() {
    // ... existing combo logic ...
    
    // Check milestones
    const milestones = [10, 25, 50, 100, 250, 500];
    milestones.forEach(milestone => {
        if (this.comboCount === milestone && !this.milestoneBonuses.has(milestone)) {
            this.triggerMilestoneReward(milestone);
            this.milestoneBonuses.add(milestone);
        }
    });
}

triggerMilestoneReward(combo) {
    // Give bonus
    const bonus = combo * 0.1;
    if (window.gameState) {
        window.gameState.arcaneBits += bonus;
    }
    
    // Feedback
    if (window.showNotification) {
        window.showNotification(`🔥 ${combo}x Combo! +${bonus.toFixed(1)} AB`, 'success');
    }
}
```

#### File: `js/achievements.js`

**Add hidden achievements:**
```javascript
// Add to achievements list
{
    id: 'hidden_lucky',
    displayName: 'Lucky Strike',
    description: 'Get a 5x bonus on cast',
    hidden: true,
    condition: 'cast_bonus:5.0',
    reward: { ab: 100 }
}
```

### Metrics to Track

**Player Engagement Metrics:**
- **Session Length**: Average time per session
- **Return Rate**: Daily/weekly active users
- **Engagement Depth**: Actions per session
- **Progression Velocity**: Time to reach milestones
- **Retention**: Day 1, Day 7, Day 30 retention rates

**Dopamine Trigger Metrics:**
- **Bonus Cast Frequency**: How often bonus casts occur
- **Combo Milestone Reaches**: Frequency of combo milestones
- **Achievement Unlocks**: Rate of achievement discovery
- **Event Participation**: Engagement with time-limited events

**Implementation:**
- Add analytics tracking to `analytics.js`
- Log key events for analysis
- Monitor metrics to balance rewards

### Acceptance Criteria

1. **Variable Rewards**
   - [ ] Cast bonuses occur at expected frequency (5-15%)
   - [ ] Bonus feedback is clear and satisfying
   - [ ] Surprise experiments provide rare rewards
   - [ ] Hidden achievements unlock unexpectedly
   - [ ] Time-limited events provide variable rewards

2. **Compulsion Loops**
   - [ ] Daily rituals have escalating rewards
   - [ ] Combo system has milestone bonuses
   - [ ] Prestige cycle is optimized for engagement
   - [ ] Multiple parallel loops exist

3. **Progressive Challenges**
   - [ ] Difficulty scales appropriately
   - [ ] Milestone rewards are satisfying
   - [ ] Tiered achievements provide progression
   - [ ] Challenge modes are engaging

4. **Immediate Feedback**
   - [ ] All actions have visual feedback
   - [ ] All actions have audio feedback
   - [ ] Progress indicators are clear
   - [ ] Celebrations are satisfying

5. **Social Elements**
   - [ ] Coven competitions are engaging
   - [ ] Leaderboards provide motivation
   - [ ] Collaborative achievements work
   - [ ] Social sharing is functional

6. **Metrics**
   - [ ] Key metrics are tracked
   - [ ] Analytics provide insights
   - [ ] Metrics inform balance adjustments

---

## Implementation Roadmap

### Phase 1: Alchemical Elements (Weeks 1-2)

**Week 1: Water Element**
- Day 1-2: Add water ingredients to `js/data.js`
- Day 3-4: Create water producers
- Day 5: Integrate water into existing recipes
- Day 6-7: Visual styling and testing

**Week 2: Air Element**
- Day 1-2: Add air ingredients to `js/data.js`
- Day 3-4: Create air producers
- Day 5: Integrate air into existing recipes
- Day 6-7: Visual styling and testing

**Week 2: Integration**
- Day 8-9: Create combination recipes
- Day 10: Balance testing
- Day 11-12: Bug fixes and polish
- Day 13-14: Documentation and final testing

### Phase 2: Progressive Design Revelation (Weeks 3-4)

**Week 3: Core System**
- Day 1-2: Create `designTierSystem.js`
- Day 3-4: Implement Tier 0 and Tier 1
- Day 5: Implement Tier 2 (sound effects)
- Day 6-7: Testing and refinement

**Week 4: Advanced Tiers**
- Day 1-2: Implement Tier 3 (animations)
- Day 3-4: Implement Tier 4 (music)
- Day 5: Settings integration
- Day 6-7: Testing, polish, and documentation

### Phase 3: Dopamine Maximization (Weeks 5-7)

**Week 5: Variable Rewards**
- Day 1-2: Implement cast bonuses
- Day 3-4: Implement surprise experiments
- Day 5: Implement hidden achievements
- Day 6-7: Implement time-limited events

**Week 6: Compulsion Loops**
- Day 1-2: Enhance daily rituals
- Day 3-4: Enhance combo system
- Day 5: Optimize prestige cycle
- Day 6-7: Testing and balance

**Week 7: Feedback and Social**
- Day 1-2: Enhance particle effects and audio
- Day 3-4: Implement milestone rewards
- Day 5: Enhance social features
- Day 6-7: Metrics implementation and final testing

### Phase 4: Integration and Polish (Week 8)

**Week 8: Final Integration**
- Day 1-2: Cross-feature integration
- Day 3-4: Balance testing across all features
- Day 5: Performance optimization
- Day 6-7: Documentation, bug fixes, and release preparation

---

## Testing Considerations

### Unit Testing

**Alchemical Elements:**
- Test ingredient definitions
- Test producer creation
- Test recipe integration
- Test visual styling

**Progressive Design Revelation:**
- Test tier unlock conditions
- Test tier application
- Test settings persistence
- Test unlock notifications

**Dopamine Maximization:**
- Test variable reward frequencies
- Test compulsion loop mechanics
- Test feedback systems
- Test social features

### Integration Testing

**Cross-Feature Integration:**
- Test water/air elements with progressive design tiers
- Test dopamine features with all tiers
- Test all features together
- Test save/load with all features

### Performance Testing

**Performance Metrics:**
- Frame rate with all tiers enabled
- Memory usage with all features active
- Load times with all content
- Network usage for social features

### User Acceptance Testing

**Player Testing:**
- Test with new players (first-time experience)
- Test with experienced players (progression)
- Test on different devices (mobile, desktop)
- Test accessibility features

### Balance Testing

**Game Balance:**
- Test economy balance with new elements
- Test progression speed with dopamine features
- Test tier unlock pacing
- Test reward frequencies

---

## References

### Software Engineering

1. Atlassian - Software Documentation Best Practices
   - https://www.atlassian.com/blog/it-teams/software-documentation-best-practices

2. Swimm - Software Documentation Best Practices
   - https://swimm.io/learn/software-documentation/software-documentation-best-practices-to-improve-your-docs

3. BetterDocs - Documentation Improvement Guide
   - https://betterdocs.co/good-to-great-tips-for-improving-your-documentation/

### Game Design

1. Wikipedia - Compulsion Loop
   - https://en.wikipedia.org/wiki/Compulsion_loop

2. Wikipedia - Agile Software Development
   - https://en.wikipedia.org/wiki/Agile_software_development

3. Game Design Patterns - Progressive Disclosure
   - Various game design resources on progressive revelation

### Psychology and Engagement

1. Skinner Box Psychology - Variable Ratio Rewards
   - Behavioral psychology research on reward schedules

2. Flow State Theory - Optimal Challenge
   - Csikszentmihalyi's flow theory

3. Dopamine and Gaming
   - Research on dopamine release in gaming contexts

### Alchemical Elements

1. Classical Alchemy - Five Elements
   - Traditional alchemical element systems
   - Fire, Earth, Water, Air, Aether (Quintessence)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Planning/Design Phase

