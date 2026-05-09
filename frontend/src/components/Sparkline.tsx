/**
 * Sparkline — tiny inline trend chart used inside DriftScoreCard.
 *
 * Pure SVG, no charting lib. Width is responsive (parent dictates), height
 * is fixed. Renders an area fill + smooth line + a final-point dot.
 */

interface SparklineProps {
  data: number[];
  stroke: string;
  fill: string;
  height?: number;
  ariaLabel?: string;
}

export function Sparkline({ data, stroke, fill, height = 40, ariaLabel }: SparklineProps) {
  if (!data || data.length < 2) return null;

  // Use a fixed virtual width — SVG's preserveAspectRatio scales it for us.
  const W = 100;
  const H = height;
  const PAD = 2;

  const min = Math.min(...data) - 1;
  const max = Math.max(...data) + 1;
  const range = Math.max(1, max - min);

  const points = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return [x, y] as const;
  });

  // Smooth the path with simple cardinal-ish bezier between points.
  const linePath = points
    .map(([x, y], i) => {
      if (i === 0) return `M${x},${y}`;
      const [px, py] = points[i - 1]!;
      const cx = (px + x) / 2;
      return `Q${px},${py} ${cx},${(py + y) / 2} T${x},${y}`;
    })
    .join(' ');

  const areaPath = `${linePath} L${points[points.length - 1]![0]},${H} L${points[0]![0]},${H} Z`;
  const last = points[points.length - 1]!;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height }}
      role="img"
      aria-label={ariaLabel ?? 'Wellbeing trend'}
    >
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.4} fill={stroke} />
    </svg>
  );
}
