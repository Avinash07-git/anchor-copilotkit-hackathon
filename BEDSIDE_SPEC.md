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
Helen's state jumps to **RED** under the NPI drift-rate rule (this week's observation activity is ~9× her 4-week baseline — well past the >50% "rapid acceleration" tier). **CognitiveAccelerationCard** appears with a **ContributorMap** — a small visual showing who observed what, when, from where. Cards offer: what to document for the neurologist, a home-safety checklist (stove safety especially), when to consider a care-level reassessment.

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

- Tom's body state: **AMBER → 4 symptom domains active + high-risk combo (HF Framework)**
- Helen's cognitive state: **RED → ~9× baseline observation activity (NPI drift)**
- Sarah's caregiver state: **AMBER → ZBI hopelessness override fired**

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
| **0:35–1:00** | **UC1 — Slow Slide.** Sarah types: *"Tom's ankles are really swollen and he barely ate anything — he just doesn't seem himself."* AG-UI stream visible. Tom's state green→amber under the HF Symptom Monitoring Framework. **PatternAlertCard** materialises with the high-risk combo (edema + missed med, both ≥ moderate) cited verbatim. | A2UI: card composed from these specific signals + framework citation |
| **1:00–1:25** | **UC2 — Silent Decline.** Four observers' notes hit the system within 24 hours — Tom (Sun), Sarah (Wed), Emma (Fri), Mrs. Chen (Sat). Agent runs the NPI multi-observer aggregation: weekly score 10/96 vs 4-week baseline of 1/96 → ~9× drift → RED "rapid acceleration" tier. **ContributorMap** appears. "No single person saw this. Bedside did." | A2UI: contributor map unique to this family this week |
| **1:25–1:50** | **UC3 — Breaking Point.** Sarah types: *"I really don't know how much longer I can do this."* Agent reads the day-14 phrase as ZBI Z10 hopelessness at severity 3 — the validated single-signal override fires AMBER even though her overall score is just 3/100. Dashboard splits into **DualRiskView** for the first time. **BurnoutCard** with respite options + drafted message to her brother. **"The average says she's fine. The validated override says watch carefully."** | AG-UI: HITL approval to send the brother message |
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

## 7.5 The Three Peer-Reviewed Scoring Instruments — NEW

**The whole product credibility hinges on this section.** State changes are no longer driven by hand-picked numbers — every score, every threshold, every rebuild trigger maps to a published clinical instrument. Each `PatternAlertCard` surfaces the citation verbatim so the user (and the judges) can see the work.

### Instrument 1 — Tom's Physical Drift
- **Source:** Heart Failure Symptom Monitoring Framework (Georgetown / NIH, PMC9070923)
- **Math:** 8 validated symptom domains (S1 dyspnea, S2 fatigue, S3 edema, S4 appetite loss, S5 general unwellness, S6 orthopnea, S7 missed med, S8 sudden weight gain). 7-day rolling window. Per domain, take the **max severity** (1-3) seen in the window. Sum = raw score, range 0-24.
- **State thresholds:** 0-4 GREEN · 5-9 YELLOW · 10-14 AMBER · 15+ RED
- **Auto-rebuild rules:** (a) 3+ distinct domains active at ≥ moderate severity, OR (b) **high-risk combo** — edema OR dyspnea + missed medication, both at ≥ moderate (this is the framework's named pre-decompensation pattern), OR (c) state crosses into AMBER/RED.
- **In our demo:** Tom lands at AMBER (raw 11/24) with the high-risk combo firing.

### Instrument 2 — Helen's Cognitive Drift
- **Source:** Neuropsychiatric Inventory (NPI; Cummings et al.) — the most widely used informant-reported instrument in dementia clinical trials.
- **Math:** 8-domain subset (C1 memory/repetition, C2 disorientation, C3 safety failure, C4 agitation, C5 withdrawal, C6 sleep disruption, C7 self-care decline, C8 language difficulty). Per observation, each detected domain gets `domain_score = frequency (1-4) × severity (1-3)`. Multi-observer rule: take the **max** domain score across all observers in the same week (do not average — a high-concern observation should not be diluted). Weekly score = sum of max-per-domain. Range 0-96.
- **State driver:** **drift rate vs 4-week baseline**, not absolute score. `drift% = (this_week - 4wk_avg) / 4wk_avg × 100`. Thresholds: <15% GREEN · 15-30% YELLOW · 31-50% AMBER · >50% RED. Rate of change is what matters; a stable AMBER patient does not rebuild, an accelerating one does.
- **In our demo:** Helen lands at RED. Baseline ~1/96 per week, this week 10/96 across 4 observers → drift ~900% → "rapid acceleration" tier. The number sounds wild but is honest — her usual weeks are quiet.

### Instrument 3 — Sarah's Caregiver Burden
- **Source:** Zarit Burden Interview, 12-item (ZBI-12; PMC6497029). Validated cut-off: 13/48 raw for community caregivers; we adapt the 12-domain structure with severity 0-3 per detection.
- **Math:** 12 ZBI domains (Z1 sleep, Z2 emotional exhaustion, Z3 isolation, Z4 guilt, Z5 loss of control, Z6 financial stress, Z7 anger/resentment, Z8 health neglect, Z9 relationship strain, Z10 hopelessness, Z11 fear/anxiety, Z12 loss of personal time). 14-day window. Per domain, **sum** (not max) the daily severities (burnout is cumulative, not episodic). Cap each domain at 14×3 = 42, total cap = 504. Normalise to 0-100.
- **State thresholds:** 0-24 GREEN · 25-45 YELLOW · 46-68 AMBER · 69+ RED
- **🚨 Hopelessness override (Z10):** if a single severe Z10 signal is detected (e.g. "I don't know how much longer I can do this"), the state escalates to **AMBER minimum + rebuild fires**, regardless of overall score. This is a validated safety rule — Hébert et al. 2000 — not a math result.
- **In our demo:** Sarah's normalised score is ~3/100 (she's coping on the surface). The day-14 hopelessness phrase fires Z10 at severity 3 → AMBER override + rebuild. **This is the sharpest pitch line we have:** *"the average says she's fine; the validated single-signal override says watch carefully."*

### Why this matters for the pitch
A judge can ask *"how did you pick those numbers?"* and the answer is *"we didn't — each instrument cites the published reference range right on the alert card."* That converts a soft underbelly into a credibility flex without spending another hour on ML.

---

## 8. MCP Tools (8 tools — all real work, none decoration)

Renamed from the source doc for **safer-language compliance** (no clinical claims) and rewired to call the three peer-reviewed instruments under the hood (see §7.5):

| Tool | What it does |
|---|---|
| `parse_observation_log(text)` | NLP extraction: returns a list of detected signals (S1–S8 / C1–C8 / Z1–Z12) each with severity (1-3) and frequency (1-4). One observation can yield multiple signals (e.g. "skipped dinner and his legs feel heavy" → S4 + S3). |
| `update_wellbeing_score(person)` | Runs the right instrument for the person's lens. Returns `{state, color, wellbeing_score (0-100), raw_score_label, active_domains, rebuild_triggered, rebuild_reason, citation, extras}`. |
| `check_pattern_match(person)` | Returns the matched pattern (with its citation + suggested actions + the score result) when rebuild fired, else None. |
| `get_pattern_context(pattern, person)` | Return the why-this-matters paragraph + citation for the alert card. |
| `find_local_support(kind)` | Real-ish lookup for respite/support groups (mocked but with realistic SF/Bay Area entries). |
| `draft_talking_points(person)` | Generate the bullet list for the next doctor/neurologist visit. |
| `log_observation(observer, person, note, day, signals?)` | Record for the contributor map (UC2). |
| `calculate_observation_rate(person)` | This-week vs baseline observation rate + observer list (drives the ContributorMap). |

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
| 3.5 | ✅ **Three peer-reviewed scoring instruments** (HF Framework / NPI / ZBI-12) wired in, citations on every alert card | (done) |
| 4 | Agent prompt v2 (Pydantic AI + Claude Sonnet) — emits valid UIPlan for each trigger | 1.5h |
| 5 | FastAPI scripted-trigger endpoints (`/demo/uc1`, `/uc2`, `/uc3`, `/combined`, `/reset`) | 45m |
| 6 | Smoke test end-to-end: each trigger produces correct UIPlan JSON | 30m |
| | **🚨 GO/NO-GO checkpoint: backend produces correct JSON for all 4 demo states** | |

### 🌅 Saturday morning (T-12h to T-3h, ~6 hours of build)

| Block | Item | Est |
|---|---|---|
| 7 | React renderer for 10 components + 4 layout wrappers | 2.5h |
| 8 | AG-UI streaming wired (CopilotKit adapter) — judges see live thinking | 1h |
| 9 | UIPlanInspector debug panel (collapsible JSON viewer) | 30m |
| 10 | Polish pass: bedside palette + WCAG AA contrast on every component | 1h |
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
