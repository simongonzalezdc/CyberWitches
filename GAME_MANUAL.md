# Hex Compiler — Game Manual

## Table of Contents

1. [Game Overview](#game-overview)
2. [Getting Started](#getting-started)
3. [Core Mechanics](#core-mechanics)
4. [Workstations](#workstations)
5. [Inscriptions (Upgrades)](#inscriptions-upgrades)
6. [Experiments & Recipes](#experiments--recipes)
7. [Prestige System](#prestige-system)
8. [Meditation](#meditation)
9. [Daily Rituals](#daily-rituals)
10. [Design Tiers](#design-tiers)
11. [Tips & Strategies](#tips--strategies)

---

## Game Overview

**Hex Compiler** is a browser idle incremental game. You are a Hex Compiler: system chrome is a terminal that compiles fading magic into stable data. Occult content (essences, chambers, rituals) is what you preserve.

- **Cast (EXEC)**: Compile raw magic into elemental essences and **Arcane Bits (AB)**
- **Workstations**: Craft preservation chambers that produce ingredients over time
- **Inscriptions**: Upgrades that multiply cast and production
- **Experiments**: Discover hidden recipes
- **Prestige (Ascension)**: Reset for **Eldritch Keys (EK)** and element specialization
- **Meditation**: Post-prestige tower defense that boosts production (gated at Prestige 1)
- **Design tiers**: Progressive UI restoration from broken Tier 0 to full Kyanite chrome

---

## Getting Started

1. Open `play.html` (or Play from the landing page).
2. Click **EXEC** to cast — you receive base elemental essences and **0.15 AB** per cast (before multipliers).
3. Watch the **resource monitor** for Fire, Water, Air, Crystal, and Aether totals.
4. First compile goal: **Stabilize Fire sector — craft 1 Fire Forge** (10 Fire Essence).
5. Craft more workstations to automate ingredient production, then unlock higher AB producers.

### Controls

- **EXEC / Cast**: Manual compile pulse
- **Tabs**: Workstations, upgrades, inventory, lab, stats, daily rituals; Boons and Meditation unlock after prestige
- **Craft controls**: Craft ×1 / ×10 / Max where available

---

## Core Mechanics

### Currency

- **AB (Arcane Bits)** — primary currency. Earned from casting (~0.15 AB base per cast × multipliers) and later from AB-producing workstations. Used for unlocks and progression thresholds.
- **EK (Eldritch Keys)** — prestige currency. Spent on permanent boons and prestige bonuses. Persists across ascension.

### Ingredients (cast baseline)

Each cast grants (before multipliers):

| Ingredient | Base amount |
|---|---|
| Crystal Dust | 0.5 |
| Fire Essence | 0.5 |
| Water Essence | 0.5 |
| Air Essence | 0.5 |

Aether is **not** granted by cast. Craft an **Aether Synthesizer** (mix of all four base essences) to produce Aether streams.

Rare casts can **critical-compile** (large mult) or **compile-overclock** (1.5×) — framed as system events, not casino jackpots.

### Production scaling

Workstation costs scale with owned count:

`cost = base_recipe × (growth ^ owned)`

Growth is typically ~1.12–1.16 depending on the workstation.

---

## Workstations

Live Tier 0 starters (unlock at 0 AB):

| Workstation | Recipe (base) | Role |
|---|---|---|
| **Fire Forge** | 10 Fire Essence | Fire sector preservation |
| **Aqua Well** | 10 Water Essence | Water sector |
| **Zephyr Generator** | 10 Air Essence | Air sector |
| **Crystal Chamber** | 10 Crystal Dust | Crystal sector |
| **Aether Synthesizer** | 2 each of Fire/Water/Air/Crystal | Aether synthesis |

Higher tiers include Digital Candle Forge, Deep Aqua Well, Enhanced Zephyr Generator, Crystal Orb Chamber, Aether Reactor, fusion/resonance chambers, quantum and void-tier producers, and **Arcane Bit Reactor** lines for idle AB.

Open the Workstations tab in-game for live costs, rates, and unlock thresholds — the UI is source of truth if this manual and a patch diverge.

---

## Inscriptions (Upgrades)

Inscriptions improve cast yield, production multipliers, and related systems. Purchase with ingredients/AB as shown in `/SYS/UPGRADES`. Prefer early cast and production mults that compound with EXEC.

---

## Experiments & Recipes

The lab (`/BIN/LAB`) discovers hidden recipes through experimentation. Run protocols when you have spare ingredients; discovered recipes expand crafting options permanently (subject to save).

---

## Prestige System

When progress stalls, **ascend** to convert lifetime progress into **Eldritch Keys (EK)** and permanent bonuses.

- Resets AB, ingredients, workstations, and most upgrades
- Keeps EK, boons, recipes, achievements, and design-tier unlocks (see in-game confirm dialog)
- Choose an **element specialization** (fire / water / air / crystal) for asymmetric bonuses
- Unlocks **Boons** and **Meditation** tabs at Prestige ≥ 1

---

## Meditation

Unlocked after first prestige. A tower-defense sub-game: place towers, defend Tranquility against Distractions, earn Focus and session stats.

- Production bonus scales with completed waves, kills, and sessions
- Stats **persist** across save/load
- Not available in the first pre-prestige arc by design

---

## Daily Rituals

`/ETC/RITUALS` offers rotating tasks with AB / ingredient / fragment rewards. Complete dailies for steady EK fragment progress toward keys.

---

## Design Tiers

| Tier | Feel |
|---|---|
| 0 | Broken mono terminal — incomplete chrome |
| 1+ | Color returns |
| 2+ | SFX |
| 3+ | Glass / richer motion |
| 4 | Full sensory restoration |

Tier unlocks track AB + achievements. The USP is real: start broken, heal as you compile.

---

## Tips & Strategies

1. Hit the first compile goal: craft **Fire Forge**, then the other elemental starters.
2. Keep casting while early forges run — AB compounds unlocks.
3. Synthesize Aether when you can afford the four-essence recipe.
4. Push toward Arcane Bit Reactors / mid-tier AB producers before prestige.
5. After prestige, grab impactful EK boons, then sample Meditation for long-term production bonus.
6. Trust the live UI costs over any outdated third-party guide.

---

*Manual regenerated for live Hex Compiler systems (Arcane Bits / Eldritch Keys, Fire Forge line, post-prestige meditation). If in-game data differs, the running build wins.*
