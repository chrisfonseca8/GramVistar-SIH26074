import { isFiniteNumber } from "@/lib/calculations/result";

/**
 * Bins a point cloud (e.g. the 56,430-point elevation grid) into a dense
 * `gridSize × gridSize` raster of mean values — used both to render a
 * manageable number of map cells (instead of 56k individual shapes) and
 * to produce the x/y/z arrays Plotly's `Contour`/`Heatmap` traces need.
 *
 * @param {{ longitude: number|null, latitude: number|null, [key: string]: unknown }[]} points
 * @param {{ gridSize?: number, valueField?: string }} [options]
 * @returns {{
 * lonCenters: number[],
 * latCenters: number[],
 * grid: (number|null)[][],
 * cellWidthLon: number,
 * cellHeightLat: number,
 * bounds: { lonMin: number, lonMax: number, latMin: number, latMax: number } | null,
 * }}
 */
export function binPointsToGrid(
  points,
  { gridSize = 30, valueField = "elevationM" } = {},
) {
  const valid = points.filter(
    (p) =>
      isFiniteNumber(p.longitude) &&
      isFiniteNumber(p.latitude) &&
      isFiniteNumber(p[valueField]),
  );

  if (valid.length === 0) {
    return {
      lonCenters: [],
      latCenters: [],
      grid: [],
      cellWidthLon: 0,
      cellHeightLat: 0,
      bounds: null,
    };
  }

  const lons = valid.map((p) => p.longitude);
  const lats = valid.map((p) => p.latitude);
  const lonMin = Math.min(...lons);
  const lonMax = Math.max(...lons);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);

  const cellWidthLon = (lonMax - lonMin) / gridSize || 1;
  const cellHeightLat = (latMax - latMin) / gridSize || 1;

  const sums = Array.from({ length: gridSize }, () =>
    new Array(gridSize).fill(0),
  );
  const counts = Array.from({ length: gridSize }, () =>
    new Array(gridSize).fill(0),
  );

  for (const point of valid) {
    const i = Math.min(
      gridSize - 1,
      Math.floor((point.longitude - lonMin) / cellWidthLon),
    );
    const j = Math.min(
      gridSize - 1,
      Math.floor((point.latitude - latMin) / cellHeightLat),
    );
    sums[j][i] += point[valueField];
    counts[j][i] += 1;
  }

  const grid = sums.map((row, j) =>
    row.map((sum, i) => (counts[j][i] > 0 ? sum / counts[j][i] : null)),
  );

  const lonCenters = Array.from(
    { length: gridSize },
    (_, i) => lonMin + (i + 0.5) * cellWidthLon,
  );
  const latCenters = Array.from(
    { length: gridSize },
    (_, j) => latMin + (j + 0.5) * cellHeightLat,
  );

  return {
    lonCenters,
    latCenters,
    grid,
    cellWidthLon,
    cellHeightLat,
    bounds: { lonMin, lonMax, latMin, latMax },
  };
}

/** @param {(number|null)[][]} grid @returns {{ min: number, max: number } | null} */
export function computeGridRange(grid) {
  let min = Infinity;
  let max = -Infinity;
  for (const row of grid) {
    for (const value of row) {
      if (isFiniteNumber(value)) {
        if (value < min) min = value;
        if (value > max) max = value;
      }
    }
  }
  return Number.isFinite(min) ? { min, max } : null;
}
