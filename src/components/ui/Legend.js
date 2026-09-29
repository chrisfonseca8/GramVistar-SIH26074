/**
 * Discrete color-key legend — a row of colored dot + label pairs (e.g.
 * the four risk levels). For a continuous gradient legend
 * (a map/heatmap's value range) use `src/components/charts/ColorLegend.js`
 * instead; that is a different, chart-specific concept from this one.
 *
 * @param {{ items: { color: string, label: string }[] }} props
 */
export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
