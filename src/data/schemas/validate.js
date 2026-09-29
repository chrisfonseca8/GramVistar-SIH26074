/**
 * Shared parsing helpers for raw CSV/GeoJSON values.
 *
 * Every parser returns `null` for missing or unparsable input instead of
 * silently coercing to 0/false, per the project's data-integrity rules
 * (never treat missing as zero, never treat zero as missing).
 */

/** @param {unknown} raw @returns {number|null} */
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** @param {unknown} raw @returns {string|null} */
export function parseString(raw) {
  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Parses "True"/"False" (and "true"/"false") strings into booleans.
 * @param {unknown} raw @returns {boolean|null}
 */
export function parseBoolean(raw) {
  const str = parseString(raw);
  if (str === null) return null;
  const lower = str.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return null;
}

/**
 * Parses a "YYYY-MM" month string.
 * @param {unknown} raw
 * @returns {{ monthKey: string, year: number, month: number, date: Date } | null}
 */
export function parseYearMonth(raw) {
  const str = parseString(raw);
  if (str === null) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(str);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(Date.UTC(year, month - 1, 1));
  if (Number.isNaN(date.getTime())) return null;
  return { monthKey: str, year, month, date };
}

/**
 * Parses a "YYYY-MM-DD HH:MM:SS" timestamp string as UTC.
 * @param {unknown} raw
 * @returns {{ timeKey: string, date: Date, iso: string } | null}
 */
export function parseTimestamp(raw) {
  const str = parseString(raw);
  if (str === null) return null;
  const isoLike = str.replace(" ", "T") + "Z";
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return null;
  return { timeKey: str, date, iso: date.toISOString() };
}

/**
 * Verifies every key in `requiredKeys` is present on the first row of
 * `rows` (as parsed by PapaParse with header:true). Used to fail loudly
 * if a source file's columns change instead of silently producing nulls
 * for every row.
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} requiredKeys
 * @returns {string[]} missing column names, empty if all present
 */
export function findMissingColumns(rows, requiredKeys) {
  if (!rows.length) return requiredKeys;
  const present = new Set(Object.keys(rows[0]));
  return requiredKeys.filter((key) => !present.has(key));
}
