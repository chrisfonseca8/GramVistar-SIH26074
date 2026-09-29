import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Whether conditions favor harvesting: the crop must actually be at the
 * Harvest stage, and rain probability low enough to avoid harvesting wet
 * grain/produce (moisture damage, mold risk, and — for mechanical
 * harvest — equipment access). Illustrative default threshold, not a
 * crop- or equipment-specific standard.
 *
 * @param {{ cropStage: string|null, rainProbabilityPct: number|null, maxRainProbabilityPct?: number }} input
 * @returns {import("./result").CalcResult} value is `{ favorable: boolean, reasons: string[] }`
 */
export function computeHarvestWindow({
  cropStage,
  rainProbabilityPct,
  maxRainProbabilityPct = 30,
}) {
  if (!cropStage) return unavailable("favorable/reasons", "missing cropStage");
  if (!isFiniteNumber(rainProbabilityPct))
    return unavailable("favorable/reasons", "missing rainProbabilityPct");

  const reasons = [];
  if (cropStage !== "Harvest") {
    reasons.push(`crop is at ${cropStage} stage, not yet at Harvest stage`);
  }
  if (rainProbabilityPct > maxRainProbabilityPct) {
    reasons.push(
      `rain probability ${rainProbabilityPct}% exceeds ${maxRainProbabilityPct}% — risk of harvesting wet produce`,
    );
  }

  return available(
    { favorable: reasons.length === 0, reasons },
    "favorable/reasons",
  );
}
