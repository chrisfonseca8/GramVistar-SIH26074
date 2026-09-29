const CONCERN_TO_PRIORITY = { high: "High", medium: "Medium", low: "Low" };

const HAZARD_ACTION_TEXT = {
  water:
    "Assess drinking-water and irrigation supply and put tanker/relief-water deployment on standby.",
  drought:
    "Review relief-stock and MGNREGA-works readiness; consider circulating a drought advisory.",
  flood:
    "Check shelter, evacuation and embankment/pump readiness; monitor drainage-prone areas.",
  heatwave:
    "Put cooling-center and water-supply readiness on standby; consider adjusted work-hour guidance.",
  coldWave:
    "Review relief-stock and shelter readiness; consider a cold-protection advisory.",
  pestDisease:
    "Coordinate with the KVK on quarantine/pesticide response if the pressure continues to rise.",
  cropHealth:
    "Monitor closely — composite crop-health indicators suggest elevated stress across factors.",
};

/**
 * Deterministically derives a mock Government/DM-DC advisory from the
 * structured authority input, reusing only the values already in it — no
 * randomness, no invented values. Same input always produces the same
 * output.
 *
 * Unlike the Farmer mock generator, this reasons over panchayat-wide
 * hazard `concern` levels (water/irrigation, drought, flood, heatwave,
 * cold wave, pest/disease, crop health) and active alerts, not
 * crop-specific thresholds.
 *
 * @param {object} authorityInput the output of `buildAuthorityAdvisoryInput()`
 * @returns {object} matches the schema in src/lib/prompts/advisoryPrompt.js
 */
export function generateMockAuthorityAdvisory(authorityInput) {
  const actions = [];
  const reasons = [];

  const concerning = authorityInput.hazards
    .filter((h) => h.concern === "high" || h.concern === "medium")
    .sort((a, b) => (a.concern === "high" ? -1 : 1) - (b.concern === "high" ? -1 : 1));

  for (const hazard of concerning) {
    actions.push({
      title: `${hazard.label}: ${hazard.concern === "high" ? "act now" : "monitor"}`,
      description: HAZARD_ACTION_TEXT[hazard.key] ?? `Review ${hazard.label} status for this panchayat.`,
      priority: CONCERN_TO_PRIORITY[hazard.concern],
    });
    reasons.push(
      `${hazard.label}: ${hazard.detail ?? "no detail"} (${hazard.concern} concern).`,
    );
  }

  if (authorityInput.activeAlerts.length > 0) {
    for (const alert of authorityInput.activeAlerts) {
      reasons.push(`Active alert: ${alert.type} — ${alert.message}.`);
    }
  }

  if (authorityInput.vulnerability?.available) {
    reasons.push(
      `Vulnerability ranking: #${authorityInput.vulnerability.rank} of ${authorityInput.vulnerability.outOf} panchayats (higher rank = more vulnerable).`,
    );
    if (authorityInput.vulnerability.rank <= 2) {
      actions.push({
        title: "Prioritize this panchayat in resource planning",
        description: `Ranks among the most vulnerable panchayats (#${authorityInput.vulnerability.rank} of ${authorityInput.vulnerability.outOf}).`,
        priority: "Medium",
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      title: "No administrative action needed",
      description:
        "No hazard currently shows elevated concern for this panchayat — routine monitoring is sufficient.",
      priority: "Low",
    });
    reasons.push(
      "All tracked hazards are at their baseline (no/low concern) level.",
    );
  }

  const summary =
    `${authorityInput.panchayat}: ${actions[0].title.toLowerCase()}. ${actions.length > 1 ? `${actions.length - 1} additional administrative item(s) below.` : ""}`.trim();

  const highConcernCount = authorityInput.hazards.filter(
    (h) => h.concern === "high",
  ).length;

  return {
    language: "en",
    summary,
    actions,
    reasons,
    confidence: highConcernCount > 0 ? "High" : "Medium",
  };
}
