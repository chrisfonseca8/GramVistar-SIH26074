import {
  selectBlockAlerts,
  selectPanchayatAlerts,
} from "@/data/selectors/alerts";
import { selectPanchayatVulnerabilityRanking } from "@/data/selectors/vulnerability";
import { selectRiskLayerForAllPanchayats } from "@/data/selectors/riskMaps";

const HAZARD_KEYS = ["drought", "flood", "heatwave", "coldWave", "pestDisease"];

/**
 * Assembles the structured input for a Government report,
 * reusing the exact same selectors every other portal view already reads
 * (alerts, vulnerability ranking, and risk layer severities, each reused
 * from their own selector) — no new data derivation, and no
 * per-farmer/PII data anywhere in this app for the same reason
 * `buildAdvisoryInput` has none.
 *
 * One shared input shape serves all 5 report types (situation/bulletin/
 * resource-plan/vulnerability-summary/action-checklist) — each report
 * type's prompt/mock generator selects which parts of this it actually
 * uses, rather than 5 separate input-assembly functions that would
 * mostly duplicate each other.
 *
 * @param {{ data: object, reportType: string, panchayat?: string|null }} params
 * @returns {object}
 */
export function buildReportInput({ data, reportType, panchayat = null }) {
  const alerts = panchayat
    ? selectPanchayatAlerts(data, panchayat)
    : selectBlockAlerts(data);
  const vulnerabilityRanking = selectPanchayatVulnerabilityRanking(data);
  const hazardSnapshot = HAZARD_KEYS.map((hazardKey) => ({
    hazard: hazardKey,
    byPanchayat: selectRiskLayerForAllPanchayats(data, hazardKey),
  }));

  return {
    reportType,
    scope: panchayat ?? "Chas Block",
    generatedAt: new Date().toISOString(),
    alerts,
    vulnerabilityRanking,
    hazardSnapshot,
  };
}
