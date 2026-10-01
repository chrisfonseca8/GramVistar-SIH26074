/**
 * A single labeled metric value. Several pages previously
 * defined their own near-identical `Stat`/`MetricCard` component for
 * exactly this — this replaces those page-specific copies. Pass
 * `bordered` for a self-contained boxed tile (e.g. a stat grid on its
 * own); the default is an inline dt/dd pair for use inside an
 * already-bordered `Card`/`<dl>`.
 */
export function MetricTile({ label, value, bordered = false }) {
  if (bordered) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <dt className="text-xs font-medium tracking-wider text-text-muted uppercase">
          {label}
        </dt>
        <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="text-xs font-medium tracking-wider text-text-muted uppercase">
        {label}
      </dt>
      <dd className="text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
