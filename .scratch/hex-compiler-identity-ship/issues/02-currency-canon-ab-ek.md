# 02 — Currency canon (AB / EK only)

**Status:** done

**What to build:** Living player-facing language uses only Arcane Bits (AB) and Eldritch Keys (EK). Kill SE, Spell Energy, Aether Bits, and Arcane Bytes as living names. Glossary matches so agents stop reintroducing drift.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] Player-facing UI and data copy no longer present SE / Spell Energy / Aether Bits / Arcane Bytes as living currency names.
- [ ] CONTEXT glossary defines AB as Arcane Bits and EK as Eldritch Keys.
- [ ] Historical changelog may mention the old SE rename once without reintroducing living SE UI.
- [ ] Ban-list style test or equivalent gate covers the living-name ban.
- [ ] Relevant tests pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
