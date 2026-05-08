# California Civil Code §1950.5 — Security Deposits (excerpts, plus AB 12 + photo-proof rule)

> Source: California Legislative Information. Excerpts only — not the full statute.
> Used by `lookup_state_law("CA", ...)` for RentProof's investigator agent.
> **RentProof never declares anything "illegal." Verdicts are `worth_challenging`, `needs_more_proof`, or `likely_reasonable`. Courts decide what's illegal.**

---

## §1950.5(b) — Permitted deductions (verbatim excerpt)

A landlord may claim of the security only those amounts as reasonably necessary for the following purposes:

1. The compensation of a landlord for a tenant's default in the payment of rent.
2. The repair of damages to the premises, exclusive of **ordinary wear and tear**, caused by the tenant or by a guest or licensee of the tenant.
3. The cleaning of the premises upon termination of the tenancy **necessary to return the unit to the same level of cleanliness it was in at the inception of the tenancy.**
4. To remedy future defaults by the tenant in any obligation under the rental agreement.

> **Plain-English summary the agent shows users:** *"California lets a landlord deduct for damage beyond ordinary wear and tear, unpaid rent, and cleaning needed to return the unit to its move-in level of cleanliness."*

---

## Heuristics per dispute type (used by the agent to pick a verdict)

> These are *heuristics for surfacing questions to ask the landlord*, not legal conclusions. The agent always pairs them with the user's facts and the disclaimer.

### Paint
- **Rule basis:** Repainting because of fading or normal use is generally treated as ordinary wear and tear. Painting to repair tenant-caused damage (large holes, unusual colors applied without permission, smoke staining, etc.) is generally chargeable.
- **Tenancy < 1 year AND no documented damage:** `needs_more_proof` — short tenancy means landlord may have a stronger argument.
- **Tenancy ≥ 2 years AND no documented damage:** `worth_challenging` — extended tenancy makes "ordinary wear" a strong argument for the renter.
- **Documented tenant-caused damage of any kind:** `likely_reasonable` for the damage portion; full-room repaint may still be `needs_more_proof`.

### Carpet cleaning
- **Rule basis:** Routine end-of-tenancy carpet cleaning is generally not deductible if the carpet was professionally cleaned at move-in and the tenant returned it in similar condition.
- **No move-in cleaning record AND carpet looks normal at move-out:** `needs_more_proof` — gather move-in photos / cleaning receipts.
- **Move-in carpet was clean AND move-out carpet has only normal wear:** `worth_challenging`.
- **Move-out carpet has visible stains/damage beyond normal wear:** `likely_reasonable` for the affected area.

### Cleaning (general)
- **Rule basis:** Only cleaning needed to restore move-in cleanliness is chargeable.
- **Tenant left unit "broom clean" / similar to move-in:** `worth_challenging`.
- **Tenant left visible mess beyond move-in baseline:** `likely_reasonable`.

### Damage (other)
- **Rule basis:** Tenant pays for damage beyond ordinary wear and tear, generally prorated for useful life.
- **Item past its expected useful life (e.g., very old carpet, old paint):** `worth_challenging` — full replacement cost is rarely defensible.
- **Demonstrable tenant-caused damage to a functional item:** `likely_reasonable` — depreciated cost, not full replacement.

---

## Statutory deadlines & related California rules (current as of writing)

- **21-day rule:** Landlord must return the deposit, or provide an itemized statement of withholdings, within **21 calendar days** after the tenant moves out.
- **Itemization & receipts:** If withholding any amount, the itemized statement should include receipts/estimates for any single item over $125.
- **Bad-faith remedy:** Failure to comply may entitle the tenant to up to twice the deposit amount in statutory damages (§1950.5(l)).
- **AB 12 (effective July 1, 2024):** For most new residential leases, security deposits are capped at **one month's rent** (with limited exceptions for small landlords).
- **Photo-proof rule (effective April 1, 2025):** A landlord withholding part of the deposit for repairs or cleaning must provide **photographs of the unit** documenting the condition that supports the deduction.

> **San Francisco only:** A landlord holding a deposit for more than one year owes **interest** to the tenant. The 2026–2027 published rate is **4.2%**.

---

## Citation format used by the agent

When emitting a `LawCitation` component, the agent uses:
- `statute`: `"California Civil Code §1950.5"` (no subsection unless directly quoted)
- `quote`: a verbatim excerpt from this file (kept short)
- `plain_english`: the user-facing explanation of what the rule allows
- `why_worth_challenging`: case-specific reasoning that ties the rule to *this* user's facts (tenancy length, photos, etc.) — never a flat legal conclusion

> The agent's framing is always: *"Based on the lease, photos, and this rule, here's why we think this deduction is worth challenging / needs more proof / looks reasonable."*

---

## Disclaimer the agent must include

> *"This is not legal advice. RentProof helps you organize evidence and draft a response letter. Confirm with a tenant-rights attorney or your local rent board before filing in court."*
