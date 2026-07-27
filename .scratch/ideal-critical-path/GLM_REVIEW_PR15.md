# GLM code review — PR #15

**Model:** zai/glm-5.2 via `gjc`  
**Status after fixes:** APPROVE_WITH_NITS → nits addressed  
**Follow-ups applied on stack:** Fixed: goal rail localStorage/DOM change-only; share click try/catch; JSDoc; bit_reactor ids verified present.

---

## Verdict: APPROVE_WITH_NITS

Cache fix is correct and tested behaviorally; event bus, goal stack, and smoke-dist polling are sound. No correctness, data-loss, or secret-leak issues. One hot-path nit is worth fixing before merge; the rest are cheap cleanups.

## Blocking issues
None.

## Nits
1. **`CompileGoalUI.update()` writes localStorage every tick.** It's wired into `UIManager.update()` (render loop) and unconditionally calls `saveCompleted()` → `localStorage.setItem` + `JSON.stringify` each call. Guard on actual change (e.g. `if (this.completedIds.join() !== prev) this.saveCompleted()`). Same method reassigns `titleEl`/`msgEl.textContent` every tick with no diff check — on an `aria-live="polite"` region this can trigger redundant AT re-announcements. Short-circuit when goal id + text are unchanged. Fix both in ~3 lines.

2. **Heal-share click handler body isn't try/catch-wrapped.** The outer try only covers binding. If `healShare.js` (#16/#17) is absent during incremental stack testing, `await import('./modules/game/healShare.js')` rejects as an unhandled rejection. Per stacking note I'm not requesting the module, but wrap the handler body now — it's free insurance and the button can unhide before #16 lands in some test paths.

3. **`getPrimaryCompileGoal` JSDoc lies.** `@returns {CompileGoal | null}` but it never returns null (always falls through to the synthetic `'maintain'` goal). Either return `null` at end or fix the doc — the caller in `compileGoalUI.update()` already handles a falsy return, so returning null is safe and more honest.

4. **`ab_reactor` reachability.** `check` does `id.includes('bit_reactor')`. Confirm at least one producer/workstation id contains that exact substring, else this goal is permanently unreachable and stalls the queue at position 4 (blocking `first_prestige`/`meditation_once` from surfacing). If unsure, broaden the predicate or verify against `PRODUCERS`.

5. **Double notification on tier unlock.** `showUnlockNotification(tier)` runs, then `playHealMoment` fires `window.showNotification('SYSTEM_RESTORE...')`. Likely intentional (unlock vs. heal/share CTA) but confirm — two stacked toasts on one event is noisy.

6. **Global access inconsistency.** `designTierSystem` uses `window.showNotification` / `window.__appendSystemLog`; `gameInit` heal handler uses bare `showNotification` / `appendSystemLog`. Pick one pattern — the bare globals assume module scope and will throw a ReferenceError (unhandled, inside async handler) if not imported.

## Residual risk
- **`tier-advance-heal` CSS class is a no-op until #16/#17** — `playHealMoment` adds the class but no CSS ships this PR, so the body flash won't render. Expected per stack; just don't expect visible heal animation when testing W1 alone.
- **`captureHealShare` / `healShare.js` absent** — SHARE_RESTORE button click is dead until #16. The `result.ok` path can't be exercised in this PR.
- **Forward-looking dead surfaces:** `this.onTierAdvance` callback property and `__lastMeditationMultDelta` global type are declared but unused this PR. Harmless.
- **Test `02 ascend invalidates...` doesn't call real `ascend()`** — it simulates the body and relies on a source-text grep (`indexOf('ascend()')` → `indexOf('invalidateMultiplierCache()')`) for the contract. Brittle to a method rename but acceptable as a regression guard; the behavioral assertions on `.clear()`/`.size === 0` carry the real weight.
- **`fromTier` capture is correct** (snapshot before `Math.max`), but if `unlockTier` is ever called with `tier < currentTier` (not currently possible given the early-return guard), `toTier < fromTier` would produce a confusing log. Non-issue today.
