import { selectForecastPanchayat } from "@/data/selectors";
import {
  groupRecordsByDay,
  computeDailyMinMax,
  computeDailyMean,
  pickRepresentativeHour,
} from "@/lib/time/dailyAggregation";
import { computeIrrigationWindow } from "@/lib/calculations/irrigationWindow";
import { computeSprayWindow } from "@/lib/calculations/sprayWindow";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";
import { mapFrostRiskToRiskLevel } from "@/lib/riskLevels";
import { isFiniteNumber } from "@/lib/calculations/result";
import {
  evaluateDecision,
  DECISION_ACTIONS,
} from "@/lib/decisionEngine/evaluateDecision";

const FIVE_DAY_COUNT = 5;
const DAYPARTS = [
  { key: "morning", startHourUtc: 6, endHourUtc: 12 },
  { key: "afternoon", startHourUtc: 12, endHourUtc: 18 },
  { key: "evening", startHourUtc: 18, endHourUtc: 24 },
  { key: "night", startHourUtc: 0, endHourUtc: 6 },
];

/**
 * A 5-day daily summary for the Farmer home screen,
 * collapsed from the same hourly panchayat forecast every other
 * panchayat-scoped view reads — reuses `groupRecordsByDay`/
 * `computeDailyMinMax` rather than re-deriving daily bucketing.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ dateKey: string, tempMinC: number|null, tempMaxC: number|null, rainProbabilityMaxPct: number|null, precipitationTotalMm: number|null }[]}
 */
export function selectFiveDayForecast(data, panchayat) {
  const records = selectForecastPanchayat(data, panchayat);
  const byDay = groupRecordsByDay(records);

  return [...byDay.entries()]
    .slice(0, FIVE_DAY_COUNT)
    .map(([dateKey, dayRecords]) => {
      const { min: tempMinC, max: tempMaxC } = computeDailyMinMax(
        dayRecords,
        "temperatureC",
      );
      const rainProbabilities = dayRecords
        .map((r) => r.rainProbabilityPct)
        .filter(isFiniteNumber);
      const precipitations = dayRecords
        .map((r) => r.precipitationMm)
        .filter(isFiniteNumber);

      return {
        dateKey,
        tempMinC,
        tempMaxC,
        rainProbabilityMaxPct: rainProbabilities.length
          ? Math.max(...rainProbabilities)
          : null,
        precipitationTotalMm: precipitations.length
          ? precipitations.reduce((sum, v) => sum + v, 0)
          : null,
      };
    });
}

/**
 * Today's Action Card — all 5 YES/NO
 * decisions the reusable decision-card rule engine supports
 * (`evaluateDecision`), run against this panchayat's current
 * forecast hour and the farmer's selected crop stage. No thresholds,
 * formulas, or raw calculation output are exposed here — just the
 * engine's normalized `{ available, decision, reasons }` per action, per
 * "do not expose scientist-level complexity on the primary farmer
 * screen."
 * @param {object|null} data
 * @param {string} panchayat
 * @param {string|null} cropStage
 * @returns {Record<string, ReturnType<typeof evaluateDecision>> | null}
 */
export function selectTodaysActionCard(data, panchayat, cropStage = null) {
  const current = selectForecastPanchayat(data, panchayat)[0];
  if (!current) return null;

  const forecast = {
    soilMoistureDeficit: current.soilDeficit,
    rainProbabilityPct: current.rainProbabilityPct,
    windSpeedKmh: current.windSpeedKmh,
    temperatureC: current.temperatureC,
    humidityPct: current.humidityPct,
  };

  return Object.fromEntries(
    DECISION_ACTIONS.map((action) => [
      action,
      evaluateDecision(action, { forecast, cropStage }),
    ]),
  );
}

/**
 * Mobile-simplified version of the Scientist portal's Plot 12 (Farm
 * Operations Window Matrix) for the Farmer home screen — one
 * representative-afternoon spray/irrigate/frost reading per day for the
 * next 5 days, reusing the exact same calculation functions and the same
 * `pickRepresentativeHour` helper Plot 12 uses, so the two portals can
 * never silently disagree about "is today good for spraying."
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ dateKey: string, spray: import("@/lib/calculations/result").CalcResult, irrigate: import("@/lib/calculations/result").CalcResult, frostRiskLevel: string|null }[]}
 */
export function selectWeeklyOperationsOutlook(data, panchayat) {
  const records = selectForecastPanchayat(data, panchayat);
  const byDay = groupRecordsByDay(records);

  return [...byDay.entries()]
    .slice(0, FIVE_DAY_COUNT)
    .map(([dateKey, dayRecords]) => {
      const representative = pickRepresentativeHour(dayRecords);
      const frost = computeFrostRisk({ tempMinC: representative.temperatureC });

      return {
        dateKey,
        spray: computeSprayWindow({
          windSpeedKmh: representative.windSpeedKmh,
          rainProbabilityPct: representative.rainProbabilityPct,
          tempC: representative.temperatureC,
        }),
        irrigate: computeIrrigationWindow({
          soilMoistureDeficit: representative.soilDeficit,
          rainProbabilityPct: representative.rainProbabilityPct,
        }),
        frostRiskLevel: frost.available
          ? mapFrostRiskToRiskLevel(frost.value)
          : null,
      };
    });
}

/**
 * Mobile-simplified version of the Scientist portal's Plot 8 (Rainfall
 * Probability Distribution) for the Farmer home screen —
 * today's hourly rain probability collapsed into 4 large, touch-friendly
 * dayparts instead of 24 individual hourly bars, which a phone screen's
 * "touch targets" requirement rules out.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ key: string, rainProbabilityPct: number|null }[]}
 */
export function selectTodayRainByDaypart(data, panchayat) {
  const records = selectForecastPanchayat(data, panchayat);
  const byDay = groupRecordsByDay(records);
  const [, todayRecords] = [...byDay.entries()][0] ?? [null, []];

  return DAYPARTS.map(({ key, startHourUtc, endHourUtc }) => {
    const bucket = todayRecords.filter((r) => {
      const hour = r.date.getUTCHours();
      return hour >= startHourUtc && hour < endHourUtc;
    });
    return {
      key,
      rainProbabilityPct: computeDailyMean(bucket, "rainProbabilityPct"),
    };
  });
}

/**
 * Mobile-simplified version of the Scientist portal's Plot 7 (Crop
 * Threshold Time Series) for the Farmer home screen —
 * collapses the hourly line chart down to one safe/hot/cold status per
 * day for the next 5 days, reusing `selectFiveDayForecast`'s daily
 * min/max rather than re-deriving it.
 * @param {object|null} data
 * @param {string} panchayat
 * @param {{ crop: string, heatStressC: number, coldStressC: number } | undefined} cropThresholds
 * @returns {{ dateKey: string, tempMaxC: number|null, tempMinC: number|null, status: "hot"|"cold"|"safe"|"unavailable"}[]}
 */
export function selectCropThresholdOutlook(data, panchayat, cropThresholds) {
  const days = selectFiveDayForecast(data, panchayat);
  if (!cropThresholds)
    return days.map((day) => ({ ...day, status: "unavailable" }));

  return days.map((day) => {
    let status = "safe";
    if (!isFiniteNumber(day.tempMaxC) || !isFiniteNumber(day.tempMinC))
      status = "unavailable";
    else if (day.tempMaxC >= cropThresholds.heatStressC) status = "hot";
    else if (day.tempMinC <= cropThresholds.coldStressC) status = "cold";

    return {
      dateKey: day.dateKey,
      tempMaxC: day.tempMaxC,
      tempMinC: day.tempMinC,
      status,
    };
  });
}
