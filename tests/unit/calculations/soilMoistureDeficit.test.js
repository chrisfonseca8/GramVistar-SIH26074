import { describe, expect, it } from "vitest";
import { computeSoilMoistureDeficit, estimateFieldCapacityFraction } from "@/lib/calculations/soilMoistureDeficit";

describe("computeSoilMoistureDeficit", () => {
  it("computes the deficit below field capacity", () => {
    const result = computeSoilMoistureDeficit({ soilMoisture: 0.18, fieldCapacity: 0.25 });
    expect(result.available).toBe(true);
    expect(result.value).toBeCloseTo(0.07);
  });

  it("floors the deficit at 0 when soil is at or above field capacity", () => {
    const result = computeSoilMoistureDeficit({ soilMoisture: 0.3, fieldCapacity: 0.25 });
    expect(result.value).toBe(0);
  });

  it("reports unavailable, not 0, when an input is missing", () => {
    expect(computeSoilMoistureDeficit({ soilMoisture: null, fieldCapacity: 0.25 }).available).toBe(false);
    expect(computeSoilMoistureDeficit({ soilMoisture: 0.2, fieldCapacity: null }).available).toBe(false);
  });
});

describe("estimateFieldCapacityFraction", () => {
  it("converts mm-per-metre available water capacity to a volumetric fraction", () => {
    const result = estimateFieldCapacityFraction({ soilWaterCapacityMmPerM: 68.8 });
    expect(result.available).toBe(true);
    expect(result.value).toBeCloseTo(0.0688);
  });

  it("reports unavailable when the input is missing", () => {
    expect(estimateFieldCapacityFraction({ soilWaterCapacityMmPerM: null }).available).toBe(false);
  });
});
