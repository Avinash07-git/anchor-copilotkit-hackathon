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
    case 'red':    return 'border-state-red/35 bg-gradient-to-br from-state-red-soft via-white to-white shadow-[0_2px_24px_rgba(220,38,38,0.06)]';
    case 'amber':  return 'border-state-amber/30 bg-gradient-to-br from-state-amber-soft via-white to-white shadow-[0_2px_24px_rgba(217,119,6,0.05)]';
    case 'yellow': return 'border-state-yellow/30 bg-gradient-to-br from-state-yellow-soft via-white to-white shadow-[0_2px_24px_rgba(202,138,4,0.05)]';
    default:       return 'border-anchor-mist-100 bg-white';
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

const headerEmojiTone = (color?: string): string => {
  switch (color) {
    case 'red':    return 'bg-state-red/12 text-state-red';
    case 'amber':  return 'bg-state-amber/12 text-state-amber';
    case 'yellow': return 'bg-state-yellow/12 text-state-yellow';
    default:       return 'bg-anchor-cream-100 text-anchor-mist-400';
  }
};

const PersonSection = ({
  personId,
  drift,
  cards,
  index,
}: {
  personId: string;
  drift?: PlanComponent;
  cards: PlanComponent[];
  index: number;
}) => {
  const meta = PERSON_DISPLAY[personId] ?? { name: personId, role: '', emoji: '•' };
  const color = (drift?.props as Record<string, unknown> | undefined)?.color as string | undefined;
  if (!drift && cards.length === 0) return null;
  return (
    <section
      aria-label={`${meta.name}'s evidence`}
      className={`relative rounded-3xl border ${sectionChrome(color)} ${sectionLeftRail(color)} before:content-[''] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-[5px] before:rounded-r-full p-5 sm:p-6`}
    >
      {/* Section header. The number badge anchors urgency, the emoji+name
          anchors WHO, and the role line anchors WHAT lens we're reading. */}
      <header className="flex items-center gap-3 mb-5">
        <span
          aria-hidden
          className={`inline-flex w-10 h-10 rounded-full items-center justify-center text-[18px] ${headerEmojiTone(color)}`}
        >
          {meta.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[22px] text-anchor-ink-900 leading-none tracking-tight">
            {meta.name}
            <span className="ml-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-anchor-mist-400 align-middle">
              · {meta.role}
            </span>
          </h3>
        </div>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] font-bold text-anchor-mist-400">
          Person {index + 1} of 3
        </span>
      </header>
      <div className="space-y-4">
        {drift && <div>{renderComponent(drift)}</div>}
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((c, i) => {
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
    <div className="space-y-6">
      {/* Executive summary stays at top — the at-a-glance triage. */}
      {triage && <div>{renderComponent(triage)}</div>}

      {/* Each person gets a fully-contained section. Vertical stack so each
          DriftScoreCard gets the FULL dashboard width for its sparkline
          (the previous bug: dual_risk gave it a 560px column which forced
          the wide horizontal score row to overflow onto the page bg). */}
      {personOrder.map((pid, i) => (
        <PersonSection
          key={pid}
          personId={pid}
          drift={driftFor[pid]}
          cards={byPerson.get(pid) ?? []}
          index={i}
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
