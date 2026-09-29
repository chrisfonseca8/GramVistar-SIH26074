/**
 * Central formatting utilities. Every formatter treats
 * `null`/`undefined`/non-finite input as "no value" and renders an
 * explicit placeholder (`—`) rather than `0`, `NaN`, or an empty string —
 * consistent with the rest of the app never conflating missing data with
 * zero.
 */

const MISSING_PLACEHOLDER = "—";

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * @param {number|null|undefined} value
 * @param {{ decimals?: number, suffix?: string }} [options]
 * @returns {string}
 */
export function formatNumber(value, { decimals = 1, suffix = "" } = {}) {
  if (!isFiniteNumber(value)) return MISSING_PLACEHOLDER;
  return `${value.toFixed(decimals)}${suffix}`;
}

/** @param {number|null|undefined} value @param {{ decimals?: number }} [options] */
export function formatPercent(value, { decimals = 0 } = {}) {
  if (!isFiniteNumber(value)) return MISSING_PLACEHOLDER;
  return `${value.toFixed(decimals)}%`;
}

/** @param {number|null|undefined} valueC */
export function formatTemperature(valueC) {
  return formatNumber(valueC, { decimals: 1, suffix: "°C" });
}

/** @param {number|null|undefined} valueMm */
export function formatPrecipitation(valueMm) {
  return formatNumber(valueMm, { decimals: 1, suffix: "mm" });
}

/** @param {number|null|undefined} valueKmh */
export function formatWindSpeed(valueKmh) {
  return formatNumber(valueKmh, { decimals: 1, suffix: "km/h" });
}

/** Volumetric soil moisture (m³/m³) shown as a percentage, e.g. 0.259 -> "25.9%". */
export function formatSoilMoisturePercent(valueFraction) {
  if (!isFiniteNumber(valueFraction)) return MISSING_PLACEHOLDER;
  return formatPercent(valueFraction * 100, { decimals: 1 });
}

/** @param {number|null|undefined} valueM */
export function formatElevation(valueM) {
  return formatNumber(valueM, { decimals: 0, suffix: "m" });
}

/**
 * "2016-01"-> "Jan 2016". Falls back to the placeholder for a
 * malformed/missing key rather than showing raw garbage.
 * @param {string|null|undefined} monthKey
 */
export function formatMonthLabel(monthKey) {
  if (!monthKey) return MISSING_PLACEHOLDER;
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return MISSING_PLACEHOLDER;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A `Date` -> "27 Sep, 14:00". Used for hourly forecast timestamps.
 * @param {Date|null|undefined} date
 */
export function formatHourLabel(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()))
    return MISSING_PLACEHOLDER;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

/**
 * A `Date` -> "27 Sep 2026". Used for date-only display.
 * @param {Date|null|undefined} date
 */
export function formatDateLabel(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()))
    return MISSING_PLACEHOLDER;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export { MISSING_PLACEHOLDER };
