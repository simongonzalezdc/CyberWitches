# Changelog - Hex Compiler

## [1.1.0] — 2026-07-27

**Play:** https://simongonzalezdc.github.io/CyberWitches/play.html  
**Tag:** `v1.1.0` · **Tip:** overall S+ O2 on `main` (PR #58)

### Highlights

- **Restoration Kernel** live — cast, weighted soft fade, prestige, affinity, chapters
- **Ownership coalesce** — no dual-count; kernel craft writes canonical live ids (PR #58)
- **Store / void-pressure HUD** — weighted STORAGE used/cap + ASCEND_BAND
- **Pipeline roles** — Capture → Store → Bind → Compile → Shield (28/28 mapped)
- **Aesthetic v2** — hex lattice instrument deck; tier-0 mono; story CTA AA
- **Anti-cliché copy** — sector-terminal voice on producers + pipeline modules
- **Overall S+ (O2)** — Eng ∩ Product ∩ Systems ∩ Identity stamped in QUALITY_REPORT
- **Capture the heal** — mute-first ceremony + SHARE_RESTORE + compile goal rail

### Selected PRs

#14–#20 heal · #26–#34 Kernel + quality · #36 fade/aesthetic · #37–#38 docs/a11y · #39 release cut · #58 overall S+ O2

### Save

- Kernel snapshot version 2; coalesce on load; no forced wipe

---


## Recent Changes

### Adversarial GD + intermediate fade + hex lattice aesthetic (2026-07-27) — PR #36

**Landed on `main` + GitHub Pages** (Deploy on merge). Later included in **v1.1.0** release cut.

- ✅ **Soft fade weights (`FADE_WEIGHT`)** — all non-AB producer outputs take void pressure (raw = 1.0 → void_crystal = 0.12). Store stays a mid/late-game verb; no immortal intermediate bank
- ✅ **Anti-cliché copy** — producer + Kernel pipeline descriptions in sector-terminal voice
- ✅ **Aesthetic v2** — `css/aesthetic-v2.css` hex lattice instrument deck (tier-0 mono preserved)
- ✅ Hostile design review: `guides/restoration-kernel/ADVERSARIAL_GD_REVIEW.md` (GLM BLOCK → full coverage fix → SHIP)
- ✅ Kernel unit contracts: late-tier fade, mixed-bag ratio, clamp (25 tests in `kernel.test.js`)

### Restoration Kernel + S+/A+ quality bar (2026-07-27) — PRs #26–#34

**Domain core:** pure Kernel under `js/kernel/` (cast, fade, pipeline content, chapters, prestige, affinity strategies, meditation mastery, projectors).

- ✅ Live **cast resources** + **soft fade** sole paths via Kernel adapter
- ✅ Pipeline HUD + workstation **role badges** (Capture→Store→Bind→Compile→Shield); 28/28 producers role-mapped
- ✅ Affinity foreshadow; Meditation mastery `productionMult` on cast **and** tick
- ✅ Offline fade; save `kernel` mirror; toast stack hard-cap **2** (board stays readable)
- ✅ CI: `typecheck:kernel`, `validate:kernel-content`, `playtest:kernel`; package-lock TS7 fix for Pages deploy
- ✅ Guides + claim-audit + quality bar: `guides/restoration-kernel/`
- ✅ Production canary HEALTHY with Kernel HUD live (GitHub Pages)
- ⏳ Optional growth: **human** mute-clip field pilot before paid UA (engineering stimulus already shipped under Capture the heal)

### Capture the heal (2026-07-27) — PR #20 + heal spine #14–#19

**Product thesis:** mute-readable UI restore is the shareable scoreboard.

- ✅ **Heal ceremony** on `hex:tierAdvance` (`healCeremony.js`) — dim → restore → chrome → toast → share; reduced-motion safe
- ✅ **SHARE_RESTORE** downloads sanitized split still + copies text (`healCapture.js`, `healShare.js`); no full save secrets
- ✅ **Local funnel** TTA / TTH / shareAttempt (`funnelMetrics.js`, `cw.funnel.*`)
- ✅ **Compile goal rail** — single primary post-tutorial objective
- ✅ **Landing / OG** heal still (`screenshots/heal-split-still.png`)
- ✅ Operator e2e + unit coverage (`captureTheHeal.test.js`, `heal-operator-journeys.spec.js`)
- ✅ Campaign map / claim-audit / mute-clip runbook under `.scratch/capture-the-heal/`
- ⏳ **Human** mute-clip n=5 pilot remains a **growth ops** gate for paid UA (not a Kernel engineering residual)

Prior heal foundation: mult-cache + ascend invalidate, SYSTEM_LOG save outcomes, meditation Δ feedback, prestige ceremony preview (PRs #14–#19).

### Game Title & Story Integration (Phase 1-3)
- ✅ Game title changed to **"Hex Compiler"**
- ✅ Currency renamed to **"Arcane Bits (AB)"** (replacing "Spell Energy (SE)")
- ✅ Complete story integration: "The Fading" narrative framework
- ✅ Story introduction modal on first launch
- ✅ Meditation story introduction when meditation unlocks
- ✅ Ascension story integration with elemental choice context
- ✅ Daily rituals updated with story context
- ✅ Experimentation updated with story context
- ✅ Settings/About tab with story section and "Read Full Story" button
- ✅ Tutorial updated with story elements
- ✅ Workstation descriptions updated with lore (preservation chambers)
- ✅ Achievement descriptions updated with story context

### Visual Fading Theme Effects (Phase 3)
- ✅ Background fade gradient overlay (Tier 2+)
- ✅ Particle fade effect (Tier 3+)
- ✅ Element fade indicators (Tier 1+)
- ✅ All effects toggleable in Settings
- ✅ Effects respect design tier rules
- ✅ Preserve effect triggers when casting or building

### Glitch Effects System - Progressive UI Stabilization
- ✅ **8 glitch effects implemented** (all CSS-only for performance):
  1. Screen tearing / horizontal glitch lines (Tier 0-3, progressive reduction)
  2. Chromatic aberration / RGB channel separation (Tier 1-3, progressive reduction)
  3. Scanlines / CRT monitor effect (Tier 0-3, progressive reduction)
  4. Text corruption / character flicker (Tier 0-1 only)
  5. Position jitter / micro-shifts (Tier 0-2, progressive reduction)
  6. Opacity flicker (Tier 0-1 only)
  7. Distortion waves (Tier 0-2, progressive reduction)
  8. Glitchy gradient / fading theme overlay (Tier 2-3, smooth at Tier 4)
- ✅ UI starts heavily glitched at Tier 0 and progressively stabilizes to perfect at Tier 4
- ✅ All effects are GPU-accelerated and performance-optimized
- ✅ Glitch effects override night sky background in Tier 0-3
- ✅ Night sky background restored in Tier 4 (perfect state)

### Design Tier System - Complete Implementation
- ✅ All tiers (0-4) now properly enforce their restrictions
- ✅ Tier 0: Strictly monochrome, no animations, no sound, no color
- ✅ Tier 1: Basic colors only, no animations, no sound
- ✅ Tier 2: Colors + sound effects, no animations
- ✅ Tier 3: Full graphics, animations, sound effects, no music
- ✅ Tier 4: Everything + background music
- ✅ Inventory, workstations, and inscriptions tabs respect tier restrictions

### UI/UX Improvements
- ✅ Settings button moved to sidebar (removed from HUD and main tabs)
- ✅ Settings tab removed from main navigation
- ✅ Tutorial system with Start Tutorial and Reset Tutorial buttons
- ✅ Custom tooltips system implemented
- ✅ Inventory layout made more compact (grid-based, less scrolling)
- ✅ Feature indicators for locked tabs (Meditation, Boons)

### Code Cleanup
- ✅ Removed search and filter functionality (as requested)
- ✅ Coven system archived (removed from active codebase)
- ✅ Fixed syntax errors
- ✅ Fixed button event listener issues
- ✅ Improved error handling
- ✅ Created `FadingThemeSystem` class for visual fading theme effects
- ✅ Integrated glitch effects system with design tier system

### Bug Fixes
- ✅ Fixed missing closing brace in game.js (line 2057)
- ✅ Fixed button listeners being removed on DOM updates
- ✅ Fixed tier styling consistency across all tabs
- ✅ Fixed inventory rendering with proper tier restrictions

---

## Files Modified

### Core Files
- `js/game.js` - Main game logic, story integration, meditation story modal, full story modal, preserve effect triggers
- `js/designTierSystem.js` - Design tier system implementation
- `js/fadingThemeSystem.js` - **NEW** Visual fading theme effects system
- `js/tutorial.js` - Updated with story elements
- `js/data.js` - Updated workstation descriptions, daily task descriptions with story context
- `js/elementSpecialization.js` - Updated elemental path descriptions with story context
- `js/achievements.js` - Updated achievement descriptions with story context
- `js/searchFilter.js` - Archived (moved to `archive/code/searchFilter.js`)
- `index.html` - Updated title, meta descriptions, tooltips, story section in Settings, fading theme toggles
- `manifest.json` - Updated PWA manifest with new title and description
- `package.json` - Updated project name and description

### Styling
- `styles.css` - Design tier CSS rules, sidebar settings button styles, **glitch effects system (8 effects)**, fading theme visual effects

---

## Testing Status

### ✅ Tested Features
- Design tier system (all tiers)
- UI navigation and tabs
- Inventory display
- Workstations display
- Settings panel
- Tutorial system
- Save/load functionality
- Story introduction modals
- Meditation story introduction
- Full story modal
- Visual fading theme effects (all 3 options)
- Glitch effects system (all 8 effects, progressive tier reduction)

### ⚠️ Known Issues (Non-Critical)
- ScriptProcessorNode deprecation warning (Tone.js library)
- Font loading warning (Google Fonts CDN)
- LCP performance metric (not affecting gameplay)

---

## Next Steps (Future)

- Consider re-implementing search/filter if needed
- Coven system expansion (currently archived)
- Performance optimizations
- Additional tutorial improvements
- Fine-tune glitch effect intensities based on player feedback
- Add more story elements as game expands

---

## Version History

### v1.0.0 (historical)
- Complete story integration ("The Fading")
- Visual fading theme effects
- Glitch effects system (progressive UI stabilization)
- Design tier system (all tiers implemented)
- PWA support
- Full accessibility features

