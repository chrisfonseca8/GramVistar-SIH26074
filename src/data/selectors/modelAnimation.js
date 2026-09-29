import { selectBlockElevation } from "@/data/selectors/downscaling";
import {
  groupRecordsByDay,
  computeDailyMean,
  computeDailyMinMax,
} from "@/lib/time/dailyAggregation";
import { getDayOfYear } from "@/lib/time/dayOfYear";
import { downscaleTemperatureByElevation } from "@/lib/downscaling/temperature";
import { adjustRainfallForElevation } from "@/lib/downscaling/rainfall";
import { adjustSoilMoistureForPanchayat } from "@/lib/downscaling/soilMoisture";
import { computeEt0Hargreaves } from "@/lib/calculations/et0Hargreaves";
import { isFiniteNumber } from "@/lib/calculations/result";

const VARIABLE_META = {
  temperature: { unit: "°C", colors: undefined }, // default terrain-ish scale is fine
  rainfall: { unit: "mm" },
  soilMoisture: { unit: "m³/m³" },
};

/** Mean latitude across every panchayat centroid — the block's representative latitude for ET0. */
function computeBlockLatitude(panchayatCentroids) {
  const lats = Object.values(panchayatCentroids ?? {})
    .map((c) => c.latitude)
    .filter(isFiniteNumber);
  if (lats.length === 0) return null;
  return lats.reduce((sum, v) => sum + v, 0) / lats.length;
}

/**
 * One frame per forecast day, each with every panchayat's downscaled
 * value for the selected variable. Daily (not hourly)
 * granularity for all three variables — soil moisture's water-balance
 * downscaling needs a daily ET0 rate (Hargreaves is a daily-rate formula),
 * so daily frames keep temperature/rainfall/soil-moisture consistent with
 * each other rather than mixing granularities.
 *
 * @param {object|null} data
 * @param {"temperature"|"rainfall"|"soilMoisture"} variableKey
 * @returns {{ frames: { day: string, byPanchayat: Record<string, number|null> }[], unit: string, range: { min: number, max: number } | null }}
 */
export function selectAnimationFrames(data, variableKey) {
  const panchayats = data?.panchayats ?? [];
  const elevationBlockM = selectBlockElevation(data);
  const blockLatitude = computeBlockLatitude(data?.panchayatCentroids);
  const byDayBlock = groupRecordsByDay(data?.forecastBlock ?? []);
  const days = Array.from(byDayBlock.keys()).sort();

  const frames = days.map((day) => {
    const dayRecords = byDayBlock.get(day);
    const { min: blockMinTempC, max: blockMaxTempC } = computeDailyMinMax(
      dayRecords,
      "temperatureC",
    );
    const blockMeanTempC = computeDailyMean(dayRecords, "temperatureC");
    const blockMeanSoilMoisture = computeDailyMean(dayRecords, "soilMoisture");
    const blockTotalPrecipMm = dayRecords.reduce(
      (sum, r) =>
        sum + (isFiniteNumber(r.precipitationMm) ? r.precipitationMm : 0),
      0,
    );

    const byPanchayat = {};
    for (const panchayat of panchayats) {
      const elevationPanchayatM =
        data.elevationSummaryByPanchayat?.[panchayat]?.meanElevationM;

      if (variableKey === "temperature") {
        const result = downscaleTemperatureByElevation({
          tempBlockC: blockMeanTempC,
          elevationBlockM,
          elevationPanchayatM,
        });
        byPanchayat[panchayat] = result.available ? result.value : null;
      } else if (variableKey === "rainfall") {
        const result = adjustRainfallForElevation({
          precipitationBlockMm: blockTotalPrecipMm,
          elevationBlockM,
          elevationPanchayatM,
        });
        byPanchayat[panchayat] = result.available ? result.value : null;
      } else {
        const soil = data.soil.find((s) => s.panchayat === panchayat);
        const et0 = computeEt0Hargreaves({
          tempMaxC: blockMaxTempC,
          tempMinC: blockMinTempC,
          tempAvgC: blockMeanTempC,
          latitudeDeg: blockLatitude,
          dayOfYear: getDayOfYear(new Date(`${day}T00:00:00Z`)),
        });
        const result = adjustSoilMoistureForPanchayat({
          baseSoilMoisture: blockMeanSoilMoisture,
          precipitationMm: blockTotalPrecipMm,
          et0MmPerDay: et0.available ? et0.value : null,
          soilWaterCapacityMmPerM: soil?.soilWaterCapacityMmPerM,
        });
        byPanchayat[panchayat] = result.available ? result.value : null;
      }
    }

    return { day, byPanchayat };
  });

  const allValues = frames
    .flatMap((f) => Object.values(f.byPanchayat))
    .filter(isFiniteNumber);
  const range =
    allValues.length > 0
      ? { min: Math.min(...allValues), max: Math.max(...allValues) }
      : null;

  return { frames, unit: VARIABLE_META[variableKey].unit, range };
}
