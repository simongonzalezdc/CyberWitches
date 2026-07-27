## Verdict: **APPROVE**

No correctness blockers. The refactor preserves behavior, the new guards resolve to real functions, and both e2e tests exercise genuine bridges (meditation multiplier at `gameState.js:459`, tier gates at `designTierSystem.js:68-93`). Verified: `shouldAllowSfx` exists (`musicPolicy.js:20`, gates tier ≥2), potion shape is identical (`{type,value,duration}`), `notifyTierProgress` gates match `checkTierUnlocks` gates exactly, producer thresholds stay monotonic, and `window.showNotification`/`__appendSystemLog` are defined (`gameInit.js:109,111`) so the hints actually fire.

## Blocking issues
None.

## Nits

**1. Dead/redundant tier gate in `playSound` — `js/audioSystem.js:1644-1651`.** The new `shouldAllowSfx` guard at the top (lines 1638-1642) already returns false for tier < 2 via a more robust path (`uiManager?.systems?.designTierSystem` + `Number()` coercion + try/catch). The legacy block right below (`currentTier < 2`) is now dead code and is the brittle one (unguarded `window.designTierSystem.getCurrentTier()`). The PR's theme is leverage/cleanup — finish the job:

```js
// remove these lines (1644-1651):
// Check if sound effects are enabled (Tier 2+)
// First check the design tier
const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
if (currentTier < 2) {
    // Sound effects are only available from Tier 2 onwards
    // Silent return to prevent console spam
    return false;
}
```

**2. No-op `page.evaluate` — `e2e/helpers/dismissOverlays.js:21-25`.** The `if` body is an empty comment; the whole evaluate does nothing. Either drop it or fold the "give natural dismiss a moment" wait into the existing `waitForTimeout(500)` above it.

**3. Redundant fallback — `js/modules/ui/inventoryUI.js:88`.** `getItemDisplayName` already returns `id` when not found, so `|| ingId` is unreachable. `ingredient?.displayName || getItemDisplayName(ingId)` suffices.

**4. Stale comment — `js/gameState.js:457-458`.** Says meditation bonus is "NOT cached," but line 467 caches `mult` *after* the bonus is applied. Pre-existing (not touched by this PR), so not blocking — but the test only passes because it manually calls `invalidateMultiplierCache()` between reads. If meditation state ever changes without invalidation in live play, players get a stale multiplier.

## Residual risk

- **Aggressive economy rebalance.** `producers.js` compresses mid/late gates hard — e.g. `ws_arcane_candle_forge` 5M→400k (12.5×), `ws_infinity_bit_reactor` 20M→9M. Ordering is still monotonic and recipes still chain to earlier-tier outputs, so no unlock invariant breaks, but there's no balance sim/test covering pacing or AB inflation. Design risk, not code risk.
- **`multiplierCacheDirty` is never reset to `false` by `getProductionMultiplier`** (only `rebuildMultiplierCache` resets it). Once invalidated, every call recomputes — a pre-existing perf latency this PR doesn't worsen but the new meditation test leans on.
- **e2e test #1 stubs achievements heavily** (mutates `unlockedAchievements`, rewrites `getUnlockedCount`). It's a valid smoke check but brittle to internal achievements-structure renames; consider asserting on the public `getUnlockedCount()` contract only.
- No unit coverage for `potionCatalog.js` or `notifyTierProgress` branch logic; coverage is e2e-only.
