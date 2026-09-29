/**
 * Selectors over `feedbackStore`'s entries for the Scientist Feedback
 * Inbox. Everything here is a pure filter/aggregation
 * over already-persisted client state — "make feedback visible to
 * scientists without requiring a backend" is satisfied by both roles
 * reading the same `feedbackStore` Zustand state, nothing more.
 */

/**
 * @param {object[]} entries `feedbackStore`'s `entries`
 * @param {{ panchayat?: string, category?: string, dateFrom?: string, dateTo?: string }} filters empty/undefined means "no filter" for that field
 * @returns {object[]}
 */
export function selectFilteredFeedback(entries, filters = {}) {
  const { panchayat, category, dateFrom, dateTo } = filters;

  return entries.filter((entry) => {
    if (panchayat && entry.panchayat !== panchayat) return false;
    if (category && entry.category !== category) return false;
    if (dateFrom && entry.timestamp < dateFrom) return false;
    if (dateTo && entry.timestamp > `${dateTo}T23:59:59.999Z`) return false;
    return true;
  });
}

/**
 * Trend summary counts — how many feedback entries per
 * category and per panchayat, over whatever set of entries is passed in
 * (typically the already-filtered list, so the summary reflects the
 * current filter selection).
 * @param {object[]} entries
 * @returns {{ byCategory: { category: string, count: number }[], byPanchayat: { panchayat: string, count: number }[], total: number }}
 */
export function selectFeedbackTrendSummary(entries) {
  const byCategoryMap = new Map();
  const byPanchayatMap = new Map();

  for (const entry of entries) {
    byCategoryMap.set(
      entry.category,
      (byCategoryMap.get(entry.category) ?? 0) + 1,
    );
    byPanchayatMap.set(
      entry.panchayat,
      (byPanchayatMap.get(entry.panchayat) ?? 0) + 1,
    );
  }

  return {
    byCategory: [...byCategoryMap.entries()].map(([category, count]) => ({
      category,
      count,
    })),
    byPanchayat: [...byPanchayatMap.entries()].map(([panchayat, count]) => ({
      panchayat,
      count,
    })),
    total: entries.length,
  };
}
