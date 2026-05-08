# 🟢 RentProof — Frozen Project Spec

> **Status:** 🔒 FROZEN as of 2026-05-07 evening (Evidence-Room reframe applied). No more pivots.
> **Event:** Generative UI Hackathon (A2UI + AG-UI + MCP Apps), Saturday 2026-05-09, San Francisco
> **Mode:** Solo. Avinash directs, Avi (Code Puppy) executes.
> **Goal:** Win Mac Minis 🥇
> **Companion docs:** `PROTOCOL_NOTES.md` · `ARCHITECTURE.md` · `SCREENS.md`

---

## 🧠 MENTAL MODEL (read this first)

> **RentProof is an AI investigator that builds Rita a custom "evidence room" for her exact dispute. Change a fact → the room rebuilds itself.**

That's the one sentence that should live in your head. NOT "letter generator." NOT "floor plan app." An evidence room builder. Generative UI is load-bearing because every renter's case is different and the agent composes the screen from a small component kit per case.

---

## 🎯 ONE-LINE PITCH

> *"Your landlord kept your security deposit. RentProof investigates your case, builds your evidence room, and writes the demand letter to fight back."*

---

## 📖 THE PRODUCT IN ONE PARAGRAPH (plain English)

Rita Sharma moves out of her San Francisco 1-bedroom that rented for $3,200/month. Her landlord mails her a deduction letter: *"Keeping $1,800 of your $2,500 deposit for paint, carpet cleaning, and damage."* Rita opens RentProof, drag-and-drops the landlord's letter, her lease, and her move-in/move-out photos. The app reads everything, then renders her apartment as a **top-down floor plan** with each room color-coded:

- 🟢 **Green** = the charge is fair, accept it
- 🟡 **Yellow** = the charge could go either way, you need more proof
- 🔴 **Red** = the charge is illegal under California law, fight it

Rita clicks the red bedroom — a card pops out: *"$400 paint charge. Illegal under CA Civil Code §1950.5(b)(3) because tenancy >2 years means paint is normal wear and tear. Recommended action: dispute."* She clicks "Generate demand letter," reviews the draft, approves it. RentProof spits out a legally-formatted demand letter PDF: *"Return $1,200 within 14 days or I will file in small claims court."* Done in 5 minutes.

---

## 🎬 THE 3-MINUTE DEMO ARC (memorize this)

> Full visual storyboard with screens in `SCREENS.md`. Script summary here.

1. **(0:00–0:15) Hook.** *"Every renter in this room has been screwed on a deposit. $4.5 billion stolen each year. RentProof fights back."*

2. **(0:15–0:25) One click.** Hit the spark.100 yellow **"Try with Rita's case"** button. Skip upload. Investigation panel pops up. **AG-UI streams the agent's work live:** *"reading letter... 3 charges... reading lease... tenancy 3y... checking §1950.5..."*

3. **(0:25–0:55) The reveal.** Evidence Room paints itself piece by piece **(A2UI)**: confidence meter (87%), floor plan with bedroom 🔴 / living 🟡 / kitchen 🟢, room cards, evidence checklist, demand letter draft.

4. **(0:55–1:15) Click a room.** Tap the 🔴 bedroom. `LawCitation` card slides in with the actual §1950.5 text + plain-English explanation.

5. **(1:15–1:45) ⭐ THE KILLER MOMENT — "change one fact."** Type into the AG-UI chat: *"actually I lived there only 6 months."* The agent re-runs and the screen reactively rebuilds: bedroom 🔴 → 🟡, confidence 87% → 54%, letter softens, evidence checklist grows, citation rewrites. *"Watch this. I changed one fact. The agent rebuilt the entire screen. We didn't pre-design this view — the agent composed it. That is what generative UI means."*

6. **(1:45–2:35) The action.** Click **Review & approve** → modal with the legal letter → approve → PDF download ready. *"Print it, mail it certified, $1,000 back in 14 days. Five minutes total."*

7. **(2:35–3:00) State switcher (encore).** Flip state CA → TX. Screen rebuilds *again* with TX §92.104 logic. *"Every state has different law. We didn't build a Texas screen. The agent did. Mac Minis please."*

---

## 🧪 PROTOCOL FIT (honest, not force-fit)

> Full plain-English breakdown in `PROTOCOL_NOTES.md`. Summary here.

### MCP (Manufact mcp-use) — the agent's hands
5 real tools the agent calls per investigation:
1. `read_letter_pdf` — parses landlord's deduction letter
2. `read_lease_pdf` — pulls tenancy length, deposit, signing date
3. `read_photo_metadata` — EXIF dates on move-in/out photos
4. `lookup_state_law(state, dispute_type)` — returns statute text
5. `generate_demand_letter` — renders the final PDF

**Force-fit risk:** none. Agents need hands.

### AG-UI (CopilotKit) — the agent's voice + Rita's remote
- **Live reasoning stream** — judges watch the agent investigate in real time
- **Human-in-the-loop approval** — modal before the demand letter PDF finalizes
- **Chat correction box** — Rita types *"actually 6 months"* → agent re-runs → screen rebuilds. **This is the killer moment.**

**Force-fit risk:** none. Required for legal output + powers the demo's tension.

### A2UI (Google DeepMind) — the agent's drawing pad ← LOAD-BEARING
**The agent composes the screen from a 6-component kit per case** — it doesn't pick from pre-built templates.

Component kit:
1. `ConfidenceMeter` (always)
2. `FloorPlan` (always)
3. `RoomCard` (one per charged room)
4. `LawCitation` (one per illegal verdict)
5. `EvidenceChecklist` (when ambiguous verdicts exist)
6. `DemandLetterPreview` (after letter generated)

Agent emits a JSON UI plan; React renderer interprets it. Different case = different plan = different screen. Studio with 1 charge gets 1 RoomCard; 3BR with 6 charges gets 6 RoomCards. CA paint dispute and TX cleaning dispute compose totally different screens *from the same code path*.

**Force-fit risk:** ONLY if we cheat with hardcoded "CA template" + "TX template" + a switch statement. We are committing to the legit path: agent composes per case from the kit. Schema in `ARCHITECTURE.md` § 6.

**The two A2UI proof beats in the demo:**
- *Primary:* "change one fact" → screen reactively rebuilds (proves agent owns the composition)
- *Encore:* state switch CA → TX → screen rebuilds again (proves it generalizes)

---

## 🏗️ TECH STACK

> Full stack rationale in `ARCHITECTURE.md` § 1. Summary here.

| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11+, uv-managed) |
| Frontend | React 18 + Vite + TypeScript + Tailwind 3 (pnpm) |
| Agent | Pydantic AI |
| LLM | Gemini 2.5 Flash → 2.0 Flash → Gemma 3 12B (fallback cascade) |
| MCP | mcp-use (Python SDK) |
| AG-UI | CopilotKit React SDK + Pydantic AI adapter |
| A2UI | Custom 6-component kit, mapped to A2UI starter-kit shape Sat 1–3 PM |
| PDF parse | pdfplumber |
| PDF generate | ReportLab |
| Floor plan | Custom React + inline SVG + Tailwind |
| Colors | Walmart palette (blue.100 / spark.100 / red.100 / green.100) — WCAG AA |

---

## 📐 SCOPE (LOCKED — what's in, what's out)

### ✅ IN scope for the demo
- **2 states:** California (primary) + Texas (the demo "switch" moment)
- **1 demo apartment:** Rita Sharma's 1BR SF apartment with 5 rooms (kitchen, living room, bedroom, bathroom, hallway)
- **1 mock landlord letter PDF** that we control
- **3 dispute types:** paint, carpet cleaning, damage
- **Real legal text** for CA §1950.5 and TX §92.104 baked into agent prompts
- **Floor plan UI** (top-down SVG)
- **Per-room evidence cards** that morph by dispute type
- **Demand letter PDF** generation with state-specific template
- **State switcher dropdown** that triggers full UI rebuild via A2UI
- **AG-UI live agent reasoning panel**
- **Backup pre-recorded demo video** (mandatory, recorded Friday)

### ❌ OUT of scope (resist temptation)
- ❌ Lease signing analysis (was in RentRadar, killed)
- ❌ Renewal negotiation (was in RentRadar, killed)
- ❌ Rent comparison data (was in RentRadar, killed)
- ❌ More than 2 states at launch
- ❌ Mobile app (web only)
- ❌ User accounts / login (single-session demo)
- ❌ Real arbitrary landlord-letter parsing (we control the demo doc; agent prompt knows the structure)
- ❌ Real photo-based damage detection (mock the photo upload)
- ❌ Court filing automation (just generate the letter; mention "small claims filing kit coming soon")
- ❌ Subscription / payment / pricing UI

---

## 📅 BUILD PLAN (2 days remaining: Thu May 8 + Fri May 9 morning + 4hrs Sat)

### Thursday 2026-05-08 — BUILD DAY 1
- [x] `PROTOCOL_NOTES.md` — A2UI / AG-UI / MCP plain-English cheat sheet ✅ done 2026-05-07
- [x] `ARCHITECTURE.md` — system diagram + tech stack + folder structure + agent prompt + A2UI contract ✅ done 2026-05-07
- [x] `SCREENS.md` — wireframes + storyboard ✅ done 2026-05-07
- [x] Project skeleton — FastAPI backend boots, React/Vite frontend ready, .gitignore + .env.example, git initialized + first commit ✅ done 2026-05-07
- [x] MCP tool stubs (mocked) — 5 tools return Rita's demo data ✅ done 2026-05-07
- [x] Statute data files — CA §1950.5 + TX §92.104 markdown snippets ✅ done 2026-05-07
- [x] Agent system prompt v1 — with UI plan contract + guardrails ✅ done 2026-05-07
- [ ] **Photos** — Avinash grabs 8 stock interior photos per `data/demo_photos/PHOTO_SHOPPING_LIST.md`
- [ ] Mock landlord letter PDF — generated via `scripts/make_demo_letter.py` (next session)
- [ ] Mock lease PDF — generated via `scripts/make_demo_lease.py` (next session)
- [ ] Pydantic AI agent wired to Gemini 2.5 Flash + system prompt → emits valid `UIPlan` JSON for Rita's case (next session)
- [ ] AG-UI WebSocket adapter — streams events as agent runs (next session)
- [ ] Floor plan SVG component (5 rooms, Tailwind-colored) (next session)

### Friday 2026-05-09 (morning + afternoon) — BUILD DAY 2 + POLISH
- [ ] Wire MCP tools (PDF reader, legal lookup, demand letter generator)
- [ ] AG-UI streaming agent reasoning to UI panel
- [ ] A2UI per-room cards (one per dispute type: paint card, cleaning card, damage card)
- [ ] State switcher + Texas law variant (§92.104 baked in, different room colors, different card content)
- [ ] Demand letter PDF generation (CA + TX templates)
- [ ] Polish pass — Walmart blue.100 / spark.100, WCAG AA contrast check
- [ ] **Record backup demo video** (safety net — mandatory)
- [ ] Pitch script v1 (15s open + 30s problem + 90s magic + 15s close)
- [ ] Pitch rehearsal #1

### Saturday 2026-05-09 — EVENT DAY (12:00 PM doors, 1–5 PM build, 5 PM demo)

**Pre-event (before 12:00 PM)**
- [ ] Sleep 7+ hours Friday night
- [ ] Pitch rehearsal #2 at home
- [ ] Repo pushed; backup video uploaded; deck ready
- [ ] Bring: laptop, charger, mouse, hotspot, HDMI/USB-C dongle

**12:00–12:30 PM** Doors, food, scout
**12:30 PM** Kickoff video — note tracks, prize categories beyond Mac Mini
**1:00 PM** Build starts — grab starter kit + credits

**1:00–3:00 PM** — INTEGRATION (not build)
- Diff our pre-built code against the official starter kit
- Swap mock keys for real ones from the starter kit
- Confirm everything still runs end-to-end

**3:00–4:00 PM** — POLISH
- Final UI polish, copy pass, edge case fixes
- Pitch rehearsal #3 + #4

**4:00–4:45 PM** — DEMO PREP
- Hard refresh all tabs, warm caches
- Backup video on standby in another tab
- Pitch rehearsal #5 — first 15s + last 15s memorized verbatim

**5:00 PM** — DEMO 🎯
**5:30 PM** — SUBMIT (NOT 5:59 — Echo lesson)
**6:00 PM** — Submissions close

---

## 🎯 SCORING ON THE WINNING PARAMETERS FRAMEWORK

(Pre-event projection — must hit 8+ on every row to win)

| # | Parameter | Target | RentProof projection | Notes |
|---|---|---|---|---|
| 1 | Topic novelty | 9+ | 8 | Renter rights is fresh angle; legal-tech but consumer-side |
| 2 | Sponsor-tool angle | 9+ | 9 | A2UI per-state UI rebuild is genuinely novel use of generative UI |
| 3 | Product polish | 9+ | 9 | Tailwind + Walmart palette + 2 days of polish time |
| 4 | Workflow ease | 9+ | 10 | Drag-drop PDF → 5 minutes → demand letter. ≤3 clicks. |
| 5 | Demo storytelling | 9+ | 9 | One magic moment (state switch UI rebuild); Rita Sharma named user |
| 6 | Technical depth | 9+ | 8 | MCP+AG-UI+A2UI all load-bearing; legal RAG could go deeper |
| 7 | Emotional hook | 8+ | 9 | Every judge has lost money to a landlord. Universal pain. |
| 8 | Submission hygiene | 10 | 10 | Submit by 5:30, full kit ready Friday |
| 9 | Pitch delivery | 9+ | 9 | Backup video pre-recorded; rehearse 5x |
| 10 | Slot strategy | n/a | n/a | All teams demo |
| 11 | Honest scope | 10 | 10 | "This is mocked" labels on photo upload + court filing |
| 12 | Backup plans | 9+ | 10 | Pre-recorded video + cached agent responses + offline mode |

**Projected total: 9.0+** — competitive to win.

---

## 😈 DEVIL'S ADVOCATE — kill it before judges do

1. **"Isn't this just Willmaker for renters?"** Yes, intentionally. Willmaker took 2nd place at this exact event type. We're cloning a proven shape with a fresher problem. Renter rights is universal in a way wills aren't (you make 1 will in your life; you sign 5+ leases).

2. **"DefendMyRent and Tenatur already exist."** Both are obscure, broken, and not Bay Area products. The bar isn't "no competitor" — Willmaker won despite LegalZoom existing. The bar is sharper visual + better demo + cleaner protocol use.

3. **"Why won't judges call this just a legal template generator?"** Because the agent does real reasoning across multiple sources (landlord letter + lease + photos + state code) and the UI literally rebuilds when state changes. That's genuinely impossible without A2UI.

4. **"Once-a-year use, not sticky."** Counter: none of the 6 actual hackathon winners (Blue Lens, Willmaker, Dental Tracks, Road Patrol, Project Cade, Skillsprout) were daily-sticky products. Hackathon judges reward MEMORABILITY, not retention. Willmaker is once-in-a-decade use and won 2nd place.

5. **"What if California law changes / what if our prompt is wrong?"** Add a disclaimer card: *"RentProof helps you spot questions to raise. Confirm with a tenant rights attorney before filing."* Same disclaimer pattern as legal-tech competitors.

6. **"The state switch demo moment feels gimmicky."** Counter: it's the literal reason A2UI exists. Show it as the "this would be 100 hardcoded screens without generative UI" moment.

---

## 🚨 BACKUP PLANS

- **Pre-recorded demo video** uploaded Friday night (in case live demo crashes)
- **Cached agent responses** — if API quota dies, fallback to pre-baked JSON for the demo apartment
- **Offline mode** — entire demo runnable from localhost with no network
- **Two laptops** ideally — Avinash's daily driver + a backup with the working repo

---

## 🐶 NEXT-SESSION KICKOFF

When the next AI session opens:
1. Read `START_HERE.md` first (60 sec)
2. Read this file (`RENTPROOF_SPEC.md`) — full frozen scope
3. Read `IDEA_GRAVEYARD.md` — do NOT re-suggest killed ideas
4. Read `AVI_RAMPUP.md` for context on the journey
5. Skim `../AVINASH_HACKATHON_BRAIN.md` TL;DR section
6. Start on Thursday's build checklist (top of the Build Plan section)

**No more pivots. RentProof is locked. Build mode only.** 🟢
