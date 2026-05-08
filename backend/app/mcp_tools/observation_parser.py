"""Observation parsing + logging tools.

`parse_observation_log` extracts a structured signal from casual text — this is
the core "agent reads what Sarah typed" step. We use a deterministic keyword-
match-with-fallback approach so the demo never wobbles, but the function shape
matches what you'd build with an LLM call. The agent will *also* reason over
the raw text upstream; this tool just guarantees the structured handoff.

`log_observation` records the entry in the in-memory store the dashboard reads
from. No DB — single-session demo only.
"""
from __future__ import annotations

from typing import Literal, TypedDict

# --- In-memory log store ---------------------------------------------------

# Keyed by person_id → list of logged entries. Pre-seeded from demo_dataset
# during app startup (see app.main.lifespan).
_LOG_STORE: dict[str, list[dict]] = {"tom": [], "helen": [], "sarah": []}


def _store_for(person_id: str) -> list[dict]:
    if person_id not in _LOG_STORE:
        _LOG_STORE[person_id] = []
    return _LOG_STORE[person_id]


def reset_store() -> None:
    """Wipe the in-memory log store. Used by the /demo/reset endpoint."""
    for k in _LOG_STORE:
        _LOG_STORE[k].clear()


def get_all_logs() -> dict[str, list[dict]]:
    """Read-only view of the current log store. Used by scoring + patterns."""
    return {k: list(v) for k, v in _LOG_STORE.items()}


# --- Signal taxonomy ------------------------------------------------------
# Tiny rules-based extractor. Real LLM extraction is overkill for the demo
# and adds non-determinism we cannot afford on stage. Keep this list aligned
# with PATTERNS.signals_required in demo_dataset.py.

Signal = Literal[
    "appetite_decrease",
    "leg_swelling",
    "missed_medication",
    "fatigue",
    "memory_lapse",
    "disorientation",
    "safety_concern",
    "sleep_disruption",
    "emotional_exhaustion",
    "self_neglect",
    "isolation",
    "hopelessness",
    "unknown",
]

_KEYWORDS: dict[Signal, list[str]] = {
    # Order matters: when two signals match the same phrase with equal
    # confidence, the one defined FIRST wins. Caregiver-lens signals are
    # placed before patient-lens signals for shared phrases like "haven't
    # eaten" (Sarah's self-neglect, not Tom's appetite).
    "sleep_disruption": ["couldn't sleep", "no sleep", "didn't sleep", "worrying about"],
    "emotional_exhaustion": ["snapped at", "feel terrible", "drained"],
    "self_neglect": ["haven't eaten", "no time for", "skipped meals"],
    "isolation": ["nobody is helping", "alone in this", "by myself"],
    "hopelessness": ["how much longer", "can't do this", "drowning"],
    "appetite_decrease": ["didn't finish", "skipped dinner", "not hungry", "wasn't hungry"],
    "leg_swelling": ["swollen", "swelling", "legs feel heavy", "legs look", "puffy"],
    "missed_medication": ["forgot to take", "missed", "didn't take"],
    "fatigue": ["tired", "exhausted", "no energy"],
    "memory_lapse": ["asked the same", "same question", "same story", "forgot where", "forgot what"],
    "disorientation": ["what year", "what day", "couldn't remember"],
    "safety_concern": ["stove on", "stove", "left the door", "lost"],
}


class ParsedObservation(TypedDict):
    raw_text: str
    extracted_signal: Signal
    confidence: float
    person_hint: str | None  # if the text mentions a name


def parse_observation_log(raw_text: str) -> ParsedObservation:
    """Extract a structured wellbeing signal from a casual observation.

    Deterministic keyword match. Returns ``unknown`` with low confidence if
    nothing matches, so the agent can decide to ask a follow-up question.
    """
    lowered = raw_text.lower()

    best_signal: Signal = "unknown"
    best_confidence = 0.0
    for signal, keywords in _KEYWORDS.items():
        for kw in keywords:
            if kw in lowered:
                # crude confidence — longer match phrase = higher confidence
                conf = min(0.95, 0.55 + len(kw) / 40)
                if conf > best_confidence:
                    best_signal = signal
                    best_confidence = conf

    # Person hint — if the text mentions Tom/Helen/Sarah explicitly
    person_hint: str | None = None
    for name in ("tom", "helen", "sarah", "mom", "grandma"):
        if name in lowered:
            person_hint = {"mom": "helen", "grandma": "helen"}.get(name, name)
            break

    return {
        "raw_text": raw_text,
        "extracted_signal": best_signal,
        "confidence": round(best_confidence, 2),
        "person_hint": person_hint,
    }


def log_observation(
    person_id: str,
    observer: str,
    raw_text: str,
    day: int,
    extracted_signal: Signal | None = None,
) -> dict:
    """Record an observation in the in-memory store.

    If extracted_signal is omitted, runs the parser. Returns the stored entry
    so the caller can include it in cards.
    """
    if extracted_signal is None:
        parsed = parse_observation_log(raw_text)
        extracted_signal = parsed["extracted_signal"]

    entry = {
        "person_id": person_id,
        "observer": observer,
        "raw_text": raw_text,
        "day": day,
        "extracted_signal": extracted_signal,
    }
    _store_for(person_id).append(entry)
    return entry
