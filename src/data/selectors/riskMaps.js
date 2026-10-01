import { selectForecastPanchayat } from "@/data/selectors";
import { selectFiveDayForecast } from "@/data/selectors/farmerHome";
import { computeHeatIndex } from "@/lib/calculations/heatIndex";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";
import { computeFloodRisk } from "@/lib/calculations/floodRisk";
import { computeFungalDiseaseRisk } from "@/lib/calculations/fungalDiseaseRisk";
import { computePanchayatVulnerabilityIndex } from "@/lib/calculations/vulnerabilityIndex";
import { isFiniteNumber } from "@/lib/calculations/result";
import { RISK_COLORS } from "@/lib/riskLevels";
import { valueToColor } from "@/lib/colorScale";

/**
 * Government Risk Maps — 7 named layers, each backed by real forecast
 * data via the app's own calculation functions. Roads and Population
 * Vulnerability are intentionally not included here — no road-network or
 * demographic dataset exists anywhere in the underlying data, and this
 * app never shows a layer with nothing real behind it.
 *
 * @typedef {{ key: string, label: string, description: string }} RiskLayerMeta
 */
export const RISK_LAYERS = [
  {
    key: "drought",
    label: "Drought",
    description:
      "Current volumetric soil moisture against illustrative dry/severe thresholds (same 0.26/0.24 m³/m³ zones as the Scientist portal's soil moisture gauge).",
  },
  {
    key: "flood",
    label: "Flood",
    description:
      "24-hour forecast rainfall against illustrative flood-risk thresholds — a rainfall-based heuristic, not a hydrological model (no drainage/elevation/river-gauge data used).",
  },
  {
    key: "heatwave",
    label: "Heatwave",
    description:
      "Current heat index against the same Danger/Caution thresholds used elsewhere in the app (41°C / 32°C).",
  },
  {
    key: "coldWave",
    label: "Cold Wave",
    description:
      "Current temperature against the same frost-risk thresholds (4°C watch / 0°C warning) used across the app.",
  },
  {
    key: "pestDisease",
    label: "Pest/Disease",
    description:
      "General illustrative fungal-disease-pressure heuristic from humidity and temperature — not species- or crop-specific.",
  },
  {
    key: "cropHealth",
    label: "Crop Health",
    description:
      "Illustrative composite of heat stress, soil moisture and pest/disease pressure, min-max ranked across the 5 panchayats — the same composite-ranking method as the Vulnerability Ranking, applied to different factors.",
  },
  {
    key: "water",
    label: "Water",
    description:
      "Same soil moisture data as Drought, framed as water availability instead of drought risk (green = plentiful, red = scarce) — the two layers share their one real underlying signal, viewed from two angles.",
  },
];

const SEVERITY_TO_COLOR = {
  none: RISK_COLORS.green,
  watch: RISK_COLORS.yellow,
  moderate: RISK_COLORS.orange,
  severe: RISK_COLORS.red,
};
const FROST_TO_COLOR = {
  none: RISK_COLORS.green,
  watch: RISK_COLORS.yellow,
  warning: RISK_COLORS.red,
};
const PEST_TO_COLOR = {
  low: RISK_COLORS.green,
  moderate: RISK_COLORS.yellow,
  high: RISK_COLORS.red,
};

function currentRecord(data, panchayat) {
  return selectForecastPanchayat(data, panchayat)[0] ?? null;
}

function categoricalResult(level, colorMap, label) {
  return { available: true, level, label, color: colorMap[level] };
}

function droughtLayer(data, panchayat) {
  const current = currentRecord(data, panchayat);
  if (!current || !isFiniteNumber(current.soilMoisture))
    return { available: false, reason: "missing soilMoisture" };
  // Lower volumetric soil moisture = drier = worse.
  const level =
    current.soilMoisture <= 0.24
      ? "severe"
      : current.soilMoisture <= 0.26
        ? "watch"
        : "none";
  return categoricalResult(
    level,
    SEVERITY_TO_COLOR,
    `soil moisture ${current.soilMoisture.toFixed(3)} m³/m³`,
  );
}

function waterLayer(data, panchayat) {
  const current = currentRecord(data, panchayat);
  if (!current || !isFiniteNumber(current.soilMoisture))
    return { available: false, reason: "missing soilMoisture" };
  // Inverted framing of the same soil-moisture value: higher moisture = plentiful water = green.
  const level =
    current.soilMoisture <= 0.24
      ? "none"
      : current.soilMoisture <= 0.26
        ? "watch"
        : "severe";
  const invertedColorMap = {
    severe: RISK_COLORS.green,
    watch: RISK_COLORS.yellow,
    none: RISK_COLORS.red,
  };
  return {
    available: true,
    level,
    label: `soil moisture ${current.soilMoisture.toFixed(3)} m³/m³`,
    color: invertedColorMap[level],
  };
}

function floodLayer(data, panchayat) {
  const today = selectFiveDayForecast(data, panchayat)[0];
  const result = computeFloodRisk({
    rainfall24hMm: today?.precipitationTotalMm ?? null,
  });
  if (!result.available) return { available: false, reason: result.reason };
  return categoricalResult(
    result.value,
    SEVERITY_TO_COLOR,
    `${today.precipitationTotalMm.toFixed(1)}mm/24h`,
  );
}

function heatwaveLayer(data, panchayat) {
  const current = currentRecord(data, panchayat);
  if (!current) return { available: false, reason: "no forecast data" };
  const result = computeHeatIndex({
    tempC: current.temperatureC,
    humidityPct: current.humidityPct,
  });
  if (!result.available) return { available: false, reason: result.reason };
  const level =
    result.value >= 41 ? "severe" : result.value >= 32 ? "watch" : "none";
  return categoricalResult(
    level,
    SEVERITY_TO_COLOR,
    `${result.value.toFixed(1)}°C heat index`,
  );
}

function coldWaveLayer(data, panchayat) {
  const current = currentRecord(data, panchayat);
  if (!current) return { available: false, reason: "no forecast data" };
  const result = computeFrostRisk({ tempMinC: current.temperatureC });
  if (!result.available) return { available: false, reason: result.reason };
  return categoricalResult(
    result.value,
    FROST_TO_COLOR,
    `${current.temperatureC}°C`,
  );
}

function pestDiseaseLayer(data, panchayat) {
  const current = currentRecord(data, panchayat);
  if (!current) return { available: false, reason: "no forecast data" };
  const result = computeFungalDiseaseRisk({
    humidityPct: current.humidityPct,
    tempC: current.temperatureC,
  });
  if (!result.available) return { available: false, reason: result.reason };
  return categoricalResult(
    result.value.level,
    PEST_TO_COLOR,
    `${result.value.level} pest/disease pressure`,
  );
}

const CROP_HEALTH_FACTOR_KEYS = {
  PEST_TO_SCORE: { low: 0, moderate: 0.5, high: 1 },
};

function cropHealthValuesByPanchayat(data) {
  const panchayats = data?.panchayats ?? [];
  const panchayatFactors = panchayats.map((panchayat) => {
    const current = currentRecord(data, panchayat);
    const heatIndex = current
      ? computeHeatIndex({
          tempC: current.temperatureC,
          humidityPct: current.humidityPct,
        })
      : null;
    const pest = current
      ? computeFungalDiseaseRisk({
          humidityPct: current.humidityPct,
          tempC: current.temperatureC,
        })
      : null;

    return {
      panchayat,
      heatIndexC: heatIndex?.available ? heatIndex.value : null,
      soilMoisture: current?.soilMoisture ?? null,
      pestScore: pest?.available
        ? CROP_HEALTH_FACTOR_KEYS.PEST_TO_SCORE[pest.value.level]
        : null,
    };
  });

  return computePanchayatVulnerabilityIndex(
    panchayatFactors,
    [
      { key: "heatIndexC", higherIsWorse: true, weight: 1 },
      { key: "soilMoisture", higherIsWorse: false, weight: 1 },
      { key: "pestScore", higherIsWorse: true, weight: 1 },
    ],
    "crop health risk index (0-1, higher = worse, relative to the panchayats compared)",
  );
}

/**
 * @param {object|null} data
 * @param {string} layerKey one of `RISK_LAYERS`' keys
 * @param {string} panchayat
 * @returns {{ available: boolean, level?: string, value?: number, label?: string, color?: string, reason?: string }}
 */
export function selectRiskLayerForPanchayat(data, layerKey, panchayat) {
  switch (layerKey) {
    case "drought":
      return droughtLayer(data, panchayat);
    case "water":
      return waterLayer(data, panchayat);
    case "flood":
      return floodLayer(data, panchayat);
    case "heatwave":
      return heatwaveLayer(data, panchayat);
    case "coldWave":
      return coldWaveLayer(data, panchayat);
    case "pestDisease":
      return pestDiseaseLayer(data, panchayat);
    case "cropHealth": {
      const ranking = cropHealthValuesByPanchayat(data);
      const entry = ranking.find((r) => r.panchayat === panchayat);
      if (!entry?.available)
        return { available: false, reason: entry?.reason ?? "unavailable" };
      return {
        available: true,
        value: entry.value,
        label: `${entry.value.toFixed(2)} (relative)`,
        color: valueToColor(entry.value, {
          min: 0,
          max: 1,
          colors: [
            RISK_COLORS.green,
            RISK_COLORS.yellow,
            RISK_COLORS.orange,
            RISK_COLORS.red,
          ],
        }),
      };
    }
    default:
      return { available: false, reason: `unknown layer "${layerKey}"` };
  }
}

/**
 * @param {object|null} data
 * @param {string} layerKey
 * @returns {Record<string, ReturnType<typeof selectRiskLayerForPanchayat>>}
 */
export function selectRiskLayerForAllPanchayats(data, layerKey) {
  const panchayats = data?.panchayats ?? [];
  return Object.fromEntries(
    panchayats.map((p) => [p, selectRiskLayerForPanchayat(data, layerKey, p)]),
  );
}
