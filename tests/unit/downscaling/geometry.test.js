import { describe, expect, it } from "vitest";
import { computeCentroid, computePanchayatCentroids, haversineDistanceKm } from "@/lib/downscaling/geometry";

describe("haversineDistanceKm", () => {
  it("returns 0 for identical points", () => {
    const p = { longitude: 86.22, latitude: 23.67 };
    expect(haversineDistanceKm(p, p)).toBeCloseTo(0);
  });

  it("is symmetric", () => {
    const a = { longitude: 86.22, latitude: 23.67 };
    const b = { longitude: 86.26, latitude: 23.71 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a));
  });

  it("gives a plausible distance for ~0.05° apart near the equator/tropics", () => {
    // At this latitude, ~0.01° latitude ≈ 1.1km
    const a = { longitude: 86.0, latitude: 23.65 };
    const b = { longitude: 86.0, latitude: 23.66 };
    const distance = haversineDistanceKm(a, b);
    expect(distance).toBeGreaterThan(0.5);
    expect(distance).toBeLessThan(2);
  });
});

describe("computeCentroid", () => {
  it("averages a set of points", () => {
    const centroid = computeCentroid([
      { longitude: 86.0, latitude: 23.0 },
      { longitude: 87.0, latitude: 24.0 },
    ]);
    expect(centroid).toEqual({ longitude: 86.5, latitude: 23.5 });
  });

  it("returns null for an empty set", () => {
    expect(computeCentroid([])).toBeNull();
  });
});

describe("computePanchayatCentroids", () => {
  it("groups points by panchayat and centroids each group", () => {
    const centroids = computePanchayatCentroids([
      { panchayat: "Alkusha", longitude: 86.0, latitude: 23.0 },
      { panchayat: "Alkusha", longitude: 86.2, latitude: 23.2 },
      { panchayat: "Kura", longitude: 87.0, latitude: 24.0 },
    ]);
    expect(centroids.Alkusha).toEqual({ longitude: 86.1, latitude: 23.1 });
    expect(centroids.Kura).toEqual({ longitude: 87.0, latitude: 24.0 });
  });

  it("skips points with a missing panchayat or coordinates", () => {
    const centroids = computePanchayatCentroids([
      { panchayat: null, longitude: 86.0, latitude: 23.0 },
      { panchayat: "Kura", longitude: null, latitude: 24.0 },
    ]);
    expect(centroids).toEqual({});
  });
});
