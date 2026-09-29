import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Validates/normalizes a raw wind-speed forecast value. A passthrough, not
 * a derivation — `panchayat_expanded_agro_forecast.csv` already provides
 * `Wind_Speed_kmh` directly; the block-level forecast does not.
 * @param {{ windSpeedKmh: number|null }} input
 * @returns {import("./result").CalcResult} value in km/h
 */
export function getWindSpeed({ windSpeedKmh }) {
  if (!isFiniteNumber(windSpeedKmh)) {
    return unavailable(
      "km/h",
      "missing windSpeedKmh (not provided by this forecast source)",
    );
  }
  if (windSpeedKmh < 0)
    return unavailable("km/h", "windSpeedKmh cannot be negative");
  return available(windSpeedKmh, "km/h");
}

/**
 * Wind direction has no source or derivable basis anywhere in `/data`
 * (no direction field, no u/v wind components, nothing temperature or
 * precipitation can determine it from) — always reports unavailable
 * rather than fabricating a direction. Exists so every planned derived
 * variable has an explicit, documented implementation, returning a
 * controlled unavailable result instead.
 * @returns {import("./result").CalcResult}
 */
export function getWindDirection() {
  return unavailable(
    "compass degrees",
    "no wind direction data source in /data",
  );
}
