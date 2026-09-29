import {
  selectForecastPanchayat,
  selectHistoricalPanchayat,
} from "@/data/selectors";
import {
  groupRecordsByDay,
  computeDailyMinMax,
  computeDailyMean,
} from "@/lib/time/dailyAggregation";
import { estimateCloudCoverFromTemperatureRange } from "@/lib/calculations/cloudCover";
import { isFiniteNumber } from "@/lib/calculations/result";

/**
 * Estimated cloud cover per panchayat per day (Plot 14), derived from each
 * day's temperature range in the forecast — see
 * `estimateCloudCoverFromTemperatureRange` for why this is an estimate,
 * not an observation.
 * @param {object|null} data
 * @returns {{ panchayats: string[], days: string[], grid: (number|null)[][] }}
 */
export function selectDailyCloudCoverGrid(data) {
  const panchayats = data?.panchayats ?? [];
  const allDays = new Set();
  const perPanchayatDaily = panchayats.map((panchayat) => {
    const byDay = groupRecordsByDay(selectForecastPanchayat(data, panchayat));
    for (const day of byDay.keys()) allDays.add(day);
    return byDay;
  });

  const days = Array.from(allDays).sort();
  const grid = perPanchayatDaily.map((byDay) =>
    days.map((day) => {
      const dayRecords = byDay.get(day);
      if (!dayRecords) return null;
      const { min, max } = computeDailyMinMax(dayRecords, "temperatureC");
      const result = estimateCloudCoverFromTemperatureRange({
        tempMaxC: max,
        tempMinC: min,
      });
      return result.available ? result.value : null;
    }),
  );

  return { panchayats, days, grid };
}

/**
 * Mean daily humidity per panchayat per day (Plot 15) — a real observed
 * forecast field, not derived.
 * @param {object|null} data
 * @returns {{ panchayats: string[], days: string[], grid: (number|null)[][] }}
 */
export function selectDailyHumidityGrid(data) {
  const panchayats = data?.panchayats ?? [];
  const allDays = new Set();
  const perPanchayatDaily = panchayats.map((panchayat) => {
    const byDay = groupRecordsByDay(selectForecastPanchayat(data, panchayat));
    for (const day of byDay.keys()) allDays.add(day);
    return byDay;
  });

  const days = Array.from(allDays).sort();
  const grid = perPanchayatDaily.map((byDay) =>
    days.map((day) => {
      const dayRecords = byDay.get(day);
      return dayRecords ? computeDailyMean(dayRecords, "humidityPct") : null;
    }),
  );

  return { panchayats, days, grid };
}

/**
 * Cumulative forecast rainfall per panchayat over the forecast window
 * (Plot 16).
 * @param {object|null} data
 * @returns {{ panchayat: string, dates: Date[], cumulativeMm: number[] }[]}
 */
export function selectRainfallAccumulationSeries(data) {
  const panchayats = data?.panchayats ?? [];
  return panchayats.map((panchayat) => {
    const records = selectForecastPanchayat(data, panchayat);
    let running = 0;
    const dates = [];
    const cumulativeMm = [];
    for (const record of records) {
      if (!(record.date instanceof Date)) continue;
      running += isFiniteNumber(record.precipitationMm)
        ? record.precipitationMm
        : 0;
      dates.push(record.date);
      cumulativeMm.push(running);
    }
    return { panchayat, dates, cumulativeMm };
  });
}

/**
 * Temperature anomaly per panchayat (Plot 18): this forecast window's mean
 * temperature minus the historical climatological normal for the same
 * calendar month (all years of that month averaged).
 * @param {object|null} data
 * @param {string} monthSuffix e.g. "-09" for September
 * @returns {{ panchayat: string, historicalNormalC: number|null, forecastMeanC: number|null, anomalyC: number|null }[]}
 */
export function selectTemperatureAnomalyByPanchayat(data, monthSuffix) {
  const panchayats = data?.panchayats ?? [];
  return panchayats.map((panchayat) => {
    const historicalValues = selectHistoricalPanchayat(data, panchayat)
      .filter((r) => r.monthKey?.endsWith(monthSuffix))
      .map((r) => r.tempAvgC)
      .filter(isFiniteNumber);
    const forecastValues = selectForecastPanchayat(data, panchayat)
      .map((r) => r.temperatureC)
      .filter(isFiniteNumber);

    const historicalNormalC =
      historicalValues.length > 0
        ? historicalValues.reduce((sum, v) => sum + v, 0) /
          historicalValues.length
        : null;
    const forecastMeanC =
      forecastValues.length > 0
        ? forecastValues.reduce((sum, v) => sum + v, 0) / forecastValues.length
        : null;

    return {
      panchayat,
      historicalNormalC,
      forecastMeanC,
      anomalyC:
        isFiniteNumber(historicalNormalC) && isFiniteNumber(forecastMeanC)
          ? forecastMeanC - historicalNormalC
          : null,
    };
  });
}
