"""Password hashing and signed session helpers."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
import secrets
import time

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PASSWORD_MIN_LENGTH = 8
PBKDF2_ITERATIONS = 310_000


def normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if not normalized or not EMAIL_PATTERN.match(normalized):
        raise ValueError("Enter a valid email address.")
    return normalized


def validate_password(password: str) -> str:
    trimmed = password.strip()
    if len(trimmed) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters.")
    if len(trimmed) > 128:
        raise ValueError("Password must be 128 characters or fewer.")
    return trimmed


def hash_password(password: str) -> str:
    password_bytes = validate_password(password).encode("utf-8")
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password_bytes, salt, PBKDF2_ITERATIONS)
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}$"
        f"{base64.urlsafe_b64encode(salt).decode('ascii')}$"
        f"{base64.urlsafe_b64encode(digest).decode('ascii')}"
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_raw, salt_raw, digest_raw = stored_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    password_bytes = password.encode("utf-8")
    iterations = int(iterations_raw)
    salt = base64.urlsafe_b64decode(salt_raw.encode("ascii"))
    expected_digest = base64.urlsafe_b64decode(digest_raw.encode("ascii"))
    candidate_digest = hashlib.pbkdf2_hmac("sha256", password_bytes, salt, iterations)
    return hmac.compare_digest(candidate_digest, expected_digest)


def create_session_token(
    *,
    user_id: int,
    email: str,
    secret_key: str,
    ttl_seconds: int,
) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": int(time.time()) + ttl_seconds,
    }
    encoded_payload = _urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(
        secret_key.encode("utf-8"),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()
    encoded_signature = _urlsafe_b64encode(signature)
    return f"{encoded_payload}.{encoded_signature}"


def verify_session_token(token: str, secret_key: str) -> dict[str, object]:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
    except ValueError as exc:
        raise ValueError("Malformed session token.") from exc

    expected_signature = hmac.new(
        secret_key.encode("utf-8"),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()
    actual_signature = _urlsafe_b64decode(encoded_signature)
    if not hmac.compare_digest(actual_signature, expected_signature):
        raise ValueError("Invalid session signature.")

    payload = json.loads(_urlsafe_b64decode(encoded_payload).decode("utf-8"))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise ValueError("Session has expired.")
    return payload


def _urlsafe_b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _urlsafe_b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}".encode("ascii"))
