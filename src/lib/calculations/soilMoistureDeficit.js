import { available, unavailable, isFiniteNumber } from "./result";

/**
 * Soil moisture deficit: how far current volumetric soil moisture sits
 * below field capacity. Both inputs must already be volumetric fractions
 * (m³/m³, the same unit our `Soil_Moisture_Avg`/`Soil_Moisture` fields
 * use) — this function does not convert units.
 *
 * @param {{ soilMoisture: number|null, fieldCapacity: number|null }} input
 * @returns {import("./result").CalcResult} value in m³/m³, 0 if soil is at/above field capacity
 */
export function computeSoilMoistureDeficit({ soilMoisture, fieldCapacity }) {
  if (!isFiniteNumber(soilMoisture))
    return unavailable("m³/m³", "missing soilMoisture");
  if (!isFiniteNumber(fieldCapacity))
    return unavailable("m³/m³", "missing fieldCapacity");

  return available(Math.max(0, fieldCapacity - soilMoisture), "m³/m³");
}

/**
 * Rough estimate of field capacity (as a volumetric fraction) from a
 * soil's available water capacity in mm per metre of depth — the unit our
 * `chas_panchayats_soil.csv` provides (`soil_water_capacity_mm_m`).
 *
 * ASSUMPTION (approximation, not a measured value): available water
 * capacity is treated as a stand-in for field capacity, and the mm-per-metre
 * figure is converted to a dimensionless fraction by dividing by 1000mm
 * (the water depth equivalent of 1m of soil). This conflates "available
 * water capacity" (field capacity minus wilting point) with field capacity
 * itself, which overstates how much moisture the soil can hold — treat the
 * result as a rough proxy, not a validated field-capacity measurement.
 *
 * @param {{ soilWaterCapacityMmPerM: number|null }} input
 * @returns {import("./result").CalcResult} value in m³/m³
 */
export function estimateFieldCapacityFraction({ soilWaterCapacityMmPerM }) {
  if (!isFiniteNumber(soilWaterCapacityMmPerM)) {
    return unavailable("m³/m³ (approx.)", "missing soilWaterCapacityMmPerM");
  }
  return available(soilWaterCapacityMmPerM / 1000, "m³/m³ (approx.)");
}
