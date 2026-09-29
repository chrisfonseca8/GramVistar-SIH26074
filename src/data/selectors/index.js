/**
 * Pure selector functions over the normalized data returned by
 * `loadAllData()` / stored in `useDataStore`. Kept independent of Zustand
 * so they are trivially unit-testable and reusable from any component via
 * `useDataStore((state) => selectX(state.data, ...))`.
 */

/** @param {object|null} data @returns {object[]} */
export function selectHistoricalBlock(data) {
  return data?.historicalBlock ?? [];
}

/** @param {object|null} data @param {string} panchayat @returns {object[]} */
export function selectHistoricalPanchayat(data, panchayat) {
  return (data?.historicalPanchayats ?? []).filter(
    (row) => row.panchayat === panchayat,
  );
}

/** @param {object|null} data @returns {object[]} */
export function selectForecastBlock(data) {
  return data?.forecastBlock ?? [];
}

/** @param {object|null} data @param {string} panchayat @returns {object[]} */
export function selectForecastPanchayat(data, panchayat) {
  return (data?.forecastPanchayats ?? []).filter(
    (row) => row.panchayat === panchayat,
  );
}

/** @param {object|null} data @param {string} panchayat @returns {object|undefined} */
export function selectSoilForPanchayat(data, panchayat) {
  return (data?.soil ?? []).find((row) => row.panchayat === panchayat);
}

/** @param {object|null} data @param {string} panchayat @returns {object|undefined} */
export function selectElevationSummaryForPanchayat(data, panchayat) {
  return data?.elevationSummaryByPanchayat?.[panchayat];
}

/** @param {object|null} data @returns {string[]} */
export function selectPanchayatList(data) {
  return data?.panchayats ?? [];
}

/**
 * Extracts a single variable as a {date, value} series from any array of
 * normalized records (historical or forecast, block or panchayat).
 * @param {object[]} records
 * @param {string} variableKey e.g. "tempAvgC"
 * @returns {{ date: Date, value: number | null }[]}
 */
export function selectVariableSeries(records, variableKey) {
  return records
    .filter((row) => row.date instanceof Date)
    .map((row) => ({ date: row.date, value: row[variableKey] ?? null }));
}

/**
 * Filters normalized records (must have a `date` field) to an inclusive
 * [start, end] range. Records with a missing/invalid date are dropped.
 * @param {object[]} records
 * @param {{ start?: Date, end?: Date }} range
 * @returns {object[]}
 */
export function selectByDateRange(records, { start, end } = {}) {
  return records.filter((row) => {
    if (!(row.date instanceof Date)) return false;
    if (start && row.date < start) return false;
    if (end && row.date > end) return false;
    return true;
  });
}
