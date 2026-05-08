"""MCP tool: read_photo_metadata — extracts EXIF dates from move-in/out photos.

v0.1: returns hardcoded mock data for Rita's case.
v1.0: real EXIF parsing via Pillow.
"""
from __future__ import annotations

from typing import TypedDict


class PhotoMeta(TypedDict):
    filename: str
    taken_at: str  # ISO 8601
    room_label: str
    phase: str  # "movein" | "moveout"


# Mock metadata for Rita's demo photos (matches PHOTO_SHOPPING_LIST.md).
_DEMO_PHOTOS: list[PhotoMeta] = [
    {"filename": "bedroom_movein.jpg",  "taken_at": "2023-05-01T10:00:00", "room_label": "bedroom", "phase": "movein"},
    {"filename": "living_movein.jpg",   "taken_at": "2023-05-01T10:05:00", "room_label": "living",  "phase": "movein"},
    {"filename": "kitchen_movein.jpg",  "taken_at": "2023-05-01T10:10:00", "room_label": "kitchen", "phase": "movein"},
    {"filename": "hall_movein.jpg",     "taken_at": "2023-05-01T10:15:00", "room_label": "hall",    "phase": "movein"},
    {"filename": "bedroom_moveout.jpg", "taken_at": "2026-04-30T14:00:00", "room_label": "bedroom", "phase": "moveout"},
    {"filename": "living_moveout.jpg",  "taken_at": "2026-04-30T14:05:00", "room_label": "living",  "phase": "moveout"},
    {"filename": "kitchen_moveout.jpg", "taken_at": "2026-04-30T14:10:00", "room_label": "kitchen", "phase": "moveout"},
    {"filename": "hall_moveout.jpg",    "taken_at": "2026-04-30T14:15:00", "room_label": "hall",    "phase": "moveout"},
]


def read_photo_metadata(path: str) -> list[PhotoMeta]:
    """Return EXIF metadata for all photos in the given directory.

    MOCKED for v0.1 — ignores path, returns Rita's demo set.
    """
    return _DEMO_PHOTOS.copy()
