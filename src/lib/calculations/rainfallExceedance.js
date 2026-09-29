import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Empirical probability that precipitation exceeds a given threshold,
 * computed directly from a historical series (no distribution fitting):
 * `count(historical value > threshold) / count(historical values)`.
 *
 * @param {number[]} historicalPrecipitationMm
 * @param {number} thresholdMm
 * @returns {import("./result").CalcResult} value in % (0-100)
 */
export function computeRainfallExceedanceProbability(
  historicalPrecipitationMm,
  thresholdMm,
) {
  const clean = historicalPrecipitationMm.filter(isFiniteNumber);
  if (clean.length === 0) return unavailable("%", "empty historical series");
  if (!isFiniteNumber(thresholdMm))
    return unavailable("%", "missing thresholdMm");

  const exceedCount = clean.filter((value) => value > thresholdMm).length;
  return available((exceedCount / clean.length) * 100, "%");
}
