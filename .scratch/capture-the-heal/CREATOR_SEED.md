# 08 — Creator seed path (on-stream heal)

**Status:** documented · **Not** a public progression skip  

## Goal

A streamer reaches a heal moment quickly for mute-clip / demo without giving normal players a free tier ladder.

## Allowed paths

### A. Existing debug unlock (if already gated)

If the build exposes a debug tier unlock behind `?debug=1` or an existing operator console, use:

```js
// Only after confirming debug surface is non-default:
window.uiManager?.systems?.designTierSystem?.emitTierAdvance?.(0, 1);
// or setTier after unlockAllTiers in debug builds only
```

### B. Console demo (local / streamer machine)

1. Open DevTools on `play.html` (local or staging).  
2. Dismiss tutorial (`localStorage.tutorialCompleted = 'true'`).  
3. Call:

```js
const dts = window.uiManager?.systems?.designTierSystem;
dts?.emitTierAdvance?.(0, 1);
// SHARE_RESTORE should unhide + pulse
```

This fires ceremony + funnel TTH without rewriting save economy.

### C. Natural first unlock (production-safe)

Play until AB + achievements meet Tier 1 gate. Preferred for “real” creator VODs; slower.

## Hard rules

- Do **not** put “skip to heal” on the default public HUD.  
- Do **not** document permanent save cheats in player-facing USER_GUIDE.  
- DevTools / local-only is fine for stream prep.  
- If a future seed URL is added, gate with explicit query + non-indexed staging host.
