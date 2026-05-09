"""Bedside FastAPI app — entry point.

Run locally:
    uv run uvicorn app.main:app --reload --port 8000

Endpoints:
    GET  /health                       liveness
    GET  /family                       static family meta
    GET  /api/plan                     current UIPlan
    POST /demo/reset                   wipe + re-seed, return calm plan
    POST /demo/{trigger_id}            run UC1/UC2/UC3 + return new plan
    GET  /agui/stream                  SSE stream of plan + agent-step events
"""
from __future__ import annotations

import asyncio
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from app.agent import compose_plan
from app.data.demo_dataset import (
    HELEN_LOGS,
    PEOPLE,
    SARAH_LOGS,
    TOM_LOGS,
    TRIGGER_SEQUENCE,
)
from app.mcp_tools.observation_parser import log_observation, reset_store
from app.mcp_tools.scoring import update_wellbeing_score
from app.plan_builder import build_plan

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


# --- In-memory plan + event bus --------------------------------------------
# A tiny pub/sub for SSE clients. Each connected client gets its own queue.

_subscribers: list[asyncio.Queue[dict]] = []
_state: dict[str, Any] = {"plan": None, "plan_version": 0}


async def _broadcast(event_type: str, payload: dict) -> None:
    """Push an event to every connected SSE client."""
    msg = {"type": event_type, "ts": datetime.utcnow().isoformat(), "payload": payload}
    dead: list[asyncio.Queue[dict]] = []
    for q in _subscribers:
        try:
            q.put_nowait(msg)
        except asyncio.QueueFull:  # pragma: no cover — defensive
            dead.append(q)
    for q in dead:
        _subscribers.remove(q)


async def _emit_steps(steps: list[str]) -> None:
    """Stream a sequence of agent reasoning steps with small pauses.

    This is the AG-UI moment — the user sees the agent thinking out loud.
    We pace it (300ms/step) so the streaming feels alive on stage.
    """
    for s in steps:
        await _broadcast("agent_step", {"text": s})
        await asyncio.sleep(0.3)


# --- Demo seeding ----------------------------------------------------------


def _seed_demo_logs() -> None:
    reset_store()
    for day, observer, text in TOM_LOGS:
        log_observation("tom", observer, text, day)
    for day, observer, text in HELEN_LOGS:
        log_observation("helen", observer, text, day)
    for day, observer, text in SARAH_LOGS:
        log_observation("sarah", observer, text, day)
    for person_id in PEOPLE:
        update_wellbeing_score(person_id)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _seed_demo_logs()
    _state["plan"] = build_plan(triggered_by="boot", plan_version=1)
    _state["plan_version"] = 1
    yield


app = FastAPI(
    title="Bedside",
    description=(
        "The intelligent layer that was always missing. Three lenses, one "
        "app — the patient's body, the patient's mind, and the caregiver's "
        "breaking point."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Static / read-only routes ---------------------------------------------


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "bedside", "version": "0.1.0"}


@app.get("/")
async def root() -> dict:
    return {
        "message": "Bedside backend is alive. See /docs for the API.",
        "family": "Reynolds (Tom 68, Helen 84, Sarah 42)",
        "triggers": [t["id"] for t in TRIGGER_SEQUENCE],
        "current_plan_layout": (_state["plan"] or {}).get("layout"),
    }


@app.get("/family")
async def family() -> dict:
    return {pid: {**meta} for pid, meta in PEOPLE.items()}


@app.get("/api/plan")
async def get_current_plan() -> dict:
    if _state["plan"] is None:
        _state["plan"] = build_plan(triggered_by="boot", plan_version=1)
    return _state["plan"]


# --- Demo trigger routes ---------------------------------------------------


_TRIGGER_NARRATIONS: dict[str, list[str]] = {
    "uc1": [
        "Reading Sarah's note about Tom's ankles and dinner...",
        "parse_observation_log → S3 edema (severe), S4 appetite loss, S2 fatigue",
        "log_observation → Tom day 11, observer=sarah",
        "update_wellbeing_score(tom) → running HF Symptom Monitoring Framework",
        "4 symptom domains active at ≥ moderate severity over 7-day window",
        "High-risk combo detected: edema + missed medication, both ≥ moderate",
        "State: GREEN → AMBER (raw 11/24)",
        "check_pattern_match(tom) → post_discharge_decline",
        "Composing single_alert layout with PatternAlertCard + TalkingPointsCard...",
    ],
    "uc2": [
        "Four observers logged Helen this week — running multi-observer aggregation...",
        "Tom (Sun): C1 memory_repetition severe",
        "Sarah (Wed): C8 language_difficulty moderate",
        "Emma (Fri): C2 disorientation severe",
        "Mrs. Chen (Sat): C3 safety_failure severe (stove)",
        "update_wellbeing_score(helen) → running NPI subset, 8 cognitive domains",
        "Weekly score 10/96, 4-week baseline 1/96 → drift ~900%",
        "State: GREEN → RED (rapid acceleration tier, > 50%)",
        "check_pattern_match(helen) → cognitive_acceleration",
        "calculate_observation_rate(helen) → 9× baseline weekly observation rate",
        "Composing layout with ContributorMap (UC2 multi-observer beat)...",
    ],
    "uc3": [
        "Reading Sarah's note: \"I really don't know how much longer I can do this.\"",
        "parse_observation_log → Z10 hopelessness severity 3",
        "Validated single-signal safety override (ZBI Z10, Hébert et al. 2000)",
        "update_wellbeing_score(sarah) → ZBI-12, raw 3/100",
        "Override: AMBER minimum regardless of overall score",
        "check_pattern_match(sarah) → caregiver_burnout",
        "All three lenses now active — composing combined_triage layout...",
        "Ordering rows: RED first (Helen), then AMBER (Tom, Sarah)...",
    ],
    "combined": [
        "Replaying UC1 → UC2 → UC3 in sequence...",
        "Tom AMBER (HF Framework) · Helen RED (NPI drift) · Sarah AMBER (ZBI override)",
        "Composing combined_triage layout...",
    ],
}


def _trigger_by_id(trigger_id: str) -> dict:
    for t in TRIGGER_SEQUENCE:
        if t["id"] == trigger_id:
            return t
    raise HTTPException(status_code=404, detail=f"Unknown trigger: {trigger_id}")


def _apply_trigger(trigger: dict) -> None:
    """Run one trigger — append the relevant observation(s) to the store."""
    if trigger["id"] == "uc2" and "observations" in trigger:
        for obs in trigger["observations"]:
            log_observation(trigger["person"], obs["observer"], obs["raw_text"], obs["day"])
    else:
        log_observation(
            trigger["person"],
            trigger.get("observer", trigger["person"]),
            trigger["raw_text"],
            trigger["day"],
        )


async def _run_trigger(trigger_id: str) -> dict:
    """Apply trigger, narrate steps, compose plan, broadcast — return new plan."""
    if trigger_id == "combined":
        # Replay every individual UC in sequence; useful as a one-shot demo.
        # Skip the "combined" meta-entry itself (no raw_text) and any future
        # placeholders by requiring a person + (raw_text or observations).
        for t in TRIGGER_SEQUENCE:
            if t.get("id") == "combined" or t.get("person") is None:
                continue
            _apply_trigger(t)
        narration = _TRIGGER_NARRATIONS["combined"]
    else:
        trigger = _trigger_by_id(trigger_id)
        _apply_trigger(trigger)
        narration = _TRIGGER_NARRATIONS.get(trigger_id, [f"Running trigger {trigger_id}..."])

    await _emit_steps(narration)

    _state["plan_version"] += 1
    plan = await compose_plan(triggered_by=trigger_id, plan_version=_state["plan_version"])
    _state["plan"] = plan
    await _broadcast("plan_updated", plan)
    return plan


@app.post("/demo/reset")
async def demo_reset() -> dict:
    _seed_demo_logs()
    _state["plan_version"] += 1
    plan = build_plan(triggered_by="reset", plan_version=_state["plan_version"])
    _state["plan"] = plan
    await _broadcast("agent_step", {"text": "Resetting to clean baseline — all three GREEN."})
    await _broadcast("plan_updated", plan)
    return plan


@app.post("/demo/{trigger_id}")
async def demo_trigger(trigger_id: str) -> dict:
    return await _run_trigger(trigger_id)


# --- AG-UI style SSE stream ------------------------------------------------


@app.get("/agui/stream")
async def agui_stream(request: Request):
    """Server-Sent Events stream of agent_step + plan_updated events.

    The frontend subscribes once on load and re-renders on every
    `plan_updated` event. `agent_step` events power the live narration
    panel ("Reading Sarah's note... parsing... composing...").
    """
    queue: asyncio.Queue[dict] = asyncio.Queue(maxsize=256)
    _subscribers.append(queue)

    async def event_gen() -> AsyncIterator[dict]:
        # Send the current plan as the first event so a reconnecting client
        # is immediately in sync.
        if _state["plan"] is not None:
            yield {
                "event": "plan_updated",
                "data": json.dumps(_state["plan"], default=str),
            }
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                except asyncio.TimeoutError:
                    # Heartbeat keeps proxies from killing the connection.
                    yield {"event": "ping", "data": "{}"}
                    continue
                yield {
                    "event": msg["type"],
                    "data": json.dumps(msg["payload"], default=str),
                }
        finally:
            if queue in _subscribers:
                _subscribers.remove(queue)

    return EventSourceResponse(event_gen())
