// Bedside A2UI components — the 9 component types the agent renders.
//
// Each component is a small, presentation-only React function. All state
// + data flows top-down from the UIPlan emitted by the agent. The renderer
// in App.tsx switches on component.type and mounts the matching one here.
//
// One exception: ApprovalPrompt holds local UI state to track the
// human-in-the-loop decision (CopilotKit's renderAndWait pattern).

import { useState } from 'react';
import {
  ApprovalPromptProps,
  CombinedTriageViewProps,
  ContributorMapProps,
  DriftScoreCardProps,
  PatternAlertCardProps,
  QuickActionCardProps,
  RespiteOptionsCardProps,
  SignalTimelineProps,
  TalkingPointsCardProps,
  colorIcon,
  colorLabel,
  colorToBadge,
} from '../types/uiPlan';
import {
  cardChrome,
  deriveSparkline,
  initialsFor,
  lensIcon,
  personAccent,
  sparkFill,
  sparkStroke,
  trendArrow,
} from './cardHelpers';
import { Sparkline } from './Sparkline';

// --- Atoms ---------------------------------------------------------------

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section
    className={`rounded-2xl border border-anchor-mist-100 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </section>
);

const CardHeader = ({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) => (
  <header className="mb-3">
    <h3 className="text-base font-semibold text-anchor-ink-600 flex items-center gap-2">
      {icon && <span aria-hidden>{icon}</span>}
      <span>{title}</span>
    </h3>
    {subtitle && <p className="text-xs text-anchor-mist-400 mt-1">{subtitle}</p>}
  </header>
);

const Disclaimer = ({ text }: { text: string }) => (
  <p className="mt-4 pt-3 border-t border-anchor-mist-100 text-xs italic text-anchor-mist-400">
    {text}
  </p>
);

// --- DriftScoreCard ------------------------------------------------------
//
// The most-shown card in the app. Carries the wellbeing headline AND a
// 14-day sparkline so the trend tells a story even at a glance. The
// sparkline is derived client-side (see cardHelpers.deriveSparkline) — we
// don't have real time-series in the demo backend.

export const DriftScoreCard = (p: DriftScoreCardProps) => {
  const accent = personAccent(p.person_id);
  const arrow = trendArrow(p.trend);
  const series = deriveSparkline(p.person_id, p.state, p.score);
  const stroke = sparkStroke(p.color);
  const fill = sparkFill(p.color);
  return (
    <section
      className={`group relative rounded-2xl border bg-white p-5 transition-all hover:shadow-lift ${cardChrome(p.color)}`}
    >
      {/* Header: avatar + name + state badge */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`relative w-11 h-11 rounded-full grid place-items-center font-semibold text-sm ring-4 ${accent.ring} ${accent.bg} ${accent.fg} flex-shrink-0`}
          aria-hidden
        >
          {initialsFor(p.display_name)}
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white grid place-items-center text-[11px] shadow-sm border border-anchor-mist-100"
            title={p.lens_label}
          >
            {lensIcon(p.lens)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-anchor-ink-600 leading-tight truncate">
            {p.display_name.split(' ')[0]}
            <span className="text-anchor-mist-400 font-normal text-xs ml-1.5">· {p.age}</span>
          </h3>
          <p className="text-[10px] text-anchor-mist-400 uppercase tracking-wider font-semibold mt-0.5 truncate">
            {p.lens_label.replace(/\s*wellbeing$/i, '')}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${colorToBadge(p.color)}`}
        >
          <span aria-hidden>{colorIcon(p.color)}</span>
          {colorLabel(p.color)}
        </span>
      </div>

      {/* Score + trend caption stacked on their own rows so nothing wraps oddly */}
      <div className="flex items-baseline gap-1">
        <span className="font-display text-5xl font-semibold tabular-nums text-anchor-ink-900 leading-none">
          {p.score}
        </span>
        <span className="text-anchor-mist-400 text-xs font-mono">/100</span>
        <span
          className={`ml-auto inline-flex items-center gap-1 text-[11px] font-semibold ${arrow.cls}`}
          aria-label={arrow.label}
        >
          <span aria-hidden className="text-sm">{arrow.glyph}</span>
          <span>{p.one_liner}</span>
        </span>
      </div>

      {/* Sparkline */}
      <div className="mt-3">
        <Sparkline
          data={series}
          stroke={stroke}
          fill={fill}
          height={42}
          ariaLabel={`${p.display_name} 14-day wellbeing trend, currently ${p.score} out of 100`}
        />
        <div className="flex items-center justify-between text-[10px] text-anchor-mist-400 font-mono mt-1">
          <span>14d ago</span>
          <span>today</span>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-[10px] text-anchor-mist-400 mt-3 font-mono border-t border-anchor-mist-100/60 pt-2">
        {p.raw_score_label} · {p.instrument}
      </p>
    </section>
  );
};

// --- PatternAlertCard ----------------------------------------------------

export const PatternAlertCard = (p: PatternAlertCardProps) => (
  <Card className={`border-l-4 ${
    p.severity_color === 'red' ? 'border-l-state-red' :
    p.severity_color === 'amber' ? 'border-l-state-amber' :
    p.severity_color === 'yellow' ? 'border-l-anchor-coral-600' :
    'border-l-anchor-mist-100'
  }`}>
    <CardHeader icon={colorIcon(p.severity_color)} title={p.title} />
    <p className="text-sm text-anchor-ink-600 leading-relaxed">{p.why_it_matters}</p>

    {p.rebuild_reason && (
      <p className="mt-3 text-xs text-anchor-mist-400 italic">
        Why now: {p.rebuild_reason}
      </p>
    )}

    {p.signals.length > 0 && (
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-anchor-mist-400 mb-2">
          Recent signals
        </h4>
        <ul className="space-y-2">
          {p.signals.map((s, i) => (
            <li key={i} className="text-sm bg-anchor-cream-100 rounded-lg p-3">
              <span className="text-xs font-mono text-anchor-mist-400">{s.day_label}</span>
              <p className="text-anchor-ink-600 mt-1">"{s.text}"</p>
              <p className="text-[11px] text-anchor-mist-400 mt-1 font-mono">
                → {s.extracted_signal}
              </p>
            </li>
          ))}
        </ul>
      </div>
    )}

    {p.suggested_actions.length > 0 && (
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-anchor-mist-400 mb-2">
          You might want to
        </h4>
        <ul className="space-y-1 text-sm text-anchor-ink-600">
          {p.suggested_actions.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden>·</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    <p className="mt-4 text-[11px] font-mono text-anchor-mist-400 bg-anchor-cream-100 p-2 rounded">
      📚 {p.citation}
    </p>
    <p className="text-[11px] font-mono text-anchor-mist-400 mt-1">
      Score: {p.raw_score_label} · {p.instrument}
    </p>
    <Disclaimer text={p.disclaimer} />
  </Card>
);

// --- TalkingPointsCard ---------------------------------------------------

export const TalkingPointsCard = (p: TalkingPointsCardProps) => (
  <Card>
    <CardHeader icon="🗒️" title={p.title} subtitle={`Audience: ${p.audience}`} />
    <ul className="space-y-2">
      {p.bullets.map((b, i) => (
        <li key={i} className="text-sm text-anchor-ink-600 flex gap-2">
          <span className="text-anchor-indigo-600 font-bold" aria-hidden>•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
    <Disclaimer text={p.disclaimer} />
  </Card>
);

// --- ContributorMap ------------------------------------------------------

export const ContributorMap = (p: ContributorMapProps) => (
  <Card>
    <CardHeader
      icon="🗺️"
      title={p.title}
      subtitle={`This week: ${p.this_week_count} observations · usually ~${p.baseline_rate_per_month}/month · ${p.acceleration_factor}× acceleration`}
    />
    <div className="grid sm:grid-cols-2 gap-2">
      {p.contributors.map((c, i) => (
        <div key={i} className="bg-anchor-cream-100 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-anchor-ink-600">{c.observer_display}</span>
            <span className="text-xs text-anchor-mist-400 font-mono">{c.day_label}</span>
          </div>
          <p className="text-xs text-anchor-mist-400 mt-0.5">{c.observer_where}</p>
          <p className="text-anchor-ink-600 mt-2">"{c.note}"</p>
        </div>
      ))}
    </div>
  </Card>
);

// --- RespiteOptionsCard --------------------------------------------------

export const RespiteOptionsCard = (p: RespiteOptionsCardProps) => (
  <Card>
    <CardHeader icon="🤝" title={p.title} subtitle={p.note} />
    <ul className="space-y-2">
      {p.options.map((o, i) => (
        <li key={i} className="bg-anchor-cream-100 rounded-lg p-3 text-sm flex justify-between">
          <div>
            <p className="font-semibold text-anchor-ink-600">{o.name}</p>
            <p className="text-xs text-anchor-mist-400">{o.kind} · {o.distance_mi} mi</p>
          </div>
          {o.phone && (
            <a
              href={`tel:${o.phone}`}
              className="text-anchor-indigo-600 font-mono text-xs self-center hover:underline focus:outline-none focus:ring-2 focus:ring-anchor-indigo-600 rounded"
            >
              {o.phone}
            </a>
          )}
        </li>
      ))}
    </ul>
  </Card>
);

// --- SignalTimeline ------------------------------------------------------

export const SignalTimeline = (p: SignalTimelineProps) => (
  <Card>
    <CardHeader icon="📈" title="Signal timeline" subtitle="Last 14 days" />
    <div className="grid grid-cols-14 gap-1" style={{ gridTemplateColumns: 'repeat(14, minmax(0,1fr))' }}>
      {p.days.map((d) => (
        <div
          key={d.day}
          className={`aspect-square rounded flex items-center justify-center text-[10px] font-mono border ${colorToBadge(d.color)}`}
          title={`Day ${d.day}: ${d.label}`}
        >
          {d.day}
        </div>
      ))}
    </div>
  </Card>
);

// --- QuickActionCard -----------------------------------------------------

const ICONS: Record<QuickActionCardProps['icon'], string> = {
  phone: '📞', message: '✉️', calendar: '📅', checklist: '☑️', info: 'ℹ️',
};

export const QuickActionCard = (p: QuickActionCardProps) => (
  <Card>
    <div className="flex items-start gap-3">
      <span className="text-2xl" aria-hidden>{ICONS[p.icon]}</span>
      <div className="flex-1">
        <h3 className="font-semibold text-anchor-ink-600">{p.title}</h3>
        <p className="text-sm text-anchor-mist-400 mt-1">{p.description}</p>
        <button
          type="button"
          className={`mt-3 px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-anchor-indigo-600/40 ${
            p.cta_kind === 'needs_approval'
              ? 'bg-anchor-coral-400 text-anchor-ink-600 hover:bg-anchor-coral-600 hover:text-white'
              : 'bg-anchor-indigo-600 text-white hover:bg-anchor-indigo-700'
          }`}
        >
          {p.cta_label}
        </button>
      </div>
    </div>
  </Card>
);

// --- ApprovalPrompt ------------------------------------------------------
// HITL — agent renders a draft, caregiver approves/edits/declines, decision
// is POSTed back to FastAPI which narrates it into the AG-UI step stream.
// This is the renderAndWait pattern from CopilotKit — implemented natively
// here so the demo doesn't depend on the CopilotKit Node runtime being up.

type ApprovalState = 'pending' | 'approved' | 'editing' | 'declined' | 'error';

const APPROVAL_STATE_COPY: Record<Exclude<ApprovalState, 'pending'>, { icon: string; text: string; tone: string }> = {
  approved: { icon: '✅', text: 'Sent. Bedside will let you know when there’s a reply.', tone: 'text-state-green' },
  editing:  { icon: '✏️', text: 'Opening the draft for you to revise before sending.',  tone: 'text-anchor-indigo-600' },
  declined: { icon: '🚫', text: 'Got it — nothing was sent.',                            tone: 'text-anchor-mist-400' },
  error:    { icon: '⚠️', text: 'Couldn’t reach the agent. Try again in a moment.',     tone: 'text-state-red' },
};

export const ApprovalPrompt = (p: ApprovalPromptProps) => {
  const [state, setState] = useState<ApprovalState>('pending');
  const [busy, setBusy] = useState(false);

  const decide = async (decision: 'approve' | 'edit' | 'decline') => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, prompt: p.prompt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState(decision === 'approve' ? 'approved' : decision === 'edit' ? 'editing' : 'declined');
    } catch {
      setState('error');
    } finally {
      setBusy(false);
    }
  };

  const resolved = state !== 'pending' ? APPROVAL_STATE_COPY[state] : null;

  return (
    <Card className="border-l-4 border-l-anchor-coral-400">
      <CardHeader icon="✋" title={p.prompt} subtitle="Human-in-the-loop — Bedside never sends without you" />
      <blockquote className="bg-anchor-cream-100 rounded-lg p-3 text-sm text-anchor-ink-600 italic whitespace-pre-line">
        {p.draft_preview}
      </blockquote>
      {resolved ? (
        <p className={`mt-4 text-sm font-semibold ${resolved.tone}`}>
          <span aria-hidden>{resolved.icon}</span> {resolved.text}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => decide('approve')}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-anchor-indigo-600 text-white font-semibold text-sm hover:bg-anchor-indigo-700 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-600/40 disabled:opacity-50"
          >
            {p.approve_label}
          </button>
          <button
            type="button"
            onClick={() => decide('edit')}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-white border border-anchor-mist-100 text-anchor-ink-600 font-semibold text-sm hover:bg-anchor-cream-100 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-600/40 disabled:opacity-50"
          >
            {p.edit_label}
          </button>
          <button
            type="button"
            onClick={() => decide('decline')}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-anchor-mist-400 font-semibold text-sm hover:text-anchor-ink-600 focus:outline-none focus:ring-2 focus:ring-anchor-mist-400/40 disabled:opacity-50"
          >
            {p.decline_label}
          </button>
        </div>
      )}
    </Card>
  );
};

// --- CombinedTriageView --------------------------------------------------

export const CombinedTriageView = (p: CombinedTriageViewProps) => (
  <Card className="border-l-4 border-l-state-red">
    <CardHeader icon="🚨" title={p.title} subtitle={p.rationale} />
    <ol className="space-y-3">
      {p.rows.map((r, i) => (
        <li
          key={r.person_id}
          className={`rounded-lg p-4 border-l-4 bg-anchor-cream-100 ${
            r.color === 'red' ? 'border-l-state-red' :
            r.color === 'amber' ? 'border-l-state-amber' :
            r.color === 'yellow' ? 'border-l-anchor-coral-600' :
            'border-l-anchor-mist-100'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-anchor-mist-400">#{i + 1} · {r.lens_label}</p>
              <h4 className="font-semibold text-anchor-ink-600 text-base mt-0.5">
                {colorIcon(r.color)} {r.display_name}
              </h4>
              <p className="text-sm text-anchor-ink-600 mt-1">{r.headline}</p>
              <p className="text-sm text-anchor-indigo-600 mt-2">→ {r.recommended_first_action}</p>
            </div>
            <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold border ${colorToBadge(r.color)}`}>
              {colorLabel(r.color)}
            </span>
          </div>
        </li>
      ))}
    </ol>
    <Disclaimer text={p.disclaimer} />
  </Card>
);

// --- Renderer dispatch ---------------------------------------------------

export function renderComponent(c: { type: string; props: Record<string, unknown> }) {
  // Cast at the boundary; runtime types come from the agent over the wire.
  const props = c.props as any;
  switch (c.type) {
    case 'DriftScoreCard':     return <DriftScoreCard {...(props as DriftScoreCardProps)} />;
    case 'PatternAlertCard':   return <PatternAlertCard {...(props as PatternAlertCardProps)} />;
    case 'TalkingPointsCard':  return <TalkingPointsCard {...(props as TalkingPointsCardProps)} />;
    case 'ContributorMap':     return <ContributorMap {...(props as ContributorMapProps)} />;
    case 'RespiteOptionsCard': return <RespiteOptionsCard {...(props as RespiteOptionsCardProps)} />;
    case 'SignalTimeline':     return <SignalTimeline {...(props as SignalTimelineProps)} />;
    case 'QuickActionCard':    return <QuickActionCard {...(props as QuickActionCardProps)} />;
    case 'ApprovalPrompt':     return <ApprovalPrompt {...(props as ApprovalPromptProps)} />;
    case 'CombinedTriageView': return <CombinedTriageView {...(props as CombinedTriageViewProps)} />;
    default:
      return (
        <Card>
          <p className="text-sm text-state-red font-mono">
            Unknown component type: {c.type}
          </p>
        </Card>
      );
  }
}
