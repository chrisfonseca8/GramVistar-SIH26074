/**
 * Labeled range input. Extracted from Scenario Lab's
 * original `ScenarioSlider`, now the shared implementation instead of a
 * page-specific copy.
 */
export function Slider({ label, value, min, max, unit = "", hint, onChange }) {
  return (
    <label className="block text-sm">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono text-xs text-foreground/60">
          {value >= 0 ? "+" : ""}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full"
      />
      {hint ? (
        <p className="mt-0.5 text-xs text-foreground/40">{hint}</p>
      ) : null}
    </label>
  );
}
