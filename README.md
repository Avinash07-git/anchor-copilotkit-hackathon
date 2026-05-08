# 🏠 RentProof

> An AI investigator that builds renters a custom evidence room for their security-deposit dispute. **Change a fact → the room rebuilds itself.**

Built for the **Generative UI Hackathon** (A2UI + AG-UI + MCP Apps), Saturday 2026-05-09, San Francisco.

---

## What is this?

Your landlord kept your deposit. You upload their deduction letter, your lease, and your photos. RentProof's AI agent investigates each charge against your state's law and renders you a **custom evidence room**: a top-down floor plan of your apartment with each room color-coded:

- 🟢 **Green** — the charge is fair, accept it
- 🟡 **Yellow** — ambiguous, you need more proof
- 🔴 **Red** — illegal under your state's law, fight it

Click any room → see the actual statute. Type a correction in chat → the screen rebuilds itself live. Approve the demand letter → download a ready-to-mail PDF.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11+, uv) |
| Agent | Pydantic AI |
| LLM | Gemini 2.5 Flash (public Google AI Studio API, free tier) → 2.0 Flash → Gemma fallback |
| MCP | mcp-use (Python SDK) |
| AG-UI | CopilotKit React SDK + Pydantic AI adapter |
| A2UI | Custom 6-component kit (will be mapped to A2UI starter kit when it drops) |
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
