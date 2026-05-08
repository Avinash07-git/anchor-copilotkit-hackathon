"""MCP tool: lookup_state_law — returns relevant statute text for a (state, dispute_type).

Reads from the markdown statute files in app/data/ (CA §1950.5, TX §92.104).
This is a real implementation — no LLM call, just structured retrieval.
"""
from __future__ import annotations

from pathlib import Path
from typing import Literal, TypedDict

DATA_DIR = Path(__file__).parent.parent / "data"

State = Literal["CA", "TX"]
DisputeType = Literal["paint", "carpet_cleaning", "cleaning", "damage"]


class StatuteResult(TypedDict):
    statute_id: str
    statute_text: str
    plain_english_rule: str


# Compact rule registry — the agent uses this to derive verdicts.
# Full statute text lives in the data/*.md files for the LawCitation component.
_RULES: dict[tuple[State, DisputeType], StatuteResult] = {
    ("CA", "paint"): {
        "statute_id": "California Civil Code §1950.5",
        "statute_text": (
            "The repair of damages to the premises, exclusive of ordinary wear and tear, "
            "caused by the tenant or by a guest or licensee of the tenant."
        ),
        "plain_english_rule": (
            "California lets a landlord deduct for damage beyond ordinary wear and tear. "
            "Repainting due to fading or normal use after a multi-year tenancy is often "
            "treated as ordinary wear and tear and is worth challenging. Painting to repair "
            "tenant-caused damage (large holes, smoke, unauthorized colors) is generally "
            "chargeable."
        ),
    },
    ("CA", "carpet_cleaning"): {
        "statute_id": "California Civil Code §1950.5",
        "statute_text": (
            "The cleaning of the premises upon termination of the tenancy necessary to "
            "return the unit to the same level of cleanliness it was in at the inception "
            "of the tenancy."
        ),
        "plain_english_rule": (
            "Routine end-of-tenancy carpet cleaning is generally not deductible if the "
            "carpet was clean at move-in and the tenant returned it in similar condition. "
            "Move-in photos or a cleaning receipt strengthen the renter's case."
        ),
    },
    ("CA", "cleaning"): {
        "statute_id": "California Civil Code §1950.5",
        "statute_text": (
            "The cleaning of the premises upon termination of the tenancy necessary to "
            "return the unit to the same level of cleanliness it was in at the inception "
            "of the tenancy."
        ),
        "plain_english_rule": (
            "A landlord can only charge cleaning needed to restore move-in cleanliness. "
            "If the tenant left the unit broom-clean, the deduction is worth challenging."
        ),
    },
    ("CA", "damage"): {
        "statute_id": "California Civil Code §1950.5",
        "statute_text": (
            "The repair of damages to the premises, exclusive of ordinary wear and tear, "
            "caused by the tenant or by a guest or licensee of the tenant."
        ),
        "plain_english_rule": (
            "A tenant pays only for damage beyond ordinary wear, generally prorated for "
            "the useful life of the item. Charging full replacement cost for an item past "
            "its expected useful life is worth challenging."
        ),
    },
    ("TX", "paint"): {
        "statute_id": "Texas Property Code §92.104(b)",
        "statute_text": (
            "The landlord may not retain any portion of a security deposit to cover "
            "normal wear and tear."
        ),
        "plain_english_rule": (
            "Texas does not have a bright-line tenancy threshold like California. "
            "Painting due to fading or age is generally normal wear; painting to repair "
            "tenant-caused damage is generally chargeable. Long tenancy + only fading is "
            "worth challenging."
        ),
    },
    ("TX", "carpet_cleaning"): {
        "statute_id": "Texas Property Code §92.104(a)",
        "statute_text": (
            "Before returning a security deposit, the landlord may deduct from the deposit "
            "damages and charges for which the tenant is legally liable under the lease."
        ),
        "plain_english_rule": (
            "Texas leases often include carpet-cleaning clauses, which are generally "
            "enforceable if reasonable. Without an explicit clause, routine cleaning is "
            "more often the landlord's responsibility."
        ),
    },
    ("TX", "cleaning"): {
        "statute_id": "Texas Property Code §92.104(c)",
        "statute_text": (
            "If the landlord retains all or part of the deposit, the landlord shall give "
            "to the tenant the balance of the deposit, if any, together with a written "
            "description and itemized list of all deductions."
        ),
        "plain_english_rule": (
            "Cleaning fees are generally enforceable if reasonable and itemized. A flat "
            "fee with no itemization needs more proof; the renter can request the "
            "itemized statement."
        ),
    },
    ("TX", "damage"): {
        "statute_id": "Texas Property Code §92.109",
        "statute_text": (
            "A landlord who in bad faith retains a security deposit in violation of this "
            "subchapter is liable for an amount equal to the sum of $100, three times the "
            "portion of the deposit wrongfully withheld, and the tenant's reasonable "
            "attorney's fees."
        ),
        "plain_english_rule": (
            "A tenant is liable for damage beyond normal wear, but the landlord must "
            "provide an itemized list within 30 days. Failure to do so may forfeit the "
            "right to deduct — worth challenging."
        ),
    },
}


def lookup_state_law(state: State, dispute_type: DisputeType) -> StatuteResult:
    """Return the statute snippet + plain-English rule for a state + dispute type."""
    key = (state, dispute_type)
    if key not in _RULES:
        raise ValueError(f"No rule for state={state}, dispute_type={dispute_type}")
    return _RULES[key].copy()
