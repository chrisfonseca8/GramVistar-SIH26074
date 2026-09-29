import { describe, expect, it } from "vitest";
import { accumulateGdd, computeGdd } from "@/lib/calculations/gdd";

describe("computeGdd", () => {
  it("computes GDD with the average method", () => {
    // Tmax=30, Tmin=20, base=10 -> (30+20)/2 - 10 = 15
    const result = computeGdd({ tempMaxC: 30, tempMinC: 20, baseTempC: 10 });
    expect(result).toEqual({ value: 15, unit: "°C·day", available: true });
  });

  it("floors Tmin at the base temperature before averaging", () => {
    // Tmin=5 is below base=10, so it's floored to 10: (30+10)/2 - 10 = 10
    const result = computeGdd({ tempMaxC: 30, tempMinC: 5, baseTempC: 10 });
    expect(result.value).toBe(10);
  });

  it("caps Tmax at the upper threshold before averaging", () => {
    // Tmax=40 capped at upperTempC=30: (30+20)/2 - 10 = 15
    const result = computeGdd({ tempMaxC: 40, tempMinC: 20, baseTempC: 10, upperTempC: 30 });
    expect(result.value).toBe(15);
  });

  it("never returns a negative GDD", () => {
    const result = computeGdd({ tempMaxC: 8, tempMinC: 2, baseTempC: 10 });
    expect(result.value).toBe(0);
  });

  it("is deterministic", () => {
    const input = { tempMaxC: 33.31, tempMinC: 21.6, baseTempC: 10 };
    expect(computeGdd(input)).toEqual(computeGdd(input));
  });

  it("reports unavailable, not 0, when temperatures are missing", () => {
    const result = computeGdd({ tempMaxC: null, tempMinC: 20, baseTempC: 10 });
    expect(result.available).toBe(false);
    expect(result.value).toBeNull();
  });

  it("reports unavailable when baseTempC is missing", () => {
    const result = computeGdd({ tempMaxC: 30, tempMinC: 20, baseTempC: undefined });
    expect(result.available).toBe(false);
  });
});

describe("accumulateGdd", () => {
  it("sums available records and counts skipped ones separately", () => {
    const records = [
      { tempMaxC: 30, tempMinC: 20 },
      { tempMaxC: null, tempMinC: 20 },
      { tempMaxC: 25, tempMinC: 15 },
    ];
    const result = accumulateGdd(records, { baseTempC: 10 });
    expect(result.includedCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.totalGdd).toBe(15 + 10); // (30+20)/2-10=15, (25+15)/2-10=10
  });
});
