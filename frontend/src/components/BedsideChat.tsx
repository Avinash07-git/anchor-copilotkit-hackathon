import { useState, useRef, useEffect } from 'react';

/**
 * BedsideChat — natural-language entry point.
 *
 * This is the CopilotKit-style chat surface the BEDSIDE_SPEC pitch script
 * actually demonstrates: Sarah types "Tom's ankles are really swollen and
 * he barely ate anything" → backend parses the signals → dashboard
 * rebuilds itself live via SSE.
 *
 * We styled this to look at home next to <CopilotChat /> from
 * @copilotkit/react-ui but bridged it directly to FastAPI so we don't
 * need a Node-side runtime running on demo day. The scripted /demo/*
 * trigger buttons in App.tsx remain as the offline-safe fallback path
 * (same role plan_builder.py plays for the agent).
 */

type ChatRole = 'user' | 'agent';

interface ChatTurn {
  id: string;
  role: ChatRole;
  text: string;
  meta?: string; // small footer line, e.g. "Logged for Tom · S3 edema, S4 appetite"
}

const SUGGESTIONS = [
  "Tom's ankles are really swollen and he barely ate anything",
  "Mom asked me the same question four times today",
  "I really don't know how much longer I can do this",
];

export default function BedsideChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: 'seed',
      role: 'agent',
      text:
        "Hi — I'm watching Tom, Helen, and you. Just type what you noticed and I'll handle the rest.",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    setBusy(true);
    const userTurn: ChatTurn = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setTurns((t) => [...t, userTurn]);
    setDraft('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, observer: 'sarah' }),
      });
      if (!res.ok) throw new Error(`Chat failed: HTTP ${res.status}`);
      const body = await res.json();
      const meta = body.detected_signals?.length
        ? `${body.detected_signals.length} signal(s) · ${body.person_id ?? 'no target'}`
        : undefined;
      setTurns((t) => [
        ...t,
        { id: `a-${Date.now()}`, role: 'agent', text: body.reply, meta },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-bedside-gray-50 bg-white shadow-sm flex flex-col overflow-hidden">
      <header className="px-4 py-3 border-b border-bedside-gray-50 flex items-center gap-2">
        <span aria-hidden>💬</span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-bedside-gray-160">Tell Bedside</h2>
          <p className="text-[11px] text-bedside-gray-100">
            Natural-language entry · powered by CopilotKit + Pydantic AI
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="px-4 py-3 max-h-[260px] overflow-y-auto space-y-2 bg-bedside-gray-10"
        aria-live="polite"
        aria-label="Chat transcript"
      >
        {turns.map((t) => (
          <div
            key={t.id}
            className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                t.role === 'user'
                  ? 'bg-bedside-blue-100 text-white rounded-br-sm'
                  : 'bg-white border border-bedside-gray-50 text-bedside-gray-160 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-line">{t.text}</p>
              {t.meta && (
                <p className="mt-1 text-[10px] opacity-80 font-mono">{t.meta}</p>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-white border border-bedside-gray-50 text-bedside-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 text-xs italic">
              Bedside is thinking…
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-4 py-2 text-xs text-bedside-red-100 bg-bedside-red-10 border-t border-bedside-red-100">
          {error}
        </p>
      )}

      <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-bedside-gray-50">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={busy}
            className="text-[11px] px-2 py-1 rounded-full bg-bedside-gray-10 hover:bg-bedside-blue-100 hover:text-white text-bedside-gray-160 border border-bedside-gray-50 disabled:opacity-50"
            title={s}
          >
            {s.length > 38 ? s.slice(0, 36) + '…' : s}
          </button>
        ))}
      </div>

      <form
        className="px-4 py-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type what you noticed…"
          disabled={busy}
          aria-label="Observation message"
          className="flex-1 rounded-lg border border-bedside-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-bedside-blue-100/30 focus:border-bedside-blue-100 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="px-4 py-2 rounded-lg bg-bedside-blue-100 text-white font-semibold text-sm hover:bg-bedside-blue-110 disabled:opacity-40 focus:outline-none focus:ring-4 focus:ring-bedside-blue-100/40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
