import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Relative humidity from air temperature and dew point, via the
 * Magnus-Tetens approximation:
 *
 * RH = 100 * exp(17.625·Td / (243.04+Td)) / exp(17.625·T / (243.04+T))
 *
 * No file in `/data` provides dew point (historical has no humidity-related
 * field at all; the panchayat forecast already provides `Humidity_Pct`
 * directly, so it needs no derivation). This function exists so the
 * calculation is implemented and unit-tested per the planned engine, but
 * calling it against our actual data sources will currently always report
 * unavailable — there is no `dewPointC` anywhere to pass in.
 *
 * @param {{ tempC: number|null, dewPointC: number|null }} input
 * @returns {import("./result").CalcResult} value in % (0-100)
 */
export function estimateRelativeHumidityFromDewPoint({ tempC, dewPointC }) {
  if (!isFiniteNumber(tempC)) return unavailable("%", "missing tempC");
  if (!isFiniteNumber(dewPointC)) return unavailable("%", "missing dewPointC");
  if (dewPointC > tempC)
    return unavailable("%", "dewPointC cannot exceed tempC");

  const magnus = (t) => Math.exp((17.625 * t) / (243.04 + t));
  const rh = 100 * (magnus(dewPointC) / magnus(tempC));

  return available(Math.min(100, Math.max(0, rh)), "%");
}
