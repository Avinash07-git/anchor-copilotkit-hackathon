# 🛏️ Anchor

> The intelligent layer that was always missing.
> Three lenses, one app — the patient's body, the patient's mind, and the caregiver's breaking point.

Anchor is a **generative-UI** application built for the *Generative UI Global Hackathon* (May 9, 2026 — San Francisco). The agent reads casual observations from family caregivers, runs three peer-reviewed clinical instruments under the hood, and **rebuilds the dashboard in real time** when something needs attention. There is no static layout. Every render is composed by the agent for the moment it's in.

## Why this is generative UI (not a chatbot)

| Moment | What the agent renders |
|---|---|
| Calm baseline | Three quiet `DriftScoreCard`s, all green |
| Tom's edema + missed med trips the HF Symptom Framework | Single-alert layout with a `PatternAlertCard` (cited PMC9070923) + `TalkingPointsCard` for his cardiologist |
| Helen's family quietly logs 4 cognitive incidents in one week | RED `ContributorMap` with a 4-week NPI baseline overlay |
| Sarah types *"I don't know how much longer I can do this"* | Dual-risk split-pane with `BurnoutCard` + `RespiteOptionsCard` + `ApprovalPrompt` to draft a message to her brother |
| All three at once | `CombinedTriageView` — agent picks the row order based on urgency |

A chatbot can't do this. A pre-built dashboard can't do this. This is the point.

## Stack

| Layer | Choice |
|---|---|
| Agent | Pydantic AI |
| LLM | Gemini 2.5 Flash (free tier via Google AI Studio) |
| Protocols | A2UI (UI Plan JSON) · AG-UI (event stream) · MCP (8 tools) · CopilotKit (frontend adapter) |
| Backend | FastAPI · uv · Python 3.11 |
| Frontend | React 18 · Vite · Tailwind · TypeScript |
| Scoring | Three peer-reviewed instruments (HF Framework PMC9070923 / NPI Cummings et al. / ZBI-12 PMC6497029) |

## Quick start

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
echo "GOOGLE_API_KEY=your-gemini-key-here" > .env
uv run uvicorn app.main:app --reload --port 8000
```

Visit <http://localhost:8000/health> to confirm it's alive, <http://localhost:8000/docs> for the API.

Get a free Gemini API key at <https://aistudio.google.com/app/apikey>.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit <http://localhost:5173>.

## Demo flow (2 min 30 sec)

```bash
# 1. Reset to clean baseline
curl -X POST http://localhost:8000/demo/reset

# 2. Trip Tom's heart-failure pattern
curl -X POST http://localhost:8000/demo/uc1

# 3. Trip Helen's cognitive-acceleration pattern (4 observers)
curl -X POST http://localhost:8000/demo/uc2

# 4. Trip Sarah's caregiver-burnout pattern (Z10 override)
curl -X POST http://localhost:8000/demo/uc3
```

Each call returns a fresh `UIPlan` JSON. The frontend subscribes via SSE and re-renders the dashboard live.

## Repository layout

```
backend/
  app/
    agent.py              # Pydantic AI agent → emits UIPlan
    main.py               # FastAPI app + demo trigger endpoints
    ui_plan.py            # Pydantic models for the 10 components + 4 layouts
    data/
      demo_dataset.py     # Reynolds family + 4-week NPI baseline + triggers
      language_rules.py   # Safer-language constants + state→color mapping
    mcp_tools/
      observation_parser.py   # NLP signal extraction (28 validated IDs)
      scoring.py              # 3 peer-reviewed instruments
      patterns.py             # Pattern matchers w/ citations
      support.py              # Local-support lookup + talking-points draft
    prompts/system.md     # Agent system prompt v2
frontend/
  src/
    App.tsx               # Shell + dashboard mount
    components/           # 10 A2UI components
    layouts/              # 4 layouts the agent picks from
    types/uiPlan.ts       # TS mirror of the Pydantic models
ANCHOR_SPEC.md           # Single source of truth (read this first)
SUBMISSION.md             # Hackathon submission packet
```

## Safer-language commitment

Anchor is **not** a medical device. It surfaces patterns from observations its users record, with citations to the published instruments it uses, so users can have better conversations with their healthcare team. The agent prompt enforces a strict no-clinical-claim banned-phrase list (see `backend/app/data/language_rules.py`) and every alert card carries a verbatim disclaimer.

## License

MIT (TBD — finalised at submission).
