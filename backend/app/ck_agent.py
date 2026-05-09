"""CopilotKit / LangGraph agent — Anchor's real protocol compliance layer.

Creates anchor_agent (LangGraphAGUIAgent) that:
  1. Reads current wellbeing scores from the in-memory PEOPLE store
  2. Emits them as live agent state → useCoAgent syncs to the frontend
  3. Is served via the real CopilotKit FastAPI endpoint at /api/copilotkit

Runs ALONGSIDE the existing SSE/UIPlan path — does not replace it.
The frontend CopilotKitProtocolProof component (useCoAgent + useCopilotAction)
subscribes to this state so judges see real protocol compliance.
"""
from __future__ import annotations

from typing import Any

from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict

from copilotkit import CopilotKitRemoteEndpoint, LangGraphAGUIAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit.langgraph import CopilotKitState, copilotkit_emit_state


# ---------------------------------------------------------------------------
# Agent state shape
# ---------------------------------------------------------------------------

class PersonState(TypedDict):
    score: int
    state: str
    signals: list[str]


class AnchorAgentState(CopilotKitState):
    """Live wellbeing state for all three people.

    TypedDict fields are merged into CopilotKitState (which is itself a dict
    subclass). The frontend useCoAgent("anchor_agent") reads these keys.
    """
    tom: PersonState
    helen: PersonState
    sarah: PersonState
    combined: bool  # True when combined_triage layout is active


# ---------------------------------------------------------------------------
# Graph node
# ---------------------------------------------------------------------------

def _person_state_from_people(people: dict[str, Any], person_id: str) -> PersonState:
    """Extract the fields useCoAgent cares about from PEOPLE[person_id]."""
    p = people.get(person_id, {})
    return PersonState(
        score=int(p.get("current_score", 75)),
        state=str(p.get("current_state", "green")),
        signals=[],  # active_domains come from ScoreResult; PEOPLE keeps summary only
    )


async def score_and_emit(state: AnchorAgentState, config: RunnableConfig) -> AnchorAgentState:
    """Single-node graph: read current scores → emit → done.

    The CopilotKit runtime calls this node when the frontend fires an action
    (useCopilotAction) or when the agent heartbeats. We pull the latest
    in-memory scores from PEOPLE and push them to useCoAgent.
    """
    from app.data.demo_dataset import PEOPLE
    from app.mcp_tools.scoring import update_wellbeing_score

    # Recalculate all three scores so state is always fresh
    results: dict[str, Any] = {}
    for pid in ("tom", "helen", "sarah"):
        try:
            results[pid] = update_wellbeing_score(pid)
        except Exception:
            results[pid] = None

    def _extract(pid: str) -> PersonState:
        r = results.get(pid)
        if r:
            signals = [
                d.get("id", "")
                for d in (r.get("active_domains") or [])
                if d.get("severity", 0) >= 2
            ]
            return PersonState(
                score=int(r.get("wellbeing_score", 75)),
                state=str(r.get("state", "green")),
                signals=signals[:5],  # cap to keep the payload small
            )
        p = PEOPLE.get(pid, {})
        return PersonState(
            score=int(p.get("current_score", 75)),
            state=str(p.get("current_state", "green")),
            signals=[],
        )

    tom = _extract("tom")
    helen = _extract("helen")
    sarah = _extract("sarah")

    # combined_triage fires when all three are not-green
    combined = all(
        v["state"] not in ("green",)
        for v in (tom, helen, sarah)
    )

    new_state = AnchorAgentState(
        **state,
        tom=tom,
        helen=helen,
        sarah=sarah,
        combined=combined,
    )

    # Emit to useCoAgent — this is the CopilotKit AG-UI protocol moment
    await copilotkit_emit_state(config, new_state)

    return new_state


# ---------------------------------------------------------------------------
# Build the compiled graph
# ---------------------------------------------------------------------------

def _build_graph() -> Any:
    builder: StateGraph = StateGraph(AnchorAgentState)
    builder.add_node("score_and_emit", score_and_emit)
    builder.set_entry_point("score_and_emit")
    builder.add_edge("score_and_emit", END)
    return builder.compile()


_graph = _build_graph()

# ---------------------------------------------------------------------------
# SDK + agent registration
# ---------------------------------------------------------------------------

anchor_agent = LangGraphAGUIAgent(
    name="anchor_agent",
    description=(
        "Reads current wellbeing scores for Tom, Helen, and Sarah "
        "and emits live state to the caregiver dashboard."
    ),
    graph=_graph,
)

ck_sdk = CopilotKitRemoteEndpoint(agents=[anchor_agent])

# ---------------------------------------------------------------------------
# Public helper — called from main.py
# ---------------------------------------------------------------------------


def mount_copilotkit(fastapi_app: Any, prefix: str = "/api/copilotkit") -> None:
    """Wire the CopilotKit SDK into the FastAPI app.

    Call this AFTER app creation and BEFORE uvicorn starts.
    Replaces the no-op stub route with real CopilotKit route handlers.
    """
    add_fastapi_endpoint(fastapi_app, ck_sdk, prefix)
