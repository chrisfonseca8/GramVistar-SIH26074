import { computeIrrigationWindow } from "@/lib/calculations/irrigationWindow";
import { computeSprayWindow } from "@/lib/calculations/sprayWindow";
import { computeFertilizerWindow } from "@/lib/calculations/fertilizerWindow";
import { computeHarvestWindow } from "@/lib/calculations/harvestWindow";
import { computeLivestockAdvisory } from "@/lib/calculations/livestockAdvisory";
import { unavailable } from "@/lib/calculations/result";

/**
 * The reusable decision-card rule engine:
 *
 * thresholds + forecast + crop stage → decision rule → YES/NO
 *
 * `evaluateDecision(action, context)` is the single entry point every
 * decision-card consumer (Farmer home, and any future portal) should go
 * through instead of calling an individual `compute*Window` function
 * directly — it's the one place that knows which calculation backs which
 * action, so a caller doesn't need to. Each underlying rule is a pure,
 * already-independently-testable function from `src/lib/calculations/`;
 * this module only dispatches to them, it contains no decision logic of
 * its own.
 *
 * Every rule returns the same shape as every other calculation in this
 * app (`{ value, unit, available }` from `src/lib/calculations/result.js`),
 * normalized here to `{ decision: boolean, reasons: string[] }` so a
 * caller doesn't need to know each rule's own field name for its
 * yes/no value (`irrigate`, `favorable`, `actionNeeded`,...).
 */
export const DECISION_ACTIONS = [
  "irrigation",
  "spray",
  "fertilizer",
  "harvest",
  "livestock",
];

/**
 * @typedef {{
 * forecast: {
 * soilMoisture?: number|null,
 * rainProbabilityPct?: number|null,
 * windSpeedKmh?: number|null,
 * temperatureC?: number|null,
 * humidityPct?: number|null,
 * },
 * cropStage?: string|null,
 * thresholds?: object,
 * }} DecisionContext
 */

/**
 * @param {string} action one of `DECISION_ACTIONS`
 * @param {DecisionContext} context
 * @returns {{ available: boolean, decision: boolean|null, reasons: string[], reason?: string }}
 */
export function evaluateDecision(action, context) {
  const result = runRule(action, context);

  if (!result.available) {
    return {
      available: false,
      decision: null,
      reasons: [],
      reason: result.reason,
    };
  }

  return {
    available: true,
    decision: Boolean(result.value.decision),
    reasons: result.value.reasons,
  };
}

function runRule(
  action,
  { forecast = {}, cropStage = null, thresholds = {} } = {},
) {
  switch (action) {
    case "irrigation": {
      const result = computeIrrigationWindow({
        soilMoisture: forecast.soilMoisture,
        rainProbabilityPct: forecast.rainProbabilityPct,
        ...thresholds,
      });
      return remapDecisionField(result, "irrigate");
    }

    case "spray": {
      const result = computeSprayWindow({
        windSpeedKmh: forecast.windSpeedKmh,
        rainProbabilityPct: forecast.rainProbabilityPct,
        tempC: forecast.temperatureC,
        ...thresholds,
      });
      return remapDecisionField(result, "favorable");
    }

    case "fertilizer": {
      const result = computeFertilizerWindow({
        rainProbabilityPct: forecast.rainProbabilityPct,
        windSpeedKmh: forecast.windSpeedKmh,
        cropStage,
        ...thresholds,
      });
      return remapDecisionField(result, "favorable");
    }

    case "harvest": {
      const result = computeHarvestWindow({
        cropStage,
        rainProbabilityPct: forecast.rainProbabilityPct,
        ...thresholds,
      });
      return remapDecisionField(result, "favorable");
    }

    case "livestock": {
      const result = computeLivestockAdvisory({
        tempC: forecast.temperatureC,
        humidityPct: forecast.humidityPct,
        ...thresholds,
      });
      return remapDecisionField(result, "actionNeeded");
    }

    default:
      return unavailable(
        "decision/reasons",
        `unknown decision action "${action}"`,
      );
  }
}

function remapDecisionField(result, fieldName) {
  if (!result.available) return result;
  const { [fieldName]: decision, ...rest } = result.value;
  return { ...result, value: { decision, ...rest } };
}
