import Papa from "papaparse";

/**
 * Fetches a CSV file from `/public` and parses it with PapaParse.
 * @param {string} path e.g. "/data/chas_10_year_monthly_historical.csv"
 * @returns {Promise<Record<string, string>[]>} raw rows, header-keyed, all values as strings
 */
export async function fetchCsv(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${path}: ${response.status} ${response.statusText}`,
    );
  }
  const text = await response.text();
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (result.errors.length) {
    const first = result.errors[0];
    throw new Error(
      `Failed to parse ${path}: ${first.message} (row ${first.row})`,
    );
  }
  return result.data;
}
