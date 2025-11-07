# Cyber Witches: Game Mechanics & Balance Analysis

## Generator Overview

### Total Generators: **18 Workstations**

**Breakdown by Tier:**

#### Tier 0 - Basic Producers (4 generators)
1. **Wax Melter** - Produces: `wax_block: 0.30/s`
   - Unlock: 0 AB
   - Growth: 1.10
   - Recipe: `wax_bits: 10`

2. **Wick Spinner** - Produces: `braided_wick: 0.30/s`
   - Unlock: 0 AB
   - Growth: 1.10
   - Recipe: `wick_fiber: 10`

3. **Crystal Shaper** - Produces: `shaped_crys: 0.20/s`
   - Unlock: 25 AB
   - Growth: 1.12
   - Recipe: `crystal_dust: 10`

4. **Aether Still** - Produces: `dist_aether: 0.20/s`
   - Unlock: 50 AB
   - Growth: 1.12
   - Recipe: `aether_ess: 10`

#### Tier 1 - AB Producers (4 generators)
5. **Digital Candle Farm** - Produces: `ab: 1.0/s`
   - Unlock: 75 AB
   - Growth: 1.14
   - Recipe: `wax_block: 5, braided_wick: 1, dist_aether: 2`

6. **Crystal Rig** - Produces: `ab: 0.2/s, crystal_dust: 0.05/s`
   - Unlock: 250 AB
   - Growth: 1.14
   - Recipe: `shaped_crys: 2, dist_aether: 2`

7. **Digital Candle Forge** - Produces: `dig_candle: 0.5/s`
   - Unlock: 750 AB
   - Growth: 1.15
   - Recipe: `wax_block: 8, braided_wick: 2, dist_aether: 3`

8. **Quantum Cauldron** - Produces: `ab: 2.5/s`
   - Unlock: 1500 AB
   - Growth: 1.16
   - Recipe: `shaped_crys: 3, dist_aether: 3, dig_candle: 1`

#### Tier 2 - Advanced Producers (4 generators)
9. **Hex Forge** - Produces: `wax_hex: 0.5/s, ab: 0.5/s`
   - Unlock: 5000 AB
   - Growth: 1.15
   - Recipe: `wax_block: 10, shaped_crys: 5, dig_candle: 2`

10. **Crystal Core Forge** - Produces: `crystal_core: 0.3/s, ab: 1.0/s`
    - Unlock: 10000 AB
    - Growth: 1.16
    - Recipe: `shaped_crys: 10, dist_aether: 5, dig_candle: 3`

11. **Aether Flux Reactor** - Produces: `aether_flux: 0.4/s, ab: 2.0/s`
    - Unlock: 20000 AB
    - Growth: 1.17
    - Recipe: `dist_aether: 10, crystal_core: 2, dig_candle: 5`

12. **Sigil Forge** - Produces: `sigil_charge: 0.2/s, ab: 5.0/s`
    - Unlock: 50000 AB
    - Growth: 1.18
    - Recipe: `wax_hex: 5, crystal_core: 3, aether_flux: 2`

#### Tier 3 - Master Producers (3 generators)
13. **Quantum Laboratory** - Produces: `quantum_essence: 0.15/s, ab: 10.0/s`
    - Unlock: 100000 AB
    - Growth: 1.19
    - Recipe: `sigil_charge: 3, crystal_core: 5, aether_flux: 3`

14. **Coven Altar** - Produces: `coven_blessing: 0.1/s, ab: 25.0/s`
    - Unlock: 250000 AB
    - Growth: 1.20
    - Recipe: `sigil_charge: 5, quantum_essence: 2, dig_candle: 10`

15. **Eldritch Forge** - Produces: `eldritch_wax: 0.08/s, ab: 50.0/s`
    - Unlock: 500000 AB
    - Growth: 1.21
    - Recipe: `coven_blessing: 2, quantum_essence: 5, sigil_charge: 10`

#### Tier 4 - Legendary Producers (3 generators)
16. **Arcane Tower** - Produces: `arcane_candle: 0.05/s, ab: 100.0/s`
    - Unlock: 1000000 AB
    - Growth: 1.22
    - Recipe: `eldritch_wax: 3, coven_blessing: 5, quantum_essence: 10`

17. **Void Chamber** - Produces: `void_crystal: 0.03/s, ab: 250.0/s`
    - Unlock: 2500000 AB
    - Growth: 1.23
    - Recipe: `arcane_candle: 2, eldritch_wax: 5, coven_blessing: 10`

18. **Infinity Core** - Produces: `infinity_flux: 0.01/s, ab: 1000.0/s`
    - Unlock: 10000000 AB
    - Growth: 1.25
    - Recipe: `void_crystal: 1, arcane_candle: 5, eldritch_wax: 20`

---

## Balance Analysis

### ✅ **Strengths**

1. **Clear Progression Path**: Generators unlock at increasing AB thresholds (0 → 10M AB)
2. **Growth Rate Scaling**: Growth rates increase with tier (1.10 → 1.25), making later generators more expensive
3. **Resource Dependencies**: Well-structured ingredient chains (tier 0 → tier 4)
4. **Multiple Output Types**: Mix of ingredient producers and AB producers creates interesting decisions

### ⚠️ **Balance Issues Identified**

#### 1. **Production Rate Imbalance**

**Issue**: AB production rates scale dramatically, but ingredient production rates don't scale proportionally.

- **Digital Candle Farm** (Tier 1): `1.0 AB/s`
- **Quantum Cauldron** (Tier 1): `2.5 AB/s` (2.5x increase)
- **Sigil Forge** (Tier 2): `5.0 AB/s` (5x increase)
- **Quantum Laboratory** (Tier 3): `10.0 AB/s` (10x increase)
- **Infinity Core** (Tier 4): `1000.0 AB/s` (1000x increase!)

**Problem**: The 1000x jump from Tier 3 to Tier 4 is enormous. Players will likely skip Tier 3 entirely once they reach Tier 4.

**Recommendation**: 
- Reduce Infinity Core to `500 AB/s` or `750 AB/s`
- Or increase Tier 3 AB production rates

#### 2. **Ingredient Production Rate Decline**

**Issue**: As tiers increase, ingredient production rates decrease:

- Tier 0: `0.30/s` (Wax Melter, Wick Spinner)
- Tier 1: `0.20/s` (Crystal Shaper, Aether Still)
- Tier 2: `0.50/s` (Hex Forge) but `0.30/s` (Crystal Core Forge), `0.40/s` (Aether Flux Reactor)
- Tier 3: `0.15/s` (Quantum Lab), `0.10/s` (Coven Altar), `0.08/s` (Eldritch Forge)
- Tier 4: `0.05/s` (Arcane Tower), `0.03/s` (Void Chamber), `0.01/s` (Infinity Core)

**Problem**: Lower-tier ingredients are produced faster than higher-tier, but higher-tier generators need more of these slower-producing ingredients. This creates bottlenecks.

**Recommendation**: 
- Increase high-tier ingredient production rates OR
- Reduce high-tier ingredient requirements in recipes

#### 3. **Growth Rate Inconsistency**

**Issue**: Growth rates don't always correlate with tier:

- Tier 0: `1.10` (consistent)
- Tier 1: `1.14`, `1.14`, `1.15`, `1.16` (minor increase)
- Tier 2: `1.15`, `1.16`, `1.17`, `1.18` (good progression)
- Tier 3: `1.19`, `1.20`, `1.21` (good progression)
- Tier 4: `1.22`, `1.23`, `1.25` (good progression)

**Problem**: Some early generators have higher growth (1.15-1.16) than some later ones (1.15-1.16), making them scale similarly.

**Recommendation**: Make growth rates more strictly tiered (e.g., Tier 2: 1.15-1.16, Tier 3: 1.17-1.18, Tier 4: 1.20-1.25)

#### 4. **Recipe Cost Scaling**

**Issue**: Recipe costs scale exponentially with growth rate, but production rates don't scale proportionally.

**Example**: 
- Wax Melter (growth 1.10): After 10 crafts, recipe costs ~26x base
- Infinity Core (growth 1.25): After 10 crafts, recipe costs ~93x base

**Problem**: Higher growth rates make later generators prohibitively expensive much faster, but their production doesn't compensate enough.

**Recommendation**: Consider reducing growth rates for high-tier generators OR increasing their base production rates.

#### 5. **Unlock Progression Gaps**

**Issue**: Large gaps in unlock thresholds:

- Tier 1: 75 → 250 → 750 → 1500 (3.3x, 3x, 2x)
- Tier 2: 5000 → 10000 → 20000 → 50000 (2x, 2x, 2.5x)
- Tier 3: 100000 → 250000 → 500000 (2.5x, 2x)
- Tier 4: 1000000 → 2500000 → 10000000 (2.5x, 4x)

**Problem**: The 4x jump from Void Chamber to Infinity Core is huge compared to other gaps.

**Recommendation**: Add intermediate generator or reduce Infinity Core unlock to 5M AB.

#### 6. **Crystal Rig Underpowered**

**Issue**: Crystal Rig (Tier 1) produces only `0.2 AB/s` compared to Digital Candle Farm's `1.0 AB/s`.

**Problem**: It's 5x weaker despite being unlocked later (250 AB vs 75 AB).

**Recommendation**: 
- Increase Crystal Rig AB production to `0.5/s` or `0.8/s`
- Or reduce its unlock requirement to 150 AB

#### 7. **Missing Ingredient Producers**

**Issue**: Some ingredients lack dedicated producers at their tier:

- `braided_wick` only has Wick Spinner (Tier 0)
- `shaped_crys` only has Crystal Shaper (Tier 0)
- `dist_aether` only has Aether Still (Tier 0)

**Problem**: Higher-tier generators need these ingredients but can only get them from Tier 0 producers, creating bottlenecks.

**Recommendation**: Add higher-tier producers for these ingredients OR increase production rates of existing ones.

---

## Balance Score: **6.5/10**

### Summary:
- **Good**: Clear progression, well-structured ingredient chains, variety in generator types
- **Needs Work**: Production rate scaling, ingredient bottlenecks, growth rate consistency, unlock progression gaps

### Priority Fixes:
1. **High Priority**: Reduce Infinity Core AB production (1000 → 500-750)
2. **High Priority**: Increase Crystal Rig AB production (0.2 → 0.5-0.8)
3. **Medium Priority**: Increase high-tier ingredient production rates
4. **Medium Priority**: Fill unlock progression gaps (especially 2.5M → 10M)
5. **Low Priority**: Standardize growth rates more strictly by tier

