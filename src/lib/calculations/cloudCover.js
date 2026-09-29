import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Coarse cloud-cover proxy from the diurnal temperature range, using the
 * Bristow-Campbell clearness-index idea: a small Tmax-Tmin range suggests
 * more cloud (clouds suppress both daytime heating and nighttime cooling),
 * a large range suggests clear skies.
 *
 * clearness = sqrt(min(ΔT, ΔTref) / ΔTref) (0-1, 1 = clearest)
 * cloudCoverPct = (1 - clearness) * 100
 *
 * This is an empirical heuristic, not a physical cloud measurement or a
 * calibrated model — `/data` has no cloud, radiation or satellite
 * observation to derive it from properly. `referenceTempRangeC` (default
 * 20°C, a plausible clear-sky diurnal range for this region — not a
 * measured constant) must be treated as an assumption, and results should
 * be labeled as an estimate wherever shown.
 *
 * @param {{ tempMaxC: number|null, tempMinC: number|null, referenceTempRangeC?: number }} input
 * @returns {import("./result").CalcResult} value in % (0-100)
 */
export function estimateCloudCoverFromTemperatureRange({
  tempMaxC,
  tempMinC,
  referenceTempRangeC = 20,
}) {
  if (!isFiniteNumber(tempMaxC) || !isFiniteNumber(tempMinC)) {
    return unavailable("% (estimate)", "missing tempMaxC/tempMinC");
  }
  if (tempMaxC < tempMinC)
    return unavailable("% (estimate)", "tempMaxC is less than tempMinC");
  if (!isFiniteNumber(referenceTempRangeC) || referenceTempRangeC <= 0) {
    return unavailable(
      "% (estimate)",
      "referenceTempRangeC must be a positive number",
    );
  }

  const diurnalRange = tempMaxC - tempMinC;
  const clearness = Math.sqrt(
    Math.min(diurnalRange, referenceTempRangeC) / referenceTempRangeC,
  );
  const cloudCoverPct = (1 - clearness) * 100;

  return available(cloudCoverPct, "% (estimate)");
}
