"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricTile } from "@/components/ui/MetricTile";
import { Tabs } from "@/components/ui/Tabs";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { selectForecastPanchayat } from "@/data/selectors";
import { selectPanchayatVulnerabilityRanking } from "@/data/selectors/vulnerability";
import { selectTemperatureValidationAgainstReference } from "@/data/selectors/qa";
import { selectTemperatureEnsembleFrames } from "@/data/selectors/ensemble";
import {
  formatDateLabel,
  formatElevation,
  formatHourLabel,
  formatNumber,
  formatPercent,
  formatSoilMoisturePercent,
  formatTemperature,
} from "@/lib/formatters";

const TABS = ["Overview", "Diagnostics", "Forecast", "Advisory"];

export default function PanchayatDeepDivePage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );
  const setSelectedPanchayat = useSelectionStore(
    (state) => state.setSelectedPanchayat,
  );
  const [activeTab, setActiveTab] = useState(TABS[0]);

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

  if (!selectedPanchayat) {
    return (
      <main className="flex-1 px-6 py-8">
        <EmptyState
          title="Select a panchayat"
          description="This page is a single reusable template — pick a panchayat below (or in the header) and every tab shows that panchayat's own data."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {data.panchayats.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPanchayat(p)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-border-hover "
                >
                  {p}
                </button>
              ))}
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">{selectedPanchayat}</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Panchayat Deep Dive — one template, driven by the panchayat selected
          in the header.
        </p>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "Overview" ? (
        <OverviewTab data={data} panchayat={selectedPanchayat} />
      ) : null}
      {activeTab === "Diagnostics" ? (
        <DiagnosticsTab data={data} panchayat={selectedPanchayat} />
      ) : null}
      {activeTab === "Forecast" ? (
        <ForecastTab data={data} panchayat={selectedPanchayat} />
      ) : null}
      {activeTab === "Advisory" ? <AdvisoryTab /> : null}
    </main>
  );
}

function OverviewTab({ data, panchayat }) {
  const current = selectForecastPanchayat(data, panchayat)[0];
  const soil = data.soil.find((s) => s.panchayat === panchayat);
  const elevation = data.elevationSummaryByPanchayat?.[panchayat];
  const vulnerability = selectPanchayatVulnerabilityRanking(data).find(
    (v) => v.panchayat === panchayat,
  );

  if (!current) {
    return <EmptyState title="No forecast data available for this panchayat" />;
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-foreground/50">
        Current conditions as of {formatHourLabel(current.date)}.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile
          bordered
          label="Temperature"
          value={formatTemperature(current.temperatureC)}
        />
        <MetricTile
          bordered
          label="Humidity"
          value={formatPercent(current.humidityPct)}
        />
        <MetricTile
          bordered
          label="Rain probability"
          value={formatPercent(current.rainProbabilityPct)}
        />
        <MetricTile
          bordered
          label="Soil moisture"
          value={formatSoilMoisturePercent(current.soilMoisture)}
        />
        <MetricTile bordered label="Soil type" value={soil?.soilType ?? "—"} />
        <MetricTile
          bordered
          label="Mean elevation"
          value={formatElevation(elevation?.meanElevationM)}
        />
        <MetricTile
          bordered
          label="Elevation range"
          value={
            elevation
              ? `${formatElevation(elevation.minElevationM)} – ${formatElevation(elevation.maxElevationM)}`
              : "—"
          }
        />
        <MetricTile
          bordered
          label="Vulnerability index"
          value={
            vulnerability?.available
              ? formatNumber(vulnerability.value, { decimals: 2 })
              : "—"
          }
        />
      </div>
    </div>
  );
}

function DiagnosticsTab({ data, panchayat }) {
  const validation = selectTemperatureValidationAgainstReference(
    data,
    panchayat,
  );
  const ensembleFrames = selectTemperatureEnsembleFrames(data, panchayat);
  const currentEnsemble = ensembleFrames[0];

  return (
    <div className="space-y-4">
      <p className="text-xs text-foreground/50">
        Full charts (Model Diagnostics — Plots 1-24) already respect this
        panchayat selection; this tab is a quick summary.{" "}
        <a
          href="/scientist/model-diagnostics"
          className="underline underline-offset-4"
        >
          Open Model Diagnostics →
        </a>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile
          bordered
          label="R² (predicted vs. reference)"
          value={
            validation.rSquared.available
              ? formatNumber(validation.rSquared.value, { decimals: 3 })
              : "—"
          }
        />
        <MetricTile
          bordered
          label="RMSE"
          value={
            validation.rmse.available
              ? formatNumber(validation.rmse.value, {
                  decimals: 3,
                  suffix: "°C",
                })
              : "—"
          }
        />
        <MetricTile
          bordered
          label="Paired hours"
          value={String(validation.pairCount)}
        />
        <MetricTile
          bordered
          label="Current sensitivity uncertainty"
          value={
            currentEnsemble?.available
              ? formatNumber(currentEnsemble.stdDev, {
                  decimals: 3,
                  suffix: "°C",
                })
              : "—"
          }
        />
      </div>
    </div>
  );
}

function ForecastTab({ data, panchayat }) {
  const forecast = selectForecastPanchayat(data, panchayat);

  if (forecast.length === 0) {
    return <EmptyState title="No forecast data available" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Temperature (7 days)
        </h3>
        <PlotlyChart
          data={[
            {
              type: "scatter",
              mode: "lines",
              x: forecast.map((r) => r.date),
              y: forecast.map((r) => r.temperatureC),
              hovertemplate: "%{x}<br>%{y:.1f}°C<extra></extra>",
            },
          ]}
          layout={{ height: 280, margin: { t: 10 }, yaxis: { title: "°C" } }}
          style={{ width: "100%" }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Rain probability (7 days)
        </h3>
        <PlotlyChart
          data={[
            {
              type: "bar",
              x: forecast.map((r) => formatDateLabel(r.date)),
              y: forecast.map((r) => r.rainProbabilityPct),
              hovertemplate: "%{x}: %{y}%<extra></extra>",
            },
          ]}
          layout={{
            height: 260,
            margin: { t: 10 },
            yaxis: { title: "%", range: [0, 100] },
          }}
          style={{ width: "100%" }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </div>
  );
}

function AdvisoryTab() {
  return (
    <EmptyState
      title="Available in Advisory Studio"
      description="The advisory input, draft generation, and review/approve/publish workflow live in the Advisory Studio."
    />
  );
}
