import { describe, expect, it } from "vitest";
import { downscaleTemperatureByElevation } from "@/lib/downscaling/temperature";

describe("downscaleTemperatureByElevation", () => {
  it("cools the panchayat temperature when it sits higher than the block", () => {
    // 1000m higher -> 6.5°C cooler at the default lapse rate
    const result = downscaleTemperatureByElevation({
      tempBlockC: 30,
      elevationBlockM: 200,
      elevationPanchayatM: 1200,
    });
    expect(result).toEqual({ value: 23.5, unit: "°C", available: true });
  });

  it("warms the panchayat temperature when it sits lower than the block", () => {
    const result = downscaleTemperatureByElevation({
      tempBlockC: 30,
      elevationBlockM: 1200,
      elevationPanchayatM: 200,
    });
    expect(result.value).toBeCloseTo(36.5);
  });

  it("returns the block temperature unchanged when elevations are equal", () => {
    const result = downscaleTemperatureByElevation({
      tempBlockC: 25,
      elevationBlockM: 200,
      elevationPanchayatM: 200,
    });
    expect(result.value).toBe(25);
  });

  it("respects a custom lapse rate", () => {
    const result = downscaleTemperatureByElevation({
      tempBlockC: 30,
      elevationBlockM: 0,
      elevationPanchayatM: 1000,
      lapseRateCPerKm: 10,
    });
    expect(result.value).toBe(20);
  });

  it("is deterministic", () => {
    const input = { tempBlockC: 33.31, elevationBlockM: 208, elevationPanchayatM: 209.17 };
    expect(downscaleTemperatureByElevation(input)).toEqual(downscaleTemperatureByElevation(input));
  });

  it("reports unavailable, not a fabricated value, when an input is missing", () => {
    expect(downscaleTemperatureByElevation({ tempBlockC: null, elevationBlockM: 200, elevationPanchayatM: 200 }).available).toBe(false);
    expect(downscaleTemperatureByElevation({ tempBlockC: 30, elevationBlockM: null, elevationPanchayatM: 200 }).available).toBe(false);
    expect(downscaleTemperatureByElevation({ tempBlockC: 30, elevationBlockM: 200, elevationPanchayatM: null }).available).toBe(false);
  });
});
