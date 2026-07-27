# GLM code review — PR #17

**Model:** zai/glm-5.2 via `gjc`  
**Status after fixes:** APPROVE_WITH_NITS  
**Follow-ups applied on stack:** No blockers. Landing/prestige/growth/claim-audit sound.

---

## Verdict: APPROVE_WITH_NITS

The one correctness-bearing change — mult-cache invalidation on ascend — is correctly placed and credits ticket 02. The rest (landing thesis, prestige preview copy, smoke script hardening) is low-risk and behaviorally sound. The blocker-shaped concern is test quality, not shipped behavior, so I'm not blocking — but several nits should be addressed before this is considered "done" against the claim-audit.

## Blocking issues

None. No silent failure, no save-secret leak in the shipped artifact path, no broken invalidation. I considered blocking on the grep-style tests but they're regression guards over W1–W2 strings for a W3–4 PR, which is defensible if the behavioral coverage actually lives in the earlier tickets' tests.

## Nits

**Mult-cache fix is good, but the test for it isn't visible in this diff.**
- `js/gameState.js:502` — `invalidateMultiplierCache()` now does `this.multiplierCache.clear()` *and* sets `multiplierCacheDirty = true`. Correct, and defensive against any read path that skips the dirty check. **Credit ticket 02.**
- `js/gameState.js:853` — calling `this.invalidateMultiplierCache()` inside the prestige/ascend path (right before `applyPrestigeStartBonuses()`) is the right call and prevents stale pre-reset upgrade mults surviving an in-session ascend. **Credit.**
- Verify `multiplierCache` is actually a `Map` (not a plain object). If it's an object, `.clear()` throws `TypeError`. CI would catch it on the ascend path, so presumably fine — but the declaration isn't in the diff.
- Gap: `loadGameState()` is not touched. If a different save is hot-loaded mid-session (mirror restore, IDB fallback), the cache is not invalidated in this PR. Ticket 02 is scoped to "buffs or meditation," so this is out of strict scope, but worth a residual line.

**`tests/unit/healCriticalPath.test.js` is almost entirely source-string grep assertions, not behavioral tests — and it contradicts SPEC §Testing Decisions ("Assert external behavior… Avoid coupling to private field names").**
- `test('06 …emits hex:tierAdvance')` reads `designTierSystem.js` and asserts the string exists. It does not dispatch or observe the event. Ticket 06 acceptance ("At least one subscriber proves the event") is not met by this test.
- `test('08 …reduced-motion path present')` only checks `src` contains `'prefers-reduced-motion'` and `css/components.css` contains `'tier-advance-heal'`. No `@media (prefers-reduced-motion)` rule is shown added in this diff, and nothing proves the heal is actually gated. This is the weakest assertion in the file and directly relevant to the a11y focus area.
- `test('10 meditation mult delta')` checks for the literals `MEDITATION_Δ` and `__lastMeditationMultDelta` — pure private-symbol coupling. A rename passes/fails spuriously.
- `test('11 save outcome SYSTEM_LOG lines')` — grep for `SAVE_OUTCOME parse_error` etc. Doesn't verify the messages reach the player (ticket 11 acceptance: "player-visible messaging").
- Recommend converting at least 06, 08, 10, 11 to behavioral assertions (dispatch + listener, body-class toggle under reduced-motion, real `endSession` delta, toast/log spy).

**Share sanitization test is a denylist with unrealistic input.**
- `test('12 share artifact is sanitized')` calls `buildHealShareArtifact({ fromTier, toTier, at })` — no `gameState`, no secrets in → trivially "no secrets out." It does not prove the function strips secrets under realistic input. Feed it a gameState-shaped object containing `ab`, `inventory`, `prestigePoints`, a `localStorage`-style save blob, and assert the payload key set is exactly `{ kind, fromTier, toTier, at }` (allowlist), not a `not.toMatch(/cyberWitchesSave|prestigePoints|eldritch/i)` denylist. A renamed key (e.g. `ekTotal`) sails past the current regex.
- The shipped `buildHealShareArtifact` itself isn't shown, so I'm reviewing the contract the test asserts, not the implementation. Confirm the function only ever reads tier-scoped fields and never spreads a gameState.

**`js/modules/ui/modalManager.js:404` — prestige post-goals copy points at systems that may be locked.**
- `nextCount === 1` branch tells the player to open `/PROC/MEDITATION` and spend Keys in `/OPT/BOONS`. If meditation/boons tabs aren't actually unlocked at first prestige (or those diegetic paths don't exist as real routes), this is misleading flavor. Confirm the tab-unlock conditions match the copy, or gate the text on actual unlock state.
- Minor: `this.gameState.prestigeCount || 0` is fine, but if `showPrestigeModal` can run before `gameState` is wired the access throws. Likely guarded upstream; flagging only.

**`scripts/smoke-dist.sh` — good hardening, two small notes.**
- Readiness poll replacing the fixed `sleep 1` and the `mktemp` + `trap` cleanup are both real improvements (no more `/tmp/cw-smoke-play.html` collision, no leaked `http-server`). Keep.
- `mktemp -t cw-smoke-play.XXXXXX.html` on macOS (BSD `mktemp`) treats the whole token as a *prefix* and ignores the `XXXXXX`/`.html` — the file is still created uniquely, but the `.html` extension is silently dropped. Harmless here (you only write + grep), but if you ever want the extension, use `mktemp cw-smoke-play.XXXXXX.html` (no `-t`) in `$TMPDIR` or explicit template form.
- In `url` mode `PID` is never set; the trap's `kill "${PID:-}"` expands to `kill ""` → suppressed by `|| true`. Correct, just noting it's load-bearing on the `|| true`.

**Landing (`index.html` + `styles/landing.css`).**
- `hero-thesis` paragraph and the `heal-thesis` before/after section are clean, accessible (`aria-labelledby`, real `<figcaption>`), and the Play CTA stays primary. Good.
- `.heal-panel--after` glow is a static `box-shadow`, not animated → no reduced-motion concern on the landing itself. The reduced-motion risk is entirely in the in-game heal moment (ticket 08), not here.
- Nit: the inline `style="text-align:center;margin-top:1.5rem;"` on the Play wrapper should move into `.heal-thesis` CSS for consistency with the rest of the file.

**Scratch docs (`.scratch/ideal-critical-path/*`).**
- CLAIM_AUDIT residuals are honest (no live GIF, localStorage-only funnel, no prestige-ceremony e2e, no GLM review artifact yet). Good discipline. The `npm run ci` gate block marks e2e as optional — ticket 01 requires smoke+progression as a *hard* gate; make sure CI config actually enforces that rather than the audit doc's "optional" comment.

## Residual risk

- **No dedicated e2e for the full prestige ceremony.** CLAIM_AUDIT acknowledges this. The `ascend()` cache fix and the modal preview copy are only covered by unit/grep, not an end-to-end reload-after-prestige assertion. This is the highest-value missing test.
- **Mult-cache invalidation not proven for meditation/load paths in this diff.** Ticket 02 claims a unit test exists (`healW0Foundation.test.js` gains the `GameState` import but the test body is truncated in the diff) — I can't confirm from the provided diff that it asserts a stale-mult failure mode after a buff/meditation change. Confirm that test actually fails when `.clear()`/invalidation is removed (mutation-tested), otherwise ticket 02's "CLAIMED" is soft.
- **Telemetry is localStorage-only with no server sink** (acknowledged) — the 30-day share pivot gate in `GROWTH_OPS.md` (N=50) depends on `cw.funnel.shareAttempt` counts that currently have no export path. The pivot rule is un-falsifiable until a maintainer can actually read those counters; flag the readout mechanism before W4 spend.
- **Denylist sanitization** (above) is the main share-privacy residual — it passes today but is fragile against key renames.
- Reduced-motion compliance for the in-game heal is asserted only by string presence; treat ticket 08's a11y acceptance as not yet falsified.

Net: ship it, but treat the grep tests and the share-allowlist as follow-ups before closing tickets 02/06/08/11/12 in the claim-audit.
