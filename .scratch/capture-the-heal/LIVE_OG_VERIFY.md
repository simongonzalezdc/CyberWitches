# Live OG / heal still verification

**Date:** 2026-07-27  
**Status:** **PASS — live**

## Problem

GH Pages was stale (last deploy 2026-06-10). `Deploy` workflow was **disabled_manually**, so main pushes (including PR #20/#21) never redeployed.

## Fix

1. Re-enabled `Deploy` (+ `CI/CD Pipeline`) workflows via GitHub API.  
2. `workflow_dispatch` Deploy on `main` → run `30249005687` **success**.  
3. Verified production URLs.

## Evidence (curl 2026-07-27)

| URL | Result |
|-----|--------|
| https://simongonzalezdc.github.io/CyberWitches/screenshots/heal-split-still.png | **HTTP 200**, `image/png`, Last-Modified 2026-07-27 |
| https://simongonzalezdc.github.io/CyberWitches/ index `og:image` | `.../screenshots/heal-split-still.png` (1200×630) |
| Landing heal section | `heal-split-still.png` img + “Broken → restored” |
| https://simongonzalezdc.github.io/CyberWitches/play.html | **HTTP 200** |

## Deploy ops note

If Pages goes stale again: check workflow enabled state, then:

```bash
gh api -X PUT repos/simongonzalezdc/CyberWitches/actions/workflows/204923862/enable
gh workflow run Deploy --repo simongonzalezdc/CyberWitches --ref main
```
