# 🛏️ Bedside

> **The intelligent layer that was always missing.** Three lenses, one app — the patient's body, the patient's mind, and the caregiver's breaking point. You text it what you noticed. The dashboard rebuilds itself when something needs your attention.

Built for the **Generative UI Hackathon** (A2UI + AG-UI + MCP Apps), Saturday 2026-05-09, San Francisco.

---

## What is this?

63 million Americans are family caregivers. Most are doing complex care at home with zero training, a WhatsApp group, and a 9-page discharge PDF. Bedside is an AI that sits at the bedside when you can't.

You text it casual observations — *"Tom's ankles look swollen and he skipped dinner again"* — and it:
- Remembers everything across days
- Watches three people through three lenses simultaneously (body / mind / caregiver)
- Detects patterns across multi-day signals + multi-observer notes that no single human can track alone
- **Rebuilds the dashboard from scratch when a pattern crosses a threshold**

> **Not a medical device.** Bedside surfaces patterns from what you tell it, so you can share them with your healthcare team. Always consult a qualified clinician for medical decisions.

The killer A2UI moment: when all three lenses cross threshold simultaneously, the agent constructs a **CombinedTriageView** — a layout that has never appeared before in this family's app, because this exact combination has never occurred.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11+, uv) |
| Agent | Pydantic AI |
| LLM | Claude Sonnet (via Walmart Element) |
| MCP | mcp-use (Python SDK) — 8 tools |
| AG-UI | CopilotKit React SDK + Pydantic AI adapter |
| A2UI | Custom 9-component kit + 4 layouts + dev-mode UIPlanInspector |
| Frontend | React 18 + Vite + TypeScript + Tailwind 3 (pnpm) |

---

## Quick Start (local dev)

### Backend
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e . --index-url https://pypi.ci.artifacts.walmart.com/artifactory/api/pypi/external-pypi/simple --allow-insecure-host pypi.ci.artifacts.walmart.com
cp .env.example .env  # then fill in API keys
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
bedside/
├── backend/        FastAPI + Pydantic AI agent + 8 MCP tools
├── frontend/       React + Vite + A2UI component kit + AG-UI panel
├── archive/        Earlier directions (RentProof) — reference only
└── *.md            BEDSIDE_SPEC, START_HERE, IDEA_GRAVEYARD, AVI_RAMPUP
```

Full spec in `BEDSIDE_SPEC.md`. Onboarding in `START_HERE.md`.

---

## License

MIT — see `LICENSE`.
