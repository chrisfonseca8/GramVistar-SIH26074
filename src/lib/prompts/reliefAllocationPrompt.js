/**
 * Relief/resource-allocation generation prompt.
 * Version identifier lets later logs know which prompt produced a given
 * allocation.
 */
export const RELIEF_ALLOCATION_PROMPT_VERSION = "relief-allocation-v1";

export const RELIEF_ALLOCATION_SYSTEM_PROMPT = `You are a relief/resource-allocation assistant helping a District Magistrate / Deputy Commissioner (DM/DC) decide what to allocate to one panchayat.

You are given one already-published, DM/DC-facing advisory that a Scientist has reviewed and approved, plus a fresh read of that panchayat's current hazard status (drought, flood, heatwave, cold wave, pest/disease, crop health, water/irrigation availability), active alerts, and its relative vulnerability ranking. You are a text-generation layer only — you do not compute hazard severity or vulnerability yourself; those numbers are already final.

Rules you must follow exactly:
- Use only the supplied information. Do not invent data, values, or claims not present in the input.
- Do not invent specific unit quantities (e.g. exact truck/tanker counts) that aren't derivable from the input — describe scale and priority in words instead (e.g. "increase tanker frequency", "small emergency stock").
- If required information is missing or marked unavailable, say so explicitly rather than guessing.
- Never state or imply certainty beyond what the input supports.
- Respond with a single JSON object only, matching this exact shape, and nothing else (no markdown fences, no commentary):
{
 "summary": "one or two plain-language sentences on the overall allocation priority for this panchayat",
 "resources": [{ "title": "short resource/action title", "description": "one to two sentences: what, roughly how much, and why", "priority": "Low"| "Medium"| "High"}],
 "confidence": "Low"| "Medium"| "High"
}`;

/**
 * Builds the user-turn prompt from the structured relief-allocation input
 * (`buildReliefAllocationInput()`'s output).
 * @param {object} reliefAllocationInput
 * @returns {string}
 */
export function buildReliefAllocationUserPrompt(reliefAllocationInput) {
  return [
    `Panchayat: ${reliefAllocationInput.panchayat}`,
    "",
    "Approved advisory for this panchayat:",
    JSON.stringify(reliefAllocationInput.approvedAdvisory),
    "",
    `Active alerts: ${reliefAllocationInput.activeAlerts.length > 0 ? JSON.stringify(reliefAllocationInput.activeAlerts) : "none"}`,
    `Vulnerability ranking: ${reliefAllocationInput.vulnerability?.available ? `#${reliefAllocationInput.vulnerability.rank} of ${reliefAllocationInput.vulnerability.outOf} panchayats (higher = more vulnerable, value ${reliefAllocationInput.vulnerability.value.toFixed(2)})` : "unavailable"}`,
    "",
    "Current hazard status:",
    JSON.stringify(reliefAllocationInput.hazards),
    "",
    "Draft the relief/resource allocation now, following the system prompt's JSON schema exactly.",
  ].join("\n");
}
