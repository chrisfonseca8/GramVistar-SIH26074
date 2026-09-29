import { describe, expect, it } from "vitest";
import { getRainfallProbability } from "@/lib/calculations/rainfallProbability";
import { getWindDirection, getWindSpeed } from "@/lib/calculations/windSpeed";

describe("getRainfallProbability", () => {
  it("passes through a valid percentage", () => {
    expect(getRainfallProbability({ rainProbabilityPct: 58 })).toEqual({ value: 58, unit: "%", available: true });
  });

  it("reports unavailable when the source doesn't provide it (e.g. block-level forecast)", () => {
    expect(getRainfallProbability({ rainProbabilityPct: null }).available).toBe(false);
  });

  it("reports unavailable for an out-of-range value", () => {
    expect(getRainfallProbability({ rainProbabilityPct: 150 }).available).toBe(false);
  });
});

describe("getWindSpeed", () => {
  it("passes through a valid speed", () => {
    expect(getWindSpeed({ windSpeedKmh: 7.1 })).toEqual({ value: 7.1, unit: "km/h", available: true });
  });

  it("reports unavailable when the source doesn't provide it (e.g. block-level forecast)", () => {
    expect(getWindSpeed({ windSpeedKmh: null }).available).toBe(false);
  });

  it("reports unavailable for a negative speed", () => {
    expect(getWindSpeed({ windSpeedKmh: -1 }).available).toBe(false);
  });
});

describe("getWindDirection", () => {
  it("always reports unavailable — no direction data source exists anywhere in /data", () => {
    const result = getWindDirection();
    expect(result.available).toBe(false);
    expect(result.value).toBeNull();
  });
});
