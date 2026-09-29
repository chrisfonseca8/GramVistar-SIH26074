/**
 * The data dictionary: every variable the app knows about —
 * raw fields from `/data`, derived calculations (`src/lib/calculations/`),
 * and downscaled outputs (`src/lib/downscaling/`) — documented once, in
 * one place, so labels/units/provenance stay consistent everywhere they're
 * shown instead of being re-typed ad hoc in each component.
 *
 * `provenance` distinguishes: `observed` (a real measurement
 * or static survey), `forecast` (a forecast value, not a measurement,
 * even where the source file doesn't say so explicitly), `derived`
 * (computed by `src/lib/calculations/`), or `downscaled` (computed by
 * `src/lib/downscaling/`).
 *
 * @typedef {{
 * key: string,
 * label: string,
 * unit: string,
 * description: string,
 * provenance: "observed"| "forecast"| "derived"| "downscaled",
 * source: string,
 * }} VariableMeta
 */

/** @type {VariableMeta[]} */
export const HISTORICAL_VARIABLES = [
  {
    key: "tempMaxC",
    label: "Max Temperature",
    unit: "°C",
    description: "Monthly maximum air temperature.",
    provenance: "observed",
    source:
      "chas_10_year_monthly_historical.csv / 5_panchayats_10_year_monthly_historical.csv",
  },
  {
    key: "tempMinC",
    label: "Min Temperature",
    unit: "°C",
    description: "Monthly minimum air temperature.",
    provenance: "observed",
    source:
      "chas_10_year_monthly_historical.csv / 5_panchayats_10_year_monthly_historical.csv",
  },
  {
    key: "tempAvgC",
    label: "Avg Temperature",
    unit: "°C",
    description: "Monthly average air temperature.",
    provenance: "observed",
    source:
      "chas_10_year_monthly_historical.csv / 5_panchayats_10_year_monthly_historical.csv",
  },
  {
    key: "precipitationTotalMm",
    label: "Total Precipitation",
    unit: "mm",
    description: "Total monthly precipitation.",
    provenance: "observed",
    source:
      "chas_10_year_monthly_historical.csv / 5_panchayats_10_year_monthly_historical.csv",
  },
  {
    key: "soilMoistureAvg",
    label: "Avg Soil Moisture",
    unit: "m³/m³",
    description: "Monthly average volumetric soil moisture.",
    provenance: "observed",
    source:
      "chas_10_year_monthly_historical.csv / 5_panchayats_10_year_monthly_historical.csv",
  },
];

/** @type {VariableMeta[]} */
export const FORECAST_VARIABLES = [
  {
    key: "temperatureC",
    label: "Temperature",
    unit: "°C",
    description: "Hourly forecast air temperature.",
    provenance: "forecast",
    source:
      "chas_block_agro_forecast.csv / panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "precipitationMm",
    label: "Precipitation",
    unit: "mm",
    description: "Hourly forecast precipitation.",
    provenance: "forecast",
    source:
      "chas_block_agro_forecast.csv / panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "soilMoisture",
    label: "Soil Moisture",
    unit: "m³/m³",
    description: "Hourly forecast volumetric soil moisture.",
    provenance: "forecast",
    source:
      "chas_block_agro_forecast.csv / panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "humidityPct",
    label: "Humidity",
    unit: "%",
    description:
      "Hourly forecast relative humidity. Panchayat forecast only — not in the block forecast.",
    provenance: "forecast",
    source: "panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "windSpeedKmh",
    label: "Wind Speed",
    unit: "km/h",
    description: "Hourly forecast wind speed. Panchayat forecast only.",
    provenance: "forecast",
    source: "panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "rainProbabilityPct",
    label: "Rain Probability",
    unit: "%",
    description:
      "Hourly forecast probability of rain. Panchayat forecast only.",
    provenance: "forecast",
    source: "panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "soilDeficit",
    label: "Soil Moisture Deficit",
    unit: "m³/m³",
    description:
      "Hourly forecast soil moisture deficit, provided directly by the source. Panchayat forecast only.",
    provenance: "forecast",
    source: "panchayat_expanded_agro_forecast.csv",
  },
  {
    key: "sprayFavorable",
    label: "Spray Favorable",
    unit: "boolean",
    description:
      "Hourly forecast flag for spray-favorable conditions, provided directly by the source. Panchayat forecast only.",
    provenance: "forecast",
    source: "panchayat_expanded_agro_forecast.csv",
  },
];

/** @type {VariableMeta[]} */
export const SOIL_VARIABLES = [
  {
    key: "soilType",
    label: "Soil Type",
    unit: "text",
    description: "Textural soil classification.",
    provenance: "observed",
    source: "chas_panchayats_soil.csv",
  },
  {
    key: "clayPct",
    label: "Clay",
    unit: "%",
    description: "Clay content by weight.",
    provenance: "observed",
    source: "chas_panchayats_soil.csv",
  },
  {
    key: "siltPct",
    label: "Silt",
    unit: "%",
    description: "Silt content by weight.",
    provenance: "observed",
    source: "chas_panchayats_soil.csv",
  },
  {
    key: "sandPct",
    label: "Sand",
    unit: "%",
    description: "Sand content by weight.",
    provenance: "observed",
    source: "chas_panchayats_soil.csv",
  },
  {
    key: "soilPh",
    label: "Soil pH",
    unit: "pH",
    description: "Soil acidity/alkalinity.",
    provenance: "observed",
    source: "chas_panchayats_soil.csv",
  },
  {
    key: "soilWaterCapacityMmPerM",
    label: "Available Water Capacity",
    unit: "mm/m",
    description: "Available water capacity per metre of soil depth.",
    provenance: "observed",
    source: "chas_panchayats_soil.csv",
  },
];

/** @type {VariableMeta[]} */
export const SPATIAL_VARIABLES = [
  {
    key: "elevationM",
    label: "Elevation",
    unit: "m",
    description: "DEM-derived elevation at a sampled point.",
    provenance: "observed",
    source: "panchayats_elevation.csv (derived from n23_e086_1arc_v3.tif)",
  },
];

/** @type {VariableMeta[]} */
export const DERIVED_VARIABLES = [
  {
    key: "humidityFromDewPoint",
    label: "Relative Humidity (est.)",
    unit: "%",
    description:
      "Estimated from dew point via Magnus-Tetens. No dew point source exists in /data, so currently unreachable — see src/lib/calculations/humidity.js.",
    provenance: "derived",
    source: "src/lib/calculations/humidity.js",
  },
  {
    key: "cloudCoverEstimate",
    label: "Cloud Cover (est.)",
    unit: "% (estimate)",
    description: "Diurnal-temperature-range heuristic, not a real observation.",
    provenance: "derived",
    source: "src/lib/calculations/cloudCover.js",
  },
  {
    key: "windDirection",
    label: "Wind Direction",
    unit: "compass degrees",
    description: "No source or derivable basis in /data — always unavailable.",
    provenance: "derived",
    source: "src/lib/calculations/windSpeed.js",
  },
  {
    key: "et0MmPerDay",
    label: "Reference Evapotranspiration (ET0)",
    unit: "mm/day",
    description:
      "Hargreaves-Samani equation from Tmax/Tmin/Tavg + latitude/day-of-year.",
    provenance: "derived",
    source: "src/lib/calculations/et0Hargreaves.js",
  },
  {
    key: "gddCDay",
    label: "Growing Degree Days",
    unit: "°C·day",
    description: "Average method, capped/floored at crop thresholds.",
    provenance: "derived",
    source: "src/lib/calculations/gdd.js",
  },
  {
    key: "spi",
    label: "SPI (simplified)",
    unit: "σ (standardized)",
    description:
      "z-score of precipitation against its own historical series — a simplified proxy, not the WMO Gamma-fitted SPI.",
    provenance: "derived",
    source: "src/lib/calculations/spi.js",
  },
  {
    key: "spei",
    label: "SPEI (simplified)",
    unit: "σ (standardized)",
    description:
      "Same method as SPI, over a precipitation-minus-ET0 water balance series.",
    provenance: "derived",
    source: "src/lib/calculations/spi.js",
  },
  {
    key: "soilMoistureDeficit",
    label: "Soil Moisture Deficit",
    unit: "m³/m³",
    description: "Field capacity minus current soil moisture.",
    provenance: "derived",
    source: "src/lib/calculations/soilMoistureDeficit.js",
  },
  {
    key: "heatIndexC",
    label: "Heat Index",
    unit: "°C",
    description: "NOAA Rothfusz apparent-temperature regression.",
    provenance: "derived",
    source: "src/lib/calculations/heatIndex.js",
  },
  {
    key: "frostRiskLevel",
    label: "Frost Risk",
    unit: "risk level",
    description:
      "none/watch/warning from Tmin against configurable thresholds.",
    provenance: "derived",
    source: "src/lib/calculations/frostRisk.js",
  },
  {
    key: "sprayWindowFavorable",
    label: "Spray Window",
    unit: "favorable/reasons",
    description: "Wind/rain/temperature threshold check.",
    provenance: "derived",
    source: "src/lib/calculations/sprayWindow.js",
  },
  {
    key: "irrigationWindowRecommended",
    label: "Irrigation Window",
    unit: "irrigate/reasons",
    description: "Soil deficit vs. rain-likelihood threshold check.",
    provenance: "derived",
    source: "src/lib/calculations/irrigationWindow.js",
  },
  {
    key: "rainfallExceedanceProbabilityPct",
    label: "Rainfall Exceedance Probability",
    unit: "%",
    description:
      "Empirical probability that historical precipitation exceeds a threshold.",
    provenance: "derived",
    source: "src/lib/calculations/rainfallExceedance.js",
  },
  {
    key: "panchayatVulnerabilityIndex",
    label: "Panchayat Vulnerability Index",
    unit: "index (0-1, relative)",
    description:
      "Climate/soil exposure proxy only — excludes population/livelihoods, which don't exist in /data.",
    provenance: "derived",
    source: "src/lib/calculations/vulnerabilityIndex.js",
  },
];

/** @type {VariableMeta[]} */
export const DOWNSCALED_VARIABLES = [
  {
    key: "downscaledTemperatureC",
    label: "Downscaled Temperature",
    unit: "°C",
    description:
      "Block forecast temperature corrected for a panchayat's elevation.",
    provenance: "downscaled",
    source: "src/lib/downscaling/temperature.js",
  },
  {
    key: "downscaledRainfallMm",
    label: "Downscaled Rainfall",
    unit: "mm",
    description:
      "Block forecast rainfall adjusted for a panchayat's elevation (orographic effect).",
    provenance: "downscaled",
    source: "src/lib/downscaling/rainfall.js",
  },
  {
    key: "downscaledSoilMoisture",
    label: "Downscaled Soil Moisture",
    unit: "m³/m³",
    description:
      "Water-balance adjustment from rainfall, ET0 and soil water capacity.",
    provenance: "downscaled",
    source: "src/lib/downscaling/soilMoisture.js",
  },
];

/** All variables in one flat array, for building a lookup or a full dictionary view. */
export const ALL_VARIABLES = [
  ...HISTORICAL_VARIABLES,
  ...FORECAST_VARIABLES,
  ...SOIL_VARIABLES,
  ...SPATIAL_VARIABLES,
  ...DERIVED_VARIABLES,
  ...DOWNSCALED_VARIABLES,
];

/** @type {Record<string, VariableMeta>} keyed by `key`; later duplicates win (historical/forecast share some field names on purpose). */
export const VARIABLE_METADATA_BY_KEY = Object.fromEntries(
  ALL_VARIABLES.map((v) => [v.key, v]),
);

/**
 * @param {string} key
 * @returns {VariableMeta|undefined}
 */
export function getVariableMeta(key) {
  return VARIABLE_METADATA_BY_KEY[key];
}
