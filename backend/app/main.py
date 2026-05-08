"""RentProof FastAPI app — entry point.

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

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm up the agent, load statute data, etc. (wired in later steps)
    yield
    # Shutdown: clean up resources


app = FastAPI(
    title="RentProof",
    description="AI investigator that builds a custom evidence room for renter deposit disputes.",
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
    return {"status": "ok", "service": "rentproof", "version": "0.1.0"}


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "RentProof backend is alive. See /docs for API.",
        "evidence_room": "coming soon",
    }


# Routes wired in later build steps:
# - POST /session     → create investigation session
# - POST /upload      → upload landlord letter / lease / photos
# - WS   /agui/{sid}  → AG-UI event stream
# - GET  /letter/{sid} → download generated demand letter PDF
