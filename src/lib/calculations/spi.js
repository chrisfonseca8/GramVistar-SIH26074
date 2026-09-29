import { available, unavailable, isFiniteNumber } from "./result";

/**
 * A z-score standardization of a value against a historical series' own
 * mean and sample standard deviation: `(current - mean) / stdDev`.
 *
 * This is a simplified proxy for the WMO-standard SPI/SPEI, which fits a
 * Gamma distribution to a multi-decade series before transforming to a
 * standard normal deviate. We only have 10 years of monthly data (120
 * points), too short to responsibly fit and validate a Gamma distribution,
 * so this z-score approximation is used instead and must not be presented
 * as an officially calibrated SPI/SPEI value.
 *
 * @param {number[]} series historical values for the same period-of-year (e.g. all Januaries)
 * @param {number|null} currentValue
 * @returns {import("./result").CalcResult} dimensionless standard deviations
 */
function computeStandardizedIndex(series, currentValue) {
  const clean = series.filter(isFiniteNumber);
  if (!isFiniteNumber(currentValue)) {
    return unavailable("σ (standardized)", "missing currentValue");
  }
  if (clean.length < 2) {
    return unavailable(
      "σ (standardized)",
      "fewer than 2 historical values in series",
    );
  }

  const mean = clean.reduce((sum, x) => sum + x, 0) / clean.length;
  const variance =
    clean.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (clean.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return unavailable(
      "σ (standardized)",
      "zero variance in historical series",
    );
  }

  return available((currentValue - mean) / stdDev, "σ (standardized)");
}

/**
 * Simplified SPI (Standardized Precipitation Index) proxy — see
 * `computeStandardizedIndex` for the "simplified" caveat.
 * @param {number[]} historicalPrecipitationMm
 * @param {number|null} currentPrecipitationMm
 * @returns {import("./result").CalcResult}
 */
export function computeSpi(historicalPrecipitationMm, currentPrecipitationMm) {
  return computeStandardizedIndex(
    historicalPrecipitationMm,
    currentPrecipitationMm,
  );
}

/**
 * Simplified SPEI (Standardized Precipitation-Evapotranspiration Index)
 * proxy, computed the same way as `computeSpi` but over a climatic water
 * balance series (precipitation minus ET0) instead of raw precipitation.
 * Callers compute the water balance themselves (e.g. using
 * `computeEt0Hargreaves`) — this function only standardizes it.
 * @param {number[]} historicalWaterBalanceMm precipitation - ET0, per period
 * @param {number|null} currentWaterBalanceMm
 * @returns {import("./result").CalcResult}
 */
export function computeSpei(historicalWaterBalanceMm, currentWaterBalanceMm) {
  return computeStandardizedIndex(
    historicalWaterBalanceMm,
    currentWaterBalanceMm,
  );
}
