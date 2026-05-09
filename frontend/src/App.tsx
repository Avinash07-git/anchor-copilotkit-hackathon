import { useEffect, useState } from 'react';
import { useAGUIStream } from './hooks/useAGUIStream';
import { renderLayout } from './components/Layouts';
import AnchorChat from './components/AnchorChat';

/**
 * Anchor — App shell.
 *
 * Single-page dashboard that subscribes to the agent's UIPlan stream over
 * SSE and re-renders whenever a new plan arrives. The chat panel on the
 * right is the natural-language entry point. The scripted trigger pills
 * up top are the offline-safe demo path.
 */
const TRIGGERS: Array<{ id: string; label: string; tone: 'safe' | 'warn' | 'reset' }> = [
  { id: 'reset', label: '↻ Reset',                   tone: 'reset' },
  { id: 'uc1',   label: '① Tom · slow slide',        tone: 'warn' },
  { id: 'uc2',   label: '② Helen · silent decline',  tone: 'warn' },
  { id: 'uc3',   label: '③ Sarah · breaking point',  tone: 'warn' },
];

export default function App() {
  const { plan, steps, connected } = useAGUIStream();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First fetch in case SSE plan_updated hasn't arrived yet (cold load)
  const [bootPlan, setBootPlan] = useState<typeof plan>(null);
  useEffect(() => {
    if (plan || bootPlan) return;
    fetch('/api/plan')
      .then((r) => r.json())
      .then(setBootPlan)
      .catch(() => undefined);
  }, [plan, bootPlan]);

  const livePlan = plan ?? bootPlan;

  const fireTrigger = async (triggerId: string) => {
    setBusy(true);
    setError(null);
    try {
      const path = triggerId === 'reset' ? '/demo/reset' : `/demo/${triggerId}`;
      const res = await fetch(path, { method: 'POST' });
      if (!res.ok) throw new Error(`Trigger ${triggerId} failed: HTTP ${res.status}`);
      await res.json(); // new plan arrives via SSE plan_updated
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-gradient text-anchor-ink-600">
      {/* Hero — Anchor identity + status + family chip */}
      <header className="relative overflow-hidden border-b border-anchor-mist-100">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 0%, #4f46e5 0, transparent 50%), radial-gradient(circle at 90% 100%, #fb7185 0, transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <AnchorMark />
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl text-anchor-ink-900 leading-none">
                    Anchor
                  </h1>
                  <p className="text-sm text-anchor-mist-400 mt-1">
                    Hold the family steady when life is rocking the boat.
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-anchor-ink-100 text-[15px] leading-relaxed">
                Three lenses watching simultaneously — the body, the mind, the
                caregiver — and a dashboard that <em className="font-display not-italic text-anchor-indigo-700 font-semibold">re-composes itself</em> when
                something needs your attention.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 text-right">
              <StatusPill connected={connected} />
              <div className="flex items-center gap-2 text-xs text-anchor-mist-400 font-mono">
                <span className="px-2 py-1 rounded-full bg-white border border-anchor-mist-100">
                  layout · <span className="text-anchor-ink-600">{livePlan?.layout ?? '…'}</span>
                </span>
                <span className="px-2 py-1 rounded-full bg-white border border-anchor-mist-100">
                  v<span className="text-anchor-ink-600">{livePlan?.meta?.plan_version ?? '?'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Family chip + demo triggers */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-anchor-mist-400">
              <span className="font-display text-sm text-anchor-ink-600">The Reynolds family</span>
              <span className="opacity-60">·</span>
              <span>Tom 68 · Helen 84 · Sarah 42</span>
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Demo triggers">
              {TRIGGERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => fireTrigger(t.id)}
                  disabled={busy}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200 ${
                    t.tone === 'reset'
                      ? 'bg-white border border-anchor-mist-100 text-anchor-ink-100 hover:border-anchor-indigo-600 hover:text-anchor-indigo-600'
                      : 'bg-white border border-anchor-mist-100 text-anchor-ink-600 hover:bg-anchor-indigo-600 hover:text-white hover:border-transparent shadow-soft'
                  } ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Dashboard column */}
        <section>
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-state-red/30 p-4 text-sm text-state-red">
              ⚠️ {error}
            </div>
          )}
          {livePlan ? (
            <div className="animate-[fadeIn_.4s_ease-out]">{renderLayout(livePlan)}</div>
          ) : (
            <EmptyState />
          )}

          {livePlan?.meta?.fallback_reason && (
            <p className="mt-6 text-xs italic text-anchor-mist-400">
              ⚠ Agent fell back to deterministic mode: {livePlan.meta.fallback_reason}
            </p>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start space-y-5">
          <AnchorChat />
          <ReasoningPanel steps={steps} />
          <p className="text-[11px] text-anchor-mist-400 italic px-2 leading-relaxed">
            Anchor is not a medical device. It surfaces patterns from what
            you tell it, so you can share them with your healthcare team.
          </p>
        </aside>
      </div>

      {/* Tiny CSS keyframes injected once */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }`}</style>
    </main>
  );
}

// --- Sub-components ---------------------------------------------------------

function AnchorMark() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-indigo-gradient grid place-items-center shadow-lift">
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="5" r="2.2" />
        <path d="M12 7.2v13.3" />
        <path d="M5 13a7 7 0 0 0 14 0" />
        <path d="M3 13h4" />
        <path d="M17 13h4" />
      </svg>
    </div>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase ${
        connected
          ? 'bg-state-green/10 text-state-green border border-state-green/20'
          : 'bg-state-red/10 text-state-red border border-state-red/20'
      }`}
      aria-live="polite"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-state-green animate-pulse' : 'bg-state-red'}`}
        aria-hidden
      />
      {connected ? 'AG-UI live' : 'reconnecting…'}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 text-anchor-mist-400">
      <div className="inline-grid place-items-center w-16 h-16 rounded-full bg-white border border-anchor-mist-100 shadow-soft mb-4">
        <span className="text-2xl">⚓</span>
      </div>
      <p className="text-lg text-anchor-ink-600">Connecting to Anchor…</p>
      <p className="text-sm mt-2">Waiting for the first UIPlan from the agent.</p>
    </div>
  );
}

function ReasoningPanel({ steps }: { steps: Array<{ id: number; text: string }> }) {
  return (
    <div className="rounded-2xl border border-anchor-mist-100 bg-white shadow-soft">
      <div className="px-4 py-3 border-b border-anchor-mist-100 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-anchor-indigo-600/10 grid place-items-center text-anchor-indigo-700" aria-hidden>
          🧠
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-anchor-ink-600">Agent reasoning</h2>
          <p className="text-[11px] text-anchor-mist-400">Live AG-UI stream from Anchor</p>
        </div>
      </div>
      <ol className="px-4 py-3 space-y-2 max-h-[40vh] overflow-y-auto">
        {steps.length === 0 && (
          <li className="text-xs italic text-anchor-mist-400">
            Idle. Type or click a trigger to watch the agent compose a new dashboard.
          </li>
        )}
        {steps.map((s) => (
          <li
            key={s.id}
            className="text-[11px] font-mono bg-anchor-cream-100 rounded-lg px-2.5 py-1.5 leading-snug text-anchor-ink-600 border border-anchor-mist-100/60"
          >
            <span className="text-anchor-indigo-600">›</span> {s.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
