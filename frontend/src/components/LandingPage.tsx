import { Link } from 'react-router-dom';

export default function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
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

      <div className="relative mx-auto max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <header className="rounded-full border border-[rgba(91,79,217,0.16)] bg-[rgba(255,255,255,0.80)] px-4 py-3 shadow-[0_10px_35px_rgba(44,34,138,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_10px_24px_rgba(91,79,217,0.25)]" style={{ background: 'linear-gradient(135deg, #5B4FD9 0%, #3B2FCF 100%)' }}>
                <AnchorGlyph size="lg" />
              </span>
              <div>
                <p className="font-display text-4xl font-bold leading-none tracking-tight text-[#1F1B2C] sm:text-5xl">Anchor</p>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-[rgba(91,79,217,0.55)]">
                  Family care coordination
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="rounded-full border border-[rgba(91,79,217,0.20)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B4FD9] transition hover:bg-[#5B4FD9] hover:text-white"
              >
                Sign in
              </Link>
              {isAuthenticated && (
                <Link
                  to="/app"
                  className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #5B4FD9 0%, #C75B8A 60%, #E05A7A 100%)' }}
                >
                  Open app
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-12 pb-14 pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(91,79,217,0.16)] bg-[rgba(255,255,255,0.80)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(91,79,217,0.75)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#5B4FD9]" />
              Private, shared workspace
            </div>

            <div className="space-y-5">
              <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[1.04] text-[#1F1B2C] sm:text-6xl lg:text-[4.2rem]">
                Keep the whole care picture steady.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#6B6580] sm:text-lg">
                Anchor brings physical health changes, cognitive changes, and caregiver
                strain into one secure place so families can notice patterns earlier and
                respond with better context.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/app' : '/auth'}
                className="rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(91,79,217,0.20)] transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #5B4FD9 0%, #C75B8A 60%, #E05A7A 100%)' }}
              >
                {isAuthenticated ? 'Open workspace' : 'Get started'}
              </Link>
            </div>
          </div>

          <section className="rounded-[30px] border border-[rgba(91,79,217,0.16)] bg-[rgba(255,255,255,0.80)] p-5 shadow-[0_18px_50px_rgba(44,34,138,0.10)] backdrop-blur">
            <div className="rounded-[24px] border border-[rgba(91,79,217,0.12)] bg-[#f5f3ff] p-5">
              <div className="border-b border-[rgba(91,79,217,0.12)] pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(91,79,217,0.55)]">
                  Inside the workspace
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#1F1B2C]">
                  One place for what changed and what comes next.
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <SurfacePanel
                  title="Physical wellbeing"
                  body="Track health-related observations as they accumulate over time."
                />
                <SurfacePanel
                  title="Cognitive wellbeing"
                  body="Keep a cleaner record of repeated moments across family members."
                />
                <SurfacePanel
                  title="Caregiver wellbeing"
                  body="Surface warning and red-alarm states inside the signed-in workspace."
                />
              </div>
            </div>
          </section>
        </section>

        <section className="grid gap-4 border-t border-[rgba(91,79,217,0.12)] py-10 sm:grid-cols-3">
          <FeatureCard
            eyebrow="Capture"
            title="Notes stay structured"
            body="Family updates, context, and follow-up actions stay in the same flow."
          />
          <FeatureCard
            eyebrow="Review"
            title="Scores stay readable"
            body="Warning bands and alarms are visible without turning the app into a wall of noise."
          />
          <FeatureCard
            eyebrow="Act"
            title="Sharing stays deliberate"
            body="Drafts and outbound actions stay behind sign-in and explicit approval."
          />
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <article className="rounded-[24px] border border-[rgba(91,79,217,0.14)] bg-[rgba(255,255,255,0.80)] p-5 shadow-[0_12px_28px_rgba(44,34,138,0.06)] backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(91,79,217,0.50)]">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-[#1F1B2C]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-[#6B6580]">{body}</p>
    </article>
  );
}

function SurfacePanel({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[22px] border border-[rgba(91,79,217,0.12)] bg-white p-4">
      <p className="text-sm font-semibold text-[#1F1B2C]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#6B6580]">{body}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(91,79,217,0.08)]">
        <div className="h-full w-2/3 rounded-full" style={{ background: 'linear-gradient(90deg, #E05A7A, #C75B8A, #5B4FD9)' }} />
      </div>
    </article>
  );
}

function AnchorGlyph({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
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
