# Texas Property Code §92.104 — Security Deposits (excerpts)

> Source: Texas Statutes. Excerpts only — not the full statute.
> Used by `lookup_state_law("TX", ...)` for RentProof's investigator agent.
> **RentProof never declares anything "illegal." Verdicts are `worth_challenging`, `needs_more_proof`, or `likely_reasonable`. Courts decide what's illegal.**

---

## §92.104(a) — Permitted deductions (verbatim excerpt)

Before returning a security deposit, the landlord may deduct from the deposit damages and charges for which the tenant is legally liable under the lease or as a result of breaching the lease.

## §92.104(b) — Ordinary wear and tear

The landlord may **not** retain any portion of a security deposit to cover **normal wear and tear**.

## §92.104(c) — Itemized list

If the landlord retains all or part of the deposit, the landlord shall give to the tenant the balance of the deposit, if any, together with a written description and itemized list of all deductions.

> **Plain-English summary the agent shows users:** *"Texas lets a landlord deduct for damage beyond normal wear and tear, and for charges the tenant is liable for under the lease — but the landlord must itemize and may not deduct for normal wear."*

---

## Heuristics per dispute type (TX vs CA — note differences)

> Heuristics for *surfacing questions to ask the landlord*, not legal conclusions.

### Paint
- **Rule basis:** Texas does not have California's bright-line "2-year" rule for paint. Painting due to fading or age is generally normal wear; painting to repair tenant-caused damage (holes, smoke, unauthorized colors) is generally chargeable.
- **Tenancy < 1 year AND no documented damage:** `needs_more_proof`.
- **Tenancy ≥ 3 years AND only fading/age:** `worth_challenging`.
- **Documented tenant-caused damage:** `likely_reasonable` for the damage portion.

### Carpet cleaning
- **Rule basis:** Texas leases often include explicit carpet-cleaning clauses, which are generally enforceable if reasonable. Without an explicit clause, routine cleaning is more often the landlord's responsibility.
- **Lease has explicit "tenant pays carpet cleaning" clause AND charge is reasonable:** `likely_reasonable`.
- **No clause AND carpet returned in similar condition to move-in:** `worth_challenging`.
- **Visible damage / pet stains:** `likely_reasonable`.

### Cleaning (general)
- **Rule basis:** Texas leases commonly include a "tenant returns unit clean" clause. Cleaning fees are generally enforceable if reasonable and itemized.
- **Reasonable amount, itemized:** `likely_reasonable`.
- **Flat fee with no itemization:** `needs_more_proof` — request the itemized statement (§92.104(c)).
- **Excessive amount or no cleaning was actually needed:** `worth_challenging`.

### Damage (other)
- **Rule basis:** Tenant is liable for damage beyond normal wear; landlord must provide an itemized list.
- **No itemized list provided within 30 days of move-out:** `worth_challenging` — under §92.109, the landlord may forfeit the right to deduct.
- **Itemized, demonstrable damage:** `likely_reasonable` (depreciated cost, not full replacement).

---

## Statutory deadlines (TX)

- Landlord must return the deposit + itemized statement within **30 days** after the tenant surrenders the premises.
- Failure to provide an itemized list in good faith may forfeit the landlord's right to deduct any amount AND may make the landlord liable for **$100 + 3× the wrongfully withheld amount + attorney fees** (§92.109).

---

## Key differences from California (the agent should know these)

| Issue | California | Texas |
|---|---|---|
| Paint after long tenancy | Often treated as ordinary wear after multi-year tenancy | Case-by-case: depends on damage vs. age |
| Return deadline | 21 days | 30 days |
| Photo-proof rule | Required since April 1, 2025 (for repair/cleaning deductions) | No equivalent state-wide rule |
| Bad-faith remedy | Up to 2× deposit | $100 + 3× wrongful amount + fees |
| Carpet cleaning default | Generally landlord's responsibility | Lease-clause dependent |
| Deposit cap | One month's rent under AB 12 (most new leases since July 1, 2024) | No state-wide cap |

---

## Citation format used by the agent

When emitting a `LawCitation` component for Texas:
- `statute`: `"Texas Property Code §92.104(b)"` (or §92.109 for itemization issues)
- `quote`: a verbatim excerpt from this file (kept short)
- `plain_english`: the user-facing explanation
- `why_worth_challenging`: case-specific reasoning that ties the rule to *this* user's facts

---

## Disclaimer the agent must include

> *"This is not legal advice. RentProof helps you organize evidence and draft a response letter. Confirm with a tenant-rights attorney before filing in court."*
