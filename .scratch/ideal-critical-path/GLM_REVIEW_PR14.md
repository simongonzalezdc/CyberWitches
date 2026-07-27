# GLM code review — PR #14

**Model:** zai/glm-5.2 via `gjc`  
**Status after fixes:** APPROVE_WITH_NITS → nits addressed  
**Follow-ups applied on stack:** Fixed: real `ascend()` behavioral test; cache clear on invalidate; smoke poll+mktemp.

---

## Verdict: APPROVE_WITH_NITS

## Blocking issues
None. The core fix is correct and well-scoped.

## Nits
- **`tests/unit/healW0Foundation.test.js:64-90` (ascend test)** never actually invokes `gs.ascend()`. It manually mutates state, calls `invalidateMultiplierCache()` directly, then falls back to a source-string grep (`src.indexOf('ascend()')` … `indexOf('invalidateMultiplierCache()')`) to "prove" ascend calls invalidate. That guards the *contract* but not ascend's *behavior* — a future refactor that moves the call outside the slice bounds would fail the string test, while a regression that breaks `ascend()` semantics (e.g., early return before invalidate) would pass. Prefer a real `gs.ascend()` invocation asserting `multiplierCache.size === 0` and `multiplierCacheDirty === true` post-call.
- **`js/gameState.js:480-490` `getProductionMultiplierBreakdown`** — the `total` fallback branch is unreachable: `getProductionMultiplier(workstationId)` on the line above always ends with `multiplierCache.set(...)` + `multiplierCacheDirty = false`, so the `!dirty && has(id)` check is always true. Fine as defense-in-depth, but the `// fallback` comment misleads readers into thinking it can fire. Either drop it or assert the invariant.
- **`scripts/smoke-dist.sh:38`** — `npx --yes http-server` requires network egress at run time; on an air-gapped Forgejo runner this fails opaquely. Consider pinning `http-server` as a devDependency and calling it directly, or document the requirement.
- **`scripts/smoke-dist.sh:32`** — `npm run build:prod` is invoked but not added/verified in this diff's `package.json`. If the script name drifts, smoke silently breaks. Worth a one-line existence check in the test (the existing test only asserts `smoke:dist` exists, not `build:prod`).
- **`.forgejo/workflows/ci.yml` (Playwright step)** — `npx playwright install --with-deps chromium` needs root to install OS deps; on the `runs-on: docker` runner this will fail unless the container runs as root or deps are pre-baked. Drop `--with-deps` or confirm the image.
- **`package.json:4`** — `\u2014` vs literal `—` is a no-op decode (same em-dash), purely cosmetic noise in the diff.

## Residual risk
- **Other reset paths not covered.** Only `ascend()` is patched. If there's a hard-reset / "erase save" / debug-wipe path (search `multiplierCacheDirty =` and direct `workstations = {}` mutations repo-wide), it must also call `invalidateMultiplierCache()` or it inherits the same staleness class ascend just escaped. The new `clear()` inside invalidate is good defense, but only if invalidate is the *sole* mutator of `multiplierCacheDirty`.
- **Invariant `dirty === true ⟺ cache empty` is conventional, not enforced.** The stale-while-dirty window I checked: dirty=true, recompute B (not cached) → sets dirty=false and caches B, but any pre-existing A entry would now be served stale on next read. The new `clear()` in invalidate closes this *if* invalidate is the only path to dirty=true. Worth a JSDoc line on `invalidateMultiplierCache` stating the contract, and a grep to confirm no other site sets the flag directly.
- **No share-privacy or reduced-motion changes in this PR** — nothing to leak and nothing to regress, but the smoke script and breakdown helper are new surfaces that touch `window.meditationState`; confirm neither serializes buff/meditation state into any share/export path (none visible here, so low risk).
- **E2E selection is thin for the cache fix.** `e2e/smoke.spec.js` + `progression-tier.spec.js` cover boot + one tier transition; neither explicitly asserts a buff/meditation delta or a post-ascend production recompute. The unit test carries the weight, which is acceptable for W0 but means a runtime-only regression in `_applyVolatileProductionMult` (e.g., meditation hook name change) wouldn't be caught by e2e.

**Credit:** the ascend fix is real and correctly placed — `invalidateMultiplierCache()` (now also `clear()`-ing entries) sits after the workstations/upgrades wipe and before `applyPrestigeStartBonuses()`, so the next recompute picks up fresh prestige mults with no stale pre-reset base. Combined with splitting stable (cached) from volatile (buffs/meditation, never cached), this properly closes the original "meditation NOT cached" lie and the ascend-stale-mult class of bugs. Ship after the nit on the ascend test if you want behavioral coverage; otherwise safe to merge as-is.
