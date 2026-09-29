import { isFiniteNumber } from "@/lib/calculations/result";
import { EmptyState } from "@/components/ui/EmptyState";

const WIDTH = 200;
const HEIGHT = 120;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT - 10;
const RADIUS = 80;

function polarToCartesian(angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + RADIUS * Math.cos(angleRad),
    y: CENTER_Y - RADIUS * Math.sin(angleRad),
  };
}

function describeArc(startDeg, endDeg) {
  const start = polarToCartesian(startDeg);
  const end = polarToCartesian(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/**
 * A hand-rolled semi-circular SVG gauge — no charting library needed for
 * a single-value dial. `zones` are `[{ to: number, color: string }]`,
 * ascending, each `to` being the zone's upper bound in `[min, max]`.
 * @param {{ value: number|null, min: number, max: number, zones: { to: number, color: string }[], label: string, valueLabel: string }} props
 */
export function Gauge({ value, min, max, zones, label, valueLabel }) {
  if (!isFiniteNumber(value)) {
    return <EmptyState title="No value available" />;
  }

  const clamped = Math.min(max, Math.max(min, value));
  const fraction = (clamped - min) / (max - min || 1);
  const needleAngle = 180 - fraction * 180;
  const needleEnd = polarToCartesian(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-xs">
        {zones.map((zone, index) => {
          const zoneStart = index === 0 ? min : zones[index - 1].to;
          const startFraction = (zoneStart - min) / (max - min || 1);
          const endFraction = (zone.to - min) / (max - min || 1);
          return (
            <path
              key={index}
              d={describeArc(
                180 - startFraction * 180,
                180 - endFraction * 180,
              )}
              stroke={zone.color}
              strokeWidth={16}
              fill="none"
            />
          );
        })}
        <line
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="currentColor"
          strokeWidth={3}
          className="text-foreground"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={4}
          fill="currentColor"
          className="text-foreground"
        />
      </svg>
      <p className="mt-1 text-lg font-semibold">{valueLabel}</p>
      <p className="text-xs text-foreground/50">{label}</p>
    </div>
  );
}
