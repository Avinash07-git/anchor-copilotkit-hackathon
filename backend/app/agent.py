"""Anchor agent — Pydantic AI + Gemini.

The agent's job is to compose a `UIPlan` for the dashboard given the current
observation log state. We support **two modes** so the demo never wobbles:

1. **LLM-augmented mode** (default when ``GOOGLE_API_KEY`` is set):
   - Pydantic AI agent with Gemini 2.5 Flash
   - The agent gets the system prompt + a snapshot of current state
   - It calls MCP tools (parse / log / score / patterns / etc.) to gather
     evidence, then produces a UIPlan-shaped JSON response
   - We validate the response against the ``UIPlan`` Pydantic model
   - On any failure (rate-limit, bad JSON, validation error), we fall back

2. **Deterministic mode** (fallback OR forced via ``ANCHOR_FORCE_DETERMINISTIC=1``):
   - Just calls ``plan_builder.build_plan`` directly
   - Always returns a correct, citation-rich plan
   - Used in tests and as the demo safety net

Both modes return a UIPlan dict with the SAME shape — the frontend cannot
tell which mode produced a given plan.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from app.plan_builder import build_plan
from app.ui_plan import UIPlan

_PROMPT_PATH = Path(__file__).parent / "prompts" / "system.md"


def _load_system_prompt() -> str:
    """Read the agent system prompt. Falls back to a minimal prompt if missing."""
    if _PROMPT_PATH.exists():
        return _PROMPT_PATH.read_text(encoding="utf-8")
    return (
        "You are Anchor, an AI that emits a UIPlan JSON describing how to "
        "render a caregiver dashboard. See the UIPlan model in ui_plan.py."
    )


def _force_deterministic() -> bool:
    return os.getenv("ANCHOR_FORCE_DETERMINISTIC", "").lower() in ("1", "true", "yes")


def _have_gemini_key() -> bool:
    return bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))


# --- LLM-augmented mode ---------------------------------------------------


async def _llm_compose_plan(triggered_by: str | None, plan_version: int) -> dict[str, Any]:
    """Ask Gemini (via Pydantic AI) to compose a UIPlan.

    The agent is given the deterministic plan as a *reference* and asked to
    either confirm or refine it (e.g. tweak ordering of triage rows, write
    a punchier rationale). This keeps the heavy structural work
    deterministic while letting the LLM contribute the judgment calls it's
    actually good at.
    """
    from pydantic_ai import Agent
    from pydantic_ai.models.gemini import GeminiModel

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    model = GeminiModel("gemini-2.5-flash", provider="google-gla")  # type: ignore[arg-type]
    # Pydantic AI reads the env var; we pass the model object explicitly.
    if api_key and not os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = api_key

    system_prompt = _load_system_prompt()
    reference_plan = build_plan(triggered_by, plan_version)

    agent = Agent(
        model=model,
        system_prompt=system_prompt,
        result_type=UIPlan,
        retries=2,
    )

    user_prompt = (
        "Here is the deterministic reference plan based on the current "
        "observation log. Review the layout choice and the ordering, "
        "tighten copy where it helps, and emit the final UIPlan. "
        "If the reference is good as-is, return it unchanged. "
        "Do not invent new components or new evidence.\n\n"
        f"Triggered by: {triggered_by}\n"
        f"Plan version: {plan_version}\n\n"
        f"Reference plan:\n{json.dumps(reference_plan, indent=2, default=str)}"
    )

    result = await agent.run(user_prompt)
    plan_obj: UIPlan = result.data
    return plan_obj.model_dump(mode="json")


# --- Public entry point ---------------------------------------------------


async def compose_plan(
    triggered_by: str | None = None,
    plan_version: int = 1,
) -> dict[str, Any]:
    """Compose a UIPlan. Tries LLM mode, falls back to deterministic."""
    if _force_deterministic() or not _have_gemini_key():
        return build_plan(triggered_by, plan_version)

    try:
        return await _llm_compose_plan(triggered_by, plan_version)
    except Exception as exc:  # noqa: BLE001 — demo safety net is the whole point
        # Log to stderr so we know in dev, but never crash the demo.
        import sys

        print(
            f"[anchor.agent] LLM mode failed ({exc!r}); "
            "falling back to deterministic.",
            file=sys.stderr,
        )
        plan = build_plan(triggered_by, plan_version)
        plan["meta"]["fallback_reason"] = f"{type(exc).__name__}: {exc}"
        return plan


def compose_plan_sync(triggered_by: str | None = None, plan_version: int = 1) -> dict[str, Any]:
    """Sync convenience wrapper for tests + the seed step."""
    import asyncio

    return asyncio.run(compose_plan(triggered_by, plan_version))
