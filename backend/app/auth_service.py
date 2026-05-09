"""Application-layer auth operations."""
from __future__ import annotations

import sqlite3

from app.auth_security import hash_password, normalize_email, verify_password
from app.auth_store import UserRecord, create_user, get_user_by_email, get_user_by_id
from app.config import Settings


def register_user(settings: Settings, email: str, password: str) -> UserRecord:
    normalized_email = normalize_email(email)
    if get_user_by_email(settings, normalized_email):
        raise ValueError("That email is already registered.")

    password_hash = hash_password(password)
    try:
        return create_user(settings, normalized_email, password_hash)
    except sqlite3.IntegrityError as exc:
        raise ValueError("That email is already registered.") from exc


def authenticate_user(settings: Settings, email: str, password: str) -> UserRecord | None:
    normalized_email = normalize_email(email)
    user = get_user_by_email(settings, normalized_email)
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def require_user(settings: Settings, user_id: int) -> UserRecord:
    user = get_user_by_id(settings, user_id)
    if user is None:
        raise ValueError("User not found.")
    return user
