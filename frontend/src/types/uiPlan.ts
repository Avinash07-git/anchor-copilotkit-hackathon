/**
 * UI Plan types — must match the backend `app/ui_plan.py` Pydantic models.
 * The agent emits these; the React renderer interprets them.
 */

export type Verdict = 'illegal' | 'ambiguous' | 'fair';
export type Color = 'green' | 'yellow' | 'red' | 'gray';
export type State = 'CA' | 'TX';

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
  on_click?: string;
}

export interface FloorPlanProps {
  width: number;
  height: number;
  rooms: FloorPlanRoom[];
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
}

export type Component =
  | { type: 'ConfidenceMeter';      props: ConfidenceMeterProps }
  | { type: 'FloorPlan';            props: FloorPlanProps }
  | { type: 'RoomCard';             props: RoomCardProps }
  | { type: 'LawCitation';          props: LawCitationProps }
  | { type: 'EvidenceChecklist';    props: EvidenceChecklistProps }
  | { type: 'DemandLetterPreview';  props: DemandLetterPreviewProps };

export interface UIPlanMeta {
  case_id: string;
  state: State;
  last_updated: string;  // ISO 8601
}

export interface UIPlan {
  layout: 'evidence_room';
  components: Component[];
  meta: UIPlanMeta;
}
