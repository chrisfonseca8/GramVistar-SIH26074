import { describe, expect, it } from "vitest";
import { estimateCloudCoverFromTemperatureRange } from "@/lib/calculations/cloudCover";

describe("estimateCloudCoverFromTemperatureRange", () => {
  it("estimates low cloud cover for a wide diurnal range (clear-sky signature)", () => {
    const result = estimateCloudCoverFromTemperatureRange({ tempMaxC: 35, tempMinC: 10, referenceTempRangeC: 20 });
    expect(result.available).toBe(true);
    expect(result.value).toBeLessThan(20);
  });

  it("estimates high cloud cover for a narrow diurnal range", () => {
    const result = estimateCloudCoverFromTemperatureRange({ tempMaxC: 22, tempMinC: 20, referenceTempRangeC: 20 });
    expect(result.value).toBeGreaterThan(60);
  });

  it("caps the estimate at 0% when the range meets/exceeds the reference range", () => {
    const result = estimateCloudCoverFromTemperatureRange({ tempMaxC: 40, tempMinC: 15, referenceTempRangeC: 20 });
    expect(result.value).toBeCloseTo(0);
  });

  it("reports unavailable when temperatures are missing", () => {
    expect(estimateCloudCoverFromTemperatureRange({ tempMaxC: null, tempMinC: 10 }).available).toBe(false);
  });

  it("reports unavailable when tempMaxC is less than tempMinC", () => {
    expect(estimateCloudCoverFromTemperatureRange({ tempMaxC: 10, tempMinC: 20 }).available).toBe(false);
  });
});
