# 04 — Boot / story overlay e2e stability

**What to build:** Share a single reliable dismiss/wait strategy for boot screen and story intro so e2e and visual harnesses do not see a permanent black frame or flake.

**Blocked by:** 02 — First-session → Tier 1 e2e gate (preferred; may start in parallel if dismiss helper is shared carefully)

**Status:** done

- [x] Shared dismiss or wait helper used by tier e2e (ticket 02) and other smoke
- [x] Stuck boot past timeout fails the test with a clear assertion
- [x] Does not require manual intervention in CI
