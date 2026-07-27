# GLM code review — PR #16

**Model:** zai/glm-5.2 via `gjc`  
**Status after fixes:** APPROVE_WITH_NITS  
**Follow-ups applied on stack:** No blockers. Share sanitized; mult-cache on ascend credited.

---

## Verdict: APPROVE_WITH_NITS

The headline correctness fix is real and lands correctly. The share artifact is genuinely sanitized. The gaps are in verification depth, not in shipped behavior.

## Blocking issues

None. The core claims hold up:

- **`ascend()` invalidates the mult-cache — credit the fix.** `js/gameState.js:850` adds `this.invalidateMultiplierCache()` inside `ascend()` (after the recipe/storyFlag preservation comment, before `applyPrestigeStartBonuses()`). Combined with the strengthened `invalidateMultiplierCache()` at `js/gameState.js:502` which now also calls `this.multiplierCache.clear()`, pre-reset upgrade mults cannot leak past an in-session prestige. The clear is defensive (the `dirty` flag alone would suffice if every read checks it), but it closes the window where a future reader bypasses the dirty check. Good.
- **Share privacy holds.** `js/modules/game/healShare.js:buildHealShareArtifact` emits only `{kind, v, fromTier, toTier, at}` — no AB, inventory, prestige keys, or raw save. The clipboard path shares `text` only (tier chrome + URL); the `payload` object is constructed but never serialized to the clipboard or any transport. Pre-mortem risk #2 ("share leaks saves") is mitigated at the source.

## Nits

1. **The ascend test doesn't actually exercise `ascend()`.** `tests/unit/healW0Foundation.test.js` "02 ascend invalidates multiplier cache (no stale upgrade mult)" sets `prestigeLifetimeEarned = 1e12` (clearly intending a real ascend), then *never calls `ascend()`*. It manually pollutes the cache, manually clears workstations, manually calls `invalidateMultiplierCache()`, and falls back to a source-string grep (`src.indexOf('invalidateMultiplierCache()', ascendIdx)`). The behavioral half tests the helper, not the contract; the grep half is brittle to any refactor/rename. Replace with a real `gs.ascend()` call asserting `multiplierCache.size === 0` and a fresh `getProductionMultiplier` post-ascend — that's the load-bearing property this PR ships and it deserves an end-to-end guard.

2. **No privacy regression test for the share artifact.** The RALPLAN pre-mortem explicitly named "share leaks saves." Add a unit test asserting `buildHealShareArtifact({fromTier:3,toTier:4})` returns a payload whose keys are exactly `{kind,v,fromTier,toTier,at}` and whose `text` contains no AB/inventory/prestige values — cheap insurance against a future "helpful" field addition.

3. **`captureHealShare` / `buildHealShareArtifact` have no observed callsite in this diff.** CSS adds `#heal-share-button` styling, but nothing in the diff imports or invokes `js/modules/game/healShare.js`. If the wiring lives in a file outside this diff, fine; if not, this is dead code and the button is inert. Confirm the import + click handler exist, or this lane ships unfinished.

4. **`meditationState.js` captures `multBefore` *after* `this.waveActive = false`.** At `js/meditationState.js:608`, `waveActive` is already false when `multBefore` is sampled. If `getMeditationProductionBonus()` depends on `waveActive`, the "before" baseline silently drops the in-session bonus and the reported Δ is mis-attributed. Move the `multBefore` capture above `this.waveActive = false` to represent the true pre-end state, or document that the delta is intentionally post-wave.

5. **Observability hooks may be silent no-ops.** Every new `SAVE_OUTCOME …` log in `js/gameState.js` (lines ~1048, 1068, 1084, 1100) and the `MEDITATION_Δ` log in `meditationState.js` are guarded by `typeof window.__appendSystemLog === 'function'`. If `__appendSystemLog` is not actually defined anywhere, these additions produce zero observability value while looking like they do. Verify the sink exists; otherwise wire it or the logs are decorative.

## Residual risk

- **`smoke-dist.sh` readiness poll is a real improvement** over `sleep 1` (10×200ms curl loop, `mktemp` + trap cleanup, temp file no longer hardcoded to `/tmp`). The `kill "${PID:-}"` in `url` mode expands to `kill ""` → error → `|| true`; harmless but slightly noisy. Fine.
- **Reduced-motion is handled** (`css/components.css`: `@media (prefers-reduced-motion: reduce)` drops `heal-restore-pulse` and falls back to a 1px outline). No issue.
- **Silent-failure posture is acceptable but heavy.** `captureHealShare` has three `catch {}` blocks (`/* private */`, `/* fall through */`, `/* ignore */`) and the meditation feedback swallows to `console.warn`. None hide correctness bugs, but the clipboard-failure path returns `{ok:false}` with no surfaced telemetry — acceptable only if the caller (not in diff) handles it.
- **No test for the meditation Δ feedback path** or the CSS tier-advance class; observability-only, low risk, but unverified.
