/**
 * The four risk levels used consistently across the whole app —
 * every risk-colored UI element (badges, map layers, decision cards,
 * alerts) should map to one of these instead of inventing its own
 * color scheme.
 */
export const RISK_LEVELS = ["green", "yellow", "orange", "red"];

/** @type {Record<string, string>} */
export const RISK_LABELS = {
  green: "Safe",
  yellow: "Caution",
  orange: "Warning",
  red: "Danger",
};

/** Tailwind-friendly hex values; also usable directly in inline styles/SVG. */
export const RISK_COLORS = {
  green: "#16a34a",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#dc2626",
};

/**
 * Maps `computeFrostRisk`'s 3-level output (`none`/`watch`/`warning`,
 * `src/lib/calculations/frostRisk.js`) onto the shared 4-level scheme.
 * @param {"none"|"watch"|"warning"} frostRiskLevel
 * @returns {string} one of `RISK_LEVELS`
 */
export function mapFrostRiskToRiskLevel(frostRiskLevel) {
  if (frostRiskLevel === "warning") return "red";
  if (frostRiskLevel === "watch") return "yellow";
  return "green";
}
