// Bedside UI Plan types — mirrors backend/app/ui_plan.py exactly.
//
// The agent emits a UIPlan as JSON; the React renderer interprets it and
// mounts the right A2UI components inside the chosen layout. See
// BEDSIDE_SPEC.md §6 + §7. Keep this file in sync with the Python models —
// the FastAPI layer validates outgoing plans against Pydantic, but the
// React renderer trusts these types.

export type Lens = 'body' | 'mind' | 'caregiver';
export type Color = 'green' | 'yellow' | 'amber' | 'red' | 'gray';
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
  score: number; // 0-100
  color: Color;
  trend: 'up' | 'down' | 'flat';
  one_liner: string;
  last_updated: string; // ISO datetime
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
  title: string;
  options: SupportOption[];
  note: string;
}

export interface SignalTimelineProps {
  person_id: PersonId;
  days: Array<{ day: number; color: Color; label: string }>;
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
  rows: TriageRow[]; // ordered by agent's chosen priority
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
  | 'QuickActionCard'
  | 'ApprovalPrompt'
  | 'CombinedTriageView';

export interface Component {
  type: ComponentType;
  // The renderer narrows props by component type at the switch site.
  props: Record<string, unknown>;
}

// --- Layout slots (only for dual_risk) -----------------------------------

export interface DualRiskSlots {
  left_panel: Component[];
  right_panel: Component[];
}

// --- Top-level UIPlan -----------------------------------------------------

export interface UIPlanMeta {
  family_id: string;
  plan_version: number;
  triggered_by: string | null;
  last_updated: string;
}

export interface UIPlan {
  layout: LayoutKind;
  components: Component[];
  slots?: DualRiskSlots; // only present when layout === 'dual_risk'
  meta: UIPlanMeta;
}
