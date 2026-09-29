import { interpolateColor, TERRAIN_SCALE } from "@/lib/colorScale";

/** A horizontal gradient legend bar for a `valueToColor`-scaled map/chart. */
export function ColorLegend({
  range,
  unit,
  colors = TERRAIN_SCALE,
  steps = 20,
}) {
  if (!range) return null;

  const gradientStops = Array.from({ length: steps + 1 }, (_, i) =>
    interpolateColor(i / steps, colors),
  ).join(", ");

  return (
    <div className="flex items-center gap-2 text-xs text-foreground/60">
      <span>
        {range.min.toFixed(1)} {unit}
      </span>
      <div
        className="h-3 w-32 rounded-full"
        style={{ background: `linear-gradient(to right, ${gradientStops})` }}
      />
      <span>
        {range.max.toFixed(1)} {unit}
      </span>
    </div>
  );
}
