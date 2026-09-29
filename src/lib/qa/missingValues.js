/**
 * Counts missing (`null`) vs present values for a field across a set of
 * records. Missing is only ever `null`/`undefined` — an actual `0` in the
 * data is counted as present, never treated as missing.
 *
 * @param {object[]} records
 * @param {string} field
 * @returns {{ field: string, total: number, missingCount: number, presentCount: number, missingPct: number }}
 */
export function computeMissingValueSummary(records, field) {
  const total = records.length;
  let missingCount = 0;

  for (const record of records) {
    const value = record[field];
    if (value === null || value === undefined) missingCount += 1;
  }

  return {
    field,
    total,
    missingCount,
    presentCount: total - missingCount,
    missingPct: total === 0 ? 0 : (missingCount / total) * 100,
  };
}

/**
 * Runs `computeMissingValueSummary` over several fields at once.
 * @param {object[]} records
 * @param {string[]} fields
 * @returns {ReturnType<typeof computeMissingValueSummary>[]}
 */
export function computeMissingValueSummaries(records, fields) {
  return fields.map((field) => computeMissingValueSummary(records, field));
}
