# Bedside — Session Handoff

> Single source of truth for resuming work. **Read this first.** Then `BEDSIDE_SPEC.md` for the full product spec, then `SUBMISSION.md` for the hackathon packet.

---

## 🎯 Current status (as of this commit)

**The full end-to-end demo runs locally with two entry surfaces.** Backend, agent, scoring engine, all 9 components, all 4 layouts, AG-UI streaming, the four scripted demo triggers, **and the new CopilotKit-style chat surface** are wired up and validated.

### What landed in the CopilotKit pass (May 8 evening)
- `<CopilotKit>` provider wraps the React tree (`frontend/src/main.tsx`)
- `BedsideChat` panel — natural-language entry, posts to `/api/chat` (`frontend/src/components/BedsideChat.tsx`)
- `POST /api/chat` — parses free text → infers target person → logs observation → recomputes plan → broadcasts via SSE
- `POST /api/approval` + interactive `ApprovalPrompt` — implements the CopilotKit `renderAndWait` HITL pattern natively (no Node runtime needed on demo day)
- `POST /api/copilotkit` — no-op stub so the provider initialises cleanly
- `@copilotkit/react-core` + `@copilotkit/react-ui` installed in `frontend/package.json`

We deliberately did **not** stand up the Node-side CopilotKit runtime; FastAPI is the single source of truth and the scripted `/demo/*` buttons remain the offline-safe fallback (same role `plan_builder.py` plays for the agent).

We are **not** waiting on a build. We are waiting on:
1. Avinash to get a Gemini API key from <https://aistudio.google.com/app/apikey> (free tier is fine)
2. Avinash to create a public GitHub repo and push
3. Saturday May 9, 1pm-5pm: at the venue, optionally swap our hand-rolled SSE for the official CopilotKit starter kit when it drops at 12:30pm
4. Saturday 4:30pm: record the 2-3 minute demo video
5. Saturday 5:45pm-6pm: submit via the global portal

## ✅ What's done

| Layer | What | File |
|---|---|---|
| Backend | FastAPI app, lifespan seeds the demo logs, CORS configured | `backend/app/main.py` |
| Endpoints | `/health` `/family` `/api/plan` `/demo/{uc1,uc2,uc3,reset,combined}` `/agui/stream` | `backend/app/main.py` |
| Agent | Pydantic AI + Gemini 2.5 Flash with deterministic fallback | `backend/app/agent.py` |
| Plan builder | Deterministic UIPlan composer (the safety net) | `backend/app/plan_builder.py` |
| Scoring | 3 peer-reviewed instruments (HF Framework / NPI / ZBI-12) | `backend/app/mcp_tools/scoring.py` |
| Parser | 28-signal taxonomy, hedge/emphatic severity inference | `backend/app/mcp_tools/observation_parser.py` |
| Patterns | Pulls live evidence from scoring engine, attaches citation | `backend/app/mcp_tools/patterns.py` |
| Support tools | Local-support lookup + talking-points drafting | `backend/app/mcp_tools/support.py` |
| UI models | Pydantic models for 10 components + 4 layouts | `backend/app/ui_plan.py` |
| Demo data | Reynolds family + 4-week NPI baseline + trigger sequence | `backend/app/data/demo_dataset.py` |
| Frontend types | TypeScript mirror of the Pydantic models | `frontend/src/types/uiPlan.ts` |
| A2UI components | All 9 React renderers | `frontend/src/components/A2UIComponents.tsx` |
| Layouts | All 4 layout dispatchers | `frontend/src/components/Layouts.tsx` |
| AG-UI hook | SSE subscription, plan + agent-step state | `frontend/src/hooks/useAGUIStream.ts` |
| App shell | Header, demo trigger bar, agent reasoning panel | `frontend/src/App.tsx` |

**Smoke test:** `BEDSIDE_FORCE_DETERMINISTIC=1 pytest`-equivalent inline test passes — every endpoint returns 200, every UIPlan validates against the Pydantic schema.

## 🚧 What's NOT done (small list)

1. **Gemini API key** — set `GOOGLE_API_KEY` in `backend/.env` to enable LLM mode. Without it, the deterministic fallback runs and the demo still works (the meta tag will show `fallback_reason`).
2. **Public GitHub repo** — Avinash to create + share URL.
3. **Demo video** — record Saturday afternoon at the venue.
4. **(Optional) CopilotKit official starter kit swap** — `useAGUIStream` is the single swap point. If the kit lands and is worth using, replace it; otherwise our SSE setup ships fine.
5. **(Optional) Polish pass** — copy tweaks, transitions, screenshot for the README.

## 🚀 How to run locally

```bash
# Terminal 1 — backend
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
echo "GOOGLE_API_KEY=your-gemini-key-here" > .env  # optional
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Visit <http://localhost:5173>. Click the trigger buttons in the header.

## 🧪 How to verify everything still works

```bash
cd backend
BEDSIDE_FORCE_DETERMINISTIC=1 python3 -c "
from fastapi.testclient import TestClient
from app.main import app
from app.ui_plan import UIPlan
c = TestClient(app)
with c:  # triggers lifespan seed
    for trig in ['uc1','uc2','uc3','reset','combined']:
        p = '/demo/reset' if trig=='reset' else f'/demo/{trig}'
        UIPlan(**c.post(p).json())
        print(f'OK {p}')
    # CopilotKit chat surface
    r = c.post('/api/chat', json={'message': \"Tom's ankles are really swollen and he barely ate\", 'observer': 'sarah'})
    UIPlan(**r.json()['plan'])
    print(f'OK /api/chat -> {r.json()[\"plan\"][\"layout\"]}')
"
```

## 🧠 Architecture in one paragraph

The user fires a demo trigger (HTTP POST `/demo/uc1`). The FastAPI handler appends an observation to the in-memory log store and asks `agent.compose_plan()` for a fresh UIPlan. The agent runs in one of two modes — Pydantic AI + Gemini if `GOOGLE_API_KEY` is set, deterministic `plan_builder.build_plan()` otherwise. Either way, the result is a UIPlan dict that's validated against the Pydantic schema, broadcast via SSE on `/agui/stream`, and returned in the HTTP response. The React frontend's `useAGUIStream` hook receives the `plan_updated` event and the `renderLayout` dispatcher mounts the matching layout, which in turn calls `renderComponent` for each card. Throughout, `agent_step` events stream the agent's reasoning to the right-hand panel — that's the AG-UI moment.

## 🎨 Design system

Bedside palette in `frontend/tailwind.config.ts`. WCAG AA contrast on every text/background pairing. State colors (green/yellow/amber/red) are always paired with an icon + label so the UI is color-blind safe.

## 📂 Repository layout

```
backend/
  app/
    agent.py              # Pydantic AI + Gemini, deterministic fallback
    plan_builder.py       # Deterministic UIPlan composer (always works)
    main.py               # FastAPI app + endpoints + SSE
    ui_plan.py            # 10 component models + UIPlan
    data/
      demo_dataset.py     # Reynolds family + triggers
      language_rules.py   # Safer-language constants + citations
    mcp_tools/
      observation_parser.py
      scoring.py
      patterns.py
      support.py
      __init__.py         # ALL_TOOLS list (8 tools)
    prompts/system.md     # Agent system prompt v2
frontend/
  src/
    App.tsx               # Shell + trigger bar + reasoning panel
    components/
      A2UIComponents.tsx  # 9 React renderers
      Layouts.tsx         # 4 layout dispatchers
    hooks/
      useAGUIStream.ts    # SSE subscription
    types/uiPlan.ts       # TS mirror of Pydantic models
BEDSIDE_SPEC.md           # Full product spec — read first
SUBMISSION.md             # Hackathon submission packet
README.md                 # Public-facing project README
SESSION_HANDOFF.md        # This file
```

## 🚨 Do NOT do these things

1. ❌ Do NOT add Walmart Element. This is a public hackathon project. Use Gemini free tier or sponsor credits (Anthropic / OpenAI / Google) distributed at check-in.
2. ❌ Do NOT add new components without a use-case in `BEDSIDE_SPEC.md`. Ten is enough.
3. ❌ Do NOT change the safer-language disclaimer or the citation strings — they're load-bearing for credibility.
4. ❌ Do NOT delete `plan_builder.py`. It's the demo safety net when Gemini is rate-limited or offline.
5. ❌ Do NOT make the agent invent observations. It can only render evidence that's actually in the store.

## ✅ DO these things

1. ✅ Surface the citation verbatim on every alert card. That's the credibility flex.
2. ✅ Keep every component file under 600 lines.
3. ✅ Run the inline smoke test before any commit.
4. ✅ Commit small + often.
5. ✅ When in doubt, refer to `BEDSIDE_SPEC.md` — it's the single source of truth.

## ▶️ What to do FIRST in a new session

1. Read this file.
2. Skim `BEDSIDE_SPEC.md` (the full spec).
3. Skim `SUBMISSION.md` (the hackathon packet).
4. Run the inline smoke test (above).
5. Open with: *"Caught up. Ready to proceed — what's the goal for this session?"*
