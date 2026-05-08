"""Bedside FastAPI app — entry point.

Run locally:
    uv run uvicorn app.main:app --reload --port 8000

Then visit http://localhost:8000/health to confirm it's alive.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.data.demo_dataset import (
    HELEN_LOGS,
    PEOPLE,
    SARAH_LOGS,
    TOM_LOGS,
    TRIGGER_SEQUENCE,
)
from app.mcp_tools.observation_parser import (
    log_observation,
    reset_store,
)
from app.mcp_tools.scoring import update_wellbeing_score

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


def _seed_demo_logs() -> None:
    """Pre-stage Tom/Helen/Sarah's observations into the in-memory store.

    The agent treats these as 'already logged'; the live demo trigger then
    appends one more observation per use case to push the score past the
    threshold. Without this seed, the threshold never crosses on stage.
    """
    reset_store()
    for day, observer, text in TOM_LOGS:
        log_observation("tom", observer, text, day)
    for day, observer, text in HELEN_LOGS:
        log_observation("helen", observer, text, day)
    for day, observer, text in SARAH_LOGS:
        log_observation("sarah", observer, text, day)
    for person_id in PEOPLE:
        update_wellbeing_score(person_id)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _seed_demo_logs()
    yield
    # Shutdown: nothing to clean up (in-memory store dies with the process)


app = FastAPI(
    title="Bedside",
    description=(
        "The intelligent layer that was always missing. Three lenses, one "
        "app — the patient's body, the patient's mind, and the caregiver's "
        "breaking point."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness check — used by demo + monitoring."""
    return {"status": "ok", "service": "bedside", "version": "0.1.0"}


@app.get("/")
async def root() -> dict:
    return {
        "message": "Bedside backend is alive. See /docs for API.",
        "family": "Reynolds (Tom 68, Helen 84, Sarah 42)",
        "triggers": [t["id"] for t in TRIGGER_SEQUENCE],
    }


@app.get("/family")
async def family() -> dict:
    """Read-only view of the family + current scores. Frontend uses this on load."""
    return {pid: {**meta} for pid, meta in PEOPLE.items()}


# Routes wired in later build steps (Friday-evening block 5):
# - POST /demo/{trigger_id}  → run UC1 / UC2 / UC3 / combined trigger, returns UIPlan
# - POST /demo/reset         → wipe and re-seed
# - WS   /agui/stream        → AG-UI event stream (CopilotKit adapter)
