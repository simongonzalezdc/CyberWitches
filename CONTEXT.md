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

## Architecture seams

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
- **GameState** (`js/gameState.js`) — the live game model + tick loop. Still
  large; the save integrity logic was lifted into the save codec.
- **Entry point** — `js/game.js` bootstraps on `DOMContentLoaded` and calls
  `initGame()` from `js/gameInit.js`. esbuild bundles from `js/game.js`.

## Persistence ownership

- **Primary save store:** `localStorage` (hot path for encode/decode of the save snapshot).
- **Mirror:** IndexedDB via `js/save/indexedDBBackup.js` for eviction resistance / restore-missing.
- See `docs/adr/0002-save-store-primary.md`.
