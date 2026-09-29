import { describe, expect, it } from "vitest";
import { computeSpi, computeSpei } from "@/lib/calculations/spi";

describe("computeSpi", () => {
  it("returns 0 when the current value equals the historical mean", () => {
    const result = computeSpi([10, 20, 30], 20);
    expect(result.available).toBe(true);
    expect(result.value).toBeCloseTo(0);
  });

  it("returns a positive z-score for a wetter-than-average value", () => {
    const result = computeSpi([10, 20, 30], 40);
    expect(result.value).toBeGreaterThan(0);
  });

  it("returns a negative z-score for a drier-than-average value", () => {
    const result = computeSpi([10, 20, 30], 0);
    expect(result.value).toBeLessThan(0);
  });

  it("is symmetric around the mean", () => {
    const above = computeSpi([10, 20, 30], 40);
    const below = computeSpi([10, 20, 30], 0);
    expect(above.value).toBeCloseTo(-below.value);
  });

  it("reports unavailable for a series shorter than 2 values", () => {
    expect(computeSpi([10], 10).available).toBe(false);
    expect(computeSpi([], 10).available).toBe(false);
  });

  it("reports unavailable for a zero-variance series", () => {
    expect(computeSpi([10, 10, 10], 10).available).toBe(false);
  });

  it("reports unavailable for a missing current value", () => {
    expect(computeSpi([10, 20, 30], null).available).toBe(false);
  });
});

describe("computeSpei", () => {
  it("standardizes a water-balance series the same way as SPI standardizes precipitation", () => {
    const result = computeSpei([-5, 0, 5], 0);
    expect(result.available).toBe(true);
    expect(result.value).toBeCloseTo(0);
  });
});
