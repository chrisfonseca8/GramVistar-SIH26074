import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDataStore } from "@/store/dataStore";
import { DATA_PATHS } from "@/data";

const CSV_FIXTURES = {
  [DATA_PATHS.historicalBlock]: "Block,Month,Temp_Max_C,Temp_Min_C,Temp_Avg_C,Precipitation_Total_mm,Soil_Moisture_Avg\nChas,2016-01,28.5,6.4,17.6,13.8,0.172\n",
  [DATA_PATHS.historicalPanchayats]: "Panchayat,Month,Temp_Max_C,Temp_Min_C,Temp_Avg_C,Precipitation_Total_mm,Soil_Moisture_Avg\nAlkusha,2016-01,28.5,6.6,17.49,8.1,0.165\n",
  [DATA_PATHS.forecastBlock]: "Block,Time,Temperature_C,Precipitation_mm,Soil_Moisture\nChas,2026-09-27 00:00:00,25.0,0.2,0.258\n",
  [DATA_PATHS.forecastPanchayats]: "Panchayat,Time,Temperature_C,Humidity_Pct,Wind_Speed_kmh,Precipitation_mm,Rain_Probability_Pct,Soil_Moisture,Soil_Deficit,Spray_Favorable\nAlkusha,2026-09-27 00:00:00,25.1,98,7.1,0.1,58,0.259,0.021,False\n",
  [DATA_PATHS.soil]: "panchayat_name,soil_type,clay_pct,silt_pct,sand_pct,soil_ph,soil_water_capacity_mm_m\nAlkusha,Clay Loam,28.0,20.0,52.0,6.1,68.8\n",
  [DATA_PATHS.elevation]: "Panchayat,Longitude,Latitude,Elevation\nAlkusha,86.22,23.67,195\n",
};

const GEOJSON_FIXTURES = {
  [DATA_PATHS.borders]: {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { panchayat_name: "Alkusha" }, geometry: null }],
  },
  [DATA_PATHS.selectedArea]: { type: "FeatureCollection", features: [] },
};

function mockFetchOnce() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path) => {
      if (path in CSV_FIXTURES) {
        return { ok: true, text: async () => CSV_FIXTURES[path] };
      }
      if (path in GEOJSON_FIXTURES) {
        return { ok: true, json: async () => GEOJSON_FIXTURES[path] };
      }
      throw new Error(`Unmocked fetch: ${path}`);
    }),
  );
}

describe("useDataStore", () => {
  beforeEach(() => {
    useDataStore.setState({ status: "idle", error: null, data: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts idle", () => {
    expect(useDataStore.getState().status).toBe("idle");
  });

  it("transitions idle -> loading -> ready and populates data", async () => {
    mockFetchOnce();
    const loadPromise = useDataStore.getState().loadAll();
    expect(useDataStore.getState().status).toBe("loading");

    await loadPromise;

    const state = useDataStore.getState();
    expect(state.status).toBe("ready");
    expect(state.error).toBeNull();
    expect(state.data.panchayats).toEqual(["Alkusha"]);
    expect(state.data.historicalBlock).toHaveLength(1);
  });

  it("transitions to error state when a fetch fails, without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 404, statusText: "Not Found" })),
    );

    await useDataStore.getState().loadAll();

    const state = useDataStore.getState();
    expect(state.status).toBe("error");
    expect(state.error).toContain("404");
    expect(state.data).toBeNull();
  });

  it("does not re-fetch once ready", async () => {
    mockFetchOnce();
    await useDataStore.getState().loadAll();
    const fetchCallsAfterFirstLoad = fetch.mock.calls.length;

    await useDataStore.getState().loadAll();
    expect(fetch.mock.calls.length).toBe(fetchCallsAfterFirstLoad);
  });
});
