"""UI Plan models — the contract between agent and frontend.

The agent emits a UIPlan; the React renderer interprets it and mounts the
right A2UI components. See ARCHITECTURE.md §6 for the full schema.

Verdicts are intentionally framed as actionable advice for the renter, NOT
as legal conclusions:
  - worth_challenging  → renter has a defensible argument to push back
  - needs_more_proof   → could go either way; gather the listed evidence
  - likely_reasonable  → deduction looks fair; renter probably shouldn't contest
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# --- Component prop models --------------------------------------------------


class ConfidenceMeterProps(BaseModel):
    score: int = Field(..., ge=0, le=100)
    label: str = "Case strength"
    color: Literal["green", "yellow", "red"] | None = None


class FloorPlanRoom(BaseModel):
    id: str
    label: str
    shape: Literal["rect"] = "rect"
    x: int
    y: int
    w: int
    h: int
    color: Literal["green", "yellow", "red", "gray"]
    photo_thumbs: list[str] = Field(default_factory=list)
    accepts_drop: bool = True
    on_click: str | None = None


class FloorPlanProps(BaseModel):
    width: int = 600
    height: int = 400
    rooms: list[FloorPlanRoom]


class BulkPhotoBinClassified(BaseModel):
    file_id: str
    thumb_url: str
    room_label: str
    phase: Literal["movein", "moveout", "unknown"]
    confidence: float = Field(..., ge=0.0, le=1.0)


class BulkPhotoBinPending(BaseModel):
    file_id: str
    thumb_url: str


class BulkPhotoBinProps(BaseModel):
    title: str = "Drag your photos here — we'll figure out which room"
    accepts: list[str] = Field(default_factory=lambda: ["image/jpeg", "image/png", "image/heic"])
    classified: list[BulkPhotoBinClassified] = Field(default_factory=list)
    pending: list[BulkPhotoBinPending] = Field(default_factory=list)


# Verdicts: framed as actionable advice, not legal conclusions.
Verdict = Literal["worth_challenging", "needs_more_proof", "likely_reasonable"]


class RoomCardProps(BaseModel):
    room_id: str
    charge_label: str
    verdict: Verdict
    one_liner: str


class LawCitationProps(BaseModel):
    statute: str
    quote: str
    plain_english: str
    why_worth_challenging: str  # case-specific reasoning, not a flat legal claim
    applies_to_room: str


class EvidenceChecklistItem(BaseModel):
    text: str
    checked: bool = False


class EvidenceChecklistProps(BaseModel):
    title: str = "To strengthen your case, gather:"
    items: list[EvidenceChecklistItem]


class DemandLetterPreviewProps(BaseModel):
    pdf_url: str
    amount_disputed: float
    state: Literal["CA", "TX"]
    requires_approval: bool = True
    actions: list[Literal["approve", "edit", "download"]] = ["approve", "edit"]
    disclaimer: str = (
        "This is a draft prepared with automated tools. It is not legal advice. "
        "Confirm with a tenant-rights attorney before filing in court."
    )


# --- Component envelope -----------------------------------------------------


class Component(BaseModel):
    """A single A2UI-renderable component instance."""

    type: Literal[
        "ConfidenceMeter",
        "FloorPlan",
        "BulkPhotoBin",
        "RoomCard",
        "LawCitation",
        "EvidenceChecklist",
        "DemandLetterPreview",
    ]
    props: dict  # Validated against the per-type model in the renderer


class UIPlanMeta(BaseModel):
    case_id: str
    state: Literal["CA", "TX"]
    plan_version: int = 1  # increments on each agent re-emit; UIPlanInspector uses this
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class UIPlan(BaseModel):
    """Top-level plan emitted by the agent. Frontend renders accordingly."""

    layout: Literal["evidence_room"] = "evidence_room"
    components: list[Component]
    meta: UIPlanMeta
