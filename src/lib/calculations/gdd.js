import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Growing Degree Days for a single day, the standard "average method" used
 * in agrometeorology (e.g. for corn/maize GDD accumulation):
 *
 * Tmax' = min(Tmax, Tupper) — cap the high end at the crop's upper threshold
 * Tmin' = max(Tmin, Tbase) — floor the low end at the crop's base temperature
 * GDD = max(0, (Tmax' + Tmin') / 2 - Tbase)
 *
 * @param {{ tempMaxC: number|null, tempMinC: number|null, baseTempC: number, upperTempC?: number }} input
 * @returns {import("./result").CalcResult} value in °C·day
 */
export function computeGdd({ tempMaxC, tempMinC, baseTempC, upperTempC }) {
  if (!isFiniteNumber(tempMaxC) || !isFiniteNumber(tempMinC)) {
    return unavailable("°C·day", "missing tempMaxC/tempMinC");
  }
  if (!isFiniteNumber(baseTempC)) {
    return unavailable("°C·day", "missing baseTempC");
  }

  const cappedMax = isFiniteNumber(upperTempC)
    ? Math.min(tempMaxC, upperTempC)
    : tempMaxC;
  const flooredMin = Math.max(tempMinC, baseTempC);
  const gdd = Math.max(0, (cappedMax + flooredMin) / 2 - baseTempC);

  return available(gdd, "°C·day");
}

/**
 * Sums `computeGdd` over a series of daily/monthly records, skipping (not
 * zeroing) any record whose GDD is unavailable, and reports how many were
 * skipped so callers can decide whether the accumulated total is trustworthy.
 *
 * @param {{ tempMaxC: number|null, tempMinC: number|null }[]} records
 * @param {{ baseTempC: number, upperTempC?: number }} thresholds
 * @returns {{ totalGdd: number, includedCount: number, skippedCount: number }}
 */
export function accumulateGdd(records, thresholds) {
  let totalGdd = 0;
  let includedCount = 0;
  let skippedCount = 0;

  for (const record of records) {
    const result = computeGdd({ ...record, ...thresholds });
    if (result.available) {
      totalGdd += result.value;
      includedCount += 1;
    } else {
      skippedCount += 1;
    }
  }

  return { totalGdd, includedCount, skippedCount };
}
