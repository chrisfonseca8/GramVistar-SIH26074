import {
  selectHistoricalPanchayat,
  selectForecastPanchayat,
} from "@/data/selectors";
import {
  groupRecordsByDay,
  computeDailyMinMax,
  computeDailyMean,
} from "@/lib/time/dailyAggregation";
import { getDayOfYear, getDaysInMonth } from "@/lib/time/dayOfYear";
import { computeSpi, computeSpei } from "@/lib/calculations/spi";
import { computeHeatIndex } from "@/lib/calculations/heatIndex";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";
import { computeGdd } from "@/lib/calculations/gdd";
import { computeEt0Hargreaves } from "@/lib/calculations/et0Hargreaves";
import { isFiniteNumber } from "@/lib/calculations/result";

/** Monthly water balance (precip - ET0) for one historical record, using that panchayat's own centroid latitude. */
function computeMonthlyWaterBalance(record, latitudeDeg) {
  if (!isFiniteNumber(latitudeDeg) || !record.year || !record.month)
    return null;
  const dayOfYear = getDayOfYear(
    new Date(Date.UTC(record.year, record.month - 1, 15)),
  );
  const et0 = computeEt0Hargreaves({
    tempMaxC: record.tempMaxC,
    tempMinC: record.tempMinC,
    tempAvgC: record.tempAvgC,
    latitudeDeg,
    dayOfYear,
  });
  if (!et0.available || !isFiniteNumber(record.precipitationTotalMm))
    return null;
  return (
    record.precipitationTotalMm -
    et0.value * getDaysInMonth(record.year, record.month)
  );
}

/**
 * SPI/SPEI time series (Plot 19) across the full 10-year historical
 * record. Each month is standardized against *other years of the same
 * calendar month* (e.g. all Januaries), the correct SPI methodology for
 * removing the seasonal cycle — not against the full 120-month series,
 * which would confuse "December is colder than June" with a real anomaly.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ monthKey: string, date: Date, spi: import("@/lib/calculations/result").CalcResult, spei: import("@/lib/calculations/result").CalcResult }[]}
 */
export function selectSpiSpeiTimeSeries(data, panchayat) {
  const historical = selectHistoricalPanchayat(data, panchayat)
    .filter((r) => r.monthKey)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  const latitudeDeg = data?.panchayatCentroids?.[panchayat]?.latitude;

  return historical.map((record) => {
    const sameCalendarMonth = historical.filter(
      (r) => r.month === record.month,
    );

    const spi = computeSpi(
      sameCalendarMonth.map((r) => r.precipitationTotalMm),
      record.precipitationTotalMm,
    );

    const waterBalanceSeries = sameCalendarMonth.map((r) =>
      computeMonthlyWaterBalance(r, latitudeDeg),
    );
    const currentWaterBalance = computeMonthlyWaterBalance(record, latitudeDeg);
    const spei = isFiniteNumber(currentWaterBalance)
      ? computeSpei(waterBalanceSeries, currentWaterBalance)
      : {
          value: null,
          unit: "σ (standardized)",
          available: false,
          reason: "ET0 unavailable for this month",
        };

    return { monthKey: record.monthKey, date: record.date, spi, spei };
  });
}

/**
 * Hourly heat index over the forecast window (Plot 20).
 * @param {object|null} data @param {string} panchayat
 */
export function selectHeatIndexSeries(data, panchayat) {
  return selectForecastPanchayat(data, panchayat).map((record) => ({
    date: record.date,
    timeKey: record.timeKey,
    heatIndex: computeHeatIndex({
      tempC: record.temperatureC,
      humidityPct: record.humidityPct,
    }),
  }));
}

/**
 * Daily frost-risk level (none/watch/warning) per panchayat, from each
 * day's minimum forecast temperature (Plot 21) — block-wide, needs no
 * panchayat selection.
 * @param {object|null} data
 * @returns {{ panchayats: string[], days: string[], grid: (string|null)[][] }}
 */
export function selectFrostRiskGrid(data) {
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
      const { min } = computeDailyMinMax(dayRecords, "temperatureC");
      const result = computeFrostRisk({ tempMinC: min });
      return result.available ? result.value : null;
    }),
  );

  return { panchayats, days, grid };
}

/**
 * Daily and cumulative Growing Degree Days over the forecast window
 * (Plot 22), from each day's min/max forecast temperature.
 * @param {object|null} data @param {string} panchayat
 * @param {{ baseTempC: number, upperTempC?: number }} thresholds
 * @returns {{ day: string, dailyGdd: number|null, cumulativeGdd: number }[]}
 */
export function selectGddAccumulation(data, panchayat, thresholds) {
  const byDay = groupRecordsByDay(selectForecastPanchayat(data, panchayat));
  const days = Array.from(byDay.keys()).sort();

  let cumulative = 0;
  return days.map((day) => {
    const { min, max } = computeDailyMinMax(byDay.get(day), "temperatureC");
    const result = computeGdd({ tempMaxC: max, tempMinC: min, ...thresholds });
    if (result.available) cumulative += result.value;
    return {
      day,
      dailyGdd: result.available ? result.value : null,
      cumulativeGdd: cumulative,
    };
  });
}

/**
 * Daily precipitation, ET0 and water balance over the forecast window
 * (Plot 23).
 * @param {object|null} data @param {string} panchayat
 * @returns {{ day: string, precipitationMm: number, et0MmPerDay: number|null, waterBalanceMm: number|null }[]}
 */
export function selectWaterBalanceSeries(data, panchayat) {
  const byDay = groupRecordsByDay(selectForecastPanchayat(data, panchayat));
  const days = Array.from(byDay.keys()).sort();
  const latitudeDeg = data?.panchayatCentroids?.[panchayat]?.latitude;

  return days.map((day) => {
    const dayRecords = byDay.get(day);
    const { min, max } = computeDailyMinMax(dayRecords, "temperatureC");
    const meanTemp = computeDailyMean(dayRecords, "temperatureC");
    const totalPrecip = dayRecords.reduce(
      (sum, r) =>
        sum + (isFiniteNumber(r.precipitationMm) ? r.precipitationMm : 0),
      0,
    );
    const dayOfYear = getDayOfYear(new Date(`${day}T00:00:00Z`));
    const et0 = computeEt0Hargreaves({
      tempMaxC: max,
      tempMinC: min,
      tempAvgC: meanTemp,
      latitudeDeg,
      dayOfYear,
    });

    return {
      day,
      precipitationMm: totalPrecip,
      et0MmPerDay: et0.available ? et0.value : null,
      waterBalanceMm: et0.available ? totalPrecip - et0.value : null,
    };
  });
}
