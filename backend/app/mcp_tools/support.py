"""Local-support lookup + talking-points draft tools.

Both are intentionally non-LLM: deterministic generation from canned data and
templates so the demo never wobbles. Real productionisation would swap these
for live API + LLM calls — the function shape is identical.
"""
from __future__ import annotations

from app.data.demo_dataset import LOCAL_SUPPORT, PEOPLE
from app.data.language_rules import DISCLAIMER
from app.mcp_tools.observation_parser import get_all_logs


def find_local_support(kind: str) -> list[dict]:
    """Look up local support resources of the given kind.

    kind ∈ {respite_care, support_group, doctor_followup}. Returns up to 3
    options (real-looking SF/Bay-Area entries from LOCAL_SUPPORT).
    """
    return LOCAL_SUPPORT.get(kind, [])[:3]


def draft_talking_points(person_id: str, audience: str | None = None) -> dict:
    """Generate a bullet list of talking points for the next clinician visit.

    Pulls from the person's recent logs and converts each into a short,
    observational bullet — NOT a clinical claim. Adds the safer-language
    disclaimer.
    """
    if person_id not in PEOPLE:
        raise ValueError(f"Unknown person_id: {person_id}")

    person = PEOPLE[person_id]
    audience = audience or _default_audience_for(person["lens"])
    logs = get_all_logs().get(person_id, [])
    if person_id == "helen":
        logs = [e for e in logs if e["day"] >= 0]

    bullets: list[str] = []
    for entry in logs:
        bullet = _bullet_from_entry(entry)
        if bullet:
            bullets.append(bullet)

    if not bullets:
        bullets.append(
            f"Nothing specific to flag right now — {person['display_name']}'s "
            "recent observations are within their usual range."
        )

    return {
        "audience": audience,
        "person_display_name": person["display_name"],
        "bullets": bullets,
        "disclaimer": DISCLAIMER,
    }


def _default_audience_for(lens: str) -> str:
    return {
        "body": "Tom's cardiologist",
        "mind": "Helen's neurologist or primary-care doctor",
        "caregiver": "Sarah's primary-care doctor",
    }.get(lens, "the next clinician visit")


def _bullet_from_entry(entry: dict) -> str | None:
    """Convert a log entry into an observational, non-clinical bullet."""
    signal = entry["extracted_signal"]
    day = entry["day"]
    raw = entry["raw_text"]
    if signal == "unknown":
        return None
    return f"Day {day}: {raw}  → flagged as {signal.replace('_', ' ')}"
