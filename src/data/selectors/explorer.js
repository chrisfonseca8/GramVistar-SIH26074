import {
  selectHistoricalPanchayat,
  selectForecastPanchayat,
} from "@/data/selectors";
import { selectDailyCloudCoverGrid } from "@/data/selectors/climateAggregates";
import { estimateCloudCoverFromTemperatureRange } from "@/lib/calculations/cloudCover";
import { getVariableMeta } from "@/data/variableMetadata";

/**
 * The 8 variables named for the Explorer, and which raw field
 * (if any) each maps to per source. `null` means genuinely unavailable for
 * that source — e.g. historical data has no Humidity/Wind columns at all,
 * and hourly forecast has no separate daily Temp Max/Min.
 */
export const EXPLORER_VARIABLES = [
  { label: "Temp Max", historicalField: "tempMaxC", forecastField: null },
  { label: "Temp Min", historicalField: "tempMinC", forecastField: null },
  {
    label: "Temp Avg",
    historicalField: "tempAvgC",
    forecastField: "temperatureC",
  },
  {
    label: "Rain",
    historicalField: "precipitationTotalMm",
    forecastField: "precipitationMm",
  },
  {
    label: "Soil Moisture",
    historicalField: "soilMoistureAvg",
    forecastField: "soilMoisture",
  },
  { label: "Humidity", historicalField: null, forecastField: "humidityPct" },
  {
    label: "Cloud",
    historicalField: "__cloud_estimate__",
    forecastField: "__cloud_estimate__",
  },
  { label: "Wind", historicalField: null, forecastField: "windSpeedKmh" },
];

function selectCloudSeries(data, source, panchayat) {
  if (source === "historical") {
    const records = selectHistoricalPanchayat(data, panchayat);
    return {
      available: true,
      dates: records.map((r) => r.date),
      values: records.map((r) => {
        const result = estimateCloudCoverFromTemperatureRange({
          tempMaxC: r.tempMaxC,
          tempMinC: r.tempMinC,
        });
        return result.available ? result.value : null;
      }),
      unit: "% (estimate)",
    };
  }

  const { panchayats, days, grid } = selectDailyCloudCoverGrid(data);
  const index = panchayats.indexOf(panchayat);
  if (index === -1)
    return {
      available: false,
      reason: "no data for this panchayat",
      dates: [],
      values: [],
      unit: "",
    };

  return {
    available: true,
    dates: days.map((d) => new Date(`${d}T00:00:00Z`)),
    values: grid[index],
    unit: "% (estimate)",
    note: "Daily, not hourly — cloud cover is estimated from each day's temperature range.",
  };
}

/**
 * A single variable's time series for one panchayat and one source
 * (historical or forecast), in the shared shape the Explorer's charts need.
 * @param {object|null} data
 * @param {{ source: "historical"|"forecast", panchayat: string, variableLabel: string }} params
 * @returns {{ available: boolean, reason?: string, dates: Date[], values: (number|null)[], unit: string, note?: string }}
 */
export function selectExplorerSeries(
  data,
  { source, panchayat, variableLabel },
) {
  const variable = EXPLORER_VARIABLES.find((v) => v.label === variableLabel);
  if (!variable)
    return {
      available: false,
      reason: "unknown variable",
      dates: [],
      values: [],
      unit: "",
    };

  if (variable.historicalField === "__cloud_estimate__") {
    return selectCloudSeries(data, source, panchayat);
  }

  const field =
    source === "historical" ? variable.historicalField : variable.forecastField;
  if (!field) {
    return {
      available: false,
      reason: `${variableLabel} is not available in the ${source} data source`,
      dates: [],
      values: [],
      unit: "",
    };
  }

  const records =
    source === "historical"
      ? selectHistoricalPanchayat(data, panchayat)
      : selectForecastPanchayat(data, panchayat);
  return {
    available: true,
    dates: records.map((r) => r.date),
    values: records.map((r) => r[field] ?? null),
    unit: getVariableMeta(field)?.unit ?? "",
  };
}

/**
 * The selected forecast variable across every hour, for every panchayat at
 * once — the shape the spatial animation panel needs.
 * @param {object|null} data
 * @param {string} variableLabel
 * @returns {{ available: boolean, reason?: string, dates: Date[], panchayats: string[], grid: (number|null)[][], unit: string }}
 */
export function selectExplorerGridAllPanchayats(data, variableLabel) {
  const panchayats = data?.panchayats ?? [];
  const series = panchayats.map((panchayat) =>
    selectExplorerSeries(data, {
      source: "forecast",
      panchayat,
      variableLabel,
    }),
  );

  if (series.length === 0 || !series[0].available) {
    return {
      available: false,
      reason: series[0]?.reason ?? "no data",
      dates: [],
      panchayats,
      grid: [],
      unit: "",
    };
  }

  return {
    available: true,
    dates: series[0].dates,
    panchayats,
    grid: series.map((s) => s.values),
    unit: series[0].unit,
  };
}
