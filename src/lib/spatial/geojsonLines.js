/**
 * Flattens a GeoJSON FeatureCollection of Polygon/MultiPolygon features
 * into flat x/y coordinate arrays for a Plotly `scatter` line trace, with
 * `null` inserted between rings so Plotly breaks the line instead of
 * connecting unrelated polygon edges.
 * @param {GeoJSON.FeatureCollection|undefined} featureCollection
 * @returns {{ x: (number|null)[], y: (number|null)[] }}
 */
export function geoJsonPolygonsToLines(featureCollection) {
  const x = [];
  const y = [];

  for (const feature of featureCollection?.features ?? []) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    const rings =
      geometry.type === "Polygon"
        ? geometry.coordinates
        : geometry.type === "MultiPolygon"
          ? geometry.coordinates.flat()
          : [];

    for (const ring of rings) {
      for (const [lon, lat] of ring) {
        x.push(lon);
        y.push(lat);
      }
      x.push(null);
      y.push(null);
    }
  }

  return { x, y };
}
