/**
 * Sparkline — tiny inline trend chart used inside DriftScoreCard.
 *
 * Pure SVG, no charting lib. Renders an area fill + smooth line + an
 * emphasised "today" endpoint dot. A faint dashed midline acts as a
 * gentle reference axis without competing visually with the curve.
 */

interface SparklineProps {
  data: number[];
  stroke: string;
  fill: string;
  height?: number;
  ariaLabel?: string;
  /**
   * Minimum vertical range to display. Without this, a near-flat series gets
   * auto-scaled to fill the chart and looks frantic. With it, small wobbles
   * stay visually small — calm reads as calm.
   */
  minRange?: number;
}

export function Sparkline({
  data,
  stroke,
  fill,
  height = 56,
  ariaLabel,
  minRange = 25,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const W = 200;
  const H = height;
  const PAD_X = 3;
  const PAD_Y = 6;

  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);
  const dataRange = dataMax - dataMin;

  // Enforce a minimum visual range. Center the existing data inside it so the
  // line sits where the values 'live' rather than collapsing to an edge.
  let min = dataMin;
  let max = dataMax;
  if (dataRange < minRange) {
    const mid = (dataMin + dataMax) / 2;
    min = mid - minRange / 2;
    max = mid + minRange / 2;
  }
  const range = Math.max(0.0001, max - min);

  const points = data.map((v, i) => {
    const x = PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2);
    const y = PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2);
    return [x, y] as const;
  });

  // Smooth path: midpoint quadratic so the curve glides instead of zigzagging.
  const linePath = points
    .map(([x, y], i) => {
      if (i === 0) return `M${x.toFixed(2)},${y.toFixed(2)}`;
      const [px, py] = points[i - 1]!;
      const cx = (px + x) / 2;
      const cy = (py + y) / 2;
      return `Q${px.toFixed(2)},${py.toFixed(2)} ${cx.toFixed(2)},${cy.toFixed(2)} T${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const areaPath = `${linePath} L${points[points.length - 1]![0].toFixed(2)},${H} L${points[0]![0].toFixed(2)},${H} Z`;
  const last = points[points.length - 1]!;
  const midY = PAD_Y + (H - PAD_Y * 2) / 2;

  const gradientId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height }}
      role="img"
      aria-label={ariaLabel ?? 'Wellbeing trend'}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Faint reference midline */}
      <line
        x1={PAD_X} x2={W - PAD_X} y1={midY} y2={midY}
        stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 3" strokeWidth="0.5"
      />

      {/* Area fill: solid base + subtle gradient on top for depth */}
      <path d={areaPath} fill={fill} />
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* The line itself */}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Today endpoint — outer halo + inner dot */}
      <circle cx={last[0]} cy={last[1]} r={5} fill={stroke} fillOpacity={0.18} />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={stroke} />
      <circle cx={last[0]} cy={last[1]} r={1.1} fill="white" />
    </svg>
  );
}
