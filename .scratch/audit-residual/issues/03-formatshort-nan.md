# 03 — formatShort never shows NaN

**Status:** done

**What to build:** formatShort (and related formatters used by HUD) handle NaN/Infinity/undefined without printing "NaN" to the player.

**Blocked by:** None — can start immediately.

## Acceptance criteria
- [ ] formatShort(NaN), formatShort(Infinity), formatShort(undefined) return a safe string (e.g. "0" or "—")
- [ ] Unit tests cover those cases
- [ ] Tests pass

## Comments

- Implemented 2026-07-27; verified via tests/unit/auditResidual.test.js

