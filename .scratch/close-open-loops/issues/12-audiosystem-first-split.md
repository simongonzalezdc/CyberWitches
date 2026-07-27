# 12 — audioSystem first deep split

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

ARCH-02 first slice: extract one deep module from `audioSystem.js` (e.g. music tier monitor OR sfx play routing OR fade helpers) with a stable interface, tests, and gameInit wiring unchanged from outside. Expand–contract; do not rewrite all 3900 lines.

## Acceptance criteria

- [ ] New module owns one bounded domain with tests
- [ ] audioSystem delegates to it
- [ ] Prod build size not exploded; audio still initializes
- [ ] LOC of audioSystem reduced measurably
