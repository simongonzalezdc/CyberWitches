# CyberWitches / Hex Compiler — Outside Perspective Consult

You are an adversarial external critic. Be ruthless. Do NOT praise without naming concrete failures. Prefer specific file/system findings over generic advice.

## Product
Browser idle/incremental game: Hex Compiler (repo CyberWitches). Theme: magic is fading; player is a Hex Compiler translating magical hexes into hexadecimal code. Diegetic UI: Tier 0 monochrome glitch → Tier 4 full sensory restoration. Vanilla JS ES modules, esbuild, Tone.js audio, PWA, Kyanite design system (kyanite-1).

## Key surfaces
- Landing: index.html
- Game: play.html + js/game.js + js/gameState.js (1614 lines) + js/audioSystem.js (3904 lines)
- Design system: docs/design-system.md, styles/, css/
- Meditation mini-game: meditationState.js, meditationTowers.js
- Persistence: js/save/saveCodec.js + localStorage + IndexedDB

## Your job
Produce a ranked list of issues and improvements across:
1. Game design (loops, progression, retention, clarity, dead systems)
2. Aesthetics / visual identity (AI slop, diegetic honesty, polish, mobile)
3. Copy quality (human voice, AI tells, terminal diegesis vs marketing)
4. Technical smell (from reading structure if you can)
5. Blind spots / unknown unknowns

Format:
## Verdict (1 paragraph, harsh truth)
## Top 10 must-fix (P0/P1) with rationale
## Top 10 opportunities (not bugs — leverage)
## Aesthetic direction (what to keep, kill, invent)
## Copy direction (voice rules + worst offenders if known)
## Blind spots (what prior audits likely missed)
