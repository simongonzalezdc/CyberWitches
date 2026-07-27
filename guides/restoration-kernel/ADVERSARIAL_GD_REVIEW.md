# Adversarial Game Design Review — Restoration Kernel

**Date:** 2026-07-27  
**Branch:** `feat/adversarial-gd-anti-cliche-aesthetic-v2`  
**Lens:** mechanics, scaling, difficulty, idle best practices, anti-cliché  
**Stance:** hostile designer / veteran incremental player — not vibes.

---

## Verdict (shipping slice)

| Domain | Grade | Note |
|--------|-------|------|
| Core loop identity | **A** | Capture → Store → Bind → Compile → Shield is legible and non-generic |
| Soft fade as pressure | **A−** → **A** after this pass | Intermediate fade weights restore Store mid-run |
| Scaling / growth | **B+** | Exponential craft growth is standard; AB unlock ladder is wide |
| Difficulty curve | **B+** | Early soft is correct; mid-gap 200–5k AB was patched by T1.5 |
| Prestige / affinity | **A−** | Four strategies change pipeline; keys curve is honest sqrt |
| Anti-cliché (systems) | **A** | Void weight > “immortal intermediates” cliché |
| Anti-cliché (copy) | **B → A−** | Diegetic sector language; purged preservation-chamber spam |
| Visual aesthetic | **B → A** | Hex lattice terminal overrides generic cyan glass |

**Ship gate for this PR:** mechanics + copy + CSS land; visual score ≥95 remains Q5 on canary path.

---

## 1. Fantasy & identity (what the game *is*)

**Strengths**

- Diegetic fantasy is strong: failing hex sectors, EXEC cast, compile contracts, soft void loss.
- Pipeline roles give a **verb vocabulary** most idle games lack (only “buy generator N”).
- Design-tier heal + mute-first ceremony is a real anti-cliché beat (restoration as system restore, not “level up glow”).

**Clichés rejected (good)**

| Idle cliché | What we do instead |
|-------------|-------------------|
| Number go up only | Soft fade makes storage a *decision* |
| Prestige = +% forever | Affinity strategies rebalance pipeline roles |
| Crafted goods are banked forever | Weighted fade on intermediates (`FADE_WEIGHT`) |
| “Digital preservation chamber” spam | Sector-tap / void-weight / compile-engine copy |
| Generic cyan glassmorphism | Hex lattice instrument deck (`aesthetic-v2.css`) |

**Residual risk**

- Dual graph (Kernel `mod_*` + live `ws_*` ladder) can still read as two games if HUD/role mapping drifts. Q8 (28/28 role-mapped) is the hard gate — keep it green.

---

## 2. Core loop & verbs

```
EXEC (cast raw) → CAPTURE (automate raw/intermediates) → STORE (cap vs fade)
  → BIND (densify / lower void weight) → COMPILE (AB) → SHIELD (global mult)
  → prestige keys + affinity lock
```

| Verb | Healthy? | Finding |
|------|----------|---------|
| EXEC | Yes | Seeded crit/overclock; affinity lean post-spec |
| Capture | Yes | First unlocks at AB 0; four elements parallel |
| Store | **Fixed this PR** | Was dying midgame when only raw faded |
| Bind | Yes | Distilled aether is the void-hates-least intermediate |
| Compile | Yes | Sector Compiler (early trickle) + reactor ladder |
| Shield | Yes | Scarce growth 1.2–1.22; floor fadeMult 0.5 |

### Finding F1 — Store dies if intermediates are immortal (CRITICAL, fixed)

**Before:** `FADEABLE` = raw essences + `dist_aether` only.  
**Player exploit:** Convert everything to `dist_fire` / `shaped_crys` / craft ladder → zero void pressure → Store becomes cosmetic after T0.  
**Idle best practice violated:** Soft caps must tax the *actual* banked wealth, not only the tutorial resource.

**Fix shipped:** full `FADE_WEIGHT` map across **all** producer non-AB outputs (raw → void tier). Weights descend with densification (raw 1.0 → void_crystal 0.12). Cap is in weighted void-pressure units (documented in `fade.js`). Store remains a verb through late game.

**GLM gate (pre-merge):** first slice only covered T0–T1.5 — T2+ were immortal. Extended + tests pin crystal_core / void_crystal / mixed-bag ratio / clamp.

---

## 3. Scaling & economy

### Growth rates

| Band | Typical `growth` | Read |
|------|------------------|------|
| T0 capture / bind | 1.12 | Soft, multi-buy friendly |
| Store / early compile | 1.13–1.16 | Correct premium |
| Shield | 1.2–1.22 | Scarcity signal |
| Late void | 1.25–1.30 | Standard endgame steepen |

**Finding F2 — Parallel 4-element ladders (MODERATE)**  
Four element tracks × tiers create combinatorial craft recipes. Strength: multi-resource puzzle. Risk: optimal path is “always balance 4 tracks” which can feel like busywork.

**Mitigation already present:** Affinity strategies post-prestige (Ember = capture lean, Depth = store lean, etc.) break symmetric optimal after first rebirth.

**Recommendation (next, not this PR):** One mid-run “sector contract” that *pays* for temporary element mono-focus so balance-all is not the only skill.

### AB unlock ladder

| Unlock zone | Modules / producers | Curve health |
|-------------|---------------------|--------------|
| 0–50 | T0 capture, buffer, binder, sector compiler | Excellent tutorial density |
| 50–200 | Bit reactor, shield coil, deep cache, T1 starts | Good |
| 200–5k | T1.5 bridge (fusion / resonance / harmonic) | **Was a hole; bridge exists** |
| 5k–130k | T2–T3 reactors | Standard idle acceleration |
| 400k–9M | Void tier + infinity reactor | Prestige should fire earlier for many players |

**Finding F3 — Prestige timing vs infinity grind (MODERATE)**  
`projectKeys = floor(sqrt(lifetimeAb / 50))` → first key at 50 lifetime AB, recommend band around keys≥1 and ab≥150 or chapter flag.  
Infinity reactor at 9M AB unlock is **prestige theatre** for many; healthy if keys recommend long before that.

**Playtest check:** After harmonic stabilizer (1k AB out), does prestigeRecommend flip to `recommend` before T3? If players routinely buy quantum-tier before first prestige, soft-nudge UI copy (already present) may need a one-time storylet interrupt.

---

## 4. Difficulty & fairness

| System | Softness | Adversarial note |
|--------|----------|------------------|
| Early fade | `soft` ×0.25 + taps&lt;40 ×0.2 | Correct — teach before punish |
| Offline | 8h cap + soft fade | Fair; anti double-fade is a hard engineering claim (see GOAL.md) |
| Fade floor | `computeFadeMult` min 0.5 | Prevents shield stack trivialization |
| Prestige fail | insufficient_lifetime | Honest gate |
| Cast RNG | 5% crit / 10% overclock band | Low variance; not gambling economy |

**Finding F4 — Equal cast of all four essences (LOW)**  
Every EXEC grants all four raw essences equally (before specialization). Reduces “wrong click” punishment; also flattens affinity until specialization. Acceptable for idle; foreshadow UI must stay visible so prestige choice is earned, not random.

**Finding F5 — Dual production graphs (ACCEPTED debt)**  
Kernel tick produces from `PIPELINE_MODULES`; live craft still uses `PRODUCERS` ladder. Roles + `mapsFrom` + HUD counts are the player-facing unification. Do **not** merge graphs in this PR (scope bomb). Keep Q8 green.

---

## 5. Difficulty best practices checklist

| Practice | Status |
|----------|--------|
| Fail forward (soft early) | Pass |
| Visible pressure (fade when overcap) | Pass if UI shows storage/fade (playtest protocol) |
| Multiple viable strategies post-meta | Pass (4 affinities) |
| No dead verb midgame | Pass after F1 fix |
| Prestige is opt-in with preview | Pass |
| Scarcity on defensive tools | Pass (shield growth) |
| Avoid immortal banked goods | Pass after FADE_WEIGHT |
| Avoid copy-paste generator names | Partial — still “X Forge / Well / Generator / Chamber” ladder pattern (see anti-cliché) |

---

## 6. Anti-cliché pass (content)

### Systems (shipped)

1. **Weighted intermediate fade** — compiled stock bleeds slower, not never.  
2. **Pipeline roles as language** — not “buy generator tier N”.  
3. **Affinity strategies** — rebirth changes *how* you play, not only % more.  
4. **Mute-first heal / SYSTEM_RESTORE** — ceremony without spam toasts.

### Copy (shipped this PR)

Purged “digital preservation chamber / resists entropy / perfect harmony / transcendence through code” patterns from:

- T0 Crystal Chamber, Aether Synthesizer (and fire/water/air already rewritten)
- T1.5 fusion / resonance / harmonic
- Arcane Bit Reactor + Infinity Energy Reactor
- All Kernel `PIPELINE_MODULES` descriptions

Voice rules going forward (also in STORY_BIBLE):

- Prefer: sector, packet, void weight, overcap, compile, address, latch  
- Avoid: entropy (overused), preservation chamber, perfect harmony, transcendence, quantum buzzword without mechanical meaning

**Residual name cliché (LOW, park):** Display names still follow element×tier templates (Quantum X, Void Y). Renaming is a localization + achievement surface risk — park to LEGACY_PARK / future content pass.

---

## 7. Visual aesthetic (100% surface pass)

**Direction:** Hex Lattice Terminal — instrument deck for a dying sector OS.

| Surface | Change |
|---------|--------|
| Board | 28px lattice + cold void depth (suppressed on tier-0) |
| HUD | Address bar gradient; no glass blur |
| Cards | Asymmetric radius (2/10/2/10); owned = amber ridge |
| EXEC | Hex clip-path core; tier-0 stays circle mono |
| Roles | Capture coral / Store amber / Bind violet / Compile green / Shield steel |
| Toasts | Plaque corners; pairs with maxVisible=2 |
| Type | Mono labels, tabular nums on meters |
| a11y | focus-visible amber; reduced-motion kills hex spin |

**Not in this PR:** new raster art, particle redesign, font file swaps (token system already owns `--ky-*`).

---

## 8. Open findings (not blocking this PR)

| ID | Severity | Finding | Next action |
|----|----------|---------|-------------|
| F3 | M | Prestige may fire late vs void unlocks | Playtest + optional storylet interrupt |
| F5 | M | Dual graph debt | Strangler remaining production tick only |
| F6 | L | Generator name template | Future content rename pass |
| F7 | L | Equal four-essence cast | Optional pre-prestige lean dial |
| F8 | L | Shield floor 0.5 may still feel weak if capture outpaces store | Balance pass with playtest-kernel-sim extended |

---

## 9. Evidence commands

```bash
npm run typecheck:kernel
npm run validate:kernel-content
npm run playtest:kernel
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel.test.js
```

Fade weight contract: intermediates in `FADE_WEIGHT`; overcap reduces intermediate stacks; raw bleeds faster than resonant_crystal at equal counts.

---

## 10. Decision record

| Decision | Rationale |
|----------|-----------|
| Ship intermediate fade weights | Restores Store verb; anti-cliché vs immortal craft banks |
| Do not merge dual graph now | High risk, orthogonal to aesthetic + GD review |
| Diegetic copy rewrite without renames | Safer ship; names are achievement-coupled |
| Aesthetic via override CSS file | Reversible; tier-0 mono preserved |

**Author stance:** This is not “everything is perfect.” It is “hostile review with the worst critical hole (immortal intermediates) closed, copy desloped, and surface identity made non-generic.”
