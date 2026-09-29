import { computeBlockElevation } from "@/lib/downscaling/elevation";
import { downscaleTemperatureByElevation } from "@/lib/downscaling/temperature";
import { adjustRainfallForElevation } from "@/lib/downscaling/rainfall";
import { interpolateIdw } from "@/lib/downscaling/idw";
import { selectHistoricalPanchayat } from "@/data/selectors";

/**
 * The block's representative elevation, derived once from the loaded
 * elevation summary (see `computeBlockElevation` for the "no block station"
 * assumption this relies on).
 * @param {object|null} data
 * @returns {number|null}
 */
export function selectBlockElevation(data) {
  const result = computeBlockElevation(data?.elevationSummaryByPanchayat ?? {});
  return result.available ? result.value : null;
}

/**
 * Downscales every hour of the block forecast to a single panchayat via
 * the elevation-correction formula. This produces a genuinely new
 * panchayat-level estimate — unlike temperature, which the panchayat
 * forecast source already provides directly — so it's meaningful to
 * compare against `data.forecastPanchayats` later (e.g. a "predicted vs
 * observed" diagnostic).
 *
 * @param {object|null} data
 * @param {string} panchayat
 * @param {{ lapseRateCPerKm?: number }} [options]
 * @returns {{ timeKey: string|null, date: Date|null, value: number|null, unit: string, available: boolean, reason?: string }[]}
 */
export function selectDownscaledTemperatureSeries(
  data,
  panchayat,
  options = {},
) {
  const elevationBlockM = selectBlockElevation(data);
  const elevationPanchayatM =
    data?.elevationSummaryByPanchayat?.[panchayat]?.meanElevationM ?? null;
  const forecastBlock = data?.forecastBlock ?? [];

  return forecastBlock.map((row) => ({
    timeKey: row.timeKey,
    date: row.date,
    ...downscaleTemperatureByElevation({
      tempBlockC: row.temperatureC,
      elevationBlockM,
      elevationPanchayatM,
      ...options,
    }),
  }));
}

/**
 * Orographically adjusts every hour of the block rainfall forecast for a
 * single panchayat.
 * @param {object|null} data
 * @param {string} panchayat
 * @param {{ orographicFactorPerKm?: number }} [options]
 * @returns {{ timeKey: string|null, date: Date|null, value: number|null, unit: string, available: boolean, reason?: string }[]}
 */
export function selectDownscaledRainfallSeries(data, panchayat, options = {}) {
  const elevationBlockM = selectBlockElevation(data);
  const elevationPanchayatM =
    data?.elevationSummaryByPanchayat?.[panchayat]?.meanElevationM ?? null;
  const forecastBlock = data?.forecastBlock ?? [];

  return forecastBlock.map((row) => ({
    timeKey: row.timeKey,
    date: row.date,
    ...adjustRainfallForElevation({
      precipitationBlockMm: row.precipitationMm,
      elevationBlockM,
      elevationPanchayatM,
      ...options,
    }),
  }));
}

/**
 * Builds an IDW-ready "known points" array — one entry per panchayat with
 * a historical monthly value at the given `monthKey` and that panchayat's
 * elevation-point centroid — for spreading discrete panchayat values into
 * a continuous spatial field (e.g. a contour map).
 *
 * @param {object|null} data
 * @param {string} monthKey e.g. "2016-01"
 * @param {"tempAvgC"|"tempMaxC"|"tempMinC"|"precipitationTotalMm"|"soilMoistureAvg"} variableKey
 * @returns {{ longitude: number, latitude: number, value: number|null, panchayat: string }[]}
 */
export function selectIdwKnownPointsForMonth(data, monthKey, variableKey) {
  const panchayats = data?.panchayats ?? [];
  return panchayats
    .map((panchayat) => {
      const centroid = data?.panchayatCentroids?.[panchayat];
      const record = selectHistoricalPanchayat(data, panchayat).find(
        (row) => row.monthKey === monthKey,
      );
      if (!centroid || !record) return null;
      return { ...centroid, panchayat, value: record[variableKey] ?? null };
    })
    .filter(Boolean);
}

/**
 * IDW-interpolates a variable at an arbitrary target location from the
 * known per-panchayat points built by `selectIdwKnownPointsForMonth`.
 * @param {{ longitude: number, latitude: number }} target
 * @param {{ longitude: number, latitude: number, value: number|null }[]} knownPoints
 * @param {{ power?: number }} [options]
 * @returns {import("@/lib/calculations/result").CalcResult}
 */
export function selectIdwInterpolatedValue(target, knownPoints, options) {
  return interpolateIdw(target, knownPoints, options);
}
