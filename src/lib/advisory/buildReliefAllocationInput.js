import { buildAuthorityAdvisoryInput } from "@/lib/advisory/buildAuthorityAdvisoryInput";
import { getLatestVersionContent } from "@/data/selectors/publishedAdvisories";

/**
 * Assembles the structured input for a relief/resource-allocation
 * generation — built from one specific **published, DM/DC-approved**
 * advisory (its summary/actions/reasons, already reviewed by the
 * Scientist) plus a fresh read of that panchayat's current hazard data
 * (`buildAuthorityAdvisoryInput`, the same real numbers Risk Maps shows).
 * Nothing here is invented: the advisory content is exactly what was
 * published, and the hazard data is the app's own live calculation.
 *
 * @param {{ data: object, advisory: object }} params `advisory` is a
 * Published, `audience: "authority"` entry from `advisoryStore`
 * @returns {object} the structured relief-allocation input
 */
export function buildReliefAllocationInput({ data, advisory }) {
  const advisoryContent = getLatestVersionContent(advisory);
  const hazardInput = buildAuthorityAdvisoryInput({
    data,
    panchayat: advisory.panchayat,
  });

  return {
    panchayat: advisory.panchayat,
    approvedAdvisory: {
      summary: advisoryContent.summary,
      actions: advisoryContent.actions,
      reasons: advisoryContent.reasons,
      confidence: advisoryContent.confidence,
    },
    hazards: hazardInput.hazards,
    activeAlerts: hazardInput.activeAlerts,
    vulnerability: hazardInput.vulnerability,
    generatedAt: new Date().toISOString(),
  };
}
