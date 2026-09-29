import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Validates/normalizes a raw rain-probability forecast value into the
 * shared calculation-result shape. This is a passthrough, not a derivation
 * — the panchayat forecast (`panchayat_expanded_agro_forecast.csv`)
 * already provides `Rain_Probability_Pct` directly; the block-level
 * forecast does not, so calling this with `null` correctly reports
 * unavailable rather than fabricating a block-level probability.
 *
 * @param {{ rainProbabilityPct: number|null }} input
 * @returns {import("./result").CalcResult} value in % (0-100)
 */
export function getRainfallProbability({ rainProbabilityPct }) {
  if (!isFiniteNumber(rainProbabilityPct)) {
    return unavailable(
      "%",
      "missing rainProbabilityPct (not provided by this forecast source)",
    );
  }
  if (rainProbabilityPct < 0 || rainProbabilityPct > 100) {
    return unavailable("%", "rainProbabilityPct out of 0-100 range");
  }
  return available(rainProbabilityPct, "%");
}
