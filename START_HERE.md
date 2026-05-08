# 🟢 START HERE — Fresh Session Onboarding

> If you are an AI session that just got handed this project, read this file FIRST. 60 seconds. Saves Avinash from re-explaining everything.

---

## 🚨 STATUS AS OF 2026-05-08 LATE EVENING

**🔒 PIVOTED FROM RentProof → Bedside. Locked. Building now.**

We are building **Bedside** — *"The intelligent layer that was always missing. Three lenses, one app — the patient's body, the patient's mind, and the caregiver's breaking point. You text it what you notice. The dashboard rebuilds itself when something needs your attention."*

**Event:** Generative UI Hackathon (A2UI + AG-UI + MCP Apps)
**Date:** **Saturday 2026-05-09** (event day — under 24 hrs out)
**Today:** Friday 2026-05-08 evening
**Venue:** San Francisco
**Mode:** Solo
**Goal:** Win Mac Minis 🥇

---

## 📦 What's already shipped

- ✅ Pivot decision committed: RentProof archived to `archive/rentproof_design/`
- ✅ `BEDSIDE_SPEC.md` written — single source of truth (read this first)
- ✅ Reusable scaffold from RentProof: FastAPI shell, React/Vite, Walmart Tailwind palette, .gitignore, .env.example
- ✅ Family chosen: **Tom Reynolds** (68, post-cardiac), **Helen Reynolds** (84, dementia, Tom's mom), **Sarah Reynolds** (42, Tom's wife, sole caregiver)

## 🚧 What's NOT done yet (Friday-evening + Saturday-morning queue)

### Friday evening (target: 6 hours of build, ~end at midnight)
- ⏳ Pre-loaded demo dataset module (`backend/app/data/demo_dataset.py`)
- ⏳ Safer-language constants file (`backend/app/data/language_rules.py`)
- ⏳ UI plan models rewrite — 10 components, 4 layouts (`backend/app/ui_plan.py`)
- ⏳ 8 MCP tools (parse_observation_log, update_wellbeing_score, check_pattern_match, get_pattern_context, find_local_support, draft_talking_points, log_observation, calculate_observation_rate)
- ⏳ Agent prompt v1 (`backend/app/prompts/system.md`) — Pydantic AI + Claude Sonnet
- ⏳ Scripted-trigger endpoints (`/demo/uc1`, `/uc2`, `/uc3`, `/combined`, `/reset`)
- ⏳ Smoke test: each trigger produces correct UIPlan JSON

### Saturday morning (target: 6 hours, end by 1pm)
- ⏳ React renderer for 10 components + 4 layout wrappers
- ⏳ AG-UI streaming wired (CopilotKit adapter)
- ⏳ UIPlanInspector debug panel (collapsible JSON viewer)
- ⏳ Walmart palette + WCAG AA pass
- ⏳ Pitch script + 5 dry runs + record backup video

---

## 📖 Read these files in this order

1. **`BEDSIDE_SPEC.md`** — product truth: pitch, 3 use cases, demo flow, components, build plan, safer-language rules. **Read end-to-end.**
2. **`IDEA_GRAVEYARD.md`** — every idea we killed (RentProof now archived too). **Do NOT re-suggest.**
3. **`AVI_RAMPUP.md`** — the journey (Rounds 1–7 of brainstorming). Background only.
4. **`../AVINASH_HACKATHON_BRAIN.md`** — cross-event persona. **TL;DR section is mandatory.**
5. **`archive/rentproof_design/`** — the previous direction. Reference only — do not revive.

---

## ⚡ Critical context in 30 seconds

- **Who:** Avinash. Walmart employee. Director-not-coder (he directs, AI executes).
- **Goal:** Win Mac Minis Saturday May 9. Non-negotiable — winning gives him credibility within Walmart.
- **Past hackathons:** 1 win (AI Ops Lab), 1 loss (Echo). Echo lost because the topic was generic. Avinash is HYPER-ALLERGIC to generic, B2B-dev-tooling, or "two-prompts-away" ideas.
- **This event:** Must use 3 protocols (A2UI, AG-UI, MCP Apps). Solo. Saturday is event day (12pm doors, 1–5pm build, 5pm demo). Engineer-heavy judges (the protocol creators themselves).
- **Where we are:** Bedside is FROZEN, scaffold is partly reusable, **no more idea pivots.** Build mode only.

---

## 🚨 Do NOT do these things

1. ❌ Do NOT suggest a new idea. Bedside is frozen. We are <24h from event day.
2. ❌ Do NOT re-introduce clinical language. **Safer-language rules** in `BEDSIDE_SPEC.md` §10 are non-negotiable. No "diagnose," "cardiac drift," "treat," "medical advice," "you should." Use observational/wellness phrasing only.
3. ❌ Do NOT use jargon ("load-bearing," "non-obvious application"). Plain English. Avinash will call you out.
4. ❌ Do NOT pitch B2B / dev tooling / "Cursor for X." See `IDEA_GRAVEYARD.md`.
5. ❌ Do NOT propose ideas reachable in 2 ChatGPT prompts.
6. ❌ Do NOT give long responses with 5 tables when Avinash asks a clarification question. Tight, plain English, end with a clear question.
7. ❌ Do NOT settle when Avinash pushes back. Take it seriously, think harder, come back better.
8. ❌ Do NOT bug Avinash about non-actionable info (city, URL, judging tier). He handles event logistics.
9. ❌ Do NOT make changes the user didn't ask for. If you spot something worth fixing, ask first.
10. ❌ Do NOT revive RentProof or any other archived idea.

## ✅ DO these things

1. ✅ Be sharp, opinionated, decisive. Lead with the answer, justify after.
2. ✅ Always include a devil's-advocate take.
3. ✅ Use plain English with concrete examples (Sarah, Tom's swollen ankles, Helen forgot the year).
4. ✅ When the user uploads a doc, **read it before doing anything else**.
5. ✅ Update `BEDSIDE_SPEC.md` build-plan checkboxes as items ship.
6. ✅ Update `../AVINASH_HACKATHON_BRAIN.md` only when a NEW pattern emerges across hackathons.
7. ✅ Commit often with descriptive messages (git is our undo button).

---

## 🎯 What to do FIRST in a new session

1. Read `BEDSIDE_SPEC.md` end-to-end (5 min)
2. Skim `IDEA_GRAVEYARD.md` (2 min) — don't re-suggest dead ideas
3. Skim `../AVINASH_HACKATHON_BRAIN.md` TL;DR (2 min) — how to talk to Avinash
4. Run `git log --oneline -15` to see what's already shipped
5. Check `BEDSIDE_SPEC.md` §11 build plan — pick up the next unshipped item
6. Open with: *"Caught up. Next item in the build plan is X. Starting now."*

That's it. Total ramp: ~15 minutes. Now go read `BEDSIDE_SPEC.md`. 🐶
