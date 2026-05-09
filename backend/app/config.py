"""Runtime configuration for Anchor."""
from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Load env vars from the caller's current working directory first, then fall
# back to backend/.env so `uvicorn app.main:app` works both from `backend/`
# and from the repository root.
load_dotenv()
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


@dataclass(frozen=True)
class Settings:
    database_url: str
    auth_secret_key: str
    frontend_origin: str
    auth_cookie_name: str
    auth_session_ttl_seconds: int
    auth_cookie_secure: bool


def _require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required.")
    return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        database_url=_require_env("DATABASE_URL"),
        auth_secret_key=_require_env("AUTH_SECRET_KEY"),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").strip(),
        auth_cookie_name=(
            os.getenv("AUTH_COOKIE_NAME", "anchor_session").strip() or "anchor_session"
        ),
        auth_session_ttl_seconds=int(os.getenv("AUTH_SESSION_TTL_SECONDS", "43200")),
        auth_cookie_secure=os.getenv("AUTH_COOKIE_SECURE", "false").strip().lower() == "true",
    )


def clear_settings_cache() -> None:
    get_settings.cache_clear()


def is_postgres_url(database_url: str) -> bool:
    return database_url.startswith(("postgresql://", "postgres://"))


def resolve_sqlite_path(database_url: str) -> Path:
    prefix = "sqlite:///"
    if not database_url.startswith(prefix):
        raise RuntimeError(
            "Only sqlite DATABASE_URL values are supported right now. "
            "Use a URL like sqlite:///./.data/anchor.db."
        )

    raw_path = database_url[len(prefix):].strip()
    if not raw_path:
        raise RuntimeError("DATABASE_URL must include a sqlite file path.")

    if raw_path == ":memory:":
        return Path(raw_path)

    return Path(raw_path).expanduser()
