# Anchor — Hackathon Submission Packet

> Generative UI Global Hackathon · San Francisco · May 9, 2026

Everything the global submission portal asks for, in one file. Copy-paste from here on submission.

---

## Project name
**Anchor**

## One-sentence pitch
The intelligent layer that was always missing — three lenses, one app, where the agent rebuilds the dashboard in real time as your family's wellbeing changes.

## What we built (and why it's generative UI, not a chatbot)

Anchor is an agentic interface for a family caregiver tracking three people at once: Tom (post-cardiac), Helen (early dementia), and Sarah (the caregiver herself). The user types casual observations in plain English. The agent runs three peer-reviewed clinical instruments under the hood and **emits a fresh `UIPlan` JSON** that the React renderer mounts as a completely re-composed dashboard.

There is no static layout. The agent picks one of four layouts — `calm_dashboard`, `single_alert`, `dual_risk`, or `combined_triage` — and fills it with the right cards, in the right order, with the right citations, for the moment it's in.

Why this is generative UI:
1. **The same family produces a different dashboard every session.** Tom's pattern → single-alert with `PatternAlertCard` + `TalkingPointsCard`. Helen's multi-observer drift → `ContributorMap` showing who saw what when. Sarah's hopelessness phrase → split-pane `dual_risk` with a draft message + `ApprovalPrompt`. All three at once → `CombinedTriageView` with the agent picking row order.
2. **The agent makes judgment calls.** It decides triage row order, picks talking-point audience, chooses which patient to spotlight when only one alert is firing.
3. **A chatbot literally cannot do this.** The crown-jewel beat is the dashboard physically re-composing itself live on stage as observations land. That experience is structurally impossible in a chat bubble.

## Protocols used

- **A2UI** — `UIPlan` schema (10 component types, 4 layouts) emitted by the agent and validated by Pydantic before going over the wire.
- **AG-UI** — Server-Sent Events stream of `agent_step` + `plan_updated` events; the frontend's reasoning panel narrates the agent live. The Python side uses `pydantic-ai-slim[ag-ui]`-shaped event payloads (the official Pydantic AI ↔ AG-UI bridge).
- **MCP** — 8 MCP tools for parsing, scoring, pattern matching, support lookup, and talking-points drafting. The scoring tools wrap three peer-reviewed instruments (HF Symptom Monitoring Framework, NPI, ZBI-12).
- **CopilotKit** — The React frontend uses CopilotKit's UI primitives (`@copilotkit/react-core` + `@copilotkit/react-ui` are installed in `frontend/package.json`) and follows two of its documented patterns end-to-end. **(1)** The `AnchorChat` panel is the natural-language entry surface that drives the agent: caregivers type in plain English, FastAPI handles the chat round-trip at `/api/chat`, and the dashboard re-renders via the existing AG-UI SSE channel. **(2)** The interactive `ApprovalPrompt` component implements CopilotKit's `renderAndWait` human-in-the-loop pattern — the caregiver must approve before any draft message "ships". *Honest disclosure:* we do **not** mount the `<CopilotKit>` provider or run the Node-side GraphQL `CopilotRuntime`, because FastAPI is the single source of truth for the demo and we wanted one fewer process to babysit on stage. Per the official CopilotKit docs (May 2026), Pydantic AI is a first-party supported backend for exactly this kind of pattern bridge.

## Team
Avinash — solo build.

## Public GitHub repo
*(Add URL on submission.)*

## Demo video
*(Loom link — record at the venue, ~2:30 long, working code only.)*

## Tracks fit
Primary: **Kill the Dashboard.**
Secondary: **The Copilot That Ships** (the `ApprovalPrompt` for the brother message is the agent shipping interactive UI for the user to confirm + execute inline).

---

## Pre-existing work disclosure (judges weigh this)

The handbook explicitly allows pre-existing code provided we're transparent about what was built when. Here's the honest split:

### Built before the event window
- Product spec + research (`ANCHOR_SPEC.md` — single source of truth)
- Three peer-reviewed scoring instruments (`backend/app/mcp_tools/scoring.py`) with citations to PMC9070923 (HF Framework), Cummings et al. (NPI), and PMC6497029 (ZBI-12)
- Safer-language framework + banned-phrase list (`backend/app/data/language_rules.py`)
- 28-signal taxonomy + deterministic NLP parser (`backend/app/mcp_tools/observation_parser.py`)
- Reynolds family demo dataset + 4-week NPI baseline + trigger sequence (`backend/app/data/demo_dataset.py`)
- Pydantic models for the `UIPlan` schema + 10 components + 4 layouts (`backend/app/ui_plan.py`)
- FastAPI shell + Vite/React/Tailwind frontend skeleton

### Built during the 6-hour event window
- Pydantic AI agent integration with Gemini 2.5 Flash (`backend/app/agent.py`)
- AG-UI Server-Sent Events streaming layer (`backend/app/main.py` + `frontend/src/hooks/useAGUIStream.ts`)
- All 9 React A2UI component renderers (`frontend/src/components/A2UIComponents.tsx`)
- All 4 layout dispatchers (`frontend/src/components/Layouts.tsx`)
- Live demo trigger endpoints with narrated agent steps (`backend/app/main.py /demo/*`)
- **CopilotKit pattern bridge** — `@copilotkit/react-core` + `@copilotkit/react-ui` installed; conversational `AnchorChat` panel (`frontend/src/components/AnchorChat.tsx`); `/api/chat` natural-language endpoint that infers the target person from extracted signals; `/api/approval` HITL endpoint that powers the interactive `ApprovalPrompt` (CopilotKit `renderAndWait` pattern). The `<CopilotKit>` provider is intentionally not mounted (no Node runtime on demo day) — FastAPI is the single source of truth.
- **Premium-calm visual design system** — indigo `#4f46e5` + coral `#fb7185` accents on warm cream `#fbf7f0` (`frontend/tailwind.config.ts`), Fraunces display serif + Inter + JetBrains Mono. Hero with radial-gradient mesh + custom anchor mark logo. DriftScoreCard upgrade: per-person avatars with lens-icon badges, 14-day SVG sparkline (`frontend/src/components/Sparkline.tsx`), adaptive glow border so amber/red cards tell the alert story at a glance.
- Dashboard composition + on-stage polish + demo video

The science (the three peer-reviewed instruments) is what makes Anchor not-a-toy. The 6-hour event window is where it became a generative-UI experience.

---

## What to demo on stage (2:30, working code only)

1. **0:00–0:25** — Open dashboard. Three calm `DriftScoreCard`s. *"Anchor is the intelligent layer that was always missing. The Reynolds family — Tom 68, Helen 84, Sarah 42 — all calm right now."*
2. **0:25–0:55** — In the **`Tell Anchor` chat panel** (CopilotKit surface), Sarah types *"Tom's ankles are really swollen and he barely ate anything."* Watch the AG-UI panel narrate `parse_observation_log → S3 edema (severe)…`. Dashboard re-composes to `single_alert` with the PatternAlertCard citing PMC9070923. *"Same dashboard, different layout, because the agent decided so — from one sentence of plain English."*
3. **0:55–1:35** — Click `② Helen — silent decline` (multi-observer is easier as a button than typing four notes live). Four observers' notes flow in. Dashboard adds the `ContributorMap` with the 9× drift number. *"No single person saw this. Anchor did. The math is the validated NPI multi-observer aggregation."*
4. **1:35–2:10** — Back to chat. Sarah types *"I really don't know how much longer I can do this."* Z10 hopelessness override fires. Dashboard switches to `combined_triage`. The `ApprovalPrompt` materialises with a draft message to her brother — click **Send it** to demonstrate the CopilotKit `renderAndWait` HITL beat. *"The average says she's fine. The validated single-signal override says watch carefully. And Anchor never ships a message without you."*
5. **2:10–2:30** — Pause. *"Six hours. Three peer-reviewed instruments. A dashboard that rebuilds itself from plain English. This is what an agentic interface looks like."*
