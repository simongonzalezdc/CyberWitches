# 07 — Critical-compile cast feedback

**Status:** done

**What to build:** Rare cast bonuses use diegetic critical-compile / overclock framing (not casino jackpot). Feedback is player-visible when a bonus fires (wire or replace the dead feedback hook). No player-facing “jackpot” on the cast bonus path.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] Cast bonus types use diegetic identifiers (e.g. critical_compile / compile_overclock), not jackpot as the living type.
- [ ] Player-visible feedback runs when a bonus fires (floating text and/or notify).
- [ ] No player-facing “jackpot” copy on the cast bonus path.
- [ ] Test asserts feedback copy / type contract.
- [ ] Relevant tests pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
