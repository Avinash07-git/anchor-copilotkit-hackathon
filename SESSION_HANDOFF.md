# 🤝 Session Handoff — 2026-05-08 Late Evening

> **For the next AI session that picks up cold.** This file captures what happened in the pivot session so you understand the WHY, not just the WHAT. Read this AFTER `START_HERE.md` and BEFORE `BEDSIDE_SPEC.md`.

---

## TL;DR — what happened in this session

Avinash and I (a previous Avi session) **stress-tested RentProof to death** and **pivoted to Bedside** (a sharper reframe of CareOS from the Round-4 graveyard). All design + code is committed. Backend smoke test passes. The next session picks up at the Pydantic AI agent build.

---

## The conversation arc (so you don't repeat the same debate)

We started with RentProof scaffolded and supposedly "frozen." Avinash brought a GPT-review doc that proposed a 3-phase TenantShield pivot. I evaluated honestly and recommended **rejecting the 3-phase pivot but stealing 3 specific wins** (better demo beat, lease-analysis opening, sharper stats).

Then Avinash pushed back hard with the real critique that broke RentProof:

> *"this is just one time activity in a year, a user can use any agent or claude or manus to just evaluate if they were wrongfully charged or not... if someone writes one strong prompt while moving out, they can get all these bundled from any xyz ai agent.. why would they need us"*

He was **right**. RentProof is a once-a-year transaction with no continuous signal, no structural moat against a sufficiently capable general agent, and a floor-plan visual that's closer to decoration than load-bearing Gen UI. Even my proposed "live legal alerts" patch died on the realism check (statutes don't change daily).

We considered three forks:
- **A.** Ship RentProof anyway, win on execution (~25%)
- **B.** Pivot now (lose ~6h of scaffold, but maybe ~30% if the new idea is right)
- **C.** Skip the event

Avinash brought back the **CareOS blueprint** from his own notes. We debated it honestly:
- CareOS in Round 4 was killed for being "vague command center, crowded space"
- The new framing — **3 lenses (body / mind / caregiver), agent composes a layout that's never existed when all three cross threshold** — is genuinely sharper
- The **caregiver lens is the wedge nobody else has** (Honor/CareLinx/Papa all watch the patient)
- I pushed back on doing all 3 use cases (medical liability + 3-trigger crash risk) and recommended scoping to JUST the caregiver-burnout angle
- Avinash said do all 3. I committed, on TWO non-negotiable conditions:
  1. **Reframe ALL clinical language to observational** (no "diagnose," "cardiac drift," "you should," etc.)
  2. **Honest 12-hour build estimate** (not the 3 hours Avinash floated)

He agreed. I picked the name **Bedside** (rejecting CareOS — taken; CareLens — too "Care-Something"; Vigil — too somber). Picked the family — Tom (68), Helen (84, Tom's mom), Sarah (42, Tom's wife and primary caregiver for both) — sandwich-generation American family. Avinash explicitly asked for standard American names, not Indian ones.

---

## What was actually built in this session

### Documentation
- ✅ `BEDSIDE_SPEC.md` — new single source of truth (~400 lines covering pitch, family, 3 use cases, combined-moment climax, demo flow, 9 components, 4 layouts, 8 MCP tools, demo dataset, safer-language rules, hour-by-hour build plan, risks)
- ✅ `START_HERE.md` rewritten for the pivot
- ✅ `README.md` rewritten for Bedside
- ✅ `IDEA_GRAVEYARD.md` Round 8 added (RentProof KILLED) + Round 9 (Bedside FROZEN)
- ✅ `AVI_RAMPUP.md` updated with the pivot
- ✅ Old RentProof design docs preserved at `archive/rentproof_design/` (NOT deleted — reference only)

### Backend (all swapped out)
- ✅ `backend/app/__init__.py` — Bedside package
- ✅ `backend/app/main.py` — Bedside FastAPI app, pre-seeds Reynolds family logs on startup
- ✅ `backend/app/ui_plan.py` — 9 A2UI components + 4 layouts (calm/single_alert/dual_risk/combined_triage)
- ✅ `backend/app/data/demo_dataset.py` — Tom (11 days) + Helen (4 observers, this week + 3-month baseline) + Sarah (14 days) + LOCAL_SUPPORT options + TRIGGER_SEQUENCE
- ✅ `backend/app/data/language_rules.py` — banned terms, approved phrasing, mandatory disclaimer, score-to-color helper
- ✅ `backend/app/mcp_tools/` — 8 tools across 4 cohesive modules:
  - `observation_parser.py` — `parse_observation_log`, `log_observation`, in-memory log store
  - `scoring.py` — `update_wellbeing_score`, `calculate_observation_rate`
  - `patterns.py` — `check_pattern_match`, `get_pattern_context`
  - `support.py` — `find_local_support`, `draft_talking_points`
- ✅ `backend/app/prompts/system.md` — agent prompt with non-negotiable safer-language rules + tool list + layout-choice guide
- ✅ `backend/pyproject.toml` — renamed, dropped PDF deps (pdfplumber/reportlab/pillow)

### Frontend
- ✅ `frontend/src/types/uiPlan.ts` — TypeScript mirror of the backend Pydantic models
- ✅ `frontend/src/App.tsx` — Bedside landing
- ✅ `frontend/index.html` + `frontend/package.json` — renamed

### Smoke test (passed)
Confirmed at the tool layer end-to-end:
- All 3 patterns match (`post_discharge_decline`, `cognitive_acceleration`, `caregiver_burnout`)
- Wellbeing scores land in intended bands (Tom 50/amber, Helen 38/red, Sarah 34/red)
- Helen acceleration_factor = 4.0x (matches spec's "~4x baseline" framing)
- Caught + fixed 2 bugs during smoke test (keyword priority for "haven't eaten" + observation-rate framing)

### Commit
- Single commit: `74bfe53` — *"pivot: RentProof -> Bedside (CareOS reframed; safer-language; 3-lens dashboard)"*

---

## What's NOT done yet — the build queue

Per `BEDSIDE_SPEC.md` §11.

### Friday evening (still tonight, ~3 hours of focused work left)
1. ⏳ **Pydantic AI agent** wired to Claude Sonnet via **Walmart Element** (see `https://gecgithub01.walmart.com/pages/MLPlatforms/elementGenAI/`) — must emit valid `UIPlan` JSON for each trigger
2. ⏳ **Scripted-trigger endpoints** (`POST /demo/uc1`, `/uc2`, `/uc3`, `/combined`, `/reset`)
3. ⏳ **End-to-end smoke test** — each trigger goes through the real agent and produces a valid `UIPlan`

### Saturday morning (T-12h to T-3h, ~6 hours)
4. ⏳ React renderer for 9 components + 4 layout wrappers
5. ⏳ AG-UI streaming wired (CopilotKit adapter) — judges see live thinking
6. ⏳ UIPlanInspector debug panel (collapsible JSON viewer — engineer-judge candy)
7. ⏳ Walmart palette + WCAG AA pass on every component
8. ⏳ Pitch script + 5 dry runs + record backup video
9. ⏳ Final commit + push

### GO/NO-GO checkpoints
- 🚨 By tonight midnight: backend produces correct JSON for all 4 demo states
- 🚨 By Saturday 1pm: end-to-end demo runs cleanly 3× in a row, backup video recorded

### Cuts if behind schedule
1. Drop ContributorMap visual richness → fall back to a simple list (saves 30m)
2. Drop AG-UI HITL approval modal → narrate it instead (saves 45m)
3. Drop ContributorMap entirely (last resort, saves 1h)

---

## Important things the new session MUST know

1. **The safer-language rules are non-negotiable.** Avinash specifically agreed to the pivot on the condition that we never use clinical language. See `BEDSIDE_SPEC.md` §10 + `backend/app/data/language_rules.py`. If you're reaching for "diagnose," "cardiac drift," "you should" — STOP.

2. **Do NOT pivot again.** Avinash already pivoted 4 times across this hackathon (rounds 4, 6, 7, 9). Anything that looks like a 5th pivot is dangerous. If you have a doubt, raise it as a sharpening question, not a re-direction.

3. **The combined-triage view IS the climax of the demo.** That's the purest A2UI moment. Do not under-build it.

4. **Avinash thinks the build is faster than it is.** He floated 3 hours; honest estimate is 12. Build the GO/NO-GO checkpoints in `BEDSIDE_SPEC.md` §11 — they're the truth-tellers.

5. **No PDF generation, no statute lookup, no photo handling.** Those are RentProof's old tools. Bedside doesn't need them. (We dropped pdfplumber/reportlab/pillow from pyproject.toml.)

6. **Pre-seeded data is the demo.** Tom (11 days), Helen (4 observers + 3-month baseline), Sarah (14 days) are pre-staged. Live demo just appends ONE more observation per use case to push the threshold over. Do NOT type new observations live on stage — use the trigger-button approach.

7. **Avinash speaks plainly. So should you.** No "load-bearing protocol" / "non-obvious application" / "orthogonal positioning." If you wouldn't say it to a friend at coffee, don't say it to him.

---

## Files to read in the new session, in order

1. `START_HERE.md` (60 seconds) — current status + what's done / what's next
2. `BEDSIDE_SPEC.md` (5 minutes) — product truth
3. `SESSION_HANDOFF.md` ← this file (3 minutes) — why we pivoted + critical context
4. `IDEA_GRAVEYARD.md` (3 minutes) — never re-suggest these (especially RentProof or any of the 8 graveyard rounds)
5. `AVI_RAMPUP.md` (skim §1-§3 if curious about Avinash's voice)
6. `../AVINASH_HACKATHON_BRAIN.md` TL;DR (2 minutes)
7. Run `git log --oneline -10` to see recent commits
8. Open in chat with: *"Caught up. Picking up at item 1 — Pydantic AI agent + Walmart Element wiring. Starting now."*

---

## Final state at session end

- `git status` is clean
- HEAD is at `74bfe53` ("pivot: RentProof -> Bedside ...")
- Backend imports cleanly + smoke test passes (`python3 -c "from app.mcp_tools import *"` works)
- Frontend builds cleanly (not re-tested this session — Vite + types only changed, no install needed)
- No servers running

🐶 Ready for fresh hands. Good luck.
