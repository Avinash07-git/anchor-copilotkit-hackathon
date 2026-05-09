# anchor-backend

FastAPI + Pydantic AI backend for **Anchor** — see the top-level
`/README.md` and `ANCHOR_SPEC.md` for the full project description.

Local quick start:

```bash
uv venv
source .venv/bin/activate
uv pip install -e .
export DATABASE_URL=sqlite:///./.data/anchor.db
export AUTH_SECRET_KEY=replace-this-with-a-long-random-secret
ANCHOR_FORCE_DETERMINISTIC=1 uv run uvicorn app.main:app --reload --port 8000
```

Optional protocol proof:

```bash
python -m app.mcp_server
```

That exposes the same eight Anchor tools through a real MCP `FastMCP` server
for sponsor/judge inspection.
