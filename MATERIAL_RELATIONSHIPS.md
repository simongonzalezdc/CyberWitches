# Material Relationships Diagram

## Overview
The game is organized around **5 Alchemical Elements**: Fire, Earth (Crystals), Water, Air, and Aether. Each element follows a consistent **5-tier progression** from basic essences to legendary materials.

---

## Tier Structure

```
TIER 0: Essence (Base) → TIER 1: Refined (2 items) → TIER 2: Advanced (1 item) → TIER 3: Master (1 item) → TIER 4: Legendary (1 item)
```

---

## Production Flow Diagram

### 🔥 FIRE ELEMENT (Candles)

```
CAST (Tap) → wax_bits, wick_fiber
              ↓
    [Wax Melter] → wax_block (T1)
              ↓
    [Wick Spinner] → braided_wick (T1)
              ↓
    [Digital Candle Forge] → dig_candle (T1)
              ↓
    [Enhanced Candle Forge] → enhanced_candle (T2)
              ↓
    [Quantum Candle Forge] → quantum_candle (T3)
              ↓
    [Arcane Candle Forge] → arcane_candle (T4)
```

**Fire Essence Chain:**
```
CAST → fire_essence (T0)
        ↓
[Fire Still] → dist_fire (T1)
```

---

### 🌍 EARTH ELEMENT (Crystals)

```
CAST → crystal_dust (T0)
        ↓
[Crystal Shaper] → shaped_crys (T1)
        ↓
[Crystal Orb Forge] → crystal_orb (T1)
        ↓
[Crystal Core Forge] → crystal_core (T2)
        ↓
[Quantum Crystal Forge] → quantum_crystal (T3)
        ↓
[Void Crystal Forge] → void_crystal (T4)
```

---

### 💧 WATER ELEMENT

```
CAST → water_essence (T0)
        ↓
[Aqua Collector] → liquid_essence (T1)
        ↓
[Aqua Well] → aqua_well (T1)
        ↓
[Flowing Current Forge] → flowing_current (T2)
        ↓
[Quantum Water Forge] → quantum_water (T3)
        ↓
[Void Liquid Forge] → void_liquid (T4)
```

---

### 💨 AIR ELEMENT

```
CAST → air_essence (T0)
        ↓
[Zephyr Collector] → ethereal_gust (T1)
        ↓
[Zephyr Generator] → zephyr_totem (T1)
        ↓
[Wind Spiral Forge] → wind_spiral (T2)
        ↓
[Quantum Air Forge] → quantum_air (T3)
        ↓
[Void Breath Forge] → void_breath (T4)
```

---

### ✨ AETHER ELEMENT

```
[Aether Synthesizer] → dist_aether (T0)
  Input: fire_essence + water_essence + air_essence + crystal_dust
        ↓
[Aether Well] → aether_well (T1)
        ↓
[Aether Flux Reactor] → aether_flux (T2)
        ↓
[Quantum Aether Forge] → quantum_aether (T3)
        ↓
[Infinity Flux Forge] → infinity_flux (T4)
```

**Note:** Aether is not generated from CAST. It must be synthesized by combining all four basic elements (Fire, Water, Air, Earth) in the Aether Synthesizer.

---

## Cross-Element Relationships

### Primary Currency Production
```
[Arcane Bit Forge] (T1)
  Inputs: dig_candle + crystal_orb + aether_well
  Output: AB (Arcane Bits) - Main currency
```

### Key Production Chains

**Tier 1 Combinations:**
- `dig_candle` = wax_block + braided_wick + dist_aether (Fire + Aether)
- `crystal_orb` = shaped_crys + dist_aether (Earth + Aether)
- `aether_well` = dist_aether + shaped_crys (Aether + Earth)
- `aqua_well` = liquid_essence + shaped_crys (Water + Earth)
- `zephyr_totem` = ethereal_gust + shaped_crys (Air + Earth)

**Tier 2 Combinations:**
- `enhanced_candle` = dig_candle + crystal_orb + aether_well (Fire + Earth + Aether)
- `crystal_core` = crystal_orb + aether_well + dig_candle (Earth + Aether + Fire)
- `aether_flux` = aether_well + crystal_core + enhanced_candle (Aether + Earth + Fire)
- `wax_hex` = wax_block + shaped_crys + enhanced_candle (Fire + Earth)
- `flowing_current` = aqua_well + crystal_core + enhanced_candle (Water + Earth + Fire)
- `wind_spiral` = zephyr_totem + crystal_core + enhanced_candle (Air + Earth + Fire)

**Tier 3 Combinations:**
- All quantum items require: `quantum_essence` + `quantum_aether` + their T2 version

**Tier 4 Combinations:**
- All void items require: `quantum_essence` + `quantum_aether` + their T3 version

---

## Material Dependency Graph

```
CAST (Manual Action)
  ├─→ wax_bits (Fire T0)
  ├─→ wick_fiber (Fire T0)
  ├─→ crystal_dust (Earth T0)
  ├─→ fire_essence (Fire T0)
  ├─→ water_essence (Water T0)
  └─→ air_essence (Air T0)

Aether Synthesis (Workstation)
  fire_essence + water_essence + air_essence + crystal_dust → [Aether Synthesizer] → dist_aether

Tier 0 → Tier 1 (Single Workstation)
  wax_bits → [Wax Melter] → wax_block
  wick_fiber → [Wick Spinner] → braided_wick
  crystal_dust → [Crystal Shaper] → shaped_crys
  aether_ess → [Aether Still] → dist_aether
  fire_essence → [Fire Still] → dist_fire
  water_essence → [Aqua Collector] → liquid_essence
  air_essence → [Zephyr Collector] → ethereal_gust

Tier 1 → Tier 1 (Combined Workstations)
  wax_block + braided_wick + dist_aether → [Digital Candle Forge] → dig_candle
  shaped_crys + dist_aether → [Crystal Orb Forge] → crystal_orb
  dist_aether + shaped_crys → [Aether Well] → aether_well
  liquid_essence + shaped_crys → [Aqua Well] → aqua_well
  ethereal_gust + shaped_crys → [Zephyr Generator] → zephyr_totem

Tier 1 → AB (Main Currency)
  dig_candle + crystal_orb + aether_well → [Arcane Bit Forge] → AB

Tier 1 → Tier 2 (Advanced Workstations)
  dig_candle + crystal_orb + aether_well → [Enhanced Candle Forge] → enhanced_candle
  crystal_orb + aether_well + dig_candle → [Crystal Core Forge] → crystal_core
  aether_well + crystal_core + enhanced_candle → [Aether Flux Reactor] → aether_flux
  wax_block + shaped_crys + enhanced_candle → [Wax Hex Forge] → wax_hex
  aqua_well + crystal_core + enhanced_candle → [Flowing Current Forge] → flowing_current
  zephyr_totem + crystal_core + enhanced_candle → [Wind Spiral Forge] → wind_spiral

Tier 2 → Tier 3 (Master Workstations)
  All require: quantum_essence + quantum_aether + T2 item
  enhanced_candle → [Quantum Candle Forge] → quantum_candle
  crystal_core → [Quantum Crystal Forge] → quantum_crystal
  aether_flux → [Quantum Aether Forge] → quantum_aether
  flowing_current → [Quantum Water Forge] → quantum_water
  wind_spiral → [Quantum Air Forge] → quantum_air

Tier 3 → Tier 4 (Legendary Workstations)
  All require: quantum_essence + quantum_aether + T3 item
  quantum_candle → [Arcane Candle Forge] → arcane_candle
  quantum_crystal → [Void Crystal Forge] → void_crystal
  quantum_aether → [Infinity Flux Forge] → infinity_flux
  quantum_water → [Void Liquid Forge] → void_liquid
  quantum_air → [Void Breath Forge] → void_breath
```

---

## Key Patterns

### 1. **Tier 0 → Tier 1**: Simple 1:1 conversion
   - Each essence gets processed by its dedicated workstation
   - 10 essence → ~0.2-0.3 refined material

### 2. **Tier 1 → Tier 1**: Cross-element combinations
   - Most Tier 1 items combine 2-3 different elements
   - Earth (shaped_crys) is the most common cross-element ingredient

### 3. **Tier 1 → Tier 2**: Advanced combinations
   - Requires multiple Tier 1 items from different elements
   - Often includes the previous tier's item (e.g., dig_candle → enhanced_candle)

### 4. **Tier 2 → Tier 3**: Quantum materials
   - All require `quantum_essence` + `quantum_aether` + their T2 version
   - Creates a bottleneck requiring quantum materials

### 5. **Tier 3 → Tier 4**: Void materials
   - All require `quantum_essence` + `quantum_aether` + their T3 version
   - Final tier of production

---

## Production Bottlenecks

1. **shaped_crys** (Earth T1) - Used in almost every cross-element recipe
2. **dist_aether** (Aether T1) - Used in many Fire and Earth recipes
3. **crystal_core** (Earth T2) - Required for all Tier 2+ cross-element items
4. **quantum_essence** / **quantum_aether** - Required for all Tier 3+ items

---

## Element Balance

Each element has:
- **1** Tier 0 essence (from CAST)
- **2** Tier 1 refined items
- **1** Tier 2 advanced item
- **1** Tier 3 quantum item
- **1** Tier 4 void/legendary item

**Total: 6 items per element** (except Aether, which has slightly different structure)

---

## Workstation Types

1. **Essence Processors** (T0→T1): Simple 1-input workstations
2. **Combination Forges** (T1→T1): Multi-input workstations creating cross-element items
3. **Advanced Forges** (T1→T2): Creating Tier 2 items
4. **Master Forges** (T2→T3): Creating quantum materials
5. **Legendary Forges** (T3→T4): Creating void materials
6. **Currency Forges** (T1→AB): Converting materials to Arcane Bits

---

## Notes

- **Earth (Crystals)** is the most versatile element - `shaped_crys` appears in almost every recipe
- **Aether** is the second most common cross-element ingredient
- **Fire (Candles)** is the primary currency producer (via Arcane Bit Forge)
- Higher tiers require more diverse ingredient combinations
- Quantum materials create a shared bottleneck for all Tier 3+ production

