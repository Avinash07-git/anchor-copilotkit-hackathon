"""Scoring engine — three peer-reviewed instruments, one dispatcher.

Each instrument has its own math, its own thresholds, and its own rebuild
triggers. None of these numbers are made up — every threshold maps to a
published reference range (see app.data.language_rules.INSTRUMENT_CITATIONS).

  - score_physical_drift(tom)     → HF Symptom Monitoring Framework, 7-day
  - score_cognitive_drift(helen)  → NPI subset, weekly + 4-week drift rate
  - score_caregiver_burden(sarah) → ZBI-12, 14-day cumulative + Z10 override

`update_wellbeing_score(person_id)` is the public dispatcher the agent calls.
It returns a uniform shape (state, color, wellbeing_score, raw, citation,
rebuild flags) so the UIPlan composer doesn't care which instrument ran.
"""
from __future__ import annotations

from collections import defaultdict
from typing import TypedDict

from app.data.demo_dataset import PEOPLE
from app.data.language_rules import (
    INSTRUMENT_CITATIONS,
    State,
    state_to_color,
    state_to_wellbeing_score,
)
from app.mcp_tools.observation_parser import INSTRUMENT_OF, get_all_logs

# --- Public output shape -------------------------------------------------


class ScoreResult(TypedDict):
    person_id: str
    instrument: str
    state: State
    color: str
    wellbeing_score: int           # 0-100, higher = better. UI-facing.
    raw_score: float                # instrument-native units (HF: 0-24, NPI: 0-96, ZBI: 0-100)
    raw_score_label: str            # human-readable units, e.g. "12 / 24"
    active_domains: list[dict]      # [{id, severity, evidence, ...}, ...]
    rebuild_triggered: bool
    rebuild_reason: str | None
    citation: str
    extras: dict                    # instrument-specific (drift_rate, override, etc.)


# --- Helpers --------------------------------------------------------------


def _flatten_signals(entries: list[dict]) -> list[dict]:
    """Yield every (entry, signal) pair as a flat dict for scoring."""
    out: list[dict] = []
    for e in entries:
        for s in e.get("signals", []):
            out.append(
                {
                    "day": e["day"],
                    "observer": e["observer"],
                    "raw_text": e["raw_text"],
                    **s,
                }
            )
    return out


# =========================================================================
# INSTRUMENT 1 — Physical Drift (Tom) — HF Symptom Monitoring Framework
# =========================================================================
# 8 signal domains (S1..S8), 7-day rolling window, severity 1-3 per domain.
# Total = sum of MAX severity per active domain across the window. Range 0-24.
# State thresholds (from the source doc):
#   0-4 GREEN, 5-9 YELLOW, 10-14 AMBER, 15+ RED
# Special rebuild rules:
#   - 3+ distinct domains active in the window → rebuild regardless of total
#   - S1 (dyspnea) OR S3 (edema) + S7 (missed med) co-occurring → rebuild
# =========================================================================

PHYSICAL_DOMAIN_LABELS: dict[str, str] = {
    "S1_dyspnea": "Dyspnea (breathlessness)",
    "S2_fatigue": "Fatigue",
    "S3_edema": "Edema (swelling)",
    "S4_appetite_loss": "Appetite loss",
    "S5_general_unwellness": "General unwellness",
    "S6_orthopnea": "Difficulty lying flat",
    "S7_missed_medication": "Missed medication",
    "S8_weight_gain": "Sudden weight gain",
}


def _physical_state(raw: int) -> State:
    if raw >= 15:
        return "red"
    if raw >= 10:
        return "amber"
    if raw >= 5:
        return "yellow"
    return "green"


def score_physical_drift(person_id: str = "tom", today: int = 11) -> ScoreResult:
    """HF Symptom Monitoring Framework — 7-day rolling window."""
    entries = get_all_logs().get(person_id, [])
    window_entries = [e for e in entries if today - 6 <= e["day"] <= today]
    flat = [s for s in _flatten_signals(window_entries) if s["signal"].startswith("S")]

    # Max severity per domain in the window
    by_domain: dict[str, dict] = {}
    for s in flat:
        d = s["signal"]
        if d not in by_domain or s["severity"] > by_domain[d]["severity"]:
            by_domain[d] = s

    raw = sum(s["severity"] for s in by_domain.values())
    state = _physical_state(raw)

    # Rebuild triggers — only count domains at moderate-or-worse severity (≥2)
    # for the safety overrides. A single "a bit heavy" mention shouldn't be
    # enough to fire the high-risk combo by itself.
    domains_active = list(by_domain.keys())
    moderate_or_worse = {d for d, s in by_domain.items() if s["severity"] >= 2}
    high_risk_combo = ("S7_missed_medication" in moderate_or_worse) and (
        "S3_edema" in moderate_or_worse or "S1_dyspnea" in moderate_or_worse
    )
    rebuild = state in ("amber", "red") or (
        len(moderate_or_worse) >= 3 and state != "green"
    ) or high_risk_combo
    reasons = []
    if len(moderate_or_worse) >= 3:
        reasons.append(f"{len(moderate_or_worse)} symptom domains active at moderate-or-worse severity in 7-day window")
    if high_risk_combo:
        reasons.append("High-risk combination flagged in the source framework (edema/dyspnea + missed medication, both ≥ moderate)")
    if state in ("amber", "red"):
        reasons.append(f"Score {raw}/24 crossed into {state.upper()} band")
    rebuild_reason = "; ".join(reasons) if reasons else None

    # Map raw → within-band intensity. 0 = just entered this band (better
    # edge); 1 = at the extreme of the band. Keeps the score gradient alive
    # so two amber-state people don't both render as the same number.
    if state == 'red':
        intensity = min(1.0, max(0.0, (raw - 15) / 9.0))
    elif state == 'amber':
        intensity = min(1.0, max(0.0, (raw - 10) / 4.0))
    elif state == 'yellow':
        intensity = min(1.0, max(0.0, (raw - 5) / 4.0))
    else:
        intensity = min(1.0, max(0.0, raw / 4.0))
    wellbeing = state_to_wellbeing_score(state, intensity)

    active = [
        {
            "id": d,
            "domain": PHYSICAL_DOMAIN_LABELS[d],
            "severity": s["severity"],
            "evidence": s["evidence"],
            "day": s["day"],
            "observer": s["observer"],
        }
        for d, s in by_domain.items()
    ]

    return {
        "person_id": person_id,
        "instrument": "physical_drift",
        "state": state,
        "color": state_to_color(state),
        "wellbeing_score": wellbeing,
        "raw_score": float(raw),
        "raw_score_label": f"{raw} / 24",
        "active_domains": active,
        "rebuild_triggered": rebuild,
        "rebuild_reason": rebuild_reason,
        "citation": INSTRUMENT_CITATIONS["physical_drift"],
        "extras": {
            "window_days": 7,
            "window_end_day": today,
            "high_risk_combo": high_risk_combo,
        },
    }


# =========================================================================
# INSTRUMENT 2 — Cognitive Drift (Helen) — NPI subset
# =========================================================================
# 8 NPI domains (C1..C8). Each domain score = Frequency (1-4) × Severity (1-3).
# Multi-observer rule: take MAX domain score across observers in the same week.
# Weekly score = sum of max domain scores. Range 0-96.
# Drift rate = (this week − 4-week avg) / 4-week avg × 100.
# State driven by drift rate (NOT raw score) per the source doc:
#   <15% GREEN, 15-30% YELLOW, 31-50% AMBER, >50% RED
# Rebuild on tier-crossing.
# =========================================================================

COGNITIVE_DOMAIN_LABELS: dict[str, str] = {
    "C1_memory_repetition": "Memory / repetition",
    "C2_disorientation": "Disorientation",
    "C3_safety_failure": "Safety / task failure",
    "C4_agitation": "Agitation / mood change",
    "C5_withdrawal": "Social withdrawal",
    "C6_sleep_disruption": "Sleep disruption",
    "C7_self_care_decline": "Self-care decline",
    "C8_language_difficulty": "Language difficulty",
}


def _week_of(day: int, today: int) -> int:
    """Return week index relative to today.

    Week 0 = today's week (today-6 .. today). Week 1 = the prior week, etc.
    `day` is the absolute day on the timeline.
    """
    return (today - day) // 7


def _weekly_npi_score(week_entries: list[dict]) -> tuple[float, dict[str, dict]]:
    """Per-week NPI score. Returns (score, by_domain_max)."""
    flat = [s for s in _flatten_signals(week_entries) if s["signal"].startswith("C")]
    by_domain: dict[str, dict] = {}
    for s in flat:
        domain_score = s["frequency"] * s["severity"]
        s_copy = {**s, "domain_score": domain_score}
        if s["signal"] not in by_domain or domain_score > by_domain[s["signal"]]["domain_score"]:
            by_domain[s["signal"]] = s_copy
    return float(sum(d["domain_score"] for d in by_domain.values())), by_domain


def _cognitive_state_from_drift(drift_pct: float) -> State:
    if drift_pct > 50:
        return "red"
    if drift_pct > 30:
        return "amber"
    if drift_pct >= 15:
        return "yellow"
    return "green"


def score_cognitive_drift(person_id: str = "helen", today: int = 6) -> ScoreResult:
    """NPI subset — weekly score + 4-week drift rate.

    `today` is the day-of-week-0 reference (Helen's logs use day 6 = Saturday
    of the current week per the demo dataset).
    """
    entries = get_all_logs().get(person_id, [])

    # Bucket by week. Week 0 = current week, weeks 1..4 = prior 4-week baseline.
    weeks: dict[int, list[dict]] = defaultdict(list)
    for e in entries:
        week_idx = _week_of(e["day"], today)
        if 0 <= week_idx <= 12:  # cap at 12 weeks of history
            weeks[week_idx].append(e)

    this_week_score, by_domain = _weekly_npi_score(weeks.get(0, []))
    baseline_weeks = [weeks[w] for w in (1, 2, 3, 4) if w in weeks]
    if baseline_weeks:
        baseline_scores = [_weekly_npi_score(w)[0] for w in baseline_weeks]
        baseline_avg = sum(baseline_scores) / len(baseline_scores)
    else:
        baseline_avg = 0.0

    # Drift rate — with a baseline floor so a near-zero baseline doesn't
    # explode into 1000% drift on the first new observation. The floor (6)
    # represents the noise level: roughly one mild signal per week is normal
    # everyday forgetfulness for an 84-year-old, and the math should treat
    # that as 'no real drift'. Higher floors give a smoother gradient as
    # signals accumulate, which matches how real caregivers experience drift
    # — a slow rise, not a cliff.
    BASELINE_FLOOR = 6.0
    effective_baseline = max(baseline_avg, BASELINE_FLOOR)
    if this_week_score > 0 or baseline_avg > 0:
        drift_pct = round((this_week_score - effective_baseline) / effective_baseline * 100, 1)
        drift_pct = max(0.0, drift_pct)  # negative drift = improving = also calm
    else:
        drift_pct = 0.0

    state = _cognitive_state_from_drift(drift_pct)

    # Rebuild whenever drift tier crosses out of green
    rebuild = state != "green"
    rebuild_reason = (
        f"Drift rate {drift_pct:.1f}% vs 4-week baseline of {baseline_avg:.1f}/96 "
        f"({len({s['observer'] for s in _flatten_signals(weeks.get(0, []))})} observers this week)"
        if rebuild
        else None
    )

    # Within-band intensity — see physical scoring for the same pattern.
    # NPI bands: green <15, yellow 15-30, amber 30-50, red >50 (drift %).
    if state == 'red':
        intensity = min(1.0, max(0.0, (drift_pct - 50) / 100.0))   # 50%→0, 150%→1
    elif state == 'amber':
        intensity = min(1.0, max(0.0, (drift_pct - 30) / 20.0))    # 30→0, 50→1
    elif state == 'yellow':
        intensity = min(1.0, max(0.0, (drift_pct - 15) / 15.0))    # 15→0, 30→1
    else:
        intensity = min(1.0, max(0.0, drift_pct / 15.0))           # 0→0, 15→1
    wellbeing = state_to_wellbeing_score(state, intensity)

    active = [
        {
            "id": d,
            "domain": COGNITIVE_DOMAIN_LABELS[d],
            "domain_score": s["domain_score"],
            "frequency": s["frequency"],
            "severity": s["severity"],
            "evidence": s["evidence"],
            "observer": s["observer"],
            "day": s["day"],
        }
        for d, s in by_domain.items()
    ]

    return {
        "person_id": person_id,
        "instrument": "cognitive_drift",
        "state": state,
        "color": state_to_color(state),
        "wellbeing_score": wellbeing,
        "raw_score": this_week_score,
        "raw_score_label": f"{this_week_score:.0f} / 96 (week)",
        "active_domains": active,
        "rebuild_triggered": rebuild,
        "rebuild_reason": rebuild_reason,
        "citation": INSTRUMENT_CITATIONS["cognitive_drift"],
        "extras": {
            "this_week_score": this_week_score,
            "baseline_4wk_avg": round(baseline_avg, 1),
            "drift_rate_percent": drift_pct,
            "drift_tier": _drift_tier_label(drift_pct),
        },
    }


def _drift_tier_label(drift_pct: float) -> str:
    if drift_pct > 50:
        return "RAPID ACCELERATION"
    if drift_pct > 30:
        return "SIGNIFICANT ACCELERATION"
    if drift_pct >= 15:
        return "NOTABLE CHANGE"
    return "NORMAL FLUCTUATION"


# =========================================================================
# INSTRUMENT 3 — Caregiver Burden (Sarah) — Zarit ZBI-12
# =========================================================================
# 12 ZBI domains (Z1..Z12). Per observation: 0=absent, 1=mild, 2=mod, 3=severe.
# 14-day window, SUM (not max) per domain — burnout is cumulative.
# Each domain capped at 14×3=42. Total max 504. Normalised to 0-100.
# State thresholds (validated):
#   0-24 GREEN, 25-45 YELLOW, 46-68 AMBER, 69+ RED
# **Hopelessness override:** Z10=3 on any single day → AMBER minimum + rebuild.
# =========================================================================

CAREGIVER_DOMAIN_LABELS: dict[str, str] = {
    "Z1_sleep_disruption": "Sleep disruption",
    "Z2_emotional_exhaustion": "Emotional exhaustion",
    "Z3_isolation": "Social isolation",
    "Z4_guilt": "Guilt / self-blame",
    "Z5_loss_of_control": "Loss of control",
    "Z6_financial_stress": "Financial / practical stress",
    "Z7_anger_resentment": "Anger / resentment",
    "Z8_health_neglect": "Physical health neglect",
    "Z9_relationship_strain": "Relationship strain",
    "Z10_hopelessness": "Hopelessness",
    "Z11_fear_anxiety": "Fear / anxiety",
    "Z12_loss_of_personal_time": "Loss of personal time",
}


def _caregiver_state_from_normalized(score: float) -> State:
    if score >= 69:
        return "red"
    if score >= 46:
        return "amber"
    if score >= 25:
        return "yellow"
    return "green"


def score_caregiver_burden(person_id: str = "sarah", today: int = 14) -> ScoreResult:
    """Zarit ZBI-12 — 14-day cumulative + hopelessness override."""
    entries = get_all_logs().get(person_id, [])
    window = [e for e in entries if today - 13 <= e["day"] <= today]
    flat = [s for s in _flatten_signals(window) if s["signal"].startswith("Z")]

    # Sum severities per domain, cap each at 42
    sums: dict[str, int] = defaultdict(int)
    by_domain_examples: dict[str, dict] = {}
    hopelessness_severe = False
    for s in flat:
        d = s["signal"]
        sums[d] += s["severity"]
        if d not in by_domain_examples or s["severity"] >= by_domain_examples[d]["severity"]:
            by_domain_examples[d] = s
        if d == "Z10_hopelessness" and s["severity"] >= 3:
            hopelessness_severe = True

    capped = {d: min(42, v) for d, v in sums.items()}
    raw_total = sum(capped.values())
    normalised = round(raw_total / 504 * 100, 1)

    state = _caregiver_state_from_normalized(normalised)
    override_applied = False
    if hopelessness_severe and state in ("green", "yellow"):
        state = "amber"
        override_applied = True

    rebuild = state in ("amber", "red") or override_applied
    if override_applied:
        rebuild_reason = (
            "Hopelessness override (ZBI Z10): the phrase used is a validated "
            "early indicator of caregiver depression, regardless of overall score."
        )
    elif rebuild:
        rebuild_reason = f"Normalised burden score {normalised:.1f}/100 crossed into {state.upper()} band"
    else:
        rebuild_reason = None

    # Within-band intensity — ZBI bands: green <25, yellow 25-45, amber 46-68,
    # red 69+ (normalised /100).
    if state == 'red':
        intensity = min(1.0, max(0.0, (normalised - 69) / 30.0))
    elif state == 'amber':
        intensity = min(1.0, max(0.0, (normalised - 46) / 22.0))
    elif state == 'yellow':
        intensity = min(1.0, max(0.0, (normalised - 25) / 20.0))
    else:
        intensity = min(1.0, max(0.0, normalised / 24.0))
    if override_applied:
        intensity = max(intensity, 0.3)  # nudge above bottom of amber band
    wellbeing = state_to_wellbeing_score(state, intensity)

    active = [
        {
            "id": d,
            "domain": CAREGIVER_DOMAIN_LABELS[d],
            "cumulative_severity": capped[d],
            "evidence": by_domain_examples[d]["evidence"],
            "day": by_domain_examples[d]["day"],
        }
        for d in capped
    ]

    return {
        "person_id": person_id,
        "instrument": "caregiver_burden",
        "state": state,
        "color": state_to_color(state),
        "wellbeing_score": wellbeing,
        "raw_score": float(normalised),
        "raw_score_label": f"{normalised:.0f} / 100 (14-day)",
        "active_domains": active,
        "rebuild_triggered": rebuild,
        "rebuild_reason": rebuild_reason,
        "citation": INSTRUMENT_CITATIONS["caregiver_burden"],
        "extras": {
            "raw_total": raw_total,
            "normalised_score": normalised,
            "hopelessness_override": override_applied,
            "window_days": 14,
        },
    }


# =========================================================================
# Public dispatcher + observation-rate (legacy, used by ContributorMap)
# =========================================================================


_TODAY_FOR_PERSON = {"tom": 11, "helen": 6, "sarah": 14}


def today_for(person_id: str) -> int:
    """Return the 'now' reference day for `person_id`.

    Each instrument's window is anchored on this day. New observations (e.g.
    from chat) MUST land at or after this day so they fall inside week 0 of
    the scoring window — otherwise the score doesn't react to them.
    """
    return _TODAY_FOR_PERSON.get(person_id, 0)


def update_wellbeing_score(person_id: str) -> ScoreResult:
    """Recalculate the wellbeing score for any person via the right instrument.

    Returns the full ScoreResult dict (state, color, wellbeing_score, citation,
    rebuild flags, active_domains). Also writes wellbeing_score + state into
    PEOPLE[person_id] so dashboard reads see the latest.
    """
    if person_id not in PEOPLE:
        raise ValueError(f"Unknown person_id: {person_id}")

    today = _TODAY_FOR_PERSON.get(person_id, 0)
    lens = PEOPLE[person_id]["lens"]
    if lens == "body":
        result = score_physical_drift(person_id, today)
    elif lens == "mind":
        result = score_cognitive_drift(person_id, today)
    elif lens == "caregiver":
        result = score_caregiver_burden(person_id, today)
    else:
        raise ValueError(f"No instrument wired for lens: {lens}")

    PEOPLE[person_id]["current_score"] = result["wellbeing_score"]
    PEOPLE[person_id]["current_state"] = result["state"]
    return result


def calculate_observation_rate(person_id: str) -> dict:
    """For UC2 ContributorMap — this-week observer count vs prior baseline.

    Kept distinct from the NPI scoring math because the ContributorMap is a
    different visual story: "who noticed what, how often." Returns counts +
    acceleration factor (this-week vs avg of prior-3-months observer activity).
    """
    entries = get_all_logs().get(person_id, [])
    today = _TODAY_FOR_PERSON.get(person_id, 0)
    this_week = [e for e in entries if today - 6 <= e["day"] <= today]
    baseline = [e for e in entries if e["day"] < today - 6]

    baseline_rate_per_month = (len(baseline) / 3.0) if baseline else 0.0
    week_count = len(this_week)
    if baseline_rate_per_month == 0:
        acceleration = float(week_count)
    else:
        acceleration = round(week_count / baseline_rate_per_month, 1)

    return {
        "baseline_rate_per_month": round(baseline_rate_per_month, 1),
        "this_week_count": week_count,
        "acceleration_factor": acceleration,
        "this_week_observers": sorted({e["observer"] for e in this_week}),
    }
