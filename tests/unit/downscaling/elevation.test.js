import { describe, expect, it } from "vitest";
import { computeBlockElevation } from "@/lib/downscaling/elevation";

describe("computeBlockElevation", () => {
  it("computes the point-count-weighted mean across panchayats", () => {
    const result = computeBlockElevation({
      A: { meanElevationM: 100, pointCount: 3 },
      B: { meanElevationM: 200, pointCount: 1 },
    });
    // (100*3 + 200*1) / 4 = 125
    expect(result).toEqual({ value: 125, unit: "m", available: true });
  });

  it("weights larger panchayats (more points) more heavily", () => {
    const result = computeBlockElevation({
      A: { meanElevationM: 100, pointCount: 1000 },
      B: { meanElevationM: 300, pointCount: 1 },
    });
    expect(result.value).toBeCloseTo(100, 0);
  });

  it("reports unavailable for an empty summary", () => {
    expect(computeBlockElevation({}).available).toBe(false);
  });

  it("skips entries with missing/zero point counts", () => {
    const result = computeBlockElevation({
      A: { meanElevationM: 100, pointCount: 0 },
      B: { meanElevationM: 200, pointCount: 5 },
    });
    expect(result.value).toBe(200);
  });
});
