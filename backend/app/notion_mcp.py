"""Notion MCP client via mcp-use + direct REST API.

Two layers:
  1. mcp-use  → agent-callable tools (search, fetch) via @notionhq/notion-mcp-server
  2. REST API → fast writes (log_care_entry) without MCP overhead
"""
from __future__ import annotations

import json
import logging
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import requests as _requests

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

NOTION_TOKEN        = os.getenv("NOTION_TOKEN", "")
NOTION_PARENT_PAGE  = os.getenv("NOTION_PARENT_PAGE_ID", "")
NOTION_CARE_DB_ID   = os.getenv("NOTION_CARE_DB_ID", "")

_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

_PATIENT_DISPLAY = {
    "tom":   "Tom Reynolds",
    "helen": "Helen Reynolds",
    "sarah": "Sarah Reynolds",
}

# ---------------------------------------------------------------------------
# Database bootstrap
# ---------------------------------------------------------------------------

_DB_CACHE_FILE = Path(__file__).parent / ".notion_db_id"


def _save_db_id(db_id: str) -> None:
    _DB_CACHE_FILE.write_text(db_id)
    os.environ["NOTION_CARE_DB_ID"] = db_id


def get_care_db_id() -> str | None:
    """Return the Anchor Care Log database ID, creating it if needed."""
    global NOTION_CARE_DB_ID

    # 1. Env var wins
    if NOTION_CARE_DB_ID:
        return NOTION_CARE_DB_ID

    # 2. Cached from previous run
    if _DB_CACHE_FILE.exists():
        NOTION_CARE_DB_ID = _DB_CACHE_FILE.read_text().strip()
        return NOTION_CARE_DB_ID

    # 3. Try creating under the parent page
    if not NOTION_PARENT_PAGE or not NOTION_TOKEN:
        log.warning("NOTION_PARENT_PAGE_ID not set — Notion sync disabled")
        return None

    return _create_care_db()


def _create_care_db() -> str | None:
    """Create the Anchor Care Log database under NOTION_PARENT_PAGE."""
    body = {
        "parent": {"type": "page_id", "page_id": NOTION_PARENT_PAGE},
        "icon": {"type": "emoji", "emoji": "⚕️"},
        "title": [{"type": "text", "text": {"content": "Anchor Care Log"}}],
        "properties": {
            "Name":            {"title": {}},
            "Patient":         {"select": {"options": [
                {"name": "Tom Reynolds",   "color": "blue"},
                {"name": "Helen Reynolds", "color": "purple"},
                {"name": "Sarah Reynolds", "color": "orange"},
            ]}},
            "Observer":        {"rich_text": {}},
            "Observation":     {"rich_text": {}},
            "Wellbeing Score": {"number": {"format": "number"}},
            "Alert Level":     {"select": {"options": [
                {"name": "green",  "color": "green"},
                {"name": "yellow", "color": "yellow"},
                {"name": "amber",  "color": "orange"},
                {"name": "red",    "color": "red"},
            ]}},
            "Date":            {"date": {}},
        },
    }
    r = _requests.post("https://api.notion.com/v1/databases", headers=_HEADERS, json=body, timeout=15)
    if r.status_code != 200:
        log.error("Failed to create Notion DB: %s %s", r.status_code, r.text[:200])
        return None
    db_id: str = r.json()["id"]
    _save_db_id(db_id)
    log.info("Created Notion Care Log DB: %s", db_id)
    return db_id


# ---------------------------------------------------------------------------
# Write: log care entry
# ---------------------------------------------------------------------------

def log_care_entry(
    person_id: str,
    observer: str,
    observation: str,
    wellbeing_score: int,
    alert_level: str,
) -> bool:
    """Create a page in the Notion Care Log database. Returns True on success."""
    db_id = get_care_db_id()
    if not db_id:
        return False

    patient = _PATIENT_DISPLAY.get(person_id, person_id.title())
    today = datetime.now(UTC).date().isoformat()
    title = f"{patient} — {today}"

    body = {
        "parent": {"database_id": db_id},
        "icon": {
            "type": "emoji",
            "emoji": "🔴" if alert_level == "red" else "🟡" if alert_level in ("yellow", "amber") else "🟢",
        },
        "properties": {
            "Name":            {"title": [{"text": {"content": title}}]},
            "Patient":         {"select": {"name": patient}},
            "Observer":        {"rich_text": [{"text": {"content": observer}}]},
            "Observation":     {"rich_text": [{"text": {"content": observation[:2000]}}]},
            "Wellbeing Score": {"number": wellbeing_score},
            "Alert Level":     {"select": {"name": alert_level}},
            "Date":            {"date": {"start": today}},
        },
    }
    try:
        r = _requests.post("https://api.notion.com/v1/pages", headers=_HEADERS, json=body, timeout=15)
        if r.status_code == 200:
            return True
        log.error("Notion page create failed: %s %s", r.status_code, r.text[:200])
    except Exception as exc:
        log.error("Notion write error: %s", exc)
    return False


# ---------------------------------------------------------------------------
# Read: recent entries
# ---------------------------------------------------------------------------

def get_recent_entries(limit: int = 20) -> list[dict[str, Any]]:
    """Return the most recent care log entries from Notion."""
    db_id = get_care_db_id()
    if not db_id:
        return []

    body = {
        "sorts": [{"property": "Date", "direction": "descending"}],
        "page_size": limit,
    }
    try:
        r = _requests.post(
            f"https://api.notion.com/v1/databases/{db_id}/query",
            headers=_HEADERS, json=body, timeout=15,
        )
        if r.status_code != 200:
            return []
        pages = r.json().get("results", [])
        return [_parse_entry(p) for p in pages]
    except Exception as exc:
        log.error("Notion read error: %s", exc)
        return []


def _parse_entry(page: dict) -> dict[str, Any]:
    props = page.get("properties", {})

    def text(key: str) -> str:
        items = props.get(key, {}).get("rich_text", [])
        return items[0]["plain_text"] if items else ""

    def select(key: str) -> str:
        sel = props.get(key, {}).get("select")
        return sel["name"] if sel else ""

    def number(key: str) -> int | None:
        return props.get(key, {}).get("number")

    def title_text() -> str:
        items = props.get("Name", {}).get("title", [])
        return items[0]["plain_text"] if items else ""

    def date(key: str) -> str:
        d = props.get(key, {}).get("date")
        return d["start"] if d else ""

    return {
        "id":               page.get("id", ""),
        "url":              page.get("url", ""),
        "title":            title_text(),
        "patient":          select("Patient"),
        "observer":         text("Observer"),
        "observation":      text("Observation"),
        "wellbeing_score":  number("Wellbeing Score"),
        "alert_level":      select("Alert Level"),
        "date":             date("Date"),
    }


# ---------------------------------------------------------------------------
# MCP-use: agent tool (search via @notionhq/notion-mcp-server)
# ---------------------------------------------------------------------------

_MCP_CONFIG = {
    "mcpServers": {
        "notion": {
            "command": "npx",
            "args": ["-y", "@notionhq/notion-mcp-server"],
            "env": {"NOTION_TOKEN": NOTION_TOKEN},
        }
    }
}


async def mcp_search(query: str) -> str:
    """Search Notion workspace via MCP. Returns plain-text summary."""
    if not NOTION_TOKEN:
        return "Notion not configured."
    try:
        from mcp_use import MCPClient

        client = MCPClient.from_dict(_MCP_CONFIG)
        await client.create_all_sessions()
        session = client.get_session("notion")
        result = await session.call_tool("notion-search", {"query": query})
        await client.close_all_sessions()
        if result.content:
            return result.content[0].text if hasattr(result.content[0], "text") else str(result.content[0])
        return "No results."
    except Exception as exc:
        log.error("Notion MCP search failed: %s", exc)
        return f"Search error: {exc}"


async def mcp_fetch(url_or_id: str) -> str:
    """Fetch a Notion page or database by URL or ID via MCP."""
    if not NOTION_TOKEN:
        return "Notion not configured."
    try:
        from mcp_use import MCPClient

        client = MCPClient.from_dict(_MCP_CONFIG)
        await client.create_all_sessions()
        session = client.get_session("notion")
        result = await session.call_tool("notion-fetch", {"url": url_or_id})
        await client.close_all_sessions()
        if result.content:
            return result.content[0].text if hasattr(result.content[0], "text") else str(result.content[0])
        return "Not found."
    except Exception as exc:
        log.error("Notion MCP fetch failed: %s", exc)
        return f"Fetch error: {exc}"
