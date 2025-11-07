# Balance Issues - Complete Fix List

## 🔴 Critical Issues (Must Fix)

### 1. No Early SE Automation
**Problem:** First SE producer unlocks at 10,000 SE (~18.5 hours of clicking)  
**Solution:** Add Tier 1 SE producer

**Fix:**
```javascript
// Add to PRODUCERS array after Tier 1 workstations
{
    id: "ws_arcane_bit_forge_t1",
    displayName: "Arcane Bit Forge",
    unlockAtAb: 1000.0,
    recipe: { dig_candle: 2, crystal_orb: 1, aether_well: 1 },
    growth: 1.15,
    outputs: { ab: 1.5 }
}
```

### 2. Infinity Energy Reactor Output Too High
**Problem:** 2,000/s SE is 80x previous tier (breaks balance)  
**Solution:** Reduce to 750/s SE

**Fix:**
```javascript
// In ws_infinity_bit_reactor
outputs: { ab: 750.0 } // Instead of 2000.0
```

### 3. Click Upgrade Recipe Mismatches
**Problem:** Master/Eldritch Sigil require materials from higher tiers  
**Solution:** Update recipes

**Fixes:**
```javascript
// Master Sigil (u_click_3)
recipe: { enhanced_candle: 10, crystal_core: 5 } // Instead of quantum_candle

// Eldritch Sigil (u_click_4)
recipe: { quantum_candle: 10, quantum_crystal: 5 } // Instead of arcane_candle
```

### 4. Spell Energy Eternal Boost Too Powerful
**Problem:** +5000% (51x multiplier) for 5 hours  
**Solution:** Cap at +1000% for 2 hours

**Fix:**
```javascript
// In HIDDEN_RECIPES - ab_eternal_boost
description: "💰 TEMPORARY: +1000% Spell Energy production for 2 hours"
// Update the buff value in game code to cap at 10.0 (11x multiplier)
```

### 5. Workstation ID Mismatches in Upgrades
**Problem:** Many upgrades reference old/non-existent workstation IDs  
**Solution:** Update all IDs

**Fixes Needed:**
- `u_crystal_1`: `ws_crystal` → `ws_crystal_chamber_t1`
- `u_candle_1`: `ws_candle` → `ws_arcane_bit_reactor`
- `u_digcandle_forge_t2_1`: `ws_digcandle_forge_t2` → `ws_enhanced_candle_forge`
- `u_coreforge_1`: `ws_coreforge` → `ws_crystal_core_chamber`
- `u_sigilforge_1`: `ws_sigilforge` → `ws_etheric_bit_reactor`
- `u_quantumlab_candle_1`: `ws_quantumlab_candle` → `ws_quantum_candle_forge`
- `u_quantumlab_1`: `ws_quantum_crystal_chamber` ✅ (correct)
- `u_quantumlab_aether_1`: `ws_quantum_water_well` ✅ (correct)
- `u_eldritchforge_1`: `ws_quantum_air_generator` ✅ (correct)
- `u_covenaltar_1`: `ws_etheric_bit_reactor` ✅ (correct)
- `u_arcanetower_1`: `ws_arcane_candle_forge` ✅ (correct)
- `u_voidchamber_1`: `ws_void_crystal_chamber` ✅ (correct)
- `u_voidliquid_1`: `ws_void_liquid_well` ✅ (correct)
- `u_voidbreath_1`: `ws_void_breath_generator` ✅ (correct)
- `u_eternalflame_1`: `ws_eternal_flame_forge` ✅ (correct)
- `u_infinitycore_1`: `ws_infinity_core_chamber` ✅ (correct)
- `u_infinitycore_ab_1`: `ws_infinity_bit_reactor` ✅ (correct)

### 6. Workstation ID Mismatches in Daily Tasks
**Problem:** Many tasks reference old/non-existent workstation IDs  
**Solution:** Update all IDs

**Fixes Needed:**
- `d_kindle`: `ws_fire_still` → `ws_fire_forge`
- `d_shape`: `ws_shaper` → `ws_crystal_chamber`
- `d_enhanced`: `ws_digcandle_forge_t2` → `ws_enhanced_candle_forge`
- `d_core`: `ws_coreforge` → `ws_crystal_core_chamber`
- `d_flux`: `ws_fluxreactor` → **REMOVE** (doesn't exist) or create workstation
- `d_quantum`: `ws_quantumlab_candle` → `ws_quantum_candle_forge`
- `d_essence`: `ws_quantumlab` → **REMOVE** or update to specific quantum workstation
- `d_arcane`: `ws_arcanetower` → `ws_arcane_candle_forge`
- `d_void`: `ws_voidchamber` → `ws_void_crystal_chamber`

### 7. Workstation ID Mismatches in Prestige Bonuses
**Problem:** Many bonuses reference old/non-existent workstation IDs  
**Solution:** Update all IDs

**Fixes Needed:**
- `pp_crystal_mult`: `ws_crystal` → `ws_crystal_chamber_t1`
- `pp_candle_mult`: `ws_candle` → `ws_arcane_bit_reactor`
- `pp_sigilforge_mult`: `ws_sigilforge` → `ws_etheric_bit_reactor`
- `pp_quantumlab_mult`: `ws_quantumlab` → **REMOVE** or update to specific quantum workstation
- `pp_covenaltar_mult`: `ws_covenaltar` → `ws_etheric_bit_reactor`
- `pp_eldritchforge_mult`: `ws_eldritchforge` → **REMOVE** (doesn't exist)
- `pp_arcanetower_mult`: `ws_arcanetower` → `ws_arcane_candle_forge`
- `pp_voidchamber_mult`: `ws_voidchamber` → `ws_void_crystal_chamber`
- `pp_infinitycore_mult`: `ws_infinitycore` → `ws_infinity_core_chamber`
- `pp_infinitycore_ab_mult`: `ws_infinitycore_ab` → `ws_infinity_bit_reactor`

### 8. Prestige Bonus Ingredient Reference
**Problem:** `pp_start_sigil` references `sigil_charge` which doesn't exist  
**Solution:** Remove or update

**Fix:**
```javascript
// Remove pp_start_sigil or change to existing ingredient
// Option 1: Remove
// Option 2: Change to focus or another existing ingredient
```

---

## 🟡 Medium Issues (Should Fix)

### 9. Late Game SE Rewards Don't Scale
**Problem:** Fixed SE amounts become insignificant  
**Solution:** Use percentage-based rewards

**Fix:**
```javascript
// In daily tasks and achievements
// Instead of fixed amounts, use:
rewardValue: Math.min(gameState.ab * 0.1, 1000000) // 10% of current SE, capped at 1M
```

### 10. Large Unlock Gaps
**Problem:** 200K → 5M → 20M SE gaps  
**Solution:** Add Tier 4 SE producer

**Fix:**
```javascript
// Add Tier 4 SE producer
{
    id: "ws_cosmic_bit_reactor",
    displayName: "Cosmic Energy Reactor",
    unlockAtAb: 5000000.0,
    recipe: { arcane_candle: 3, void_crystal: 3, quantum_candle: 3, quantum_crystal: 3, aether_well: 3 },
    growth: 1.25,
    outputs: { ab: 150.0 }
}
```

### 11. SE Production Bonuses Limited Scope
**Problem:** Only affect 3 workstations  
**Solution:** Consider affecting SE from clicking too

**Fix:**
```javascript
// In gameState.js - apply SE production bonuses to clicking too
// When calculating SE from clicking, apply ab_production multipliers
```

---

## 🟢 Minor Issues (Nice to Fix)

### 12. Missing Workstation References
**Problem:** Some tasks reference non-existent workstations  
**Solution:** Remove or update references

### 13. Recipe Balance Verification
**Problem:** Need to verify all recipes are balanced  
**Solution:** Review all recipes for appropriate tier materials

---

## 📊 Summary

**Total Issues Found:** 13
- **Critical:** 8 issues
- **Medium:** 3 issues
- **Minor:** 2 issues

**Priority Order:**
1. Fix workstation ID mismatches (affects many systems)
2. Add early SE producer (affects early game)
3. Reduce Infinity Energy Reactor output (affects late game)
4. Fix click upgrade recipes (affects progression)
5. Cap Spell Energy Eternal Boost (affects balance)
6. Scale late game rewards (affects engagement)
7. Add Tier 4 SE producer (affects progression)
8. Expand SE production bonuses (affects balance)

---

*Generated: 2025-01-XX*  
*Version: 2.0 (Post-Aether Simplification)*

