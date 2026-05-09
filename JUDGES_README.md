# Anchor — Judge Checklist

If you only have two minutes to inspect the repo, start here.

## What Anchor Is

Anchor watches three lenses for one caregiving family:

- **Tom** — body after cardiac discharge (Heart Failure Symptom Framework)
- **Helen** — cognition during early dementia (Neuropsychiatric Inventory)
- **Sarah** — caregiver burden (Zarit Burden Interview, 12-item)

The user types plain-English observations. Anchor parses 28 validated clinical
signals, runs three peer-reviewed instruments, and emits a fresh `UIPlan` that
**rebuilds the React dashboard in real time**.

## Why This Is Generative UI

A chatbot summarises concern. Anchor changes the interface itself:

| State | Layout emitted |
|---|---|
| All three family members healthy | `calm_dashboard` — three quiet score cards, green sparklines |
| One crossing detected | `single_alert` — focused amber card + FamilyLoadMeter + care plan |
| All three lenses active | `combined_triage` — ordered by urgency, critical FLM |

The `FamilyLoadMeter`, `CarePlanCard`, and `GenerationReceipt` are all
generated *for that moment* — same care plan won't appear twice unless the
same evidence pattern fires.

## New in This Build (2nd-round judge feedback)

- **FamilyLoadMeter** — system-level gauge (calm / rising / high / critical)
  computed from cross-lens weights; caregiver crossings count double
- **CarePlanCard** — 3-5 generated steps with per-person delegation;
  "Generated because: Tom amber" inline reasoning; approve / dismiss / done
- **DraftMessagePanel** — "Approve & draft" opens an editable draft with
  5 tone chips (Caring / Softer / More direct / Shorter / Add specifics)
  that regenerate the message inline — the "Copilot That Ships" moment
- **GenerationReceipt** — collapsible panel: layout chosen, reason,
  components rendered, MCP tools used
- **Auto-scroll** to care plan when a new plan version renders
- **Chat drawer auto-closes** after sending to restore dashboard focus
- **App auto-resets on load** — always starts green; `?keep=1` disables

## Sponsor Protocol Map

See `PROTOCOL_COMPLIANCE.md` for the detailed mapping.

- **A2UI:** `backend/app/ui_plan.py`, `backend/app/plan_builder.py`,
  `frontend/src/components/Layouts.tsx`, `frontend/src/components/A2UIComponents.tsx`
- **AG-UI:** `backend/app/main.py` `/api/agui/stream`,
  `frontend/src/hooks/useAGUIStream.ts`
- **MCP:** `backend/app/mcp_server.py` exposes eight Anchor tools via `FastMCP`;
  implementations in `backend/app/mcp_tools/*`
- **CopilotKit:** `frontend/src/main.tsx` wraps the full app in `<CopilotKit>`;
  `frontend/src/components/CopilotKitProtocolProof.tsx` uses `useCoAgent`,
  `useCopilotAction` (with `render`), and `useCopilotReadable`

## How To Run

**Backend:**

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
# Optional: add your Gemini key (free tier at aistudio.google.com/app/apikey)
echo "GOOGLE_API_KEY=your-key-here" > .env
# Or force deterministic mode (no LLM, fully offline):
ANCHOR_FORCE_DETERMINISTIC=1 uv run uvicorn app.main:app --reload --port 8000
```

Visit <http://localhost:8000/health> to confirm it's alive.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## Demo Path (fastest path to the "wow moment")

The app auto-resets to green on load. No manual reset needed.

1. **Open "Tell Anchor"** — the indigo pill, bottom-left corner.
2. **Click the Tom suggestion** (pre-filled):
   *"Tom's ankles are really swollen, he barely ate anything, missed his
   evening blood thinner, and just doesn't seem himself"*
   — the drawer closes, dashboard rebuilds to `single_alert`, Tom goes amber.
3. **Scroll down** — auto-scroll lands on the generated `CarePlanCard`.
   Note the "Generated because: Tom amber" subtitle.
4. **Click "Approve & draft"** on any step — `DraftMessagePanel` opens
   with an editable message and 5 tone chips. Click each chip to see the
   message regenerate inline.
5. **Click "Helen · silent decline"** (demo shortcut row) — triggers the
   4-observer cognitive pattern. Layout rebuilds to `combined_triage`.
6. **Expand** the `GenerationReceipt` at the bottom — shows layout reason
   and which MCP tools fired.
7. **Click Reset** — all three cards return to green. Start again.

## Important Honesty

The live demo path uses FastAPI + deterministic `plan_builder` + SSE for
stage reliability. The LLM (Gemini 2.5 Flash) is available when a
`GOOGLE_API_KEY` is set, but the deterministic fallback produces
identical layouts and richer clinical copy — it is the preferred demo path.

## What Is Mocked

- In-memory observation store instead of a database
- Deterministic parser + scoring (keyword matching, not embeddings)
- Realistic local support fixture data instead of live provider API

The clinical instrument scores, threshold crossings, UIPlan composition,
human-in-the-loop draft flow, and live UI rebuild are the real product logic.
