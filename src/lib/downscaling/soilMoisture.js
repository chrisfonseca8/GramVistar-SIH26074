import {
  available,
  unavailable,
  isFiniteNumber,
} from "@/lib/calculations/result";

/**
 * Adjusts a base (block-level) soil moisture estimate for a panchayat
 * using a simple water-balance approach — net water input from rainfall
 * minus evapotranspiration, normalized by the soil's available water
 * capacity — using available soil, slope, rainfall, and ET data.
 *
 * `slopePercent` is accepted for forward compatibility but currently has
 * no effect unless supplied: `/data` contains no slope layer (no DEM-derived
 * slope was computed from `panchayats_elevation.csv`), so the runoff
 * adjustment defaults to neutral (no runoff loss assumed) rather than
 * inventing a slope value.
 *
 * `adjustmentScale` (default 1) scales the magnitude of the computed
 * water-balance adjustment. It is not a physical quantity — it exists so
 * the uncertainty ensemble can perturb "how strongly the water
 * balance moves soil moisture" as one of its deterministic sensitivity
 * variants, without duplicating this function.
 *
 * @param {{
 * baseSoilMoisture: number|null,
 * precipitationMm: number|null,
 * et0MmPerDay: number|null,
 * soilWaterCapacityMmPerM: number|null,
 * slopePercent?: number|null,
 * adjustmentScale?: number,
 * }} input
 * @returns {import("@/lib/calculations/result").CalcResult} value in m³/m³, clamped to [0, 1]
 */
export function adjustSoilMoistureForPanchayat({
  baseSoilMoisture,
  precipitationMm,
  et0MmPerDay,
  soilWaterCapacityMmPerM,
  slopePercent = null,
  adjustmentScale = 1,
}) {
  if (!isFiniteNumber(baseSoilMoisture))
    return unavailable("m³/m³", "missing baseSoilMoisture");
  if (!isFiniteNumber(precipitationMm))
    return unavailable("m³/m³", "missing precipitationMm");
  if (!isFiniteNumber(et0MmPerDay))
    return unavailable("m³/m³", "missing et0MmPerDay");
  if (
    !isFiniteNumber(soilWaterCapacityMmPerM) ||
    soilWaterCapacityMmPerM <= 0
  ) {
    return unavailable("m³/m³", "missing/invalid soilWaterCapacityMmPerM");
  }
  if (!isFiniteNumber(adjustmentScale))
    return unavailable("m³/m³", "invalid adjustmentScale");

  const netWaterMm = precipitationMm - et0MmPerDay;
  const fractionChange = netWaterMm / soilWaterCapacityMmPerM;
  const runoffFactor = isFiniteNumber(slopePercent)
    ? Math.max(0, 1 - slopePercent / 100)
    : 1;

  const adjusted =
    baseSoilMoisture + fractionChange * runoffFactor * adjustmentScale;
  return available(Math.min(1, Math.max(0, adjusted)), "m³/m³");
}
