"""iMessage alerts via Photon / spectrum-ts.

Two tiers:
  • score < 50  → ⚠️  Warning — describe the situation
  • score < 20  → 🔴  Red Alarm — include recommended action
"""
from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

log = logging.getLogger(__name__)

ALERT_PHONES   = ["+16692934357", "+18148529908"]
_FRONTEND_DIR  = Path(__file__).parent.parent.parent / "frontend"
_NOTIFY_SCRIPT = _FRONTEND_DIR / "notify.mjs"

# Track the last alert tier sent per person so we don't spam on every update.
# Key: person_id → "warning" | "alarm" | None
_LAST_TIER: dict[str, str] = {}


def _load_frontend_env() -> dict[str, str]:
    env_file = _FRONTEND_DIR / ".env"
    result: dict[str, str] = {}
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                result[k.strip()] = v.strip()
    return result


def _compose_message(display_name: str, score: int) -> str:
    if score < 20:
        return (
            f"🔴 RED ALARM — Anchor Care System\n"
            f"{display_name}'s wellbeing score: {score}/100\n"
            f"Status: Critical — immediate intervention needed.\n"
            f"Recommended action: Contact {display_name}'s primary care provider "
            f"today and arrange an in-person assessment. Do not wait."
        )
    # score < 50
    return (
        f"⚠️ WARNING — Anchor Care System\n"
        f"{display_name}'s wellbeing score: {score}/100\n"
        f"Status: Declining — closer monitoring required.\n"
        f"Please review recent observations in the Anchor workspace "
        f"and consider scheduling a check-in with {display_name} soon."
    )


async def _send_to_phone(phone: str, message: str, env: dict[str, str]) -> None:
    try:
        proc = await asyncio.create_subprocess_exec(
            "node",
            str(_NOTIFY_SCRIPT),
            phone,
            message,
            env=env,
            cwd=str(_FRONTEND_DIR),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
        if proc.returncode != 0:
            log.error("iMessage to %s failed (rc=%d): %s", phone, proc.returncode, stderr.decode())
        else:
            log.info("iMessage alert sent to %s", phone)
    except asyncio.TimeoutError:
        log.error("iMessage to %s timed out", phone)
    except Exception as exc:
        log.error("iMessage to %s error: %s", phone, exc)


async def maybe_alert(person_id: str, display_name: str, wellbeing_score: int) -> None:
    """Send iMessage alert if score crossed a threshold we haven't announced yet."""
    if wellbeing_score >= 50:
        # Back above warning level — allow future alerts if it dips again
        _LAST_TIER.pop(person_id, None)
        return

    tier = "alarm" if wellbeing_score < 20 else "warning"
    last = _LAST_TIER.get(person_id)

    # Only escalate — don't re-send the same or lower tier
    if last == "alarm":
        return
    if last == "warning" and tier == "warning":
        return

    _LAST_TIER[person_id] = tier

    env = {**os.environ, **_load_frontend_env()}
    message = _compose_message(display_name, wellbeing_score)

    log.info(
        "Sending %s iMessage for %s (score=%d) to %s",
        tier, person_id, wellbeing_score, ALERT_PHONES,
    )
    await asyncio.gather(*[_send_to_phone(p, message, env) for p in ALERT_PHONES])


def reset_alerts() -> None:
    """Clear alert history on demo reset so triggers re-fire."""
    _LAST_TIER.clear()
