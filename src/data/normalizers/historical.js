import {
  findMissingColumns,
  parseNumber,
  parseString,
  parseYearMonth,
} from "@/data/schemas/validate";

const BLOCK_COLUMNS = [
  "Block",
  "Month",
  "Temp_Max_C",
  "Temp_Min_C",
  "Temp_Avg_C",
  "Precipitation_Total_mm",
  "Soil_Moisture_Avg",
];

const PANCHAYAT_COLUMNS = [
  "Panchayat",
  "Month",
  "Temp_Max_C",
  "Temp_Min_C",
  "Temp_Avg_C",
  "Precipitation_Total_mm",
  "Soil_Moisture_Avg",
];

/**
 * @param {Record<string, string>[]} rawRows
 * @returns {{ records: object[], issues: { missingColumns: string[], invalidRowCount: number, totalRows: number } }}
 */
export function normalizeHistoricalBlockRows(rawRows) {
  const missingColumns = findMissingColumns(rawRows, BLOCK_COLUMNS);
  let invalidRowCount = 0;

  const records = rawRows.map((row) => {
    const month = parseYearMonth(row.Month);
    const block = parseString(row.Block);
    if (!month || !block) invalidRowCount += 1;
    return {
      provenance: "observed",
      block,
      monthKey: month?.monthKey ?? null,
      date: month?.date ?? null,
      year: month?.year ?? null,
      month: month?.month ?? null,
      tempMaxC: parseNumber(row.Temp_Max_C),
      tempMinC: parseNumber(row.Temp_Min_C),
      tempAvgC: parseNumber(row.Temp_Avg_C),
      precipitationTotalMm: parseNumber(row.Precipitation_Total_mm),
      soilMoistureAvg: parseNumber(row.Soil_Moisture_Avg),
    };
  });

  return {
    records,
    issues: { missingColumns, invalidRowCount, totalRows: rawRows.length },
  };
}

/**
 * @param {Record<string, string>[]} rawRows
 * @returns {{ records: object[], issues: { missingColumns: string[], invalidRowCount: number, totalRows: number } }}
 */
export function normalizeHistoricalPanchayatRows(rawRows) {
  const missingColumns = findMissingColumns(rawRows, PANCHAYAT_COLUMNS);
  let invalidRowCount = 0;

  const records = rawRows.map((row) => {
    const month = parseYearMonth(row.Month);
    const panchayat = parseString(row.Panchayat);
    if (!month || !panchayat) invalidRowCount += 1;
    return {
      provenance: "observed",
      panchayat,
      monthKey: month?.monthKey ?? null,
      date: month?.date ?? null,
      year: month?.year ?? null,
      month: month?.month ?? null,
      tempMaxC: parseNumber(row.Temp_Max_C),
      tempMinC: parseNumber(row.Temp_Min_C),
      tempAvgC: parseNumber(row.Temp_Avg_C),
      precipitationTotalMm: parseNumber(row.Precipitation_Total_mm),
      soilMoistureAvg: parseNumber(row.Soil_Moisture_Avg),
    };
  });

  return {
    records,
    issues: { missingColumns, invalidRowCount, totalRows: rawRows.length },
  };
}
