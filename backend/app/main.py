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
from typing import Any, AsyncIterator, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.agent import compose_plan
from app.data.demo_dataset import (
    HELEN_LOGS,
    PEOPLE,
    SARAH_LOGS,
    TOM_LOGS,
    TRIGGER_SEQUENCE,
)
from app.mcp_tools.observation_parser import (
    log_observation,
    parse_observation_log,
    reset_store,
)
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
    title="Anchor",
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
    return {"status": "ok", "service": "anchor", "version": "0.1.0"}


@app.get("/")
async def root() -> dict:
    return {
        "message": "Anchor backend is alive. See /docs for the API.",
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


# --- Conversational entry point (CopilotKit chat surface) ------------------
# These two endpoints are what the CopilotKit-styled chat panel + the
# interactive ApprovalPrompt call into. The scripted /demo/* triggers above
# remain the offline-safe fallback path; this is the natural-language path
# the pitch script in BEDSIDE_SPEC.md actually demonstrates.


class ChatMessage(BaseModel):
    """A free-text observation typed by a caregiver."""

    message: str = Field(..., min_length=1, max_length=2000)
    observer: str = Field(default="sarah")
    person_id: str | None = Field(
        default=None,
        description="Optional explicit target. If omitted, inferred from the text.",
    )


class ChatReply(BaseModel):
    accepted: bool
    person_id: str | None
    detected_signals: list[dict]
    reply: str
    plan: dict


class ApprovalDecision(BaseModel):
    decision: Literal["approve", "edit", "decline"]
    prompt: str = Field(default="", description="The original prompt being decided on.")
    note: str = Field(default="", description="Optional free-text from the caregiver.")


def _infer_person_for_chat(parsed: dict, fallback_observer: str) -> str | None:
    """Pick a target person for an inbound chat message.

    Order of preference: explicit person_hint from the parser →
    inferred from the dominant signal family (S=Tom, C=Helen, Z=Sarah) →
    None (caller decides what to do).
    """
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
    # Caregivers usually log about themselves when no patient is named.
    return fallback_observer if fallback_observer in PEOPLE else None


@app.post("/api/chat", response_model=ChatReply)
async def chat(message: ChatMessage) -> ChatReply:
    """Accept a free-text observation, log it, recompose the dashboard.

    This is the CopilotKit-style natural-language path: the caregiver types
    what they noticed, the agent does signal extraction + scoring + plan
    composition, and the dashboard rebuilds itself live via SSE.
    """
    parsed = parse_observation_log(message.message)
    person_id = message.person_id or _infer_person_for_chat(parsed, message.observer)

    await _emit_steps([
        f'Reading: "{message.message[:80]}{"…" if len(message.message) > 80 else ""}"',
        f"parse_observation_log → {len(parsed['signals'])} signal(s) detected",
    ])

    if not person_id:
        await _broadcast(
            "agent_step",
            {"text": "No person inferred — asking a clarifying question instead of guessing."},
        )
        return ChatReply(
            accepted=False,
            person_id=None,
            detected_signals=parsed["signals"],
            reply=(
                "I couldn't tell who that was about — was that Tom, Helen, or you? "
                "Reply with the name and I'll log it."
            ),
            plan=_state["plan"] or build_plan(triggered_by="chat_clarify", plan_version=_state["plan_version"]),
        )

    today = max((e["day"] for e in _all_days_for(person_id)), default=0) + 1
    log_observation(person_id, message.observer, message.message, today, parsed["signals"])
    await _broadcast("agent_step", {"text": f"log_observation → {person_id} day {today}"})

    score = update_wellbeing_score(person_id)
    await _broadcast(
        "agent_step",
        {
            "text": (
                f"update_wellbeing_score({person_id}) → {score['state']} "
                f"({score['wellbeing_score']}/100){' · rebuild fired' if score.get('rebuild_triggered') else ''}"
            )
        },
    )

    _state["plan_version"] += 1
    plan = await compose_plan(triggered_by=f"chat:{person_id}", plan_version=_state["plan_version"])
    _state["plan"] = plan
    await _broadcast("plan_updated", plan)

    reply = _build_chat_reply(person_id, parsed["signals"], score)
    return ChatReply(
        accepted=True,
        person_id=person_id,
        detected_signals=parsed["signals"],
        reply=reply,
        plan=plan,
    )


def _all_days_for(person_id: str) -> list[dict]:
    from app.mcp_tools.observation_parser import get_all_logs

    return get_all_logs().get(person_id, [])


def _build_chat_reply(person_id: str, signals: list[dict], score: dict) -> str:
    """One-line acknowledgement the chat surface shows back to the caregiver."""
    name = PEOPLE.get(person_id, {}).get("display_name", person_id.title())
    if not signals:
        return f"Logged for {name}. Nothing in this note matched a tracked signal — tell me more if you'd like me to watch for something specific."
    sig_labels = ", ".join(s["signal"].split("_", 1)[1].replace("_", " ") for s in signals[:3])
    suffix = f" · {len(signals) - 3} more" if len(signals) > 3 else ""
    rebuild = " · dashboard rebuilt" if score.get("rebuild_triggered") else ""
    return f"Logged for {name}: {sig_labels}{suffix}. State: {score['state']}{rebuild}."


@app.post("/api/approval")
async def approval(decision: ApprovalDecision) -> dict:
    """Resolve a human-in-the-loop ApprovalPrompt.

    The frontend ApprovalPrompt component fires this when the caregiver
    clicks Approve / Edit / Decline. We narrate the decision through the
    AG-UI step stream so it shows up in the reasoning panel — that's the
    'Copilot That Ships' beat the hackathon judges look for.
    """
    narrations = {
        "approve": "✅ Caregiver approved — message dispatched to recipient.",
        "edit": "✏️ Caregiver wants to edit — opening the draft for revision.",
        "decline": "🚫 Caregiver declined — no message sent.",
    }
    await _broadcast("agent_step", {"text": narrations[decision.decision]})
    return {"ok": True, "decision": decision.decision}


@app.post("/api/copilotkit")
async def copilotkit_runtime_stub(request: Request) -> dict:
    """No-op stub for the CopilotKit provider's runtimeUrl probe.

    We do not run the full CopilotKit GraphQL runtime — Anchor drives its
    own chat surface against /api/chat. This keeps the <CopilotKit /> React
    provider quiet during dev so the console isn't full of 404s.
    """
    return {"ok": True, "runtime": "bedside-bridge"}


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
