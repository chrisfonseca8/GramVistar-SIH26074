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
      <div className="rounded-lg border border-border p-4 ">
        <dt className="text-xs uppercase tracking-wide text-foreground/40">
          {label}
        </dt>
        <dd className="mt-1 text-lg font-semibold">{value}</dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-foreground/40">
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
