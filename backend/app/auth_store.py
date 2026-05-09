"""Persistent user storage for email/password authentication.

Supports both SQLite (local dev) and PostgreSQL (Neon / production).
"""
from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from app.config import Settings, is_postgres_url, resolve_sqlite_path


@dataclass(frozen=True)
class UserRecord:
    id: int
    email: str
    password_hash: str
    created_at: str


# ---------------------------------------------------------------------------
# PostgreSQL helpers (psycopg v3)
# ---------------------------------------------------------------------------

@contextmanager
def _open_pg(database_url: str):
    import psycopg
    from psycopg.rows import dict_row

    conn = psycopg.connect(database_url, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _ensure_pg(database_url: str) -> None:
    with _open_pg(database_url) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def _create_user_pg(settings: Settings, email: str, password_hash: str) -> UserRecord:
    created_at = datetime.now(UTC).isoformat()
    with _open_pg(settings.database_url) as conn:
        row = conn.execute(
            """
            INSERT INTO users (email, password_hash, created_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
            """,
            (email, password_hash, created_at),
        ).fetchone()
        if row is None:
            raise ValueError(f"Email already registered: {email}")
        user_id = row["id"]
    return UserRecord(id=int(user_id), email=email, password_hash=password_hash, created_at=created_at)


def _get_by_email_pg(settings: Settings, email: str) -> UserRecord | None:
    with _open_pg(settings.database_url) as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = %s",
            (email,),
        ).fetchone()
    return _row_to_user_pg(row)


def _get_by_id_pg(settings: Settings, user_id: int) -> UserRecord | None:
    with _open_pg(settings.database_url) as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE id = %s",
            (user_id,),
        ).fetchone()
    return _row_to_user_pg(row)


def _row_to_user_pg(row: dict | None) -> UserRecord | None:
    if row is None:
        return None
    return UserRecord(
        id=int(row["id"]),
        email=str(row["email"]),
        password_hash=str(row["password_hash"]),
        created_at=str(row["created_at"]),
    )


# ---------------------------------------------------------------------------
# SQLite helpers (unchanged legacy path)
# ---------------------------------------------------------------------------

def _sqlite_connect(database_path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(
        ":memory:" if str(database_path) == ":memory:" else str(database_path),
        check_same_thread=False,
    )
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def open_user_store(settings: Settings) -> Iterator[sqlite3.Connection]:
    database_path = resolve_sqlite_path(settings.database_url)
    if str(database_path) != ":memory:":
        database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = _sqlite_connect(database_path)
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


# ---------------------------------------------------------------------------
# Public API — dispatches to Postgres or SQLite automatically
# ---------------------------------------------------------------------------

def ensure_user_store_ready(settings: Settings) -> None:
    if is_postgres_url(settings.database_url):
        _ensure_pg(settings.database_url)
        return
    with open_user_store(settings) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def create_user(settings: Settings, email: str, password_hash: str) -> UserRecord:
    if is_postgres_url(settings.database_url):
        return _create_user_pg(settings, email, password_hash)
    created_at = datetime.now(UTC).isoformat()
    with open_user_store(settings) as connection:
        cursor = connection.execute(
            """
            INSERT INTO users (email, password_hash, created_at)
            VALUES (?, ?, ?)
            """,
            (email, password_hash, created_at),
        )
        user_id = cursor.lastrowid
    return UserRecord(
        id=int(user_id),
        email=email,
        password_hash=password_hash,
        created_at=created_at,
    )


def get_user_by_email(settings: Settings, email: str) -> UserRecord | None:
    if is_postgres_url(settings.database_url):
        return _get_by_email_pg(settings, email)
    with open_user_store(settings) as connection:
        row = connection.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    return _row_to_user(row)


def get_user_by_id(settings: Settings, user_id: int) -> UserRecord | None:
    if is_postgres_url(settings.database_url):
        return _get_by_id_pg(settings, user_id)
    with open_user_store(settings) as connection:
        row = connection.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    return _row_to_user(row)


def _row_to_user(row: sqlite3.Row | None) -> UserRecord | None:
    if row is None:
        return None
    return UserRecord(
        id=int(row["id"]),
        email=str(row["email"]),
        password_hash=str(row["password_hash"]),
        created_at=str(row["created_at"]),
    )
