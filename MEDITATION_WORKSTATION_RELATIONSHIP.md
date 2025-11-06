# Meditation System and Workstation Relationship

## Overview

The meditation system is a separate game mode that uses **tower defense mechanics** and requires ingredients produced by **workstations** from the main game. Meditation towers are built using ingredients from workstations, and they produce meditation-only ingredients that are used for tower attacks and meditation upgrades.

---

## How Meditation Relates to Workstations

### 1. **Meditation Towers Require Workstation Ingredients**

Meditation towers are built using ingredients produced by main game workstations. Each tower tier corresponds to workstation tiers:

| Meditation Tower Tier | Tower Name | Required Ingredients | Workstation Sources |
|----------------------|------------|---------------------|---------------------|
| **Tier 0** | Peace Circle | `fire_essence` (T0) | Fire Forge (T0) |
| **Tier 0** | Focus Ring | `crystal_dust` (T0), `aether_ess` (T0) | Crystal Chamber (T0), Aether Reactor (T0) |
| **Tier 1** | Tranquility Shrine | `dist_fire` (T1), `dig_candle` (T1), `shaped_crys` (T1) | Fire Forge (T0), Digital Candle Forge (T1), Crystal Chamber (T0) |
| **Tier 1** | Serenity Altar | `dig_candle` (T1), `crystal_orb` (T1), `dist_aether` (T1) | Digital Candle Forge (T1), Crystal Orb Chamber (T1), Aether Reactor (T0) |
| **Tier 2** | Zen Pavilion | `enhanced_candle` (T2), `crystal_core` (T2), `aether_flux` (T2) | Enhanced Candle Forge (T2), Crystal Core Chamber (T2), **Aether Flux Reactor (T2)** |
| **Tier 2** | Meditation Temple | `wax_hex` (T2), `crystal_core` (T2), `aether_flux` (T2) | **Fire Hex Forge (T2)**, Crystal Core Chamber (T2), **Aether Flux Reactor (T2)** |
| **Tier 3** | Quantum Sanctum | `quantum_candle` (T3), `quantum_essence` (T3), `quantum_aether` (T3) | Quantum Candle Forge (T3), **quantum_essence (NOT PRODUCED)**, **quantum_aether (NOT PRODUCED)** |
| **Tier 4** | Nirvana Sanctuary | `arcane_candle` (T4), `void_crystal` (T4), `infinity_flux` (T4) | Arcane Candle Forge (T4), Void Crystal Chamber (T4), **infinity_flux (NOT PRODUCED)** |

---

## Current Issues

### ❌ **Missing Ingredients**

After restructuring workstations to 25 total (5 tiers × 5 elements), some ingredients that meditation towers require are **no longer produced**:

1. **`quantum_essence`** (Tier 3)
   - Required by: Quantum Sanctum (T3)
   - **Status**: Not produced by any workstation
   - **Previously produced by**: Quantum Essence Lab (removed)

2. **`quantum_aether`** (Tier 3)
   - Required by: Quantum Sanctum (T3)
   - **Status**: Not produced by any workstation
   - **Previously produced by**: Quantum Aether Chamber (removed)

3. **`aether_flux`** (Tier 2)
   - Required by: Zen Pavilion (T2), Meditation Temple (T2)
   - **Status**: Not produced by any workstation
   - **Previously produced by**: Aether Flux Reactor (T3) - but this was moved to Tier 3

4. **`wax_hex`** (Tier 2)
   - Required by: Meditation Temple (T2)
   - **Status**: Not produced by any workstation
   - **Previously produced by**: Fire Hex Forge (removed)

5. **`infinity_flux`** (Tier 4)
   - Required by: Nirvana Sanctuary (T4)
   - **Status**: Not produced by any workstation
   - **Previously produced by**: Infinity Flux Core (removed)

---

## Element Alignment

The new workstation structure follows a strict element-based organization:

- **Fire** → Forge
- **Water** → Well
- **Air** → Generator
- **Crystal** → Chamber
- **Aether** → Reactor

However, meditation towers currently require ingredients from **multiple elements**, which doesn't align with the new structure where each tier has exactly one workstation per element.

---

## Recommendations

### Option 1: Update Meditation Tower Recipes

Update meditation towers to use ingredients that are actually produced by the new workstation structure:

**Tier 2 Towers:**
- Zen Pavilion: Use `enhanced_candle` (Fire T2), `crystal_core` (Crystal T2), `flowing_current` (Water T2), `wind_spiral` (Air T2)
- Meditation Temple: Use `enhanced_candle` (Fire T2), `crystal_core` (Crystal T2), `flowing_current` (Water T2), `wind_spiral` (Air T2)

**Tier 3 Towers:**
- Quantum Sanctum: Use `quantum_candle` (Fire T3), `quantum_water` (Water T3), `quantum_air` (Air T3), `quantum_crystal` (Crystal T3)

**Tier 4 Towers:**
- Nirvana Sanctuary: Use `arcane_candle` (Fire T4), `void_liquid` (Water T4), `void_breath` (Air T4), `void_crystal` (Crystal T4)

### Option 2: Add Missing Ingredients to Workstations

Add production for missing ingredients:
- Produce `quantum_essence` and `quantum_aether` somewhere (maybe in Tier 3 Aether Reactor?)
- Produce `aether_flux` in Tier 2 Aether Reactor (but this is the AB producer)
- Produce `wax_hex` somewhere in Tier 2
- Produce `infinity_flux` in Tier 4 Aether Reactor (but this is the AB producer)

### Option 3: Align Meditation Towers with Element Structure

Make meditation towers require ingredients from all 4 other elements (matching the AB producer pattern):

**Tier 2 Towers:**
- Require: `enhanced_candle` (Fire), `flowing_current` (Water), `wind_spiral` (Air), `crystal_core` (Crystal)

**Tier 3 Towers:**
- Require: `quantum_candle` (Fire), `quantum_water` (Water), `quantum_air` (Air), `quantum_crystal` (Crystal)

**Tier 4 Towers:**
- Require: `arcane_candle` (Fire), `void_liquid` (Water), `void_breath` (Air), `void_crystal` (Crystal)

---

## Meditation-Exclusive Ingredients

Meditation produces its own ingredients that are **not** produced by workstations:

| Ingredient | Tier | Used For | Produced By |
|-----------|------|----------|-------------|
| `serenity_essence` | 0 | Tower attack costs | Meditation rewards |
| `focus_crystal` | 1 | Tower attack costs | Meditation rewards |
| `tranquil_aether` | 2 | Tower attack costs | Meditation rewards |
| `zen_orb` | 3 | Tower attack costs | Meditation rewards |
| `nirvana_essence` | 4 | Tower attack costs | Meditation rewards |

These are **meditation-only** and are produced by defeating distractions in meditation mode.

---

## Summary

**Current State:**
- Meditation towers require ingredients from workstations
- Some required ingredients are no longer produced after restructuring
- Meditation towers don't align with the new 5-element, 5-tier structure

**Next Steps:**
1. Identify all missing ingredients
2. Decide whether to:
   - Update meditation tower recipes to use available ingredients
   - Add production for missing ingredients
   - Align meditation towers with the element-based structure

