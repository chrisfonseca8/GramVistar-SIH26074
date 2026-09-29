import { downscaleTemperatureByElevation } from "@/lib/downscaling/temperature";
import { adjustRainfallForElevation } from "@/lib/downscaling/rainfall";
import { adjustSoilMoistureForPanchayat } from "@/lib/downscaling/soilMoisture";
import { interpolateIdw } from "@/lib/downscaling/idw";
import { DEFAULT_ENSEMBLE_VARIANTS } from "@/lib/downscaling/ensembleVariants";

/**
 * @typedef {{ id: string, label: string, value: number|null, unit: string, available: boolean, reason?: string }} EnsembleMember
 * @typedef {{
 * kind: "surrogate_parameter_ensemble",
 * members: EnsembleMember[],
 * mean: number|null,
 * stdDev: number|null,
 * includedCount: number,
 * totalCount: number,
 * available: boolean,
 * reason?: string,
 * }} EnsembleResult
 */

/**
 * Runs `computeFn(variant)` once per ensemble variant and reduces the
 * results to a mean and sample standard deviation.
 *
 * `kind: "surrogate_parameter_ensemble"` is included on every result on
 * purpose — this must never be presented as a physically
 * sourced meteorological ensemble (e.g. multiple weather models); it is
 * only a sensitivity sweep over this app's own downscaling parameters.
 *
 * @param {{ id: string, label: string }[]} variants
 * @param {(variant: object) => import("@/lib/calculations/result").CalcResult} computeFn
 * @returns {EnsembleResult}
 */
export function runEnsemble(variants, computeFn) {
  /** @type {EnsembleMember[]} */
  const members = variants.map((variant) => {
    const result = computeFn(variant);
    return { id: variant.id, label: variant.label, ...result };
  });

  const validValues = members.filter((m) => m.available).map((m) => m.value);

  if (validValues.length === 0) {
    return {
      kind: "surrogate_parameter_ensemble",
      members,
      mean: null,
      stdDev: null,
      includedCount: 0,
      totalCount: members.length,
      available: false,
      reason: "no ensemble members available",
    };
  }

  const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  const variance =
    validValues.length > 1
      ? validValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
        (validValues.length - 1)
      : 0;

  return {
    kind: "surrogate_parameter_ensemble",
    members,
    mean,
    stdDev: Math.sqrt(variance),
    includedCount: validValues.length,
    totalCount: members.length,
    available: true,
  };
}

/**
 * Temperature ensemble: perturbs the lapse rate across `variants`,
 * holding the other downscaling parameters at each variant's own value
 * (which, for non-temperature knobs, is the baseline — see
 * `DEFAULT_ENSEMBLE_VARIANTS`).
 * @param {{ tempBlockC: number|null, elevationBlockM: number|null, elevationPanchayatM: number|null }} baseInput
 * @param {object[]} [variants]
 * @returns {EnsembleResult}
 */
export function runTemperatureEnsemble(
  baseInput,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  return runEnsemble(variants, (variant) =>
    downscaleTemperatureByElevation({
      ...baseInput,
      lapseRateCPerKm: variant.lapseRateCPerKm,
    }),
  );
}

/**
 * Rainfall ensemble: perturbs the orographic factor across `variants`.
 * @param {{ precipitationBlockMm: number|null, elevationBlockM: number|null, elevationPanchayatM: number|null }} baseInput
 * @param {object[]} [variants]
 * @returns {EnsembleResult}
 */
export function runRainfallEnsemble(
  baseInput,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  return runEnsemble(variants, (variant) =>
    adjustRainfallForElevation({
      ...baseInput,
      orographicFactorPerKm: variant.orographicFactorPerKm,
    }),
  );
}

/**
 * Soil moisture ensemble: perturbs the adjustment-magnitude scale across
 * `variants`.
 * @param {{ baseSoilMoisture: number|null, precipitationMm: number|null, et0MmPerDay: number|null, soilWaterCapacityMmPerM: number|null, slopePercent?: number|null }} baseInput
 * @param {object[]} [variants]
 * @returns {EnsembleResult}
 */
export function runSoilMoistureEnsemble(
  baseInput,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  return runEnsemble(variants, (variant) =>
    adjustSoilMoistureForPanchayat({
      ...baseInput,
      adjustmentScale: variant.soilAdjustmentScale,
    }),
  );
}

/**
 * Spatial-interpolation ensemble: perturbs the IDW power across
 * `variants`, at a single target location.
 * @param {{ longitude: number, latitude: number }} target
 * @param {{ longitude: number, latitude: number, value: number|null }[]} knownPoints
 * @param {object[]} [variants]
 * @returns {EnsembleResult}
 */
export function runIdwEnsemble(
  target,
  knownPoints,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  return runEnsemble(variants, (variant) =>
    interpolateIdw(target, knownPoints, { power: variant.idwPower }),
  );
}
