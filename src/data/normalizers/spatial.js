/**
 * Passes the panchayat border GeoJSON through and extracts the panchayat
 * name list from feature properties (the canonical source of "which
 * panchayats exist" for the rest of the app).
 *
 * @param {GeoJSON.FeatureCollection} featureCollection
 * @returns {{ featureCollection: GeoJSON.FeatureCollection, panchayatNames: string[] }}
 */
export function normalizeBorders(featureCollection) {
  const panchayatNames = featureCollection.features
    .map((feature) => feature.properties?.panchayat_name)
    .filter((name) => typeof name === "string" && name.length > 0);

  return { featureCollection, panchayatNames };
}

/**
 * @param {GeoJSON.FeatureCollection} featureCollection
 * @returns {{ featureCollection: GeoJSON.FeatureCollection }}
 */
export function normalizeSelectedArea(featureCollection) {
  return { featureCollection };
}
