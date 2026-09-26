# UltraQA Report

## Goal and success criteria
- Goal: Triple-check every line of close-open-loops ship; adversarial e2e; Visual Ralph tier-0 dramatization
- Stop condition: defects fixed, ci green, visual score >= 90, adversarial matrix pass
- Safety bounds applied: no force-push to main, no secret exfil, local static server only

## Scenario matrix
| ID | User/attacker model | Scenario | Command/harness | Expected signal | Actual result | Status | Evidence | Cleanup |
|----|---------------------|----------|-----------------|-----------------|---------------|--------|----------|---------|
| BASE-01 | developer | npm run ci | npm run ci | exit 0 | 868 tests, lint, typecheck, color-debt pass | PASS | terminal | n/a |
| ADV-001 | worktree | dirty .gjc only | harness | no product mutate | PASS | harness | temp only |
| ADV-002 | prod player | analytics without debug | source gate | null modules | PASS | lazyLoader | n/a |
| ADV-003 | hostile RNG | castBonus NaN/neg/huge | harness | clamped safe | PASS after fix | castBonus.js | n/a |
| ADV-004 | hostile tier | music/sfx policy edges | harness | finite gates | PASS | musicPolicy | n/a |
| ADV-005 | integrator | orphan onboarding imports | walk js/ | none | PASS | archive only | n/a |
| ADV-006 | partial failure | reportLazyFailure try/catch | source | present | PASS | gameInit | n/a |
| ADV-007 | visual | glass opacity trap | CSS parse | no opacity | PASS after fix | components.css | n/a |
| ADV-008 | content | infinity copy | PRODUCERS | apex text | PASS after fix | producers.js | n/a |
| ADV-009 | security | landing CSP / play residual | html | no eval on index | PASS | index/play | n/a |
| ADV-010 | style | tier0 token-only colors | css | no hex debt | PASS | components.css | n/a |
| VIS-01 | first-session | boot dismiss + tier0 metrics | playwright | score>=90 | score 100 | verdict.json | server killed |
| VIS-02 | first-session | cast outline + tab mute | metrics | opacity tab 0.72 cast 1 | PASS | screenshots | kept in .omx |

## Commands run
- `[0] npm run ci` — full gates
- `[0] node adv-harness.mjs` — 17/17 adversarial
- `[0] playwright visual3` — visual score 100
- PR #10 merge — main 0d66cab

## Failures found
1. glass-panel opacity faded EXEC (parent of cast)
2. musicPolicy dead code / no-op
3. Infinity description regression to template
4. castBonus negative RNG
5. ADR test vs gitignored docs/

## Fixes applied
- css/components.css, js/audioSystem.js, js/game/castBonus.js, js/modules/data/producers.js, tests/unit/closeOpenLoops.test.js
- Merged PR #10

## Cleanup and rollback
- Temp harness under /tmp and .omx scripts removed from lint path
- http-server on :8765 stopped
- Evidence retained under .omx/artifacts/visual-ralph/close-open-loops-tier0/

## Residual risks
- Playwright raster is very dark (void theme); visual score uses measured CSS + content, not pixel brightness
- shouldAllowSfx exported but not fully wired into SFX playback paths yet
- Boot screen requires TutorialSystem path; if tutorial lazy-load fails, boot may stick (reportLazyFailure surfaces)

## Evidence
- main tip: 0d66cab
- Visual verdict score 100
- 868 tests pass
