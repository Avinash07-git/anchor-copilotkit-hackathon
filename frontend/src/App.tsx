import { useEffect, useState } from 'react';
import { useAGUIStream } from './hooks/useAGUIStream';
import { renderLayout } from './components/Layouts';
import AnchorChat from './components/AnchorChat';

/**
 * Anchor — App shell.
 *
 * Single-page dashboard that subscribes to the agent's UIPlan stream over
 * SSE and re-renders whenever a new plan arrives. The trigger pills are
 * the offline-safe hero CTA; the chat panel is the natural-language path.
 *
 * Pass ?dev=1 in the URL to surface the layout/version pills (off by default
 * so end users don't see plumbing).
 */
const TRIGGERS: Array<{ id: string; label: string; sub: string; tone: 'safe' | 'warn' | 'reset' }> = [
  { id: 'reset', label: 'Reset',                sub: 'Calm baseline',         tone: 'reset' },
  { id: 'uc1',   label: 'Tom · slow slide',     sub: 'Body · HF pattern',     tone: 'warn' },
  { id: 'uc2',   label: 'Helen · silent decline', sub: 'Mind · NPI drift',    tone: 'warn' },
  { id: 'uc3',   label: 'Sarah · breaking point', sub: 'Caregiver · ZBI override', tone: 'warn' },
];

const isDev = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1';

export default function App() {
  const { plan, steps, connected } = useAGUIStream();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);

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
  const dev = isDev();

  const fireTrigger = async (triggerId: string) => {
    setBusy(true);
    setError(null);
    setActiveTrigger(triggerId);
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
      {/* Hero — Anchor identity + status */}
      <header className="relative overflow-hidden border-b border-anchor-mist-100">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 0%, #4f46e5 0, transparent 45%), radial-gradient(circle at 95% 100%, #fb7185 0, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-9 pb-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-3.5">
              <AnchorMark />
              <div>
                <h1 className="font-display text-[34px] sm:text-[40px] text-anchor-ink-900 leading-none">
                  Anchor
                </h1>
                <p className="text-[13px] text-anchor-mist-400 mt-1.5 tracking-wide">
                  The intelligent layer that was always missing.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <StatusPill connected={connected} />
              {dev && (
                <div className="flex items-center gap-2 text-[10px] text-anchor-mist-400 font-mono">
                  <span className="px-2 py-1 rounded-full bg-white border border-anchor-mist-100">
                    {livePlan?.layout ?? '…'}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-white border border-anchor-mist-100">
                    v{livePlan?.meta?.plan_version ?? '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Demo trigger row — the actual hero CTA, prominent */}
      <section className="bg-white/60 border-b border-anchor-mist-100 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-anchor-indigo-600 font-bold">
                Try it
              </p>
              <p className="text-[15px] text-anchor-ink-900 font-medium mt-1">
                Pick a scenario — watch the dashboard rebuild itself
                <span className="text-anchor-mist-400 font-normal"> · The Reynolds family · Tom 68 · Helen 84 · Sarah 42</span>
              </p>
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Demo triggers">
              {TRIGGERS.map((t) => {
                const isReset = t.tone === 'reset';
                const isActive = activeTrigger === t.id && !busy;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => fireTrigger(t.id)}
                    disabled={busy}
                    title={t.sub}
                    className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200 ${
                      isReset
                        ? 'bg-transparent text-anchor-mist-400 hover:text-anchor-ink-600'
                        : isActive
                        ? 'bg-anchor-indigo-700 text-white shadow-lift'
                        : 'bg-white border border-anchor-mist-100 text-anchor-ink-600 hover:bg-anchor-indigo-600 hover:text-white hover:border-transparent shadow-soft'
                    } ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Dashboard column */}
        <section>
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-state-red/30 p-4 text-sm text-state-red">
              ⚠ {error}
            </div>
          )}
          {livePlan ? (
            <div className="animate-[fadeIn_.4s_ease-out]" key={livePlan.meta?.plan_version ?? 'v0'}>
              {renderLayout(livePlan)}
            </div>
          ) : (
            <EmptyState />
          )}

          {dev && livePlan?.meta?.fallback_reason && (
            <p className="mt-6 text-xs italic text-anchor-mist-400">
              ⚠ Agent fell back to deterministic mode: {livePlan.meta.fallback_reason}
            </p>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start space-y-5">
          <AnchorChat />
          <ReasoningPanel steps={steps} />
        </aside>
      </div>

      {/* Page-level disclaimer (single source) */}
      <footer className="max-w-7xl mx-auto px-6 sm:px-8 pb-10">
        <p className="text-[11px] text-anchor-mist-400 italic leading-relaxed text-center max-w-2xl mx-auto">
          Anchor is not a medical device. It surfaces patterns from what you tell it,
          so you can share them with your healthcare team. Always consult a qualified
          clinician for medical decisions.
        </p>
      </footer>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }`}</style>
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
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
        connected
          ? 'bg-state-green-soft text-state-green border border-state-green/30'
          : 'bg-state-red-soft text-state-red border border-state-red/30'
      }`}
      aria-live="polite"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-state-green animate-pulse' : 'bg-state-red'}`}
        aria-hidden
      />
      {connected ? 'Live' : 'Reconnecting…'}
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
      <p className="text-sm mt-2">Waiting for the first dashboard from the agent.</p>
    </div>
  );
}

function ReasoningPanel({ steps }: { steps: Array<{ id: number; text: string }> }) {
  return (
    <details className="rounded-2xl border border-anchor-mist-100 bg-white shadow-soft group" open={steps.length > 0}>
      <summary className="px-4 py-3 cursor-pointer list-none flex items-center gap-2.5 select-none">
        <span className="w-7 h-7 rounded-lg bg-anchor-indigo-600/10 grid place-items-center text-anchor-indigo-700" aria-hidden>
          ◉
        </span>
        <div className="flex-1">
          <h2 className="text-[13px] font-semibold text-anchor-ink-900 leading-tight">
            Agent reasoning
          </h2>
          <p className="text-[11px] text-anchor-mist-400 leading-tight mt-0.5">
            {steps.length === 0 ? 'Waiting for activity…' : `${steps.length} step${steps.length === 1 ? '' : 's'} streamed`}
          </p>
        </div>
        <span className="text-anchor-mist-400 text-xs transition-transform group-open:rotate-90" aria-hidden>▸</span>
      </summary>
      <ol className="px-4 pb-4 space-y-1.5 max-h-[36vh] overflow-y-auto">
        {steps.length === 0 && (
          <li className="text-[11px] italic text-anchor-mist-400">
            Pick a scenario above or type in chat — Anchor will narrate what it does.
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
    </details>
  );
}
