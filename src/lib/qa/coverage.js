/**
 * Compares the set of stations/panchayats actually present in a dataset
 * against an expected list — used for both "station coverage" (does every
 * expected station have data?) and "spatial coverage" (does every expected
 * panchayat have this data layer at all?), which are the same computation
 * over different inputs.
 *
 * @param {object[]} records
 * @param {string} groupField e.g. "panchayat"
 * @param {string[]} expectedGroups e.g. the 5 panchayat names
 * @returns {{ expectedCount: number, presentCount: number, missingGroups: string[], coveragePct: number }}
 */
export function computeCoverage(records, groupField, expectedGroups) {
  const present = new Set(records.map((r) => r[groupField]).filter(Boolean));
  const missingGroups = expectedGroups.filter((group) => !present.has(group));

  return {
    expectedCount: expectedGroups.length,
    presentCount: expectedGroups.length - missingGroups.length,
    missingGroups,
    coveragePct:
      expectedGroups.length === 0
        ? 100
        : ((expectedGroups.length - missingGroups.length) /
            expectedGroups.length) *
          100,
  };
}
