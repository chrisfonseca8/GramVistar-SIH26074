/**
 * Fetches and parses a GeoJSON file from `/public`.
 * @param {string} path e.g. "/data/chas_custom_borders.geojson"
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function fetchGeoJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${path}: ${response.status} ${response.statusText}`,
    );
  }
  const json = await response.json();
  if (json?.type !== "FeatureCollection" || !Array.isArray(json.features)) {
    throw new Error(`${path} is not a valid GeoJSON FeatureCollection`);
  }
  return json;
}
