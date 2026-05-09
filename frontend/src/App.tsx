import { useEffect, useState } from 'react';
import { useAGUIStream } from './hooks/useAGUIStream';
import { renderLayout } from './components/Layouts';

/**
 * Bedside — App shell.
 *
 * Single-page dashboard that subscribes to the agent's UIPlan stream over
 * SSE and re-renders whenever a new plan arrives. The demo control bar
 * fires the four scripted triggers (UC1 / UC2 / UC3 / reset).
 */
const TRIGGERS: Array<{ id: string; label: string; tone: 'safe' | 'warn' | 'reset' }> = [
  { id: 'reset', label: '↻ Reset to baseline', tone: 'reset' },
  { id: 'uc1',   label: '① Tom — slow slide', tone: 'warn' },
  { id: 'uc2',   label: '② Helen — silent decline', tone: 'warn' },
  { id: 'uc3',   label: '③ Sarah — breaking point', tone: 'warn' },
];

export default function App() {
  const { plan, steps, connected } = useAGUIStream();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First fetch in case SSE plan_updated hasn't arrived yet (e.g. cold load)
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
      // The new plan arrives via SSE plan_updated — no need to read the body.
      await res.json();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-bedside-gray-10 text-bedside-gray-160">
      <header className="bg-bedside-blue-100 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>🛏️</span>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Bedside</h1>
              <p className="text-xs opacity-80 leading-tight">
                The intelligent layer that was always missing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline opacity-80">
              Layout: <span className="font-mono">{livePlan?.layout ?? '…'}</span>
              {' · '}
              v<span className="font-mono">{livePlan?.meta.plan_version ?? '?'}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${
                connected ? 'bg-bedside-spark-100 text-bedside-gray-160' : 'bg-bedside-red-100 text-white'
              }`}
              aria-live="polite"
            >
              <span aria-hidden>●</span>
              {connected ? 'AG-UI live' : 'reconnecting…'}
            </span>
          </div>
        </div>
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap gap-2"
          aria-label="Demo triggers"
        >
          {TRIGGERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => fireTrigger(t.id)}
              disabled={busy}
              className={`px-3 py-1.5 rounded-lg font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-bedside-spark-100/40 transition-colors ${
                t.tone === 'reset'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-bedside-spark-100 text-bedside-gray-160 hover:bg-bedside-spark-140 hover:text-white'
              } ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {error && (
            <div className="mb-4 rounded-lg bg-bedside-red-10 border border-bedside-red-100 p-3 text-sm text-bedside-red-100">
              {error}
            </div>
          )}
          {livePlan ? (
            renderLayout(livePlan)
          ) : (
            <div className="text-center py-24 text-bedside-gray-100">
              <p className="text-lg">Connecting to Bedside…</p>
              <p className="text-sm mt-2">Waiting for the first UIPlan from the agent.</p>
            </div>
          )}

          {livePlan?.meta.fallback_reason && (
            <p className="mt-6 text-xs italic text-bedside-gray-100">
              ⚠ Agent fell back to deterministic mode: {livePlan.meta.fallback_reason}
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-bedside-gray-50 bg-white shadow-sm p-4">
            <h2 className="text-sm font-semibold text-bedside-gray-160 flex items-center gap-2">
              <span aria-hidden>🤖</span>
              Agent reasoning
            </h2>
            <p className="text-xs text-bedside-gray-100 mt-1">
              Live AG-UI stream from the Bedside agent. Each step shows what
              the agent is doing right now.
            </p>
            <ol className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {steps.length === 0 && (
                <li className="text-xs italic text-bedside-gray-100">
                  Idle — fire a trigger to see the agent compose a new dashboard.
                </li>
              )}
              {steps.map((s) => (
                <li
                  key={s.id}
                  className="text-xs font-mono bg-bedside-gray-10 rounded-lg p-2 leading-snug text-bedside-gray-160"
                >
                  <span className="text-bedside-blue-100">›</span> {s.text}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-4 text-[11px] text-bedside-gray-100 italic px-1">
            Bedside is not a medical device. It surfaces patterns from what
            you tell it, so you can share them with your healthcare team.
          </p>
        </aside>
      </div>
    </main>
  );
}
