# 📡 PROTOCOL NOTES — Plain English Cheat Sheet

> **Purpose:** Stop fumbling A2UI / AG-UI / MCP jargon in a session. This is the one-pager you re-read whenever a protocol's name confuses you.
>
> **Last updated:** 2026-05-07 evening · **Owner:** Avi (Code Puppy)

---

## 🧠 The 30-second mental model

An AI agent is a worker. These 3 protocols give the worker 3 abilities:

| Protocol | The worker's… | Without it, the worker… |
|---|---|---|
| **MCP** | **hands** | can only talk, can't touch the real world |
| **AG-UI** | **voice + your remote control** | works in a black box; you can't watch or interrupt |
| **A2UI** | **drawing pad** | can only reply with text; can't build screens |

That's it. Hands, voice, drawing pad. Everything else is detail.

---

## 1. MCP (Manufact mcp-use) — the AI's hands

### What it is
A **standard for hooking AI agents up to tools.** Tools = anything the AI can *do* in the real world: read a file, call an API, query a database, generate a PDF.

Before MCP, every agent framework invented its own tool format. MCP is the USB-C port: one standard plug, any tool fits any agent.

### What "Manufact mcp-use" specifically is
The Python/TypeScript SDK that implements MCP and adds **MCP Apps** — interactive UI widgets that tools can ship alongside their data. (We use the Python flavor.)

### How RentProof uses it
The agent has 5 MCP tools in its toolbox:

| Tool | What it does | Library under the hood |
|---|---|---|
| `read_letter_pdf` | Parses landlord's deduction letter into structured charges | `pdfplumber` |
| `read_lease_pdf` | Pulls tenancy length, deposit amount, signing date from lease | `pdfplumber` |
| `read_photo_metadata` | Reads EXIF dates from move-in/move-out photos | `Pillow` |
| `lookup_state_law` | Returns relevant statute text for a (state, dispute_type) tuple | local markdown DB (CA §1950.5, TX §92.104) |
| `generate_demand_letter` | Renders the final demand letter PDF from a template | `ReportLab` |

### Force-fit risk: **None.** Any agentic app needs hands.

---

## 2. AG-UI (CopilotKit) — the AI's voice + your remote

### What it is
A **standard for streaming agent activity to a frontend in real time, with the user able to interrupt or steer.** It's an event-based protocol (think: agent emits events like `tool_call_started`, `state_updated`, `requires_approval` — frontend listens and renders).

### What "CopilotKit" specifically is
A React SDK that implements AG-UI on the frontend so you can drop in `<CopilotChat />` / `<CopilotPanel />` components and they auto-wire to an AG-UI-compatible backend. Already adopted by Google, AWS, MS, Oracle, LangChain, Mastra, PydanticAI.

### How RentProof uses it

**a) Live reasoning panel** — right side of the screen streams what the agent is doing:
```
▸ reading landlord letter…
▸ found 3 charges ($400 paint, $600 carpet, $250 cleaning)
▸ reading lease… tenancy = 3 years, deposit = $2,500
▸ checking §1950.5 for paint…
▸ paint after 3 years = normal wear → flagging illegal
▸ updating bedroom → red
```
Judges watch the agent THINK. That's the tension.

**b) Human-in-the-loop approval** — before the demand letter PDF is finalized, the agent emits a `requires_approval` event. Rita reviews the draft in a modal, clicks **Approve** or **Edit**, and only then does the agent call `generate_demand_letter`.

**c) Steering input** — chat box at the bottom of the panel. Rita types *"actually I lived there only 6 months"* → AG-UI sends a `user_correction` event → agent re-runs → emits a new UI plan → screen rebuilds. **This is the killer demo moment.**

### Force-fit risk: **None.** Streaming reasoning is the demo's tension; HITL approval is required for legal output.

---

## 3. A2UI (Google DeepMind) — the AI's drawing pad

### What it is
A **standard for agents to return UI components instead of plain text.** The agent doesn't reply *"here's my analysis: …"* — it returns a **UI plan**: a structured JSON describing which components to render, with what props, in what layout. The frontend has a small library of A2UI-compatible components and renders whatever the agent describes.

Think of it like Markdown for UIs: the agent emits a structured spec; a renderer turns it into pixels. Safer than letting the agent generate raw HTML/JS (no XSS, no crashes).

### How RentProof uses it

The agent has a **component kit** of 6 building blocks. After investigating, it returns a UI plan that tells the frontend which components to render and how to fill them.

**The component kit (full schema in `ARCHITECTURE.md`):**

| Component | Purpose | When the agent picks it |
|---|---|---|
| `FloorPlan` | Top-down apartment layout, rooms color-coded | Always — the canvas |
| `RoomCard` | Per-room verdict (red/yellow/green) | Once per room with a charge |
| `LawCitation` | Statute text + plain-English explanation | When a charge violates a clear law |
| `EvidenceChecklist` | Missing-proof to-do list | When verdict depends on evidence we don't have |
| `ConfidenceMeter` | 0–100% case strength score | Always — top of evidence room |
| `DemandLetterPreview` | Inline PDF preview + Approve/Edit buttons | Once at the end |

**Example agent output (the UI plan):**
```json
{
  "layout": "evidence_room",
  "components": [
    { "type": "ConfidenceMeter", "props": { "score": 87 } },
    { "type": "FloorPlan", "props": {
        "rooms": [
          {"id": "bedroom", "color": "red", "shape": "rect", "x": 0, "y": 0, "w": 200, "h": 150},
          {"id": "living",  "color": "yellow", "shape": "rect", "x": 200, "y": 0, "w": 250, "h": 200},
          {"id": "kitchen", "color": "green", "shape": "rect", "x": 0, "y": 150, "w": 200, "h": 100}
        ] } },
    { "type": "RoomCard", "props": { "room": "bedroom", "charge": "$400 paint", "verdict": "illegal" } },
    { "type": "LawCitation", "props": { "statute": "CA Civ §1950.5(b)(3)", "text": "...", "applies_to": "bedroom" } },
    { "type": "EvidenceChecklist", "props": { "items": ["move-in paint photo", "lease end date confirmation"] } },
    { "type": "DemandLetterPreview", "props": { "pdf_url": "/preview/abc.pdf", "amount": 1200 } }
  ]
}
```

### The "change one fact" rebuild

When Rita types *"actually I lived there 6 months,"* the agent re-runs and emits a NEW UI plan with different components/props (bedroom now `yellow`, confidence drops to 54%, letter softens). React diffs the plan and reactively updates the screen. **No full reload. No template swap. Real generative UI.**

### Force-fit risk: **Only if we cheat.**
- ❌ Force-fit: hardcode "California screen" + "Texas screen" templates and toggle between them
- ✅ Legit: agent composes the screen from the kit per case; same agent code handles CA paint dispute, TX cleaning dispute, studio with 1 room, 3BR with 6 rooms

We are committing to the legit path. See `ARCHITECTURE.md` for the contract.

### About A2UI's actual API
A2UI is brand-new (announced at this hackathon). Our **component kit JSON schema above is our contract** — we'll align it with whatever A2UI ships in the starter kit on Friday. If A2UI ships matching primitives, we map our kit to theirs. If not, we render the kit ourselves and label our renderer "A2UI-compatible." Either way, the *shape* is correct: agent emits a UI plan, frontend interprets it.

---

## 🧪 The "are we force-fitting?" gut check

Before any feature lands, ask:

| Protocol | Honest test |
|---|---|
| **MCP** | Does the agent actually call this tool, or am I faking the call to look agentic? |
| **AG-UI** | Would the demo lose its tension if I removed the streaming panel? If no, it's decoration. |
| **A2UI** | If I removed A2UI and hardcoded screens, would the product fail to handle a NEW case (different state, different apartment shape, different charge mix)? If yes → A2UI is load-bearing. If no → force-fit. |

**RentProof passes all three** as long as we keep the agent composing the screen per case (not template-swapping).

---

## 🐶 TL;DR

- **MCP** = hands. Tools the agent calls. ✅ Real.
- **AG-UI** = voice + remote. Live reasoning + HITL approval + chat steering. ✅ Real.
- **A2UI** = drawing pad. Agent emits a UI plan; frontend renders. ✅ Real *if* we don't cheat with hardcoded templates.

The "change one fact → screen rebuilds" demo moment is the *single beat* that proves all 3 protocols are load-bearing. Don't lose it.
