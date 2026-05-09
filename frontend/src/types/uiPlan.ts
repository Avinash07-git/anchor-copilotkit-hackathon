// Anchor UI Plan types — mirrors backend/app/ui_plan.py.
//
// The agent emits a UIPlan as JSON; the React renderer interprets it and
// mounts the right A2UI components inside the chosen layout. Keep this
// file in sync with the Python models — the FastAPI layer validates
// outgoing plans against Pydantic, but the React renderer trusts these
// types.

export type Lens = 'body' | 'mind' | 'caregiver';
export type Color = 'green' | 'yellow' | 'amber' | 'red' | 'gray';
export type State = 'green' | 'yellow' | 'amber' | 'red';
export type LayoutKind =
  | 'calm_dashboard'
  | 'single_alert'
  | 'dual_risk'
  | 'combined_triage';

export type PersonId = 'tom' | 'helen' | 'sarah';

// --- Component prop types -------------------------------------------------

export interface DriftScoreCardProps {
  person_id: PersonId;
  display_name: string;
  age: number;
  lens: Lens;
  lens_label: string;
  score: number;
  color: Color;
  trend: 'up' | 'down' | 'flat';
  one_liner: string;
  last_updated: string;
  state: State;
  raw_score_label: string;
  instrument: string;
  active_signals?: string[];
  /** Real per-day wellbeing scores, oldest first, last entry == today. */
  score_history?: number[];
}

export interface SignalEntry {
  day_label: string;
  text: string;
  extracted_signal: string;
}

export interface PatternAlertCardProps {
  person_id: PersonId;
  pattern_id: string;
  severity_color: Color;
  title: string;
  why_it_matters: string;
  signals: SignalEntry[];
  suggested_actions: string[];
  disclaimer: string;
  citation: string;
  raw_score_label: string;
  rebuild_reason: string;
  instrument: string;
}

export interface ContributorEntry {
  observer_id: string;
  observer_display: string;
  observer_where: string;
  day_label: string;
  note: string;
}

export interface ContributorMapProps {
  person_id: 'helen';
  title: string;
  baseline_rate_per_month: number;
  this_week_count: number;
  acceleration_factor: number;
  contributors: ContributorEntry[];
}

export interface TalkingPointsCardProps {
  person_id?: PersonId;
  title: string;
  audience: string;
  bullets: string[];
  disclaimer: string;
}

export interface SupportOption {
  name: string;
  kind: string;
  phone: string | null;
  distance_mi: number;
}

export interface RespiteOptionsCardProps {
  person_id?: PersonId;
  title: string;
  options: SupportOption[];
  note: string;
}

export interface SignalTimelineProps {
  person_id: PersonId;
  days: Array<{ day: number; color: Color; label: string }>;
}

export interface ObservationLogEntry {
  day_label: string;
  observer_display: string;
  observer_where?: string;
  note: string;
  severity_color?: Color;
}

export interface ObservationLogCardProps {
  person_id: PersonId;
  title: string;
  subtitle?: string;
  entries: ObservationLogEntry[];
  empty_state?: string;
}

export interface QuickActionCardProps {
  icon: 'phone' | 'message' | 'calendar' | 'checklist' | 'info';
  title: string;
  description: string;
  cta_label: string;
  cta_kind: 'safe' | 'needs_approval';
}

export interface ApprovalPromptProps {
  prompt: string;
  draft_preview: string;
  approve_label: string;
  edit_label: string;
  decline_label: string;
}

export interface TriageRow {
  person_id: PersonId;
  display_name: string;
  lens_label: string;
  color: Color;
  headline: string;
  recommended_first_action: string;
}

export interface CombinedTriageViewProps {
  title: string;
  rationale: string;
  rows: TriageRow[];
  disclaimer: string;
}

// --- Component envelope ---------------------------------------------------

export type ComponentType =
  | 'DriftScoreCard'
  | 'PatternAlertCard'
  | 'ContributorMap'
  | 'TalkingPointsCard'
  | 'RespiteOptionsCard'
  | 'SignalTimeline'
  | 'ObservationLogCard'
  | 'QuickActionCard'
  | 'ApprovalPrompt'
  | 'CombinedTriageView';

export interface PlanComponent {
  type: ComponentType;
  props: Record<string, unknown>;
}

// --- Layout slots (only for dual_risk) -----------------------------------

export interface DualRiskSlots {
  left_panel: PlanComponent[];
  right_panel: PlanComponent[];
}

// --- Top-level UIPlan -----------------------------------------------------

export interface UIPlanMeta {
  family_id: string;
  plan_version: number;
  triggered_by: string | null;
  last_updated: string;
  fallback_reason?: string;
}

export interface UIPlan {
  layout: LayoutKind;
  components: PlanComponent[];
  slots?: DualRiskSlots;
  meta: UIPlanMeta;
}

// --- Helpers --------------------------------------------------------------

export const colorToBadge = (c: Color): string => {
  switch (c) {
    case 'green':  return 'bg-state-green-soft text-state-green border-state-green/40';
    case 'yellow': return 'bg-state-yellow-soft text-state-yellow border-state-yellow/40';
    case 'amber':  return 'bg-state-amber-soft text-state-amber border-state-amber/40';
    case 'red':    return 'bg-state-red-soft text-state-red border-state-red/40';
    default:       return 'bg-anchor-cream-100 text-anchor-mist-400 border-anchor-mist-100';
  }
};

export const colorIcon = (c: Color): string => {
  switch (c) {
    case 'green':  return '●';
    case 'yellow': return '●';
    case 'amber':  return '●';
    case 'red':    return '●';
    default:       return '○';
  }
};

export const colorLabel = (c: Color): string => {
  switch (c) {
    case 'green':  return 'Calm';
    case 'yellow': return 'Watch';
    case 'amber':  return 'Raise';
    case 'red':    return 'Act';
    default:       return 'Tracking';
  }
};
