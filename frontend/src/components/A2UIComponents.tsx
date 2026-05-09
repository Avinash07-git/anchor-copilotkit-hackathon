// Anchor A2UI components — the 9 component types the agent renders.
//
// Each component is presentation-only. Data flows top-down from the
// UIPlan emitted by the agent. Internal codes (S3_edema, etc.) are
// translated through cardHelpers.humanSignal before they hit the DOM —
// nothing internal leaks to the user surface.

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
  friendlyDayLabel,
  friendlyStateCaption,
  humanInstrument,
  humanSignalList,
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
    className={`rounded-2xl border border-anchor-mist-100 bg-white p-6 shadow-soft ${className}`}
  >
    {children}
  </section>
);

const CardHeader = ({
  icon, title, subtitle, accent,
}: { icon?: string; title: string; subtitle?: string; accent?: string }) => (
  <header className="mb-4">
    <h3 className="text-[17px] font-semibold text-anchor-ink-900 leading-snug flex items-start gap-2">
      {icon && <span className={`text-base mt-0.5 ${accent ?? ''}`} aria-hidden>{icon}</span>}
      <span>{title}</span>
    </h3>
    {subtitle && <p className="text-[13px] text-anchor-mist-400 mt-1.5 leading-relaxed">{subtitle}</p>}
  </header>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-anchor-mist-400 mb-2.5">
    {children}
  </h4>
);

// Humanised signal chips (replaces the old "→ S3_edema, S4_appetite_loss" line).
const SignalChips = ({ raw }: { raw: string }) => {
  const labels = humanSignalList(raw);
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {labels.map((l, i) => (
        <span
          key={i}
          className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-anchor-cream-100 text-anchor-ink-100 border border-anchor-mist-100"
        >
          {l}
        </span>
      ))}
    </div>
  );
};

// --- DriftScoreCard ------------------------------------------------------
// Horizontal row layout: avatar + identity (left), big score (center),
// wide breathing sparkline (right). Stacked vertically by the layout, this
// gives each person a full-width band instead of a cramped column.

const captionTone = (color: string): string => {
  switch (color) {
    case 'red':    return 'text-state-red';
    case 'amber':  return 'text-state-amber';
    case 'yellow': return 'text-state-yellow';
    default:       return 'text-anchor-mist-400';
  }
};

// Signal chip tone matches the person's current state color, but as a
// soft fill so the chips read as supporting evidence (not duplicate alarms).
const signalChipTone = (color: string): string => {
  switch (color) {
    case 'red':    return 'bg-state-red-soft text-state-red border-state-red/25';
    case 'amber':  return 'bg-state-amber-soft text-state-amber border-state-amber/25';
    case 'yellow': return 'bg-state-yellow-soft text-state-yellow border-state-yellow/30';
    default:       return 'bg-anchor-cream-100 text-anchor-ink-600 border-anchor-mist-100';
  }
};

export const DriftScoreCard = (p: DriftScoreCardProps) => {
  const accent = personAccent(p.person_id);
  const arrow = trendArrow(p.trend);
  // Prefer the REAL per-day score history from the backend (re-runs the
  // instrument with today=d for d in the 14-day window). Fall back to
  // the synthetic wobble only if the backend didn't supply history — a
  // safety net for older plans, never the production path.
  const series =
    p.score_history && p.score_history.length >= 2
      ? p.score_history
      : deriveSparkline(p.person_id, p.state, p.score);
  const stroke = sparkStroke(p.color);
  const fill = sparkFill(p.color);
  const caption = friendlyStateCaption(p.color);
  return (
    <section
      className={`group relative rounded-2xl border bg-white p-5 sm:p-6 transition-all hover:shadow-lift ${cardChrome(p.color)}`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-7">
        {/* Identity column — the people are the product, so they get real estate. */}
        <div className="flex items-center gap-4 md:w-[260px] md:flex-shrink-0">
          <div
            className={`relative w-20 h-20 md:w-[88px] md:h-[88px] rounded-full grid place-items-center font-semibold text-[22px] md:text-[26px] ring-[5px] ${accent.ring} ${accent.bg} ${accent.fg} flex-shrink-0 shadow-sm`}
            aria-hidden
          >
            {initialsFor(p.display_name)}
            <span
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white grid place-items-center text-[13px] shadow-md border border-anchor-mist-100"
              title={p.lens_label}
            >
              {lensIcon(p.lens)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[26px] md:text-[28px] font-semibold text-anchor-ink-900 leading-[1.05] tracking-tight">
              {p.display_name.split(' ')[0]}
              <span className="text-anchor-mist-400 font-normal text-base ml-2">· {p.age}</span>
            </h3>
            <p className="text-[11px] text-anchor-mist-400 uppercase tracking-[0.14em] font-semibold mt-1.5">
              {p.lens_label.replace(/\s*wellbeing$/i, '')}
            </p>
          </div>
        </div>

        {/* Score column — cockpit instrument. Tabular, slashed-zero, big. */}
        <div className="flex flex-col md:w-[200px] md:flex-shrink-0 md:border-l md:border-anchor-mist-100/70 md:pl-7">
          <div className="flex items-baseline gap-1.5">
            <span className="font-cockpit text-[64px] md:text-[78px] font-semibold text-anchor-ink-900 leading-none">
              {p.score}
            </span>
            <span className="text-anchor-mist-400 text-sm font-mono">/ 100</span>
            {p.trend !== 'flat' && (
              <span
                className={`ml-1 inline-flex items-center text-[18px] ${arrow.cls}`}
                aria-label={arrow.label}
                title={arrow.label}
              >
                {arrow.glyph}
              </span>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${colorToBadge(p.color)}`}
            >
              <span aria-hidden className="text-[8px]">{colorIcon(p.color)}</span>
              {colorLabel(p.color)}
            </span>
            {caption && (
              <span className={`text-[12px] font-medium ${captionTone(p.color)}`}>
                {caption}
              </span>
            )}
          </div>
        </div>

        {/* Trend chart column — takes the rest of the width */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="text-[10px] text-anchor-mist-400 uppercase tracking-[0.12em] font-semibold">
              Last 14 days
            </p>
            <p className="text-[10px] text-anchor-mist-400">
              <span>14 days ago</span>
              <span className="mx-2 text-anchor-mist-100">—</span>
              <span className="font-medium text-anchor-ink-100">today</span>
            </p>
          </div>
          <Sparkline
            data={series}
            stroke={stroke}
            fill={fill}
            height={140}
            ariaLabel={`${p.display_name} 14-day wellbeing trend, currently ${p.score} out of 100`}
          />
          {p.active_signals && p.active_signals.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-anchor-mist-400 mr-1">
                Active signals
              </span>
              {p.active_signals.map((sig, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${signalChipTone(p.color)}`}
                >
                  {sig}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// --- PatternAlertCard ----------------------------------------------------
// Progressive disclosure: summary + actions are visible by default;
// signal evidence + citation collapse into a <details> so the user can
// drill in without being overwhelmed.

const severityLeftBorder = (color: string): string => {
  switch (color) {
    case 'red':    return 'border-l-state-red';
    case 'amber':  return 'border-l-state-amber';
    case 'yellow': return 'border-l-state-yellow';
    default:       return 'border-l-anchor-mist-200';
  }
};

// Background tint for the alert body — makes red alerts FEEL like alarms
// (not just text on cream). Subtle on amber/yellow, more present on red.
const severityBgTint = (color: string): string => {
  switch (color) {
    case 'red':    return 'bg-gradient-to-br from-red-50/90 via-white to-white border-red-100';
    case 'amber':  return 'bg-gradient-to-br from-amber-50/70 via-white to-white border-amber-100';
    case 'yellow': return 'bg-gradient-to-br from-yellow-50/50 via-white to-white border-yellow-100';
    default:       return '';
  }
};

const severityIconColor = (color: string): string => {
  switch (color) {
    case 'red':    return 'text-state-red';
    case 'amber':  return 'text-state-amber';
    case 'yellow': return 'text-state-yellow';
    default:       return 'text-anchor-mist-400';
  }
};

export const PatternAlertCard = (p: PatternAlertCardProps) => {
  const isCritical = p.severity_color === 'red';
  return (
    <Card
      className={`border-l-[6px] ${severityLeftBorder(p.severity_color)} ${severityBgTint(p.severity_color)} ${isCritical ? 'alert-pulse' : ''}`}
    >
    <CardHeader
      icon={colorIcon(p.severity_color)}
      title={p.title}
      accent={severityIconColor(p.severity_color)}
    />
    <p className="text-[14px] text-anchor-ink-600 leading-relaxed">{p.why_it_matters}</p>

    {p.rebuild_reason && (
      <p className="mt-3 text-[12px] text-anchor-mist-400 leading-relaxed bg-anchor-cream-100 rounded-lg px-3 py-2">
        <span className="font-semibold text-anchor-ink-100">Why now · </span>
        {p.rebuild_reason}
      </p>
    )}

    {p.suggested_actions.length > 0 && (
      <div className="mt-5">
        <SectionLabel>Next steps</SectionLabel>
        <ul className="space-y-2">
          {p.suggested_actions.map((a, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] text-anchor-ink-600 leading-relaxed">
              <span className="text-anchor-indigo-600 font-bold mt-0.5" aria-hidden>→</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {p.signals.length > 0 && (
      <details className="mt-5 group">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-anchor-mist-400 hover:text-anchor-indigo-600 transition select-none">
          <span className="transition-transform group-open:rotate-90" aria-hidden>▸</span>
          What Anchor noticed ({p.signals.length})
        </summary>
        <ul className="space-y-2 mt-3">
          {p.signals.map((s, i) => (
            <li key={i} className="text-[13px] bg-anchor-cream-100 rounded-lg px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-anchor-mist-400">
                  {friendlyDayLabel(s.day_label)}
                </span>
              </div>
              <p className="text-anchor-ink-600 mt-1 leading-snug">"{s.text}"</p>
              <SignalChips raw={s.extracted_signal} />
            </li>
          ))}
        </ul>
      </details>
    )}

    <p className="mt-5 pt-3 border-t border-anchor-mist-100/70 text-[11px] text-anchor-mist-400 italic leading-relaxed">
      Source · {p.citation}
    </p>
  </Card>
  );
};

// --- TalkingPointsCard ---------------------------------------------------

export const TalkingPointsCard = (p: TalkingPointsCardProps) => (
  <Card>
    <CardHeader icon="✎" title={p.title} subtitle={`Ready to share with ${p.audience}`} />
    <ul className="space-y-2.5">
      {p.bullets.map((b, i) => (
        <li key={i} className="text-[14px] text-anchor-ink-600 flex gap-2.5 leading-relaxed">
          <span className="text-anchor-indigo-600 mt-0.5" aria-hidden>•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </Card>
);

// --- ContributorMap ------------------------------------------------------

export const ContributorMap = (p: ContributorMapProps) => (
  <Card>
    <CardHeader
      icon="◐"
      title={p.title}
      subtitle={`${p.this_week_count} observations this week — usually around ${p.baseline_rate_per_month}/month. That's ${p.acceleration_factor}× the usual rate.`}
    />
    <div className="grid sm:grid-cols-2 gap-3">
      {p.contributors.map((c, i) => (
        <div
          key={i}
          className="relative bg-gradient-to-br from-anchor-cream-100 via-anchor-cream-50 to-white rounded-xl p-4 text-[13px] shadow-sm border border-anchor-mist-100/70 hover:shadow-md transition-shadow"
        >
          <span
            aria-hidden
            className="absolute top-2 left-3 text-anchor-mist-200 font-display text-[28px] leading-none select-none"
          >“</span>
          <div className="flex items-center justify-between gap-2 pl-5">
            <span className="font-semibold text-anchor-ink-900 text-[14px]">{c.observer_display}</span>
            <span className="text-[11px] text-anchor-mist-400 font-medium">{friendlyDayLabel(c.day_label)}</span>
          </div>
          <p className="text-[11px] text-anchor-mist-400 mt-0.5 pl-5 italic">{c.observer_where}</p>
          <p className="text-anchor-ink-600 mt-2 leading-snug pl-5">{c.note}”</p>
        </div>
      ))}
    </div>
  </Card>
);

// --- RespiteOptionsCard --------------------------------------------------

export const RespiteOptionsCard = (p: RespiteOptionsCardProps) => (
  <Card>
    <CardHeader icon="✦" title={p.title} subtitle={p.note} />
    <ul className="space-y-2">
      {p.options.map((o, i) => (
        <li key={i} className="bg-anchor-cream-100 rounded-xl p-3.5 text-[13px] flex justify-between items-center">
          <div>
            <p className="font-semibold text-anchor-ink-600">{o.name}</p>
            <p className="text-[11px] text-anchor-mist-400 mt-0.5">{o.kind} · {o.distance_mi} mi</p>
          </div>
          {o.phone && (
            <a
              href={`tel:${o.phone}`}
              className="text-anchor-indigo-600 font-mono text-[12px] self-center hover:underline focus:outline-none focus:ring-2 focus:ring-anchor-indigo-600 rounded"
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

const dayCellClass = (color: string): string => {
  switch (color) {
    case 'red':    return 'bg-state-red text-white border-state-red';
    case 'amber':  return 'bg-state-amber text-white border-state-amber';
    case 'yellow': return 'bg-state-yellow text-white border-state-yellow';
    case 'green':  return 'bg-state-green-soft text-state-green border-state-green/30';
    default:       return 'bg-white text-anchor-mist-400 border-anchor-mist-100';
  }
};

export const SignalTimeline = (p: SignalTimelineProps) => (
  <Card>
    <CardHeader
      icon="◳"
      title="Signal timeline · last 14 days"
      subtitle="Each cell is one day. Brighter colour means more activity that day. Hover any cell for details."
    />
    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(14, minmax(0,1fr))' }}>
      {p.days.map((d) => (
        <div
          key={d.day}
          className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold border ${dayCellClass(d.color)}`}
          title={`${d.day === 0 ? 'Today' : `${Math.abs(d.day)} day${Math.abs(d.day) === 1 ? '' : 's'} ago`}: ${d.label}`}
        >
          {d.day === 0 ? '·' : Math.abs(d.day)}
        </div>
      ))}
    </div>
    <div className="mt-3 flex items-center gap-3 text-[11px] text-anchor-mist-400">
      <span>14d ago</span>
      <span className="flex-1 h-px bg-anchor-mist-100" />
      <span className="font-medium text-anchor-ink-100">today</span>
    </div>
    <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
      {[
        ['Calm',  'bg-state-green-soft border-state-green/30 text-state-green'],
        ['Watch', 'bg-state-yellow-soft border-state-yellow/30 text-state-yellow'],
        ['Raise', 'bg-state-amber text-white border-state-amber'],
        ['Act',   'bg-state-red text-white border-state-red'],
      ].map(([label, cls]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm border ${cls}`} />
          <span className="text-anchor-mist-400">{label}</span>
        </span>
      ))}
    </div>
  </Card>
);

// --- QuickActionCard -----------------------------------------------------

const ICONS: Record<QuickActionCardProps['icon'], string> = {
  phone: '📞', message: '✉', calendar: '📅', checklist: '☑', info: 'ℹ',
};

export const QuickActionCard = (p: QuickActionCardProps) => (
  <Card>
    <div className="flex items-start gap-3">
      <span className="text-2xl text-anchor-indigo-600" aria-hidden>{ICONS[p.icon]}</span>
      <div className="flex-1">
        <h3 className="font-semibold text-anchor-ink-900">{p.title}</h3>
        <p className="text-[13px] text-anchor-mist-400 mt-1 leading-relaxed">{p.description}</p>
        <button
          type="button"
          className={`mt-3 px-4 py-2 rounded-xl font-semibold text-[13px] focus:outline-none focus:ring-4 focus:ring-anchor-indigo-600/30 transition ${
            p.cta_kind === 'needs_approval'
              ? 'bg-anchor-coral-400 text-white hover:bg-anchor-coral-500'
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

type ApprovalState = 'pending' | 'approved' | 'editing' | 'declined' | 'error';

const APPROVAL_STATE_COPY: Record<Exclude<ApprovalState, 'pending'>, { icon: string; text: string; tone: string }> = {
  approved: { icon: '✓', text: 'Sent. Anchor will let you know when there’s a reply.', tone: 'text-state-green' },
  editing:  { icon: '✎', text: 'Opening the draft for you to revise before sending.',  tone: 'text-anchor-indigo-600' },
  declined: { icon: '✕', text: 'Got it — nothing was sent.',                            tone: 'text-anchor-mist-400' },
  error:    { icon: '!', text: 'Couldn’t reach the agent. Try again in a moment.',     tone: 'text-state-red' },
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
      <CardHeader
        icon="✋"
        title={p.prompt}
        subtitle="Anchor never sends a message without your approval."
      />
      <blockquote className="bg-anchor-cream-100 rounded-xl p-4 text-[14px] text-anchor-ink-600 italic whitespace-pre-line leading-relaxed">
        {p.draft_preview}
      </blockquote>
      {resolved ? (
        <p className={`mt-4 text-[14px] font-semibold ${resolved.tone}`}>
          <span aria-hidden className="mr-1">{resolved.icon}</span> {resolved.text}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => decide('approve')}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-anchor-indigo-600 text-white font-semibold text-[13px] hover:bg-anchor-indigo-700 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-600/30 disabled:opacity-50"
          >
            {p.approve_label}
          </button>
          <button
            type="button"
            onClick={() => decide('edit')}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-white border border-anchor-mist-100 text-anchor-ink-600 font-semibold text-[13px] hover:bg-anchor-cream-100 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-600/30 disabled:opacity-50"
          >
            {p.edit_label}
          </button>
          <button
            type="button"
            onClick={() => decide('decline')}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-anchor-mist-400 font-semibold text-[13px] hover:text-anchor-ink-600 focus:outline-none focus:ring-2 focus:ring-anchor-mist-400/40 disabled:opacity-50"
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
    <CardHeader icon="◉" title={p.title} subtitle={p.rationale} accent="text-state-red" />
    <ol className="space-y-2.5">
      {p.rows.map((r, i) => (
        <li
          key={r.person_id}
          className={`rounded-xl p-4 border-l-4 bg-anchor-cream-100 ${severityLeftBorder(r.color)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-anchor-mist-400">
                Priority #{i + 1} · {r.lens_label}
              </p>
              <h4 className="font-semibold text-anchor-ink-900 text-[15px] mt-1">
                {r.display_name}
              </h4>
              <p className="text-[13px] text-anchor-ink-600 mt-1.5 leading-snug">{r.headline}</p>
              <p className="text-[13px] text-anchor-indigo-600 mt-2 leading-snug">
                <span aria-hidden>→ </span>{r.recommended_first_action}
              </p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorToBadge(r.color)}`}>
              {colorLabel(r.color)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  </Card>
);

// --- Renderer dispatch ---------------------------------------------------

export function renderComponent(c: { type: string; props: Record<string, unknown> }) {
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

// Avoid an unused import warning when humanInstrument isn't exercised
// directly by a component (it's still re-exported for future use in cards).
void humanInstrument;
