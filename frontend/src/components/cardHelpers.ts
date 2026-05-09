// Visual helpers for the score cards — kept here so the component file
// stays focused on layout/markup. Pure functions only; no React.

import type { Color, Lens, PersonId, State } from '../types/uiPlan';

// --- Avatars ------------------------------------------------------------

/** Initials derived from "Tom Reynolds" → "TR". */
export const initialsFor = (displayName: string): string =>
  displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

/** Stable visual accent per person — independent of their current state.
 * Used for the avatar ring + lens icon background. Severity goes elsewhere. */
const PERSON_ACCENTS: Record<PersonId, { ring: string; bg: string; fg: string }> = {
  tom:   { ring: 'ring-rose-200',    bg: 'bg-rose-100',    fg: 'text-rose-700' },
  helen: { ring: 'ring-violet-200',  bg: 'bg-violet-100',  fg: 'text-violet-700' },
  sarah: { ring: 'ring-teal-200',    bg: 'bg-teal-100',    fg: 'text-teal-700' },
};
export const personAccent = (id: PersonId) => PERSON_ACCENTS[id];

/** Lens emoji — paired with text label for accessibility. */
export const lensIcon = (lens: Lens): string => {
  switch (lens) {
    case 'body':      return '🫀';
    case 'mind':      return '🧠';
    case 'caregiver': return '💙';
  }
};

// --- Sparkline series ---------------------------------------------------

/**
 * Generate a believable 14-day wellbeing trend from the current state.
 *
 * We don't get a real time-series from the backend (the demo only persists
 * the latest score), so we synthesise one that *visually tells the same
 * story* the headline number does:
 *  - green: gentle wave around 95-99 (life is fine)
 *  - yellow: small dip in the last few days
 *  - amber: visible drift downward
 *  - red:   sharp drop in the final third
 *
 * The series is fully deterministic per (person, score, state) so the
 * sparkline doesn't flicker between renders. A tiny per-person seed adds
 * variation so the three cards don't draw identical curves.
 */
export function deriveSparkline(
  personId: PersonId,
  state: State,
  score: number,
  days = 14,
): number[] {
  // Cheap deterministic noise: hash personId + day → small wobble in [-2, 2].
  const seed = personId.charCodeAt(0) + personId.length * 7;
  const wobble = (i: number) => ((Math.sin(seed + i * 1.7) + Math.cos(seed * 0.5 + i)) * 1.5);

  // Baseline is what life looked like 2 weeks ago — usually stable & high.
  const baseline = state === 'red' || state === 'amber' ? 96 : 95;

  // For green/yellow, the "end" is just slightly lower than baseline.
  // For amber/red, the end is the *current* re.
  const endValue = state === 'green' ? baseline : score;

  // How aggressively the curve bends down (0 = flat, 1 = sudden cliff at the end).
  const bendStartFraction = state === 'red' ? 0.65 : state === 'amber' ? 0.4 : 0.85;

  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1); // 0..1
    let v: number;
    if (t < bendStartFraction) {
      v = baseline + wobble(i);
    } else {
      const localT = (t - bendStartFraction) / (1 - bendStartFraction);
      // Smooth ease-in for the drop
      const eased = localT * localT;
      v = baseline + (endValue - baseline) * eased + wobble(i) * 0.4;
    }
    out.push(Math.max(0, Math.min(100, Math.round(v))));
  }
  // Anchor the last point exactly at the headline score so chart matches number.
  out[out.length - 1] = score;
  return out;
}

// --- Colour mapping for cards & sparkline strokes -----------------------

export const sparkStroke = (color: Color): string => {
  switch (color) {
    case 'red':    return '#dc2626';
    case 'amber':  return '#d97706';
    case 'yellow': return '#ca8a04';
    case 'green':  return '#16a34a';
    default:       return '#737373';
  }
};

export const sparkFill = (color: Color): string => {
  switch (color) {
    case 'red':    return 'rgba(220, 38, 38, 0.10)';
    case 'amber':  return 'rgba(217, 119, 6, 0.10)';
    case 'yellow': return 'rgba(202, 138, 4, 0.10)';
    case 'green':  return 'rgba(22, 163, 74, 0.10)';
    default:       return 'rgba(115, 115, 115, 0.08)';
  }
};

/** State-adaptive card chrome — borders, soft glow, etc. */
export const cardChrome = (color: Color): string => {
  switch (color) {
    case 'red':
      return 'border-state-red/40 shadow-[0_0_0_4px_rgba(220,38,38,0.06),0_4px_20px_rgba(220,38,38,0.10)]';
    case 'amber':
      return 'border-state-amber/40 shadow-[0_0_0_4px_rgba(217,119,6,0.05),0_4px_20px_rgba(217,119,6,0.08)]';
    case 'yellow':
      return 'border-amber-300/40';
    case 'green':
    default:
      return 'border-anchor-mist-100';
  }
};

export const trendArrow = (t: 'up' | 'down' | 'flat'): { glyph: string; cls: string; label: string } => {
  switch (t) {
    case 'up':   return { glyph: '↗', cls: 'text-state-green', label: 'trending up' };
    case 'down': return { glyph: '↘', cls: 'text-state-red',   label: 'trending down' };
    case 'flat': return { glyph: '→', cls: 'text-anchor-mist-400', label: 'steady' };
  }
};
