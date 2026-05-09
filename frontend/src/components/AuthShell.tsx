import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { AuthUser } from '../lib/auth';
import { login, register } from '../lib/auth';

interface Props {
  onAuthenticated: (user: AuthUser) => void;
}

type AuthMode = 'login' | 'register';

export default function AuthShell({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const credentials = { email, password };
      const user = mode === 'login'
        ? await login(credentials)
        : await register(credentials);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-[#5B4FD9]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at top left, rgba(91,79,217,0.10), transparent 32%), radial-gradient(circle at bottom right, rgba(224,90,122,0.07), transparent 28%)',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-[rgba(91,79,217,0.16)] bg-[rgba(255,255,255,0.80)] px-4 py-2 shadow-[0_10px_35px_rgba(44,34,138,0.08)] backdrop-blur"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #5B4FD9 0%, #3B2FCF 100%)' }}>
              <AnchorGlyph />
            </span>
            <span className="text-left">
              <span className="block font-display text-lg font-semibold leading-none text-[#1F1B2C]">
                Anchor
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-[rgba(91,79,217,0.50)]">
                Back to home
              </span>
            </span>
          </Link>
        </header>

        <div className="grid flex-1 gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="max-w-2xl space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(91,79,217,0.55)]">
              Access
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] text-[#1F1B2C] sm:text-6xl">
              Sign in to the working workspace.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[#6B6580] sm:text-lg">
              The application, live plan, protected stream, and message actions are
              available only after sign-in.
            </p>
          </section>

          <section className="w-full max-w-md rounded-[28px] border border-[rgba(91,79,217,0.16)] bg-white p-6 shadow-[0_18px_45px_rgba(44,34,138,0.10)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(91,79,217,0.50)]">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#1F1B2C]">
                  {mode === 'login' ? 'Sign in' : 'Register'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode((current) => (current === 'login' ? 'register' : 'login'));
                  setError(null);
                }}
                className="rounded-full border border-[rgba(91,79,217,0.18)] px-3 py-1.5 text-xs font-semibold text-[#5B4FD9] transition hover:border-[#5B4FD9] hover:bg-[#5B4FD9] hover:text-white"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <label className="block space-y-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(91,79,217,0.50)]">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={busy}
                  className="w-full rounded-2xl border border-[rgba(91,79,217,0.14)] bg-[#f5f3ff] px-4 py-3 text-sm text-[#1F1B2C] outline-none transition focus:border-[#5B4FD9] focus:bg-white focus:ring-4 focus:ring-[rgba(91,79,217,0.12)]"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(91,79,217,0.50)]">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  disabled={busy}
                  className="w-full rounded-2xl border border-[rgba(91,79,217,0.14)] bg-[#f5f3ff] px-4 py-3 text-sm text-[#1F1B2C] outline-none transition focus:border-[#5B4FD9] focus:bg-white focus:ring-4 focus:ring-[rgba(91,79,217,0.12)]"
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !email.trim() || !password.trim()}
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(91,79,217,0.20)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #5B4FD9 0%, #C75B8A 60%, #E05A7A 100%)' }}
              >
                {busy ? 'Working…' : mode === 'login' ? 'Sign in to Anchor' : 'Create account'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function AnchorGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
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
  );
}
