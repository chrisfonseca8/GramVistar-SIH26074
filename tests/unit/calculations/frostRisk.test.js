import { describe, expect, it } from "vitest";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";

describe("computeFrostRisk", () => {
  it("reports 'none' well above the watch threshold", () => {
    expect(computeFrostRisk({ tempMinC: 15 }).value).toBe("none");
  });

  it("reports 'watch' between the watch and warning thresholds", () => {
    expect(computeFrostRisk({ tempMinC: 3 }).value).toBe("watch");
  });

  it("reports 'warning' at or below the warning threshold", () => {
    expect(computeFrostRisk({ tempMinC: -1 }).value).toBe("warning");
    expect(computeFrostRisk({ tempMinC: 0 }).value).toBe("warning");
  });

  it("respects custom thresholds", () => {
    expect(computeFrostRisk({ tempMinC: 6, watchThresholdC: 8, warningThresholdC: 5 }).value).toBe("watch");
  });

  it("reports unavailable when tempMinC is missing", () => {
    expect(computeFrostRisk({ tempMinC: null }).available).toBe(false);
  });

  it("reports unavailable for an inconsistent threshold configuration", () => {
    expect(computeFrostRisk({ tempMinC: 2, watchThresholdC: 0, warningThresholdC: 4 }).available).toBe(false);
  });
});
