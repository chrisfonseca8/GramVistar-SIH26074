import { available, unavailable, isFiniteNumber } from "./result";

/**
 * A deliberately simple, general **illustrative** fungal/pest-disease
 * pressure indicator from temperature and humidity — NOT a validated,
 * species- or crop-specific pest model. No pest/disease dataset exists
 * anywhere in `/data`, and nothing that isn't there is fabricated,
 * so this reuses the widely-cited general agronomic heuristic that
 * sustained high humidity in a moderate temperature band favors fungal
 * pathogen development (blast, blight, rust and similar), the same
 * "illustrative, not authoritative" framing already used for the crop
 * heat/cold thresholds (`src/data/cropThresholds.js`) and Plot 10's demo
 * feature importance.
 *
 * @param {{ humidityPct: number|null, tempC: number|null, minHumidityPct?: number, minTempC?: number, maxTempC?: number }} input
 * @returns {import("./result").CalcResult} value is `{ level: "low"|"moderate"|"high", reasons: string[] }`
 */
export function computeFungalDiseaseRisk({
  humidityPct,
  tempC,
  minHumidityPct = 80,
  minTempC = 20,
  maxTempC = 30,
}) {
  if (!isFiniteNumber(humidityPct))
    return unavailable("level/reasons", "missing humidityPct");
  if (!isFiniteNumber(tempC))
    return unavailable("level/reasons", "missing tempC");

  const humidityFavorable = humidityPct >= minHumidityPct;
  const tempFavorable = tempC >= minTempC && tempC <= maxTempC;

  const reasons = [];
  let level = "low";

  if (humidityFavorable && tempFavorable) {
    level = "high";
    reasons.push(
      `humidity ${humidityPct}% and temperature ${tempC}°C are both in the range that favors fungal disease spread`,
    );
  } else if (humidityFavorable || tempFavorable) {
    level = "moderate";
    if (humidityFavorable)
      reasons.push(
        `humidity ${humidityPct}% is high enough to favor fungal disease spread`,
      );
    if (tempFavorable)
      reasons.push(
        `temperature ${tempC}°C is in the range that favors fungal disease spread`,
      );
  } else {
    reasons.push(
      "humidity and temperature are both outside the range that favors fungal disease spread",
    );
  }

  return available({ level, reasons }, "level/reasons");
}
