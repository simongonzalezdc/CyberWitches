# Cyber Witches - Workstation Flowchart

## 🏭 Workstation Organization by Tier and Element

### TIER 0 - Basic Producers

#### [Crystal]
- **Crystal Shaper** [Collector]
  → Produces: 0.2/s shaped_crys

#### [Aether]
- **Aether Synthesizer** [Synthesizer]
  → Produces: 0.2/s dist_aether
  → Input: fire_essence + water_essence + air_essence + crystal_dust

#### [Fire]
- **Fire Still** [Still]
  → Produces: 0.2/s dist_fire

#### [Air]
- **Zephyr Collector** [Collector]
  → Produces: 0.2/s ethereal_gust

---

### TIER 1 - Early Game Producers

#### [Water]
- **Aqua Collector** [Collector]
  → Produces: 0.2/s liquid_essence

#### [Fire]
- **Digital Candle Forge** [Forge]
  → Produces: 0.4/s dig_candle

#### [Crystal]
- **Crystal Orb Forge** [Forge]
  → Produces: 0.4/s crystal_orb

#### [Aether]
- **Aether Well** [Well]
  → Produces: 0.4/s aether_well

---

### TIER 2 - Mid Game Producers

#### [Mixed]
- **Arcane Bit Forge** [Forge]
  → Produces: 2.5/s AB

#### [Water]
- **Aqua Well** [Well]
  → Produces: 0.4/s aqua_well

#### [Air]
- **Zephyr Generator** [Generator]
  → Produces: 0.4/s zephyr_totem

#### [Fire]
- **Enhanced Candle Forge** [Forge]
  → Produces: 0.4/s enhanced_candle

#### [Crystal]
- **Crystal Core Forge** [Forge]
  → Produces: 0.4/s crystal_core

---

### TIER 3 - Late Game Producers

#### [Aether]
- **Aether Flux Reactor** [Reactor]
  → Produces: 0.4/s aether_flux

#### [Fire]
- **Fire Hex Forge** [Forge]
  → Produces: 0.4/s wax_hex

#### [Mixed]
- **Etheric Bit Reactor** [Reactor]
  → Produces: 5/s AB

#### [Water]
- **Flowing Current Generator** [Generator]
  → Produces: 0.4/s flowing_current

#### [Air]
- **Wind Spiral Forge** [Forge]
  → Produces: 0.4/s wind_spiral

---

### TIER 4 - Legendary Producers

#### [Fire]
- **Quantum Candle Forge** [Forge]
  → Produces: 0.3/s quantum_candle
- **Eldritch Wax Forge** [Forge]
  → Produces: 0.3/s eldritch_wax
- **Arcane Candle Tower** [Tower]
  → Produces: 0.2/s arcane_candle

#### [Crystal]
- **Quantum Crystal Chamber** [Chamber]
  → Produces: 0.3/s quantum_crystal
- **Void Crystal Chamber** [Chamber]
  → Produces: 0.2/s void_crystal

#### [Aether]
- **Quantum Essence Lab** [Lab]
  → Produces: 0.3/s quantum_essence
- **Quantum Aether Chamber** [Chamber]
  → Produces: 0.3/s quantum_aether
- **Infinity Flux Core** [Core]
  → Produces: 0.2/s infinity_flux

#### [Water]
- **Quantum Water Chamber** [Chamber]
  → Produces: 0.3/s quantum_water
- **Void Liquid Core** [Core]
  → Produces: 0.2/s void_liquid

#### [Air]
- **Quantum Air Chamber** [Chamber]
  → Produces: 0.3/s quantum_air
- **Void Breath Core** [Core]
  → Produces: 0.2/s void_breath

#### [Mixed]
- **Cosmic Bit Nexus** [Nexus]
  → Produces: 25/s AB
- **Infinity Bit Engine** [Engine]
  → Produces: 750/s AB

---

## 🏗️ Workstation Organization by Building Type

### [Collector] (3 workstations)
- T0 - Crystal Shaper [Crystal] → 0.2/s shaped_crys
- T0 - Zephyr Collector [Air] → 0.2/s ethereal_gust
- T1 - Aqua Collector [Water] → 0.2/s liquid_essence

### [Still] (1 workstation)
- T0 - Fire Still [Fire] → 0.2/s dist_fire

### [Synthesizer] (1 workstation)
- T0 - Aether Synthesizer [Aether] → 0.2/s dist_aether
  → Input: fire_essence + water_essence + air_essence + crystal_dust

### [Forge] (9 workstations)
- T1 - Digital Candle Forge [Fire] → 0.4/s dig_candle
- T1 - Crystal Orb Forge [Crystal] → 0.4/s crystal_orb
- T2 - Enhanced Candle Forge [Fire] → 0.4/s enhanced_candle
- T2 - Crystal Core Forge [Crystal] → 0.4/s crystal_core
- T2 - Fire Hex Forge [Fire] → 0.4/s wax_hex
- T2 - Wind Spiral Forge [Air] → 0.4/s wind_spiral
- T3 - Quantum Candle Forge [Fire] → 0.3/s quantum_candle
- T4 - Eldritch Wax Forge [Fire] → 0.3/s eldritch_wax
- T2 - Arcane Bit Forge [Mixed] → 2.5/s AB

### [Well] (2 workstations)
- T1 - Aether Well [Aether] → 0.4/s aether_well
- T2 - Aqua Well [Water] → 0.4/s aqua_well

### [Generator] (2 workstations)
- T2 - Zephyr Generator [Air] → 0.4/s zephyr_totem
- T3 - Flowing Current Generator [Water] → 0.4/s flowing_current

### [Reactor] (2 workstations)
- T3 - Aether Flux Reactor [Aether] → 0.4/s aether_flux
- T3 - Etheric Bit Reactor [Mixed] → 5/s AB

### [Lab] (1 workstation)
- T4 - Quantum Essence Lab [Aether] → 0.3/s quantum_essence

### [Chamber] (5 workstations)
- T4 - Quantum Aether Chamber [Aether] → 0.3/s quantum_aether
- T4 - Quantum Crystal Chamber [Crystal] → 0.3/s quantum_crystal
- T4 - Quantum Water Chamber [Water] → 0.3/s quantum_water
- T4 - Quantum Air Chamber [Air] → 0.3/s quantum_air
- T4 - Void Crystal Chamber [Crystal] → 0.2/s void_crystal

### [Core] (3 workstations)
- T4 - Infinity Flux Core [Aether] → 0.2/s infinity_flux
- T4 - Void Liquid Core [Water] → 0.2/s void_liquid
- T4 - Void Breath Core [Air] → 0.2/s void_breath

### [Tower] (1 workstation)
- T4 - Arcane Candle Tower [Fire] → 0.2/s arcane_candle

### [Engine] (1 workstation)
- T4 - Infinity Bit Engine [Mixed] → 750/s AB

### [Nexus] (1 workstation)
- T4 - Cosmic Bit Nexus [Mixed] → 25/s AB

---

## 📊 Production Rate Summary by Building Type

| Building Type | Standard Rate | Count | Notes |
|--------------|---------------|-------|-------|
| **Collector** | 0.2/s | 3 | Basic ingredient collection |
| **Still** | 0.2/s | 2 | Basic distillation |
| **Forge** | 0.4/s (T1-T2)<br>0.3/s (T4) | 9 | Ingredient crafting (except 1 AB producer) |
| **Well** | 0.4/s | 2 | Elemental wells |
| **Generator** | 0.4/s | 2 | Elemental generation |
| **Reactor** | 0.4/s (ingredient)<br>5/s (AB) | 2 | Advanced processing |
| **Lab** | 0.3/s | 1 | Quantum essence production |
| **Chamber** | 0.3/s (Quantum)<br>0.2/s (Void) | 5 | Quantum/Void materials |
| **Core** | 0.2/s | 3 | Void/Infinity materials |
| **Tower** | 0.2/s | 1 | Legendary materials |
| **Engine** | 750/s AB | 1 | Ultimate AB production |
| **Nexus** | 25/s AB | 1 | High-tier AB production |

---

## 🔄 Element Progression Flow

### Fire Element Chain
```
T0: Fire Still → dist_fire
T1: Digital Candle Forge → dig_candle
T2: Enhanced Candle Forge → enhanced_candle
T2: Fire Hex Forge → wax_hex
T3: Quantum Candle Forge → quantum_candle
T4: Eldritch Wax Forge → eldritch_wax
T4: Arcane Candle Tower → arcane_candle
```

### Water Element Chain
```
T0: (none - uses Fire Still for dist_fire)
T1: Aqua Collector → liquid_essence
T2: Aqua Well → aqua_well
T3: Flowing Current Generator → flowing_current
T4: Quantum Water Chamber → quantum_water
T4: Void Liquid Core → void_liquid
```

### Air Element Chain
```
T0: Zephyr Collector → ethereal_gust
T2: Zephyr Generator → zephyr_totem
T3: Wind Spiral Forge → wind_spiral
T4: Quantum Air Chamber → quantum_air
T4: Void Breath Core → void_breath
```

### Crystal Element Chain
```
T0: Crystal Shaper → shaped_crys
T1: Crystal Orb Forge → crystal_orb
T2: Crystal Core Forge → crystal_core
T4: Quantum Crystal Chamber → quantum_crystal
T4: Void Crystal Chamber → void_crystal
```

### Aether Element Chain
```
T0: Aether Synthesizer → dist_aether
    (Input: fire_essence + water_essence + air_essence + crystal_dust)
T1: Aether Well → aether_well
T3: Aether Flux Reactor → aether_flux
T4: Quantum Essence Lab → quantum_essence
T4: Quantum Aether Chamber → quantum_aether
T4: Infinity Flux Core → infinity_flux
```

### AB Production Chain
```
T2: Arcane Bit Forge → 2.5/s AB
T3: Etheric Bit Reactor → 5/s AB
T4: Cosmic Bit Nexus → 25/s AB
T4: Infinity Bit Engine → 750/s AB
```

---

## 🎯 Total Workstation Count

- **Tier 0**: 4 workstations
- **Tier 1**: 4 workstations
- **Tier 2**: 5 workstations
- **Tier 3**: 5 workstations
- **Tier 4**: 14 workstations
- **Total**: 32 workstations

---

## 📐 Visual Flowchart Diagram

### By Tier (Vertical Flow)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 0 - Basic Producers (4 workstations)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [Crystal]         [Aether]         [Fire]          [Air]                │
│  Crystal Shaper    Aether Still     Fire Still      Zephyr Collector    │
│  0.2/s             0.2/s           0.2/s           0.2/s               │
│  shaped_crys       dist_aether      dist_fire       ethereal_gust       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 1 - Early Game Producers (4 workstations)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [Water]          [Fire]              [Crystal]        [Aether]          │
│  Aqua Collector   Digital Candle      Crystal Orb      Aether Well      │
│  0.2/s            Forge 0.4/s        Forge 0.4/s     0.4/s            │
│  liquid_essence   dig_candle          crystal_orb      aether_well      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 2 - Mid Game Producers (5 workstations)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [Mixed]          [Water]         [Air]            [Fire]        [Crystal]│
│  Arcane Bit       Aqua Well       Zephyr          Enhanced      Crystal  │
│  Forge 2.5/s AB   0.4/s           Generator       Candle        Core     │
│                   aqua_well        0.4/s           Forge 0.4/s   Forge    │
│                                    zephyr_totem    enhanced_     0.4/s    │
│                                                    candle        crystal_  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 3 - Late Game Producers (5 workstations)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [Aether]          [Fire]          [Mixed]         [Water]       [Air]   │
│  Aether Flux       Fire Hex        Etheric Bit     Flowing       Wind    │
│  Reactor 0.4/s     Forge 0.4/s     Reactor 5/s AB  Current       Spiral  │
│  aether_flux       wax_hex                        Generator      Forge    │
│                                                0.4/s            0.4/s     │
│                                                flowing_current  wind_     │
│                                                                   spiral  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 4 - Legendary Producers (14 workstations)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [Fire]           [Crystal]         [Aether]        [Water]      [Air]  │
│  Quantum Candle   Quantum Crystal   Quantum         Quantum      Quantum │
│  Forge 0.3/s      Chamber 0.3/s     Essence Lab     Water        Air     │
│  Eldritch Wax     Void Crystal      0.3/s           Chamber      Chamber │
│  Forge 0.3/s      Chamber 0.2/s     Quantum Aether  0.3/s        0.3/s   │
│  Arcane Candle                     Chamber 0.3/s   Void Liquid  Void    │
│  Tower 0.2/s                       Infinity Flux    Core 0.2/s   Breath  │
│                                    Core 0.2/s                          │
│                                                                   Core    │
│                                                                  0.2/s    │
│                                                                           │
│  [Mixed]                                                                  │
│  Cosmic Bit Nexus 25/s AB                                                │
│  Infinity Bit Engine 750/s AB                                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### By Building Type (Horizontal Groups)

```
FORGES (9 workstations)          CHAMBERS (5 workstations)        CORES (3 workstations)
├─ Digital Candle Forge (T1)      ├─ Quantum Aether Chamber (T4)  ├─ Infinity Flux Core (T4)
├─ Crystal Orb Forge (T1)         ├─ Quantum Crystal Chamber (T4)├─ Void Liquid Core (T4)
├─ Enhanced Candle Forge (T2)      ├─ Quantum Water Chamber (T4)  └─ Void Breath Core (T4)
├─ Crystal Core Forge (T2)        ├─ Quantum Air Chamber (T4)
├─ Fire Hex Forge (T3)            └─ Void Crystal Chamber (T4)
├─ Wind Spiral Forge (T3)
├─ Quantum Candle Forge (T4)
├─ Eldritch Wax Forge (T4)
└─ Arcane Bit Forge (T2) [AB]

REACTORS (2 workstations)         LABS (1 workstation)             TOWERS (1 workstation)
├─ Aether Flux Reactor (T3)       └─ Quantum Essence Lab (T4)     └─ Arcane Candle Tower (T4)
└─ Etheric Bit Reactor (T3) [AB]

ENGINES (1 workstation)           NEXUS (1 workstation)            COLLECTORS (3 workstations)
└─ Infinity Bit Engine (T4)       └─ Cosmic Bit Nexus (T4)        ├─ Crystal Shaper (T0)
    [AB]                              [AB]                         ├─ Zephyr Collector (T0)
                                                                   └─ Aqua Collector (T1)

WELLS (2 workstations)            GENERATORS (2 workstations)     STILLS (2 workstations)
├─ Aether Well (T1)                ├─ Zephyr Generator (T2)       ├─ Aether Still (T0)
└─ Aqua Well (T2)                  └─ Flowing Current Generator (T3)└─ Fire Still (T0)
```

### Element Progression Trees

```
FIRE ELEMENT                    WATER ELEMENT                   AIR ELEMENT
├─ T0: Fire Still              ├─ T1: Aqua Collector          ├─ T0: Zephyr Collector
│  └─ dist_fire                │  └─ liquid_essence           │  └─ ethereal_gust
│                               │                              │
├─ T1: Digital Candle Forge    ├─ T2: Aqua Well               ├─ T2: Zephyr Generator
│  └─ dig_candle                │  └─ aqua_well                │  └─ zephyr_totem
│                               │                              │
├─ T2: Enhanced Candle Forge   ├─ T3: Flowing Current Gen     ├─ T3: Wind Spiral Forge
│  └─ enhanced_candle          │  └─ flowing_current          │  └─ wind_spiral
│                               │                              │
├─ T2: Fire Hex Forge          ├─ T4: Quantum Water Chamber   ├─ T4: Quantum Air Chamber
│  └─ wax_hex                  │  └─ quantum_water            │  └─ quantum_air
│                               │                              │
├─ T4: Quantum Candle Forge    └─ T4: Void Liquid Core        └─ T4: Void Breath Core
│  └─ quantum_candle              └─ void_liquid                  └─ void_breath
│
├─ T4: Eldritch Wax Forge
│  └─ eldritch_wax
│
└─ T4: Arcane Candle Tower
   └─ arcane_candle

CRYSTAL ELEMENT                 AETHER ELEMENT
├─ T0: Crystal Shaper          ├─ T0: Aether Still
│  └─ shaped_crys              │  └─ dist_aether
│                              │
├─ T1: Crystal Orb Forge       ├─ T1: Aether Well
│  └─ crystal_orb              │  └─ aether_well
│                              │
├─ T2: Crystal Core Forge      ├─ T3: Aether Flux Reactor
│  └─ crystal_core             │  └─ aether_flux
│                              │
├─ T4: Quantum Crystal Chamber ├─ T4: Quantum Essence Lab
│  └─ quantum_crystal          │  └─ quantum_essence
│                              │
└─ T4: Void Crystal Chamber    ├─ T4: Quantum Aether Chamber
   └─ void_crystal             │  └─ quantum_aether
                              │
                              └─ T4: Infinity Flux Core
                                 └─ infinity_flux
```

