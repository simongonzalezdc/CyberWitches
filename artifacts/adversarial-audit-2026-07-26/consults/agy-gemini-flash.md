# Consult extract

## Verdict
Hex Compiler possesses a compelling concept—translating spells into hexadecimal code in a world with fading magic—but its current implementation is a fragile house of cards held together by LLM-generated ghost layers and fragmented architectural disconnects. The game suffers from deep architectural bugs (such as a completely non-functional lazy-loading meditation manager and mobile input lockout), visual shortcuts (e.g., calling for fonts that were never imported), branding leftovers from prior projects ("Spellwright"), and massive performance bottlenecks (such as leaking Web Audio nodes on rapid clicking). For the game to reach its high-aesthetic, diegetic potential, the team must sweep out the duplicate legacy code, fix core routing issues, and enforce strict conformity to the Kyanite design system.

## Top 10 must-fix (P0/P1) with rationale
1. **Completely Dead Meditation Tab Initialization (P0):** In [uiManager.js](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/js/modules/ui/uiManager.js#L231-L248) and [lazyModuleLoader.js](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/js/utils/lazyModuleLoader.js#L6-L12), tapping the meditation tab loads `undefined` from the systems registry because `MeditationManager` is never instantiated. Players are trapped in a perpetual skeleton screen.
2. **Complete Touch/Mobile Input Lockout on Tooltip-Enabled Buttons (P0):** In [customTooltips.js](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/js/customTooltips.js#L137-L142), the mobile tooltip attaches a `touchstart` event that calls `e.preventDefault()`. This suppresses native browser `click` event generation, preventing mobile users from clicking "Craft", "Inscribe", or "Cast".
3. **Meditation Wave 1 Infinite Loop (P0):** In [meditationState.js](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/js/meditationState.js#L880-L906), `hasMoved` is checking distance to waypoint (`distance > 0.01`) instead of position delta. If a distraction is stuck, `hasMoved` stays true, continuously resetting `lastMoveTime` and preventing wave completion.
4. **Loss of Meditation Progress and Buffs on Reload (P0):** In [meditationState.js](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/js/meditationState.js#L1506-L1576), state variables (`totalWavesCompleted`, `totalDistractionsKilled`, and `totalSessionsCompleted`) are saved to local storage but never loaded, and `currentWave` is not saved at all. Active progress and production bonuses reset to 0% on reload.
5. **Invisible Boot Sequence Text (P1):** In [tutorialSystem.js](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/js/modules/game/tutorialSystem.js#L127-L131), paragraph elements have initial opacity `0` and use animation `fadeIn 0.1s forwards`. The `@keyframes fadeIn` declaration is completely missing from all stylesheets, rendering the boot screen black for 12 seconds.
6. **Missing Orbitron Typography Assets (P1):** Elements in [play.html](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/play.html) declare class `font-orbitron`, but the Google Fonts import only fetches `Space Grotesk` and `JetBrains Mono`. Text falls back to standard monospace/sans-serif.
7. **Duplicate/Zombie Tutorial Implementations (P1):** Dead copies of `tutorial.js` and `onboarding.js` reside in `js/`, complicating visual/logical routing and code maintenance.
8. **Project Drift and Leftover Branding (P1):** In [start-server.sh](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/start-server.sh#L5), [test-setup.sh](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/test-setup.sh#L3), and the [LICENSE](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/LICENSE#L3), the game is referred to as "Spellwright", highlighting a hasty boilerplate copy-paste.
9. **Broken Achievements Mobile Layout (P1):** In [utilities.css](file:///Users/simongonzalezdecruz/workspaces/CyberWitches/css/utilities.css#L1558-L1565), achievements are hardcoded to two columns (`grid-template-columns: 1fr 1fr`) without media queries, making text squished and illegible on mobile devices.
10. **Design System Version Contract Violation (P1):** Root elements in `index.html` and `play.html` do not expose `data-design-system-version="kyanite-1"`, violating the contract in `docs/design-system.md`.

## Top 10 opportunities (not bugs — leverage)
1. **Dynamic OKLCH Colors:** Build dynamic OKLCH color ramps inside `elementSpecialization.js` for element themes instead of using hardcoded variables.
2. **Synth Sound Pooling:** pre-allocate Tone.js synths/samplers instead of creating HTMLAudioElements repeatedly in `createHarmoniousSoundEffect` to resolve memory bloating.
3. **Real-Time Fading Theme System:** Transition themes smoothly via CSS custom property transitions on the root document instead of swapping class names on `document.body` instantly.
4. **Procedural Grid Maps:** Use seeded randomness in `meditationState.js` to generate procedurally varying paths instead of hardcoded coordinates.
5. **Mobile Navigation Drawer:** Rebuild the sidebar as an off-screen drawer on mobile to reclaim horizontal viewport space.
6. **Offscreen Meditation Rendering:** Run meditation rendering in a Web Worker using `OffscreenCanvas` to keep the main thread smooth.
7. **Rhythmic Casting Combos:** Sync casting combos directly to Tone.js's transport ticks to reward players who cast in rhythm with the music.
8. **IndexedDB Save Validation:** Implement checksum validations in `indexedDBBackup.js` before writing backups to prevent corruption mirroring.
9. **Decoupled Achievements Engine:** Run achievement checking in a web worker or post-tick callback to prevent rapid casting from stuttering.
10. **Custom Binary Save Compression:** Swap the JSON save codec for a lightweight LZW or Huffman binary representation to reduce storage footprint.

## Aesthetic direction (what to keep, kill, invent)
*   **Keep:** Space Grotesk / JetBrains Mono font pairings and the five-step design tier progression concept.
*   **Kill:** Orbitron fallback CSS styling, raw transparent black overlays, hardcoded RGBA colors, static Tailwind utility clones.
*   **Invent:** Real glitch effects on tier transitions using canvas buffer data, SVG-based terminal scanline overlay filters, and custom OKLCH gradient maps.

## Copy direction (voice rules + worst offenders if known)
*   **Voice Rules:**
    1. Maintain strict diegetic tone: you are interfacing with a compiler and system logs, not playing a mobile game.
    2. Avoid third-person or marketing jargon ("Browser Idle Game", "preservation chambers").
    3. Report variables as capitalized registers (`AB_BUFFER`, `FOCUS_CAP`).
*   **Worst Offenders:**
    *   "Spellwright Contributors" in the LICENSE.
    *   "🎮 Starting Spellwright Game Server..." in start scripts.
    *   "Buy permanent upgrades in Inscriptions" (marketing voice).

## Blind spots (what prior audits likely missed)
*   **Audio Node Accumulation:** Prior audits failed to note that every click in auto-cast mode creates a new HTMLAudioElement and wires a fresh MediaElementSourceNode, which fails to get garbage collected because the node connections are not cleared correctly, causing memory to balloon to 5GB.
*   **Service Worker CDN Cache Miss:** The PWA service worker does not cache the Tone.js vendor file properly because it is lazy-loaded, causing the audio system to crash when playing offline.
