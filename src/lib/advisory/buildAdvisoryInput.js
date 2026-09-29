import { selectForecastPanchayat } from "@/data/selectors";
import { selectDownscaledTemperatureSeries } from "@/data/selectors/downscaling";
import { selectTemperatureEnsembleFrames } from "@/data/selectors/ensemble";
import { selectBlockAlerts } from "@/data/selectors/alerts";
import { DEFAULT_CROP_THRESHOLDS } from "@/data/cropThresholds";
import { isFiniteNumber } from "@/lib/calculations/result";

const LOW_UNCERTAINTY_THRESHOLD_C = 0.05;
const MEDIUM_UNCERTAINTY_THRESHOLD_C = 0.2;

function classifyUncertainty(averageStdDevC) {
  if (!isFiniteNumber(averageStdDevC)) return "Unknown";
  if (averageStdDevC < LOW_UNCERTAINTY_THRESHOLD_C) return "Low";
  if (averageStdDevC < MEDIUM_UNCERTAINTY_THRESHOLD_C) return "Medium";
  return "High";
}

function withinRange(date, start, end) {
  return date instanceof Date && date >= start && date <= end;
}

/**
 * Assembles the structured advisory input object — the
 * payload the Gemini/mock generation step will consume.
 * Contains only panchayat/crop/stage/aggregate-weather/thresholds, never
 * farmer PII — there is no per-farmer data anywhere in
 * this app yet, so that's true by construction, not extra filtering here.
 *
 * `uncertainty.level` (Low/Medium/High) buckets the ensemble's average
 * standard deviation against illustrative thresholds (0.05°C / 0.2°C) —
 * documented defaults, not a calibrated meteorological standard.
 *
 * @param {{
 * data: object,
 * panchayat: string,
 * crop: string,
 * cropStage: string,
 * dateRange: { start: Date, end: Date },
 * cropThresholdsList?: typeof DEFAULT_CROP_THRESHOLDS,
 * }} params `cropThresholdsList` defaults to the unedited defaults; pass
 * `selectEffectiveCropThresholds(overrides)` so an edited
 * threshold is reflected in the advisory input, not just the editor.
 * @returns {object} the structured advisory input
 */
export function buildAdvisoryInput({
  data,
  panchayat,
  crop,
  cropStage,
  dateRange,
  cropThresholdsList = DEFAULT_CROP_THRESHOLDS,
}) {
  const forecast = selectForecastPanchayat(data, panchayat).filter((r) =>
    withinRange(r.date, dateRange.start, dateRange.end),
  );

  const downscaledTemperature = selectDownscaledTemperatureSeries(
    data,
    panchayat,
  ).filter((r) => withinRange(r.date, dateRange.start, dateRange.end));

  const ensembleFrames = selectTemperatureEnsembleFrames(
    data,
    panchayat,
  ).filter((f) => withinRange(f.date, dateRange.start, dateRange.end));
  const stdDevs = ensembleFrames
    .filter((f) => f.available)
    .map((f) => f.stdDev);
  const averageStdDevC =
    stdDevs.length > 0
      ? stdDevs.reduce((sum, v) => sum + v, 0) / stdDevs.length
      : null;

  const cropThresholds =
    cropThresholdsList.find((c) => c.crop === crop) ?? null;

  const relevantAlerts = selectBlockAlerts(data).filter(
    (a) => a.panchayat === panchayat,
  );

  return {
    panchayat,
    crop,
    cropStage,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
    forecast: forecast.map((r) => ({
      time: r.timeKey,
      temperatureC: r.temperatureC,
      rainProbabilityPct: r.rainProbabilityPct,
      humidityPct: r.humidityPct,
      soilMoisture: r.soilMoisture,
    })),
    downscaledValues: {
      temperatureC: downscaledTemperature.map((r) => ({
        time: r.timeKey,
        value: r.available ? r.value : null,
      })),
    },
    thresholds: cropThresholds
      ? {
          heatStressC: cropThresholds.heatStressC,
          coldStressC: cropThresholds.coldStressC,
          baseTempC: cropThresholds.baseTempC,
        }
      : null,
    uncertainty: { averageStdDevC, level: classifyUncertainty(averageStdDevC) },
    relevantAlerts,
    generatedAt: new Date().toISOString(),
  };
}
