const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two WGS84 lon/lat points (haversine
 * formula) — matches the coordinate system our GeoJSON/elevation data uses.
 * @param {{ longitude: number, latitude: number }} a
 * @param {{ longitude: number, latitude: number }} b
 * @returns {number} kilometers
 */
export function haversineDistanceKm(a, b) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Arithmetic mean centroid of a set of lon/lat points — an approximation
 * (not a true polygon centroid), adequate for our small, roughly
 * rectangular panchayat boundaries and for averaging a dense elevation
 * point grid down to one representative location per panchayat.
 * @param {{ longitude: number, latitude: number }[]} points
 * @returns {{ longitude: number, latitude: number } | null}
 */
export function computeCentroid(points) {
  if (points.length === 0) return null;
  const sum = points.reduce(
    (acc, p) => ({
      longitude: acc.longitude + p.longitude,
      latitude: acc.latitude + p.latitude,
    }),
    { longitude: 0, latitude: 0 },
  );
  return {
    longitude: sum.longitude / points.length,
    latitude: sum.latitude / points.length,
  };
}

/**
 * Groups a set of `{ panchayat, longitude, latitude }` points (e.g. the
 * normalized elevation grid) by panchayat and computes each one's centroid.
 * @param {{ panchayat: string|null, longitude: number|null, latitude: number|null }[]} points
 * @returns {Record<string, { longitude: number, latitude: number }>}
 */
export function computePanchayatCentroids(points) {
  const byPanchayat = new Map();
  for (const point of points) {
    if (!point.panchayat || !isFinitePoint(point)) continue;
    if (!byPanchayat.has(point.panchayat)) byPanchayat.set(point.panchayat, []);
    byPanchayat.get(point.panchayat).push(point);
  }

  const centroids = {};
  for (const [panchayat, panchayatPoints] of byPanchayat.entries()) {
    centroids[panchayat] = computeCentroid(panchayatPoints);
  }
  return centroids;
}

function isFinitePoint(p) {
  return typeof p.longitude === "number" && typeof p.latitude === "number";
}
