import { describe, expect, it } from "vitest";
import { normalizeHistoricalBlockRows, normalizeHistoricalPanchayatRows } from "@/data/normalizers/historical";
import { normalizeForecastBlockRows, normalizeForecastPanchayatRows } from "@/data/normalizers/forecast";
import { normalizeSoilRows } from "@/data/normalizers/soil";
import { normalizeElevationRows } from "@/data/normalizers/elevation";
import { normalizeBorders } from "@/data/normalizers/spatial";

describe("normalizeHistoricalBlockRows", () => {
  it("normalizes a well-formed row and reports no issues", () => {
    const { records, issues } = normalizeHistoricalBlockRows([
      {
        Block: "Chas",
        Month: "2016-01",
        Temp_Max_C: "28.5",
        Temp_Min_C: "6.4",
        Temp_Avg_C: "17.6",
        Precipitation_Total_mm: "13.8",
        Soil_Moisture_Avg: "0.172",
      },
    ]);

    expect(issues.missingColumns).toEqual([]);
    expect(issues.invalidRowCount).toBe(0);
    expect(records[0]).toMatchObject({
      provenance: "observed",
      block: "Chas",
      monthKey: "2016-01",
      tempAvgC: 17.6,
      precipitationTotalMm: 13.8,
      soilMoistureAvg: 0.172,
    });
  });

  it("marks rows with a missing month as invalid without dropping them", () => {
    const { records, issues } = normalizeHistoricalBlockRows([
      { Block: "Chas", Month: "", Temp_Max_C: "28.5" },
    ]);

    expect(records).toHaveLength(1);
    expect(issues.invalidRowCount).toBe(1);
    expect(records[0].date).toBeNull();
  });

  it("flags missing columns instead of silently returning nulls for every row", () => {
    const { issues } = normalizeHistoricalBlockRows([{ Block: "Chas", Month: "2016-01" }]);
    expect(issues.missingColumns).toContain("Temp_Max_C");
  });
});

describe("normalizeHistoricalPanchayatRows", () => {
  it("keeps a zero precipitation value as zero, not missing", () => {
    const { records } = normalizeHistoricalPanchayatRows([
      {
        Panchayat: "Alkusha",
        Month: "2016-04",
        Temp_Max_C: "43.1",
        Temp_Min_C: "21.6",
        Temp_Avg_C: "33.31",
        Precipitation_Total_mm: "0",
        Soil_Moisture_Avg: "0.138",
      },
    ]);
    expect(records[0].precipitationTotalMm).toBe(0);
  });
});

describe("normalizeForecastBlockRows", () => {
  it("normalizes a timestamped forecast row", () => {
    const { records } = normalizeForecastBlockRows([
      { Block: "Chas", Time: "2026-09-27 00:00:00", Temperature_C: "25.0", Precipitation_mm: "0.2", Soil_Moisture: "0.258" },
    ]);
    expect(records[0].iso).toBe("2026-09-27T00:00:00.000Z");
    expect(records[0].temperatureC).toBe(25);
  });
});

describe("normalizeForecastPanchayatRows", () => {
  it("normalizes the Spray_Favorable boolean column", () => {
    const { records } = normalizeForecastPanchayatRows([
      {
        Panchayat: "Alkusha",
        Time: "2026-09-27 00:00:00",
        Temperature_C: "25.1",
        Humidity_Pct: "98",
        Wind_Speed_kmh: "7.1",
        Precipitation_mm: "0.1",
        Rain_Probability_Pct: "58",
        Soil_Moisture: "0.259",
        Soil_Deficit: "0.021",
        Spray_Favorable: "False",
      },
    ]);
    expect(records[0].sprayFavorable).toBe(false);
  });
});

describe("normalizeSoilRows", () => {
  it("normalizes soil texture and water capacity", () => {
    const { records, issues } = normalizeSoilRows([
      {
        panchayat_name: "Alkusha",
        soil_type: "Clay Loam",
        clay_pct: "28.0",
        silt_pct: "20.0",
        sand_pct: "52.0",
        soil_ph: "6.1",
        soil_water_capacity_mm_m: "68.8",
      },
    ]);
    expect(issues.invalidRowCount).toBe(0);
    expect(records[0].soilType).toBe("Clay Loam");
    expect(records[0].soilWaterCapacityMmPerM).toBe(68.8);
  });
});

describe("normalizeElevationRows", () => {
  it("computes per-panchayat mean/min/max/count from point rows", () => {
    const { points, summaryByPanchayat, issues } = normalizeElevationRows([
      { Panchayat: "Alkusha", Longitude: "86.22", Latitude: "23.67", Elevation: "195" },
      { Panchayat: "Alkusha", Longitude: "86.221", Latitude: "23.67", Elevation: "197" },
    ]);
    expect(points).toHaveLength(2);
    expect(issues.invalidRowCount).toBe(0);
    expect(summaryByPanchayat.Alkusha).toMatchObject({
      meanElevationM: 196,
      minElevationM: 195,
      maxElevationM: 197,
      pointCount: 2,
    });
  });

  it("excludes rows with unparsable elevation from the summary but keeps the point", () => {
    const { points, summaryByPanchayat, issues } = normalizeElevationRows([
      { Panchayat: "Alkusha", Longitude: "86.22", Latitude: "23.67", Elevation: "" },
    ]);
    expect(points).toHaveLength(1);
    expect(issues.invalidRowCount).toBe(1);
    expect(summaryByPanchayat.Alkusha).toBeUndefined();
  });
});

describe("normalizeBorders", () => {
  it("extracts the panchayat name list from feature properties", () => {
    const { panchayatNames } = normalizeBorders({
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: { panchayat_name: "Alkusha" }, geometry: null },
        { type: "Feature", properties: { panchayat_name: "Kumhari" }, geometry: null },
      ],
    });
    expect(panchayatNames).toEqual(["Alkusha", "Kumhari"]);
  });
});
