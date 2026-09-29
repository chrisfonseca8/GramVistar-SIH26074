import { describe, expect, it } from "vitest";
import { interpolateIdw } from "@/lib/downscaling/idw";

describe("interpolateIdw", () => {
  it("returns the exact value when the target coincides with a known point", () => {
    const result = interpolateIdw(
      { longitude: 86.2, latitude: 23.7 },
      [{ longitude: 86.2, latitude: 23.7, value: 42 }],
    );
    expect(result).toEqual({ value: 42, unit: "interpolated", available: true });
  });

  it("weights closer points more heavily", () => {
    const target = { longitude: 86.2, latitude: 23.7 };
    const near = { longitude: 86.21, latitude: 23.71, value: 10 };
    const far = { longitude: 87.5, latitude: 25.0, value: 100 };
    const result = interpolateIdw(target, [near, far]);
    expect(result.available).toBe(true);
    // Much closer to `near`'s value than the midpoint (55) would suggest
    expect(result.value).toBeLessThan(55);
  });

  it("returns the exact value with a single known point (no other point to weight against)", () => {
    const result = interpolateIdw(
      { longitude: 86.5, latitude: 24.0 },
      [{ longitude: 86.2, latitude: 23.7, value: 42 }],
    );
    expect(result.value).toBeCloseTo(42);
  });

  it("produces a value between the min and max of the known points for points strictly between them", () => {
    const target = { longitude: 86.3, latitude: 23.7 };
    const a = { longitude: 86.2, latitude: 23.7, value: 10 };
    const b = { longitude: 86.4, latitude: 23.7, value: 30 };
    const result = interpolateIdw(target, [a, b]);
    expect(result.value).toBeGreaterThan(10);
    expect(result.value).toBeLessThan(30);
  });

  it("ignores known points with a null value", () => {
    const result = interpolateIdw(
      { longitude: 86.3, latitude: 23.7 },
      [
        { longitude: 86.2, latitude: 23.7, value: null },
        { longitude: 86.4, latitude: 23.7, value: 20 },
      ],
    );
    expect(result.value).toBeCloseTo(20);
  });

  it("reports unavailable when there are no known points with a valid value", () => {
    const result = interpolateIdw({ longitude: 86.3, latitude: 23.7 }, [
      { longitude: 86.2, latitude: 23.7, value: null },
    ]);
    expect(result.available).toBe(false);
  });

  it("reports unavailable when target coordinates are missing", () => {
    const result = interpolateIdw({ longitude: null, latitude: 23.7 }, [
      { longitude: 86.2, latitude: 23.7, value: 10 },
    ]);
    expect(result.available).toBe(false);
  });
});
