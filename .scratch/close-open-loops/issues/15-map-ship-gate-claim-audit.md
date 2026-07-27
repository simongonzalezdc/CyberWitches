# 15 — Map ship-gate + claim-audit

**Status:** done  
**Type:** task  
**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 10, 11, 14

## What to build

Verify Must tickets 01–07, 10–11, 14 with claim-audit style evidence: run ci, list files, confirm no open Must ticket remains. Write `artifacts/close-open-loops/CLAIM_AUDIT.md` mapping each Must ticket → evidence. Should tickets 08/09/12/13 may be incomplete with honest residual list.

## Acceptance criteria

- [ ] CLAIM_AUDIT.md exists with Must 01–07,10–11,14 all evidenced
- [ ] `npm run lint && typecheck && test && lint:color-debt` green (or documented exception)
- [ ] Map Decisions so far updated; open Must tickets closed
