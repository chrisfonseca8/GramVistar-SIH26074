import { isFiniteNumber } from "@/lib/calculations/result";

/**
 * Groups timestamped records by calendar day (UTC), preserving insertion
 * order. Shared by every plot that needs to collapse an hourly forecast
 * series down to one value per day (daily min/max for cloud-cover
 * estimation, daily mean for a readable heatmap, one representative hour
 * for the operations matrix, etc.).
 * @param {{ date: Date|null }[]} records
 * @returns {Map<string, object[]>} day key ("YYYY-MM-DD") -> that day's records
 */
export function groupRecordsByDay(records) {
  const byDay = new Map();
  for (const record of records) {
    if (!(record.date instanceof Date)) continue;
    const key = record.date.toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(record);
  }
  return byDay;
}

/** @param {object[]} records @param {string} field @returns {{ min: number|null, max: number|null }} */
export function computeDailyMinMax(records, field) {
  const values = records.map((r) => r[field]).filter(isFiniteNumber);
  if (values.length === 0) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** @param {object[]} records @param {string} field @returns {number|null} */
export function computeDailyMean(records, field) {
  const values = records.map((r) => r[field]).filter(isFiniteNumber);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Picks the one record from a day's hourly records closest to a target
 * UTC hour — used wherever a single "representative" reading is needed
 * for a whole day instead of an hourly series (e.g. an afternoon spray/
 * irrigation check). Shared by the Scientist Operations Window Matrix
 * (Plot 12) and its Farmer-portal mobile equivalent so both
 * pick the same representative hour the same way.
 * @param {{ date: Date }[]} dayRecords
 * @param {number} [targetHourUtc]
 * @returns {object}
 */
export function pickRepresentativeHour(dayRecords, targetHourUtc = 14) {
  return dayRecords.reduce((best, record) => {
    const hour = record.date.getUTCHours();
    const bestHour = best.date.getUTCHours();
    return Math.abs(hour - targetHourUtc) < Math.abs(bestHour - targetHourUtc)
      ? record
      : best;
  });
}
