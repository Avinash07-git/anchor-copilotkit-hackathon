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

// --- Dual risk -----------------------------------------------------------

const DualRisk = ({ slots }: { slots: NonNullable<UIPlan['slots']> }) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-anchor-mist-400">
        Patient
      </h3>
      {slots.left_panel.map((c, i) => (
        <div key={i}>{renderComponent(c)}</div>
      ))}
    </div>
    <div className="space-y-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-anchor-mist-400">
        Caregiver
      </h3>
      {slots.right_panel.map((c, i) => (
        <div key={i}>{renderComponent(c)}</div>
      ))}
    </div>
  </div>
);

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

const stateRibbon = (color?: string): string => {
  switch (color) {
    case 'red':    return 'from-state-red/15 via-state-red/5 to-transparent';
    case 'amber':  return 'from-state-amber/12 via-state-amber/4 to-transparent';
    case 'yellow': return 'from-state-yellow/12 via-state-yellow/4 to-transparent';
    default:       return 'from-anchor-mist-100 via-anchor-mist-50 to-transparent';
  }
};

const PersonSection = ({
  personId,
  drift,
  cards,
}: {
  personId: string;
  drift?: PlanComponent;
  cards: PlanComponent[];
}) => {
  const meta = PERSON_DISPLAY[personId] ?? { name: personId, role: '', emoji: '•' };
  const color = (drift?.props as Record<string, unknown> | undefined)?.color as string | undefined;
  if (!drift && cards.length === 0) return null;
  return (
    <section className="relative">
      {/* Section banner so it's unmistakable which person we're reading. */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${stateRibbon(color)} px-5 py-3 mb-3 border border-anchor-mist-100/70`}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[20px] text-anchor-ink-900 leading-none tracking-tight">
            <span className="mr-2" aria-hidden>{meta.emoji}</span>
            {meta.name}
          </h3>
          <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-anchor-mist-400">
            {meta.role}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {drift && <div>{renderComponent(drift)}</div>}
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((c, i) => {
            // Wide cards take both columns; narrow ones share a row.
            const wide =
              c.type === 'PatternAlertCard' ||
              c.type === 'ContributorMap' ||
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

  // Group supporting cards by person_id. The plan_builder emits them in
  // urgency order; we preserve that order via a Map (insertion-order keyed).
  const byPerson = new Map<string, PlanComponent[]>();
  for (const c of supporting) {
    const pid = (c.props as Record<string, unknown>).person_id as string | undefined;
    if (!pid) continue;
    if (!byPerson.has(pid)) byPerson.set(pid, []);
    byPerson.get(pid)!.push(c);
  }

  // Drift cards keyed by person for the section header lookup.
  const driftFor: Record<string, PlanComponent | undefined> = {};
  for (const d of drifts) {
    const pid = (d.props as Record<string, unknown>).person_id as string;
    driftFor[pid] = d;
  }

  return (
    <div className="space-y-8">
      {/* Executive summary at top */}
      {triage && <div>{renderComponent(triage)}</div>}

      {/* Per-person narrative sections, in urgency order from the backend */}
      {Array.from(byPerson.keys()).map((pid) => (
        <PersonSection
          key={pid}
          personId={pid}
          drift={driftFor[pid]}
          cards={byPerson.get(pid) ?? []}
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
    case 'dual_risk':
      if (!plan.slots) return <SingleAlert components={plan.components} />;
      return <DualRisk slots={plan.slots} />;
    default:
      return (
        <pre className="text-xs font-mono bg-anchor-cream-100 p-3 rounded">
          Unknown layout: {plan.layout}
        </pre>
      );
  }
}
