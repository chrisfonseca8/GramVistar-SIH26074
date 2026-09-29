"use client";

import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { BlockOverviewMap } from "@/components/maps/BlockOverviewMap";
import { selectPanchayatComparisonSummary } from "@/data/selectors/comparison";
import { selectPanchayatVulnerabilityRanking } from "@/data/selectors/vulnerability";
import { selectBlockAlerts } from "@/data/selectors/alerts";
import { selectRainfallAccumulationSeries } from "@/data/selectors/climateAggregates";
import { isFiniteNumber } from "@/lib/calculations/result";
import {
  formatNumber,
  formatPercent,
  formatSoilMoisturePercent,
  formatTemperature,
} from "@/lib/formatters";
import { RISK_COLORS } from "@/lib/riskLevels";

function summarizeRange(values) {
  const clean = values.filter(isFiniteNumber);
  if (clean.length === 0) return null;
  return {
    mean: clean.reduce((sum, v) => sum + v, 0) / clean.length,
    min: Math.min(...clean),
    max: Math.max(...clean),
  };
}

export default function BlockOverviewPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );
  const setSelectedPanchayat = useSelectionStore(
    (state) => state.setSelectedPanchayat,
  );

  if (status === "idle" || status === "loading") {
    return (
      <main className="flex-1 px-6 py-8">
        <LoadingSkeleton lines={6} />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex-1 px-6 py-8">
        <ErrorState title="Failed to load local data" description={error} />
      </main>
    );
  }

  const comparison = selectPanchayatComparisonSummary(data);
  const vulnerabilityRanking = selectPanchayatVulnerabilityRanking(data).filter(
    (r) => r.available,
  );
  const vulnerabilityByPanchayat = Object.fromEntries(
    vulnerabilityRanking.map((r) => [r.panchayat, r.value]),
  );
  const alerts = selectBlockAlerts(data);
  const rainfallSeries = selectRainfallAccumulationSeries(data);

  const tempRange = summarizeRange(comparison.map((c) => c.temperatureC));
  const rainProbabilityRange = summarizeRange(
    comparison.map((c) => c.rainProbabilityPct),
  );
  const weekRainfallByPanchayat = Object.fromEntries(
    rainfallSeries.map((s) => [
      s.panchayat,
      s.cumulativeMm[s.cumulativeMm.length - 1] ?? null,
    ]),
  );
  const weekRainfallRange = summarizeRange(
    Object.values(weekRainfallByPanchayat),
  );
  const soilDeficitRange = summarizeRange(comparison.map((c) => c.soilDeficit));

  return (
    <main className="flex-1 space-y-8 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Block Overview</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Chas Block, Bokaro District, Jharkhand — 5 panchayats. Click a
          panchayat on the map to open its Deep Dive elsewhere in the app.
        </p>
      </div>

      <Card
        title="Chas Block Map"
        description="Colored by panchayat vulnerability index — click a panchayat to select it."
      >
        <BlockOverviewMap
          borders={data.borders}
          vulnerabilityByPanchayat={vulnerabilityByPanchayat}
          selectedPanchayat={selectedPanchayat}
          onSelectPanchayat={setSelectedPanchayat}
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Temperature"
          primary={tempRange ? formatTemperature(tempRange.mean) : "—"}
          detail={
            tempRange
              ? `${formatTemperature(tempRange.min)} – ${formatTemperature(tempRange.max)} across panchayats`
              : "No data"
          }
        />
        <SummaryCard
          title="Rainfall"
          primary={
            rainProbabilityRange
              ? formatPercent(rainProbabilityRange.mean, { decimals: 0 })
              : "—"
          }
          detail={
            weekRainfallRange
              ? `Rain probability now (avg); ${formatNumber(weekRainfallRange.min, { decimals: 1 })}–${formatNumber(weekRainfallRange.max, { decimals: 1, suffix: "mm" })} accumulated this week`
              : "No data"
          }
        />
        <SummaryCard
          title="Soil Moisture Deficit"
          primary={
            soilDeficitRange
              ? formatSoilMoisturePercent(soilDeficitRange.mean)
              : "—"
          }
          detail={
            soilDeficitRange
              ? `${formatSoilMoisturePercent(soilDeficitRange.min)} – ${formatSoilMoisturePercent(soilDeficitRange.max)} across panchayats`
              : "No data"
          }
        />
      </div>

      <Card
        title="Alerts"
        description="Derived from current-hour frost risk, rain probability and heat index — a lightweight summary, not the full alert escalation system."
      >
        {alerts.length === 0 ? (
          <EmptyState
            title="No active alerts"
            description="Nothing crosses the frost, heavy-rain or heat-stress thresholds right now."
          />
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert, index) => (
              <li
                key={index}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm "
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[alert.severity] }}
                  aria-hidden="true"
                />
                <span className="font-medium">{alert.panchayat}</span>
                <span className="text-foreground/60">
                  {alert.type} — {alert.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Vulnerability Summary"
        description="Climate/soil exposure proxy — see Plot 11 on Model Diagnostics for the full ranking and methodology caveats."
      >
        {vulnerabilityRanking.length === 0 ? (
          <EmptyState title="Not enough data to rank panchayats" />
        ) : (
          <ol className="space-y-1 text-sm">
            {vulnerabilityRanking.map((entry, index) => (
              <li
                key={entry.panchayat}
                className="flex items-center justify-between border-b border-border py-1.5 "
              >
                <span>
                  <span className="mr-2 text-foreground/40">{index + 1}.</span>
                  {entry.panchayat}
                </span>
                <span className="font-mono text-xs text-foreground/60">
                  {formatNumber(entry.value, { decimals: 2 })}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </main>
  );
}

function SummaryCard({ title, primary, detail }) {
  return (
    <div className="rounded-lg border border-border p-4 ">
      <p className="text-xs uppercase tracking-wide text-foreground/40">
        {title}
      </p>
      <p className="mt-1 text-2xl font-semibold">{primary}</p>
      <p className="mt-1 text-xs text-foreground/50">{detail}</p>
    </div>
  );
}
