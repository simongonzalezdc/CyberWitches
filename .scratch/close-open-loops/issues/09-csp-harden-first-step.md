# 09 — CSP harden plan + first shippable step

**Status:** done  
**Type:** research + task  
**Blocked by:** None — can start immediately (research first).

## What to build

SEC-02: Research what blocks dropping `unsafe-eval` / reducing `unsafe-inline` (Tone, inline boot). Ship the largest safe CSP tightening that doesn’t break play, plus a written residual risk note.

## Acceptance criteria

- [ ] Short research note in ticket Answer: blockers for nonce CSP
- [ ] At least one CSP tightening shipped OR explicit “blocked by X” with evidence
- [ ] play.html boots and cast works under new CSP
- [ ] Tests / manual smoke noted
