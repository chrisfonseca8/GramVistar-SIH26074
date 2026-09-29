import { available, unavailable, isFiniteNumber } from "./result";

const DEFAULT_FAVORABLE_STAGES = ["Vegetative", "Flowering"];

/**
 * Whether conditions favor fertilizer application: the crop is in a
 * growth stage that actually needs nutrient input (illustrative default —
 * Vegetative/Flowering, not Sowing/Maturity/Harvest, since basal fertilizer
 * at sowing and post-maturity feeding are different concerns this
 * function doesn't model), and rain/wind are low enough to avoid washout
 * or uneven broadcast. Thresholds mirror `computeSprayWindow`'s washout
 * reasoning, since both are "don't apply something the weather will
 * immediately undo" checks.
 *
 * @param {{
 * rainProbabilityPct: number|null,
 * windSpeedKmh: number|null,
 * cropStage: string|null,
 * maxRainProbabilityPct?: number,
 * maxWindKmh?: number,
 * favorableStages?: string[],
 * }} input
 * @returns {import("./result").CalcResult} value is `{ favorable: boolean, reasons: string[] }`
 */
export function computeFertilizerWindow({
  rainProbabilityPct,
  windSpeedKmh,
  cropStage,
  maxRainProbabilityPct = 50,
  maxWindKmh = 20,
  favorableStages = DEFAULT_FAVORABLE_STAGES,
}) {
  if (!isFiniteNumber(rainProbabilityPct))
    return unavailable("favorable/reasons", "missing rainProbabilityPct");
  if (!isFiniteNumber(windSpeedKmh))
    return unavailable("favorable/reasons", "missing windSpeedKmh");
  if (!cropStage) return unavailable("favorable/reasons", "missing cropStage");

  const reasons = [];
  if (!favorableStages.includes(cropStage)) {
    reasons.push(
      `${cropStage} is not a stage this crop typically needs fertilizer at (favorable stages: ${favorableStages.join(", ")})`,
    );
  }
  if (rainProbabilityPct > maxRainProbabilityPct) {
    reasons.push(
      `rain probability ${rainProbabilityPct}% exceeds ${maxRainProbabilityPct}% washout-risk limit`,
    );
  }
  if (windSpeedKmh > maxWindKmh) {
    reasons.push(
      `wind ${windSpeedKmh}km/h exceeds ${maxWindKmh}km/h uneven-application limit`,
    );
  }

  return available(
    { favorable: reasons.length === 0, reasons },
    "favorable/reasons",
  );
}
