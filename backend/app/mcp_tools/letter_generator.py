"""MCP tool: generate_demand_letter — renders the legal demand letter PDF.

v0.1: stub that returns a placeholder path.
v1.0: real PDF generation via ReportLab with state-specific templates.
"""
from __future__ import annotations

from pathlib import Path
from typing import Literal, TypedDict

State = Literal["CA", "TX"]


class LetterResult(TypedDict):
    pdf_path: str
    amount: float


def generate_demand_letter(
    state: State,
    charges_to_dispute: list[dict],
    tenant_facts: dict,
    output_dir: str = "/tmp/rentproof",
) -> LetterResult:
    """Generate a state-specific demand letter PDF.

    STUBBED for v0.1 — returns a placeholder path. Real impl uses ReportLab.
    """
    # TODO: real impl with ReportLab + state templates
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    placeholder_path = Path(output_dir) / "demand_letter.pdf"

    total_disputed = sum(c["amount"] for c in charges_to_dispute)

    return {
        "pdf_path": str(placeholder_path),
        "amount": total_disputed,
    }
