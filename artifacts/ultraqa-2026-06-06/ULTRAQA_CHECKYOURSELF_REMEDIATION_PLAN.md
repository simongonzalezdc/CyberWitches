# CyberWitches UltraQA + CheckYourself Remediation Plan

Generated: 2026-06-06 08:31 PT
Scope: `/Users/simongonzalezdecruz/workspaces/archive/personal/CyberWitches`
Status: Awaiting approval before implementation

## BLUF

The app itself is now testing clean locally and in GitHub CI. Three clean
operator-journey iterations completed after the audit harness was calibrated:
cycles 3, 4, and 5 each returned `issueCount: 0` across source and production
builds.

The remaining path to "close to 100" is deployment/PWA integration, not core
gameplay quality:

1. GitHub Pages is not enabled/configured for GitHub Actions, so deploy fails
   and the public URL returns 404.
2. Production PWA offline mode is not proven and currently fails the bounded
   offline reload probe because the service worker never becomes ready.
3. The production build omits `offline.html`, while `sw.js` treats it as an
   atomic required cache asset.
4. The PWA/service-worker paths are root-absolute (`/sw.js`, `/`, `/index.html`,
   manifest `start_url: "/"`, `scope: "/"`), which is not safe for a GitHub Pages
   project path like `/CyberWitches/`.
5. Manifest screenshots reference `screenshots/*.png`, but `screenshots/` is
   untracked and not copied into `dist`.
6. Default-branch GitHub security/dependency alert state was not verifiable with
   exposed tools. Local scans are clean, but repo alert state remains an external
   unknown.

## Verification Receipts

### UltraQA clean cycles

- Cycle 3 journey audit: `artifacts/ultraqa-2026-06-06/cycle-3/operator-journey-audit.json`
  - `issueCount: 0`
- Cycle 4 journey audit: `artifacts/ultraqa-2026-06-06/cycle-4/operator-journey-audit.json`
  - `issueCount: 0`
- Cycle 5 journey audit: `artifacts/ultraqa-2026-06-06/cycle-5/operator-journey-audit.json`
  - `issueCount: 0`

Each journey audit covered:

- source app and production `dist`;
- first-run story;
- desktop shell;
- tab traversal;
- keyboard shortcuts;
- help and settings modals;
- experiment action;
- save export/import;
- destructive wipe confirmation;
- 390px mobile viewport;
- 320px narrow viewport;
- screenshots for source and production.

### Standard verification

Repeated clean in the final cycles:

- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build:prod`
- `npm run test:e2e`
- `npm audit --audit-level=high`
- `gitleaks detect --source . --no-git --redact --verbose`

Latest observed values:

- Jest: 32 suites, 842 tests passed.
- Playwright: 11/11 passed.
- npm audit: 0 high-or-worse vulnerabilities.
- gitleaks: no leaks found.
- production bundle: 295.60 KB.

### CheckYourself

Command:

```text
python3 tools/checkyourself.py /Users/simongonzalezdecruz/workspaces/archive/personal/CyberWitches --deep --format json --no-write
python3 tools/checkyourself.py /Users/simongonzalezdecruz/workspaces/archive/personal/CyberWitches --deep --ci --no-write --quiet
```

Result:

- files scanned: 486
- P0: 0
- P1: 0
- P2: 0
- P3: 0
- CI-style exit: 0

### Remote/deploy evidence

GitHub Actions on `main`:

- `CI/CD Pipeline` for `0b5cd20`: completed success.
- `Deploy` for `0b5cd20`: completed failure.

Public URL:

```text
https://simongonzalezdc.github.io/CyberWitches/
HTTP/2 404
```

Deploy log root cause:

```text
actions/configure-pages: Get Pages site failed.
Please verify that the repository has Pages enabled and configured to build using GitHub Actions.
```

Offline probe:

```json
{
  "sw": {
    "supported": true,
    "controller": false,
    "ready": false,
    "timeout": true
  },
  "offlineBooted": false
}
```

## Findings Register Sorted By Leverage

### F-001 - Public deploy is down because GitHub Pages is not enabled/configured

Priority: P1
Leverage: Highest
State: proposed

Evidence:

- `Deploy` workflow fails on `actions/configure-pages`.
- Public URL returns GitHub 404.
- GitHub connector confirms repo admin permissions, but no Pages settings tool
  is exposed in this session.

Impact:

- No public production surface exists, so true end-to-end public verification
  cannot pass.
- Any "100%" claim is capped until deploy is live and verified.

Fix:

- One-time repo setting: GitHub repo Settings -> Pages -> Source: GitHub Actions.
- Rerun Deploy workflow.
- Verify public URL returns 200 and app boots at `/CyberWitches/`.

Verification:

- `curl -I -L https://simongonzalezdc.github.io/CyberWitches/`
- GitHub Actions Deploy success.
- Browser boot of public URL.
- Public visual screenshots at desktop/mobile/narrow.

Rollback:

- Disable Pages or revert Pages source setting.

Owner:

- Requires authenticated GitHub settings access. Can be done manually by Simon,
  or by Codex only if an authenticated browser/session/tool exposes Pages settings.

### F-002 - Production offline/PWA claim is broken or at least unproven

Priority: P1
Leverage: Very high
State: proposed

Evidence:

- Bounded production offline probe: service worker supported but not ready,
  no controller, offline reload fails.
- App copy and manifest claim offline play.

Impact:

- The install/offline promise is not trustworthy.
- Returning users may have a broken offline experience even when local gameplay
  is otherwise healthy.

Fix:

- Add a committed Playwright production PWA/offline test.
- Fix service-worker install/root causes in F-003 and F-004.
- Verify online first-load -> service worker active -> reload controlled ->
  offline reload boots.

Verification:

- New e2e test passes locally and in CI.
- Manual public URL offline reload after Pages is live.

Rollback:

- Revert the PWA-specific changes and remove/skip the offline test if it proves
  incompatible with the chosen hosting target.

### F-003 - `offline.html` is required by `sw.js` but omitted from `dist`

Priority: P1
Leverage: Very high
State: proposed

Evidence:

- `sw.js` `CORE_CACHE_URLS` includes `/offline.html`.
- `offline.html` exists at repo root.
- `dist/offline.html` is missing after `npm run build:prod`.
- `build.js` `staticFiles` does not include `offline.html`.

Impact:

- The atomic service-worker install can fail because a required core cache asset
  is absent from production.
- Offline fallback cannot be cached in production.

Fix:

- Add `offline.html` to `build.js` `staticFiles`.
- Add a build assertion/test that every `CORE_CACHE_URLS` local asset exists in
  `dist` after production build.

Verification:

- `npm run build:prod`
- `test -f dist/offline.html`
- PWA/offline Playwright test.

Rollback:

- Remove `offline.html` from `staticFiles` and from `CORE_CACHE_URLS`, but only
  if the offline fallback is intentionally dropped.

### F-004 - PWA/service-worker paths are not GitHub Pages project-path safe

Priority: P1
Leverage: Very high
State: proposed

Evidence:

- `PWAFeaturesManager.registerServiceWorker()` uses `navigator.serviceWorker.register('/sw.js')`.
- `sw.js` caches root paths: `/`, `/index.html`, `/manifest.json`,
  `/offline.html`.
- `manifest.json` has `"start_url": "/"` and `"scope": "/"`.
- Expected hosting path is `/CyberWitches/`, not domain root.

Impact:

- Even after Pages is enabled, the PWA may register/cache against the wrong root.
- Project-site hosting can break install/offline behavior while local root
  previews appear fine.

Fix:

- Make the app base-path aware:
  - register service worker relative to `import.meta`/document base or `./sw.js`;
  - derive cache URLs relative to `self.registration.scope`;
  - set manifest `start_url` and `scope` to `./` for static project hosting.
- Test both root preview and `/CyberWitches/` path preview.

Verification:

- Local root preview boots.
- Local path-prefix preview boots, e.g. under `/CyberWitches/`.
- Public Pages URL boots and service worker registers under the correct scope.

Rollback:

- Revert path changes if the deployment target is changed to a custom root
  domain instead of GitHub Pages project hosting.

### F-005 - Manifest screenshots are referenced but not shipped

Priority: P2
Leverage: Medium
State: proposed

Evidence:

- `manifest.json` references:
  - `screenshots/mobile-1.png`
  - `screenshots/desktop-1.png`
- Local `screenshots/` exists but is untracked.
- `dist/screenshots/*.png` is missing after production build.
- `build.js` does not copy `screenshots/`.

Impact:

- PWA install metadata can have broken screenshot references.
- Store/install surfaces look less polished or fail validation.

Fix:

- Decide whether screenshots should be committed product assets or removed from
  manifest.
- Recommended: commit polished screenshots and add `screenshots` to build copy,
  or move them under a tracked assets directory.

Verification:

- `npm run build:prod`
- `test -f dist/screenshots/mobile-1.png`
- Manifest screenshot URLs return 200 in production preview/public Pages.

Rollback:

- Remove `screenshots` entries from `manifest.json`.

### F-006 - Production-path QA is audit-only, not a committed CI gate

Priority: P2
Leverage: Medium
State: proposed

Evidence:

- Current committed Playwright tests serve the source tree.
- The deeper source/dist journey audit lives under untracked `artifacts/`.
- CI does build production, but does not browser-test the `dist` output.

Impact:

- Production-only regressions can slip through if they do not affect source
  preview.
- The clean UltraQA evidence is not durable in normal CI.

Fix:

- Promote the stable parts of `operator-journey-audit.mjs` into committed e2e
  specs:
  - production `dist` preview smoke;
  - PWA/offline install readiness;
  - base-path `/CyberWitches/` preview;
  - manifest asset URL check.

Verification:

- `npm run test:e2e` includes production-path tests.
- GitHub CI Browser Smoke Test stays green.

Rollback:

- Keep production-path tests in a separate npm script if they prove too slow for
  every PR, then run them on `main` pushes.

### F-007 - Generated audit artifacts can contaminate repo-wide tools

Priority: P3
Leverage: Medium-low
State: proposed

Evidence:

- `eslint .` initially failed because an untracked audit runner under
  `artifacts/` was scanned.
- CheckYourself now scans 486 files, including generated screenshots and JSON
  artifacts.

Impact:

- Local audit evidence can accidentally alter lint/security scan behavior.
- Tooling becomes noisier over time as proof artifacts accumulate.

Fix:

- Add explicit ignores for generated proof directories in `eslint.config.js`,
  CheckYourself invocation docs, and/or `.gitignore`.
- Prefer `artifacts/` for proof, `tools/` for committed reusable audit code.

Verification:

- `npm run lint` ignores proof-only assets.
- CheckYourself scan scope is intentional.

Rollback:

- Remove ignores if artifacts become committed source.

### F-008 - GitHub default-branch security/dependency alert state was not verified

Priority: P3
Leverage: Medium-low
State: proposed

Evidence:

- Local `npm audit --audit-level=high` is clean.
- Local `gitleaks` is clean.
- No exposed GitHub connector tool could read Dependabot/code-scanning/secret
  scanning alert state.

Impact:

- A strict "100%" public-repo security claim is capped by missing remote alert
  evidence.

Fix:

- Verify GitHub Security tab:
  - Dependabot alerts: 0 open high/critical;
  - secret scanning: 0 open;
  - code scanning: 0 open, if enabled.
- Optionally add a documented release checklist item for this.

Verification:

- Screenshot or API receipt from GitHub Security tab.

Rollback:

- Not applicable; this is verification debt, not code behavior.

### F-009 - GitHub Actions Node 20 action deprecation warning

Priority: P3
Leverage: Low
State: proposed

Evidence:

- Deploy logs warn Node.js 20 actions are deprecated and default Node 24 behavior
  changes are scheduled after 2026-06-16, with Node 20 removal later in 2026.

Impact:

- CI/deploy stability risk later in 2026 if pinned actions do not update runtime.

Fix:

- Check for newer SHAs/versions of Pages and artifact actions after fixing deploy.
- Keep SHA pinning, but refresh pins to versions that support Node 24.

Verification:

- GitHub Actions run logs contain no Node 20 action warning.

Rollback:

- Revert action pin updates if upstream action behavior changes unexpectedly.

## Recommended Approval Batch

Batch A gets the project closest to 100 with the lowest code risk:

1. Fix production PWA asset copying:
   - add `offline.html` to `build.js` static files;
   - decide and implement manifest screenshot shipping/removal.
2. Make service worker and manifest base-path safe for `/CyberWitches/`.
3. Add committed production/PWA e2e coverage:
   - production `dist` boot;
   - `/CyberWitches/` path-prefix boot;
   - offline reload readiness after service-worker install;
   - manifest asset URL checks.
4. After code is merged, enable GitHub Pages Source: GitHub Actions and rerun
   Deploy.
5. Verify public URL with desktop/mobile/narrow screenshots.

Batch B:

6. Add artifact/tooling ignores so proof directories do not affect lint/security
   scans.
7. Verify GitHub Security/Dependabot/code-scanning alert state.
8. Refresh GitHub Action pins if Node 20 deprecation warnings remain after deploy
   is live.

## Expected Score After Batch A

Current practical readiness: about 94-96.

Why not 100:

- public deploy is down;
- production offline/PWA path is not proven;
- GitHub security alert state is not verified.

Expected after Batch A plus Pages enablement: about 98-99.

Expected after Batch B and remote Security tab verification: close to 100.

