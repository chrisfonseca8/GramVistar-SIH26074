/**
 * Baseline parameters for the surrogate downscaling engine — the same
 * defaults used by `downscaleTemperatureByElevation`, `interpolateIdw`,
 * `adjustRainfallForElevation` and `adjustSoilMoistureForPanchayat` when
 * called without overrides.
 */
export const BASELINE_PARAMETERS = {
  lapseRateCPerKm: 6.5,
  idwPower: 2,
  orographicFactorPerKm: 0.2,
  soilAdjustmentScale: 1,
};

/**
 * Nine deterministic "one at a time" parameter variants:
 * a baseline plus a low/high perturbation of each of the four tunable
 * knobs, holding the other three at baseline. This is NOT a physically
 * sourced meteorological ensemble (no alternate weather scenarios are
 * modeled) — it only measures how sensitive the surrogate downscaling
 * output is to its own assumed parameters. Every member is individually
 * identifiable by `id`/`label`.
 *
 * @type {{ id: string, label: string, lapseRateCPerKm: number, idwPower: number, orographicFactorPerKm: number, soilAdjustmentScale: number }[]}
 */
export const DEFAULT_ENSEMBLE_VARIANTS = [
  { id: "baseline", label: "Baseline", ...BASELINE_PARAMETERS },
  {
    id: "lapse-rate-low",
    label: "Lower lapse rate (5.5°C/km)",
    ...BASELINE_PARAMETERS,
    lapseRateCPerKm: 5.5,
  },
  {
    id: "lapse-rate-high",
    label: "Higher lapse rate (7.5°C/km)",
    ...BASELINE_PARAMETERS,
    lapseRateCPerKm: 7.5,
  },
  {
    id: "idw-power-low",
    label: "Lower IDW power (1)",
    ...BASELINE_PARAMETERS,
    idwPower: 1,
  },
  {
    id: "idw-power-high",
    label: "Higher IDW power (3)",
    ...BASELINE_PARAMETERS,
    idwPower: 3,
  },
  {
    id: "orographic-low",
    label: "Weaker orographic factor (0.1/km)",
    ...BASELINE_PARAMETERS,
    orographicFactorPerKm: 0.1,
  },
  {
    id: "orographic-high",
    label: "Stronger orographic factor (0.3/km)",
    ...BASELINE_PARAMETERS,
    orographicFactorPerKm: 0.3,
  },
  {
    id: "soil-adjustment-low",
    label: "Weaker soil adjustment (×0.5)",
    ...BASELINE_PARAMETERS,
    soilAdjustmentScale: 0.5,
  },
  {
    id: "soil-adjustment-high",
    label: "Stronger soil adjustment (×1.5)",
    ...BASELINE_PARAMETERS,
    soilAdjustmentScale: 1.5,
  },
];
