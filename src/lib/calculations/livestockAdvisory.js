import { available, unavailable, isFiniteNumber } from "./result";
import { computeHeatIndex } from "./heatIndex";
import { computeFrostRisk } from "./frostRisk";

// Illustrative general livestock heat/cold tolerance guidance (cattle-scale),
// independent of any crop's heat/cold thresholds — a crop's stress
// thresholds describe plant biology, not animal biology, so reusing them
// here would be a category error even though both come from "thresholds."
const DEFAULT_HEAT_INDEX_DANGER_C = 38;
const DEFAULT_COLD_WATCH_C = 5;
const DEFAULT_COLD_WARNING_C = 0;

/**
 * Whether livestock need protective action right now (shelter, water,
 * ventilation for heat; shelter, bedding, feed adjustment for cold) —
 * reuses the existing `computeHeatIndex`/`computeFrostRisk`
 * against illustrative livestock-scale thresholds rather than a
 * crop's own heat/cold stress values.
 *
 * @param {{ tempC: number|null, humidityPct: number|null, heatIndexDangerC?: number, coldWatchC?: number, coldWarningC?: number }} input
 * @returns {import("./result").CalcResult} value is `{ actionNeeded: boolean, reasons: string[] }`
 */
export function computeLivestockAdvisory({
  tempC,
  humidityPct,
  heatIndexDangerC = DEFAULT_HEAT_INDEX_DANGER_C,
  coldWatchC = DEFAULT_COLD_WATCH_C,
  coldWarningC = DEFAULT_COLD_WARNING_C,
}) {
  if (!isFiniteNumber(tempC))
    return unavailable("actionNeeded/reasons", "missing tempC");
  if (!isFiniteNumber(humidityPct))
    return unavailable("actionNeeded/reasons", "missing humidityPct");

  const heatIndex = computeHeatIndex({ tempC, humidityPct });
  const frostRisk = computeFrostRisk({
    tempMinC: tempC,
    watchThresholdC: coldWatchC,
    warningThresholdC: coldWarningC,
  });

  const reasons = [];
  if (heatIndex.available && heatIndex.value >= heatIndexDangerC) {
    reasons.push(
      `heat index ${heatIndex.value.toFixed(1)}°C is at/above the ${heatIndexDangerC}°C livestock heat-stress guidance`,
    );
  }
  if (frostRisk.available && frostRisk.value !== "none") {
    reasons.push(
      `frost risk is ${frostRisk.value} (temperature ${tempC}°C) — cold stress risk for livestock`,
    );
  }

  return available(
    { actionNeeded: reasons.length > 0, reasons },
    "actionNeeded/reasons",
  );
}
