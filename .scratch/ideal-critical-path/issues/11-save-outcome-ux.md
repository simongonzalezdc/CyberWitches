# 11 — Save outcome UX closeout

**What to build:** Every important save decode outcome (repair, invalid, migration fail, restore-from-mirror) is player-visible—never a silent wipe or silent heal.

**Blocked by:** None — can start immediately (Lane Loop).

**Status:** ready-for-agent

- [ ] parse/invalid/migration/checksum-style outcomes have player-visible messaging where product already intends recovery
- [ ] IDB restore success/fail remains visible if those paths run
- [ ] No silent full reset without notice
