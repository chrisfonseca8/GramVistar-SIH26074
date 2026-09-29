import { describe, expect, it } from "vitest";
import { adjustRainfallForElevation } from "@/lib/downscaling/rainfall";

describe("adjustRainfallForElevation", () => {
  it("enhances rainfall for a panchayat higher than the block", () => {
    const result = adjustRainfallForElevation({
      precipitationBlockMm: 10,
      elevationBlockM: 200,
      elevationPanchayatM: 1200,
    });
    expect(result.available).toBe(true);
    expect(result.value).toBeGreaterThan(10);
  });

  it("reduces rainfall for a panchayat lower than the block", () => {
    const result = adjustRainfallForElevation({
      precipitationBlockMm: 10,
      elevationBlockM: 1200,
      elevationPanchayatM: 200,
    });
    expect(result.value).toBeLessThan(10);
  });

  it("leaves rainfall unchanged when elevations are equal", () => {
    const result = adjustRainfallForElevation({
      precipitationBlockMm: 10,
      elevationBlockM: 200,
      elevationPanchayatM: 200,
    });
    expect(result.value).toBe(10);
  });

  it("never returns negative rainfall even with a large negative elevation difference", () => {
    const result = adjustRainfallForElevation({
      precipitationBlockMm: 5,
      elevationBlockM: 5000,
      elevationPanchayatM: 0,
      orographicFactorPerKm: 1,
    });
    expect(result.value).toBeGreaterThanOrEqual(0);
  });

  it("respects a custom orographic factor", () => {
    const weak = adjustRainfallForElevation({ precipitationBlockMm: 10, elevationBlockM: 0, elevationPanchayatM: 1000, orographicFactorPerKm: 0.1 });
    const strong = adjustRainfallForElevation({ precipitationBlockMm: 10, elevationBlockM: 0, elevationPanchayatM: 1000, orographicFactorPerKm: 0.5 });
    expect(strong.value).toBeGreaterThan(weak.value);
  });

  it("reports unavailable when a required input is missing", () => {
    expect(adjustRainfallForElevation({ precipitationBlockMm: null, elevationBlockM: 200, elevationPanchayatM: 300 }).available).toBe(false);
  });
});
