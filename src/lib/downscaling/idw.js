import {
  available,
  unavailable,
  isFiniteNumber,
} from "@/lib/calculations/result";
import { haversineDistanceKm } from "@/lib/downscaling/geometry";

const COINCIDENT_DISTANCE_KM = 1e-6;

/**
 * Inverse Distance Weighting spatial interpolation: estimates a value at
 * `target` from a set of known points, weighting each known point by
 * `1 / distance^power`. Used to spread discrete
 * panchayat-level values (e.g. downscaled temperature at each of the 5
 * panchayat centroids) into a continuous field for spatial/contour views.
 *
 * @param {{ longitude: number, latitude: number }} target
 * @param {{ longitude: number, latitude: number, value: number|null }[]} knownPoints
 * @param {{ power?: number }} [options]
 * @returns {import("@/lib/calculations/result").CalcResult}
 */
export function interpolateIdw(target, knownPoints, { power = 2 } = {}) {
  if (!isFiniteNumber(target?.longitude) || !isFiniteNumber(target?.latitude)) {
    return unavailable("interpolated", "missing target coordinates");
  }
  if (!isFiniteNumber(power) || power <= 0) {
    return unavailable("interpolated", "power must be a positive number");
  }

  const valid = knownPoints.filter(
    (p) =>
      isFiniteNumber(p.longitude) &&
      isFiniteNumber(p.latitude) &&
      isFiniteNumber(p.value),
  );
  if (valid.length === 0)
    return unavailable("interpolated", "no known points with a valid value");

  // If the target coincides with a known point, return it exactly rather
  // than dividing by a near-zero distance.
  for (const point of valid) {
    if (haversineDistanceKm(target, point) < COINCIDENT_DISTANCE_KM) {
      return available(point.value, "interpolated");
    }
  }

  let weightedSum = 0;
  let weightTotal = 0;
  for (const point of valid) {
    const distanceKm = haversineDistanceKm(target, point);
    const weight = 1 / distanceKm ** power;
    weightedSum += weight * point.value;
    weightTotal += weight;
  }

  return available(weightedSum / weightTotal, "interpolated");
}
