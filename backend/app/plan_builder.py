"""Deterministic UIPlan builder.

Given the current state of all three people in the family, this module
composes a fully-validated `UIPlan` without any LLM call. It exists for
two reasons:

1. **Demo safety net.** If Gemini is rate-limited, offline, or the API key
   is missing, the demo still renders a correct, citation-rich dashboard.
2. **Ground truth.** The Pydantic-AI agent (in ``agent.py``) is told to
   emit a UIPlan with the same shape and the same citations; we use this
   builder's output as a reference plan in tests.

Layout selection rules (mirror ANCHOR_SPEC §7):

- 0 patterns matched  → ``calm_dashboard``
- 1 pattern matched   → ``single_alert``
- 2 patterns matched, one of them Sarah's → ``dual_risk``
- 2+ patterns, all patient (no Sarah) → ``single_alert`` of the most urgent
- 3 patterns matched  → ``combined_triage``
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from app.data.demo_dataset import PEOPLE
from app.data.language_rules import (
    DISCLAIMER,
    LENS_LABELS,
    state_to_wellbeing_score,
)
from app.mcp_tools.observation_parser import _LOG_STORE
from app.mcp_tools.patterns import check_pattern_match
from app.mcp_tools.scoring import calculate_observation_rate, update_wellbeing_score
from app.mcp_tools.support import draft_talking_points, find_local_support


# --- Component builders ---------------------------------------------------


def _active_signals_for(person_id: str, today_window_days: int = 7) -> list[str]:
    """Human-readable signal chips for the DriftScoreCard.

    Returns the up-to-3 most recent distinct signal *labels* observed for
    this person in the recent window. Empty list = nothing currently
    contributing (calm). This is what answers the user's natural question:
    'why is Tom at 56?' — inline, no scroll required.
    """
    from app.mcp_tools.scoring import (
        CAREGIVER_DOMAIN_LABELS,
        COGNITIVE_DOMAIN_LABELS,
        PHYSICAL_DOMAIN_LABELS,
        today_for,
    )

    label_map = {
        "tom":   PHYSICAL_DOMAIN_LABELS,
        "helen": COGNITIVE_DOMAIN_LABELS,
        "sarah": CAREGIVER_DOMAIN_LABELS,
    }.get(person_id, {})
    today = today_for(person_id)
    cutoff = today - today_window_days

    entries = list(_LOG_STORE.get(person_id, []))
    # Most-recent first
    entries.sort(key=lambda e: e["day"], reverse=True)

    seen: list[str] = []
    for e in entries:
        if e["day"] < cutoff or e["day"] > today:
            continue
        for s in e.get("signals", []):
            label = label_map.get(s["signal"])
            if label and label not in seen:
                seen.append(label)
                if len(seen) >= 3:
                    return seen
    return seen


def _drift_card(person_id: str, score_result: dict) -> dict:
    """One DriftScoreCard for the dashboard's standing row."""
    person = PEOPLE[person_id]
    state = score_result["state"]
    color = score_result["color"]
    one_liners = {
        "green": "Calm and stable",
        "yellow": "Worth a glance",
        "amber": "Worth raising soon",
        "red": "Worth acting on now",
    }
    return {
        "type": "DriftScoreCard",
        "props": {
            "person_id": person_id,
            "display_name": person["display_name"],
            "age": person["age"],
            "lens": person["lens"],
            "lens_label": LENS_LABELS[person["lens"]],
            "score": score_result["wellbeing_score"],
            "color": color,
            "trend": "down" if state in ("amber", "red") else "flat",
            "one_liner": one_liners.get(state, "Tracking"),
            "last_updated": datetime.utcnow().isoformat(),
            "state": state,
            "raw_score_label": score_result["raw_score_label"],
            "instrument": score_result["instrument"],
            "active_signals": _active_signals_for(person_id),
        },
    }


def _signals_from_pattern(pattern_match: dict) -> list[dict]:
    """Pull the most recent matching observation entries to attach to the alert."""
    person_id = pattern_match["score_result"]["person_id"]
    entries = list(_LOG_STORE.get(person_id, []))
    relevant = [e for e in entries if e.get("signals")]
    relevant.sort(key=lambda e: e.get("day", 0), reverse=True)
    out: list[dict] = []
    for entry in relevant[:5]:
        signal_ids = ", ".join(s["signal"] for s in entry["signals"])
        out.append(
            {
                "day_label": f"Day {entry['day']}",
                "text": entry["raw_text"],
                "extracted_signal": signal_ids,
            }
        )
    return out


def _pattern_alert_card(pattern_match: dict) -> dict:
    """The crown-jewel card. Carries the verbatim instrument citation."""
    sr = pattern_match["score_result"]
    pattern_id = pattern_match["pattern_id"]
    return {
        "type": "PatternAlertCard",
        "props": {
            "person_id": sr["person_id"],
            "pattern_id": pattern_id,
            "severity_color": sr["color"],
            "title": pattern_match.get("title", "A pattern worth raising"),
            "why_it_matters": pattern_match["why_it_matters"],
            "signals": _signals_from_pattern(pattern_match),
            "suggested_actions": pattern_match["suggested_actions"],
            "disclaimer": DISCLAIMER,
            "citation": sr["citation"],
            "raw_score_label": sr["raw_score_label"],
            "rebuild_reason": sr.get("rebuild_reason") or "",
            "instrument": sr["instrument"],
        },
    }


def _talking_points_card(person_id: str, audience: str) -> dict:
    result = draft_talking_points(person_id, audience)
    return {
        "type": "TalkingPointsCard",
        "props": {
            "person_id": person_id,
            "title": f"What to share with {audience}",
            "audience": audience,
            "bullets": result["bullets"],
            "disclaimer": result["disclaimer"],
        },
    }


def _signal_timeline(person_id: str) -> dict:
    """Day-by-day strip of the last 14 days for one person."""
    entries = list(_LOG_STORE.get(person_id, []))
    by_day: dict[int, list[dict]] = {}
    for e in entries:
        by_day.setdefault(e["day"], []).extend(e.get("signals", []))
    days = []
    for d in range(1, 15):
        sigs = by_day.get(d, [])
        if not sigs:
            color = "gray"
            label = "—"
        else:
            max_sev = max(s["severity"] for s in sigs)
            color = {1: "yellow", 2: "amber", 3: "red"}.get(max_sev, "gray")
            label = f"{len(sigs)} signal" + ("s" if len(sigs) != 1 else "")
        days.append({"day": d, "color": color, "label": label})
    return {
        "type": "SignalTimeline",
        "props": {"person_id": person_id, "days": days},
    }


def _contributor_map(person_id: str = "helen") -> dict:
    """Helen-only: who saw what, when, from where (UC2 multi-observer beat)."""
    rate = calculate_observation_rate(person_id)
    entries = list(_LOG_STORE.get(person_id, []))
    cutoff = max((e["day"] for e in entries), default=14) - 7
    this_week = [e for e in entries if e["day"] > cutoff and e.get("signals")]
    where_lookup = {
        "tom": "Son · in town this weekend",
        "sarah": "Primary caregiver · home",
        "emma": "Granddaughter · weekly visit",
        "mrs_chen": "Neighbour · across the hall",
        "helen": "Self",
    }
    contributors = []
    for e in this_week:
        contributors.append(
            {
                "observer_id": e["observer"],
                "observer_display": e["observer"].replace("_", " ").title(),
                "observer_where": where_lookup.get(e["observer"], "Observer"),
                "day_label": f"Day {e['day']}",
                "note": e["raw_text"],
            }
        )
    return {
        "type": "ContributorMap",
        "props": {
            "person_id": person_id,
            "title": "What four different people noticed in seven days",
            "baseline_rate_per_month": rate["baseline_rate_per_month"],
            "this_week_count": rate["this_week_count"],
            "acceleration_factor": rate["acceleration_factor"],
            "contributors": contributors,
        },
    }


def _respite_card() -> dict:
    options = find_local_support("respite_care")
    return {
        "type": "RespiteOptionsCard",
        "props": {
            "person_id": "sarah",
            "title": "Respite options near you",
            "options": options,
            "note": "These are local options Sarah might want to consider \u2014 no commitment, just information.",
        },
    }


def _approval_prompt() -> dict:
    return {
        "type": "ApprovalPrompt",
        "props": {
            "prompt": "Want me to draft a message to your brother Mark asking for a weekend?",
            "draft_preview": (
                "Hey Mark — I'm running on fumes. Mom's getting harder to care for "
                "and Tom's not great either. Could you take her this weekend? "
                "Even one night would help. Love you."
            ),
            "approve_label": "Send draft to my Messages app",
            "edit_label": "Let me edit first",
            "decline_label": "Not yet",
        },
    }


def _quick_action(icon: str, title: str, description: str, cta: str, kind: str = "safe") -> dict:
    return {
        "type": "QuickActionCard",
        "props": {
            "icon": icon,
            "title": title,
            "description": description,
            "cta_label": cta,
            "cta_kind": kind,
        },
    }


def _triage_row(person_id: str, score_result: dict, pattern_match: dict | None) -> dict:
    person = PEOPLE[person_id]
    headline_lookup = {
        "tom": "Edema + missed med + 4 active symptom domains (HF Framework)",
        "helen": "9× her usual weekly observation activity (NPI drift)",
        "sarah": "Hopelessness phrase fired the validated ZBI override",
    }
    first_action = {
        "tom": "Call Tom's cardiologist with the 5 specific signals",
        "helen": "Document the contributor map for the neurologist visit",
        "sarah": "Open the respite-options card and decide one ask this week",
    }
    return {
        "person_id": person_id,
        "display_name": person["display_name"],
        "lens_label": LENS_LABELS[person["lens"]],
        "color": score_result["color"],
        "headline": headline_lookup.get(person_id, pattern_match.get("title", "Worth attention") if pattern_match else "Worth attention"),
        "recommended_first_action": first_action.get(person_id, "Review the alert card"),
    }


# --- Layout assemblers ---------------------------------------------------


def _meta(triggered_by: str | None, plan_version: int) -> dict:
    return {
        "family_id": "reynolds",
        "plan_version": plan_version,
        "triggered_by": triggered_by,
        "last_updated": datetime.utcnow().isoformat(),
    }


def _calm_dashboard(scores: dict[str, dict], plan_version: int, trigger: str | None) -> dict:
    return {
        "layout": "calm_dashboard",
        "components": [_drift_card(pid, scores[pid]) for pid in ("tom", "helen", "sarah")],
        "meta": _meta(trigger, plan_version),
    }


def _single_alert(
    scores: dict[str, dict],
    matches: dict[str, dict],
    person_id: str,
    plan_version: int,
    trigger: str | None,
) -> dict:
    components = [_drift_card(pid, scores[pid]) for pid in ("tom", "helen", "sarah")]
    components.append(_pattern_alert_card(matches[person_id]))
    audience = {"tom": "Tom's cardiologist", "helen": "Helen's neurologist", "sarah": "Sarah"}[person_id]
    components.append(_talking_points_card(person_id, audience))
    components.append(_signal_timeline(person_id))
    if person_id == "helen":
        components.append(_contributor_map("helen"))
    return {
        "layout": "single_alert",
        "components": components,
        "meta": _meta(trigger, plan_version),
    }


def _dual_risk(
    scores: dict[str, dict],
    matches: dict[str, dict],
    patient_id: str,
    plan_version: int,
    trigger: str | None,
) -> dict:
    """Sarah + one patient. Patient cards left, Sarah's burnout right."""
    left = [
        _drift_card(patient_id, scores[patient_id]),
        _pattern_alert_card(matches[patient_id]),
        _signal_timeline(patient_id),
    ]
    if patient_id == "helen":
        left.append(_contributor_map("helen"))
    right = [
        _drift_card("sarah", scores["sarah"]),
        _pattern_alert_card(matches["sarah"]),
        _respite_card(),
        _approval_prompt(),
    ]
    return {
        "layout": "dual_risk",
        "components": [],
        "slots": {"left_panel": left, "right_panel": right},
        "meta": _meta(trigger, plan_version),
    }


def _combined_triage(
    scores: dict[str, dict],
    matches: dict[str, dict],
    plan_version: int,
    trigger: str | None,
) -> dict:
    """All three crossed. Emit FULL evidence per person, grouped.

    Design principle: when stakes go up, evidence per person should ALSO
    go up — better organised, not stripped. The triage header gives an
    executive summary; each person then gets the same bundle they'd see
    in single_alert (drift card + alert + timeline + their support card).
    The frontend groups by person_id so the page reads as three coherent
    narratives, not one undifferentiated soup.
    """
    severity_order = {"red": 0, "amber": 1, "yellow": 2, "green": 3, "gray": 4}
    pids_by_urgency = sorted(matches.keys(), key=lambda p: severity_order[scores[p]["color"]])
    rows = [_triage_row(pid, scores[pid], matches.get(pid)) for pid in pids_by_urgency]
    triage = {
        "type": "CombinedTriageView",
        "props": {
            "title": "Three things asking for your attention right now",
            "rationale": (
                "Three patterns crossed at once. Each person's full evidence is below — "
                "score, what Anchor noticed, the timeline of recent signals, and the "
                "next step that actually moves the needle."
            ),
            "rows": rows,
            "disclaimer": DISCLAIMER,
        },
    }

    components: list[dict] = [triage]

    # All three drift cards together at the top — the situation overview.
    components.extend(_drift_card(pid, scores[pid]) for pid in ("tom", "helen", "sarah"))

    # Per-person evidence bundles, in urgency order. Each bundle = the same
    # depth single_alert would give: alert + timeline + the person's
    # domain-specific support card.
    audience_for = {
        "tom": "Tom's cardiologist",
        "helen": "Helen's neurologist",
        "sarah": "Sarah",
    }
    for pid in pids_by_urgency:
        components.append(_pattern_alert_card(matches[pid]))
        components.append(_signal_timeline(pid))
        if pid == "helen":
            components.append(_contributor_map("helen"))
        elif pid == "tom":
            components.append(_talking_points_card("tom", audience_for["tom"]))
        elif pid == "sarah":
            components.append(_respite_card())

    return {
        "layout": "combined_triage",
        "components": components,
        "meta": _meta(trigger, plan_version),
    }


# --- Public entry point ---------------------------------------------------


def build_plan(triggered_by: str | None = None, plan_version: int = 1) -> dict[str, Any]:
    """Inspect the current store, decide layout, return a fully-formed UIPlan dict."""
    scores: dict[str, dict] = {}
    matches: dict[str, dict] = {}
    for pid in ("tom", "helen", "sarah"):
        scores[pid] = update_wellbeing_score(pid)
        # Backfill the score with person_id for triage_row ergonomics
        scores[pid]["person_id"] = pid
        m = check_pattern_match(pid)
        if m and scores[pid]["rebuild_triggered"]:
            matches[pid] = m

    n = len(matches)
    if n == 0:
        return _calm_dashboard(scores, plan_version, triggered_by)
    if n >= 2:
        # Whether 2 or 3 patterns crossed: the user wants the SAME experience
        # — each person's full evidence in their own contained section. The
        # old dual_risk layout split the dashboard into two narrow columns,
        # which forced the wide DriftScoreCard to overflow its container.
        # combined_triage is the right tool for any multi-pattern view.
        return _combined_triage(scores, matches, plan_version, triggered_by)
    if n == 1:
        person_id = next(iter(matches))
        return _single_alert(scores, matches, person_id, plan_version, triggered_by)
    # n==2 with no Sarah → most urgent patient
    severity_order = {"red": 0, "amber": 1, "yellow": 2}
    person_id = sorted(matches.keys(), key=lambda p: severity_order.get(scores[p]["color"], 9))[0]
    return _single_alert(scores, matches, person_id, plan_version, triggered_by)


# Default fallback wellbeing-score computer (used only by tests/health probes)
def _ws(state: str) -> int:
    return state_to_wellbeing_score(state)
