# 🏠 RentProof

> An AI investigator that builds renters a custom evidence room for their security-deposit dispute. **Change a fact → the room rebuilds itself.**

Built for the **Generative UI Hackathon** (A2UI + AG-UI + MCP Apps), Saturday 2026-05-09, San Francisco.

---

## What is this?

Your landlord kept your deposit. You upload their deduction letter, your lease, and your photos. RentProof's AI agent investigates each charge against your state's law and renders you a **custom evidence room**: a top-down floor plan of your apartment with each room color-coded by case strength:

- 🟢 **Likely reasonable** — the deduction looks fair given the lease + photos + rule snippet
- 🟡 **Needs more proof** — it could go either way; gather the listed evidence
- 🔴 **Worth challenging** — based on the documents, this one's worth pushing back on

Click any room → see the actual statute and case-specific reasoning. Type or speak a correction ("actually I lived there 6 months") → the agent re-evaluates and the screen reactively rebuilds itself live. Approve the draft response letter → download a ready-to-mail PDF.

> **Not legal advice.** RentProof helps renters organize evidence and draft a response letter; it never claims a deduction is "illegal." Confirm with a tenant-rights attorney before filing in court.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11+, uv) |
| Agent | Pydantic AI |
| LLM | Gemini 2.5 Flash (public Google AI Studio API, free tier) → 2.0 Flash → Gemma fallback |
| MCP | mcp-use (Python SDK) |
| AG-UI | CopilotKit React SDK + Pydantic AI adapter |
| A2UI | Custom 7-component kit (ConfidenceMeter, FloorPlan, BulkPhotoBin, RoomCard, LawCitation, EvidenceChecklist, DemandLetterPreview) + dev-mode UIPlanInspector — mapped to the A2UI starter kit on event day |
| Frontend | React 18 + Vite + TypeScript + Tailwind 3 (pnpm) |
| PDF | pdfplumber (read) + ReportLab (write) |

---

## Quick Start (local dev)

### Backend
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e . --index-url https://pypi.ci.artifacts.walmart.com/artifactory/api/pypi/external-pypi/simple --allow-insecure-host pypi.ci.artifacts.walmart.com
cp .env.example .env  # then fill in GEMINI_API_KEY
uv run uvicorn app.main:app --reload --port 8000
# open http://localhost:8000/health
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
# open http://localhost:5173
```

---

## Project Layout

```
rentproof/
├── backend/        FastAPI + Pydantic AI agent + MCP tools
├── frontend/       React + Vite + A2UI component kit + AG-UI panel
├── docs/           Design artifacts (symlinked from ../*.md)
└── scripts/        Demo data generators (mock landlord letter, lease)
```

Full architecture in `../ARCHITECTURE.md`. Wireframes in `../SCREENS.md`. Protocol cheat sheet in `../PROTOCOL_NOTES.md`.

---

## License

MIT — see `LICENSE`.
