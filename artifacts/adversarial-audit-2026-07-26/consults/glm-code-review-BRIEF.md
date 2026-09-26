# Code review request — Hex Compiler identity-ship PR

You are a ruthless senior code reviewer (GLM). Review this PR branch.

## Context
- Repo: CyberWitches / Hex Compiler (vanilla JS idle game)
- Branch: feat/identity-ship-player-truth
- Base: origin/main
- PR: https://git.kyanitelabs.tech/simon/CyberWitches/pulls/6
- Spec: .scratch/hex-compiler-identity-ship/spec.md

## Intent
Lock product identity and fix player-facing truth:
- Full resource counters + Tier 0 first paint + design-system version attrs
- Arcane Bits (AB) / Eldritch Keys (EK) currency canon
- Safe notifications (text default)
- Mobile tooltips don't kill clicks
- Meditation stats save/load + stuck position delta
- TutorialSystem compile goal
- Critical-compile cast feedback (was dead jackpot hook)
- GAME_MANUAL live rewrite
- Landing media
- Contract tests

## Your job
1. Read the full diff in /tmp/glm-review/diff.patch and any needed files in the cwd.
2. Produce a structured code review with:
   - **Verdict**: APPROVE / APPROVE_WITH_NITS / REQUEST_CHANGES
   - **Critical** (must fix before merge)
   - **Major** (should fix soon)
   - **Minor** (nits)
   - **Tests**: adequacy of sessionShipMust + elementCounters
   - **Security**: XSS sink, secrets, anything else
   - **Correctness risks**: especially meditation stuck, notification queue drain recursion, tier boot, bonus feedback
   - **What's good**
3. Cite file + approximate line/hunk evidence. No fluff.
4. Write the full review to:
   `/Users/simongonzalezdecruz/workspaces/CyberWitches/artifacts/adversarial-audit-2026-07-26/consults/glm-code-review-identity-ship.md`

Do NOT implement fixes. Review only.
