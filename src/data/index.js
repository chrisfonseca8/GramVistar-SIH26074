import { fetchCsv } from "@/data/loaders/fetchCsv";
import { fetchGeoJson } from "@/data/loaders/fetchGeoJson";
import {
  normalizeHistoricalBlockRows,
  normalizeHistoricalPanchayatRows,
} from "@/data/normalizers/historical";
import {
  normalizeForecastBlockRows,
  normalizeForecastPanchayatRows,
} from "@/data/normalizers/forecast";
import { normalizeSoilRows } from "@/data/normalizers/soil";
import { normalizeElevationRows } from "@/data/normalizers/elevation";
import {
  normalizeBorders,
  normalizeSelectedArea,
} from "@/data/normalizers/spatial";
import { computePanchayatCentroids } from "@/lib/downscaling/geometry";

export const DATA_PATHS = {
  historicalBlock: "/data/chas_10_year_monthly_historical.csv",
  historicalPanchayats: "/data/5_panchayats_10_year_monthly_historical.csv",
  forecastBlock: "/data/chas_block_agro_forecast.csv",
  forecastPanchayats: "/data/panchayat_expanded_agro_forecast.csv",
  soil: "/data/chas_panchayats_soil.csv",
  elevation: "/data/panchayats_elevation.csv",
  borders: "/data/chas_custom_borders.geojson",
  selectedArea: "/data/selected_area.geojson",
};

/**
 * Fetches, validates and normalizes every local data source into a single
 * shape ready to be stored in Zustand. This is the only place in the app
 * that should parse raw CSV/GeoJSON.
 *
 * @returns {Promise<{
 * historicalBlock: object[],
 * historicalPanchayats: object[],
 * forecastBlock: object[],
 * forecastPanchayats: object[],
 * soil: object[],
 * elevationPoints: object[],
 * elevationSummaryByPanchayat: Record<string, object>,
 * panchayatCentroids: Record<string, { longitude: number, latitude: number }>,
 * borders: GeoJSON.FeatureCollection,
 * selectedArea: GeoJSON.FeatureCollection,
 * panchayats: string[],
 * issues: Record<string, { missingColumns: string[], invalidRowCount: number, totalRows: number }>,
 * }>}
 */
export async function loadAllData() {
  const [
    historicalBlockRaw,
    historicalPanchayatsRaw,
    forecastBlockRaw,
    forecastPanchayatsRaw,
    soilRaw,
    elevationRaw,
    bordersRaw,
    selectedAreaRaw,
  ] = await Promise.all([
    fetchCsv(DATA_PATHS.historicalBlock),
    fetchCsv(DATA_PATHS.historicalPanchayats),
    fetchCsv(DATA_PATHS.forecastBlock),
    fetchCsv(DATA_PATHS.forecastPanchayats),
    fetchCsv(DATA_PATHS.soil),
    fetchCsv(DATA_PATHS.elevation),
    fetchGeoJson(DATA_PATHS.borders),
    fetchGeoJson(DATA_PATHS.selectedArea),
  ]);

  const historicalBlock = normalizeHistoricalBlockRows(historicalBlockRaw);
  const historicalPanchayats = normalizeHistoricalPanchayatRows(
    historicalPanchayatsRaw,
  );
  const forecastBlock = normalizeForecastBlockRows(forecastBlockRaw);
  const forecastPanchayats = normalizeForecastPanchayatRows(
    forecastPanchayatsRaw,
  );
  const soil = normalizeSoilRows(soilRaw);
  const elevation = normalizeElevationRows(elevationRaw);
  const borders = normalizeBorders(bordersRaw);
  const selectedArea = normalizeSelectedArea(selectedAreaRaw);

  return {
    historicalBlock: historicalBlock.records,
    historicalPanchayats: historicalPanchayats.records,
    forecastBlock: forecastBlock.records,
    forecastPanchayats: forecastPanchayats.records,
    soil: soil.records,
    elevationPoints: elevation.points,
    elevationSummaryByPanchayat: elevation.summaryByPanchayat,
    panchayatCentroids: computePanchayatCentroids(elevation.points),
    borders: borders.featureCollection,
    selectedArea: selectedArea.featureCollection,
    panchayats: borders.panchayatNames,
    issues: {
      historicalBlock: historicalBlock.issues,
      historicalPanchayats: historicalPanchayats.issues,
      forecastBlock: forecastBlock.issues,
      forecastPanchayats: forecastPanchayats.issues,
      soil: soil.issues,
      elevation: elevation.issues,
    },
  };
}
