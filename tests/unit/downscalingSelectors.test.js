import { describe, expect, it } from "vitest";
import {
  selectBlockElevation,
  selectDownscaledRainfallSeries,
  selectDownscaledTemperatureSeries,
  selectIdwInterpolatedValue,
  selectIdwKnownPointsForMonth,
} from "@/data/selectors/downscaling";

const fakeData = {
  panchayats: ["Alkusha", "Kura"],
  elevationSummaryByPanchayat: {
    Alkusha: { meanElevationM: 200, minElevationM: 190, maxElevationM: 210, pointCount: 100 },
    Kura: { meanElevationM: 300, minElevationM: 280, maxElevationM: 320, pointCount: 100 },
  },
  panchayatCentroids: {
    Alkusha: { longitude: 86.22, latitude: 23.67 },
    Kura: { longitude: 86.25, latitude: 23.7 },
  },
  forecastBlock: [
    { timeKey: "t1", date: new Date("2026-01-01"), temperatureC: 25, precipitationMm: 10 },
    { timeKey: "t2", date: new Date("2026-01-02"), temperatureC: 30, precipitationMm: 0 },
  ],
  historicalPanchayats: [
    { panchayat: "Alkusha", monthKey: "2016-01", tempAvgC: 17.5, precipitationTotalMm: 8 },
    { panchayat: "Kura", monthKey: "2016-01", tempAvgC: 16.0, precipitationTotalMm: 12 },
  ],
};

describe("selectBlockElevation", () => {
  it("computes the block elevation from the summary", () => {
    // (200*100 + 300*100) / 200 = 250
    expect(selectBlockElevation(fakeData)).toBe(250);
  });

  it("returns null when unavailable", () => {
    expect(selectBlockElevation({ elevationSummaryByPanchayat: {} })).toBeNull();
  });
});

describe("selectDownscaledTemperatureSeries", () => {
  it("downscales every hour of the block forecast for the given panchayat", () => {
    const series = selectDownscaledTemperatureSeries(fakeData, "Alkusha");
    expect(series).toHaveLength(2);
    // block elevation 250, Alkusha 200 -> 50m lower -> +0.325°C warmer
    expect(series[0].available).toBe(true);
    expect(series[0].value).toBeCloseTo(25.325);
    expect(series[0].timeKey).toBe("t1");
  });

  it("reports unavailable series entries when data is missing", () => {
    const series = selectDownscaledTemperatureSeries({ forecastBlock: fakeData.forecastBlock, elevationSummaryByPanchayat: {} }, "Alkusha");
    expect(series[0].available).toBe(false);
  });
});

describe("selectDownscaledRainfallSeries", () => {
  it("adjusts every hour of the block rainfall forecast for the given panchayat", () => {
    const series = selectDownscaledRainfallSeries(fakeData, "Kura");
    expect(series[0].available).toBe(true);
    // Kura (300m) higher than block (250m) -> enhanced rainfall
    expect(series[0].value).toBeGreaterThan(10);
  });
});

describe("selectIdwKnownPointsForMonth", () => {
  it("builds one known point per panchayat with centroid + historical value", () => {
    const points = selectIdwKnownPointsForMonth(fakeData, "2016-01", "tempAvgC");
    expect(points).toHaveLength(2);
    expect(points.find((p) => p.panchayat === "Alkusha").value).toBe(17.5);
  });

  it("skips a panchayat with no matching month", () => {
    const points = selectIdwKnownPointsForMonth(fakeData, "2099-01", "tempAvgC");
    expect(points).toHaveLength(0);
  });
});

describe("selectIdwInterpolatedValue", () => {
  it("interpolates between the known points", () => {
    const points = selectIdwKnownPointsForMonth(fakeData, "2016-01", "tempAvgC");
    const result = selectIdwInterpolatedValue({ longitude: 86.235, latitude: 23.685 }, points);
    expect(result.available).toBe(true);
    expect(result.value).toBeGreaterThan(16.0);
    expect(result.value).toBeLessThan(17.5);
  });
});
