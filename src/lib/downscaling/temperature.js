import {
  available,
  unavailable,
  isFiniteNumber,
} from "@/lib/calculations/result";

/**
 * Downscales a block-level temperature to a panchayat using the standard
 * environmental lapse rate elevation correction:
 *
 * T_p = T_block - lapseRate * (Elev_p - Elev_block) / 1000
 *
 * The default lapse rate (6.5°C/km) is the international standard
 * atmosphere's average environmental lapse rate, not a value measured at
 * Chas Block — it's a widely used approximation, not a local calibration.
 *
 * @param {{ tempBlockC: number|null, elevationBlockM: number|null, elevationPanchayatM: number|null, lapseRateCPerKm?: number }} input
 * @returns {import("@/lib/calculations/result").CalcResult} value in °C
 */
export function downscaleTemperatureByElevation({
  tempBlockC,
  elevationBlockM,
  elevationPanchayatM,
  lapseRateCPerKm = 6.5,
}) {
  if (!isFiniteNumber(tempBlockC))
    return unavailable("°C", "missing tempBlockC");
  if (!isFiniteNumber(elevationBlockM))
    return unavailable("°C", "missing elevationBlockM");
  if (!isFiniteNumber(elevationPanchayatM))
    return unavailable("°C", "missing elevationPanchayatM");
  if (!isFiniteNumber(lapseRateCPerKm))
    return unavailable("°C", "missing lapseRateCPerKm");

  const value =
    tempBlockC -
    (lapseRateCPerKm * (elevationPanchayatM - elevationBlockM)) / 1000;
  return available(value, "°C");
}
