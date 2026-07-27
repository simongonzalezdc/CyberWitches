# 03 — Visual share format decision

**Date:** 2026-07-27  
**Decision:** **Still-first** (split before/after PNG) as SHARE_RESTORE default  
**Loop (GIF/WebM):** Should / deferred  

## Constraints honored

| Constraint | How |
|------------|-----|
| Privacy | Meta + canvas paint tier chrome only; no AB/inventory/prestige/save |
| Mute readability | Split still shows Broken → restored without audio |
| Perf | Canvas paint ≤ few hundred ms; download one PNG |
| Kill list | No GameState rewrite; expands `healShare` + thin `healCapture` |

## Why still-first

1. RALPLAN pre-mortem: canvas/GIF loops flaky → still + DOM-clone style paint is reliable.  
2. Share sheet friction: PNG download works on desktop; WebM/GIF encoding is extra surface.  
3. Landing/OG can reuse the same still.  
4. Critic nit: default still-first so ticket 05 is not blocked.

## Artifact shape

- **Kind:** `hex-compiler-heal-still`  
- **Layout:** left = fromTier chrome, right = toTier + SYSTEM_RESTORE  
- **Text companion:** existing share text clipboard (fallback if canvas fails)

## Revisit loop when

- Field mute-clip soft-passes and scroll-stop data suggests motion helps  
- Encode path is e2e-stable under 2s on mid mobile
