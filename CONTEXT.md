# CONTEXT

Domain language and architecture seams for Hex Compiler. Keep this current as
modules deepen; it is the map AI agents and new contributors read first.

## Domain vocabulary

- **AB (Arcane Bits / "Essence")** — the primary currency. You generate it by
  *casting*.
- **Cast** — the core action: compile raw magic into data, producing AB
  (the EXEC button, `cast-button`).
- **Workstation / Producer** — a preservation chamber that passively produces
  AB or ingredients over time.
- **Ingredient** — a resource produced/consumed by recipes.
- **Recipe / Crafting** — combine ingredients to craft workstations/potions.
- **Prestige / Ascend** — reset progress for permanent **prestige bonuses** and
  an **element specialization** (fire/water/air/crystal).
- **Milestone** — an AB threshold that grants a one-time reward.
- **Meditation** — a sub-game where **towers** defend **Tranquility** against
  **Distractions**.
- **Save snapshot** — the plain serializable object capturing all of the above
  at a point in time (currency, inventory, workstations, upgrades, prestige,
  experiments, stats, milestones, element specialization, version, timestamp).
- **Design tier / heal** — progressive UI restoration (Tier 0 broken mono →
  Tier 4 full chrome). A tier advance is a **SYSTEM_RESTORE** moment, not only
  a cosmetics unlock.
- **Compile goal** — single primary post-tutorial objective (goal rail), not a
  second quest HUD.
- **SHARE_RESTORE** — player action that exports a **sanitized** heal share
  (split still + text). Never embeds the full save.
- **TTA / TTH** — local-only funnel: time to first Fire Forge craft; time to
  first real `hex:tierAdvance`. Keys under `cw.funnel.*` (localStorage /
  sessionStorage). No remote analytics.
- **Restoration Kernel** — pure domain package `js/kernel/`: `reduce` /
  `createKernel` dispatch for `cast`, `tick` (production+fade), `craft`
  (pipeline modules), prestige preview/commit, chapter/tier checks, meditation
  mastery. **Live sole paths:** cast resources + soft fade via
  `castOnGameState` / `fadeOnGameState` (adapter). Live craft graph remains
  `PRODUCERS` (`ws_*`) with **pipeline roles** for HUD/cards.
- **Pipeline roles** — Capture | Store | Bind | Compile | Shield
  (`pipelineRoles.js`, `PipelineHudUI`, role badges on workstation cards).
- **Affinity** — pre-prestige foreshadow; post-prestige specialization strategies
  (`affinity.js` / `SPECIALIZATION_STRATEGIES`).
- **Soft fade** — unstored stock over storage cap bleeds (early game soft;
  offline catch-up also fades). Cap is in **weighted void-pressure units**
  (`FADE_WEIGHT` in `js/kernel/fade.js`): raw essence = 1.0; denser craft
  intermediates lower (still > 0). No produced intermediate is immortal.
- **Aesthetic v2** — hex lattice terminal surface (`css/aesthetic-v2.css`);
  tier-0 monochrome path remains strict mono.

## Architecture seams

- **Restoration Kernel** (`js/kernel/`) — pure transitions + content schema
  (`validate:kernel-content`, `typecheck:kernel`). Adapter bridges GameState.
  Projectors: pipeline / contract / affinity HUD view-models. Guides + claim-audit:
  `guides/restoration-kernel/` (includes adversarial GD review + quality bar).
- **Save codec** (`js/save/saveCodec.js`) — owns the integrity + migration core
  of persistence as pure functions over a *save snapshot*. GameState depends on
  just two: `encode(snapshot) -> string` and `decode(rawString) -> { outcome,
  snapshot? }`, where `outcome ∈ {loaded, checksum_recalculated, parse_error,
  migration_failed, invalid}`. The codec never touches game instance state or
  localStorage; the granular functions (`validateSaveData`, `calculateChecksum`,
  `verifyChecksum`, `migrateSaveData`, `compressSaveDataObject`, `sortObjectKeys`)
  are its implementation and its test surface. GameState keeps the snapshot
  build/apply (its own field knowledge) and the localStorage I/O + corruption
  backups (a future **Save store** seam).
- **Notifier** (`js/ui/notifier.js`) — the port game-logic modules emit
  player-facing notifications through: `notify(message, type, duration)`. The
  notification renderer (`js/modules/ui/notifications.js`) is the production
  adapter; tests inject a recording fake. Modules take `notify` as an injected
  constructor dependency (default = the real port) so they no longer hold the
  whole UIManager just to notify. `TutorialSystem` is fully on this seam.
- **Audio access** (`js/audio/audioAccess.js`) — `getAudioSystem()` /
  `setAudioSystem()`. Managers are built before the AudioSystem exists (gameInit
  wires it late), so they used to reach `uiManager.systems.audioSystem ||
  window.audioSystem` (a service-locator read + a dead `window` fallback). They
  now ask this accessor; gameInit registers the instance once built.
  `accessibilityManager` is a module singleton, so cast/etc. import it directly.
  REMAINING: the game modules still use UIManager as a **UI-update bus**
  (`uiManager.hudUI.update()`, `.boonsUI.update()`, `.floatingTextUI.show()`) and
  meditationManager still wires its sub-UI through it. That bus is the deeper
  untangle left for a coverage-first follow-up.
- **GameState** (`js/gameState.js`) — the live game model + tick loop. Cast
  resources and soft fade go through Kernel adapter; production tick still uses
  `PRODUCERS` + multipliers (incl. Kernel-written `productionMult` from Meditation).
  Save includes optional `kernel` mirror (affinity, chapters, storageCap, rngSeed).
  Still large; save integrity logic was lifted into the save codec.
- **Entry point** — `js/game.js` bootstraps on `DOMContentLoaded` and calls
  `initGame()` from `js/gameInit.js`. esbuild bundles from `js/game.js`.
- **Heal capture (Capture the heal campaign, PR #20)** — thin modules on the
  tier-advance bus; no GameState rewrite:
  - `js/modules/game/designTierSystem.js` — emits `hex:tierAdvance`, runs ceremony
  - `js/modules/game/healCeremony.js` — 1.2–1.8s mute-first timeline; reduced-motion
  - `js/modules/game/healCapture.js` — sanitized split still (tier chrome only)
  - `js/modules/game/healShare.js` — SHARE_RESTORE: PNG download + text clipboard
  - `js/modules/game/funnelMetrics.js` — local TTA/TTH/shareAttempt counters
  - `js/modules/game/compileGoalStack.js` + `compileGoalUI.js` — primary goal rail
- **Notifications** — `NotificationManager` hard-caps **2** visible toasts
  (`maxVisible`) so achievement bursts do not bury the workstation board.
- **Planning / claim-audit artifacts** —
  - Kernel (current): `guides/restoration-kernel/` (CLAIM_AUDIT, QUALITY_*, GOAL)
  - Capture the heal (historical campaign): `.scratch/capture-the-heal/`
  - Overhaul tickets/PRD: `.scratch/full-overhaul/`

## Persistence ownership

- **Primary save store:** `localStorage` (hot path for encode/decode of the save snapshot).
- **Mirror:** IndexedDB via `js/save/indexedDBBackup.js` for eviction resistance / restore-missing.
- See `docs/adr/0002-save-store-primary.md`.
