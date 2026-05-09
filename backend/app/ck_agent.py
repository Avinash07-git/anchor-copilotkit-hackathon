"""CopilotKit / LangGraph agent — Anchor's Generative UI backend layer.

anchor_agent is a LangGraphAGUIAgent that:
  1. Reads current wellbeing scores from the in-memory PEOPLE store
  2. Emits AIMessage tool calls matching the frontend useComponent registrations:
       - showDriftScore    → renders DriftScoreCard in the CopilotPopup chat
       - showPatternAlert  → renders PatternAlertCard with peer-reviewed citation
       - showCombinedTriage → renders CombinedTriageView when all three lenses fire
       - confirmFamilyMessage → useHumanInTheLoop approval gate
  3. Served via real CopilotKit FastAPI endpoint at /api/copilotkit

The backend is rule-based (no LLM needed) so it NEVER fails during the demo.
Gemini can be layered in later via the system prompt, but the tool-call path
is deterministic and always correct.
"""
from __future__ import annotations

import uuid
from typing import Annotated, Any

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from copilotkit import CopilotKitRemoteEndpoint, LangGraphAGUIAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit.langgraph import CopilotKitState, copilotkit_emit_state

# --- Monkey-patch: LangGraphAGUIAgent.dict_repr() calls super().dict_repr()
# but LangGraphAgent (its parent) inherits from object, not Agent, so the
# method doesn't exist. Patch it to return the correct shape directly.
def _fixed_agui_dict_repr(self):
    return {
        "name": self.name,
        "description": self.description or "",
        "type": "langgraph_agui",
    }
LangGraphAGUIAgent.dict_repr = _fixed_agui_dict_repr


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class AnchorState(CopilotKitState):
    """LangGraph state.

    CopilotKitState is a dict subclass that adds the `copilotkit` metadata key.
    We add `messages` (the AG-UI conversation thread) here.
    """
    messages: Annotated[list, add_messages]


# ---------------------------------------------------------------------------
# People metadata (static, matches the demo dataset)
# ---------------------------------------------------------------------------

_PEOPLE_META = {
    "tom":   {"display_name": "Tom Reynolds",   "age": 68, "lens": "body",      "lens_label": "Body · Heart"},
    "helen": {"display_name": "Helen Reynolds", "age": 84, "lens": "mind",      "lens_label": "Mind · Memory"},
    "sarah": {"display_name": "Sarah Reynolds", "age": 42, "lens": "caregiver", "lens_label": "Caregiver Wellbeing"},
}

DISCLAIMER = "Anchor is not a medical device. It surfaces patterns from what you tell it so you can share them with your healthcare team. Always consult a qualified clinician for medical decisions."


def _tc(name: str, args: dict) -> dict:
    """Build a LangChain-compatible tool_call dict."""
    return {
        "name": name,
        "args": args,
        "id": f"tc_{uuid.uuid4().hex[:10]}",
        "type": "tool_call",
    }


# ---------------------------------------------------------------------------
# Graph node — read state, build tool calls, return AI message
# ---------------------------------------------------------------------------

async def anchor_router(state: AnchorState, config: RunnableConfig) -> dict:
    """Core node: read wellbeing state → emit the right card tool calls.

    This node is invoked every time the user sends a message. It:
    1. Refreshes wellbeing scores from the in-memory store
    2. Checks whether any pattern alert was triggered
    3. Emits showDriftScore / showPatternAlert / showCombinedTriage tool calls
       so the frontend useComponent hooks render the cards in the CopilotPopup

    No LLM required — rule-based, always reliable for the demo.
    """
    from app.data.demo_dataset import PEOPLE
    from app.mcp_tools.scoring import update_wellbeing_score
    from app.mcp_tools.patterns import check_pattern_match

    # Refresh all scores
    scores: dict[str, Any] = {}
    patterns: dict[str, Any] = {}
    for pid in ("tom", "helen", "sarah"):
        try:
            scores[pid] = update_wellbeing_score(pid)
        except Exception:
            scores[pid] = None
        try:
            patterns[pid] = check_pattern_match(pid)
        except Exception:
            patterns[pid] = None

    # Emit shared state to useAgent / useCoAgent on the frontend
    agent_state = {
        pid: {
            "score": scores[pid]["wellbeing_score"] if scores[pid] else 75,
            "state": scores[pid]["state"] if scores[pid] else "green",
            "signals": [
                d.get("id", "")
                for d in (scores[pid].get("active_domains") or [] if scores[pid] else [])
                if d.get("severity", 0) >= 2
            ][:5],
        }
        for pid in ("tom", "helen", "sarah")
    }
    agent_state["combined"] = all(
        agent_state[p]["state"] != "green" for p in ("tom", "helen", "sarah")
    )
    await copilotkit_emit_state(config, {**state, **agent_state})

    # --- Decide which cards to show ---

    all_not_green = agent_state["combined"]
    tool_calls: list[dict] = []

    if all_not_green:
        # Combined triage view
        rows = []
        for pid in ("tom", "helen", "sarah"):
            s = scores[pid]
            m = _PEOPLE_META[pid]
            p = patterns.get(pid)
            headline = (
                p["title"]
                if p
                else (s.get("rebuild_reason") or f"Wellbeing score {s['wellbeing_score']}/100")
                if s
                else "Monitoring…"
            )
            rows.append({
                "person_id": pid,
                "display_name": m["display_name"],
                "lens_label": m["lens_label"],
                "color": s["color"] if s else "gray",
                "headline": headline,
                "recommended_first_action": (
                    p["suggested_actions"][0]
                    if p and p.get("suggested_actions")
                    else "Review with healthcare team"
                ),
            })
        # Sort: RED first, then by urgency
        order = {"red": 0, "amber": 1, "yellow": 2, "green": 3, "gray": 4}
        rows.sort(key=lambda r: order.get(r["color"], 4))

        tool_calls.append(_tc("showCombinedTriage", {
            "title": "All three family members need attention",
            "rationale": "All three wellbeing thresholds crossed simultaneously — showing combined view.",
            "rows": rows,
            "disclaimer": DISCLAIMER,
        }))

    else:
        # Individual score cards (+ pattern alerts where triggered)
        for pid in ("tom", "helen", "sarah"):
            s = scores[pid]
            m = _PEOPLE_META[pid]
            if not s:
                continue

            tool_calls.append(_tc("showDriftScore", {
                "person_id": pid,
                "display_name": m["display_name"],
                "age": m["age"],
                "lens": m["lens"],
                "lens_label": m["lens_label"],
                "score": s["wellbeing_score"],
                "color": s["color"],
                "state": s["state"],
                "trend": "down" if s["state"] not in ("green",) else "flat",
                "one_liner": s.get("rebuild_reason") or f"Wellbeing score {s['wellbeing_score']}/100",
                "last_updated": "today",
                "raw_score_label": s["raw_score_label"],
                "instrument": s.get("instrument", ""),
                "active_signals": [
                    d.get("id", "")
                    for d in (s.get("active_domains") or [])[:3]
                ],
            }))

            p = patterns.get(pid)
            if p:
                signals = [
                    {
                        "day_label": d.get("id", ""),
                        "text": d.get("evidence", "Logged observation"),
                        "extracted_signal": d.get("id", ""),
                    }
                    for d in (s.get("active_domains") or [])[:3]
                ]
                tool_calls.append(_tc("showPatternAlert", {
                    "person_id": pid,
                    "pattern_id": p.get("pattern_id", ""),
                    "severity_color": s["color"],
                    "title": p.get("title", "Pattern detected"),
                    "why_it_matters": p.get("why_it_matters", ""),
                    "signals": signals,
                    "suggested_actions": (p.get("suggested_actions") or [])[:3],
                    "disclaimer": DISCLAIMER,
                    "citation": p.get("citation", ""),
                    "raw_score_label": s["raw_score_label"],
                    "rebuild_reason": s.get("rebuild_reason") or "",
                    "instrument": s.get("instrument", ""),
                }))

    # Compose a calm text intro + the tool calls in one AI message
    who_needs_watch = [
        _PEOPLE_META[pid]["display_name"]
        for pid in ("tom", "helen", "sarah")
        if scores.get(pid) and scores[pid]["state"] not in ("green",)
    ]
    if not who_needs_watch:
        text = "The Reynolds family is doing well right now — all three wellbeing scores are calm."
    elif all_not_green:
        text = "All three family members have signals worth raising with their care team. Here's the combined picture:"
    else:
        names = " and ".join(who_needs_watch)
        text = f"Here's the current wellbeing picture. {names} {'has' if len(who_needs_watch) == 1 else 'have'} signals worth watching:"

    return {"messages": [AIMessage(content=text, tool_calls=tool_calls)]}


# ---------------------------------------------------------------------------
# Build the compiled graph
# ---------------------------------------------------------------------------

def _build_graph() -> Any:
    builder: StateGraph = StateGraph(AnchorState)
    builder.add_node("anchor_router", anchor_router)
    builder.set_entry_point("anchor_router")
    builder.add_edge("anchor_router", END)
    return builder.compile()


_graph = _build_graph()

# ---------------------------------------------------------------------------
# SDK + agent registration
# ---------------------------------------------------------------------------

anchor_agent = LangGraphAGUIAgent(
    name="anchor_agent",
    description=(
        "Reads current wellbeing scores for the Reynolds family and renders "
        "the appropriate Anchor cards — DriftScoreCard, PatternAlertCard, "
        "CombinedTriageView — directly in the chat via Generative UI."
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
    Adds real CopilotKit route handlers at the given prefix.
    """
    add_fastapi_endpoint(fastapi_app, ck_sdk, prefix)
