# Game Progression Analysis

## Current Structure Issues

### **Tier 0** (Raw → Refined Components)
✅ **Good**: Makes the 4 basic refined components
- Wax Bits → Wax Block
- Wick Fiber → Braided Wick  
- Crystal Dust → Shaped Crystal
- Aether Essence → Distilled Aether

### **Tier 1** (Refined Components → Basic Products)
❌ **Problems**:
1. **3 AB Generators** - Redundant! (AB Generator, AB + Crystal Dust Generator, AB Cauldron)
2. **Only 1 Digital Candle producer** - Introduced but not progressed
3. **AB + Crystal Dust Generator** - Produces `crystal_dust` (Tier 0) which goes BACKWARDS in progression
4. **AB Generator** - Uses wax_block + braided_wick + dist_aether (makes candles but consumes them for AB)

### **Tier 2** (Basic Products → Advanced Components)
❌ **Problems**:
1. **No candle progression** - Still just uses `dig_candle` from Tier 1
2. **Uses old `dig_candle`** - All Tier 2 generators require `dig_candle` but don't make new candles
3. **Makes advanced components** - wax_hex, crystal_core, aether_flux (good!)

### **Tier 3** (Advanced → Master Components)
❌ **Problems**:
1. **Still uses `dig_candle` from Tier 1!** - Coven Blessing Altar needs 10 dig_candle
2. **No candle progression** - Candles jump from Tier 1 → Tier 4 (skips 2 tiers!)
3. **Makes master components** - quantum_essence, coven_blessing, eldritch_wax (good!)

### **Tier 4** (Master → Legendary)
✅ **Good**: Makes arcane_candle, void_crystal, infinity_flux

---

## Missing Progression Chains

### **Candle Progression** (BROKEN)
- Tier 1: Digital Candle ✅
- Tier 2: **MISSING** ❌
- Tier 3: **MISSING** ❌  
- Tier 4: Arcane Candle ✅

**Problem**: 2-tier gap! Candles jump from T1 → T4

### **Crystal Progression** (PARTIAL)
- Tier 1: Shaped Crystal ✅
- Tier 2: Crystal Core ✅
- Tier 3: **MISSING** (should be Quantum Crystal or something)
- Tier 4: Void Crystal ✅

**Problem**: 1-tier gap between T2 and T4

### **Aether Progression** (PARTIAL)
- Tier 1: Distilled Aether ✅
- Tier 2: Aether Flux ✅
- Tier 3: **MISSING** (should be Quantum Aether or something)
- Tier 4: Infinity Flux ✅

**Problem**: 1-tier gap between T2 and T4

### **Wax Progression** (GOOD)
- Tier 1: Wax Block ✅
- Tier 2: Wax Hex ✅
- Tier 3: Eldritch Wax ✅
- Tier 4: Used in Arcane Candle ✅

**This one is actually fine!**

---

## Proposed Intuitive Progression

### **Theme: Each Tier Should Progress Each Component Line**

### **Tier 1** - Basic Products (Refined Components → First Products)
1. **Digital Candle Forge** - Makes `dig_candle` (wax_block + braided_wick + dist_aether)
2. **Crystal Orb Forge** - Makes `crystal_orb` (shaped_crys + dist_aether) - NEW
3. **Aether Well** - Makes `aether_well` + AB (dist_aether + shaped_crys) - NEW
4. **AB Generator** - Makes AB (wax_block + braided_wick + dist_aether) - Keep but reduce output

### **Tier 2** - Advanced Products (Basic Products → Enhanced Products)
1. **Enhanced Candle Forge** - Makes `enhanced_candle` (dig_candle + crystal_orb + aether_well) - NEW
2. **Crystal Core Forge** - Makes `crystal_core` (crystal_orb + aether_well + dig_candle)
3. **Aether Flux Reactor** - Makes `aether_flux` (aether_well + crystal_core + enhanced_candle) - UPDATED
4. **Wax Hex Forge** - Makes `wax_hex` (wax_block + shaped_crys + enhanced_candle) - UPDATED

### **Tier 3** - Master Products (Enhanced Products → Master Products)
1. **Quantum Candle Forge** - Makes `quantum_candle` (enhanced_candle + crystal_core + aether_flux) - NEW
2. **Quantum Crystal Lab** - Makes `quantum_essence` (crystal_core + aether_flux + quantum_candle) - UPDATED
3. **Quantum Aether Chamber** - Makes `quantum_aether` (aether_flux + quantum_essence + quantum_candle) - NEW
4. **Eldritch Wax Forge** - Makes `eldritch_wax` (wax_hex + quantum_essence + quantum_aether) - UPDATED

### **Tier 4** - Legendary Products (Master Products → Ultimate Products)
1. **Arcane Candle Tower** - Makes `arcane_candle` (quantum_candle + quantum_essence + quantum_aether) - UPDATED
2. **Void Crystal Chamber** - Makes `void_crystal` (quantum_essence + quantum_aether + arcane_candle) - UPDATED
3. **Infinity Flux Core** - Makes `infinity_flux` (quantum_aether + void_crystal + arcane_candle) - UPDATED

---

## Key Improvements

1. ✅ **Each tier progresses all component lines** (candles, crystals, aether, wax)
2. ✅ **No backwards progression** (no producing lower-tier items)
3. ✅ **Reduced AB redundancy** (only 1-2 AB generators per tier)
4. ✅ **Clear progression paths** for each component type
5. ✅ **Each tier uses products from previous tier** (no jumping tiers)

---

## Alternative: Keep Current Structure But Fix It

If you want to keep the current ingredient names, we could:

1. **Tier 1**: Add crystal progression (make crystal_orb instead of crystal_dust)
2. **Tier 2**: Add candle progression (make enhanced_candle instead of just using dig_candle)
3. **Tier 3**: Add aether progression (make quantum_aether) and use enhanced_candle
4. **Tier 4**: Use quantum_aether instead of jumping from aether_flux

This would require adding new ingredients but keep the existing structure mostly intact.

