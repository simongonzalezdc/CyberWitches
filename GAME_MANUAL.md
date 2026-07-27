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

- **Cast (EXEC)**: Compile raw magic into elemental essences and **Arcane Bits (AB)** (Kernel-owned resource path)
- **Soft fade / storage**: Unstored stock over capacity bleeds — **raw essence** hardest, **compiled intermediates** slower but still at risk. Build Store modules / buffers so stock survives
- **Workstations**: Craft sector modules; each has a **pipeline role** (Capture → Store → Bind → Compile → Shield) on the HUD and card badge
- **Inscriptions**: Upgrades that multiply cast and production
- **Experiments**: Discover hidden recipes
- **Prestige (Ascension)**: Reset for **Eldritch Keys (EK)** and **affinity** specialization strategies
- **Meditation**: Optional post-prestige tower defense; short first mastery can grant a lasting **production mult** (skippable pure-idle path)
- **Design tiers**: Progressive UI restoration from broken Tier 0 to full Kyanite chrome (chapter milestones can advance heals, not only pure AB grind)
- **Deeper Kernel lore / machine schema:** `guides/restoration-kernel/`

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

### Pipeline roles (HUD)

The workstations tab shows a **pipeline strip**: **CAPTURE → STORE → BIND → COMPILE → SHIELD**. Owned counts use coalesced ownership (no double-count). The strip also shows **STORAGE used/cap** in weighted void-pressure units and **VOID_PRESSURE** when over capacity. When prestige is recommended, **ASCEND_BAND** appears.

Stock you do not store can **fade** when over capacity — including distilled intermediates and late-tier packets (lower void weight than raw, never immortal). Store / buffer buildings raise the soft cap.

Live Tier 0 starters (unlock at 0 AB):

| Workstation | Recipe (base) | Pipeline role |
|---|---|---|
| **Fire Forge** | 10 Fire Essence | Capture |
| **Aqua Well** | 10 Water Essence | Capture |
| **Zephyr Generator** | 10 Air Essence | Capture |
| **Crystal Chamber** | 10 Crystal Dust | Capture |
| **Aether Synthesizer** | 2 each of Fire/Water/Air/Crystal | Bind |

Higher tiers include Digital Candle Forge, Deep Aqua Well, Enhanced Zephyr Generator, Crystal Orb Chamber, Aether Reactor, fusion/resonance chambers, quantum and void-tier producers, and **Arcane Bit Reactor** lines for idle AB (Compile). Cards show a small role badge.

Open the Workstations tab in-game for live costs, rates, and unlock thresholds — the UI is source of truth if this manual and a patch diverge.

**Affinity:** while you cast and craft, the game leans **affinity** (fire/water/air/crystal). After prestige, specialization strategies change optimal pipeline play.

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

| Tier | Feel | Live gate (approx.) |
|---|---|---|
| 0 | Broken mono terminal — incomplete chrome | Always |
| 1 | Color returns | 500 AB **and** 3 achievements |
| 2 | SFX + richer color | 5,000 AB **and** 6 achievements |
| 3 | Glass / motion | 50,000 AB **and** 9 achievements |
| 4 | Full sensory restoration | 500,000 AB **and** 12 achievements |

Tier unlocks track AB + achievements. The USP is real: start broken, heal as you compile.

### Heal moment (`SYSTEM_RESTORE`)

When a tier unlocks, the game emits `hex:tierAdvance` and runs a short **heal ceremony** (~1.2–1.8s): dim → restore line → chrome → toast/log → share pulse. With `prefers-reduced-motion`, you get the final log/toast and share button without motion.

### SHARE_RESTORE

After a heal, the **SHARE_RESTORE** control appears. One or two actions:

1. Download a **sanitized split still** (Tier before | restored after) — tier chrome labels only.  
2. Copy a short text blurb (clipboard; prompt fallback).

**Privacy:** share artifacts never include AB totals, inventory, prestige keys, or the full save. See [PRIVACY.md](PRIVACY.md).

### Compile goal rail

After the tutorial, a single primary **compile goal** (e.g. craft Fire Forge) shows in the goal rail. Completing real beats advances the stack. This is not a second quest HUD.

---

## Tips & Strategies

1. Hit the first compile goal: craft **Fire Forge**, then the other elemental starters.
2. Keep casting while early forges run — AB compounds unlocks.
3. Synthesize Aether when you can afford the four-essence recipe.
4. Watch for the first **SYSTEM_RESTORE** — that heal is the product thesis; try SHARE_RESTORE if you want a shareable still.
5. Push toward Arcane Bit Reactors / mid-tier AB producers before prestige.
6. After prestige, grab impactful EK boons, then sample Meditation for long-term production bonus.
7. Trust the live UI costs over any outdated third-party guide.

---

*Manual updated for Capture the heal (PR #20): ceremony, SHARE_RESTORE, compile goals, live tier gates. If in-game data differs, the running build wins.*
