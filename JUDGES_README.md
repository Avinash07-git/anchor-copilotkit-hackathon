# Anchor — Judge Checklist

If you only have two minutes to inspect the repo, start here.

## What Anchor Is

Anchor watches three lenses for one caregiving family:

- Tom's body after cardiac discharge
- Helen's cognition during early dementia
- Sarah's caregiver burden

The user types plain-English observations. Anchor parses the signals, runs
three peer-reviewed instruments, and emits a fresh `UIPlan` that rebuilds the
React dashboard in real time.

## Why This Is Generative UI

A chatbot could summarize concern. Anchor changes the interface itself:

- calm baseline -> three quiet score rows
- one pattern -> focused alert card + talking points
- multi-observer cognition -> contributor map
- caregiver burden -> human approval prompt
- all three active -> combined triage view ordered by urgency

The key proof is the dashboard recomposing from `calm_dashboard` to
`single_alert`, `dual_risk`, or `combined_triage` based on live evidence.

## Sponsor Protocol Map

See `PROTOCOL_COMPLIANCE.md` for the detailed mapping.

Short version:

- **A2UI:** `backend/app/ui_plan.py`, `backend/app/plan_builder.py`,
  `frontend/src/components/Layouts.tsx`, `frontend/src/components/A2UIComponents.tsx`
- **AG-UI:** `backend/app/main.py` `/agui/stream`,
  `frontend/src/hooks/useAGUIStream.ts`
- **MCP:** `backend/app/mcp_server.py` exposes the eight Anchor tools through
  `FastMCP`; implementations live in `backend/app/mcp_tools/*`
- **CopilotKit:** `frontend/src/main.tsx` has an optional provider path behind
  `?copilot=1`; `frontend/src/components/CopilotKitProtocolProof.tsx` uses
  `useCoAgent`, `useCopilotAction`, `render`, and `renderAndWait`

## How To Run

Backend:

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
ANCHOR_FORCE_DETERMINISTIC=1 uv run uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## Demo Path

1. Click **Reset**.
2. Open **Tell Anchor**.
3. Type: `Tom's ankles look a little puffy today`.
4. Type: `He hardly touched dinner, said he wasn't hungry`.
5. Type: `He forgot to take his evening blood thinner`.
6. Type: `His ankles are really swollen now, he just doesn't seem himself`.
7. Type: `I really don't know how much longer I can do this`.
8. Click **Helen · silent decline** to show the multi-observer contributor map.

The dashboard should visibly rebuild as the agent emits new plans.

## Important Honesty

The default live demo path uses FastAPI + validated UIPlan + SSE for stage
reliability. CopilotKit sponsor APIs are present as an opt-in proof surface so
we do not risk destabilizing the judged demo with an optional runtime probe.
MCP tools are both used by the app and exposed through a `FastMCP` server.

## What Is Mocked

- In-memory demo logs instead of a database
- Deterministic parser/scoring for reliable stage behavior
- Realistic local support fixture data instead of live provider search

The scoring frameworks, thresholds, component composition, approval prompt, and
live UI rebuild are the actual product logic.
