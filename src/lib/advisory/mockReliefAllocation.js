const CONCERN_TO_PRIORITY = { high: "High", medium: "Medium", low: "Low" };

const HAZARD_RESOURCE_TEXT = {
  water:
    "Increase drinking-water/irrigation tanker frequency and pre-position an emergency water stock for this panchayat.",
  drought:
    "Release grain/fodder relief stock and prioritize MGNREGA works allocation for affected households.",
  flood:
    "Pre-position shelter capacity, evacuation transport and water pumps; keep embankment repair crews on standby.",
  heatwave:
    "Open/staff cooling centers and increase water-tanker rounds during peak heat hours.",
  coldWave:
    "Distribute blankets/warm-clothing relief stock and keep emergency shelter capacity available overnight.",
  pestDisease:
    "Allocate pesticide/quarantine supplies and coordinate a KVK response team visit.",
  cropHealth:
    "Flag this panchayat for closer field monitoring and prioritize it in the next resource review cycle.",
};

/**
 * Deterministically derives a mock relief/resource allocation from the
 * structured input, reusing only the values already in it (the approved
 * advisory's own actions plus each hazard's real `concern` level) — no
 * randomness, no invented quantities. Same input always produces the
 * same output.
 *
 * @param {object} reliefAllocationInput the output of `buildReliefAllocationInput()`
 * @returns {object} matches the schema in src/lib/prompts/reliefAllocationPrompt.js
 */
export function generateMockReliefAllocation(reliefAllocationInput) {
  const resources = [];

  const concerning = reliefAllocationInput.hazards
    .filter((h) => h.concern === "high" || h.concern === "medium")
    .sort((a, b) => (a.concern === "high" ? -1 : 1) - (b.concern === "high" ? -1 : 1));

  for (const hazard of concerning) {
    resources.push({
      title: `${hazard.label} response`,
      description:
        HAZARD_RESOURCE_TEXT[hazard.key] ??
        `Prioritize ${hazard.label.toLowerCase()} response resources for this panchayat.`,
      priority: CONCERN_TO_PRIORITY[hazard.concern],
    });
  }

  if (reliefAllocationInput.vulnerability?.available && reliefAllocationInput.vulnerability.rank <= 2) {
    resources.push({
      title: "Priority resource review",
      description: `This panchayat ranks #${reliefAllocationInput.vulnerability.rank} of ${reliefAllocationInput.vulnerability.outOf} in vulnerability — prioritize it ahead of lower-ranked panchayats when supply is limited.`,
      priority: "Medium",
    });
  }

  if (resources.length === 0) {
    resources.push({
      title: "No additional allocation needed",
      description:
        "No hazard currently shows elevated concern for this panchayat, and the approved advisory doesn't flag an urgent resource need — routine monitoring is sufficient.",
      priority: "Low",
    });
  }

  const highCount = reliefAllocationInput.hazards.filter(
    (h) => h.concern === "high",
  ).length;

  const summary = `${reliefAllocationInput.panchayat}: ${resources[0].title.toLowerCase()}. ${resources.length > 1 ? `${resources.length - 1} additional item(s) below.` : ""}`.trim();

  return {
    summary,
    resources,
    confidence: highCount > 0 ? "High" : "Medium",
  };
}
