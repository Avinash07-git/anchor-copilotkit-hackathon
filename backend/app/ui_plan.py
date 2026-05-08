"""UI Plan models — the contract between agent and frontend.

The agent emits a UIPlan; the React renderer interprets it and mounts the
right A2UI components. See ARCHITECTURE.md §6 for the full schema.
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
    on_click: str | None = None


class FloorPlanProps(BaseModel):
    width: int = 600
    height: int = 400
    rooms: list[FloorPlanRoom]


class RoomCardProps(BaseModel):
    room_id: str
    charge_label: str
    verdict: Literal["illegal", "ambiguous", "fair"]
    one_liner: str


class LawCitationProps(BaseModel):
    statute: str
    quote: str
    plain_english: str
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


# --- Component envelope -----------------------------------------------------


class Component(BaseModel):
    """A single A2UI-renderable component instance."""

    type: Literal[
        "ConfidenceMeter",
        "FloorPlan",
        "RoomCard",
        "LawCitation",
        "EvidenceChecklist",
        "DemandLetterPreview",
    ]
    props: dict  # Validated against the per-type model in the renderer


class UIPlanMeta(BaseModel):
    case_id: str
    state: Literal["CA", "TX"]
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class UIPlan(BaseModel):
    """Top-level plan emitted by the agent. Frontend renders accordingly."""

    layout: Literal["evidence_room"] = "evidence_room"
    components: list[Component]
    meta: UIPlanMeta
