import {
  available,
  unavailable,
  isFiniteNumber,
} from "@/lib/calculations/result";

/**
 * There is no separate "block weather station" elevation anywhere in
 * `/data` — the block-level forecast/historical files carry no location.
 * As a documented stand-in, the block's representative elevation is taken
 * as the point-count-weighted mean of every panchayat's mean elevation
 * (i.e. the mean elevation across every sampled DEM point in the block),
 * using the summary `normalizeElevationRows()` already computes.
 *
 * @param {Record<string, { meanElevationM: number, pointCount: number }>} elevationSummaryByPanchayat
 * @returns {import("@/lib/calculations/result").CalcResult} value in meters
 */
export function computeBlockElevation(elevationSummaryByPanchayat) {
  const entries = Object.values(elevationSummaryByPanchayat ?? {});
  const valid = entries.filter(
    (e) =>
      isFiniteNumber(e?.meanElevationM) &&
      isFiniteNumber(e?.pointCount) &&
      e.pointCount > 0,
  );
  if (valid.length === 0)
    return unavailable("m", "no panchayat elevation summaries available");

  const totalPoints = valid.reduce((sum, e) => sum + e.pointCount, 0);
  const weightedSum = valid.reduce(
    (sum, e) => sum + e.meanElevationM * e.pointCount,
    0,
  );

  return available(weightedSum / totalPoints, "m");
}
