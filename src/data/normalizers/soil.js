import {
  findMissingColumns,
  parseNumber,
  parseString,
} from "@/data/schemas/validate";

const COLUMNS = [
  "panchayat_name",
  "soil_type",
  "clay_pct",
  "silt_pct",
  "sand_pct",
  "soil_ph",
  "soil_water_capacity_mm_m",
];

/**
 * @param {Record<string, string>[]} rawRows
 * @returns {{ records: object[], issues: { missingColumns: string[], invalidRowCount: number, totalRows: number } }}
 */
export function normalizeSoilRows(rawRows) {
  const missingColumns = findMissingColumns(rawRows, COLUMNS);
  let invalidRowCount = 0;

  const records = rawRows.map((row) => {
    const panchayat = parseString(row.panchayat_name);
    if (!panchayat) invalidRowCount += 1;
    return {
      provenance: "observed",
      panchayat,
      soilType: parseString(row.soil_type),
      clayPct: parseNumber(row.clay_pct),
      siltPct: parseNumber(row.silt_pct),
      sandPct: parseNumber(row.sand_pct),
      soilPh: parseNumber(row.soil_ph),
      soilWaterCapacityMmPerM: parseNumber(row.soil_water_capacity_mm_m),
    };
  });

  return {
    records,
    issues: { missingColumns, invalidRowCount, totalRows: rawRows.length },
  };
}
