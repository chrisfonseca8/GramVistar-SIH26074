import { describe, expect, it } from "vitest";
import { computeHeatIndex } from "@/lib/calculations/heatIndex";

describe("computeHeatIndex", () => {
  it("feels hotter than the actual temperature in hot, humid conditions", () => {
    const result = computeHeatIndex({ tempC: 35, humidityPct: 70 });
    expect(result.available).toBe(true);
    expect(result.value).toBeGreaterThan(35);
  });

  it("increases with humidity at a fixed hot temperature", () => {
    const drier = computeHeatIndex({ tempC: 35, humidityPct: 40 });
    const humid = computeHeatIndex({ tempC: 35, humidityPct: 80 });
    expect(humid.value).toBeGreaterThan(drier.value);
  });

  it("stays close to actual temperature in mild, low-humidity conditions", () => {
    const result = computeHeatIndex({ tempC: 20, humidityPct: 30 });
    expect(result.available).toBe(true);
    expect(Math.abs(result.value - 20)).toBeLessThan(5);
  });

  it("matches a known NOAA reference point (T=110°F/43.3°C, RH=40% -> ~135.5°F/57.5°C)", () => {
    const result = computeHeatIndex({ tempC: 43.33, humidityPct: 40 });
    expect(result.available).toBe(true);
    // NOAA's published heat index table gives 135°F for this combination.
    expect(result.value).toBeCloseTo(57.5, 0);
  });

  it("is deterministic", () => {
    const input = { tempC: 38, humidityPct: 90 };
    expect(computeHeatIndex(input)).toEqual(computeHeatIndex(input));
  });

  it("reports unavailable when temperature or humidity is missing", () => {
    expect(computeHeatIndex({ tempC: null, humidityPct: 50 }).available).toBe(false);
    expect(computeHeatIndex({ tempC: 30, humidityPct: null }).available).toBe(false);
  });

  it("reports unavailable for an out-of-range humidity", () => {
    expect(computeHeatIndex({ tempC: 30, humidityPct: 120 }).available).toBe(false);
    expect(computeHeatIndex({ tempC: 30, humidityPct: -5 }).available).toBe(false);
  });
});
