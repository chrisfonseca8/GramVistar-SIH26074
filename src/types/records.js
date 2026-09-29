/**
 * Central JSDoc type definitions for the normalized record shapes
 * produced by `src/data/normalizers/*.js`. This file has no
 * runtime code — it exists purely for its JSDoc annotations.
 *
 * @typedef {"observed"|"forecast"|"derived"|"downscaled"} Provenance
 *
 * @typedef {Object} HistoricalRecord
 * @property {Provenance} provenance always "observed"
 * @property {string|null} block present on block-level records only
 * @property {string|null} panchayat present on panchayat-level records only
 * @property {string|null} monthKey "YYYY-MM"
 * @property {Date|null} date first-of-month UTC
 * @property {number|null} year
 * @property {number|null} month 1-12
 * @property {number|null} tempMaxC
 * @property {number|null} tempMinC
 * @property {number|null} tempAvgC
 * @property {number|null} precipitationTotalMm
 * @property {number|null} soilMoistureAvg m³/m³
 *
 * @typedef {Object} ForecastBlockRecord
 * @property {Provenance} provenance always "forecast"
 * @property {string|null} block
 * @property {string|null} timeKey "YYYY-MM-DD HH:MM:SS"
 * @property {Date|null} date
 * @property {string|null} iso
 * @property {number|null} temperatureC
 * @property {number|null} precipitationMm
 * @property {number|null} soilMoisture m³/m³
 *
 * @typedef {Object} ForecastPanchayatRecord
 * @property {Provenance} provenance always "forecast"
 * @property {string|null} panchayat
 * @property {string|null} timeKey
 * @property {Date|null} date
 * @property {string|null} iso
 * @property {number|null} temperatureC
 * @property {number|null} humidityPct
 * @property {number|null} windSpeedKmh
 * @property {number|null} precipitationMm
 * @property {number|null} rainProbabilityPct
 * @property {number|null} soilMoisture m³/m³
 * @property {number|null} soilDeficit m³/m³
 * @property {boolean|null} sprayFavorable
 *
 * @typedef {Object} SoilRecord
 * @property {Provenance} provenance always "observed"
 * @property {string|null} panchayat
 * @property {string|null} soilType
 * @property {number|null} clayPct
 * @property {number|null} siltPct
 * @property {number|null} sandPct
 * @property {number|null} soilPh
 * @property {number|null} soilWaterCapacityMmPerM
 *
 * @typedef {Object} ElevationPoint
 * @property {Provenance} provenance always "observed"
 * @property {string|null} panchayat
 * @property {number|null} longitude
 * @property {number|null} latitude
 * @property {number|null} elevationM
 *
 * @typedef {Object} ElevationSummary
 * @property {number} meanElevationM
 * @property {number} minElevationM
 * @property {number} maxElevationM
 * @property {number} pointCount
 *
 * @typedef {Object} NormalizedData return shape of `loadAllData()` (src/data/index.js)
 * @property {HistoricalRecord[]} historicalBlock
 * @property {HistoricalRecord[]} historicalPanchayats
 * @property {ForecastBlockRecord[]} forecastBlock
 * @property {ForecastPanchayatRecord[]} forecastPanchayats
 * @property {SoilRecord[]} soil
 * @property {ElevationPoint[]} elevationPoints
 * @property {Record<string, ElevationSummary>} elevationSummaryByPanchayat
 * @property {Record<string, { longitude: number, latitude: number }>} panchayatCentroids
 * @property {GeoJSON.FeatureCollection} borders
 * @property {GeoJSON.FeatureCollection} selectedArea
 * @property {string[]} panchayats
 * @property {Record<string, { missingColumns: string[], invalidRowCount: number, totalRows: number }>} issues
 */

export {};
