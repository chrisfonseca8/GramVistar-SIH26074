import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Whether irrigation is recommended today: soil is dry enough (volumetric
 * soil moisture at/below threshold) and rain unlikely enough that it won't
 * do the job naturally. Thresholds are configurable defaults, not
 * crop-specific standards.
 *
 * @param {{
 * soilMoisture: number|null,
 * rainProbabilityPct: number|null,
 * moistureThreshold?: number,
 * rainProbabilityThreshold?: number,
 * }} input soilMoisture and moistureThreshold in m³/m³
 * @returns {import("./result").CalcResult} value is `{ irrigate: boolean, reasons: string[] }`
 */
export function computeIrrigationWindow({
  soilMoisture,
  rainProbabilityPct,
  moistureThreshold = 0.26,
  rainProbabilityThreshold = 50,
}) {
  if (!isFiniteNumber(soilMoisture)) {
    return unavailable("irrigate/reasons", "missing soilMoisture");
  }
  if (!isFiniteNumber(rainProbabilityPct)) {
    return unavailable("irrigate/reasons", "missing rainProbabilityPct");
  }

  const reasons = [];
  const isDry = soilMoisture <= moistureThreshold;
  const rainLikely = rainProbabilityPct >= rainProbabilityThreshold;

  if (isDry)
    reasons.push(
      `soil moisture ${soilMoisture.toFixed(3)} m³/m³ at/below ${moistureThreshold} m³/m³ threshold`,
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
