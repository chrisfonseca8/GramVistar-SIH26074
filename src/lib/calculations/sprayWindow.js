import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Whether conditions favor pesticide/fertilizer spraying, from spray-drift
 * risk (wind) and washout risk (rain). Thresholds default to widely-cited
 * general agronomic guidance (not crop- or product-specific) and are
 * overridable.
 *
 * @param {{
 * windSpeedKmh: number|null,
 * rainProbabilityPct: number|null,
 * tempC?: number|null,
 * maxWindKmh?: number,
 * maxRainProbabilityPct?: number,
 * minTempC?: number,
 * maxTempC?: number,
 * }} input
 * @returns {import("./result").CalcResult} value is `{ favorable: boolean, reasons: string[] }`
 */
export function computeSprayWindow({
  windSpeedKmh,
  rainProbabilityPct,
  tempC = null,
  maxWindKmh = 15,
  maxRainProbabilityPct = 30,
  minTempC = 10,
  maxTempC = 35,
}) {
  if (!isFiniteNumber(windSpeedKmh))
    return unavailable("favorable/reasons", "missing windSpeedKmh");
  if (!isFiniteNumber(rainProbabilityPct)) {
    return unavailable("favorable/reasons", "missing rainProbabilityPct");
  }

  const reasons = [];
  if (windSpeedKmh > maxWindKmh) {
    reasons.push(
      `wind ${windSpeedKmh}km/h exceeds ${maxWindKmh}km/h drift-risk limit`,
    );
  }
  if (rainProbabilityPct > maxRainProbabilityPct) {
    reasons.push(
      `rain probability ${rainProbabilityPct}% exceeds ${maxRainProbabilityPct}% washout-risk limit`,
    );
  }
  if (isFiniteNumber(tempC) && (tempC < minTempC || tempC > maxTempC)) {
    reasons.push(
      `temperature ${tempC}°C outside ${minTempC}-${maxTempC}°C application range`,
    );
  }

  return available(
    { favorable: reasons.length === 0, reasons },
    "favorable/reasons",
  );
}
