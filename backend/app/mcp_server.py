"""Anchor MCP server.

This module exposes the same eight tools that power the demo through a real
MCP FastMCP server. The FastAPI app still imports the functions directly for
stage-demo reliability, but sponsor/judge inspection can run this module and
see the protocol surface explicitly.

Run locally from backend/:

    python -m app.mcp_server

The tool implementations intentionally delegate to the production modules so
there is one source of truth for parsing, scoring, pattern matching, support
lookup, and talking-points generation.
"""
from __future__ import annotations

from typing import Any

from mcp.server.fastmcp import FastMCP

from app.mcp_tools.observation_parser import log_observation as _log_observation
from app.mcp_tools.observation_parser import parse_observation_log as _parse_observation_log
from app.mcp_tools.patterns import check_pattern_match as _check_pattern_match
from app.mcp_tools.patterns import get_pattern_context as _get_pattern_context
from app.mcp_tools.scoring import calculate_observation_rate as _calculate_observation_rate
from app.mcp_tools.scoring import update_wellbeing_score as _update_wellbeing_score
from app.mcp_tools.support import draft_talking_points as _draft_talking_points
from app.mcp_tools.support import find_local_support as _find_local_support

mcp = FastMCP("anchor-caregiver-tools")


@mcp.tool()
def parse_observation_log(text: str) -> dict[str, Any]:
    """Extract structured caregiver signals from casual natural language."""
    return _parse_observation_log(text)


@mcp.tool()
def log_observation(
    person_id: str,
    observer: str,
    raw_text: str,
    day: int,
    signals: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Record one observation for Tom, Helen, or Sarah in the demo log store."""
    return _log_observation(person_id, observer, raw_text, day, signals)  # type: ignore[arg-type]


@mcp.tool()
def update_wellbeing_score(person_id: str) -> dict[str, Any]:
    """Run the correct peer-reviewed scoring instrument for one person."""
    return _update_wellbeing_score(person_id)


@mcp.tool()
def calculate_observation_rate(person_id: str) -> dict[str, Any]:
    """Compute this-week observation activity vs Helen's baseline rate."""
    return _calculate_observation_rate(person_id)


@mcp.tool()
def check_pattern_match(person_id: str) -> dict[str, Any] | None:
    """Return the matched pattern and live score evidence when a rebuild fires."""
    return _check_pattern_match(person_id)


@mcp.tool()
def get_pattern_context(pattern_id: str) -> dict[str, Any]:
    """Return safer-language context, actions, and citation for a pattern."""
    return _get_pattern_context(pattern_id)


@mcp.tool()
def find_local_support(kind: str) -> list[dict[str, Any]]:
    """Return realistic local respite/support/doctor-follow-up options."""
    return _find_local_support(kind)


@mcp.tool()
def draft_talking_points(person_id: str, audience: str | None = None) -> dict[str, Any]:
    """Draft observational talking points for a clinician or family conversation."""
    return _draft_talking_points(person_id, audience)


if __name__ == "__main__":
    mcp.run()
