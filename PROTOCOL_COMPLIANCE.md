# Anchor — Protocol Compliance Map

This file exists for hackathon judges and sponsor reviewers. It maps the
project directly to the sponsor call-outs: CopilotKit, AG-UI, A2UI, and MCP.

## The Core Generative UI Claim

Anchor is not a chatbot wrapper. The user can type one casual observation, and
the agent emits a validated `UIPlan` JSON that changes the dashboard structure:

- calm day -> three quiet `DriftScoreCard` rows
- Tom physical pattern -> `single_alert` with `PatternAlertCard` + talking points
- Helen multi-observer drift -> contributor map and NPI-based alert
- Sarah burnout signal -> caregiver alert + human approval prompt
- all three active -> `combined_triage`, with rows ordered by urgency

The key code path is:

- `backend/app/main.py` — `/api/chat`, `/demo/*`, `/agui/stream`
- `backend/app/plan_builder.py` — deterministic UIPlan composer
- `backend/app/ui_plan.py` — Pydantic A2UI schema contract
- `frontend/src/components/Layouts.tsx` — layout dispatcher
- `frontend/src/components/A2UIComponents.tsx` — component catalog renderer

## A2UI

Status: real and central.

Anchor's A2UI contract is the `UIPlan` schema:

- 4 layouts: `calm_dashboard`, `single_alert`, `dual_risk`, `combined_triage`
- 9 rendered component types: `DriftScoreCard`, `PatternAlertCard`,
  `ContributorMap`, `TalkingPointsCard`, `RespiteOptionsCard`,
  `SignalTimeline`, `QuickActionCard`, `ApprovalPrompt`, `CombinedTriageView`
- Backend validates outgoing plans with Pydantic models.
- Frontend renders the plan with a native React dispatcher.

Files:

- `backend/app/ui_plan.py`
- `backend/app/plan_builder.py`
- `frontend/src/types/uiPlan.ts`
- `frontend/src/components/Layouts.tsx`
- `frontend/src/components/A2UIComponents.tsx`

## AG-UI

Status: real event-stream behavior, FastAPI-first implementation.

Anchor streams two event classes to the frontend:

- `agent_step` — live reasoning/progress narration
- `plan_updated` — fresh UIPlan payload, causing the dashboard to recompose

Files:

- `backend/app/main.py` — `/agui/stream` Server-Sent Events endpoint
- `frontend/src/hooks/useAGUIStream.ts` — client subscription and state update
- `frontend/src/App.tsx` — reasoning ribbon + live plan rendering

Why this matters: remove `/agui/stream`, and the dashboard no longer updates
live from agent work. The stream is not decoration.

## MCP

Status: real tools, now exposed through a real MCP server module.

The same eight functions that power Anchor are exposed via `FastMCP`:

1. `parse_observation_log`
2. `log_observation`
3. `update_wellbeing_score`
4. `calculate_observation_rate`
5. `check_pattern_match`
6. `get_pattern_context`
7. `find_local_support`
8. `draft_talking_points`

Files:

- `backend/app/mcp_tools/*` — production tool implementations
- `backend/app/mcp_server.py` — MCP `FastMCP` protocol surface

Run from `backend/`:

```bash
python -m app.mcp_server
```

The FastAPI demo path imports these functions directly for reliability, while
the MCP server gives sponsors a concrete protocol surface to inspect.

## CopilotKit

Status: sponsor APIs present, optional provider path added, default demo path
kept stable.

Anchor originally kept the `<CopilotKit>` provider off the default path because
the judged demo is FastAPI-first and cannot afford a GraphQL runtime crash on
stage. To make the sponsor integration explicit without destabilizing the main
demo, the repo now includes:

- Optional provider path: append `?copilot=1` to wrap the app in
  `<CopilotKit runtimeUrl="/api/copilotkit">`.
- Sponsor proof component using the exact APIs named in the guidance:
  `useCoAgent`, `useCopilotAction`, `render`, and `renderAndWait`.

Files:

- `frontend/src/main.tsx` — optional provider path behind `?copilot=1`
- `frontend/src/components/CopilotKitProtocolProof.tsx` — explicit sponsor API proof
- `backend/app/main.py` — `/api/copilotkit` runtime stub for the proof path
- `frontend/package.json` — `@copilotkit/react-core` and `@copilotkit/react-ui`

Important honesty: the primary, stable demo path is still the UIPlan + FastAPI
+ SSE path. The CopilotKit proof is included so sponsor reviewers can see that
Anchor's card catalog and human-in-loop model map cleanly to the CopilotKit APIs
called out in the hackathon guidance.

## Human-In-The-Loop

Status: implemented in the demo path and mirrored in the CopilotKit proof.

The caregiver approval moment appears as `ApprovalPrompt`. The backend endpoint
records the decision and streams it into the reasoning ribbon.

Files:

- `frontend/src/components/A2UIComponents.tsx` — `ApprovalPrompt`
- `backend/app/main.py` — `/api/approval`
- `frontend/src/components/CopilotKitProtocolProof.tsx` — `renderAndWait` proof

## What Is Mocked Intentionally

- Local support resources are realistic SF/Bay Area fixtures, not live API calls.
- Observation storage is in-memory for demo reliability.
- Deterministic parser/scorer is used by default so the demo does not wobble.
- Gemini/Pydantic AI path exists as an optional refinement layer when a key is present.

## What To Show Judges

Use the default demo route for the live pitch. It is the most stable path.

Show or mention this file if judges ask, "Where are the sponsor protocols?"

Suggested answer:

> The live demo uses Anchor's validated UIPlan stream because it is stable on
> stage. The same component catalog is also mapped to CopilotKit's sponsor APIs
> in `CopilotKitProtocolProof.tsx`, and the eight production tools are exposed
> through `backend/app/mcp_server.py`. We chose not to risk the main demo on an
> optional runtime probe, but the protocol surfaces are real and inspectable.
