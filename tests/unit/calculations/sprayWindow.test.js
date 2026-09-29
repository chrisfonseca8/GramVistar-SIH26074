import { describe, expect, it } from "vitest";
import { computeSprayWindow } from "@/lib/calculations/sprayWindow";

describe("computeSprayWindow", () => {
  it("is favorable when wind and rain are both within limits", () => {
    const result = computeSprayWindow({ windSpeedKmh: 8, rainProbabilityPct: 10 });
    expect(result.available).toBe(true);
    expect(result.value.favorable).toBe(true);
    expect(result.value.reasons).toEqual([]);
  });

  it("is unfavorable when wind exceeds the drift-risk limit", () => {
    const result = computeSprayWindow({ windSpeedKmh: 25, rainProbabilityPct: 10 });
    expect(result.value.favorable).toBe(false);
    expect(result.value.reasons.length).toBe(1);
  });

  it("is unfavorable when rain probability exceeds the washout limit", () => {
    const result = computeSprayWindow({ windSpeedKmh: 8, rainProbabilityPct: 60 });
    expect(result.value.favorable).toBe(false);
  });

  it("also checks temperature range when tempC is provided", () => {
    const result = computeSprayWindow({ windSpeedKmh: 8, rainProbabilityPct: 10, tempC: 40 });
    expect(result.value.favorable).toBe(false);
    expect(result.value.reasons[0]).toContain("temperature");
  });

  it("ignores temperature when not provided", () => {
    const result = computeSprayWindow({ windSpeedKmh: 8, rainProbabilityPct: 10 });
    expect(result.value.favorable).toBe(true);
  });

  it("reports unavailable when wind or rain probability is missing", () => {
    expect(computeSprayWindow({ windSpeedKmh: null, rainProbabilityPct: 10 }).available).toBe(false);
    expect(computeSprayWindow({ windSpeedKmh: 8, rainProbabilityPct: null }).available).toBe(false);
  });
});
