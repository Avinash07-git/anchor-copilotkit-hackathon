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

// --- Atoms ---------------------------------------------------------------

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section
    className={`rounded-2xl border border-bedside-gray-50 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </section>
);

const CardHeader = ({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) => (
  <header className="mb-3">
    <h3 className="text-base font-semibold text-bedside-gray-160 flex items-center gap-2">
      {icon && <span aria-hidden>{icon}</span>}
      <span>{title}</span>
    </h3>
    {subtitle && <p className="text-xs text-bedside-gray-100 mt-1">{subtitle}</p>}
  </header>
);

const Disclaimer = ({ text }: { text: string }) => (
  <p className="mt-4 pt-3 border-t border-bedside-gray-50 text-xs italic text-bedside-gray-100">
    {text}
  </p>
);

// --- DriftScoreCard ------------------------------------------------------

export const DriftScoreCard = (p: DriftScoreCardProps) => (
  <Card>
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-base font-semibold text-bedside-gray-160">
          {p.display_name}
          <span className="text-bedside-gray-100 font-normal text-sm ml-2">· {p.age}</span>
        </h3>
        <p className="text-xs text-bedside-gray-100">{p.lens_label}</p>
      </div>
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${colorToBadge(p.color)}`}
      >
        <span aria-hidden>{colorIcon(p.color)}</span>
        {colorLabel(p.color)}
      </span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-bold tabular-nums text-bedside-gray-160">{p.score}</span>
      <span className="text-bedside-gray-100 text-sm">/ 100 wellbeing</span>
    </div>
    <p className="text-sm text-bedside-gray-160 mt-2">{p.one_liner}</p>
    <p className="text-[11px] text-bedside-gray-100 mt-3 font-mono">
      {p.raw_score_label} · {p.instrument}
    </p>
  </Card>
);

// --- PatternAlertCard ----------------------------------------------------

export const PatternAlertCard = (p: PatternAlertCardProps) => (
  <Card className={`border-l-4 ${
    p.severity_color === 'red' ? 'border-l-bedside-red-100' :
    p.severity_color === 'amber' ? 'border-l-bedside-amber-100' :
    p.severity_color === 'yellow' ? 'border-l-bedside-spark-140' :
    'border-l-bedside-gray-50'
  }`}>
    <CardHeader icon={colorIcon(p.severity_color)} title={p.title} />
    <p className="text-sm text-bedside-gray-160 leading-relaxed">{p.why_it_matters}</p>

    {p.rebuild_reason && (
      <p className="mt-3 text-xs text-bedside-gray-100 italic">
        Why now: {p.rebuild_reason}
      </p>
    )}

    {p.signals.length > 0 && (
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-bedside-gray-100 mb-2">
          Recent signals
        </h4>
        <ul className="space-y-2">
          {p.signals.map((s, i) => (
            <li key={i} className="text-sm bg-bedside-gray-10 rounded-lg p-3">
              <span className="text-xs font-mono text-bedside-gray-100">{s.day_label}</span>
              <p className="text-bedside-gray-160 mt-1">"{s.text}"</p>
              <p className="text-[11px] text-bedside-gray-100 mt-1 font-mono">
                → {s.extracted_signal}
              </p>
            </li>
          ))}
        </ul>
      </div>
    )}

    {p.suggested_actions.length > 0 && (
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-bedside-gray-100 mb-2">
          You might want to
        </h4>
        <ul className="space-y-1 text-sm text-bedside-gray-160">
          {p.suggested_actions.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden>·</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    <p className="mt-4 text-[11px] font-mono text-bedside-gray-100 bg-bedside-gray-10 p-2 rounded">
      📚 {p.citation}
    </p>
    <p className="text-[11px] font-mono text-bedside-gray-100 mt-1">
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
        <li key={i} className="text-sm text-bedside-gray-160 flex gap-2">
          <span className="text-bedside-blue-100 font-bold" aria-hidden>•</span>
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
        <div key={i} className="bg-bedside-gray-10 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-bedside-gray-160">{c.observer_display}</span>
            <span className="text-xs text-bedside-gray-100 font-mono">{c.day_label}</span>
          </div>
          <p className="text-xs text-bedside-gray-100 mt-0.5">{c.observer_where}</p>
          <p className="text-bedside-gray-160 mt-2">"{c.note}"</p>
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
        <li key={i} className="bg-bedside-gray-10 rounded-lg p-3 text-sm flex justify-between">
          <div>
            <p className="font-semibold text-bedside-gray-160">{o.name}</p>
            <p className="text-xs text-bedside-gray-100">{o.kind} · {o.distance_mi} mi</p>
          </div>
          {o.phone && (
            <a
              href={`tel:${o.phone}`}
              className="text-bedside-blue-100 font-mono text-xs self-center hover:underline focus:outline-none focus:ring-2 focus:ring-bedside-blue-100 rounded"
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
        <h3 className="font-semibold text-bedside-gray-160">{p.title}</h3>
        <p className="text-sm text-bedside-gray-100 mt-1">{p.description}</p>
        <button
          type="button"
          className={`mt-3 px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-bedside-blue-100/40 ${
            p.cta_kind === 'needs_approval'
              ? 'bg-bedside-spark-100 text-bedside-gray-160 hover:bg-bedside-spark-140 hover:text-white'
              : 'bg-bedside-blue-100 text-white hover:bg-bedside-blue-110'
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
  approved: { icon: '✅', text: 'Sent. Bedside will let you know when there’s a reply.', tone: 'text-bedside-green-100' },
  editing:  { icon: '✏️', text: 'Opening the draft for you to revise before sending.',  tone: 'text-bedside-blue-100' },
  declined: { icon: '🚫', text: 'Got it — nothing was sent.',                            tone: 'text-bedside-gray-100' },
  error:    { icon: '⚠️', text: 'Couldn’t reach the agent. Try again in a moment.',     tone: 'text-bedside-red-100' },
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
    <Card className="border-l-4 border-l-bedside-spark-100">
      <CardHeader icon="✋" title={p.prompt} subtitle="Human-in-the-loop — Bedside never sends without you" />
      <blockquote className="bg-bedside-gray-10 rounded-lg p-3 text-sm text-bedside-gray-160 italic whitespace-pre-line">
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
            className="px-4 py-2 rounded-lg bg-bedside-blue-100 text-white font-semibold text-sm hover:bg-bedside-blue-110 focus:outline-none focus:ring-4 focus:ring-bedside-blue-100/40 disabled:opacity-50"
          >
            {p.approve_label}
          </button>
          <button
            type="button"
            onClick={() => decide('edit')}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-white border border-bedside-gray-50 text-bedside-gray-160 font-semibold text-sm hover:bg-bedside-gray-10 focus:outline-none focus:ring-4 focus:ring-bedside-blue-100/40 disabled:opacity-50"
          >
            {p.edit_label}
          </button>
          <button
            type="button"
            onClick={() => decide('decline')}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-bedside-gray-100 font-semibold text-sm hover:text-bedside-gray-160 focus:outline-none focus:ring-2 focus:ring-bedside-gray-100/40 disabled:opacity-50"
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
  <Card className="border-l-4 border-l-bedside-red-100">
    <CardHeader icon="🚨" title={p.title} subtitle={p.rationale} />
    <ol className="space-y-3">
      {p.rows.map((r, i) => (
        <li
          key={r.person_id}
          className={`rounded-lg p-4 border-l-4 bg-bedside-gray-10 ${
            r.color === 'red' ? 'border-l-bedside-red-100' :
            r.color === 'amber' ? 'border-l-bedside-amber-100' :
            r.color === 'yellow' ? 'border-l-bedside-spark-140' :
            'border-l-bedside-gray-50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-bedside-gray-100">#{i + 1} · {r.lens_label}</p>
              <h4 className="font-semibold text-bedside-gray-160 text-base mt-0.5">
                {colorIcon(r.color)} {r.display_name}
              </h4>
              <p className="text-sm text-bedside-gray-160 mt-1">{r.headline}</p>
              <p className="text-sm text-bedside-blue-100 mt-2">→ {r.recommended_first_action}</p>
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
          <p className="text-sm text-bedside-red-100 font-mono">
            Unknown component type: {c.type}
          </p>
        </Card>
      );
  }
}
