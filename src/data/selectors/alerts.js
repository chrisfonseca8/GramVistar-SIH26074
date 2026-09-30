import { selectForecastPanchayat } from "@/data/selectors";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";
import { computeHeatIndex } from "@/lib/calculations/heatIndex";

const HEAVY_RAIN_PROBABILITY_THRESHOLD_PCT = 80;
const HEAT_INDEX_DANGER_THRESHOLD_C = 41; // NOAA "danger" category, converted to Celsius

/**
 * @typedef {{ panchayat: string, severity: "yellow"|"orange"|"red", type: string, message: string, code: "frost"|"heavyRain"|"heatStress", data: object }} BlockAlert
 */

/**
 * The actual alert derivation, for one panchayat's current forecast hour
 * — shared by `selectBlockAlerts` (loops this over every panchayat, for
 * the Scientist Block Overview) and `selectPanchayatAlerts` (this
 * panchayat only, for the Farmer home screen), so the two
 * portals can never silently drift onto different alert logic.
 * @param {string} panchayat
 * @param {object} current one forecast row (from `selectForecastPanchayat`)
 * @returns {BlockAlert[]}
 */
function computeAlertsForCurrentHour(panchayat, current) {
  const alerts = [];

  const frost = computeFrostRisk({ tempMinC: current.temperatureC });
  if (frost.available && frost.value !== "none") {
    alerts.push({
      panchayat,
      severity: frost.value === "warning" ? "red" : "yellow",
      type: "Frost Risk",
      message: `Frost ${frost.value} — current temperature ${current.temperatureC}°C`,
      // `code`/`data` let a consumer (the Farmer portal) rebuild this as a
      // translated string via i18next interpolation instead of using the
      // English `message` above directly — see `FarmerAlerts.js`.
      code: "frost",
      data: { level: frost.value, tempC: current.temperatureC },
    });
  }

  if (
    current.rainProbabilityPct != null &&
    current.rainProbabilityPct >= HEAVY_RAIN_PROBABILITY_THRESHOLD_PCT
  ) {
    alerts.push({
      panchayat,
      severity: "orange",
      type: "Heavy Rain Likely",
      message: `${current.rainProbabilityPct}% rain probability this hour`,
      code: "heavyRain",
      data: { pct: current.rainProbabilityPct },
    });
  }

  const heatIndex = computeHeatIndex({
    tempC: current.temperatureC,
    humidityPct: current.humidityPct,
  });
  if (heatIndex.available && heatIndex.value >= HEAT_INDEX_DANGER_THRESHOLD_C) {
    alerts.push({
      panchayat,
      severity: "red",
      type: "Heat Stress",
      message: `Heat index ${heatIndex.value.toFixed(1)}°C`,
      code: "heatStress",
      data: { value: heatIndex.value.toFixed(1) },
    });
  }

  return alerts;
}

/**
 * A lightweight, derived alert summary for the Block Overview dashboard —
 * built entirely from existing calculations (`computeFrostRisk`,
 * `computeHeatIndex`) run against each panchayat's current forecast hour.
 * This is NOT the full alert escalation/notification system — no
 * persistence, no dissemination, just "is anything currently
 * worth flagging."
 * @param {object|null} data
 * @returns {BlockAlert[]}
 */
export function selectBlockAlerts(data) {
  const alerts = [];

  for (const panchayat of data?.panchayats ?? []) {
    const current = selectForecastPanchayat(data, panchayat)[0];
    if (!current) continue;
    alerts.push(...computeAlertsForCurrentHour(panchayat, current));
  }

  return alerts;
}

/**
 * Same alert logic as `selectBlockAlerts`, scoped to a single panchayat
 * (Farmer home) — a farmer only needs to see alerts for their
 * own panchayat, not the whole block.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {BlockAlert[]}
 */
export function selectPanchayatAlerts(data, panchayat) {
  const current = selectForecastPanchayat(data, panchayat)[0];
  if (!current) return [];
  return computeAlertsForCurrentHour(panchayat, current);
}
