// Anchor layouts — top-level wrappers the agent picks per UIPlan.
//
// Each layout decides how to arrange the components (or slot panels). The
// agent never directly mounts a layout; it sets `plan.layout` and the
// renderer picks the wrapper from this file.
//
// Layout philosophy: DriftScoreCards stack vertically as full-width rows
// so each person's sparkline gets real breathing room (~700-900px wide
// instead of 280px crammed in a 3-column grid).

import { renderComponent } from './A2UIComponents';
import type { PlanComponent, UIPlan } from '../types/uiPlan';

// Vertical stack of person rows
const PersonStack = ({ items }: { items: PlanComponent[] }) => (
  <div className="space-y-3">
    {items.map((c, i) => (
      <div key={i}>{renderComponent(c)}</div>
    ))}
  </div>
);

// Two-column grid for supporting cards (TalkingPoints, Timeline, etc.)
const SupportGrid = ({ items }: { items: PlanComponent[] }) => {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((c, i) => {
        // PatternAlert and CombinedTriage are wide cards — span full width
        const fullWidth = c.type === 'PatternAlertCard' || c.type === 'CombinedTriageView';
        return (
          <div key={i} className={fullWidth ? 'lg:col-span-2' : ''}>
            {renderComponent(c)}
          </div>
        );
      })}
    </div>
  );
};

// --- Calm dashboard ------------------------------------------------------

const CalmDashboard = ({ components }: { components: PlanComponent[] }) => {
  const drifts = components.filter((c) => c.type === 'DriftScoreCard');
  const others = components.filter((c) => c.type !== 'DriftScoreCard');
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-anchor-mist-100 bg-white shadow-soft">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-state-green via-anchor-indigo-400 to-state-green opacity-50" />
        <div className="flex items-center gap-5 px-7 py-6">
          <div className="relative w-12 h-12 grid place-items-center" aria-hidden>
            <span className="absolute inset-0 rounded-full bg-state-green/10 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-state-green/20" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-state-green shadow-glow" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-[22px] text-anchor-ink-900 leading-tight">
              Everyone is calm right now.
            </h2>
            <p className="text-[13px] text-anchor-mist-400 mt-1">
              Anchor is quietly tracking the family. Nothing needs your attention.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-anchor-mist-400">
            <span className="px-2.5 py-1 rounded-full bg-anchor-cream-100 border border-anchor-mist-100">
              3 lenses · 0 alerts
            </span>
          </div>
        </div>
      </div>
      <PersonStack items={drifts} />
      {others.length > 0 && <SupportGrid items={others} />}
    </div>
  );
};

// --- Single alert --------------------------------------------------------

const SingleAlert = ({ components }: { components: PlanComponent[] }) => {
  const drifts = components.filter((c) => c.type === 'DriftScoreCard');
  const others = components.filter((c) => c.type !== 'DriftScoreCard');
  return (
    <div className="space-y-6">
      <PersonStack items={drifts} />
      <SupportGrid items={others} />
    </div>
  );
};

// --- Combined triage -----------------------------------------------------
//
// Design principle for this layout (the most-loaded view):
//   When stakes go up, EVIDENCE PER PERSON also goes up. We don't strip;
//   we organise. The triage header gives the executive summary; the three
//   drift cards give the situation overview; then each person gets their
//   own narrative section (alert + timeline + their support card) in
//   urgency order. Three coherent stories, not one undifferentiated soup.

const PERSON_DISPLAY: Record<string, { name: string; role: string; emoji: string }> = {
  helen: { name: 'Helen', role: 'Cognitive wellbeing · Mom (84)',  emoji: '🧠' },
  tom:   { name: 'Tom',   role: 'Physical wellbeing · Dad (68)',   emoji: '❤️' },
  sarah: { name: 'Sarah', role: 'Caregiver wellbeing · You (42)',  emoji: '🌿' },
};

// Stronger containment than a gradient ribbon — each person gets a real
// bordered card with their state colour as the left rail. Everything that
// belongs to that person is visually OWNED by their section. No more
// floating-tile-on-bare-page confusion about whose signal is whose.
const sectionChrome = (color?: string): string => {
  switch (color) {
    case 'red':    return 'border-state-red/35 bg-gradient-to-br from-state-red-soft via-white to-white shadow-[0_4px_32px_rgba(220,38,38,0.08)]';
    case 'amber':  return 'border-state-amber/30 bg-gradient-to-br from-state-amber-soft via-white to-white shadow-[0_4px_32px_rgba(217,119,6,0.07)]';
    case 'yellow': return 'border-state-yellow/30 bg-gradient-to-br from-state-yellow-soft via-white to-white shadow-[0_4px_32px_rgba(202,138,4,0.07)]';
    default:       return 'border-anchor-mist-100 bg-white shadow-soft';
  }
};

const sectionLeftRail = (color?: string): string => {
  switch (color) {
    case 'red':    return 'before:bg-state-red';
    case 'amber':  return 'before:bg-state-amber';
    case 'yellow': return 'before:bg-state-yellow';
    default:       return 'before:bg-anchor-mist-200';
  }
};

// Tinted top banner that runs the full width of the section header — the
// real "chapter divider" the eye latches onto when scrolling.
const sectionBannerWash = (color?: string): string => {
  switch (color) {
    case 'red':    return 'bg-gradient-to-r from-state-red/10 via-state-red/5 to-transparent';
    case 'amber':  return 'bg-gradient-to-r from-state-amber/12 via-state-amber/6 to-transparent';
    case 'yellow': return 'bg-gradient-to-r from-state-yellow/12 via-state-yellow/6 to-transparent';
    default:       return 'bg-gradient-to-r from-anchor-cream-100 via-anchor-cream-50 to-transparent';
  }
};

// Strong avatar treatment with a coloured ring matching state.
const avatarRing = (color?: string): string => {
  switch (color) {
    case 'red':    return 'ring-2 ring-state-red/40 bg-state-red/10';
    case 'amber':  return 'ring-2 ring-state-amber/40 bg-state-amber/10';
    case 'yellow': return 'ring-2 ring-state-yellow/40 bg-state-yellow/10';
    default:       return 'ring-2 ring-anchor-mist-100 bg-anchor-cream-100';
  }
};

// State pill on the section header ("NEEDS ATTENTION", "WORTH RAISING").
const statePillTone = (color?: string): string => {
  switch (color) {
    case 'red':    return 'bg-state-red text-white';
    case 'amber':  return 'bg-state-amber text-white';
    case 'yellow': return 'bg-state-yellow text-white';
    case 'green':  return 'bg-state-green text-white';
    default:       return 'bg-anchor-mist-200 text-white';
  }
};

const stateLabelFor = (color?: string): string => {
  switch (color) {
    case 'red':    return 'Needs attention';
    case 'amber':  return 'Worth raising';
    case 'yellow': return 'Keeping an eye on';
    case 'green':  return 'Calm';
    default:       return '—';
  }
};

const PersonSection = ({
  personId,
  drift,
  cards,
  index,
  total,
}: {
  personId: string;
  drift?: PlanComponent;
  cards: PlanComponent[];
  index: number;
  total: number;
}) => {
  const meta = PERSON_DISPLAY[personId] ?? { name: personId, role: '', emoji: '•' };
  const driftProps = (drift?.props as Record<string, unknown> | undefined) ?? {};
  const color = driftProps.color as string | undefined;
  const score = driftProps.score as number | undefined;
  if (!drift && cards.length === 0) return null;

  return (
    <section
      aria-label={`${meta.name}'s evidence`}
      className={`relative rounded-3xl border overflow-hidden ${sectionChrome(color)} ${sectionLeftRail(color)} before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[6px]`}
    >
      {/* Chapter banner — the thing the eye locks onto when scrolling. A
          full-width tinted band with a large coloured-ring avatar, the
          name in display type, and a clear state pill on the right.
          You always know whose territory you've entered. */}
      <header className={`relative ${sectionBannerWash(color)} px-6 sm:px-8 pt-7 pb-6 border-b border-anchor-mist-100/80`}>
        <div className="flex items-center gap-5">
          <span
            aria-hidden
            className={`shrink-0 inline-flex w-16 h-16 rounded-full items-center justify-center text-[30px] ${avatarRing(color)}`}
          >
            {meta.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-anchor-mist-400">
                Priority {index + 1} of {total}
              </span>
              {color && (
                <span className={`text-[10px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full ${statePillTone(color)}`}>
                  {stateLabelFor(color)}
                </span>
              )}
            </div>
            <h3 className="font-display text-[30px] sm:text-[34px] text-anchor-ink-900 leading-[1.05] tracking-tight">
              {meta.name}
            </h3>
            <p className="text-[12.5px] text-anchor-mist-400 mt-1 leading-snug">
              {meta.role}
            </p>
          </div>
          {typeof score === 'number' && (
            <div className="hidden sm:flex flex-col items-end shrink-0 leading-none">
              <span className="font-display text-[40px] text-anchor-ink-900 tabular-nums leading-none">
                {Math.round(score)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-anchor-mist-400 mt-1">
                Wellbeing today
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Body — evidence cards, with the drift card always at the top and
          the per-card grid below. ObservationLog and Pattern alerts are
          full-width because they're narrative; the small cards (respite,
          talking points) sit two-up. */}
      <div className="px-6 sm:px-8 py-7 space-y-5">
        {drift && <div>{renderComponent(drift)}</div>}
        <div className="grid gap-5 lg:grid-cols-2">
          {cards.map((c, i) => {
            const wide =
              c.type === 'PatternAlertCard' ||
              c.type === 'ContributorMap' ||
              c.type === 'ObservationLogCard' ||
              c.type === 'SignalTimeline';
            return (
              <div key={i} className={wide ? 'lg:col-span-2' : ''}>
                {renderComponent(c)}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CombinedTriage = ({ components }: { components: PlanComponent[] }) => {
  const triage = components.find((c) => c.type === 'CombinedTriageView');
  const drifts = components.filter((c) => c.type === 'DriftScoreCard');
  const supporting = components.filter(
    (c) => c.type !== 'CombinedTriageView' && c.type !== 'DriftScoreCard',
  );

  // Group supporting cards by person_id, preserving the urgency order the
  // backend put them in.
  const byPerson = new Map<string, PlanComponent[]>();
  for (const c of supporting) {
    const pid = (c.props as Record<string, unknown>).person_id as string | undefined;
    if (!pid) continue;
    if (!byPerson.has(pid)) byPerson.set(pid, []);
    byPerson.get(pid)!.push(c);
  }

  const driftFor: Record<string, PlanComponent | undefined> = {};
  for (const d of drifts) {
    const pid = (d.props as Record<string, unknown>).person_id as string;
    driftFor[pid] = d;
  }

  const personOrder = Array.from(byPerson.keys());

  return (
    <div className="space-y-10">
      {/* Executive summary stays at top — the at-a-glance triage. */}
      {triage && <div>{renderComponent(triage)}</div>}

      {/* Each person gets a fully-contained section with bigger breathing
          room between them. The 10-unit (40px) spacing makes the visual
          chapter break unmistakable — no more guessing where Helen's
          territory ends and Sarah's begins. */}
      {personOrder.map((pid, i) => (
        <PersonSection
          key={pid}
          personId={pid}
          drift={driftFor[pid]}
          cards={byPerson.get(pid) ?? []}
          index={i}
          total={personOrder.length}
        />
      ))}
    </div>
  );
};

// --- Public dispatcher ---------------------------------------------------

export function renderLayout(plan: UIPlan) {
  switch (plan.layout) {
    case 'calm_dashboard':   return <CalmDashboard components={plan.components} />;
    case 'single_alert':     return <SingleAlert components={plan.components} />;
    case 'combined_triage':  return <CombinedTriage components={plan.components} />;
    case 'dual_risk': {
      // dual_risk is deprecated. The old shape put components inside
      // slots.{left_panel,right_panel} with an empty top-level components
      // array. Flatten everything into a single components list and let
      // CombinedTriage do its per-person grouping. Defensive fallback so
      // an in-flight old-shape plan never blanks the screen.
      const flattened = [
        ...plan.components,
        ...(plan.slots?.left_panel ?? []),
        ...(plan.slots?.right_panel ?? []),
      ];
      return <CombinedTriage components={flattened} />;
    }
    default:
      return (
        <pre className="text-xs font-mono bg-anchor-cream-100 p-3 rounded">
          Unknown layout: {plan.layout}
        </pre>
      );
  }
}
