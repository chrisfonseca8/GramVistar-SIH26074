import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Whether irrigation is recommended today: soil is dry enough (deficit
 * above threshold) and rain unlikely enough that it won't do the job
 * naturally. Thresholds are configurable defaults, not crop-specific
 * standards.
 *
 * @param {{
 * soilMoistureDeficit: number|null,
 * rainProbabilityPct: number|null,
 * deficitThreshold?: number,
 * rainProbabilityThreshold?: number,
 * }} input soilMoistureDeficit and deficitThreshold in m³/m³
 * @returns {import("./result").CalcResult} value is `{ irrigate: boolean, reasons: string[] }`
 */
export function computeIrrigationWindow({
  soilMoistureDeficit,
  rainProbabilityPct,
  deficitThreshold = 0.05,
  rainProbabilityThreshold = 50,
}) {
  if (!isFiniteNumber(soilMoistureDeficit)) {
    return unavailable("irrigate/reasons", "missing soilMoistureDeficit");
  }
  if (!isFiniteNumber(rainProbabilityPct)) {
    return unavailable("irrigate/reasons", "missing rainProbabilityPct");
  }

  const reasons = [];
  const isDry = soilMoistureDeficit >= deficitThreshold;
  const rainLikely = rainProbabilityPct >= rainProbabilityThreshold;

  if (isDry)
    reasons.push(
      `soil moisture deficit ${soilMoistureDeficit.toFixed(3)} m³/m³ at/above ${deficitThreshold} m³/m³ threshold`,
    );
  if (rainLikely)
    reasons.push(
      `rain probability ${rainProbabilityPct}% at/above ${rainProbabilityThreshold}% — likely to be met naturally`,
    );

  return available(
    { irrigate: isDry && !rainLikely, reasons },
    "irrigate/reasons",
  );
}
