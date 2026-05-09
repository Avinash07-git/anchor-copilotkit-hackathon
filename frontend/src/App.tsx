import { useEffect, useState } from 'react';
import { useAGUIStream } from './hooks/useAGUIStream';
import { renderLayout } from './components/Layouts';
import CopilotKitProtocolProof from './components/CopilotKitProtocolProof';
import FloatingChatDrawer from './components/FloatingChatDrawer';

/**
 * Anchor — App shell.
 *
 * Single-page dashboard. The dashboard takes the FULL page width (no
 * sidebar) so each person's wellbeing row gets a wide breathing chart.
 * Chat lives in a floating drawer (bottom-right) and reasoning lives in
 * a thin collapsed bar at the bottom — both available, neither competing
 * with the dashboard for attention.
 *
 * Pass ?dev=1 in the URL to surface the layout/version pills.
 */
const TRIGGERS: Array<{ id: string; label: string; sub: string; tone: 'safe' | 'warn' | 'reset' }> = [
  { id: 'reset', label: 'Reset',                   sub: 'Calm baseline',            tone: 'reset' },
  { id: 'uc1',   label: 'Tom · slow slide',        sub: 'Body · HF pattern',        tone: 'warn' },
  { id: 'uc2',   label: 'Helen · silent decline',  sub: 'Mind · NPI drift',         tone: 'warn' },
  { id: 'uc3',   label: 'Sarah · breaking point',  sub: 'Caregiver · ZBI override', tone: 'warn' },
];

const isDev = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1';

export default function App() {
  const { plan, steps, connected } = useAGUIStream();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);

  // Cold-load fallback in case SSE plan_updated hasn't arrived yet
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
      await res.json();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-gradient text-anchor-ink-600 pb-32">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-anchor-mist-100">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 0%, #4f46e5 0, transparent 45%), radial-gradient(circle at 95% 100%, #fb7185 0, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-9 pb-7">
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

      {/* Demo shortcuts row — explicitly framed as shortcuts, not as the
          primary input. The hero is "Tell Anchor" (the floating drawer). */}
      <section className="bg-white/60 border-b border-anchor-mist-100 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-anchor-mist-400 font-bold">
                Demo shortcuts · skip the typing
              </p>
              <p className="text-[15px] text-anchor-ink-900 font-medium mt-1">
                The real input is the <span className="text-anchor-indigo-600 font-semibold">Tell Anchor</span> drawer — these jump straight to a scenario.
                <span className="text-anchor-mist-400 font-normal block sm:inline"> · The Reynolds family · Tom 68 · Helen 84 · Sarah 42</span>
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

      {/* Dashboard — FULL WIDTH */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-state-red/30 p-4 text-sm text-state-red">
            ⚠ {error}
          </div>
        )}
        {livePlan ? (
          <div className="relative" key={livePlan.meta?.plan_version ?? 'v0'}>
            {/* The Gen-UI proof moment: a sweeping shimmer rides across the
                dashboard each time the agent rebuilds the layout, so the
                judge SEES the agent restructure (not just numbers tick). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-2 h-[3px] overflow-hidden rounded-full"
            >
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-anchor-indigo-500 to-transparent animate-rebuildSweep" />
            </div>
            <div className="animate-fadeIn">
              {renderLayout(livePlan)}
            </div>
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

      {/* Footer disclaimer */}
      <footer className="max-w-6xl mx-auto px-6 sm:px-8 pb-10">
        <p className="text-[11px] text-anchor-mist-400 italic leading-relaxed text-center max-w-2xl mx-auto">
          Anchor is not a medical device. It surfaces patterns from what you tell it,
          so you can share them with your healthcare team. Always consult a qualified
          clinician for medical decisions.
        </p>
      </footer>

      {/* Reasoning ribbon — fixed thin bar above the chat pill */}
      <ReasoningRibbon steps={steps} />

      {/* "Tell Anchor" drawer — natural English → /api/chat → SSE dashboard rebuild */}
      <FloatingChatDrawer />

      {/* Protocol hooks — useCoAgent + useCopilotAction (invisible, no DOM) */}
      <CopilotKitProtocolProof plan={livePlan} />

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

function ReasoningRibbon({ steps }: { steps: Array<{ id: number; text: string }> }) {
  const [open, setOpen] = useState(false);
  if (steps.length === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-2">
        <div className="pointer-events-auto inline-block">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-anchor-mist-100 shadow-soft text-[11px] text-anchor-mist-400 hover:text-anchor-ink-600 focus:outline-none focus:ring-2 focus:ring-anchor-indigo-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-anchor-indigo-600 animate-pulse" aria-hidden />
            <span className="font-semibold">Agent reasoning</span>
            <span className="font-mono">{steps.length}</span>
            <span aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {open && (
            <ol className="pointer-events-auto mt-2 max-w-xl bg-white border border-anchor-mist-100 rounded-2xl shadow-lift p-3 space-y-1.5 max-h-[40vh] overflow-y-auto">
              {steps.slice(-30).map((s) => (
                <li
                  key={s.id}
                  className="text-[11px] font-mono bg-anchor-cream-100 rounded-lg px-2.5 py-1.5 leading-snug text-anchor-ink-600"
                >
                  <span className="text-anchor-indigo-600">›</span> {s.text}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
