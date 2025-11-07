# Building Structure Audit - Complete Analysis

## Current Structure Analysis

### Element → Building Type Mapping (Should Be Consistent)
- **Fire** → **Forge**
- **Water** → **Well**
- **Air** → **Generator**
- **Crystal** → **Chamber**
- **Aether** → **Reactor** (or Synthesizer for Tier 0)

---

## Tier-by-Tier Analysis

### TIER 0 - Basic Producers (Should be 5 workstations)

| Element | Current ID | Current Name | Building Type | Status |
|---------|-----------|--------------|---------------|--------|
| Fire | `ws_fire_forge` | Fire Forge | Forge ✅ | ✅ Correct |
| Water | `ws_aqua_well` | Aqua Well | Well ✅ | ✅ Correct |
| Air | `ws_zephyr_generator` | Zephyr Generator | Generator ✅ | ✅ Correct |
| Crystal | `ws_crystal_chamber` | Crystal Chamber | Chamber ✅ | ✅ Correct |
| Aether | `ws_aether_synthesizer` | Aether Synthesizer | Synthesizer ⚠️ | ⚠️ Should be "Reactor" or keep "Synthesizer" (special case) |

**Tier 0 Status:** ✅ **Mostly Correct** - Aether Synthesizer is acceptable as special case

---

### TIER 1 - Early Game Producers (Should be 5 workstations, currently 6)

| Element | Current ID | Current Name | Building Type | Status |
|---------|-----------|--------------|---------------|--------|
| Fire | `ws_digcandle_forge` | Digital Candle Forge | Forge ✅ | ✅ Correct |
| Water | `ws_aqua_well_t1` | Aqua Well | Well ✅ | ⚠️ **Duplicate name with Tier 0** |
| Air | `ws_zephyr_generator_t1` | Zephyr Generator | Generator ✅ | ⚠️ **Duplicate name with Tier 0** |
| Crystal | `ws_crystal_chamber_t1` | Crystal Orb Chamber | Chamber ✅ | ✅ Correct (different name) |
| Aether | `ws_aether_reactor_t1` | Aether Reactor | Reactor ✅ | ✅ Correct |
| **SE** | `ws_arcane_bit_forge_t1` | Arcane Bit Forge | Forge ❌ | ❌ **EXTRA - Breaks 5-per-tier rule** |

**Tier 1 Issues:**
1. ❌ **Extra SE Producer** - `ws_arcane_bit_forge_t1` breaks the 5-per-tier structure
2. ⚠️ **Duplicate Names** - `ws_aqua_well_t1` and `ws_zephyr_generator_t1` have same display names as Tier 0
3. ⚠️ **Naming Inconsistency** - Some have `_t1` suffix, some don't

**Recommendations:**
- Rename `ws_aqua_well_t1` → "Aqua Well T1" or "Deep Aqua Well"
- Rename `ws_zephyr_generator_t1` → "Zephyr Generator T1" or "Enhanced Zephyr Generator"
- Move `ws_arcane_bit_forge_t1` to Tier 2 OR rename it to be the Tier 2 SE producer

---

### TIER 2 - Mid Game Producers (Should be 5 workstations)

| Element | Current ID | Current Name | Building Type | Status |
|---------|-----------|--------------|---------------|--------|
| Fire | `ws_enhanced_candle_forge` | Enhanced Candle Forge | Forge ✅ | ✅ Correct |
| Water | `ws_flowing_current_well` | Flowing Current Well | Well ✅ | ✅ Correct |
| Air | `ws_wind_spiral_generator` | Wind Spiral Generator | Generator ✅ | ✅ Correct |
| Crystal | `ws_crystal_core_chamber` | Crystal Core Chamber | Chamber ✅ | ✅ Correct |
| Aether | `ws_arcane_bit_reactor` | Spell Energy Reactor | Reactor ⚠️ | ⚠️ **Name doesn't match ID** |

**Tier 2 Issues:**
1. ⚠️ **ID/Name Mismatch** - `ws_arcane_bit_reactor` is named "Spell Energy Reactor" but should be "Arcane Bit Reactor" to match naming convention
2. ❌ **Missing SE Producer** - If `ws_arcane_bit_forge_t1` is moved here, this tier would have 6 workstations

**Recommendations:**
- Rename "Spell Energy Reactor" → "Arcane Bit Reactor" (matches ID and convention)
- OR move `ws_arcane_bit_forge_t1` here and rename it to `ws_arcane_bit_reactor_t2`

---

### TIER 3 - Late Game Producers (Should be 5 workstations)

| Element | Current ID | Current Name | Building Type | Status |
|---------|-----------|--------------|---------------|--------|
| Fire | `ws_quantum_candle_forge` | Quantum Candle Forge | Forge ✅ | ✅ Correct |
| Water | `ws_quantum_water_well` | Quantum Water Well | Well ✅ | ✅ Correct |
| Air | `ws_quantum_air_generator` | Quantum Air Generator | Generator ✅ | ✅ Correct |
| Crystal | `ws_quantum_crystal_chamber` | Quantum Crystal Chamber | Chamber ✅ | ✅ Correct |
| Aether | `ws_etheric_bit_reactor` | Etheric Energy Reactor | Reactor ✅ | ✅ Correct |

**Tier 3 Status:** ✅ **Perfect** - All consistent

---

### TIER 4 - Legendary Producers (Should be 5 workstations, currently 6+)

| Element | Current ID | Current Name | Building Type | Status |
|---------|-----------|--------------|---------------|--------|
| Fire | `ws_arcane_candle_forge` | Arcane Candle Forge | Forge ✅ | ✅ Correct |
| Water | `ws_void_liquid_well` | Void Liquid Well | Well ✅ | ✅ Correct |
| Air | `ws_void_breath_generator` | Void Breath Generator | Generator ✅ | ✅ Correct |
| Crystal | `ws_void_crystal_chamber` | Void Crystal Chamber | Chamber ✅ | ✅ Correct |
| Aether | `ws_cosmic_bit_reactor` | Cosmic Energy Reactor | Reactor ⚠️ | ⚠️ **EXTRA - Should be Tier 5** |
| Aether | `ws_infinity_bit_reactor` | Infinity Energy Reactor | Reactor ✅ | ✅ **Should be Tier 5** |

**Tier 4 Issues:**
1. ❌ **Extra SE Producer** - `ws_cosmic_bit_reactor` is extra
2. ⚠️ **Tier 5 Workstation in Tier 4** - `ws_infinity_bit_reactor` should be Tier 5

**Current Structure:**
- Tier 4 has: Arcane Candle Forge, Void Crystal Chamber (partial)
- Tier 5 has: Void Liquid Well, Void Breath Generator, Eternal Flame Forge, Infinity Core Chamber, Infinity Energy Reactor

**Recommendations:**
- Move `ws_cosmic_bit_reactor` to Tier 5 OR remove it
- Reorganize Tier 4/5 to have exactly 5 workstations each

---

### TIER 5 - Legendary Producers (Currently has 5 workstations)

| Element | Current ID | Current Name | Building Type | Status |
|---------|-----------|--------------|---------------|--------|
| Water | `ws_void_liquid_well` | Void Liquid Well | Well ✅ | ✅ Correct |
| Air | `ws_void_breath_generator` | Void Breath Generator | Generator ✅ | ✅ Correct |
| Fire | `ws_eternal_flame_forge` | Eternal Flame Forge | Forge ✅ | ✅ Correct |
| Crystal | `ws_infinity_core_chamber` | Infinity Core Chamber | Chamber ✅ | ✅ Correct |
| Aether | `ws_infinity_bit_reactor` | Infinity Energy Reactor | Reactor ✅ | ✅ Correct |

**Tier 5 Status:** ✅ **Perfect** - All consistent

---

## Extra Workstations (Break 5-per-tier rule)

### Focus Producers (Meditation System)
1. `ws_focus_mill` - Tier 2 Focus Producer
2. `ws_focus_mill_t3` - Tier 3 Focus Producer
3. `ws_focus_mill_t4` - Tier 4 Focus Producer
4. `ws_focus_mill_t5` - Tier 5 Focus Producer

**Status:** ⚠️ **These are acceptable** - They're for meditation system, not main progression

### Extra SE Producers
1. `ws_arcane_bit_forge_t1` - Tier 1 SE Producer (EXTRA)
2. `ws_cosmic_bit_reactor` - Tier 4 SE Producer (EXTRA)

**Status:** ❌ **These break the structure** - Need to be integrated or removed

---

## Naming Convention Issues

### 1. Duplicate Display Names
- Tier 0: "Aqua Well" vs Tier 1: "Aqua Well" (same name)
- Tier 0: "Zephyr Generator" vs Tier 1: "Zephyr Generator" (same name)

### 2. Inconsistent ID Suffixes
- Some Tier 1 workstations have `_t1` suffix: `ws_aqua_well_t1`, `ws_zephyr_generator_t1`, `ws_crystal_chamber_t1`, `ws_aether_reactor_t1`
- Some don't: `ws_digcandle_forge`, `ws_arcane_bit_forge_t1`

### 3. ID/Name Mismatches
- `ws_arcane_bit_reactor` → "Spell Energy Reactor" (should be "Arcane Bit Reactor")

### 4. Building Type Inconsistencies
- `ws_arcane_bit_forge_t1` uses "Forge" but produces SE (should be "Reactor")
- All Aether workstations should use "Reactor" (except Tier 0 Synthesizer)

---

## Recommended Structure Fix

### Option 1: Keep Extra SE Producer, Fix Names

**Tier 1 (6 workstations - acceptable for early game):**
1. Fire: Digital Candle Forge ✅
2. Water: **Deep Aqua Well** (rename from "Aqua Well")
3. Air: **Enhanced Zephyr Generator** (rename from "Zephyr Generator")
4. Crystal: Crystal Orb Chamber ✅
5. Aether: Aether Reactor ✅
6. SE: **Arcane Bit Reactor** (rename from "Arcane Bit Forge", change type to Reactor)

**Tier 2 (5 workstations):**
1. Fire: Enhanced Candle Forge ✅
2. Water: Flowing Current Well ✅
3. Air: Wind Spiral Generator ✅
4. Crystal: Crystal Core Chamber ✅
5. Aether: **Arcane Bit Reactor** → Rename to "Spell Energy Reactor" OR keep as "Arcane Bit Reactor"

**Tier 4 (5 workstations):**
1. Fire: Arcane Candle Forge ✅
2. Water: Void Liquid Well ✅
3. Air: Void Breath Generator ✅
4. Crystal: Void Crystal Chamber ✅
5. Aether: **Remove `ws_cosmic_bit_reactor`** (it's extra)

**Tier 5 (5 workstations):**
1. Fire: Eternal Flame Forge ✅
2. Water: (moved from Tier 4) ✅
3. Air: (moved from Tier 4) ✅
4. Crystal: Infinity Core Chamber ✅
5. Aether: Infinity Energy Reactor ✅

### Option 2: Strict 5-per-tier, Move SE Producer

**Tier 1 (5 workstations):**
1. Fire: Digital Candle Forge ✅
2. Water: Deep Aqua Well (renamed)
3. Air: Enhanced Zephyr Generator (renamed)
4. Crystal: Crystal Orb Chamber ✅
5. Aether: Aether Reactor ✅
6. ~~SE: Remove `ws_arcane_bit_forge_t1`~~ ❌

**Tier 2 (5 workstations):**
1. Fire: Enhanced Candle Forge ✅
2. Water: Flowing Current Well ✅
3. Air: Wind Spiral Generator ✅
4. Crystal: Crystal Core Chamber ✅
5. Aether: **Arcane Bit Reactor** (moved from Tier 1, renamed from "Spell Energy Reactor")

---

## Summary of Issues

### Critical Issues ❌
1. **Extra SE Producer in Tier 1** - `ws_arcane_bit_forge_t1` breaks structure
2. **Extra SE Producer in Tier 4** - `ws_cosmic_bit_reactor` breaks structure
3. **ID/Name Mismatch** - `ws_arcane_bit_reactor` named "Spell Energy Reactor"
4. **Wrong Building Type** - `ws_arcane_bit_forge_t1` uses "Forge" but should be "Reactor"

### Medium Issues ⚠️
1. **Duplicate Display Names** - Tier 0 and Tier 1 share names
2. **Inconsistent ID Suffixes** - Some have `_t1`, some don't
3. **Tier 4/5 Reorganization** - Need to ensure exactly 5 per tier

### Minor Issues ℹ️
1. **Aether Synthesizer** - Special case name is acceptable
2. **Focus Mills** - Extra workstations are acceptable (meditation system)

---

## Recommended Actions

1. ✅ **Rename duplicate Tier 1 workstations** to have unique names
2. ✅ **Rename `ws_arcane_bit_forge_t1`** → `ws_arcane_bit_reactor_t1` and change type to "Reactor"
3. ✅ **Rename `ws_arcane_bit_reactor`** display name to "Arcane Bit Reactor" (or keep current name if preferred)
4. ✅ **Remove `ws_cosmic_bit_reactor`** OR move it to Tier 5
5. ✅ **Standardize ID naming** - Either all Tier 1 have `_t1` suffix or none do
6. ✅ **Verify Tier 4/5** have exactly 5 workstations each

