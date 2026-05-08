/**
 * UI Plan types — must match the backend `app/ui_plan.py` Pydantic models.
 * The agent emits these; the React renderer interprets them.
 *
 * Verdicts are framed as actionable advice, NOT legal conclusions:
 *   - worth_challenging  → renter has a defensible argument to push back
 *   - needs_more_proof   → could go either way; gather the listed evidence
 *   - likely_reasonable  → deduction looks fair; renter probably shouldn't contest
 */

export type Verdict =
  | 'worth_challenging'
  | 'needs_more_proof'
  | 'likely_reasonable';
export type Color = 'green' | 'yellow' | 'red' | 'gray';
export type State = 'CA' | 'TX';
export type PhotoPhase = 'movein' | 'moveout' | 'unknown';

export interface ConfidenceMeterProps {
  score: number;          // 0-100
  label?: string;
  color?: 'green' | 'yellow' | 'red';
}

export interface FloorPlanRoom {
  id: string;
  label: string;
  shape: 'rect';
  x: number; y: number; w: number; h: number;
  color: Color;
  /** Thumbnail URLs for photos already classified into this room. */
  photo_thumbs?: string[];
  /** Whether this room accepts photo drops from the BulkPhotoBin. */
  accepts_drop?: boolean;
  on_click?: string;
}

export interface FloorPlanProps {
  width: number;
  height: number;
  rooms: FloorPlanRoom[];
}

export interface BulkPhotoBinClassified {
  file_id: string;
  thumb_url: string;
  room_label: string;
  phase: PhotoPhase;
  confidence: number;     // 0.0 - 1.0
}

export interface BulkPhotoBinPending {
  file_id: string;
  thumb_url: string;
}

export interface BulkPhotoBinProps {
  title?: string;
  accepts?: string[];     // MIME types
  classified?: BulkPhotoBinClassified[];
  pending?: BulkPhotoBinPending[];
}

export interface RoomCardProps {
  room_id: string;
  charge_label: string;
  verdict: Verdict;
  one_liner: string;
}

export interface LawCitationProps {
  statute: string;
  quote: string;
  plain_english: string;
  /** Case-specific reasoning, not a flat legal claim. */
  why_worth_challenging: string;
  applies_to_room: string;
}

export interface EvidenceChecklistItem {
  text: string;
  checked: boolean;
}

export interface EvidenceChecklistProps {
  title?: string;
  items: EvidenceChecklistItem[];
}

export interface DemandLetterPreviewProps {
  pdf_url: string;
  amount_disputed: number;
  state: State;
  requires_approval: boolean;
  actions: Array<'approve' | 'edit' | 'download'>;
  disclaimer?: string;
}

export type Component =
  | { type: 'ConfidenceMeter';      props: ConfidenceMeterProps }
  | { type: 'FloorPlan';            props: FloorPlanProps }
  | { type: 'BulkPhotoBin';         props: BulkPhotoBinProps }
  | { type: 'RoomCard';             props: RoomCardProps }
  | { type: 'LawCitation';          props: LawCitationProps }
  | { type: 'EvidenceChecklist';    props: EvidenceChecklistProps }
  | { type: 'DemandLetterPreview';  props: DemandLetterPreviewProps };

export interface UIPlanMeta {
  case_id: string;
  state: State;
  /** Increments on each agent re-emit; the UIPlanInspector dev panel shows the diff. */
  plan_version?: number;
  last_updated: string;  // ISO 8601
}

export interface UIPlan {
  layout: 'evidence_room';
  components: Component[];
  meta: UIPlanMeta;
}
