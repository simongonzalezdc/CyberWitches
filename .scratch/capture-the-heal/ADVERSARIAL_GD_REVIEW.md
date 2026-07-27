# Adversarial GD review — Capture the heal (post-ship)

**Date:** 2026-07-27
**Reviewer stance:** adversarial senior game designer, post-ship, hostile to our own claims
**Scope read:** `healCeremony.js`, `healCapture.js`, `healShare.js`, `designTierSystem.js`, `css/components.css` heal block, `play.html:88`, `index.html` heal section, `gameInit.js:218-250`, `css/utilities.css:389`, `CLAIM_AUDIT.md`, `FIELD_MUTE_CLIP.md`
**Verdict in one line:** the ceremony is well-engineered and **shows the wrong thing** — it dims and brightens an already-healed screen, so the mute stranger never sees broken→restored happen in the product, only in a synthetic PNG.

---

## 1. Steelman of the current design

Give the shipped work its strongest possible defense first. It is genuinely good on these axes:

1. **The differentiator is correctly chosen.** In a market where every idle game has numbers going up, "the UI itself is the scoreboard and it heals" is a real, ownable, screenshot-native hook. Tiers 0-4 as *design* tiers rather than stat tiers is the right bet, and it is defensible against clones because it is architectural, not content.
2. **The ceremony is a state machine, not a pile of setTimeouts in a view.** `healCeremony.js` separates timeline from side effects via `CeremonyHooks`, exports `CEREMONY_BEATS`, and is unit-testable headless (`runHealCeremony` with injected `schedule`). That is above the median for a browser idle game and it made this review cheap.
3. **Mute-first is the correct discovery assumption.** ~85% of feed viewing is sound-off. Designing the payload to be legible with volume at zero (`SYSTEM_RESTORE v1.0 ONLINE`, log line, toast, visible chrome delta) is the correct priority order, and the reduced-motion path (`healCeremony.js:89-99`) preserves the *claim* while dropping the *motion* — a genuinely accessible ceremony rather than a disabled one.
4. **Privacy discipline in the share artifact is real, not claimed.** `healCapture.js:53-63` + `:196-198` gate on banned keys, word-boundary secret scan, and a data-URL prefix check; `healShare.js` payload carries only `fromTier`/`toTier`/`at`. Shipping a share feature that cannot leak a save is the hard version, and it was done.
5. **Honesty gates already survived one review.** `healShare.js:84-90` refuses to claim visual success unless the download trigger actually ran. `designTierSystem.notifyTierProgress()` tells the player the *actual* remaining requirement instead of a vague tease. `funnelMetrics` TTA/TTH/shareAttempt is local-only, so measurement did not become surveillance.
6. **Kill list held.** No gacha, no third currency, no dual quest HUD, no framework swap, no GameState rewrite, no Steam detour. The team shipped ceremony/capture/copy — exactly the cheap, high-leverage layer — and resisted system sprawl. That discipline is the reason the following fixes are all small.

**So the honest frame:** this is not a broken feature. It is a correct feature whose payload is being spent at the wrong moment, on the wrong contrast, behind an affordance that evaporates.

---

## 2. Assassin attacks — how the mute scroll stranger fails to get "system restored"

The target: a never-player, phone, volume off, ~2-4 seconds of attention on a 12-15s clip or a single screenshot. Every attack below is grounded in a specific line of shipped code.

### A1. The heal already happened before the ceremony starts — there is no "before" on screen

`designTierSystem.unlockTier()` (`designTierSystem.js:143-158`) runs:

```
await this.applyTier(tier);   // ← chrome, theme, animations, audio all swap HERE
this.saveTier();
this.showUnlockNotification(tier);
this.emitTierAdvance(fromTier, tier);   // → playHealMoment → ceremony beat 'dim'
```

By the time the ceremony's `dim` beat fires, `body` is already `tier-1`, `setTheme(KYANITE_THEME)` has already landed, and `toggleAnimations(true)` may already be on. The ceremony therefore renders: **restored chrome → dim the restored chrome → brighten the restored chrome**. The 200ms `restore_line` beat is a lighting effect on a screen that never looked broken during the ceremony.

For the mute stranger this is fatal in the exact way that matters: a transition clip has no *from* frame. The only place broken→restored is legible is the downloaded PNG, which the stranger never sees. The field test passed on *text* ("restore language hits 5/5") — the raters read the words, they did not see the change. `FIELD_MUTE_CLIP.md` says it outright: "SYSTEM_RESTORE copy is doing the work." That is the confession. The visual thesis is untested because it is not being performed.

### A2. Tier 0 is not deprivation, it is a slightly tired theme

`applyTier(0)` sets `primary: KY_CRYSTAL, secondary: KY_STEEL, accent: KY_CRYSTAL` — still tokens, still tinted. CSS `body.tier-0` (`components.css:1042-1081`) only removes glow/shadow/backdrop-filter and sets `opacity: 0.72` on tabs and sidebar chrome. Nothing desaturates. Element counters have no tier-0 neutralization at all (`grep data-element css/` → zero rules). Meanwhile `css/critical.css:310` keeps a colored CRT gradient overlay at `opacity: .16` at *all* tiers, including 0.

Result: the "before" state is a competent dark cyberpunk UI. The "after" state is a slightly glossier dark cyberpunk UI. A stranger comparing frames sees a **bloom change**, not a restoration. Delta must be readable at 400px wide, on a phone, at 60% brightness, in 300ms. Bloom is not.

### A3. The share affordance dies on reload and is unreachable for Tier 4 players

`showSharePulse` (`healCeremony.js:170-184`) is the *only* code path that sets `shareBtn.hidden = false`. Nothing in `gameInit.js:218-250` unhides it based on saved tier. So:

- Player heals to v1.0, sees SHARE_RESTORE, doesn't click (they're mid-session, mid-dopamine, hands on the cast button), refreshes or comes back tomorrow → **the button is gone**.
- A returning Tier 4 player has no tiers left to advance → **the share button can never appear again for the rest of their life**.
- Total lifetime exposure of the share CTA: 5 pulses of 2.6s each, ever, and only if the player is looking at the top-right corner at t=1000ms.

We built a sanitized, privacy-safe, download-capable share artifact and then gated it behind a 2.6s window that fires at most 4-5 times per account. `markShareAttempt()` will measure a floor we designed.

### A4. Three toasts, two vocabularies, and the loudest one drops the "before"

Within 2s of a tier advance the player receives:

| t | source | text |
|---|--------|------|
| 0ms | `showUnlockNotification` (`designTierSystem.js:311`) | `SYSTEM_UPDATE: v1.0` |
| 700ms | ceremony `toast_log` (`healCeremony.js:120`) | `SYSTEM_RESTORE v1.0 — chrome recovering` |
| 2000ms | `showUnlockNotification` (`designTierSystem.js:313`) | `COLOR_DRIVERS_LOADED.` |

Three stacked toasts in `.notification-container` (fixed, top-right, column). The stranger's eye lands on a **queue**, not a claim. Worse, we ship two competing brand words — `SYSTEM_UPDATE` and `SYSTEM_RESTORE` — for the same event, so the campaign's own keyword is diluted at the moment of maximum attention. And `restoreLine()` (`healCeremony.js:42`) correctly carries the before-state — `"(was v0.0)"` — but it goes to the **log**, the least visible surface, while the toast (the biggest, highest-contrast element, the one that lands in every screenshot) throws the before-state away.

The single most valuable string in the campaign is `broken → restored`. It is currently in a scrolling log behind a stack of three toasts.

### A5. `filter` on `body` breaks the containing block of the one element the campaign depends on

`components.css:1091-1098` applies `filter: brightness(...) saturate(...)` to `body` for the whole 1.6s ceremony. Per CSS spec, a non-`none` `filter` makes that element a **containing block for fixed-position descendants**. `.notification-container` is `position: fixed; top: 84px; right: 16px` (`utilities.css:389-393`), appended directly to `body` (`notifications.js:10`). `body::after` is a `position: fixed; inset: 0` CRT overlay (`critical.css:310`). `.story-intro-modal` is `position: fixed; inset: 0`.

So during the ceremony: the toast container and the CRT overlay reparent their positioning to the body box, and both get the brightness/saturate applied to them. Consequences, in order of how much they cost us:

1. The **restore toast is dimmed to 0.72 brightness** at the exact moment it needs to be the brightest thing on screen (dim beat 0-200ms), then punched to 1.35 (200-450ms) — the one readable claim flickers instead of asserting.
2. The fixed overlays can visibly shift at ceremony start and again at the 1600ms cleanup, environment-dependent on scroll position and body box height. Environment-dependent visual jitter in the one frame the entire campaign screenshots is unacceptable.
3. `contain: layout style paint` on `.notification-container` (`containment.css:56`) plus a full-page filter forces a compositing-layer repaint of the whole document for 1.6s — on a mid-tier Android this is where the clip drops frames, and dropped frames read as "broken site," not "restored system."

### A6. The share artifact is a synthetic drawing, not the player's screen — and it lies in two places

`paintSplitStill()` (`healCapture.js:71-136`) draws a hand-coded mock from a frozen `TIER_CHROME` table. It never touches the live DOM. Consequences:

- **It is a fabricated screenshot.** Every player at the same tier pair downloads a byte-identical PNG. Zero personal proof, zero "that's *my* run" motive, and platforms deduplicate/downrank identical images — the share asset is structurally anti-viral.
- **Label lie #1:** `TIER_CHROME[0].label = 'MONOCHROME'` (`healCapture.js:14`) while the actual Tier 0 product is colored (A2). The artifact promises a deprivation the game does not deliver — a stranger who clicks through gets a **worse** first impression than the ad. That is the one thing a growth asset must never do.
- **Label lie #2:** for a 1→2 advance the left panel still renders `'T0 DOS'`… actually it renders `T1 COLOR`, correct — but the footer hardcodes `'Broken → restored'` for every pair, including 3→4, where nothing was broken. Copy generalizes a claim it cannot support at high tiers.
- No TTH stamp, no run identity, no date. The artifact carries no proof-of-play, which is the only currency a screenshot has.

### A7. "Download" is not a share on the platform where the stranger lives

`healShare.js:80-83` → `downloadDataUrl()` → anchor click → PNG in `~/Downloads` (desktop) or Files (iOS). No `navigator.share({ files })`, no `ClipboardItem` image write, no inline preview. On mobile — where the mute scroll stranger *is* — the flow ends with a file the player cannot see, in an app they now have to leave the game to open, to then re-attach manually. We call this "≤2 player actions" in `CLAIM_AUDIT.md` ticket 06; the honest count on mobile is 2 actions to *acquire* and 3-5 more to actually *post*.

And the honesty gate has a hole: `healShare.js:105-113` has two identical `visual+text` branches, so when the clipboard write fails, `gameInit.js:234-236` still tells the player **"text copied"**. We fixed this exact class of lie for the download in `9ec0712` and left it standing for the text.

### A8. Reduced-motion players get a silent, unstyled, unannounced button

Reduced path calls `showSharePulse({ pulse: false })` → `wantPulse === false` → early return before adding `heal-share-btn--pulse`. But the reduced-motion CSS fallback (`components.css:1166-1171`) is written as `#heal-share-button.heal-share-btn--pulse:not([hidden])` — it **only applies when that class is present**, which in the reduced path it never is. So the intended "static outline instead of pulse" affordance never renders. A reduced-motion player gets a 0.65rem monospace button silently appearing in a corner between a `?` and a gear, with no `aria-live` announcement of its arrival. For a screen-reader or vestibular user, SHARE_RESTORE effectively does not exist.

### A9 (bonus). Overlapping ceremonies leave a stuck filter

No re-entrancy guard in `runHealCeremony`. Offline-progress catch-up or an AB spike can cross two gates in one tick (`checkTierUnlocks` → `unlockTier(1)`, `unlockTier(2)`), firing two overlapping 1.6s timelines. Ceremony #1's cleanup at 1600ms (`healCeremony.js:129-137`) strips `tier-advance-heal` and all beat classes while ceremony #2 is mid-flight → aborted animation, and depending on interleaving a `heal-ceremony-*` class can survive its owner and leave the page stuck at `brightness(1.35)`. Also: a 0→2 double advance produces two half-ceremonies instead of one big one, wasting the largest heal moment in the game.

### A10 (bonus). The stranger never learns what the game *is*

Nothing in the ceremony says what caused the heal. `compile-goal-rail` — the one element that states the objective — is `hidden` until tutorial complete (`play.html:81`), which is exactly the state a clip-recording early session is in. The stranger reads "SYSTEM_RESTORE v1.0 ONLINE" and correctly answers "the system was restored" (field test passes) while having **no idea it was caused by playing**. Comprehension of the effect without comprehension of the cause is why raters said "mildly curious / weak" and "probably not" on the click-through question — 3 of 5 raters were lukewarm-to-negative on opening the link. We shipped a Pass with a weak intent signal and did not read it as a warning.

---

## 3. Prioritized implementation recommendations

Ordered by (mute-stranger comprehension delta + funnel delta) ÷ cost. All ceremony / capture / CSS / copy. No new systems.

---

### Rank 1 — Gate the tier chrome swap behind the ceremony's restore beat

**Problem (A1).** `applyTier()` completes before `emitTierAdvance()`, so the ceremony performs on an already-healed screen. There is no before-frame anywhere in the product.

**Player impact.** This is the entire thesis. Right now the heal is *asserted by text* and *illustrated by a synthetic PNG*; after this fix it is **witnessed**. A 1.6s clip gains a real 0→1 visual cut, which is the only asset that can carry the campaign without copy.

**Exact files to change.**
- `js/modules/game/designTierSystem.js` — in `unlockTier()`, stop awaiting `applyTier` before the ceremony. Add tier state + save, then call `emitTierAdvance(fromTier, tier)` and pass an `applyChrome` callback that performs `await this.applyTier(tier)`. Keep a hard fallback: if the ceremony throws or reduced-motion is on, apply immediately (never leave a player stuck at old chrome).
- `js/modules/game/healCeremony.js` — add `applyChrome` to `CeremonyHooks`. Invoke it at the **`restore_line` beat (200ms)**, not at t=0. In the reduced path, invoke it immediately (before returning) so reduced-motion users still land on the correct chrome. Guarantee single invocation with a local `applied` flag, and also invoke it in the `done` beat if it somehow has not run.
- `js/modules/game/healCeremony.js` `playHealCeremonyInBrowser` — thread `applyChrome` through from `playHealMoment`.
- `css/components.css` heal block — add `body.tier-advance-heal.heal-ceremony-dim` a *content* dim (see Rank 4 for the scoping fix) so the 200ms pre-swap frame reads as "the old broken state, about to break further."

**Acceptance test.**
- Unit (`test/` alongside existing ceremony tests): `runHealCeremony({fromTier:0,toTier:1}, { applyChrome: spy, schedule: fakeClock })` — assert `spy` **not** called at t=0, called exactly once at t=200, and called exactly once total after the clock runs to 1600. Reduced-motion variant: called exactly once synchronously.
- E2E (`e2e/heal-operator-journeys.spec.js`): force a tier advance; assert `document.body.classList.contains('tier-0')` is still true at t≈100ms after the advance and `tier-1` is true by t≈400ms. Capture screenshots at 100ms and 900ms and assert the two frames differ by a pixel-diff threshold ≥ 8% (with Rank 4 landed, expect ≫).

**Risk if ignored.** The campaign's central claim remains untested and unperformed. Every future growth dollar buys traffic to a clip whose most important frame does not exist. Worse: we will keep reading text-comprehension passes as visual-thesis validation, which is how a team ships a differentiator nobody can see for two more quarters.

---

### Rank 2 — Make SHARE_RESTORE persistent, prominent, and announced

**Problem (A3, A8).** The only unhide path is a 2.6s pulse inside the ceremony; the button is `hidden` again after reload; Tier 4 players can never reach it; the reduced-motion CSS fallback is dead code; arrival is not announced.

**Player impact.** Converts the share CTA from ~5 lifetime 2.6-second windows into a permanent, discoverable affordance for anyone who has ever healed. This is the single largest available lift on `shareAttempt`, and it is the metric the whole campaign lives on.

**Exact files to change.**
- `js/gameInit.js` (near the existing bind at :218-250) — on init, read saved tier (`localStorage 'cw.designTier'`, or `designTierSystem.currentTier`) and if `> 0`, set `shareBtn.hidden = false` and seed `dataset.fromTier`/`dataset.toTier` from `Math.max(0, tier-1)` / `tier`. Idempotent, no new storage keys.
- `js/modules/game/healCeremony.js:170-184` — in `showSharePulse`, when `pulse === false`, add a `heal-share-btn--ready` class instead of returning early, so reduced-motion has a real static affordance.
- `css/components.css:1156-1171` — add `#heal-share-button.heal-share-btn--ready:not([hidden]) { outline: 1px solid var(--ky-cyan); }` and rewrite the reduced-motion block to target `--ready` as well as `--pulse`. Bump base `.heal-share-btn` legibility: `font-size: 0.75rem`, `padding: 0.4rem 0.8rem`, min touch target 44×44 via `min-height: 2.75rem` (WCAG 2.2 target size), and keep `white-space: nowrap`.
- `play.html:88-90` — add `aria-live="polite"` on a wrapping `<span>` or add the button's state change to the existing status region; give it a visible `title`/`aria-describedby` explaining it downloads a shareable still with no save data.

**Acceptance test.**
- E2E: advance a tier, **reload the page**, assert `#heal-share-button` is visible and clickable, and that clicking still produces a `SHARE_CAPTURE` log line.
- E2E reduced-motion project: assert `#heal-share-button` has class `heal-share-btn--ready` and a computed non-`none` outline.
- `e2e/a11y-axe.spec.js`: assert target size ≥ 44×44 CSS px for `#heal-share-button` at the 375px viewport.

**Risk if ignored.** We keep measuring a share rate we artificially capped, then conclude "players don't want to share" and kill the best organic loop we have. Also a live accessibility defect: a reduced-motion or SR user cannot discover the feature at all.

---

### Rank 3 — One restore claim, carrying the before-state, in the loudest surface

**Problem (A4, A10).** Three toasts, two brand words, and the `(was v0.0)` before-state relegated to the log. The cause of the heal is never stated.

**Player impact.** The screenshot frame becomes self-explanatory to a stranger with zero context: *what changed, from what, and why*. This is pure copy — the cheapest fix in the review, and the field test already told us copy is what lands.

**Exact files to change.**
- `js/modules/game/designTierSystem.js:301-316` — suppress `showUnlockNotification`'s two toasts when the ceremony will run (the ceremony owns the announcement). Keep the strings, route them to `__appendSystemLog` only. Do not delete them; they are good flavor in the log.
- `js/modules/game/healCeremony.js:117-122` (and the reduced branch at :93-95) — make the toast carry the delta and the cause. Target string: `SYSTEM_RESTORE v1.0 ONLINE — was v0.0 (preserved magic)`. Keep it one line, ≤ 56 chars where possible so it does not wrap on a 375px viewport.
- `js/modules/game/healCeremony.js:39-43` — keep `restoreLine()` as the log line but append a TTH stamp when available: `SYSTEM_RESTORE v1.0 ONLINE (was v0.0) · TTH 4m12s`. Import `getFunnelSnapshot` from `funnelMetrics.js` — local read, no new storage, no network. This turns every community screenshot into a free field datapoint and a brag.
- `js/modules/game/designTierSystem.js` — kill the `SYSTEM_UPDATE` vocabulary in player-visible surfaces; `SYSTEM_RESTORE` is the campaign keyword, use it everywhere.
- `css/components.css` — ensure the heal toast can be visually distinguished (a `heal` notification variant with the cyan border) so the campaign frame is consistent shot-to-shot.

**Acceptance test.**
- Unit: `runHealCeremony({fromTier:0,toTier:1}, { notify: spy })` — assert exactly **one** `notify` call, and that its message matches `/SYSTEM_RESTORE v1\.0 ONLINE/` **and** `/was v0\.0/`.
- E2E: force a tier advance and assert `.notification-container` holds exactly **one** notification during 0-2500ms, and that its `textContent` contains both `v1.0` and `v0.0`.
- Snapshot the log line and assert it matches `/SYSTEM_RESTORE v\d\.0 ONLINE \(was v\d\.0\)/`.

**Risk if ignored.** The most-screenshotted pixel region stays a toast queue with a diluted keyword and no before-state. Everything downstream (community post, OG card, creator seed) inherits the weaker claim.

---

### Rank 4 — Hard-mono Tier 0 (deprivation you can see at 400px) and scope the ceremony filter off `body`

Two fixes, one commit — they touch the same CSS block and Rank 1's reveal is worthless without the first half.

**Problem (A2, A5).** Tier 0 is a tinted theme, not a deprivation. And the ceremony's `filter` on `body` dims the restore toast, reparents fixed overlays, and forces a full-document repaint.

**Player impact.** The 200ms cut in Rank 1 becomes an *unmistakable* grayscale→color restoration, legible on a phone at a glance, and the restore toast stays at full brightness instead of flickering with the page.

**Exact files to change.**
- `css/components.css:1042-1081` — add a scoped desaturation for Tier 0 on **non-fixed containers only**: `body.tier-0 .hud, body.tier-0 .game-area { filter: grayscale(0.92) contrast(1.04); }`. Do **not** put filter on `body`. Add explicit token neutralization for element counters and any `data-element` colored chrome under `body.tier-0`. Keep the cast button as the one non-grayscale focal point (the existing `outline: 1px solid var(--ky-crystal)` intent, hardened) so deprivation never reads as "the game is broken/unplayable."
- `css/critical.css:310` — suppress or fully desaturate the colored CRT gradient overlay under `body.tier-0`.
- `css/components.css:1084-1119` — move every ceremony `filter` from `body.tier-advance-heal` to `body.tier-advance-heal #main-content` (or `.game-area`). Leave `.notification-container` and `body::after` outside the filtered subtree. Keep the outline/box-shadow on `body` (no containing-block effect) — that is the frame, and it is fine where it is.
- `js/modules/game/designTierSystem.js:216-224` (`applyTier` case 0) — align the code-side theme with the CSS: Tier 0 tokens go steel/crystal only, no accent color.
- `js/modules/game/healCapture.js:14` — make the T0 label truthful once the product is actually mono (`'MONOCHROME'` becomes honest rather than aspirational). Fix the hardcoded `'Broken → restored'` footer to a pair-aware string (`'v1.0 → v2.0 chrome'` for high tiers).
- `e2e/mute-clip-stimulus.spec.js` — force hard mono in the stimulus capture (closes audit residual #4) so the field kit and the product agree.

**Acceptance test.**
- E2E pixel: screenshot at `body.tier-0` and after the advance; assert mean saturation of the sampled `.game-area` region increases by ≥ 40% and pixel-diff ≥ 15%.
- E2E containment regression: during the ceremony, assert `getBoundingClientRect()` of `.notification-container` is **identical** at t=100ms, t=800ms, and t=1700ms (no fixed-position jump), and that its computed `filter` is `none`.
- `e2e/visual-a11y.spec.js`: assert Tier 0 body text still meets WCAG AA contrast after desaturation (grayscale can *raise* or *lower* contrast — verify, do not assume).

**Risk if ignored.** Rank 1 ships a reveal with nothing to reveal, the campaign's own art asset keeps promising a deprivation the product does not deliver (click-through gets a worse impression than the ad), and we retain an environment-dependent visual jitter plus a 1.6s full-page repaint in the exact frame we are advertising.

---

### Rank 5 — Real delivery path for the artifact + close the last honesty hole

**Problem (A7).** Download-only is a dead end on mobile; the `visual+text` double branch lets us claim "text copied" when it wasn't.

**Player impact.** The share becomes an actual share on the platform where the audience is, and the player *sees* the artifact before it leaves (which is also what makes them want to post it).

**Exact files to change.**
- `js/modules/game/healShare.js:70-115` — delivery ladder: (1) `navigator.canShare?.({ files })` → `navigator.share({ files: [png], text })`; (2) `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])`; (3) `downloadDataUrl` fallback. Return an explicit `mode: 'native' | 'clipboard-image' | 'download+text' | 'download' | 'text' | 'fail'`. **Delete the duplicate `visual.ok` branch** at :105-113 so `visual+text` is only returned when *both* succeeded.
- `js/modules/game/healCapture.js` — add `canvas.toBlob()` alongside `toDataURL()` (Web Share and ClipboardItem need a Blob; keep the existing data-URL secret scan on the blob path too).
- `js/gameInit.js:232-238` — message must match the actual mode. No "text copied" unless text copied.
- `play.html` / `css/components.css` — inline preview: on success, render the still as a small `<img>` next to the button (or a lightweight existing modal) with the copy `Broken → restored · no save data included`. Reuse `ModalManager`; do not add a component system.

**Acceptance test.**
- Unit: mock `navigator.share` available → assert `mode === 'native'` and download **not** called. Mock share unavailable + clipboard image available → `mode === 'clipboard-image'`. Mock both unavailable, text fails → assert `mode` is `'download'`, never `'visual+text'`.
- E2E: click SHARE_RESTORE, assert a preview `<img>` with non-empty `src` appears and that the notification text matches the returned mode.

**Risk if ignored.** We keep telling players text was copied when it wasn't (the exact defect class a prior review already flagged), and mobile share conversion stays near zero for structural reasons we will misread as disinterest.

---

### Rank 6 — Make the artifact the player's actual run, not a stock drawing

**Problem (A6).** Identical PNG for every player at a tier pair; synthetic panels; no proof-of-play.

**Player impact.** A screenshot that says *this is my run* is the only kind that gets posted. Also stops platforms from deduping our share asset.

**Exact files to change.**
- `js/modules/game/healCapture.js` — read live, non-secret values for the panels: computed `--ky-*` tokens from `getComputedStyle(document.documentElement)` so the still matches the player's real chrome; stamp TTH from `getFunnelSnapshot()` and a short local run id (derive from session start ms — **not** the save, not a UUID we persist). Left panel must render the *actual* `fromTier` chrome, mono once Rank 4 lands.
- Keep `isCaptureSanitized` as the gate and **extend it**: add `tth`, `runLabel` to an explicit allowlist, and add a unit test that any new field must be allowlisted or the capture fails closed.
- `index.html:25,36` + `screenshots/heal-split-still.png` — regenerate the OG still from the updated painter so the landing card matches the product (dims are already correct at 1200×630).

**Acceptance test.**
- Unit: `buildCaptureMeta` output passes `isCaptureSanitized`, and injecting an unexpected key (`ab`, `prestigePoints`, or an unknown `foo`) makes it fail. Assert two captures from different simulated sessions differ in the TTH/run field.
- E2E: capture PNG bytes for two runs with different TTH; assert byte-inequality.

**Risk if ignored.** The share asset stays structurally anti-viral (dedupe) and carries a fabricated screenshot, which is both a growth and an integrity liability.

---

### Rank 7 — Ceremony re-entrancy guard + multi-tier coalescing

**Problem (A9).** Overlapping ceremonies abort each other and can leave a stuck `filter`.

**Player impact.** The biggest heal moment in the game — a double or triple tier jump after offline progress — currently renders as two clipped half-ceremonies or a stuck bright page. Coalescing turns it into the best 1.6s the game has.

**Exact files to change.**
- `js/modules/game/healCeremony.js` — module-scoped `activeCeremony` token. If a ceremony is running when a new advance arrives: cancel pending timers, **coalesce** (keep the *earliest* `fromTier`, take the *latest* `toTier`), restart from `restore_line` rather than re-dimming. Every scheduled callback checks its token before mutating classes. Add an idempotent `resetCeremonyClasses()` used by both cleanup and cancel.
- `js/modules/game/designTierSystem.js:143-158` — when a check unlocks multiple tiers in one tick, emit one advance for the span (or let the ceremony coalesce; pick one, do not do both).

**Acceptance test.**
- Unit with fake clock: start ceremony 0→1, at t=300 start 1→2; run clock to 3000; assert final `line` mentions `v2.0` and `was v0.0`, assert `addBodyClass`/`removeBodyClass` end balanced (no residual `heal-ceremony-*`), and assert `applyChrome` called with final tier exactly once per tier.
- E2E: grant enough AB to cross two gates in one tick; assert `document.body.className` contains no `heal-ceremony-` token 2.5s later.

**Risk if ignored.** A stuck `brightness(1.35)` page is a "this site is broken" bug report, and it will happen most often to returning players (offline catch-up) — our retention cohort.

---

### Rank 8 — Show the cause: goal rail visible during the ceremony

**Problem (A10).** The stranger sees the effect and never the cause; `compile-goal-rail` is hidden pre-tutorial, i.e. during exactly the sessions we record.

**Player impact.** Converts "a system restored" into "playing this restores the system" — the missing half of the pitch, and the likely reason 3/5 field raters were lukewarm on clicking.

**Exact files to change.**
- `js/modules/ui/compileGoalUI.js` + `js/gameInit.js:200-210` — unhide the rail on `hex:tierAdvance` regardless of tutorial state, with a heal-specific line for the ceremony window: `PRESERVED MAGIC → CHROME RESTORED`. Existing `role="status" aria-live="polite"` already on the element (`play.html:81`) carries it to SR users for free.
- `css/components.css:1100-1103` — the rail already gets a cyan highlight during the ceremony; make sure it is legible at the 375px viewport (`max-width: min(28rem, 42vw)` may clamp the string — verify and shorten copy rather than widening the rail).
- `e2e/mute-clip-stimulus.spec.js` — include the rail in the frozen stimulus frames.

**Acceptance test.**
- E2E at 375×812: force an advance pre-tutorial-complete; assert `#compile-goal-rail` is visible, not `aria-hidden`, and its text is not truncated (`scrollWidth <= clientWidth`).

**Risk if ignored.** We keep optimizing comprehension of the *effect* while the *cause* — the reason to install — stays invisible, and our field instrument keeps scoring a Pass on the half that doesn't sell.

---

### Rank 9 — Re-run the field instrument on humans, with the fixed stimulus

**Problem.** `FIELD_MUTE_CLIP.md` limitation is explicit: 5 cold **LLM** judges, not never-players. And the raters scored the *old* stimulus (colorful Tier 0, no before-frame, toast queue). The Pass is therefore not evidence for the shipped visual thesis.

**Player impact.** None directly. This is the honesty gate on every growth decision downstream.

**Exact files to change.**
- `e2e/mute-clip-stimulus.spec.js` — regenerate after Ranks 1/3/4 land (hard mono, gated swap, single toast, visible rail).
- `.scratch/capture-the-heal/FIELD_MUTE_CLIP.md` — add a Pass 2 section: n≥5 **human** never-players, same Q1-Q4 protocol, and record the intent question separately (the 3/5 lukewarm signal must be tracked as its own metric, not buried under the restore-language Pass).
- `.scratch/capture-the-heal/CLAIM_AUDIT.md` — residual #1 stays open until human n≥5; residual #4 closes with Rank 4.

**Acceptance test.** Pass rule unchanged (≥4/5 restore language) **plus** a new explicit gate: ≥3/5 answer yes/probably-yes on "would you open the link." Paid UA stays frozen until both.

**Risk if ignored.** We spend money against a rubber-stamped instrument. LLM raters read text well and cannot report on visual surprise, aesthetic appeal, or intent — the three things the campaign is actually betting on.

---

## 4. Explicit DO NOT DO (kill-list safe)

Every one of these will be proposed by someone in the next 90 days. All are refused.

1. **DO NOT add gacha, loot boxes, or randomized tier rewards.** Kill list. The heal must be *earned and legible*, not rolled — randomness destroys the "the UI is the scoreboard" contract.
2. **DO NOT add a third currency** (no "restore shards," no "chrome credits"). Kill list. AB + prestige is the whole economy; a third currency would move the tier gate off the play loop.
3. **DO NOT add a second/dual quest HUD.** Kill list. `compile-goal-rail` is the one objective surface; Rank 8 makes it visible, it does not clone it.
4. **DO NOT swap or introduce a CSS framework** to "make the heal easier." Kill list. Every fix above is ≤ 30 lines of existing CSS; a framework swap would nuke the tier-0/tier-advance cascade we depend on.
5. **DO NOT rewrite GameState** for tier events. Kill list. `hex:tierAdvance` + `window.__lastTierAdvance` is sufficient; Rank 1 threads one callback, not a new architecture.
6. **DO NOT pursue Steam before D1 is proven.** Kill list. `PIVOT_REBASELINE.md` clock (N=50, ends 2026-08-26) governs.
7. **DO NOT add a server, account, analytics endpoint, or hosted share/gallery.** `funnelMetrics` stays local. The privacy posture is a genuine differentiator and the cheapest trust we own; TTH-in-screenshot (Rank 3) gives us field data without a backend.
8. **DO NOT put `filter` on `body`, `html`, or any ancestor of a fixed element.** It is the root cause of A5 and it will silently break toasts, modals, and the CRT overlay every time someone reaches for it.
9. **DO NOT lengthen the ceremony past ~1.8s** or add a blocking modal / "click to continue" gate. Idle games are background-tab games; a modal at the heal moment converts delight into an interruption and will crater session length.
10. **DO NOT auto-post, auto-open a share dialog, or pre-fill a social composer without an explicit click.** Ranks 2/5 improve the affordance; they never act for the player.
11. **DO NOT add a video/GIF/WebM capture path** (MediaRecorder loop). `FORMAT_DECISION.md` already chose still-first; a recorder is a large surface (codec support, file size, mobile permission prompts) for a marginal gain over a truthful still.
12. **DO NOT make Tier 0 unplayable** in pursuit of deprivation. Grayscale the chrome; keep the cast button, readable text, and WCAG AA contrast. Deprivation must read as *stylistic restraint*, not as a broken build — a stranger who thinks the site is broken does not wait for the heal.
13. **DO NOT fabricate or estimate any funnel number** in docs or share copy. TTA/TTH/shareAttempt are local; if we haven't read a player's snapshot, we don't have a p50. `CLAIM_AUDIT.md` "Live p50 not measured" stays until it is.

---

## 5. Top 3 must-implement now (closest-to-perfect ship polish)

If only three things happen before the next community post, these:

### #1 — Rank 1 + Rank 4 as a single commit: gate the chrome swap **and** hard-mono Tier 0

They are one fix, not two. Gating the swap gives us a before-frame; hard mono makes that frame *worth having*. Shipping either alone wastes the other. Together they turn the campaign's central claim from an assertion into a visible event, and they close audit residuals #2 (weak deprivation) and #4 (mute stimulus mono) in the same pass. Files: `designTierSystem.js`, `healCeremony.js`, `components.css`, `critical.css`, `mute-clip-stimulus.spec.js`. Acceptance: pixel-diff ≥ 15% and saturation delta ≥ 40% across the 200ms cut; `tier-0` still present at t=100ms.

### #2 — Rank 3: one restore claim, carrying `was v0.0`, in the toast

Cheapest fix in this document and the highest confidence, because the field test already proved copy is what the stranger reads. Kill the toast stampede, unify on `SYSTEM_RESTORE`, put the before-state and the cause in the loudest surface, and stamp TTH into the log line so every community screenshot pays us back in field data. Files: `designTierSystem.js`, `healCeremony.js`, `components.css`. Acceptance: exactly one notification in the 0-2500ms window, containing both `v1.0` and `v0.0`.

### #3 — Rank 2: persistent, prominent, announced SHARE_RESTORE

A shipped feature that disappears on reload and is permanently unreachable at Tier 4 is not shipped. This is a ~20-line fix in `gameInit.js` + `components.css` + one dead-CSS-selector repair, and it is the largest available lift on the only conversion metric the campaign has. It also closes a live accessibility defect (no static affordance and no announcement for reduced-motion / SR users). Acceptance: button visible after reload for any player with saved tier > 0; `--ready` outline renders under `prefers-reduced-motion`; 44×44 target at 375px.

**What lost, and why it lost.** Rank 5 (native share ladder) is the fourth-most valuable item and the one I would add if a fourth slot opened — but it is a genuine behavior change with browser-matrix risk, while #1-#3 are contained and pixel-verifiable. Rank 6 (per-run artifact) is strictly downstream of Rank 4: repainting the still before Tier 0 is actually mono would just re-bake the current label lie into a new PNG. Rank 9 (human field re-run) must happen, but running it against the *pre-fix* stimulus would burn the recruit and produce a number we would have to discard — re-run it after #1-#3 land, not before.

---

## Residual ledger after Top 3

| Audit residual | Status after Top 3 |
|---|---|
| #1 field panel was cold LLM, not humans | **still open** → Rank 9, gated before paid UA |
| #2 Tier 0 too colorful | **closed** by Rank 4 |
| #3 SHARE_RESTORE only unhides at ~1000ms | **closed** by Rank 2 (persistent, no longer ceremony-dependent) |
| #4 mute stimulus not hard mono | **closed** by Rank 4 (stimulus regenerated) |
| jsdom lacks real canvas | unchanged; browser e2e remains the gate |
| Live funnel p50 not measured | improved by Rank 3 (TTH visible in screenshots); no fabricated numbers |
