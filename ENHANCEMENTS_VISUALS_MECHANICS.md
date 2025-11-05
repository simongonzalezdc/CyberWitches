# Visuals and Game Mechanics Enhancements — Implementation Plan

Scope: This plan focuses on visuals/design and game-mechanics polish that increase clarity, feedback, and retention without large refactors. It breaks work into small, verifiable tasks with concrete file touch points and acceptance criteria.

Recommended to implement in this order for fast value: Purchase Insights → AB/s Breakdown → Combo Meter → Calm Mode/Settings → Mobile Cast Bar → Micro‑interactions → Skeleton Loading.

## Feature 1 — Purchase Insights (AB/s delta + ETA to craft)

Goal: Help players make confident decisions by showing “AB/s +Δ” and time to afford/craft the next workstation.

Changes
- `js/gameState.js` (add helpers):
  - `getIngredientProductionPerSecond()` → returns a map `{ [ingId]: ratePerSec }` computed from current workstations and multipliers.
  - `timeToAfford(recipe)` → for a `{ [ingId]: amount }` recipe, compute deficits vs. inventory and divide by production rates; return seconds (Infinity if any required rate is 0 and deficit > 0).
  - `simulateAbpsWithAdditionalWorkstation(wsId, amount = 1, eventMultiplier = 1.0)` → compute AB/s delta if the player crafted `amount` more of `wsId` (use existing `getProductionMultiplier(wsId)` plus producer outputs; only AB output contributes to AB/s).
- `js/game.js`:
  - In `updateWorkstationsTab()` around card render (`js/game.js:499–520`), for each workstation:
    - Call `gameState.simulateAbpsWithAdditionalWorkstation(prodData.id, 1)` and display `+X AB/s` (formatted) on the button or as a small line under “Produces”.
    - Compute `eta = gameState.timeToAfford(recipe)` and show `ETA: <formatted time>`; if Infinity, display `ETA: —`.
  - In `updateInscriptionsTab()` do similar if an upgrade affects AB production (optional if quick).

Acceptance
- For a workstation that produces AB directly, the UI shows a green “+X AB/s”. X increases when multipliers are higher.
- When lacking ingredients, “ETA” displays a reasonable time; if nothing produces a required ingredient, shows “—”.
- No noticeable frame stutter when opening the tab with 50+ items.

Notes
- Do not persist changes; these helpers are deterministic and derived from state.
- Keep formatting via `formatShort`/`formatTimeDuration`.

## Feature 2 — AB/s Modifiers Breakdown

Goal: Make the production system legible by exposing the sources contributing to AB/s.

Changes
- `js/gameState.js` (add helper):
  - `getAbpsBreakdown(eventMultiplier = 1.0)` → returns an object:
    ```js
    {
      baseAbps, // sum of producer base AB outputs at owned counts
      globalUpgradeMult, // product of global upgrade multipliers
      producerSpecificMults: { [wsId]: mult },
      prestigeGlobalMult, // aggregate global prestige multiplier
      prestigeProducerMults: { [wsId]: mult },
      buffsMult, // product of active buffs (1 + m)
      covenMult, // 1.0 if not in coven
      eventMult: eventMultiplier,
      finalAbps // equals gameState.getAbPerSecond(eventMultiplier)
    }
    ```
- `index.html` (HUD region): add a small info icon next to `#abps-display`:
  ```html
  <span id="abps-breakdown-toggle" aria-label="Show AB/s breakdown" title="AB/s breakdown">ⓘ</span>
  <div id="abps-breakdown-panel" class="popover" style="display:none"></div>
  ```
- `styles.css`: add `.popover` styling (positioned near HUD, neon border, max-width ~320px).
- `js/game.js`:
  - On clicking the toggle, build a small HTML list using `getAbpsBreakdown()` and show in the panel; hide on outside click/Escape.

Acceptance
- Clicking the info icon shows a breakdown where multiplying components approximates the shown AB/s (small rounding differences ok).

## Feature 3 — Combo Meter UI

Goal: Surface the existing combo system as a satisfying, readable meter.

Changes
- `index.html` (HUD near Cast):
  ```html
  <div id="combo-meter" aria-label="Combo meter" title="Keep casting to build combo">
    <div id="combo-fill"></div>
    <span id="combo-text"></span>
  </div>
  ```
- `styles.css`:
  - Add `#combo-meter` (compact bar ~140×10px with subtle glow), `#combo-fill` (gradient), `#combo-text` (small caption like “×1.4”).
- `js/game.js` (`initUI()`):
  - On interval (~100ms), read `comboSystem.getComboMultiplier()` and update fill percentage and text. Hide when at ×1.0.
  - On milestone thresholds (e.g., ×1.25, ×1.5, ×2), pulse the meter and play a light particle using `createParticle` with a cool color.

Acceptance
- Casting increases meter fill and multiplier text; it gently decays when idle.

## Feature 4 — Calm Mode and Settings

Goal: Let players tone down visual intensity and improve performance on low-end devices.

Changes
- `index.html` (HUD right side): add a settings button `id="settings-button"` and a modal `id="settings-modal"` with checkboxes:
  - “Calm Mode (reduced glow/blur)”
  - “Particles” (on/off)
  - “Screen shake” (on/off)
  - “Animation intensity” (range: Low/Med/High)
- `styles.css`:
  - `.modal` rules already exist; add simple layout for settings list.
  - Add a `body.calm-mode` variant that reduces:
    - Backdrop blurs and heavy glows (replace with flat translucent backgrounds),
    - Particle opacities (lower alpha) and text-shadow strengths.
- `js/game.js`:
  - Persist settings in `localStorage` under `cw.settings`.
  - Toggle `document.body.classList.toggle('calm-mode', enabled)`.
  - Expose a global `window.cwSettings` for other modules.
- `js/animations.js`:
  - Before animating, read `window.cwSettings` to early-return or use shorter durations when Calm Mode or reduced intensity is set.

Acceptance
- Toggling Calm Mode immediately reduces glow/blur. Particles and shakes respect settings.

## Feature 5 — Mobile Cast Bar (Reachability)

Goal: Improve ergonomics on phones by making Cast always reachable.

Changes
- `styles.css` (media query `max-width: 768px`):
  - Position `.cast-button` fixed at bottom center with safe-area paddings; ensure z-index > HUD.
  - Add top/bottom padding to main content to avoid overlap.

Acceptance
- On mobile widths, the Cast button floats at the bottom and is easy to tap.

## Feature 6 — Micro‑interactions for Affordability & AB/s Gain

Goal: Reinforce decisions with subtle, non-blocking feedback.

Changes
- `js/game.js` in `updateWorkstationsTab()`:
  - Track `canAfford` state for each item; if it flips from false→true in this render, call `highlightElement(card, '#3CE3C544')` and `pulseElement(card, 1.03, 180)`.
  - When AB/s increases (you already glow `#abps-display` on change), extend the glow slightly when delta > 10%.

Acceptance
- Newly affordable items visually “wake up”; AB/s upticks feel more rewarding without being noisy.

## Feature 7 — Skeleton Loading for Lists

Goal: Smooth perception during heavy updates / virtual scroll.

Changes
- `styles.css`:
  - Add `.skeleton` class (animated shimmer) and variants for card blocks.
- `js/game.js`:
  - In list update functions (`updateWorkstationsTab`, etc.), add `container.classList.add('loading')` before computation and remove after DOM commit. Render a few `.card.skeleton` placeholders when loading.

Acceptance
- During heavy recalculations, the list shows skeletons briefly rather than flashing empty.

## Feature 8 — Audio Feedback & Controls

Goal: Add satisfying, restrained audio feedback for key actions with player control. Integrate with the existing `audioSystem` and respect mobile/autoplay constraints.

Event Map → Sound IDs
- Cast spell (button press, auto-cast): `cast` (throttled; max 1 every 120ms).
- Purchase workstation/upgrade (success): `purchase`.
- Achievement unlocked: `achievement`.
- Prestige ascend (on confirm): `level_up`.
- Coven ritual complete: `ritual_complete`.
- Info notification toast: `notification` (optional, low volume).
- Error toast or validation failure: `error`.

Changes
- `js/game.js`:
  - Import `audioSystem` at top: `import { audioSystem } from './audioSystem.js';`
  - In `initUI()` cast handler, call `audioSystem.playSound('cast')` with a simple throttle:
    - Keep `let lastCastSfx = 0;` in closure; if `performance.now() - lastCastSfx < 120` skip; else play and update timestamp.
  - After successful workstation craft or upgrade purchase (where current code handles state), play `purchase`.
  - When achievements detected in the periodic check, play `achievement` for each newly unlocked item (ensure not spammy; dedupe per tick).
  - On prestige confirm (`#ascend-button` click), play `level_up`.
  - When a coven ritual completes (via `covenSystem.onRitualCompleted`), play `ritual_complete`.
  - When showing notifications via `showNotification(type)`, choose `notification` for info/success and `error` for errors.
  - On the first user interaction (e.g., first Cast or any button click), call `audioSystem.unlockAudio()` to satisfy mobile autoplay policies.
- Settings integration (extend Feature 4 modal):
  - Add: Mute toggle, SFX volume slider (0–1 in 0.05 steps), and Master volume slider.
  - Wire to `audioSystem.toggleMute()`, `audioSystem.setSfxVolume(v)`, `audioSystem.setMasterVolume(v)` and persist alongside existing settings. Reflect current values on open using `audioSystem.getStats()`.
- `js/accessibility.js` (optional):
  - If a screen reader is active, consider defaulting to muted or lowering SFX volume to avoid interference.

Acceptance
- Audio never plays before a user gesture on mobile; after first tap, sounds play.
- Casting produces a soft, non-fatiguing sound even during rapid tapping due to throttling.
- Purchases, achievements, prestige, and coven ritual completion have distinct audible cues.
- Mute and volume sliders update live and persist across reloads.
- No console errors when audio is unsupported; system degrades gracefully.

Notes
- The `audioSystem` already provides default synthesized SFX (`js/audioSystem.js`). If you add custom files later, use `audioSystem.loadSound({ id, name, url, volume })` during bootstrap.
- Respect Calm Mode: if `window.cwSettings?.calmMode` is true, reduce default SFX volume by ~30% when calling `playSound` (pass `options.volume`).

---

## File Touch Points Summary

- `index.html`:
  - HUD additions: AB/s breakdown toggle + popover, combo meter, settings button + modal.
- `styles.css`:
  - Popover styling, combo meter, calm-mode overrides, mobile cast bar media query, skeleton classes.
- `js/gameState.js` (new helpers):
  - `getIngredientProductionPerSecond()`
  - `timeToAfford(recipe)`
  - `simulateAbpsWithAdditionalWorkstation(wsId, amount = 1, eventMultiplier = 1.0)`
  - `getAbpsBreakdown(eventMultiplier = 1.0)`
- `js/game.js`:
  - Render changes in `updateWorkstationsTab()` and `updateInscriptionsTab()` to show AB/s delta and ETA, micro‑interaction triggers.
  - HUD handlers for breakdown popover and combo meter updates.
- `js/animations.js`:
  - Respect `window.cwSettings` in animation functions (intensity and early exits).

## Implementation Notes & Pseudocode

gameState helpers (js/gameState.js)
```js
getIngredientProductionPerSecond() {
  const rates = {};
  for (const wsId in this.workstations) {
    const owned = this.workstations[wsId];
    if (!owned) continue;
    const prodData = PRODUCERS.find(p => p.id === wsId);
    if (!prodData) continue;
    const mult = this.getProductionMultiplier(wsId);
    for (const outputId in prodData.outputs) {
      const rate = prodData.outputs[outputId] * mult * owned;
      rates[outputId] = (rates[outputId] || 0) + rate;
    }
  }
  return rates;
}

timeToAfford(recipe) {
  const rates = this.getIngredientProductionPerSecond();
  let worst = 0;
  for (const ingId in recipe) {
    const need = recipe[ingId];
    const have = this.inventory[ingId] || 0;
    const deficit = Math.max(0, need - have);
    if (deficit <= 0) continue;
    const rate = rates[ingId] || 0;
    if (rate <= 0) return Infinity;
    worst = Math.max(worst, deficit / rate);
  }
  return worst; // seconds
}

simulateAbpsWithAdditionalWorkstation(wsId, amount = 1, eventMultiplier = 1.0) {
  const base = this.getAbPerSecond(eventMultiplier);
  const owned = (this.workstations[wsId] || 0) + amount;
  const prodData = PRODUCERS.find(p => p.id === wsId);
  if (!prodData) return 0;
  const mult = this.getProductionMultiplier(wsId) * eventMultiplier;
  const added = (prodData.outputs.ab || 0) * mult * amount; // only AB contributes to AB/s
  return added;
}

getAbpsBreakdown(eventMultiplier = 1.0) { /* compute components as described above */ }
```

Workstation UI (js/game.js)
```js
// Inside loop rendering each workstation card
const abpsDelta = gameState.simulateAbpsWithAdditionalWorkstation(prodData.id, 1);
const etaSec = gameState.timeToAfford(recipe);
const etaText = (etaSec === Infinity) ? '—' : formatTimeDuration(etaSec);

// In the card HTML, add:
// <div class="card-section"><div class="card-label">Impact:</div>
// <div class="card-value">+{formatPrecise(abpsDelta,2)} AB/s · ETA: {etaText}</div></div>
```

Combo Meter (js/game.js)
```js
setInterval(() => {
  const mult = comboSystem.getComboMultiplier();
  const pct = Math.min(1, (mult - 1) / (2 - 1)); // assume cap ×2 for fill, adjust if needed
  fill.style.width = `${pct * 100}%`;
  text.textContent = mult > 1.0 ? `×${formatPrecise(mult, 2)}` : '';
  meter.style.display = mult > 1.0 ? 'flex' : 'none';
}, 100);
```

Settings consumption (js/animations.js)
```js
const s = (window.cwSettings || {});
if (s.calmMode) { /* reduce durations or early-return for heavy effects */ }
if (s.disableParticles) return;
```

## Testing Checklist

- Purchase Insights
  - Shows `+AB/s` for AB-producing workstations; ETA reflects deficits correctly.
  - No console errors when switching tabs; performance remains smooth.
- AB/s Breakdown
  - Info popover opens/closes; values are plausible and roughly multiply to current AB/s.
- Combo Meter
  - Casting increases meter; decay when idle; milestones pulse.
- Settings / Calm Mode
  - Toggles persist across reload; particles/shake/blur respond immediately.
- Mobile Cast Bar
  - On narrow viewport, Cast button fixed at bottom without overlapping content.
- Micro‑interactions & Skeletons
  - Newly affordable items pulse/highlight; list shows skeletons during heavy recompute.

## Out of Scope for This Plan

- Analytics consent changes, service worker cache fixes, and other infra items are tracked separately.
