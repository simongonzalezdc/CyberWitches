# Hex Compiler Design System

## Version

Current live design-system version: `kyanite-1`.

Both public entrypoints must expose this contract on the root element:

```html
<html data-design-system-version="kyanite-1">
```

Returning-player trust uses a separate browser key, `hexcompiler-design-system-version`, outside the `cw.*` game-save namespace. It is a UI compatibility marker only and must not be encoded into save/export blobs.

## Legacy to Kyanite token map

| Legacy token / role | Kyanite token | Live value | Usage |
| --- | --- | --- | --- |
| `--color-void-950`, `--bg-void` | `--ky-void` | `#05070b` | Page and game-shell base background |
| `--color-void-900`, `--bg-terminal` | `--ky-void-depth` | `#070a10` | Terminal/HUD depth surfaces |
| `--color-void-800`, `--bg-dark-alt` | `--ky-midnight` | `#080d14` | Secondary dark planes |
| `--color-void-700`, `--bg-panel` | `--ky-basalt` | `#0b131d` | Panels, cards, nav shells |
| `--bg-card` | `--ky-basalt-elevated` | `#0e1b29` | Raised cards and modal panels |
| `--border` | `--ky-basalt-ridge` | `#122335` | Structural borders |
| `--primary`, `--accent`, `--color-code` | `--ky-cyan` | `#26e6ff` | Primary action, data glow, CTA start |
| `--color-code-dim`, CTA gradient end | `--ky-electric` | `#087dcc` | Dim code accents, CTA end |
| `--color-witch-500` | `--ky-magenta` | `#ff2f6d` | Magic/corruption accent |
| `--color-witch-600` | `--ky-violet` | `#b314ff` | Deep magic accent |
| `--warning`, `--color-magic`, `--color-gold-400` | `--ky-amber` | `#f5d35c` | Rewards, combo, warnings |
| `--success`, `--color-soul-400` | `--ky-green` | `#33ff99` | Success and restored-state feedback |
| `--error`, `--color-glitch-500`, `--color-corruption` | `--ky-red` | `#ff1a3d` | Error, danger, glitch state |
| `--text-primary` | `--ky-crystal` | `#f3f8ff` | Primary copy |
| `--text-secondary`, `--color-system` | `--ky-mist` | `#c3d4e2` | Secondary copy and labels |
| `--text-dim`, `--text-muted`, `--color-dim` | `--ky-steel` | `#8297aa` | Muted labels and disabled hints |
| `--border-light` | `--ky-line` | `rgba(38, 230, 255, 0.18)` | Subtle active separators |
| Logo/brand gradient | `--ky-logo-gradient` | cyan to magenta | Brand-only mark treatments |

## Tier mapping

The game still uses a five-step diegetic progression model. The reskin changes the color source, not the progression contract.

| Design tier | Player-facing meaning | Kyanite treatment |
| --- | --- | --- |
| Tier 0 | Broken monochrome terminal | White/gray fallback; no animation/audio |
| Tier 1 | Color drivers loaded | `--ky-magenta` + `--ky-violet` magic accents |
| Tier 2 | Audio module online | `--ky-amber` reward accents with Kyanite SFX enabled |
| Tier 3 | Graphics engine optimized | `--ky-green` success/restoration accents with full UI effects |
| Tier 4 | Full sensory suite active | `--ky-cyan` → `--ky-electric` shell/glow gradients plus music |
| Tier 5 content accents | Late-game prestige/readiness | Electric-blue Kyanite emphasis for rare surfaces |

## Font contract

The live Kyanite web contract uses `Space Grotesk` for display/body copy and `JetBrains Mono` for system labels, counters, and command UI. Do not introduce extra display-family dependencies in docs or new UI surfaces.

## QA contract

- `/` and `/play.html` must expose `data-design-system-version="kyanite-1"`.
- Landing CTA backgrounds should resolve to a Kyanite cyan → electric-blue gradient.
- Game-shell base backgrounds and active accents should resolve through the Kyanite tokens above.
- The cast button must remain centered in the baseline viewport so returning players can trust muscle memory after the reskin.
