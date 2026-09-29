import { selectForecastPanchayat } from "@/data/selectors";
import { computeHeatIndex } from "@/lib/calculations/heatIndex";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";
import { computeFungalDiseaseRisk } from "@/lib/calculations/fungalDiseaseRisk";
import { selectWeeklyOperationsOutlook } from "@/data/selectors/farmerHome";

const HOURLY_RAIN_HOURS = 6;

/**
 * Today's Weather card — the current forecast hour's raw
 * readings, with no derived interpretation. Plain numbers + units only;
 * the interpretive cards (Heat/Cold Stress, Pest/Disease, etc.) are
 * separate so this one stays a simple "what is it doing right now" fact
 * card.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {object|null}
 */
export function selectTodaysWeather(data, panchayat) {
  return selectForecastPanchayat(data, panchayat)[0] ?? null;
}

/**
 * Hourly Rain Probability card — the next few individual
 * forecast hours, genuinely hour-by-hour (unlike the daypart-bucketed
 * "Rain Chance Today" card, which exists specifically to
 * satisfy the mobile "touch targets" requirement). This card is a
 * short, fixed-length list rather than a chart, so it stays simple.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ date: Date, rainProbabilityPct: number|null }[]}
 */
export function selectHourlyRainProbability(data, panchayat) {
  return selectForecastPanchayat(data, panchayat)
    .slice(0, HOURLY_RAIN_HOURS)
    .map((r) => ({ date: r.date, rainProbabilityPct: r.rainProbabilityPct }));
}

/**
 * Heat/Cold Stress card — the current heat-index and
 * frost-risk *status*, reusing the existing `computeHeatIndex`/
 * `computeFrostRisk`. Distinct from the Alerts card, which only surfaces something when it crosses a danger
 * threshold — this card always shows the current status, even when it's
 * fine, so "nothing to worry about right now" is itself visible
 * information rather than an absence of one.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ heatIndex: import("@/lib/calculations/result").CalcResult, frostRisk: import("@/lib/calculations/result").CalcResult } | null}
 */
export function selectHeatColdStress(data, panchayat) {
  const current = selectForecastPanchayat(data, panchayat)[0];
  if (!current) return null;

  return {
    heatIndex: computeHeatIndex({
      tempC: current.temperatureC,
      humidityPct: current.humidityPct,
    }),
    frostRisk: computeFrostRisk({ tempMinC: current.temperatureC }),
  };
}

/**
 * Pest/Disease card — see `computeFungalDiseaseRisk`'s own
 * documentation for why this is an illustrative general heuristic, not a
 * validated species-specific pest model (no pest/disease dataset exists
 * anywhere in `/data`).
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {import("@/lib/calculations/result").CalcResult | null}
 */
export function selectPestDiseaseRisk(data, panchayat) {
  const current = selectForecastPanchayat(data, panchayat)[0];
  if (!current) return null;

  return computeFungalDiseaseRisk({
    humidityPct: current.humidityPct,
    tempC: current.temperatureC,
  });
}

/**
 * Irrigation Schedule card — a plain-language, day-by-day
 * view of the same irrigation decision `selectWeeklyOperationsOutlook`
 * already computes, reused rather than recomputed so the two
 * cards can never disagree about which days need irrigation.
 * @param {object|null} data
 * @param {string} panchayat
 * @returns {{ dateKey: string, irrigate: import("@/lib/calculations/result").CalcResult }[]}
 */
export function selectIrrigationSchedule(data, panchayat) {
  return selectWeeklyOperationsOutlook(data, panchayat).map((day) => ({
    dateKey: day.dateKey,
    irrigate: day.irrigate,
  }));
}
