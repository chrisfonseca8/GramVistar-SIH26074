import { describe, expect, it } from "vitest";
import { computeIrrigationWindow } from "@/lib/calculations/irrigationWindow";

describe("computeIrrigationWindow", () => {
  it("recommends irrigation when soil is dry and rain is unlikely", () => {
    const result = computeIrrigationWindow({ soilMoisture: 0.2, rainProbabilityPct: 10 });
    expect(result.available).toBe(true);
    expect(result.value.irrigate).toBe(true);
  });

  it("does not recommend irrigation when soil is not dry enough", () => {
    const result = computeIrrigationWindow({ soilMoisture: 0.35, rainProbabilityPct: 10 });
    expect(result.value.irrigate).toBe(false);
  });

  it("does not recommend irrigation when rain is likely, even if soil is dry", () => {
    const result = computeIrrigationWindow({ soilMoisture: 0.2, rainProbabilityPct: 80 });
    expect(result.value.irrigate).toBe(false);
    expect(result.value.reasons.some((r) => r.includes("rain"))).toBe(true);
  });

  it("respects custom thresholds", () => {
    const result = computeIrrigationWindow({
      soilMoisture: 0.3,
      rainProbabilityPct: 10,
      moistureThreshold: 0.32,
    });
    expect(result.value.irrigate).toBe(true);
  });

  it("reports unavailable when a required input is missing", () => {
    expect(computeIrrigationWindow({ soilMoisture: null, rainProbabilityPct: 10 }).available).toBe(false);
    expect(computeIrrigationWindow({ soilMoisture: 0.25, rainProbabilityPct: null }).available).toBe(false);
  });
});
