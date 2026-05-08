"""Safer-language constants — non-negotiable.

Bedside is NOT a medical device. Every user-facing string passes through this
filter. See BEDSIDE_SPEC.md §10. If you find yourself reaching for a clinical
verb, look here for the replacement.
"""
from __future__ import annotations

# Words that must never appear in user-facing strings.
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

# Approved replacements (for the agent prompt + UI copy review).
APPROVED_PHRASING = {
    "diagnose": "notice a pattern",
    "diagnosis": "pattern",
    "treatment": "support / management",
    "medical advice": "information to share with your healthcare team",
    "you should": "you might want to",
    "score": "wellbeing score",  # never "diagnostic score"
}

# Mandatory disclaimer — shown on app load + on every alert card.
DISCLAIMER = (
    "Bedside is not a medical device. It surfaces patterns from what you tell "
    "it, so you can share them with your healthcare team. Always consult a "
    "qualified clinician for medical decisions."
)

# Approved framing for the three lenses (used in DriftScoreCard labels).
LENS_LABELS = {
    "body": "Physical wellbeing",
    "mind": "Cognitive wellbeing",
    "caregiver": "Caregiver wellbeing",
}

# Approved color thresholds (score 0-100, higher = better).
def score_to_color(score: int) -> str:
    """Return one of: green | yellow | amber | red.

    Bands tuned so each demo trigger lands in a clear zone:
      80-100 = green   (calm)
      65-79  = yellow  (worth watching)
      50-64  = amber   (worth flagging)
      0-49   = red     (worth acting on)
    """
    if score >= 80:
        return "green"
    if score >= 65:
        return "yellow"
    if score >= 50:
        return "amber"
    return "red"
