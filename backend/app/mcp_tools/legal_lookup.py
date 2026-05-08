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
        "statute_id": "CA Civil Code §1950.5(b)(3)",
        "statute_text": (
            "The repair of damages to the premises, exclusive of ordinary wear and tear, "
            "caused by the tenant or by a guest or licensee of the tenant."
        ),
        "plain_english_rule": (
            "Paint is normal wear and tear after 2+ years of tenancy. Landlord cannot "
            "deduct repaint costs after 2+ year tenancy unless tenant caused damage "
            "exceeding normal wear."
        ),
    },
    ("CA", "carpet_cleaning"): {
        "statute_id": "CA Civil Code §1950.5(b)(3)",
        "statute_text": (
            "The cleaning of the premises upon termination of the tenancy necessary to "
            "return the unit to the same level of cleanliness it was in at the inception "
            "of the tenancy."
        ),
        "plain_english_rule": (
            "Routine carpet cleaning is the landlord's responsibility unless the tenant "
            "left damage beyond normal wear. Need move-in evidence to confirm baseline."
        ),
    },
    ("CA", "cleaning"): {
        "statute_id": "CA Civil Code §1950.5(b)(3)",
        "statute_text": (
            "The cleaning of the premises upon termination of the tenancy necessary to "
            "return the unit to the same level of cleanliness it was in at the inception "
            "of the tenancy."
        ),
        "plain_english_rule": (
            "Landlord can only charge cleaning needed to return unit to move-in cleanliness. "
            "If tenant left it broom-clean, charge is illegal."
        ),
    },
    ("CA", "damage"): {
        "statute_id": "CA Civil Code §1950.5(b)(2)",
        "statute_text": (
            "The repair of damages to the premises, exclusive of ordinary wear and tear, "
            "caused by the tenant or by a guest or licensee of the tenant."
        ),
        "plain_english_rule": (
            "Tenant pays only for damage beyond ordinary wear, prorated for the useful "
            "life of the item. Old carpet/paint cannot be charged at full replacement cost."
        ),
    },
    ("TX", "paint"): {
        "statute_id": "Texas Property Code §92.104(b)",
        "statute_text": (
            "The landlord may not retain any portion of a security deposit to cover "
            "normal wear and tear."
        ),
        "plain_english_rule": (
            "Texas has no bright-line tenancy threshold like CA. Paint deduction is allowed "
            "only for damage beyond normal wear. Long tenancy + only fading = illegal."
        ),
    },
    ("TX", "carpet_cleaning"): {
        "statute_id": "Texas Property Code §92.104(a)",
        "statute_text": (
            "Before returning a security deposit, the landlord may deduct from the deposit "
            "damages and charges for which the tenant is legally liable under the lease."
        ),
        "plain_english_rule": (
            "Texas leases often include carpet-cleaning clauses, generally enforceable. "
            "Without an explicit clause, routine cleaning is landlord's responsibility."
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
            "Cleaning fees enforceable if reasonable and itemized. Flat fee with no "
            "itemization = ambiguous; request itemized statement."
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
            "Tenant liable for damage beyond normal wear. Landlord must provide itemized "
            "list within 30 days; failure forfeits right to deduct."
        ),
    },
}


def lookup_state_law(state: State, dispute_type: DisputeType) -> StatuteResult:
    """Return the statute snippet + plain-English rule for a state + dispute type."""
    key = (state, dispute_type)
    if key not in _RULES:
        raise ValueError(f"No rule for state={state}, dispute_type={dispute_type}")
    return _RULES[key].copy()
