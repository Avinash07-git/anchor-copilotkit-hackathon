"""Pre-loaded demo data for Bedside.

The hackathon demo runs against a single fixed family — the Reynolds — and a
fixed timeline of observations. Real NLP is wired in (the agent does call the
parser tool), but for stage reliability we pre-stage the observations so the
trigger sequence is deterministic. See BEDSIDE_SPEC.md §9.
"""
from __future__ import annotations

from typing import Literal

# --- The family ------------------------------------------------------------

People = Literal["tom", "helen", "sarah"]
Lens = Literal["body", "mind", "caregiver"]

PEOPLE: dict[People, dict] = {
    "tom": {
        "display_name": "Tom Reynolds",
        "age": 68,
        "lens": "body",
        "context": "Discharged 11 days ago after a cardiac event. On 7 medications.",
        "baseline_score": 82,  # green-ish; healthy-leaning baseline
    },
    "helen": {
        "display_name": "Helen Reynolds",
        "age": 84,
        "lens": "mind",
        "context": "Tom's mother. Lives semi-independently 20 minutes away. Early-stage memory concerns.",
        "baseline_score": 68,  # amber baseline (early dementia)
    },
    "sarah": {
        "display_name": "Sarah Reynolds",
        "age": 42,
        "lens": "caregiver",
        "context": "Tom's wife, sole caregiver for both Tom and Helen. Marketing manager.",
        "baseline_score": 78,  # green baseline; she presents OK on the surface
    },
}

# --- Pre-staged observation logs ------------------------------------------
# Each entry: (day, observer, raw_text)

TOM_LOGS: list[tuple[int, str, str]] = [
    (3, "sarah", "Tom didn't finish dinner, said he wasn't hungry"),
    (6, "sarah", "He mentioned his legs feel a bit heavy"),
    (8, "sarah", "Skipped dinner again. Said he was tired"),
    (10, "sarah", "He forgot to take the evening blood thinner"),
    (11, "sarah", "Legs look a little swollen to me"),  # ⬅︎ trigger signal
]

HELEN_LOGS: list[tuple[int, str, str]] = [
    # Baseline (3 months prior, ~1-2 obs/month — calm rate)
    (-90, "sarah", "Helen forgot where she put her glasses"),
    (-65, "tom", "Mom seemed a little slow today but fine"),
    (-30, "emma", "Grandma told the same story twice"),
    # This week — 4 observers, 4 observations in 7 days = ~3x acceleration
    (0, "tom", "Mom seemed fine, a bit forgetful"),  # Sunday
    (3, "sarah", "She asked me the same question four times"),  # Wednesday
    (5, "emma", "She couldn't remember what year it was"),  # Friday
    (6, "mrs_chen", "Helen left the stove on twice this week"),  # Saturday ⬅︎ trigger
]

SARAH_LOGS: list[tuple[int, str, str]] = [
    (4, "sarah", "So exhausted today, couldn't sleep worrying about Tom"),
    (7, "sarah", "Snapped at him this morning, feel terrible about it"),
    (9, "sarah", "Haven't eaten properly in days, no time"),
    (12, "sarah", "I feel like I'm drowning and nobody is helping"),
    (14, "sarah", "I don't know how much longer I can do this"),  # ⬅︎ trigger
]

OBSERVERS = {
    "sarah": {"display": "Sarah (wife / primary caregiver)", "where": "Home"},
    "tom": {"display": "Tom (son, visits Helen)", "where": "From across town"},
    "emma": {"display": "Emma (granddaughter, age 19)", "where": "From college"},
    "mrs_chen": {"display": "Mrs. Chen (Helen's neighbour)", "where": "Next door"},
}

# --- Known patterns the agent can match against ---------------------------
# Stored as observational signal-combinations + a why-it-matters paragraph
# in safer-language phrasing. NO clinical claims.

PATTERNS: dict[str, dict] = {
    "post_discharge_decline": {
        "lens": "body",
        "signals_required": ["appetite_decrease", "leg_swelling", "missed_medication"],
        "title": "A pattern worth raising with Tom's cardiologist",
        "why_it_matters": (
            "Reduced appetite, leg swelling, and a missed anticoagulant dose appearing "
            "together in the days after a cardiac discharge is a combination commonly "
            "discussed in post-discharge follow-up. It does not mean anything is wrong — "
            "but it is the exact pattern Tom's care team would want to know about."
        ),
        "suggested_actions": [
            "Mention all 5 observations at Tom's next cardiology visit (talking points ready below)",
            "Confirm the blood thinner schedule is still on track",
            "Ask whether to weigh Tom daily until the next appointment",
        ],
    },
    "cognitive_acceleration": {
        "lens": "mind",
        "signals_required": ["memory_lapse", "disorientation", "safety_concern"],
        "title": "Helen's observation rate has accelerated this week",
        "why_it_matters": (
            "Across the past 3 months, Helen's family logged about 1-2 noticeable "
            "moments per month. This week alone, 4 different people noticed something — "
            "memory lapses, disorientation about the date, and a safety concern with the "
            "stove. The rate of change is what's worth flagging, more than any single moment."
        ),
        "suggested_actions": [
            "Document the 4 observations to bring to Helen's next neurology appointment",
            "Add a stove-safety check to the home (timer or auto-shutoff)",
            "Consider whether a care-level reassessment makes sense",
        ],
    },
    "caregiver_burnout": {
        "lens": "caregiver",
        "signals_required": ["sleep_disruption", "emotional_exhaustion", "self_neglect", "isolation", "hopelessness"],
        "title": "Sarah's wellbeing pattern has crossed a threshold",
        "why_it_matters": (
            "Across 14 days, Sarah's private notes show sleep disruption, emotional "
            "exhaustion, self-neglect, isolation, and a final note expressing she "
            "doesn't know how much longer she can continue. Each note alone could be "
            "venting — together they describe a caregiver-burnout trajectory. When the "
            "primary caregiver is at risk, the patient is too."
        ),
        "suggested_actions": [
            "Reach out for respite care — even one weekend off matters",
            "Loop in family backup (a draft message to Sarah's brother is ready)",
            "Consider a local caregiver support group",
        ],
    },
}

# --- Local support resources (mocked but realistic SF/Bay Area) -----------

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

# --- Demo trigger sequence ------------------------------------------------
# The four buttons / steps in the live demo, in order.

TRIGGER_SEQUENCE = [
    {
        "id": "uc1",
        "label": "Use Case 1: Sarah texts about Tom's swelling",
        "person": "tom",
        "raw_text": "Tom's ankles look swollen and he skipped dinner again",
        "expected_layout": "single_alert",
    },
    {
        "id": "uc2",
        "label": "Use Case 2: Mrs. Chen texts about the stove",
        "person": "helen",
        "raw_text": "Helen left the stove on twice this week",
        "expected_layout": "single_alert",
    },
    {
        "id": "uc3",
        "label": "Use Case 3: Sarah's private note crosses the threshold",
        "person": "sarah",
        "raw_text": "I don't know how much longer I can do this",
        "expected_layout": "dual_risk",
    },
    {
        "id": "combined",
        "label": "Combined Triage View — all three at risk",
        "person": None,
        "raw_text": None,
        "expected_layout": "combined_triage",
    },
]
