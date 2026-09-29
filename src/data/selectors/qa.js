import { computeMissingValueSummaries } from "@/lib/qa/missingValues";
import { computeInvalidValueSummaries } from "@/lib/qa/invalidValues";
import { computeOutlierSummary } from "@/lib/qa/outliers";
import {
  computeMonthlyContinuity,
  computeIntervalContinuity,
} from "@/lib/qa/dateContinuity";
import { computeCoverage } from "@/lib/qa/coverage";
import { computeRmse, computeRSquared } from "@/lib/qa/validation";
import {
  selectHistoricalPanchayat,
  selectForecastPanchayat,
} from "@/data/selectors";
import { selectDownscaledTemperatureSeries } from "@/data/selectors/downscaling";

/** Plausible physical ranges used for invalid-value checks — generous
 * bounds for Chas Block's climate, not tight quality thresholds. */
const RANGES = {
  temperature: { min: -10, max: 50 },
  precipitationMonthly: { min: 0, max: 1000 },
  precipitationHourly: { min: 0, max: 200 },
  soilMoisture: { min: 0, max: 1 },
  humidityPct: { min: 0, max: 100 },
  windSpeedKmh: { min: 0, max: 150 },
  rainProbabilityPct: { min: 0, max: 100 },
};

const HISTORICAL_FIELDS = [
  "tempMaxC",
  "tempMinC",
  "tempAvgC",
  "precipitationTotalMm",
  "soilMoistureAvg",
];
const HISTORICAL_RANGES = {
  tempMaxC: RANGES.temperature,
  tempMinC: RANGES.temperature,
  tempAvgC: RANGES.temperature,
  precipitationTotalMm: RANGES.precipitationMonthly,
  soilMoistureAvg: RANGES.soilMoisture,
};

const FORECAST_BLOCK_FIELDS = [
  "temperatureC",
  "precipitationMm",
  "soilMoisture",
];
const FORECAST_BLOCK_RANGES = {
  temperatureC: RANGES.temperature,
  precipitationMm: RANGES.precipitationHourly,
  soilMoisture: RANGES.soilMoisture,
};

const FORECAST_PANCHAYAT_FIELDS = [
  "temperatureC",
  "humidityPct",
  "windSpeedKmh",
  "precipitationMm",
  "rainProbabilityPct",
  "soilMoisture",
  "soilDeficit",
];
const FORECAST_PANCHAYAT_RANGES = {
  temperatureC: RANGES.temperature,
  humidityPct: RANGES.humidityPct,
  windSpeedKmh: RANGES.windSpeedKmh,
  precipitationMm: RANGES.precipitationHourly,
  rainProbabilityPct: RANGES.rainProbabilityPct,
  soilMoisture: RANGES.soilMoisture,
  soilDeficit: { min: -0.01, max: 1 },
};

/**
 * @param {object[]} records
 * @param {string[]} fields
 * @param {Record<string, {min:number,max:number}>} fieldRanges
 * @returns {{ missing: object[], invalid: object[], outliers: object[] }}
 */
function summarizeFields(records, fields, fieldRanges) {
  return {
    missing: computeMissingValueSummaries(records, fields),
    invalid: computeInvalidValueSummaries(records, fieldRanges),
    outliers: fields.map((field) => computeOutlierSummary(records, field)),
  };
}

/** @param {object|null} data */
export function selectHistoricalBlockQaSummary(data) {
  const records = data?.historicalBlock ?? [];
  return {
    ...summarizeFields(records, HISTORICAL_FIELDS, HISTORICAL_RANGES),
    continuity: computeMonthlyContinuity(records),
  };
}

/** @param {object|null} data @param {string} panchayat */
export function selectHistoricalPanchayatQaSummary(data, panchayat) {
  const records = selectHistoricalPanchayat(data, panchayat);
  return {
    ...summarizeFields(records, HISTORICAL_FIELDS, HISTORICAL_RANGES),
    continuity: computeMonthlyContinuity(records),
  };
}

/** @param {object|null} data */
export function selectForecastBlockQaSummary(data) {
  const records = data?.forecastBlock ?? [];
  return {
    ...summarizeFields(records, FORECAST_BLOCK_FIELDS, FORECAST_BLOCK_RANGES),
    continuity: computeIntervalContinuity(records),
  };
}

/** @param {object|null} data @param {string} panchayat */
export function selectForecastPanchayatQaSummary(data, panchayat) {
  const records = selectForecastPanchayat(data, panchayat);
  return {
    ...summarizeFields(
      records,
      FORECAST_PANCHAYAT_FIELDS,
      FORECAST_PANCHAYAT_RANGES,
    ),
    continuity: computeIntervalContinuity(records),
  };
}

/**
 * Whether each panchayat-level source (soil, historical, forecast) has
 * data for every panchayat named in the borders GeoJSON.
 * @param {object|null} data
 */
export function selectPanchayatSpatialCoverage(data) {
  const expected = data?.panchayats ?? [];
  return {
    soil: computeCoverage(data?.soil ?? [], "panchayat", expected),
    historical: computeCoverage(
      data?.historicalPanchayats ?? [],
      "panchayat",
      expected,
    ),
    forecast: computeCoverage(
      data?.forecastPanchayats ?? [],
      "panchayat",
      expected,
    ),
    elevation: computeCoverage(
      Object.keys(data?.elevationSummaryByPanchayat ?? {}).map((panchayat) => ({
        panchayat,
      })),
      "panchayat",
      expected,
    ),
  };
}

/**
 * Pairs our downscaled (predicted) block→panchayat temperature against
 * that panchayat's own forecast temperature at matching hours, and
 * computes R²/RMSE. The panchayat forecast is itself forecast data, not a
 * true field observation, so this is labeled "reference", never
 * "observed"— that distinction is kept deliberately.
 *
 * `pairs` includes `residual: predicted - observed` and `date`/`timeKey`
 * per point, so callers building a scatter (Plot 5) or a residual-vs-time
 * plot (Plot 6) don't need to re-derive the pairing themselves.
 *
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{
 * pairCount: number,
 * rSquared: import("@/lib/calculations/result").CalcResult,
 * rmse: import("@/lib/calculations/result").CalcResult,
 * pairs: { predicted: number, observed: number, residual: number, timeKey: string|null, date: Date|null }[],
 * }}
 */
export function selectTemperatureValidationAgainstReference(data, panchayat) {
  const predictedSeries = selectDownscaledTemperatureSeries(data, panchayat);
  const referenceByTime = new Map(
    selectForecastPanchayat(data, panchayat).map((r) => [
      r.timeKey,
      r.temperatureC,
    ]),
  );

  const pairs = predictedSeries
    .filter((p) => p.available && referenceByTime.has(p.timeKey))
    .map((p) => {
      const observed = referenceByTime.get(p.timeKey);
      return {
        predicted: p.value,
        observed,
        residual: p.value - observed,
        timeKey: p.timeKey,
        date: p.date,
      };
    });

  return {
    pairCount: pairs.length,
    rSquared: computeRSquared(pairs),
    rmse: computeRmse(pairs),
    pairs,
  };
}
