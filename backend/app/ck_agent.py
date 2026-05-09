"""CopilotKit REST endpoints — AG-UI event stream for the anchor_agent.

When the user types in the CopilotPopup chat:
  1. We extract the message from the CopilotKit request body
  2. Parse it as an observation, log it, and rebuild the dashboard (same
     pipeline as /api/chat) so the SSE dashboard updates live
  3. Stream AG-UI events: STATE_SNAPSHOT → text → tool calls
     (showDriftScore / showPatternAlert / showCombinedTriage)
  4. The frontend's useCoAgent hook picks up STATE_SNAPSHOT and syncs
     the three drift scores in real time
"""
from __future__ import annotations

import json
import uuid
from typing import Any, AsyncIterator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

from app.data.demo_dataset import PEOPLE
from app.mcp_tools.observation_parser import (
    log_observation,
    parse_observation_log,
)
from app.mcp_tools.patterns import check_pattern_match
from app.mcp_tools.scoring import today_for, update_wellbeing_score

# ---------------------------------------------------------------------------
# Agent metadata
# ---------------------------------------------------------------------------

AGENT_ID = "anchor_agent"
AGENT_DESCRIPTION = (
    "Reads current wellbeing scores for the Reynolds family and renders "
    "the appropriate Anchor cards — DriftScoreCard, PatternAlertCard, "
    "CombinedTriageView — directly in the chat via Generative UI."
)

DISCLAIMER = (
    "Anchor is not a medical device. It surfaces patterns from what you tell it "
    "so you can share them with your healthcare team. Always consult a qualified "
    "clinician for medical decisions."
)

_PEOPLE_META = {
    "tom":   {"display_name": "Tom Reynolds",   "age": 68, "lens": "body",      "lens_label": "Body · Heart"},
    "helen": {"display_name": "Helen Reynolds", "age": 84, "lens": "mind",      "lens_label": "Mind · Memory"},
    "sarah": {"display_name": "Sarah Reynolds", "age": 42, "lens": "caregiver", "lens_label": "Caregiver Wellbeing"},
}

# ---------------------------------------------------------------------------
# Message extraction
# ---------------------------------------------------------------------------


def _extract_user_message(body: dict) -> str | None:
    """Pull the latest user message out of the CopilotKit request body."""
    messages = body.get("messages", [])
    for m in reversed(messages):
        if m.get("role") == "user":
            content = m.get("content", "")
            if isinstance(content, str):
                return content.strip() or None
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text = block.get("text", "").strip()
                        if text:
                            return text
    return None


# ---------------------------------------------------------------------------
# Observation processing (same pipeline as /api/chat)
# ---------------------------------------------------------------------------


def _infer_person(parsed: dict) -> str | None:
    if parsed.get("person_hint"):
        return parsed["person_hint"]
    families = {"S": "tom", "C": "helen", "Z": "sarah"}
    counts: dict[str, int] = {}
    for sig in parsed.get("signals", []):
        prefix = sig["signal"][:1]
        if prefix in families:
            counts[families[prefix]] = counts.get(families[prefix], 0) + 1
    if counts:
        return max(counts, key=counts.get)
    return None


async def _process_observation(user_message: str) -> None:
    """Log observation + rebuild plan + broadcast SSE — mirrors /api/chat."""
    # Import here to avoid circular import at module load time
    from app.agent import compose_plan
    from app.plan_builder import build_plan
    from app.shared_state import _state, broadcast, emit_steps

    parsed = parse_observation_log(user_message)
    person_id = _infer_person(parsed)
    if not person_id:
        return  # can't route — skip silently, cards will still render

    await emit_steps([
        f'CopilotKit chat: "{user_message[:60]}{"…" if len(user_message) > 60 else ""}"',
        f"parse_observation_log → {len(parsed['signals'])} signal(s) for {person_id}",
    ])

    today = today_for(person_id)
    log_observation(person_id, "sarah", user_message, today, parsed["signals"])
    await broadcast("agent_step", {"text": f"log_observation → {person_id} day {today}"})

    score = update_wellbeing_score(person_id)
    await broadcast("agent_step", {
        "text": (
            f"update_wellbeing_score({person_id}) → {score['state']} "
            f"({score['wellbeing_score']}/100)"
            f"{' · rebuild fired' if score.get('rebuild_triggered') else ''}"
        )
    })

    _state["plan_version"] += 1
    plan = await compose_plan(
        triggered_by=f"ck_chat:{person_id}",
        plan_version=_state["plan_version"],
    )
    _state["plan"] = plan
    await broadcast("plan_updated", plan)


# ---------------------------------------------------------------------------
# State + tool call builders
# ---------------------------------------------------------------------------


def _gather_state() -> tuple[dict[str, Any], dict[str, Any]]:
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
    return scores, patterns


def _build_agent_state(scores: dict) -> dict:
    """Shape the state snapshot that useCoAgent consumes on the frontend."""
    def _entry(pid: str) -> dict:
        s = scores.get(pid)
        if not s:
            return {"score": 0, "state": "green", "signals": []}
        return {
            "score": s["wellbeing_score"],
            "state": s["state"],
            "signals": [d.get("id", "") for d in (s.get("active_domains") or [])[:3]],
            "color": s["color"],
            "raw_score_label": s["raw_score_label"],
        }

    return {
        "tom":    _entry("tom"),
        "helen":  _entry("helen"),
        "sarah":  _entry("sarah"),
        "combined": all(
            scores.get(pid) and scores[pid]["state"] not in ("green",)
            for pid in ("tom", "helen", "sarah")
        ),
    }


def _build_tool_calls(scores: dict, patterns: dict) -> tuple[list[dict], bool]:
    all_not_green = all(
        scores.get(pid) and scores[pid]["state"] not in ("green",)
        for pid in ("tom", "helen", "sarah")
    )
    tool_calls: list[dict] = []

    if all_not_green:
        rows = []
        for pid in ("tom", "helen", "sarah"):
            s = scores[pid]
            m = _PEOPLE_META[pid]
            p = patterns.get(pid)
            headline = (
                p["title"] if p
                else (s.get("rebuild_reason") or f"Wellbeing score {s['wellbeing_score']}/100")
                if s else "Monitoring…"
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
        order = {"red": 0, "amber": 1, "yellow": 2, "green": 3, "gray": 4}
        rows.sort(key=lambda r: order.get(r["color"], 4))
        tool_calls.append({
            "name": "showCombinedTriage",
            "args": {
                "title": "All three family members need attention",
                "rationale": "All three wellbeing thresholds crossed simultaneously.",
                "rows": rows,
                "disclaimer": DISCLAIMER,
            },
        })
    else:
        for pid in ("tom", "helen", "sarah"):
            s = scores[pid]
            m = _PEOPLE_META[pid]
            if not s:
                continue
            tool_calls.append({
                "name": "showDriftScore",
                "args": {
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
                        d.get("id", "") for d in (s.get("active_domains") or [])[:3]
                    ],
                },
            })
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
                tool_calls.append({
                    "name": "showPatternAlert",
                    "args": {
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
                    },
                })
    return tool_calls, all_not_green


def _build_text(scores: dict, all_not_green: bool) -> str:
    who_needs_watch = [
        _PEOPLE_META[pid]["display_name"]
        for pid in ("tom", "helen", "sarah")
        if scores.get(pid) and scores[pid]["state"] not in ("green",)
    ]
    if not who_needs_watch:
        return "The Reynolds family is doing well right now — all three wellbeing scores are calm."
    if all_not_green:
        return "All three family members have signals worth raising with their care team. Here's the combined picture:"
    names = " and ".join(who_needs_watch)
    return f"Here's the current wellbeing picture. {names} {'has' if len(who_needs_watch) == 1 else 'have'} signals worth watching:"


# ---------------------------------------------------------------------------
# AG-UI SSE event stream
# ---------------------------------------------------------------------------


async def _stream_agent_run(
    run_id: str,
    thread_id: str,
    user_message: str | None,
) -> AsyncIterator[str]:
    """Yield AG-UI Server-Sent Events.

    If a user_message was extracted from the request, we first process it
    through the observation pipeline (log + score + dashboard rebuild) so
    the CopilotKit chat ALSO drives the live dashboard, not just renders cards.
    """
    def evt(event_type: str, payload: dict) -> str:
        return json.dumps({"type": event_type, **payload})

    yield evt("RUN_STARTED", {"runId": run_id, "threadId": thread_id})

    # Process the observation BEFORE gathering state so the state we read
    # reflects the new observation.
    if user_message:
        try:
            await _process_observation(user_message)
        except Exception:
            pass  # never crash the stream — dashboard update is best-effort

    # Gather current wellbeing state (fast, in-memory)
    scores, patterns = _gather_state()
    tool_calls, all_not_green = _build_tool_calls(scores, patterns)
    text = _build_text(scores, all_not_green)
    agent_state = _build_agent_state(scores)

    # --- STATE_SNAPSHOT: useCoAgent picks this up on the frontend ---
    yield evt("STATE_SNAPSHOT", {"snapshot": agent_state})

    # --- Text message ---
    msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    yield evt("TEXT_MESSAGE_START", {"messageId": msg_id, "role": "assistant"})
    yield evt("TEXT_MESSAGE_CONTENT", {"messageId": msg_id, "delta": text})
    yield evt("TEXT_MESSAGE_END", {"messageId": msg_id})

    # --- Tool calls (generative UI cards) ---
    for tc in tool_calls:
        tc_id = f"tc_{uuid.uuid4().hex[:10]}"
        yield evt("TOOL_CALL_START", {
            "toolCallId": tc_id,
            "toolCallName": tc["name"],
            "parentMessageId": msg_id,
        })
        yield evt("TOOL_CALL_ARGS", {
            "toolCallId": tc_id,
            "delta": json.dumps(tc["args"]),
        })
        yield evt("TOOL_CALL_END", {"toolCallId": tc_id})

    yield evt("RUN_FINISHED", {"runId": run_id, "threadId": thread_id})


# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------


def mount_copilotkit(fastapi_app: FastAPI, prefix: str = "/api/copilotkit") -> None:
    _INFO_RESPONSE = {
        "version": "1.57.1",
        "agents": {
            "default": {"description": AGENT_DESCRIPTION, "capabilities": []},
            AGENT_ID:  {"description": AGENT_DESCRIPTION, "capabilities": []},
        },
    }

    @fastapi_app.get(f"{prefix}/info", include_in_schema=False)
    async def copilotkit_info():
        return JSONResponse(_INFO_RESPONSE)

    async def _run_stream(request: Request) -> StreamingResponse:
        body = {}
        try:
            body = await request.json()
        except Exception:
            pass
        run_id = body.get("runId") or f"run_{uuid.uuid4().hex[:12]}"
        thread_id = body.get("threadId") or f"thread_{uuid.uuid4().hex[:12]}"
        user_message = _extract_user_message(body)

        async def event_gen():
            async for json_str in _stream_agent_run(run_id, thread_id, user_message):
                yield f"data: {json_str}\n\n"

        return StreamingResponse(
            event_gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-store",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )

    @fastapi_app.post(f"{prefix}", include_in_schema=False)
    async def copilotkit_root_run(request: Request):
        body = {}
        try:
            body = await request.json()
        except Exception:
            pass
        if body.get("method") == "info":
            return JSONResponse(_INFO_RESPONSE)
        run_id = body.get("runId") or f"run_{uuid.uuid4().hex[:12]}"
        thread_id = body.get("threadId") or f"thread_{uuid.uuid4().hex[:12]}"
        user_message = _extract_user_message(body)

        async def event_gen():
            async for json_str in _stream_agent_run(run_id, thread_id, user_message):
                yield f"data: {json_str}\n\n"

        return StreamingResponse(
            event_gen(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
        )

    @fastapi_app.post(f"{prefix}/agent/{{agent_id}}/run", include_in_schema=False)
    async def copilotkit_agent_run(agent_id: str, request: Request):
        return await _run_stream(request)

    @fastapi_app.post(f"{prefix}/agent/{{agent_id}}/state", include_in_schema=False)
    async def copilotkit_agent_state(agent_id: str):
        return JSONResponse({"state": {}})

    @fastapi_app.options(f"{prefix}", include_in_schema=False)
    @fastapi_app.options(f"{prefix}/agent/{{agent_id}}/run", include_in_schema=False)
    @fastapi_app.options(f"{prefix}/agent/{{agent_id}}/state", include_in_schema=False)
    @fastapi_app.options(f"{prefix}/info", include_in_schema=False)
    async def copilotkit_preflight():
        return JSONResponse({}, status_code=200)
