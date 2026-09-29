/**
 * Published-advisory selectors. "Publishing" doesn't copy
 * data into a separate store — `advisoryStore` already is the
 * shared Zustand state; these selectors just read the subset with
 * `status === "Published"`, filtered to the audience the caller is —
 * Farmer or Government — which is what makes an advisory visible there.
 */

/** @param {object} advisory @returns {object|null} the content of its latest version */
export function getLatestVersionContent(advisory) {
  return advisory.versions[advisory.versions.length - 1]?.content ?? null;
}

/** @param {object} advisory @returns {string|null} the timestamp of its latest version */
export function getLatestVersionTimestamp(advisory) {
  return advisory.versions[advisory.versions.length - 1]?.timestamp ?? null;
}

/**
 * The most recently published farmer-facing advisory for a panchayat, or
 * `null`.
 * @param {object[]} advisories
 * @param {string} panchayat
 * @returns {object|null}
 */
export function selectPublishedAdvisoryForPanchayat(advisories, panchayat) {
  const matches = advisories.filter(
    (a) =>
      a.status === "Published" &&
      a.audience === "farmer" &&
      a.panchayat === panchayat,
  );
  if (matches.length === 0) return null;

  return matches.sort((a, b) =>
    getLatestVersionTimestamp(b).localeCompare(getLatestVersionTimestamp(a)),
  )[0];
}

/**
 * Every published authority-facing advisory across all panchayats, newest
 * first — the Government (DM/DC) portal's aggregate view.
 * @param {object[]} advisories
 * @returns {object[]}
 */
export function selectAllPublishedAdvisories(advisories) {
  return advisories
    .filter((a) => a.status === "Published" && a.audience === "authority")
    .sort((a, b) =>
      getLatestVersionTimestamp(b).localeCompare(getLatestVersionTimestamp(a)),
    );
}
