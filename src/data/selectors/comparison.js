import { selectForecastPanchayat } from "@/data/selectors";
import { selectPanchayatVulnerabilityRanking } from "@/data/selectors/vulnerability";
import { computeSprayWindow } from "@/lib/calculations/sprayWindow";
import { computeIrrigationWindow } from "@/lib/calculations/irrigationWindow";

/**
 * A one-row-per-panchayat snapshot of current conditions and derived
 * status, for the Panchayat Comparison Dashboard (Plot 24). Reuses
 * existing selectors/calculations entirely — no new derivation logic.
 * @param {object|null} data
 * @returns {{
 * panchayat: string,
 * temperatureC: number|null,
 * humidityPct: number|null,
 * rainProbabilityPct: number|null,
 * soilMoisture: number|null,
 * sprayFavorable: boolean|null,
 * irrigate: boolean|null,
 * vulnerabilityIndex: number|null,
 * }[]}
 */
export function selectPanchayatComparisonSummary(data) {
  const panchayats = data?.panchayats ?? [];
  const vulnerability = selectPanchayatVulnerabilityRanking(data);

  return panchayats.map((panchayat) => {
    const current = selectForecastPanchayat(data, panchayat)[0];
    const spray = current
      ? computeSprayWindow({
          windSpeedKmh: current.windSpeedKmh,
          rainProbabilityPct: current.rainProbabilityPct,
          tempC: current.temperatureC,
        })
      : null;
    const irrigation = current
      ? computeIrrigationWindow({
          soilMoisture: current.soilMoisture,
          rainProbabilityPct: current.rainProbabilityPct,
        })
      : null;
    const vulnerabilityEntry = vulnerability.find(
      (v) => v.panchayat === panchayat,
    );

    return {
      panchayat,
      temperatureC: current?.temperatureC ?? null,
      humidityPct: current?.humidityPct ?? null,
      rainProbabilityPct: current?.rainProbabilityPct ?? null,
      soilMoisture: current?.soilMoisture ?? null,
      sprayFavorable: spray?.available ? spray.value.favorable : null,
      irrigate: irrigation?.available ? irrigation.value.irrigate : null,
      vulnerabilityIndex: vulnerabilityEntry?.available
        ? vulnerabilityEntry.value
        : null,
    };
  });
}
