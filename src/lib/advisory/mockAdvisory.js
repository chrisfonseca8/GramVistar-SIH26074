import { isFiniteNumber } from "@/lib/calculations/result";

const UNCERTAINTY_TO_CONFIDENCE = {
  Low: "High",
  Medium: "Medium",
  High: "Low",
  Unknown: "Low",
};

function average(values) {
  const clean = values.filter(isFiniteNumber);
  if (clean.length === 0) return null;
  return clean.reduce((sum, v) => sum + v, 0) / clean.length;
}

/**
 * Deterministically derives a mock Farmer advisory from the structured
 * input, reusing only the numbers already in it — no randomness, no
 * invented values. Same input always produces the same output.
 *
 * This exists so the app works fully without a Gemini API key
 * and so the review/edit/publish workflow has
 * deterministic, testable content to work with.
 *
 * @param {object} advisoryInput the output of `buildAdvisoryInput()`
 * @returns {object} matches the schema in src/lib/prompts/advisoryPrompt.js
 */
export function generateMockAdvisory(advisoryInput) {
  const temps = advisoryInput.forecast.map((r) => r.temperatureC);
  const rainProbabilities = advisoryInput.forecast.map(
    (r) => r.rainProbabilityPct,
  );
  const maxTemp =
    temps.filter(isFiniteNumber).length > 0
      ? Math.max(...temps.filter(isFiniteNumber))
      : null;
  const minTemp =
    temps.filter(isFiniteNumber).length > 0
      ? Math.min(...temps.filter(isFiniteNumber))
      : null;
  const avgRainProbability = average(rainProbabilities);

  const thresholds = advisoryInput.thresholds;
  const heatBreach =
    isFiniteNumber(maxTemp) && thresholds && maxTemp >= thresholds.heatStressC;
  const coldBreach =
    isFiniteNumber(minTemp) && thresholds && minTemp <= thresholds.coldStressC;
  const rainLikely =
    isFiniteNumber(avgRainProbability) && avgRainProbability >= 60;

  const actions = [];
  const reasons = [];

  if (heatBreach) {
    actions.push({
      title: "Mitigate heat stress",
      description: `Provide shade/irrigation during peak heat for ${advisoryInput.crop}.`,
      priority: "High",
    });
    reasons.push(
      `Forecast max temperature ${maxTemp}°C meets or exceeds ${advisoryInput.crop}'s heat stress threshold of ${thresholds.heatStressC}°C.`,
    );
  }

  if (coldBreach) {
    actions.push({
      title: "Protect from cold stress",
      description: `Consider protective covers or delayed irrigation timing for ${advisoryInput.crop}.`,
      priority: "High",
    });
    reasons.push(
      `Forecast minimum temperature ${minTemp}°C meets or falls below ${advisoryInput.crop}'s cold stress threshold of ${thresholds.coldStressC}°C.`,
    );
  }

  if (rainLikely) {
    actions.push({
      title: "Delay spraying and fertilizer application",
      description:
        "Wait for a drier window before applying pesticide/fertilizer to avoid washout.",
      priority: "Medium",
    });
    reasons.push(
      `Average rain probability over the period is ${avgRainProbability.toFixed(0)}%.`,
    );
  }

  if (advisoryInput.relevantAlerts.length > 0) {
    for (const alert of advisoryInput.relevantAlerts) {
      reasons.push(`Active alert: ${alert.type} — ${alert.message}.`);
    }
  }

  if (actions.length === 0) {
    actions.push({
      title: "Proceed with routine field operations",
      description:
        "No heat, cold or heavy-rain conditions detected in the forecast window.",
      priority: "Low",
    });
    reasons.push(
      "No crop-threshold breaches or heavy-rain conditions found in the forecast window.",
    );
  }

  const summary =
    `${advisoryInput.panchayat}, ${advisoryInput.crop}: ${actions[0].title.toLowerCase()}. ${actions.length > 1 ? `${actions.length - 1} additional recommendation(s) below.` : ""}`.trim();

  return {
    language: "en",
    summary,
    actions,
    reasons,
    confidence:
      UNCERTAINTY_TO_CONFIDENCE[advisoryInput.uncertainty.level] ?? "Low",
  };
}
