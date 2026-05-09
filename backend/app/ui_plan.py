"""UI Plan models — the contract between the Bedside agent and the React renderer.

The agent emits a UIPlan (JSON); the frontend interprets it and mounts the
right A2UI components inside the chosen layout. See ANCHOR_SPEC.md §6 + §7.

Every user-facing string in here must obey the safer-language rules in
`app.data.language_rules`. No clinical claims, no prescriptive language.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# --- Common types ----------------------------------------------------------

Lens = Literal["body", "mind", "caregiver"]
Color = Literal["green", "yellow", "amber", "red", "gray"]
LayoutKind = Literal["calm_dashboard", "single_alert", "dual_risk", "combined_triage"]


# --- Component prop models -------------------------------------------------


class DriftScoreCardProps(BaseModel):
    """One per person. Always visible in some layout."""

    person_id: Literal["tom", "helen", "sarah"]
    display_name: str
    age: int
    lens: Lens
    lens_label: str  # human-readable lens, e.g. "Physical wellbeing"
    score: int = Field(..., ge=0, le=100)
    color: Color
    trend: Literal["up", "down", "flat"] = "flat"
    one_liner: str  # very short caption ("Calm and stable" / "Worth watching")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    # New post-scoring-engine fields:
    state: Literal["green", "yellow", "amber", "red"] = "green"
    raw_score_label: str = ""  # instrument-native, e.g. "11 / 24"
    instrument: str = ""  # which instrument computed this
    # Inline 'what's contributing' chips so the answer to 'why is X at this
    # score?' is visible without scrolling. Each chip = one human-readable
    # signal label (e.g. 'Edema', 'Memory repetition', 'Sleep disruption').
    active_signals: list[str] = Field(default_factory=list)
    # Real per-day wellbeing score for the sparkline. Last entry == today.
    # Computed by re-running the instrument with `today=d` for d in the
    # 14-day window — NOT a cosmetic wobble. If empty, frontend may fall
    # back to a synthetic curve, but production should always populate this.
    score_history: list[float] = Field(default_factory=list)


class SignalEntry(BaseModel):
    day_label: str  # "Day 3" or "Wed Apr 30"
    text: str  # Sarah's original observation, verbatim
    extracted_signal: str  # the parsed structured signal


class PatternAlertCardProps(BaseModel):
    """Appears when a wellbeing pattern crosses a threshold."""

    person_id: Literal["tom", "helen", "sarah"]
    pattern_id: str
    severity_color: Color  # mirrors the score band
    title: str  # safer-language title, e.g. "A pattern worth raising with Tom's cardiologist"
    why_it_matters: str  # one paragraph, observational language only
    signals: list[SignalEntry]
    suggested_actions: list[str]
    disclaimer: str  # mandatory safer-language disclaimer
    # New, post-scoring-engine fields:
    citation: str = ""  # peer-reviewed instrument citation (always shown)
    raw_score_label: str = ""  # e.g. "11 / 24" or "42 / 100 (14-day)"
    rebuild_reason: str = ""  # plain-English summary of why rebuild fired
    instrument: str = ""  # "physical_drift" | "cognitive_drift" | "caregiver_burden"


class ContributorEntry(BaseModel):
    observer_id: str
    observer_display: str  # "Sarah (wife / primary caregiver)"
    observer_where: str  # "Home" / "From college" / "Next door"
    day_label: str
    note: str


class ContributorMapProps(BaseModel):
    """UC2: visual of who observed what across the family."""

    person_id: Literal["helen"]  # only used for cognitive lens in v1
    title: str = "Who noticed what — this week"
    baseline_rate_per_month: float
    this_week_count: int
    acceleration_factor: float  # e.g. 3.0 means ~3x baseline
    contributors: list[ContributorEntry]


class TalkingPointsCardProps(BaseModel):
    person_id: Literal["tom", "helen", "sarah"] = "tom"
    title: str = "Talking points for your next visit"
    audience: str  # "Tom's cardiologist" / "Helen's neurologist"
    bullets: list[str]
    disclaimer: str


class SupportOption(BaseModel):
    name: str
    kind: str
    phone: str | None = None
    distance_mi: float = 0.0


class RespiteOptionsCardProps(BaseModel):
    person_id: Literal["sarah"] = "sarah"
    title: str = "Local options for a break"
    options: list[SupportOption]
    note: str = "Even one weekend off can reset the stress curve."


class SignalTimelineProps(BaseModel):
    """Small day-by-day strip for a single person."""

    person_id: Literal["tom", "helen", "sarah"]
    days: list[dict]  # [{"day": 3, "color": "yellow", "label": "appetite"}, ...]


class QuickActionCardProps(BaseModel):
    """Generic action card — book appt, message family member, open checklist."""

    icon: Literal["phone", "message", "calendar", "checklist", "info"] = "info"
    title: str
    description: str
    cta_label: str
    cta_kind: Literal["safe", "needs_approval"] = "safe"


class ApprovalPromptProps(BaseModel):
    """HITL — the AG-UI human-in-loop moment."""

    prompt: str  # "Should I send this draft to your brother asking for weekend backup?"
    draft_preview: str  # the actual message
    approve_label: str = "Send it"
    edit_label: str = "Let me edit first"
    decline_label: str = "Not now"


class TriageRow(BaseModel):
    person_id: Literal["tom", "helen", "sarah"]
    display_name: str
    lens_label: str
    color: Color
    headline: str  # one-line summary of why they're on the triage list
    recommended_first_action: str  # the agent's pick for the next 24h


class CombinedTriageViewProps(BaseModel):
    """The climax. Agent-prioritized triage of all three risks."""

    title: str = "All three need attention — here's the triage"
    rationale: str  # one sentence: why this view exists right now
    rows: list[TriageRow]  # ordered by agent's chosen priority
    disclaimer: str


# --- Component envelope ----------------------------------------------------


ComponentType = Literal[
    "DriftScoreCard",
    "PatternAlertCard",
    "ContributorMap",
    "TalkingPointsCard",
    "RespiteOptionsCard",
    "SignalTimeline",
    "QuickActionCard",
    "ApprovalPrompt",
    "CombinedTriageView",
]


class Component(BaseModel):
    """A single A2UI-renderable component instance."""

    type: ComponentType
    # Validated against the per-type model in the renderer + a runtime check
    # in the FastAPI layer before it's streamed to the frontend.
    props: dict


# --- Layout wrappers -------------------------------------------------------


class DualRiskSlots(BaseModel):
    """For dual_risk layout: which components go where."""

    left_panel: list[Component]
    right_panel: list[Component]


# --- Top-level UIPlan ------------------------------------------------------


class UIPlanMeta(BaseModel):
    """Loose meta-bag — extra keys allowed so the agent / orchestrator can
    stash debugging data (e.g. ``fallback_reason``) without a schema bump.
    """

    model_config = {"extra": "allow"}

    family_id: str = "reynolds"
    plan_version: int = 1  # increments on each agent re-emit; UIPlanInspector uses this
    triggered_by: str | None = None  # e.g. "uc1" / "uc3" / "combined"
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class UIPlan(BaseModel):
    """Top-level plan emitted by the agent. Frontend renders accordingly.

    The layout field tells the renderer which top-level wrapper to mount;
    components is the flat list of cards to render inside that wrapper. For
    dual_risk, slots overrides components and assigns to left/right panels.
    """

    layout: LayoutKind
    components: list[Component] = Field(default_factory=list)
    slots: DualRiskSlots | None = None  # only used when layout == "dual_risk"
    meta: UIPlanMeta
