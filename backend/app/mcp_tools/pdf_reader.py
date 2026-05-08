"""MCP tool: read_letter_pdf — parses landlord's deduction letter into structured charges.

v0.1: returns hardcoded mock data for Rita Sharma's demo case.
v1.0: real PDF parsing via pdfplumber.
"""
from __future__ import annotations

from typing import TypedDict


class Charge(TypedDict):
    type: str  # "paint" | "carpet_cleaning" | "cleaning" | "damage"
    amount: float
    room: str | None
    description: str


def read_letter_pdf(path: str) -> list[Charge]:
    """Parse landlord's deduction letter and return structured charges.

    MOCKED for v0.1 — returns Rita's case regardless of input path.
    """
    # TODO: real impl with pdfplumber once we have a real letter PDF
    return [
        {
            "type": "paint",
            "amount": 400.0,
            "room": "bedroom",
            "description": "Repaint bedroom walls due to scuff marks",
        },
        {
            "type": "carpet_cleaning",
            "amount": 600.0,
            "room": "living",
            "description": "Carpet cleaning and stretching, living room",
        },
        {
            "type": "cleaning",
            "amount": 250.0,
            "room": "kitchen",
            "description": "General kitchen deep cleaning",
        },
    ]


def read_lease_pdf(path: str) -> dict:
    """Parse lease and return key facts.

    MOCKED for v0.1 — returns Rita's lease facts.
    """
    return {
        "tenancy_months": 36,  # 3 years
        "deposit_amount": 2500.00,
        "monthly_rent": 3200.00,
        "signing_date": "2023-05-01",
        "address": "123 Mission St, Apt 4B, San Francisco, CA 94103",
        "tenant_name": "Rita Sharma",
        "landlord_name": "Bayview Properties LLC",
    }
