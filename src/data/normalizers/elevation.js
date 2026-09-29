import {
  findMissingColumns,
  parseNumber,
  parseString,
} from "@/data/schemas/validate";

const COLUMNS = ["Panchayat", "Longitude", "Latitude", "Elevation"];

/**
 * Normalizes the raw elevation point grid and computes a per-panchayat
 * summary (mean/min/max/count) used by the temperature elevation
 * correction: `T_p = T_block - 6.5 * (Elev_p - Elev_block) / 1000`.
 *
 * @param {Record<string, string>[]} rawRows
 * @returns {{
 * points: object[],
 * summaryByPanchayat: Record<string, { meanElevationM: number, minElevationM: number, maxElevationM: number, pointCount: number }>,
 * issues: { missingColumns: string[], invalidRowCount: number, totalRows: number }
 * }}
 */
export function normalizeElevationRows(rawRows) {
  const missingColumns = findMissingColumns(rawRows, COLUMNS);
  let invalidRowCount = 0;

  /** @type {Map<string, { sum: number, min: number, max: number, count: number }>} */
  const accumulators = new Map();

  const points = rawRows.map((row) => {
    const panchayat = parseString(row.Panchayat);
    const longitude = parseNumber(row.Longitude);
    const latitude = parseNumber(row.Latitude);
    const elevationM = parseNumber(row.Elevation);

    if (
      !panchayat ||
      longitude === null ||
      latitude === null ||
      elevationM === null
    ) {
      invalidRowCount += 1;
    } else {
      const acc = accumulators.get(panchayat) ?? {
        sum: 0,
        min: Infinity,
        max: -Infinity,
        count: 0,
      };
      acc.sum += elevationM;
      acc.min = Math.min(acc.min, elevationM);
      acc.max = Math.max(acc.max, elevationM);
      acc.count += 1;
      accumulators.set(panchayat, acc);
    }

    return {
      provenance: "observed",
      panchayat,
      longitude,
      latitude,
      elevationM,
    };
  });

  /** @type {Record<string, { meanElevationM: number, minElevationM: number, maxElevationM: number, pointCount: number }>} */
  const summaryByPanchayat = {};
  for (const [panchayat, acc] of accumulators.entries()) {
    summaryByPanchayat[panchayat] = {
      meanElevationM: acc.sum / acc.count,
      minElevationM: acc.min,
      maxElevationM: acc.max,
      pointCount: acc.count,
    };
  }

  return {
    points,
    summaryByPanchayat,
    issues: { missingColumns, invalidRowCount, totalRows: rawRows.length },
  };
}
