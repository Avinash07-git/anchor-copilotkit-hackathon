"""Observation parsing + logging tools.

`parse_observation_log` extracts **structured wellbeing signals** from casual
text the family types. Signals are organised under three peer-reviewed
instruments:

  - S1..S8  → Heart Failure Symptom Monitoring Framework (Tom)
  - C1..C8  → Neuropsychiatric Inventory subset (Helen)
  - Z1..Z12 → Zarit Burden Interview, 12-item (Sarah)

Each detected signal carries a **severity** (1=mild/hedged, 2=moderate/clear,
3=severe/emphatic) and — for cognitive items — a **frequency** (1..4) inferred
from phrasing. This is the structured handoff the scoring engine needs.

The parser is deterministic (keyword + hedge/emphatic-word matching) so the
on-stage demo never wobbles. The function shape matches what you'd build with
an LLM extractor, so swapping in a real one later is a one-file change.
"""
from __future__ import annotations

from typing import Literal, TypedDict

# --- In-memory log store --------------------------------------------------

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
    """Read-only view of the current log store."""
    return {k: list(v) for k, v in _LOG_STORE.items()}


# --- Signal taxonomy (28 IDs, traceable to the three instruments) ---------

Signal = Literal[
    # Physical (HF Symptom Monitoring Framework — Tom)
    "S1_dyspnea",
    "S2_fatigue",
    "S3_edema",
    "S4_appetite_loss",
    "S5_general_unwellness",
    "S6_orthopnea",
    "S7_missed_medication",
    "S8_weight_gain",
    # Cognitive (NPI subset — Helen)
    "C1_memory_repetition",
    "C2_disorientation",
    "C3_safety_failure",
    "C4_agitation",
    "C5_withdrawal",
    "C6_sleep_disruption",
    "C7_self_care_decline",
    "C8_language_difficulty",
    # Caregiver (ZBI-12 — Sarah)
    "Z1_sleep_disruption",
    "Z2_emotional_exhaustion",
    "Z3_isolation",
    "Z4_guilt",
    "Z5_loss_of_control",
    "Z6_financial_stress",
    "Z7_anger_resentment",
    "Z8_health_neglect",
    "Z9_relationship_strain",
    "Z10_hopelessness",
    "Z11_fear_anxiety",
    "Z12_loss_of_personal_time",
    # Sentinel
    "unknown",
]

INSTRUMENT_OF: dict[str, str] = {}
for _sig in Signal.__args__:  # type: ignore[attr-defined]
    if _sig.startswith("S"):
        INSTRUMENT_OF[_sig] = "physical_drift"
    elif _sig.startswith("C"):
        INSTRUMENT_OF[_sig] = "cognitive_drift"
    elif _sig.startswith("Z"):
        INSTRUMENT_OF[_sig] = "caregiver_burden"
    else:
        INSTRUMENT_OF[_sig] = "none"


# --- Keyword maps ---------------------------------------------------------
# Phrases lifted from the source instruments (HF framework, NPI, ZBI-12).
# Order matters: when one phrase could match multiple signals, the *first*
# matching signal wins. Caregiver (Z*) keywords are placed before patient
# keywords for shared phrases like "haven't eaten" (Sarah's self-neglect,
# not Tom's appetite).

_KEYWORDS: dict[Signal, list[str]] = {
    # --- Caregiver burden (checked first, owns shared phrases) -----------
    "Z10_hopelessness": [
        "how much longer",
        "can't do this",
        "what's the point",
        "no light at the end",
        "doesn't get better",
        "don't see any way",
    ],
    "Z5_loss_of_control": [
        "drowning",
        "can't cope",
        "overwhelming",
        "falling apart",
        "feel trapped",
    ],
    "Z1_sleep_disruption": [
        "couldn't sleep",
        "can't sleep",
        "didn't sleep",
        "up worrying",
        "haven't slept",
    ],
    "Z2_emotional_exhaustion": [
        "drained",
        "running on empty",
        "nothing left",
        "so exhausted",
        "completely spent",
    ],
    "Z4_guilt": [
        "snapped at",
        "feel terrible",
        "bad caregiver",
        "shouldn't feel",
        "feel awful",
    ],
    "Z3_isolation": [
        "nobody is helping",
        "alone in this",
        "by myself",
        "friends have stopped",
        "haven't seen anyone",
    ],
    "Z8_health_neglect": [
        "haven't eaten",
        "no time for me",
        "skipped meals",
        "skipping my own",
        "no time to eat",
    ],
    "Z7_anger_resentment": [
        "so frustrated",
        "why is this my job",
        "i'm furious",
        "nobody else helps",
    ],
    "Z11_fear_anxiety": [
        "terrified",
        "scared to leave",
        "constant worry",
        "afraid something",
    ],
    "Z12_loss_of_personal_time": [
        "no time for myself",
        "life is on hold",
        "haven't done anything i enjoy",
    ],
    "Z9_relationship_strain": [
        "we argued",
        "doesn't appreciate",
        "difficult to deal with",
    ],
    "Z6_financial_stress": [
        "can't afford",
        "too expensive",
        "no help available",
        "can't get time off",
    ],
    # --- Physical (Tom — HF) ---------------------------------------------
    "S3_edema": [
        "swollen",
        "swelling",
        "legs feel heavy",
        "legs look",
        "ankles puffy",
        "puffy",
        "shoes don't fit",
        "feet swollen",
    ],
    "S4_appetite_loss": [
        "didn't finish",
        "skipped dinner",
        "skipped lunch",
        "not hungry",
        "wasn't hungry",
        "barely ate",
        "barely touched",
        "few bites",
    ],
    "S7_missed_medication": [
        "forgot to take",
        "missed the dose",
        "didn't take the",
        "skipped the dose",
        "skipped the evening",
        "missed his pill",
    ],
    "S2_fatigue": [
        "no energy",
        "slept all day",
        "couldn't get off the couch",
        "so tired",
        "exhausted",
        "tired",
    ],
    "S1_dyspnea": [
        "short of breath",
        "struggling to breathe",
        "breathing harder",
        "can't catch his breath",
        "out of breath",
    ],
    "S5_general_unwellness": [
        "felt off",
        "not himself",
        "feels unwell",
        "something seems wrong",
        "not right",
        "doesn't seem himself",
    ],
    "S6_orthopnea": [
        "couldn't sleep flat",
        "needed extra pillows",
        "slept in the chair",
        "can't lie down",
    ],
    "S8_weight_gain": [
        "gained 2 pounds",
        "weight up",
        "heavier than yesterday",
        "gained weight overnight",
    ],
    # --- Cognitive (Helen — NPI subset) ----------------------------------
    "C1_memory_repetition": [
        "asked the same",
        "same question",
        "same story",
        "told me again",
        "forgot we",
    ],
    "C2_disorientation": [
        "what year",
        "what day",
        "couldn't remember",
        "didn't know what day",
        "thought it was",
        "didn't recognise",
        "didn't recognize",
    ],
    "C3_safety_failure": [
        "stove on",
        "left the stove",
        "left the door",
        "left the tap",
        "burnt the food",
        "forgot to lock",
    ],
    "C4_agitation": [
        "got angry",
        "very irritable",
        "upset for no reason",
        "couldn't calm",
    ],
    "C5_withdrawal": [
        "didn't want to talk",
        "sat alone",
        "refused to come out",
        "not interested",
    ],
    "C6_sleep_disruption": [
        "up all night",
        "wandering at night",
        "confused day and night",
        "sleeping at wrong",
    ],
    "C7_self_care_decline": [
        "didn't get dressed",
        "hasn't bathed",
        "wearing the same clothes",
        "forgot to eat",
    ],
    "C8_language_difficulty": [
        "couldn't find the word",
        "sentences didn't make sense",
        "mixed up names",
    ],
}


# --- Severity + frequency phrase markers ---------------------------------

_HEDGE_WORDS = ("a bit", "a little", "slightly", "maybe", "kind of", "sort of", "somewhat")
_EMPHATIC_WORDS = (
    "really",
    "very",
    "barely",
    "completely",
    "totally",
    "extremely",
    "all day",
    "constantly",
    "non-stop",
    "again and again",
)
_FREQ_OFTEN = ("again", "twice", "three times", "four times", "several", "multiple")
_FREQ_FREQUENT = ("every day", "all day", "all night", "constantly", "non-stop", "keeps")
_FREQ_VERY_FREQUENT = ("all the time", "every hour", "every few minutes")


def _infer_severity(text_lower: str, matched_phrase: str) -> int:
    """1=mild/hedged, 2=moderate/clear, 3=severe/emphatic.

    We look for hedge words near the matched phrase to pull severity *down*,
    and emphatic words to push severity *up*. Default = 2 (clear statement).
    """
    if any(w in text_lower for w in _EMPHATIC_WORDS):
        return 3
    # Hedge only counts if it's near the matched phrase (within ~30 chars)
    idx = text_lower.find(matched_phrase)
    window = text_lower[max(0, idx - 25): idx + len(matched_phrase) + 10]
    if any(w in window for w in _HEDGE_WORDS):
        return 1
    return 2


def _infer_frequency(text_lower: str) -> int:
    """1=occasionally, 2=often, 3=frequently, 4=very frequently. NPI only."""
    if any(w in text_lower for w in _FREQ_VERY_FREQUENT):
        return 4
    if any(w in text_lower for w in _FREQ_FREQUENT):
        return 3
    if any(w in text_lower for w in _FREQ_OFTEN):
        return 2
    return 1


# --- Public types ---------------------------------------------------------


class DetectedSignal(TypedDict):
    signal: Signal
    severity: int       # 1..3 (all instruments)
    frequency: int      # 1..4 (used by NPI / Helen; ignored elsewhere)
    evidence: str       # the verbatim phrase that matched


class ParsedObservation(TypedDict):
    raw_text: str
    signals: list[DetectedSignal]
    person_hint: str | None


# --- Parser ---------------------------------------------------------------


def parse_observation_log(raw_text: str) -> ParsedObservation:
    """Extract all structured wellbeing signals from a casual observation.

    Returns every matching signal (an observation can yield multiple — e.g.
    "skipped dinner and his legs feel heavy" → S4 + S3). Severity and
    frequency are inferred from hedge / emphatic / frequency markers.

    If nothing matches, returns an empty `signals` list — the agent can then
    decide to ask a follow-up question instead of silently scoring nothing.
    """
    lowered = raw_text.lower()
    detected: list[DetectedSignal] = []
    seen_signals: set[str] = set()

    for signal, keywords in _KEYWORDS.items():
        for kw in keywords:
            if kw in lowered and signal not in seen_signals:
                detected.append(
                    {
                        "signal": signal,
                        "severity": _infer_severity(lowered, kw),
                        "frequency": _infer_frequency(lowered),
                        "evidence": kw,
                    }
                )
                seen_signals.add(signal)
                break  # first matching keyword per signal wins

    # Person hint
    person_hint: str | None = None
    for name in ("tom", "helen", "sarah", "mom", "grandma"):
        if name in lowered:
            person_hint = {"mom": "helen", "grandma": "helen"}.get(name, name)
            break

    return {
        "raw_text": raw_text,
        "signals": detected,
        "person_hint": person_hint,
    }


# --- Logging --------------------------------------------------------------


def log_observation(
    person_id: str,
    observer: str,
    raw_text: str,
    day: int,
    signals: list[DetectedSignal] | None = None,
) -> dict:
    """Record an observation in the in-memory store.

    If `signals` is omitted, runs the parser. The stored entry mirrors what
    the scoring engine reads from. We store the FULL list of signals (not
    just one) — multi-domain observations are common and load-bearing for
    the scoring math.
    """
    if signals is None:
        parsed = parse_observation_log(raw_text)
        signals = parsed["signals"]

    entry = {
        "person_id": person_id,
        "observer": observer,
        "raw_text": raw_text,
        "day": day,
        "signals": signals,
        # Back-compat: a single 'extracted_signal' field used by older renderers.
        # Surfaces the *first* detected signal (or "unknown") so existing UI
        # code keeps working without a migration.
        "extracted_signal": signals[0]["signal"] if signals else "unknown",
    }
    _store_for(person_id).append(entry)
    return entry
