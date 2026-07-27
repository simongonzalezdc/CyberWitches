# 10 — Ship gate green

**Status:** done

**What to build:** After Must tickets land, run full quality gates and fix regressions. Report Must / Should / Niceto honestly. Do not claim token rotation or deploy without evidence.

**Blocked by:** 01 — Boot resource truth + Tier 0 shell; 02 — Currency canon (AB / EK only); 03 — Safe notifications; 04 — Mobile tooltips that don’t kill clicks; 05 — Meditation integrity; 06 — First-session compile goal (TutorialSystem); 07 — Critical-compile cast feedback; 08 — Live game manual  
(09 — Landing media is optional for this gate)

## Acceptance criteria

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] Unit suite passes (`npm test` / project standard run-in-band form).
- [ ] `npm run build:prod` passes within budget if budget checks exist.
- [ ] Must seams S1–S8 from the parent spec are green or explicitly listed as remaining with evidence.
- [ ] Should/Niceto leftovers reported without false “complete” claims.
- [ ] No secrets committed; no PAT printed.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
