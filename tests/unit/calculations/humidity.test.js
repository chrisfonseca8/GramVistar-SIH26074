import { describe, expect, it } from "vitest";
import { estimateRelativeHumidityFromDewPoint } from "@/lib/calculations/humidity";

describe("estimateRelativeHumidityFromDewPoint", () => {
  it("returns 100% when dew point equals air temperature", () => {
    const result = estimateRelativeHumidityFromDewPoint({ tempC: 20, dewPointC: 20 });
    expect(result.available).toBe(true);
    expect(result.value).toBeCloseTo(100);
  });

  it("decreases as the dew point spread widens", () => {
    const narrow = estimateRelativeHumidityFromDewPoint({ tempC: 25, dewPointC: 22 });
    const wide = estimateRelativeHumidityFromDewPoint({ tempC: 25, dewPointC: 10 });
    expect(wide.value).toBeLessThan(narrow.value);
  });

  it("reports unavailable when dew point exceeds air temperature (physically invalid)", () => {
    expect(estimateRelativeHumidityFromDewPoint({ tempC: 20, dewPointC: 25 }).available).toBe(false);
  });

  it("reports unavailable when an input is missing — matches our real data, which has no dew point source", () => {
    expect(estimateRelativeHumidityFromDewPoint({ tempC: 20, dewPointC: null }).available).toBe(false);
  });
});
