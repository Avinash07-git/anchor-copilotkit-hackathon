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


# Human-readable labels for backend signal codes — keep in sync with
# frontend/src/components/cardHelpers.ts SIGNAL_LABELS.
_SIGNAL_LABELS: dict[str, str] = {
    # Tom — HF Symptom Monitoring Framework
    "S1_dyspnea":            "shortness of breath",
    "S2_fatigue":            "unusual fatigue",
    "S3_edema":              "leg / ankle swelling",
    "S4_appetite_loss":      "reduced appetite",
    "S5_general_unwellness": "feeling generally unwell",
    "S6_orthopnea":          "trouble breathing lying down",
    "S7_missed_medication":  "a missed medication",
    "S8_weight_gain":        "sudden weight gain",
    # Helen — NPI subset
    "C1_memory_repetition":  "repeated questions",
    "C2_disorientation":     "disorientation",
    "C3_safety_failure":     "a safety lapse",
    "C4_agitation":          "agitation",
    "C5_withdrawal":         "withdrawal",
    "C6_sleep_disruption":   "disrupted sleep",
    "C7_self_care_decline":  "self-care decline",
    "C8_language_difficulty":"word-finding difficulty",
    # Sarah — ZBI-12
    "Z1_sleep":               "sleep difficulty",
    "Z2_emotional_exhaustion":"emotional exhaustion",
    "Z3_isolation":           "feeling isolated",
    "Z4_guilt":               "guilt",
    "Z5_loss_of_control":     "loss of control",
    "Z6_financial_stress":    "financial stress",
    "Z7_anger":               "anger / resentment",
    "Z8_health_neglect":      "self-neglect",
    "Z9_relationship_strain": "relationship strain",
    "Z10_hopelessness":       "hopelessness",
    "Z11_fear":               "fear / anxiety",
    "Z12_loss_of_personal_time": "no time for self",
}


def _humanize_signal(raw: str) -> str:
    """Render a backend signal id (e.g. 'S3_edema') in plain English.

    Falls back gracefully for unknown codes by stripping the prefix.
    Multi-signal strings (comma-separated) are joined with ' + '.
    """
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    if not parts:
        return raw
    pretty = []
    for p in parts:
        if p in _SIGNAL_LABELS:
            pretty.append(_SIGNAL_LABELS[p])
        else:
            cleaned = p.split("_", 1)[-1].replace("_", " ")
            pretty.append(cleaned or p)
    return " + ".join(pretty)


def _bullet_from_entry(entry: dict) -> str | None:
    """Convert a log entry into an observational, non-clinical bullet."""
    signal = entry["extracted_signal"]
    day = entry["day"]
    raw = entry["raw_text"]
    if signal == "unknown":
        return None
    return f"Day {day}: {raw}  \u2014 noted as {_humanize_signal(signal)}"
