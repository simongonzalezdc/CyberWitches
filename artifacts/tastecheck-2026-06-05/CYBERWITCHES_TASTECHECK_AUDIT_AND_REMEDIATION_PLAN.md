# CyberWitches Tastecheck + CheckYourself Audit

Generated: 2026-06-05 23:25 America/Los_Angeles

## BLUF

Do not ship this as a public mobile-facing demo yet.

The game builds and the core browser smoke tests pass, but the visual/UI layer has serious launch blockers:

- First-run story content is taller than the viewport; the primary button is below the visible/clickable area on mobile.
- Mobile and narrow screenshots are effectively black/unreadable.
- The app says "plain CSS", but the markup still relies heavily on Tailwind utility classes and `styles/theme.css` still contains raw `@theme` / `@apply` syntax that is not compiled in the browser.
- The a11y auditor found 25-33 measurable failures per viewport, mostly contrast and tiny tap targets.

Proposed ship posture: **P1 blocked for launch**, no P0 security blocker found.

## Skills / Frameworks Applied

| Skill | Result |
|---|---|
| `design-taste-frontend` | Applied to typography, palette, layout, motion, states, mobile collapse, and "AI tell" checks. |
| `high-end-visual-design` | Applied to premium visual coherence, materiality, motion, and layout bar. |
| `deslop-ui` | Applied to detect template tells: inert Tailwind utilities, glow/purple overload, emoji/symbol leakage, generic PWA copy. |
| `web-design-guidelines` | Fresh guidelines fetched from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` and applied to HTML/CSS/JS. |
| `a11y-pass` | Injected runnable auditor into live page across desktop/tablet/mobile/320px. |
| `cognitive-a11y` | Applied to onboarding, all-caps terminal labels, walls of story copy, and sensory load. |
| `responsive-layout` | Applied to viewport, mobile, zoom/reflow, and selector drift checks. |
| `assess-graphical-excellence` | Not applicable: no data chart/visualization surface in current UI. |
| `design-review-flow` | Screenshots captured before fixes. |
| `checkyourself` | Ran CheckYourself CLI context scan and used its coverage matrix, scoring method, and report structure. |

## Evidence

### Commands Run

| Command | Result |
|---|---|
| `git status --short --branch` | `## main...origin/main`; audit generated `artifacts/`. |
| `npm run lint` | Passed with 0 errors, 378 warnings. |
| `npm test -- --runInBand` | Passed: 32 suites, 842 tests. |
| `npm run typecheck` | Passed. |
| `npm run build:prod` | Passed; `dist/js/game.bundle.js` 295.44 KB. |
| `npm run test:e2e` | Initially blocked by missing Playwright browser; after `npx playwright install chromium`, passed 4/4. |
| `npm audit --audit-level=high` | Passed: 0 vulnerabilities. |
| `gitleaks dir . --no-banner --redact` | Passed: no leaks found. |
| `python3 tools/checkyourself.py scan /Users/simongonzalezdecruz/workspaces/archive/personal/CyberWitches` | Wrote CheckYourself context; deterministic scan found 0 built-in findings, not a clean bill of health. |

### Runtime Artifacts

| Artifact | Path |
|---|---|
| Desktop first-run screenshot | `artifacts/tastecheck-2026-06-05/screenshots/desktop-first-run.png` |
| Desktop main screenshot | `artifacts/tastecheck-2026-06-05/screenshots/desktop-main-skip-story.png` |
| Tablet main screenshot | `artifacts/tastecheck-2026-06-05/screenshots/tablet-main-skip-story.png` |
| Mobile main screenshot | `artifacts/tastecheck-2026-06-05/screenshots/mobile-main-skip-story.png` |
| 320px main screenshot | `artifacts/tastecheck-2026-06-05/screenshots/narrow320-main-skip-story.png` |
| Runtime audit JSON | `artifacts/tastecheck-2026-06-05/runtime/runtime-audit.json` |
| CheckYourself generated context | `/Users/simongonzalezdecruz/workspaces/checkyourself/CHECKYOURSELF_PROJECT_CONTEXT.generated.md` |

## Detected Stack

| Area | Detected technology | Evidence | Confidence |
|---|---|---|---|
| Frontend | Static vanilla JS game, ES modules, plain CSS | `index.html`, `package.json`, `README.md` | High |
| Backend | None in app runtime | no API/server routes, static `http-server` scripts | High |
| Database | Browser localStorage + IndexedDB mirror | `js/save/indexedDBBackup.js`, `gameState.js` | High |
| Auth | None | no auth/session code | High |
| Hosting/deployment | Static PWA, deployment target not configured | `.github/workflows/deploy.yml` exits with no target | High |
| Testing | Jest, TypeScript checkJs, Playwright e2e, ESLint | `package.json`, CI workflow | High |
| AI/RAG/agents | Not app feature; repo has agent-law docs/workflow | `AGENTS.md`, `.github/workflows/agent-law.yml` | High |

## Production Reality Score

**Score: 74 / 100**  
**Confidence: Medium-high**

Cap applied: unresolved P1 launch blockers cap the score at 74.

| Category | Weight | Awarded | Evidence | What raises score |
|---|---:|---:|---|---|
| Data, privacy, tenant/user isolation | 18 | 16 | Local-only save, no user accounts, no tenant model | Align privacy docs with self-hosted Tone and current storage behavior |
| Auth, permissions, sessions | 14 | 14 | Not applicable: no auth, no backend writes | Keep N/A unless cloud/multiplayer appears |
| Secrets, env, runtime config | 10 | 10 | No `.env`; `gitleaks` clean; `npm audit` clean | Add secret scan to CI if desired |
| API, validation, uploads, business logic | 10 | 9 | Static app, save validation tests exist | Keep save import/export validation covered |
| Testing and quality gates | 10 | 8 | 842 Jest tests, typecheck, e2e, build pass | Add visual/a11y regression checks |
| Deployment, release, rollback, CI/CD | 8 | 5 | CI strong; deploy workflow intentionally unconfigured | Configure real deploy + rollback target |
| Observability, logs, incident response | 8 | 5 | Error handling docs/code exist, but no live telemetry target | Add release smoke, error receipt path for public build |
| Performance, scaling, caching | 8 | 5 | Bundle small; service worker present; heavy CSS effects exist | Measure FPS/mobile, reduce expensive filters/glows |
| Frontend UX, accessibility, client safety | 8 | 2 | Runtime a11y and screenshot failures | Fix first-run/mobile/contrast/tap targets |
| AI/RAG/agent governance | 6 | 5 | Not app feature; agent-law workflow present | Keep out of app scope |

## Coverage Sweep

| # | Surface | Status | Evidence / reason | Findings |
|---:|---|---|---|---|
| 1 | Product purpose and users | Pass | README explains browser idle game and users | - |
| 2 | Stack and architecture | Finding | Plain CSS claim conflicts with inert Tailwind-style code | F01 |
| 3 | Frontend UX and client safety | Finding | First-run/mobile/contrast/tap target failures | F02-F08 |
| 4 | API and backend services | N/A | Static app, no backend/API runtime | - |
| 5 | Auth and permissions | N/A | No auth/account system | - |
| 6 | Data storage and migrations | Pass | Local save + IndexedDB backup tests | - |
| 7 | User/tenant isolation | N/A | Single-user local browser game | - |
| 8 | Secrets and environment config | Pass | No `.env`, `gitleaks` clean | - |
| 9 | Security and threat model | Pass | CSP, static app, `npm audit` clean | - |
| 10 | Privacy and data governance | Finding | Docs still describe CDN Tone.js while runtime self-hosts | F09 |
| 11 | Tests and quality gates | Finding | Strong functional gates, but no visual/a11y gate | F10 |
| 12 | CI/CD and supply chain | Pass | CI pins actions, installs Playwright, runs e2e/build | - |
| 13 | Hosting, deployment, rollback | Finding | Deploy workflow intentionally exits with no target | F11 |
| 14 | Cloud infrastructure/IaC | N/A | No cloud/IaC present | - |
| 15 | Performance, caching, rate limits | Finding | Heavy blur/glow/filter/motion and full-page overlay; no FPS budget | F07 |
| 16 | Scaling and resilience | N/A | Static local game, no server load path | - |
| 17 | Observability and incident response | Finding | Local error handling exists, no public release telemetry/receipt | F12 |
| 18 | Availability and recovery | Pass | PWA, service worker, local backup mirror | - |
| 19 | AI/RAG/agent governance | N/A | Not an app feature | - |
| 20 | Learning needs | Finding | CSS pipeline, responsive architecture, a11y, release gates | F13 |

## Findings Register

### P1 - Serious Before Launch

| ID | Finding | Plain-English risk | Evidence | Recommended fix |
|---|---|---|---|---|
| F01 | Tailwind ghost layer: markup uses utility classes, but the browser is not compiling Tailwind. | A lot of the intended spacing, sizing, radius, glass, and layout does not apply, causing tiny controls and broken polish. | `styles/theme.css:1-40` says migration removed but still uses `@theme`/`@apply`; `index.html:53-215` uses utility classes like `h-screen`, `p-2`, `rounded-full`, `transition-all`. | Choose one path: compile Tailwind properly or remove utility classes and implement equivalent plain CSS tokens/components. |
| F02 | First-run story modal is taller than the viewport and primary CTA is below the visible area on mobile. | New players can be trapped before starting. | Runtime: mobile button box `y=1021`, viewport height `844`; `js/modules/ui/modalManager.js:365-418`; `css/utilities.css:557-648`. | Make story modal scrollable with `max-height: min(90dvh, ...)`, sticky/footer CTA, focus trap, Escape/backdrop behavior, and reduced copy. |
| F03 | Mobile/narrow visual render is effectively black/unreadable. | Phone users see a blank/dim app even though DOM content exists. | Screenshots: `mobile-main-skip-story.png`, `narrow320-main-skip-story.png`; body/html overflow hidden at `css/base.css:92-106`; flex layout plus obsolete mobile grid rules in `css/layout.css:121-166`. | Rebuild mobile shell around actual selectors: `.main-game`, `.game-area`, `.tabs-content`, `.tabs-nav`, `.control-deck`, `#workstation-list`. Verify 320/390/768 screenshots. |
| F04 | Measured contrast and touch target failures. | Text and controls are hard to read/use, especially low vision/touch users. | a11y-pass: 25-33 failures per viewport; examples: contrast 2.80-3.13:1, help/settings targets 11x19/12x19. `css/components.css:249-294`; `index.html:73-77`. | Raise token contrast, enlarge icon buttons to at least 44x44 CSS px, keep diegetic dimming as decoration only, not core information. |

### P2 - Important Hardening

| ID | Finding | Plain-English risk | Evidence | Recommended fix |
|---|---|---|---|---|
| F05 | Responsive CSS targets old/nonexistent selectors. | Mobile fixes do not apply to the actual DOM. | `css/responsive.css:77-124` uses `.tabs-container`, `.main-content`, `.workstation-grid`; current DOM uses `.tabs-nav`, `.tabs-content`, `#workstation-list`. | Delete dead responsive rules and rebuild mobile-first rules on real selectors. |
| F06 | Tab semantics are incomplete in static HTML and partially patched later by JS. | Assistive tech gets a weaker tab model, and initial state is wrong before JS finishes. | `index.html:108-120`; `js/modules/ui/uiManager.js:187-245` adds `aria-selected`/pane attrs but buttons lack `role="tab"`, `aria-controls`, `id`/`aria-labelledby` in markup. | Add full tab semantics in HTML and keep JS as state updater. |
| F07 | Motion/material effects are heavy and not consistently disciplined. | The intended glitch mood can become eye strain, battery cost, or unreadable noise. | `css/base.css:109-123` full-page CRT overlay; `styles/theme.css:38-48` glass/blur; `css/components.css:13-93` glow + `transition: all`; reduced-motion exists but the default sensory load is high. | Define Tier 0-4 effect budgets, replace `transition: all`, keep filters/glows behind accessibility switches and performance budgets. |
| F08 | Cognitive accessibility: onboarding and labels are dense, all-caps, and memory-heavy. | New players must decode lore, system labels, mechanics, and action vocabulary at once. | `js/modules/ui/modalManager.js:378-402`; `index.html:59-120`, all-caps terminal labels; screenshots show tutorial card overlays on already dim UI. | Add BLUF line, shorter first-run story, one obvious next action, glossary/tooltip naming, calmer default copy. |
| F09 | Privacy/README docs are stale about Tone.js CDN. | Public docs overstate third-party CDN exposure and conflict with current CSP/self-hosting. | Runtime/index self-hosts `vendor/tone-15.1.22.js`; README says loaded via CDN at `README.md:40`; privacy says Cloudflare CDN at `PRIVACY.md:104-115`. | Update docs to say Tone.js is self-hosted; remove CDN privacy note or mark historical. |
| F10 | No automated visual/a11y regression gate. | The same black mobile/contrast regression can return while tests stay green. | 842 tests and e2e pass, while screenshots/a11y fail. | Add Playwright screenshot smoke at desktop/tablet/mobile + injected a11y audit threshold. |
| F11 | Deploy workflow has no real production target or rollback path. | A green local build does not prove a public deploy can happen or be rolled back. | `.github/workflows/deploy.yml:1-31` exits with "No deploy target configured." | Configure static host target, preview/prod split, cache purge, and rollback instructions. |
| F12 | Public observability is not proven. | If the demo breaks in the wild, there is no clear receipt path beyond users reporting manually. | Error handling code exists, but no live public error sink or release smoke receipt in CI. | Add lightweight release receipt: build URL, smoke screenshot, console-error budget, and issue template/runbook. |

### P3 - Improvements

| ID | Finding | Why it helps | Evidence | Suggested timing |
|---|---|---|---|---|
| F13 | Consolidate visual doctrine into one "Arcane Terminal" design system. | Prevents drift between glitch lore, cyberpunk neon, Tailwind remnants, PWA generic copy, and emoji icons. | `styles/theme.css:5-24`, `index.html:22`, `js/modules/pwa/pwaFeaturesManager.js:255-395`, `js/meditationTowers.js:951-958`. | After P1/P2 fixes. |
| F14 | Clean lint warning noise. | 378 warnings make real issues easier to miss. | `npm run lint` output. | After launch blockers. |
| F15 | Replace emoji/symbol rendering with in-world icon primitives. | Keeps the style coherent and accessible. | `index.html:77,217`; `js/modules/pwa/pwaFeaturesManager.js:265-384`; `js/meditationTowers.js:951-958`. | During design-system consolidation. |
| F16 | Update manifest screenshots or add actual screenshots. | PWA stores expect screenshot assets to exist and match current UI. | `manifest.json` references `screenshots/mobile-1.png`, `screenshots/desktop-1.png`; no screenshot directory observed in scan sample. | Before public PWA install push. |

## Complete Remediation Backlog

| Order | Finding | Severity | Fix summary | Verification | Rollback | Status |
|---:|---|---|---|---|---|---|
| 1 | F01 | P1 | Decide CSS pipeline and remove inert utility mismatch | Browser computed styles + screenshots | Revert CSS/HTML patch | Proposed |
| 2 | F02 | P1 | Fix first-run modal scroll/CTA/focus and shorten copy | Mobile first-run screenshot, keyboard start flow | Revert modal CSS/JS | Proposed |
| 3 | F03 | P1 | Rebuild mobile shell on actual selectors | 320/390/768 screenshots nonblack, no overflow | Revert responsive CSS | Proposed |
| 4 | F04 | P1 | Fix contrast and tap target tokens | a11y fails < threshold, manual keyboard pass | Revert token patch | Proposed |
| 5 | F05 | P2 | Delete/replace dead responsive selectors | `rg` proves no stale selectors, screenshots | Revert responsive cleanup | Proposed |
| 6 | F06 | P2 | Add full tab roles and relationships | Playwright accessibility assertions | Revert markup/JS patch | Proposed |
| 7 | F07 | P2 | Define effect budgets and remove `transition: all` | reduced-motion + perf smoke | Revert effect budget patch | Proposed |
| 8 | F08 | P2 | Add cognitive-a11y onboarding pass | first-run flow under 2 screens, one CTA visible | Revert copy/CSS | Proposed |
| 9 | F09 | P2 | Align README/privacy with self-hosted Tone | docs diff | Revert docs patch | Proposed |
| 10 | F10 | P2 | Add screenshot/a11y regression tests | CI runs new tests | Remove new test file | Proposed |
| 11 | F11 | P2 | Configure real static deploy or document manual release | deployment dry run | Revert workflow patch | Proposed |
| 12 | F12 | P2 | Add release receipt/runbook | release checklist artifact | Revert docs/workflow | Proposed |
| 13 | F13 | P3 | Write design-system doctrine and token map | docs + component examples | Revert doc | Proposed |
| 14 | F14 | P3 | Reduce lint warning noise | `npm run lint` warning count down | Revert lint cleanup | Proposed |
| 15 | F15 | P3 | Replace emoji/symbol icons | visual diff + a11y names | Revert icons | Proposed |
| 16 | F16 | P3 | Add/update manifest screenshots | manifest asset check | Revert assets | Proposed |

## Safest First Approval Batch

### Batch A - Make the game visibly startable everywhere

Approve these first: **F01, F02, F03, F04, F05**.

Why these come first:

- They are tightly coupled.
- They remove the current launch blocker.
- They avoid polishing a broken CSS foundation.
- They give every later taste/a11y fix a stable visual baseline.

Technical change:

1. Pick the CSS direction. Recommended: stay plain CSS for now. Remove inert Tailwind syntax from `styles/theme.css`; replace used utility classes with explicit component/shell CSS.
2. Fix `.story-intro-modal` and `.story-intro-content`: `max-height`, internal scroll, sticky CTA, mobile padding, focus management.
3. Rebuild actual mobile selectors: `.main-game`, `.game-area`, `.tabs-content`, `.tabs-nav`, `.control-deck`, `#workstation-list`, `#upgrade-list`, `#inventory-list`.
4. Raise text contrast and control target sizes.
5. Remove dead responsive selectors so future reviewers do not trust CSS that does nothing.

Files likely touched:

- `styles/theme.css`
- `css/base.css`
- `css/layout.css`
- `css/responsive.css`
- `css/components.css`
- `css/utilities.css`
- `index.html`
- `js/modules/ui/modalManager.js`
- possibly `e2e/smoke.spec.js` or a new visual/a11y smoke test

Verification:

- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build:prod`
- `npm run test:e2e`
- screenshot pass at 1440x900, 768x1024, 390x844, 320x720
- injected `a11y-pass` shows no P1-level contrast/tap-target failures for primary controls
- manual keyboard check: first-run modal opens, primary CTA reachable, Escape/Tab behavior sane

Rollback:

- Single revert of the Batch A patch.
- Generated screenshots/runtime artifacts can be deleted if needed.

Approval question:

Do you approve Batch A: **CSS foundation + first-run modal + mobile visibility + contrast/tap targets**?

## Full Remediation Path

| Wave | Included findings | Goal | Exit criteria |
|---|---|---|---|
| Wave 1 | F01-F05 | Make the game visibly startable and usable on mobile/desktop | Nonblack screenshots, CTA reachable, contrast/tap blockers fixed |
| Wave 2 | F06-F10 | Add semantic/a11y/test guardrails | Tab semantics complete, visual/a11y regression in CI |
| Wave 3 | F11-F12 | Production release confidence | Real deploy/rollback/receipt path |
| Wave 4 | F13-F16 | Taste consolidation and cleanup | Coherent Arcane Terminal system, icons/assets/docs/lint cleaned |

## What Can Wait

| Item | Why it can wait | Trigger that makes it urgent |
|---|---|---|
| F13/F15 design-system polish | Not needed before users can see/use the app | After Batch A screenshots pass |
| F14 lint warning reduction | Current warnings do not fail CI | If warnings hide new errors or CI policy changes |
| F16 manifest screenshots | PWA polish, not core gameplay | Before app-store-like install promotion |

## Questions That Would Change This Diagnosis

1. Is the public target meant to be desktop-only, mobile-supported, or mobile-first?
2. Do you want to keep plain CSS, or finish the Tailwind migration?
3. Should Tier 0 intentionally be hard to read, or should "glitched" always remain AA-readable?
4. Is there a live deployment URL already outside this repo's workflow?

## Learning Plan Seeds

| Finding | Concept | Exercise |
|---|---|---|
| F01/F05 | CSS architecture and selector truth | Trace 10 visible elements from DOM class to computed CSS rule. |
| F02/F03 | Mobile viewport and modal ergonomics | Build a fixed modal that survives 320px, 400% zoom, and long content. |
| F04/F06 | WCAG basics in game UI | Add contrast/tap/role assertions to Playwright. |
| F07/F08 | Sensory and cognitive accessibility | Rewrite first-run onboarding as one BLUF, one action, optional lore. |
| F10 | Visual regression testing | Add screenshot thresholds for first-run and main UI. |

