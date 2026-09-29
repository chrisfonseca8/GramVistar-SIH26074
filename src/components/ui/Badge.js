import { RISK_COLORS, RISK_LABELS } from "@/lib/riskLevels";

/**
 * A small colored pill. `riskLevel` (one of RISK_LEVELS) drives the color
 * from the app's single shared risk palette instead of a
 * page inventing its own; pass `label` to override the default risk text
 * (e.g. a status word instead of "Danger").
 */
export function Badge({ riskLevel, label, className = "" }) {
  const color = riskLevel ? RISK_COLORS[riskLevel] : undefined;
  const text = label ?? (riskLevel ? RISK_LABELS[riskLevel] : "");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {color ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : null}
      {text}
    </span>
  );
}
