// Bedside layouts — top-level wrappers the agent picks per UIPlan.
//
// Each layout decides how to arrange the components (or slot panels). The
// agent never directly mounts a layout; it sets `plan.layout` and the
// renderer picks the wrapper from this file.

import { renderComponent } from './A2UIComponents';
import type { PlanComponent, UIPlan } from '../types/uiPlan';

const Grid = ({ children, cols = 3 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) => {
  const colClass = cols === 3 ? 'lg:grid-cols-3' : cols === 2 ? 'lg:grid-cols-2' : '';
  return <div className={`grid gap-4 sm:grid-cols-2 ${colClass}`}>{children}</div>;
};

// --- Calm dashboard ------------------------------------------------------
// 3 DriftScoreCards. Nothing else. No alerts. The agent's resting state.

const CalmDashboard = ({ components }: { components: PlanComponent[] }) => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <h2 className="text-2xl font-semibold text-bedside-gray-160">Everyone is calm right now.</h2>
      <p className="text-bedside-gray-100 mt-2">
        Bedside is quietly tracking the Reynolds family. Nothing needs your attention.
      </p>
    </div>
    <Grid cols={3}>
      {components.map((c, i) => (
        <div key={i}>{renderComponent(c)}</div>
      ))}
    </Grid>
  </div>
);

// --- Single alert --------------------------------------------------------
// 3 DriftScoreCards across the top, then a featured alert column underneath.

const SingleAlert = ({ components }: { components: PlanComponent[] }) => {
  const drifts = components.filter((c) => c.type === 'DriftScoreCard');
  const others = components.filter((c) => c.type !== 'DriftScoreCard');
  return (
    <div className="space-y-6">
      <Grid cols={3}>
        {drifts.map((c, i) => (
          <div key={i}>{renderComponent(c)}</div>
        ))}
      </Grid>
      <div className="grid gap-4 lg:grid-cols-2">
        {others.map((c, i) => (
          <div
            key={i}
            className={c.type === 'PatternAlertCard' ? 'lg:col-span-2' : ''}
          >
            {renderComponent(c)}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Dual risk -----------------------------------------------------------
// Two-pane split. Left = patient context. Right = caregiver alert + actions.

const DualRisk = ({ slots }: { slots: NonNullable<UIPlan['slots']> }) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-bedside-gray-100">
        Patient
      </h3>
      {slots.left_panel.map((c, i) => (
        <div key={i}>{renderComponent(c)}</div>
      ))}
    </div>
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-bedside-gray-100">
        Caregiver
      </h3>
      {slots.right_panel.map((c, i) => (
        <div key={i}>{renderComponent(c)}</div>
      ))}
    </div>
  </div>
);

// --- Combined triage -----------------------------------------------------
// CombinedTriageView at top. Then 3 DriftScoreCards. Then most-urgent alert.

const CombinedTriage = ({ components }: { components: PlanComponent[] }) => {
  const triage = components.find((c) => c.type === 'CombinedTriageView');
  const drifts = components.filter((c) => c.type === 'DriftScoreCard');
  const rest = components.filter(
    (c) => c.type !== 'CombinedTriageView' && c.type !== 'DriftScoreCard',
  );
  return (
    <div className="space-y-6">
      {triage && <div>{renderComponent(triage)}</div>}
      <Grid cols={3}>
        {drifts.map((c, i) => (
          <div key={i}>{renderComponent(c)}</div>
        ))}
      </Grid>
      <div className="space-y-4">
        {rest.map((c, i) => (
          <div key={i}>{renderComponent(c)}</div>
        ))}
      </div>
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
        <pre className="text-xs font-mono bg-bedside-gray-10 p-3 rounded">
          Unknown layout: {plan.layout}
        </pre>
      );
  }
}
