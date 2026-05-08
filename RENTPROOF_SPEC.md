# 🟢 RentProof — Frozen Project Spec

> **Status:** 🔒 FROZEN as of 2026-05-08 (interactive canvas + frictionless UX + accuracy/judge-proofing pass applied). No more pivots.
> **Event:** Generative UI Hackathon (A2UI + AG-UI + MCP Apps), Saturday 2026-05-09, San Francisco
> **Mode:** Solo. Avinash directs, Avi (Code Puppy) executes.
> **Goal:** Win Mac Minis 🥇
> **Companion docs:** `PROTOCOL_NOTES.md` · `ARCHITECTURE.md` · `SCREENS.md`

---

## 🧠 MENTAL MODEL (read this first)

> **RentProof is an AI investigator that turns Rita's lease, landlord letter, and photos into a custom "evidence room" — a room-by-room map of which deposit deductions are *worth challenging*. Change a fact → the room rebuilds itself.**

That's the one sentence that should live in your head. NOT "letter generator." NOT "floor plan app." NOT "illegal-charge detector." An evidence room builder. Generative UI is load-bearing because every renter's case is different and the agent composes the screen from a small component kit per case.

**RentProof never says a charge is "illegal."** Courts decide that. RentProof shows the user what's *likely reasonable*, what *needs more proof*, and what's *worth challenging* — then drafts a user-approved letter for them.

---

## 🎯 ONE-LINE PITCH

> *"Your landlord kept part of your deposit. RentProof reads your lease, letter, and photos, builds a room-by-room evidence map of which deductions are worth challenging, and drafts the response letter for you to review and send."*

---

## 📖 THE PRODUCT IN ONE PARAGRAPH (plain English)

Rita Sharma moves out of her San Francisco 1-bedroom. Her landlord mails her an itemized statement: *"Withholding $1,800 of your $2,500 deposit for paint, carpet cleaning, and damage."* Rita opens RentProof. She taps the mic and says *"My landlord in SF kept $1,800 of my $2,5deposit after a 3-year lease,"* then drags her lease, the landlord's letter, and a pile of randomly-named move-in/move-out photos into the drop zone. The app reads everything, classifies the photos by room, then renders her apartment as a **top-down floor plan** with each room color-coded:

- 🟢 **Likely reasonable** — the deduction looks fair given the lease + photos + applicable rules
- 🟡 **Needs more proof** — it could go either way; here's the evidence to gather
- 🔴 **Worth challenging** — based on the documents and rule snippets, this one's worth pushing back on

Rita clicks the red bedroom — a card slides out: *"$400 paint charge. California Civil Code §1950.5 lets landlords deduct for damage beyond ordinary wear and tear. After a 3-year tenancy and based on your move-in/move-out photos, repainting looks like normal wear and tear rather than tenant damage. **Worth challenging.**"* She clicks **Review & approve** → reads the draft letter → approves → RentProof renders a PDF response letter she can print and mail. *"This is a draft. Confirm with a tenant-rights attorney before filing in court."*

---

## 🌊 FRICTION-KILLER PRINCIPLES (added 2026-05-08 after Avinash pushback)

> **Rita should never have to think about format, naming, or order.** She speaks or dumps; the product handles the rest.

| Friction | Killer | Tier |
|---|---|---|
| Filling out a form | **Voice intake** — tap mic, speak the situation, agent extracts state/tenancy/deposit/address | P1 |
| Renaming photos | **Bulk drop + Gemini vision auto-classification** — dump 20 photos with random names, agent labels each by room + phase | P0 |
| Sorting photos by room | Auto-drops thumbs onto the right floor-plan room | P0 |
| Picking a state | **Auto-detected from address** (lease or voice transcript); dropdown is override only | P1 |
| Typing corrections | **Voice correction in chat** — hold mic, speak, agent re-runs | P0 |
| Logging in | No accounts, no email, no signup. Ever. | P0 |

**The 5-second-to-value guarantee:** From landing to first colored room ≤ 5s on demo path; ≤ 30s on real-user path with voice + bulk drop.

## 💪 WHY THIS ISN'T A CHATBOT (the Gen UI defense)

> *"Couldn't ChatGPT with file upload do this?"* — anticipated judge question. Avinash raised it on 2026-05-07. Answer below.

1. **Spatial input** — dragging a photo onto a specific room is a 2-D gesture. The room's identity carries semantic meaning the agent uses (apply *that* room's statute). Chat is a 1-D text channel; it cannot accept "this photo, on this room" as input.
2. **Stateful coherence** — "change one fact" updates only the affected components (room color, RoomCard, letter amount). Chat re-types everything; user has to scroll to find what changed.
3. **Persistent artifact** — the evidence room is something Rita screenshots and shows the landlord. Chat is transient.
4. **Per-state generative UI** — same case, different layout/components/letter for CA vs TX, decided by the agent at runtime. Chat would dump a wall of text either way.

**The killer demo proof:** drag a stray carpet photo onto the living room. Watch it re-color. Try doing that in a chatbot.

---

## 🎬 THE 3-MINUTE DEMO ARC (memorize this)

> Full visual storyboard with screens in `SCREENS.md`. Script summary here. **Language rule for the entire pitch: never say "illegal," "stolen," or "guaranteed." Use "withheld," "worth challenging," "draft," "likely reasonable."**

1. **(0:00–0:15) Hook.** *"There are 44 million renter households in the U.S. About 85% paid a security deposit. When the landlord keeps part of it, the fight is usually too small for a lawyer and too confusing for the renter. RentProof handles the confusion."*

2. **(0:15–0:30) Voice intake.** Tap mic. *"My landlord in SF kept $1,800 of my $2,500 deposit after a 3-year lease."* The fields auto-populate. State auto-detects to California. (No form.)

3. **(0:30–0:40) Bulk photo dump.** Drag a folder of randomly-named photos into the drop zone. Watch them auto-classify into rooms via Gemini vision. (No renaming, no sorting.)

4. **(0:40–1:00) The reveal.** AG-UI streams the agent's work live: *"reading letter… 3 deductions… reading lease… tenancy 3y… looking up California rules…"*. The Evidence Room paints itself piece by piece **(A2UI)**: confidence meter (87%), floor plan with bedroom 🔴 / living 🟡 / kitchen 🟢, room cards, evidence checklist, draft response letter. Photos snap into the right rooms.

5. **(1:00–1:15) Spatial input — the canvas IS the input.** Drag a stray carpet photo onto the living room. Living room re-evaluates and updates color live. *"Try doing that in a chatbot."*

6. **(1:15–1:35) Click a room.** Tap the 🔴 bedroom. `LawCitation` card slides in with the actual §1950.5 text + a plain-English explanation — phrased as **why this charge is worth challenging**, not why it's "illegal."

7. **(1:35–2:00) ⭐ THE KILLER MOMENT — "change one fact."** Hold the mic in chat: *"actually I lived there only 6 months."* The agent re-runs and the screen reactively rebuilds: bedroom 🔴 → 🟡 (paint after 6 months is more defensible for the landlord), confidence 87% → 54%, draft letter softens, evidence checklist grows, citation rewrites. **Open the Agent UI Plan inspector** (collapsible side panel) to show the JSON list of components changed — proof to engineer judges that this is real A2UI, not a hardcoded template swap. *"I changed one fact. The agent re-evaluated the whole case and rebuilt the screen. We didn't pre-design this view — the agent composed it."*

8. **(2:00–2:35) The action.** Click **Review & approve** → modal with the draft response letter ("not legal advice; confirm with a tenant rights attorney") → approve → PDF download. *"Print, mail certified, see what the landlord says. If they don't respond, this is what you'd take to small claims."*

9. **(2:35–3:00) State encore (optional, only if running on time).** Flip state CA → TX. Screen rebuilds *again* with TX §92.104 logic. *"Same case, different state, different rules — the agent composed a different screen. Mac Minis please."*

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
**The agent composes the screen from a 7-component kit per case** — it doesn't pick from pre-built templates.

Component kit:
1. `ConfidenceMeter` (always)
2. `FloorPlan` (always; **interactive — rooms accept photo drops**)
3. `BulkPhotoBin` (when there are unclassified photos)
4. `RoomCard` (one per charged room)
5. `LawCitation` (one per "worth challenging" verdict)
6. `EvidenceChecklist` (when any `needs_more_proof` verdicts exist)
7. `DemandLetterPreview` (after letter generated)

Plus a developer-facing **Agent UI Plan inspector** (collapsible side panel) that displays the live JSON list of components the agent composed — visible proof for engineer judges that A2UI is real, not hardcoded.

Agent emits a JSON UI plan; React renderer interprets it. Different case = different plan = different screen. Studio with 1 charge gets 1 RoomCard; 3BR with 6 charges gets 6 RoomCards. CA paint dispute and TX cleaning dispute compose totally different screens *from the same code path*.

**Force-fit risk:** ONLY if we cheat with hardcoded "CA template" + "TX template" + a switch statement. We are committing to the legit path: agent composes per case from the kit. Schema in `ARCHITECTURE.md` § 6.

**The two A2UI proof beats in the demo:**
- *Primary (mandatory):* "change one fact" → same case re-evaluated → screen reactively rebuilds. Open the Agent UI Plan inspector to show the JSON delta.
- *Encore (only if running on time):* state switch CA → TX → screen rebuilds again. Honest framing: this proves the agent generalizes to new statutes; not the headline beat because state-switching can read as canned.

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
| A2UI | Custom 7-component kit (+ Agent UI Plan inspector for judges), mapped to A2UI starter-kit shape Sat 1–3 PM |
| PDF parse | pdfplumber |
| PDF generate | ReportLab |
| Floor plan | Custom React + inline SVG + Tailwind (drop-target rooms) |
| Voice | Web Speech API (browser native) |
| Vision | Gemini 2.5 Flash multimodal (one call per photo to label `{room, phase}`) |
| Colors | Walmart palette (blue.100 / spark.100 / red.100 / green.100) — WCAG AA |

---

## 📊 JUDGE-SAFE STATS (use these, drop the made-up ones)

> The earlier draft used **"$4.5 billion stolen each year"** — that number was made up by Avi and is not defensible. Replaced with verifiable, judge-checkable stats below. Avinash should sanity-check these against current sources before the pitch.

| Stat | Use it for |
|---|---|
| **44.6M U.S. renter-occupied housing units** (US Census ACS) | Market-size hook — "every one of these households can run into this" |
| **42.4M renter households paying cash rent** | Refining TAM |
| **~85% of renters report paying a security deposit** (87% recent renters) | Universality of the problem |
| **~$750 typical security deposit (2024)** | Sets the human dollar amount |
| **66% of San Francisco households are renter-occupied (2020)** | Local hook for SF judges |
| **21M+ renter households are cost-burdened (>30% of income on housing, 2023)** | Why this $750 matters |
| **California AB 12** capped most new residential security deposits at one month's rent (effective July 1, 2024) | Recency / California-aware credibility |
| **California 21-day rule** — landlords generally have 21 calendar days to return the deposit or provide an itemized statement | Concrete rule the agent uses |
| **California photo-proof rule** — starting April 1, 2025, landlords withholding deposits for repairs/cleaning must provide photos | Why move-in/move-out photos matter; very current |
| **San Francisco interest rule** — landlords owe interest on deposits held >1 year (2026–2027 rate: 4.2%) | Easy local credibility flex |

**Language rules (everywhere — product UI, pitch, letter, code):**
- Never say "illegal," "stolen," "guaranteed," "fight back," "get $X back."
- Use "withheld," "deducted," "at risk," "worth challenging," "likely reasonable," "needs more proof," "draft response," "user-approved."
- Always include: "This is not legal advice. Confirm with a tenant-rights attorney before filing in court."

---

## 📐 SCOPE (LOCKED — what's in, what's out)

### ✅ IN scope for the demo
- **2 states:** California (primary) + Texas (optional encore)
- **1 demo apartment:** Rita Sharma's 1BR SF apartment with 5 rooms (kitchen, living room, bedroom, bathroom, hallway)
- **1 mock landlord letter PDF + 1 mock lease PDF** that we control
- **3 deduction types:** paint, carpet cleaning, damage
- **Real rule snippets** for CA §1950.5 + AB 12 + CA photo-proof rule and TX §92.104 baked into agent prompts
- **Floor plan UI** (top-down SVG, **interactive — rooms accept photo drops**)
- **Per-room evidence cards** that morph by deduction type
- **Bulk photo drop** with Gemini-vision auto-classification by room + phase
- **Voice intake** on landing (Web Speech API)
- **Voice corrections** in AG-UI chat
- **Auto-detected state** from address (dropdown is override only)
- **Draft response letter PDF** with state-specific template (clearly labeled "Draft — not legal advice")
- **Agent UI Plan inspector** (collapsible panel, shows live JSON — for engineer judges)
- **AG-UI live agent reasoning panel**
- **State switcher** (encore moment only)
- **Backup pre-recorded demo video** (mandatory, recorded Friday)
- **Cached agent responses** for the demo case (offline-safe fallback)

### ❌ OUT of scope (resist temptation)
- ❌ Lease signing analysis (was in RentRadar, killed)
- ❌ Renewal negotiation (was in RentRadar, killed)
- ❌ Rent comparison data (was in RentRadar, killed)
- ❌ More than 2 states at launch
- ❌ Mobile app (web only)
- ❌ User accounts / login / email signup (single-session demo)
- ❌ Real arbitrary landlord-letter parsing (we control the demo doc; agent prompt knows the structure)
- ❌ Arbitrary photo damage detection / pixel-diffing (we classify room + phase, that's it)
- ❌ Click-to-annotate damage spots on the floor plan (was P2; cut to keep focus)
- ❌ Court filing automation (just generate the draft; the user mails it themselves)
- ❌ Subscription / payment / pricing UI
- ❌ Saying anything is "illegal" — we are not lawyers

---

## 📅 BUILD PLAN (real calendar: Thu May 7 design done → Fri May 8 full build → Sat May 9 event)

> **Date correction:** an earlier draft labeled May 8 as Thursday and May 9 as Friday — wrong. May 7 is Thursday, May 8 is Friday, May 9 is Saturday (event day). Fixed everywhere below.

### Thursday 2026-05-07 — DESIGN + SCAFFOLD (DONE)
- [x] `PROTOCOL_NOTES.md` — A2UI / AG-UI / MCP plain-English cheat sheet ✅ done 2026-05-07
- [x] `ARCHITECTURE.md` — system diagram + tech stack + folder structure + agent prompt + A2UI contract ✅ done 2026-05-07
- [x] `SCREENS.md` — wireframes + storyboard ✅ done 2026-05-07
- [x] Project skeleton — FastAPI backend boots, React/Vite frontend ready, .gitignore + .env.example, git initialized + first commit ✅ done 2026-05-07
- [x] MCP tool stubs (mocked) — 5 tools return Rita's demo data ✅ done 2026-05-07
- [x] Statute snippet files — CA §1950.5 + TX §92.104 markdown drafts ✅ done 2026-05-07 (rewriting for accuracy 2026-05-08)
- [x] Agent system prompt v1 ✅ done 2026-05-07 (rewriting for safer language 2026-05-08)
- [x] Friction-killer + interactive-canvas design baked into all docs ✅ done 2026-05-08 early
- [x] Accuracy / language / dates / stats pass (this commit) ✅ done 2026-05-08

### Friday 2026-05-08 — BUILD DAY (the only full build day)

Follow `ARCHITECTURE.md` §10 build order, steps 3–18. Highlights:
- [ ] **Photos** — Avinash grabs 8 stock interior photos per `data/demo_photos/PHOTO_SHOPPING_LIST.md` (5 min, do this first thing)
- [ ] **Gemini API key** in `backend/.env` (free, https://aistudio.google.com/app/apikey)
- [ ] Mock landlord letter PDF + mock lease PDF (ReportLab scripts)
- [ ] Pydantic AI agent + Gemini wired → first real `UIPlan` JSON
- [ ] AG-UI WebSocket adapter
- [ ] Render the 7 A2UI components
- [ ] **Bulk photo dump + Gemini vision auto-classification** (P0 friction)
- [ ] **Drag-drop photos onto floor-plan rooms** (interactive canvas)
- [ ] **Voice on AG-UI chat** (P0 friction)
- [ ] **"Change one fact" reactive re-render** (the killer beat)
- [ ] **Agent UI Plan inspector panel** (engineer-judge proof)
- [ ] **Voice intake on landing** (P1 friction) + **auto-detect state** (P1)
- [ ] TX state variant + state switcher (encore)
- [ ] Real PDF draft letter (CA + TX templates, with "Draft / not legal advice" header)
- [ ] HITL approval modal
- [ ] Polish + Walmart palette pass
- [ ] **Cache the demo agent responses** (offline fallback)
- [ ] **Record backup demo video** (mandatory)
- [ ] Pitch script v1 (15s open + 30s problem + 90s magic + 15s close)
- [ ] Pitch rehearsal #1 + #2

### Saturday 2026-05-09 — EVENT DAY (12:00 PM doors, 1–5 PM build/integrate, 5 PM demo)

**Pre-event (before 12:00 PM)**
- [ ] Sleep 7+ hours Friday night
- [ ] Pitch rehearsal #3 at home
- [ ] Repo pushed; backup video uploaded; deck ready
- [ ] Bring: laptop, charger, mouse, hotspot, HDMI/USB-C dongle

**12:00–12:30 PM** Doors, food, scout
**12:30 PM** Kickoff video — note tracks, prize categories beyond Mac Mini
**1:00 PM** Build window starts — grab starter kit + credits

**1:00–3:00 PM** — INTEGRATION (not new build)
- Diff our pre-built code against the official starter kit
- Swap mock keys for real ones from the starter kit
- Confirm everything still runs end-to-end

**3:00–4:00 PM** — POLISH
- Final UI polish, copy pass, edge case fixes
- Pitch rehearsal #4 + #5

**4:00–4:45 PM** — DEMO PREP
- Hard refresh all tabs, warm caches
- Backup video on standby in another tab
- First 15s + last 15s memorized verbatim

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

5. **"What if California law changes / what if our prompt is wrong?"** The product never claims a charge is "illegal." Every verdict is framed as **"likely reasonable / needs more proof / worth challenging"**, every output letter is labeled **"Draft — this is not legal advice. Confirm with a tenant-rights attorney before filing in court."** Same disclaimer pattern as legal-tech competitors.

6. **"The state switch demo moment feels gimmicky."** Counter taken: state switching is now an *encore*, not the headline. The headline beat is **"change one fact"** (same case, agent re-evaluates) which is harder to fake and more visibly generative. State switch only runs if we have time and the room is engaged.

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
6. Start on Friday's build checklist (top of the Build Plan section)

**No more pivots. RentProof is locked. Build mode only.** 🟢
