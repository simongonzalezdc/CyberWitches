# 11 — gameState expand–contract slice

**What to build:** Extract one pure vertical from GameState (buffs, production mult inputs, or potion table) with tests; GameState delegates; behavior unchanged.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] New module owns one bounded domain with unit tests
- [x] GameState call sites for that domain shrink
- [x] Existing behavior preserved (suite green + new pure tests)
- [x] Not a full GameState rewrite
