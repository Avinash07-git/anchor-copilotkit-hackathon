import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from './components/AuthShell';
import FloatingChatDrawer from './components/FloatingChatDrawer';
import LandingPage from './components/LandingPage';
import CopilotKitProtocolProof from './components/CopilotKitProtocolProof';
import NotionPanel from './components/NotionPanel';
import { renderLayout } from './components/Layouts';
import { useAGUIStream } from './hooks/useAGUIStream';
import { currentUser, logout, type AuthUser } from './lib/auth';

const TRIGGERS: Array<{ id: string; label: string; sub: string; tone: 'safe' | 'warn' | 'reset' }> = [
  { id: 'reset', label: 'Reset', sub: 'Calm baseline', tone: 'reset' },
  { id: 'uc1', label: 'Tom · slow slide', sub: 'Body · HF pattern', tone: 'warn' },
  { id: 'uc2', label: 'Helen · silent decline', sub: 'Mind · NPI drift', tone: 'warn' },
  { id: 'uc3', label: 'Sarah · breaking point', sub: 'Caregiver · ZBI override', tone: 'warn' },
];

const isDev = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1';

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const existingUser = await currentUser();
        if (!active) return;
        setUser(existingUser);
        setAuthError(null);
      } catch (err) {
        if (!active) return;
        setAuthError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  if (authLoading) {
    return <BootScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage isAuthenticated={Boolean(user)} />} />
      <Route
        path="/auth"
        element={
          <PublicAuthPage
            user={user}
            authError={authError}
            onAuthenticated={(authenticatedUser) => {
              setUser(authenticatedUser);
              setAuthError(null);
            }}
          />
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute user={user}>
            <CopilotKit runtimeUrl="/api/copilotkit">
              <AuthenticatedWorkspace
                user={user!}
                onLogout={async () => {
                  await logout();
                  setUser(null);
                  navigate('/auth', { replace: true });
                }}
                onSessionExpired={() => {
                  setUser(null);
                  navigate('/auth', { replace: true, state: { expired: true } });
                }}
              />
            </CopilotKit>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Public routes stay accessible, but the application itself lives behind
 * `/app`. This keeps the route contract explicit instead of relying on
 * conditional rendering at `/`.
 */
function ProtectedRoute({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactNode;
}) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function PublicAuthPage({
  user,
  authError,
  onAuthenticated,
}: {
  user: AuthUser | null;
  authError: string | null;
  onAuthenticated: (user: AuthUser) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const intendedPath =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'object' &&
    location.state.from &&
    'pathname' in location.state.from &&
    typeof location.state.from.pathname === 'string'
      ? location.state.from.pathname
      : '/app';

  return (
    <>
      {authError && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-state-red/20 bg-red-50 px-4 py-2 text-sm text-state-red shadow-soft">
          {authError}
        </div>
      )}
      <AuthShell
        onAuthenticated={(authenticatedUser) => {
          onAuthenticated(authenticatedUser);
          navigate(intendedPath, { replace: true });
        }}
      />
    </>
  );
}

function AuthenticatedWorkspace({
  user,
  onLogout,
  onSessionExpired,
}: {
  user: AuthUser;
  onLogout: () => Promise<void>;
  onSessionExpired: () => void;
}) {
  const { plan, steps, connected } = useAGUIStream(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const [forcedPlan, setForcedPlan] = useState<typeof plan>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);

  // Demo-mode hygiene: reset backend to clean state once on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('keep') === '1') return;
    fetch('/demo/reset', { method: 'POST', credentials: 'include' }).catch(() => undefined);
  }, []);

  // Cold-load fallback in case SSE plan_updated hasn't arrived yet
  const [bootPlan, setBootPlan] = useState<typeof plan>(null);

  useEffect(() => {
    if (plan || bootPlan) return;

    let active = true;
    fetch('/api/plan', { credentials: 'include' })
      .then(async (response) => {
        if (response.status === 401) {
          onSessionExpired();
          return null;
        }
        if (!response.ok) {
          throw new Error(`Failed to load plan: HTTP ${response.status}`);
        }
        return (await response.json()) as typeof plan;
      })
      .then((nextPlan) => {
        if (active && nextPlan) setBootPlan(nextPlan);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      active = false;
    };
  }, [plan, bootPlan, onSessionExpired]);

  // Drawer quick examples can replay full demo scenarios. When they do,
  // they publish the returned UIPlan here so the visible dashboard rebuilds
  // immediately instead of waiting on the stream.
  useEffect(() => {
    const applyGeneratedPlan = (event: Event) => {
      const nextPlan = (event as CustomEvent<typeof plan>).detail;
      if (nextPlan) setForcedPlan(nextPlan);
    };
    window.addEventListener('anchor:plan', applyGeneratedPlan);
    return () => window.removeEventListener('anchor:plan', applyGeneratedPlan);
  }, []);

  // If an HTTP trigger returns a plan, trust that exact plan first. This
  // avoids a demo-day race where a late boot reset or SSE event briefly
  // overwrites the scenario the presenter just clicked.
  const livePlan = forcedPlan ?? plan ?? bootPlan;
  const dev = isDev();

  // When the plan rebuilds and contains a CarePlanCard, scroll it into
  // view so the caregiver doesn't miss it under the fold or the chat
  // drawer. Only fires on plan_version changes — not on bootPlan idle.
  const planVersion = livePlan?.meta?.plan_version;
  const hasCarePlan = (livePlan?.components ?? []).some(
    (c: { type: string }) => c.type === 'CarePlanCard',
  );
  const lastScrolledVersion = useRef<number | null>(null);
  useEffect(() => {
    if (!planVersion || !hasCarePlan) return;
    if (lastScrolledVersion.current === planVersion) return;
    lastScrolledVersion.current = planVersion;
    // Wait a beat for the new DOM to land.
    const t = setTimeout(() => {
      const el = document.querySelector('[aria-label="Generated care plan"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
    return () => clearTimeout(t);
  }, [planVersion, hasCarePlan]);

  const fireTrigger = async (triggerId: string) => {
    setBusy(true);
    setError(null);
    setActiveTrigger(triggerId);
    try {
      const path = triggerId === 'reset' ? '/demo/reset' : `/demo/${triggerId}`;
      const res = await fetch(path, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(`Trigger ${triggerId} failed: HTTP ${res.status}`);
      const nextPlan = await res.json();
      setForcedPlan(nextPlan);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-gradient pb-32 text-anchor-ink-600">
      <header className="relative overflow-hidden border-b border-anchor-mist-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 0%, #B06FAA 0, transparent 45%), radial-gradient(circle at 95% 100%, #E5788A 0, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-7 pt-9 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <AnchorMark />
              <div>
                <h1 className="font-display text-[44px] leading-none text-anchor-ink-900 sm:text-[56px]">
                  Anchor
                </h1>
                <p className="mt-2 text-[13px] tracking-wide text-anchor-mist-400">
                  The intelligent layer that was always missing.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <StatusPill connected={connected} />
                <span className="rounded-full border border-anchor-mist-100 bg-white px-3 py-1.5 text-[12px] font-medium text-anchor-ink-600 shadow-soft">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    setLogoutBusy(true);
                    try {
                      await onLogout();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setLogoutBusy(false);
                    }
                  }}
                  disabled={logoutBusy}
                  className="rounded-full border border-anchor-mist-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-anchor-ink-600 shadow-soft transition hover:border-anchor-indigo-200 hover:text-anchor-indigo-700 disabled:opacity-50"
                >
                  {logoutBusy ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
              {dev && (
                <div className="flex items-center gap-2 font-mono text-[10px] text-anchor-mist-400">
                  <span className="rounded-full border border-anchor-mist-100 bg-white px-2 py-1">
                    {livePlan?.layout ?? '…'}
                  </span>
                  <span className="rounded-full border border-anchor-mist-100 bg-white px-2 py-1">
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
              {TRIGGERS.map((trigger) => {
                const isReset = trigger.tone === 'reset';
                const isActive = activeTrigger === trigger.id && !busy;
                return (
                  <button
                    key={trigger.id}
                    type="button"
                    onClick={() => fireTrigger(trigger.id)}
                    disabled={busy}
                    title={trigger.sub}
                    className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200 ${
                      isReset
                        ? 'bg-transparent text-anchor-mist-400 hover:text-anchor-ink-600'
                        : isActive
                          ? 'bg-anchor-indigo-700 text-white shadow-lift'
                          : 'border border-anchor-mist-100 bg-white text-anchor-ink-600 shadow-soft hover:border-transparent hover:bg-anchor-indigo-600 hover:text-white'
                    } ${busy ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {trigger.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-state-red/30 bg-red-50 p-4 text-sm text-state-red">
            {error}
          </div>
        )}
        {livePlan ? (
          <div className="relative" key={livePlan.meta?.plan_version ?? 'v0'}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-2 h-[3px] overflow-hidden rounded-full"
            >
              <div className="animate-rebuildSweep h-full w-1/3 bg-gradient-to-r from-transparent via-anchor-indigo-500 to-transparent" />
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
            Agent fell back to deterministic mode: {livePlan.meta.fallback_reason}
          </p>
        )}
      </section>

      {/* Notion MCP + A2UI panel */}
      <section className="mx-auto max-w-6xl px-6 pb-8 sm:px-8">
        <NotionPanel />
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-8">
        <p className="mx-auto max-w-2xl text-center text-[11px] italic leading-relaxed text-anchor-mist-400">
          Anchor is not a medical device. It surfaces patterns from what you tell it,
          so you can share them with your healthcare team. Always consult a qualified
          clinician for medical decisions.
        </p>
      </footer>

      <ReasoningRibbon steps={steps} />
      <FloatingChatDrawer />
      <CopilotKitProtocolProof plan={livePlan} />

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }`}</style>
    </main>
  );
}

function BootScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream-gradient px-6 text-center">
      <div className="space-y-3">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-anchor-mist-100 bg-white shadow-soft">
          <span className="text-2xl">⚓</span>
        </div>
        <h1 className="font-display text-4xl text-anchor-ink-900">Anchor</h1>
        <p className="text-sm text-anchor-mist-400">Checking your session…</p>
      </div>
    </main>
  );
}

function AnchorMark() {
  return (
    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-indigo-gradient shadow-lift">
      <svg
        viewBox="0 0 24 24"
        className="h-11 w-11 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
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
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        connected
          ? 'border border-state-green/30 bg-state-green-soft text-state-green'
          : 'border border-state-red/30 bg-state-red-soft text-state-red'
      }`}
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${connected ? 'animate-pulse bg-state-green' : 'bg-state-red'}`}
        aria-hidden
      />
      {connected ? 'Live' : 'Reconnecting…'}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="py-24 text-center text-anchor-mist-400">
      <div className="mb-4 inline-grid h-16 w-16 place-items-center rounded-full border border-anchor-mist-100 bg-white shadow-soft">
        <span className="text-2xl">⚓</span>
      </div>
      <p className="text-lg text-anchor-ink-600">Connecting to Anchor…</p>
      <p className="mt-2 text-sm">Waiting for the first dashboard from the agent.</p>
    </div>
  );
}

function ReasoningRibbon({ steps }: { steps: Array<{ id: number; text: string }> }) {
  const [open, setOpen] = useState(false);
  if (steps.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-6xl px-6 pb-2 sm:px-8">
        <div className="pointer-events-auto inline-block">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-anchor-mist-100 bg-white px-3 py-1.5 text-[11px] text-anchor-mist-400 shadow-soft hover:text-anchor-ink-600 focus:outline-none focus:ring-2 focus:ring-anchor-indigo-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-anchor-indigo-600 animate-pulse" aria-hidden />
            <span className="font-semibold">Agent reasoning</span>
            <span className="font-mono">{steps.length}</span>
            <span aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {open && (
            <ol className="pointer-events-auto mt-2 max-h-[40vh] max-w-xl space-y-1.5 overflow-y-auto rounded-2xl border border-anchor-mist-100 bg-white p-3 shadow-lift">
              {steps.slice(-30).map((step) => (
                <li
                  key={step.id}
                  className="rounded-lg bg-anchor-cream-100 px-2.5 py-1.5 font-mono text-[11px] leading-snug text-anchor-ink-600"
                >
                  <span className="text-anchor-indigo-600">›</span> {step.text}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
