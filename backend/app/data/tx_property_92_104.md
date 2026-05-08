# Texas Property Code §92.104 — Security Deposits (excerpts)

> Source: Texas Statutes. Excerpts only — not full statute.
> Used by `lookup_state_law("TX", ...)` for RentProof's investigator agent.

---

## §92.104(a) — Permitted deductions

Before returning a security deposit, the landlord may deduct from the deposit damages and charges for which the tenant is legally liable under the lease or as a result of breaching the lease.

## §92.104(b) — Ordinary wear and tear

The landlord may **not** retain any portion of a security deposit to cover **normal wear and tear**.

## §92.104(c) — Itemized list

If the landlord retains all or part of the deposit, the landlord shall give to the tenant the balance of the deposit, if any, together with a written description and itemized list of all deductions.

---

## Plain-English rules per dispute type (TX vs CA — note differences)

### Paint
- **Rule:** Texas does NOT have a bright-line "2-year" rule like California. Paint deduction is allowed if landlord can show tenant caused damage beyond normal wear, regardless of tenancy length. However, painting purely due to age is normal wear.
- **Tenancy < 1 year AND no damage shown:** ambiguous
- **Tenancy ≥ 3 years AND only fading/age:** illegal
- **Any tenancy, with documented tenant-caused damage (holes, stains, smoke):** fair

### Carpet cleaning
- **Rule:** Texas leases often include explicit carpet-cleaning clauses, which are generally enforceable. Without an explicit clause, routine cleaning is landlord's responsibility.
- **Lease has explicit "tenant pays carpet cleaning" clause:** fair (subject to reasonableness)
- **No clause AND carpet returned in similar condition to move-in:** illegal
- **Visible damage / pet stains:** fair

### Cleaning (general)
- **Rule:** Texas leases commonly include a "tenant returns unit clean" clause. Cleaning fees are generally enforceable if reasonable and itemized.
- **Reasonable amount for normal cleaning, itemized:** fair
- **Flat fee with no itemization:** ambiguous (request itemized statement)
- **Excessive amount or no cleaning was needed:** illegal

### Damage (other)
- **Rule:** Tenant liable for damage beyond normal wear; landlord must provide itemized list.
- **No itemized list provided within 30 days of move-out:** illegal (forfeit right to deduct under §92.109)
- **Itemized, demonstrable damage:** fair

---

## Statutory deadlines (TX)

- Landlord must return deposit + itemized statement within **30 days** after tenant surrenders premises.
- Failure to provide itemized list in good faith forfeits the landlord's right to deduct any amount AND may make landlord liable for **$100 + 3x the wrongfully withheld amount + attorney fees** (§92.109).

---

## Key differences from California (the agent should know these)

| Issue | California | Texas |
|---|---|---|
| Paint after long tenancy | Bright-line: ≥2 yrs = normal wear, illegal to charge | Case-by-case: depends on damage vs age |
| Return deadline | 21 days | 30 days |
| Bad-faith penalty | Up to 2× deposit | $100 + 3× wrongful amount + fees |
| Carpet cleaning | Default landlord responsibility | Lease-clause dependent |

---

## Citation format used by agent

When emitting a `LawCitation` component for Texas:
- `statute`: `"Texas Property Code §92.104(b)"` (or §92.109 for itemization issues)
- `quote`: verbatim text from this file
- `plain_english`: derived from the rules above
