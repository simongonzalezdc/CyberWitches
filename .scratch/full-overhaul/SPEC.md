# SPEC — Hex Compiler Full Overhaul (v2)

**Status:** approved · PRD published · tickets ready-for-agent  
**Date:** 2026-07-27  
**Mode:** brainstorm → wayfinder → ralplan (deliberate)  
**Codename:** **Hex Compiler: Restoration Kernel**

---

## §0 What this is

A **full product + systems + tech overhaul** of Hex Compiler: not a growth campaign, not UI-only polish, not a “first 30 minutes” micro-slice. Rebuild the **game experience** (fantasy, decisions, progression, narrative, side systems) and the **technical substrate** (domain model, tick, content, UI architecture) so the game is competitive with **cutting-edge 2026 incremental/idle design** while remaining a **browser-native, privacy-first PWA**.

**North star:**  
> You feel magic dying under your hands, and every automation, prestige, and specialization is a **moral-technical act of preservation** — not a reskin of “numbers go up.”

---

## §1 Goals

1. **Play identity:** First prestige feels like finishing a short game and starting a better one.  
2. **Decision density:** Every major purchase and prestige choice has a tradeoff a skilled player can name.  
3. **Fantasy = mechanics:** Fading / preservation / compilation change *what you optimize*, not only chrome.  
4. **Narrative as progression:** Chaptered storylets tied to real gates.  
5. **Depth without menu soup:** Fewer, sharper systems; Meditation and specialization earn their seats.  
6. **Cutting-edge craft:** Pure domain Kernel, typed content, deterministic sim, a11y-first, offline-first.  
7. **Keep soul:** Terminal diegesis, no-gacha ethics, local save, design-tier heal as **earned celebration**.

### Non-goals

Steam-first; required accounts; gacha / P2W; dual primary quest HUD; realtime multiplayer; framework swap for fashion; deleting the entire art/audio identity without replacement.

---

## §2 Player fantasy

| Layer | v1 today | v2 overhaul |
|-------|----------|-------------|
| Premise | Magic fades | Last addressable hex-grid is losing magic cells |
| Role | Job title | Compiler with a prior failed sector |
| Core metaphor | UI heals | Preservation architecture: store, throughput, decay, purity |
| Emotion | Cool skin | Urgency → competence → sacrifice → rebirth |
| Arc end | Tier 4 chrome | Stable Kernel with residual scars |

---

## §3 Core gameplay redesign

### §3.1 Primary loop (seconds)
**EXEC** — always-on compile pulse → essence streams + progress currency (clarify AB naming in architecture sprint). Crits/overclocks stay diegetic system events.

### §3.2 Secondary loop (minutes) — Pipeline roles
Replace parallel “+% shop” with roles:

| Role | Function |
|------|----------|
| Capture | Pull essence from fading ambient |
| Store | Capacity vs fade |
| Bind | Multi-essence → Aether / purity |
| Compile | Stock → stable progress (reactors) |
| Shield | Slow global fade (scarce) |

### §3.3 Resource physics (one law)
**Default: Soft Fade + Storage.** Unstored essence decays slowly (visible, offline-fair, soft early). Storage raises caps / cuts decay. Over-capacity reads as “lost to the void.” Optional later: purity/corruption for specialization.

### §3.4 Goals
One primary directive rail. No dual HUD. Goals are **story-backed contracts** (chapter beats), not a tour of menus.

### §3.5 Prestige
Taught EV (projected keys, recommend band). Fantasy: abandon spent plane, keep Kernel fragments + Affinity. First prestige guarantees a sharp toy. Ceremony previews persist/reset.

### §3.6 Specialization
Foreshadowed by pre-prestige build bias. Four asymmetric **strategies** (pipeline preference), not only mult tables.

### §3.7 Meditation
Optional post-prestige mastery. First session ≤3 min, unmissable production payoff. Pure-idle alternate smaller bonus.

### §3.8 Design tiers
Keep as celebration. Rebind to chapter + skill milestones. Heal ceremony stays mute-readable **reward**, not the product center.

### §3.9 Dailies / achievements
Achievements = long tail. Dailies = optional gift. Cap simultaneous asks: 1 primary + 1 optional.

---

## §4 Narrative — storylets + qualities

Fallen-London-lite: 50–120 word cards gated by qualities; rare A/B choices; specific terminal lyricism (ban generic idle apocalypse prose).

### Chapter spine
0 Boot → 1 First capture → 2 Storage/fade → 3 Binding → 4 Self-hosting reactor → 5 Exhaustion/prestige teach → 6 Prestige 1 / affinity → 7 Meditation optional → 8+ path depth.

---

## §5 Content strategy
- ≤16 core pre-prestige modules; path trees after.  
- ≤20 early inscriptions with clear roles.  
- Collapse elemental clone ladders into roles or path locks.  
- ~40–80 storylets.

---

## §6 UX
Pipeline view (columns or graph) + power-user list. Terminal diegesis retained. A11y first-class. Mobile one-thumb EXEC. Heal/share retained as celebration/export only.

---

## §7 Tech architecture

### Kernel (pure)
Resources · Pipeline · Progress (chapters/qualities) · Prestige · Tick · Domain events.  
`state + dt + seed → state' + events`. UI projects; does not own rules. Content schema-validated in CI. Versioned migrations.

### Stack
TypeScript strict for Kernel (strangler from JS OK). Vanilla or thin signals — no mandatory SPA rewrite. esbuild PWA. Playwright + pure Kernel tests + property tests on curves. Worker tick only if profiled need.

### Privacy
Local-first save; local funnels; no gacha; no dark streaks.

### Future
Machine-readable schema; tick replay for balance QA.

---

## §8 Success metrics
| Metric | Target |
|--------|--------|
| p50 time to first automation | ≤5 min |
| p50 time to first prestige | 45–90 min (tune) |
| Prestige rate among reactor-reachers | ≥40% |
| 10-min “knew what to do” playtest | ≥4/5 |
| Story image recall | ≥3/5 |
| Can name a tradeoff | ≥3/5 |

---

## §9 Constraints
**Forbidden:** gacha, third hostage currency, dual quest HUD, Steam-before-proven-core, required accounts.  
**Allowed now:** Kernel rewrite, content graph rewrite, narrative engine, fade/storage, pipeline IA, TS critical path.

---

## §10 Locked decisions
1. Full product+tech overhaul (not growth).  
2. Fantasy center = preservation physics + compilation; UI heal is celebration.  
3. Narrative = storylets + qualities + chapters.  
4. Economy = pipeline roles.  
5. One resource law: soft fade + storage (default).  
6. Pure Kernel + typed content + gradual TS; vanilla-first UI.  
7. Prestige taught; Meditation optional.  
8. Local-first / no gacha / no dual HUD.  
9. Holistic vision; waves only for delivery of the whole.  
10. No code until user approves RALPLAN.

### Open
AB naming; pipeline UI form; fade magnitude; TS big-bang vs strangler.

---

## §11 Deliverables when built
Playable Restoration Kernel through Prestige 1 + Meditation intro; validated content pack; Kernel test suite; manual + story bible; legacy deprecation path.

*End SPEC.*
