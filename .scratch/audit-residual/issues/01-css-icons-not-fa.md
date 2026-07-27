# 01 — Replace Font Awesome shells with Kyanite CSS icons

**Status:** done

**What to build:** Play path must not inject `fas fa-*` classes when Font Awesome is not loaded. Use existing `css-icon-*` system so bonuses/icons are visible.

**Blocked by:** None — can start immediately.

## Acceptance criteria
- [ ] No `fas fa-` / `fa-bolt` in play-path UI modules that render live HUD/workstations
- [ ] Equivalent visual via `css-icon-*` or text label
- [ ] Unit/source ban or visual contract test
- [ ] Tests pass

## Comments

- Implemented 2026-07-27; verified via tests/unit/auditResidual.test.js

