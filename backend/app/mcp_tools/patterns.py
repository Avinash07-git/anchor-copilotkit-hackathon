"""Pattern matching + context tools.

Patterns now live downstream of the scoring engine — a pattern "matches"
when its instrument's state crosses out of GREEN. The pattern definition
in app.data.demo_dataset.PATTERNS provides the safer-language title, the
why-it-matters paragraph, and suggested actions; the scoring engine
provides the live evidence (which signals fired, with what severity).

This separation is deliberate: the threshold logic is *grounded in the
peer-reviewed instrument*, not in a hand-tuned dict.
"""
from __future__ import annotations

from app.data.demo_dataset import PATTERNS, PEOPLE
from app.mcp_tools.scoring import update_wellbeing_score


def check_pattern_match(person_id: str) -> dict | None:
    """Return the matching pattern for this person, or None.

    Strategy: run the person's instrument; if it fired a rebuild, return the
    pattern definition for that lens, enriched with the live score result so
    the alert card can render with real evidence.
    """
    if person_id not in PEOPLE:
        return None

    result = update_wellbeing_score(person_id)
    if not result["rebuild_triggered"]:
        return None

    lens = PEOPLE[person_id]["lens"]
    pattern_id = {
        "body": "post_discharge_decline",
        "mind": "cognitive_acceleration",
        "caregiver": "caregiver_burnout",
    }.get(lens)
    if pattern_id is None or pattern_id not in PATTERNS:
        return None

    pattern = PATTERNS[pattern_id]
    return {
        "pattern_id": pattern_id,
        **pattern,
        # Live evidence from the scoring run:
        "score_result": result,
    }


def get_pattern_context(pattern_id: str) -> dict:
    """Return the safer-language context (title + why_it_matters + actions + citation)."""
    if pattern_id not in PATTERNS:
        raise KeyError(f"Unknown pattern_id: {pattern_id}")
    pattern = PATTERNS[pattern_id]
    return {
        "pattern_id": pattern_id,
        "title": pattern["title"],
        "why_it_matters": pattern["why_it_matters"],
        "suggested_actions": pattern["suggested_actions"],
        "lens": pattern["lens"],
        "citation": pattern.get("citation", ""),
    }
