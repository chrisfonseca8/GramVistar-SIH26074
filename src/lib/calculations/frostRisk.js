import { available, unavailable, isFiniteNumber } from "./result";

/** @typedef {"none"| "watch"| "warning"} FrostRiskLevel */

/**
 * Frost risk level from minimum temperature against two configurable
 * thresholds. Defaults (4°C caution / 0°C severe) are common general
 * agronomic guidance, not a crop-specific standard — callers working with
 * a specific crop should pass its actual sensitivity thresholds.
 *
 * @param {{ tempMinC: number|null, watchThresholdC?: number, warningThresholdC?: number }} input
 * @returns {import("./result").CalcResult} value is a {@link FrostRiskLevel}
 */
export function computeFrostRisk({
  tempMinC,
  watchThresholdC = 4,
  warningThresholdC = 0,
}) {
  if (!isFiniteNumber(tempMinC))
    return unavailable("risk level", "missing tempMinC");
  if (warningThresholdC > watchThresholdC) {
    return unavailable(
      "risk level",
      "warningThresholdC must not exceed watchThresholdC",
    );
  }

  /** @type {FrostRiskLevel} */
  let level = "none";
  if (tempMinC <= warningThresholdC) level = "warning";
  else if (tempMinC <= watchThresholdC) level = "watch";

  return available(level, "risk level");
}
