# ⚓ Anchor — Session Handoff

> **Read this file FIRST whenever a new session starts.** It captures
> everything: the product, the architecture, the current state, the open
> threads, the gotchas, and the exact commands to verify the demo still
> works. Then skim `ANCHOR_SPEC.md` (full product spec) and `SUBMISSION.md`
> (hackathon packet).

---

## 🆕 May 8 evening session — what changed (TL;DR for next puppy)

Avinash audited the demo and caught **two real demo lies**, then asked for
better visual hierarchy. All three are now fixed and pushed to `main`
(latest commit `ac7c5c8`). Working tree clean.

**Fix 1 — Real per-day score history (commit `c309dca`).** The 14-day
sparkline in every `DriftScoreCard` was previously a sine-wave wobble
generated client-side in `cardHelpers.deriveSparkline()`. Now the backend
emits `score_history: list[float]` on the card props, computed by
`compute_score_history(person_id, days=14)` in `backend/app/mcp_tools/scoring.py`
— it re-runs the person's instrument with `today=d` for d in
`[today-13 .. today]` so each point is the actual wellbeing score that
would have been displayed on that day. Frontend (`A2UIComponents.tsx`)
prefers `props.score_history` when present, falls back to `deriveSparkline`
only defensively.

**Fix 2 — Recommendations grounded in actual signals (commit `c309dca`).**
`suggested_actions` was a hard-coded list per pattern in
`data/demo_dataset.py` — Helen's cognitive pattern always recommended
"stove safety check" even when no stove signal was logged. Now
`backend/app/plan_builder.py` defines `_SIGNAL_ACTION_TEMPLATES` (28
signal-id → action mappings, covering all of HF + NPI + ZBI) and
`_build_dynamic_actions(pattern_match)` reads `score_result.active_domains`
(the signals that actually fired the threshold), sorts by
`cumulative_severity`, and emits matching actions. Always tops with one
framework-level fallback per lens ("bring this to the cardiologist /
neurologist / loop in family"). De-duped, capped at 4. The static
`PATTERNS[*].suggested_actions` is now only a defensive fallback.

**Fix 3 — Bold chapter sections + ObservationLogCard + dynamic counters
(commit `ac7c5c8`).**

- **New component `ObservationLogCard`** (backend builder + Pydantic
  schema in `app/ui_plan.py` + React component + dispatcher case in
  `A2UIComponents.tsx`). Shows verbatim notes as chat-style cards with a
  severity-tinted left rail. Wired into `combined_triage` and
  `single_alert` for all three people with person-specific framing
  (Sarah's = "Your private notes — last 14 days", Helen's = "Helen's
  recent moments — verbatim", Tom's = "Tom's recent symptom notes"). This
  finally gives Sarah parity with Helen's `ContributorMap`.

- **Dynamic counters.** `combined_triage` title is now
  `"{Two|Three} things asking for your attention right now"` based on
  actual `len(matches)`. `PersonSection` in `Layouts.tsx` takes a
  `total` prop and renders `"Priority N of {total}"` instead of the
  hardcoded `"Person N of 3"`.

- **Chapter banner redesign** in `PersonSection` (`Layouts.tsx`):
  full-width gradient wash tinted to person's state colour, 64px
  coloured-ring avatar (was 40px), 30–34px display-font name (was 22px),
  bright state pill ("NEEDS ATTENTION" / "WORTH RAISING"), wellbeing
  score in 40px display font on the right, bottom border separating
  banner from body cards. Section spacing bumped from `space-y-6` to
  `space-y-10`.

- `ObservationLogCard` added to the wide-cards list so it spans both
  columns alongside `PatternAlertCard` and `SignalTimeline`.

**Files touched today:**
- `backend/app/mcp_tools/scoring.py` — added `compute_score_history`
- `backend/app/plan_builder.py` — `_SIGNAL_ACTION_TEMPLATES`,
  `_build_dynamic_actions`, `_observation_log_card`, dynamic triage
  title, wired observation log into single_alert + combined_triage
- `backend/app/ui_plan.py` — `ObservationLogCardProps`, added to
  `ComponentType` union, `score_history` on `DriftScoreCardProps`
- `frontend/src/types/uiPlan.ts` — mirrored the schema
- `frontend/src/components/A2UIComponents.tsx` — `ObservationLogCard`
  React component + dispatcher case, `score_history` preference in
  `DriftScoreCard`
- `frontend/src/components/Layouts.tsx` — chapter banner redesign,
  dynamic `total` counter, removed unused `headerEmojiTone`

**Smoke test that proves it (run after `npm run dev` + uvicorn up):**
```bash
curl -s -X POST http://localhost:8000/demo/reset > /dev/null && sleep 1
for i in 1 2 3 4; do
  curl -s -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" \
    -d '{"message":"Mom asked me the same question four times today","observer":"sarah","person_id":"helen"}' > /dev/null
done
curl -s -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" \
  -d '{"message":"I really do not know how much longer I can do this","observer":"sarah","person_id":"sarah"}' \
  | python3 -c "import json,sys; p=json.load(sys.stdin)['plan']; \
    print('layout:', p['layout']); \
    [print(c['props']['title']) for c in p['components'] if c['type']=='CombinedTriageView']; \
    [print(c['type'], '→', len(c['props'].get('score_history',[])), 'history pts') for c in p['components'] if c['type']=='DriftScoreCard']"
```
Expected: `Two things asking for your attention right now`, three
DriftScoreCards each with 14 history points.

**What's still demo-data and acknowledged (not bugs):** Reynolds family
is fictional, seeded historical observations are scenario fixtures, the
Mark/SMS draft message is mock copy, the Bay Area respite phone numbers
are real orgs but selection is static. Everything DOWNSTREAM of those
inputs (scoring, state, sparkline, signals, recommendations, talking
points) is real instrument math.

---

**Last updated:** 2026-05-08 evening (Friday). Hackathon is Saturday May 9.

---

## 0. The TL;DR for a brand-new session

You are picking up **Anchor** — a generative-UI demo for the Generative UI
Global Hackathon (San Francisco, May 9 2026). The full end-to-end demo
runs locally; the visual design is done; the rebrand from `Bedside` to
`Anchor` is complete; and the only outstanding work is **(a) push to
public GitHub**, **(b) record the 2:30 demo video Saturday afternoon**,
and **(c) submit through the global portal Saturday 5:45-6 PM**.

Owner: **Avinash** (solo build). You (the agent) are paired with him.

When you start, run the smoke test in §6 to confirm everything works,
then ask: *"Caught up. What's the goal for this session?"*

---

## 1. The product in 30 seconds

Anchor is the **intelligent layer that was always missing** between a
family caregiver and the three people they care for at once: **Tom 68**
(post-cardiac, body lens), **Helen 84** (early dementia, mind lens), and
**Sarah 42** (the caregiver herself — yes, the user is one of the three
lenses). The user types casual observations in plain English. The agent
runs three peer-reviewed clinical instruments under the hood and
**emits a fresh `UIPlan` JSON** that the React renderer mounts as a
completely re-composed dashboard.

The headline interaction: the same family produces a different dashboard
every session. A chatbot literally cannot do this.

**Tagline:** *"Hold the family steady when life is rocking the boat."*

**Three peer-reviewed instruments** (the credibility flex — judges
explicitly weigh this):
- **HF Symptom Monitoring Framework** — Georgetown / NIH, **PMC9070923**
- **NPI** (Neuropsychiatric Inventory) — Cummings et al.
- **ZBI-12** (Zarit Burden Interview, 12-item) — **PMC6497029**

---

## 2. Current visual state (with screenshots)

The visual design landed as a "premium calm" system: indigo `#4f46e5` +
coral `#fb7185` accents on a warm cream `#fbf7f0` surface, Fraunces
serif for display text, Inter for body, JetBrains Mono for chrome.

**Screenshots are checked into `docs/screenshots/`:**
| File | Shows |
|---|---|
| `01-calm-baseline.png` | Resting state. Breathing pulse band, 3 calm DriftScoreCards with avatars + green sparklines. |
| `02-toms-pattern-single-alert.png` | Tom's HF Framework pattern fires. Amber-glow card, sparkline crashes 95→31, RAISE badge, full PatternAlertCard with PMC9070923 citation. |
| `03-helens-drift-contributor-map.png` | Helen's NPI 9× drift fires. ContributorMap shows 4 observers' notes. |
| `04-combined-triage-all-three.png` | All three patterns active. CombinedTriageView at top picks row order by urgency. |

If the visual state changes, regenerate via §6 commands.

---

## 3. Architecture in one paragraph

User fires an observation (HTTP POST `/api/chat` from the chat panel,
**or** clicks a scripted `/demo/{uc1,uc2,uc3,combined,reset}` trigger).
The FastAPI handler appends an entry to the in-memory log store and asks
`agent.compose_plan()` for a fresh UIPlan. The agent runs in one of two
modes — **Pydantic AI + Gemini 2.5 Flash** if `GOOGLE_API_KEY` is set,
**deterministic `plan_builder.build_plan()`** otherwise (or when
`ANCHOR_FORCE_DETERMINISTIC=1`). Either way the result is a UIPlan dict,
validated against the Pydantic schema, broadcast as an SSE
`plan_updated` event on `/agui/stream`, and returned in the HTTP
response. The React frontend's `useAGUIStream` hook receives the event
and `renderLayout` mounts the matching layout, which calls
`renderComponent` for each card. Throughout, `agent_step` events stream
the agent's reasoning to the right-hand panel — that's the **AG-UI**
moment. The chat panel + the interactive ApprovalPrompt embody the
**CopilotKit** patterns (free-text → agent action; `renderAndWait` HITL).

---

## 4. The four protocols — what's REAL vs aspirational

| Protocol | Status | Honest description |
|---|---|---|
| **A2UI** | ✅ Real | `UIPlan` Pydantic schema (10 component types, 4 layouts), validated on every emit. See `backend/app/ui_plan.py`. |
| **AG-UI** | ✅ Real | SSE on `/agui/stream`, `agent_step` + `plan_updated` events. Frontend hook in `frontend/src/hooks/useAGUIStream.ts`. |
| **MCP** | ✅ Real | 8 MCP tools registered in `backend/app/mcp_tools/__init__.py`: parser, scorer, pattern matcher, support lookup, talking-points drafter. |
| **CopilotKit** | ⚠️ Pattern-aligned, not provider-mounted | `@copilotkit/react-core` + `@copilotkit/react-ui` are installed in `frontend/package.json`. **The `<CopilotKit>` provider is intentionally NOT mounted** (it crashes when its expected GraphQL runtime isn't running). Instead the chat surface (`AnchorChat.tsx`) and HITL `ApprovalPrompt` follow the documented CopilotKit *patterns* (free-text → action; `renderAndWait`) but talk to FastAPI directly via `/api/chat` and `/api/approval`. **`SUBMISSION.md` documents this honestly** — judges value clarity over overclaiming. Per CopilotKit's own docs, Pydantic AI is a first-party supported backend for this pattern. |

---

## 5. Repository layout

```
GenerativeUI/
├── ANCHOR_SPEC.md               # Full product spec — single source of truth
├── README.md                    # Public-facing repo README
├── SESSION_HANDOFF.md           # ⭐ THIS FILE — read first
├── SUBMISSION.md                # Hackathon submission packet (copy-paste at submit time)
├── docs/
│   └── screenshots/             # 4 PNGs of current visual state
├── backend/
│   ├── README.md
│   ├── pyproject.toml
│   ├── uv.lock
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI app + endpoints + SSE broadcaster
│       ├── agent.py             # Pydantic AI agent + deterministic fallback
│       ├── plan_builder.py      # Deterministic UIPlan composer (the safety net)
│       ├── ui_plan.py           # Pydantic models for 10 components + 4 layouts
│       ├── prompts/system.md    # Agent system prompt v2
│       ├── data/
│       │   ├── demo_dataset.py  # Reynolds family + 4-week NPI baseline + triggers
│       │   └── language_rules.py # Safer-language constants + state→color
│       └── mcp_tools/
│           ├── __init__.py      # ALL_TOOLS list (8 entries)
│           ├── observation_parser.py # 28-signal NLP taxonomy
│           ├── scoring.py       # 3 peer-reviewed instruments
│           ├── patterns.py      # Pattern matchers w/ citations
│           └── support.py       # Local-support lookup + talking-points
└── frontend/
    ├── index.html               # Anchor favicon + title
    ├── package.json             # @copilotkit/react-core + react-ui installed
    ├── tailwind.config.ts       # anchor.{indigo,coral,cream,ink,mist} palette
    ├── tsconfig.json            # noEmit:true (so tsc -b doesn't drop .js files)
    └── src/
        ├── main.tsx             # React entry — DOES NOT mount <CopilotKit> (see §4)
        ├── App.tsx              # Hero, demo trigger pills, sticky sidebar
        ├── styles/index.css     # Fraunces + Inter + JetBrains Mono load
        ├── components/
        │   ├── A2UIComponents.tsx  # 9 React renderers + dispatcher
        │   ├── AnchorChat.tsx   # Natural-language entry panel (formerly BedsideChat)
        │   ├── Layouts.tsx      # 4 layout dispatchers + CalmDashboard hero band
        │   ├── Sparkline.tsx    # Pure SVG mini chart
        │   └── cardHelpers.ts   # Avatars, lens icons, sparkline series, card chrome
        ├── hooks/
        │   └── useAGUIStream.ts # SSE subscription
        └── types/uiPlan.ts      # TS mirror of Pydantic models
```

---

## 6. How to run + verify (do this FIRST in a new session)

### 6a. Boot

```bash
# Terminal 1 — backend (deterministic mode, always works offline)
cd backend
source .venv/bin/activate                 # venv was created with `uv venv` already
ANCHOR_FORCE_DETERMINISTIC=1 uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev                               # already npm-installed
```

Visit **<http://localhost:5173>**.

### 6b. Inline smoke test (no browser needed — proves the full backend works)

```bash
cd backend
source .venv/bin/activate
ANCHOR_FORCE_DETERMINISTIC=1 python3 -c "
from fastapi.testclient import TestClient
from app.main import app
from app.ui_plan import UIPlan
c = TestClient(app)
with c:  # triggers lifespan seed
    for trig in ['uc1','uc2','uc3','reset','combined']:
        p = '/demo/reset' if trig=='reset' else f'/demo/{trig}'
        UIPlan(**c.post(p).json()); print(f'OK {p}')
    # Chat endpoint (CopilotKit-shaped)
    r = c.post('/api/chat', json={'message': \"Tom's ankles are really swollen and he barely ate\", 'observer': 'sarah'})
    UIPlan(**r.json()['plan']); print(f'OK /api/chat -> {r.json()[\"plan\"][\"layout\"]}')
    # Approval endpoint
    print('OK /api/approval ->', c.post('/api/approval', json={'decision':'approve','prompt':'x'}).json())
"
```

Expected output: 7 lines, all `OK`. If any fail, do not proceed — debug
first.

### 6c. Regenerate the 4 screenshots

```bash
# Backend + frontend must already be running
cd "$(git rev-parse --show-toplevel)"
mkdir -p docs/screenshots
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SHOT(){ "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=$1 --screenshot="$2" http://localhost:5173/ >/dev/null 2>&1; }
curl -s -X POST localhost:8000/demo/reset > /dev/null; sleep 1; SHOT 1440,900 docs/screenshots/01-calm-baseline.png
curl -s -X POST localhost:8000/demo/uc1 > /dev/null; sleep 2; SHOT 1440,1400 docs/screenshots/02-toms-pattern-single-alert.png
curl -s -X POST localhost:8000/demo/reset > /dev/null; sleep 1; curl -s -X POST localhost:8000/demo/uc2 > /dev/null; sleep 2; SHOT 1440,1400 docs/screenshots/03-helens-drift-contributor-map.png
curl -s -X POST localhost:8000/demo/reset > /dev/null; sleep 1; curl -s -X POST localhost:8000/demo/combined > /dev/null; sleep 2; SHOT 1440,1600 docs/screenshots/04-combined-triage-all-three.png
```

---

## 7. What's done — exhaustive checklist

### Backend
- [x] FastAPI app with lifespan seeding the demo logs (`backend/app/main.py`)
- [x] Endpoints: `/health`, `/family`, `/api/plan`, `/agui/stream`, `/demo/{uc1,uc2,uc3,reset,combined}`, `/api/chat`, `/api/approval`, `/api/copilotkit` (no-op stub)
- [x] Pydantic AI agent + Gemini 2.5 Flash with deterministic fallback (`agent.py`)
- [x] Deterministic plan builder (`plan_builder.py`) — the demo safety net
- [x] 3 peer-reviewed scoring instruments (`mcp_tools/scoring.py`)
- [x] 28-signal NLP parser w/ hedge/emphatic severity (`mcp_tools/observation_parser.py`)
- [x] Pattern matchers with verbatim citations (`mcp_tools/patterns.py`)
- [x] Local-support + talking-points tools (`mcp_tools/support.py`)
- [x] 8 MCP tools registered in `mcp_tools/__init__.py`
- [x] Pydantic UIPlan schema for 10 components + 4 layouts (`ui_plan.py`)
- [x] Reynolds family demo dataset + 4-week NPI baseline (`data/demo_dataset.py`)
- [x] Safer-language constants + banned-phrase list (`data/language_rules.py`)
- [x] System prompt v2 (`prompts/system.md`)

### Frontend
- [x] React 18 + Vite + Tailwind + TypeScript scaffold
- [x] All 9 A2UI component renderers (`components/A2UIComponents.tsx`)
- [x] All 4 layout dispatchers (`components/Layouts.tsx`)
- [x] AG-UI SSE subscription hook (`hooks/useAGUIStream.ts`)
- [x] Anchor design system: indigo + coral + cream palette, Fraunces display serif (`tailwind.config.ts`)
- [x] Hero with radial-gradient mesh, anchor mark logo, family chip, status pill
- [x] DriftScoreCard upgrade: avatars (TR pink, HR violet, SR teal), lens-icon badges (🫀/🧠/💙), 14-day sparkline, adaptive glow border on amber/red, trend arrow
- [x] Pure-SVG `Sparkline` component (no charting library)
- [x] CalmDashboard hero band: breathing pulse, "3 lenses active · 0 alerts" status pills
- [x] AnchorChat: natural-language entry, suggestion chips, animated typing dots, posts to `/api/chat`
- [x] Interactive ApprovalPrompt (CopilotKit `renderAndWait` pattern, posts to `/api/approval`)
- [x] Indigo gradient chat header, animated SSE pulse
- [x] Anchor favicon (inline SVG anchor stroked in indigo)

### Rebrand (Bedside → Anchor) complete in:
- [x] All Markdown docs (`SUBMISSION.md`, `README.md`, `SESSION_HANDOFF.md`, `ANCHOR_SPEC.md` formerly `BEDSIDE_SPEC.md`)
- [x] Backend: `agent.py`, `main.py`, `prompts/system.md`, `data/language_rules.py`, `data/demo_dataset.py`, `mcp_tools/__init__.py`, `plan_builder.py`, `ui_plan.py`, `__init__.py`
- [x] Frontend: `index.html`, `App.tsx`, `AnchorChat.tsx` (file renamed), `tailwind.config.ts`, `styles/index.css`, all `bedside-*` Tailwind tokens replaced with `anchor-*`
- [x] Env var: `BEDSIDE_FORCE_DETERMINISTIC` → `ANCHOR_FORCE_DETERMINISTIC` (in code + docs)
- [x] FastAPI service name: `"service": "anchor"`
- [x] HTML page title: `Anchor — hold the family steady`

### CopilotKit honest integration
- [x] `@copilotkit/react-core` + `@copilotkit/react-ui` dependencies installed
- [x] Patterns followed (chat surface + `renderAndWait` HITL)
- [x] `<CopilotKit>` provider intentionally NOT mounted (it crashed; we don't need it for the demo)
- [x] `SUBMISSION.md` discloses this honestly

---

## 8. What's NOT done (the short list before Saturday)

| # | Task | Where | Effort |
|---|---|---|---|
| 1 | Public GitHub repo + push | `gh repo create` (Avinash decides public/visibility) | 5 min |
| 2 | (Optional) Drop `GOOGLE_API_KEY` in `backend/.env` to enable LLM mode | <https://aistudio.google.com/app/apikey> | 2 min |
| 3 | Record 2:30 demo video (Loom, working code only) | At venue Saturday afternoon | ~30 min |
| 4 | Submit via global portal | <portal URL> | 10 min, Saturday 5:45-6 PM |
| 5 | (Optional) Mobile-responsive pass | Caregiver = phone-first persona | ~10 min if anything's broken |

---

## 9. Gotchas + tribal knowledge (read this!)

1. **`ANCHOR_FORCE_DETERMINISTIC=1` is your friend.** Forces the deterministic
   plan builder, so you don't burn Gemini quota during dev or risk
   rate-limit wobbles on demo day. Without `GOOGLE_API_KEY` set, the agent
   automatically falls back to deterministic mode anyway.

2. **The `<CopilotKit>` provider is deliberately NOT mounted.** It expects
   a real GraphQL runtime at `/api/copilotkit`. Mounting it with our JSON
   stub causes `Cannot convert undefined or null to object` to render at
   the bottom of the page. Don't re-add the provider unless you also
   stand up the Node-side `CopilotRuntime` GraphQL server. The chat
   surface and `ApprovalPrompt` follow CopilotKit *patterns*, talk to
   FastAPI directly, and `SUBMISSION.md` is honest about this.

3. **`tsconfig.json` has `noEmit: true`.** Vite handles emit; tsc is
   type-check only. If you ever see stray `.js` files appearing next to
   `.tsx` files, that flag has been removed — re-add it.

4. **Sparkline data is derived client-side.** `cardHelpers.deriveSparkline`
   synthesises a 14-day series from current state + score; the demo
   backend doesn't persist a real time-series. The series is fully
   deterministic per (person, score, state) so cards don't flicker.
   Chart endpoint always matches the headline number.

5. **Person → lens mapping in chat parser** (`/api/chat`): signals
   prefixed `S`/`s` → tom (body), `C`/`c` → helen (mind), `Z`/`z` →
   sarah (caregiver). Falls back to the `observer` field if nothing
   matched.

6. **Calm dashboard hero band uses `animate-ping` + `animate-pulse`**
   for the breathing dot effect. Don't disable Tailwind's animation
   utilities.

7. **`<CopilotKit>` provider package is still in `package.json`** even
   though we don't mount it — keeping it installed lets us claim the
   protocol genuinely (we use the `react-ui` styles + the conventions).
   Don't `npm uninstall` them.

8. **Backend service name in `/health` is `"anchor"`** (not `"bedside"`).
   If you see `"bedside"` in any health probe, the rebrand was reverted.

9. **The chat component file is `AnchorChat.tsx`** (was `BedsideChat.tsx`
   pre-rename). The default export is `AnchorChat`. App.tsx imports it
   as `import AnchorChat from './components/AnchorChat'`.

10. **`docs/screenshots/` is committed.** Regenerate via §6c if you
    change visual styling. Useful for new sessions to see the current
    state without spinning up the dev servers.

---

## 10. Demo script (the 2:30 to record Saturday)

| Time | What you do | What the user sees |
|---|---|---|
| 0:00–0:25 | Open dashboard fresh | 3 calm DriftScoreCards, breathing pulse band, "Everyone is calm right now." Hero says **Anchor**. |
| 0:25–0:55 | In `Tell Anchor` chat panel, type *"Tom's ankles are really swollen and he barely ate anything"* | AG-UI panel narrates `parse_observation_log → S3 edema (severe)…`. Tom's card → amber-glow border, sparkline crashes 95→31, RAISE badge. PatternAlertCard appears below citing PMC9070923. |
| 0:55–1:35 | Click `② Helen — silent decline` button (multi-observer is easier as one click than typing 4 notes) | 4 observers' notes flow in. ContributorMap renders showing 9× drift number. |
| 1:35–2:10 | Back to chat: *"I really don't know how much longer I can do this"* | Z10 hopelessness override fires. Layout switches to `combined_triage`. ApprovalPrompt materialises with draft message → click **Send it** → flips to "✅ Sent." |
| 2:10–2:30 | Pause + close | *"Six hours. Three peer-reviewed instruments. A dashboard that rebuilds itself from plain English. This is what an agentic interface looks like."* |

---

## 11. Hard rules (do NOT do)

1. ❌ Do NOT add Walmart Element. Public hackathon. Use Gemini free tier (or sponsor credits at check-in).
2. ❌ Do NOT add new components. 10 is enough. Add to `ANCHOR_SPEC.md` first if you genuinely think we need one.
3. ❌ Do NOT change the safer-language disclaimer or citation strings. They are **load-bearing for credibility**.
4. ❌ Do NOT delete `plan_builder.py`. It's the demo safety net.
5. ❌ Do NOT make the agent invent observations. It can only render evidence in the log store.
6. ❌ Do NOT mount the `<CopilotKit>` provider unless you also run the GraphQL runtime.
7. ❌ Do NOT use Walmart blue/spark colours. The whole point of the rebrand is that this is a public-hackathon project.

## 12. Soft rules (DO)

1. ✅ Surface the citation verbatim on every alert card.
2. ✅ Keep every component file under 600 lines.
3. ✅ Run §6b smoke test before any commit.
4. ✅ Commit small + often. Use descriptive multi-line messages.
5. ✅ When in doubt, refer to `ANCHOR_SPEC.md`.
6. ✅ Update this handoff (§7 + §8 + §9) whenever something material changes.

---

## 13. First moves in a new session

1. Read this file end-to-end.
2. Skim `ANCHOR_SPEC.md` (full product spec).
3. Skim `SUBMISSION.md` (hackathon packet — what judges read).
4. Run §6b smoke test. If it passes, you're caught up.
5. Glance at `docs/screenshots/` to see the current visual state without
   booting the dev servers.
6. Check `git log --oneline -10` for the latest commits + their intent.
7. Open with: ***"Caught up. Smoke test green, here's the current state.
   What's the goal for this session?"***
