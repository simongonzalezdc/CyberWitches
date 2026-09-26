# SPEC — Hex Compiler single-session identity + polish ship

Date: 2026-07-27
Mode: single session (operator rejected multi-session queue)
Source: adversarial audit 2026-07-26 + wayfinder locks

## §1 What it is

Make Hex Compiler player-truthful, identity-locked, and polished enough that public pride is no longer HOLD for the surfaces players hit in the first session and post-prestige meditation.

## §2 Goals

1. One product language: hybrid hierarchy (system chrome = compiler; content = occult).
2. One currency canon: Arcane Bits (AB), Eldritch Keys (EK).
3. Tier 0 progressive restoration is real at first paint (hard contract).
4. Resource economy is fully visible (not FIRE-only).
5. Mobile primary actions work (tooltips must not kill clicks).
6. Notifications do not XSS by default.
7. Meditation stats survive save/load; stuck detection uses position delta.
8. Design-system root contract present on `/` and `/play.html`.
9. GAME_MANUAL describes the live game.
10. One short first-session compile goal so early play is not only raw grind.
11. Cast jackpot copy reframed as diegetic critical-compile (not dopamine casino).
12. Landing screenshots/hero not empty placeholders where assets exist.
13. CI gates still green after changes.

## §3 Non-goals (this session unless leftover time)

- Full split of `audioSystem.js` / complete architecture untangle.
- Multi-session wayfinder ticket board.
- Early pre-prestige meditation teaser redesign.
- Token rotation on GitHub (human must do).
- Perfect zero color-debt baseline.
- CSP nonce migration (document only if time short).

## §4 Locked decisions

| ID | Decision |
|----|----------|
| D1 | Fantasy: hybrid with hierarchy |
| D2 | Currency: Arcane Bits (AB) + Eldritch Keys (EK) |
| D3 | Tier 0: hard product contract |
| D4 | First session: repair-first + one short compile goal |
| D5 | Meditation: post-prestige only; fix integrity |
| D6 | Cadence: finish in this session; no multi-session defer by design |
| D7 | Jackpot language → critical compile / system events |

## §5 Components / touch surfaces

- `play.html`, `index.html` — counters, design-system attr, landing media, CSP if needed
- `js/modules/ui/*` — HUD counters, notifications
- `js/customTooltips.js` — mobile touch
- `js/meditationState.js` — save/load stats, stuck detection
- Currency/copy: prestige, upgrades, tasks, modals, CONTEXT, GAME_MANUAL, CHANGELOG consistency
- Design tier / first paint: design tier system CSS/JS
- Onboarding: TutorialSystem only for compile goal; do not wire onboarding.js/tutorial.js
- Tests: unit for counters mount, save roundtrip, currency ban; e2e if present

## §6 State / filesystem

- Planning: `.scratch/identity-ship-session/map.md`, this SPEC, `.omx/plans/*`
- Audit evidence: `artifacts/adversarial-audit-2026-07-26/`
- Assets: integrate from `artifacts/adversarial-audit-2026-07-26/assets/` into `images/` when wiring landing
- No secrets in commits or reports

## §7 Acceptance criteria (falsifiable)

### Must
1. After boot, `play.html` has element counters for fire, water, air, crystal, aether (and focus if live).
2. `document.documentElement.dataset.designSystemVersion === 'kyanite-1'` on index and play (static HTML + runtime).
3. Ripgrep player-facing paths: no live `\bSE\b` currency, no "Aether Bits", no "Arcane Bytes", no "Spell Energy" as living currency name (CONTEXT = Arcane Bits).
4. Notification default path uses textContent / `showText`; trusted HTML only via explicit API.
5. Mobile tooltip path does not `preventDefault` on actionable controls without compensating click.
6. Meditation `loadState` restores `totalWavesCompleted`, `totalDistractionsKilled`, `totalSessionsCompleted`.
7. Stuck detection uses position delta (or decreasing distance), not mere distance-to-waypoint > epsilon.
8. First paint / Tier 0: fresh save lacks full cyan Kyanite chrome until unlock thresholds (body tier class / applyTier on boot).
9. One short compile goal visible in first session via **`TutorialSystem` only** (`js/modules/game/tutorialSystem.js`). Exact copy: `COMPILE_GOAL: Stabilize Fire sector — craft 1 Fire Forge.` Forbid new module, dailies-as-primary, and wiring orphan `onboarding.js`/`tutorial.js`.
10. Cast bonus path: `bonusType` uses diegetic id (e.g. `critical_compile`); player-visible feedback implemented (wire `triggerBonusFeedback` or replace call via FloatingTextUI/notify); no player-facing "jackpot" on that path; unit/integration asserts feedback copy.
11. GAME_MANUAL producer names match `producers.js`; AB = Arcane Bits.
12. CI: `npm run lint`, `typecheck`, `test --runInBand`, `build:prod` pass.

### Should
13. Landing media not empty placeholders where assets exist.

### Niceto
14. FA→CSS icons; prod-path interval leak gate; formatShort NaN/Infinity.


## §8 Implementation order (single session) — O1-synthesis

1. Security note to operator (PAT) — parallel, non-blocking.
2. **Batch 1 coupled:** full resource counters with **tier-safe** markup + minimal Tier 0 first-paint shell + DS attr both roots + regression test.
3. COPY-01 currency sweep + CONTEXT glossary (include Spell Energy ban).
4. XSS-01 notification sink harden (`showText` default / trusted HTML path).
5. MOB-01 tooltip touch fix. (parallelizable with 4)
6. MED-01/02 meditation save + stuck. (parallelizable with 4–5)
7. **Identity close:** complete Tier 0 severity + one compile goal **only in `TutorialSystem`** (copy: `COMPILE_GOAL: Stabilize Fire sector — craft 1 Fire Forge.`; forbid dailies-as-primary / orphans / new module) + jackpot→critical_compile: rename bonusType, **implement** player-visible feedback (wire/replace dead `window.triggerBonusFeedback`), ban player-facing jackpot, test feedback copy.
8. DOC-01 GAME_MANUAL rewrite from live data.
9. UX-01 landing screenshots/hero (**should**).
10. Niceto P1s if time.
11. Full gate run; fix regressions.

## §9 Risks

- Branch behind upstream by 12: avoid force-sync without approval; work on local main tip.
- Scope explosion: if time collapses, freeze at §7 Must items 1–12 green over architecture vanity.
- Tier 0 hard contract may fight existing mid-session CSS; prefer additive tier classes over rewrite.

## §9b Freeze hierarchy (must / should / niceto)

| Tier | Items | Rule |
|------|-------|------|
| **Must** | §7 Must items 1–12 | Session fails if any red |
| **Should** | §7.13 landing media | Ship if time after must |
| **Niceto** | §7.14 | Only after must+should |

## §10 Stop rule

Session success = **Must** freeze green, or operator stop. Do not invent multi-day backlog mid-flight. Should/niceto may remain incomplete with honest report.
