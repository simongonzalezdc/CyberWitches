# Hex Compiler (CyberWitches) — Master Adversarial Audit

**Date:** 2026-07-26  
**Scope:** Entire repo — code, design system, aesthetics, copy, game design, security, docs, assets  
**Posture:** Ruthless / fail-closed / evidence-first  
**Orchestrator:** Grok Build (inline + multi-agent consults)

---

## BLUF

This is a **strong technical shell around an incomplete product identity**.

Gates look healthy:

| Gate | Result | Evidence |
|---|---|---|
| ESLint | **PASS** (0 errors) | `npm run lint` |
| Typecheck | **PASS** | `npm run typecheck` |
| Color-debt | **PASS within baseline** (246 residual violations) | `npm run lint:color-debt` |
| Unit tests | **PASS 882/882** (34 suites) | `npm test -- --runInBand` |
| Prod critical bundle | **112.8 KB** (budget 200 KB) | `npm run build:prod` |
| npm audit | **6 vulns (4 high)** — mostly tooling | `npm audit` |

**Ship posture: HOLD for public pride.** Not because CI is red — because player-facing truth is broken, identity is split, and one credential is currently burned into a git remote.

If you fix only five things this week, fix these:

1. **Rotate the GitHub token embedded in `upstream-github` remote** (P0 security).
2. **Restore the full resource sidebar** (only FIRE exists in `play.html`).
3. **Kill SE/AB/Aether Bits naming chaos** to one canon.
4. **Honor `data-design-system-version="kyanite-1"`** on both entrypoints.
5. **Rewrite `GAME_MANUAL.md`** — it documents a different game.

---

## Multi-agent board (Soul Medium)

| Agent | Executor | Status | Contribution |
|---|---|---|---|
| **AGY Pro 3.1** | `agy-gemini-pro` | **DONE** | Identity crisis, diegesis vs dopamine, design contract, architecture bloat, float precision |
| **AGY Flash 3.6** | `agy-gemini-flash` | **DONE** | Mobile input lockout, meditation save/load hole, stuck-wave logic, boot fadeIn missing, Spellwright leftovers |
| **MiniMax M3** | `minimax-m3` | **FAILED** (empty worker log) | No usable output — re-dispatch needed |
| **Codex Terra** | `codex-terra` | **DONE** | First-10-minutes design, Tier 0 promise not delivered, economy readability, docs/product-claim honesty |
| **Grok (this session)** | inline | **DONE** | Runtime gates, pattern scans, visual evidence, asset generation, claim verification |

Consults on disk:
- `consults/agy-gemini-pro.md`
- `consults/agy-gemini-flash.md`
- `consults/codex-terra.md`

### Consensus across agents
1. Design-system contract / Kyanite purity is incomplete.  
2. First session is a spreadsheet, not a story.  
3. God modules (`audioSystem`, `gameState`) are regression factories.  
4. Landing proof (screenshots) is empty.  
5. Currency / brand drift (SE, Spellwright, Orbitron).  
6. Meditation is either broken, late, or a second game.

### AGY Flash P0s (independently verified by Grok)
| Claim | Verdict | Evidence |
|---|---|---|
| Mobile `touchstart` + `preventDefault` kills clicks | **CONFIRMED P0** | `customTooltips.js:137-141` |
| Meditation stats saved but never loaded | **CONFIRMED P0** | `saveState` writes `totalWavesCompleted` etc.; `loadState` never restores them |
| Stuck detection uses distance-to-waypoint as “hasMoved” | **CONFIRMED P1/P0** | `meditationState.js:880` — far-from-target always looks “moving” |
| Boot uses `fadeIn` animation without keyframes | **LIKELY P1** | `tutorialSystem.js:131`; no `@keyframes fadeIn` found in CSS grep |
| Spellwright leftover branding | **CONFIRMED P2** | `start-server.sh`, `LICENSE` |
| `font-orbitron` without Orbitron font | **PARTIAL** | class aliases to mono in utilities; `main.css` still references Orbitron family |
| Meditation tab never instantiates manager | **NEEDS RUNTIME PROOF** | Lazy path exists; Flash claims registry miss — treat as suspected P0 |

### Codex Terra design P0s (product judgment, high confidence)
1. First 10 minutes teach a spreadsheet, not a story.  
2. Tier 0–4 USP not dramatized — early UI is already cyan-pretty.  
3. Manual-click grind before meaningful automation is hostile.  
4. Too many currencies/systems before any is legible.

---

## Severity legend

- **P0** — Ship-blocker / security / progress loss / player cannot see core state  
- **P1** — High damage to trust, retention, or correctness  
- **P2** — Meaningful debt that will become P1  
- **P3** — Polish / leverage / hygiene

---

## P0 — Must fix before you call this product

### SEC-01 — GitHub PAT embedded in git remote
- **Evidence:** `git remote get-url upstream-github` resolves with embedded credentials (`HAS_EMBEDDED_CREDENTIALS`).
- **Impact:** Token can be exfiltrated from shell history, agent logs, backups, or anyone with local clone access.
- **Fix:**  
  1. Rotate/revoke that PAT on GitHub **immediately**.  
  2. Set remote to SSH or credential-helper HTTPS without embedded secret.  
  3. Audit other remotes/configs for the same pattern.  
- **Do not** commit the token into any report.

### UI-01 — Resource monitor only shows FIRE
- **Evidence:** `play.html` lines 101–108 hardcode a single `#element-counter-fire` and a comment `<!-- ... other elements ... -->`.  
  `HUDUI.updateElementCounters()` looks up `fire|water|air|crystal|aether|focus` by ID and **silently continues** if missing.
- **Player impact:** Mid-game screenshot (`verify-game-v4.png`) shows only FIRE at 22.2K while the rest of the economy is invisible. Crafting costs for other elements become opaque.
- **Fix:** Mount full counters in HTML **or** create them in JS on init. Add a regression test that all five element nodes exist after boot.

### COPY-01 — Currency canon is shattered (SE vs AB vs Aether Bits vs Arcane Bytes)
- **Evidence:**
  - `CHANGELOG.md`: renamed to **Arcane Bits (AB)** (replacing Spell Energy SE)
  - `CONTEXT.md`: **Arcane Bytes**
  - `GAME_MANUAL.md`: **Aether Bits**
  - `index.html` JSON-LD: **Arcane Bits**
  - `play.html` help: Arcane Bits
  - `modalManager.js` welcome-back: **SE**
  - `prestige.js` / `upgrades.js` / `tasks.js` / boons/dailies/hud comments: **SE**
- **Impact:** Player trust death. Prestige tooltips still say “+1000 SE” while HUD says AB.
- **Fix:** One glossary term everywhere: recommend **Arcane Bits (AB)** + prestige **Eldritch Keys (EK)**. Scripted ripgrep gate in CI that fails on `\bSE\b` outside comments about migration.

### DS-01 — Design-system QA contract not on live entrypoints
- **Evidence:** `docs/design-system.md` requires `<html data-design-system-version="kyanite-1">` on `/` and `/play.html`. Neither file has the attribute (only `lang="en"`).
- **Impact:** Returning-player version reapply / token scoping / future CSS gating has no root hook.
- **Fix:** Add attribute to both HTML roots; assert in `designSystemVersion` e2e/unit already present for storage, extend for DOM contract.

### XSS-01 — Notifications render raw HTML
- **Evidence:** `js/modules/ui/notifications.js` → `notification.innerHTML = message`.
- Many call sites pass HTML intentionally (`css-icon-*` spans). Some pass interpolated names (`Achievement: ${achievement.name}`).
- **Impact:** Any future untrusted string (imported save message, recipe name from save, analytics) becomes DOM XSS. Escape is inconsistently applied at call sites, not at the sink.
- **Fix:** Split API: `showText(message)` vs `showHtml(safeTrustedTemplate)`. Default to textContent. Ban raw `innerHTML = message`.

### MOB-01 — Touch tooltips call `preventDefault` and can kill Craft/Cast clicks
- **Evidence:** `js/customTooltips.js` mobile branch: `touchstart` → `e.preventDefault()` then delayed tooltip show. No compensating synthetic click on `touchend`.
- **Impact:** On phones, tooltip-enabled controls may never fire their action handlers. This is a full mobile soft-lock for primary verbs if tooltips are attached broadly.
- **Fix:** Never `preventDefault` on controls that need click; use long-press for tooltip only; or show tooltip without cancelling the click pipeline.

### MED-01 — Meditation progress/stats persist out but not in
- **Evidence:** `meditationState.saveState()` serializes `totalWavesCompleted`, `totalDistractionsKilled`, `totalSessionsCompleted`. `loadState()` restores inventory/towers/focus only — **stats omitted**.
- **Impact:** Production bonus derived from meditation history silently resets after reload. Player feels robbed.
- **Fix:** Restore all saved fields; add unit tests for save↔load roundtrip including stats.

### MED-02 — Stuck detection treats “distance remaining” as “is moving”
- **Evidence:** `hasMoved = distance > 0.01` where `distance` is distance to path waypoint, not position delta.
- **Impact:** A frozen distraction far from its waypoint forever looks “moving,” resetting `lastMoveTime`, blocking stuck recovery / potentially wave completion.
- **Fix:** Track previous `(x,y)` and compare position delta; or compare `distance` decrease over time.

### GD-TIER-01 — Tier 0 promise not delivered at first paint
- **Agents:** Codex Terra + AGY Pro + visual evidence.
- **Evidence:** Design system claims Tier 0 monochrome broken terminal; live early chrome is already cyan glass, Kyanite glow, orderly HUD.
- **Impact:** The USP (“UI heals as you play”) is invisible if start state is already polished.
- **Fix:** Force true Tier 0 skin until thresholds met: no cyan glows, mono type, broken labels, cast is the only bright control.

---

## P1 — High-impact correctness / retention / trust

### DOC-01 — GAME_MANUAL describes a deleted game
- Documents Wax Melter, Wick Spinner, Digital Candle Farm as first AB producer, old cast rates (0.1 AB), Aether Bits naming.
- Live data (`producers.js`) is Fire Forge / Aqua Well / Zephyr Generator / Crystal Chamber / Aether Synthesizer + modern progression.
- **Fix:** Regenerate manual from live data modules, or delete and point to auto-generated reference.

### UX-01 — Landing gallery is empty / placeholder
- Visual evidence: `verify-landing-art.png` screenshot section shows three empty black cards labeled Desktop/Mobile with no images.
- Feature icons are generic outline glyphs (SaaS template feel).
- **Fix:** Wire real screenshots (you already have `screenshots/`, `verify-game-*.png`). Use generated hero art (see Assets).

### ARCH-01 — Triple onboarding/tutorial stack
- `js/tutorial.js` (379) + `js/modules/game/tutorialSystem.js` (317) + `js/onboarding.js` (548) = **1244 lines** of overlapping first-run systems.
- Lazy-load path loads TutorialSystem; legacy `window.startTutorial` still exists.
- **Risk:** Conflicting first-run UX, double modals, wasted maintenance.
- **Fix:** One onboarding owner; delete or archive the other two behind a flag.

### ARCH-02 — God objects
| File | LOC | Problem |
|---|---:|---|
| `js/audioSystem.js` | 3904 | Entire audio domain |
| `js/gameState.js` | 1614 | Model + tick + save I/O + prestige + buffs |
| `js/meditationState.js` | 1577 | Mini-game state monolith |
| `js/meditationTowers.js` | 1301 | Rendering + logic mix |

CONTEXT.md already names the next untangle: UIManager as update bus.

### LEAK-01 — Intervals that never clear
Unowned `setInterval` in:
- `economyBalancing.js`
- `balanceAnalytics.js`
- `progressionAnalysis.js`
- `analytics.js` flush loop
- `memoryLeakFix.js` (ironically)

If any of these load in production sessions, they accumulate workers across soft navigations.

### PERF-01 — Tick skips while tab hidden, offline catch-up elsewhere
`gameState.startTickLoop` returns early when `document.hidden`. Offline progress is applied on load — good — but any mid-session background logic that expects continuous intervals can desync (buffs/audio monitors). UnifiedGameLoop path needs explicit ownership docs.

### A11Y-01 — Font Awesome classes without Font Awesome
`workstationUI.js` injects `<i class="fas fa-bolt"></i>`. No FA CSS found on play path. Players see empty bolt / missing icon, not a Kyanite CSS icon.

### SEC-02 — CSP still allows `'unsafe-inline'` and `'unsafe-eval'`
`play.html` / `index.html` CSP. Acceptable for Tone/dev bootstrap is not the same as production-hardened. Plan nonce-based CSP + drop eval.

### SEC-03 — npm high CVEs in toolchain
`esbuild` Windows dev-server advisory, `sharp` libvips CVEs, `js-yaml` / `linkify-it` / `markdown-it` DoS. Not runtime browser exploits for static host, but CI/build machine risk. `npm audit fix` where non-breaking.

### GD-01 — Meditation / boons locked until Prestige 1
Only EXEC + workstations for the entire first arc. AGY Pro correctly flags early churn. Need mid-first-run active goal (teaser, corrupted meditation, experiment discovery spike).

### GD-02 — Slot-machine cast bonuses vs diegetic compiler fantasy
`cast()` rolls 5% jackpot 2–5×, 10% 1.5×. Comments literally say “dopamine maximization.” Fights the “preserve fading magic through compilation” fantasy. Prefer compiler overclock / critical compile framed as system events.

### SAVE-01 — Dual store without clear primary
localStorage primary + IndexedDB mirror. Analytics also dump into localStorage. Mobile 5MB wall is real. AGY Pro: flip IndexedDB to primary.

---

## P2 — Structural debt that will bite

### NAMING / DATA
- Producer descriptions are often **the same paragraph with search-replace element names** (AI-slop texture).
- Tier 1+ producers frequently omit descriptions entirely → empty card body.
- `js/gameState.js.backup` committed-ish presence (file exists) — dead weight.
- Coven system comments still puncture core loops.

### SILENT FAILURES
- Lazy load failures: `console.warn('Lazy: … failed to load')` only — player gets missing audio/tutorial/particles with no UI recovery.
- `safeFunction` returns `null` after handleError — callers rarely check.
- AudioContext resume catch swallows all errors (`catch (_) { /* ignore */ }`).

### NUMERIC
- `formatShort(NaN)` → `"NaN"`; `formatShort(Infinity)` → `"NaN"`.
- Native floats for idle scale; fine early, broken late without decimal library. Not urgent until ~1e15, but plan it.

### SERVICE WORKER
- Cache version `vYYYYMM` auto-rotates monthly — surprising full recache; fine, but document.
- Optional asset miss is warn-only (good). Ensure CORE list stays truly atomic-safe.

### CI / HYGIENE
- `ci.yml` duplicates `permissions: contents: read` twice (noise, not fatal).
- Deploy workflow exists and builds Pages — good; confirm Pages environment is actually connected.
- Branch state: local `main` **ahead 1, behind 12** vs upstream-github — divergence risk.

### ANALYTICS THEATER
- Analytics “flush” writes to localStorage and pretends a pipeline. Either wire a real sink or kill the ceremony.

### COLOR DEBT
- 246 residual hard-coded colors baseline-locked. Not failing CI, but design system purity is fake until baseline goes to 0.

---

## Aesthetic audit

### What works
- Diegetic tier progression (glitch → restoration) is the **one great idea**. Guard it.
- Kyanite tokens (void / cyan / magenta / amber / green) are a coherent high-contrast brand.
- EXEC cast button centered, muscle-memory friendly.
- Workstation cards with cyan edge glow and background art (when present) feel intentional mid-game.

### What fails (visual evidence)
From `verify-game-v4.png`:
- Left rail is a **void with one FIRE chip** — looks unfinished, not sparse-by-design.
- SYSTEM_LOG empty dead zone.
- Tabs are Unix-path cosplay (`/MNT/WORKSTATIONS`) that never pays off as a real shell metaphor.
- Card hierarchy competes (multiple Tier labels floating in negative space).

From `verify-landing-art.png`:
- Landing is a competent dark SaaS marketing page, not a diegetic compiler world.
- Empty screenshot slots.
- Feature grid = icon + headline + paragraph × 6 (AI landing template).
- Headline is strong (“Preserve magic. Compile the fading.”) — keep and make the rest live up to it.

### Aesthetic direction (keep / kill / invent)

**Keep**
- Progressive sensory restoration as narrative.
- Kyanite palette + JetBrains Mono system labels + Space Grotesk display.
- EXEC as primary ritual.

**Kill**
- Generic glass SaaS cards on landing.
- Empty screenshot slots.
- Purple/AI-slop glow stacks that fight Kyanite cyan.
- Emoji / FA icons when CSS icon system already exists.
- Meta tags that announce “AI GEO” to humans.

**Invent**
1. **Boot terminal landing** — first paint is a broken monochrome TTY that “repairs” into the marketing page as scroll/progress. Landing becomes diegetic.
2. **Resource glyphs** — element icons that match the new asset set (see Assets).
3. **Card density system** — craft-critical info (cost, rate, owned) first; lore on expand.
4. **Glitch as resource** — UI degradation scales with “entropy debt,” not only design tier.
5. **Screenshot strip** that shows Tier 0 → Tier 4 as a single horizontal story.

---

## Copy audit

### Voice rules (proposed canon)
You are a Hex Compiler. Speak in diagnostics, not dopamine.

| Instead of | Say |
|---|---|
| Jackpot! | CRITICAL_COMPILE ×3.2 |
| Achievement unlocked | SECTOR_PRESERVED |
| Welcome back | SESSION_RESUME — offline cycles parsed |
| Daily complete | RITUAL_WINDOW closed |
| Level up | INSCRIPTION_COMMITTED |
| Spell Energy / SE | Arcane Bits / AB |
| Dopamine maximization | (delete from player-facing and comments) |

### Worst offenders
1. `GAME_MANUAL.md` entire early guide (wrong content + Aether Bits).
2. `prestige.js` “+1000 SE at start / level”.
3. Meta `ai-purpose` / `ai-keywords` on public pages.
4. Producer blurbs that are entropy-copy-paste.
5. Help text that calls experiment button RUN_PROTOCOL but also confuses cast vs experiment.
6. Comments and function names marketing “dopaminergic” / “SUPER CUTE”.

### Human-quality bar
- Prefer short system lines over essay cards.
- One metaphor per surface (compiler **or** witch cauldron — currently both).
- Em-dash spam in lore descriptions — tighten.

---

## Game design audit

### Core loop (actual)
1. EXEC → ingredients + 0.15 AB  
2. Craft workstations → passive ingredients  
3. Unlock AB reactors → idle AB  
4. Upgrades / experiments / dailies  
5. Prestige → EK + element specialization + meditation unlock  

### What’s good
- Element specialization (fire/water/air/crystal) creates post-prestige identity.
- Experiment discovery is a real secondary loop if players find it.
- Diegetic UI tiers are unique vs Cookie Clicker clones.

### What’s broken / weak
1. **First-hour agency is thin** — click EXEC until first craft; no intermediate goals.
2. **Information starvation** — invisible non-fire resources (bug) amplifies confusion.
3. **Meditation as late TD bolt-on** — genre switch after prestige; unprepared players bounce.
4. **Jackpot RNG** on cast undercuts skill/strategy fantasy.
5. **Too many parallel systems** (combo, events, quests, achievements, dailies, boons, inscriptions, experiments) without a clear “this week’s master system.”
6. **Manual is wrong** so self-directed players follow dead strategy.

### Design opportunities (leverage, not bugs)
1. **Entropy meter** as first-class resource: magic fades over time; EXEC / craft slows entropy; failure state is UI collapse.
2. **Compile goals** — short contracts (“stabilize 10 fire sectors”) instead of raw AB milestones.
3. **Early corrupted meditation** — 60s tutorial defense before prestige.
4. **One prestige fantasy per element** with unique UX chrome (not just multipliers).
5. **Diegetic offline** — “Daemon continued compilation for 3h12m.”
6. **Kill or hide** balanceAnalytics/economyBalancing/playerAnalytics in player builds.

---

## Technical findings map (selected)

| ID | Area | Finding | Severity |
|---|---|---|---|
| SEC-01 | Secrets | PAT in git remote | P0 |
| UI-01 | HUD | Only FIRE counter in DOM | P0 |
| COPY-01 | Domain language | SE/AB/Aether Bits chaos | P0 |
| DS-01 | Design system | Missing `data-design-system-version` | P0 |
| XSS-01 | Notifications | `innerHTML = message` sink | P0/P1 |
| DOC-01 | Docs | GAME_MANUAL wrong game | P1 |
| UX-01 | Landing | Empty screenshots | P1 |
| ARCH-01 | Onboarding | 3 overlapping systems | P1 |
| ARCH-02 | Architecture | 4k-line audio + 1.6k gameState | P1 |
| LEAK-01 | Runtime | Uncleared intervals | P1 |
| A11Y-01 | Icons | FA classes without FA | P1 |
| SEC-02 | CSP | unsafe-eval/inline | P1 |
| GD-01 | Retention | Meditation post-prestige only | P1 |
| GD-02 | Fantasy | Jackpot dopamine vs compiler | P1 |
| SAVE-01 | Persistence | localStorage primary | P2 |
| NUM-01 | Utils | formatShort NaN/Infinity | P2 |
| SW-01 | PWA | Monthly cache churn | P2 |
| DEBT-01 | CSS | 246 color-debt baseline | P2 |
| TOOL-01 | npm | 4 high toolchain CVEs | P2 |
| GIT-01 | Sync | main ahead 1 / behind 12 | P2 |

---

## Assets generated (Kyanite-aligned)

Landed under `artifacts/adversarial-audit-2026-07-26/assets/`:

| File | Purpose |
|---|---|
| `element-icons-kyanite.jpg` | Fire / Water / Air / Crystal / Aether glyph strip for resource monitor |
| `hero-atmosphere-kyanite.jpg` | Landing hero: chaos→compiled lattice |
| `og-card-atmosphere-kyanite.jpg` | OG/social atmosphere (text to be overlaid in code for legibility) |

**Integration notes**
- Prefer slicing the element strip into 5 PNGs / WebP via `sharp` and using as CSS masks or `<img>` with labels.
- Do **not** bake long marketing text into generated bitmaps; overlay HTML/CSS for exact typography.
- After accept, move winners into `images/ui/` and `images/generated/` and wire landing screenshot section.

---

## Automated evidence log

```text
npm run lint            → PASS
npm run typecheck       → PASS
npm run lint:color-debt → PASS (246 baseline)
npm test -- --runInBand → 882 passed
npm run build:prod      → critical 112.8 KB / total ~318 KB
npm audit               → 6 vulnerabilities (4 high)
```

Prior audits reviewed: TasteCheck 2026-06-05 (mobile/a11y blockers), UltraQA 2026-06-06, reskin WIP commit on main.

---

## 30-day remediation plan

### Week 1 — Trust & truth
1. Rotate remote token; scrub remotes.  
2. Fix resource counters + test.  
3. Currency rename sweep + CI ban on SE.  
4. `data-design-system-version` on both HTML.  
5. Notification sink hardened.  
6. Delete or rewrite GAME_MANUAL from live data.

### Week 2 — First-session retention
1. Unify onboarding to one system.  
2. Wire landing screenshots + hero art.  
3. Early compile goals / entropy tease.  
4. Replace jackpot copy with diegetic critical-compile.  
5. Fix FA icons → Kyanite CSS icons.

### Week 3 — Architecture cuts
1. Split audioSystem into synths / music / sfx modules.  
2. Kill dead analytics intervals in prod path.  
3. IndexedDB primary save spike.  
4. Color-debt baseline → 0 for new files; ratchet down old.

### Week 4 — Identity lock
1. Boot-terminal landing experiment.  
2. Element-specialization visual chrome.  
3. Meditation teaser pre-prestige.  
4. A11y + visual regression e2e on counters and cast button.

---

## Unknown unknowns / blind spots (explicit)

1. **Mobile real-device FPS** under glitch + particles + Tone — not re-measured this run.  
2. **Live production deploy** of current main vs behind-12 upstream — unknown if Pages serves this tip.  
3. **Save import from pre-rename SE eras** — migration may display wrong labels even if numbers load.  
4. **Whether Font metrics / Google Fonts blocked regions** break mono aesthetic.  
5. **Meditation balance** — towers files are huge; no combat sim re-run here.  
6. **Agent workers MiniMax/Flash** not harvested; Codex Terra mid-flight — re-run harvest before implementation sprint.

---

## What I am *not* claiming

- I did not re-run full Playwright e2e/visual in this session.  
- I did not rotate your GitHub token (requires your action).  
- I did not merge the generated assets into production paths (awaiting approval).  
- “Exhaustive” means systematic adversarial coverage of major surfaces with automated gates + multi-agent consult — not a formal proof of absence of bugs.

---

## Immediate ask for you

1. **Rotate the GitHub PAT now.**  
2. Tell me whether to start the **Week 1 fix PR** (counters + currency + design-system attr + notification sink + manual rewrite) as a single atomic branch.  
3. Approve integrating generated assets into `images/` and landing.

---

*Audit artifacts root:* `artifacts/adversarial-audit-2026-07-26/`
