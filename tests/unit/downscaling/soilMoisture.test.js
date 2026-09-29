import { describe, expect, it } from "vitest";
import { adjustSoilMoistureForPanchayat } from "@/lib/downscaling/soilMoisture";

describe("adjustSoilMoistureForPanchayat", () => {
  it("increases moisture when rainfall exceeds ET0", () => {
    const result = adjustSoilMoistureForPanchayat({
      baseSoilMoisture: 0.2,
      precipitationMm: 10,
      et0MmPerDay: 3,
      soilWaterCapacityMmPerM: 70,
    });
    expect(result.available).toBe(true);
    expect(result.value).toBeGreaterThan(0.2);
  });

  it("decreases moisture when ET0 exceeds rainfall", () => {
    const result = adjustSoilMoistureForPanchayat({
      baseSoilMoisture: 0.2,
      precipitationMm: 0,
      et0MmPerDay: 5,
      soilWaterCapacityMmPerM: 70,
    });
    expect(result.value).toBeLessThan(0.2);
  });

  it("clamps the result to [0, 1]", () => {
    const high = adjustSoilMoistureForPanchayat({
      baseSoilMoisture: 0.9,
      precipitationMm: 500,
      et0MmPerDay: 0,
      soilWaterCapacityMmPerM: 10,
    });
    expect(high.value).toBe(1);

    const low = adjustSoilMoistureForPanchayat({
      baseSoilMoisture: 0.05,
      precipitationMm: 0,
      et0MmPerDay: 500,
      soilWaterCapacityMmPerM: 10,
    });
    expect(low.value).toBe(0);
  });

  it("applies a runoff reduction only when slopePercent is explicitly provided", () => {
    const withoutSlope = adjustSoilMoistureForPanchayat({
      baseSoilMoisture: 0.2,
      precipitationMm: 20,
      et0MmPerDay: 0,
      soilWaterCapacityMmPerM: 70,
    });
    const withSteepSlope = adjustSoilMoistureForPanchayat({
      baseSoilMoisture: 0.2,
      precipitationMm: 20,
      et0MmPerDay: 0,
      soilWaterCapacityMmPerM: 70,
      slopePercent: 50,
    });
    expect(withSteepSlope.value).toBeLessThan(withoutSlope.value);
  });

  it("scales the adjustment magnitude via adjustmentScale", () => {
    const base = { baseSoilMoisture: 0.2, precipitationMm: 20, et0MmPerDay: 0, soilWaterCapacityMmPerM: 70 };
    const weak = adjustSoilMoistureForPanchayat({ ...base, adjustmentScale: 0.5 });
    const strong = adjustSoilMoistureForPanchayat({ ...base, adjustmentScale: 1.5 });
    expect(strong.value).toBeGreaterThan(weak.value);
  });

  it("reports unavailable when a required input is missing", () => {
    expect(adjustSoilMoistureForPanchayat({ baseSoilMoisture: null, precipitationMm: 5, et0MmPerDay: 3, soilWaterCapacityMmPerM: 70 }).available).toBe(false);
    expect(adjustSoilMoistureForPanchayat({ baseSoilMoisture: 0.2, precipitationMm: 5, et0MmPerDay: 3, soilWaterCapacityMmPerM: 0 }).available).toBe(false);
  });
});
