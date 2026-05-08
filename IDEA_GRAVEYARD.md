# 🪦 Idea Graveyard — DO NOT RESUGGEST

> Every idea we considered for the Generative UI Hackathon (Hack #3) and why it died.
> If you (future AI session) are tempted to suggest any of these, DON'T. They've been killed for specific reasons. Read the reason, learn the pattern, generate something new instead.
>
> Last updated: 2026-05-07 evening · Status: RentProof FROZEN — graveyard locked

---

## 🚫 The Pattern Across All Killed Ideas

Every kill came from one of these failure modes:
1. **Too generic / 2-prompts-away** — any builder could generate this in 2 ChatGPT prompts
2. **Crowded category** — an obvious lane where 50+ teams will cluster
3. **Too technical / dev tooling** — Avinash refuses to build for engineers ("I want life-related issues")
4. **Niche / boxed in** — too narrow to feel important
5. **Doesn't fit SmartNourish quality bar** — missing layers of depth (signal stream + multimodal + real action + human-in-loop)
6. **No killer visual metaphor** — fails the "5-year-old can describe the screenshot" test

---

## Round 1 — Axis-of-Weird Brainstorm (KILLED — too cliche)
- Agent Inspector
- Anti-Dark-Patterns Tool
- 7 other axis-of-weird ideas
- **Why killed:** Avinash: *"All boring topics. Too cliche, too generic, lazily thought."* Reachable in 2 prompts. No real dollar impact.

## Round 2 — Senior Bay Area Founder Reframe (KILLED — still cliche)
- DealRoom AI ($5T M&A)
- 911 Dispatch ($8B EMS)
- SF Permits ($300B backlog)
- Clinical Trials ($50B)
- Disaster Insurance ($250B)
- **Why killed:** Avinash: *"Still too cliche. Couple more prompts, people arrive at these. Looks like Claude Code with a UI on top."* None passed the **agentic test** — mostly transcribe → render.

## Round 3 — Agentic Finalists (KILLED — still too B2B/dev)
- **DiligencePartner** (VC due diligence)
- **GrantHunter** (grant discovery + apply)
- **IncidentRoom** (security incident response)
- **TenderFlow** (gov RFP responder)
- **LitigationDeck** (plaintiff litigation strategy)
- **Why killed:** Too B2B/enterprise. Avinash wanted life-related, not "tools for engineers/lawyers/VCs."

## Round 4 — ChatGPT/Manus Pivots (ALL KILLED)
- **AgentProof** — crash-test for AI agents → "Too technical, dev tooling. I don't want to build for engineers."
- **ActionGate** — runtime approval layer for agent tool calls → "Same problem. Technical software issues."
- **CareOS** — AI command center for family caregivers → Crowded (Honor, CareLinx, Papa, Carewell exist). Plus DepositBack/PediPulse later got compared to it.
- **LayoffLifeline** — 60-day post-layoff command center → Generic, too procedural
- **AfterCare** — post-psychiatric discharge support → Liability nightmare for hackathon demo
- **EstateClear** — death/probate administration → Niche, hard to demo, sad
- **DenialShield** — insurance denial fighter → Avinash: *"Too narrow / boxed in"*
- **AccessFlow** — disability/accommodations forms → Niche, form-filling
- **FieldOS** — field-worker ops → Avinash: *"Couldn't visualize it"*
- **LaunchRoom** — small business launch → Crowded (LegalZoom, Tailor Brands, Shopify)
- **TraceRoom** — product recall tracker → Too niche
- **GenUI Flight Recorder** — debugger for agentic UIs → Dev tooling

## Round 5 — Life-Related but Wrong Shape (KILLED)
- **PediPulse** — 11pm parent panic, kid symptom triage → Liability + cousin to CareOS, parent-only audience
- **WreckRoom** — first 48 hours after car accident → No killer visual metaphor; Avinash didn't bite
- **TripTriage** — travel crisis (cancellations, lost passport) → Less universal in SF judge demographic; Hopper exists
- **HomeRadar** — home maintenance OS → Considered but never pitched; SF skews renters not homeowners
- **FamilyFeed** — daily family logistics dashboard → Considered (Path B in stickiness debate) but build risk too high for 3 days, no single magic moment, Cozi/Skylight exist

## Round 6 — Sharp-Visual Pivot (2 KILLED, 1 SURVIVED → became RentProof)
- **PillLines** — drug interaction calendar with red lines → Killed for being **too narrow demographic** (60+ seniors); Avinash: *"Pills isn't that impactful, narrow specific problem"*
- **ShotMap** — vaccine constellation on body silhouette → Killed because state immunization registries are a regulatory nightmare for a 3-day build; Docket already exists
- **DepositBack** ✅ → Survived initial rounds but criticized for stickiness ("once-a-year use")

## Round 7 — Stickiness Pivot (KILLED — overcorrection)
- **RentRadar** — full lifecycle (sign + renew + move-out) version of DepositBack → Killed because:
  1. Too broad for a 3-min demo (3 phases × confusing)
  2. Renewal/sign moments are also annual, didn't actually solve stickiness
  3. The 6 actual hackathon winners all did ONE thing well (Willmaker = wills only, Dental Tracks = records only, Road Patrol = potholes only) — stickiness wasn't what made them win
  4. Build risk too high for 3 days

## ✅ FROZEN: RentProof
- Narrow scope: deduction-letter dispute only
- Color-coded floor plan visual (5-year-old can describe)
- Cloned shape from Willmaker (proven 2nd place winner)
- Universal pain (every renter has been screwed)
- Per-state UI rebuild = killer A2UI moment
- Tangible output (legal demand letter PDF)
- Solo-buildable in 2 days

---

## 🧠 Lessons For Next Session

If you're tempted to suggest a NEW idea, run it through:

1. **Two-prompts-away test** — Can a competent builder reach this in 2 ChatGPT prompts? If yes, kill.
2. **Agentic test** — Does the AI do substantial multi-step work, or just transcribe? If transcribe, kill.
3. **SmartNourish quality bar** — Does it have: continuous signal + multimodal + real reasoning + human-in-loop + real action + behavior change + generative UI? Need 5+ of 7.
4. **6-winners pattern test** — Can you describe the screenshot in 5 words? Is there a sharp visual metaphor (tooth chart / plant garden / floor plan)? Is there a tangible output (PDF / letter / form)? Is there a real named data source (CA Civil Code / FDA DailyMed / state IRIS)?
5. **Avinash's life-related test** — Would a non-technical person Rita Sharma type understand and want this? If only engineers care, kill.
6. **Solo 3-day build test** — Can ONE person build a working demo in 3 days? If you need 5 integrations or live data feeds, kill.

**RentProof passes all 6.** That's why it's frozen. Don't unfreeze it. Build it.
