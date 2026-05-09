"""Pre-loaded demo data for Anchor.

The hackathon demo runs against a single fixed family — the Reynolds — and a
fixed timeline of observations. Real signal extraction + scoring is wired in
(the agent calls the parser + scoring tools), but for stage reliability we
pre-stage the observations so each trigger lands in the intended state band.

The demo "today" reference for each person:
  - Tom:   day 11 (post-discharge day 11)
  - Helen: day 6  (Saturday of the current week; baseline runs weeks 1-4 prior)
  - Sarah: day 14 (end of a 14-day rolling burden window)

See ANCHOR_SPEC.md §6.5 for the three peer-reviewed instruments behind the
scoring math.
"""
from __future__ import annotations

from typing import Literal

# --- The family ----------------------------------------------------------

People = Literal["tom", "helen", "sarah"]
Lens = Literal["body", "mind", "caregiver"]

PEOPLE: dict[People, dict] = {
    "tom": {
        "display_name": "Tom Reynolds",
        "age": 68,
        "lens": "body",
        "context": "Discharged 11 days ago after a cardiac event. On 7 medications.",
        "baseline_score": 90,
    },
    "helen": {
        "display_name": "Helen Reynolds",
        "age": 84,
        "lens": "mind",
        "context": "Tom's mother. Lives semi-independently 20 minutes away. Early-stage memory concerns.",
        "baseline_score": 80,
    },
    "sarah": {
        "display_name": "Sarah Reynolds",
        "age": 42,
        "lens": "caregiver",
        "context": "Tom's wife, sole caregiver for both Tom and Helen. Marketing manager.",
        "baseline_score": 85,
    },
}

# --- Pre-staged observation logs -----------------------------------------
# Each entry: (day, observer, raw_text). The parser runs at log time and
# attaches structured signals — text choices below are tuned so the
# instrument math lands in the intended state per the source frameworks.

# TOM — 11 days post-discharge. Pre-seeded entries from days 3 and 6 are
# OUTSIDE the 7-day rolling window (today=day 11, window=days 5..11) so they
# show up in the SignalTimeline narrative but don't count toward the live
# score. Day 6 (mild leg heaviness) and day 10 (missed med) are inside the
# window — total raw = 3/24 = GREEN at baseline. The day-11 trigger (the
# live demo appends it via /demo/uc1) fires three severity-3 signals which,
# combined with the day-10 missed-med, push the rolling total to AMBER and
# fires the framework's high-risk combo rule (edema + missed med, both ≥ moderate).
TOM_LOGS: list[tuple[int, str, str]] = [
    (3, "sarah", "Tom didn't finish dinner, said he wasn't hungry"),
    (6, "sarah", "He mentioned his legs feel a bit heavy"),
    # Day 8: fatigue (S2, emphatic "really"/"barely" → sev=3 = 3 pts).
    # Combined with day-6 edema (sev=1 = 1 pt) + day-10 missed med (sev=2 = 2 pts)
    # → raw 6/24 = YELLOW at baseline. No high-risk combo (S3 stays at sev=1).
    (8, "sarah", "Tom was really tired today, barely got off the couch"),
    (10, "sarah", "He forgot to take the evening blood thinner"),
]

# HELEN — only the 4-week prior baseline is pre-seeded. Week 0 (this week)
# is intentionally EMPTY at baseline → drift rate = 0% = GREEN.
# UC2 trigger fires 4 observations from 4 different observers in sequence,
# which under the NPI multi-observer aggregation rule jumps the weekly score
# from 0 → ~10/96 against a baseline of ~1.0/96 → drift > 50% → RED tier
# ("rapid acceleration"). This is the ContributorMap moment.
HELEN_LOGS: list[tuple[int, str, str]] = [
    # Week 4 baseline (days -28..-22) — one mild observation
    (-26, "sarah", "Helen forgot where she put her glasses"),
    # Week 3 baseline (days -21..-15) — one mild observation
    (-18, "tom", "Mom seemed a little slow today but fine"),
    # Week 2 baseline (days -14..-8)
    (-12, "emma", "Grandma told the same story twice"),
    # Week 1 baseline (days -7..-1)
    (-4, "sarah", "She forgot where she put her keys, found them quickly"),
    # Week 0 (current week, days 0-6, today=6) — three mild observations
    # that push this-week NPI score to ~7, drift = (7-6)/6*100 = 16.7% = YELLOW.
    # UC2 trigger then fires 4 more observations → RED (rapid acceleration).
    (1, "sarah", "Helen told me the same story twice today"),
    (3, "emma", "She asked me what day it was when I called"),
    (5, "sarah", "She seemed a bit withdrawn today, sat alone most of the morning"),
]

# SARAH — 14-day rolling window. Cumulative ZBI score normalises low (~6/100,
# GREEN), but the day-14 hopelessness phrase fires the validated Z10 override
# → AMBER minimum + rebuild. This is the pitch moment: "the average says she's
# fine; the validated override says watch carefully."
SARAH_LOGS: list[tuple[int, str, str]] = [
    (4, "sarah", "So exhausted today, couldn't sleep worrying about Tom"),
    (7, "sarah", "Snapped at him this morning, feel terrible about it"),
    (9, "sarah", "Haven't eaten properly in days, no time"),
    (12, "sarah", "I feel like I'm drowning and nobody is helping"),
    # Day 14 trigger (the hopelessness note) is the live trigger.
]

OBSERVERS = {
    "sarah": {"display": "Sarah (wife / primary caregiver)", "where": "Home"},
    "tom": {"display": "Tom (son, visits Helen)", "where": "From across town"},
    "emma": {"display": "Emma (granddaughter, age 19)", "where": "From college"},
    "mrs_chen": {"display": "Mrs. Chen (Helen's neighbour)", "where": "Next door"},
}

# --- Pattern definitions (lens-keyed; one per instrument) ----------------
# Triggered downstream of the scoring engine — see app.mcp_tools.patterns.
# Each carries its instrument citation so the alert card surfaces the source.

PATTERNS: dict[str, dict] = {
    "post_discharge_decline": {
        "lens": "body",
        "instrument": "physical_drift",
        "title": "A pattern worth raising with Tom's cardiologist",
        "why_it_matters": (
            "Reduced appetite, leg swelling, and a missed anticoagulant dose appearing "
            "together in the days after a cardiac discharge is one of the symptom "
            "combinations the Heart Failure Symptom Monitoring Framework specifically "
            "flags for follow-up. It does not mean anything is wrong — but it is the "
            "exact pattern Tom's care team would want to know about."
        ),
        "citation": (
            "Heart Failure Symptom Monitoring Framework, Georgetown / NIH (PMC9070923). "
            "8 validated symptom domains, severity-weighted, 7-day rolling window."
        ),
        "suggested_actions": [
            "Mention all the recent observations at Tom's next cardiology visit (talking points ready below)",
            "Confirm the blood thinner schedule is still on track",
            "Ask whether to weigh Tom daily until the next appointment",
        ],
    },
    "cognitive_acceleration": {
        "lens": "mind",
        "instrument": "cognitive_drift",
        "title": "Helen's pattern has accelerated this week",
        "why_it_matters": (
            "Across the past 4 weeks, Helen's family logged about 1 noticeable moment "
            "per week — mild, short, isolated. This week alone, 4 different people "
            "noticed something across 4 different NPI domains: memory repetition, "
            "disorientation about the year, and a safety concern with the stove. "
            "What's worth flagging isn't any single moment — it's the rate of change "
            "compared to her usual baseline."
        ),
        "citation": (
            "Neuropsychiatric Inventory (NPI; Cummings et al.). Multi-observer "
            "aggregation per week (max-domain across observers), drift rate vs "
            "4-week baseline drives state."
        ),
        "suggested_actions": [
            "Document the 4 observations with dates + observers to bring to Helen's next neurology appointment",
            "Add a stove-safety check to the home (timer or auto-shutoff)",
            "Consider whether a care-level reassessment makes sense",
        ],
    },
    "caregiver_burnout": {
        "lens": "caregiver",
        "instrument": "caregiver_burden",
        "title": "Sarah's wellbeing pattern crossed a validated threshold",
        "why_it_matters": (
            "Across 14 days, Sarah's private notes show sleep disruption, emotional "
            "exhaustion, self-neglect, isolation, and a final note saying she doesn't "
            "know how much longer she can continue. Her overall ZBI score is still low "
            "— she's coping on the surface. But that final phrase crossed the validated "
            "ZBI hopelessness item, which the literature treats as an early indicator "
            "of caregiver depression on its own. We're surfacing this because of that "
            "one signal, not because of an average."
        ),
        "citation": (
            "Zarit Burden Interview, 12-item version (ZBI-12; PMC6497029). "
            "14-day cumulative score with the hopelessness item (Z10) as a validated "
            "single-signal safety override (Hébert et al. 2000)."
        ),
        "suggested_actions": [
            "Reach out for respite care — even one weekend off matters",
            "Loop in family backup (a draft message to Sarah's brother is ready)",
            "Consider a local caregiver support group",
        ],
    },
}

# --- Local support resources (mocked but realistic SF/Bay Area) ----------

LOCAL_SUPPORT: dict[str, list[dict]] = {
    "respite_care": [
        {"name": "Family Caregiver Alliance", "kind": "Respite voucher program", "phone": "(800) 445-8106", "distance_mi": 0},
        {"name": "Home Instead — San Francisco", "kind": "In-home respite, 4-hr minimum", "phone": "(415) 351-3010", "distance_mi": 2.1},
        {"name": "AlzCare Day Program", "kind": "Adult day program (Helen-appropriate)", "phone": "(415) 750-4111", "distance_mi": 3.4},
    ],
    "support_group": [
        {"name": "SF Caregiver Coalition — Tuesday evenings", "kind": "Peer support group", "phone": "(415) 750-4111", "distance_mi": 1.8},
        {"name": "AARP Family Caregiving Online Community", "kind": "Online, 24/7", "phone": None, "distance_mi": 0},
    ],
    "doctor_followup": [
        {"name": "UCSF Cardiology — Dr. Patel", "kind": "Tom's cardiologist, next opening Tue 2pm", "phone": "(415) 353-2873", "distance_mi": 0},
    ],
}

# --- Demo trigger sequence -----------------------------------------------
# The four buttons / steps in the live demo, in order. Each `raw_text` is the
# observation appended by the trigger to push the rolling-window math into
# the intended state band per the source instruments.

TRIGGER_SEQUENCE = [
    {
        "id": "uc1",
        "label": "Use Case 1: Sarah texts about Tom's swelling",
        "person": "tom",
        "observer": "sarah",
        "day": 11,
        "raw_text": "Tom's ankles are really swollen today and he barely ate anything — he just doesn't seem himself",
        "expected_layout": "single_alert",
    },
    {
        "id": "uc2",
        "label": "Use Case 2: Four observers cross-reference within 24 hours",
        "person": "helen",
        # UC2 is the multi-observer beat — the agent ingests 4 notes in sequence
        # to demonstrate NPI's multi-observer aggregation. The sub-list runs in
        # order; the rebuild check happens after all 4 are logged.
        "observations": [
            {"observer": "tom", "day": 0, "raw_text": "Mom seemed fine, a bit forgetful when I visited Sunday"},
            {"observer": "sarah", "day": 3, "raw_text": "She asked me the same question about dinner four times in one hour"},
            {"observer": "emma", "day": 5, "raw_text": "She thought it was 1987 when I called from college"},
            {"observer": "mrs_chen", "day": 6, "raw_text": "Helen left the stove on twice this week"},
        ],
        # Convenience: the headline trigger note (the one shown to the audience)
        "observer": "mrs_chen",
        "day": 6,
        "raw_text": "Helen left the stove on twice this week",
        "expected_layout": "single_alert",
    },
    {
        "id": "uc3",
        "label": "Use Case 3: Sarah's private note crosses the hopelessness threshold",
        "person": "sarah",
        "observer": "sarah",
        "day": 14,
        "raw_text": "I really don't know how much longer I can do this",
        "expected_layout": "dual_risk",
    },
    {
        "id": "combined",
        "label": "Combined Triage View — all three at risk",
        "person": None,
        "observer": None,
        "day": None,
        "raw_text": None,
        "expected_layout": "combined_triage",
    },
]
