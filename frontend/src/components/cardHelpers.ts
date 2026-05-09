// Visual + language helpers for Anchor cards.
//
// Rule: nothing internal leaks to the user surface. Every backend code
// (S3_edema, physical_drift, etc.) must pass through a humanizer here
// before it touches the DOM.
//
// Pure functions only; no React.

import type { Color, Lens, PersonId, State } from '../types/uiPlan';

// --- Avatars ------------------------------------------------------------

export const initialsFor = (displayName: string): string =>
  displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

const PERSON_ACCENTS: Record<PersonId, { ring: string; bg: string; fg: string }> = {
  tom:   { ring: 'ring-rose-200',    bg: 'bg-rose-100',    fg: 'text-rose-700' },
  helen: { ring: 'ring-violet-200',  bg: 'bg-violet-100',  fg: 'text-violet-700' },
  sarah: { ring: 'ring-teal-200',    bg: 'bg-teal-100',    fg: 'text-teal-700' },
};
export const personAccent = (id: PersonId) => PERSON_ACCENTS[id];

export const lensIcon = (lens: Lens): string => {
  switch (lens) {
    case 'body':      return '🫀';
    case 'mind':      return '🧠';
    case 'caregiver': return '💙';
  }
};

// --- Humanizers (THE big fix) -------------------------------------------
//
// Every signal code, instrument key, and lens label gets translated to
// plain English here. If a new code appears in the UI, add it here.

const SIGNAL_LABELS: Record<string, string> = {
  // Tom — HF Symptom Monitoring Framework
  S1_dyspnea:            'Shortness of breath',
  S2_fatigue:            'Unusual fatigue',
  S3_edema:              'Leg / ankle swelling',
  S4_appetite_loss:      'Reduced appetite',
  S5_general_unwellness: 'Generally unwell',
  S6_orthopnea:          'Trouble breathing lying down',
  S7_missed_medication:  'Missed medication',
  S8_weight_gain:        'Sudden weight gain',
  // Helen — NPI subset
  C1_memory_repetition:  'Repeated questions',
  C2_disorientation:     'Disorientation',
  C3_safety_failure:     'Safety lapse',
  C4_agitation:          'Agitation',
  C5_withdrawal:         'Withdrawal',
  C6_sleep_disruption:   'Disrupted sleep',
  C7_self_care_decline:  'Self-care decline',
  C8_language_difficulty:'Word-finding difficulty',
  // Sarah — ZBI-12
  Z1_sleep:              'Sleep difficulty',
  Z2_emotional_exhaustion:'Emotional exhaustion',
  Z3_isolation:          'Feeling isolated',
  Z4_guilt:              'Guilt',
  Z5_loss_of_control:    'Loss of control',
  Z6_financial_stress:   'Financial stress',
  Z7_anger:              'Anger / resentment',
  Z8_health_neglect:     'Self-neglect',
  Z9_relationship_strain:'Relationship strain',
  Z10_hopelessness:      'Hopelessness',
  Z11_fear:              'Fear / anxiety',
  Z12_loss_of_personal_time: 'No time for self',
};

/** Humanise a single backend code, falling back gracefully. */
export const humanSignal = (raw: string): string => {
  const key = raw.trim();
  if (SIGNAL_LABELS[key]) return SIGNAL_LABELS[key]!;
  // Fallback: strip prefix (S3_, C1_, Z10_) and prettify the rest.
  const cleaned = key.replace(/^[A-Z]\d+_/, '').replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/** Backend sometimes joins multiple signals as a comma-separated string. */
export const humanSignalList = (raw: string): string[] =>
  raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(humanSignal);

const INSTRUMENT_LABELS: Record<string, string> = {
  physical_drift:   'HF Symptom Framework',
  cognitive_drift:  'NPI · Neuropsychiatric Inventory',
  caregiver_burden: 'ZBI-12 · Zarit Burden',
};

export const humanInstrument = (raw: string): string =>
  INSTRUMENT_LABELS[raw] ?? raw.replace(/_/g, ' ');

/** Friendly micro-copy under the score number. Used only on amber/red. */
export const friendlyStateCaption = (color: Color): string | null => {
  switch (color) {
    case 'red':    return 'Needs attention now';
    case 'amber':  return 'Worth raising soon';
    case 'yellow': return 'Watching closely';
    case 'green':  return null; // badge already says CALM
    default:       return null;
  }
};

/** Convert "Day -12" / "Day 6" backend labels into "12 days ago" / "today" etc. */
export const friendlyDayLabel = (raw: string): string => {
  // Backend uses a relative day index: 0 = today, negatives = past.
  const m = raw.match(/-?\d+/);
  if (!m) return raw;
  const n = parseInt(m[0]!, 10);
  if (n === 0) return 'Today';
  if (n === -1 || n === 1) return 'Yesterday';
  // Treat both negative and small positive offsets as "N days ago" since
  // the demo dataset uses both conventions.
  const days = Math.abs(n);
  if (days < 14) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return `${weeks} weeks ago`;
};

// --- Sparkline series ---------------------------------------------------
//
// Calm states get a soft, near-flat curve so the eye reads "boring is good".
// Alert states get a clean monotone descent with a brief plateau early.
// All curves use small per-person offsets so the three cards don't twin.

export function deriveSparkline(
  personId: PersonId,
  state: State,
  score: number,
  days = 14,
): number[] {
  const seed = personId.charCodeAt(0) + personId.length * 7;
  // Calm states get a subtle but visible wobble so the line reads as a
  // gentle living trace, not a dead horizontal stripe.
  const wobbleAmp = state === 'green' ? 0.8 : 1.6;
  const wobble = (i: number) =>
    (Math.sin(seed + i * 1.7) + Math.cos(seed * 0.5 + i)) * 0.5 * wobbleAmp;

  // Calm: float around the headline score. Alert: start near a typical
  // baseline and decline to the score.
  const baseline = state === 'green' ? Math.min(99, score) : 96 + ((seed % 3) - 1);
  const endValue = score;

  const bendStart =
    state === 'red'    ? 0.5 :
    state === 'amber'  ? 0.4 :
    state === 'yellow' ? 0.6 :
    /* green */          1.1;

  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    let v: number;
    if (t < bendStart) {
      v = baseline + wobble(i);
    } else {
      const localT = (t - bendStart) / Math.max(0.0001, 1 - bendStart);
      const eased = localT * localT * (3 - 2 * localT);
      v = baseline + (endValue - baseline) * eased + wobble(i) * 0.4;
    }
    // Don't round — fractional values let small wobbles render visibly.
    out.push(Math.max(0, Math.min(100, Number(v.toFixed(2)))));
  }
  out[out.length - 1] = score;
  return out;
}

// --- Colour mapping for cards & sparkline strokes -----------------------

export const sparkStroke = (color: Color): string => {
  switch (color) {
    case 'red':    return '#dc2626';
    case 'amber':  return '#d97706';
    case 'yellow': return '#ca8a04';
    case 'green':  return '#22c55e';
    default:       return '#a3a3a3';
  }
};

export const sparkFill = (color: Color): string => {
  switch (color) {
    case 'red':    return 'rgba(220, 38, 38, 0.08)';
    case 'amber':  return 'rgba(217, 119, 6, 0.08)';
    case 'yellow': return 'rgba(202, 138, 4, 0.08)';
    case 'green':  return 'rgba(34, 197, 94, 0.07)';
    default:       return 'rgba(115, 115, 115, 0.06)';
  }
};

/** Card chrome — single soft border, no nested shadows that look noisy. */
export const cardChrome = (color: Color): string => {
  switch (color) {
    case 'red':
      return 'border-state-red/45 shadow-[0_8px_30px_-12px_rgba(220,38,38,0.25)]';
    case 'amber':
      return 'border-state-amber/45 shadow-[0_8px_30px_-12px_rgba(217,119,6,0.22)]';
    case 'yellow':
      return 'border-state-yellow/40 shadow-[0_4px_20px_-12px_rgba(202,138,4,0.18)]';
    case 'green':
    default:
      return 'border-anchor-mist-100';
  }
};

export const trendArrow = (
  t: 'up' | 'down' | 'flat',
): { glyph: string; cls: string; label: string } => {
  switch (t) {
    case 'up':   return { glyph: '↗', cls: 'text-state-green',     label: 'trending up' };
    case 'down': return { glyph: '↘', cls: 'text-state-red',       label: 'trending down' };
    case 'flat': return { glyph: '→', cls: 'text-anchor-mist-400', label: 'steady' };
  }
};
