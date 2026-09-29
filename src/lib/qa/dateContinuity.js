/**
 * Checks a monthly series (records with a `monthKey` like "2016-01") for
 * gaps between its earliest and latest month.
 * @param {{ monthKey: string|null }[]} records
 * @returns {{ expectedCount: number, presentCount: number, missingMonths: string[], continuityPct: number }}
 */
export function computeMonthlyContinuity(records) {
  const monthKeys = records
    .map((r) => r.monthKey)
    .filter(Boolean)
    .sort();
  if (monthKeys.length === 0) {
    return {
      expectedCount: 0,
      presentCount: 0,
      missingMonths: [],
      continuityPct: 0,
    };
  }

  const present = new Set(monthKeys);
  const [startYear, startMonth] = monthKeys[0].split("-").map(Number);
  const [endYear, endMonth] = monthKeys[monthKeys.length - 1]
    .split("-")
    .map(Number);

  const missingMonths = [];
  let year = startYear;
  let month = startMonth;
  let expectedCount = 0;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    expectedCount += 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    if (!present.has(key)) missingMonths.push(key);

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return {
    expectedCount,
    presentCount: expectedCount - missingMonths.length,
    missingMonths,
    continuityPct:
      ((expectedCount - missingMonths.length) / expectedCount) * 100,
  };
}

/**
 * Checks a timestamped series (records with a `date`) for gaps against a
 * fixed expected interval (default 1 hour, matching our forecast data).
 * @param {{ date: Date|null }[]} records
 * @param {{ expectedIntervalMs?: number }} [options]
 * @returns {{ expectedCount: number, presentCount: number, gapCount: number, continuityPct: number }}
 */
export function computeIntervalContinuity(
  records,
  { expectedIntervalMs = 3600000 } = {},
) {
  const timestamps = records
    .map((r) => r.date)
    .filter((d) => d instanceof Date)
    .map((d) => d.getTime())
    .sort((a, b) => a - b);

  if (timestamps.length < 2) {
    return {
      expectedCount: timestamps.length,
      presentCount: timestamps.length,
      gapCount: 0,
      continuityPct: timestamps.length > 0 ? 100 : 0,
    };
  }

  const span = timestamps[timestamps.length - 1] - timestamps[0];
  const expectedCount = Math.round(span / expectedIntervalMs) + 1;

  let gapCount = 0;
  for (let i = 1; i < timestamps.length; i += 1) {
    const steps = Math.round(
      (timestamps[i] - timestamps[i - 1]) / expectedIntervalMs,
    );
    if (steps > 1) gapCount += steps - 1;
  }

  return {
    expectedCount,
    presentCount: timestamps.length,
    gapCount,
    continuityPct: (timestamps.length / expectedCount) * 100,
  };
}
