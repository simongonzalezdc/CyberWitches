# Research & analysis gap closeout

**Date:** 2026-07-27  
**Companion to:** strategic adversarial analysis (chat session) + `SYNTHESIS.md` / `SPEC.md`  
**Status:** gaps closed with evidence, protocols, or explicit residual unknowns  

---

## Gap register (was → now)

| Gap | Status | Closing artifact |
|-----|--------|------------------|
| Mute-clip comprehension test | **Closed as protocol + decision rule** (not yet field-run) | §1 |
| Competitive teardown (terminal / cyber idle) | **Closed with 5 comps + matrix** | §2 |
| r/incremental_games reception norms | **Closed with community norms synthesis** | §3 |
| Exact time-to-heal / automation targets | **Closed with measurement method + provisional targets** | §4 |
| Market size for terminal-idle | **Closed as strategic market, not TAM spreadsheet** | §5 |
| Mute / silent video constraints | **Closed with silent-video marketing norms** | §1, §6 |
| Share pivot N justification | **Closed with ops rule + re-validation trigger** | §7 |
| Thesis assassin falsification | **Closed with executable test** | §1 |

---

## 1. Mute-clip comprehension test (primary thesis test)

### Why this gap mattered
Social video is often consumed **without sound**. If heal needs a stinger or reading a wall of text, the differentiator dies in feed. Silent-video marketing literature stresses visual story structure, captions, and frame rhythm when audio is absent.

### Protocol (run anytime; 30–45 minutes)

**Stimulus:** 12–15s mute screen capture:
1. 0–3s: Tier 0 monochrome shell (no glow)  
2. 3–6s: EXEC cast / goal rail  
3. 6–12s: tier advance → flash + SYSTEM_RESTORE toast + SYSTEM_LOG line  
4. 12–15s: SHARE_RESTORE visible, full label  

**No voiceover. Optional burn-in captions only if testing captioned variant separately.**

**Sample:** 5 people who have never played Hex Compiler (not idle specialists).  
**Mode:** phone or laptop, **volume off**, one play, no rewind.  
**Questions (in order):**
1. What just happened? (open)  
2. Did the UI change? How?  
3. Would you open the link? Why/why not?  
4. One-word description of the game.

**Scoring:**
- **Pass** if ≥4/5 spontaneously say something equivalent to: system/computer/terminal **fixed / restored / healed / came online**  
- **Soft pass** if ≥3/5 + they identify “game unlocked prettier UI” (skin, not thesis)  
- **Fail** if majority say “numbers went up” / “I don’t know” / only “clicked a button”

**Decision rule:**
| Result | Strategic action |
|--------|------------------|
| Pass | Proceed with visual share spend + community post |
| Soft pass | Increase Tier 0 deprivation + ceremony contrast before growth |
| Fail | Ceremony redesign is blocking; do not post as “heal game” |

**Field status:** Protocol ready; **human field sample not run in this research pass** (requires live subjects). Until run, thesis uniqueness remains **medium–high confidence from design logic, not empirical**.

**Capture-the-heal runbook:** frozen stimulus + scoring sheet live at `../capture-the-heal/MUTE_CLIP_RUNBOOK.md` (ticket 01). Field n=5 still HITL (`../capture-the-heal/FIELD_MUTE_CLIP.md`).

---

## 2. Competitive teardown — terminal / cyber idle (itch + genre)

### Method
Itch browse: tags **cyberpunk + idle** (live listing sample, 2026-07). Cross-check with cyberpunk+terminal and hacking listings. Depth is **mechanic vs skin**, not review scores.

### Landscape snapshot
Itch surfaces many titles pairing cyberpunk *skin* with idle *loop*: Cyber Idle, Idlepunk, Void Protocol, Cybroria, Chrome Fixer, Neon Scrap Syndicate, etc. Separately, pure **terminal OS simulators** (e.g. NETBREAK-class: game *is* the terminal, not an idle HUD).

### Teardown matrix

| Title (sample) | Core loop | UI role | Differentiator claim | Threat to Hex |
|----------------|-----------|---------|----------------------|---------------|
| **Chrome Fixer** (punkerlab) | Contracts, scrap, chrome builds, jobs | Cyberpunk *theme* over idle playtest | Build paths / job discovery | Medium — same aesthetic neighborhood; **chrome as gear**, not UI recovery |
| **Cyber Idle** (Errahs) | Power, upgrades, cyberpunk incremental | Skin + standard idle | “Cyberpunk incremental” | Medium volume, **low thesis uniqueness** |
| **Idlepunk** | Idle + cyberpunk branding | Skin | Brand only unless deeper systems | Low–medium |
| **Void Protocol** | Cyberpunk idle RPG | Themed systems | RPG layer | Medium for retention depth, not for heal-share |
| **NETBREAK-class** | Hacking sim as OS | Terminal *is* the game | Diegetic OS, not idle generators | Different genre — competes for **aesthetic attention**, not loop |
| **AD / Cookie Clicker** | Prestige math / joke numbers | Minimal / meme art | Depth / humor | High for *depth players*, not for heal thesis |

### Mechanic vs skin finding
**Oversupply:** cyberpunk / neon / terminal *looks*.  
**Undersupply:** UI **state as progression reward** (broken → restored as the win condition).

Chrome Fixer is the closest *linguistic* neighbor (“chrome”), but framing is **install chrome / builds**, not **the interface itself recovering as magic is preserved**. Hex’s thesis remains **uncontested as a primary scoreboard** if heal is capturable.

### Strategic implication
Do not out-cyberpunk the cyberpunk idles. **Out-capture** them: one still/GIF where the UI is the story.

---

## 3. r/incremental_games reception norms

### Evidence (community structure)
From subreddit-facing posts and Feedback Friday pattern:
- Heavy volume of **“I made this game”** posts; community pushback exists.
- **Feedback Friday** is the sanctioned WIP / feedback lane.
- Guidance pattern: prototypes/screenshots → feedback thread; **own thread when game is playable** (not just a concept screenshot).
- Related patterns: Mind Dump Monday-style idea dumps; flair and automod matter for self-promo.

### Operational norms for Hex posts

| Stage | Where to post | What the first frame must show |
|-------|---------------|--------------------------------|
| WIP / “is this different?” | Feedback Friday | One screenshot of **Tier contrast** or heal toast + log |
| Playable browser demo | Own post (if rules allow that day) | Playable link + **first image = heal**, not feature laundry list |
| Idea only | Mind Dump / feedback — not main | No launch claims |

**Reception risk:** “Another cyberpunk idle” if first screenshot is neon generators without broken→healed.  
**Reception opportunity:** Explicitly claim **UI recovery as prestige** in title or first line; community rewards *sharp mechanic identity*.

**Rule of thumb:**  
> If the first screenshot doesn’t show the differentiator, the post is competing as generic idle and will lose.

---

## 4. Time-to-automation / time-to-heal targets

### Measurement method (instrumentable)

| Metric | Definition | How to measure |
|--------|------------|----------------|
| **TTA** time-to-automation | First workstation craft (`ws_fire_forge` count ≥ 1) from fresh save | `performance.now()` or Date.now from first `gameState` after clear LS; log on craft |
| **TTH** time-to-heal | First `hex:tierAdvance` with toTier ≥ 1 from fresh save | Listener on event; exclude debug force-unlock in prod metrics |
| **TTG** time-to-goal-visible | Goal rail unhidden after tutorial complete | `compileGoalUI` first visible |

**Sample protocol:** n=10 fresh runs (human or scripted semi-auto), report p50 / p90.

### Data-informed provisional targets

**Fire Forge:** unlock at AB 0; recipe **10 fire essence** (code: `producers.js`). Operator e2e reaches craft after ~20 EXEC clicks when essence accrues — **active-play TTA is minutes, not hours** if cast yields are healthy.

| Metric | Provisional target | Rationale |
|--------|--------------------|-----------|
| TTA p50 | **≤ 8 minutes** active | Idle research: first victories fast; 10 essence is a short cast ladder |
| TTA p90 | **≤ 15 minutes** | Campaign ticket 09 default band |
| TTH p50 | **Instrument first**, then aim **≤ 25–40 minutes** active OR first return session | Tier criteria (AB + achievements) may intentionally lag pure forge craft — **do not force heal into first 5 minutes** or restore loses meaning |
| TTH without instrumentation | **Unknown** | Gap closed *methodologically*; numeric target is **provisional until n≥10** |

**Anti-target:** Do not optimize TTH to “as fast as possible.” Heal must feel *earned*. Optimize **noticeability** and **share**, not speed alone.

---

## 5. Market size for terminal-idle (strategic, not vanity TAM)

### What can be said with evidence
- Idle/incremental is a **proven sticky genre** (higher stickiness / sessions vs many hyper-casuals in industry writeups).
- Cyberpunk+idle on itch is a **crowded tag**, mostly skin-on-idle.
- Pure terminal OS games are a **separate niche** (hacker sim / diegetic OS).
- Browser freemium discovery is hard; itch play counts for week-long prototypes can reach thousands when the idea is sharp, but **conversion is not guaranteed**.

### What cannot be said honestly
- Precise $ TAM for “terminal recovery idle” — **no reliable public segment size**.
- Guaranteed viral ceiling for heal clips.

### Strategic market definition (use this)
**Addressable audience = intersection of:**
1. Idle/incremental curious (Reddit, itch, Steam later)  
2. Aesthetic/terminal/cyberpunk curious  
3. Willing to try **browser freemium with no pay-wall**  

**Moat is not market size — it is position uniqueness inside a crowded aesthetic.**  
Growth model: **niche share → D1 competence → optional Steam after D1 evidence**, not mass UA spend.

---

## 6. Silent / mute constraints (closes “flashy needs audio” trap)

Silent-video marketing practice: structure the story visually; captions optional; **do not depend on sound for the hook**.

| Layer | Mute requirement |
|-------|------------------|
| Ceremony | Color / outline / log line must carry alone |
| Share card | Split before/after readable at phone width |
| Stinger | Enhancement only (Tier 2+), never sole signal |
| Landing | Autoplay loop must work muted |

This **upgrades** the priority of visual share + ceremony over more SFX polish.

---

## 7. Share pivot N (re-justified)

**Ops rule already recorded:** N = **50** combined share/attempt + organic heal posts in 30 days after heal is on main; if miss → stop virality spend, reinvest in noticeability/pacing.

**Research closeout:**
- N is **operator-chosen threshold**, not industry standard.  
- Re-validate N after **visual** share ships (text share alone under-tests the thesis).  
- Track separately: `shareAttempt` (local), public posts (manual), clip views if any.

---

## 8. Updated confidence table

| Claim | Was | Now | Notes |
|-------|-----|-----|-------|
| Idle D1 needs early competence | High | **High** | Reinforced |
| Visual share is missing growth atom | High | **High** | Competitor matrix supports capture gap |
| Ceremony > more systems | High | **High** | Mute constraints reinforce |
| 15s mute comprehension is right thesis test | Med–high | **High as method**; field sample pending | Protocol §1 |
| Exact TTH number | Medium | **Medium** (method solid; number provisional) | §4 |
| Terminal-idle market size | Low–med | **Strategic niche (position > TAM)** | §5 |
| Thesis unique vs progressive UI | Medium | **Medium–high vs cyber idles**; empirical clip test pending | §2 + §1 |

---

## 9. Residual unknowns (honest, small)

1. **Field mute-clip scores** — need 5 humans (§1).  
2. **Live TTH p50** — need instrumentation + n≥10.  
3. **Reddit post performance** — unknown until Feedback Friday / playable post.  
4. **Chrome Fixer / Void Protocol deep play** — teardown is catalog-level, not 2h playthrough; low risk of missing a hidden “UI heal” mechanic but not zero.

None of these block the strategic recommendation: **Capture the heal** (ceremony + visual artifact + instrument TTA/TTH).

---

## 10. Decision log (analysis complete)

| Decision | Value |
|----------|--------|
| Next campaign shape | Capture the heal |
| Do not open | Feature soup / multi-currency / Steam-first |
| Community path | Feedback Friday → playable post with heal-first screenshot |
| Growth spend | Only after mute-clip pass **or** visual share ships + re-measure pivot |
| Success falsifier | Mute-clip fail OR 30d shares << N after visual share |

**Research phase status: CLOSED** for strategic planning. Remaining items are **execution or field tests**, not desk research.
