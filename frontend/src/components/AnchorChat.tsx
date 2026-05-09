import { useState, useRef, useEffect } from 'react';

/**
 * AnchorChat — natural-language entry point.
 *
 * Caregivers type what they noticed → backend parses signals → dashboard
 * rebuilds via SSE. The visual language matches @copilotkit/react-ui's
 * chat patterns (and the renderAndWait approval flow) but is wired
 * directly to FastAPI so we don't need a Node-side runtime in the demo.
 */

type ChatRole = 'user' | 'agent';

interface ChatTurn {
  id: string;
  role: ChatRole;
  text: string;
  meta?: string;
}

const SUGGESTIONS = [
  { label: '🫀  Tom · ankles + appetite', prompt: "Tom's ankles are really swollen and he barely ate anything" },
  { label: '🧠  Helen · same question 4×', prompt: 'Mom asked me the same question four times today' },
  { label: '💧  Sarah · breaking point',    prompt: "I really don't know how much longer I can do this" },
];

export default function AnchorChat() {
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
    setTurns((t) => [...t, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
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
        ? `${body.detected_signals.length} signal(s) · target: ${body.person_id ?? 'unknown'}`
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
    <div className="rounded-2xl border border-anchor-mist-100 bg-white shadow-soft overflow-hidden">
      <header className="px-4 py-3 bg-indigo-gradient text-white flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-white/15 grid place-items-center" aria-hidden>💬</span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold leading-tight">Tell Anchor</h2>
          <p className="text-[11px] opacity-80 leading-tight">Natural language · CopilotKit + Pydantic AI</p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="px-4 py-3 max-h-[240px] min-h-[140px] overflow-y-auto space-y-2 bg-anchor-cream-50"
        aria-live="polite"
        aria-label="Chat transcript"
      >
        {turns.map((t) => (
          <div
            key={t.id}
            className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm ${
                t.role === 'user'
                  ? 'bg-anchor-indigo-600 text-white rounded-br-md'
                  : 'bg-white border border-anchor-mist-100 text-anchor-ink-600 rounded-bl-md'
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
            <div className="bg-white border border-anchor-mist-100 rounded-2xl rounded-bl-md px-3 py-2 text-xs italic text-anchor-mist-400 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-anchor-indigo-600 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-anchor-indigo-600 animate-pulse" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-anchor-indigo-600 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span className="ml-1">thinking</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-4 py-2 text-xs text-state-red bg-red-50 border-t border-state-red/30">
          ⚠️ {error}
        </p>
      )}

      <div className="px-3 pt-2.5 pb-1.5 flex flex-wrap gap-1.5 border-t border-anchor-mist-100 bg-anchor-cream-50">
        <span className="text-[10px] uppercase tracking-wider text-anchor-mist-400 font-semibold w-full px-1">
          Try one
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.prompt}
            type="button"
            onClick={() => send(s.prompt)}
            disabled={busy}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white text-anchor-ink-600 border border-anchor-mist-100 hover:bg-anchor-indigo-600 hover:text-white hover:border-transparent disabled:opacity-50 transition-colors"
            title={s.prompt}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form
        className="px-3 py-3 flex gap-2 bg-white"
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
          className="flex-1 rounded-xl border border-anchor-mist-100 px-3 py-2 text-sm bg-anchor-cream-50 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200 focus:border-anchor-indigo-600 focus:bg-white disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="px-4 py-2 rounded-xl bg-anchor-indigo-600 text-white font-semibold text-sm hover:bg-anchor-indigo-700 disabled:opacity-40 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200 transition shadow-soft"
        >
          Send
        </button>
      </form>
    </div>
  );
}
