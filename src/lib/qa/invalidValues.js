import { isFiniteNumber } from "@/lib/calculations/result";

/**
 * Counts present-but-implausible values for a field — outside a
 * physically plausible `[min, max]` range — separately from missing
 * values (a `null` is not "invalid", it's absent; see `missingValues.js`).
 *
 * @param {object[]} records
 * @param {string} field
 * @param {{ min?: number, max?: number }} range
 * @returns {{ field: string, presentCount: number, invalidCount: number, invalidPct: number, invalidSamples: number[] }}
 */
export function computeInvalidValueSummary(
  records,
  field,
  { min = -Infinity, max = Infinity } = {},
) {
  let presentCount = 0;
  let invalidCount = 0;
  const invalidSamples = [];

  for (const record of records) {
    const value = record[field];
    if (!isFiniteNumber(value)) continue;
    presentCount += 1;
    if (value < min || value > max) {
      invalidCount += 1;
      if (invalidSamples.length < 5) invalidSamples.push(value);
    }
  }

  return {
    field,
    presentCount,
    invalidCount,
    invalidPct: presentCount === 0 ? 0 : (invalidCount / presentCount) * 100,
    invalidSamples,
  };
}

/**
 * Runs `computeInvalidValueSummary` over several fields at once.
 * @param {object[]} records
 * @param {Record<string, { min?: number, max?: number }>} fieldRanges
 * @returns {ReturnType<typeof computeInvalidValueSummary>[]}
 */
export function computeInvalidValueSummaries(records, fieldRanges) {
  return Object.entries(fieldRanges).map(([field, range]) =>
    computeInvalidValueSummary(records, field, range),
  );
}
