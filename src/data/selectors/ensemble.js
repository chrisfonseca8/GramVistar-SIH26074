import { selectBlockElevation } from "@/data/selectors/downscaling";
import {
  runTemperatureEnsemble,
  runRainfallEnsemble,
} from "@/lib/downscaling/ensemble";
import { buildTemporalFrames } from "@/lib/downscaling/temporalFrames";
import { DEFAULT_ENSEMBLE_VARIANTS } from "@/lib/downscaling/ensembleVariants";

/**
 * Runs the temperature uncertainty ensemble for one panchayat at every
 * hour of the block forecast — animation-ready frames, each carrying the
 * ensemble mean/stdDev/members for that hour.
 *
 * @param {object|null} data
 * @param {string} panchayat
 * @param {object[]} [variants]
 * @returns {(import("@/lib/downscaling/temporalFrames").FrameTiming & import("@/lib/downscaling/ensemble").EnsembleResult)[]}
 */
export function selectTemperatureEnsembleFrames(
  data,
  panchayat,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  const elevationBlockM = selectBlockElevation(data);
  const elevationPanchayatM =
    data?.elevationSummaryByPanchayat?.[panchayat]?.meanElevationM ?? null;
  const forecastBlock = data?.forecastBlock ?? [];

  return buildTemporalFrames(forecastBlock, (record) =>
    runTemperatureEnsemble(
      { tempBlockC: record.temperatureC, elevationBlockM, elevationPanchayatM },
      variants,
    ),
  );
}

/**
 * Same as `selectTemperatureEnsembleFrames`, for rainfall.
 * @param {object|null} data
 * @param {string} panchayat
 * @param {object[]} [variants]
 * @returns {(import("@/lib/downscaling/temporalFrames").FrameTiming & import("@/lib/downscaling/ensemble").EnsembleResult)[]}
 */
export function selectRainfallEnsembleFrames(
  data,
  panchayat,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  const elevationBlockM = selectBlockElevation(data);
  const elevationPanchayatM =
    data?.elevationSummaryByPanchayat?.[panchayat]?.meanElevationM ?? null;
  const forecastBlock = data?.forecastBlock ?? [];

  return buildTemporalFrames(forecastBlock, (record) =>
    runRainfallEnsemble(
      {
        precipitationBlockMm: record.precipitationMm,
        elevationBlockM,
        elevationPanchayatM,
      },
      variants,
    ),
  );
}

/**
 * The same temperature ensemble frames as `selectTemperatureEnsembleFrames`,
 * computed for every panchayat at once — the shape a map-based animation
 * needs: one frame per hour, each holding every panchayat's
 * ensemble result for that hour.
 *
 * @param {object|null} data
 * @param {object[]} [variants]
 * @returns {{ index: number, timeKey: string|null, date: Date|null, byPanchayat: Record<string, import("@/lib/downscaling/ensemble").EnsembleResult> }[]}
 */
export function selectTemperatureEnsembleFramesAllPanchayats(
  data,
  variants = DEFAULT_ENSEMBLE_VARIANTS,
) {
  const elevationBlockM = selectBlockElevation(data);
  const panchayats = data?.panchayats ?? [];
  const forecastBlock = data?.forecastBlock ?? [];

  return buildTemporalFrames(forecastBlock, (record) => {
    const byPanchayat = {};
    for (const panchayat of panchayats) {
      const elevationPanchayatM =
        data?.elevationSummaryByPanchayat?.[panchayat]?.meanElevationM ?? null;
      byPanchayat[panchayat] = runTemperatureEnsemble(
        {
          tempBlockC: record.temperatureC,
          elevationBlockM,
          elevationPanchayatM,
        },
        variants,
      );
    }
    return { byPanchayat };
  });
}
