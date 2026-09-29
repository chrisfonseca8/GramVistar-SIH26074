import { describe, expect, it } from "vitest";
import { computeRainfallExceedanceProbability } from "@/lib/calculations/rainfallExceedance";

describe("computeRainfallExceedanceProbability", () => {
  it("computes the empirical exceedance probability", () => {
    // 2 of 5 values exceed 20 -> 40%
    const result = computeRainfallExceedanceProbability([10, 15, 25, 30, 5], 20);
    expect(result.available).toBe(true);
    expect(result.value).toBeCloseTo(40);
  });

  it("returns 0% when nothing exceeds the threshold", () => {
    const result = computeRainfallExceedanceProbability([1, 2, 3], 100);
    expect(result.value).toBe(0);
  });

  it("returns 100% when everything exceeds the threshold", () => {
    const result = computeRainfallExceedanceProbability([50, 60, 70], 10);
    expect(result.value).toBe(100);
  });

  it("ignores non-finite values in the series", () => {
    const result = computeRainfallExceedanceProbability([10, NaN, 30, null, 40], 20);
    expect(result.available).toBe(true);
    // clean series [10, 30, 40]; 2 of 3 exceed 20
    expect(result.value).toBeCloseTo((2 / 3) * 100);
  });

  it("reports unavailable for an empty series", () => {
    expect(computeRainfallExceedanceProbability([], 20).available).toBe(false);
  });
});
