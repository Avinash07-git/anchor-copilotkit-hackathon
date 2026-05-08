# 🏗️ RentProof — Architecture

> **Purpose:** The blueprint. Tech stack, system diagram, folder structure, data flow, agent brain, A2UI component contract. Build day = type out what's in this doc.
>
> **Last updated:** 2026-05-07 evening · **Status:** 🟢 Locked, design only — no code yet
> **Companion docs:** `PROTOCOL_NOTES.md` (what each protocol does) · `SCREENS.md` (wireframes) · `RENTPROOF_SPEC.md` (product truth)

---

## 1. 🧱 Tech Stack — locked

| Layer | Tech | Why this, not the alternative |
|---|---|---|
| Backend framework | **FastAPI** (Python 3.11+) | Avinash's strongest stack; ships fast; async friendly for agent streaming |
| Agent framework | **Pydantic AI** | Walmart-friendly; first-class MCP + AG-UI adapters; type-safe |
| LLM | **Gemini 2.5 Flash** via **public Google AI Studio API** (free tier) → Gemini 2.0 Flash → Gemma 3 12B (fallbacks) | LOCKED 2026-05-07: this is a public project, **no Walmart Element**. Free tier survives the demo; cascade pattern won AI Ops Lab. |
| MCP runtime | **mcp-use** (Python SDK from Manufact) | Mandatory protocol; auto-discovery for MCP Apps widgets |
| AG-UI | **CopilotKit** React SDK + Pydantic AI's AG-UI adapter | Mandatory protocol; pre-wired components save hours |
| A2UI | Custom component kit conforming to A2UI starter-kit shape (final mapping done Sat 1–3 PM) | Mandatory protocol; spec released with starter kit |
| Frontend | **React 18 + Vite + TypeScript + Tailwind 3** | A2UI components need React; Vite = fast HMR for live demo |
| PDF parse | **pdfplumber** | Better text extraction than PyPDF2; handles tables |
| PDF generate | **ReportLab** | Battle-tested; legal-doc templating; deterministic output |
| Floor plan render | **Custom React + inline SVG + Tailwind classes** | Lightweight, no heavy 3D dep, easy to color rooms reactively |
| Storage | In-memory dict for demo session (no DB) | Single-user demo, no persistence needed |
| Colors | Walmart palette: blue.100 `#0053e2`, spark.100 `#ffc220`, red.100 `#ea1100`, green.100 `#2a8703`, spark.140 `#995213` | Walmart house style + WCAG AA contrast |
| Package mgr (Py) | **uv** with Walmart Artifactory index | Walmart rule |
| Package mgr (JS) | **pnpm** | Faster, less disk than npm |

---

## 2. 🗺️ System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         RITA'S BROWSER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React + Vite (port 5173)                    │  │
│  │  ┌────────────────┐    ┌─────────────────────────────┐  │  │
│  │  │ A2UI Renderer  │    │ AG-UI Panel (CopilotKit)    │  │  │
│  │  │ (interprets    │    │  • streams agent reasoning  │  │  │
│  │  │  UI plan JSON) │◄──►│  • HITL approval modal      │  │  │
│  │  │                │    │  • chat box for corrections │  │  │
│  │  │  Components:   │    └──────────────┬──────────────┘  │  │
│  │  │  - FloorPlan   │                   │                  │  │
│  │  │  - RoomCard    │                   │ WebSocket        │  │
│  │  │  - LawCitation │                   │ (AG-UI events)   │  │
│  │  │  - Checklist   │                   │                  │  │
│  │  │  - Confidence  │                   │                  │  │
│  │  │  - LetterPrev  │                   │                  │  │
│  │  └────────┬───────┘                   │                  │  │
│  │           │ HTTP POST /upload         │                  │  │
│  │           │ (PDFs + photos)           │                  │  │
│  └───────────┼───────────────────────────┼──────────────────┘  │
└──────────────┼───────────────────────────┼─────────────────────┘
               │                           │
               ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (port 8000)                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             Pydantic AI Agent ("Rita's investigator")   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  System prompt: "You are an investigator that   │   │   │
│  │  │  builds an evidence room for a renter's deposit │   │   │
│  │  │  dispute. Output a UI plan, not text."          │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                            │                           │   │
│  │                            ▼                           │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │   MCP TOOL CLIENTS (mcp-use)                 │     │   │
│  │  │   ┌────────────┐ ┌────────────┐              │     │   │
│  │  │   │read_letter │ │read_lease  │              │     │   │
│  │  │   └────────────┘ └────────────┘              │     │   │
│  │  │   ┌────────────┐ ┌────────────┐              │     │   │
│  │  │   │read_photo  │ │lookup_law  │              │     │   │
│  │  │   │  _metadata │ │            │              │     │   │
│  │  │   └────────────┘ └────────────┘              │     │   │
│  │  │   ┌──────────────────┐                       │     │   │
│  │  │   │generate_demand   │                       │     │   │
│  │  │   │  _letter (PDF)   │                       │     │   │
│  │  │   └──────────────────┘                       │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                            │                           │   │
│  │                            ▼                           │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │   LLM (Gemini 2.5 Flash → fallback cascade)  │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         AG-UI Server (Pydantic AI adapter)              │   │
│  │  Streams: tool_call_started, tool_result,               │   │
│  │           state_updated, ui_plan_ready, requires_apprv  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Local data:                                            │   │
│  │   • data/ca_civil_1950_5.md   (CA statute snippets)     │   │
│  │   • data/tx_property_92_104.md (TX statute snippets)    │   │
│  │   • data/demo_letter.pdf       (Rita's mock letter)     │   │
│  │   • data/demo_lease.pdf        (Rita's mock lease)      │   │
│  │   • data/demo_photos/*.jpg     (move-in/out photos)     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 📂 Folder Structure

```
rentproof/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app + routes
│   │   ├── agent.py                   # Pydantic AI agent definition
│   │   ├── ag_ui_adapter.py           # WebSocket streaming
│   │   ├── ui_plan.py                 # Pydantic models for UI plan JSON
│   │   ├── mcp_tools/
│   │   │   ├── __init__.py
│   │   │   ├── pdf_reader.py          # read_letter_pdf, read_lease_pdf
│   │   │   ├── photo_meta.py          # read_photo_metadata
│   │   │   ├── legal_lookup.py        # lookup_state_law
│   │   │   └── letter_generator.py    # generate_demand_letter
│   │   ├── prompts/
│   │   │   ├── system.md              # agent system prompt
│   │   │   └── ui_plan_examples.md    # few-shot UI plan examples
│   │   └── data/
│   │       ├── ca_civil_1950_5.md
│   │       ├── tx_property_92_104.md
│   │       ├── demo_letter.pdf
│   │       ├── demo_lease.pdf
│   │       └── demo_photos/
│   ├── tests/
│   │   ├── test_mcp_tools.py
│   │   └── test_agent_ui_plan.py
│   ├── pyproject.toml                 # uv-managed
│   ├── .env.example                   # GEMINI_API_KEY=, etc.
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FloorPlan.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── LawCitation.tsx
│   │   │   ├── EvidenceChecklist.tsx
│   │   │   ├── ConfidenceMeter.tsx
│   │   │   ├── DemandLetterPreview.tsx
│   │   │   └── AgentStreamPanel.tsx   # CopilotKit AG-UI
│   │   ├── lib/
│   │   │   ├── uiPlanRenderer.tsx     # interprets UI plan JSON → React
│   │   │   ├── agui.ts                # AG-UI client hook
│   │   │   └── colors.ts              # Walmart palette tokens
│   │   ├── types/
│   │   │   └── uiPlan.ts              # TypeScript types matching backend
│   │   └── styles/
│   │       └── index.css
│   ├── public/
│   ├── package.json                   # pnpm
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                              # symlink or copy of these planning docs
├── scripts/
│   ├── make_demo_letter.py            # generates the mock landlord PDF
│   └── make_demo_lease.py
├── .gitignore
├── README.md
└── LICENSE
```

---

## 4. 🔄 Data Flow — happy path

### Step 1: Rita lands + uploads
```
Browser                          FastAPI                       Agent
  │                                │                             │
  ├─ POST /session ───────────────►│                             │
  │◄── { session_id } ─────────────┤                             │
  │                                │                             │
  ├─ POST /upload (PDFs+photos) ──►│                             │
  │   form-data, session_id        ├─ saves to /tmp/{session}    │
  │◄── 200 OK ─────────────────────┤                             │
  │                                │                             │
  ├─ WS /agui/{session_id} ───────►│                             │
  │   (AG-UI stream opens)         │                             │
```

### Step 2: Investigation (live AG-UI events stream)
```
Browser                          FastAPI                       Agent + LLM
  │                                ├─ start agent run ─────────►│
  │                                │                             │
  │◄── event: tool_call(read_letter)                            │
  │                                │◄── tool result: 3 charges──┤
  │◄── event: state_update("found 3 charges")                   │
  │                                │                             │
  │◄── event: tool_call(read_lease)                             │
  │                                │◄── tool result: tenancy 3y─┤
  │◄── event: state_update("tenancy=3y, deposit=$2500")         │
  │                                │                             │
  │◄── event: tool_call(lookup_law, "CA", "paint")              │
  │                                │◄── tool result: §1950.5────┤
  │◄── event: state_update("paint after 3y = illegal")          │
  │                                │                             │
  │◄── event: ui_plan_partial (FloorPlan + ConfidenceMeter)     │
  │   (renderer paints rooms)      │                             │
  │                                │                             │
  │◄── event: ui_plan_partial (+ RoomCard + LawCitation)        │
  │   (cards slide in)             │                             │
  │                                │                             │
  │◄── event: ui_plan_partial (+ DemandLetterPreview)           │
  │   (preview button appears)     │                             │
  │                                │                             │
  │◄── event: agent_done                                         │
```

### Step 3: "Change one fact" — the killer moment
```
Browser                          FastAPI                       Agent
  │                                │                             │
  │ Rita types in chat:            │                             │
  │ "actually 6 months tenancy"    │                             │
  ├─ WS msg: user_correction ─────►│                             │
  │                                ├─ re-run with fact override►│
  │                                │                             │
  │◄── event: state_update("recomputing with new tenancy")      │
  │◄── event: ui_plan_full (NEW plan: bedroom yellow, conf 54%) │
  │   (React diffs, reactive       │                             │
  │    re-render — bedroom flips,  │                             │
  │    letter softens, checklist   │                             │
  │    grows)                      │                             │
```

### Step 4: Approve + download letter
```
Browser                          FastAPI
  │                                │
  │◄── event: requires_approval (letter draft preview)          │
  │ Rita reviews modal, clicks ✓   │                             │
  ├─ WS msg: approval_granted ────►│                             │
  │                                ├─ tool: generate_demand_ltr  │
  │                                │   (writes /tmp/letter.pdf)  │
  │◄── event: ui_plan_partial (+ download_button)               │
  ├─ GET /letter/{session_id} ────►│                             │
  │◄── PDF download ───────────────┤                             │
```

---

## 5. 🧠 Agent Brain — system prompt structure

The agent's system prompt is the heart of the build. It enforces the "output a UI plan, not text" contract. Full prompt lives in `backend/app/prompts/system.md`. Skeleton:

```
You are RentProof's investigator. You help renters dispute illegal
security-deposit deductions.

ROLE
- You are given: a deduction letter (PDF), a lease (PDF), photos.
- You investigate using your tools and produce a UI PLAN — NEVER plain text.

TOOLS (MCP)
- read_letter_pdf(path) → list of charges
- read_lease_pdf(path) → tenancy_months, deposit_amount, signing_date
- read_photo_metadata(path) → list of {filename, taken_at, room_label}
- lookup_state_law(state, dispute_type) → statute text + plain-English rule
- generate_demand_letter(state, charges_to_dispute, tenant_facts) → pdf_path

INVESTIGATION ALGORITHM
1. Call read_letter_pdf to get all charges.
2. Call read_lease_pdf to get tenancy length + deposit.
3. For each charge, call lookup_state_law(state, charge.type).
4. Apply the rule: "is this charge legal given the facts?"
   verdict ∈ {illegal, ambiguous, fair}
5. For ambiguous verdicts, list missing evidence in a checklist.
6. Compute confidence = (illegal_count * 1.0 + ambiguous * 0.5) / total
7. Emit UI plan.

UI PLAN CONTRACT
Output a single JSON object matching the UIPlan schema. Components:
- ConfidenceMeter (always)
- FloorPlan (always — derive room shapes from lease photos)
- RoomCard (one per charged room)
- LawCitation (one per illegal verdict)
- EvidenceChecklist (when any ambiguous verdicts exist)
- DemandLetterPreview (after demand letter generated)

When the user corrects a fact (e.g. "actually I lived there 6 months"),
re-run the investigation algorithm with the override and emit a NEW UI plan.

GUARDRAILS
- Never invent statutes. Only cite what lookup_state_law returned.
- Always include a disclaimer in the demand letter: "Confirm with a tenant
  rights attorney before filing in court."
- If unsure, prefer "ambiguous" verdict and request evidence.
```

---

## 6. 🎨 A2UI Component Kit — full schema

Six components. Each has a stable JSON shape the agent emits and the renderer interprets. **This is the contract.**

### `ConfidenceMeter`
```typescript
{
  type: "ConfidenceMeter",
  props: {
    score: number,          // 0-100
    label: string,          // "Case strength"
    color?: "green" | "yellow" | "red"  // derived from score if absent
  }
}
```

### `FloorPlan`
```typescript
{
  type: "FloorPlan",
  props: {
    width: number,          // SVG viewBox width
    height: number,
    rooms: Array<{
      id: string,           // "bedroom", "living", etc.
      label: string,        // "Bedroom"
      shape: "rect",        // v1 only supports rect; could extend
      x: number, y: number,
      w: number, h: number,
      color: "green" | "yellow" | "red" | "gray",
      onClick?: "highlight_room"  // event name renderer wires up
    }>
  }
}
```

### `RoomCard`
```typescript
{
  type: "RoomCard",
  props: {
    room_id: string,        // matches FloorPlan room id
    charge_label: string,   // "$400 paint"
    verdict: "illegal" | "ambiguous" | "fair",
    one_liner: string       // "Paint after 3 yrs is normal wear (CA §1950.5)"
  }
}
```

### `LawCitation`
```typescript
{
  type: "LawCitation",
  props: {
    statute: string,        // "CA Civil Code §1950.5(b)(3)"
    quote: string,          // verbatim statute snippet
    plain_english: string,  // "Landlords can't charge for normal wear..."
    applies_to_room: string // matches RoomCard room_id
  }
}
```

### `EvidenceChecklist`
```typescript
{
  type: "EvidenceChecklist",
  props: {
    title: string,          // "To strengthen your case, gather:"
    items: Array<{
      text: string,         // "Move-in paint photo"
      checked: boolean
    }>
  }
}
```

### `DemandLetterPreview`
```typescript
{
  type: "DemandLetterPreview",
  props: {
    pdf_url: string,        // backend-served PDF URL
    amount_disputed: number, // 1200
    state: "CA" | "TX",
    requires_approval: boolean,  // triggers HITL gate
    actions: Array<"approve" | "edit" | "download">
  }
}
```

### Layout envelope
```typescript
{
  layout: "evidence_room",  // v1 only layout; future: "summary", "minimal"
  components: Array<Component>,
  meta: {
    case_id: string,
    state: "CA" | "TX",
    last_updated: ISO8601
  }
}
```

---

## 7. 🌐 API Surface (FastAPI routes)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/session` | Create new investigation session, returns `session_id` |
| `POST` | `/upload` | Multipart upload of letter, lease, photos |
| `WS`   | `/agui/{session_id}` | AG-UI event stream (bidirectional) |
| `POST` | `/correct/{session_id}` | Submit a fact correction (also via WS) |
| `GET`  | `/letter/{session_id}` | Download generated demand letter PDF |
| `GET`  | `/health` | Liveness check for demo |

---

## 8. 🧪 Testing & Demo Safety Nets

| Safety net | Status |
|---|---|
| Mock letter + mock lease + mock photos in `data/` so demo never depends on user input | required |
| **Cached agent responses** — pre-record a perfect run to JSON, replay if API quota dies | required |
| **LLM fallback cascade** — Gemini 2.5 Flash → 2.0 Flash → Gemma 3 12B → Gemma 3 4B | required (won AI Ops Lab) |
| **Pre-recorded demo video** — full 3-min run uploaded Friday | required |
| **Localhost-only mode** — entire demo runs offline if Wi-Fi dies (cached responses) | required |
| Two laptops at the venue | nice-to-have |

---

## 9. 🚀 Build Order (when we eventually code)

> **Don't build out of order.** Each step gates the next.

1. **Backend skeleton** — FastAPI + uv venv + .env + health endpoint (10 min)
2. **MCP tools, mocked first** — each tool returns hardcoded JSON for the demo case (30 min)
3. **Pydantic AI agent + Gemini wired up + system prompt** — outputs valid UI plan JSON (45 min)
4. **AG-UI adapter** — WebSocket streaming events as agent runs (30 min)
5. **Frontend skeleton** — Vite + React + Tailwind + Walmart palette tokens (15 min)
6. **A2UI renderer + the 6 components** — render hardcoded UI plan first (60 min)
7. **AG-UI panel (CopilotKit) wired to backend WS** — stream visible (30 min)
8. **End-to-end happy path** — upload → investigate → render evidence room (30 min)
9. **"Change one fact" flow** — correction WS message → agent re-run → reactive re-render (45 min)
10. **TX state variant** — second statute file + state switcher (30 min)
11. **PDF letter generation (ReportLab)** — CA + TX templates (45 min)
12. **HITL approval modal** — review before letter finalizes (20 min)
13. **Polish: Walmart palette, animations, copy pass** (60 min)
14. **Backup video record** (30 min)
15. **Pitch script + 5 rehearsals** (60 min)

**Total: ~9 hours of focused build.** With Thu evening + Fri full day + Sat 1–5 PM, we have ~16 hours. Comfortable margin if we don't drift.

---

## 10. ⚠️ Open Questions — RESOLVED 2026-05-07

| # | Question | Decision |
|---|---|---|
| 1 | A2UI starter kit shape | **Build our own 6-component kit now** to the schema in §6. When the starter kit drops Fri (24–48hr pre-event), spend the Sat 1–3 PM integration window mapping our kit onto theirs. If our shape and theirs disagree, we keep our renderer and label it "A2UI-compatible" — the agent's UI-plan contract doesn't change either way. |
| 2 | CopilotKit ↔ Pydantic AI integration | **Use the official Pydantic AI AG-UI adapter + CopilotKit React SDK.** 15-min spike during scaffolding to confirm event names; if mismatched, write a tiny event-name shim. Do not block on this. |
| 3 | Element vs raw Gemini | **LOCKED: raw Gemini 2.5 Flash via public Google AI Studio API.** This is a public hackathon project. No Walmart Element. No Walmart anything. |
| 4 | Photo realism | **Stock interior photos from the internet.** Avinash fetches per the shopping list in `data/PHOTO_SHOPPING_LIST.md`. We don't need real EXIF dates — `read_photo_metadata` returns hardcoded dates for the demo case. |

---

## 🐶 TL;DR

- **Stack:** FastAPI + Pydantic AI + Gemini + mcp-use + CopilotKit + React/Vite + Tailwind
- **Contract:** agent emits UI plans, frontend renders A2UI components, AG-UI streams everything live
- **Killer moment:** "change one fact" → agent re-runs → screen reactively rebuilds (proves all 3 protocols load-bearing)
- **Build order:** 15 sequential steps, ~9 focused hours, ~16 available
- **Safety nets:** cached responses + LLM fallback cascade + pre-recorded video + localhost-only mode

Next: review wireframes in `SCREENS.md` to lock the visual design.
