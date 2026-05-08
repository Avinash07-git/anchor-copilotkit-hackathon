"""Wellbeing-score + observation-rate tools.

Score model is intentionally simple: start from a baseline, deduct points per
recent signal weighted by signal severity. Higher score = better wellbeing.
This is a *wellbeing* score (per safer-language rules), not a clinical or
diagnostic score.
"""
from __future__ import annotations

from app.data.demo_dataset import PEOPLE
from app.mcp_tools.observation_parser import get_all_logs

# Severity weights — how much each signal type pulls the wellbeing score down.
# Tuned so the demo lands in clear color bands (see language_rules.score_to_color).
SEVERITY: dict[str, int] = {
    "appetite_decrease": 5,
    "leg_swelling": 12,
    "missed_medication": 10,
    "fatigue": 4,
    "memory_lapse": 6,
    "disorientation": 10,
    "safety_concern": 14,
    "sleep_disruption": 6,
    "emotional_exhaustion": 8,
    "self_neglect": 8,
    "isolation": 8,
    "hopelessness": 14,
    "unknown": 0,
}


def update_wellbeing_score(person_id: str) -> int:
    """Recalculate the wellbeing score for the given person.

    Reads from the in-memory log store, sums severity penalties, subtracts
    from the baseline, clamps to 0-100. Returns the new score (also written
    to PEOPLE[person_id] for the dashboard read).
    """
    if person_id not in PEOPLE:
        raise ValueError(f"Unknown person_id: {person_id}")

    baseline = PEOPLE[person_id]["baseline_score"]
    logs = get_all_logs().get(person_id, [])

    # Only count "recent" entries. For Tom/Sarah that's the active timeline;
    # for Helen we only count this-week's observations (day >= 0), since the
    # 3-month baseline entries are reference, not current state.
    if person_id == "helen":
        relevant = [e for e in logs if e["day"] >= 0]
    else:
        relevant = logs

    penalty = sum(SEVERITY.get(e["extracted_signal"], 0) for e in relevant)
    score = max(0, min(100, baseline - penalty))

    PEOPLE[person_id]["current_score"] = score
    return score


def calculate_observation_rate(person_id: str) -> dict:
    """For UC2 — compare this-week observation count vs 3-month baseline rate.

    Returns a dict with:
      baseline_rate_per_month : float  (avg obs/month over the prior 3 months)
      this_week_count          : int   (observations in days 0..6 inclusive)
      acceleration_factor      : float (this_week_count / baseline_rate_per_month,
                                        i.e. "4 obs in 1 week vs ~1 obs in 1 month" → 4x)

    A factor > 2.0 means the agent should consider raising it as accelerated.
    Framing is intentionally count-vs-monthly-rate (not strictly time-normalized)
    so the human-readable message matches: "4 observations this week, vs about
    1 per month before."
    """
    logs = get_all_logs().get(person_id, [])

    baseline_logs = [e for e in logs if e["day"] < 0]
    this_week = [e for e in logs if 0 <= e["day"] <= 6]

    baseline_rate_per_month = (len(baseline_logs) / 3.0) if baseline_logs else 0.0
    week_count = len(this_week)

    if baseline_rate_per_month == 0:
        # No baseline: treat any this-week activity as the full acceleration value.
        acceleration = float(week_count)
    else:
        acceleration = round(week_count / baseline_rate_per_month, 1)

    return {
        "baseline_rate_per_month": round(baseline_rate_per_month, 1),
        "this_week_count": week_count,
        "acceleration_factor": acceleration,
    }
