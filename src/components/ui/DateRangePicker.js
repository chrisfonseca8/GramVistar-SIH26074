/**
 * Two native `<input type="date">` controls for a from/to range.
 * No page in this app currently needs a date *range* (the Explorer/animation
 * pages all use a single day or a fixed forecast window) — kept generic and
 * unopinionated so a future page can adopt it without inventing its own.
 *
 * @param {{ from: string, to: string, onChange: (range: { from: string, to: string }) => void, label?: string }} props
 */
export function DateRangePicker({ from, to, onChange, label }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {label ? (
        <span className="text-xs uppercase tracking-wide text-foreground/40">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onChange({ from: event.target.value, to })}
          className="rounded-md border border-border bg-surface px-2 py-1.5 "
        />
        <span className="text-foreground/40">–</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onChange({ from, to: event.target.value })}
          className="rounded-md border border-border bg-surface px-2 py-1.5 "
        />
      </div>
    </div>
  );
}
