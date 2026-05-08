# 🎨 SCREENS — RentProof Wireframes & Storyboard

> **Purpose:** Lock the visual design before any code. Every screen state, every transition, the killer demo storyboard. ASCII wireframes — fast to read, fast to change.
>
> **Last updated:** 2026-05-07 evening · **Status:** 🟢 Locked design
> **Companion docs:** `ARCHITECTURE.md` (system) · `PROTOCOL_NOTES.md` (protocols) · `RENTPROOF_SPEC.md` (product)

---

## 🎨 Visual Language

### Walmart palette (mandatory)
| Token | Hex | Use |
|---|---|---|
| `blue.100` | `#0053e2` | Primary CTAs, header, focus rings |
| `spark.100` | `#ffc220` | Accent highlights, "magic" moments |
| `red.100` | `#ea1100` | Illegal verdicts, errors |
| `green.100` | `#2a8703` | Fair verdicts, success |
| `spark.140` | `#995213` | Warning text |
| `gray.10` | `#f5f5f5` | Subtle backgrounds, warning bg |
| `gray.50` | `#cfcfcf` | Borders, disabled |
| `gray.160` | `#1a1a1a` | Body text |
| `white` | `#ffffff` | Background |

### Verdict colors (the heart of the UI)
- 🟢 **Green = Likely reasonable** — the deduction looks fair given lease + photos + rule snippet
- 🟡 **Yellow = Needs more proof** — it could go either way; gather more evidence
- 🔴 **Red = Worth challenging** — based on the documents, this one's worth pushing back on

> **Language rule (everywhere):** never display "illegal," "stolen," "fight," or "guaranteed." Use "worth challenging," "needs more proof," "likely reasonable," "draft," "withheld."

### Typography
- Headings: Inter SemiBold or system sans-serif fallback
- Body: Inter Regular, 16px base
- Mono (statute quotes): JetBrains Mono or system mono

### Accessibility
- WCAG 2.2 Level AA — all text passes 4.5:1 contrast on its background
- Verdict color always paired with an icon + label (color-blind safe)
- Focus rings on every interactive element
- ARIA live region for AG-UI stream so screen readers narrate agent activity

---

## 📺 Screen Inventory

| # | Screen | Trigger |
|---|---|---|
| 1 | Landing / Upload | Cold load |
| 2 | Investigating | After upload submitted |
| 3 | Evidence Room | Agent emits first complete UI plan |
| 4 | Evidence Room (room focused) | Click a colored room on the floor plan |
| 5 | Letter Approval Modal | Agent requests HITL approval |
| 6 | Letter Downloaded / Done | Approval granted |
| 7 | Evidence Room (rebuilt) | After "change one fact" correction |

---

## Screen 1 — Landing / Upload

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠  RentProof                                       State: [California ▾]  │  ← header (blue.100 bg, white text)
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              Your landlord kept your deposit?                               │  ← H1, gray.160
│              We'll show you which deductions are worth challenging —        │
│              and draft the response letter for you to review.               │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │     📄  Drag & drop your documents here                          │    │  ← dashed border, blue.100
│   │                                                                   │    │
│   │         Landlord's deduction letter (PDF)                         │    │
│   │         Your lease (PDF)                                          │    │
│   │         Move-in & move-out photos (JPG/PNG)                       │    │
│   │                                                                   │    │
│   │              ─── or ───                                           │    │
│   │                                                                   │    │
│   │              [ Browse files ]                                     │    │  ← secondary button
│   │                                                                   │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│              [ ✨ Try the demo with Rita's case ]                           │  ← spark.100 button (the demo path!)
│                                                                             │
│   ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│   ⚖️  How it works                                                          │
│   1. Upload your landlord's letter, lease, and photos                       │
│   2. Our AI investigates each charge against your state's law               │
│   3. You get a custom evidence room + a ready-to-mail demand letter         │
│                                                                             │
│   This isn't legal advice. Confirm with a tenant rights attorney            │  ← small print, gray.160
│   before filing in court.                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Demo behavior:** Click the **spark.100 yellow** "Try with Rita's case" button → skips upload, jumps straight to Screen 2 with prebaked files. (This is what we click during the live demo.)

---

## Screen 2 — Investigating

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠  RentProof                                       State: [California ▾]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│            ┌─────────────────────────────────────────────────┐              │
│            │                                                 │              │
│            │           🔎  Investigating Rita's case…        │              │
│            │                                                 │              │
│            │   ▸ reading deduction letter…             ✓    │              │
│            │   ▸ found 3 charges                       ✓    │              │
│            │     ($400 paint, $600 carpet, $250 cleaning)   │              │
│            │   ▸ reading lease…                        ✓    │              │
│            │     tenancy = 3 years, deposit = $2,500        │              │
│            │   ▸ checking §1950.5 for paint…           ✓    │              │
│            │     paint after 3y = normal wear → worth challenging │              │
│            │   ▸ checking §1950.5 for carpet…          ⏳   │              │  ← live-streaming AG-UI events
│            │   ▸ checking §1950.5 for cleaning…             │              │
│            │   ▸ comparing move-in vs move-out photos…      │              │
│            │   ▸ assembling your evidence room…             │              │
│            │                                                 │              │
│            │   [ progress bar: ████████░░░░░░ 62% ]         │              │
│            │                                                 │              │
│            └─────────────────────────────────────────────────┘              │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:** Each line types in as the AG-UI event arrives. Checkmarks appear when the tool returns. Progress bar fills based on how many tools have completed.

---

## Screen 3 — Evidence Room (the money shot, now interactive)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠  RentProof   Rita Sharma · 2BR SF · CA       State: [California ▾]  ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────┐ ┌─────────────────────────┐│
│  │  Case strength                       87%   │ │  🤖  Agent              ││
│  │  ████████████████████████░░░░  Strong     │ │                         ││
│  │  Disputable amount: $1,000 of $1,250       │ │  ▸ found 3 charges      ││
│  └────────────────────────────────────────────┘ │  ▸ tenancy 3y           ││
│                                                  │  ▸ paint = challenge    ││
│  ┌────────────────────────────────────────────┐ │  ▸ carpet = ambiguous   ││
│  │     FLOOR PLAN — drop photos on rooms      │ │  ▸ cleaning = fair      ││
│  │   ┌────────────────────────────────────┐   │ │  ▸ evidence room ready  ││
│  │   │                  │                 │   │ │                         ││
│  │   │   🟡 LIVING      │   🔴 BEDROOM    │   │ │  ─────────────────────  ││
│  │   │      ROOM        │                 │   │ │                         ││
│  │   │   [🖼️][🖼️]       │   [🖼️][🖼️]      │   │ │  💬 Talk or type:       ││
│  │   │   carpet $600    │   paint $400    │   │ │  ┌───────────────────┐  ││
│  │   │                  │                 │   │ │  │ Type a correction │  ││
│  │   ├──────────────────┼─────────────────┤   │ │  │ e.g. "lived 6mo"  │  ││
│  │   │                  │                 │   │ │  └───────────────────┘  ││
│  │   │   🟢 KITCHEN     │   ⚪ HALL       │   │ │  [ 🎙️ Hold to talk ]    ││
│  │   │   [🖼️]            │                 │   │ │  [    Send    ]         ││
│  │   │   cleaning $250  │                 │   │ │                         ││
│  │   │                  │                 │   │ │                         ││
│  │   └──────────────────┴─────────────────┘   │ │                         ││
│  │                                            │ │                         ││
│  │   🟢 reasonable  🟡 more proof  🔴 challenge  ⚪ unknown │                         ││
│  └────────────────────────────────────────────┘ │                         ││
│                                                  │                         ││
│  ┌────────────────────────────────────────────┐ │                         ││
│  │  📋  TO STRENGTHEN YOUR CASE               │ │                         ││
│  │  ☐ Move-in carpet photo (date-stamped)     │ │                         ││
│  │  ☐ Carpet age confirmation from lease       │ │                         ││
│  │  ☐ Estimate from independent cleaner        │ │                         ││
│  └────────────────────────────────────────────┘ │                         ││
│                                                  │                         ││
│  ┌────────────────────────────────────────────┐ │                         ││
│  │  📨  DEMAND LETTER (DRAFT)                 │ │                         ││
│  │  "Please reconsider $1,000 of your $1,800   │ │                         ││
│  │   deduction. Draft — not legal advice."     │ │                         ││
│  │  [  Review & approve  ]                     │ │                         ││
│  └────────────────────────────────────────────┘ │                         ││
│                                                  └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
            ↑                                                  ↑
    A2UI-rendered                              AG-UI panel (always visible)
  (rooms accept photo drops)                  (text + voice input)
```

**Component map:**
- Top-left card = `ConfidenceMeter`
- Center grid = `FloorPlan` **(now drop targets — photos appear as room thumbs)**
- Below floor plan: one `RoomCard` per charged room
- Below: `EvidenceChecklist`
- Bottom: `DemandLetterPreview`
- Right rail: AG-UI panel (CopilotKit) — agent stream + voice/text correction chat

**Interactions on this screen:**
1. **Drag a photo from the BulkPhotoBin (or system) onto a room** → agent re-evaluates that room → color updates live, RoomCard updates
2. **Click a room** → LawCitation slides in (Screen 4)
3. **Type or hold-to-talk in the chat** → "change one fact" flow (Screen 7)
4. **Click "Review & approve"** → HITL modal (Screen 5)

---

## Screen 4 — Evidence Room (room focused)

When Rita clicks the 🔴 bedroom in the floor plan, a `LawCitation` panel slides in over the right side of the floor plan:

```
┌────────────────────────────────────────────┐
│   FLOOR PLAN  ←── still visible            │
│   ┌────────────┐  ┌───────────────────┐   │
│   │ LIVING 🟡  │  │ ⚖️  CA Civ §1950.5(b)(3)
│   │            │  │                   │   │
│   │            │  │ "A landlord may   │   │
│   ├────────────┤  │  not deduct for   │   │
│   │ KITCHEN 🟢 │  │  ordinary wear    │   │
│   │            │  │  and tear..."     │   │
│   │            │  │                   │   │
│   │            │  │ Plain English:    │   │
│   │            │  │ Paint is normal   │   │
│   │            │  │ wear after 2+ yr. │   │
│   │            │  │ You lived there   │   │
│   │            │  │ 3y → ILLEGAL.     │   │
│   │            │  │                   │   │
│   │            │  │ [ Close ✕ ]       │   │
│   └────────────┘  └───────────────────┘   │
└────────────────────────────────────────────┘
```

**Behavior:** Click any room → slide-in `LawCitation` for that room's charge. Click X or another room → swap.

---

## Screen 5 — Letter Approval Modal (HITL gate)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░  (dim background)  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░                                                                     ░░ │
│  ░░  ┌─────────────────────────────────────────────────────────────┐  ░░ │
│  ░░  │  📨  REVIEW YOUR DEMAND LETTER                          ✕   │  ░░ │
│  ░░  ├─────────────────────────────────────────────────────────────┤  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   Sharma Family                                             │  ░░ │
│  ░░  │   123 Mission St, San Francisco, CA 94103                   │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   May 7, 2026                                               │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   Mr. Landlord                                              │  ░░ │
│  ░░  │   456 Market St, San Francisco, CA 94105                    │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   Re: Request for Re-evaluation of Withheld Deposit          │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   Dear Mr. Landlord,                                        │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   On April 30, 2026 you returned $700 of my $2,500 secur-   │  ░░ │
│  ░░  │   ity deposit, withholding $1,800. Based on California       │  ░░ │
│  ░░  │   Civil Code §1950.5, my lease, and my move-in/move-out    │  ░░ │
│  ░░  │   photos, I'd like to ask you to re-evaluate $1,000 of      │  ░░ │
│  ░░  │   these deductions, which I believe are worth challenging:  │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │     • $400 paint — normal wear after 3-year tenancy         │  ░░ │
│  ░░  │     • $600 carpet — see attached move-in photos…            │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  │   [ scroll for more ]                                       │  ░░ │
│  ░░  │                                                             │  ░░ │
│  ░░  ├─────────────────────────────────────────────────────────────┤  ░░ │
│  ░░  │  [  Edit draft  ]              [  ✓  Approve & download  ]  │  ░░ │
│  ░░  └─────────────────────────────────────────────────────────────┘  ░░ │
│  ░░                                                                     ░░ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:** Modal blocks interaction until Rita approves or edits. AG-UI emits `requires_approval`; frontend renders modal; on approve, sends `approval_granted` event back; agent calls `generate_demand_letter`.

---

## Screen 6 — Letter Downloaded / Done

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠  RentProof                                       State: [California ▾]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                       ✅  Letter ready                                      │
│                                                                             │
│              Rita Sharma — Demand for $1,000                                │
│                                                                             │
│              📄  rita_sharma_demand_2026-05-07.pdf                          │
│                                                                             │
│              [  ⬇  Download PDF  ]   [  📧 Email a copy to me  ]            │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│   📬  NEXT STEPS                                                            │
│   1. Print and mail this letter via certified mail (~$5 USPS)               │
│   2. Wait 14 days for landlord response                                     │
│   3. If no response → you can take this draft to small claims court        │
│                                                                             │
│   [ ← Back to evidence room ]    [ Start a new case ]                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 7 — Evidence Room (rebuilt after correction)

This is the **killer demo screen.** Rita types *"actually I lived there only 6 months"* in the AG-UI chat box, hits Send, and:

```
WHAT CHANGES (live, in front of judges' eyes):

1. Confidence meter: 87% → 54% (animates down)
2. Bedroom: 🔴 RED → 🟡 YELLOW (color animates)
3. RoomCard for bedroom: verdict `worth_challenging` → `needs_more_proof`, one-liner changes:
   was: "Paint after 3 years is often treated as normal wear (worth challenging)"
   now: "Paint after only 6 months — landlord may have grounds if damage exceeds normal wear"
4. LawCitation: still §1950.5 but `why_worth_challenging` text rewrites for the shorter tenancy
5. EvidenceChecklist: grows (now needs more proof)
   was: 3 items
   now: 5 items (added: "move-in paint photo", "lease end date confirmation")
6. DemandLetterPreview: amount drops $1,000 → $600, tone softens from
   "please reconsider these deductions" → "I'd appreciate clarification on the basis for these deductions"
7. **Agent UI Plan inspector** (right-side collapsible panel) shows a diff:
   `[ConfidenceMeter (87→54), FloorPlan (bedroom: red→yellow), RoomCard:bedroom (worth_challenging→needs_more_proof), LawCitation:bedroom (rewritten), EvidenceChecklist (+2), DemandLetterPreview (amount: $1000→$600)]`
8. Right-side AG-UI panel narrates every change in real time

NOTHING ELSE re-renders. No flash. No reload. Just the affected components
reactively update because the new UI plan diffs against the old one.

THIS IS WHERE WE WIN THE MAC MINIS.
```

---

## 🎬 The 3-Minute Demo Storyboard (visual)

> **Language rule for the spoken script:** never "illegal," "stolen," "fight," or "guaranteed."

| Time | Screen | Spoken / Action |
|---|---|---|
| 0:00–0:15 | Screen 1 (Landing) | *"There are 44 million renter households in the U.S. About 85% paid a security deposit. When the landlord keeps part of it, the fight is too small for a lawyer and too confusing for the renter. RentProof handles the confusion."* |
| 0:15–0:30 | Hold mic, speak intake (P1) | *"Watch this."* [tap mic] *"My landlord in San Francisco kept $1,800 of my $2,500 deposit after a 3-year lease."* (transcribed live; fields auto-populate; state auto-detected to CA) |
| 0:30–0:40 | Drag bulk photos onto BulkPhotoBin | *"I'm dropping in a bunch of photos with random names. RentProof figures out which room each one is."* (thumbs auto-classify) |
| 0:40–1:00 | Screen 2 (Investigating) → Screen 3 (Evidence Room appears piece by piece) | (Let the agent stream do the talking. Components slide in. Photos snap into rooms.) *"Floor plan, color-coded by case strength. Bedroom red — paint after 3 years is often treated as normal wear in California, so it's worth challenging."* |
| 1:00–1:15 | Drag a stray photo onto a room | *"Watch — I drag this carpet photo onto the living room. The agent re-evaluates against the rule snippet. Living room flips yellow. Checklist updates."* **Spatial input — try doing that in a chatbot.** |
| 1:15–1:35 | Click 🔴 bedroom → Screen 4 (LawCitation) | *"Click any room. Real §1950.5 text, plain English, case-specific reasoning."* |
| 1:35–2:00 | Hold mic in chat: *"actually 6 months"* → Screen 7 (rebuilt) | **THE MOMENT.** *"I'm changing one fact — with my voice."* [hold-to-talk, release] *"Bedroom shifts from red to yellow. Citation rewrites. Letter softens."* **Open the Agent UI Plan inspector** — *"This is the live JSON the agent emitted. Six components changed. We didn't pre-design this view; the agent composed it. That's generative UI."* |
| 2:00–2:25 | Click "Review & approve" → Screen 5 (Modal) → approve → Screen 6 (Done) | *"Draft response letter. Print, mail certified. This is not legal advice — confirm with a tenant-rights attorney before filing."* |
| 2:25–2:50 | **(Encore, only if pacing allows)** Switch state CA → TX → screen rebuilds | *"Same case, different state, different rules — the agent composed a different screen from the same code path."* |
| 2:50–3:00 | Close | *"Voice in. Spatial canvas. Same case re-evaluated live, with the JSON to prove it. Mac Minis please."* |

---

## 🐶 TL;DR

- 7 screens, 1 layout (`evidence_room`), **7** A2UI components + 1 dev-facing `UIPlanInspector` panel
- Walmart palette + WCAG AA + color-blind safe verdict labels (🟢 reasonable / 🟡 more proof / 🔴 challenge)
- **Friction-killers baked in:** voice intake, voice corrections, bulk photo dump with auto-classification, auto-detected state
- **Interactive canvas:** rooms accept photo drops; spatial input drives agent re-evaluation
- **Killer beat = Screen 7 (the rebuild) + open the UIPlanInspector** so engineer judges see the JSON delta
- Demo path: voice intake → bulk drop → evidence room in <30 seconds
- Right rail: always-visible AG-UI panel (agent narration + voice/text correction chat)
- **Never say "illegal" or "stolen"** — product UI, pitch, letter, code all use "worth challenging," "draft," "likely reasonable," "needs more proof"

Next: skim `RENTPROOF_SPEC.md` and confirm. Then we build.
