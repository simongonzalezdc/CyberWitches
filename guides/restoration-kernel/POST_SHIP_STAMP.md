# Post-ship docs stamp (Pattern B)

**Why:** Code on `main` is not “done” while QUALITY_REPORT / CLAIM_AUDIT still describe last week’s tip. Same-session stamp keeps S+ claims falsifiable.

**When (any one is enough):**

- Feature/fix PR **merged** to `main` that changes Kernel, fade, ownership, pipeline HUD, quality gates, or player-facing mechanics/copy
- Semver / GitHub Release cut
- “We’re done” / overall S+ / production claim about to be said in chat or a PR

**When not:** pure typo docs, comment-only, or scratch under `.scratch/` with no product claim.

## Same-session checklist (do before context ends)

```bash
git fetch origin main && git checkout main && git pull origin main
TIP=$(git rev-parse HEAD)
SHORT=$(git rev-parse --short HEAD)
echo "tip=$TIP short=$SHORT"
date -u +%Y-%m-%d
```

1. **[ ] Tip SHA** — `QUALITY_REPORT.md` header: `main tip` / overall PASS line = **this** `TIP` (full or short, be consistent).
2. **[ ] Date** — stamp date is **today** (UTC fine).
3. **[ ] CLAIM_AUDIT.md** — `main tip` + **Last updated** match; feature table reflects what actually shipped (no pre-merge branch names).
4. **[ ] Block table honesty** — Eng / Product / Systems / Identity rows only **PASS** with evidence you can re-run; else FAIL/STALE and do not claim overall S+.
5. **[ ] QUALITY_BAR** — only edit if gates changed; if you change gates, note why in CLAIM_AUDIT residuals.
6. **[ ] CHANGELOG** — Recent Changes mentions the ship if player-visible (link PR if useful).
7. **[ ] One commit or PR** — e.g. `docs(stamp): tip <short> after #<pr>` — merge before declaring campaign closed.

Optional: `bash scripts/post-ship-stamp.sh` prints a filled template.

## Forbidden (stale tells)

- Branch names as tip (`feat/…`) on QUALITY_REPORT after merge  
- “Prior session” / “prior 96” as sole Q5 evidence after a visual ship  
- package version lying (e.g. claim 1.0.0 when package.json is 1.1.0)  
- Overall S+ without all four blocks PASS on the **same** tip  

## Success line

Docs tip === `origin/main` tip, and CLAIM_AUDIT would survive a hostile “prove it” audit.
