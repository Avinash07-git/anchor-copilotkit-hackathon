# California Civil Code §1950.5 — Security Deposits (excerpts)

> Source: California Legislative Information. Excerpts only — not full statute.
> Used by `lookup_state_law("CA", ...)` for RentProof's investigator agent.

---

## §1950.5(b) — Permitted deductions

A landlord may claim of the security only those amounts as reasonably necessary for the following purposes:

1. The compensation of a landlord for a tenant's default in the payment of rent.
2. The repair of damages to the premises, exclusive of **ordinary wear and tear**, caused by the tenant or by a guest or licensee of the tenant.
3. The cleaning of the premises upon termination of the tenancy **necessary to return the unit to the same level of cleanliness it was in at the inception of the tenancy.**
4. To remedy future defaults by the tenant in any obligation under the rental agreement.

---

## Plain-English rules per dispute type

### Paint
- **Rule:** Paint is considered ordinary wear and tear after 2 years of tenancy. Landlord cannot deduct repaint costs after 2+ year tenancy unless tenant caused damage exceeding normal wear.
- **Tenancy < 2 years AND no damage shown:** ambiguous (depends on condition)
- **Tenancy ≥ 2 years AND no damage shown:** illegal
- **Any tenancy, with documented tenant-caused damage:** fair (charge for the damage portion)

### Carpet cleaning
- **Rule:** Routine carpet cleaning at move-out is the landlord's responsibility (not "necessary to return to inception cleanliness" if it was professionally cleaned at move-in and tenant returned it in similar condition).
- **No move-in cleaning record AND carpet looks normal at move-out:** ambiguous (need move-in evidence)
- **Move-in carpet was clean AND move-out carpet has only normal wear:** illegal
- **Move-out carpet has visible stains/damage beyond normal wear:** fair

### Cleaning (general)
- **Rule:** Landlord can only charge cleaning needed to return unit to move-in cleanliness level.
- **Tenant left unit "broom clean" / similar to move-in:** illegal
- **Tenant left visible mess beyond move-in baseline:** fair

### Damage (other)
- **Rule:** Tenant pays for damage beyond ordinary wear and tear, prorated for useful life of item.
- **Item past its useful life (e.g. 10-yr-old carpet, 5-yr-old paint):** illegal to charge full replacement
- **Demonstrable tenant-caused damage to functional item:** fair (depreciated cost)

---

## Statutory deadlines (CA)

- Landlord must return deposit within **21 calendar days** after tenant moves out.
- If withholding any amount, landlord must provide **itemized statement** with receipts/estimates for any single item over $125.
- Failure to comply may entitle tenant to **up to twice the deposit amount** in bad-faith damages (§1950.5(l)).

---

## Citation format used by agent

When emitting a `LawCitation` component, the agent uses:
- `statute`: `"CA Civil Code §1950.5(b)(3)"` (or whichever subsection applies)
- `quote`: verbatim text from this file
- `plain_english`: derived from the rules above
