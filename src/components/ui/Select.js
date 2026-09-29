/**
 * Labeled `<select>` — a thin styling wrapper, matching
 * the dropdown markup already used across the Scientist portal (e.g. the
 * API & Export dataset picker), now centralized so a new page reuses it
 * instead of retyping the classNames.
 */
export function Select({ label, value, onChange, options, className = "" }) {
  const select = (
    <select
      value={value}
      onChange={onChange}
      className={`cursor-pointer rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-foreground/40">
        {label}
      </span>
      {select}
    </label>
  );
}
