import {
  findMissingColumns,
  parseBoolean,
  parseNumber,
  parseString,
  parseTimestamp,
} from "@/data/schemas/validate";

const BLOCK_COLUMNS = [
  "Block",
  "Time",
  "Temperature_C",
  "Precipitation_mm",
  "Soil_Moisture",
];

const PANCHAYAT_COLUMNS = [
  "Panchayat",
  "Time",
  "Temperature_C",
  "Humidity_Pct",
  "Wind_Speed_kmh",
  "Precipitation_mm",
  "Rain_Probability_Pct",
  "Soil_Moisture",
  "Spray_Favorable",
];

/**
 * @param {Record<string, string>[]} rawRows
 * @returns {{ records: object[], issues: { missingColumns: string[], invalidRowCount: number, totalRows: number } }}
 */
export function normalizeForecastBlockRows(rawRows) {
  const missingColumns = findMissingColumns(rawRows, BLOCK_COLUMNS);
  let invalidRowCount = 0;

  const records = rawRows.map((row) => {
    const time = parseTimestamp(row.Time);
    const block = parseString(row.Block);
    if (!time || !block) invalidRowCount += 1;
    return {
      provenance: "forecast",
      block,
      timeKey: time?.timeKey ?? null,
      date: time?.date ?? null,
      iso: time?.iso ?? null,
      temperatureC: parseNumber(row.Temperature_C),
      precipitationMm: parseNumber(row.Precipitation_mm),
      soilMoisture: parseNumber(row.Soil_Moisture),
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
export function normalizeForecastPanchayatRows(rawRows) {
  const missingColumns = findMissingColumns(rawRows, PANCHAYAT_COLUMNS);
  let invalidRowCount = 0;

  const records = rawRows.map((row) => {
    const time = parseTimestamp(row.Time);
    const panchayat = parseString(row.Panchayat);
    if (!time || !panchayat) invalidRowCount += 1;
    return {
      provenance: "forecast",
      panchayat,
      timeKey: time?.timeKey ?? null,
      date: time?.date ?? null,
      iso: time?.iso ?? null,
      temperatureC: parseNumber(row.Temperature_C),
      humidityPct: parseNumber(row.Humidity_Pct),
      windSpeedKmh: parseNumber(row.Wind_Speed_kmh),
      precipitationMm: parseNumber(row.Precipitation_mm),
      rainProbabilityPct: parseNumber(row.Rain_Probability_Pct),
      soilMoisture: parseNumber(row.Soil_Moisture),
      sprayFavorable: parseBoolean(row.Spray_Favorable),
    };
  });

  return {
    records,
    issues: { missingColumns, invalidRowCount, totalRows: rawRows.length },
  };
}
