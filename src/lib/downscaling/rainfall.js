import {
  available,
  unavailable,
  isFiniteNumber,
} from "@/lib/calculations/result";

/**
 * Orographic rainfall adjustment: scales block-level precipitation up or
 * down based on a panchayat's elevation relative to the block, using
 * available elevation, slope, and aspect data.
 *
 * Only elevation is actually usable from `/data` — there is no slope or
 * aspect layer, so this cannot distinguish a windward slope (where
 * orographic lift enhances rainfall) from a leeward one (where it doesn't,
 * or causes a rain shadow). The same enhancement factor is applied
 * regardless of direction, which is a known, documented simplification.
 * `aspectDeg`/`slopePercent` are accepted for forward compatibility but
 * currently unused.
 *
 * `orographicFactorPerKm` (default 0.2, i.e. a 20% change per 1000m of
 * elevation difference) is an assumed default, not a value calibrated to
 * this block — real orographic gradients vary enormously by region and
 * would need actual rain-gauge validation to calibrate properly.
 *
 * @param {{
 * precipitationBlockMm: number|null,
 * elevationBlockM: number|null,
 * elevationPanchayatM: number|null,
 * orographicFactorPerKm?: number,
 * slopePercent?: number|null,
 * aspectDeg?: number|null,
 * }} input
 * @returns {import("@/lib/calculations/result").CalcResult} value in mm
 */
export function adjustRainfallForElevation({
  precipitationBlockMm,
  elevationBlockM,
  elevationPanchayatM,
  orographicFactorPerKm = 0.2,
}) {
  if (!isFiniteNumber(precipitationBlockMm))
    return unavailable("mm", "missing precipitationBlockMm");
  if (!isFiniteNumber(elevationBlockM))
    return unavailable("mm", "missing elevationBlockM");
  if (!isFiniteNumber(elevationPanchayatM))
    return unavailable("mm", "missing elevationPanchayatM");

  const elevationDiffKm = (elevationPanchayatM - elevationBlockM) / 1000;
  const adjusted =
    precipitationBlockMm * (1 + orographicFactorPerKm * elevationDiffKm);

  return available(Math.max(0, adjusted), "mm");
}
