# 🟢 START HERE — Fresh Session Onboarding

> If you are an AI session that just got handed this project, read this file FIRST. It takes 60 seconds and will save Avinash from re-explaining everything.

---

## 🚨 STATUS AS OF 2026-05-08 (END OF DAY 1)

**🔒 IDEA + DESIGN ARE FROZEN. SAFER-LANGUAGE PASS IS DONE. SCAFFOLD IS DONE. NO MORE PIVOTS.**

We are building **RentProof** — *"An AI investigator that builds renters a custom evidence room for their security-deposit dispute. Change a fact → the room rebuilds itself."*

**Event:** Generative UI Hackathon (A2UI + AG-UI + MCP Apps)
**Date:** **Saturday 2026-05-09** (event day — under 24 hrs out)
**Today is:** Friday 2026-05-08 (the only full build day before event)
**Venue:** San Francisco
**Mode:** Solo
**Goal:** Win Mac Minis 🥇

> **Date discipline:** May 7 = Thursday, **May 8 = Friday**, **May 9 = Saturday**. An earlier draft had this wrong; it's fixed everywhere now (commit `b21e057`).

---

## 📦 What's already shipped (don't redo this)

- ✅ Design phase: `RENTPROOF_SPEC.md`, `PROTOCOL_NOTES.md`, `ARCHITECTURE.md`, `SCREENS.md` all locked
- ✅ Scaffold: FastAPI backend boots, React/Vite frontend skeleton, Walmart Tailwind palette, .gitignore + .env.example, MCP tool stubs (5 tools), CA §1950.5 + TX §92.104 statute briefs, agent system prompt v1
- ✅ **GPT-review feedback fully incorporated** (commit `b10aa06` + `b21e057`). The review lives at `/Users/a0a0kbv/Documents/GPT Response.docx` and addressed: safer language ("worth_challenging" / "needs_more_proof" / "likely_reasonable" instead of "illegal" / "ambiguous" / "fair"), accurate CA §1950.5 framing, verifiable stats (44M renters, 85% paid deposit, AB 12, April-2025 photo-proof rule, SF 4.2% interest) instead of the fake "$4.5B stolen", "change one fact" as the headline A2UI beat (state-switch demoted to encore), `UIPlanInspector` dev panel for engineer judges, `BulkPhotoBin` + drag-drop photos onto FloorPlan rooms, voice intake + voice corrections, mandatory disclaimer on the draft letter, build-plan date fix.

## 🚧 What's NOT done yet (this is the build queue)

- ⏳ Mock landlord-letter PDF + mock lease PDF (need `scripts/make_demo_*.py`)
- ⏳ Demo photos (Avinash grabs — see `backend/app/data/demo_photos/PHOTO_SHOPPING_LIST.md`)
- ⏳ Pydantic AI agent wired to Gemini → emits valid `UIPlan` JSON for Rita's case
- ⏳ AG-UI WebSocket adapter (CopilotKit + Pydantic AI adapter)
- ⏳ The 7 A2UI components rendered + the dev-only `UIPlanInspector` panel
- ⏳ Bulk-photo dump + Gemini-vision auto-classification + drag-drop onto FloorPlan rooms
- ⏳ Voice intake on landing + voice corrections in chat
- ⏳ "Change one fact" reactive re-render
- ⏳ TX state variant + state switcher (encore beat)
- ⏳ Real PDF generation (CA + TX templates) via ReportLab
- ⏳ HITL approval modal for the draft letter
- ⏳ Walmart-palette polish + WCAG AA pass
- ⏳ Backup demo video recorded
- ⏳ 5 pitch rehearsals

---

## 📖 Read these files in this order

1. **`RENTPROOF_SPEC.md`** — product truth: pitch, demo arc, scope, build plan
2. **`PROTOCOL_NOTES.md`** — plain-English cheat sheet for A2UI / AG-UI / MCP. Read this BEFORE you try to defend the protocol fit to anyone
3. **`ARCHITECTURE.md`** — the blueprint. Tech stack, system diagram, folder structure, data flow, agent system prompt, A2UI component kit JSON contract, build order
4. **`SCREENS.md`** — wireframes for every screen, the killer storyboard, the visual language (Walmart palette, WCAG AA, color-blind-safe verdict labels)
5. **`IDEA_GRAVEYARD.md`** — every idea we killed and why. **Do NOT re-suggest any of them**
6. **`AVI_RAMPUP.md`** — the journey (Rounds 1–7 of brainstorming). Background only
7. **`../AVINASH_HACKATHON_BRAIN.md`** — cross-event persona. **TL;DR section is mandatory reading**

---

## ⚡ Critical context in 30 seconds

- **Who:** Avinash. Walmart employee. Director-not-coder (he directs, AI executes)
- **Goal:** Win Mac Minis Saturday May 9. **Non-negotiable** — winning gives him credibility within Walmart
- **Past hackathons:** 1 win (AI Ops Lab, April 25), 1 loss (Echo, May 2). Echo lost because the topic was generic. He is HYPER-ALLERGIC to anything cliche, generic, B2B-dev-tooling, or "two-prompts-away"
- **This event:** Must use 3 protocols (A2UI, AG-UI, MCP Apps). Solo. Saturday is event day (12:00 PM doors, 1–5 PM build, 5 PM demo). Engineer-heavy judges (the protocol creators themselves)
- **Where we are:** RentProof is FROZEN, scaffold is DONE, GPT-review feedback is INCORPORATED. **Friday May 8 is the only full build day.** Build mode only

---

## 🚨 Do NOT do these things (recurring mistakes from this thread)

1. ❌ Do NOT suggest a new idea. RentProof is frozen. If Avinash says he wants to pivot, push back hard — we're under 24 hours from event day
2. ❌ Do NOT use jargon ("load-bearing," "non-obvious application," etc.). Plain English. Avinash will call you out instantly
3. ❌ Do NOT pitch B2B / dev tooling / "Cursor for X" ideas. They live in `IDEA_GRAVEYARD.md`
4. ❌ Do NOT propose ideas reachable in 2 ChatGPT prompts
5. ❌ Do NOT say "your mom" in examples. Use **Rita Sharma** as the named user
6. ❌ Do NOT give long responses with 5 tables when Avinash asks a clarification question. Tight, plain English, end with a clear question
7. ❌ Do NOT settle when Avinash pushes back. Take it seriously, think harder, come back better
8. ❌ Do NOT bug Avinash about non-actionable info (city, URL, judging tier). He handles event logistics
9. ❌ Do NOT re-introduce the words **"illegal," "stolen," "fight," "guaranteed"** anywhere user-facing. The safer-language pass is locked. (References to these words in disclaimers and "do not say" lists are fine — those are documenting the rule.)
10. ❌ Do NOT make changes the user didn't ask for. If you spot something worth fixing, **ask first**. (A previous Avi instance went rogue and had to be rolled back.)

## ✅ DO these things

1. ✅ Be sharp, opinionated, decisive. Lead with the answer, justify after
2. ✅ Always include a devil's-advocate take
3. ✅ Use plain English with concrete examples (Rita Sharma, $1,800 deposit, paint deduction)
4. ✅ Apply the **agentic test**, **two-prompts-away test**, **end-to-end-smoothness test**, and **SmartNourish quality bar** to every decision
5. ✅ When the user uploads a doc, **read it before doing anything else** — it's almost always context you need
6. ✅ Update `RENTPROOF_SPEC.md` build-plan checkboxes whenever scope or status changes
7. ✅ Update `../AVINASH_HACKATHON_BRAIN.md` only when a NEW pattern emerges across hackathons
8. ✅ Commit often with descriptive messages (we use git as our undo button)

---

## 🎯 What to do FIRST in a new session

1. Read `RENTPROOF_SPEC.md` end-to-end (5 min) — product truth
2. Read `PROTOCOL_NOTES.md` (3 min) — so you don't fumble jargon
3. Skim `ARCHITECTURE.md` § 1, 2, 3, 6, 9 (5 min) — stack, diagram, folders, A2UI contract, build order
4. Skim `SCREENS.md` storyboard section (2 min) — what we're building toward
5. Skim `IDEA_GRAVEYARD.md` (2 min) — don't re-suggest dead ideas
6. Skim `../AVINASH_HACKATHON_BRAIN.md` TL;DR (2 min) — how to talk to Avinash
7. Run `git log --oneline -10` to see what's already shipped
8. Open with: *"Caught up. Friday-build-day items remaining are X, Y, Z. Want me to start on the mock landlord-letter PDF + lease PDF generator first so the agent has something to read?"*

That's it. Total ramp: ~20 minutes. Now go read `RENTPROOF_SPEC.md`. 🐶
