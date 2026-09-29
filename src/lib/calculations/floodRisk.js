import { available, unavailable, isFiniteNumber } from "./result";

/** @typedef {"none"| "watch"| "moderate"| "severe"} FloodRiskLevel */

/**
 * Flood risk level from 24-hour accumulated/forecast rainfall against an
 * illustrative threshold — the general agronomic/hydrological rule of
 * thumb that sustained rainfall well above a region's typical daily total
 * raises flood risk, not a hydrological model (no drainage, elevation,
 * soil infiltration, or river-gauge data is used). This is the
 * `computeFloodRisk`-style function the Scenario Lab notes flagged
 * as missing ("if real flood risk is ever needed... it should get a
 * proper `computeFloodRisk`-style function in `src/lib/calculations/`,
 * not reuse this scenario-specific percent-change heuristic") — this is
 * that function.
 *
 * @param {{ rainfall24hMm: number|null, watchThresholdMm?: number, moderateThresholdMm?: number, severeThresholdMm?: number }} input
 * @returns {import("./result").CalcResult} value is a {@link FloodRiskLevel}
 */
export function computeFloodRisk({
  rainfall24hMm,
  watchThresholdMm = 20,
  moderateThresholdMm = 40,
  severeThresholdMm = 80,
}) {
  if (!isFiniteNumber(rainfall24hMm))
    return unavailable("risk level", "missing rainfall24hMm");

  /** @type {FloodRiskLevel} */
  let level = "none";
  if (rainfall24hMm >= severeThresholdMm) level = "severe";
  else if (rainfall24hMm >= moderateThresholdMm) level = "moderate";
  else if (rainfall24hMm >= watchThresholdMm) level = "watch";

  return available(level, "risk level");
}
