/**
 * Advisory generation prompt.
 * Version identifier lets later logs know which prompt produced a
 * given advisory.
 */
export const ADVISORY_PROMPT_VERSION = "advisory-v3";

const AUDIENCE_BRIEF = {
  farmer: `You are drafting for a FARMER audience, for one specific crop. Keep
language plain and actionable — short imperative field actions (irrigate,
spray, delay, protect, etc.), no administrative or resource-planning
language.`,
  authority: `You are drafting for a GOVERNMENT/DM-DC (District Magistrate /
Deputy Commissioner) audience, about one panchayat as a whole — not any
single crop or farm. Cover irrigation/drinking-water availability,
disaster-relevant hazards (drought, flood, heatwave, cold wave, and any
other tracked hazard), and any other issue in the supplied data that
matters for administering that panchayat. Frame every action as an
administrative/resource decision (relief stock, water tanker deployment,
monitoring, advisories to circulate, response-measure readiness) — never
an individual farm task.`,
};

const SHARED_SYSTEM_PROMPT_HEADER = `You are an agro-meteorological advisory assistant for the Chas Block KVK (Krishi Vigyan Kendra) in Bokaro District, Jharkhand, India.

You draft short, practical advisories for a scientist to review before publication. You are a text-generation layer only — you do not perform weather forecasting, downscaling, risk-scoring, or any numerical calculation. All numbers and severity levels you are given have already been computed by the platform's own calculation engine.`;

const SHARED_SYSTEM_PROMPT_RULES = `Rules you must follow exactly:
- Use only the supplied information. Do not invent data, values, or claims not present in the input.
- If required information is missing or marked unavailable, say so explicitly rather than guessing.
- Never state or imply certainty beyond what the input's uncertainty/available data supports.
- Respond with a single JSON object only, matching this exact shape, and nothing else (no markdown fences, no commentary):
{
 "language": "en",
 "summary": "one or two plain-language sentences",
 "actions": [{ "title": "short imperative title", "description": "one sentence", "priority": "Low"| "Medium"| "High"}],
 "reasons": ["short factual statement citing a specific number or level from the input", "..."],
 "confidence": "Low"| "Medium"| "High"
}`;

/**
 * @param {"farmer"|"authority"} audience
 * @returns {string}
 */
export function buildAdvisorySystemPrompt(audience) {
  return `${SHARED_SYSTEM_PROMPT_HEADER}

${AUDIENCE_BRIEF[audience]}

${SHARED_SYSTEM_PROMPT_RULES}`;
}

/**
 * Builds the user-turn prompt for a Farmer advisory, from the structured
 * input (`buildAdvisoryInput()`'s output) — crop-specific, over a
 * timeline.
 * @param {object} advisoryInput
 * @returns {string}
 */
export function buildAdvisoryUserPrompt(advisoryInput) {
  return [
    `Panchayat: ${advisoryInput.panchayat}`,
    `Crop: ${advisoryInput.crop}, stage: ${advisoryInput.cropStage}`,
    `Date range: ${advisoryInput.dateRange.start} to ${advisoryInput.dateRange.end}`,
    `Crop thresholds: ${advisoryInput.thresholds ? JSON.stringify(advisoryInput.thresholds) : "unavailable"}`,
    `Forecast uncertainty level: ${advisoryInput.uncertainty.level}`,
    `Active alerts: ${advisoryInput.relevantAlerts.length > 0 ? JSON.stringify(advisoryInput.relevantAlerts) : "none"}`,
    "",
    "Full structured data (forecast hours, downscaled temperatures):",
    JSON.stringify({
      forecast: advisoryInput.forecast,
      downscaledValues: advisoryInput.downscaledValues,
    }),
    "",
    "Draft the advisory now, following the system prompt's JSON schema exactly.",
  ].join("\n");
}

/**
 * Builds the user-turn prompt for an Authority (DM/DC) advisory, from the
 * structured input (`buildAuthorityAdvisoryInput()`'s output) —
 * panchayat-level, not crop-specific.
 * @param {object} authorityInput
 * @returns {string}
 */
export function buildAuthorityAdvisoryUserPrompt(authorityInput) {
  return [
    `Panchayat: ${authorityInput.panchayat}`,
    `Active alerts: ${authorityInput.activeAlerts.length > 0 ? JSON.stringify(authorityInput.activeAlerts) : "none"}`,
    `Vulnerability ranking: ${authorityInput.vulnerability?.available ? `#${authorityInput.vulnerability.rank} of ${authorityInput.vulnerability.outOf} panchayats (higher = more vulnerable, value ${authorityInput.vulnerability.value.toFixed(2)})` : "unavailable"}`,
    "",
    "Hazard status (includes irrigation/drinking-water availability under 'water'):",
    JSON.stringify(authorityInput.hazards),
    "",
    "Draft the advisory now, following the system prompt's JSON schema exactly.",
  ].join("\n");
}
