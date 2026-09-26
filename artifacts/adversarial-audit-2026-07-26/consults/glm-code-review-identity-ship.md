---
reviewer: glm-5.2 (ruthless pass)
supersedes: w-16c7-glm-identity-ship-review (2026-07-26T20:40:00Z)
target_branch: feat/identity-ship-player-truth
base: origin/main
pr: https://git.kyanitelabs.tech/simon/CyberWitches/pulls/6
timestamp: 2026-07-26T20:55:00Z
verdict: REQUEST_CHANGES (narrowly scoped)
---

# GLM Code Review — identity-ship PR

Branch: `feat/identity-ship-player-truth`
Head: `f8b7a54 fix: lock product identity and restore player-facing truth`
Scope: `artifacts/adversarial-audit-2026-07-26/consults/identity-ship.diff.patch` against the listed surfaces.

> This draft supersedes the earlier 20:40 GLM review of the same name. The
> earlier draft rated the notification sink "not currently exploitable" and
> the queue drain "bounded, no leak." Both calls were wrong: there is a live
> unescaped interpolation through the auto-HTML path (`comboSystem.js:57`),
> and the close button + auto-remove `setTimeout` pair double-fires the
> drain. Findings corrected below.

## Verdict: REQUEST_CHANGES (narrowly scoped)

Net posture: the player-truth fixes land and are the right shape — currency
canon, meditation round-trip, mobile click pipeline, manual regeneration,
Tier-0 boot are all real and correct at runtime. **Two issues block a proud
ship** and should be fixed before merge:

1. The notification "safe default" introduces a **content-sniffing HTML
   auto-opt-in** that re-opens the XSS surface S3 was supposed to close —
   and there is a live caller (`comboSystem.js:57`) feeding it an unescaped
   interpolation.
2. Every acceptance test in `sessionShipMust.test.js` is a **source-string
   grep**. None of the S1–S8 behaviors are exercised at runtime, so the
   "ship gate" proves nothing about behavior — including the two regressions
   above.

If the maintainers treat the XSS heuristic as in-scope for S3 (the spec
does) and the test plan as the freeze bar (it does: *"falsifiable acceptance
on each seam"*, *"done is not vibes"*), this is a REQUEST_CHANGES. If those
are deferred to a follow-up, the rest is APPROVE_WITH_NITS.

---

## Critical

### C1. Notification XSS residual risk — content sniff defeats the "safe default" invariant
**Files:** `js/modules/ui/notifications.js:47-52`; live sink `js/comboSystem.js:57`.

`show()` auto-opts-in to `innerHTML` whenever the message merely *contains*
the substring `css-icon-`:

```js
const looksLikeTrustedIconTemplate =
    typeof message === 'string' &&
    message.includes('css-icon-') &&
    !message.includes('<script') &&
    !message.includes('onerror=');
const allowHtml = options.html === true || looksLikeTrustedIconTemplate;
```

Three independent problems, any one of which disqualifies a security seam:

- **Denylist is trivially bypassable.** It blocks exactly two strings
  (`<script`, `onerror=`). Payloads that pass: `<svg onload=alert(1)>`,
  `<a href="javascript:alert(1)">`, `<iframe srcdoc="<script…>">`,
  `<img src=x onmouseover=alert(1)>`, `<style>@import url(//evil)</style>`,
  `<details ontoggle=… open>`. Classic blocklist-for-HTML anti-pattern.
- **Opt-in is decided by message *content*, not call-site *intent*.** Spec
  S3 requires trusted HTML "only when intentional (e.g. known icon
  templates)." This heuristic makes the promise false: any future caller —
  a saved-game field, a localized string, a quest reward name, a daily-task
  description — that happens to contain `css-icon-` silently gets rendered
  as HTML. The default is no longer safe; it is "safe unless the string
  looks icon-y."
- **There is a live unescaped interpolation feeding this path.**
  `comboSystem.js:57`:
  ```js
  window.showNotification(`<span class="css-icon-fire"></span> ${milestone}x Combo! +${bonus.toFixed(1)} AB`, 'success');
  ```
  `milestone` is interpolated raw. The prior review missed this. Today
  `milestone` is a numeric value from a fixed milestones array, so it does
  not explode *today*. But the structural sink is now in the codebase: the
  moment `milestone` (or any sibling field it sets the pattern for) becomes
  a string from data/save/network, it is HTML-injected through the exact
  path the audit flagged as the thing to fix. `experimentUI.js:156` does the
  right thing (`escapeHtml(result.recipe.name)`); `comboSystem` does not,
  and nothing enforces consistency.

**Required direction:** drop the content sniff. The explicit `showHtml()` /
`options.html` path is the correct API and already exists. Migrate
`comboSystem.js:57` to `showHtml` with `escapeHtml(milestone)` on the
dynamic part, or build the icon span via DOM APIs and pass text. Re-route
`pwaFeaturesManager.js:232` (literal static string — fine) through
`showHtml` explicitly so intent is visible at the call site, not inferred.

### C2. Acceptance tests assert source text, not behavior — the freeze bar is cosmetic
**File:** `tests/unit/sessionShipMust.test.js` (entire); `tests/unit/elementCounters.test.js`.

Every assertion reads a source file with `fs.readFileSync` and greps for a
literal/regex. None instantiate a single production object. Concrete
failure modes that **pass** the suite:

- `notifications default to text-safe path` (`sessionShipMust.test.js:52-57`)
  checks that the *strings* `showText`, `showHtml`, `textContent` appear in
  `notifications.js`. A regression that re-enables `innerHTML` for every
  message — or a worse `looksLikeTrustedIconTemplate` sniff — passes. **C1
  is invisible to this test.**
- `cast path uses critical_compile not jackpot` (`:34-38`) greps for the
  literal `"bonusType = 'critical_compile'"`. Passes if
  `window.triggerBonusFeedback` is never invoked, if `bonusType` is
  overwritten before use, or if `floatingTextUI.show` never renders. S8
  ("feedback hook produces player-visible copy") is untested.
- `meditationState loadState restores stats fields` (`:26-32`) greps for
  `this.totalWavesCompleted = state.totalWavesCompleted` and the literal
  `posDelta`. Passes if `loadState` is never called, if the fields are
  clobbered after assignment, or if the stuck-detection math is wrong. The
  S5 round-trip (save → load → `getMeditationProductionBonus()` returns the
  restored value) is never run. (The save side *is* wired correctly —
  `meditationState.js:1525-1527` writes the three fields — but no test
  proves the loop closes.)
- `triggerBonusFeedback is wired in gameInit` (`:40-44`) greps for two
  literals. Passes if the closure throws at runtime.
- `TutorialSystem owns COMPILE_GOAL copy` (`:46-50`) greps for the copy
  string and the step id. Passes if `startTutorialSteps` never runs.
- `mobile tooltips do not preventDefault on touchstart` (`:59-63`) uses
  `touchstart[\s\S]{0,120}preventDefault`. Brittle: a `preventDefault()`
  121+ chars downstream of `touchstart` evades the regex; and the test never
  verifies that a `click` actually fires after `touchend`. S4's behavioral
  contract is what mattered; this regex is a coincidental string-proximity
  check.
- `landing wires real screenshot media` (`:96-101`) asserts the strings are
  in `index.html`. The files happen to exist (verified on disk:
  `screenshots/desktop-1.png`, `screenshots/mobile-1.png`,
  `images/generated/hero-atmosphere-kyanite.jpg`) — but the test would pass
  against `style="display:none"` or a broken path.

The currency ban-list walk (`:65-85`) is the one structurally honest test
(it scans file *content* across a tree), but its scope is wrong (see M3):
it walks `js/modules` recursively but skips every top-level `js/*.js`
(`comboSystem.js`, `gameState.js`, `gameInit.js`, `meditationState.js`,
`customTooltips.js`, …).

**Required direction:** at least one behavioral assertion per seam —
instantiate `NotificationManager` in jsdom, push `<svg onload=…>` through
`show()`, assert the container has no `<svg>` child and `textContent`
matches; construct `MeditationState`, set stats, `saveState()` → new
instance → `loadState()` → assert `getMeditationProductionBonus()` matches;
attach a tooltip to a button in jsdom, dispatch `touchstart`/`touchend`/
`click`, assert the click handler ran. Source-grep tests can stay as cheap
smoke checks but must not be the only signal.

---

## Major

### M1. Queue drain double-fires on manual close (and re-enters `show` synchronously)
**File:** `js/modules/ui/notifications.js:129, 142-161`.

Each notification has two removal paths: the close button (`:129`) and a
`setTimeout` auto-remove (`:142-146`). `removeNotification` shifts the queue
unconditionally at the end of its 300ms fade (`:156-160`) and never clears
the pending auto-remove timeout. The prior review rated this "bounded, no
leak." It is bounded, but it double-drains:

1. User clicks `x` → `removeNotification` runs → queue shifts and
   `show(next)` is called → next notification appears.
2. The original auto-remove `setTimeout` (never cleared) fires →
   `removeNotification` runs again on the same detached node → `parentNode`
   is null so the DOM removal is skipped, **but the queue-shift +
   `show(next)` runs again** → a *second* queued notification is popped
   erroneously.

Net: closing one notification early can release two queued ones, and at
high notification volume the queue ordering visibly jumps. There is also a
re-entrance smell: `show(next)` is called *synchronously inside* the fade
`setTimeout`, and `show` may itself push to the queue if
`count >= maxPerSecond`, so the drain can re-queue what it just popped.

**Fix shape:** store the auto-remove timer handle on the element and clear
it in the close handler; guard the drain with an "already removing" flag;
drain via `setTimeout(0)` rather than re-entering `show` inline.

### M2. Stuck detection in `meditationState` trades one bug for two
**File:** `js/meditationState.js:877-911`.

The old `hasMoved = distance > 0.01` (distance to next waypoint) never
flagged stuck in practice. The new `posDelta`-based check is correct in
spirit but has three residual issues the prior review waved through:

- **First-observation false stuck.** `dist._prevX ?? dist.x` initializes
  prev to current on the first tick for a freshly spawned (or freshly
  loaded) distraction, so `posDelta = 0` and `hasMoved = false`. The
  `timeSinceLastMove = now - (dist.lastMoveTime || now) = 0` saves it on
  tick 0, but any distraction that does not move > 0.01 units on its first
  real tick begins accumulating stuck time immediately.
- **Slow distractions false-positive.** `posDelta > 0.01` is a per-tick
  displacement threshold. A legitimately slow distraction (debuffed, low
  game-TPS, or one that just snapped and is re-pathing) moving < 0.01
  units/tick is "moving" in worldspace but registers as stuck. After 1s +
  3 frames it gets force-teleported toward center (`:898-905`), warping a
  unit that was making real progress.
- **Stuck-but-oscillating never recovers.** The complement case the spec
  actually cared about: a distraction caught in pathfinding limbo that
  wiggles > 0.01 units/tick (bouncing between two tiles, jittering around a
  waypoint) is "moving" forever and **never** triggers recovery. The hang
  the spec called out ("waves do not hang forever") is only partially
  fixed — fixed for frozen enemies, not for oscillating ones.
- **Recovery latency is > 1s + 4 frames.** Even when stuck is correctly
  detected, the force-move only fires when `stuckCount > 3` (`:892`); for
  `stuckCount <= 3` the branch increments and **falls through** to normal
  movement, so no force is applied for the first three stuck frames.

**Fix shape:** track progress *toward center* (monotonic decrease of
`distToCenter`) rather than raw per-tick delta; reset `_prevX/_prevY` and
`lastMoveTime` explicitly on spawn/load; force-move on the first stuck
frame past the time gate, not after a count threshold.

### M3. Currency ban-list test does not cover top-level `js/*.js`
**File:** `tests/unit/sessionShipMust.test.js:66`.

```js
const roots = ['js/modules', 'CONTEXT.md', 'play.html', 'index.html', 'GAME_MANUAL.md'];
```

This walks `js/modules` recursively (good) but skips the entire top level of
`js/` — exactly where the busiest files live (`gameState.js`, `gameInit.js`,
`comboSystem.js`, `meditationState.js`, `customTooltips.js`,
`eventSystem.js`, …). The audit hot-paths memory flags `gameState.js` as the
most-edited file in the project. A drift reintroduction of "Spell Energy" /
"Aether Bits" / "Arcane Bytes" in any top-level file is invisible to the
test. Either walk `js` recursively, or explicitly enumerate the top-level
hot files.

### M4. Stale `js/gameState.js.backup` still contains the banned `jackpot` literal
**File:** `js/gameState.js.backup:731-733` (verified via grep).

```
js/gameState.js.backup:731:            // 5% chance for 2x-5x bonus (jackpot)
js/gameState.js.backup:733:            bonusType = 'jackpot';
```

Not player-facing, but it is checked into the repo, will confuse the next
agent that greps for `jackpot`, and would survive a careless revert. Delete
it; backups belong in git history, not as sibling files. The ban-list test
does not scan `.backup` so this drifts silently.

---

## Minor

### m1. Focus counter becomes visible but stays `aria-hidden="true"`
**Files:** `play.html` focus-counter markup × `js/modules/ui/hudUI.js:152-159`.

`play.html` ships the focus counter with `aria-hidden="true"` and
`display:none`. `hudUI.updateElementCounters` un-hides it on
`prestigeCount >= 1` by setting `style.display='flex'`, `visibility`, and
`opacity` — but never removes `aria-hidden`. So after prestige, the
meditation production bonus is rendered on screen and invisible to screen
readers. Spec S19 explicitly wants status updates to "remain polite live
regions with safe text" for AT users; the production-bonus counter is the
most AT-relevant number in the sidebar and it is hidden from them. Toggle
`aria-hidden` alongside `display`.

### m2. Tier-0 cosmetic incompleteness — counters stay monochrome past Tier 0
**Files:** `play.html` element-counter markup; `js/modules/game/designTierSystem.js:109-151`.

The DOM contract is honest (counters exist, `hudUI.updateElementCounters`
writes all five elements + focus, verified at `hudUI.js:116-148`), and Tier
0 looks correctly broken — good. But the spec's S17 promise was "counters
and chrome gain color and polish only after unlocks." The patch removes the
per-element color from the Fire counter (`text-red-400` → `text-gray-300`)
and adds `data-element="…"` attributes intended as hooks for higher-tier
CSS — but **no CSS in this patch consumes those hooks**. `applyTier` only
toggles theme colors, animations, and audio; it never restores
element-specific color. Net: counters are mono at Tier 0 (correct) and mono
at Tier 4 (incomplete). Either ship the higher-tier CSS in this PR or file
it as an explicit follow-up so the "heals as you play" payoff is not a
promise the build breaks.

### m3. `tier-0` body class is removed-then-readded on every boot
**File:** `js/modules/game/designTierSystem.js:112-116`.

`applyTier` does `classList.remove('tier-0','tier-1',…)` then
`classList.add('tier-${tier}')`. `play.html` hardcodes `class="tier-0 …"`
on `<body>`, and boot awaits `applyTier(bootTier)`. For a fresh save
(`bootTier === 0`) there is a brief window between the `remove` and the
`add` where no tier class is set at all. Cosmetic flash only, and only on
the slowest boots, but the cleaner pattern is to add the new class first,
then remove stale ones.

### m4. `triggerBonusFeedback` notification fallback beeps on every bonus cast
**Files:** `js/gameInit.js:100-124` × `js/modules/ui/notifications.js:80-93`.

When `uiManager.floatingTextUI.show` is unavailable, the closure falls back
to `showNotification(copy, 'success', 2000)`. Type `'success'` plays the
success SFX unless the message contains `'Achievement'`. `CRITICAL_COMPILE
×3.7` does not, so the fallback path honks the success channel on every
5%-and-10% bonus cast once you account for the rate-limit queue. The
floating-text path is silent. So audio behavior flips depending on whether
`floatingTextUI` is loaded — fine in prod, noisy if the lazy chunk is ever
delayed. Either route the fallback through a non-sound type (`'info'`) or
accept the asymmetry knowingly.

### m5. COMPILE_GOAL is double-emitted within the single owner
**File:** `js/modules/game/tutorialSystem.js:197-218`.

Spec S7/S10 wanted "no double onboarding modals" and a single owner.
Single owner: yes. Single emission: no. `startTutorialSteps()` fires
`this.notify('COMPILE_GOAL: …')` as a toast *and* the same copy is the
message body of the `compile_goal_fire` step. When the player reaches that
step they see the goal a second time as a tooltip. Minor, and the toast is
a reasonable hedge (the step's `target: '#workstation-list'` will silently
no-op if the workstation tab is not yet rendered, per the
`if (targetEl)` guard at `:251`), but the duplication should be a conscious
decision, not an accident.

### m6. `allowHtml` is decided from the raw message, applied to the stripped message
**File:** `js/modules/ui/notifications.js:47-55`.

`allowHtml` is computed from the raw `message`, then
`message = stripEmojisIfLowTier(message)` mutates it, then
`innerHTML = message` (when allowed) uses the stripped form. Benign today
(emoji stripping does not move the HTML boundary), but the decision and the
payload diverge through the function. Compute `allowHtml` once, after any
normalization, and use the same string for both.

---

## Tests

- **Coverage of behavior:** effectively zero (see C2). The new tests are
  entirely structural.
- **Redundancy:** the DOM contract for counters is checked twice
  (`elementCounters.test.js` + `sessionShipMust.test.js`).
- **Missing entirely:**
  - No test that `show()` with a malicious payload leaves the container
    text-only.
  - No test that `MeditationState.saveState→loadState` round-trips the
    three stats into `getMeditationProductionBonus()`.
  - No test that `GameState.cast` with a forced `bonusRoll` invokes
    `window.triggerBonusFeedback` and that the closure produces visible
    DOM.
  - No test that `CustomTooltipManager.addTooltip` on a touch device
    preserves a subsequent `click`.
  - No test that `applyTier(loadTier())` at boot results in `body` having
    exactly one `tier-N` class matching the saved tier.
  - No test that `hudUI.updateElementCounters` actually populates
    water/air/crystal/aether values (the existence of the IDs is tested;
    their population is not).
- **Brittle regex:** the `touchstart … preventDefault` regex (`:61`) is
  positionally coupled to today's exact source layout. Refactors that
  preserve behavior will break it; refactors that break behavior may not.

---

## Security

- **C1 is the only real security finding**, and it sits on the seam the PR
  claims to harden. The default path (`textContent`) is genuinely safer
  than the prior always-`innerHTML` behavior — net posture improved — but
  the auto-opt-in sniff is a regression waiting for a string. Treat
  `css-icon-` in a message as a *call-site* declaration (use `showHtml`),
  not a *content* declaration.
- No new secrets, no credential handling introduced. The spec's
  "human-only PAT rotation" is correctly out of code scope.
- `modalManager.js:418-419` welcome-back uses `innerHTML` with
  `escapeHtml(formatTimeDuration(...))` / `escapeHtml(formatShort(...))` —
  those values are numeric/format-produced so safe; flagged only because it
  is the same string-concat anti-pattern C1 belongs to. Prefer DOM
  construction.
- Mobile tooltip handlers are registered `{ passive: true }` and cannot
  `preventDefault` even on attempt — S4 satisfied.

## Correctness risks

- **Queue double-drain (M1)** — user-visible notification ordering bug
  under load.
- **Stuck detection (M2)** — both directions: false positives warp slow
  units, false negatives let oscillating units hang waves.
- **`triggerBonusFeedback` closure captures boot-time `uiManager`** — fine
  today (never reassigned), but the closure reads
  `uiManager?.floatingTextUI?.show` per-call; if `uiManager` is ever
  replaced wholesale, behavior silently flips.
- **`bootTier` source** — `loadTier()` reads `localStorage.cw.designTier`
  synchronously in the `DesignTierSystem` constructor (`:24`) and returns
  `0` on missing/parse-failure. `applyTier(0)` is the right default;
  verified. No risk.
- **`reconcileDesignSystemVersion()`** sets `root.dataset.designSystemVersion`
  and persists to a separate storage key (`hexcompiler-design-system-version`)
  distinct from the tier key (`cw.designTier`) — two keys for one concept,
  mild future-confusion risk but correct today.

## What's good

- **Meditation round-trip is correctly closed.** `meditationState.js:1552-1555`
  restores `totalWavesCompleted / totalDistractionsKilled /
  totalSessionsCompleted`, the save side writes them (`:1525-1527`), and
  `getMeditationProductionBonus()` reads them (`:1270-1276`). The
  silent-reset bug from the audit is fixed at both ends. The code is right;
  only the test is missing.
- **Mobile tooltip fix is the right design.** `customTooltips.js:138-164`
  switches `touchstart` to `{ passive: true }`, drops `preventDefault`, and
  uses a long-press timer (450ms) with a `longPressFired` latch so the
  click pipeline stays intact. `touchend`/`touchmove`/outside-`touchstart`
  are all passive now. S4 satisfied.
- **`triggerBonusFeedback` is wired end-to-end.** `gameState.js:793-795`
  invokes it on any `bonusType`, the closure (`gameInit.js:100-124`) routes
  to `floatingTextUI.show(copy, x, y, 'crit')` with a notification fallback,
  and `'crit'` is a real `floating-text-crit` class (`floatingTextUI.js:23-26`).
  The dead-jackpot-hook gap from the audit is genuinely closed at runtime.
- **Cast bonus rename is consistent.** `gameState.js` uses
  `critical_compile` / `compile_overclock`; the closure defensively accepts
  the old `jackpot` / `bonus` aliases so a partial revert does not silently
  no-op. The achievement path (`lastCastBonus >= 5.0`) still fires on the
  5× critical.
- **Currency canon is thorough.** Banned strings are purged from
  `CONTEXT.md`, `GAME_MANUAL.md`, `prestige.js`, `tasks.js`, `upgrades.js`,
  `boonsUI.js`, `dailiesUI.js`, `modalManager.js`, `hudUI.js`.
  Player-facing copy is uniformly AB/EK.
- **`GAME_MANUAL.md` rewrite matches live systems.** Fire Forge line, 0.15
  AB/cast, post-prestige meditation gating, design-tier table — all reflect
  the running build, and the manual explicitly defers to in-game data on
  conflict. The `0.15 AB` number matches `gameState.js:789`
  (`abPerCast = 0.15 * totalMult`).
- **Boot Tier-0 enforcement is honest.** `gameInit.js:153-163` reconciles
  the design-system version and applies the saved tier at first paint, with
  a `tier-0` fallback in the catch. Combined with the hardcoded
  `class="tier-0"` on `<body>`, first paint is genuinely the broken
  terminal the spec wanted, even on a returning Tier-4 save.
- **Notification rate-limit + sound throttle + aria-live polite roles are
  preserved** through the refactor. Accessibility posture of the
  *container* is intact.
- **Patch hygiene** is mostly good — small vertical slices, no
  architecture-vanity rewrites, lazy-loading discipline preserved. The one
  hygiene miss is `gameState.js.backup` (M4).

---

## Recommended merge conditions (minimal)

1. Remove the `looksLikeTrustedIconTemplate` content sniff; migrate
   `comboSystem.js:57` (and any sibling) to explicit `showHtml` with
   escaping, or to DOM construction. **(C1)**
2. Add ≥1 behavioral test per S3, S4, S5, S8. **(C2)**
3. Clear the auto-remove timer on close; guard the queue drain. **(M1)**
4. Walk `js/` (or enumerate top-level files) in the currency ban test;
   delete `gameState.js.backup`. **(M3, M4)**

Everything else (m1–m6, M2 stuck-detection polish) can ship as follow-ups.
