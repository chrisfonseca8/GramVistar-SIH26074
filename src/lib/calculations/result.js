/**
 * Every calculation in `src/lib/calculations/` returns this same shape
 * instead of a bare number, so missing/invalid inputs produce a controlled,
 * explicit "unavailable" result rather than `NaN`, `0`, or a thrown error
 * — values are never invented, and missing is never treated as 0.
 *
 * @typedef {{ value: *, unit: string, available: true }} AvailableResult
 * @typedef {{ value: null, unit: string, available: false, reason: string }} UnavailableResult
 * @typedef {AvailableResult | UnavailableResult} CalcResult
 */

/**
 * @param {*} value
 * @param {string} unit
 * @returns {AvailableResult}
 */
export function available(value, unit) {
  return { value, unit, available: true };
}

/**
 * @param {string} unit
 * @param {string} reason human-readable, e.g. "missing tempMaxC"
 * @returns {UnavailableResult}
 */
export function unavailable(unit, reason) {
  return { value: null, unit, available: false, reason };
}

/** @param {*} x @returns {x is number} */
export function isFiniteNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}
