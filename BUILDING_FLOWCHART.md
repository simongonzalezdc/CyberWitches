# Building Flowchart - Complete Visual Guide

## Building Type Legend
- 🔥 **Forge** = Fire Element
- 💧 **Well** = Water Element  
- 💨 **Generator** = Air Element
- 💎 **Chamber** = Crystal Element
- ⚡ **Reactor** = Aether Element (or AB Producer)

---

## TIER 0 - Basic Producers (Unlocks: 25-50 AB)

```
CAST (Manual Click)
    ↓
    ├─→ fire_essence ──→ [🔥 Fire Forge] ──→ dist_fire
    ├─→ water_essence ──→ [💧 Aqua Well] ──→ liquid_essence
    ├─→ air_essence ──→ [💨 Zephyr Generator] ──→ ethereal_gust
    ├─→ crystal_dust ──→ [💎 Crystal Chamber] ──→ shaped_crys
    └─→ fire_essence + water_essence + air_essence + crystal_dust
            ↓
        [⚡ Aether Synthesizer] ──→ dist_aether
```

**Details:**
- 🔥 **Fire Forge** (Tier 0, Fire) - Unlocks: 25 AB
  - Input: `fire_essence: 10`
  - Output: `dist_fire: 0.2/s`

- 💧 **Aqua Well** (Tier 0, Water) - Unlocks: 30 AB
  - Input: `water_essence: 10`
  - Output: `liquid_essence: 0.2/s`

- 💨 **Zephyr Generator** (Tier 0, Air) - Unlocks: 35 AB
  - Input: `air_essence: 10`
  - Output: `ethereal_gust: 0.2/s`

- 💎 **Crystal Chamber** (Tier 0, Crystal) - Unlocks: 40 AB
  - Input: `crystal_dust: 10`
  - Output: `shaped_crys: 0.2/s`

- ⚡ **Aether Synthesizer** (Tier 0, Aether) - Unlocks: 50 AB
  - Input: `fire_essence: 2, water_essence: 2, air_essence: 2, crystal_dust: 2`
  - Output: `dist_aether: 0.2/s`

---

## TIER 1 - Early Game Producers (Unlocks: 75-200 AB)

```
Tier 0 Outputs
    ↓
    ├─→ dist_fire + shaped_crys ──→ [🔥 Digital Candle Forge] ──→ dig_candle
    ├─→ liquid_essence + shaped_crys ──→ [💧 Deep Aqua Well] ──→ aqua_well
    ├─→ ethereal_gust + shaped_crys ──→ [💨 Enhanced Zephyr Generator] ──→ zephyr_totem
    ├─→ shaped_crys + dist_aether ──→ [💎 Crystal Orb Chamber] ──→ crystal_orb
    └─→ dist_aether + shaped_crys ──→ [⚡ Aether Reactor] ──→ aether_well
```

**Early AB Producer:**
```
dig_candle + crystal_orb + aether_well ──→ [⚡ Arcane Bit Reactor] ──→ AB (1.5/s)
    Unlocks: 1,000 AB
```

**Details:**
- 🔥 **Digital Candle Forge** (Tier 1, Fire) - Unlocks: 75 AB
  - Input: `dist_fire: 3, shaped_crys: 2`
  - Output: `dig_candle: 0.4/s`

- 💧 **Deep Aqua Well** (Tier 1, Water) - Unlocks: 100 AB
  - Input: `liquid_essence: 3, shaped_crys: 2`
  - Output: `aqua_well: 0.4/s`

- 💨 **Enhanced Zephyr Generator** (Tier 1, Air) - Unlocks: 125 AB
  - Input: `ethereal_gust: 3, shaped_crys: 2`
  - Output: `zephyr_totem: 0.4/s`

- 💎 **Crystal Orb Chamber** (Tier 1, Crystal) - Unlocks: 150 AB
  - Input: `shaped_crys: 2, dist_aether: 2`
  - Output: `crystal_orb: 0.4/s`

- ⚡ **Aether Reactor** (Tier 1, Aether) - Unlocks: 200 AB
  - Input: `dist_aether: 3, shaped_crys: 2`
  - Output: `aether_well: 0.4/s`

- ⚡ **Arcane Bit Reactor** (Tier 1, AB Producer) - Unlocks: 1,000 AB
  - Input: `dig_candle: 2, crystal_orb: 1, aether_well: 1`
  - Output: `AB: 1.5/s`

---

## TIER 2 - Mid Game Producers (Unlocks: 5,000-10,000 AB)

```
Tier 1 Outputs
    ↓
    ├─→ dig_candle + crystal_orb + aether_well ──→ [🔥 Enhanced Candle Forge] ──→ enhanced_candle
    ├─→ aqua_well + crystal_orb + dig_candle ──→ [💧 Flowing Current Well] ──→ flowing_current
    ├─→ zephyr_totem + crystal_orb + dig_candle ──→ [💨 Wind Spiral Generator] ──→ wind_spiral
    ├─→ crystal_orb + aether_well + dig_candle ──→ [💎 Crystal Core Chamber] ──→ crystal_core
    └─→ enhanced_candle + flowing_current + wind_spiral + crystal_core + aether_well
            ↓
        [⚡ Arcane Bit Reactor] ──→ AB (5.0/s)
```

**Focus Producer:**
```
enhanced_candle + crystal_core + flowing_current + wind_spiral ──→ [🧘 Focus Mill] ──→ focus
    Unlocks: 6,000 AB
```

**Details:**
- 🔥 **Enhanced Candle Forge** (Tier 2, Fire) - Unlocks: 5,000 AB
  - Input: `dig_candle: 2, crystal_orb: 1, aether_well: 1`
  - Output: `enhanced_candle: 0.4/s`

- 💧 **Flowing Current Well** (Tier 2, Water) - Unlocks: 6,000 AB
  - Input: `aqua_well: 3, crystal_orb: 2, dig_candle: 1`
  - Output: `flowing_current: 0.4/s`

- 💨 **Wind Spiral Generator** (Tier 2, Air) - Unlocks: 7,000 AB
  - Input: `zephyr_totem: 3, crystal_orb: 2, dig_candle: 1`
  - Output: `wind_spiral: 0.4/s`

- 💎 **Crystal Core Chamber** (Tier 2, Crystal) - Unlocks: 8,000 AB
  - Input: `crystal_orb: 3, aether_well: 2, dig_candle: 2`
  - Output: `crystal_core: 0.4/s`

- ⚡ **Arcane Bit Reactor** (Tier 2, AB Producer) - Unlocks: 10,000 AB
  - Input: `enhanced_candle: 2, flowing_current: 2, wind_spiral: 2, crystal_core: 2, aether_well: 2`
  - Output: `AB: 5.0/s`

- 🧘 **Focus Mill** (Tier 2, Focus Producer) - Unlocks: 6,000 AB
  - Input: `enhanced_candle: 2, crystal_core: 2, flowing_current: 1, wind_spiral: 1`
  - Output: `focus: 0.2/s`

---

## TIER 3 - Late Game Producers (Unlocks: 100,000-200,000 AB)

```
Tier 2 Outputs
    ↓
    ├─→ enhanced_candle + crystal_core + flowing_current + wind_spiral ──→ [🔥 Quantum Candle Forge] ──→ quantum_candle
    ├─→ flowing_current + crystal_core + enhanced_candle + wind_spiral ──→ [💧 Quantum Water Well] ──→ quantum_water
    ├─→ wind_spiral + crystal_core + enhanced_candle + flowing_current ──→ [💨 Quantum Air Generator] ──→ quantum_air
    ├─→ crystal_core + enhanced_candle + flowing_current + wind_spiral ──→ [💎 Quantum Crystal Chamber] ──→ quantum_crystal
    └─→ quantum_candle + quantum_water + quantum_air + quantum_crystal + aether_well
            ↓
        [⚡ Etheric Energy Reactor] ──→ AB (25.0/s)
```

**Focus Producer:**
```
quantum_candle + quantum_crystal + quantum_water + quantum_air ──→ [🧘 Quantum Focus Mill] ──→ focus (0.5/s)
    Unlocks: 150,000 AB
```

**Details:**
- 🔥 **Quantum Candle Forge** (Tier 3, Fire) - Unlocks: 100,000 AB
  - Input: `enhanced_candle: 3, crystal_core: 2, flowing_current: 2, wind_spiral: 2`
  - Output: `quantum_candle: 0.3/s`

- 💧 **Quantum Water Well** (Tier 3, Water) - Unlocks: 120,000 AB
  - Input: `flowing_current: 4, crystal_core: 2, enhanced_candle: 2, wind_spiral: 2`
  - Output: `quantum_water: 0.3/s`

- 💨 **Quantum Air Generator** (Tier 3, Air) - Unlocks: 140,000 AB
  - Input: `wind_spiral: 4, crystal_core: 2, enhanced_candle: 2, flowing_current: 2`
  - Output: `quantum_air: 0.3/s`

- 💎 **Quantum Crystal Chamber** (Tier 3, Crystal) - Unlocks: 160,000 AB
  - Input: `crystal_core: 4, enhanced_candle: 2, flowing_current: 2, wind_spiral: 2`
  - Output: `quantum_crystal: 0.3/s`

- ⚡ **Etheric Energy Reactor** (Tier 3, AB Producer) - Unlocks: 200,000 AB
  - Input: `quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3, aether_well: 3`
  - Output: `AB: 25.0/s`

- 🧘 **Quantum Focus Mill** (Tier 3, Focus Producer) - Unlocks: 150,000 AB
  - Input: `quantum_candle: 2, quantum_crystal: 2, quantum_water: 2, quantum_air: 2`
  - Output: `focus: 0.5/s`

---

## TIER 4 - Legendary Producers (Unlocks: 5,000,000-6,500,000 AB)

```
Tier 3 Outputs
    ↓
    ├─→ quantum_candle + quantum_water + quantum_air + quantum_crystal ──→ [🔥 Arcane Candle Forge] ──→ arcane_candle
    └─→ quantum_crystal + quantum_candle + quantum_water + quantum_air ──→ [💎 Void Crystal Chamber] ──→ void_crystal
```

**Focus Producer:**
```
arcane_candle + void_crystal + quantum_candle + quantum_crystal ──→ [🧘 Void Focus Mill] ──→ focus (1.2/s)
    Unlocks: 7,000,000 AB
```

**Details:**
- 🔥 **Arcane Candle Forge** (Tier 4, Fire) - Unlocks: 5,000,000 AB
  - Input: `quantum_candle: 5, quantum_water: 3, quantum_air: 3, quantum_crystal: 3`
  - Output: `arcane_candle: 0.2/s`

- 💎 **Void Crystal Chamber** (Tier 4, Crystal) - Unlocks: 6,500,000 AB
  - Input: `quantum_crystal: 5, quantum_candle: 3, quantum_water: 3, quantum_air: 3`
  - Output: `void_crystal: 0.2/s`

- 🧘 **Void Focus Mill** (Tier 4, Focus Producer) - Unlocks: 7,000,000 AB
  - Input: `arcane_candle: 3, void_crystal: 2, quantum_candle: 3, quantum_crystal: 2`
  - Output: `focus: 1.2/s`

---

## TIER 5 - Ultimate Producers (Unlocks: 8,000,000-20,000,000 AB)

```
Tier 4 Outputs
    ↓
    ├─→ void_crystal + arcane_candle + quantum_water + quantum_crystal ──→ [💧 Void Liquid Well] ──→ void_liquid
    ├─→ void_crystal + arcane_candle + quantum_air + quantum_crystal ──→ [💨 Void Breath Generator] ──→ void_breath
    ├─→ arcane_candle + void_crystal + void_liquid + void_breath ──→ [🔥 Eternal Flame Forge] ──→ eternal_flame
    ├─→ void_crystal + void_liquid + void_breath + arcane_candle ──→ [💎 Infinity Core Chamber] ──→ infinity_core
    └─→ eternal_flame + infinity_core + void_liquid + void_breath + aether_well
            ↓
        [⚡ Infinity Energy Reactor] ──→ AB (750.0/s)
```

**Focus Producer:**
```
eternal_flame + infinity_core + void_liquid + void_breath ──→ [🧘 Eternal Focus Mill] ──→ focus (2.5/s)
    Unlocks: 18,000,000 AB
```

**Details:**
- 💧 **Void Liquid Well** (Tier 5, Water) - Unlocks: 8,000,000 AB
  - Input: `void_crystal: 3, arcane_candle: 3, quantum_water: 5, quantum_crystal: 3`
  - Output: `void_liquid: 0.2/s`

- 💨 **Void Breath Generator** (Tier 5, Air) - Unlocks: 9,000,000 AB
  - Input: `void_crystal: 3, arcane_candle: 3, quantum_air: 5, quantum_crystal: 3`
  - Output: `void_breath: 0.2/s`

- 🔥 **Eternal Flame Forge** (Tier 5, Fire) - Unlocks: 12,000,000 AB
  - Input: `arcane_candle: 5, void_crystal: 3, void_liquid: 3, void_breath: 3`
  - Output: `eternal_flame: 0.15/s`

- 💎 **Infinity Core Chamber** (Tier 5, Crystal) - Unlocks: 15,000,000 AB
  - Input: `void_crystal: 5, void_liquid: 3, void_breath: 3, arcane_candle: 3`
  - Output: `infinity_core: 0.15/s`

- ⚡ **Infinity Energy Reactor** (Tier 5, AB Producer) - Unlocks: 20,000,000 AB
  - Input: `eternal_flame: 5, infinity_core: 5, void_liquid: 5, void_breath: 5, aether_well: 5`
  - Output: `AB: 750.0/s`

- 🧘 **Eternal Focus Mill** (Tier 5, Focus Producer) - Unlocks: 18,000,000 AB
  - Input: `eternal_flame: 3, infinity_core: 3, void_liquid: 2, void_breath: 2`
  - Output: `focus: 2.5/s`

---

## Complete Dependency Flow

### Fire Element Chain
```
CAST → fire_essence
    ↓
[Fire Forge T0] → dist_fire
    ↓
[Digital Candle Forge T1] → dig_candle
    ↓
[Enhanced Candle Forge T2] → enhanced_candle
    ↓
[Quantum Candle Forge T3] → quantum_candle
    ↓
[Arcane Candle Forge T4] → arcane_candle
    ↓
[Eternal Flame Forge T5] → eternal_flame
```

### Water Element Chain
```
CAST → water_essence
    ↓
[Aqua Well T0] → liquid_essence
    ↓
[Deep Aqua Well T1] → aqua_well
    ↓
[Flowing Current Well T2] → flowing_current
    ↓
[Quantum Water Well T3] → quantum_water
    ↓
[Void Liquid Well T5] → void_liquid
```

### Air Element Chain
```
CAST → air_essence
    ↓
[Zephyr Generator T0] → ethereal_gust
    ↓
[Enhanced Zephyr Generator T1] → zephyr_totem
    ↓
[Wind Spiral Generator T2] → wind_spiral
    ↓
[Quantum Air Generator T3] → quantum_air
    ↓
[Void Breath Generator T5] → void_breath
```

### Crystal Element Chain
```
CAST → crystal_dust
    ↓
[Crystal Chamber T0] → shaped_crys
    ↓
[Crystal Orb Chamber T1] → crystal_orb
    ↓
[Crystal Core Chamber T2] → crystal_core
    ↓
[Quantum Crystal Chamber T3] → quantum_crystal
    ↓
[Void Crystal Chamber T4] → void_crystal
    ↓
[Infinity Core Chamber T5] → infinity_core
```

### Aether Element Chain
```
CAST → fire_essence + water_essence + air_essence + crystal_dust
    ↓
[Aether Synthesizer T0] → dist_aether
    ↓
[Aether Reactor T1] → aether_well
    ↓
(Used in all AB-producing Reactors)
```

### AB Production Chain
```
Tier 1: dig_candle + crystal_orb + aether_well → [Arcane Bit Reactor T1] → 1.5 AB/s
Tier 2: enhanced_candle + flowing_current + wind_spiral + crystal_core + aether_well → [Arcane Bit Reactor T2] → 5.0 AB/s
Tier 3: quantum_candle + quantum_water + quantum_air + quantum_crystal + aether_well → [Etheric Energy Reactor T3] → 25.0 AB/s
Tier 5: eternal_flame + infinity_core + void_liquid + void_breath + aether_well → [Infinity Energy Reactor T5] → 750.0 AB/s
```

---

## Building Type Summary

| Element | Building Type | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|---------|--------------|--------|--------|--------|--------|--------|--------|
| 🔥 Fire | **Forge** | Fire Forge | Digital Candle Forge | Enhanced Candle Forge | Quantum Candle Forge | Arcane Candle Forge | Eternal Flame Forge |
| 💧 Water | **Well** | Aqua Well | Deep Aqua Well | Flowing Current Well | Quantum Water Well | - | Void Liquid Well |
| 💨 Air | **Generator** | Zephyr Generator | Enhanced Zephyr Generator | Wind Spiral Generator | Quantum Air Generator | - | Void Breath Generator |
| 💎 Crystal | **Chamber** | Crystal Chamber | Crystal Orb Chamber | Crystal Core Chamber | Quantum Crystal Chamber | Void Crystal Chamber | Infinity Core Chamber |
| ⚡ Aether | **Reactor** | Aether Synthesizer | Aether Reactor | Arcane Bit Reactor | Etheric Energy Reactor | - | Infinity Energy Reactor |
| ⚡ AB | **Reactor** | - | Arcane Bit Reactor | Arcane Bit Reactor | Etheric Energy Reactor | - | Infinity Energy Reactor |
| 🧘 Focus | **Mill** | - | - | Focus Mill | Quantum Focus Mill | Void Focus Mill | Eternal Focus Mill |

---

## Key Patterns

1. **Element Progression**: Each element follows a consistent 5-tier progression
2. **Building Types**: Each element has a fixed building type (Fire→Forge, Water→Well, Air→Generator, Crystal→Chamber, Aether→Reactor)
3. **AB Producers**: All AB-producing reactors require all 4 other elements + Aether
4. **Cross-Element Dependencies**: Higher tiers require materials from multiple elements
5. **Focus Producers**: Separate meditation system buildings that produce Focus currency

---

## Notes

- **Tier 0**: Basic essence processing (1 input → 1 output)
- **Tier 1**: Early refinement (2 inputs → 1 output)
- **Tier 2**: Mid-game combination (3-4 inputs → 1 output)
- **Tier 3**: Late-game quantum materials (4 inputs → 1 output)
- **Tier 4**: Legendary arcane/void materials (4 inputs → 1 output)
- **Tier 5**: Ultimate eternal/infinity materials (4-5 inputs → 1 output)

- **AB Producers**: Require all 4 base elements + Aether, produce Arcane Bits (currency)
- **Focus Producers**: Produce Focus currency for meditation system (separate from main progression)

