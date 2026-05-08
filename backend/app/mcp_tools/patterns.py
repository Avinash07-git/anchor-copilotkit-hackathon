"""Pattern matching + context tools.

Patterns live in app.data.demo_dataset.PATTERNS. A match is "all required
signals are present in the recent logs". When matched, get_pattern_context
returns the safer-language explanation card content.
"""
from __future__ import annotations

from app.data.demo_dataset import PATTERNS
from app.mcp_tools.observation_parser import get_all_logs


def check_pattern_match(person_id: str) -> dict | None:
    """Return the matching pattern dict (with id) for this person, or None.

    Iterates known patterns; returns the first whose required signals are all
    present in the person's recent logs. Order in PATTERNS dict determines
    priority — keep most-severe patterns first there if you add more.
    """
    logs = get_all_logs().get(person_id, [])
    if person_id == "helen":
        logs = [e for e in logs if e["day"] >= 0]

    seen = {e["extracted_signal"] for e in logs}

    for pattern_id, pattern in PATTERNS.items():
        required = set(pattern["signals_required"])
        if required.issubset(seen):
            return {"pattern_id": pattern_id, **pattern}
    return None


def get_pattern_context(pattern_id: str) -> dict:
    """Return the safer-language context (title + why_it_matters + actions).

    Raises KeyError if the pattern doesn't exist — agent prompt should always
    follow check_pattern_match before calling this.
    """
    if pattern_id not in PATTERNS:
        raise KeyError(f"Unknown pattern_id: {pattern_id}")
    pattern = PATTERNS[pattern_id]
    return {
        "pattern_id": pattern_id,
        "title": pattern["title"],
        "why_it_matters": pattern["why_it_matters"],
        "suggested_actions": pattern["suggested_actions"],
        "lens": pattern["lens"],
    }
