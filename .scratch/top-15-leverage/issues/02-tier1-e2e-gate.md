# 02 — First-session → Tier 1 e2e gate

**What to build:** A fresh-player automated path proves design-tier chrome can leave Tier 0 when AB and achievement criteria are met. CI fails if the achievements wiring regresses again.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Automated e2e or harness asserts design tier advances under stated criteria
- [x] Uses the real achievements system path (wrong key / missing bridge must fail the test)
- [x] Isolated/fresh storage so prior saves do not mask the bug
- [x] Boot or story overlays are dismissed or waited out without flake
- [x] CI (or documented e2e job) green with this test included
