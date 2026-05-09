"""Safer-language constants + instrument citations — non-negotiable.

Anchor is NOT a medical device. Every user-facing string passes through this
filter. See ANCHOR_SPEC.md §10. If you find yourself reaching for a clinical
verb, look here for the replacement.

We also expose **citations** for the three peer-reviewed instruments that drive
the scoring engine. Every alert card surfaces its instrument citation so the
user (and the judges) can see the work isn't hand-waved.
"""
from __future__ import annotations

from typing import Literal

# --- Banned / approved phrasing -------------------------------------------

BANNED_TERMS = {
    "diagnose",
    "diagnosis",
    "diagnostic",
    "treat",
    "treatment",
    "cure",
    "medical advice",
    "clinical advice",
    "you should",  # too prescriptive in medical context — use "you might want to"
    "cardiac drift",
    "pre-readmission",
    "decompensation",
}

APPROVED_PHRASING = {
    "diagnose": "notice a pattern",
    "diagnosis": "pattern",
    "treatment": "support / management",
    "medical advice": "information to share with your healthcare team",
    "you should": "you might want to",
    "score": "wellbeing score",  # never "diagnostic score"
}

DISCLAIMER = (
    "Anchor is not a medical device. It surfaces patterns from what you tell "
    "it, so you can share them with your healthcare team. Always consult a "
    "qualified clinician for medical decisions."
)

LENS_LABELS = {
    "body": "Physical wellbeing",
    "mind": "Cognitive wellbeing",
    "caregiver": "Caregiver wellbeing",
}

# --- Dashboard state model ------------------------------------------------
# Each instrument outputs one of these four states. Color is derived from
# state (not from the raw score) so a state-only override (e.g. Sarah's
# hopelessness override) maps to a color cleanly.

State = Literal["green", "yellow", "amber", "red"]

STATE_COLORS: dict[State, str] = {
    "green": "green",
    "yellow": "yellow",
    "amber": "amber",
    "red": "red",
}

# Wellbeing-score band per state (0-100, higher = better wellbeing).
# Each instrument computes its own raw score in its own units, then maps
# into one of these bands so the DriftScoreCard always reads consistently.
STATE_WELLBEING_BANDS: dict[State, tuple[int, int]] = {
    "green": (75, 100),
    "yellow": (50, 74),
    "amber": (25, 49),
    "red": (0, 24),
}


def state_to_color(state: State) -> str:
    return STATE_COLORS[state]


def state_to_wellbeing_score(state: State, intensity: float = 0.5) -> int:
    """Map a state + within-band intensity (0..1) to a 0-100 wellbeing score.

    intensity=0 lands at the *better* edge of the band, 1 at the *worse* edge.
    This lets two amber people read differently on the dashboard while still
    sharing the amber color.
    """
    lo, hi = STATE_WELLBEING_BANDS[state]
    intensity = max(0.0, min(1.0, intensity))
    # Higher intensity = worse wellbeing = lower score
    score = round(hi - (hi - lo) * intensity)
    return score


# --- Peer-reviewed instrument citations -----------------------------------
# Surfaced verbatim on every PatternAlertCard so the credibility is visible.

INSTRUMENT_CITATIONS: dict[str, str] = {
    "physical_drift": (
        "Modeled after the Heart Failure Symptom Monitoring Framework "
        "(Georgetown / NIH, PMC9070923). 8 validated symptom domains, "
        "7-day rolling window, severity-weighted."
    ),
    "cognitive_drift": (
        "Modeled after the Neuropsychiatric Inventory (NPI; Cummings et al.) — "
        "the most widely used informant-reported instrument in dementia "
        "clinical trials. 8-domain subset, weekly drift-rate vs 4-week baseline."
    ),
    "caregiver_burden": (
        "Modeled after the Zarit Burden Interview, 12-item version "
        "(ZBI-12; PMC6497029). 14-day cumulative score normalized 0-100, "
        "with the validated hopelessness item as a safety override."
    ),
}


# --- Backward-compat shim --------------------------------------------------
# Older code may still import score_to_color. Map a 0-100 wellbeing score
# back to a color via the same bands so nothing breaks during migration.

def score_to_color(score: int) -> str:
    if score >= 75:
        return "green"
    if score >= 50:
        return "yellow"
    if score >= 25:
        return "amber"
    return "red"
