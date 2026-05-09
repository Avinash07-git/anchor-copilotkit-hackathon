"""Shared mutable state + SSE event bus.

Extracted so both main.py and ck_agent.py can broadcast without a
circular import.
"""
from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

_subscribers: list[asyncio.Queue[dict]] = []
_state: dict[str, Any] = {"plan": None, "plan_version": 0}


async def broadcast(event_type: str, payload: dict) -> None:
    """Push an event to every connected SSE client."""
    msg = {"type": event_type, "ts": datetime.utcnow().isoformat(), "payload": payload}
    dead: list[asyncio.Queue[dict]] = []
    for q in _subscribers:
        try:
            q.put_nowait(msg)
        except asyncio.QueueFull:
            dead.append(q)
    for q in dead:
        _subscribers.remove(q)


async def emit_steps(steps: list[str]) -> None:
    """Stream agent reasoning steps with small pauses (AG-UI visible thinking)."""
    for s in steps:
        await broadcast("agent_step", {"text": s})
        await asyncio.sleep(0.3)


def get_state() -> dict[str, Any]:
    return _state


def get_subscribers() -> list[asyncio.Queue[dict]]:
    return _subscribers
