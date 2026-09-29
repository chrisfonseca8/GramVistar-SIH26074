import { describe, expect, it } from "vitest";
import { computeEt0Hargreaves, computeExtraterrestrialRadiation } from "@/lib/calculations/et0Hargreaves";

describe("computeExtraterrestrialRadiation", () => {
  it("is approximately symmetric between northern and southern hemispheres near the equinox (day ~81)", () => {
    const north = computeExtraterrestrialRadiation({ latitudeDeg: 23.65, dayOfYear: 81 });
    const south = computeExtraterrestrialRadiation({ latitudeDeg: -23.65, dayOfYear: 81 });
    // Not exact: day 81 isn't the formula's precise zero-declination day, so a
    // small residual asymmetry is expected — this just guards against a sign
    // error or a hemisphere being wildly wrong, not sub-percent precision.
    expect(Math.abs(north.value - south.value)).toBeLessThan(1);
  });

  it("falls within the physically expected range at the equator", () => {
    const result = computeExtraterrestrialRadiation({ latitudeDeg: 0, dayOfYear: 80 });
    expect(result.available).toBe(true);
    expect(result.value).toBeGreaterThan(30);
    expect(result.value).toBeLessThan(42);
  });

  it("is higher in local summer than local winter for a mid-latitude", () => {
    // Northern hemisphere: day 172 (~June solstice) vs day 355 (~Dec solstice)
    const summer = computeExtraterrestrialRadiation({ latitudeDeg: 40, dayOfYear: 172 });
    const winter = computeExtraterrestrialRadiation({ latitudeDeg: 40, dayOfYear: 355 });
    expect(summer.value).toBeGreaterThan(winter.value);
  });

  it("reports unavailable for a missing latitude or an out-of-range day", () => {
    expect(computeExtraterrestrialRadiation({ latitudeDeg: null, dayOfYear: 80 }).available).toBe(false);
    expect(computeExtraterrestrialRadiation({ latitudeDeg: 23, dayOfYear: 400 }).available).toBe(false);
  });
});

describe("computeEt0Hargreaves", () => {
  it("returns a positive, physically plausible ET0 for typical Chas Block conditions", () => {
    // Chas Block, Jharkhand ~23.65°N; a warm April day from the historical data
    const result = computeEt0Hargreaves({
      tempMaxC: 43.1,
      tempMinC: 21.6,
      tempAvgC: 33.31,
      latitudeDeg: 23.65,
      dayOfYear: 105, // mid-April
    });
    expect(result.available).toBe(true);
    // Hargreaves ET0 for hot, high-diurnal-range conditions is typically 5-15 mm/day
    expect(result.value).toBeGreaterThan(3);
    expect(result.value).toBeLessThan(20);
  });

  it("increases with a larger diurnal temperature range, holding Tavg fixed", () => {
    const narrow = computeEt0Hargreaves({ tempMaxC: 32, tempMinC: 28, tempAvgC: 30, latitudeDeg: 23.65, dayOfYear: 105 });
    const wide = computeEt0Hargreaves({ tempMaxC: 40, tempMinC: 20, tempAvgC: 30, latitudeDeg: 23.65, dayOfYear: 105 });
    expect(wide.value).toBeGreaterThan(narrow.value);
  });

  it("is deterministic", () => {
    const input = { tempMaxC: 30, tempMinC: 20, tempAvgC: 25, latitudeDeg: 23.65, dayOfYear: 200 };
    expect(computeEt0Hargreaves(input)).toEqual(computeEt0Hargreaves(input));
  });

  it("reports unavailable when temperatures are missing", () => {
    const result = computeEt0Hargreaves({ tempMaxC: null, tempMinC: 20, tempAvgC: 25, latitudeDeg: 23.65, dayOfYear: 200 });
    expect(result.available).toBe(false);
  });

  it("reports unavailable when Tmax is less than Tmin", () => {
    const result = computeEt0Hargreaves({ tempMaxC: 15, tempMinC: 20, tempAvgC: 17, latitudeDeg: 23.65, dayOfYear: 200 });
    expect(result.available).toBe(false);
  });

  it("reports unavailable when latitude is missing (radiation unavailable)", () => {
    const result = computeEt0Hargreaves({ tempMaxC: 30, tempMinC: 20, tempAvgC: 25, latitudeDeg: null, dayOfYear: 200 });
    expect(result.available).toBe(false);
  });
});
