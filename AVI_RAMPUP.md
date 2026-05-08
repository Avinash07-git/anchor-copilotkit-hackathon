# 🧠 AVI RAMPUP — Generative UI Hackathon (Hack #3)

> **Fresh AI session?** Read `START_HERE.md` first (60 seconds), then `RENTPROOF_SPEC.md` (the source of truth). This file is the JOURNEY/CONTEXT — useful background but secondary.
>
> **Companion file:** `../AVINASH_HACKATHON_BRAIN.md` (cross-event persona + patterns + anti-patterns)
> **Last updated:** 2026-05-07 evening · **Status:** 🟢 IDEA FROZEN — RentProof · **Event:** Saturday 2026-05-09 — **2 DAYS OUT**

---

## 🚨 HOW TO TALK TO AVINASH (read every session)

1. **Plain English. No jargon.** "Load-bearing protocol" / "non-obvious application" / "orthogonal positioning" → all banned. Use analogies. Talk like a friend at coffee.
2. **Use Rita Sharma in examples, NOT "your mom".** Avinash explicitly asked for this.
3. **Don't bug him about non-actionable info.** City, URL, judging tier, judge bios — he handles those.
4. **Be decisive but not stubborn.** Lead with a recommendation. When he pushes back, take it seriously, go think harder, come back with genuinely better — don't defend lazy work.
5. **He pushes hard. That's the gift.** Every pushback has made the work better. Don't get discouraged; level up.
6. **Tight responses.** When he asks a clarification, don't give 5 tables. One paragraph plain English, end with a clear question.
7. **No toys. No cliches.** Run every idea through the filters in the next section before pitching.

---

## 🧪 THE FILTERS — apply to every idea

| Filter | Question | Fail = kill the idea |
|---|---|---|
| **Two-prompts-away test** | Could a competent builder arrive at this idea after 2 ChatGPT prompts? | If yes, kill. |
| **Agentic test** | Does the AI actually DO substantial work (research, multi-step reasoning, tool calls, synthesis), or is it just "transcribe input → render output"? | If transcription, kill. |
| **End-to-end smoothness test** | Does the journey from "user lands" to "user wows" feel like a shipped product? | If hack-y, redesign. |
| **Dollar-impact test** | $B+ market hit? | If not, judges won't lean forward. |
| **SmartNourish quality bar** | Hits 5+ of: continuous signal, multimodal, agent reasoning, human-in-loop, real action, behavior change, generative UI? | If <5, kill. |
| **6-winners pattern** | Sharp named thing + killer visual metaphor + real data source + tangible output? | If missing, kill. |
| **Avinash life-related** | Does Rita Sharma (non-technical person) get it? B2B/dev tooling? | If only engineers care, kill. |

---

## 🔥 STAKES — READ THIS FIRST

> *"Winning will give me firm credibility within Walmart. I want to win. Mac Minis are non-negotiable."* — Avinash, 2026-05-06

This isn't just another hackathon. This is the **credibility unlock** for Avinash inside Walmart. Every decision in this file is biased toward WIN, not toward "good showing."

---

## 🎯 TL;DR

- **Event:** The Generative UI Hackathon (A2UI + AG-UI + MCP Apps) — global, 18 cities (SF for us)
- **Date:** Saturday 2026-05-09 · **Venue:** San Francisco · **Status:** ✅ Accepted
- **Build window:** **2 remaining days of pre-build (Thu–Fri) + 4 hrs polish on Saturday (1–5 PM)** + 1 hr submission buffer
- **Demo:** 5:00 PM — 2-3 minutes, **working code only**
- **Mode:** SOLO
- **Mandatory stack:** Google A2UI + CopilotKit AG-UI + Manufact MCP Apps (mcp-use)
- **Judges:** Engineer-heavy (protocol creators speaking at kickoff)
- **Prize we want:** 🥇 Mac Minis — the win, not the runner-up Ray Bans
- **🟢 LOCKED IDEA: RentProof** (see `RENTPROOF_SPEC.md` for full spec)

---

## 📋 EVENT DETAILS

### Format
| Time | What |
|---|---|
| 12:00 PM | Doors open · check-in · food · team-up |
| 12:30 PM | Global kickoff video — A2UI / AG-UI / MCP Apps creators walk through the spectrum + tracks |
| 1:00 PM | **Build starts.** Starter kits + credits distributed |
| 5:00 PM | Show & tell — 2-3 min demos, **working code only** |
| 6:00 PM | Submissions close |

### Sponsors / mandatory tooling
| Sponsor | Their protocol |
|---|---|
| **Google DeepMind** | **A2UI** — open-source protocol letting agents send fully interactive UI components instead of plain text |
| **CopilotKit** | **AG-UI** — agentic frontend protocol; adopted by Google, AWS, MS, Oracle, LangChain, Mastra, PydanticAI |
| **Manufact** | **MCP Apps** — fullstack open-source framework via mcp-use (TS + Python); auto-discovery for interactive widgets |

### Prizes
- 🥇 **Mac Minis** for the winning team
- 🥈 **Meta Ray Ban Glasses** for the runner-up team

### Starter repo
Drops 24-48hr pre-event in Discord/Luma email. Avinash will forward when received.

---

## 🛤️ THE IDEA-SELECTION JOURNEY (so future-me doesn't redo this work)

> Full kill list lives in `IDEA_GRAVEYARD.md`. Summary here.

### Round 1 — Axis-of-weird brainstorm (9 ideas, all KILLED)
Top picks were Agent Inspector and Anti-Dark-Patterns. **Killed:** *"All boring topics. Too cliche."*

### Round 2 — Senior Bay Area founder reframe (5 ideas, all KILLED)
DealRoom AI, 911 Dispatch, SF Permits, Clinical Trials, Disaster Insurance. **Killed:** *"Still too cliche. Couple more prompts, people arrive at these. Looks like Claude Code with a UI on top."* — failed agentic test.

### Round 3 — Agentic finalists (5 ideas, all KILLED)
DiligencePartner, GrantHunter, IncidentRoom, TenderFlow, LitigationDeck. **Killed:** Too B2B/enterprise. Avinash wanted life-related, not "tools for engineers/lawyers/VCs."

### Round 4 — Manus + ChatGPT pivots (~10 ideas, all KILLED)
AgentProof, ActionGate, CareOS, LayoffLifeline, AfterCare, EstateClear, DenialShield, AccessFlow, FieldOS, LaunchRoom, TraceRoom, GenUI Flight Recorder. **Killed:** Either too technical (dev tooling), too crowded (CareOS = Honor/CareLinx exists), or too narrow.

### Round 5 — SmartNourish discovery + life-related pivot (3 ideas, all KILLED)
Avinash showed us SmartNourish (last year's winner of an AI Tinkerers Humans-in-the-Loop hackathon — CGM glucose + meal photos + Instacart integration). This became the QUALITY BAR.

Pitched: PediPulse (kid symptom triage), WreckRoom (post-car-accident), TripTriage (travel crisis). **Killed:** PediPulse = liability + cousin to CareOS. WreckRoom = no killer visual. TripTriage = less universal.

### Round 6 — Sharp-visual pivot from 6-winners pattern (3 ideas, 2 KILLED, 1 SURVIVED)
Avinash showed us 6 actual winning hackathon projects (Blue Lens, Willmaker, Dental Tracks, Road Patrol, Project Cade, Skillsprout). Decoded the pattern: **sharp named thing + killer visual metaphor + real data source + tangible output + screenshot-in-5-words test.**

Pitched: PillLines (drug interaction calendar with red lines), ShotMap (vaccine constellation on body silhouette), DepositBack (color-coded floor plan for deposit recovery).
- **PillLines killed:** Avinash *"Pills isn't that impactful, narrow specific problem"*
- **ShotMap killed:** State immunization registries are a regulatory nightmare for 3-day build; Docket already exists
- **DepositBack survived** but criticized for stickiness ("once-a-year use")

### Round 7 — Stickiness pivot then snap-back (RentRadar KILLED, RentProof SURVIVED)
- **RentRadar** (full lease lifecycle: sign + renew + move-out) pitched to fix stickiness. **Killed:** Too broad for 3-min demo, didn't actually solve stickiness, all 6 winners did ONE thing well.
- **RentProof** = narrowed back to deduction-letter dispute only. **Locked.**

### 🟢 FINAL: RentProof
- Color-coded floor plan visual
- Cloned shape from Willmaker (proven 2nd place winner)
- Per-state UI rebuild = killer A2UI moment
- Universal pain (every renter)
- Tangible output (legal demand letter PDF)
- Solo-buildable in 2 days

**See `RENTPROOF_SPEC.md` for the full frozen spec.**

---

## 🎯 SCORING ON THE WINNING PARAMETERS FRAMEWORK

(Pre-event projection for RentProof — must hit 8+ on every row to win)

| # | Parameter | Target | RentProof |
|---|---|---|---|
| 1 | Topic novelty | 9+ | 8 |
| 2 | Sponsor-tool angle | 9+ | 9 |
| 3 | Product polish | 9+ | 9 |
| 4 | Workflow ease | 9+ | 10 |
| 5 | Demo storytelling | 9+ | 9 |
| 6 | Technical depth | 9+ | 8 |
| 7 | Emotional hook | 8+ | 9 |
| 8 | Submission hygiene | 10 | 10 |
| 9 | Pitch delivery | 9+ | 9 |
| 10 | Slot strategy | n/a | n/a |
| 11 | Honest scope | 10 | 10 |
| 12 | Backup plans | 9+ | 10 |

**Projected total: 9.0+** — competitive to win.

---

## 🛠️ PRE-EVENT PREP CHECKLIST

> Detailed Day-by-Day in `RENTPROOF_SPEC.md` Build Plan section. Summary here.

### Wednesday 2026-05-06 (DONE)
- [x] Brainstorm rounds 1-3
- [x] Read event details
- [x] Initial AVI_RAMPUP draft

### Thursday 2026-05-07 (TODAY — DONE)
- [x] Brainstorm rounds 4-7
- [x] Lock idea: RentProof
- [x] Save full context to `RENTPROOF_SPEC.md` + `IDEA_GRAVEYARD.md` + this file

### Friday 2026-05-08 — BUILD DAY 1
- [x] `PROTOCOL_NOTES.md` — A2UI / AG-UI / MCP cheat sheet
- [x] `ARCHITECTURE.md` — system diagram for RentProof
- [x] Project skeleton (FastAPI + React + .env.example + .gitignore)
- [x] Statute data files (CA §1950.5 + TX §92.104) baked in
- [x] MCP tool stubs returning Rita's demo data
- [x] Agent system prompt v1 (with safer-language guardrails per GPT review)
- [ ] Mock landlord letter PDF + mock lease PDF
- [ ] Pydantic AI agent wired to Gemini → first valid `UIPlan` JSON
- [ ] Floor plan SVG component (5 rooms, Tailwind-colored)
- [ ] Demo photos grabbed (per `data/demo_photos/PHOTO_SHOPPING_LIST.md`)

### Saturday 2026-05-09 — EVENT DAY (12:00 PM doors, 1–5 PM build, 5 PM demo)
- See `RENTPROOF_SPEC.md` Build Plan for full hour-by-hour event-day plan
- Pre-event polish: AG-UI WebSocket adapter, render the 7 A2UI components,
  bulk-photo classification, drag-drop onto rooms, voice intake + corrections,
  "change one fact" reactive re-render, TX state variant, real PDF letter,
  HITL approval modal, backup video, 5 pitch rehearsals

---

## 📞 IMMEDIATE NEXT STEPS

**Status:** 🟢 RentProof FROZEN. Build mode only.

**Next session should:**
1. Read `START_HERE.md` (60 sec)
2. Read `RENTPROOF_SPEC.md` (5 min) — the source of truth
3. Read `IDEA_GRAVEYARD.md` (3 min) — do NOT resuggest killed ideas
4. Open with: *"Ready to start on Thursday's build day 1 checklist?"*
5. Begin scaffolding: PROTOCOL_NOTES.md, ARCHITECTURE.md, project skeleton

**Continuing-context rule:** After every working session, update `RENTPROOF_SPEC.md` Build Plan checkboxes. If a new pattern emerges that applies to FUTURE hackathons, also update `../AVINASH_HACKATHON_BRAIN.md`.

Let's go win those Mac Minis. 🏆
