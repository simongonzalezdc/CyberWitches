# CyberWitches All-Tastecheck Visual Audit + Approval Plan

Generated: 2026-06-05 23:50 PDT

## BLUF

Do not ship this as a public mobile-facing demo yet.

The game runtime is stable: lint, typecheck, Jest, production build, Playwright e2e, npm audit, and gitleaks all pass. The launch blocker is the rendered UI layer.

Production Reality Score: 68 / 100.

Why capped: multiple P1 visual/UX blockers are proven by screenshots. No P0 security blocker was found.

No source fixes or commits were made. This report is the approval packet.

Recommended approval: Batch A only.

## What Changed In This Expanded Pass

The earlier audit was directionally right but incomplete for your "ALL tastecheck skills" request. This pass explicitly applied every installed tastecheck skill I could verify locally, added fresh visual verification, added modal/tab state coverage, reran CheckYourself, and reran the project quality gates.

## Skills Applied

| Skill | Applied result |
|---|---|
| `design-review-flow` | Captured before screenshots across desktop/tablet/mobile/320px, tab states, modals, and keyboard focus. Fix/commit loop paused because you asked for approval first. |
| `design-taste-frontend` | Checked dependency truth, viewport stability, Tailwind/version assumptions, utility-class drift, visual density, motion, AI tells, and mobile collapse. |
| `high-end-visual-design` | Checked premium bar: typography, motion quality, materiality, layout hierarchy, over-glow, and generic visual shortcuts. |
| `redesign-existing-projects` | Audited existing vanilla CSS stack without proposing a rewrite. Prioritized targeted upgrades. |
| `deslop-ui` | Checked for AI tells: utility ghosts, Inter, pill/glow overuse, glassmorphism, emoji/symbol leakage, 3-column/default grid bias, and generic PWA/modal copy. |
| `web-design-guidelines` | Fetched fresh Vercel Web Interface Guidelines and applied accessibility, focus, animation, forms, touch, safe-area, content, and anti-pattern rules. |
| `a11y-pass` | Ran the bundled measurable auditor in a CSP-bypassed test context only. Main UI has 25-33 failures per viewport. |
| `cognitive-a11y` | Checked onboarding, jargon, all-caps labels, sensory load, predictability, and memory burden. |
| `responsive-layout` | Checked 1440, 768, 390, and 320 widths, plus DOM overflow, stale selectors, mobile deck occlusion, and viewport units. |
| `color-system` | Checked token coherence, contrast pairs, OKLCH/hex split, accent discipline, and color-only state risks. |
| `component-states` | Checked hover/focus/active/disabled/loading/selected/error coverage for buttons, tabs, cards, modal controls, and locked states. |
| `empty-states` | Checked first-run, locked tabs, empty lists, loading, error/offline paths, and no-results style surfaces. |
| `form-ux` | Checked settings/import/export/clear-save/destructive confirmation surfaces for labels, helper text, disabled reasons, and recovery. |
| `micro-motion` | Checked transition properties, reduced-motion behavior, infinite loops, blur/filter load, and sensory/performance impact. |
| `assess-graphical-excellence` | Not applicable. Current UI has no real data graphic/chart to score against Tufte criteria. |
| `checkyourself` | Ran the canonical CheckYourself scan and used its coverage matrix/risk taxonomy for production-readiness framing. |

## Evidence Artifacts

| Artifact | Path |
|---|---|
| Screenshot set | `artifacts/tastecheck-2026-06-05/all-skills-visual-verification/screenshots/` |
| Runtime DOM/visual audit | `artifacts/tastecheck-2026-06-05/all-skills-visual-verification/runtime/all-skills-visual-runtime-audit.json` |
| Runtime summary | `artifacts/tastecheck-2026-06-05/all-skills-visual-verification/runtime/summary.json` |
| CSP-bypassed a11y audit | `artifacts/tastecheck-2026-06-05/all-skills-visual-verification/runtime/a11y-bypass-audit.json` |
| A11y summary | `artifacts/tastecheck-2026-06-05/all-skills-visual-verification/runtime/a11y-bypass-summary.json` |
| Verification logs | `artifacts/tastecheck-2026-06-05/all-skills-visual-verification/verification/` |
| CheckYourself generated context | `/Users/simongonzalezdecruz/workspaces/checkyourself/CHECKYOURSELF_PROJECT_CONTEXT.generated.md` |

## Quality Gates

| Command | Result |
|---|---|
| `npm run lint` | Pass, 0 errors, 378 warnings. |
| `npm run typecheck` | Pass. |
| `npm test -- --runInBand` | Pass, 32 suites, 842 tests. |
| `npm run build:prod` | Pass, bundle `dist/js/game.bundle.js` 295.44 KB. |
| `npm run test:e2e` | Pass, 4 Playwright tests. |
| `npm audit --audit-level=high` | Pass, 0 high vulnerabilities. |
| `gitleaks dir . --no-banner --redact` | Pass, no leaks found. |
| `python3 tools/checkyourself.py scan /Users/simongonzalezdecruz/workspaces/archive/personal/CyberWitches` | Wrote context, scanned 393 files, deterministic P0/P1/P2/P3 = 0. |

## Visual Verification Snapshot

| View/state | Result |
|---|---|
| Desktop first-run story | Screenshot is fully black, avg luminance 0, while DOM reports story modal content present. |
| Tablet first-run story | Screenshot is fully black, avg luminance 0, while DOM reports story modal content present. |
| Mobile first-run story | Screenshot is fully black. Story panel is 1422px tall; button is not in viewport. |
| 320px first-run story | Screenshot is fully black. Story panel is 1758px tall; button is not in viewport. |
| Desktop main | Visible and stable, but very dim. Avg luminance 19.3; only 3.82% pixels above luminance 42. |
| Mobile main | Visible, but dense and dim. Fixed cast deck consumes the bottom viewport while cards scroll behind it. |
| Help modal | Renders as a bottom-left slab over the live game, not a centered modal. |
| Settings modal | Renders as a bottom-left slab over the live game, not a centered modal. |
| Desktop tabs | Meditation tab was not in viewport before scripted scroll/click. Tab buttons have `aria-selected` after JS patch, but no static `role=tab`/`aria-controls`. |
| Keyboard focus sample | Focus visible exists, but help/settings targets are only 11x19 and 12x19; focus later lands on a panel then repeats cast button. |

## P1 Findings

### F01 - First-run experience can render as a black screen and traps mobile users

Severity: P1.

Evidence:
- `mobile-first-run-story.png` and `narrow320-first-run-story.png` are fully black.
- Runtime audit reports avg luminance 0 for all first-run screenshots.
- Mobile story content: top -289, bottom 1133, height 1422, button not in viewport.
- 320px story content: top -457, bottom 1301, height 1758, button not in viewport.
- Source: `js/modules/ui/modalManager.js:365-418`, `css/utilities.css:557-649`.

Tastecheck hits:
- `design-review-flow`: before screenshots prove the issue.
- `responsive-layout`: content does not reflow at 390/320.
- `empty-states`: first-run state fails.
- `cognitive-a11y`: long wall of story text, no TLDR/progress, high memory/sensory load.
- `a11y-pass`: CTA inaccessible on mobile.

Remediation:
- Give story modal a `max-height: min(90dvh, ...)`, internal scroll, safe-area padding, and visible close/continue CTA.
- Split first-run copy into short staged chunks or a condensed intro with "Full story" secondary action.
- Mark `hasSeenStoryIntroduction` only after successful close, not immediately on render.
- Add Playwright first-run visual/a11y test for 1440, 768, 390, and 320.

Verification:
- First-run screenshot is not black.
- Continue button visible and clickable at 390 and 320.
- Keyboard focus enters modal and Escape/close returns focus.

### F02 - Static help/settings modals are visually broken

Severity: P1.

Evidence:
- `desktop-modal-help.png` and `desktop-modal-settings.png` show modal content as a bottom-left slab over the live game.
- Runtime rects: help modal y=545, height=304; settings modal y=694, height=155.
- Source: `index.html:237-295` relies on utility classes like `fixed`, `inset-0`, `flex`, `items-center`, `justify-center`, `z-[100]`.
- Search shows no `.modal` layout style beyond containment in `css/containment.css:23-28`; `.hidden` exists, but utility modal layout does not.

Tastecheck hits:
- `design-review-flow`: modal screenshots prove state failure.
- `component-states`: modal open/closed state lacks a real visual contract.
- `a11y-pass`: modal semantics depend on JS focus trap but visual context is broken.
- `web-design-guidelines`: dialog should be semantic, focus-managed, and visually modal.

Remediation:
- Add real vanilla CSS for `.modal` and `.modal-content`, or convert to native `<dialog>`.
- Add `role="dialog"`, `aria-modal="true"`, accessible names, and `overscroll-behavior: contain`.
- Stop relying on uncompiled Tailwind utilities for modal positioning.

Verification:
- Help/settings screenshots centered at desktop/mobile.
- Background visually inert and not readable as active content.
- Existing e2e modal focus-trap test remains green.

### F03 - CSS architecture is split-brain: vanilla CSS plus uncompiled Tailwind syntax

Severity: P1.

Evidence:
- `index.html` has 442 Tailwind-like class tokens.
- `styles/theme.css:5-36` contains raw `@theme`.
- `styles/theme.css:39-40` contains raw `@apply`.
- `package.json` has no Tailwind dependency.
- `README.md:9` says styling is plain CSS.

Tastecheck hits:
- `design-taste-frontend`: dependency verification fails the styling assumptions.
- `deslop-ui`: inert utility ghosts are a functional slop tell.
- `redesign-existing-projects`: work with existing stack, do not rewrite.
- `web-design-guidelines`: rendered behavior must match code intent.

Remediation:
- Choose one path:
  - Preferred: keep vanilla CSS and replace/remove utility-class reliance.
  - Alternative: install and wire Tailwind intentionally, then validate v3/v4 syntax.
- Remove `@theme`/`@apply` from browser-loaded CSS unless a build step compiles it.
- Define semantic CSS classes for layout, modals, tabs, HUD, cards, and controls.

Verification:
- No raw `@apply`/`@theme` in browser-loaded CSS.
- Modal/layout screenshots no longer depend on utility classes.
- Build and e2e stay green.

### F04 - Measured accessibility failures: contrast, tiny text, and tap targets

Severity: P1.

Evidence:
- Main UI a11y failures:
  - Desktop: 33 fails, 18 warnings.
  - Tablet: 25 fails, 18 warnings.
  - Mobile: 25 fails, 18 warnings.
  - 320px: 25 fails, 18 warnings.
- Examples:
  - Contrast 2.80:1 for 12px body/card copy.
  - Contrast 3.13:1 for 11px resource labels.
  - Contrast 2.94:1 for tab/sidebar labels.
  - Help/settings targets measured 11x19 and 12x19.
- Source: `index.html:73-77`, `css/components.css:128-134`, `css/components.css:150-159`, `css/components.css:249-276`.

Tastecheck hits:
- `a11y-pass`: WCAG 2.2 AA measurement fail.
- `color-system`: actual pairs not contrast-safe.
- `component-states`: focus exists, target sizing and state contrast fail.
- `cognitive-a11y`: dim low-size text increases reading load.

Remediation:
- Raise body/card copy and control labels to contrast >= 4.5:1.
- Raise target boxes to at least 24x24 CSS px; prefer 44x44 for touch controls.
- Normalize text sizes; avoid 11px labels for critical information.
- Add automated contrast/tap-target check to e2e or a local script.

Verification:
- a11y auditor returns 0 measured contrast/tap-target failures for core states.
- Screenshot pass confirms no "dim terminal haze" over essential read layer.

### F05 - Mobile layout is visible but cramped, dim, and partially occluded by the cast deck

Severity: P1.

Evidence:
- `mobile-main-workstations.png` shows readable structure but low contrast and bottom content competing with the fixed cast deck.
- `index.html:53` uses `h-screen`.
- `css/layout.css:11-20` uses `height: 100vh`, `width: 100vw`, `overflow: hidden`.
- `index.html:210-232` makes the cast deck a persistent bottom region.

Tastecheck hits:
- `responsive-layout`: `100vh`/`h-screen` and internal scroll can fail mobile viewport behavior.
- `cognitive-a11y`: primary action competes with reading.
- `high-end-visual-design`: macro hierarchy is dominated by one giant action.

Remediation:
- Move to `min-height: 100dvh`/`100svh` strategy with safe-area padding.
- Reserve bottom scroll padding equal to cast deck height.
- Reduce mobile cast deck footprint or make it sticky only when relevant.
- Check 320px, 390px, and landscape.

Verification:
- Last card controls are not hidden behind cast deck.
- No horizontal overflow.
- Tap targets remain large enough.

### F06 - Tab semantics and locked tab behavior are incomplete

Severity: P1/P2, P1 because it affects visible navigation confidence.

Evidence:
- Static tab buttons in `index.html:108-120` have `role=tablist` on nav but buttons lack `role=tab` and `aria-controls` in markup.
- JS patches only `aria-selected` in `js/modules/ui/uiManager.js:187-192`.
- Desktop visual runtime found `meditation` was not in viewport before scripted scroll/click.
- Keyboard sample focus lands on panel content and then repeats cast button.

Tastecheck hits:
- `component-states`: selected/locked/current states are incomplete.
- `a11y-pass`: tab semantics and focus order need manual fix.
- `web-design-guidelines`: stateful UI should be semantic and deep-linkable when practical.

Remediation:
- Add `role=tab`, `aria-controls`, `id`, and matching `role=tabpanel`.
- Make locked tabs either focusable with explanation or disabled with accessible reason, not visually half-present.
- Add arrow-key handling or document intentional Tab-only behavior.
- Consider URL/hash reflection for active tab.

Verification:
- Keyboard order is logical and non-repeating.
- Screen reader sees tablist/tabs/panels correctly.
- Locked tab explanation is reachable.

## P2 Findings

### F07 - Responsive CSS targets stale selectors

Evidence:
- `css/responsive.css:77-101` targets `.tabs-container`, `.main-content`, `.workstation-grid`, `.upgrade-grid`, `.inventory-grid`.
- Actual DOM uses `.tabs-nav`, `.tabs-content`, and `#workstation-list` with utility classes.
- `css/layout.css:121-166` has mobile grid-row logic left over from a prior grid architecture while `.main-game` is flex.

Remediation:
- Delete dead responsive rules or retarget them to actual DOM.
- Use intrinsic grid/flex patterns first, then content-driven breakpoints.

### F08 - Component state matrix is partial

Evidence:
- `css/components.css` has 5 `transition: all` occurrences.
- Buttons have hover/disabled but no loading/busy state contract.
- Disabled controls often only dim with no reason text.
- Locked tabs are visually present but state semantics are not complete.

Remediation:
- Define state contracts for `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.tab-btn`, `.workstation-card`, `.modal-close`, and `.btn-cast`.
- Add explicit `:focus-visible`, `:active`, `[aria-busy]`, `[aria-selected]`, `[aria-disabled]`, and disabled reason patterns.

### F09 - Empty/loading/error states are incomplete

Evidence:
- First-run state fails visually.
- Locked tabs emit plain "This tab is locked..." messages after tab interactions.
- Some tabs can render as sparse/blank areas without composed empty states.
- Loading state exists in code, but not as a consistent per-region skeleton/state system.

Remediation:
- Define loading, empty, locked, error, and no-results states per major panel.
- Use fixed-size skeletons for content regions.
- Announce state changes via existing live regions.

### F10 - Form UX surfaces are underdesigned

Evidence:
- Settings actions are buttons without a composed import/export flow state.
- Destructive confirmation input exists in `js/modules/ui/modalManager.js:626-636`, but needs helper text, error/retry behavior, autocomplete/spellcheck decisions, and clearer disabled reason.

Remediation:
- Add visible labels/helper/error text for destructive confirmation and import.
- Keep submit enabled or explain disabled state.
- Preserve user input on errors.

### F11 - Motion layer is visually loud and not fully intentional

Evidence:
- `css/components.css:26`, `css/components.css:86`, `css/components.css:230`, `css/components.css:261`, `css/components.css:293` use `transition: all`.
- `css/components.css:43` uses infinite linear rotation.
- `css/base.css:109-123` adds a full-page CRT overlay with z-index 9999 and opacity 0.6.
- `styles/theme.css:22-24` defines infinite float/pulse/glitch animation tokens.

Remediation:
- Replace `transition: all` with explicit properties.
- Gate non-essential motion behind `prefers-reduced-motion: no-preference`.
- Reduce CRT overlay opacity or scope it below critical UI.
- Keep one signature motion moment instead of continuous ambient noise.

### F12 - Color system is not a coherent accessible token system yet

Evidence:
- OKLCH tokens in `styles/theme.css:5-36` are not actually compiled into utility classes.
- Raw hex tokens in `css/base.css:37-70` drive the live UI.
- Palette uses multiple high-chroma accents: magenta, cyan, amber, red.
- Measured contrast failures prove tokens are not validated against actual pairs.

Remediation:
- Build one live semantic token set.
- Use tinted neutrals, one dominant hue, one accent, semantic error/success/warning.
- Measure all text/control pairs and document ratios.

### F13 - Cognitive accessibility needs a content pass

Evidence:
- First-run story is a long wall of paragraphs.
- UI labels are all-caps terminal jargon across tabs/buttons.
- No TLDR or progressive disclosure for onboarding.

Remediation:
- Add BLUF intro, shorter chunks, and "learn more" secondary path.
- Preserve diegetic tone but add plain-language subtitles/tooltips.
- Keep one primary action per state.

### F14 - Manifest screenshots are referenced but absent

Evidence:
- `manifest.json:39-53` references `screenshots/mobile-1.png` and `screenshots/desktop-1.png`.
- No `screenshots/` app asset directory was found.

Remediation:
- Add real PWA screenshots or remove manifest screenshot entries until assets exist.

### F15 - Public docs are stale about Tone.js delivery

Evidence:
- `index.html:38-42` self-hosts `vendor/tone-15.1.22.js`.
- `README.md:40` still says Tone.js is loaded via CDN.
- `PRIVACY.md:106-115` still says Cloudflare CDN is used for Tone.js.

Remediation:
- Update README and privacy copy to match self-hosted runtime.

### F16 - Deployment target is intentionally missing

Evidence:
- `.github/workflows/deploy.yml:27-31` exits with "No deploy target configured."

Remediation:
- Before public launch, choose hosting, wire deploy, document rollback, and add preview/prod distinction.

### F17 - Observability/incident path is not proven

Evidence:
- No production error reporting or public launch monitoring was verified.
- Privacy posture is intentionally low-data, which is good, but launch still needs non-invasive error receipts.

Remediation:
- Add privacy-preserving client error reporting or documented manual incident channel.
- Add owner/runbook for public demo issues.

### F18 - Visual/a11y regression gate is missing

Evidence:
- CI has strong unit/type/e2e/build gates in `.github/workflows/ci.yml:10-95`.
- No CI visual screenshot diff or a11y measurement gate currently protects the UI blockers found here.

Remediation:
- Add Playwright screenshot captures for first-run, main, help/settings, mobile, and 320.
- Add the measurable a11y auditor or axe-like check for core states.

## P3 Findings

| ID | Finding | Evidence | Remediation |
|---|---|---|---|
| F19 | Lint warnings remain noisy. | `npm run lint` passes with 378 warnings. | Clean console/no-unused/comma warnings in a separate cleanup batch. |
| F20 | Emoji/symbol leakage remains. | `index.html` has 2 emoji/symbol hits; `js/modules/pwa/pwaFeaturesManager.js` has 14; `js/modules/ui/modalManager.js` has 4. | Replace emoji with consistent in-world CSS/icons where visible. |
| F21 | Icon and typography system is not fully coherent. | `index.html:22` imports Space Grotesk, JetBrains Mono, and Inter; CSS references Orbitron/Fira Code without matching import. | Rationalize font imports and fallback stack. |
| F22 | PWA/install copy is generic. | `js/modules/pwa/pwaFeaturesManager.js` install modal copy/symbols. | Rewrite in CyberWitches voice and align with accessibility. |

## CheckYourself Coverage Sweep

| Surface | Status | Notes |
|---|---|---|
| Product purpose/users | Pass | Browser idle/incremental game, public player surface. |
| Stack/architecture | Pass | Static vanilla JS, no backend, localStorage/IndexedDB, PWA. |
| Frontend UX/client safety | Finding | P1 visual, a11y, responsive, modal, and first-run blockers. |
| API/backend services | Not applicable | No app backend routes verified. |
| Auth/permissions | Not applicable | No auth surface. |
| Data storage/migrations | Pass/P2 | Save codec and IndexedDB backup exist; UI recovery states need polish. |
| User/tenant isolation | Not applicable | Single-player local app. |
| Secrets/env config | Pass | `gitleaks` clean; no runtime env dependency found. |
| Security/threat model | Pass/P2 | CSP tightened, self-hosted Tone, audit clean; visual/a11y not security blockers. |
| Privacy/data governance | Finding | Privacy doc stale about CDN. |
| Tests/quality gates | Pass/P2 | Strong gates pass; lacks visual/a11y regression gate. |
| CI/CD/supply chain | Pass/P2 | CI strong, dependency audit clean, deploy not wired. |
| Hosting/deploy/rollback | Finding | Deploy workflow intentionally exits. |
| Cloud/IaC | Not applicable/unknown | Static app; hosting not selected. |
| Performance/caching/rate limits | P2 | No backend rate limits needed; CSS motion/blur/overlay risk remains. |
| Scaling/resilience | Pass/P2 | Local app, service worker and IndexedDB mirror; recovery UX can improve. |
| Observability/incident response | Finding | No public demo monitoring/runbook verified. |
| Availability/recovery | P2 | Local saves/export exist; public hosting rollback unknown. |
| AI/RAG/agent governance | Not applicable | No AI feature in game runtime. |
| Learning needs | Pass | See learning plan below. |

## Remediation Plan For Approval

### Batch A - P1 visual substrate and first-run launch blockers

Approve this first.

Scope:
- Fix CSS split-brain for the affected surfaces without migrating frameworks.
- Fix first-run story rendering, mobile height, and seen-state timing.
- Fix static help/settings modal layout and semantics.
- Fix core contrast and help/settings target sizes.
- Fix mobile cast deck occlusion with safe viewport units and scroll padding.
- Add a minimal visual/a11y Playwright gate for first-run, main, help, settings, mobile, and 320px.

Likely files:
- `index.html`
- `styles/theme.css`
- `css/base.css`
- `css/layout.css`
- `css/components.css`
- `css/responsive.css`
- `css/utilities.css`
- `js/modules/ui/modalManager.js`
- `js/modules/ui/uiManager.js`
- `e2e/*`

Verification:
- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build:prod`
- `npm run test:e2e`
- Fresh screenshots at 1440, 768, 390, 320.
- a11y measurable failures for core screen drop to zero or are explicitly justified/deferred.

Rollback:
- Single revert of Batch A commit if visual shell regresses.

### Batch B - States, cognitive accessibility, and secondary flows

Scope:
- Complete tab semantics and locked tab behavior.
- Define full component states for buttons/cards/tabs/modals.
- Add composed empty/loading/error/locked states.
- Improve destructive confirmation/import/export form UX.
- Reduce all-caps/jargon burden and add first-run TLDR/progressive disclosure.

Verification:
- Keyboard path and screen-reader spot check.
- State screenshots for locked/empty/loading/error where practical.
- Existing tests plus targeted e2e additions.

### Batch C - PWA/docs/deploy readiness

Scope:
- Add real manifest screenshots or remove references.
- Update README/privacy Tone.js text.
- Wire real deploy target or document launch-blocking deployment status.
- Add rollback/hosting notes.
- Add privacy-preserving public error receipt path.

Verification:
- PWA manifest validation.
- Deploy dry run or documented blocked status.
- Docs align with runtime.

### Batch D - Polish and cleanup

Scope:
- Reduce 378 lint warnings.
- Replace emoji/symbol leakage with consistent icon language.
- Rationalize fonts and remove unused imports/fallback drift.
- Tighten visual language after functional blockers are fixed.

Verification:
- Lint warnings materially reduced.
- Visual screenshots remain stable.

## Learning Plan Seeds

| Theme | Why it matters here |
|---|---|
| CSS architecture discipline | The biggest root cause is uncompiled utility assumptions inside a vanilla CSS app. |
| Modal/dialog implementation | Help/settings and story intro show why modal visual layout, semantics, and focus must be one contract. |
| Measured accessibility | The UI looked thematically intentional, but measured contrast/tap targets failed. |
| Mobile viewport units | `100vh`/`h-screen` plus fixed decks are still easy to get wrong on mobile. |
| Visual regression testing | Existing e2e proves runtime stability, not rendered quality. |

## Approval Request

Approve Batch A to start implementation.

I will keep the design-review-flow discipline after approval: one focused change unit at a time, before/after screenshots, verification, then a clean commit only after the fix is proven.
