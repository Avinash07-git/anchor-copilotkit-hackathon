# 🛏️ Bedside — Product Spec

> **The intelligent layer that was always missing.**
> Three lenses, one app. The body, the mind, the caregiver.

**Status:** 🔒 LOCKED 2026-05-08 evening. Pivot from RentProof committed. No more idea changes.
**Event:** Generative UI Hackathon · Saturday 2026-05-09 · San Francisco
**Goal:** Win Mac Minis 🥇

---

## 1. The Pitch

### One sentence
**Bedside watches three things no human can track at once — the patient's body, the patient's mind, and the caregiver's breaking point — and rebuilds the dashboard the moment any of them needs attention.**

### 30-second pitch
> "63 million Americans are family caregivers. Most are doing complex medical care at home with zero training, a WhatsApp group, and a 9-page discharge PDF. Bedside is an AI that sits at the bedside when you can't. You just text it what you noticed. It remembers everything, connects dots across days no human can track alone, and the dashboard rebuilds itself when something needs your attention. Not a template. A living interface that changes as your reality changes."

### 90-second pitch
The 30s pitch +
- Three lenses watching simultaneously (body / mind / caregiver)
- The dashboard is **composed by the agent per-family** — never pre-built
- The combined-triage view (all three at risk) is the **purest A2UI moment** — the agent has to construct a layout that has never existed before
- Real protocol fit: A2UI composes the dashboard, AG-UI streams the agent thinking + handles approvals, MCP runs the 8 tools that do the actual work
- Not a medical device. A **smart family notebook** that surfaces patterns for you to share with your doctor.

---

## 2. The Family

We do NOT use generic placeholders. One named American family, sympathetic and realistic, sandwich-generation:

| Name | Role | Age | Lens | What's happening |
|------|------|-----|------|---|
| **Tom Reynolds** | Dad | 68 | **Body** (post-cardiac) | Discharged 11 days ago after a cardiac event. On 7 medications. |
| **Helen Reynolds** | Tom's mom | 84 | **Mind** (early dementia) | Lives semi-independently 20 min away. Multiple family members check in. |
| **Sarah Reynolds** | Tom's wife | 42 | **Caregiver** (burnout) | Sole caregiver for both. Marketing manager. Has her own life imploding quietly. |

Why this family works:
- **Sandwich generation** is the most relatable American caregiver pattern (1 in 4 adults)
- Sarah is caring for **both her husband AND her mother-in-law** → makes the burnout story land harder than a single-patient setup
- All-American names → no judge gets distracted parsing unfamiliar names
- Realistic age + condition combos that match the data we'll show

---

## 3. The Three Use Cases — One App

Same input method (chat). Same engine. Three lenses the agent watches simultaneously. The dashboard reflects whichever lens — or combination — needs attention right now.

### 🟦 Use Case 1 — The Slow Slide (Tom's body)

**Premise:** Subtle physical signals accumulate after hospital discharge. None alarming alone. Together = a documented pre-readmission pattern.

**What Sarah logs casually over 11 days:**
| Day | Sarah's text |
|---|---|
| 3 | "Tom didn't finish dinner, said he wasn't hungry" |
| 6 | "He mentioned his legs feel a bit heavy" |
| 8 | "Skipped dinner again. Said he was tired" |
| 10 | "He forgot to take the evening blood thinner" |
| 11 | "Legs look a little swollen to me" |

**What Bedside sees:** appetite ↓ (3×) + leg heaviness (2×) + missed anticoagulant (1×) + visible swelling (1×) → a pattern combination commonly associated with cardiac decompensation in post-discharge patients. Worth raising with the cardiologist promptly.

**The dashboard moment:**
Calm green dashboard → Tom's score moves green→yellow→amber → **PatternAlertCard** appears with the 5 signals, the dates, why this combination is worth flagging, a pre-written list of talking points for the next doctor visit, and the cardiologist's earliest open slot.

---

### 🟪 Use Case 2 — The Silent Decline (Helen's mind)

**Premise:** No single observer sees enough to be alarmed. Bedside synthesizes across observers and detects acceleration vs baseline.

**Four observers, one week:**
| Observer | Day | Note |
|---|---|---|
| Tom (son visits Sunday) | Sun | "Mom seemed fine, a bit forgetful" |
| Sarah (calls Wed) | Wed | "She asked me the same question four times" |
| Emma (granddaughter visits Fri) | Fri | "She couldn't remember what year it was" |
| Mrs. Chen (neighbour) | Sat | "Helen left the stove on twice this week" |

**What Bedside sees:** 4 observations, 4 different observers, all in 7 days. Compared to baseline (1-2 observations/month for 3 prior months) = **3× acceleration in observation rate**.

**The dashboard moment:**
Helen's score jumps amber. **CognitiveAccelerationCard** appears with a **ContributorMap** — a small visual showing who observed what, when, from where. Cards offer: what to document for the neurologist, a home-safety checklist (stove safety especially), when to consider a care-level reassessment.

---

### 🟥 Use Case 3 — The Breaking Point (Sarah's burnout)

**Premise:** Sarah thinks she's just venting in a private notes section. Bedside reads between the lines across 14 days and detects the burnout trajectory the rest of the family can't see.

**What Sarah types — privately, just venting:**
| Day | Sarah's text |
|---|---|
| 4 | "So exhausted today, couldn't sleep worrying about Tom" |
| 7 | "Snapped at him this morning, feel terrible about it" |
| 9 | "Haven't eaten properly in days, no time" |
| 12 | "I feel like I'm drowning and nobody is helping" |
| 14 | "I don't know how much longer I can do this" |

**What Bedside sees:** sleep disruption + emotional exhaustion + self-neglect + isolation + loss of hope. Individually = venting. Together = **caregiver-burnout trajectory** crossing the wellbeing threshold.

**The dashboard moment:**
Dashboard splits into **DualRiskView** for the first time ever in Sarah's app. Left: Tom's body score. Right: **Sarah's wellbeing score** — surfaced for the first time. **BurnoutCard** appears with: respite-care options nearby, a pre-drafted message to Sarah's brother asking for weekend backup, a local caregiver support group, a 5-min self-care check-in.

> 43% of caregivers report sleep difficulties. 36% report depression. **Bedside is the only product watching the caregiver, not just the patient.**

---

## 4. The Combined Moment — The Climax (purest A2UI)

When all three lenses are amber/red simultaneously:

- Tom's body score: **YELLOW → rising**
- Helen's cognitive score: **AMBER → accelerating**
- Sarah's wellbeing: **RED → crisis trajectory**

The agent constructs a **CombinedTriageView** — a layout that has never appeared before in this family's app, because this exact combination has never occurred. The agent decides:
1. Which risk to surface first (priority by urgency, not order of arrival)
2. Which actions are the next 24 hours' most-leveraged moves
3. Which family members to loop in for which risks

**Pitch line:** *"This dashboard has never appeared before. The agent built it because it had to."*

---

## 5. Demo Flow — 2 minutes 30 seconds

| Time | What happens | Protocol proof |
|---|---|---|
| **0:00–0:15** | **Hook.** "63M Americans are caregivers. Most are doing it with a WhatsApp group and a prayer. Bedside is the intelligent layer that was always missing." | — |
| **0:15–0:35** | **Calm baseline.** Show the 3-card dashboard: Tom green, Helen amber, Sarah green. Drift scores live. "Three people, three lenses, one app." | A2UI baseline render |
| **0:35–1:00** | **UC1 — Slow Slide.** Sarah types: *"Tom's ankles look swollen and he skipped dinner again."* AG-UI stream visible. Tom's score green→yellow. **PatternAlertCard** materialises with the 5-signal pattern across 11 days. | A2UI: card composed from these specific signals |
| **1:00–1:25** | **UC2 — Silent Decline.** Tom (the son) texts from another city: *"Mom asked me what year it was three times today."* Agent cross-refs with Sarah's Wed note + Emma's Fri visit + Mrs. Chen's stove note. Helen's score jumps amber. **ContributorMap** appears. "No single person saw this. Bedside did." | A2UI: contributor map unique to this family this week |
| **1:25–1:50** | **UC3 — Breaking Point.** Sarah types: *"I don't know how much longer I can do this."* Agent reads the 14-day private notes pattern. Dashboard splits into **DualRiskView** for the first time. **BurnoutCard** with respite options + drafted message to her brother. | AG-UI: HITL approval to send the brother message |
| **1:50–2:15** | **THE COMBINED MOMENT.** All three scores red/amber simultaneously. Agent constructs **CombinedTriageView** — priority-ordered. Show the **A2UI Plan Inspector** panel: the JSON the agent emitted, the component tree, plan_version incrementing. "This dashboard has never existed before. The agent had to build it." | A2UI: pure compose-from-scratch |
| **2:15–2:30** | **Close.** "Three people. One app. You text it. It watches everything. And when something needs your attention — it builds exactly the right dashboard for that moment. Bedside." | — |

---

## 6. UI Components (A2UI Component Kit)

Pre-approved component types the agent can compose. Agent emits JSON → frontend renders native React.

| Component | Purpose |
|---|---|
| `DriftScoreCard` | Per-person card: name, lens (body/mind/caregiver), score 0-100, color, trend arrow, last-updated |
| `PatternAlertCard` | Appears when threshold crossed: signal list with dates, why-this-pattern-matters paragraph, suggested actions |
| `ContributorMap` | UC2: visual of who observed what, when, from where — list+timeline hybrid |
| `DualRiskView` | Split-panel layout wrapper: left=patient score, right=caregiver score |
| `CombinedTriageView` | UC4: prioritized list of all 3 risks + agent-recommended first action |
| `TalkingPointsCard` | Pre-written bullet list for next doctor/neurologist visit |
| `RespiteOptionsCard` | Local respite/support options for the caregiver |
| `SignalTimeline` | Day-by-day signal strip for one patient (small chart) |
| `QuickActionCard` | Generic action card (book appt / message family member / open checklist) |
| `ApprovalPrompt` | HITL: agent asks before sending a message or booking — drives AG-UI human-in-loop |

10 components. Same order of magnitude as Willmaker (winner). Manageable.

## 7. Dashboard Layouts (states the agent can choose)

| Layout | When |
|---|---|
| `calm_dashboard` | Default. 3 DriftScoreCards stacked or grid. No alerts. |
| `single_alert` | One person's threshold crossed. That card expands + PatternAlertCard + actions. |
| `dual_risk` | Two thresholds crossed (typically patient + caregiver). DualRiskView wrapper. |
| `combined_triage` | All three crossed. CombinedTriageView wrapper. **The climax layout.** |

Layout = top-level orchestration choice the agent makes. Components fill it.

---

## 8. MCP Tools (8 tools — all real work, none decoration)

Renamed from the source doc for **safer-language compliance** (no clinical claims):

| Tool | What it does |
|---|---|
| `parse_observation_log(text)` | NLP extraction: *"legs feel heavy"* → `{signal: "leg_swelling", severity: "mild", lens: "body"}` |
| `update_wellbeing_score(person, signals)` | Recalc the person's score (Tom/Helen/Sarah) given new signals |
| `check_pattern_match(signals)` | Match current signal combination against known patterns; return pattern name + significance |
| `get_pattern_context(pattern, person)` | Return the why-this-matters paragraph for the alert card (observational language) |
| `find_local_support(zipcode, kind)` | Real-ish lookup for respite/support groups (mocked but with realistic SF/Bay Area entries) |
| `draft_talking_points(signals, person)` | Generate the bullet list for the next doctor/neurologist visit |
| `log_observation(observer, person, note, day)` | Record for the contributor map (UC2) |
| `calculate_observation_rate(person, window)` | This-week vs baseline observation rate (drives UC2 acceleration detection) |

**Note on language:** "wellbeing score" not "diagnostic score." "Pattern worth flagging" not "cardiac drift." "Talking points for your doctor" not "clinical recommendations." Disclaimer everywhere.

---

## 9. Pre-loaded Demo Data

We do not need real ML to detect patterns. We need crisp scripted data the agent processes through real tools, producing real-looking output.

| Dataset | Contents |
|---|---|
| **Tom — 11 days** | Days 1-2 baseline, day 3 appetite ↓, day 6 leg heaviness, day 8 appetite ↓, day 10 missed med, day 11 swelling visible |
| **Helen — 4 observers** | 3 months baseline (1-2 obs/month, all calm) → this week: Sun (Tom), Wed (Sarah), Fri (Emma), Sat (Mrs. Chen) — 4 observations in 7 days |
| **Sarah — 14 days** | Day 4 sleep, day 7 emotional, day 9 self-neglect, day 12 isolation, day 14 hopelessness |
| **Trigger sequence** | Demo button taps fire each in order: UC1 → UC2 → UC3 → combined |

All data lives in `backend/app/data/demo_dataset.py` as Python literals. No DB required — in-memory dict.

---

## 10. Safer Language Rules (NON-NEGOTIABLE)

This is what protects us from the medical-liability concern. Every user-facing string passes this filter:

| ❌ Don't say | ✅ Say instead |
|---|---|
| "Cardiac drift detected" | "A pattern worth raising with Tom's doctor" |
| "Pre-readmission warning" | "5 signals you might mention at the next visit" |
| "Diagnostic score" / "clinical score" | "Wellbeing score" / "wellness pattern" |
| "Diagnose" / "diagnosis" | "Notice" / "pattern" |
| "Treat" / "treatment" | "Manage" / "support" |
| "Medical advice" | "Information to share with your healthcare team" |
| "You should..." (medical action) | "You might want to mention this to..." |

**Mandatory disclaimer** on every alert card and at app-load:
> *"Bedside is not a medical device. It surfaces patterns from what you tell it, so you can share them with your healthcare team. Always consult a qualified clinician for medical decisions."*

---

## 11. Build Plan — Friday May 8 evening + Saturday morning

**Total realistic build: ~12 hours of focused work.** We have ~21. Comfortable buffer for rehearsal.

### 🌙 Friday evening (T-21h to T-12h, ~6 hours of build)

| Block | Item | Est |
|---|---|---|
| 1 | Demo dataset module + safer-language constants file | 45m |
| 2 | UI plan models rewrite (10 components, 4 layouts) | 45m |
| 3 | 8 MCP tools (real implementations, mocked external lookups) | 2h |
| 4 | Agent prompt v1 (Pydantic AI + Claude Sonnet) — emits valid UIPlan for each trigger | 1.5h |
| 5 | FastAPI scripted-trigger endpoints (`/demo/uc1`, `/uc2`, `/uc3`, `/combined`, `/reset`) | 45m |
| 6 | Smoke test end-to-end: each trigger produces correct UIPlan JSON | 30m |
| | **🚨 GO/NO-GO checkpoint: backend produces correct JSON for all 4 demo states** | |

### 🌅 Saturday morning (T-12h to T-3h, ~6 hours of build)

| Block | Item | Est |
|---|---|---|
| 7 | React renderer for 10 components + 4 layout wrappers | 2.5h |
| 8 | AG-UI streaming wired (CopilotKit adapter) — judges see live thinking | 1h |
| 9 | UIPlanInspector debug panel (collapsible JSON viewer) | 30m |
| 10 | Walmart palette + WCAG AA pass on every component | 1h |
| 11 | Pitch script + 5 dry runs + record backup video | 1h |
| | **🚨 GO/NO-GO checkpoint by Sat 1pm: end-to-end demo runs cleanly 3× in a row** | |

### 🛑 Cuts if behind schedule
1. Drop the contributor-map visual richness — fall back to a simple list (saves 30m)
2. Drop the AG-UI HITL approval modal — narrate it instead (saves 45m)
3. Drop ContributorMap entirely — keep narrative-only (saves 1h, last resort)

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Medical liability framing | Safer-language rules (§10) + disclaimer everywhere + "smart family notebook" framing |
| 3 demo triggers in 75s — any wobble kills it | Each trigger is a single button click in demo mode. No live typing. Backup video. |
| Agent emits invalid UIPlan JSON live | Pydantic validation + retry-with-fix loop in agent. Pre-cached known-good plans as fallback. |
| Stage demo crashes | Backup video recorded by Saturday 2pm, ready to play if anything breaks |
| Judge says "couldn't a chatbot do this?" | Honest answer: chatbot can't carry 14 days of state, can't watch 4 observers across a week, can't restructure a dashboard. **Memory + multi-source synthesis + dashboard composition** = the moat. |
| Crowded space (Honor, CareLinx, Papa) | Honest answer: those watch the patient. **Bedside is the only one watching the caregiver too.** Different wedge. |

---

## 13. The Pitch Frame to Memorize

> "You could text a chatbot what you noticed today. It would forget by tomorrow. Bedside remembers everything across days, watches three people through three lenses simultaneously, and when something needs your attention — it doesn't ping you with a notification. It rebuilds your entire dashboard around what matters right now. Same agent, same family, different day, completely different screen — composed not templated. That's what generative UI is for."

---

**Source of truth.** Anything that contradicts this doc is wrong. Update this doc when scope changes (with a commit). 🐶
