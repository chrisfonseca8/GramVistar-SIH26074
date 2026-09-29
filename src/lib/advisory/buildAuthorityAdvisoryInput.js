import { RISK_LAYERS, selectRiskLayerForPanchayat } from "@/data/selectors/riskMaps";
import { selectPanchayatAlerts } from "@/data/selectors/alerts";
import { selectPanchayatVulnerabilityRanking } from "@/data/selectors/vulnerability";
import { DISASTER_MODULES } from "@/data/disasterMeasures";

/**
 * Normalizes each `RISK_LAYERS` result onto one shared `concern` scale
 * (`"none"|"low"|"medium"|"high"`) so downstream code (the mock generator,
 * the LLM prompt) doesn't need to know each layer's own level vocabulary
 * or, for "water", that its "severe" level actually means *plentiful*
 * water (inverted framing — see `riskMaps.js`'s `waterLayer()`), not a
 * hazard.
 * @param {string} layerKey
 * @param {{ available: boolean, level?: string, value?: number }} result
 * @returns {"none"|"low"|"medium"|"high"}
 */
function concernLevel(layerKey, result) {
  if (!result.available) return "none";

  if (layerKey === "water") {
    // Inverted: "none" (no deficit left → water scarce) is the concerning end.
    if (result.level === "none") return "high";
    if (result.level === "watch") return "low";
    return "none";
  }

  if (layerKey === "cropHealth") {
    if (typeof result.value !== "number") return "none";
    if (result.value >= 0.8) return "high";
    if (result.value >= 0.6) return "medium";
    if (result.value >= 0.33) return "low";
    return "none";
  }

  switch (result.level) {
    case "severe":
    case "warning":
    case "high":
      return "high";
    case "moderate":
      return "medium";
    case "watch":
      return "low";
    default:
      return "none";
  }
}

/**
 * Assembles the structured input for a Government/DM-DC advisory — a
 * panchayat-level operational briefing, not a crop-specific one. No
 * crop/crop-stage/timeline is involved (unlike the Farmer advisory's
 * input): this reuses the app's own real hazard, alert and vulnerability
 * calculations for "now", the same numbers the Risk Maps and Disaster
 * Management pages show.
 *
 * Covers: water/irrigation availability, every tracked hazard (drought,
 * flood, heatwave, cold wave, pest/disease, crop health), active alerts,
 * and the panchayat's relative vulnerability ranking — everything a
 * DM/DC needs to weigh for that panchayat, sourced entirely from data
 * already computed elsewhere in the app.
 *
 * @param {{ data: object, panchayat: string }} params
 * @returns {object} the structured authority advisory input
 */
export function buildAuthorityAdvisoryInput({ data, panchayat }) {
  const hazards = RISK_LAYERS.map((layer) => {
    const result = selectRiskLayerForPanchayat(data, layer.key, panchayat);
    const measures =
      DISASTER_MODULES.find((m) => m.key === layer.key)?.measures ?? [];
    return {
      key: layer.key,
      label: layer.label,
      available: result.available,
      level: result.available ? (result.level ?? null) : null,
      value: result.available ? (result.value ?? null) : null,
      detail: result.available ? result.label : (result.reason ?? null),
      concern: concernLevel(layer.key, result),
      responseMeasuresTracked: measures,
    };
  });

  const activeAlerts = selectPanchayatAlerts(data, panchayat);

  const vulnerabilityRanking = selectPanchayatVulnerabilityRanking(data);
  const vulnerabilityRank = vulnerabilityRanking.findIndex(
    (entry) => entry.panchayat === panchayat,
  );
  const vulnerabilityEntry =
    vulnerabilityRank >= 0 ? vulnerabilityRanking[vulnerabilityRank] : null;

  return {
    panchayat,
    hazards,
    activeAlerts,
    vulnerability: vulnerabilityEntry
      ? {
          rank: vulnerabilityRank + 1,
          outOf: vulnerabilityRanking.length,
          available: vulnerabilityEntry.available,
          value: vulnerabilityEntry.available ? vulnerabilityEntry.value : null,
        }
      : null,
    generatedAt: new Date().toISOString(),
  };
}
